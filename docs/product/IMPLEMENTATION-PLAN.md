# Learn Agent Harness 三课纵向切片实施计划

> 状态：M0 已确认，M1-M3 实施中
> 前置需求：`docs/product/REQUIREMENTS.md`
> 实施范围：首个三课可用原型，不一次重写 22 课
> 硬门：技术栈和视觉方向确认前不创建应用 scaffold

## 1. 实施结论

首版应构建一个 learner-first 的交互学习应用，而不是把参考项目换皮成更漂亮的文档站。首页直接承载第 01 课的可运行任务；用户先看到结果和状态变化，再展开解释、最小实现和固定版本 DSH 源码。

当前建议进入以下范围：

- 一个首次任务和三课完整闭环；
- 问题语言搜索、三课地图、继续学习和进度清除；
- 确定性本地状态机，不调用真实模型；
- 固定 DSH 提交的事实清单与构建检查；
- 桌面、平板、手机、键盘和读屏路径；
- GitHub Pages 部署、视觉截图、真实构建 GIF 和回退流程。

当前明确不实施：DSH 本体 P0/P1 修复、`models.dev`、TanStack Virtual Chat 改造、LiteLLM、Tauri、Langfuse、真实运行沙箱、登录、远程分析、全部六章或 22 课迁移。

## 2. 技术栈建议，待用户确认

### 推荐：React + TypeScript + Vite 静态 SPA

| 层 | 推荐 | 用途 |
|---|---|---|
| 运行与构建 | Node 22、pnpm、Vite | 快速静态构建，直接部署 GitHub Pages |
| UI | React、TypeScript strict | 三课共享状态机、结构化内容和可测试交互 |
| 路由 | React Router `HashRouter` | GitHub Pages 无服务端 rewrite 时稳定深链 |
| 内容校验 | Zod + TypeScript `satisfies` | 构建时验证课程、证据和状态定义 |
| 富文本 | `react-markdown` + `remark-gfm`，禁用原始 HTML | 渲染受控讲解文本，不手写 Markdown parser |
| 图标 | Lucide React | 语义一致的操作图标与可访问名称 |
| 样式 | 原生 CSS、设计 tokens、CSS Modules 或组件级 class | 避免为三课引入大型样式框架 |
| 单元与组件 | Vitest、Testing Library、axe-core | 状态、内容、行为和基础无障碍检查 |
| 浏览器验收 | Playwright | 三个用户流、响应式、键盘、截图和生产构建验证 |

选择理由：产品的核心是跨步骤状态、可交互轨迹和本地进度，不是长文档渲染；Vite SPA 能保持静态部署和低运维，同时比参考项目的手写 hash router、Markdown renderer 和全量 DOM 拼接更易验证语义和状态。

### 替代方案比较

| 方案 | 优点 | 代价 | 结论 |
|---|---|---|---|
| Vue 3 + Vite | 同样适合静态交互，中文生态成熟 | 新仓库没有 Vue 资产可复用，团队偏好尚未确认 | 可接受替代；用户偏好 Vue 时切换，需求和内容模型不变 |
| Astro + islands | 内容页静态输出优秀，首屏 JS 可更少 | 三课主路径是连续交互，跨 island 状态和进度增加复杂度 | 暂不推荐首版 |
| VitePress/Starlight | 文档、导航和搜索成熟 | 容易回到“目录先于任务”的 docs-first 产品，定制交互成本高 | 不用于主体验；未来源码参考可独立使用 |
| 原生 HTML/CSS/JS | 依赖最少，可直接打开 | 参考项目已经暴露手写路由、渲染和语义缺口，状态测试成本更高 | 不推荐 |
| Next.js/Nuxt | 路由和服务能力完整 | 首版无服务端、账号、SEO 内容平台需求 | 明确排除 |

### 依赖纪律

- 不因 star 数引入依赖；每个运行时依赖必须对应一个 P0 行为。
- 首版不引入 TanStack Virtual：三课内容不足以证明虚拟化收益；该依赖的调研结论属于 DSH Chat 主流。
- 不接入 assistant-ui、OpenCode 或 LangGraph runtime，只借鉴“先结果后过程、连续工具聚合、预算前置”的产品原则。
- 版本在 scaffold 时固定，并记录许可证；CI 使用 lockfile frozen install。

## 3. 信息架构

### 3.1 路由

| 路由 | 目的 | 默认焦点 |
|---|---|---|
| `#/` | 新用户直接进入第 01 课；回访用户显示继续入口 | 具体任务标题或“继续”标题 |
| `#/learn/first-tool-result` | 第 01 课完整路径 | 当前课程步骤标题 |
| `#/learn/event-to-message` | 第 02 课完整路径 | 当前课程步骤标题 |
| `#/learn/plugin-in-plugin-out` | 第 03 课完整路径 | 当前课程步骤标题 |
| `#/find?q=` | 问题语言搜索结果 | 结果标题；无结果时焦点到提示 |
| `#/map` | 三课任务地图和后续六章预告 | 页面标题 |
| `#/evidence/:claimId` | 固定版本事实、限定和源码位置 | 声明标题 |

首页不设单独 marketing route。首次访问的 `#/` 与第 01 课入口是同一实际体验，避免多一次“开始学习”跳转。

### 3.2 页面层级

1. 紧凑顶栏：产品名、三课能力进度、问题搜索、三课地图。
2. 任务头：用户目标、预期结果、预计用时、概念演示与零 API 费用说明。
3. 交互工作区：预测、运行、轨迹、结果和单变量实验；这是页面视觉焦点。
4. 理解层：只解释 2 至 3 个变化，再给术语命名。
5. 检查点：未见过的相邻场景。
6. 深度层：最小实现和 DSH 对照，默认折叠。
7. 前后课导航：用因果关系说明下一课，不展示全部课表。

桌面允许“步骤/解释 + 轨迹/结果”的双列工作区；移动端 DOM 顺序固定为任务、主操作、结果、解释、深度层，视觉重排不得改变读屏顺序。

## 4. 交互和内容模型

### 4.1 课程模型

建议每课导出一个受 schema 校验的 `LessonDefinition`：

```ts
interface LessonDefinition {
  id: string
  slug: string
  contentVersion: number
  title: string
  userProblem: string
  outcome: string
  durationMinutes: number
  terms: readonly TermDefinition[]
  prediction: PredictionDefinition
  scenario: ScenarioDefinition
  observations: readonly ObservationDefinition[]
  experiment: ExperimentDefinition
  checkpoint: CheckpointDefinition
  explanationMarkdown: string
  minimalImplementationMarkdown: string
  evidenceClaimIds: readonly string[]
  search: SearchDefinition
  completionRule: CompletionRule
}
```

Markdown 只承载说明文本；运行步骤、答案、完成条件、源码证据和搜索字段必须是结构化数据。禁止在 Markdown 中执行 JSX、HTML 或任意脚本。

### 4.2 演示状态机

三课共享同一组显式状态：

```text
unstarted -> predicted -> ready -> running -> observed
observed -> experimenting -> checkpoint
checkpoint -> completed
checkpoint -> needs-retry -> checkpoint
any non-running state -> reset -> unstarted
```

约束：

- `running` 只由确定性步骤队列驱动，最后一步结算后立即离开；
- 每个状态公开可见标签，并同步到 `aria-live="polite"` 的简短消息；
- reducer 对未知事件执行穷尽检查，不静默保持旧状态；
- reduced motion 直接显示下一稳定状态，不删除状态文本；
- 切路由时保留已完成事实，但不保留半个 `running`；恢复时回到最近的稳定步骤；
- 演示异常进入 `demo-error`，提供“重新开始本课”，不记录完成。

### 4.3 事实模型

每个 `EvidenceClaim` 至少包含：

```text
claimId, statement, classification, upstreamRepository, upstreamCommit,
path, symbolOrTest, sourceUrl, verificationKind, demoDifference, reviewedAt
```

`classification` 只能是 `product-fact`、`teaching-model`、`analogy` 或 `inference`。页面不得把后三者渲染成产品已实现行为。

CI 在同一 job 将 DSH 固定提交 checkout 到隔离目录，再执行事实验证：TypeScript 声明使用 compiler API 读取，路径和符号必须存在，关键运行语义使用固定提交的权威测试或最小针对性断言。参考项目的 `check_all.py` 不作为事实门。

首批 claim 候选如下；行号只用于人工定位，页面链接必须同时保留路径与符号，避免以后升级提交时仅替换行号：

| Claim | 首版需要陈述的事实 | 固定提交中的权威位置 | 验证方式 |
|---|---|---|---|
| `DSH-LOOP-001` | Agent 请求将系统文本、工具 schema 和 `deriveMessages()` 结果作为不同输入传给请求构建 | `packages/core/agent-loop/src/agent.ts`，`Agent.step` | compiler API + 目标调用参数断言 |
| `DSH-TOOLS-001` | `tools/execute` 是带 `next()` 的 waterfall，不代表多个工具调用的并发策略 | `packages/core/tools/src/index.ts`，`Context.events['tools/execute']` | JSDoc `@mode` + 签名断言 |
| `DSH-SESSION-001` | `deriveMessages()` 从 session surface 投影模型消息，log-only 事件不进入该结果 | `packages/core/session/src/index.ts`，`Session.deriveMessages` | 权威测试 + 方法存在性 |
| `DSH-SURFACE-001` | `SurfaceOp` 是 `'append'` 或 replace 对象 | `packages/core/session/src/types.ts`，`SurfaceOp` | TypeScript union AST 断言 |
| `DSH-SURFACE-002` | replace 的来源序列包含全部被遮蔽 surface nodes | `packages/core/session/src/surface.ts`，`assertProvenance` | 权威失败测试 + 确切错误条件 |
| `DSH-PLUGIN-001` | 注册属于可逆 effect，disposer 在 teardown 时撤销贡献 | `docs/cordis-primer.md` 的 Registrations 与 Practical Rules；`vendor/cordis/src/fiber.ts` | 文档人工审核 + disposer 行为测试 |
| `DSH-SEAM-001` | 完整角色名是 Service Definition / Service Provider / Consumer | `docs/architecture.md` 的 Capability seams；`docs/glossary.md` 的 capability-seam | 结构化术语断言 |

最终 claim 文案只有在事实审核人确认后才进入课程；上表是验证任务，不是已经发布的内容。

## 5. 三课实现切片

### 5.1 第 01 课：让 Agent 先查再答

**概念工作区：** 一个明确标记为教学数据的 `release-note.md`，其中包含发布端口。

**初始任务：** “找出这个示例项目的发布端口，并说明依据。”

**主路径：**

1. 用户预测 Agent 应该直接猜、读取文件还是询问用户。
2. 点击“运行一次”，轨迹依次显示接收任务、请求 `read_file`、获得结果、形成带依据答案、停止。
3. 默认只显示动作、目标、状态和结果；工具参数与概念事件按需展开。
4. 用户把唯一变量改为“工具拒绝访问”，再选择 Agent 应诚实报告失败而不是编造端口。
5. 迁移题询问缺少依据时是否应继续回答。

**深度层事实：** Agent loop 与工具执行的关系；不得把多个工具的调度并发与 `tools/execute` 的 waterfall 模式混在一起。

### 5.2 第 02 课：从记录还原它看到的内容

**输入：** 第 01 课的概念事件序列。

**主路径：**

1. 用户预测模型视图是否等于完整执行日志。
2. 点击“生成模型视图”，左侧追加日志逐项点亮，右侧只出现产生消息的表面节点。
3. 用普通语言说明“记录保留发生过的事；投影决定这次模型看到什么”。
4. 用户加入一个 `step/end` 概念记录，观察完整日志变长而模型视图不变。
5. 迁移题要求判断一个工具结果应属于记录、模型视图或两者。

**深度层事实：** SessionEvent 追加日志、`deriveMessages()`、SurfaceEvent；`SurfaceOp` 追加值为字符串 `'append'`，replace 的 `sourceEventSeqs` 必须覆盖所有被遮蔽节点。首课不实际教授 compaction，但反例进入事实测试，防止沿用参考错误。

### 5.3 第 03 课：加一项能力，再完整撤下

**概念能力：** `word_count`，用于统计一段文本的字数。

**主路径：**

1. 用户观察初始工具目录没有 `word_count`，预测挂载插件后的变化。
2. 点击“挂载插件”，目录和任务可用动作同时更新。
3. 运行一次统计任务，看到能力被使用。
4. 用户执行“释放插件”，目录恢复初始状态，再次运行时不再提供该工具。
5. 迁移题要求判断应该由谁保存 disposer 并在何时调用。

**深度层事实：** 注册是 effect，`ctx.effect()` / `ctx.on()` 参与生命周期，registry `register()` 返回 disposer。Service Definition / Service Provider / Consumer 只在可选 DSH 对照层解释，不用 `interface / implementation / consumer` 替代权威术语。

### 5.4 三课内容生产顺序

三课不并行铺开全文。先冻结三课大纲和 claim 注册表，再按第 01、02、03 课逐一完成“作者初稿 -> 独立审核 -> 定点修订 -> 差异复查”。审核单位是一课完整闭环，不是每个段落。

- 第 01 课作为 A 级样本：1 名作者、1 名事实审核、1 名学习体验审核；通过后才能复制流程。
- 第 02、03 课根据实际变化分级；只变化学习路径或产品事实时只启动对应审核角色。
- 每个 Agent 只接收本课大纲、相关 claim、必要源码证据和输出范围，不注入完整会话或整个仓库。
- 全局子 Agent 并发上限为 2，禁止递归委派；每课最多一次修订和一次差异复查。
- 根负责人直接裁决审核冲突，不创建第三个投票 Agent；所有相关 Agent 静止后才标记该课完成。
- 保存每个环节的输入、输出、缓存读取、固定注入、模型轮次和耗时；第一课证明信息收益高于固定 Agent 开销后，才为后两课继续使用同一组合。

详细流程与默认预算见 `research/section-agent-review-workflow.md`。

## 6. 三个完整用户流

### 流 A：首次访问到第一个结果

`#/` -> 看见任务和零费用说明 -> 预测 -> 运行 -> 看见带依据答案 -> 查看两个状态变化 -> 修改工具结果 -> 通过检查点 -> 记录第 01 课完成。

异常分支：运行中刷新页面恢复到运行前稳定状态；本地存储不可用时仍完成，只显示本次不保存；演示数据无效时进入可重置错误状态。

### 流 B：从一个问题直达第 02 课

搜索“事件怎么变成消息” -> 结果以用户问题命名 -> 进入第 02 课 -> 完成投影实验 -> 展开 `deriveMessages` 证据 -> 新标签打开固定提交源码 -> 返回后课程状态不丢失。

异常分支：无结果时显示三个问题建议；外部源码链接失败不影响核心课程，并保留可复制的仓库、提交、路径和符号。

### 流 C：回访、继续和清除

已完成第 01 课并停在第 02 课实验 -> 重新打开 -> 首页显示准确的继续入口 -> 恢复到第 02 课稳定步骤 -> 通过检查点 -> 在设置中清除全部进度 -> 确认后首页和三课地图同步恢复。

异常分支：内容版本升级导致旧步骤无效时，只重置受影响课程并解释原因，不丢弃仍兼容的完成记录。

## 7. 响应式、无障碍与视觉方向

### 7.1 已冻结的结构要求

- 第一屏实际操作，不使用营销 hero、超大标题或装饰性页面段落。
- 页面段落保持无框或全宽带状层级；卡片只用于真正独立的重复项或工具结果，不做卡片套卡片。
- 交互控件使用按钮、链接、分段选择、复选框和 disclosure 的原生语义。
- 图标按钮使用 Lucide 并提供 tooltip 与可访问名称；命令按钮可用图标加短文本。
- 字号不随视口宽度缩放，letter spacing 为 0；中文正文移动端不低于 16 px。
- 控件触摸目标至少 44 px；状态、焦点和错误不只依赖颜色。

### 7.2 已确认的视觉方向

视觉世界是“Agent Flight Recorder / 飞行试验遥测表”：冷白遥测纸面、石墨色全局控制面、钴蓝动作、橙色实验变量和绿色完成状态。每课固定为 `01 预测 / 02 观察 / 03 迁移 / 04 解释`，视觉焦点是任务与轨迹，不使用渐变、装饰光球、插画 hero、过量阴影或一屏多色课程卡。

品牌符号使用 Lucide Radar；字体使用本地系统字族，保持零远程字体请求；动效只服务目录 disclosure、运行状态和移动端焦点转移，并遵守 reduced-motion 设置。

### 7.3 验证矩阵

- `390 x 844`：触摸、抽屉导航、单列轨迹、无横向页面溢出；
- `768 x 1024`：窄双列或单列转场、键盘与触摸共存；
- `1440 x 900`：双列工作区、首屏主操作和结果区域；
- 200% 浏览器缩放：标题、按钮、状态与代码折叠不遮挡；
- reduced motion：无非必要位移，过程仍可理解；
- VoiceOver + Safari 和键盘-only Chromium：名称、顺序、live 状态和焦点恢复。

## 8. 仓库结构建议

```text
docs/product/                 产品定义、需求、实施和决策
research/                     参考、会话和开源调研
src/app/                      路由、应用 shell、错误边界
src/components/               共享语义组件
src/features/lesson/          状态机、工作区和完成逻辑
src/features/search/          问题语言索引和结果
src/features/progress/        本地版本化进度
src/content/lessons/          三课结构化内容
src/content/evidence/         claim manifest 与教学差异
src/styles/                   tokens、全局和响应式规则
scripts/                      内容、事实、链接和 bundle 检查
tests/unit/                   reducer、schema、search、progress
tests/e2e/                    三个用户流与视口验收
docs/evidence/                发布命令、截图、GIF provenance、人工验收
```

应用实现前先补根级 `PRODUCT.md` 或等价设计约束文件，记录用户已确认的 stack 与视觉方向，避免后续代理自行改产品定义。

## 9. 测试与证据

### 9.1 自动检查

建议顶层命令：

```sh
pnpm install --frozen-lockfile
pnpm run lint
pnpm run typecheck
pnpm run test
pnpm run validate:content
pnpm run verify:facts
pnpm run test:e2e
pnpm run build
pnpm run check:bundle
```

覆盖重点：

- lesson schema、最多 3 个术语、所有 claim 存在、完成规则可达；
- reducer 的每条合法和非法迁移、刷新恢复、版本迁移和清除；
- 五个固定问题查询和无结果状态；
- 三课成功、关键失败和 reduced-motion 路径；
- 语义按钮/链接、焦点、live region、axe serious/critical；
- 三个视口无页面横向溢出、首屏主操作可见；
- 固定提交源码位置、事件模式、`SurfaceOp`、角色名和 Prompt/tool 分离事实；
- 生产 build 的 hash route、直接重载和 GitHub Pages base path。

### 9.2 人工检查

- 5 名主用户无主持完成冷启动、问题入口和迁移题；
- DSH 事实审核人逐项签署 claim manifest；
- 中文可读性审核删除未解释术语、被动堆砌和包结构前置；
- VoiceOver、键盘、触摸与 200% zoom 走完全路径；
- 在真实 GitHub Pages URL 上验证冷启动、刷新、外链和清除。

### 9.3 GIF 与视觉证据

GUI 变更完成后，从该分支真实 production build 启动静态服务器，用新浏览器存储记录一个连续故事：初始任务、运行中、带依据结果、展开 DSH 对照。帧保持同一 viewport；运行和完成用精确 DOM 状态判定，不以固定延迟证明完成。

GIF provenance 明确写：确定性本地概念演示、没有真实模型调用、演示提交 SHA、服务命令、origin、视口和帧状态。编码后检查尺寸、时长、字节数和最终帧；若创建 PR，GIF 放到独立 assets branch，不进入主分支历史。

## 10. P0 验收映射

| P0 | 实现切片 | 自动验证 | 人工验证 | 证据产物 |
|---|---|---|---|---|
| R0-01 | app shell + 首页即第 01 课 | 三视口首屏 locator 与 overflow 断言 | 5 人找主操作 | 首屏截图、可用性记录 |
| R0-02 | 第 01 课确定性 runner | 100 ms 状态、2 秒结算、无网络请求断言 | 结果和零费用文案理解 | E2E trace、GIF |
| R0-03 | lesson reducer + 三课内容 | 每课闭环和 completion rule 测试 | 迁移题观察 | 单元报告、任务录像记录 |
| R0-04 | disclosure + 深度直链 | 默认折叠、深链、术语计数 | 不读源码完成 | 内容校验报告 |
| R0-05 | 单任务页面与步骤编排 | 同时只存在一个 primary action | 停顿点/误解词记录 | 用户测试表 |
| R0-06 | evidence manifest + verifier | 固定提交、符号、关键声明检查 | 事实审核签字 | `fact-verification.json`、审核表 |
| R0-07 | problem finder | 五个查询与空状态测试 | 用户语言可理解性 | search fixture 结果 |
| R0-08 | progress adapter | 恢复、清除、拒存储、版本迁移 | 回访流 | 单元报告、E2E trace |
| R0-09 | 状态标签与 summary/detail | 无后台网络/计时、稳定终态断言 | 过程/结果层级检查 | 网络日志、状态截图 |
| R0-10 | responsive layout | 390/768/1440、200% overflow 检查 | 触摸和长文案 | 三视口截图 |
| R0-11 | semantic components | axe、键盘 E2E、focus assertions | VoiceOver 检查 | axe JSON、a11y checklist |
| R0-12 | 静态构建与错误边界 | bundle budget、无效内容 build fail | 错误文案和恢复 | bundle report、失败用例 |
| R0-13 | local-only progress | 请求 allowlist 断言、无 analytics dependency | 隐私文案检查 | 网络 trace、依赖清单 |
| R0-14 | license/notices/readme | license presence、dependency license scan | 署名和独立性审核 | license report |
| R0-15 | CI + Pages + evidence | 所有 gate、生产 URL smoke | 发布与回退演练 | CI URL、GIF、发布记录 |

任何 P0 没有对应证据时不得标记完成。

## 11. 里程碑、入口和退出条件

### M0 需求冻结

**入口：** 三份研究和 PM SOP 已完成。
**动作：** 根审核本计划，用户确认技术栈与视觉方向，事实审核人确认三课 claim 候选；用无应用代码的设计工具或文档帧完成桌面与 390 px 移动低保真/可点击原型，并让 5 名目标用户走首次任务和三课关键状态变化。
**退出：** `REQUIREMENTS.md` 和本计划标记已确认；至少 4/5 用户在 30 秒内找到主操作，至少 4/5 能沿原型看到结果并指出关键状态变化；低保真测试记录归档；无 P0 分歧；仍无应用代码。
**回退：** 修改需求、流程和设计原型后重测，不创建 scaffold。

### M1 基础与第一屏

**入口：** M0 通过。
**动作：** 在用户 GitHub 创建 public 学习仓库，推送已确认产品文档和最小 scaffold，设置 main 保护；在首次部署前将仓库定名为 `learn-agent-harness`，在工作分支实现设计 tokens、语义 app shell、路由、内容 schema、进度 adapter 和第 01 课初始工作区。
**退出：** 两个目标视口第一屏可操作；schema、typecheck、lint、a11y smoke 通过；首屏无目录前置。
**回退：** 删除未采用 scaffold commit，保留产品文档；不兼容技术决策用独立 commit 撤回。

### M2 第 01 课闭环

**入口：** M1 通过。
**动作：** runner、预测、轨迹、失败实验、检查点、结果摘要和深度层。
**退出：** 冷启动 E2E、无网络请求、刷新恢复、键盘路径和固定事实检查通过。
**回退：** 回到 M1 静态任务工作区；不扩展第 02/03 课。

### M3 第 02/03 课与检索

**入口：** 第 01 课结构通过内部可用性检查。
**动作：** 按第 5.4 节的分段流程复用同一课程模型完成投影和插件课，加入问题检索、三课地图、继续与清除。
**退出：** 三个完整用户流和所有内容 schema 通过；无第二套特殊状态机；每课审核记录与 Token 预算记录完整，相关 Agent 已结束或取消。
**回退：** 关闭未通过的课程 route，只部署已通过切片；不放宽 schema 迁就课程。

### M4 质量与用户验证

**入口：** M3 功能冻结。
**动作：** 三视口、200% zoom、axe、VoiceOver、bundle、事实、production build、截图和 GIF 验证；使用真实构建对至少 5 名目标用户进行一轮独立于 M0 的发布测试。
**退出：** 至少 4/5 在 90 秒内完成首次演示，至少 4/5 能解释状态变化，至少 3/5 通过相邻迁移题；无已知事实错误、P0/P1 a11y 问题或不可复现结果。
**回退：** 回到失败需求对应里程碑；未通过时不扩写课程。

### M5 GitHub 与 Pages 发布

**入口：** M4 通过且许可证清单完整。
**动作：** 合并 M4 已通过的发布提交，启用 GitHub Pages workflow 并部署同一提交。
**退出：** 生产 URL 冷启动、刷新、搜索、外链和清除通过；发布记录指向精确提交；上一构建可恢复。
**回退：** revert 发布提交并重新运行 Pages workflow；保留失败构建和证据，不 force-push main 或 assets branch。

## 12. GitHub、部署和许可证策略

- 公开仓库：`wara886/learn-agent-harness`，public；默认分支 `main`，工作分支使用 `codex/` 前缀。
- M0 通过后立即创建远端仓库；首个推送包含已确认的产品文档和最小 scaffold，实现继续按 M1-M5 形成可审查提交。Pages 只在 M5 启用。
- GitHub Actions 分开 `quality` 与 `deploy`；deploy 只在 main 的 quality 全部通过后上传 `dist/` Pages artifact。
- Actions 固定到审计过的 commit SHA；Node/pnpm 版本固定；禁止把 sibling 本地 DSH 路径写进构建产物。
- fact job 额外 checkout 固定 DSH commit；课程页面链接同一 commit。
- 新项目 MIT；直接复用的 MIT 内容进入 `THIRD_PARTY_NOTICES.md`。首版 clean-room 重写仍在 README 致谢参考项目与 DSH，并说明独立性。
- 不复制参考项目的生成站代码、手写 Markdown renderer 或视觉资源；被审计事实只作为重写输入。

## 13. 发布级回退

1. 每次发布记录 source commit、content version、DSH fact commit 和 Pages artifact id。
2. 内容状态带版本；回退旧 bundle 时只读取兼容进度，其他状态提示后重置。
3. 事实升级和 UI 发布分开提交；事实 verifier 失败时保持上一版本，不半更新链接与文案。
4. Pages 故障先 revert 对应合并提交，再由相同 workflow 重建；不手工编辑已发布 `dist/`。
5. 若用户测试仍反馈“太工程”，停止 M5：删除或后移术语与深度层，重新做入口测试，不通过增加动画或卡片掩盖结构问题。

## 14. 最终 GO / NO-GO 门

### 开始编码的 GO 条件

- 用户确认 React + TypeScript + Vite，或明确选择 Vue + Vite；
- 用户确认一个视觉方向稿；
- 根审核确认三课范围和产品边界；
- 事实审核人接受首批 claim；
- 本计划的 P0 映射无空项。

### 立即停止编码的 NO-GO 条件

- 要求首页恢复 22 课全量目录或以 DSH 包结构作为第一路径；
- 需要真实模型/API 才能完成首次体验；
- 为赶进度取消事实基线、教学差异或无障碍门；
- 试图在本仓库修复 DSH 委派预算、模型继承或后台生命周期；
- 直接复用参考课程错误示例；
- 技术栈或视觉方向尚未获得用户确认。

### 扩展完整课程的 GO 条件

M4 的 5 人测试达到 `REQUIREMENTS.md` 指标，十课共用同一内容模型，没有事实错误或特殊状态机，并且主要反馈已经从“不知道从哪开始/看不进去”转为具体课程问题。
