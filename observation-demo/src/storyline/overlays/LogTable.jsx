// LogTable.jsx — 实时日志表（覆盖层渲染）：回放态逐条追加自动滚底；快照点亮态全量日志可滚动
// 点击行展开完整 A2A-T Prompt；滚动条样式对齐设计稿（6px 圆角深灰滑块）
// 数据来自 case-data.js（case1/case2 参考数据）；斑马纹对齐设计稿表格（偶数行 rgba(119,119,119,0.15)）
import React, { useEffect, useRef, useState } from 'react';
import { LOGS, logStretchX, viewFactors } from '../roles';

const BADGE = {
  'Task-T请求': { background: 'rgba(102,140,247,0.15)', color: 'rgba(140,163,250,1)' },
  'Task-T响应': { background: 'rgba(54,193,141,0.15)', color: 'rgba(54,193,141,1)' },
  'Negotiation-T请求': { background: 'rgba(209,159,0,0.15)', color: 'rgba(209,159,0,1)' },
  'Negotiation-T响应': { background: 'rgba(209,159,0,0.15)', color: 'rgba(209,159,0,1)' },
  // Notification-T 通知（抢通结果/工单报结）：配色对齐设计稿 Notification-T 连线胶囊（青）
  'Notification-T通知': { background: 'rgba(44,184,201,0.15)', color: 'rgba(85,204,217,1)' },
  // 节点内部步骤（自环）：银灰徽章，路由仅显示节点名称，名称后附内部子流程标签
  '内部': { background: 'rgba(201,201,201,0.15)', color: 'rgba(201,201,201,1)' },
  // 注册中心检索命中：配色对齐连线检索胶囊（紫）
  '检索': { background: 'rgba(168,159,249,0.15)', color: 'rgba(168,159,249,1)' },
};

export default function LogTable({ logs, anchor, pub }) {
  const ref = useRef(null);
  const prevLen = useRef(logs.length);
  const [open, setOpen] = useState(-1);

  // 挂载锚定：回放态贴底（最新可见），快照点亮态贴顶（与设计稿首屏一致）
  useEffect(() => {
    if (ref.current && anchor === 'bottom') ref.current.scrollTop = ref.current.scrollHeight;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 新增日志 → 滚到底
  useEffect(() => {
    if (ref.current && logs.length > prevLen.current) ref.current.scrollTop = ref.current.scrollHeight;
    prevLen.current = logs.length;
  }, [logs.length]);

  const b = LOGS.bodyBox;
  // V2.13：左栏收起时表体随面板展宽（left/width 真实重排，列距自然拉开、文字保持原比例——不整表缩放拉伸）；
  // 宽度含竖直滚动条槽位（14px）：行宽在出滚动条时恰好齐平，不产生横向滚动条。
  // V2.14：视口铺满下盒体按视口系数补偿放大 + 整表反向缩放（原点 0 0）——定位/盒体随面板铺满，
  // 内部文字保持设计尺寸与长宽比（12px 字号/40px 行高物理像素不变）
  const { sx, sy } = viewFactors(pub);
  const left = logStretchX(pub, b.x);
  const width = (logStretchX(pub, b.x + b.w + 14) - left) * sx;
  const counter = sx !== 1 || sy !== 1 ? 'scale(' + 1 / sx + ', ' + 1 / sy + ')' : undefined;
  return (
    <div ref={ref} className="st-logtable" style={{
      left, top: b.y, width, height: b.h * sy,
      transform: counter, transformOrigin: '0 0',
      transition: 'left 0.25s ease, width 0.25s ease, height 0.25s ease, transform 0.25s ease',
    }}>
      {logs.map((l, i) => {
        const internal = l.from === l.to; // 内部步骤：路由仅显示节点名称（无 → 接收方）
        return (
          <div key={i} className={'st-lrow' + (open === i ? ' st-lrow-open' : '')}
            onClick={() => setOpen(open === i ? -1 : i)}>
            <div className="st-lmain">
              <span className={'st-lchev' + (open === i ? ' st-lchev-open' : '')}>▾</span>
              <span className="st-lbadge" style={BADGE[l.badge] || BADGE['Task-T请求']}>{l.badge}</span>
              <span className="st-ltime">{l.clock}</span>
              <span className="st-lroute">
                {internal
                  ? <>{l.from}{l.step ? <em className="st-ltag">{l.step}</em> : null}</>
                  : <>{l.from}<i> → </i>{l.to}</>}
              </span>
              <span className="st-lsum">{l.summary}</span>
            </div>
            {open === i ? <div className="st-lprompt">{l.prompt}</div> : null}
          </div>
        );
      })}
    </div>
  );
}
