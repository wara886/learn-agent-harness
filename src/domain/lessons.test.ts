import { describe, expect, it } from 'vitest'
import { claims, claimsById, factBaseline, piFactBaseline, sourceUrl, upstreams } from './claims.ts'
import { lessons } from './lessons.ts'

describe('frozen lesson content', () => {
  it('loads exactly three schema-validated lessons', () => {
    expect(lessons).toHaveLength(3)
    expect(new Set(lessons.map(lesson => lesson.slug)).size).toBe(3)
  })

  it('uses only approved fixed-baseline claims', () => {
    expect(claims).toHaveLength(9)
    for (const lesson of lessons) {
      for (const claimId of lesson.claimIds) {
        const claim = claimsById.get(claimId)
        expect(claim?.reviewStatus).toBe('approved')
        expect(claim?.upstream).toBe('dsh')
        expect(claim?.baseline).toBe(factBaseline)
      }
    }
  })

  it('pins the planned Pi lesson claims to their own upstream revision', () => {
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
