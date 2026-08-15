const lessons = [
  {
    hash: 'lesson-01',
    title: '找出发布端口，并说明依据',
    outcome: '端口值、来源行和明确停止状态',
    time: '2 分钟',
    prediction: 'Agent 下一步应该直接回答，还是先读取工作区？',
    choices: ['直接回答', '先读取工作区'],
    preferredChoice: 1,
    action: '启动任务',
    trace: [
      ['只有请求', '“找出发布端口，并说明依据”；工作区事实尚未取得。'],
      ['取得工具结果', '读取 config.env，得到 APP_PORT=4173。'],
      ['形成结论并停止', '发布端口是 4173，依据为 config.env；任务已停止。'],
    ],
    changedTrace: [
      ['只有请求', '任务和回答规则保持不变。'],
      ['工具结果已改变', '读取 config.env 时返回“拒绝访问”。'],
      ['缺少依据并停止', '无法从现有结果确认发布端口；任务已停止。'],
    ],
    experiment: '把读取结果改为“拒绝访问”',
    reflection: '拒绝访问后，为什么最终回答不再包含 4173？',
    reflectionChoices: ['用户问题改变了', '工具结果改变了', 'Agent 必须无限重试'],
    reflectionAnswer: 1,
    feedback: '对。问题没有改变；可用依据改变后，结论也必须改变。',
  },
  {
    hash: 'lesson-02',
    title: '从记录还原模型看到的消息',
    outcome: '完整记录增加，模型视图保持不变',
    time: '3 分钟',
    prediction: '加入一条 todo/write 后，哪一边会增加？',
    choices: ['两边都会增加', '只有完整记录增加'],
    preferredChoice: 1,
    action: '生成模型视图',
    trace: [
      ['保留完整记录', '请求边界、用户消息、工具结果和结束边界都在记录中。'],
      ['生成模型视图', '只取能生成消息的有序 surface 节点。'],
      ['加入待办记录', '完整记录多一条 todo/write，模型消息列表保持不变。'],
    ],
    experiment: '加入一条 todo/write',
    reflection: '为什么模型视图没有跟着增加？',
    reflectionChoices: ['它只使用能投影成消息的记录', '记录没有真正保存', '模型自动删除了待办'],
    reflectionAnswer: 0,
    feedback: '对。完整记录用于回放；只有符合投影规则的节点进入模型消息。',
  },
  {
    hash: 'lesson-03',
    title: '加入一项能力，再完整撤下',
    outcome: '工具出现、运行成功、撤下后恢复',
    time: '3 分钟',
    prediction: '要让“统计文本”出现，必须修改主循环吗？',
    choices: ['必须修改主循环', '只更新当前注册表'],
    preferredChoice: 1,
    action: '挂载统计文本工具',
    secondAction: '撤下统计文本工具',
    trace: [
      ['尚未注册', '工具目录没有“统计文本”，同一任务显示能力不可用。'],
      ['注册并生效', '目录出现“统计文本”，运行返回 12 个字符。'],
      ['释放并恢复', '清理函数撤销该次注册，目录恢复初始状态。'],
    ],
    reflection: '为什么撤下工具不需要再次修改主循环？',
    reflectionChoices: ['主循环每次读取当前注册表', '工具仍隐藏在主循环中', '任务文本自动删除了工具'],
    reflectionAnswer: 0,
    feedback: '对。注册和撤销改变的是当前可见能力，主循环读取同一份注册表。',
  },
]

const elements = {
  lesson: document.querySelector('#lesson'),
  count: document.querySelector('#lesson-count'),
  mobileProgress: document.querySelector('#mobile-progress'),
  title: document.querySelector('#lesson-title'),
  outcome: document.querySelector('#lesson-outcome'),
  time: document.querySelector('#lesson-time'),
  prediction: document.querySelector('#prediction-question'),
  predictionOptions: document.querySelector('#prediction-options'),
  primaryAction: document.querySelector('#primary-action'),
  runState: document.querySelector('#run-state'),
  traceList: document.querySelector('#trace-list'),
  experimentRow: document.querySelector('#experiment-row'),
  reflectionSection: document.querySelector('#reflection-section'),
  reflectionQuestion: document.querySelector('#reflection-question'),
  reflectionOptions: document.querySelector('#reflection-options'),
  reflectionFeedback: document.querySelector('#reflection-feedback'),
}

const session = {
  participant: new URLSearchParams(window.location.search).get('participant') || 'unassigned',
  openedAt: Date.now(),
  lesson: 0,
  events: [],
}

let activeLesson = 0
let selectedPrediction = null
let runPhase = 0
let changedBranch = false
let timers = []

function record(type, detail = {}) {
  session.events.push({ type, atMs: Date.now() - session.openedAt, lesson: activeLesson + 1, ...detail })
  window.localStorage.setItem(`m0-session:${session.participant}`, JSON.stringify(session))
}

function clearTimers() {
  timers.forEach(window.clearTimeout)
  timers = []
}

function setTrace(items, visibleCount = 1, changed = false) {
  elements.traceList.replaceChildren()
  items.forEach(([label, detail], index) => {
    const item = document.createElement('li')
    const stateClass = index < visibleCount - 1 ? 'is-complete' : index === visibleCount - 1 ? 'is-current' : ''
    item.className = `trace-item ${stateClass}`
    if (changed && index >= 1 && index < visibleCount) item.classList.add('is-changed')

    const marker = document.createElement('span')
    marker.className = 'trace-marker'
    marker.textContent = String(index + 1)
    marker.setAttribute('aria-hidden', 'true')

    const heading = document.createElement('span')
    heading.className = 'trace-label'
    heading.textContent = label

    const body = document.createElement('span')
    body.className = 'trace-detail'
    body.textContent = index < visibleCount ? detail : '等待前一步完成'

    item.append(marker, heading, body)
    elements.traceList.append(item)
  })
}

function renderPrediction(lesson) {
  elements.predictionOptions.replaceChildren()
  lesson.choices.forEach((choice, index) => {
    const button = document.createElement('button')
    button.type = 'button'
    button.className = 'choice-button'
    button.textContent = choice
    button.setAttribute('aria-pressed', 'false')
    button.addEventListener('click', () => {
      selectedPrediction = index
      elements.predictionOptions.querySelectorAll('button').forEach((candidate, candidateIndex) => {
        const selected = candidateIndex === index
        candidate.classList.toggle('is-selected', selected)
        candidate.setAttribute('aria-pressed', String(selected))
      })
      record('prediction-selected', { value: choice, matchesExpected: index === lesson.preferredChoice })
    })
    elements.predictionOptions.append(button)
  })
}

function renderReflection(lesson) {
  elements.reflectionQuestion.textContent = lesson.reflection
  elements.reflectionOptions.replaceChildren()
  elements.reflectionFeedback.textContent = ''
  lesson.reflectionChoices.forEach((choice, index) => {
    const button = document.createElement('button')
    button.type = 'button'
    button.className = 'reflection-choice'
    button.textContent = choice
    button.addEventListener('click', () => {
      const correct = index === lesson.reflectionAnswer
      elements.reflectionOptions.querySelectorAll('button').forEach(candidate => {
        candidate.classList.remove('is-correct', 'is-incorrect')
      })
      button.classList.add(correct ? 'is-correct' : 'is-incorrect')
      elements.reflectionFeedback.textContent = correct
        ? lesson.feedback
        : '再比较操作前后的输入和可见状态。'
      record('reflection-answered', { value: choice, correct })
    })
    elements.reflectionOptions.append(button)
  })
}

function finishRun(lesson) {
  runPhase = 2
  elements.primaryAction.disabled = false

  if (activeLesson === 2) {
    elements.runState.textContent = '工具已生效'
    elements.runState.className = 'run-state is-running'
    elements.primaryAction.textContent = lesson.secondAction
    setTrace(lesson.trace, 2)
    elements.reflectionSection.hidden = true
    record('result-visible', { branch: 'registered' })
    return
  }

  if (activeLesson === 1) {
    elements.runState.textContent = '视图已生成'
    elements.runState.className = 'run-state is-running'
    elements.primaryAction.textContent = '模型视图已生成'
    elements.primaryAction.disabled = true
    setTrace(lesson.trace, 2)
    elements.reflectionSection.hidden = true

    const experimentButton = document.createElement('button')
    experimentButton.type = 'button'
    experimentButton.className = 'secondary-action'
    experimentButton.textContent = lesson.experiment
    experimentButton.addEventListener('click', () => {
      elements.runState.textContent = '对比已完成'
      elements.runState.className = 'run-state is-complete'
      setTrace(lesson.trace, 3, true)
      elements.experimentRow.hidden = true
      elements.reflectionSection.hidden = false
      record('experiment-changed', { value: 'todo/write' })
      record('result-visible', { branch: 'log-only-event-added' })
    })
    elements.experimentRow.replaceChildren(experimentButton)
    elements.experimentRow.hidden = false
    record('result-visible', { branch: 'projection-created' })
    return
  }

  elements.runState.textContent = '结果已出现'
  elements.runState.className = 'run-state is-complete'
  setTrace(changedBranch && lesson.changedTrace ? lesson.changedTrace : lesson.trace, 3, changedBranch)
  elements.reflectionSection.hidden = !changedBranch

  if (!changedBranch) {
    const experimentButton = document.createElement('button')
    experimentButton.type = 'button'
    experimentButton.className = 'secondary-action'
    experimentButton.textContent = lesson.experiment
    experimentButton.addEventListener('click', () => {
      changedBranch = true
      runPhase = 0
      elements.primaryAction.textContent = '重新运行同一任务'
      elements.runState.textContent = '输入已改变'
      elements.runState.className = 'run-state'
      setTrace(lesson.changedTrace, 1, true)
      elements.experimentRow.hidden = true
      elements.reflectionSection.hidden = true
      record('experiment-changed', { value: 'access-denied' })
      elements.primaryAction.focus()
    })
    elements.experimentRow.replaceChildren(experimentButton)
    elements.experimentRow.hidden = false
  }

  record('result-visible', { branch: changedBranch ? 'changed' : 'baseline' })
}

function runLesson() {
  const lesson = lessons[activeLesson]
  if (activeLesson === 2 && runPhase === 2) {
    runPhase = 3
    elements.runState.textContent = '已恢复初始状态'
    elements.runState.className = 'run-state is-complete'
    setTrace(lesson.trace, 3, true)
    elements.primaryAction.disabled = true
    elements.reflectionSection.hidden = false
    elements.reflectionSection.scrollIntoView({ block: 'nearest' })
    record('tool-unregistered')
    return
  }

  clearTimers()
  runPhase = 1
  elements.primaryAction.disabled = true
  elements.runState.textContent = '正在变化'
  elements.runState.className = 'run-state is-running'
  elements.experimentRow.hidden = true
  elements.reflectionSection.hidden = true
  const trace = changedBranch && lesson.changedTrace ? lesson.changedTrace : lesson.trace
  setTrace(trace, 1, changedBranch)
  record('primary-action', {
    label: elements.primaryAction.textContent,
    firstActionMs: activeLesson === 0 ? Date.now() - session.openedAt : undefined,
    predictionSelected: selectedPrediction !== null,
  })

  timers.push(window.setTimeout(() => setTrace(trace, 2, changedBranch), 280))
  timers.push(window.setTimeout(() => {
    finishRun(lesson)
  }, 680))
}

function renderLesson(index, focus = false) {
  clearTimers()
  activeLesson = index
  selectedPrediction = null
  runPhase = 0
  changedBranch = false
  const lesson = lessons[index]

  elements.count.textContent = `第 ${index + 1} 课，共 3 课`
  elements.mobileProgress.textContent = `第 ${index + 1} 课 / 3`
  elements.title.textContent = lesson.title
  elements.outcome.textContent = lesson.outcome
  elements.time.textContent = lesson.time
  elements.prediction.textContent = lesson.prediction
  elements.primaryAction.textContent = lesson.action
  elements.primaryAction.disabled = false
  elements.runState.textContent = '等待启动'
  elements.runState.className = 'run-state'
  elements.experimentRow.hidden = true
  elements.experimentRow.replaceChildren()
  elements.reflectionSection.hidden = true
  renderPrediction(lesson)
  renderReflection(lesson)
  setTrace(lesson.trace, 1)

  document.querySelectorAll('[data-lesson]').forEach(button => {
    const selected = Number(button.dataset.lesson) === index
    button.classList.toggle('is-active', selected)
    if (button.classList.contains('lesson-link')) button.setAttribute('aria-current', selected ? 'step' : 'false')
    if (button.classList.contains('mobile-tab')) button.setAttribute('aria-current', selected ? 'page' : 'false')
  })

  window.history.replaceState(null, '', `#${lesson.hash}`)
  record('lesson-opened')
  if (focus) elements.lesson.focus()
}

document.querySelectorAll('[data-lesson]').forEach(button => {
  button.addEventListener('click', () => renderLesson(Number(button.dataset.lesson), true))
})

elements.primaryAction.addEventListener('click', runLesson)

const hashIndex = lessons.findIndex(lesson => `#${lesson.hash}` === window.location.hash)
renderLesson(hashIndex >= 0 ? hashIndex : 0)

window.getM0Session = () => JSON.parse(JSON.stringify(session))
