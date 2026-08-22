import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { App } from './App.tsx'

function renderApp(path = '/') {
  return render(<MemoryRouter initialEntries={[path]}><App /></MemoryRouter>)
}

describe('task-first application', () => {
  beforeEach(() => window.localStorage.clear())

  it('starts with the first task and a visible primary action', () => {
    renderApp()
    expect(screen.getByRole('heading', { name: '找出发布端口，并说明依据' })).toBeVisible()
    expect(screen.getByRole('button', { name: '启动任务' })).toBeDisabled()
    expect(screen.queryByText('Cordis')).not.toBeInTheDocument()
  })

  it('finds a lesson from a problem-language query', () => {
    renderApp()
    const search = screen.getByRole('combobox', { name: '按问题搜索课程' })
    fireEvent.focus(search)
    fireEvent.change(search, { target: { value: '事件怎么变成消息' } })
    expect(screen.getByRole('button', { name: /聊天界面中的消息从哪里来/ })).toBeVisible()
  })

  it('opens the Pi tool-result lesson as a separate track', () => {
    renderApp('/learn/pi-tool-result-round-trip')
    expect(screen.getByRole('heading', { name: '让 Pi 读出项目名称，再回答' })).toBeVisible()
    expect(screen.getByRole('navigation', { name: '选择学习轨道' })).toHaveTextContent('Pi1 课')
    expect(screen.getByRole('button', { name: '运行 Pi 工具闭环' })).toBeDisabled()
  })

  it('migrates completed progress from the former DSH storage key', () => {
    window.localStorage.setItem('learn-dsh-progress-v1', JSON.stringify({
      contentVersion: 1,
      lastLesson: 'first-tool-result',
      lessons: {
        'first-tool-result': {
          phase: 'completed',
          predictionId: 'read',
          checkpointId: 'stop',
          experimentApplied: true,
        },
      },
    }))
    renderApp()
    expect(screen.getByLabelText('已完成 1 课，共 4 课')).toBeVisible()
    expect(window.localStorage.getItem('learn-dsh-progress-v1')).toBeNull()
  })
})
