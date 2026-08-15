import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { App } from './App.tsx'

describe('M1 application shell', () => {
  it('starts with the task-first product promise', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: '从一次任务开始，看懂 DeepSeek Harness' })).toBeVisible()
  })
})
