# M0 可点击低保真原型

该目录只用于 M0 的层级、主操作、状态变化和响应式测试。它不是 React/Vite scaffold，也不进入 M1 实现。

## 启动

```sh
python3 -m http.server 4173 --directory prototype/m0
```

打开 `http://127.0.0.1:4173/?participant=P01`。每位参与者使用不同的匿名编号 `P01` 至 `P05`。

## 记录

原型把课程进入、预测、主操作时间、结果出现和状态判断写入浏览器 `localStorage`。在控制台运行以下表达式可读取当前会话：

```js
window.getM0Session()
```

真人测试的判断仍以主持人在 `research/m0-usability-results.md` 中记录的可观察行为和参与者原话为准；自动事件只用于核对时间。

## 已验证视口

- `screenshots/desktop-1440x900.png`
- `screenshots/mobile-390x844.png`

两张截图来自同一原型的真实浏览器渲染。三课的基线、单变量实验、反思和撤销路径已逐步走查，浏览器控制台为 0 error、0 warning。
