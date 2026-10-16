import React, { useEffect, useRef } from 'react'
import TBubble from './TBubble.jsx'
import useStageClock from './useStageClock.js'
import wrapLines from './textWrap.js'

/* TaskTPanel — Task-T 详细交互流程（源自 react-panels，V3.13 复制入本工程）
   V3.22 动态分步（窗口：任务下发 → 编排完成，见 SubStepPanels taskTWindow）：
   ①首行任务描述 → ②匹配Prompt模板区（模板未选中）→ ③Task模板选中（专线投诉
   场景 高亮）→ ④自然语言→确定性任务 → ⑤任务类型 → ⑥任务目标 → ⑦任务上下文 →
   ⑧回复气泡（任务明确，马上执行！）；滚动区随各阶段自动下移（滚动条跟随）。
   V5：消息气泡/任务卡片高度按文字实际折行数自适应（包裹住文字，不小于文字高度）——
   卡片高 = 标签 32 + 行数×20 + 底距 10；气泡高 = 卡片栈底 + 底距 14；
   回复气泡与滚动目标随布局联动（SCROLL_TO 按实测内容底缘计算）。 */

// V4：首行任务描述/任务类型/任务上下文随案例切换（工单1 中断 / 工单2 质差——原文档 Task-T 消息口径）
const CASE_TT = {
  c1: {
    first: '发起专线投诉诊断：广州-深圳GE1508KA/P 专线中断',
    type: '集客专线业务投诉诊断',
    target: '基于用户的投诉上下文信息，对网络侧故障进行根因诊断，返回故障根因、修复建议等诊断结果信息。',
    context: '电路编号：广州-深圳GE1508KA/P；产品编号：30122038024；A端接入端口：P36169-YWHJ-棠溪村微网格业务汇聚机房1（990）-1-1-TPN1EM10F-10-ETH；Z端接入端口：24696-华泰证券万国数据-L-T-3-1-1-TPK1EX4S-4-ETH.2501-2502；故障发生时间：2026-09-24 02:18:05；故障现象：专线中断；OSS侧事件流水号：CMCC-GZ-TSCLX-20260924-004403',
  },
  c2: {
    first: '发起专线投诉诊断：广州-汕头FE2100KA/P 专线质差',
    type: '集客专线业务投诉诊断',
    target: '基于用户的投诉上下文信息，对网络侧故障进行根因诊断，返回故障根因、修复建议等诊断结果信息。',
    context: '电路编号：广州-汕头FE2100KA/P；产品编号：30122038024；A端接入端口：P1310-中石油（黄埔大道中路-风光路）-VIP-JK-3A-1-1-TN81EG8E-1-ETH.409；Z端接入端口：21722-汕头潮阳关埠加油站-1-4-TND1EF8T-1-ETH.3532；故障发生时间：2026-09-28 10:20:08；故障现象：专线质差；OSS侧事件流水号：CMCC-GZ-TSCLX-20260928-008503',
  },
}

const VIEW_H = 289 // 滚动视口高（面板 330 − 顶偏移 41）

export default function TaskTPanel(props) {
  const stage = useStageClock(props, 8)
  const tt = CASE_TT[props.caseId === 'c2' ? 'c2' : 'c1']
  // V5：卡片/气泡高度按文字折行数自适应（气泡始终包裹住全部文字）
  const typeH = 32 + wrapLines(tt.type, 243) * 20 + 10
  const targetH = 32 + wrapLines(tt.target, 243) * 20 + 10
  const ctxH = 32 + wrapLines(tt.context, 243) * 20 + 10
  const targetBottom = 200 + typeH + 8 + targetH
  const ctxBottom = targetBottom + 8 + ctxH
  const bubbleH = ctxBottom + 14
  const replyTop = bubbleH + 16
  const contentH = replyTop + 44 + 16
  // 各阶段滚动目标（内容底缘 − 视口高；末段滚至内容底部）
  const SCROLL_TO = [0, 0, 0, 0, 0, Math.max(0, targetBottom - VIEW_H), Math.max(0, ctxBottom - VIEW_H), Math.max(0, contentH - VIEW_H)]
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
        <div style={{ position: 'relative', height: contentH }}>
          {/* 消息气泡：高度包裹住任务上下文（V5 随文字折行自适应） */}
          <TBubble width={325} height={bubbleH} tail="left" style={{ left: 16, top: 0 }}>
            {/* ① 首行任务描述 */}
            <div
              className={'p-abs ir-reveal' + on(1)}
              style={{ left: 22, top: 12, width: 290, height: 40, fontSize: 12, lineHeight: '20px', color: '#fff' }}
            >
              {tt.first}
            </div>
            {/* ② 匹配Prompt模板区（③模板选中高亮） */}
            <div className={'td-hline ir-reveal' + on(2)} style={{ left: 22, top: 62, width: 290 }} />
            <div
              className={'p-abs ir-reveal' + on(2)}
              style={{ left: 22, top: 70, fontSize: 12, lineHeight: '20px', color: '#fff', whiteSpace: 'nowrap' }}
            >
              1、基于意图，精准匹配Prompt模板。
            </div>
            <div
              className={'p-abs ir-reveal' + on(2)}
              style={{ left: 22, top: 98, fontSize: 12, lineHeight: '20px', color: '#939393', whiteSpace: 'nowrap' }}
            >
              Task模板
            </div>
            <div className={'radio-group ir-reveal' + on(2)} style={{ left: 22, top: 122, width: 290, height: 32 }}>
              {/* V5.6（用户规格）：初始全部未选中（统一 --plain 素态），③ 段动态选中「专线投诉场景」 */}
              <div
                className={'radio-option radio-option--plain' + (stage >= 3 ? ' radio-option--glass' : '')}
                style={{ left: 2, top: 2, width: 88, height: 28, justifyContent: 'center', color: stage >= 3 ? '#fff' : undefined }}
              >
                专线投诉场景
              </div>
              <div className="radio-option radio-option--plain" style={{ left: 94, top: 2, width: 64, height: 28, justifyContent: 'center' }}>
                节能场景
              </div>
              <div className="radio-option radio-option--plain" style={{ left: 162, top: 2, width: 88, height: 28, justifyContent: 'center' }}>
                故障处理场景
              </div>
              {/* V5.33（用户规格）：省略号缩小（12px → 9px） */}
              <div className="radio-option radio-option--plain" style={{ left: 254, top: 2, width: 34, height: 28, justifyContent: 'center', fontSize: 9 }}>
                ···
              </div>
            </div>
            {/* ④ 自然语言 → 确定性任务 */}
            <div className={'td-hline ir-reveal' + on(4)} style={{ left: 22, top: 164, width: 290 }} />
            <div
              className={'p-abs ir-reveal' + on(4)}
              style={{ left: 22, top: 172, fontSize: 12, lineHeight: '20px', color: '#fff', whiteSpace: 'nowrap' }}
            >
              2、自然语言 → 确定性任务
            </div>

            {/* 时间轴：空心圆点 + 虚线（圆点与各卡片垂直居中，随对应卡片渐入） */}
            <span className={'td-dot ir-reveal' + on(5)} style={{ left: 22, top: 226 }} />
            <span className={'td-dot ir-reveal' + on(6)} style={{ left: 22, top: 200 + typeH + 8 + targetH / 2 - 4 }} />
            <span className={'td-dot ir-reveal' + on(7)} style={{ left: 22, top: targetBottom + 8 + ctxH / 2 - 4 }} />
            <span className={'td-dash ir-reveal' + on(6)} style={{ left: 25.5, top: 234, height: 200 + typeH + 8 + targetH / 2 - 4 - 234 }} />
            <span className={'td-dash ir-reveal' + on(7)} style={{ left: 25.5, top: 200 + typeH + 8 + targetH / 2 + 4, height: targetBottom + 8 + ctxH / 2 - 4 - (200 + typeH + 8 + targetH / 2 + 4) }} />

            {/* ⑤⑥⑦ 任务卡片：任务类型 / 任务目标 / 任务上下文（高度随文字自适应） */}
            <div className="p-abs" style={{ left: 34, top: 200, width: 275 }}>
              <div className={'td-card ir-reveal' + on(5)} style={{ width: 275, height: typeH }}>
                <div className="td-card__label" style={{ left: 16, top: 8 }}>
                  任务类型
                </div>
                <div className="td-card__value" style={{ left: 16, top: 32 }}>
                  {tt.type}
                </div>
              </div>
              <div className={'td-card ir-reveal' + on(6)} style={{ width: 275, height: targetH, marginTop: 8 }}>
                <div className="td-card__label" style={{ left: 16, top: 8 }}>
                  任务目标
                </div>
                <div className="td-card__value" style={{ left: 16, top: 32, width: 243 }}>
                  {tt.target}
                </div>
              </div>
              <div className={'td-card ir-reveal' + on(7)} style={{ width: 275, height: ctxH, marginTop: 8 }}>
                <div className="td-card__label" style={{ left: 16, top: 8 }}>
                  任务上下文
                </div>
                <div className="td-card__value" style={{ left: 16, top: 32, width: 243 }}>
                  {tt.context}
                </div>
              </div>
            </div>
          </TBubble>

          {/* ⑧ 回复消息（右侧，随气泡高度落位） */}
          <div className={'p-abs ir-reveal' + on(8)} style={{ left: 178, top: replyTop, width: 163, height: 44 }}>
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
