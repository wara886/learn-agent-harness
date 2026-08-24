# DSH 与 Pi 双轨十课实施状态

> 更新日期：2026-08-24
> 分支：`codex/advanced-four-lesson-slice`
> 当前阶段：双轨十课 beta 候选版本完成，M4 真人测试待执行

## 已交付

| 范围 | 实现 | 证据 |
|---|---|---|
| M1 基础 | React 19、TypeScript strict、Vite、HashRouter、Zod、Vitest、Playwright、Oxlint | `package.json`、`src/main.tsx`、质量命令 |
| 课程内容 | 5 个 DSH 课程、5 个 Pi 课程、8 个 DSH claims、5 个 Pi claims、双上游固定提交链接 | `src/domain/lessons.ts`、`src/domain/claims.ts` |
| 共享运行器 | 预测、运行、观察、实验、检查、失败重试、完成、非法迁移拒绝 | `src/domain/runner.ts` 与单元测试 |
| 第 01 课 | 工具往返、拒绝访问实验、文件不存在迁移题 | 浏览器 flow |
| 第 02 课 | 完整记录投影、`todo/write` 单变量实验、`turn/end` 迁移题 | 浏览器 flow |
| 第 03 课 | 工具注册、exact disposer 概念演示、撤销后恢复 | 浏览器 flow |
| Pi 第 01 课 | toolCall、ToolResultMessage、下一轮回答与停止条件 | 浏览器 flow |
| Pi 第 02 课 | AgentMessage、可选 transformContext、convertToLlm 与 Provider 消息 | 浏览器 flow |
| Pi 第 03 课 | Extension registerTool、Session 工具表刷新与 reload 重建 | 浏览器 flow |
| DSH 第 04 课 | 压缩检查点、surface replace、失败时保留持久 surface | 浏览器 flow |
| DSH 第 05 课 | Workflow agent()、子 Agent 成对结算、并行与依赖顺序 | 浏览器 flow |
| Pi 第 04 课 | JSONL 会话树、leaf、parentId 与无改写分支恢复 | 浏览器 flow |
| Pi 第 05 课 | ResourceLoader、项目 Skill、按需展开与 Pi package | 浏览器 flow |
| 检索与导航 | 桌面固定分轨目录、移动端折叠目录、当前位置面包屑、语义搜索链接、分轨课程地图、前后课关系 | CourseNavigation、AppHeader、MapPage |
| 进度 | 内容版本、本地恢复、运行中断稳定恢复、单课重置、全部清除、存储失败提示 | ProgressProvider、runner restore、E2E |
| 事实透明 | 默认折叠的最小实现、固定提交 claim 证据页、教学限定 | EvidencePage |
| 响应式与无障碍 | 三个目标视口、键盘主路径、文本状态、reduced motion、axe serious/critical 0 | Playwright、截图 |
| Safari 与 VoiceOver | Safari 可访问性树、VoiceOver 开关状态、预测控件与任务结果读取 | `research/accessibility-audit-2026-08-22.md` |
| M4 测试工具 | 固定主持人脚本、5 人匿名空白记录、可复算 PASS/FAIL 门禁 | `research/m4-usability-*`、`pnpm test:m4` |

## 当前验证

- TypeScript、Oxlint、16 个 Vitest 测试和 Vite production build 通过。
- Playwright 覆盖 DSH 五课与 Pi 五课主流程、完整桌面目录、移动目录切换、搜索、刷新恢复、清除、390 px 首屏、键盘、axe 和无远程资源请求。
- 21 个 Playwright 场景通过；十课的主操作均位于 `390 x 844` 首屏内。
- production build 首屏 JavaScript 为 `113.99 kB gzip`，低于 `180 KiB` 预算。
- 截图位于 `artifacts/screenshots/`。
- 事实 claim 的 DSH focused tests 在固定提交工作区通过：3 个测试文件，247 个测试。
- 前一发布 PR #6 的 GitHub Actions `check` 已通过；真实 production build GIF 已嵌入 PR。
- `main` 要求 PR、最新 `check`、线性历史和会话解决，并禁止强推与删除。
- DSH 基线已更新为 `b150a551b8`，Pi 基线固定为 `c49906ec77`；双上游审计记录位于 `research/upstream-baseline-audit-2026-08-22.md`。
- GitHub Actions run `32576245531` 的 `check` 与 `deploy` 均成功；Pages 地址为 `https://wara886.github.io/learn-agent-harness/`。
- 公网站点已通过首页冷启动、任务运行、刷新恢复、问题语言搜索跳转和固定源码外链检查。

## 尚未完成

- 使用合并后的 production build 完成 M4 的 5 人测试与观察记录。

真人 M4 完成前只称为“公开 beta”，不称为已验证产品或正式发布版本。
