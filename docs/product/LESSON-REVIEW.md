# 三课内容生产与审核记录

> 内容版本：`three-slice-v1`
> 事实基线：`deepseek-harness@47f943859bef60e4160492346772ded9b24f765a`
> 执行规则：一课作者 -> 事实审核 -> 体验审核 -> 一次定点修订

## 第 01 课：先查再答

**作者稿：** 从“找出发布端口”任务开始，预测后运行工具往返，再把工具结果改为拒绝访问，最后回答文件不存在的迁移题。

**事实审核：PASS。** 复用 `dsh-agent-loop-tool-round-trip` 与 `dsh-tools-execute-waterfall`；固定提交源码和 focused tests 支持工具调用、结果追加及 waterfall 限定。

**体验审核：REVISE。** 基线结果出现后才能提供单变量实验；拒绝访问的反思题不能提前出现。

**一次修订：** 将基线运行、拒绝访问实验和迁移检查拆成三个明确状态；把“缺少依据并停止”限定为课程规则，不写成模型保证。差异复查 PASS。

## 第 02 课：记录变消息

**作者稿：** 先展示完整记录，再生成模型视图，并加入 `todo/write` 观察两边差异。

**事实审核：PASS。** 复用 `dsh-session-append-only-source` 与 `dsh-session-surface-projection`；保留 surface replace 与空 assistant message caveat。

**体验审核：REVISE。** “生成视图”和“加入待办”不能由一次按钮同时完成，否则用户看不到哪个变量改变。

**一次修订：** 主操作只生成模型视图；实验按钮再加入 `todo/write`，保持完整记录增加而模型视图不变。差异复查 PASS。

## 第 03 课：加入再撤下

**作者稿：** 挂载统计文本工具并展示运行结果，再用 disposer 撤销注册。

**事实审核：PASS。** 复用 `dsh-tools-registration-visible` 与 `dsh-tools-registration-disposer`；保留 scope、shadowing、effect 次序和异步静止限定。

**体验审核：REVISE。** 挂载完成时不能把“释放并恢复”提前标记为完成。

**一次修订：** 挂载后只显示第二状态完成；同一主区随后提供“撤下统计文本工具”，完成后才展示恢复初始目录和迁移检查。差异复查 PASS。

## 审核约束

三课使用同一 schema、runner、轨迹组件、检查点组件和进度 adapter。机械测试与格式修改未创建额外内容角色；没有把 DSH 产品修复、真实模型或参考站 22 课正文带入本版本。
