# 双上游事实基线审计

> 审计日期：2026-08-22
> DeepSeek Harness：`b150a551b8d465e31e418e1b2eaf5e79bbb7d28e`
> Pi Agent Harness：`c49906ec77788625aacbdc53ebca6fbe65bd20f5`

## 结论

现有三课引用的 6 条 DeepSeek Harness 声明在新基线上仍成立。`agent-loop` 新增了取消流式响应时持久化已展示前缀的行为，但没有改变工具结果进入后续请求、Session surface 投影或工具注册 disposer 的课程结论。

Pi 对照课程已固定 3 条首批声明：工具调用与结果往返、`AgentMessage` 在模型调用前转换、Extension 工具注册与 reload 重建。它们尚未被当前三课使用，只为下一阶段 Pi 纵向切片提供已审核输入。

## DeepSeek Harness 复核

| Claim | 证据 | 结果 |
|---|---|---|
| `dsh-agent-loop-tool-round-trip` | `ReactLoopAgent.step`、`executeToolCalls` | 保持成立；新增 interrupted assistant 前缀限定 |
| `dsh-tools-execute-waterfall` | `ToolRuntime.dispatchScheduledExecution` | 保持成立 |
| `dsh-session-append-only-source` | `Session.append`、`Session.deriveMessages` | 保持成立 |
| `dsh-session-surface-projection` | `SurfaceEventType`、`deriveEventMessage` | 保持成立 |
| `dsh-tools-registration-visible` | `ToolRuntime.register`、`ToolRuntime.schemas` | 保持成立 |
| `dsh-tools-registration-disposer` | `ToolRuntime.register`、`ScopedLayers.effect` | 保持成立 |

## Pi Agent Harness 首批声明

| Claim | 证据 | 教学限定 |
|---|---|---|
| `pi-agent-loop-tool-round-trip` | `packages/agent/src/agent-loop.ts` 的 `runLoop`、`executeToolCalls` | 顺序/并行、hook、steering 与 follow-up 另行解释 |
| `pi-agent-message-conversion` | `AgentLoopConfig.convertToLlm`、`streamAssistantResponse` | 自定义消息必须转换或过滤 |
| `pi-extension-tool-registration` | `createExtensionAPI.registerTool`、`AgentSession._refreshToolRegistry/reload` | `registerTool` 返回 void；撤下依赖资源变化后 reload |

## 验证输入

- DeepSeek Harness 官方 `upstream/master` 与 GitHub API 返回同一提交 `b150a551b8`。
- Pi 官方仓库 `earendil-works/pi` 的 GitHub API 与稀疏检出返回同一提交 `c49906ec77`。
- 所有 claim 的路径与符号均在对应固定提交中重新定位；产品页面链接使用提交 URL，不跟随默认分支漂移。
