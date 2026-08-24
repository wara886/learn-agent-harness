import { describe, expect, it } from 'vitest'
import { claims, claimsById, factBaseline, piFactBaseline, sourceUrl, upstreams } from './claims.ts'
import { chapterForLesson, lessonChapters, lessons } from './lessons.ts'

describe('frozen lesson content', () => {
  it('loads five DSH lessons and five Pi lessons', () => {
    expect(lessons).toHaveLength(10)
    expect(new Set(lessons.map(lesson => lesson.slug)).size).toBe(10)
    expect(lessons.filter(lesson => lesson.track === 'dsh')).toHaveLength(5)
    expect(lessons.filter(lesson => lesson.track === 'pi')).toHaveLength(5)
  })

  it('uses only approved claims from each lesson track', () => {
    expect(claims).toHaveLength(13)
    expect(new Set(claims.map(claim => claim.id)).size).toBe(claims.length)
    for (const lesson of lessons) {
      for (const claimId of lesson.claimIds) {
        const claim = claimsById.get(claimId)
        expect(claim?.reviewStatus).toBe('approved')
        expect(claim?.upstream).toBe(lesson.track)
        expect(claim?.baseline).toBe(upstreams[lesson.track].baseline)
      }
    }
    expect(lessons.filter(lesson => lesson.track === 'dsh').every(lesson => (
      lesson.claimIds.every(id => claimsById.get(id)?.baseline === factBaseline)
    ))).toBe(true)
    expect(new Set(lessons.flatMap(lesson => lesson.claimIds))).toEqual(new Set(claims.map(claim => claim.id)))
  })

  it('pins current and planned Pi claims to their own upstream revision', () => {
    const piClaims = claims.filter(claim => claim.upstream === 'pi')
    expect(piClaims).toHaveLength(5)
    expect(piClaims.every(claim => claim.baseline === piFactBaseline)).toBe(true)
    expect(sourceUrl(piClaims[0]!, piClaims[0]!.paths[0]!.path)).toContain(
      `${upstreams.pi.repository}/blob/${piFactBaseline}`,
    )
  })

  it('keeps each lesson within the three-term budget', () => {
    for (const lesson of lessons) expect(lesson.terms.length).toBeLessThanOrEqual(3)
  })

  it('assigns every lesson to one framework chapter', () => {
    expect(lessonChapters).toHaveLength(4)
    expect(lessonChapters.flatMap(chapter => chapter.lessonIds)).toHaveLength(lessons.length)
    expect(new Set(lessonChapters.flatMap(chapter => chapter.lessonIds)).size).toBe(lessons.length)
    for (const lesson of lessons) expect(chapterForLesson(lesson).track).toBe(lesson.track)
  })
})
