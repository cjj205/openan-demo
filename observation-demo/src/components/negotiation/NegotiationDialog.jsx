import { useEffect, useRef, useState } from 'react'
import './NegotiationDialog.css'
import cpePanelUrl from './assets/cpe-panel.svg'
import { bubblePaths } from '../panels/TBubble.jsx'
import wrapLines from '../panels/textWrap.js'

const OPTIONS = [
  { id: 'cvlan99', label: 'cvlan99' },
  { id: 'cvlan100', label: 'cvlan100' },
  { id: 'cvlan101', label: 'cvlan101' },
  { id: 'ellipsis', label: '···', disabled: true },
  { id: 'cvlan1208', label: 'cvlan1208' },
]

/* 气泡轮廓：顶边保持水平，尾巴是纵向边上的横向三角形凸起（聊天气泡样式）；
   V5：轮廓路径改由 bubblePaths 按宽高动态生成（与 Task-T 面板 TBubble 同源），
   气泡高度随文字实际折行数自适应——始终包裹住文字，不小于文字高度 */

/* 三角光束定点（气泡内坐标）：顶点 = CPE 端口面板红色框底边中点，另两定点 =
   cvlan 选项区左右边沿（.nd-radio-group 31,· 268×32 的中线端点）；随 V5 动态布局联动 */
const BEAM_BASE_X = { leftX: 31, rightX: 299 }

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

function Bubble({ width, height, tail, gradientId, className, children }) {
  const { fill, stroke, from, to } = bubblePaths(width, height, tail)
  return (
    <div className={`nd-bubble ${className}`} style={{ width, height }}>
      <div className="nd-bubble__bg" style={{ clipPath: `path('${fill}')` }} />
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
            x1={from[0]}
            y1={from[1]}
            x2={to[0]}
            y2={to[1]}
          >
            <stop offset="0" stopColor="#14FFAB" stopOpacity="0.52" />
            <stop offset="1" stopColor="#979797" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={stroke} fill="none" stroke={`url(#${gradientId})`} strokeWidth="1" />
      </svg>
      {children}
    </div>
  )
}

export default function NegotiationDialog({ defaultSelected = 'cvlan1208', proposeText = '接入端口名称不唯一，该端口下存在多个业务接入口，请提供具体的子接口ID或VLAN ID以确认唯一的业务。', accepted = false }) {
  const [selected, setSelected] = useState(null)
  const listRef = useRef(null)
  const vlan = (selected || defaultSelected).replace('cvlan', '')

  // V5：气泡高度按文字折行数自适应（包裹住文字）
  // Propose：文本区宽 204（nd-bubble__text--propose），顶 4 + 行数×20 + 底距 8
  const proposeLines = wrapLines('Propose：' + proposeText, 204)
  const proposeH = 4 + proposeLines * 20 + 8
  // Accept：V5.4（用户反馈：图片遮盖文字，下移图片）——文字与 CPE 面板图片间距恢复
  // 原设计节奏（2 行时 img 67 / radio 139 / 高 180）：顶 4 + 行数×20 + 间距 23；
  // 配合 .nd-bubble__text margin:0（原 <p> 默认边距使文字下移 12px，已清除）
  const acceptText = 'Accept：通过资管查询Skill获取到vlan信息，补充cvlan：' + vlan + '。'
  const acceptLines = wrapLines(acceptText, 254)
  const imgTop = 4 + acceptLines * 20 + 23
  const radioTop = imgTop + 48 + 24
  const acceptH = radioTop + 32 + 9
  const beamApex = { x: 283, y: imgTop + 23.5 }
  const beamBaseY = radioTop + 16

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
          height={proposeH}
          tail="right"
          gradientId="nd-grad-propose"
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
            height={acceptH}
            tail="left"
            gradientId="nd-grad-accept"
            className="nd-bubble--accept"
          >
            <p className="nd-bubble__text nd-bubble__text--accept">
              {acceptText}
            </p>

            <div className="nd-grid-glow" style={{ top: imgTop + 25 }} />

            {/* CPE 端口面板（设计稿导出的矢量图，266×48） */}
            <img
              className="nd-port-grid-svg"
              src={cpePanelUrl}
              width={266}
              height={48}
              style={{ top: imgTop }}
              alt="CPE 端口面板"
              draggable={false}
            />

            <div className="nd-radio-group" role="radiogroup" aria-label="cvlan 选项" style={{ top: radioTop }}>
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
              width={313}
              height={acceptH}
              viewBox={`0 0 313 ${acceptH}`}
              aria-hidden="true"
              style={{ transformOrigin: `${beamApex.x}px ${beamApex.y}px` }}
            >
              <defs>
                <linearGradient
                  id="nd-beam-grad"
                  x1={beamApex.x}
                  y1={beamApex.y}
                  x2={beamApex.x}
                  y2={beamBaseY}
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="0" stopColor="rgb(92,172,255)" stopOpacity="0.5" />
                  <stop offset="1" stopColor="rgb(92,172,255)" stopOpacity="0.08" />
                </linearGradient>
              </defs>
              <polygon
                points={`${beamApex.x},${beamApex.y} ${BEAM_BASE_X.leftX},${beamBaseY} ${BEAM_BASE_X.rightX},${beamBaseY}`}
                fill="url(#nd-beam-grad)"
              />
            </svg>
          </Bubble>
        ) : null}
      </div>
    </div>
  )
}
