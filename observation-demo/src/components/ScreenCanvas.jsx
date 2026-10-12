import { useStory } from '../storyline/StorylineContext';

// 整页等比缩放（V2.17，rem 语义：1rem ≡ 16·k px）：
// k = min(vw/1920, vh/1080) —— 画布 1920×1080 等比适配视口并居中（不足方向留白融入 body 底色），
// 文字/图标/圆形/间距全部等比随屏幕大小改变（16:9 视口 k=sx=sy 与铺满一致）。
// V2.21：用户缩放 z 移回画布区域层（.fc-zoom / .st-zoomz，绕画布中心，见 FlowChartRegion/roles）——
// 工单列表/成效/A2A-T 日志/工具条不随缩放改变；整页层只承担视口适配（screen(x) = off + k·x）
export default function ScreenCanvas({ children }) {
  const pub = useStory();
  const v = pub && pub.vscale ? pub.vscale : { x: 1, y: 1 };
  const k = Math.min(v.x, v.y);
  const offx = 960 * (v.x - k);
  const offy = 540 * (v.y - k);
  return (
    <div className="screen-scaler">
      <div className="screen-canvas" style={{ transform: 'translate(' + (offx + 960 * k) + 'px, ' + (offy + 540 * k) + 'px) scale(' + k + ') translate(-960px, -540px)' }}>
        {children}
      </div>
    </div>
  );
}
