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
    id: 'lesson-04-compaction-checkpoint',
    track: 'dsh',
    slug: 'compaction-checkpoint',
    navLabel: '压缩旧上下文',
    title: '保留结论，收起过长历史',
    question: '会话越来越长时，为什么不是直接删除旧消息？',
    outcome: '旧事件保留，模型 surface 改用摘要检查点',
    minutes: 8,
    mechanism: 'DSH compaction 的 surface replace',
    prediction: {
      prompt: '模型上下文接近容量时，哪种处理能兼顾可恢复性和后续请求？',
      options: [
        { id: 'delete', label: '从日志永久删除旧事件' },
        { id: 'checkpoint', label: '写入摘要检查点并替换 surface 区段' },
        { id: 'ignore', label: '继续发送全部历史' },
      ],
      preferredId: 'checkpoint',
    },
    runLabel: '生成压缩检查点',
    baselineVisibleSteps: 3,
    baselineTrace: [
      { label: '旧区段造成压力', detail: '模型 surface 包含 18 条较早消息和 2 条最近消息。', tone: 'request' },
      { label: '生成并记录摘要', detail: '压缩器记录 start、summary，并把较早区段归纳为检查点。', tone: 'action' },
      { label: '请求视图缩短', detail: '旧事件仍在日志；surface 使用 1 条摘要和 2 条最近消息。', tone: 'result' },
    ],
    experiment: {
      label: '把摘要生成改为失败',
      trace: [
        { label: '压力保持不变', detail: '同一段历史仍接近模型容量。', tone: 'request' },
        { label: '摘要没有落地', detail: '压缩尝试记录失败，没有提交 replace 检查点。', tone: 'change' },
        { label: '原 surface 保持', detail: '模型视图继续使用压缩前的持久 surface。', tone: 'result' },
      ],
    },
    checkpoint: {
      prompt: '压缩成功后，需要回放早期工具细节时应查看哪里？',
      options: [
        { id: 'log', label: '查看仍然保留的 Session 事件日志' },
        { id: 'summary-only', label: '只能依赖摘要中的一句话' },
        { id: 'provider', label: '向 Provider 索要旧请求' },
      ],
      answerId: 'log',
      success: '对。replace 改变模型 surface，不会把原事件从追加式日志中抹去。',
      retry: '回想第 02 课：完整日志和模型看到的 surface 是两个不同层次。',
    },
    explanation: 'DSH 在上下文压力下选择一段较早 surface，生成摘要检查点，再用 replace 让后续模型请求看到“摘要 + 最近消息”。原事件仍留在 Session 日志中。compaction 是压缩过程，checkpoint 是保留下来的背景摘要，surface replace 是改变模型视图而不删除日志的操作。',
    terms: [
      { term: 'compaction', definition: '把较早上下文归纳成更短检查点的过程。' },
      { term: 'checkpoint', definition: '承接已建立背景的摘要消息。' },
      { term: 'surface replace', definition: '用新节点替换模型视图中的一个有序区段。' },
    ],
    minimalCode: `append('compaction/start')\nconst summary = await summarize(region)\nappend('compaction/summary', summary)\nappend('user/message', checkpoint, {\n  surfaceOp: { op: 'replace', start, end },\n})\nappend('compaction/end')`,
    teachingLimit: '演示使用固定消息数和固定摘要，不复现 token 估算、模型策略、工具结果预剪枝、并发锁、取消或溢出重试。',
    searchTerms: ['上下文太长怎么办', '压缩会删除历史吗', '摘要检查点', 'compaction', 'surface replace', 'context window'],
    claimIds: ['dsh-compaction-surface-replacement'],
  },
  {
    id: 'lesson-05-workflow-subagents',
    track: 'dsh',
    slug: 'workflow-subagents',
    navLabel: 'Workflow 拆分任务',
    title: '让两个子 Agent 分头调查',
    question: '什么时候应该拆成子 Agent，而不是让主 Agent 一路做完？',
    outcome: '两个子任务各自结算，Workflow 再汇总结果',
    minutes: 9,
    mechanism: 'Workflow agent() 与子 Agent 生命周期',
    prediction: {
      prompt: '依赖审计和文档审计互不依赖，Workflow 应怎样安排？',
      options: [
        { id: 'parallel', label: '启动两个子 Agent，等待两者结算' },
        { id: 'duplicate', label: '让两个子 Agent 都做全部工作' },
        { id: 'silent', label: '启动后不收集结果' },
      ],
      preferredId: 'parallel',
    },
    runLabel: '运行双调查 Workflow',
    baselineVisibleSteps: 3,
    baselineTrace: [
      { label: 'Workflow 接收目标', detail: '发布检查需要依赖审计和文档审计两份独立结果。', tone: 'request' },
      { label: '两个 child 成对结算', detail: '每次 agent() 都产生 start/end；Workflow 等待两个结果。', tone: 'action' },
      { label: '汇总一次返回', detail: '脚本组合两份结果，workflow/end 报告本次运行已完成。', tone: 'result' },
    ],
    experiment: {
      label: '让文档审计返回失败',
      trace: [
        { label: '拆分方式不变', detail: '仍启动依赖审计和文档审计两个 child。', tone: 'request' },
        { label: '一个 child 失败', detail: '失败项以 null 进入普通组合分支，生命周期仍有对应 end。', tone: 'change' },
        { label: '汇总标出缺口', detail: '最终结果保留依赖审计，并明确文档审计未取得。', tone: 'result' },
      ],
    },
    checkpoint: {
      prompt: '第二项任务必须使用第一项输出时，应该怎样组织？',
      options: [
        { id: 'pipeline', label: '先完成第一项，再把结果交给第二项' },
        { id: 'parallel', label: '仍强制并行且忽略依赖' },
        { id: 'forget', label: '只运行第二项' },
      ],
      answerId: 'pipeline',
      success: '对。有数据依赖时应顺序推进；并行只用于真正互不依赖的工作。',
      retry: '先问第二项开始时是否已经需要第一项的结果。',
    },
    explanation: 'Workflow 脚本用 agent() 把一个明确任务交给具名子 Agent provider，并用生命周期事件观察开始与结算。互不依赖的任务可以并行等待；存在输入依赖时应顺序推进。Workflow 是可复现的编排脚本，subagent 是独立执行任务的 child，barrier 表示继续前必须等一组任务全部结算。',
    terms: [
      { term: 'Workflow', definition: '按明确步骤组织多个任务和结果的脚本。' },
      { term: 'subagent', definition: '通过具名 provider 启动、拥有独立运行结果的子 Agent。' },
      { term: 'barrier', definition: '等待一组并行任务全部结算后再继续的位置。' },
    ],
    minimalCode: `const [deps, docs] = await parallel([\n  () => agent('audit dependencies'),\n  () => agent('audit docs'),\n])\nreturn { deps, docs }`,
    teachingLimit: '演示固定两个 child 和文本结果，不复现 worker 隔离、资源上限、结构化 schema、provider/model override、取消或后台 continuable child。',
    searchTerms: ['什么时候用子 agent', '怎么并行调查', 'workflow 怎么汇总', 'subagent', 'parallel', 'pipeline'],
    claimIds: ['dsh-workflow-subagent-lifecycle'],
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
  {
    id: 'lesson-pi-02-agent-message-conversion',
    track: 'pi',
    slug: 'pi-agent-message-conversion',
    navLabel: '消息进入模型前',
    title: '让界面提示留在界面里',
    question: '为什么 Agent 记得一条消息，模型却不一定看到？',
    outcome: 'Agent 上下文保留提示，Provider 只收到可转换消息',
    minutes: 7,
    mechanism: 'AgentMessage 到 LLM Message 的转换',
    prediction: {
      prompt: '上下文里出现一条只给界面看的 status 消息，下一次请求应该怎样处理？',
      options: [
        { id: 'send-all', label: '原样发给 Provider' },
        { id: 'convert', label: '按规则转换或过滤' },
        { id: 'delete', label: '从 Agent 上下文删除' },
      ],
      preferredId: 'convert',
    },
    runLabel: '生成 Provider 消息',
    baselineVisibleSteps: 3,
    baselineTrace: [
      { label: 'Agent 上下文有两项', detail: '用户问题和 UI status 都保留为 AgentMessage。', tone: 'request' },
      { label: '执行消息转换', detail: 'convertToLlm 转换用户消息，并过滤 UI-only status。', tone: 'action' },
      { label: 'Provider 只收到一项', detail: '模型请求包含用户问题，不包含界面状态提示。', tone: 'result' },
    ],
    experiment: {
      label: '把 status 改为可转换说明',
      trace: [
        { label: 'Agent 上下文仍有两项', detail: '消息数量不变，第二项从 UI-only status 改为可转换说明。', tone: 'request' },
        { label: '转换规则产生消息', detail: 'convertToLlm 把第二项转换成 Provider 支持的 user message。', tone: 'change' },
        { label: 'Provider 收到两项', detail: '模型请求现在同时包含用户问题和补充说明。', tone: 'result' },
      ],
    },
    checkpoint: {
      prompt: '应用新增一种自定义 AgentMessage，但 Provider 不认识它，应该先做什么？',
      options: [
        { id: 'convert', label: '增加转换或过滤规则' },
        { id: 'cast', label: '强制当成任意 Message' },
        { id: 'send', label: '直接交给 Provider 猜测' },
      ],
      answerId: 'convert',
      success: '对。Agent 可以保存应用消息，但进入 Provider 前必须得到明确转换结果。',
      retry: '先区分 Agent 自己保存的消息，与 Provider API 接受的消息类型。',
    },
    explanation: 'Pi 的 Agent 上下文可以保留应用自定义消息，但 Provider 只接受它支持的消息。每次请求前，Pi 可以先整理上下文，再把保留下来的 AgentMessage 转成 LLM Message。AgentMessage 是 Agent 保存的消息，transformContext 负责可选的上下文整理，convertToLlm 负责最终转换或过滤。',
    terms: [
      { term: 'AgentMessage', definition: 'Agent 上下文保存的消息，可以包含应用自定义类型。' },
      { term: 'transformContext', definition: '模型调用前可选的上下文整理步骤。' },
      { term: 'convertToLlm', definition: '把 AgentMessage 转换或过滤成 Provider 支持消息的函数。' },
    ],
    minimalCode: `const transformed = await transformContext(messages)
const providerMessages = convertToLlm(transformed)
return provider.stream(providerMessages)`,
    teachingLimit: '演示使用两个固定消息和同步转换，不复现流式 Provider、图片内容、缓存、错误恢复或应用自定义联合类型；真实转换失败会中断低层循环。',
    searchTerms: ['模型为什么看不到消息', '自定义消息怎么发送', 'agent message', 'convert to llm', 'transform context'],
    claimIds: ['pi-agent-message-conversion'],
  },
  {
    id: 'lesson-pi-03-extension-tool-registration',
    track: 'pi',
    slug: 'pi-extension-tool-registration',
    navLabel: 'Extension 加载工具',
    title: '给 Pi 加一个工具，再完整撤下',
    question: '为什么移除 Extension 后还要 reload？',
    outcome: '工具加入当前会话，reload 后按新资源重新生成',
    minutes: 8,
    mechanism: 'Extension 工具注册与 Session reload',
    prediction: {
      prompt: 'Extension 调用 registerTool 后，新工具会写到哪里？',
      options: [
        { id: 'loop', label: '写进 agent loop 分支' },
        { id: 'table', label: '写入 Extension 工具表' },
        { id: 'provider', label: '永久写入 Provider' },
      ],
      preferredId: 'table',
    },
    runLabel: '加载统计工具 Extension',
    baselineVisibleSteps: 3,
    baselineTrace: [
      { label: '会话没有统计工具', detail: '当前 Session 工具表中没有 count_text。', tone: 'request' },
      { label: 'Extension 注册工具', detail: 'registerTool 写入当前 Extension，并刷新 Session 工具注册表。', tone: 'action' },
      { label: '工具对会话可见', detail: '当前 Session 可以选择并执行 count_text。', tone: 'result' },
    ],
    experiment: {
      label: '移除 Extension 并 reload',
      trace: [
        { label: '资源配置改变', detail: 'Extension 列表不再包含统计工具资源。', tone: 'request' },
        { label: '会话重新加载', detail: 'reload 使旧 runner 失效，并从当前资源重建工具表。', tone: 'change' },
        { label: '工具不再可见', detail: '重建后的 Session 工具表中没有 count_text。', tone: 'result' },
      ],
    },
    checkpoint: {
      prompt: '能否调用 registerTool 的返回值，像 DSH disposer 一样立刻撤销这次注册？',
      options: [
        { id: 'yes', label: '可以，返回值就是 disposer' },
        { id: 'reload', label: '不可以，应修改资源后 reload' },
        { id: 'restart', label: '只能重启整个操作系统' },
      ],
      answerId: 'reload',
      success: '对。Pi registerTool 返回 void；这条路径通过资源变化和 reload 重建工具表。',
      retry: '不要套用 DSH 的 exact disposer：这里的 registerTool 没有返回清理函数。',
    },
    explanation: 'Pi Extension 在加载时把工具定义写入自己的工具表，并让 Session 刷新当前可用工具。移除扩展资源后，reload 会让旧 runner 失效，再按现有资源重建工具表。Extension 是可加载的扩展单元，registerTool 把工具加入扩展表，reload 按当前资源重建会话能力。',
    terms: [
      { term: 'Extension', definition: '向 Pi coding agent 添加工具、命令或事件处理的扩展单元。' },
      { term: 'registerTool', definition: '把工具定义加入当前 Extension 工具表的方法。' },
      { term: 'reload', definition: '让旧 runner 失效，并按当前资源重建会话能力。' },
    ],
    minimalCode: `extension.registerTool(countText)
// Session 刷新后工具可见
await session.reload()
// 已移除的 Extension 工具不再进入新工具表`,
    teachingLimit: '演示使用内存资源列表和确定性 reload，不复现文件发现、Extension hooks、命令、主题、runner 中止等待或工具重名覆盖。',
    searchTerms: ['Pi 怎么加工具', 'extension 怎么卸载', 'reload 为什么重建', 'register tool', '工具为什么还在'],
    claimIds: ['pi-extension-tool-registration'],
  },
  {
    id: 'lesson-pi-04-session-tree',
    track: 'pi',
    slug: 'pi-session-tree',
    navLabel: '会话分支与恢复',
    title: '从旧节点尝试另一条方案',
    question: '回到较早消息后，Pi 为什么不需要复制整份会话？',
    outcome: '旧分支保留，新消息从选定 leaf 形成另一条路径',
    minutes: 8,
    mechanism: 'Pi JSONL session tree 与 leaf',
    prediction: {
      prompt: '选择旧消息 A，再输入新问题时，SessionManager 应怎样记录？',
      options: [
        { id: 'overwrite', label: '覆盖 A 后面的原消息' },
        { id: 'branch', label: '把 leaf 移到 A，并追加新的 child' },
        { id: 'copy', label: '复制整个 JSONL 文件才继续' },
      ],
      preferredId: 'branch',
    },
    runLabel: '创建另一条会话分支',
    baselineVisibleSteps: 3,
    baselineTrace: [
      { label: '原分支已经存在', detail: 'A → B → C 保存在同一份追加式 JSONL 中，leaf 位于 C。', tone: 'request' },
      { label: 'leaf 移回 A', detail: 'branch(A) 只改变当前位置，旧条目 B、C 保持不变。', tone: 'action' },
      { label: '追加新 child D', detail: 'D 的 parentId 指向 A；当前路径变为 A → D。', tone: 'result' },
    ],
    experiment: {
      label: '把 leaf 改回原分支 C',
      trace: [
        { label: '树结构保持不变', detail: 'A 下仍同时保留 B → C 和 D 两条路径。', tone: 'request' },
        { label: '当前位置改变', detail: 'leaf 从 D 切换回 C，没有重写任何 JSONL 条目。', tone: 'change' },
        { label: '恢复原上下文', detail: '从 C 向 parentId 回溯，得到 A → B → C。', tone: 'result' },
      ],
    },
    checkpoint: {
      prompt: '要构造当前模型上下文，应从哪里开始遍历？',
      options: [
        { id: 'leaf', label: '从当前 leaf 沿 parentId 回到根' },
        { id: 'file', label: '按文件行号把所有分支都发送' },
        { id: 'latest', label: '只取最后写入的一行' },
      ],
      answerId: 'leaf',
      success: '对。当前 leaf 决定活跃路径，其他分支继续保存在同一个 Session 文件里。',
      retry: '树里可以有多个末端，但当前上下文只跟随一个 leaf 的祖先路径。',
    },
    explanation: 'Pi 的每条 Session entry 都有 id 和 parentId，JSONL 因此既是追加记录也是一棵树。branch() 只把 leaf 移到旧节点，下一次 append 从那里长出新 child。leaf 是当前路径末端，parentId 指向父节点，branch 是切换当前位置而不是删除历史。',
    terms: [
      { term: 'JSONL', definition: '每行一个 JSON 对象的追加式文件格式。' },
      { term: 'leaf', definition: '当前会话路径所在的末端条目。' },
      { term: 'parentId', definition: '条目指向其父节点的标识。' },
    ],
    minimalCode: `session.branch(entryA)\nsession.appendMessage(newQuestion)\n// new entry.parentId === entryA\nconst context = session.buildSessionContext()`,
    teachingLimit: '演示只包含四个消息节点，不复现格式迁移、compaction、branch summary、label、custom entry 或跨文件分支。',
    searchTerms: ['怎么回到旧消息', 'Pi 会话怎么分支', '为什么不用复制文件', 'jsonl', 'parentId', 'leaf'],
    claimIds: ['pi-session-jsonl-tree'],
  },
  {
    id: 'lesson-pi-05-resource-skills',
    track: 'pi',
    slug: 'pi-resource-skills',
    navLabel: 'Packages 与 Skills',
    title: '让项目 Skill 只在需要时展开',
    question: 'Pi 怎样发现 Skill，又为什么不把全文一直塞进上下文？',
    outcome: '发现 Skill 描述，匹配任务后再读取完整说明',
    minutes: 8,
    mechanism: 'ResourceLoader 与 Skill progressive disclosure',
    prediction: {
      prompt: '项目里新增 `.pi/skills/release/SKILL.md` 后，Pi reload 应怎样处理？',
      options: [
        { id: 'full', label: '把所有 Skill 全文永久加入每次请求' },
        { id: 'discover', label: '先发现名称与描述，需要时再读取全文' },
        { id: 'execute', label: '安装后立即执行 Skill 脚本' },
      ],
      preferredId: 'discover',
    },
    runLabel: '重新加载项目资源',
    baselineVisibleSteps: 3,
    baselineTrace: [
      { label: '项目新增 Skill', detail: 'release/SKILL.md 含名称、描述、步骤和参考资料。', tone: 'request' },
      { label: 'ResourceLoader 发现资源', detail: 'reload 汇总项目、全局、settings、CLI 和 package 中启用的 Skills。', tone: 'action' },
      { label: '按需展开说明', detail: '系统提示只列名称与描述；发布任务匹配后再读取完整 SKILL.md。', tone: 'result' },
    ],
    experiment: {
      label: '把 Skill 描述改得含糊',
      trace: [
        { label: '文件位置保持不变', detail: 'Skill 仍位于同一个项目资源目录。', tone: 'request' },
        { label: '匹配信号变弱', detail: '描述只写“helpful”，没有说明适用任务。', tone: 'change' },
        { label: '加载时机不明确', detail: '资源仍可发现，但模型更难判断何时读取完整说明。', tone: 'result' },
      ],
    },
    checkpoint: {
      prompt: '团队要一起使用 Extension、Skill 和主题，最合适的分发单元是什么？',
      options: [
        { id: 'package', label: '用 Pi package 声明并分发这些资源' },
        { id: 'prompt', label: '把所有文件粘进一次用户消息' },
        { id: 'provider', label: '修改模型 Provider 的 API' },
      ],
      answerId: 'package',
      success: '对。Pi package 可以声明 Extensions、Skills、prompt templates 和 themes。',
      retry: '这里要分发的是一组 Agent 资源，不是一次请求，也不是模型协议。',
    },
    explanation: 'Pi 的 DefaultResourceLoader 从多个受控来源汇总资源。Skill 先以名称和描述进入可见目录，任务匹配后才读取完整 SKILL.md，这叫 progressive disclosure。Pi package 是可共享的一组扩展资源；Skill description 则决定 Agent 何时知道应该展开它。',
    terms: [
      { term: 'ResourceLoader', definition: '发现、过滤并加载 Pi 资源的统一入口。' },
      { term: 'Skill', definition: '按需读取的专业工作流、说明和配套资源。' },
      { term: 'Pi package', definition: '可声明并分发 Extensions、Skills、prompts 和 themes 的包。' },
    ],
    minimalCode: `await resources.reload()\nconst { skills } = resources.getSkills()\n// prompt lists name + description\n// matching task reads the full SKILL.md`,
    teachingLimit: '演示固定一个项目 Skill，不复现 git/npm 安装、项目信任、资源冲突、过滤规则、诊断或 Skill 内脚本权限。',
    searchTerms: ['Pi 怎么找 skill', 'skill 为什么按需加载', '怎么共享 extension', 'resource loader', 'pi package', 'progressive disclosure'],
    claimIds: ['pi-resource-loader-skills'],
  },
]

export const lessonTracks: ReadonlyArray<{ id: UpstreamId; shortLabel: string; label: string; description: string }> = [
  { id: 'dsh', shortLabel: 'DSH', label: 'DeepSeek Harness', description: '从工具、Session 和插件生命周期理解可扩展 Agent runtime。' },
  { id: 'pi', shortLabel: 'Pi', label: 'Pi Agent Harness', description: '从消息、工具闭环和 Extension 理解轻量 Agent harness。' },
]

export const lessons = z.array(lessonSchema).length(10).parse(lessonInput)
export const lessonsBySlug = new Map(lessons.map(lesson => [lesson.slug, lesson]))
export const lessonsByTrack: Record<UpstreamId, Lesson[]> = {
  dsh: lessons.filter(lesson => lesson.track === 'dsh'),
  pi: lessons.filter(lesson => lesson.track === 'pi'),
}

export function lessonPath(lesson: Lesson): string {
  return `/learn/${lesson.slug}`
}
