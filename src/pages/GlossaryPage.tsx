import { ArrowRight, BookOpenCheck, Code2, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { glossaryEntries } from '../domain/glossary.ts'
import { lessonPath, lessonTracks } from '../domain/lessons.ts'
import type { UpstreamId } from '../domain/claims.ts'

type GlossaryTrack = 'all' | UpstreamId

export function GlossaryPage() {
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('term') ?? '')
  const [track, setTrack] = useState<GlossaryTrack>('all')
  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('zh-CN')
    return glossaryEntries.filter(entry => {
      const trackMatches = track === 'all' || entry.track === track
      const queryMatches = normalized.length === 0 || [entry.term, entry.definition, entry.firstLesson.question, entry.sourceSymbol]
        .some(value => value.toLocaleLowerCase('zh-CN').includes(normalized))
      return trackMatches && queryMatches
    })
  }, [query, track])

  return (
    <main className="glossary-page" id="main-content" tabIndex={-1}>
      <header className="page-intro glossary-intro">
        <span><BookOpenCheck aria-hidden="true" /> LEARNING INDEX</span>
        <h1>Agent 术语索引</h1>
        <p>先读普通语言解释，再回到术语第一次出现的课程。源码位置固定到课程已经审核的上游提交。</p>
      </header>

      <section className="glossary-toolbar" aria-label="筛选术语">
        <label>
          <Search aria-hidden="true" />
          <span className="sr-only">搜索术语</span>
          <input value={query} onChange={event => setQuery(event.target.value)} type="search" placeholder="搜索术语、解释或源码符号" />
        </label>
        <div className="glossary-track-filter" role="group" aria-label="按框架筛选">
          <button type="button" aria-pressed={track === 'all'} onClick={() => setTrack('all')}>全部</button>
          {lessonTracks.map(item => (
            <button type="button" key={item.id} aria-pressed={track === item.id} onClick={() => setTrack(item.id)}>{item.shortLabel}</button>
          ))}
        </div>
      </section>

      <section className="glossary-results" aria-labelledby="glossary-results-heading">
        <header>
          <h2 id="glossary-results-heading" aria-live="polite" aria-atomic="true">{filtered.length} 个术语</h2>
          <p>每个词只保留一个首要解释，相关课程负责展示它怎样改变运行状态。</p>
        </header>
        {filtered.length > 0 ? (
          <ol>
            {filtered.map((entry, index) => {
              const trackMeta = lessonTracks.find(item => item.id === entry.track)!
              return (
                <li key={entry.term} data-track={entry.track}>
                  <div className="glossary-term">
                    <span>{String(index + 1).padStart(2, '0')} · {trackMeta.shortLabel}</span>
                    <h3><code>{entry.term}</code></h3>
                  </div>
                  <p>{entry.definition}</p>
                  <div className="glossary-links">
                    <Link to={lessonPath(entry.firstLesson)} aria-label={`首次出现：${entry.firstLesson.navLabel}`}>
                      <span><small>首次出现</small>{entry.firstLesson.navLabel}</span><ArrowRight aria-hidden="true" />
                    </Link>
                    <Link to={`/evidence/${entry.claimId}`} state={{ from: '/glossary', label: '术语索引' }}>
                      <Code2 aria-hidden="true" /><span><small>{entry.sourcePath}</small><code>{entry.sourceSymbol}</code></span>
                    </Link>
                  </div>
                </li>
              )
            })}
          </ol>
        ) : <p className="glossary-empty">没有匹配项。可以改用课程中的普通语言问题搜索。</p>}
      </section>
    </main>
  )
}
