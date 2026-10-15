// StorylineOverlays.jsx — 覆盖层总装
// 快照态（默认加载）：仅渲染透明交互层（回放工具栏/工单卡/缩放按钮/日志传感器），画面与设计稿逐像素一致
// （例外为用户要求的有意偏差：房间白色高亮底默认隐藏、第二条日志改文字、占位文案粤东/粤西化）
// 回放态：流程覆盖层（连线/圆点/描述）随画布缩放变换；日志表接管静态行
import React, { useContext } from 'react';
import { StoryContext } from '../StorylineContext';
import { CASES } from '../cases';
import { LOGS, ROOMS, overlayFitStyle, overlayZoomStyle, logFitStyle, totalFactors } from '../roles';
import ConnectionFlow from './ConnectionFlow';
import ConnectionLines, { snapshotLinesWorld } from './ConnectionLines';
import MiniCircles from './MiniCircles';
import StepDesc from './StepDesc';
import NegotiationPanel from './NegotiationPanel';
import SubStepPanels from './SubStepPanels';
import LogTable from './LogTable';
import Toolbar from './Toolbar';
import WorkOrderSel from './WorkOrderSel';
import LeftSearch from './LeftSearch';
import OrderFilter from './OrderFilter';
import ZoomToolbar from './ZoomToolbar';
import PanelHandles from './PanelHandles';

// 组间连线（客服—监控室—传输室）滑块动效：渐变短条沿线从左端滑到右端、首尾淡入淡出
// 关键帧由导出的连线/滑块几何生成（roles-data.js ROOMS.glides）；
// V5.12（用户规格）：行程收窄至连线两端以内（连线 175.64..435.58 宽 259.94 / 515.58..1099.43
// 宽 583.85，滑块 80 → 行程 ±89.97 / ±251.93）——滑块不再越至矩形胶囊上
const GLIDE_LIM = [89.97, 251.93];
const GLIDE_CSS = ROOMS.glides.map((g, i) => {
  const lim = GLIDE_LIM[i] != null ? GLIDE_LIM[i] : Math.max(Math.abs(g.from), Math.abs(g.to));
  const from = -Math.min(Math.abs(g.from), lim);
  const to = Math.min(g.to, lim);
  return '.st-glide' + i + '{animation:stGlide' + i + ' ' + g.dur + 's linear infinite}' +
    '@keyframes stGlide' + i + '{' +
      '0%{transform:translateX(' + from + 'px);opacity:0}' +
      '15%{opacity:.8}' +
      '85%{opacity:.8}' +
      '100%{transform:translateX(' + to + 'px);opacity:0}' +
    '}';
}).join('');

function LogSensor({ onActivate, fit }) {
  const b = LOGS.panelBox;
  // 顶部让出 14px 把手带（设计把手可点收起，V2.12），其余区域滚轮/点击点亮日志
  return (
    <div
      className="st-logsensor"
      style={{ left: b.x, top: b.y + 14, width: b.w, height: b.h - 14, ...fit }}
      onWheel={onActivate}
      onPointerDown={onActivate}
      title="A2A-T协作日志"
    />
  );
}

export default function StorylineOverlays() {
  const pub = useContext(StoryContext);
  if (!pub) return null;
  const live = !!pub.world;
  const logs = !pub.logHidden && live ? pub.world.logs : (!pub.logHidden && pub.logLive ? CASES[pub.caseId].logs : null);
  const zoomStyle = overlayFitStyle(pub);
  // V2.21：内层 .st-zoomz = 用户缩放 Z（绕画布中心、瞬时）——与 .fc-zoom 区域内容同步，
  // 外层 .st-zoomwrap 仍为区域重适配 F（收起/展开 0.25s 过渡），等效 CTM = F∘Z
  const zoomZ = overlayZoomStyle(pub);
  // 左栏收起时日志面板内容（实时表/传感器）随面板同步左向拉伸
  const lgFit = logFitStyle(pub, LOGS.bodyBox.x);
  // V2.13/V2.14：快照+收起/非 16:9 视口——设计连线 sprite 已隐藏（位图无法随集群端点重适配），改由 SVG 全量呈现
  const TF = totalFactors(pub);
  const lineWorld = live ? pub.world : ((TF.fx !== 1 || TF.fy !== 1) ? snapshotLinesWorld() : null);
  return (
    <>
      <style>{GLIDE_CSS}</style>
      <div className="st-zoomwrap" style={zoomStyle}>
        <div className="st-zoomz" style={zoomZ}>
          {lineWorld ? <ConnectionLines world={lineWorld} pub={pub} /> : null}
          {live ? (
            <>
              <ConnectionFlow world={pub.world} pub={pub} />
              <StepDesc world={pub.world} pub={pub} />
              <NegotiationPanel world={pub.world} pub={pub} />
            </>
          ) : null}
          <MiniCircles world={pub.world} pub={pub} />
          <SubStepPanels world={pub.world} pub={pub} />
        </div>
      </div>
      <Toolbar pub={pub} />
      <ZoomToolbar pub={pub} />
      {!logs ? null : <LogTable logs={logs} anchor={live ? 'bottom' : 'top'} pub={pub} />}
      {pub.logHidden || live || pub.logLive ? null : <LogSensor onActivate={pub.api.activateLog} fit={lgFit} />}
      {pub.ordersHidden ? null : <WorkOrderSel pub={pub} />}
      {/* V5.13（用户规格）：左侧搜索框 + 状态筛选（面板收起时随面板隐藏）——输入/选择实时过滤工单列表 */}
      {pub.ordersHidden ? null : <LeftSearch pub={pub} />}
      {pub.ordersHidden ? null : <OrderFilter pub={pub} />}
      <PanelHandles pub={pub} />
    </>
  );
}
