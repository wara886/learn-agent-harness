# Pi 三课内容审核记录

> 课程：`lesson-pi-01-tool-result-round-trip`、`lesson-pi-02-agent-message-conversion`、`lesson-pi-03-extension-tool-registration`
> 源码基线：`earendil-works/pi@c49906ec77788625aacbdc53ebca6fbe65bd20f5`
> 审核日期：2026-08-22

## 一问、一变、一机制

| 课程 | 用户问题 | 单一变量 | 可见变化 | 随后命名 |
|---|---|---|---|---|
| 01 工具结果闭环 | 工具执行完以后，为什么还要再进行一轮？ | `ToolResultMessage` 中的项目名称 | 下一轮回答随工具结果改变 | Pi agent loop、toolCall、ToolResultMessage |
| 02 消息转换 | 为什么 Agent 记得一条消息，模型却不一定看到？ | 第二项消息从 UI-only status 改为可转换说明 | Provider 消息从一项变为两项 | AgentMessage、transformContext、convertToLlm |
| 03 Extension 工具 | 为什么移除 Extension 后还要 reload？ | Extension 资源从存在改为移除 | reload 后的 Session 工具表不再包含工具 | Extension、registerTool、reload |

## 产品事实

第一课使用 `pi-agent-loop-tool-round-trip`。固定源码中的 `runLoop` 从 assistant message 收集 toolCall，`executeToolCalls` 产生 ToolResultMessage 并将结果加入上下文；存在工具调用或排队消息时循环继续。没有工具调用和排队消息时，低层循环返回当前上下文。

第二课使用 `pi-agent-message-conversion`。`streamAssistantResponse` 在模型调用前运行可选 `transformContext`，再调用 `convertToLlm`；应用自定义消息必须在这个步骤转换或过滤。

第三课使用 `pi-extension-tool-registration`。`ExtensionAPI.registerTool` 写入当前 extension 的工具表并刷新 Session 工具注册表；资源变化后的 `reload` 使旧 runner 失效并重建运行时工具表。`registerTool` 返回 void，不提供 DSH 风格的 exact disposer。

权威证据：

- `packages/agent/src/agent-loop.ts`：`runLoop`
- `packages/agent/src/agent-loop.ts`：`executeToolCalls`
- `packages/agent/src/types.ts`：`AgentLoopConfig.convertToLlm`
- `packages/agent/src/agent-loop.ts`：`streamAssistantResponse`
- `packages/coding-agent/src/core/extensions/loader.ts`：`createExtensionAPI.registerTool`
- `packages/coding-agent/src/core/agent-session.ts`：`AgentSession._refreshToolRegistry/reload`

## 教学限定

浏览器演示不调用 Provider。工具结果回答、消息转换和 reload 都是确定性教学结果，不代表任意模型必然忠实采用工具内容。课程不复现并行策略、steering、follow-up、Extension hook、资源发现、中止和错误分支。

## 审核结论

- 三条课程 claim 与 Pi 固定提交一致。
- 课程明确区分 Pi reload 与 DSH exact disposer，没有借用 SessionEvent 或 Cordis 语义解释 Pi。
- 主路径在术语前展示工具请求、结果消息和下一轮回答。
- 内容通过共享 schema、runner、进度与证据页，没有创建 Pi 专用状态机。
