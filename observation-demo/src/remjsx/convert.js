// remjsx/convert.js — V5.30 rem 缩放（用户规格）：画布内联样式 px→rem 中央转换器
// 机制：根字号 html{font-size:16k}（ScreenCanvas 按视口设置，k=min(vw/1920,vh/1080)），
// 1rem ≡ 16k px；设计 1920×1080 画布内所有尺寸/坐标以设计 px 表达，经此处换算为 rem，
// 随根字号整体等比**重排版**（任意视口/DPR 清晰；取代 V5.27 zoom 方案，V2.17"rem 语义"落地）。
// 由 vite alias 将 react/jsx-runtime(-dev) 指向包装器——全部组件（含 LayerView 合并的
// 设计 JSON 样式与 roles.js 补丁样式）的内联 style 统一走 remStyle，业务文件零改动。
const PX_RE = /(-?\d+(?:\.\d+)?)px/g;
// 数字型长度属性（React 对这些属性的数字值自动补 px；lineHeight 数字=倍数、
// zIndex/opacity/flex/order/fontWeight 等无单位属性不在其列，保持原值）
const LEN_NUM_PROPS = new Set([
  'left', 'top', 'right', 'bottom', 'width', 'height',
  'minWidth', 'minHeight', 'maxWidth', 'maxHeight',
  'fontSize', 'borderRadius', 'letterSpacing', 'textIndent', 'wordSpacing',
  'margin', 'marginTop', 'marginRight', 'marginBottom', 'marginLeft',
  'padding', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
  'gap', 'rowGap', 'columnGap', 'flexBasis',
  'borderWidth', 'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth',
  'outlineWidth', 'backgroundPositionX', 'backgroundPositionY',
]);
const cvStr = (v) => (v.indexOf('px') >= 0 ? v.replace(PX_RE, (m, n) => (n / 16) + 'rem') : v);
// SVG 内部元素（svg 根除外）的 style px = 用户单位（viewBox 1920×1080 系），随 viewBox 缩放，
// 不得转 rem——否则 k≠1 时位置/尺寸按 k² 偏移（MiniCircles/ConnectionFlow 的 <g transform> 等）。
// svg 根的 style 是 CSS 盒（视口系），照常转换（本工程 svg 根用 rem 字符串，无 px）。
const SVG_TAGS = new Set([
  'g', 'circle', 'ellipse', 'rect', 'path', 'line', 'polyline', 'polygon', 'text', 'tspan',
  'image', 'use', 'defs', 'symbol', 'marker', 'mask', 'clipPath', 'pattern', 'filter', 'stop',
  'linearGradient', 'radialGradient', 'animate', 'animateMotion', 'animateTransform', 'mpath',
  'set', 'foreignObject', 'desc', 'title', 'view',
]);
export function remStyleFor(type, style) {
  if (!style || typeof style !== 'object') return style;
  if (typeof type === 'string' && SVG_TAGS.has(type)) return style;
  return remStyle(style);
}
export function remStyle(style) {
  if (!style || typeof style !== 'object') return style;
  let out = null;
  for (const k in style) {
    const v = style[k];
    let nv = v;
    if (typeof v === 'number' && LEN_NUM_PROPS.has(k)) nv = v / 16 + 'rem';
    else if (typeof v === 'string' && v.indexOf('px') >= 0) nv = cvStr(v);
    if (nv !== v) {
      if (!out) out = { ...style };
      out[k] = nv;
    }
  }
  return out || style;
}
