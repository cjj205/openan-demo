import React from 'react'
import TBubble from './TBubble.jsx'
import useStageClock from './useStageClock.js'
import { NOTIF_WEIGHTS } from '../../storyline/panel-timing.js'

/* NotificationTPanel — Notification-T 详细交互流程（源自 react-panels，V3.13 复制入本工程）
   V3.26：标题「Notification-T」字体加载后实宽 ~99.2px（left 26 → 125.2），「详细交互流程」
   自 123 → 136（间距 ~10.8px）；动态分步（窗口：waimo-zx-notif 连线激活期 + 12 业务秒，
   见 panel-timing notifWindowOf）：①抢通前元素（消息行 + 抢通前对比卡）→ ②箭头图标 → ③抢通后元素 */

const ROWS_BEFORE = [
  { label: '隧道状态', value: 'down', color: '#e7434a' },
  { label: '时延', value: '1000000us', color: '#e7434a' },
  { label: '带宽', value: '20bps', color: '#e7434a' },
]

const ROWS_AFTER = [
  { label: '隧道状态', value: 'up', color: '#36c18d' },
  { label: '时延', value: '500000us', color: '#36c18d' },
  { label: '带宽', value: '25bps', color: '#36c18d' },
]

function CompareCard({ x, title, titleColor, headClass, cardClass, rows }) {
  return (
    <div className={'notif-card ' + cardClass} style={{ left: x, top: 0 }}>
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
        {/* ① 消息行 + 抢通前（V4：粤西隧道调优——调优前 down/1000000ms/20bps → 调优后 up/500000ms/25bps）；
            V5.22（用户规格）：气泡内容整体左移 5px——tail=right 气泡主体右缘 x=310（顶部尾巴凸至 319），
            左卡 11..147 / 右卡 163..299，距左右气泡边沿均 11px */}
        <div className={'p-abs ir-reveal' + on(1)} style={{ left: 11, top: 12, fontSize: 12, lineHeight: '20px', color: '#fff', whiteSpace: 'nowrap' }}>
          业务抢通成功，隧道调优已下发，业务已恢复。
        </div>
        <div className={'p-abs ir-reveal' + on(1)} style={{ left: 11, top: 40, width: 136, height: 120 }}>
          <CompareCard x={0} title="抢通前" titleColor="#e7434a" headClass="notif-card__head--red" cardClass="notif-card--red" rows={ROWS_BEFORE} />
        </div>
        {/* ③ 抢通后（V5.22 左移 5：右卡 163..299，与左卡 11..147 中缝 147..163，左右边距 11） */}
        <div className={'p-abs ir-reveal' + on(3)} style={{ left: 163, top: 40, width: 136, height: 120 }}>
          <CompareCard x={0} title="抢通后" titleColor="#36c18d" headClass="notif-card__head--green" cardClass="notif-card--green" rows={ROWS_AFTER} />
        </div>
        {/* ② 箭头（V5.11 用户规格：居中——水平居两卡中缝中心 x=155、垂直居卡片中线 y=100，
            置于两卡之后渲染叠于卡缘之上，桥接抢通前→抢通后） */}
        <img className={'p-abs ir-reveal' + on(2)} src="/assets/ic-double-arrow.svg" alt="" style={{ left: 137, top: 84, width: 36, height: 32.3 }} />
      </TBubble>
    </div>
  )
}
