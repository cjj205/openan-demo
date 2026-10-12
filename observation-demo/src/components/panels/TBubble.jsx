import React from 'react'

/* TBubble — XX-T 详细交互流程消息气泡（源自 react-panels，V3.13 复制入本工程）
   气泡轮廓：顶边保持水平，尾巴是纵向边上的横向三角形凸起（聊天气泡样式）
   —— 与 NegotiationDialog 同型
   left：左侧边顶部尾巴（斜边在左侧，顶边向左延长）
   right：右侧边顶部尾巴（斜边在右侧，顶边向右延长） */

export function bubblePaths(width, height, tail) {
  if (tail === 'left') {
    return {
      fill: `M0 0 H${width - 4} Q${width} 0 ${width} 4 V${height - 4} Q${width} ${height} ${width - 4} ${height} H13 Q9 ${height} 9 ${height - 4} V14 Z`,
      stroke: `M0.5 0.5 H${width - 4.5} Q${width - 0.5} 0.5 ${width - 0.5} 4.5 V${height - 4.5} Q${width - 0.5} ${height - 0.5} ${width - 4.5} ${height - 0.5} H13 Q9.5 ${height - 0.5} 9.5 ${height - 4.5} V14 Z`,
      from: [0.02, 0.64],
      to: [0.98, 0.36],
    }
  }
  return {
    fill: `M4 0 H${width - 1} L${width - 10} 14 V${height - 4} Q${width - 10} ${height} ${width - 14} ${height} H4 Q0 ${height} 0 ${height - 4} V4 Q0 0 4 0 Z`,
    stroke: `M4 0.5 H${width - 1.5} L${width - 9.5} 13.5 V${height - 4.5} Q${width - 9.5} ${height - 0.5} ${width - 13.5} ${height - 0.5} H4 Q0.5 ${height - 0.5} 0.5 ${height - 4.5} V4 Q0.5 0.5 4 0.5 Z`,
    from: [0.98, 0.64],
    to: [0.02, 0.36],
  }
}

export default function TBubble({ width, height, tail = 'left', style, children }) {
  const { fill, stroke, from, to } = bubblePaths(width, height, tail)
  const gid = `tdg-${tail}-${width}x${height}`
  return (
    <div className="td-bubble" style={{ width, height, ...style }}>
      <div className="td-bubble__bg" style={{ clipPath: `path('${fill}')` }} />
      <svg
        className="td-bubble__outline"
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={gid} x1={from[0]} y1={from[1]} x2={to[0]} y2={to[1]}>
            <stop offset="0" stopColor="#14FFAB" stopOpacity="0.52" />
            <stop offset="1" stopColor="#979797" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={stroke} fill="none" stroke={`url(#${gid})`} strokeWidth="1" />
      </svg>
      {children}
    </div>
  )
}
