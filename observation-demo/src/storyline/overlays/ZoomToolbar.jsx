// ZoomToolbar.jsx — 画布缩放工具条透明点击层（适应/＋/－；百分比文字由 uiPatches 更新设计节点）
import React from 'react';
import { ZOOM } from '../roles';
import { ZOOM_MIN, ZOOM_MAX } from '../StorylineContext';

const boxStyle = (b) => ({ left: b.x, top: b.y, width: b.w, height: b.h });

export default function ZoomToolbar({ pub }) {
  const { api, zoom } = pub;
  return (
    <div className="st-layer st-zoombar">
      <button style={boxStyle(ZOOM.fitBox)} onClick={api.zoomFit} title="适应画布" aria-label="适应画布" />
      <button style={boxStyle(ZOOM.plusBox)} onClick={api.zoomIn} title="放大" aria-label="放大" disabled={zoom >= ZOOM_MAX} />
      <button style={boxStyle(ZOOM.minusBox)} onClick={api.zoomOut} title="缩小" aria-label="缩小" disabled={zoom <= ZOOM_MIN} />
    </div>
  );
}
