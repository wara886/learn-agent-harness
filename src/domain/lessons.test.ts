import { describe, expect, it } from 'vitest'
import { claims, claimsById, factBaseline } from './claims.ts'
import { lessons } from './lessons.ts'

describe('frozen lesson content', () => {
  it('loads exactly three schema-validated lessons', () => {
    expect(lessons).toHaveLength(3)
    expect(new Set(lessons.map(lesson => lesson.slug)).size).toBe(3)
  })

  it('uses only approved fixed-baseline claims', () => {
    expect(claims).toHaveLength(6)
    for (const lesson of lessons) {
      for (const claimId of lesson.claimIds) {
        const claim = claimsById.get(claimId)
        expect(claim?.reviewStatus).toBe('approved')
        expect(claim?.baseline).toBe(factBaseline)
      }
    }
  })

  it('keeps each lesson within the three-term budget', () => {
    for (const lesson of lessons) expect(lesson.terms.length).toBeLessThanOrEqual(3)
  })
})
