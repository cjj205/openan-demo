// NegotiationPanel.jsx — Negotiation-T 详细交互面板（专线 ↔ 粤东 协商窗口呈现）
// 世界态 negotiation 驱动两阶段：request（粤东发出 Negotiation-T 请求）仅展示第一条消息；
// accept（专线返回补充信息，Task-T请求 重发）追加第二条消息（滚动下滑 + 红色框→cvlan 选项区
// 三角光束定射后自动选中，见 NegotiationDialog）；窗口结束延迟淡出卸载（动画收尾）。
// 定位：以 zx-yd-neg 连线盒（roles-data LINES）水平居中、下缘 +12px；面板收起重适配下
// 按 专线/粤东 卡中心中点锚定反向缩放（保比例、随两侧卡片刚体平移，见 roles.satCssStyle）。
import React, { useEffect, useState } from 'react';
import NegotiationDialog from '../../components/negotiation/NegotiationDialog';
import { CARDS, LINES, satCssStyle } from '../roles';

const NEG_LINE_KEY = 'zx-yd-neg';
const PANEL_W = 336; // 面板尺寸（NegotiationDialog.css）
const PANEL_H = 295;
const OUT_MS = 800; // 协商窗口结束后延迟卸载（淡出 + 光束/选中动画收尾）
// 各案例协商补充的 cvlan 与 Propose 文案（与 case-data.js 协商消息同源）
const CASE_NEG = {
  c1: { vlan: 'cvlan101', propose: '接入端口下挂多个VLAN子接口，请明确本业务的具体vlan信息。' },
  c2: { vlan: 'cvlan100', propose: '接入端口名称缺少vlan信息，无法唯一定位专业业务。' },
};

export default function NegotiationPanel({ world, pub }) {
  const phase = world ? world.negotiation : null;
  // 挂载态：{ accepted, out } —— 世界态回落后保留 800ms 淡出（动画收尾），期间恢复则复用
  const [st, setSt] = useState(null);
  useEffect(() => {
    if (phase) {
      const accepted = phase === 'accept';
      setSt((prev) => (prev && !prev.out && prev.accepted === accepted ? prev : { accepted, out: false }));
      return undefined;
    }
    setSt((prev) => (prev && !prev.out ? { ...prev, out: true } : prev));
    const timer = setTimeout(() => setSt(null), OUT_MS);
    return () => clearTimeout(timer);
  }, [phase]);
  if (!st) return null;
  const neg = CASE_NEG[pub.caseId] || CASE_NEG.c1;
  const line = LINES[NEG_LINE_KEY].box;
  const left = Math.round(line.x + line.w / 2 - PANEL_W / 2);
  const top = Math.round(line.y + line.h + 12);
  // 锚点：专线/粤东卡中心中点（面板随两侧卡片刚体平移、保持原比例）
  const ctr = (k) => ({ x: CARDS[k].box.x + CARDS[k].box.w / 2, y: CARDS[k].box.y + CARDS[k].box.h / 2 });
  const aZ = ctr('ZX'), aY = ctr('YD');
  const anchor = { x: (aZ.x + aY.x) / 2, y: (aZ.y + aY.y) / 2 };
  return (
    <div className="st-layer st-neglayer">
      <div
        className={st.out ? 'st-neg-item st-neg-out' : 'st-neg-item'}
        style={{ position: 'absolute', left, top, ...satCssStyle(pub, { x: left, y: top, w: PANEL_W, h: PANEL_H }, anchor) }}
      >
        <NegotiationDialog defaultSelected={neg.vlan} proposeText={neg.propose} accepted={st.accepted} />
      </div>
    </div>
  );
}
