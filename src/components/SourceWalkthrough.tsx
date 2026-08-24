import { ArrowRight, Code2, FileCode2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { claimsById, upstreams } from '../domain/claims.ts'
import type { Lesson } from '../domain/lessons.ts'

function splitCode(source: string): string[] {
  const lines = source.split('\n')
  const size = Math.max(1, Math.ceil(lines.length / 3))
  return [0, 1, 2].map(index => lines.slice(index * size, (index + 1) * size).join('\n')).filter(Boolean)
}

export function SourceWalkthrough({ lesson }: { lesson: Lesson }) {
  const chunks = splitCode(lesson.minimalCode)
  const claim = claimsById.get(lesson.claimIds[0]!)!
  const source = claim.paths[0]!
  const upstream = upstreams[lesson.track]
  let line = 1

  return (
    <section className="source-walkthrough" id="source-walkthrough" aria-labelledby="source-walkthrough-heading">
      <header className="teaching-section-heading">
        <div><h2 id="source-walkthrough-heading">沿着状态变化拆解最小实现</h2><p>下面是教学伪代码；先理解职责，再打开固定提交中的真实源码。</p></div>
        <span>03 · SOURCE WALKTHROUGH</span>
      </header>
      <div className="source-file-heading">
        <FileCode2 aria-hidden="true" />
        <span><small>真实源码定位 · {upstream.label} · 固定提交 {upstream.baseline.slice(0, 10)}</small><code>{source.path}</code></span>
      </div>
      <ol className="source-steps">
        {chunks.map((chunk, index) => {
          const start = line
          const end = start + chunk.split('\n').length - 1
          line = end + 1
          const trace = lesson.baselineTrace[Math.min(index, lesson.baselineTrace.length - 1)]!
          return (
            <li key={`${trace.label}-${index}`}>
              <div className="source-step-copy">
                <span>{String.fromCharCode(65 + index)}</span>
                <div><h3>{trace.label}</h3><p>{trace.detail}</p></div>
              </div>
              <div className="code-slice">
                <header><Code2 aria-hidden="true" /><span>教学最小实现</span><small>L{start}–{end}</small></header>
                <pre><code>{chunk}</code></pre>
              </div>
              <dl className="concept-code-map">
                <div><dt>Concept</dt><dd>{index === 1 ? lesson.mechanism : trace.label}</dd></div>
                <div><dt>Implementation</dt><dd><code>{source.symbol}</code></dd></div>
                <div><dt>Related</dt><dd>{lesson.terms.map(term => term.term).join(' · ')}</dd></div>
              </dl>
            </li>
          )
        })}
      </ol>
      <Link className="source-evidence-link" to={`/evidence/${claim.id}`} state={{ from: `/learn/${lesson.slug}`, label: lesson.navLabel }}>
        查看固定提交中的真实源码依据 <ArrowRight aria-hidden="true" />
      </Link>
    </section>
  )
}
