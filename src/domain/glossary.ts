import { claimsById, type UpstreamId } from './claims.ts'
import { lessons, type Lesson } from './lessons.ts'

export interface GlossaryEntry {
  term: string
  definition: string
  track: UpstreamId
  firstLesson: Lesson
  lessonCount: number
  claimId: string
  sourcePath: string
  sourceSymbol: string
}

const entries = new Map<string, GlossaryEntry>()

for (const lesson of lessons) {
  for (const item of lesson.terms) {
    const existing = entries.get(item.term)
    if (existing !== undefined) {
      existing.lessonCount += 1
      continue
    }

    const claimId = lesson.claimIds[0]!
    const claim = claimsById.get(claimId)!
    const source = claim.paths[0]!
    entries.set(item.term, {
      term: item.term,
      definition: item.definition,
      track: lesson.track,
      firstLesson: lesson,
      lessonCount: 1,
      claimId,
      sourcePath: source.path,
      sourceSymbol: source.symbol,
    })
  }
}

export const glossaryEntries = [...entries.values()]
