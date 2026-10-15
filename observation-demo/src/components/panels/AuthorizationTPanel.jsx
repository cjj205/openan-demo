import React from 'react'
import TBubble from './TBubble.jsx'
import useStageClock from './useStageClock.js'
import { AUTH_WEIGHTS } from '../../storyline/panel-timing.js'

/* AuthorizationTPanel — Authorization-T 动网操作预授权检查（源自 react-panels，V3.13 复制入本工程）。
   V5.11（用户规格）：面板名称「Authorization-T 动网操作预授权检查」（曾名「动网操作预授权判断
   详细交互流程」）；不展示「授权策略下发」消息（面板相应上移收紧 302→246）。
    挂载窗口 = Task-T响应 汇总回传结束（384）→ 粤西 mini1（抢通执行）开始（420）
    （panel-timing authorizationWindowOf，V5.17：面板消失后才开始抢通执行；
    V5.18：抢通方案上报在抢通执行完成后发送），展示于粤西卡左侧（SubStepPanels）。
   流程图分步（用户规格 V5.9）：①抢通方案生成 → ②向下箭头 + 查询预授权策略 →
   ③剩余元素**同时**出现（分支箭头连线、是/否、执行动网操作、人工授权）；
   主干与「是」分支箭头带流动虚线动画（panels.css .auth-flow）。 */
export default function AuthorizationTPanel(props) {
  const stage = useStageClock(props, 3, AUTH_WEIGHTS)
  const on = (k) => (stage >= k ? ' ir-on' : '')
  return (
    <div className="glass-panel tdialog" style={{ width: 336, height: 246 }}>
      <div className="p-title-bar" style={{ left: 16.4, top: 14, background: '#62b42e' }} />
      <div
        className="p-title-text p-title-text--grad"
        style={{ left: 26, top: 11, backgroundImage: 'linear-gradient(90deg, #dff4cc, #62b42e)' }}
      >
        Authorization-T
      </div>
      <div className="p-title-text" style={{ left: 148, top: 11 }}>
        动网操作预授权检查
      </div>

      {/* 大气泡（①② 内容容器，随首段内容渐入；V5.11 去除「授权策略下发」后自 101 上移至 45） */}
      <div className={'p-abs ir-reveal' + on(1)} style={{ left: 16, top: 45 }}>
        <TBubble width={304} height={185} tail="right">
          {/* ① 抢通方案生成 */}
          <div className="auth-pill" style={{ left: 105, top: 16 }}>
            抢通方案生成
          </div>

          {/* ② 主干向下箭头（流动虚线；p-abs 绝对定位于气泡内，随「查询预授权策略」同段出现） */}
          <svg className={'p-abs auth-flow ir-reveal' + on(2)} style={{ left: 146.5, top: 44 }} width="5" height="33" viewBox="0 0 5 33">
            <path d="M2.5,0 V27" stroke="#2070f3" strokeWidth="1" fill="none" />
            <polygon points="0,26.5 5,26.5 2.5,32.5" fill="#2070f3" />
          </svg>

          {/* ② 查询预授权策略（决策图标 + 文字） */}
          <div className={'ir-reveal' + on(2)} style={{ position: 'absolute', left: 0, top: 0, width: 304, height: 185 }}>
            <img className="p-abs" src="/assets/ic-decision.svg" alt="" style={{ left: 135, top: 76, width: 28, height: 28 }} />
            <div className="p-abs" style={{ left: 167, top: 80, fontSize: 12, lineHeight: '20px', color: '#fff', whiteSpace: 'nowrap' }}>
              查询预授权策略
            </div>
          </div>

          {/* ③ 剩余元素同时出现：是/否 + 分支箭头 + 执行动网操作 + 人工授权（箭头均 p-abs 绝对定位） */}
          <div className={'ir-reveal' + on(3)} style={{ position: 'absolute', left: 0, top: 0, width: 304, height: 185 }}>
            <div className="p-abs" style={{ left: 113, top: 111, fontSize: 10, lineHeight: '10px', color: '#36c18d', whiteSpace: 'nowrap' }}>
              是
            </div>
            <div className="p-abs" style={{ left: 175, top: 111, fontSize: 10, lineHeight: '10px', color: '#939393', whiteSpace: 'nowrap' }}>
              否
            </div>
            <svg className="p-abs auth-flow" style={{ left: 85, top: 103 }} width="67" height="34" viewBox="0 0 67 34">
              <path d="M64.5,1 V17 H2.5 V27" stroke="#2070f3" strokeWidth="1" fill="none" />
              <polygon points="0,26.5 5,26.5 2.5,32.5" fill="#2070f3" />
            </svg>
            <svg className="p-abs" style={{ left: 147, top: 103 }} width="67" height="34" viewBox="0 0 67 34">
              <path d="M2.5,1 V17 H64.5 V27" stroke="#2070f3" strokeWidth="1" fill="none" />
              <polygon points="62,26.5 67,26.5 64.5,32.5" fill="#2070f3" />
            </svg>
            <div className="auth-pill" style={{ left: 43, top: 136 }}>
              执行动网操作
            </div>
            <div className="auth-pill auth-pill--gray" style={{ left: 167, top: 136 }}>
              人工授权
            </div>
          </div>
        </TBubble>
      </div>
    </div>
  )
}
