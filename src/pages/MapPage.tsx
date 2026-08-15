import { ArrowRight, Check, Circle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { lessons, lessonPath } from '../domain/lessons.ts'
import { useProgress } from '../domain/progress.tsx'

export function MapPage() {
  const { data } = useProgress()
  return (
    <main className="map-page">
      <header className="page-intro">
        <h1>三次任务，一条因果链</h1>
        <p>先取得外部事实，再理解记录怎样进入下一次请求，最后改变 Agent 当前可用的能力。</p>
      </header>
      <ol className="lesson-map">
        {lessons.map((lesson, index) => {
          const saved = data.lessons[lesson.slug]
          const completed = typeof saved === 'object' && saved !== null && 'phase' in saved && saved.phase === 'completed'
          return (
            <li key={lesson.id}>
              <span className="map-node" aria-hidden="true">{completed ? <Check /> : <Circle />}</span>
              <div className="map-copy">
                <span>任务 {index + 1}</span>
                <h2>{lesson.title}</h2>
                <p>{lesson.question}</p>
                <div className="map-change"><strong>状态变化</strong><span>{lesson.outcome}</span></div>
              </div>
              <Link to={lessonPath(lesson)}>进入任务 <ArrowRight aria-hidden="true" /></Link>
            </li>
          )
        })}
      </ol>
    </main>
  )
}
