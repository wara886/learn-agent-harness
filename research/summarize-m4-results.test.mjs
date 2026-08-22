import { describe, expect, it } from 'vitest'
import { formatM4Summary, summarizeM4 } from './summarize-m4-results.mjs'

function session(participantId, overrides = {}) {
  return {
    participantId,
    targetUserConfirmed: true,
    device: 'desktop',
    browser: 'Chrome',
    firstResultSeconds: 45,
    foundFirstResultUnaided: true,
    explainedStateChange: true,
    transferQuestionPassed: true,
    usedFacilitatorHelp: false,
    observations: [],
    quotes: [],
    ...overrides,
  }
}

describe('M4 usability gate', () => {
  it('stays pending until all five human records are complete', () => {
    const sessions = ['P01', 'P02', 'P03', 'P04', 'P05'].map(id => session(id))
    sessions[4].firstResultSeconds = null
    expect(formatM4Summary(summarizeM4({ schemaVersion: 1, sessions }))).toContain('M4_GATE=PENDING')
  })

  it('passes only when every threshold is met', () => {
    const sessions = [
      session('P01'),
      session('P02'),
      session('P03'),
      session('P04'),
      session('P05', { firstResultSeconds: 110, foundFirstResultUnaided: false, explainedStateChange: false, transferQuestionPassed: false }),
    ]
    const summary = summarizeM4({ schemaVersion: 1, sessions })
    expect(summary).toEqual({
      complete: true,
      counts: { validTargetUsers: 5, firstResult: 4, stateExplanation: 4, transfer: 4 },
      gate: 'PASS',
    })
  })
})
