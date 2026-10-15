// ZoomToolbar.jsx — 画布缩放工具条透明点击层（适应/＋/－；百分比文字由 uiPatches 更新设计节点）
import React from 'react';
import { ZOOM } from '../roles';
import { ZOOM_MIN, ZOOM_MAX } from '../StorylineContext';

const boxStyle = (b) => ({ left: b.x, top: b.y, width: b.w, height: b.h });
// V5.12（用户规格）：放大按钮（加号）区域样式——border-radius 0.2rem(4px)、
// #F3F3F319 底、投影 0 0.05rem 0.3rem 0 #0000007F（叠于工具条之上、图标透出，不拦截点击）
const PLUS_REGION = {
  borderRadius: '4px',
  background: 'rgba(243,243,243,0.098)',
  boxShadow: '0px 1px 6px 0px rgba(0,0,0,0.5)',
  pointerEvents: 'none',
};

export default function ZoomToolbar({ pub }) {
  const { api, zoom } = pub;
  return (
    <div className="st-layer st-zoombar">
      <div style={{ ...boxStyle(ZOOM.plusBox), ...PLUS_REGION }} />
      <button style={boxStyle(ZOOM.fitBox)} onClick={api.zoomFit} title="适应画布" aria-label="适应画布" />
      <button style={boxStyle(ZOOM.plusBox)} onClick={api.zoomIn} title="放大" aria-label="放大" disabled={zoom >= ZOOM_MAX} />
      <button style={boxStyle(ZOOM.minusBox)} onClick={api.zoomOut} title="缩小" aria-label="缩小" disabled={zoom <= ZOOM_MIN} />
    </div>
  );
}
