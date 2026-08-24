import { Check, Circle, LoaderCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
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
  const [selectedIndex, setSelectedIndex] = useState(0)
  const trace = state.experimentApplied || state.phase === 'checking' || state.phase === 'failed' || state.phase === 'completed'
    ? lesson.experiment.trace
    : lesson.baselineTrace
  const inspectedIndex = Math.min(selectedIndex, Math.max(0, visibleCount - 1))
  const inspected = trace[inspectedIndex]!
  const before = inspectedIndex === 0 ? lesson.question : trace[inspectedIndex - 1]!.detail
  const channels = ['USER / STATE', state.experimentApplied ? 'TOOL RESULT' : 'TOOL CALL', 'ASSISTANT / STATE']

  useEffect(() => {
    setSelectedIndex(Math.max(0, visibleCount - 1))
  }, [state.phase, visibleCount])

  return (
    <section className="trace-panel" id="execution-trace" aria-labelledby="trace-heading">
      <div className="panel-heading">
        <span className="panel-code" aria-hidden="true">02</span>
        <div className="panel-title-copy">
          <h2 id="trace-heading" tabIndex={-1}>任务过程</h2>
          <p>每次只观察一个变化</p>
        </div>
        <span className={`phase-badge phase-${state.phase}`} aria-live="polite">{runnerStatusLabel(state)}</span>
      </div>
      <ol className="trace-list" aria-label="执行步骤">
        {trace.map((item, index) => {
          const visible = index < visibleCount
          const current = index === visibleCount - 1
          return (
            <li className={`trace-row tone-${item.tone} ${visible ? 'is-visible' : ''} ${current ? 'is-current' : ''}`} key={`${item.label}-${index}`}>
              <button type="button" disabled={!visible} aria-pressed={inspectedIndex === index} onClick={() => setSelectedIndex(index)}>
                <span className="trace-step" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                <span className="trace-icon" aria-hidden="true">
                  {state.phase === 'running' && index === 0
                    ? <LoaderCircle className="spin" />
                    : visible && !current ? <Check /> : <Circle />}
                </span>
                <span className="trace-copy">
                  <small className="trace-channel">{channels[index]}</small>
                  <strong>{item.label}</strong>
                  <span>{visible ? item.detail : '等待前一步完成'}</span>
                </span>
              </button>
            </li>
          )
        })}
      </ol>
      <div className="trace-inspector" aria-live="polite">
        <header><span>STEP {String(inspectedIndex + 1).padStart(2, '0')}</span><strong>{channels[inspectedIndex]}</strong></header>
        <div><span>BEFORE</span><p>{before}</p></div>
        <div><span>AFTER</span><p>{inspected.detail}</p></div>
      </div>
    </section>
  )
}
