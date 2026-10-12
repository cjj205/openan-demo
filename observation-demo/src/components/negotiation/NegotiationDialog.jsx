import { useEffect, useRef, useState } from 'react'
import './NegotiationDialog.css'
import cpePanelUrl from './assets/cpe-panel.svg'

const OPTIONS = [
  { id: 'cvlan99', label: 'cvlan99' },
  { id: 'cvlan100', label: 'cvlan100' },
  { id: 'cvlan101', label: 'cvlan101' },
  { id: 'ellipsis', label: '···', disabled: true },
  { id: 'cvlan199', label: 'cvlan199' },
]

/* 气泡轮廓：顶边保持水平，尾巴是纵向边上的横向三角形凸起（聊天气泡样式） */
/* 消息 1（Propose）：右侧边顶部三角形尾巴，251×64（主体 241 + 尾巴 9 + 圆角） */
const PROPOSE_SHAPE =
  'M4 0 H250 L241 14 V60 Q241 64 237 64 H4 Q0 64 0 60 V4 Q0 0 4 0 Z'
/* 消息 2（Accept）：左侧边顶部三角形尾巴，313×180（主体 304 + 尾巴 9） */
const ACCEPT_SHAPE =
  'M0 0 H309 Q313 0 313 4 V176 Q313 180 309 180 H13 Q9 180 9 176 V14 Z'
/* 描边路径：整体内缩 0.5px，保证 1px 描边完整落在像素内（对应设计稿 INSIDE 对齐描边） */
const PROPOSE_STROKE_SHAPE =
  'M4 0.5 H249.5 L241.5 13.5 V59.5 Q240.5 63.5 236.5 63.5 H4 Q0.5 63.5 0.5 59.5 V4 Q0.5 0.5 4 0.5 Z'
const ACCEPT_STROKE_SHAPE =
  'M0.5 0.5 H308.5 Q312.5 0.5 312.5 4.5 V175.5 Q312.5 179.5 308.5 179.5 H13 Q9.5 179.5 9.5 175.5 V14 Z'

/* 三角光束定点（气泡内坐标）：顶点 = CPE 端口面板红色框底边中点
   （cpe-panel.svg 实例13 红框 242.5,4.5 19×19 → 面板左上 (31,67) 偏移），
   另两定点 = cvlan 选项区左右边沿（.nd-radio-group 31,139 268×32 的中线端点） */
const BEAM_APEX = { x: 283, y: 90.5 }
const BEAM_BASE = { leftX: 31, rightX: 299, y: 155 }
/* 光束时序（与 NegotiationDialog.css ndBeam 对齐，V2.25 放慢）：入场 0.7s → 光束 0.75s 起 1.6s
   （0.48s 生长点亮 / 0.64s 保持 / 0.48s 淡出）→ 淡出起始（≈1.87s）时自动选中默认 cvlan */
const BEAM_SELECT_AT = 1900

function RadioIcon({ color = '#777777' }) {
  return (
    <svg width="11" height="11" viewBox="0 0 11 11" aria-hidden="true">
      <circle cx="5.5" cy="5.5" r="4.4" fill="none" stroke={color} strokeWidth="1.3" />
    </svg>
  )
}

function Bubble({ width, height, shape, strokeShape, gradientId, gradientFrom, gradientTo, className, children }) {
  return (
    <div className={`nd-bubble ${className}`} style={{ width, height }}>
      <div className="nd-bubble__bg" style={{ clipPath: `path('${shape}')` }} />
      <svg
        className="nd-bubble__outline"
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        aria-hidden="true"
      >
        <defs>
          <linearGradient
            id={gradientId}
            x1={gradientFrom[0]}
            y1={gradientFrom[1]}
            x2={gradientTo[0]}
            y2={gradientTo[1]}
          >
            <stop offset="0" stopColor="#14FFAB" stopOpacity="0.52" />
            <stop offset="1" stopColor="#979797" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={strokeShape} fill="none" stroke={`url(#${gradientId})`} strokeWidth="1" />
      </svg>
      {children}
    </div>
  )
}

export default function NegotiationDialog({ defaultSelected = 'cvlan101', proposeText = '接入端口下挂多个VLAN子接口，请明确本业务的具体vlan信息。', accepted = false }) {
  const [selected, setSelected] = useState(null)
  const listRef = useRef(null)
  const vlan = (selected || defaultSelected).replace('cvlan', '')

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight
  }, [])

  // 专线返回补充信息（accepted）：第二条消息入场，滚动条平滑下滑；
  // 红色框 → cvlan 选项区三角光束落定淡出时，自动选中默认 cvlan（用户已手动选择则不覆盖）
  useEffect(() => {
    if (!accepted) {
      setSelected(null)
      return undefined
    }
    const el = listRef.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
    const timer = setTimeout(() => setSelected((s) => s || defaultSelected), BEAM_SELECT_AT)
    return () => clearTimeout(timer)
  }, [accepted, defaultSelected])

  return (
    <div className="negotiation-dialog" role="dialog" aria-label="Negotiation-T 详细交互流程">
      <div className="nd-accent-bar" />
      <div className="nd-title">
        <span className="nd-title__name">Negotiation-T</span>
        <span className="nd-title__desc">详细交互流程</span>
      </div>

      {/* 消息列表：垂直方向真实滚动 */}
      <div className="nd-messages" ref={listRef}>
        {/* 消息 1：Propose（右侧，右侧边顶部三角形尾巴）——协商请求期间仅此一条 */}
        <Bubble
          width={251}
          height={64}
          shape={PROPOSE_SHAPE}
          strokeShape={PROPOSE_STROKE_SHAPE}
          gradientId="nd-grad-propose"
          gradientFrom={[0.98, 0.64]}
          gradientTo={[0.02, 0.36]}
          className="nd-bubble--propose"
        >
          <p className="nd-bubble__text nd-bubble__text--propose">
            Propose：{proposeText}
          </p>
        </Bubble>

        {/* 消息 2：Accept（左侧，左侧边顶部三角形尾巴）——专线返回补充信息时呈现 */}
        {accepted ? (
          <Bubble
            width={313}
            height={180}
            shape={ACCEPT_SHAPE}
            strokeShape={ACCEPT_STROKE_SHAPE}
            gradientId="nd-grad-accept"
            gradientFrom={[0.02, 0.64]}
            gradientTo={[0.98, 0.36]}
            className="nd-bubble--accept"
          >
            <p className="nd-bubble__text nd-bubble__text--accept">
              Accept：通过资管查询Skill获取到vlan信息，补充cvlan：{vlan}。
            </p>

            <div className="nd-grid-glow" />

            {/* CPE 端口面板（设计稿导出的矢量图，266×48） */}
            <img
              className="nd-port-grid-svg"
              src={cpePanelUrl}
              width={266}
              height={48}
              alt="CPE 端口面板"
              draggable={false}
            />

            <div className="nd-radio-group" role="radiogroup" aria-label="cvlan 选项">
              {OPTIONS.map((opt) => {
                const isSelected = opt.id === selected
                return (
                  <button
                    key={opt.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    disabled={opt.disabled}
                    className={`nd-chip${isSelected ? ' nd-chip--selected' : ''}`}
                    onClick={() => !opt.disabled && setSelected(opt.id)}
                  >
                    {opt.disabled ? (
                      <span className="nd-chip__label">{opt.label}</span>
                    ) : (
                      <>
                        <RadioIcon color={isSelected ? '#FFFFFF' : '#777777'} />
                        <span className="nd-chip__label">{opt.label}</span>
                      </>
                    )}
                  </button>
                )
              })}
            </div>

            {/* 三角光束：红色框（顶点）→ cvlan 选项区左右边沿，落定后选中默认 cvlan */}
            <svg
              className="nd-beam"
              width="313"
              height="180"
              viewBox="0 0 313 180"
              aria-hidden="true"
              style={{ transformOrigin: `${BEAM_APEX.x}px ${BEAM_APEX.y}px` }}
            >
              <defs>
                <linearGradient
                  id="nd-beam-grad"
                  x1={BEAM_APEX.x}
                  y1={BEAM_APEX.y}
                  x2={BEAM_APEX.x}
                  y2={BEAM_BASE.y}
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="0" stopColor="rgb(92,172,255)" stopOpacity="0.5" />
                  <stop offset="1" stopColor="rgb(92,172,255)" stopOpacity="0.08" />
                </linearGradient>
              </defs>
              <polygon
                points={`${BEAM_APEX.x},${BEAM_APEX.y} ${BEAM_BASE.leftX},${BEAM_BASE.y} ${BEAM_BASE.rightX},${BEAM_BASE.y}`}
                fill="url(#nd-beam-grad)"
              />
            </svg>
          </Bubble>
        ) : null}
      </div>
    </div>
  )
}
