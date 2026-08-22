import { ArrowLeft, ArrowRight, ChevronDown, ChevronRight, Clock3, FlaskConical, Play, RotateCcw, Target, Zap } from 'lucide-react'
import { useEffect, useReducer, useRef } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { CourseNavigation } from '../components/CourseNavigation.tsx'
import { runnerStatusLabel, TracePanel } from '../components/TracePanel.tsx'
import { claimsById, upstreams } from '../domain/claims.ts'
import { lessonTracks, lessons, lessonsBySlug, lessonsByTrack, lessonPath, type Lesson } from '../domain/lessons.ts'
import { useProgress } from '../domain/progress.tsx'
import { restoreRunnerState, runnerReducer } from '../domain/runner.ts'

export function LessonPage({ home = false }: { home?: boolean }) {
  const { slug } = useParams()
  const lesson = home ? lessons[0] : lessonsBySlug.get(slug ?? '')
  if (lesson === undefined) return <Navigate to="/" replace />
  return <LessonExperience key={lesson.slug} lesson={lesson} home={home} />
}

function LessonExperience({ lesson, home }: { lesson: Lesson; home: boolean }) {
  const { data, storageAvailable, saveLesson, resetLesson } = useProgress()
  const saved = data.lessons[lesson.slug]
  const [state, dispatch] = useReducer(runnerReducer, restoreRunnerState(saved, lesson))
  const mainRef = useRef<HTMLElement>(null)
  const previousPhaseRef = useRef(state.phase)
  const track = lessonTracks.find(candidate => candidate.id === lesson.track)!
  const trackLessons = lessonsByTrack[lesson.track]
  const lessonIndex = trackLessons.findIndex(candidate => candidate.id === lesson.id)
  const previous = trackLessons[lessonIndex - 1]
  const next = trackLessons[lessonIndex + 1]
  const nextTrackLesson = lesson.track === 'dsh' ? lessonsByTrack.pi[0] : undefined
  const sourceUpstream = upstreams[lesson.track]
  const continueLesson = home && data.lastLesson !== undefined && data.lastLesson !== lesson.slug
    ? lessonsBySlug.get(data.lastLesson)
    : undefined

  useEffect(() => {
    saveLesson(lesson.slug, state)
  }, [lesson.slug, saveLesson, state])

  useEffect(() => {
    if (saved === undefined && state.phase !== 'unstarted') dispatch({ type: 'reset' })
  }, [saved, state.phase])

  useEffect(() => {
    if (state.phase !== 'running' && state.phase !== 'experimenting') return
    const timer = window.setTimeout(() => {
      dispatch({ type: state.phase === 'running' ? 'observe' : 'experiment-complete' })
    }, state.phase === 'running' ? 720 : 520)
    return () => window.clearTimeout(timer)
  }, [state.phase])

  useEffect(() => {
    const previousPhase = previousPhaseRef.current
    previousPhaseRef.current = state.phase
    if (previousPhase !== 'running' || state.phase !== 'observed' || !window.matchMedia('(max-width: 560px)').matches) return
    const heading = document.querySelector<HTMLElement>('#trace-heading')
    heading?.focus({ preventScroll: true })
    heading?.scrollIntoView({
      block: 'start',
      behavior: 'auto',
    })
  }, [state.phase])

  const canRun = state.phase === 'predicted'
  const predictionHint = state.predictionId === undefined
    ? '选择后再运行；预测不会影响演示结果。'
    : state.predictionId === lesson.prediction.preferredId
      ? '已记录。现在运行，观察它是否符合你的判断。'
      : '已记录。不同判断也可以继续，结果会帮助你校正。'

  function reset() {
    resetLesson(lesson.slug)
    dispatch({ type: 'reset' })
    mainRef.current?.focus()
  }

  return (
    <div className="lesson-layout">
      <CourseNavigation currentLesson={lesson} />
      <main className="lesson-page" id="main-content" ref={mainRef} tabIndex={-1}>
      {!storageAvailable && <div className="storage-notice" role="status">本次进度不会保存；当前课程仍可完整运行。</div>}
      {continueLesson && (
        <div className="continue-strip">
          <span>上次停在“{continueLesson.navLabel}”</span>
          <Link to={lessonPath(continueLesson)}>继续上次任务 <ArrowRight aria-hidden="true" /></Link>
        </div>
      )}

      <nav className="lesson-breadcrumbs" aria-label="当前位置">
        <Link to="/map">学习路径</Link>
        <ChevronRight aria-hidden="true" />
        <span>{track.label}</span>
        <ChevronRight aria-hidden="true" />
        <span className="is-current" aria-current="page">{lesson.navLabel}</span>
      </nav>

      <header className="task-intro">
        <div className="lesson-sequence">{track.shortLabel} · 第 {lessonIndex + 1} 课 / 共 {trackLessons.length} 课</div>
        <h1>{lesson.title}</h1>
        <p className="lesson-question">{lesson.question}</p>
        <dl className="task-facts">
          <div><dt><Target aria-hidden="true" />你会得到</dt><dd>{lesson.outcome}</dd></div>
          <div><dt><Clock3 aria-hidden="true" />预计用时</dt><dd>{lesson.minutes} 分钟</dd></div>
          <div><dt><Zap aria-hidden="true" />运行方式</dt><dd>本地概念演示</dd></div>
        </dl>
      </header>

      <div className="workbench">
        <section className="decision-panel" aria-labelledby="prediction-heading">
          <div className="panel-heading">
            <div>
              <h2 id="prediction-heading">先做一个判断</h2>
              <p>{lesson.prediction.prompt}</p>
            </div>
            <button className="icon-action" type="button" onClick={reset} title="重置本课">
              <RotateCcw aria-hidden="true" />
              <span className="sr-only">重置本课</span>
            </button>
          </div>
          <div className="prediction-options" role="group" aria-label="选择你的预测">
            {lesson.prediction.options.map(option => (
              <button
                type="button"
                key={option.id}
                aria-pressed={state.predictionId === option.id}
                className={state.predictionId === option.id ? 'is-selected' : ''}
                disabled={state.phase !== 'unstarted' && state.phase !== 'predicted'}
                onClick={() => dispatch({ type: 'predict', optionId: option.id })}
              >
                {option.label}
              </button>
            ))}
          </div>
          <p className="prediction-hint" role="status">{predictionHint}</p>
          <button className="primary-action" type="button" disabled={!canRun} onClick={() => dispatch({ type: 'run' })}>
            <Play aria-hidden="true" />
            {state.phase === 'running' ? '正在运行' : lesson.runLabel}
          </button>
          <p className={`mobile-run-status phase-${state.phase}`} aria-live="polite">任务状态：{runnerStatusLabel(state)}</p>

          {(state.phase === 'observed' || state.phase === 'experimenting') && (
            <button
              className="experiment-action"
              type="button"
              disabled={state.phase === 'experimenting'}
              onClick={() => dispatch({ type: 'experiment' })}
            >
              <FlaskConical aria-hidden="true" />
              {state.phase === 'experimenting' ? '正在比较变化' : lesson.experiment.label}
            </button>
          )}
        </section>

        <TracePanel lesson={lesson} state={state} />
      </div>

      {(state.phase === 'checking' || state.phase === 'failed' || state.phase === 'completed') && (
        <section className="checkpoint" aria-labelledby="checkpoint-heading">
          <div className="checkpoint-heading">
            <span aria-hidden="true">?</span>
            <div><h2 id="checkpoint-heading">换一个场景试试</h2><p>{lesson.checkpoint.prompt}</p></div>
          </div>
          <div className="checkpoint-options">
            {lesson.checkpoint.options.map(option => (
              <button
                type="button"
                key={option.id}
                aria-pressed={state.checkpointId === option.id}
                className={state.checkpointId === option.id ? 'is-selected' : ''}
                disabled={state.phase === 'completed'}
                onClick={() => dispatch({ type: 'answer', optionId: option.id, correct: option.id === lesson.checkpoint.answerId })}
              >
                {option.label}
              </button>
            ))}
          </div>
          {state.phase === 'failed' && <p className="checkpoint-feedback is-error" role="alert">{lesson.checkpoint.retry}</p>}
          {state.phase === 'completed' && <p className="checkpoint-feedback is-success" role="status">{lesson.checkpoint.success}</p>}
        </section>
      )}

      {(state.phase === 'observed' || state.experimentApplied) && (
        <section className="understanding" aria-labelledby="understanding-heading">
          <h2 id="understanding-heading">把刚才的变化说清楚</h2>
          <p>{lesson.explanation}</p>
          <dl className="term-list">
            {lesson.terms.map(item => <div key={item.term}><dt>{item.term}</dt><dd>{item.definition}</dd></div>)}
          </dl>
        </section>
      )}

      <section className="depth-layer" aria-label="可选工程深度">
        <details>
          <summary><span>看最小实现</span><ChevronDown aria-hidden="true" /></summary>
          <div className="depth-content">
            <pre><code>{lesson.minimalCode}</code></pre>
            <p><strong>教学简化：</strong>{lesson.teachingLimit}</p>
          </div>
        </details>
        <details>
          <summary><span>对照真实 {track.shortLabel}</span><ChevronDown aria-hidden="true" /></summary>
          <div className="depth-content evidence-list">
            <p>适用于 {sourceUpstream.label} <code>{sourceUpstream.baseline.slice(0, 10)}</code>。产品事实与概念演示分开审核。</p>
            {lesson.claimIds.map(claimId => {
              const claim = claimsById.get(claimId)
              if (claim === undefined) return null
              return <Link key={claimId} to={`/evidence/${claimId}`} state={{ from: lessonPath(lesson), label: lesson.navLabel }}>{claim.title}<ArrowRight aria-hidden="true" /></Link>
            })}
          </div>
        </details>
      </section>

      <nav className="lesson-pagination" aria-label="前后课程">
        {previous ? <Link to={lessonPath(previous)}><ArrowLeft aria-hidden="true" /><span><small>上一课</small>{previous.navLabel}</span></Link> : <span />}
        {next
          ? <Link to={lessonPath(next)}><span><small>下一课</small>{next.navLabel}</span><ArrowRight aria-hidden="true" /></Link>
          : nextTrackLesson
            ? <Link to={lessonPath(nextTrackLesson)}><span><small>进入 Pi 对照</small>{nextTrackLesson.navLabel}</span><ArrowRight aria-hidden="true" /></Link>
            : <Link to="/map"><span><small>查看全貌</small>返回课程地图</span><ArrowRight aria-hidden="true" /></Link>}
      </nav>
      </main>
    </div>
  )
}
