import { Check, Circle, GitBranch } from 'lucide-react'
import { Link } from 'react-router-dom'
import { lessonChapters, lessonPath, lessonTracks, lessonsForChapter } from '../domain/lessons.ts'
import { useProgress } from '../domain/progress.tsx'

export function MapPage() {
  const { data } = useProgress()
  return (
    <main className="map-page" id="main-content" tabIndex={-1}>
      <header className="page-intro">
        <h1>Agent Harness 架构地图</h1>
        <p>从运行循环走到上下文、工具和资源加载。节点状态来自你的本地课程进度，点击后进入对应任务。</p>
      </header>
      <nav className="architecture-overview" aria-label="架构节点">
        {lessonTracks.map(track => (
          <section key={track.id} data-track={track.id}>
            <header><GitBranch aria-hidden="true" /><div><h2>{track.label}</h2><p>{track.description}</p></div></header>
            {lessonChapters.filter(chapter => chapter.track === track.id).map(chapter => (
              <div className="architecture-branch" key={chapter.id}>
                <h3>{String(chapter.index).padStart(2, '0')} · {chapter.title}</h3>
                <ul>
                  {lessonsForChapter(chapter).map(lesson => {
                    const saved = data.lessons[lesson.slug]
                    const completed = typeof saved === 'object' && saved !== null && 'phase' in saved && saved.phase === 'completed'
                    const current = data.lastLesson === lesson.slug
                    return (
                      <li key={lesson.id} className={current ? 'is-current' : ''}>
                        {completed ? <Check aria-hidden="true" /> : <Circle aria-hidden="true" />}
                        <Link to={lessonPath(lesson)}>{lesson.navLabel}</Link>
                        <small>{completed ? '已学' : current ? '当前' : '未开始'}</small>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </section>
        ))}
      </nav>
    </main>
  )
}
