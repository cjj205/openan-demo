import { useStory } from '../storyline/StorylineContext';

// 整页等比缩放（V2.17 rem 语义：1rem ≡ 16·k px）：
// k = min(vw/1920, vh/1080) —— 画布 1920×1080 等比适配视口并居中（flex 居中，不足方向留白融入 body 底色）。
// V5.27：transform → zoom 根治缩放模糊——transform 是"先按 1920×1080 光栅化成纹理、再由合成器
// 缩放贴图"，k 非整数（如最大化窗口 innerHeight=958 → k≈0.887）时纹理经双线性重采样+半像素
// 偏移导致整页发虚；zoom 为"重新排版"式缩放，Chrome 按最终尺寸重排版并重栅格化文字/矢量，
// 任意 k 均清晰（vscale 消费方仅此处；V2.21 用户缩放 z 仍在画布区域层，不受影响）。
export default function ScreenCanvas({ children }) {
  const pub = useStory();
  const v = pub && pub.vscale ? pub.vscale : { x: 1, y: 1 };
  const k = Math.min(v.x, v.y);
  return (
    <div className="screen-scaler">
      <div className="screen-canvas" style={{ zoom: String(k) }}>
        {children}
      </div>
    </div>
  );
}
