import { z } from 'zod'

export const upstreams = {
  dsh: {
    label: 'DeepSeek Harness',
    repository: 'deepseek-ai/deepseek-harness',
    baseline: 'b150a551b8d465e31e418e1b2eaf5e79bbb7d28e',
  },
  pi: {
    label: 'Pi Agent Harness',
    repository: 'earendil-works/pi',
    baseline: 'c49906ec77788625aacbdc53ebca6fbe65bd20f5',
  },
} as const

export type UpstreamId = keyof typeof upstreams

const claimSchema = z.object({
  id: z.string().min(1),
  upstream: z.enum(['dsh', 'pi']),
  title: z.string().min(1),
  statement: z.string().min(1),
  caveat: z.string().min(1),
  paths: z.array(z.object({
    path: z.string().min(1),
    symbol: z.string().min(1),
  })).min(1),
  reviewStatus: z.literal('approved'),
})

type ClaimInput = z.infer<typeof claimSchema>
export type Claim = ClaimInput & { baseline: string }

const claimInputs = z.array(claimSchema).parse([
  {
    id: 'dsh-agent-loop-tool-round-trip',
    upstream: 'dsh',
    title: '工具结果会回到下一次决定',
    statement: 'ReactLoopAgent 在完整 assistant message 中发现工具调用后执行它们，把调用和结果写入 Session；没有被结论型工具结束的结果会进入下一次模型请求。',
    caveat: '这不保证模型会正确选择工具或忠实使用结果；课程中的停止规则是确定性教学规则。取消流式响应时，最新版还会把已经展示的前缀记录为 interrupted assistant message。',
    paths: [
      { path: 'packages/core/agent-loop/src/agent.ts', symbol: 'ReactLoopAgent.step' },
      { path: 'packages/core/agent-loop/src/tool-calls.ts', symbol: 'executeToolCalls' },
    ],
    reviewStatus: 'approved',
  },
  {
    id: 'dsh-tools-execute-waterfall',
    upstream: 'dsh',
    title: '单个工具执行经过 waterfall',
    statement: 'tools/execute 是 waterfall 事件；ToolRuntime 通过 ctx.waterfall 分派一个已经接受的工具执行。',
    caveat: 'waterfall 描述单个工具调用的监听器分派，不等于多个工具调用的并发策略。',
    paths: [{ path: 'packages/core/tools/src/index.ts', symbol: 'ToolRuntime.dispatchScheduledExecution' }],
    reviewStatus: 'approved',
  },
  {
    id: 'dsh-session-append-only-source',
    upstream: 'dsh',
    title: 'Session 日志保留交互事实',
    statement: 'Session 事件日志以追加方式记录交互；deriveMessages 沿当前有序 surface 投影消息，而不是直接返回全部事件。',
    caveat: '追加式描述日志；surface replace 可以让旧节点不再参与模型消息投影。',
    paths: [
      { path: 'packages/core/session/src/index.ts', symbol: 'Session.append' },
      { path: 'packages/core/session/src/index.ts', symbol: 'Session.deriveMessages' },
    ],
    reviewStatus: 'approved',
  },
  {
    id: 'dsh-session-surface-projection',
    upstream: 'dsh',
    title: '只有 surface 事件生成模型消息',
    statement: '固定提交中 user/message、assistant/message 和 tool/result 属于 SurfaceEventType；其他记录不会各自生成模型消息。',
    caveat: '空内容 assistant/message 也可能投影为 null；replace 的完整规则不在本课展开。',
    paths: [
      { path: 'packages/core/session/src/types.ts', symbol: 'SurfaceEventType' },
      { path: 'packages/core/session/src/surface.ts', symbol: 'deriveEventMessage' },
    ],
    reviewStatus: 'approved',
  },
  {
    id: 'dsh-tools-registration-visible',
    upstream: 'dsh',
    title: '当前注册决定工具可见性',
    statement: 'ToolRuntime.register 把通过校验的工具加入当前注册层；schemas 从当前可见工具生成模型侧 schema。',
    caveat: '可见性还受 scope、shadowing、呈现模式和注册校验影响；课程只演示一个全局工具。',
    paths: [
      { path: 'packages/core/tools/src/index.ts', symbol: 'ToolRuntime.register' },
      { path: 'packages/core/tools/src/index.ts', symbol: 'ToolRuntime.schemas' },
    ],
    reviewStatus: 'approved',
  },
  {
    id: 'dsh-tools-registration-disposer',
    upstream: 'dsh',
    title: '注册返回精确的撤销函数',
    statement: 'ToolRuntime.register 返回 ctx.effect 的 exact disposer；调用它会撤销该次工具注册。',
    caveat: 'disposer 只撤销它拥有的注册；真实释放还涉及 effect 次序、scope 生命周期和异步静止。',
    paths: [
      { path: 'packages/core/tools/src/index.ts', symbol: 'ToolRuntime.register' },
      { path: 'packages/core/scope/src/store.ts', symbol: 'ScopedLayers.effect' },
    ],
    reviewStatus: 'approved',
  },
  {
    id: 'dsh-compaction-surface-replacement',
    upstream: 'dsh',
    title: 'DSH 用摘要检查点替换旧 surface 区段',
    statement: 'BasicCompactionEngine 在压力或显式请求下压缩选定的旧 surface 区段，记录 compaction 生命周期与摘要，再追加带 replace 操作的检查点消息；旧事件仍保留在日志中。',
    caveat: '压缩依赖模型容量、策略、稳定 surface 和摘要成功；失败时可能保留原 surface 并记录失败。课程只演示一次成功的确定性替换。',
    paths: [
      { path: 'packages/compaction/compaction-basic/src/index.ts', symbol: 'BasicCompactionEngine' },
      { path: 'packages/compaction/compaction-basic/src/region.ts', symbol: 'compactSurfaceRegion' },
    ],
    reviewStatus: 'approved',
  },
  {
    id: 'dsh-workflow-subagent-lifecycle',
    upstream: 'dsh',
    title: 'Workflow 把 agent() 调用桥接到子 Agent',
    statement: 'Worker-thread workflow 的 agent() 调用由 host 桥接到具名 subagent provider；已发布的 child 以 workflow/agent-start 与 workflow/agent-end 成对记录，workflow/end 在整次运行结算时发出。',
    caveat: '子 Agent 失败、取消、并发上限和结构化输出都有独立分支；课程只演示两个独立调查任务和一次汇总，不代表所有任务都适合并行。',
    paths: [
      { path: 'packages/workflow/workflow-worker-thread/src/host.ts', symbol: 'WorkerRun.startChild' },
      { path: 'packages/workflow/workflow/src/index.ts', symbol: 'WorkflowEngine lifecycle events' },
    ],
    reviewStatus: 'approved',
  },
  {
    id: 'pi-agent-loop-tool-round-trip',
    upstream: 'pi',
    title: 'Pi 将工具结果追加到后续轮次',
    statement: 'Pi agent loop 从 assistant message 收集 toolCall，按配置顺序或并行执行，并把 ToolResultMessage 加入上下文；只要仍有工具调用或排队消息，循环就继续。',
    caveat: '顺序与并行模式、拦截 hook、终止提示、steering 和 follow-up 都会改变具体轮次路径。',
    paths: [
      { path: 'packages/agent/src/agent-loop.ts', symbol: 'runLoop' },
      { path: 'packages/agent/src/agent-loop.ts', symbol: 'executeToolCalls' },
    ],
    reviewStatus: 'approved',
  },
  {
    id: 'pi-agent-message-conversion',
    upstream: 'pi',
    title: 'Pi 在模型调用前转换 AgentMessage',
    statement: 'Pi 的 agent loop 保持 AgentMessage 上下文，只在每次模型调用前先运行可选 transformContext，再通过 convertToLlm 转成 Provider 可接受的 Message。',
    caveat: '应用自定义消息必须自行转换或过滤；转换函数失败会中断低层循环，不能把 UI-only 消息直接发送给 Provider。',
    paths: [
      { path: 'packages/agent/src/types.ts', symbol: 'AgentLoopConfig.convertToLlm' },
      { path: 'packages/agent/src/agent-loop.ts', symbol: 'streamAssistantResponse' },
    ],
    reviewStatus: 'approved',
  },
  {
    id: 'pi-extension-tool-registration',
    upstream: 'pi',
    title: 'Pi Extension 注册工具并由 reload 重建工具表',
    statement: 'ExtensionAPI.registerTool 把定义写入当前 extension 的工具表并刷新 Session 工具注册表；reload 会使旧 runner 失效、重新加载资源并重建运行时工具表。',
    caveat: 'Pi 的 registerTool 返回 void，不是 DSH 风格的 exact disposer；撤下扩展工具依赖资源配置变化后 reload，而不是调用注册返回的清理函数。',
    paths: [
      { path: 'packages/coding-agent/src/core/extensions/loader.ts', symbol: 'createExtensionAPI.registerTool' },
      { path: 'packages/coding-agent/src/core/agent-session.ts', symbol: 'AgentSession._refreshToolRegistry/reload' },
    ],
    reviewStatus: 'approved',
  },
  {
    id: 'pi-session-jsonl-tree',
    upstream: 'pi',
    title: 'Pi 用 JSONL 条目和 parentId 保存会话树',
    statement: 'SessionManager 把会话保存为追加式 JSONL；条目的 id/parentId 形成树，leaf 指向当前位置。branch() 移动 leaf，下一次 append 从该位置创建新分支，而不改写旧分支。',
    caveat: '课程不展开格式迁移、compaction entry、branch summary、custom entry 或损坏文件恢复；当前结论固定在 session format v3 的实现。',
    paths: [
      { path: 'packages/coding-agent/src/core/session-manager.ts', symbol: 'SessionManager' },
      { path: 'packages/coding-agent/docs/session-format.md', symbol: 'Tree Structure' },
    ],
    reviewStatus: 'approved',
  },
  {
    id: 'pi-resource-loader-skills',
    upstream: 'pi',
    title: 'Pi 从项目、全局目录和 Packages 发现 Skills',
    statement: 'DefaultResourceLoader 汇总启用的 skill 资源并调用 loadSkills；Skills 可以来自全局目录、项目目录、settings、CLI 或 Pi package，默认只把名称与描述放入上下文，完整 SKILL.md 按需读取。',
    caveat: '来源优先级、过滤、诊断和项目信任会改变最终资源集合；Skill 是提示与配套资源，不等于自动获得新的宿主权限。',
    paths: [
      { path: 'packages/coding-agent/src/core/resource-loader.ts', symbol: 'DefaultResourceLoader.reload/getSkills' },
      { path: 'packages/coding-agent/docs/skills.md', symbol: 'Skill Locations / How Skills Work' },
    ],
    reviewStatus: 'approved',
  },
])

export const claims: Claim[] = claimInputs.map(claim => ({
  ...claim,
  baseline: upstreams[claim.upstream].baseline,
}))

export const claimsById = new Map(claims.map(claim => [claim.id, claim]))

export function sourceUrl(claim: Claim, path: string): string {
  const upstream = upstreams[claim.upstream]
  return `https://github.com/${upstream.repository}/blob/${upstream.baseline}/${path}`
}

export const factBaseline = upstreams.dsh.baseline
export const piFactBaseline = upstreams.pi.baseline
