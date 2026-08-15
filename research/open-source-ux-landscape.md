# DeepSeek Harness 开源体验增强调研

> 数据日期：2026-08-14（Asia/Shanghai）  
> DSH 基线：[`47f943859bef60e4160492346772ded9b24f765a`](https://github.com/deepseek-ai/deepseek-harness/tree/47f943859bef60e4160492346772ded9b24f765a)  
> 研究范围：模型与成本可见性、预算熔断、subagent 并发和递归控制、长会话渲染、回答和产物组织、文件跳转、桌面壳、工具调用展示、日志与可观测性。

## 结论

不建议把另一个 Agent 框架或整套聊天前端嵌入 DSH。当前 DSH 已有完整的 session log、projection、Conversation Node、tool presentation、subagent lifecycle、Web BFF 和插件组合机制。替换这些核心只会形成两套状态和生命周期。

推荐前三项如下：

1. **[models.dev](https://github.com/anomalyco/models.dev)**：作为价格和模型能力数据源，在 DSH 内新增独立的 `sessionCost` projection。它能用最小架构改动补齐用户最直接感知的“这次、这个会话、这个子 Agent 花了多少钱”。
2. **[TanStack Virtual](https://github.com/TanStack/virtual)**：先用长会话基准确认主线程 DOM/布局是主要瓶颈；若确认，再复用仓内已经用于 Trajectory 的依赖，把普通 Chat 主流做成动态高度虚拟列表，而不改变 DSH 的业务模型。
3. **[LiteLLM](https://github.com/BerriAI/litellm)**：仅作为部署侧 OpenAI-compatible gateway POC，验证硬预算和速率熔断。它是快速止损层，不是产品内直接依赖，也不替代 DSH 自己必须补的树级 subagent 并发、总数和 token/金额预算。

建议实施顺序不是照搬上述编号：先做 DSH 原生树级熔断，再并行接 `models.dev` 成本投影；随后复现长会话卡顿并采集浏览器主线程、DOM 数量、布局和内存基准，只有数据确认渲染瓶颈后才做 Chat 虚拟化；LiteLLM 以独立 POC 验证 DeepSeek V4 thinking、tool calls、cache usage 和重试语义，再决定是否成为可选部署组件。

## 先确认 DSH 已经有什么

以下事实决定了哪些开源项目值得接，哪些只会重复建设。

| 关注点 | 当前 DSH 能力 | 真实缺口 |
|---|---|---|
| Token 与模型可见性 | [`tokenUsage`](https://github.com/deepseek-ai/deepseek-harness/blob/47f943859bef60e4160492346772ded9b24f765a/packages/llm/token-meter/README.md) 已按 input/output/cache read/cache write 折叠完整日志；主会话 StatsLine 和 subagent tree 都展示 token | 没有 provider/model 价格目录、USD 成本投影、预算余额和费用熔断 |
| Subagent 递归 | [`tool-subagent`](https://github.com/deepseek-ai/deepseek-harness/blob/47f943859bef60e4160492346772ded9b24f765a/packages/subagent/tool-subagent/README.md) 默认 `maxDepth: 3`，深度写入 session header 并在恢复后继续生效 | 没有整棵委派树共享的并发上限、累计 child 数、step/token/金额上限；外部 provider 可设 `provider-managed` 而绕开本地深度管理 |
| 工具并发 | Agent loop 的 [`maxParallelToolCalls`](https://github.com/deepseek-ai/deepseek-harness/blob/47f943859bef60e4160492346772ded9b24f765a/packages/core/agent-loop/src/constants.ts) 默认是 10，单个 step 使用 rolling pool | 上限是“每 Agent、每 step”，不是跨 descendants 的全局容量。深度 3 仍可能形成很宽的树 |
| Workflow 预算 | [`workflow-worker-thread`](https://github.com/deepseek-ai/deepseek-harness/blob/47f943859bef60e4160492346772ded9b24f765a/packages/workflow/workflow-worker-thread/README.md) 已有 FIFO concurrency slot、`maxConcurrentAgents` 和 `maxTotalAgents` | 这些限制只约束 workflow run，普通 `subagent`/`send_message` 路径不共享该预算 |
| 长轨迹 | [`ui-trajectory`](https://github.com/deepseek-ai/deepseek-harness/blob/47f943859bef60e4160492346772ded9b24f765a/packages/client/ui-trajectory/package.json) 已依赖 `@tanstack/react-virtual@^3.14.9`，Trajectory table 已虚拟化和分页 | 普通 [`ChatView`](https://github.com/deepseek-ai/deepseek-harness/blob/47f943859bef60e4160492346772ded9b24f765a/packages/client/ui-conversation/src/client/chat/ChatView.tsx) 仍对全部 `order` 执行 `.map()`，长会话 DOM 会持续增长 |
| 工具和产物展示 | Conversation Node registry、tool render intent、diff/terminal/read/search cards、Produced Files 和 inline file mention 已存在 | 不需要换前端框架；应继续改善默认折叠、信息密度和结果摘要 |
| 文件跳转 | [`FileLocation`](https://github.com/deepseek-ai/deepseek-harness/blob/47f943859bef60e4160492346772ded9b24f765a/packages/core/tools/src/presentation.ts) 已有 `path` 和可选 `line`；工具行能调用 Host opener | [`host.openPath`](https://github.com/deepseek-ai/deepseek-harness/blob/47f943859bef60e4160492346772ded9b24f765a/packages/host/apiproxy/src/api/host.ts) 只传 `path`，把 line 丢掉；普通回答只链接本轮已确认产物，不解析任意路径位置 |
| 可观测性 | [`session-telemetry-otel`](https://github.com/deepseek-ai/deepseek-harness/blob/47f943859bef60e4160492346772ded9b24f765a/packages/session/session-telemetry-otel/README.md) 可发 OTLP/HTTP logs | 当前导出是 log record，不是 GenAI trace/span；没有内置 redaction，完整消息、工具参数和结果默认都可能离机 |
| ACP/编辑器 | DSH 有 ACP server | [`dsh-acp`](https://github.com/deepseek-ai/deepseek-harness/blob/47f943859bef60e4160492346772ded9b24f765a/packages/acp/acp/README.md) 明确是 automation-only，不传 reasoning、tool activity、plans、usage、历史恢复或编辑器能力 |

## 分级一：可以直接接入（LiteLLM 仅作为部署侧 POC）

### 1. models.dev：价格目录和成本投影

**社区状态**：6,383 stars，MIT，未归档，最近 push 为 2026-08-14。仓库提供开源的模型规格、价格和能力数据，并公开 [`api.json`](https://models.dev/api.json)。价格字段包括 input、output、reasoning、cache read 和 cache write，单位为 USD/百万 token。当前数据中已经有 `deepseek-v4-flash` 和 `deepseek-v4-pro`，与 DSH 默认模型 id 一致。

**接入点**：

- 新建独立的 session projection 插件，折叠 `request/header` 的 provider/model 路由和每一步最终 usage，产出 `sessionCost`。不要把价格计算塞进现有 `token-meter`，后者的职责是 token 和上下文压力。
- 把 DSH provider `deepseek-official` 显式映射到 models.dev provider `deepseek`。未知映射必须显示“价格未知”，不能按 0 元处理。
- UI 在 StatsLine、subagent catalog 和 session list 上消费同一个 durable projection。金额旁显示价格快照日期，避免把估算值伪装成账单。
- 构建时固定一份经过校验的 JSON 快照并记录源 commit/date。不要在每次启动时请求在线 API，否则历史会话会因价格更新而重算成不同金额。
- 私有协议价、赠送额度和订阅套餐通过部署配置覆盖；Models.dev 只能给公开目录价。

**改造量**：中，约 4 至 7 个工程日，包括 projection、映射配置、缓存价格、Web 展示、未知价格状态、单元测试和 keyless snapshot。

**主要风险**：价格会变；provider alias 可能误配；缓存和 reasoning bucket 必须保持互斥；公开目录价不是 provider 最终账单。应把结果命名为“估算成本”，并允许部署覆盖。

### 2. TanStack Virtual：普通 Chat 主流虚拟化

**社区状态**：7,064 stars，MIT，未归档，最近 push 为 2026-08-09。官方提供 React 动态高度列表和专门的 chat/reverse-feed 指引。DSH 已经安装并使用它，因此不会新增供应链和框架层。

当前审计只确认 ChatView 会让 DOM 随会话增长，没有浏览器 performance trace 能证明它是用户所述卡顿的主因。以下接入建议以可重复的长会话基准确认 DOM、布局或内存是主要瓶颈为前提；若瓶颈在 projection、状态更新或 Markdown 渲染，应先修对应路径。

**接入点**：

- 在 `ui-conversation/ChatView` 复用 `ui-trajectory` 的 `useVirtualizer`、稳定 key、测量和分页经验。
- 虚拟项以 Conversation Node 为单位，streaming tail、running tool tree 和 pending steering 继续保持稳定 React identity。
- 只在超过阈值后启用虚拟化，短会话保持当前普通流布局，减少可访问性和浏览器查找行为变化。
- 必须保留现有四类滚动语义：首次打开到底部、读者离底后不抢滚动、旧页 prepend 后锚点不变、expanded tool/streaming resize 时 pinned reader 继续跟随。

**改造量**：中，约 5 至 8 个工程日。DOM 改动本身不大，主要成本在动态高度、prepend、流式更新、键盘焦点和真实浏览器回归。

**主要风险**：估计高度误差会导致滚动跳动；虚拟化会影响浏览器原生页面查找和读屏连续性；tool disclosure 展开后必须重新测量。需要 macOS/Windows 主浏览器的长会话基准和 Playwright 截图/GIF。

### 3. LiteLLM：部署侧 POC，不作为产品内直接依赖

**社区状态**：56,306 stars，活跃开发，最近 push 为 2026-08-14。仓库主体为 MIT，`enterprise/` 目录使用单独许可证。官方 Proxy 提供 OpenAI-compatible endpoint、spend tracking、rate limiting 和 budget 管理，并声明支持 DeepSeek chat completions。

**接入点**：

- 配置 DSH `llm-deepseek.baseURL` 为 LiteLLM 的 `/v1` 基址；DSH 会继续请求 `/chat/completions`。将 LiteLLM virtual key 放进现有 credential reference，不在 `cordis.yml` 写密钥。
- 用 LiteLLM model alias 保留 DSH 当前的 `deepseek-v4-flash`/`deepseek-v4-pro` wire id，避免 UI、session header 和历史恢复发生模型名漂移。
- POC 阶段先用一个 project key 做整个部署的硬金额上限和 RPM/TPM 上限。要做到 per-user/per-session/per-subagent 归因，需要验证或新增 metadata 传递，不能假定 DSH 的自定义 `x-deepseek-harness-*` header 会自动成为 LiteLLM 费用维度。
- Gateway 只做外部账单熔断。DSH 仍要有本地树级容量，因为达到金额上限后才拒绝请求已经太晚，且并发 child、工具和本地资源仍会继续消耗。

**改造量**：POC 小，约 1 至 2 日；生产化中到大，约 1 至 2 周，包含 PostgreSQL、密钥生命周期、部署、监控和协议回归。

**主要风险**：增加 Python/PostgreSQL 运维面；DSH 和 LiteLLM 双重 retry/fallback 可能放大请求；DeepSeek V4 的 `reasoning_content`、tool-call thinking passback、usage/cache 字段需要真实 API 回归；该项目安全公告数量较多，生产必须固定已修复版本并跟踪 [GitHub Advisories](https://github.com/BerriAI/litellm/security/advisories)。

### 4. SigNoz：现有 OTel logs 的可查询界面

**社区状态**：31,839 stars，未归档，最近 push 为 2026-08-14。主体源码 MIT，`ee/` 和 `cmd/enterprise/` 使用单独许可证。SigNoz 是 OpenTelemetry-native 平台，官方 self-host 文档明确接受 OTLP/HTTP `/v1/logs`。

**接入点**：现有 `session-telemetry-otel` 的 exporter URL 可直接指向 SigNoz collector。这样无需产品代码就能先查询 session、event type、错误和耗时记录。

**改造量**：原始 logs 接入小，约 1 日；要获得 LLM trace、generation、token/cost dashboard，需要新增 span/metric backend 或 collector transform，约 1 至 2 周。

**主要风险**：DSH 当前默认不做 redaction，直接开启 FULL 会上传完整对话和工具内容。上线前必须先实现并测试 `sessionTelemetry/record` redaction policy。SigNoz 的 LLM 页面以 GenAI traces 为主，不能把“logs 已收到”等同于“LLM dashboard 已可用”。

## 分级二：需要适配后再用

### launch-editor：把 path-only 补成 path:line:column

[vitejs/launch-editor](https://github.com/vitejs/launch-editor) 有 721 stars，MIT，最近 push 为 2026-08-09。它不是高 star 平台，但功能很窄且成熟：Node 侧打开 `filename:line:column`，支持 VS Code、Cursor、Zed 和主要 JetBrains IDE，也处理了 Windows UNC 风险。

DSH 已经拥有 `FileLocation.line`，正确改法是把 Host RPC 扩成结构化 `{path, line?, column?}`，再由可配置 opener 消费。可评估复用 launch-editor 的 editor detection 和参数映射，不建议直接暴露它的 HTTP middleware。当前 native opener 对浏览器文档、macOS text editor、WSL 和无桌面 Linux 有 DSH 特有语义，不能整段替换。

**改造量**：小到中，约 3 至 5 日。需要 wire schema、tool UI、Produced Files、Host opener、Windows/WSL tests 一起更新。

### Langfuse：丰富 LLM 观测，但不能直连当前 logs exporter

[Langfuse](https://github.com/langfuse/langfuse) 有 33,083 stars，最近 push 为 2026-08-14；主体源码 MIT，`ee/` 等目录是单独许可证。它能展示 generation、model、usage、cost、latency、trace 和评估，官方推荐通过 OTLP **traces** 摄取。

当前 DSH 发的是 OTLP **logs**，所以仅修改 exporter URL 不是有效集成。需要一个新的 telemetry provider，把 session/turn/step/model/tool 生命周期投影成父子 spans，并按 Langfuse generation 约定附上 model 和互斥 usage buckets。适配完成后，它比通用 logs 更适合调试某个 subagent 为什么贵、慢或失败。

**改造量**：中到大，约 2 至 3 周。需要确定 trace id 的 session/fork 语义、span 配对、重试归属、采样、redaction 和断点恢复。

### Tauri：桌面发行壳，不是前端重写理由

[Tauri](https://github.com/tauri-apps/tauri) 有 110,220 stars，MIT/Apache-2.0 双许可证，最近 push 为 2026-08-14。官方支持把 Node 应用封成 sidecar、自定义 capability/permission，并生成 macOS、Windows 和 Linux 安装包。

适合的架构是“当前 Web Client + DSH Host sidecar + 最小 Tauri shell”。不要把 Cordis Host 逻辑迁到 Rust，也不要让 WebView 再拥有一套文件、终端或权限状态。Tauri 只负责生命周期、窗口、安装/更新、系统菜单和受限 native IPC。

**改造量**：macOS MVP 中，约 2 至 3 周；三平台签名、自动更新、sidecar 打包、崩溃恢复和权限模型完整化为大，约 4 至 8 周。

**主要风险**：Node sidecar 的多平台打包；端口和 loopback origin 认证；主进程和 Host 双重退出；签名/公证；Tauri capability 配错会扩大 WebView 权限。应先只做 macOS 内测壳。

### ccusage：适合借鉴报表和外部 CLI 汇总，不应成为 DSH 账本

[ccusage](https://github.com/ccusage/ccusage) 有 17,908 stars，MIT，最近 push 为 2026-08-14。它从 Claude Code、Codex、OpenCode、Goose 等本地记录生成 daily/monthly/session、model breakdown、cache token 和自定义价格报表，支持 JSON 输出。

它对“外部 Codex/Claude 子进程到底花了多少”很有参考价值，也可做一个独立诊断命令。但 DSH 自身已有 canonical session log 和 token projection，产品内成本不能绕过这套账本去扫描别的 CLI 文件。若要支持外部 provider，应该让 provider 回填标准 usage，或把 ccusage 当离线 reconciliation 数据源。

**改造量**：独立诊断 CLI 约 3 至 5 日；产品内统一对账至少 2 周，而且价值低于先完成 `sessionCost` projection。

## 分级三：只借鉴交互或控制策略

### assistant-ui

[assistant-ui](https://github.com/assistant-ui/assistant-ui) 有 11,642 stars，MIT，最近 push 为 2026-08-14。它的 ToolGroup、ReasoningGroup、custom runtime、queue/steer adapter、approval 和 artifact/interactable 设计值得做交互对照。

可借鉴的具体模式：连续工具调用默认聚合为一行；先给结论和产物，再按需展开过程；工具 fallback 与按工具名 renderer 分层；scroll viewport 明确区分 pinned 和 reader-owned 状态。

不建议把 `ExternalStoreRuntime` 接在 DSH client runtime 外面。DSH 的 replacement/compaction、Conversation Location、subagent address、projection cut 和 tool render intent 不是普通 message array，双 runtime 会产生状态漂移和重复工具执行风险。

### OpenCode

[OpenCode](https://github.com/anomalyco/opencode) 有 197,300 stars，MIT，最近 push 为 2026-08-14，并提供 TUI、Web 和 beta Desktop。它适合作为“复杂 Agent 也可以先让人看到结果”的视觉与导航基准。

可借鉴的方向：session/workspace 切换保持上下文；工具运行状态低噪声展示；文件修改作为一等产物；Desktop 与 CLI 共用服务而不是复制业务逻辑。它的完整 runtime、provider 和 plugin system 与 DSH 重叠，不应作为依赖。

### LangGraphJS

[LangGraphJS](https://github.com/langchain-ai/langgraphjs) 有 3,204 stars，MIT，最近 push 为 2026-08-13。官方把每次运行的 `recursionLimit`、可观察 step counter、`GraphRecursionError` 和 `max_concurrency` 做成明确运行时参数。

DSH 不应接入 LangGraph runtime。应借鉴的是策略语义：预算在开始新工作前原子扣减；当前消耗可观察；接近上限可以优雅收尾；超限产生稳定的 stop reason；限制属于一棵执行树而不是单个 child。实现位置应是新的 DSH guard/policy plugin，复用现有 subagent lifecycle 和 workflow semaphore 经验。

### Zed + ACP

[Zed](https://github.com/zed-industries/zed) 有 88,601 stars，最近 push 为 2026-08-14。官方 External Agents 通过 ACP 展示 thread，并把 runtime、模型、工具和配置留给外部 agent。

它是未来 IDE 客户端的重要验证目标，但不是当前可直接交付的体验补丁。DSH ACP 明确只发 committed assistant text，缺少 tools、reasoning、plans、usage、resume 和 editor capabilities。要在 Zed 中获得完整体验，需要先扩 DSH ACP 协议面和 snapshot coverage；当前接入只能得到缩水聊天，不能替代 Web UI。

## 树级预算熔断建议

这是历史会话里最严重问题的正确产品修复，不能只靠 LiteLLM。

建议新增一个 guard/policy plugin，而不是修改 `agent-loop`：

| 配置 | 建议含义 |
|---|---|
| `maxActiveDescendants` | 同一 root 委派树同时 running/waiting 的 child 上限；新 start 在容量释放前 FIFO 等待或立即拒绝，由配置决定 |
| `maxDescendantsPerRoot` | root 生命周期内成功发布过的 child 总数上限，防止宽树持续滚动创建 |
| `maxRequestsPerRoot` | root 与所有 descendants 的模型请求总数上限 |
| `maxTokensPerRoot` | 从 canonical usage 累加四类互斥 token bucket；达到上限前阻止下一次 request |
| `maxEstimatedCostUsdPerRoot` | 基于固定价格快照的估算熔断；价格未知时按配置 fail loud，而不是当作零成本 |
| `warnAtRatio` | 在 70%/90% 等阈值记录 durable budget event，UI 显示剩余量并允许人工停止 |

具体接点：

- 在 `subagent/start` 之前预留 child 容量，失败或 `subagent/end` 后释放 active slot。
- 在 `agent/pre-step` 或 `agent/request` 前检查树级 request/token/cost budget，拒绝必须形成可重放的 durable event 和稳定 stop reason。
- root identity 从 session lineage 计算，预算状态不能只放进进程内 Map；恢复后必须从 session log/projection 重建。
- 普通 subagent 和 workflow child 必须共享同一 root budget，避免从另一个入口绕开。
- UI 在 parent header 的 subagent catalog 显示“运行中/上限、累计请求、token、估算金额”，并提供一个停止整棵树的明确动作。

这部分可以复用仓内 workflow 的 FIFO slot 和 total-agent cap 思路，不需要引入 LangGraph 或一个新的 semaphore 依赖。

## 明确排除项

1. **不以 assistant-ui 重写 DSH Web**：它的组件质量高，但 DSH 已有更细的 durable event/projection 和插件 slot。重写至少需要 6 至 10 周，并会丢掉当前 lifecycle 语义。
2. **不把 LangGraph、OpenCode 或 Goose 嵌进 Agent loop**：这些是另一套 orchestration runtime，与“everything is a plugin”和现有 session log 主权冲突。
3. **不把 Langfuse 当作当前 OTel logs 的零代码落点**：Langfuse 的 rich LLM ingestion 是 traces；当前 DSH exporter 是 logs，信号类型不同。
4. **不把 Zed ACP 当作完整 GUI 替代**：当前 DSH ACP 是 automation-only，工具、轨迹、usage 和恢复都不在协议上。
5. **不引入 Open WebUI 源码**：[Open WebUI](https://github.com/open-webui/open-webui) 虽有 148,750 stars，但当前许可证包含超过 50 名用户时不得移除/替换品牌等限制；同时它的 Python backend 和 conversation model 与 DSH 重叠。
6. **不以 ccusage 扫描结果替代 DSH canonical usage**：离线扫描适合核对外部 CLI，不适合成为产品内实时预算权威。
7. **暂不选 Portkey Gateway 或 Helicone Gateway**：[Portkey Gateway](https://github.com/Portkey-AI/gateway) 有 12,712 stars、MIT、最近 push 为 2026-05-25；[Helicone](https://github.com/Helicone/helicone) 有 6,066 stars、Apache-2.0、最近 push 为 2026-07-25。两者都未归档，但都需要引入第二个代理控制面，而当前需求由更活跃的 LiteLLM 预算、限流和 DeepSeek provider 支持覆盖得更完整。除非 LiteLLM 的 V4 wire 回归失败，不并行维护多个 gateway POC。

## 推荐实施切片

### P0：先止住失控

1. 将生产默认 `maxParallelToolCalls` 从通用值 10 分离出 subagent 专用并发策略，先在部署层把 subagent 降到 2 至 4。
2. 实现 root 级 `maxActiveDescendants`、`maxDescendantsPerRoot` 和 `maxRequestsPerRoot`，覆盖普通 subagent 与 workflow。
3. 用 LiteLLM 做独立 POC，设置一个很低的测试 budget，验证超过预算时 DSH 得到稳定非重试错误，不出现 retry storm。

### P1：让用户看得懂成本和进度

1. 固定 models.dev 价格快照，添加 `sessionCost` projection。
2. StatsLine 显示当前会话 token 和估算金额；subagent tree 显示每个 child 和整棵树合计。
3. 预算剩余量使用简单进度和明确文案，不把 request/step/cache 术语堆到默认视图；详细 breakdown 放在展开层。

### P2：解决长会话卡顿和信息噪声

1. 用固定的长会话 fixture 复现卡顿，记录总节点数、主线程 flame chart、layout/style 时间、长任务、内存和滚动帧率，定位 projection、状态更新、Markdown 或 DOM/布局中占主导的路径。
2. 若基准确认 DOM/布局是主要瓶颈，把 ChatView 改成阈值启用的动态高度虚拟列表，并用同一 fixture 对比改造前后数据；否则先修已确认的主导路径。
3. 连续 tool calls 默认折叠成一组，默认层只显示动词、目标、状态、耗时和产物数量。
4. 回答顺序固定为结果、产物、下一步，轨迹和原始参数进入展开区；参考 assistant-ui/OpenCode，不接入其 runtime。

### P3：桌面和观测

1. 扩展 `openPath` 到 path/line/column，评估 launch-editor 的 editor detection。
2. 先把 redacted OTel logs 发到 SigNoz；有明确诊断需求后再设计 GenAI spans/Langfuse backend。
3. 做 macOS-only Tauri sidecar MVP，验证启动、退出、升级、文件打开和断线恢复，再决定三平台投入。

## 生态数据快照

星标和 `pushed_at` 取自 GitHub REST API，抓取时间为 2026-08-14 16:15 左右（Asia/Shanghai）。星标是易变快照；“活跃”表示仓库未归档且近期仍有 push，不代表每个 issue 都得到维护。

| 项目 | Stars | 最近 push | License | 维护判断 | 本报告分级 |
|---|---:|---|---|---|---|
| [anomalyco/models.dev](https://github.com/anomalyco/models.dev) | 6,383 | 2026-08-14 | [MIT](https://github.com/anomalyco/models.dev/blob/dev/LICENSE) | 活跃 | 直接接入 |
| [TanStack/virtual](https://github.com/TanStack/virtual) | 7,064 | 2026-08-09 | [MIT](https://github.com/TanStack/virtual/blob/main/LICENSE) | 活跃，且 DSH 已使用 | 直接接入 |
| [BerriAI/litellm](https://github.com/BerriAI/litellm) | 56,306 | 2026-08-14 | [主体 MIT，enterprise 单独授权](https://github.com/BerriAI/litellm/blob/litellm_internal_staging/LICENSE) | 活跃，需紧跟安全更新 | 直接部署，产品内需适配 |
| [SigNoz/signoz](https://github.com/SigNoz/signoz) | 31,839 | 2026-08-14 | [主体 MIT，enterprise 单独授权](https://github.com/SigNoz/signoz/blob/main/LICENSE) | 活跃 | logs 可直连，LLM traces 需适配 |
| [langfuse/langfuse](https://github.com/langfuse/langfuse) | 33,083 | 2026-08-14 | [主体 MIT，ee 单独授权](https://github.com/langfuse/langfuse/blob/main/LICENSE) | 活跃 | 需要适配 |
| [tauri-apps/tauri](https://github.com/tauri-apps/tauri) | 110,220 | 2026-08-14 | [MIT/Apache-2.0](https://github.com/tauri-apps/tauri/tree/dev#copyright-and-licenses) | 活跃 | 需要适配 |
| [ccusage/ccusage](https://github.com/ccusage/ccusage) | 17,908 | 2026-08-14 | [MIT](https://github.com/ccusage/ccusage/blob/main/LICENSE) | 活跃 | 诊断/借鉴 |
| [vitejs/launch-editor](https://github.com/vitejs/launch-editor) | 721 | 2026-08-09 | [MIT](https://github.com/vitejs/launch-editor/blob/main/LICENSE) | 活跃，窄功能 | 需要适配 |
| [assistant-ui/assistant-ui](https://github.com/assistant-ui/assistant-ui) | 11,642 | 2026-08-14 | [MIT](https://github.com/assistant-ui/assistant-ui/blob/main/LICENSE) | 活跃 | 仅借鉴交互 |
| [anomalyco/opencode](https://github.com/anomalyco/opencode) | 197,300 | 2026-08-14 | [MIT](https://github.com/anomalyco/opencode/blob/dev/LICENSE) | 活跃 | 仅借鉴交互/桌面架构 |
| [langchain-ai/langgraphjs](https://github.com/langchain-ai/langgraphjs) | 3,204 | 2026-08-13 | [MIT](https://github.com/langchain-ai/langgraphjs/blob/main/LICENSE) | 活跃 | 仅借鉴控制策略 |
| [open-telemetry/opentelemetry-collector](https://github.com/open-telemetry/opentelemetry-collector) | 7,388 | 2026-08-13 | [Apache-2.0](https://github.com/open-telemetry/opentelemetry-collector/blob/main/LICENSE) | 活跃 | 观测基础设施 |
| [zed-industries/zed](https://github.com/zed-industries/zed) | 88,601 | 2026-08-14 | [按组件多许可证](https://github.com/zed-industries/zed#licensing) | 活跃 | 仅作 ACP/IDE 验证目标 |
| [open-webui/open-webui](https://github.com/open-webui/open-webui) | 148,750 | 2026-08-14 | [自定义 Open WebUI License](https://github.com/open-webui/open-webui/blob/main/LICENSE) | 活跃 | 排除源码集成 |
| [Portkey-AI/gateway](https://github.com/Portkey-AI/gateway) | 12,712 | 2026-05-25 | [MIT](https://github.com/Portkey-AI/gateway/blob/main/LICENSE) | 未归档，最近 push 距抓取日约 81 天 | 暂不选用 |
| [Helicone/helicone](https://github.com/Helicone/helicone) | 6,066 | 2026-07-25 | [Apache-2.0](https://github.com/Helicone/helicone/blob/main/LICENSE) | 活跃 | 暂不选用 |

## 一手资料

- Models.dev：[仓库和 API 说明](https://github.com/anomalyco/models.dev#api)、[实时 API](https://models.dev/api.json)
- TanStack Virtual：[React API](https://tanstack.com/virtual/latest/docs/framework/react/react-virtual)、[动态高度示例](https://tanstack.com/virtual/latest/docs/framework/react/examples/dynamic)
- LiteLLM：[Proxy 概览](https://docs.litellm.ai/)、[DeepSeek endpoint support](https://github.com/BerriAI/litellm/blob/litellm_internal_staging/provider_endpoints_support.json)、[Security](https://github.com/BerriAI/litellm/security)
- SigNoz：[Self-host OTLP ingestion](https://signoz.io/docs/ingestion/self-hosted/overview/)、[OTLP logs](https://signoz.io/docs/logs-management/send-logs/collection-methods/)
- Langfuse：[OTel traces ingestion](https://langfuse.com/docs/observability/get-started)、[Token 和 cost tracking](https://langfuse.com/docs/observability/features/token-and-cost-tracking)
- assistant-ui：[Custom Runtime](https://www.assistant-ui.com/docs/runtimes/custom/overview)、[Thread 组件分组](https://www.assistant-ui.com/docs/ui/thread)、[Tools](https://www.assistant-ui.com/docs/tools)
- LangGraphJS：[Recursion limit 和 step counter](https://docs.langchain.com/oss/javascript/langgraph/graph-api)、[max concurrency](https://docs.langchain.com/oss/javascript/langgraph/use-graph-api)
- Tauri：[Node sidecar](https://v2.tauri.app/learn/sidecar-nodejs/)、[Capabilities](https://v2.tauri.app/security/capabilities/)、[Distribution](https://v2.tauri.app/distribute/)
- Zed：[External Agents / ACP](https://zed.dev/docs/ai/external-agents)
- launch-editor：[支持 path:line:column 和 editor detection](https://github.com/vitejs/launch-editor)
- ccusage：[支持的 CLI、报表和 JSON 输出](https://github.com/ccusage/ccusage#readme)
