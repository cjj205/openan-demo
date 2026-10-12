import React from 'react'

export default function PlatformNodeCard() {
  return (
    <div className="platform-card">
      <img className="p-abs" src="/assets/ic-roma.svg" alt="" style={{ left: 56, top: 12, width: 32, height: 32 }} />
      <span className="platform-card__name" style={{ left: 44, top: 52 }}>能开平台</span>
      <div className="platform-card__sub" style={{ left: 12, top: 82, width: 120, height: 48 }}>
        <img className="p-abs" src="/assets/ic-checkin.svg" alt="" style={{ left: 12, top: 8, width: 32, height: 32 }} />
        <span className="platform-card__subname" style={{ left: 52, top: 13 }}>注册中心</span>
      </div>
    </div>
  )
}
