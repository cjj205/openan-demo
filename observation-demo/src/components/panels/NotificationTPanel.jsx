import React from 'react'
import TBubble from './TBubble.jsx'
import useStageClock from './useStageClock.js'
import { NOTIF_WEIGHTS } from '../../storyline/panel-timing.js'

/* NotificationTPanel — Notification-T 详细交互流程（源自 react-panels，V3.13 复制入本工程）
   V3.26：标题「Notification-T」字体加载后实宽 ~99.2px（left 26 → 125.2），「详细交互流程」
   自 123 → 136（间距 ~10.8px）；动态分步（窗口：waimo-zx-notif 连线激活期 + 12 业务秒，
   见 panel-timing notifWindowOf）：①抢通前元素（消息行 + 抢通前对比卡）→ ②箭头图标 → ③抢通后元素 */

const ROWS_BEFORE = [
  { label: '时延', value: '320ms', color: '#e7434a' },
  { label: '丢包率', value: '100%', color: '#e7434a' },
  { label: '原路由', value: '隧道ab', color: '#fff' },
]

const ROWS_AFTER = [
  { label: '时延', value: '20ms', color: '#36c18d' },
  { label: '丢包率', value: '0.1%', color: '#36c18d' },
  { label: '原路由', value: '隧道bcd', color: '#fff' },
]

function CompareCard({ x, title, titleColor, headClass, rows }) {
  return (
    <div className="notif-card" style={{ left: x, top: 0 }}>
      <div className={'notif-card__head ' + headClass} />
      <div className="notif-card__title" style={{ color: titleColor }}>
        {title}
      </div>
      {rows.map((r, i) => (
        <React.Fragment key={r.label}>
          <div className="notif-label" style={{ top: 36 + i * 28 }}>
            {r.label}
          </div>
          <div className="notif-value" style={{ top: 36 + i * 28, color: r.color }}>
            {r.value}
          </div>
        </React.Fragment>
      ))}
    </div>
  )
}

export default function NotificationTPanel(props) {
  const stage = useStageClock(props, 3, NOTIF_WEIGHTS)
  const on = (k) => (stage >= k ? ' ir-on' : '')
  return (
    <div className="glass-panel tdialog" style={{ width: 352, height: 236 }}>
      <div className="p-title-bar" style={{ left: 16.4, top: 14, background: '#715afb' }} />
      <div
        className="p-title-text p-title-text--grad"
        style={{ left: 26, top: 11, backgroundImage: 'linear-gradient(90deg, #d5d3fd, #715afb)' }}
      >
        Notification-T
      </div>
      <div className="p-title-text" style={{ left: 136, top: 11 }}>
        详细交互流程
      </div>

      <TBubble width={320} height={181} tail="right" style={{ left: 16, top: 41 }}>
        {/* ① 消息行 + 抢通前 */}
        <div className={'p-abs ir-reveal' + on(1)} style={{ left: 16, top: 12, fontSize: 12, lineHeight: '20px', color: '#fff', whiteSpace: 'nowrap' }}>
          业务抢通成功，业务已恢复。
        </div>
        <div className={'p-abs ir-reveal' + on(1)} style={{ left: 16, top: 40, width: 136, height: 120 }}>
          <CompareCard x={0} title="抢通前" titleColor="#e7434a" headClass="notif-card__head--red" rows={ROWS_BEFORE} />
        </div>
        {/* ② 箭头 */}
        <img className={'p-abs ir-reveal' + on(2)} src="/assets/ic-double-arrow.svg" alt="" style={{ left: 122, top: 58, width: 36, height: 32.3 }} />
        {/* ③ 抢通后 */}
        <div className={'p-abs ir-reveal' + on(3)} style={{ left: 160, top: 40, width: 136, height: 120 }}>
          <CompareCard x={0} title="抢通后" titleColor="#36c18d" headClass="notif-card__head--green" rows={ROWS_AFTER} />
        </div>
      </TBubble>
    </div>
  )
}
