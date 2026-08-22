# Pi 第一课内容审核记录

> 课程：`lesson-pi-01-tool-result-round-trip`
> 源码基线：`earendil-works/pi@c49906ec77788625aacbdc53ebca6fbe65bd20f5`
> 审核日期：2026-08-22

## 一问、一变、一机制

- 用户问题：工具执行完以后，为什么还要再进行一轮？
- 单一变量：`ToolResultMessage` 中的项目名称从 `learn-agent-harness` 改为 `sandbox-demo`。
- 可见变化：下一轮确定性回答随工具结果改变。
- 随后命名：Pi agent loop、toolCall、ToolResultMessage。

## 产品事实

课程只使用 `pi-agent-loop-tool-round-trip`。固定源码中的 `runLoop` 从 assistant message 收集 toolCall，`executeToolCalls` 产生 ToolResultMessage 并将结果加入上下文；存在工具调用或排队消息时循环继续。没有工具调用和排队消息时，低层循环返回当前上下文。

权威证据：

- `packages/agent/src/agent-loop.ts`：`runLoop`
- `packages/agent/src/agent-loop.ts`：`executeToolCalls`

## 教学限定

浏览器演示不调用 Provider。实验中的下一轮回答是确定性教学结果，不代表任意模型必然忠实采用工具内容。并行或顺序执行、steering、follow-up、extension hook、中止和错误分支留到后续课程。

## 审核结论

- 课程 claim 与 Pi 固定提交一致。
- 课程未借用 DSH disposer、SessionEvent 或 Cordis 语义解释 Pi。
- 主路径在术语前展示工具请求、结果消息和下一轮回答。
- 内容通过共享 schema、runner、进度与证据页，没有创建 Pi 专用状态机。
