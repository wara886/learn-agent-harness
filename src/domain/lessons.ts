import { z } from 'zod'
import { claimsById, type UpstreamId } from './claims.ts'

const traceSchema = z.object({
  label: z.string().min(1),
  detail: z.string().min(1),
  tone: z.enum(['request', 'action', 'result', 'change']),
})

const optionSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
})

export const lessonSchema = z.object({
  id: z.string().min(1),
  track: z.enum(['dsh', 'pi']),
  slug: z.string().min(1),
  navLabel: z.string().min(1),
  title: z.string().min(1),
  question: z.string().min(1),
  outcome: z.string().min(1),
  minutes: z.number().int().positive(),
  mechanism: z.string().min(1),
  prediction: z.object({
    prompt: z.string().min(1),
    options: z.array(optionSchema).min(2).max(3),
    preferredId: z.string().min(1),
  }),
  runLabel: z.string().min(1),
  baselineVisibleSteps: z.number().int().min(2).max(3),
  baselineTrace: z.array(traceSchema).length(3),
  experiment: z.object({
    label: z.string().min(1),
    trace: z.array(traceSchema).length(3),
  }),
  checkpoint: z.object({
    prompt: z.string().min(1),
    options: z.array(optionSchema).min(2).max(3),
    answerId: z.string().min(1),
    success: z.string().min(1),
    retry: z.string().min(1),
  }),
  explanation: z.string().min(1),
  terms: z.array(z.object({ term: z.string(), definition: z.string() })).min(1).max(3),
  minimalCode: z.string().min(1),
  teachingLimit: z.string().min(1),
  searchTerms: z.array(z.string().min(1)).min(3),
  claimIds: z.array(z.string().min(1)).min(1).max(2),
}).superRefine((lesson, context) => {
  if (!lesson.prediction.options.some(option => option.id === lesson.prediction.preferredId)) {
    context.addIssue({ code: 'custom', path: ['prediction', 'preferredId'], message: 'Preferred prediction must exist' })
  }
  if (!lesson.checkpoint.options.some(option => option.id === lesson.checkpoint.answerId)) {
    context.addIssue({ code: 'custom', path: ['checkpoint', 'answerId'], message: 'Checkpoint answer must exist' })
  }
  for (const [index, claimId] of lesson.claimIds.entries()) {
    const claim = claimsById.get(claimId)
    if (claim === undefined) {
      context.addIssue({ code: 'custom', path: ['claimIds', index], message: `Unknown claim ${claimId}` })
    } else if (claim.upstream !== lesson.track) {
      context.addIssue({ code: 'custom', path: ['claimIds', index], message: `Claim ${claimId} belongs to ${claim.upstream}` })
    }
  }
})

export type Lesson = z.infer<typeof lessonSchema>

const lessonInput: Lesson[] = [
  {
    id: 'lesson-01-tool-first-answer',
    track: 'dsh',
    slug: 'first-tool-result',
    navLabel: '先查再答',
    title: '找出发布端口，并说明依据',
    question: 'Agent 为什么没有直接回答？',
    outcome: '端口值、来源行和明确停止状态',
    minutes: 6,
    mechanism: 'Agent loop 与工具调用往返',
    prediction: {
      prompt: '问题里没有端口值，Agent 下一步应该做什么？',
      options: [
        { id: 'answer', label: '直接猜一个端口' },
        { id: 'read', label: '先读取工作区' },
        { id: 'retry', label: '等待用户补充' },
      ],
      preferredId: 'read',
    },
    runLabel: '启动任务',
    baselineVisibleSteps: 3,
    baselineTrace: [
      { label: '只有请求', detail: '“找出发布端口，并说明依据”；工作区事实尚未取得。', tone: 'request' },
      { label: '取得工具结果', detail: '读取 config.env，得到 APP_PORT=4173。', tone: 'action' },
      { label: '形成结论并停止', detail: '发布端口是 4173，依据为 config.env；任务已停止。', tone: 'result' },
    ],
    experiment: {
      label: '把读取结果改为“拒绝访问”',
      trace: [
        { label: '请求保持不变', detail: '任务仍是找出发布端口并说明依据。', tone: 'request' },
        { label: '工具结果改变', detail: '读取 config.env 时返回“拒绝访问”。', tone: 'change' },
        { label: '缺少依据并停止', detail: '无法从现有结果确认发布端口；任务已停止。', tone: 'result' },
      ],
    },
    checkpoint: {
      prompt: '如果工具返回“文件不存在”，哪种结束方式最可靠？',
      options: [
        { id: 'invent', label: '沿用刚才的 4173' },
        { id: 'stop', label: '说明缺少依据并停止' },
        { id: 'loop', label: '无限重复读取' },
      ],
      answerId: 'stop',
      success: '你抓住了因果链：工具结果改变，最终结论也必须改变。',
      retry: '再比较工具实际返回的内容，答案不能沿用另一个分支的事实。',
    },
    explanation: '它不能只靠问题里的文字知道工作区端口，所以先去读；读到的内容回来后，它才决定怎样结束。这个反复判断“回答还是行动”的过程叫 Agent loop，请求外部能力执行动作叫 tool call。',
    terms: [
      { term: 'Agent loop', definition: '反复判断下一步是回答还是行动。' },
      { term: 'tool call', definition: '请求外部能力执行一个动作。' },
    ],
    minimalCode: `while (true) {\n  const message = await model(messages)\n  if (!message.toolCall) return message\n  const result = await tools.execute(message.toolCall)\n  messages.push(result)\n}`,
    teachingLimit: '演示用固定脚本代替真实模型，只保留一个只读工具和一次调用。“拒绝编造”来自课程规则，不是任意模型的产品保证。',
    searchTerms: ['为什么要调用工具', '它为什么先读文件', '工具结果改变答案', 'agent loop', 'tool call'],
    claimIds: ['dsh-agent-loop-tool-round-trip', 'dsh-tools-execute-waterfall'],
  },
  {
    id: 'lesson-02-log-to-model-view',
    track: 'dsh',
    slug: 'log-to-model-view',
    navLabel: '记录变消息',
    title: '从记录还原模型看到的消息',
    question: '聊天界面中的消息从哪里来？',
    outcome: '完整记录增加，模型视图保持不变',
    minutes: 8,
    mechanism: 'Session 事件到模型消息的投影',
    prediction: {
      prompt: '加入一条 todo/write 后，哪一边会增加？',
      options: [
        { id: 'both', label: '完整记录和模型视图都增加' },
        { id: 'log', label: '只有完整记录增加' },
      ],
      preferredId: 'log',
    },
    runLabel: '生成模型视图',
    baselineVisibleSteps: 2,
    baselineTrace: [
      { label: '保留完整记录', detail: '请求边界、用户消息、工具结果和结束边界都在记录中。', tone: 'request' },
      { label: '生成模型视图', detail: '只取能生成消息的有序 surface 节点。', tone: 'action' },
      { label: '等待一个变量', detail: '模型视图已经生成，尚未加入待办记录。', tone: 'result' },
    ],
    experiment: {
      label: '加入一条 todo/write',
      trace: [
        { label: '完整记录增加', detail: '末尾追加一条 todo/write，回放信息多一项。', tone: 'change' },
        { label: '投影规则不变', detail: 'todo/write 不属于当前消息 surface。', tone: 'action' },
        { label: '模型视图不变', detail: '投影前后的模型消息逐项相同。', tone: 'result' },
      ],
    },
    checkpoint: {
      prompt: '新增一条 turn/end 事件后，模型视图应该怎样变化？',
      options: [
        { id: 'message', label: '增加一条 assistant 消息' },
        { id: 'unchanged', label: '保持不变' },
        { id: 'clear', label: '清空全部消息' },
      ],
      answerId: 'unchanged',
      success: '对。它记录一次边界，但不会独立生成模型消息。',
      retry: '先区分“被保存”与“被投影成模型消息”，两者不是同一条件。',
    },
    explanation: '系统为了回放会记下很多过程，但下一次请求不需要把每条记录都当成聊天消息。它按固定规则取出需要的部分：一次追加保存的记录叫 SessionEvent，当前有序集合叫 surface，从记录得到消息的规则叫 projection。',
    terms: [
      { term: 'SessionEvent', definition: '一次被追加保存的过程记录。' },
      { term: 'surface', definition: '当前用于生成模型消息的有序事件集合。' },
      { term: 'projection', definition: '从记录得到模型消息的规则。' },
    ],
    minimalCode: `const messages = surface.nodes\n  .map(event => deriveEventMessage(event))\n  .filter(message => message !== null)`,
    teachingLimit: '演示使用短事件夹具，不模拟 seed、replace、compaction、事件版本或缓存；真实 DSH 的空 assistant message 还有额外限定。',
    searchTerms: ['它记住了什么', '事件怎么变成消息', '完整日志', 'session event', 'surface', 'projection'],
    claimIds: ['dsh-session-append-only-source', 'dsh-session-surface-projection'],
  },
  {
    id: 'lesson-03-register-and-remove-tool',
    track: 'dsh',
    slug: 'register-and-remove-tool',
    navLabel: '加入再撤下',
    title: '加入一项能力，再完整撤下',
    question: '为什么新增能力不需要修改主循环？',
    outcome: '工具出现、运行成功、撤下后恢复',
    minutes: 8,
    mechanism: '工具注册的 effect 生命周期',
    prediction: {
      prompt: '要让“统计文本”出现，必须修改主循环吗？',
      options: [
        { id: 'loop', label: '必须给主循环增加分支' },
        { id: 'registry', label: '只更新当前注册表' },
      ],
      preferredId: 'registry',
    },
    runLabel: '挂载统计文本工具',
    baselineVisibleSteps: 2,
    baselineTrace: [
      { label: '尚未注册', detail: '工具目录没有“统计文本”，同一任务显示能力不可用。', tone: 'request' },
      { label: '注册并生效', detail: '目录出现“统计文本”，运行返回 12 个字符。', tone: 'action' },
      { label: '等待清理动作', detail: '注册仍然存在，能力仍然可见。', tone: 'result' },
    ],
    experiment: {
      label: '撤下统计文本工具',
      trace: [
        { label: '注册曾经生效', detail: '工具目录曾包含“统计文本”。', tone: 'request' },
        { label: '执行清理函数', detail: 'disposer 撤销它拥有的那次注册。', tone: 'change' },
        { label: '恢复初始状态', detail: '目录不再包含该工具，同一任务进入能力不可用分支。', tone: 'result' },
      ],
    },
    checkpoint: {
      prompt: '撤下工具后再次运行，主循环应该看到什么？',
      options: [
        { id: 'hidden', label: '目录中没有该工具' },
        { id: 'cached', label: '仍然沿用上次工具' },
        { id: 'branch', label: '出现一个永久的新分支' },
      ],
      answerId: 'hidden',
      success: '对。注册和撤销改变当前可见能力，主循环本身没有新增分支。',
      retry: '观察释放后的工具目录：清理动作要恢复注册前的可见集合。',
    },
    explanation: '主循环每次读取当前可用能力，所以新增能力只需加入目录；加入时同时保存一条清理动作，撤下时按这条动作恢复。装载注册动作的单元叫 plugin，可追踪的注册叫 effect，执行后撤销注册的函数叫 disposer。',
    terms: [
      { term: 'plugin', definition: '把一组注册动作装入运行环境的单元。' },
      { term: 'effect', definition: '由运行环境跟踪、带清理动作的注册。' },
      { term: 'disposer', definition: '执行后撤销该次注册的函数。' },
    ],
    minimalCode: `const dispose = tools.register(countText)\n// 工具现在可见\ndispose()\n// 同一次注册已经撤销`,
    teachingLimit: '演示使用内存工具目录和同步按钮，不复现 Cordis 配置、scope、shadowing、重名校验或异步 fiber 静止。',
    searchTerms: ['怎么加工具', '插件怎么撤销', '为什么不用改主循环', 'plugin', 'effect', 'disposer'],
    claimIds: ['dsh-tools-registration-visible', 'dsh-tools-registration-disposer'],
  },
  {
    id: 'lesson-pi-01-tool-result-round-trip',
    track: 'pi',
    slug: 'pi-tool-result-round-trip',
    navLabel: '结果回到下一轮',
    title: '让 Pi 读出项目名称，再回答',
    question: '工具执行完以后，为什么还要再进行一轮？',
    outcome: '工具请求、结果消息和下一轮回答',
    minutes: 7,
    mechanism: 'Pi agent loop 的工具结果闭环',
    prediction: {
      prompt: 'assistant 发出 read toolCall 后，Pi 下一步应该做什么？',
      options: [
        { id: 'stop', label: '把工具调用当成最终答案' },
        { id: 'round-trip', label: '执行工具，再把结果放回上下文' },
        { id: 'discard', label: '执行工具，但丢弃结果' },
      ],
      preferredId: 'round-trip',
    },
    runLabel: '运行 Pi 工具闭环',
    baselineVisibleSteps: 3,
    baselineTrace: [
      { label: 'assistant 请求工具', detail: 'assistant 产生 read toolCall，请求读取 package.json。', tone: 'request' },
      { label: '追加工具结果', detail: 'Pi 执行 read，并把包含 learn-agent-harness 的 ToolResultMessage 加入上下文。', tone: 'action' },
      { label: '下一轮形成回答', detail: '下一轮 assistant 根据结果回答项目名，随后循环停止。', tone: 'result' },
    ],
    experiment: {
      label: '把工具结果改为 sandbox-demo',
      trace: [
        { label: '工具请求保持不变', detail: 'assistant 仍请求读取同一个 package.json。', tone: 'request' },
        { label: '结果消息改变', detail: 'ToolResultMessage 中的项目名称改为 sandbox-demo。', tone: 'change' },
        { label: '下一轮回答改变', detail: '确定性演示改为回答 sandbox-demo，随后循环停止。', tone: 'result' },
      ],
    },
    checkpoint: {
      prompt: 'assistant 已经给出普通文本回答，且没有工具调用或排队消息时，低层循环应该怎样做？',
      options: [
        { id: 'stop', label: '返回当前上下文并停止' },
        { id: 'repeat', label: '无条件再请求一次模型' },
        { id: 'delete', label: '删除刚才的回答' },
      ],
      answerId: 'stop',
      success: '对。没有工具调用或排队消息时，这次低层循环已经完成。',
      retry: '先观察循环继续的条件：工具调用和排队消息都不存在时，没有新的动作需要执行。',
    },
    explanation: 'Pi 不把 toolCall 当成任务结果。它先执行工具，把结果保存成 ToolResultMessage，再把更新后的上下文交给下一轮模型。这个来回过程属于 agent loop；ToolResultMessage 是工具执行后回到上下文的结果消息。',
    terms: [
      { term: 'Pi agent loop', definition: '在回答、工具执行和排队消息之间推进上下文的低层循环。' },
      { term: 'toolCall', definition: 'assistant 请求运行某个工具及其参数。' },
      { term: 'ToolResultMessage', definition: '工具执行后被追加到 Agent 上下文的结果消息。' },
    ],
    minimalCode: `while (true) {\n  const assistant = await streamAssistantResponse(context)\n  context.messages.push(assistant)\n  const calls = collectToolCalls(assistant)\n  if (calls.length === 0) return context\n  context.messages.push(...await executeToolCalls(calls))\n}`,
    teachingLimit: '演示使用固定输入和确定性下一轮回答，不调用真实 Provider，也不保证任意模型都会忠实采用工具结果。真实 Pi 还处理并行或顺序执行、steering、follow-up、hook 和中止信号。',
    searchTerms: ['Pi 怎么执行工具', '工具结果放在哪里', '为什么还要下一轮', 'tool result message', 'pi agent loop'],
    claimIds: ['pi-agent-loop-tool-round-trip'],
  },
]

export const lessonTracks: ReadonlyArray<{ id: UpstreamId; shortLabel: string; label: string; description: string }> = [
  { id: 'dsh', shortLabel: 'DSH', label: 'DeepSeek Harness', description: '从工具、Session 和插件生命周期理解可扩展 Agent runtime。' },
  { id: 'pi', shortLabel: 'Pi', label: 'Pi Agent Harness', description: '从消息、工具闭环和 Extension 理解轻量 Agent harness。' },
]

export const lessons = z.array(lessonSchema).length(4).parse(lessonInput)
export const lessonsBySlug = new Map(lessons.map(lesson => [lesson.slug, lesson]))
export const lessonsByTrack: Record<UpstreamId, Lesson[]> = {
  dsh: lessons.filter(lesson => lesson.track === 'dsh'),
  pi: lessons.filter(lesson => lesson.track === 'pi'),
}

export function lessonPath(lesson: Lesson): string {
  return `/learn/${lesson.slug}`
}
