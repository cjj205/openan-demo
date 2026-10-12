import React from 'react'
import useStageClock from './useStageClock.js'
import { DISPATCH_WEIGHTS } from '../../storyline/panel-timing.js'

/* DispatchPanel — 调度处置面板（源自 react-panels，V3.1 复制入本工程）
   V3.30：动态分步（窗口：WAIMO mini2 激活 → Notification-T 面板窗口起点，
   见 panel-timing dispatchWindowOf）：①手机 → ②左侧消息气泡（含梯形光束） →
   ③右侧回复气泡（含梯形光束），各步随窗口进度渐入（ir-reveal/ir-on） */

export default function DispatchPanel(props) {
  const stage = useStageClock(props, 3, DISPATCH_WEIGHTS)
  const on = (k) => (stage >= k ? ' ir-on' : '')
  return (
    <div className="glass-panel tdialog" style={{ width: 360, height: 208 }}>
      <div className="p-title-bar" style={{ left: 16, top: 14 }} />
      <div className="p-title-text" style={{ left: 26, top: 11 }}>
        调度处置
      </div>

      {/* ② 梯形光束：手机（小边）→ 消息气泡（大边） */}
      <svg className={'disp-conn ir-reveal' + on(2)} width="15" height="96" viewBox="0 0 15 96" style={{ left: 184, top: 46 }} aria-hidden="true">
        <defs>
          <linearGradient id="disp-beam-l" x1="15" y1="48" x2="0" y2="48" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="rgb(201, 201, 201)" stopOpacity="0.5" />
            <stop offset="1" stopColor="rgb(201, 201, 201)" stopOpacity="0.08" />
          </linearGradient>
        </defs>
        <polygon points="0,0 15,29 15,67 0,96" fill="url(#disp-beam-l)" />
      </svg>

      {/* ③ 梯形光束：手机（小边）→ 回复气泡（大边） */}
      <svg className={'disp-conn ir-reveal' + on(3)} width="16" height="40" viewBox="0 0 16 40" style={{ left: 272, top: 86 }} aria-hidden="true">
        <defs>
          <linearGradient id="disp-beam-r" x1="0" y1="20" x2="16" y2="20" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="rgb(201, 201, 201)" stopOpacity="0.5" />
            <stop offset="1" stopColor="rgb(201, 201, 201)" stopOpacity="0.08" />
          </linearGradient>
        </defs>
        <polygon points="0,12 16,0 16,40 0,28" fill="url(#disp-beam-r)" />
      </svg>

      {/* ② 消息气泡 */}
      <div className={'disp-msg ir-reveal' + on(2)}>
        投诉工单的定位结果：***网元的***端口收光方向于0.279KM处发生光纤中断，请前往故障点修复。
      </div>

      {/* ① 手机预览（对话沉浸式，已去除烤入光带的左缘） */}
      <img className={'disp-phone ir-reveal' + on(1)} src="/assets/phone-preview.png" alt="" draggable={false} />

      {/* ③ 回复气泡 */}
      <div className={'disp-reply ir-reveal' + on(3)}>收到</div>
    </div>
  )
}
