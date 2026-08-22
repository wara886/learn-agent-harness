import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.beforeEach(async ({ page }) => {
  await page.goto('/#/')
  await page.evaluate(() => window.localStorage.clear())
  await page.reload()
})

test('completes the first lesson and persists progress', async ({ page }) => {
  await expect(page.getByRole('heading', { name: '找出发布端口，并说明依据' })).toBeVisible()
  await page.getByRole('button', { name: '先读取工作区' }).click()
  await page.getByRole('button', { name: '启动任务' }).click()
  await expect(page.getByText('发布端口是 4173，依据为 config.env；任务已停止。')).toBeVisible()
  await page.getByRole('button', { name: '把读取结果改为“拒绝访问”' }).click()
  await expect(page.getByText('无法从现有结果确认发布端口；任务已停止。')).toBeVisible()
  await page.getByRole('button', { name: '说明缺少依据并停止' }).click()
  await expect(page.getByText(/你抓住了因果链/)).toBeVisible()
  await expect(page.getByLabel('已完成 1 课，共 3 课')).toBeVisible()
  await page.reload()
  await expect(page.getByLabel('已完成 1 课，共 3 课')).toBeVisible()
})

test('searches in problem language and runs the projection experiment', async ({ page }) => {
  const search = page.getByRole('combobox', { name: '按问题搜索课程' })
  await search.fill('事件怎么变成消息')
  await page.getByRole('button', { name: /聊天界面中的消息从哪里来/ }).click()
  await expect(page.getByRole('heading', { name: '从记录还原模型看到的消息' })).toBeVisible()
  await page.getByRole('button', { name: '只有完整记录增加' }).click()
  await page.getByRole('button', { name: '生成模型视图' }).click()
  await expect(page.getByText('只取能生成消息的有序 surface 节点。')).toBeVisible()
  await page.getByRole('button', { name: '加入一条 todo/write' }).click()
  await expect(page.getByText('投影前后的模型消息逐项相同。')).toBeVisible()
})

test('registers and removes a tool through the shared flow', async ({ page }) => {
  await page.goto('/#/learn/register-and-remove-tool')
  await page.getByRole('button', { name: '只更新当前注册表' }).click()
  await page.getByRole('button', { name: '挂载统计文本工具' }).click()
  await expect(page.getByText('目录出现“统计文本”，运行返回 12 个字符。')).toBeVisible()
  await page.getByRole('button', { name: '撤下统计文本工具' }).click()
  await expect(page.getByText('目录不再包含该工具，同一任务进入能力不可用分支。')).toBeVisible()
})

test('keeps the first task and action visible at 390px', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await expect(page.getByRole('heading', { name: '找出发布端口，并说明依据' })).toBeInViewport()
  await expect(page.getByRole('button', { name: '启动任务' })).toBeInViewport()
  const bodyWidth = await page.locator('body').evaluate(element => element.scrollWidth)
  expect(bodyWidth).toBe(390)
})

test('keeps every release viewport free of page overflow', async ({ page }) => {
  for (const viewport of [
    { width: 390, height: 844 },
    { width: 768, height: 1024 },
    { width: 1440, height: 900 },
  ]) {
    await page.setViewportSize(viewport)
    await page.reload()
    await expect(page.getByRole('heading', { name: '找出发布端口，并说明依据' })).toBeVisible()
    const dimensions = await page.locator('body').evaluate(element => ({
      clientWidth: element.clientWidth,
      scrollWidth: element.scrollWidth,
    }))
    expect(dimensions.scrollWidth).toBe(dimensions.clientWidth)
  }
})

test('remains usable at a 200 percent equivalent CSS viewport', async ({ page }) => {
  await page.setViewportSize({ width: 720, height: 450 })
  await expect(page.getByRole('heading', { name: '找出发布端口，并说明依据' })).toBeVisible()
  await page.getByRole('button', { name: '先读取工作区' }).click()
  await expect(page.getByRole('button', { name: '启动任务' })).toBeEnabled()
  const dimensions = await page.locator('body').evaluate(element => ({
    clientWidth: element.clientWidth,
    scrollWidth: element.scrollWidth,
  }))
  expect(dimensions.scrollWidth).toBe(dimensions.clientWidth)
})

test('preserves the complete learning result with reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.getByRole('button', { name: '先读取工作区' }).click()
  await page.getByRole('button', { name: '启动任务' }).click()
  await expect(page.getByText('发布端口是 4173，依据为 config.env；任务已停止。')).toBeVisible()
})

test('supports the keyboard path without serious accessibility violations', async ({ page }) => {
  await page.getByRole('button', { name: '先读取工作区' }).focus()
  await page.keyboard.press('Space')
  await page.getByRole('button', { name: '启动任务' }).focus()
  await page.keyboard.press('Enter')
  await expect(page.getByText('发布端口是 4173，依据为 config.env；任务已停止。')).toBeVisible()

  const results = await new AxeBuilder({ page }).analyze()
  expect(results.violations.filter(violation => violation.impact === 'serious' || violation.impact === 'critical')).toEqual([])
})

test('does not request remote runtime resources', async ({ page }) => {
  const requests: string[] = []
  page.on('request', request => requests.push(request.url()))
  await page.goto('/?network-check=1#/')
  expect(requests.length).toBeGreaterThan(0)
  expect(requests.every(url => new URL(url).hostname === '127.0.0.1')).toBe(true)
})

test('clears saved and in-memory progress together', async ({ page }) => {
  await page.getByRole('button', { name: '先读取工作区' }).click()
  await page.getByRole('button', { name: '启动任务' }).click()
  await expect(page.getByText('发布端口是 4173，依据为 config.env；任务已停止。')).toBeVisible()
  page.once('dialog', dialog => dialog.accept())
  await page.getByRole('button', { name: '清除全部进度' }).click()
  await expect(page.getByText('选择后再运行；预测不会影响演示结果。')).toBeVisible()
  await expect(page.getByRole('button', { name: '启动任务' })).toBeDisabled()
})
