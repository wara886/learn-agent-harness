import { describe, expect, it } from 'vitest'
import { lessons } from './lessons.ts'
import { initialRunnerState, restoreRunnerState, runnerReducer, visibleStepCount } from './runner.ts'

describe('shared lesson runner', () => {
  it('runs prediction, observation, experiment, and checkpoint through one state machine', () => {
    const lesson = lessons[0]!
    const predicted = runnerReducer(initialRunnerState, { type: 'predict', optionId: 'read' })
    const running = runnerReducer(predicted, { type: 'run' })
    const observed = runnerReducer(running, { type: 'observe' })
    const experimenting = runnerReducer(observed, { type: 'experiment' })
    const checking = runnerReducer(experimenting, { type: 'experiment-complete' })
    const completed = runnerReducer(checking, { type: 'answer', optionId: 'stop', correct: true })

    expect(visibleStepCount(observed, lesson)).toBe(3)
    expect(checking.experimentApplied).toBe(true)
    expect(completed.phase).toBe('completed')
  })

  it('makes incorrect checkpoints retryable without marking completion', () => {
    const failed = runnerReducer({ phase: 'checking', predictionId: 'read', experimentApplied: true }, {
      type: 'answer', optionId: 'invent', correct: false,
    })
    expect(failed.phase).toBe('failed')
    expect(runnerReducer(failed, { type: 'answer', optionId: 'stop', correct: true }).phase).toBe('completed')
  })

  it('rejects illegal transitions', () => {
    expect(() => runnerReducer(initialRunnerState, { type: 'run' })).toThrow('Illegal lesson transition')
  })

  it('restores interrupted work to the last stable predicted state', () => {
    const restored = restoreRunnerState({ phase: 'running', predictionId: 'read', experimentApplied: false }, lessons[0]!)
    expect(restored).toEqual({ phase: 'predicted', predictionId: 'read', experimentApplied: false })
  })
})
