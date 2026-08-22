import { describe, expect, it } from 'vitest'
import { claims, claimsById, factBaseline, piFactBaseline, sourceUrl, upstreams } from './claims.ts'
import { lessons } from './lessons.ts'

describe('frozen lesson content', () => {
  it('loads three DSH lessons and one Pi lesson', () => {
    expect(lessons).toHaveLength(4)
    expect(new Set(lessons.map(lesson => lesson.slug)).size).toBe(4)
    expect(lessons.filter(lesson => lesson.track === 'dsh')).toHaveLength(3)
    expect(lessons.filter(lesson => lesson.track === 'pi')).toHaveLength(1)
  })

  it('uses only approved claims from each lesson track', () => {
    expect(claims).toHaveLength(9)
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
  })

  it('pins current and planned Pi claims to their own upstream revision', () => {
    const piClaims = claims.filter(claim => claim.upstream === 'pi')
    expect(piClaims).toHaveLength(3)
    expect(piClaims.every(claim => claim.baseline === piFactBaseline)).toBe(true)
    expect(sourceUrl(piClaims[0]!, piClaims[0]!.paths[0]!.path)).toContain(
      `${upstreams.pi.repository}/blob/${piFactBaseline}`,
    )
  })

  it('keeps each lesson within the three-term budget', () => {
    for (const lesson of lessons) expect(lesson.terms.length).toBeLessThanOrEqual(3)
  })
})
