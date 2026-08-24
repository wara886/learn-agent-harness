import { readFile } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'

const requiredSessionIds = ['P01', 'P02', 'P03', 'P04', 'P05']

export function isCompletedSession(session) {
  return typeof session.targetUserConfirmed === 'boolean'
    && typeof session.device === 'string'
    && session.device.length > 0
    && typeof session.browser === 'string'
    && session.browser.length > 0
    && typeof session.firstResultSeconds === 'number'
    && Number.isFinite(session.firstResultSeconds)
    && session.firstResultSeconds >= 0
    && typeof session.foundFirstResultUnaided === 'boolean'
    && typeof session.explainedStateChange === 'boolean'
    && typeof session.transferQuestionPassed === 'boolean'
    && typeof session.usedFacilitatorHelp === 'boolean'
}

export function summarizeM4(data) {
  if (data?.schemaVersion !== 1 || !Array.isArray(data.sessions)) {
    throw new Error('Expected M4 schemaVersion 1 with a sessions array')
  }

  const participantIds = data.sessions.map(session => session?.participantId)
  if (participantIds.length !== requiredSessionIds.length
    || new Set(participantIds).size !== requiredSessionIds.length
    || participantIds.some(id => !requiredSessionIds.includes(id))) {
    throw new Error('Expected exactly one session for each participant P01 through P05')
  }

  const sessionsById = new Map(data.sessions.map(session => [session.participantId, session]))
  const sessions = requiredSessionIds.map(id => sessionsById.get(id))
  const complete = sessions.every(session => session !== undefined && isCompletedSession(session))
  const completedSessions = sessions.filter(session => session !== undefined && isCompletedSession(session))
  const counts = {
    validTargetUsers: completedSessions.filter(session => session.targetUserConfirmed).length,
    firstResult: completedSessions.filter(session => session.targetUserConfirmed
      && session.foundFirstResultUnaided
      && !session.usedFacilitatorHelp
      && session.firstResultSeconds <= 90).length,
    stateExplanation: completedSessions.filter(session => session.targetUserConfirmed && session.explainedStateChange).length,
    transfer: completedSessions.filter(session => session.targetUserConfirmed && session.transferQuestionPassed).length,
  }

  const passed = complete
    && counts.validTargetUsers === 5
    && counts.firstResult >= 4
    && counts.stateExplanation >= 4
    && counts.transfer >= 3

  return { complete, counts, gate: complete ? (passed ? 'PASS' : 'FAIL') : 'PENDING' }
}

export function formatM4Summary(summary) {
  return [
    `M4_VALID_TARGET_USERS=${summary.counts.validTargetUsers}/5`,
    `M4_FIRST_RESULT=${summary.counts.firstResult}/5`,
    `M4_STATE_EXPLANATION=${summary.counts.stateExplanation}/5`,
    `M4_TRANSFER=${summary.counts.transfer}/5`,
    `M4_GATE=${summary.gate}`,
  ].join('\n')
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const inputPath = process.argv[2]
  if (inputPath === undefined) throw new Error('usage: summarize-m4-results.mjs RESULTS.json')
  const data = JSON.parse(await readFile(inputPath, 'utf8'))
  console.log(formatM4Summary(summarizeM4(data)))
}
