# M0 三课内容冻结记录

> 冻结日期：2026-08-15
> 审核单位：一课完整学习闭环
> 基线：`deepseek-harness@47f943859bef60e4160492346772ded9b24f765a`

## 执行顺序

每课按“作者稿 -> 事实审核 -> 体验审核 -> 一次定点修订”执行。M0 只冻结 outline 和 claim，不生产完整课程正文。

| 课程 | 作者稿 | 事实审核 | 体验审核 | 一次修订 | 结论 |
|---|---|---|---|---|---|
| 01 让 Agent 先查再答 | `OUTLINE-v1.md` 初稿 | 两条 claim 与 agent-loop、tools 固定提交源码及测试一致 | 主操作先于术语；单变量只改工具结果 | 把失败分支明确为“缺少依据并停止”，避免把确定性规则写成模型保证 | FROZEN |
| 02 从记录还原它看到的内容 | `OUTLINE-v1.md` 初稿 | 两条 claim 与 Session surface 类型、投影实现及测试一致 | 完整记录和模型视图保持并列，先比较后命名术语 | 把 `todo/write` 明确为 log-only，补充空 assistant message 限定 | FROZEN |
| 03 加一项能力，再完整撤下 | `OUTLINE-v1.md` 初稿 | 两条 claim 与 ToolRuntime register、schemas、exact disposer 及测试一致 | 注册、可见、撤销使用同一稳定位置，撤销后要求观察恢复 | 把“撤销能力”限定为该注册拥有的 exact disposer | FROZEN |

## 事实审核结果

| Claim | 判定 | 核对位置 |
|---|---|---|
| `dsh-agent-loop-tool-round-trip` | ACCURATE WITH CAVEAT | `ReactLoopAgent.step`、`executeToolCalls`、round-trip test |
| `dsh-tools-execute-waterfall` | ACCURATE WITH CAVEAT | `Events['tools/execute']`、`dispatchScheduledExecution` |
| `dsh-session-append-only-source` | ACCURATE WITH CAVEAT | `Session.append`、`Session.deriveMessages`、surface test |
| `dsh-session-surface-projection` | ACCURATE WITH CAVEAT | `SurfaceEventType`、`deriveEventMessage`、log-only test |
| `dsh-tools-registration-visible` | ACCURATE WITH CAVEAT | `ToolRuntime.register`、`ToolRuntime.schemas`、tools test |
| `dsh-tools-registration-disposer` | ACCURATE WITH CAVEAT | `ScopedLayers.effect`、exact disposer 与 fiber dispose tests |

所有 caveat 已保留在 `claims-v1.yaml`，不会进入默认体验层并被省略成无条件产品保证。

## 体验审核结果

- 三课都只有一个用户问题、一个核心状态变化和一个机制。
- 三课都先呈现预测、动作和结果，再命名术语。
- 每课只改变一个变量，完成条件要求解释变化而不是完成点击。
- 第 01 课承担首次入口；第 02、03 课复用同一任务模板，不建立新的导航模式。
- 390 px 首屏保留任务、预期结果、预测和主操作，不把课程目录放在正文之前。

## 冻结边界

冻结内容包括 `sectionId`、用户问题、可见结果、唯一状态变化、唯一机制、单变量实验、完成检查、术语、claim、教学简化和篇幅预算。课程正文、生产视觉和真实 DSH 源码对照组件留到 M2-M3。
