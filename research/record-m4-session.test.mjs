import { describe, expect, it } from 'vitest'
import { mergeM4Session } from './record-m4-session.mjs'

function placeholder(participantId) {
  return {
    participantId,
    targetUserConfirmed: null,
    device: null,
    browser: null,
    firstResultSeconds: null,
    foundFirstResultUnaided: null,
    explainedStateChange: null,
    transferQuestionPassed: null,
    usedFacilitatorHelp: null,
    observations: [],
    quotes: [],
  }
}

function session(participantId = 'P01') {
  return {
    participantId,
    targetUserConfirmed: true,
    device: 'desktop',
    browser: 'Chrome',
    firstResultSeconds: 48,
    foundFirstResultUnaided: true,
    explainedStateChange: true,
    transferQuestionPassed: true,
    usedFacilitatorHelp: false,
    observations: ['先阅读目标，再选择预测。'],
    quotes: ['工具结果变了，所以回答也要变。'],
  }
}

function results() {
  return {
    schemaVersion: 1,
    buildVersion: 'ui@4b76974fefacfb4073af97645c40891baa70454d',
    siteUrl: 'https://wara886.github.io/learn-agent-harness/',
    sessions: ['P01', 'P02', 'P03', 'P04', 'P05'].map(placeholder),
  }
}

describe('M4 session recorder', () => {
  it('replaces the matching placeholder without changing other sessions', () => {
    const updated = mergeM4Session(results(), session())
    expect(updated.sessions[0]).toEqual(session())
    expect(updated.sessions.slice(1)).toEqual(results().sessions.slice(1))
  })

  it('rejects incomplete or extra fields', () => {
    expect(() => mergeM4Session(results(), { ...session(), browser: null })).toThrow()
    expect(() => mergeM4Session(results(), { ...session(), participantName: 'Alice' })).toThrow()
  })

  it('requires an explicit replace flag for a completed record', () => {
    const complete = results()
    complete.sessions[0] = session()
    expect(() => mergeM4Session(complete, session())).toThrow(/--replace/)
    expect(mergeM4Session(complete, session(), { replace: true }).sessions[0]).toEqual(session())
  })
})
