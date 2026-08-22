import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { App } from './App.tsx'

function renderApp(path = '/') {
  return render(<MemoryRouter initialEntries={[path]}><App /></MemoryRouter>)
}

describe('task-first application', () => {
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
})
