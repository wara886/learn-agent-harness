# 三课纵向切片实施状态

> 更新日期：2026-08-15
> 分支：`codex/three-lesson-slice`
> 当前阶段：M1-M3 已实现，M4 工程验证进行中，M4 真人测试与 M5 Pages 未开始

## 已交付

| 范围 | 实现 | 证据 |
|---|---|---|
| M1 基础 | React 19、TypeScript strict、Vite、HashRouter、Zod、Vitest、Playwright、Oxlint | `package.json`、`src/main.tsx`、质量命令 |
| 课程内容 | 3 个 schema 校验课程、6 个 approved claims、固定 DSH 提交链接 | `src/domain/lessons.ts`、`src/domain/claims.ts` |
| 共享运行器 | 预测、运行、观察、实验、检查、失败重试、完成、非法迁移拒绝 | `src/domain/runner.ts` 与单元测试 |
| 第 01 课 | 工具往返、拒绝访问实验、文件不存在迁移题 | 浏览器 flow |
| 第 02 课 | 完整记录投影、`todo/write` 单变量实验、`turn/end` 迁移题 | 浏览器 flow |
| 第 03 课 | 工具注册、exact disposer 概念演示、撤销后恢复 | 浏览器 flow |
| 检索与导航 | 用户问题搜索、无结果入口、三课地图、前后课关系 | AppHeader、MapPage |
| 进度 | 内容版本、本地恢复、运行中断稳定恢复、单课重置、全部清除、存储失败提示 | ProgressProvider、runner restore、E2E |
| 事实透明 | 默认折叠的最小实现、固定提交 claim 证据页、教学限定 | EvidencePage |
| 响应式与无障碍 | 三个目标视口、键盘主路径、文本状态、reduced motion、axe serious/critical 0 | Playwright、截图 |

## 当前验证

- TypeScript、Oxlint、Vitest 和 Vite production build 通过。
- Playwright 覆盖三课主流程、搜索、刷新恢复、清除、390 px 首屏、键盘、axe 和无远程资源请求。
- production build 首屏 JavaScript 为 `103.20 kB gzip`，低于 `180 KiB` 预算。
- 截图位于 `artifacts/screenshots/`。
- 事实 claim 的 DSH focused tests 在固定提交工作区通过：3 个测试文件，247 个测试。

## 尚未完成

- M4 独立于 M0 的 5 人 production build 测试。
- VoiceOver 人工名称、顺序和状态播报记录。
- 真实构建 GIF 与 PR 审查。
- M4 通过后的 GitHub Pages 工作流和生产 URL 冷启动验证。

这些项目完成前只称为“可用原型”，不称为已验证产品或公开发布版本。
