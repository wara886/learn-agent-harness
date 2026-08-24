import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { z } from 'zod'
import type { RunnerState } from './runner.ts'

const storageKey = 'learn-agent-harness-progress-v3'
const formerStorageKey = 'learn-agent-harness-progress-v2'
const legacyStorageKey = 'learn-dsh-progress-v1'
const contentVersion = 3

const progressSchema = z.object({
  contentVersion: z.literal(contentVersion),
  lastLesson: z.string().optional(),
  lastSection: z.string().optional(),
  sectionProgress: z.record(z.string(), z.string()),
  expandedChapter: z.string().optional(),
  lessons: z.record(z.string(), z.unknown()),
})

interface ProgressData {
  contentVersion: 3
  lastLesson?: string
  lastSection?: string
  sectionProgress: Record<string, string>
  expandedChapter?: string
  lessons: Record<string, unknown>
}

interface ProgressContextValue {
  data: ProgressData
  storageAvailable: boolean
  saveLesson: (slug: string, state: RunnerState) => void
  saveSection: (slug: string, sectionId: string) => void
  setExpandedChapter: (chapterId: string) => void
  resetLesson: (slug: string) => void
  clearAll: () => void
}

const emptyProgress: ProgressData = { contentVersion, sectionProgress: {}, lessons: {} }
const ProgressContext = createContext<ProgressContextValue | null>(null)

function loadProgress(): { data: ProgressData; storageAvailable: boolean } {
  try {
    const value = window.localStorage.getItem(storageKey)
    if (value !== null) {
      const parsed = progressSchema.safeParse(JSON.parse(value))
      return { data: parsed.success ? parsed.data : emptyProgress, storageAvailable: true }
    }

    const formerValue = window.localStorage.getItem(formerStorageKey)
    if (formerValue !== null) {
      const former = z.object({
        contentVersion: z.literal(2),
        lastLesson: z.string().optional(),
        lessons: z.record(z.string(), z.unknown()),
      }).safeParse(JSON.parse(formerValue))
      if (former.success) return { data: { ...emptyProgress, ...former.data, contentVersion }, storageAvailable: true }
    }

    const legacyValue = window.localStorage.getItem(legacyStorageKey)
    if (legacyValue === null) return { data: emptyProgress, storageAvailable: true }
    const legacy = z.object({
      contentVersion: z.literal(1),
      lastLesson: z.string().optional(),
      lessons: z.record(z.string(), z.unknown()),
    }).safeParse(JSON.parse(legacyValue))
    if (!legacy.success) return { data: emptyProgress, storageAvailable: true }
    return { data: { ...emptyProgress, ...legacy.data, contentVersion }, storageAvailable: true }
  } catch {
    return { data: emptyProgress, storageAvailable: false }
  }
}

export function ProgressProvider({ children }: { children: ReactNode }) {
  const initial = useMemo(loadProgress, [])
  const [data, setData] = useState<ProgressData>(initial.data)
  const [storageAvailable, setStorageAvailable] = useState(initial.storageAvailable)

  useEffect(() => {
    if (!storageAvailable) return
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(data))
      window.localStorage.removeItem(formerStorageKey)
      window.localStorage.removeItem(legacyStorageKey)
    } catch {
      setStorageAvailable(false)
    }
  }, [data, storageAvailable])

  const saveLesson = useCallback((slug: string, state: RunnerState) => {
    setData(current => ({ ...current, lastLesson: slug, lessons: { ...current.lessons, [slug]: state } }))
  }, [])
  const saveSection = useCallback((slug: string, sectionId: string) => {
    setData(current => {
      if (current.lastLesson === slug && current.lastSection === sectionId && current.sectionProgress[slug] === sectionId) return current
      return {
        ...current,
        lastLesson: slug,
        lastSection: sectionId,
        sectionProgress: { ...current.sectionProgress, [slug]: sectionId },
      }
    })
  }, [])
  const setExpandedChapter = useCallback((chapterId: string) => {
    setData(current => current.expandedChapter === chapterId ? current : { ...current, expandedChapter: chapterId })
  }, [])
  const resetLesson = useCallback((slug: string) => {
    setData(current => {
      const lessons = { ...current.lessons }
      const sectionProgress = { ...current.sectionProgress }
      delete lessons[slug]
      delete sectionProgress[slug]
      return {
        ...current,
        lessons,
        sectionProgress,
        lastLesson: current.lastLesson === slug ? undefined : current.lastLesson,
        lastSection: current.lastLesson === slug ? undefined : current.lastSection,
      }
    })
  }, [])
  const clearAll = useCallback(() => setData(emptyProgress), [])

  const value = useMemo<ProgressContextValue>(() => ({
    data,
    storageAvailable,
    saveLesson,
    saveSection,
    setExpandedChapter,
    resetLesson,
    clearAll,
  }), [clearAll, data, resetLesson, saveLesson, saveSection, setExpandedChapter, storageAvailable])

  return <ProgressContext value={value}>{children}</ProgressContext>
}

export function useProgress(): ProgressContextValue {
  const value = useContext(ProgressContext)
  if (value === null) throw new Error('useProgress must be used inside ProgressProvider')
  return value
}
