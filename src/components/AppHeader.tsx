import { BookOpen, Search, Trash2, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { lessons, lessonPath } from '../domain/lessons.ts'
import { useProgress } from '../domain/progress.tsx'

export function AppHeader() {
  const navigate = useNavigate()
  const location = useLocation()
  const { data, clearAll } = useProgress()
  const [query, setQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const completed = lessons.filter(lesson => {
    const value = data.lessons[lesson.slug]
    return typeof value === 'object' && value !== null && 'phase' in value && value.phase === 'completed'
  }).length

  const results = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('zh-CN')
    if (normalized.length === 0) return lessons
    return lessons.filter(lesson => [lesson.title, lesson.question, lesson.mechanism, ...lesson.searchTerms]
      .some(value => value.toLocaleLowerCase('zh-CN').includes(normalized)))
  }, [query])

  useEffect(() => {
    setSearchOpen(false)
    setQuery('')
  }, [location.pathname])

  function openSearch() {
    setSearchOpen(true)
    window.setTimeout(() => inputRef.current?.focus(), 0)
  }

  function resetAll() {
    if (!window.confirm(`清除 ${lessons.length} 课的全部本地进度？`)) return
    clearAll()
    navigate('/')
  }

  return (
    <header className="app-header">
      <div className="header-inner">
        <Link className="brand" to="/" aria-label="Learn Agent Harness 首页">看懂 Agent</Link>
        <div className="course-progress" aria-label={`已完成 ${completed} 课，共 ${lessons.length} 课`}>
          <span>{completed}/{lessons.length}</span>
          <span className="progress-track" aria-hidden="true">
            <span style={{ width: `${completed / lessons.length * 100}%` }} />
          </span>
        </div>
        <nav className="header-actions" aria-label="全局导航">
          <button className="icon-action mobile-search-action" type="button" onClick={openSearch} title="按问题搜索">
            <Search aria-hidden="true" />
            <span className="sr-only">按问题搜索</span>
          </button>
          <div className={`search-box ${searchOpen ? 'is-open' : ''}`}>
            <Search aria-hidden="true" />
            <input
              ref={inputRef}
              value={query}
              onChange={event => { setQuery(event.target.value); setSearchOpen(true) }}
              onFocus={() => setSearchOpen(true)}
              placeholder="按问题搜索"
              role="combobox"
              aria-label="按问题搜索课程"
              aria-autocomplete="list"
              aria-expanded={searchOpen}
              aria-controls="search-results"
            />
            {searchOpen && (
              <button className="search-close" type="button" onClick={() => { setSearchOpen(false); setQuery('') }} aria-label="关闭搜索">
                <X aria-hidden="true" />
              </button>
            )}
            {searchOpen && (
              <div className="search-results" id="search-results">
                {results.length > 0 ? results.map(lesson => (
                  <button key={lesson.id} type="button" onClick={() => navigate(lessonPath(lesson))}>
                    <span>{lesson.question}</span>
                    <small>{lesson.navLabel}</small>
                  </button>
                )) : (
                  <div className="search-empty">
                    <p>没有找到对应课程</p>
                    {lessons.map(lesson => (
                      <button key={lesson.id} type="button" onClick={() => navigate(lessonPath(lesson))}>{lesson.question}</button>
                    ))}
                    <Link to="/map">查看课程地图</Link>
                  </div>
                )}
              </div>
            )}
          </div>
          <Link className="text-action" to="/map" aria-label="课程地图">
            <BookOpen aria-hidden="true" />
            <span>课程地图</span>
          </Link>
          <button className="icon-action" type="button" onClick={resetAll} title="清除全部进度">
            <Trash2 aria-hidden="true" />
            <span className="sr-only">清除全部进度</span>
          </button>
        </nav>
      </div>
    </header>
  )
}
