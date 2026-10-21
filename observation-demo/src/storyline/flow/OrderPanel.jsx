// OrderPanel.jsx — V6.0 流式布局：工单区域工单卡（覆盖层流式组件）
// 设计工单卡子树（ORDERS.c1/c2）整组隐藏（roles.js FLOW_HIDE），本组件按同一列表槽位
//（24,170 起、卡 256×142、间距 16）重建，卡内纵向流式：工单号 → [图标+客户名+状态胶囊] →
// 描述（两行截断）→ 时间行（margin-top:auto 贴底）。选中态/角标/回放中胶囊/搜索与状态
// 过滤（orderVisible）/整卡点击切换案例（拖拽守卫）口径与 buildPatches/makeInteractions 一致。
import React, { useRef } from 'react';
import { ORDERS, orderVisible } from '../roles';
import { CASES } from '../cases';
import './flow.css';

// 受理时间行（设计烤入文案：日期｜用时N分钟）
const TIMES = {
  c1: '09-24 02:18:05｜用时173分钟',
  c2: '09-28 10:20:08｜用时39分钟',
};
// 卡图标（V5.44：两卡同款医院图标）
const ICONS = { c1: '/icons/ic_ebg_hospital.svg', c2: '/icons/ic_ebg_hospital.svg' };

function OrderCard({ k, pub }) {
  const d = useRef({ x: 0, y: 0 });
  const c = CASES[k];
  const selected = pub.caseId === k;
  const playing = !pub.world ? false : !pub.world.caseDone;
  const pill = selected && playing
    ? { text: '回放中', bg: 'rgba(92,172,255,0.15)', fg: 'rgba(92,172,255,1)' } // V5.32 蓝系
    : { text: '已完成', bg: 'rgba(9,170,113,0.15)', fg: 'rgba(54,193,141,1)' };
  return (
    <div className="fl-order"
      style={{ border: '1px solid ' + (selected ? 'rgba(46,134,222,1)' : 'rgba(119,119,119,1)') }}
      onPointerDown={(e) => { d.current = { x: e.clientX, y: e.clientY }; }}
      onClick={(e) => {
        if (Math.abs(e.clientX - d.current.x) > 5 || Math.abs(e.clientY - d.current.y) > 5) return;
        const sel = window.getSelection ? window.getSelection() : null;
        if (sel && String(sel).length > 0) return;
        pub.api.selectCase(k);
      }}
      title={c.desc}>
      {selected ? (
        <div className="fl-order__check"><img src="/icons/ic_selected.svg" alt="" draggable={false} /></div>
      ) : null}
      {/* V6.2（用户规格）：三行内容（行距 0.5rem）——工单号 / 单位名称行 / 末行
          （时间 + 展开[文字+向下角标]）；描述行删除 */}
      <div className="fl-order__no">{c.orderNo}</div>
      <div className="fl-order__row">
        <img src={ICONS[k]} alt="" draggable={false} />
        <span className="fl-order__cust" title={c.customer}>{c.customer}</span>
        <span className="fl-order__pill" style={{ background: pill.bg, color: pill.fg }}>{pill.text}</span>
      </div>
      <div className="fl-order__last">
        <span className="fl-order__time">{TIMES[k]}</span>
        <span className="fl-order__expand">展开
          <svg width="0.625rem" height="0.625rem" viewBox="0 0 10 10" style={{ transform: 'rotate(90deg)' }} aria-hidden="true">
            <path d="M3 1.5 L7.5 5 L3 8.5" fill="none" stroke="rgba(92,162,233,1)" strokeWidth="1.4"
              strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>
    </div>
  );
}

// 左尖角 SVG（V6.2：收起把手图标——参考日志面板把手箭头样式，10px 描边尖角；
// V6.2 用户规格：增亮提对比度 #C9C9C9）
const Chevron = () => (
  <svg width="0.625rem" height="0.625rem" viewBox="0 0 10 10" style={{ transform: 'rotate(180deg)' }} aria-hidden="true">
    <path d="M3 1.5 L7.5 5 L3 8.5" fill="none" stroke="rgba(201,201,201,1)" strokeWidth="1.4"
      strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function OrderPanel({ pub }) {
  if (pub.ordersHidden) return null;
  return (
    <>
      {/* V6.2（用户规格）：工单列表收起把手——设计 boder/箭头（23:137098/I23:137099）隐藏，
          本组件重建（12×48 @ 304,492，右圆角贴面板右缘；图标参考日志面板把手箭头样式，
          左指 = 收起方向）；点击收起（收起态由 PanelHandles 左缘把手展开） */}
      <button className="fl-ordertab" onClick={pub.api.toggleOrders}
        title="收起工单列表" aria-label="收起工单列表">
        <Chevron />
      </button>
      <div className="fl-orders" style={{ left: ORDERS.c1.box.x, top: ORDERS.c1.box.y }}>
        {/* V6.6（用户规格）：两案位置对调——第一张卡片展示 case2、第二张展示 case1
            （选中态/角标/回放中胶囊/过滤/点击切换按案例挂卡，随渲染序自动落位） */}
        {['c2', 'c1'].filter((k) => orderVisible(k, pub)).map((k) => <OrderCard key={k} k={k} pub={pub} />)}
      </div>
    </>
  );
}
