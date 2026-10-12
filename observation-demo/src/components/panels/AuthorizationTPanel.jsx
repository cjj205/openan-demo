import React from 'react'
import TBubble from './TBubble.jsx'

/* AuthorizationTPanel — Authorization-T 详细交互流程（源自 react-panels，V3.13 复制入本工程）。
   本工程故事线暂无 Authorization-T 连线/消息（V2.27：授权类消息不进入协作日志），
   组件已复制备用、暂不挂载；挂载模式可参照 SubStepPanels 的 Task-T/Notification-T。 */
export default function AuthorizationTPanel() {
  return (
    <div className="glass-panel tdialog" style={{ width: 336, height: 302 }}>
      <div className="p-title-bar" style={{ left: 16.4, top: 14, background: '#62b42e' }} />
      <div
        className="p-title-text p-title-text--grad"
        style={{ left: 26, top: 11, backgroundImage: 'linear-gradient(90deg, #dff4cc, #62b42e)' }}
      >
        Authorization-T
      </div>
      <div className="p-title-text" style={{ left: 135, top: 11 }}>
        详细交互流程
      </div>

      <TBubble width={111} height={44} tail="left" style={{ left: 16, top: 41 }}>
        <div className="p-abs" style={{ left: 22, top: 12, fontSize: 12, lineHeight: '20px', color: '#fff', whiteSpace: 'nowrap' }}>
          授权策略下发
        </div>
      </TBubble>

      <TBubble width={304} height={185} tail="right" style={{ left: 16, top: 101 }}>
        <div className="auth-pill" style={{ left: 105, top: 16 }}>
          抢通方案生成
        </div>
        <svg className="p-abs" style={{ left: 146.5, top: 44 }} width="5" height="33" viewBox="0 0 5 33">
          <path d="M2.5,0 V27" stroke="#2070f3" strokeWidth="1" fill="none" />
          <polygon points="0,26.5 5,26.5 2.5,32.5" fill="#2070f3" />
        </svg>
        <img className="p-abs" src="/assets/ic-decision.svg" alt="" style={{ left: 135, top: 76, width: 28, height: 28 }} />
        <div className="p-abs" style={{ left: 167, top: 80, fontSize: 12, lineHeight: '20px', color: '#fff', whiteSpace: 'nowrap' }}>
          查询预授权策略
        </div>
        <div className="p-abs" style={{ left: 113, top: 111, fontSize: 10, lineHeight: '10px', color: '#36c18d', whiteSpace: 'nowrap' }}>
          是
        </div>
        <div className="p-abs" style={{ left: 175, top: 111, fontSize: 10, lineHeight: '10px', color: '#939393', whiteSpace: 'nowrap' }}>
          否
        </div>
        <svg className="p-abs" style={{ left: 85, top: 103 }} width="67" height="34" viewBox="0 0 67 34">
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
      </TBubble>
    </div>
  )
}
