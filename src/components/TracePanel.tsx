import { Check, Circle, LoaderCircle } from 'lucide-react'
import type { Lesson } from '../domain/lessons.ts'
import { visibleStepCount, type RunnerState } from '../domain/runner.ts'

export function runnerStatusLabel(state: RunnerState): string {
  switch (state.phase) {
    case 'unstarted': return '未开始'
    case 'predicted': return '等待运行'
    case 'running': return '运行中'
    case 'observed': return '等待实验'
    case 'experimenting': return '正在变化'
    case 'checking': return '等待检查'
    case 'failed': return '未通过'
    case 'completed': return '已完成'
  }
}

export function TracePanel({ lesson, state }: { lesson: Lesson; state: RunnerState }) {
  const visibleCount = visibleStepCount(state, lesson)
  const trace = state.experimentApplied || state.phase === 'checking' || state.phase === 'failed' || state.phase === 'completed'
    ? lesson.experiment.trace
    : lesson.baselineTrace

  return (
    <section className="trace-panel" aria-labelledby="trace-heading">
      <div className="panel-heading">
        <div>
          <h2 id="trace-heading" tabIndex={-1}>任务过程</h2>
          <p>每次只观察一个变化</p>
        </div>
        <span className={`phase-badge phase-${state.phase}`} aria-live="polite">{runnerStatusLabel(state)}</span>
      </div>
      <ol className="trace-list">
        {trace.map((item, index) => {
          const visible = index < visibleCount
          const current = index === visibleCount - 1
          return (
            <li className={`trace-row tone-${item.tone} ${visible ? 'is-visible' : ''} ${current ? 'is-current' : ''}`} key={`${item.label}-${index}`}>
              <span className="trace-icon" aria-hidden="true">
                {state.phase === 'running' && index === 0
                  ? <LoaderCircle className="spin" />
                  : visible && !current ? <Check /> : <Circle />}
              </span>
              <span className="trace-copy">
                <strong>{item.label}</strong>
                <span>{visible ? item.detail : '等待前一步完成'}</span>
              </span>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
