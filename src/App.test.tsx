import { fireEvent, render, screen, within } from '@testing-library/react'
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
    expect(screen.getByRole('heading', { name: '学完这一课，你应该能够回答' })).toBeVisible()
    expect(screen.getByRole('group', { name: '可交互心智模型' })).toBeVisible()
    expect(screen.getByRole('navigation', { name: 'Lesson 目录' })).toBeVisible()
    expect(screen.queryByText('Cordis')).not.toBeInTheDocument()
  })

  it('finds a lesson from a problem-language query', () => {
    renderApp()
    const search = screen.getByRole('searchbox', { name: '按问题搜索课程' })
    fireEvent.focus(search)
    fireEvent.change(search, { target: { value: '事件怎么变成消息' } })
    expect(within(screen.getByRole('navigation', { name: '搜索结果' })).getByRole('link', { name: /聊天界面中的消息从哪里来/ })).toBeVisible()
  })

  it('opens the Pi tool-result lesson as a separate track', () => {
    renderApp('/learn/pi-tool-result-round-trip')
    expect(screen.getByRole('heading', { name: '让 Pi 读出项目名称，再回答' })).toBeVisible()
    expect(screen.getByRole('navigation', { name: '课程目录' })).toHaveTextContent('Pi Agent Harness5 课')
    expect(screen.getByRole('navigation', { name: '当前位置' })).toHaveTextContent('学习路径Pi Agent Harness结果回到下一轮')
    expect(screen.getByRole('button', { name: '运行 Pi 工具闭环' })).toBeDisabled()
  })

  it('groups lessons by framework and expands one chapter at a time', () => {
    renderApp()
    const directory = screen.getByRole('navigation', { name: '课程目录' })
    expect(directory).toHaveTextContent('DeepSeek Harness5 课')
    expect(directory).toHaveTextContent('Pi Agent Harness5 课')
    expect(within(directory).getAllByRole('button')).toHaveLength(4)
    expect(directory.getElementsByTagName('a')).toHaveLength(3)
    fireEvent.click(within(directory).getByRole('button', { name: /02 · 上下文与编排/ }))
    expect(directory.getElementsByTagName('a')).toHaveLength(2)
    expect(directory).toHaveTextContent('压缩旧上下文')
  })

  it('redirects an unknown lesson instead of showing mismatched content', () => {
    renderApp('/learn/not-a-real-lesson')
    expect(screen.getByRole('heading', { name: '找出发布端口，并说明依据' })).toBeVisible()
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
    expect(screen.getByLabelText('已完成 1 课，共 10 课')).toBeVisible()
    expect(window.localStorage.getItem('learn-dsh-progress-v1')).toBeNull()
  })

  it('preserves lesson state while adding section progress', () => {
    window.localStorage.setItem('learn-agent-harness-progress-v2', JSON.stringify({
      contentVersion: 2,
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
    expect(screen.getByLabelText('已完成 1 课，共 10 课')).toBeVisible()
    expect(window.localStorage.getItem('learn-agent-harness-progress-v2')).toBeNull()
    expect(JSON.parse(window.localStorage.getItem('learn-agent-harness-progress-v3')!)).toMatchObject({
      contentVersion: 3,
      sectionProgress: {},
    })
  })
})
