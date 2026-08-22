import { ArrowLeft, ExternalLink } from 'lucide-react'
import { Link, Navigate, useLocation, useParams } from 'react-router-dom'
import { claimsById, sourceUrl, upstreams } from '../domain/claims.ts'

export function EvidencePage() {
  const { claimId } = useParams()
  const location = useLocation()
  const sourceLesson = location.state as { from: string; label: string } | null
  const claim = claimsById.get(claimId ?? '')
  if (claim === undefined) return <Navigate to="/map" replace />

  return (
    <main className="evidence-page" id="main-content">
      <Link className="back-link" to={sourceLesson?.from ?? '/map'}>
        <ArrowLeft aria-hidden="true" />
        {sourceLesson === null ? '返回学习路径' : `返回“${sourceLesson.label}”`}
      </Link>
      <header className="page-intro">
        <div className="fact-status">固定提交 · 已审核</div>
        <h1>{claim.title}</h1>
        <p>{claim.statement}</p>
      </header>
      <section className="evidence-section">
        <h2>证据位置</h2>
        <ul>
          {claim.paths.map(item => (
            <li key={`${item.path}:${item.symbol}`}>
              <a href={sourceUrl(claim, item.path)} target="_blank" rel="noreferrer">
                <code>{item.path}</code>
                <span>{item.symbol}</span>
                <ExternalLink aria-hidden="true" />
              </a>
            </li>
          ))}
        </ul>
      </section>
      <section className="caveat-section">
        <h2>适用限定</h2>
        <p>{claim.caveat}</p>
      </section>
      <p className="baseline-line">适用于 {upstreams[claim.upstream].label} <code>{claim.baseline}</code></p>
    </main>
  )
}
