import React, { useEffect, useRef } from 'react'
import TBubble from './TBubble.jsx'
import useStageClock from './useStageClock.js'

/* TaskTPanel — Task-T 详细交互流程（源自 react-panels，V3.13 复制入本工程）
   V3.22 动态分步（窗口：任务下发 → 编排完成，见 SubStepPanels taskTWindow）：
   ①首行任务描述 → ②匹配Prompt模板区（模板未选中）→ ③Task模板选中（专线投诉
   场景 高亮）→ ④自然语言→确定性任务 → ⑤任务类型 → ⑥任务目标 → ⑦任务上下文 →
   ⑧回复气泡（任务明确，马上执行！）；滚动区随各阶段自动下移（滚动条跟随）。
   位置左移右缘齐 ZX 卡左缘（778..1136），避免延展窗口遮挡 ZX 卡迷你步骤激活芯片。 */

// 各阶段滚动目标（内容坐标：阶段内容底缘 − 视口高 289；视口 = 330 − 顶偏移 41）
const SCROLL_TO = [0, 0, 0, 0, 0, 59, 227, 311]

export default function TaskTPanel(props) {
  const stage = useStageClock(props, 8)
  const scrollRef = useRef(null)
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTo({ top: SCROLL_TO[Math.min(stage, 8) - 1], behavior: 'smooth' })
  }, [stage])
  const on = (k) => (stage >= k ? ' ir-on' : '')
  return (
    <div className="glass-panel tdialog" style={{ width: 358, height: 330 }}>
      <div className="p-title-bar" style={{ left: 16, top: 14, background: '#8ca3fa' }} />
      <div
        className="p-title-text p-title-text--grad"
        style={{ left: 26, top: 11, backgroundImage: 'linear-gradient(90deg, #d0d8fd, #2070f3)' }}
      >
        Task-T
      </div>
      <div className="p-title-text" style={{ left: 74, top: 11 }}>
        详细交互流程
      </div>

      <div className="td-scroll" ref={scrollRef}>
        <div style={{ position: 'relative', height: 600 }}>
          {/* 消息气泡：高度包裹住任务上下文 */}
          <TBubble width={325} height={530} tail="left" style={{ left: 16, top: 0 }}>
            {/* ① 首行任务描述 */}
            <div
              className={'p-abs ir-reveal' + on(1)}
              style={{ left: 22, top: 12, width: 290, height: 40, fontSize: 12, lineHeight: '20px', color: '#fff' }}
            >
              P781-珠江新城-PTN7900专线中断，请启动专线诊断任务。
            </div>
            {/* ② 匹配Prompt模板区（③模板选中高亮） */}
            <div className={'td-hline ir-reveal' + on(2)} style={{ left: 22, top: 62, width: 290 }} />
            <div
              className={'p-abs ir-reveal' + on(2)}
              style={{ left: 22, top: 70, fontSize: 12, lineHeight: '20px', color: '#fff', whiteSpace: 'nowrap' }}
            >
              基于意图，精准匹配Prompt模板。
            </div>
            <div
              className={'p-abs ir-reveal' + on(2)}
              style={{ left: 22, top: 98, fontSize: 12, lineHeight: '20px', color: '#939393', whiteSpace: 'nowrap' }}
            >
              Task模板
            </div>
            <div className={'radio-group ir-reveal' + on(2)} style={{ left: 22, top: 122, width: 290, height: 32 }}>
              <div
                className={'radio-option radio-option--plain' + (stage >= 3 ? ' radio-option--glass' : '')}
                style={{ left: 2, top: 2, width: 88, height: 28, justifyContent: 'center', color: stage >= 3 ? '#fff' : undefined }}
              >
                专线投诉场景
              </div>
              <div className="radio-option" style={{ left: 94, top: 2, width: 64, height: 28, justifyContent: 'center' }}>
                节能场景
              </div>
              <div className="radio-option" style={{ left: 162, top: 2, width: 88, height: 28, justifyContent: 'center' }}>
                故障处理场景
              </div>
              <div className="radio-option" style={{ left: 254, top: 2, width: 34, height: 28, justifyContent: 'center' }}>
                ···
              </div>
            </div>
            {/* ④ 自然语言 → 确定性任务 */}
            <div className={'td-hline ir-reveal' + on(4)} style={{ left: 22, top: 164, width: 290 }} />
            <div
              className={'p-abs ir-reveal' + on(4)}
              style={{ left: 22, top: 172, fontSize: 12, lineHeight: '20px', color: '#fff', whiteSpace: 'nowrap' }}
            >
              自然语言 → 确定性任务
            </div>

            {/* 时间轴：空心圆点 + 虚线（圆点与各卡片垂直居中，随对应卡片渐入） */}
            <span className={'td-dot ir-reveal' + on(5)} style={{ left: 22, top: 226 }} />
            <span className={'td-dot ir-reveal' + on(6)} style={{ left: 22, top: 304 }} />
            <span className={'td-dot ir-reveal' + on(7)} style={{ left: 22, top: 432 }} />
            <span className={'td-dash ir-reveal' + on(6)} style={{ left: 25.5, top: 234, height: 70 }} />
            <span className={'td-dash ir-reveal' + on(7)} style={{ left: 25.5, top: 312, height: 120 }} />

            {/* ⑤⑥⑦ 任务卡片：任务类型 / 任务目标 / 任务上下文 */}
            <div className="p-abs" style={{ left: 34, top: 200, width: 275 }}>
              <div className={'td-card ir-reveal' + on(5)} style={{ width: 275, height: 60 }}>
                <div className="td-card__label" style={{ left: 16, top: 8 }}>
                  任务类型
                </div>
                <div className="td-card__value" style={{ left: 16, top: 32 }}>
                  传输专线业务投诉诊断
                </div>
              </div>
              <div className={'td-card ir-reveal' + on(6)} style={{ width: 275, height: 80, marginTop: 8 }}>
                <div className="td-card__label" style={{ left: 16, top: 8 }}>
                  任务目标
                </div>
                <div className="td-card__value" style={{ left: 16, top: 32, width: 243 }}>
                  对网络侧故障进行诊断，返回故障根因和修复建议等诊断结果信息。
                </div>
              </div>
              <div className={'td-card ir-reveal' + on(7)} style={{ width: 275, height: 160, marginTop: 8 }}>
                <div className="td-card__label" style={{ left: 16, top: 8 }}>
                  任务上下文
                </div>
                <div className="td-card__value" style={{ left: 16, top: 32, width: 243 }}>
                  投诉分类：专线质差
                  <br />
                  问题发生时间：2026-05-11 T08:21:46Z
                  <br />
                  OSS侧事件流水号：***
                  <br />
                  投诉详情：从5月11号早上8点半开始，深圳访问广州的响应延迟从平均12ms骤升至320ms…!
                </div>
              </div>
            </div>
          </TBubble>

          {/* ⑧ 回复消息（右侧） */}
          <div className={'p-abs ir-reveal' + on(8)} style={{ left: 178, top: 546, width: 163, height: 44 }}>
            <TBubble width={163} height={44} tail="right" style={{ left: 0, top: 0 }}>
              <div
                className="p-abs"
                style={{ left: 18, top: 12, fontSize: 12, lineHeight: '20px', color: '#fff', whiteSpace: 'nowrap' }}
              >
                任务明确，马上执行！
              </div>
            </TBubble>
          </div>
        </div>
      </div>
    </div>
  )
}
