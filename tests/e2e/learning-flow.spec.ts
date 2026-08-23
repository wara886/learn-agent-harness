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
  await expect(page.getByLabel('已完成 1 课，共 6 课')).toBeVisible()
  await page.reload()
  await expect(page.getByLabel('已完成 1 课，共 6 课')).toBeVisible()
})

test('searches in problem language and runs the projection experiment', async ({ page }) => {
  const search = page.getByRole('searchbox', { name: '按问题搜索课程' })
  await search.fill('事件怎么变成消息')
  await page.getByRole('navigation', { name: '搜索结果' }).getByRole('link', { name: /聊天界面中的消息从哪里来/ }).click()
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

test('switches to Pi and completes the tool-result round trip', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  const directoryTrigger = page.getByRole('button', { name: /课程目录.*DSH/ })
  await directoryTrigger.click()
  await expect(directoryTrigger).toHaveAttribute('aria-expanded', 'true')
  await page.getByRole('navigation', { name: '课程目录' }).getByRole('link', { name: /结果回到下一轮/ }).click()
  await expect(page.getByRole('heading', { name: '让 Pi 读出项目名称，再回答' })).toBeVisible()
  const actionBox = await page.getByRole('button', { name: '运行 Pi 工具闭环' }).boundingBox()
  expect(actionBox).not.toBeNull()
  expect(actionBox!.y + actionBox!.height).toBeLessThanOrEqual(844)
  await page.getByRole('button', { name: '执行工具，再把结果放回上下文' }).click()
  await page.getByRole('button', { name: '运行 Pi 工具闭环' }).click()
  await expect(page.getByRole('heading', { name: '任务过程' })).toBeFocused()
  const traceHeadingBox = await page.getByRole('heading', { name: '任务过程' }).boundingBox()
  expect(traceHeadingBox).not.toBeNull()
  expect(traceHeadingBox!.y).toBeGreaterThanOrEqual(0)
  expect(traceHeadingBox!.y + traceHeadingBox!.height).toBeLessThanOrEqual(844)
  await expect(page.getByText('下一轮 assistant 根据结果回答项目名，随后循环停止。')).toBeVisible()
  await page.getByRole('button', { name: '把工具结果改为 sandbox-demo' }).click()
  await expect(page.getByText('确定性演示改为回答 sandbox-demo，随后循环停止。')).toBeVisible()
  await page.getByRole('button', { name: '返回当前上下文并停止' }).click()
  await expect(page.getByText('没有工具调用或排队消息时，这次低层循环已经完成。')).toBeVisible()
  await expect(page.getByLabel('已完成 1 课，共 6 课')).toBeVisible()
})

test('keeps an application-only Pi message out of the provider request', async ({ page }) => {
  await page.goto('/#/learn/pi-agent-message-conversion')
  await page.getByRole('button', { name: '按规则转换或过滤' }).click()
  await page.getByRole('button', { name: '生成 Provider 消息' }).click()
  await expect(page.getByText('模型请求包含用户问题，不包含界面状态提示。', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: '把 status 改为可转换说明' }).click()
  await expect(page.getByText('模型请求现在同时包含用户问题和补充说明。', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: '增加转换或过滤规则' }).click()
  await expect(page.getByText('对。Agent 可以保存应用消息，但进入 Provider 前必须得到明确转换结果。', { exact: true })).toBeVisible()
})

test('reloads a Pi session after removing an Extension tool', async ({ page }) => {
  await page.goto('/#/learn/pi-extension-tool-registration')
  await page.getByRole('button', { name: '写入 Extension 工具表' }).click()
  await page.getByRole('button', { name: '加载统计工具 Extension' }).click()
  await expect(page.getByText('当前 Session 可以选择并执行 count_text。', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: '移除 Extension 并 reload' }).click()
  await expect(page.getByText('重建后的 Session 工具表中没有 count_text。', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: '不可以，应修改资源后 reload' }).click()
  await expect(page.getByText('对。Pi registerTool 返回 void；这条路径通过资源变化和 reload 重建工具表。', { exact: true })).toBeVisible()
})

test('shows the complete course directory and current location on desktop', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  const directory = page.getByRole('navigation', { name: '课程目录' })
  await expect(directory).toBeVisible()
  await expect(directory.getByRole('link')).toHaveCount(6)
  await expect(directory.getByRole('link', { name: /先查再答/ })).toHaveAttribute('aria-current', 'page')
  await expect(page.getByRole('navigation', { name: '当前位置' })).toContainText('DeepSeek Harness')
})

test('keeps the first task and action visible at 390px', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await expect(page.getByRole('heading', { name: '找出发布端口，并说明依据' })).toBeInViewport()
  const action = page.getByRole('button', { name: '启动任务' })
  await expect(action).toBeInViewport()
  const actionBox = await action.boundingBox()
  expect(actionBox).not.toBeNull()
  expect(actionBox!.y + actionBox!.height).toBeLessThanOrEqual(844)
  const bodyWidth = await page.locator('body').evaluate(element => element.scrollWidth)
  expect(bodyWidth).toBe(390)
})

test('keeps every release viewport free of page overflow', async ({ page }) => {
  const routes = [
    '/#/',
    '/#/learn/pi-tool-result-round-trip',
    '/#/learn/pi-agent-message-conversion',
    '/#/learn/pi-extension-tool-registration',
    '/#/map',
  ]
  for (const viewport of [
    { width: 390, height: 844 },
    { width: 768, height: 1024 },
    { width: 1440, height: 900 },
  ]) {
    await page.setViewportSize(viewport)
    for (const route of routes) {
      await page.goto(route)
      await expect(page.locator('main')).toBeVisible()
      const dimensions = await page.locator('body').evaluate(element => ({
        clientWidth: element.clientWidth,
        scrollWidth: element.scrollWidth,
      }))
      expect(dimensions.scrollWidth).toBe(dimensions.clientWidth)
    }
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

test('keeps the current route when the skip link focuses lesson content', async ({ page }) => {
  await page.goto('/#/learn/pi-tool-result-round-trip')
  await page.keyboard.press('Tab')
  const skipLink = page.getByRole('link', { name: '跳到课程内容' })
  await expect(skipLink).toBeVisible()
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/#\/learn\/pi-tool-result-round-trip$/)
  await expect(page.locator('#main-content')).toBeFocused()
})

test('has no serious accessibility violations in initial navigation states', async ({ page }) => {
  async function expectNoSeriousViolations() {
    const results = await new AxeBuilder({ page }).analyze()
    expect(results.violations.filter(violation => violation.impact === 'serious' || violation.impact === 'critical')).toEqual([])
  }

  await expectNoSeriousViolations()
  await page.goto('/#/learn/pi-tool-result-round-trip')
  await expectNoSeriousViolations()
  await page.setViewportSize({ width: 390, height: 844 })
  await page.getByRole('button', { name: /课程目录.*Pi/ }).click()
  await expectNoSeriousViolations()
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
