import { readFile, rename, writeFile } from 'node:fs/promises'
import { basename, dirname, join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { z } from 'zod'
import { formatM4Summary, isCompletedSession, summarizeM4 } from './summarize-m4-results.mjs'

const participantIds = ['P01', 'P02', 'P03', 'P04', 'P05']

export const m4SessionSchema = z.object({
  participantId: z.enum(participantIds),
  targetUserConfirmed: z.boolean(),
  device: z.string().trim().min(1),
  browser: z.string().trim().min(1),
  firstResultSeconds: z.number().finite().nonnegative(),
  foundFirstResultUnaided: z.boolean(),
  explainedStateChange: z.boolean(),
  transferQuestionPassed: z.boolean(),
  usedFacilitatorHelp: z.boolean(),
  observations: z.array(z.string().trim().min(1)),
  quotes: z.array(z.string().trim().min(1)),
}).strict()

export function mergeM4Session(data, input, { replace = false } = {}) {
  summarizeM4(data)
  const session = m4SessionSchema.parse(input)
  const index = data.sessions.findIndex(candidate => candidate.participantId === session.participantId)
  if (index === -1) throw new Error(`Missing placeholder for ${session.participantId}`)
  if (isCompletedSession(data.sessions[index]) && !replace) {
    throw new Error(`${session.participantId} is complete; pass --replace to correct it`)
  }

  const sessions = [...data.sessions]
  sessions[index] = session
  return { ...data, sessions }
}

export async function recordM4Session(resultsPath, sessionPath, options) {
  const [data, input] = await Promise.all([
    readFile(resultsPath, 'utf8').then(JSON.parse),
    readFile(sessionPath, 'utf8').then(JSON.parse),
  ])
  const updated = mergeM4Session(data, input, options)
  const temporaryPath = join(dirname(resultsPath), `.${basename(resultsPath)}.${process.pid}.tmp`)
  await writeFile(temporaryPath, `${JSON.stringify(updated, null, 2)}\n`, { flag: 'wx' })
  await rename(temporaryPath, resultsPath)
  return { participantId: input.participantId, summary: summarizeM4(updated) }
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [resultsPath, sessionPath, ...flags] = process.argv.slice(2)
  if (resultsPath === undefined || sessionPath === undefined || flags.some(flag => flag !== '--replace')) {
    throw new Error('usage: record-m4-session.mjs RESULTS.json SESSION.json [--replace]')
  }
  const result = await recordM4Session(resultsPath, sessionPath, { replace: flags.includes('--replace') })
  console.log(`M4_RECORDED=${result.participantId}`)
  console.log(formatM4Summary(result.summary))
}
