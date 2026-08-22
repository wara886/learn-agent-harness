import { ArrowRight, Check, Circle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { lessonPath, lessonTracks, lessonsByTrack } from '../domain/lessons.ts'
import { useProgress } from '../domain/progress.tsx'

export function MapPage() {
  const { data } = useProgress()
  return (
    <main className="map-page" id="main-content">
      <header className="page-intro">
        <h1>两条轨道，同一种学习方法</h1>
        <p>先完成任务，再观察状态变化，最后对照 Pi 与 DeepSeek Harness 的真实源码。</p>
      </header>
      {lessonTracks.map(track => (
        <section className="map-track" key={track.id} aria-labelledby={`track-${track.id}`}>
          <header className="map-track-header">
            <div>
              <h2 id={`track-${track.id}`}>{track.label}</h2>
              <p>{track.description}</p>
            </div>
            <span>{lessonsByTrack[track.id].length} 课</span>
          </header>
          <ol className="lesson-map">
            {lessonsByTrack[track.id].map((lesson, index) => {
              const saved = data.lessons[lesson.slug]
              const completed = typeof saved === 'object' && saved !== null && 'phase' in saved && saved.phase === 'completed'
              return (
                <li key={lesson.id}>
                  <span className="map-node" aria-hidden="true">{completed ? <Check /> : <Circle />}</span>
                  <div className="map-copy">
                    <span>{track.shortLabel} 任务 {index + 1}</span>
                    <h3>{lesson.title}</h3>
                    <p>{lesson.question}</p>
                    <div className="map-change"><strong>状态变化</strong><span>{lesson.outcome}</span></div>
                  </div>
                  <Link to={lessonPath(lesson)}>进入任务 <ArrowRight aria-hidden="true" /></Link>
                </li>
              )
            })}
          </ol>
        </section>
      ))}
    </main>
  )
}
