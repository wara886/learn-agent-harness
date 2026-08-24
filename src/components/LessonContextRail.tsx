import { Check, Circle } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import type { RunnerState } from '../domain/runner.ts'
import type { Lesson } from '../domain/lessons.ts'
import { useProgress } from '../domain/progress.tsx'

export const lessonSections = [
  { id: 'mental-model', label: '心智模型' },
  { id: 'run-it', label: '运行代码' },
  { id: 'execution-trace', label: '执行轨迹' },
  { id: 'source-walkthrough', label: '源码拆解' },
  { id: 'architecture-connection', label: '架构联系' },
  { id: 'check-understanding', label: '思考题' },
] as const

export function LessonContextRail({ lesson, state }: { lesson: Lesson; state: RunnerState }) {
  const { saveSection } = useProgress()
  const [activeSection, setActiveSection] = useState<string>('mental-model')
  const available = useMemo(() => new Set([
    'mental-model',
    'run-it',
    'execution-trace',
    ...(state.phase !== 'unstarted' && state.phase !== 'predicted' && state.phase !== 'running' ? ['source-walkthrough', 'architecture-connection'] : []),
    ...(state.phase === 'checking' || state.phase === 'failed' || state.phase === 'completed' ? ['check-understanding'] : []),
  ]), [state.phase])

  useEffect(() => {
    if (!('IntersectionObserver' in window)) return
    const elements = lessonSections.map(section => document.getElementById(section.id)).filter((element): element is HTMLElement => element !== null)
    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]
      if (visible === undefined) return
      setActiveSection(visible.target.id)
      saveSection(lesson.slug, visible.target.id)
    }, { rootMargin: '-20% 0px -65% 0px', threshold: [0, 0.2] })
    elements.forEach(element => observer.observe(element))
    return () => observer.disconnect()
  }, [lesson.slug, saveSection, state.phase])

  const activeIndex = lessonSections.findIndex(section => section.id === activeSection)
  const progress = Math.round((Math.max(0, activeIndex) + 1) / lessonSections.length * 100)

  return (
    <aside className="lesson-context-rail" aria-label="本节导航">
      <div className="context-rail-inner">
        <h2>本节</h2>
        <nav aria-label="Lesson 目录">
          {lessonSections.map(section => {
            const active = section.id === activeSection
            const enabled = available.has(section.id)
            return (
              <a
                key={section.id}
                href={`#${section.id}`}
                className={active ? 'is-active' : ''}
                aria-current={active ? 'location' : undefined}
                aria-disabled={!enabled || undefined}
                onClick={event => {
                  if (!enabled) event.preventDefault()
                  else saveSection(lesson.slug, section.id)
                }}
              >
                {enabled && lessonSections.findIndex(candidate => candidate.id === section.id) < activeIndex
                  ? <Check aria-hidden="true" />
                  : <Circle aria-hidden="true" />}
                <span>{section.label}</span>
              </a>
            )
          })}
        </nav>
        <section className="rail-progress" aria-label={`本节学习进度 ${progress}%`}>
          <span><strong>学习进度</strong><small>{progress}%</small></span>
          <div aria-hidden="true"><span style={{ width: `${progress}%` }} /></div>
        </section>
        <section className="rail-concepts">
          <h3>关键概念</h3>
          <ul>{lesson.terms.map(term => <li key={term.term}>{term.term}</li>)}</ul>
        </section>
      </div>
    </aside>
  )
}
