# Learn Agent Harness

从一次看得见的 Agent 任务出发，先获得直觉，再逐层理解 Pi 与 DeepSeek Harness 如何调用工具、记录过程和扩展能力。

当前 beta 包含五课 DSH 入门与五课 Pi 对照：工具结果、Session 消息、扩展能力、上下文压缩、Workflow 子 Agent、JSONL 会话分支和 Skills 资源发现。演示全部在浏览器本地确定性运行，不调用模型、不需要 API key，也不产生 API 费用。

在线体验：[https://wara886.github.io/learn-agent-harness/](https://wara886.github.io/learn-agent-harness/)

![桌面端任务式互动课堂](artifacts/screenshots/desktop-1440x900.png)

## 开发

```sh
pnpm install
pnpm dev
pnpm check
pnpm test:e2e
pnpm test:m4
```

Node.js 22+ 与 pnpm 11.19.0。

## 当前范围

- 十课共享一条新手学习链：学习目标、可交互心智模型、预测、运行、执行轨迹、源码拆解、架构联系、单变量实验与迁移检查。
- 桌面使用“框架 → 章节 → 课程”的左侧目录、正文与 ScrollSpy 本节导航三栏；移动端保留折叠目录并隐藏本节侧栏。
- 每课把教学最小实现按状态变化拆开，并链接到固定提交的 claim 证据页；架构地图同时展示课程层级与完成状态。
- 术语索引支持按普通语言解释搜索和框架筛选，并回链首次课程与固定提交源码证据。
- 问题语言搜索、当前位置面包屑、本地课程与阅读位置恢复、单课重置和全部清除。
- `390 x 844`、`768 x 1024`、`1440 x 900` 响应式路径。

当前是等待 M4 独立用户测试的公开 beta；自动化工程验证、Safari/VoiceOver 检查、GitHub Pages 部署与公网冷启动检查已经完成，真人可用性结果仍待收集。

## 事实基线

当前三课中的 DeepSeek Harness 产品事实固定到 `b150a551b8d465e31e418e1b2eaf5e79bbb7d28e`，三课 Pi 对照固定到 `earendil-works/pi@c49906ec77788625aacbdc53ebca6fbe65bd20f5`。教学状态机是概念演示，不是两个上游项目的 API，也不保证真实模型采取相同决策。

## 独立性

本项目是 clean-room 学习体验，与 DeepSeek Harness 产品仓库独立。内容方向参考 MIT 许可的 [onychen/learn-dsh](https://github.com/onychen/learn-dsh)，没有复制其站点代码、手写 Markdown renderer 或视觉资源。详见 `THIRD_PARTY_NOTICES.md`。

## License

MIT
