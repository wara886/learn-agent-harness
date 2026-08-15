import { z } from 'zod'
import type { Lesson } from './lessons.ts'

export const runnerPhaseSchema = z.enum([
  'unstarted',
  'predicted',
  'running',
  'observed',
  'experimenting',
  'checking',
  'completed',
  'failed',
])

export type RunnerPhase = z.infer<typeof runnerPhaseSchema>

export interface RunnerState {
  phase: RunnerPhase
  predictionId?: string
  checkpointId?: string
  experimentApplied: boolean
}

export type RunnerAction =
  | { type: 'predict'; optionId: string }
  | { type: 'run' }
  | { type: 'observe' }
  | { type: 'experiment' }
  | { type: 'experiment-complete' }
  | { type: 'answer'; optionId: string; correct: boolean }
  | { type: 'reset' }

export const initialRunnerState: RunnerState = {
  phase: 'unstarted',
  experimentApplied: false,
}

function illegal(state: RunnerState, action: RunnerAction): never {
  throw new Error(`Illegal lesson transition: ${state.phase} -> ${action.type}`)
}

export function runnerReducer(state: RunnerState, action: RunnerAction): RunnerState {
  switch (action.type) {
    case 'predict':
      if (state.phase !== 'unstarted' && state.phase !== 'predicted') return illegal(state, action)
      return { ...state, phase: 'predicted', predictionId: action.optionId }
    case 'run':
      if (state.phase !== 'predicted') return illegal(state, action)
      return { ...state, phase: 'running' }
    case 'observe':
      if (state.phase !== 'running') return illegal(state, action)
      return { ...state, phase: 'observed' }
    case 'experiment':
      if (state.phase !== 'observed') return illegal(state, action)
      return { ...state, phase: 'experimenting' }
    case 'experiment-complete':
      if (state.phase !== 'experimenting') return illegal(state, action)
      return { ...state, phase: 'checking', experimentApplied: true }
    case 'answer':
      if (state.phase !== 'checking' && state.phase !== 'failed') return illegal(state, action)
      return { ...state, phase: action.correct ? 'completed' : 'failed', checkpointId: action.optionId }
    case 'reset':
      return initialRunnerState
  }
}

export function restoreRunnerState(value: unknown, lesson: Lesson): RunnerState {
  const parsed = z.object({
    phase: runnerPhaseSchema,
    predictionId: z.string().optional(),
    checkpointId: z.string().optional(),
    experimentApplied: z.boolean(),
  }).safeParse(value)
  if (!parsed.success) return initialRunnerState

  const state = parsed.data
  if (state.phase === 'running' || state.phase === 'experimenting') {
    return state.predictionId === undefined
      ? initialRunnerState
      : { phase: 'predicted', predictionId: state.predictionId, experimentApplied: false }
  }
  if (state.predictionId !== undefined && !lesson.prediction.options.some(option => option.id === state.predictionId)) return initialRunnerState
  if (state.checkpointId !== undefined && !lesson.checkpoint.options.some(option => option.id === state.checkpointId)) return initialRunnerState
  return state
}

export function visibleStepCount(state: RunnerState, lesson: Lesson): number {
  if (state.phase === 'unstarted' || state.phase === 'predicted' || state.phase === 'running') return 1
  if (state.experimentApplied || state.phase === 'checking' || state.phase === 'completed' || state.phase === 'failed') return 3
  return lesson.baselineVisibleSteps
}
