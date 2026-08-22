import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { z } from 'zod'
import type { RunnerState } from './runner.ts'

const storageKey = 'learn-agent-harness-progress-v2'
const legacyStorageKey = 'learn-dsh-progress-v1'
const contentVersion = 2

const progressSchema = z.object({
  contentVersion: z.literal(contentVersion),
  lastLesson: z.string().optional(),
  lessons: z.record(z.string(), z.unknown()),
})

interface ProgressData {
  contentVersion: 2
  lastLesson?: string
  lessons: Record<string, unknown>
}

interface ProgressContextValue {
  data: ProgressData
  storageAvailable: boolean
  saveLesson: (slug: string, state: RunnerState) => void
  resetLesson: (slug: string) => void
  clearAll: () => void
}

const emptyProgress: ProgressData = { contentVersion, lessons: {} }
const ProgressContext = createContext<ProgressContextValue | null>(null)

function loadProgress(): { data: ProgressData; storageAvailable: boolean } {
  try {
    const value = window.localStorage.getItem(storageKey)
    if (value !== null) {
      const parsed = progressSchema.safeParse(JSON.parse(value))
      return { data: parsed.success ? parsed.data : emptyProgress, storageAvailable: true }
    }

    const legacyValue = window.localStorage.getItem(legacyStorageKey)
    if (legacyValue === null) return { data: emptyProgress, storageAvailable: true }
    const legacy = z.object({
      contentVersion: z.literal(1),
      lastLesson: z.string().optional(),
      lessons: z.record(z.string(), z.unknown()),
    }).safeParse(JSON.parse(legacyValue))
    if (!legacy.success) return { data: emptyProgress, storageAvailable: true }
    return { data: { ...legacy.data, contentVersion }, storageAvailable: true }
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
      window.localStorage.removeItem(legacyStorageKey)
    } catch {
      setStorageAvailable(false)
    }
  }, [data, storageAvailable])

  const saveLesson = useCallback((slug: string, state: RunnerState) => {
    setData(current => ({ ...current, lastLesson: slug, lessons: { ...current.lessons, [slug]: state } }))
  }, [])
  const resetLesson = useCallback((slug: string) => {
    setData(current => {
      const lessons = { ...current.lessons }
      delete lessons[slug]
      return { ...current, lessons, lastLesson: current.lastLesson === slug ? undefined : current.lastLesson }
    })
  }, [])
  const clearAll = useCallback(() => setData(emptyProgress), [])

  const value = useMemo<ProgressContextValue>(() => ({
    data,
    storageAvailable,
    saveLesson,
    resetLesson,
    clearAll,
  }), [clearAll, data, resetLesson, saveLesson, storageAvailable])

  return <ProgressContext value={value}>{children}</ProgressContext>
}

export function useProgress(): ProgressContextValue {
  const value = useContext(ProgressContext)
  if (value === null) throw new Error('useProgress must be used inside ProgressProvider')
  return value
}
