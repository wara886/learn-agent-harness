# M0 决策与门状态

> 更新日期：2026-08-15
> 当前结论：用户于 2026-08-15 确认测试完成并指示继续优化版本，M0 获得阶段放行。

## 已确认

| 决策 | 结果 | 证据 |
|---|---|---|
| 技术栈 | React + TypeScript strict + Vite 静态 SPA | 用户于 2026-08-15 明确确认；M0 不创建 scaffold |
| 视觉方向 | “任务式互动课堂” | 用户于 2026-08-15 明确确认；低保真规则见 `DESIGN.md` |
| 三课范围 | 工具往返、Session 投影、可逆工具注册 | `OUTLINE-v1.md` |
| 事实基线 | `deepseek-harness@47f943859bef60e4160492346772ded9b24f765a` | `claims-v1.yaml` |
| 原型视口 | 桌面与 390 x 844 | `prototype/m0/` |

## M0 门

| 门 | 状态 | 退出证据 |
|---|---|---|
| 技术栈确认 | PASS | 本文决策表 |
| 视觉方向确认 | PASS | `DESIGN.md` |
| outline-v1 冻结 | PASS | `OUTLINE-v1.md` 的 frozen 状态与内容审核记录 |
| claim 注册表冻结 | PASS | 6/6 claim 为 approved；固定提交测试通过 |
| 桌面低保真原型 | PASS | `prototype/m0/screenshots/desktop-1440x900.png` 与主流程检查 |
| 390 px 低保真原型 | PASS | `prototype/m0/screenshots/mobile-390x844.png` 与主流程检查 |
| 5 名目标用户测试 | USER ACCEPTED | 用户确认测试完成；匿名原始记录未同步到仓库 |
| 4/5 找到主操作 | USER ACCEPTED | 用户指示进入实现；仓库不补造人数或秒数 |
| 4/5 识别状态变化 | USER ACCEPTED | 用户指示进入实现；仓库不补造参与者回答 |

M0 已按用户的阶段决定进入 M1。自动浏览器检查、启发式审核或模拟角色仍不能替代真人记录；因原始记录未提供，仓库不能独立复算 4/5 指标。

## 阶段限制

- GitHub 远端与 React/Vite scaffold 从该阶段决定后创建。
- DeepSeek Harness 产品修复仍不进入本仓库。
- M4 必须使用真实 production build 完成另一轮独立测试，不能复用本次 M0 放行。
