import { Check, ChevronDown, ChevronRight, Circle, ListTree, Map } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { chapterForLesson, lessonChapters, lessonPath, lessonTracks, lessonsByTrack, lessonsForChapter, type Lesson } from '../domain/lessons.ts'
import { useProgress } from '../domain/progress.tsx'

function lessonCompleted(value: unknown): boolean {
  return typeof value === 'object' && value !== null && 'phase' in value && value.phase === 'completed'
}

export function CourseNavigation({ currentLesson }: { currentLesson: Lesson }) {
  const { data, setExpandedChapter } = useProgress()
  const [open, setOpen] = useState(false)
  const currentTrack = lessonTracks.find(track => track.id === currentLesson.track)!
  const currentIndex = lessonsByTrack[currentLesson.track].findIndex(lesson => lesson.id === currentLesson.id)
  const activeChapter = chapterForLesson(currentLesson)
  const expandedChapter = data.expandedChapter ?? activeChapter.id

  useEffect(() => {
    setExpandedChapter(activeChapter.id)
  }, [activeChapter.id, setExpandedChapter])

  return (
    <aside className={`course-directory ${open ? 'is-open' : ''}`} data-track={currentLesson.track} aria-label="学习导航">
      <button
        className="directory-trigger"
        type="button"
        aria-expanded={open}
        aria-controls="course-directory-panel"
        onClick={() => setOpen(value => !value)}
      >
        <ListTree aria-hidden="true" />
        <span>
          <strong>课程目录</strong>
          <small>{currentTrack.shortLabel} · {currentIndex + 1}/{lessonsByTrack[currentLesson.track].length}</small>
        </span>
        <ChevronDown aria-hidden="true" />
      </button>

      <div className="directory-panel" id="course-directory-panel">
        <header className="directory-heading">
          <span>FRAMEWORK · 学习路径</span>
          <h2>课程目录</h2>
          <p>按框架与章节定位，每次只展开当前学习单元。</p>
        </header>

        <nav className="directory-nav" aria-label="课程目录">
          {lessonTracks.map(track => {
            const trackChapters = lessonChapters.filter(chapter => chapter.track === track.id)
            return (
            <section className={track.id === currentLesson.track ? 'is-current' : ''} key={track.id} aria-labelledby={`directory-${track.id}`}>
              <div className="directory-track-heading">
                <span className={`track-dot track-${track.id}`} aria-hidden="true" />
                <h3 id={`directory-${track.id}`}>{track.label}</h3>
                <small>{lessonsByTrack[track.id].length} 课</small>
              </div>
              <div className="directory-chapters">
              {trackChapters.map(chapter => {
                const chapterLessons = lessonsForChapter(chapter)
                const completeCount = chapterLessons.filter(lesson => lessonCompleted(data.lessons[lesson.slug])).length
                const expanded = expandedChapter === chapter.id
                return (
                <section className="directory-chapter" key={chapter.id}>
                  <button
                    type="button"
                    aria-expanded={expanded}
                    aria-controls={`chapter-${chapter.id}`}
                    onClick={() => setExpandedChapter(chapter.id)}
                  >
                    {expanded ? <ChevronDown aria-hidden="true" /> : <ChevronRight aria-hidden="true" />}
                    <span><strong>{String(chapter.index).padStart(2, '0')} · {chapter.title}</strong><small>{completeCount} / {chapterLessons.length}</small></span>
                  </button>
                  {expanded && <ol id={`chapter-${chapter.id}`}>
                {chapterLessons.map(lesson => {
                  const index = lessonsByTrack[track.id].findIndex(candidate => candidate.id === lesson.id)
                  const completed = lessonCompleted(data.lessons[lesson.slug])
                  const active = lesson.id === currentLesson.id
                  return (
                    <li key={lesson.id}>
                      <Link
                        to={lessonPath(lesson)}
                        aria-current={active ? 'page' : undefined}
                        className={active ? 'is-active' : ''}
                        onClick={() => setOpen(false)}
                      >
                        <span className="directory-index">{String(index + 1).padStart(2, '0')}</span>
                        <span className="directory-lesson-copy">
                          <strong>{lesson.navLabel}</strong>
                          <small>{lesson.question}</small>
                        </span>
                        <span className="directory-status" aria-label={completed ? '已完成' : '未完成'}>
                          {completed ? <Check aria-hidden="true" /> : <Circle aria-hidden="true" />}
                        </span>
                      </Link>
                    </li>
                  )
                })}
                  </ol>}
                </section>
                )
              })}
              </div>
            </section>
            )
          })}
        </nav>

        <Link className="directory-overview" to="/map" onClick={() => setOpen(false)}>
          <Map aria-hidden="true" />
          <span><strong>阶段总览</strong><small>查看完整学习路径</small></span>
        </Link>
      </div>
    </aside>
  )
}
