// ConnectionLines.jsx — 连线 SVG 覆盖层（回放态替代设计稿 sprite 裁切图）
// 几何与高保真导出图逐像素对齐（见 codegen/export-storyline-data.js FLOW_PATHS 注释）：
// 水平段/竖直 riser + 圆角肘弯 + V 形箭头（检索线箭头位于起点、指向注册中心）；
// riser 段（dDim）设计稿呈 ~80% 不透明度；目标卡展示步骤描述增高时（dGrow）起点贴新卡底。
import React from 'react';
import { FLOWS } from '../paths';
import { remapPathEnds } from '../roles';

const MARKER = 'st-chev';

// 快照+收起态伪 world：设计连线 sprite 已隐藏（位图无法随集群端点重适配），
// 以「全部登场、全部连线可见」由 SVG 连线接管呈现
export function snapshotLinesWorld() {
  return {
    caseDone: false,
    visible: { WAIMO: true, ZX: true, YD: true, YX: true },
    seenLines: Object.fromEntries(Object.keys(FLOWS).map((k) => [k, true])),
    desc: {},
  };
}

// 选中当前应使用的连线 path（考虑目标卡增高；fit 提供时首/末端点随集群刚体重适配）
export function flowPick(world, key, fit) {
  const f = FLOWS[key];
  const grow = f.growKey && world && world.desc && world.desc[f.growKey];
  const d = grow ? f.dGrow : f.d;
  return fit ? remapPathEnds(fit, d, f.src, f.dst) : d;
}

// 反转绝对坐标 SVG 路径（M/H/V/L/Q）：响应方向消息沿同一几何逆向传递
export function reversePath(d) {
  const segs = [];
  let cur = null;
  const re = /([MHVLQ])((?:[\s,-]*-?[\d.]+)*)/g;
  let m;
  while ((m = re.exec(d)) !== null) {
    const n = (m[2].match(/-?[\d.]+/g) || []).map(Number);
    if (m[1] === 'M') { cur = { x: n[0], y: n[1] }; continue; }
    let to = null;
    let ctrl = null;
    if (m[1] === 'H') to = { x: n[0], y: cur.y };
    else if (m[1] === 'V') to = { x: cur.x, y: n[0] };
    else if (m[1] === 'L') to = { x: n[0], y: n[1] };
    else { ctrl = { x: n[0], y: n[1] }; to = { x: n[2], y: n[3] }; }
    segs.push({ from: cur, to, ctrl });
    cur = to;
  }
  if (!segs.length) return d;
  const f = (p) => p.x + ' ' + p.y;
  let out = 'M' + f(segs[segs.length - 1].to);
  for (let i = segs.length - 1; i >= 0; i--) {
    const s = segs[i];
    out += s.ctrl ? 'Q' + f(s.ctrl) + ' ' + f(s.from) : 'L' + f(s.from);
  }
  return out;
}

// 响应方向（rev）连线 path：取正向 path（含增高变体）后反转，激光自 dst 流向 src
export function flowPickRev(world, key, fit) {
  return reversePath(flowPick(world, key, fit));
}

export default function ConnectionLines({ world, pub }) {
  const fin = world.caseDone;
  // 完成态：仅呈现登场节点间的连线（案例二粤西不登场 → 专线—粤西两条线不呈现）
  const agentOn = (k) => (k !== 'YD' && k !== 'YX') || world.visible[k];
  const seen = Object.keys(FLOWS).filter((k) => {
    const f = FLOWS[k];
    if (!agentOn(f.src) || !agentOn(f.dst)) return false;
    return fin || world.seenLines[k];
  });
  if (!seen.length) return null;
  const colors = [...new Set(seen.map((k) => FLOWS[k].color))];
  return (
    <svg className="st-clines" viewBox="0 0 1920 1080" style={{ width: '120rem', height: '67.5rem' }} aria-hidden="true">
      <defs>
        {colors.map((c) => (
          <marker key={c} id={MARKER + c.replace('#', '')} viewBox="0 0 9 9"
            markerWidth="7" markerHeight="7" refX="7.6" refY="4.5" orient="auto-start-reverse">
            <path d="M1.5 1L7.5 4.5L1.5 8" fill="none" stroke={c} strokeWidth="1.3"
              strokeLinecap="round" strokeLinejoin="round" />
          </marker>
        ))}
      </defs>
      {seen.map((key) => {
        const f = FLOWS[key];
        const m = 'url(#' + MARKER + f.color.replace('#', '') + ')';
        const grow = f.growKey && world.desc && world.desc[f.growKey];
        // V2.13：端点随集群刚体重适配（首端贴源卡、末端贴目标卡），中间点随区域拉伸（连线拉长）；
        // dDim 暗段仅首端贴源卡、dOn 亮段仅末端贴目标卡（拆段路径的接缝点保持在拉伸网格上）
        const d = flowPick(world, key, pub);
        const dim = f.dDim ? remapPathEnds(pub, grow && f.dDimGrow ? f.dDimGrow : f.dDim, f.src, null) : null;
        const on = f.dOn ? remapPathEnds(pub, f.dOn, null, f.dst) : d;
        return (
          <g key={key} data-key={key}>
            {dim ? <path d={dim} fill="none" stroke={f.color} strokeWidth={1.5} strokeOpacity={0.8} /> : null}
            <path d={on} fill="none" stroke={f.color} strokeWidth={1.5} strokeLinecap="round"
              markerStart={f.arrow === 'start' ? m : undefined}
              markerEnd={f.arrow === 'end' ? m : undefined} />
          </g>
        );
      })}
    </svg>
  );
}
