import { z } from 'zod'

const baseline = '47f943859bef60e4160492346772ded9b24f765a'

const claimSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  statement: z.string().min(1),
  caveat: z.string().min(1),
  paths: z.array(z.object({
    path: z.string().min(1),
    symbol: z.string().min(1),
  })).min(1),
  reviewStatus: z.literal('approved'),
  baseline: z.literal(baseline),
})

export type Claim = z.infer<typeof claimSchema>

export const claims = z.array(claimSchema).parse([
  {
    id: 'dsh-agent-loop-tool-round-trip',
    title: '工具结果会回到下一次决定',
    statement: 'ReactLoopAgent 在完整 assistant message 中发现工具调用后执行它们，把调用和结果写入 Session；没有被结论型工具结束的结果会进入下一次模型请求。',
    caveat: '这不保证模型会正确选择工具或忠实使用结果；课程中的停止规则是确定性教学规则。',
    paths: [
      { path: 'packages/core/agent-loop/src/agent.ts', symbol: 'ReactLoopAgent.step' },
      { path: 'packages/core/agent-loop/src/tool-calls.ts', symbol: 'executeToolCalls' },
    ],
    reviewStatus: 'approved',
    baseline,
  },
  {
    id: 'dsh-tools-execute-waterfall',
    title: '单个工具执行经过 waterfall',
    statement: 'tools/execute 是 waterfall 事件；ToolRuntime 通过 ctx.waterfall 分派一个已经接受的工具执行。',
    caveat: 'waterfall 描述单个工具调用的监听器分派，不等于多个工具调用的并发策略。',
    paths: [{ path: 'packages/core/tools/src/index.ts', symbol: 'ToolRuntime.dispatchScheduledExecution' }],
    reviewStatus: 'approved',
    baseline,
  },
  {
    id: 'dsh-session-append-only-source',
    title: 'Session 日志保留交互事实',
    statement: 'Session 事件日志以追加方式记录交互；deriveMessages 沿当前有序 surface 投影消息，而不是直接返回全部事件。',
    caveat: '追加式描述日志；surface replace 可以让旧节点不再参与模型消息投影。',
    paths: [
      { path: 'packages/core/session/src/index.ts', symbol: 'Session.append' },
      { path: 'packages/core/session/src/index.ts', symbol: 'Session.deriveMessages' },
    ],
    reviewStatus: 'approved',
    baseline,
  },
  {
    id: 'dsh-session-surface-projection',
    title: '只有 surface 事件生成模型消息',
    statement: '固定提交中 user/message、assistant/message 和 tool/result 属于 SurfaceEventType；其他记录不会各自生成模型消息。',
    caveat: '空内容 assistant/message 也可能投影为 null；replace 的完整规则不在本课展开。',
    paths: [
      { path: 'packages/core/session/src/types.ts', symbol: 'SurfaceEventType' },
      { path: 'packages/core/session/src/surface.ts', symbol: 'deriveEventMessage' },
    ],
    reviewStatus: 'approved',
    baseline,
  },
  {
    id: 'dsh-tools-registration-visible',
    title: '当前注册决定工具可见性',
    statement: 'ToolRuntime.register 把通过校验的工具加入当前注册层；schemas 从当前可见工具生成模型侧 schema。',
    caveat: '可见性还受 scope、shadowing、呈现模式和注册校验影响；课程只演示一个全局工具。',
    paths: [
      { path: 'packages/core/tools/src/index.ts', symbol: 'ToolRuntime.register' },
      { path: 'packages/core/tools/src/index.ts', symbol: 'ToolRuntime.schemas' },
    ],
    reviewStatus: 'approved',
    baseline,
  },
  {
    id: 'dsh-tools-registration-disposer',
    title: '注册返回精确的撤销函数',
    statement: 'ToolRuntime.register 返回 ctx.effect 的 exact disposer；调用它会撤销该次工具注册。',
    caveat: 'disposer 只撤销它拥有的注册；真实释放还涉及 effect 次序、scope 生命周期和异步静止。',
    paths: [
      { path: 'packages/core/tools/src/index.ts', symbol: 'ToolRuntime.register' },
      { path: 'packages/core/scope/src/store.ts', symbol: 'ScopedLayers.effect' },
    ],
    reviewStatus: 'approved',
    baseline,
  },
])

export const claimsById = new Map(claims.map(claim => [claim.id, claim]))

export function sourceUrl(path: string): string {
  return `https://github.com/deepseek-ai/deepseek-harness/blob/${baseline}/${path}`
}

export const factBaseline = baseline
