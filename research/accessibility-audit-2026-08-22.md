# Safari 与 VoiceOver 检查记录

> 日期：2026-08-22
> 构建：`pnpm build` 后由 `pnpm preview --host 127.0.0.1 --port 4175` 提供
> 环境：macOS Safari、macOS VoiceOver

## 已观察结果

- Safari 的辅助功能树将页面识别为“看懂 DSH”HTML 内容，并按页面顺序暴露品牌首页、完成进度、全局导航、课程导航、一级任务标题、二级工作区标题、预测区、任务过程和下一课链接。
- 三个预测项均暴露为带名称与 `on`/`off` 值的开关按钮；“启动任务”在未选择预测时暴露为 disabled button。
- macOS“系统设置 > 辅助功能 > 旁白”中的 `AX_VOICEOVER_ENABLED` 在检查开始时由 `off` 切换到 `on`。检查结束后再次读取时为 `off`，没有遗留设置变更。
- 选择“先读取工作区”后，其可访问值由 `off` 变为 `on`，“启动任务”由 disabled 变为 enabled。
- 运行后，Safari 的辅助功能树包含最终结果“发布端口是 4173，依据为 config.env；任务已停止。”以及机制解释文本。
- 同一生产构建的自动化键盘路径和 axe 检查通过，未发现 serious 或 critical 级别问题。

## 判定

真实 Safari 与 VoiceOver 环境可识别主页面结构、预测控件状态和任务结果。此记录覆盖工程侧辅助技术检查，不替代 5 名目标学习者的 M4 可用性测试。
