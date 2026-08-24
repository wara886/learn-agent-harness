import { ArrowDown, ArrowRight, Braces, CircleDot, RefreshCw, Wrench } from 'lucide-react'
import { useState } from 'react'
import type { Lesson } from '../domain/lessons.ts'

interface ModelNode {
  label: string
  input: string
  output: string
  why: string
  later: string
  icon: typeof CircleDot
}

export function MentalModel({ lesson }: { lesson: Lesson }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const firstTrace = lesson.baselineTrace[0]!
  const actionTrace = lesson.baselineTrace[1]!
  const resultTrace = lesson.baselineTrace[2]!
  const nodes: ModelNode[] = [
    {
      label: '当前状态',
      input: lesson.question,
      output: firstTrace.detail,
      why: 'Agent 必须先知道现在有什么，才能选择回答、行动或停止。',
      later: '序列化格式、缓存和并发更新。',
      icon: Braces,
    },
    {
      label: '做出判断',
      input: '当前状态与可见能力',
      output: lesson.prediction.prompt,
      why: `这一课观察的核心机制是“${lesson.mechanism}”。`,
      later: lesson.teachingLimit,
      icon: CircleDot,
    },
    {
      label: actionTrace.label,
      input: '上一步选出的动作',
      output: actionTrace.detail,
      why: '外部动作只有产生可记录结果，才能影响后续判断。',
      later: '真实模型选择、失败重试和资源限制。',
      icon: Wrench,
    },
    {
      label: '更新并继续',
      input: actionTrace.detail,
      output: resultTrace.detail,
      why: '新结果回到状态后，Agent 才能形成下一步或可靠结束。',
      later: '多轮调度、流式输出和持久化恢复。',
      icon: RefreshCw,
    },
  ]
  const active = nodes[activeIndex]!

  return (
    <section className="mental-model" id="mental-model" aria-labelledby="mental-model-heading">
      <header className="teaching-section-heading">
        <div><h2 id="mental-model-heading">先建立心智模型</h2><p>点击节点，先看清数据怎样流动，再运行下面的演示。</p></div>
        <span>WHY → MODEL</span>
      </header>
      <div className="model-flow" role="group" aria-label="可交互心智模型">
        {nodes.map((node, index) => {
          const Icon = node.icon
          return (
            <div className="model-flow-item" key={`${node.label}-${index}`}>
              <button
                type="button"
                aria-pressed={activeIndex === index}
                className={activeIndex === index ? 'is-active' : ''}
                onClick={() => setActiveIndex(index)}
              >
                <Icon aria-hidden="true" />
                <span>{node.label}</span>
              </button>
              {index < nodes.length - 1 && <span className="model-arrow" aria-hidden="true"><ArrowRight /><ArrowDown /></span>}
            </div>
          )
        })}
      </div>
      <div className="model-detail" aria-live="polite">
        <strong>{active.label}</strong>
        <dl>
          <div><dt>输入</dt><dd>{active.input}</dd></div>
          <div><dt>输出</dt><dd>{active.output}</dd></div>
          <div><dt>为什么需要</dt><dd>{active.why}</dd></div>
          <div><dt>暂时不用关心</dt><dd>{active.later}</dd></div>
        </dl>
      </div>
    </section>
  )
}
