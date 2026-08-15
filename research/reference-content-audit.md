# `learn-dsh` 参考内容审计

> 状态：根代理复核稿
> 参考版本：`onychen/learn-dsh@249f4a0e9622917c8d315c672c87b96401a0c7d4`
> 权威版本：`deepseek-harness@47f943859bef60e4160492346772ded9b24f765a`
> 原则：参考教程是待审计输入；产品事实以固定版本的 DSH 类型、运行代码和测试为准。

## 结论

参考项目的离线示例和课程覆盖可复用，但当前内容不能直接迁移。下列错误会让学习者形成错误的事件、会话表面、Prompt 和能力角色心智模型；新项目必须先纠正事实，再重写教学顺序。

## 已确认错误

### P0-1 `tools/execute` 被错误归入并行事件

- **参考内容：** L03/L11 把 `tools/execute` 放进 parallel/并行执行叙述。
- **权威事实：** `packages/core/tools/src/index.ts` 中 `tools/execute` 带尾部 `next` 参数并标记 `@mode waterfall`。监听器可包裹、委托或短路实际分派。多个工具调用能否并发是另一层调度与重叠判断，不是该事件的分发模式。
- **纠正：** 教学中分开讲“单个工具调用的 waterfall 管线”和“多个调用的并发调度”，不得用事件模式解释批量并发。

### P0-2 `SurfaceOp` 的 append 写法错误

- **参考内容：** L15/L22 使用 `{ "op": "append" }`。
- **权威事实：** `packages/core/session/src/types.ts` 的 `SurfaceOp` 是字符串 `'append'` 或 replace 对象；追加应写 `surfaceOp: 'append'`。
- **纠正：** 教学数据和可运行演示统一使用字符串 append，并用类型断言阻止对象形式回归。

### P0-3 replace 事件缺少完整来源序列

- **参考内容：** L15/L22 的 replace 示例没有记录全部被遮蔽节点的 `sourceEventSeqs`，其自检仍能通过。
- **权威事实：** `packages/core/session/src/types.ts` 规定 replace 节点的 `sourceEventSeqs` 必须包含它遮蔽的每个表面节点；`packages/compaction/compaction-basic/src/region.ts` 生成 summary 时写入起点、summary 和全部 `shadowedSeqs`。
- **纠正：** 演示必须展示来源序列，增加一个遗漏任一被替换节点就失败的反例；“示例能跑”不再等价于“语义正确”。

### P0-4 System Prompt 与工具 schema 被错误合并

- **参考内容：** L13 把工具 schema 追加进最终 Prompt 字符串。
- **权威事实：** `packages/core/system-prompt/src/index.ts` 的 `PromptAssembly` 分离 `sections`、`contexts`、`tools` 和 `variables`；`renderPrompt()` 渲染文本 sections，工具列表作为独立请求字段进入模型调用。
- **纠正：** 交互演示同时展示“系统文本”和“工具定义”两条通道，不把工具 schema 伪装成 Prompt 文本。

### P1-1 capability seam 角色命名不准确

- **参考内容：** README/L12 使用 `interface / implementation / consumer`。
- **权威事实：** 当前 DSH 术语是 `Service Definition / Service Provider / Consumer`，三种角色共同构成完整 capability seam。
- **纠正：** 主路径先用普通语言描述三种责任；工程深度层采用权威角色名称，不再以 implementation 替代 Provider。

### P1-2 `skills/change` 被暗示为生产热刷新驱动

- **参考内容：** L14 的叙述容易让学习者认为 `skills/change` 正在驱动产品消费者自动刷新。
- **权威事实：** 当前版本能找到事件声明、发射和测试观察者，但没有证明该事件存在生产监听器；“会发出通知”不等于“产品已消费通知”。
- **纠正：** 只陈述 registry 会发出变更信号，并明确当前固定版本未验证到生产消费路径。未来上游新增消费者后再更新事实表。

### P2-1 课程地图数量自相矛盾

- **参考内容：** 根 README 标题写“四阶段地图”，正文实际列出七个阶段。
- **纠正：** 新项目不沿用阶段计数；采用一次首次体验和六个用户任务章节，完整机制地图放到二级入口。

## 校验缺口

`python3 check_all.py` 与 `python3 site/build_site.py` 在参考提交上均可通过，但它们只验证教学样例自身的输出和站点数据生成，没有把教程声明与固定版本 DSH 的类型或运行行为交叉校验。因此，这两条命令只能证明参考项目自洽，不能证明教程准确。

新项目需要增加：

1. 固定 DSH 提交的事实声明表。
2. 对事件模式、联合类型、角色名称和源码路径的自动断言。
3. 教学演示的成功路径与关键失败路径。
4. 上游提交升级时的声明差异检查。

## 体验事实

在 `390 x 844` 视口的真实站点复核中，首页搜索框顶部约为 `y=1406`，整页高度约 `8109px`；页面在正文前暴露完整课程导航，首页一次展示 23 个课程入口。课程卡片为带点击监听的 `div`，没有链接语义、角色或 `tabindex`。这些结果支持“太工程、看不进去”的反馈属于信息架构与可访问性问题，不是单纯视觉偏好。

## 处理决定

- 不直接修补或发布原作者仓库。
- 新项目可参考确定性离线运行、讲义/源码切换和真实 DSH 对照的思路。
- 新内容从用户任务重写；原课程文字和代码不得未经事实审计直接复制。
- 每项真实 DSH 声明都必须标注固定版本证据，工程深度层默认折叠。
