import type { MouseEvent } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AppHeader } from './components/AppHeader.tsx'
import { ProgressProvider } from './domain/progress.tsx'
import { EvidencePage } from './pages/EvidencePage.tsx'
import { LessonPage } from './pages/LessonPage.tsx'
import { MapPage } from './pages/MapPage.tsx'

function focusMainContent(event: MouseEvent<HTMLAnchorElement>) {
  event.preventDefault()
  const main = document.getElementById('main-content')
  main?.focus()
  main?.scrollIntoView({ block: 'start' })
}

export function App() {
  return (
    <ProgressProvider>
      <div className="app-shell">
        <a className="skip-link" href="#main-content" onClick={focusMainContent}>跳到课程内容</a>
        <AppHeader />
        <Routes>
          <Route path="/" element={<LessonPage home />} />
          <Route path="/learn/:slug" element={<LessonPage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/evidence/:claimId" element={<EvidencePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </ProgressProvider>
  )
}
