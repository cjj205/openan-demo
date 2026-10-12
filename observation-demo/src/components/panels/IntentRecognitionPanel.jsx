// IntentRecognitionPanel.jsx — 投诉识别：意图识别（ReAct 推理环）
// V3.21 动态分步呈现：面板随 WAIMO mini0 激活窗口挂载，内容按窗口进度分五步渐入——
// ①输入 → ②Reasoning → ③Action → ④Observation → ⑤输出（已出现的步骤常驻累计，
// 窗口末态 = 设计全量版式）；中央 LLM 图标与面板标题常驻，外圈白色箭头持续绕行。
// V3.22：步进时钟抽为 useStageClock 共享；V3.23：步进节奏改权重制（INTENT_WEIGHTS，
// 与 panel-timing/单步节拍同源）——首末步留足阅读停留，中间三步加速展示。
import React from 'react'
import useStageClock from './useStageClock.js'
import { INTENT_WEIGHTS } from '../../storyline/panel-timing.js'

export default function IntentRecognitionPanel(props) {
  const step = useStageClock(props, 5, INTENT_WEIGHTS)
  const on = (k) => (step >= k ? ' ir-on' : '')
  return (
    <div className="glass-panel" style={{ width: 498, height: 232 }}>
      <div className="p-title-bar" style={{ left: 16, top: 14 }} />
      <div className="p-title-text" style={{ left: 26, top: 11 }}>投诉识别：意图识别</div>

      {/* 中央 LLM 图标常驻 + 外圈白色箭头独立图层（顺时针绕行，见 panels.css .orb-arrows） */}
      <img
        className="p-abs"
        src="/assets/orb.svg"
        alt=""
        style={{ left: 186.69, top: 39.25, width: 171.48, height: 171.48 }}
      />
      <img
        className="p-abs orb-arrows"
        src="/assets/orb-arrows.svg"
        alt=""
        style={{ left: 186.69, top: 39.25, width: 171.48, height: 171.48 }}
      />
      <div className="orb-label" style={{ left: 232, top: 136 }}>LLM React Agent</div>

      {/* ① 输入 */}
      <div className={'p-io-title ir-reveal' + on(1)} style={{ left: 28, top: 96 }}>输入：用户投诉文本</div>
      <svg className={'p-abs ir-reveal' + on(1)} style={{ left: 28, top: 112 }} width="185" height="16" viewBox="0 0 185 16" fill="none">
        <path d="M0 8 H176" stroke="#715AFB" strokeWidth="2" strokeLinecap="round" />
        <path d="M170 3 L176 8 L170 13" stroke="#715AFB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <ul className={'p-io-list ir-reveal' + on(1)} style={{ left: 28, top: 124, width: 172 }}>
        <li>投诉现象：客户来电反映专线故障无法使用，重启设备也是一样。</li>
        <li>产品类型：传输专线</li>
        <li>接入方式：传输</li>
      </ul>

      {/* ② Reasoning */}
      <div className={'p-pill-caption ir-reveal' + on(2)} style={{ left: 121, top: 50, width: 120 }}>自主推理，总思考怎么做。</div>
      <div className={'p-pill ir-reveal' + on(2)} style={{ left: 168, top: 64, width: 73 }}>Reasoning</div>

      {/* ③ Action */}
      <div className={'p-pill-caption ir-reveal' + on(3)} style={{ left: 323, top: 68, width: 116 }}>
        1．文本抽取、意图分类
        <br />
        2．检索、查询工单知识库
      </div>
      <div className={'p-pill ir-reveal' + on(3)} style={{ left: 322, top: 100, width: 73 }}>Action</div>

      {/* ④ Observation */}
      <div className={'p-pill ir-reveal' + on(4)} style={{ left: 190, top: 172, width: 80 }}>Observation</div>
      <div className={'p-pill-caption ir-reveal' + on(4)} style={{ left: 110, top: 202, width: 160 }}>获取执行结果，观察是否满足要求。</div>

      {/* ⑤ 输出 */}
      <div className={'p-io-title ir-reveal' + on(5)} style={{ left: 311, top: 165 }}>输出：投诉现象和投诉意图</div>
      <svg className={'p-abs ir-reveal' + on(5)} style={{ left: 271, top: 177 }} width="199" height="16" viewBox="0 0 199 16" fill="none">
        <path d="M0 8 H190" stroke="#09AA71" strokeWidth="2" strokeLinecap="round" />
        <path d="M184 3 L190 8 L184 13" stroke="#09AA71" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div className={'p-io-sub ir-reveal' + on(5)} style={{ left: 311, top: 190 }}>集客传输专线不可用投诉场景</div>
    </div>
  )
}
