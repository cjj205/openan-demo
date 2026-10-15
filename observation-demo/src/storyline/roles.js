// roles.js — 语义角色注册表 + 世界状态 → 节点补丁（id → {hide/c/s/text/title}）
// id/box 来自 roles-data.js（codegen/export-storyline-data.js 生成）
import { CARDS, CHEVRONS, BUTTONS, DECOR, LINES, LOGS, ORDERS, ROOMS, ZOOM } from './roles-data';
import { CASES } from './cases';
import { root as FLOW_ROOT } from '../design/regions/flow-chart';
import { root as LOG_ROOT } from '../design/regions/log-panel';

export { CARDS, CHEVRONS, BUTTONS, DECOR, LINES, LOGS, ORDERS, ROOMS, ZOOM };

// V5.23 工单卡位置对调 → V5.25（用户规格）对调回退：case1 工单在第一张卡、case2 在第二张。
// 槽位映射保留（恒等映射），文案补丁/点击交互/角标/选中态仍统一走 ORDER_SLOT
export const ORDER_SLOT = { c1: 'c1', c2: 'c2' };
const ORDER_NO_IDS = { c1: '23:137124', c2: '23:137160' }; // 槽位 → 工单号文字 id
const CUST_IDS = { c1: '23:137144', c2: '23:137171' };     // 槽位 → 客户名文字 id
export const AGENTS = ['WAIMO', 'ZX', 'YD', 'YX'];

// 卡片描述溢出省略（工单卡描述行超出卡片宽度时截断，悬浮 title 展示全文）
const ELLIPSIS = { display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' };

// 传输室房间标签（容器 9114）与监控室—传输室连线（矢量 2679）设计节点 id
// （roles-data.js 为 codegen 导出、未含此二节点，故在此登记；见 design/regions/flow-chart.js）
const CS_TAB_ID = '23:135680';
const CS_LINK_ID = '23:135685';

// 面板收起（V2.12）：左侧面板/日志面板区域根节点与设计把手（boder/箭头）id 手工登记
// （见 design/regions/left-panel.js、log-panel.js；把手交互见 StorylineContext makeInteractions）
const LP_ROOT_ID = '23:137094';      // 左侧面板区域根
const LG_ROOT_ID = '23:137185';      // 日志面板区域根
const LP_HANDLE_ID = '23:137098';    // 左面板把手 boder（设计节点，点击收起）
const LG_HANDLE_ID = '23:137189';    // 日志面板把手 boder（设计节点，点击收起）
const LP_ARROW_ID = 'I23:137099;2:325077';  // 左面板把手箭头切图（boder 兄弟节点）
const LG_ARROW_ID = 'I23:137190;2:325077';  // 日志面板把手箭头切图
const DOT_BG_ID = '23:135642';       // 点阵背景（固定节点之首，收起日志后下缘补齐）

// ---- 面板收起后的画布区域重适配（V2.12；V3.2 删成效指标后区域扩至 1615）----
// 流程图区域盒 1615×845（305,48）；左栏收起 → 可用宽 1920（x:0-1920，右缘固定）；
// 日志收起 → 可用高 1032（y:48-1080，上缘固定）。锚点取区域盒右上角（右缘/上缘不动，
// 与保留的顶部导航对齐），非等比拉伸铺满——与应用「铺满屏幕」同策略。
const FC_BOX = { w: 1615, h: 845 };
const FC_FULL = { x: 1920, y: 1032 };
const FC_Q = { x: 1615, y: 0 };      // 重适配锚点（区域盒右上角，区域本地坐标）

export function fitFactors(ctx) {
  return {
    fx: ctx.ordersHidden ? FC_FULL.x / FC_BOX.w : 1,
    fy: ctx.logHidden ? FC_FULL.y / FC_BOX.h : 1,
  };
}

// 视口系数（V2.17：整页等比缩放 k=min(sx,sy) 由 ScreenCanvas 施加并居中——内容随画布等比
// 缩放即「rem」语义，无需任何区域级反向抵消；恒返回 1，保留函数形态供下游公式/日志表退化）。
// vscale 原始横纵系数仍随 resize 存于 ctx（ScreenCanvas 读取计算 k 与留白偏移）
export function viewFactors(ctx) {
  return { sx: 1, sy: 1 };
}

// 复合适配系数：面板收起重适配（V2.17 起仅收起系数——视口为整页等比、在画布外层均匀作用，
// 集群反向 scale(1/f) 后内容物理尺寸 = k·z·设计尺寸，随屏幕/缩放等比改变）
export function totalFactors(ctx) {
  const { fx, fy } = fitFactors(ctx);
  return { fx, fy };
}

// 流程图区域变换：挂在 region div 上（clip 随变换同步扩展到新可用区）
export function regionFitStyle(ctx) {
  const { fx, fy } = fitFactors(ctx);
  if (fx === 1 && fy === 1) return undefined;
  return { transform: 'scale(' + fx + ', ' + fy + ')', transformOrigin: FC_Q.x + 'px ' + FC_Q.y + 'px' };
}

// 覆盖层双层变换（V2.21：用户缩放回归画布区域级）：外层 .st-zoomwrap = 区域重适配 F
//（与区域 div 同步 0.25s 过渡，仅服务于收起/展开回位）；内层 .st-zoomz = 用户缩放 Z
//（绕画布中心 ZOOM.center，瞬时）。两层等效 CTM = F∘Z = W（见 overlayFitParams）——
// 内层覆盖内容（连线/胶囊/圆点/描述）与 .fc-zoom 区域内容（卡片/步骤条）变换一致
export function overlayFitStyle(ctx) {
  const { fx, fy } = fitFactors(ctx);
  if (fx === 1 && fy === 1) return undefined;
  return { transform: 'scale(' + fx + ', ' + fy + ')', transformOrigin: '1920px 48px' };
}
export function overlayZoomStyle(ctx) {
  const z = ctx.zoom || 1;
  if (z === 1) return undefined;
  return { transform: 'scale(' + z + ')', transformOrigin: ZOOM.center[0] + 'px ' + ZOOM.center[1] + 'px' };
}

// 日志面板（设计片段包裹层/实时表/传感器）随左栏收起同步左向拉伸（右缘 1920 锚定）：
// V3.2 面板扩至 1615（305..1920，与流程区同宽），拉伸系数 LG_FX = 1920/1615；
// left 为元素画布左缘，transform-origin 取 1920-left（本元素自身坐标系内）
const LG_FX = 1920 / 1615;
export function logFitStyle(ctx, left) {
  const fx = ctx.ordersHidden ? LG_FX : 1;
  if (fx === 1) return undefined;
  return { transform: 'scale(' + fx + ', 1)', transformOrigin: (1920 - left) + 'px 0px' };
}

// 左栏收起时的画布 x 映射（日志收起副本把手定位用）
export function logStretchX(ctx, x) {
  const fx = ctx.ordersHidden ? LG_FX : 1;
  return 1920 + (x - 1920) * fx;
}

// ---- V2.13 收起重适配·保比例：节点/文字不拉伸（集群反向缩放），连线随区域拉伸（拉长铺满）----
// 设计树 group 节点渲染为 Fragment（不产生坐标系）：子节点坐标即最近 DOM 祖先坐标系，
// 据此建立节点 id → 画布绝对盒索引（流程图根子节点自 (305,48) 起算、日志面板根为透明 group）
function indexBoxes(node, frame, map) {
  if (node.kind === 'group') { (node.children || []).forEach((c) => indexBoxes(c, frame, map)); return; }
  const box = { x: frame.x + node.x, y: frame.y + node.y, w: node.w, h: node.h };
  map.set(node.id, box);
  (node.children || []).forEach((c) => indexBoxes(c, box, map));
}
const FLOW_BOXES = new Map();
(FLOW_ROOT.children || []).forEach((c) => indexBoxes(c, { x: FLOW_ROOT.x, y: FLOW_ROOT.y }, FLOW_BOXES));

const boxCenter = (b) => ({ x: b.x + b.w / 2, y: b.y + b.h / 2 });
const LC_ID = '23:136979';           // 流程中心（容器 9115，lc-* 连线端点集群）
const REG_ID = '23:136963';          // 注册中心（容器 27，reg-* 检索线端点集群）
const FC_TITLE_ID = '23:135686';     // 「投诉分析流」区域标题

// 集群 = 拉伸下保持原比例的刚体单元：root 以自身中心锚定（scale(1/fx,1/fy) origin 50%）；
// sat（角标/步骤条元素）以集群中心锚定随整体平移（不产生卡内相对漂移）。
// 连线 sprite/底板条/房间高亮/步骤条背景不注册（随区域拉伸＝连线拉长铺满）
const CLUSTERS = [
  ...['WAIMO', 'ZX', 'YD', 'YX'].map((k) => ({ root: CARDS[k].bgId, center: boxCenter(CARDS[k].box), sats: [CARDS[k].badgePillId] })),
  { root: CARDS.YX.glowId, center: boxCenter(CARDS.YX.box), sats: [] }, // 粤西发光容器（与粤西卡同盒）
  { root: LC_ID, center: boxCenter(FLOW_BOXES.get(LC_ID)), sats: [] },
  { root: REG_ID, center: boxCenter(FLOW_BOXES.get(REG_ID)), sats: [] },
  { root: FC_TITLE_ID, center: boxCenter(FLOW_BOXES.get(FC_TITLE_ID)), sats: [] },
  { root: '23:135676', center: boxCenter(FLOW_BOXES.get('23:135676')), sats: [] }, // 客服 tab
  { root: '23:135678', center: boxCenter(FLOW_BOXES.get('23:135678')), sats: [] }, // 监控室 tab
  { root: CS_TAB_ID, center: boxCenter(FLOW_BOXES.get(CS_TAB_ID)), sats: [] },     // 传输室 tab
  ...Object.values(LINES).map((L) => ({ root: L.pillId, center: boxCenter(L.pillBox), sats: [] })), // 连线协议胶囊（骑线标签）
];
// 步骤条单项（chip/图标/标题/时长）随单项中心刚体平移，单项间空隙随区域拉伸
const CHEVRON_SATS = CHEVRONS.flatMap((ch) => {
  const a = boxCenter(ch.box);
  return [ch.chipId, ch.iconId, ch.nameId, ch.durId].map((id) => ({ id, anchor: a }));
});
// 步骤条箭头造型（V2.18 修正）：尖端/切口深 10px；**左缘凹陷朝右**（上/下角最左 0px、
// 中点右移 10px——V2.16 初版方向做反为向左突出）；右缘尖端朝右凸出；
// 首枚左缘平、末枚右缘平（calc 相对百分比宽；深 10 使图标左缘 10.88 不被切口裁剪）
const CHEV_CLIP = {
  first: 'polygon(0 0, calc(100% - 10px) 0, 100% 50%, calc(100% - 10px) 100%, 0 100%)',
  mid: 'polygon(0 0, calc(100% - 10px) 0, 100% 50%, calc(100% - 10px) 100%, 0 100%, 10px 50%)',
  last: 'polygon(0 0, 100% 0, 100% 100%, 0 100%, 10px 50%)',
};
// 日志面板需保比例的设计节点（面板随左栏收起展宽）：文本（不含胶囊内嵌文本）、协议胶囊、
// 行首合并图标；底板条/斑马纹/滚动条/单元格分隔线随面板展宽，把手随面板平移
const LOG_KEEP = (() => {
  const ids = [];
  const walk = (n, kept) => {
    if (n.kind === 'group') { (n.children || []).forEach((c) => walk(c, kept)); return; }
    const keep = !kept && (n.kind === 'text' || (n.name || '').indexOf('3.彩色标签') >= 0 || (n.kind === 'sprite' && n.name === '合并'));
    if (keep) ids.push(n.id);
    (n.children || []).forEach((c) => walk(c, kept || keep));
  };
  (LOG_ROOT.children || []).forEach((c) => walk(c, false));
  return ids;
})();
//（V2.14 曾按 KEEP_RULE 收集其余区域原子单元做视口反向；V2.17 整页等比缩放后视口无需反向，
//  注册表移除——同时避免渐变文字节点（background-clip:text，如 业务类成效/协议类成效 标题）
//  被 transform 化产生渐变与字形错位的重影）
// 连线端点集群中心（FLOWS src/dst → 集群中心，端点重适配用）
const ENDPOINT_CENTERS = {
  LC: boxCenter(FLOW_BOXES.get(LC_ID)),
  REG: boxCenter(FLOW_BOXES.get(REG_ID)),
  WAIMO: boxCenter(CARDS.WAIMO.box),
  ZX: boxCenter(CARDS.ZX.box),
  YD: boxCenter(CARDS.YD.box),
  YX: boxCenter(CARDS.YX.box),
};

// 画布映射（V2.21）：W = F∘Z（区域收起重适配 F 绕 (1920,48) ∘ 用户缩放 Z 绕画布中心 (1112.5,470.5)）。
// 两个对角缩放的复合仍为对角缩放：zx=fx·z、zy=fy·z，不动点 o=(a−zx·cz)/(1−zx)，
// 其中 a = c_f + f·(c_z−c_f)（Z 作用后 F 的平移分量）；z=1 退化为 F（o=(1920,48)）、
// f=1 退化为 Z（o=画布中心）。供覆盖层内公式（端点重映射/卫星锚定/固定节点反向）使用——
// 覆盖层 DOM 实际渲染为外层 F + 内层 Z 双层嵌套（CTM 与 W 相同）
export function overlayFitParams(ctx) {
  const { fx, fy } = fitFactors(ctx);
  const z = ctx.zoom || 1;
  const zx = fx * z, zy = fy * z;
  const czx = ZOOM.center[0], czy = ZOOM.center[1];
  const ax = 1920 + fx * (czx - 1920);
  const ay = 48 + fy * (czy - 48);
  const ox = Math.abs(zx - 1) < 1e-6 ? 1920 : (ax - zx * czx) / (1 - zx);
  const oy = Math.abs(zy - 1) < 1e-6 ? 48 : (ay - zy * czy) / (1 - zy);
  return { zx, zy, ox, oy };
}
const wPt = (P, p) => ({ x: P.ox + P.zx * (p.x - P.ox), y: P.oy + P.zy * (p.y - P.oy) });
const wInv = (P, q) => ({ x: P.ox + (q.x - P.ox) / P.zx, y: P.oy + (q.y - P.oy) / P.zy });

// 集群 root 反向缩放：自身中心锚定；恒等补丁常驻（scale(1,1) 不影响像素，收起/展开/视口变化双向平滑）。
// 推导（V2.14 一般式，容器复合 C=G∘F∘Z 为对角线性 d）：final = C(c)+z·(r−c) ⇒ scale(z/d)=scale(1/f_total) @ 中心
const CTR_TRANSITION = 'transform 0.25s ease';
function rootCounterStyle(ctx) {
  const { fx, fy } = totalFactors(ctx);
  return { transform: 'scale(' + 1 / fx + ', ' + 1 / fy + ')', transformOrigin: '50% 50%', transition: CTR_TRANSITION };
}
// 卫星节点锚定集群中心（闭式解）：origin = 集群中心 − 节点左上（节点本地坐标），
// 节点随集群整体刚体平移（final = C(c_K)+z·(r−c_K)），卡内/单项内无相对漂移；f=1 轴原点无关
export function satCssStyle(ctx, box, anchor) {
  const { fx, fy } = totalFactors(ctx);
  return {
    transform: 'scale(' + 1 / fx + ', ' + 1 / fy + ')',
    transformOrigin: (anchor.x - box.x) + 'px ' + (anchor.y - box.y) + 'px',
    transition: CTR_TRANSITION,
  };
}
// 固定节点反向（点阵背景/缩放工具栏/回放按钮组）：抵消 W = F∘Z 保持设计尺寸与原位——
// 工单列表/成效/日志不随缩放改变的同时，画布内这三组固定元素亦不随动（V2.21 缩放回归画布级）。
// ⇒ scale(1/zx, 1/zy) @ origin o=(p−W(p))/(zx−1)（节点本地系；z=1 且 f=1 时与 V2.12 闭式解一致）
function fixedCounterStyle(ctx, P, box) {
  const zx = P.zx, zy = P.zy; // W 因子（fx·z / fy·z）
  const cx = P.ox + zx * (box.x - P.ox); // W(p)
  const cy = P.oy + zy * (box.y - P.oy);
  const ox = Math.abs(zx - 1) < 1e-6 ? box.w / 2 : (box.x - cx) / (zx - 1);
  const oy = Math.abs(zy - 1) < 1e-6 ? box.h / 2 : (box.y - cy) / (zy - 1);
  return { transform: 'scale(' + 1 / zx + ', ' + 1 / zy + ')', transformOrigin: ox + 'px ' + oy + 'px' };
}
// SVG <g> 集群锚定（CSS transform，替代原 translate(box)）：
// 图标落点 = W(anchor) + z·(box−anchor)（锚集群中心、随整体刚体缩放平移），
// t = W⁻¹(W(anchor) + z·(box−anchor))、scale = 1/f_total；展开态退化为 translate(box)
//（V2.21：缩放回归画布级，偏移项恢复 z 因子——V2.16 整页缩放时曾去除）
export function satSvgTransform(ctx, box, anchor) {
  const { fx, fy } = totalFactors(ctx);
  const { sx, sy } = viewFactors(ctx);
  const z = ctx.zoom || 1;
  const P = overlayFitParams(ctx);
  const f2 = (v) => Math.round(v * 100) / 100;       // 平移：0.01px
  const f5 = (v) => Math.round(v * 1e5) / 1e5;       // 缩放：保留精度（内容随尺寸放大误差）
  // C = W = F∘Z（画布系 → 物理系）；t = W⁻¹((W(anchor) + z·(box−anchor))/s)
  const cax = sx * (P.ox + P.zx * (anchor.x - P.ox)), cay = sy * (P.oy + P.zy * (anchor.y - P.oy));
  const t = wInv(P, {
    x: (cax + z * (box.x - anchor.x)) / sx,
    y: (cay + z * (box.y - anchor.y)) / sy,
  });
  return 'translate(' + f2(t.x) + 'px, ' + f2(t.y) + 'px) scale(' + f5(1 / fx) + ', ' + f5(1 / fy) + ')';
}
// 连线协议胶囊（SVG）保比例：以胶囊中心反向缩放（骑线标签随线中点，胶囊/文字不变形）
export function pillCounterTransform(ctx, box) {
  if (!ctx) return undefined;
  const { fx, fy } = totalFactors(ctx);
  if (fx === 1 && fy === 1) return undefined;
  const cx = box.x + box.w / 2, cy = box.y + box.h / 2;
  return 'translate(' + cx + 'px, ' + cy + 'px) scale(' + 1 / fx + ', ' + 1 / fy + ') translate(' + (-cx) + 'px, ' + (-cy) + 'px)';
}

// ---- 连线端点重映射：端点目标 = 集群刚体在画布系的映射 W(c_K) + z·(p−c_K)/s（z 为用户缩放、
// s 为视口系数；V2.21 缩放回归画布级——端点随卡刚体等比缩放，V2.16 整页缩放时曾无 z），
// 覆盖层内 CTM=W → q = W⁻¹(target)；中间点保持设计坐标（随 W 缩放＝连线整体等比）。
// f=1 时 W=Z 为纯缩放、端点 q=p 自然命中（无需重映射）→ 全系数恒等（无收起、16:9 视口）
// 原样返回（像素回归安全）----
const PATH_RE = /([MHVLQ])((?:[\s,-]*-?[\d.]+)*)/g;
const num2 = (v) => String(Math.round(v * 100) / 100);

export function remapPathEnds(ctx, d, firstKey, lastKey) {
  if (!ctx) return d;
  const TF = totalFactors(ctx);
  if (TF.fx === 1 && TF.fy === 1) return d;
  const P = overlayFitParams(ctx);
  const { sx, sy } = viewFactors(ctx);
  const z = ctx.zoom || 1;
  const shift = (key, p) => {
    if (!key) return p;
    const c = ENDPOINT_CENTERS[key];
    const wc = wPt(P, c);
    return wInv(P, {
      x: wc.x + z * (p.x - c.x) / sx,
      y: wc.y + z * (p.y - c.y) / sy,
    });
  };
  const segs = [];
  let cur = null, m;
  PATH_RE.lastIndex = 0;
  while ((m = PATH_RE.exec(d)) !== null) {
    const nums = (m[2].match(/-?[\d.]+/g) || []).map(Number);
    if (m[1] === 'M') { cur = { x: nums[0], y: nums[1] }; segs.push({ cmd: 'M', nums, from: null, to: cur }); continue; }
    let to = null;
    if (m[1] === 'H') to = { x: nums[0], y: cur.y };
    else if (m[1] === 'V') to = { x: cur.x, y: nums[0] };
    else if (m[1] === 'L') to = { x: nums[0], y: nums[1] };
    else to = { x: nums[2], y: nums[3] };
    segs.push({ cmd: m[1], nums, from: cur, to });
    cur = to;
  }
  if (segs.length) {
    const s0 = segs[0];
    const q0 = shift(firstKey, s0.to);
    s0.nums[0] = q0.x; s0.nums[1] = q0.y;
    const sl = segs[segs.length - 1];
    if (lastKey) {
      const ql = shift(lastKey, sl.to);
      // H/V 只能表达单轴，端点另一轴的集群位移无法表达 → 升格为 L（几何等效，双轴可写）
      if (sl.cmd === 'H' || sl.cmd === 'V') { sl.cmd = 'L'; sl.nums = [ql.x, ql.y]; }
      else if (sl.cmd === 'Q') { sl.nums[2] = ql.x; sl.nums[3] = ql.y; }
      else { sl.nums[0] = ql.x; sl.nums[1] = ql.y; }
    }
  }
  return segs.map((s) => s.cmd + s.nums.map(num2).join(' ')).join('');
}

// 路径折线长度（Q 以弦长近似）：重映射后连线变长，彗星行程/时长随之修正
export function pathLength(d) {
  let cur = null, len = 0, m;
  PATH_RE.lastIndex = 0;
  while ((m = PATH_RE.exec(d)) !== null) {
    const nums = (m[2].match(/-?[\d.]+/g) || []).map(Number);
    if (m[1] === 'M') { cur = { x: nums[0], y: nums[1] }; continue; }
    let to = null;
    if (m[1] === 'H') to = { x: nums[0], y: cur.y };
    else if (m[1] === 'V') to = { x: cur.x, y: nums[0] };
    else if (m[1] === 'L') to = { x: nums[0], y: nums[1] };
    else to = { x: nums[2], y: nums[3] };
    len += Math.hypot(to.x - cur.x, to.y - cur.y);
    cur = to;
  }
  return len;
}

// V5.13（用户规格）：工单搜索匹配——工单号/投诉客户/会话意图（卡片描述行）子串匹配、
// 不区分大小写；空串/全空格 = 全部显示（LeftSearch 输入框 / buildUiPatches 卡片过滤共用）
export function orderMatches(k, q) {
  const s = String(q || '').trim().toLowerCase();
  if (!s) return true;
  const c = CASES[k];
  return [c.orderNo, c.customer, c.desc].some((t) => String(t || '').toLowerCase().includes(s));
}

// V5.13（用户规格）：工单状态筛选——筛选下拉（全部状态/处理中/已完成，设计「筛选」区
// 位于工单列表标题右侧）；两案卡片状态均为「已完成」（设计烤入标签）；
// orderVisible = 搜索 ∧ 状态（卡片过滤/角标/空态提示共用口径）
export const ORDER_STATUS = { c1: '已完成', c2: '已完成' };
export const ORDER_STATUS_OPTIONS = ['全部状态', '处理中', '已完成'];
export function statusMatches(k, status) {
  return !status || status === '全部状态' || ORDER_STATUS[k] === status;
}
export function orderVisible(k, ctx) {
  return orderMatches(k, ctx.search) && statusMatches(k, ctx.status);
}

// 纯 UI 补丁（与故事线世界状态无关，任何模式生效；默认值时为空，保证快照像素回归）
export function buildUiPatches(ctx) {
  const P = new Map();
  // 工单卡：可选中文字 + 整卡点击切换案例（类/交互见 .st-ocard 与 StorylineContext interactions）+ 悬浮提示
  // （c1 悬浮提示随协商补充后的工单信息同步，见 buildPatches d1）
  // V5.13（用户规格）：搜索框实时过滤 + 状态筛选（orderVisible = 搜索 ∧ 状态）——不匹配的
  // 工单卡整卡隐藏（角标同步隐藏，见 WorkOrderSel；空态提示见 OrderFilter）；设计搜索占位
  // 文字由 LeftSearch 覆盖层输入框原生 placeholder 取代（I23:137118;2:356130 隐藏）；
  // 「筛选」标签文字随所选状态更新（I23:137104;3:27462;2:29596，设计烤入「全部状态」）
  for (const k of ['c1', 'c2']) {
    const d = k === 'c1' && ctx.orderInfo ? CASES.c1.orderDescUpdated : CASES[k].desc;
    const hidden = !orderVisible(k, ctx);
    // V5.23：内容按 ORDER_SLOT 落位（case2 → 第一卡槽）
    P.set(ORDERS[ORDER_SLOT[k]].id, {
      c: 'st-ocard',
      title: CASES[k].orderNo + '｜' + CASES[k].customer + '｜' + d,
      ...(hidden ? { hide: true } : {}),
    });
  }
  P.set('I23:137118;2:356130', { hide: true });
  P.set('I23:137104;3:27462;2:295964', { text: ctx.status && ORDER_STATUS_OPTIONS.includes(ctx.status) ? ctx.status : '全部状态' });
  // 粤东/粤西卡技能标签：「生成抢通方案 + 抢通方案下发」合并为「业务抢通」（V2.10）——
  // 第二枚胶囊改文案并按 4 字收窄（80px，对齐「故障定位」胶囊），第三枚整组隐藏；
  // V2.28：胶囊图标随设计 V3.1 Skill 切图更新（设计源已换 ic_ict_closed_loop_skill.svg，
  // 原 V2.15 扳手 src 补丁移除；胶囊底色/圆角与切图统一在设计稿维护）；
  // V3.5：业务抢通图标去漂白（原 brightness(0) invert(1) 把双色切图糊成白圆饼、扳手不可见），
  // 切图为浅灰圆盘(223)+深色扳手(25) 双色，原生渲染即可辨——仅此图标去滤镜，其余技能图标维持白色；
  // V2.18：胶囊对在卡内居中——原 16/104 偏左（行宽 168 在 222 内宽居中应为 27/115，
  // 卡 224 − 2×1px 边框；发光母版为 icon 子节点不参与渲染、值随基卡同步）
  // 含粤西发光容器 op0 母版副本。胶囊节点未入 roles-data 导出，id 手工登记（见 design/regions/flow-chart.js）
  const SKILL_MERGE = [
    { pillId: '23:136691', iconId: '23:136692', textId: '23:136705', dropId: '23:136706', faultId: '23:136672', pillLeft: '115px', faultLeft: '27px' }, // 粤东卡
    { pillId: '23:136816', iconId: '23:136817', textId: '23:136830', dropId: '23:136831', faultId: '23:136797', pillLeft: '115px', faultLeft: '27px' }, // 粤西卡
    { pillId: '23:136096', iconId: '23:136097', textId: '23:136110', dropId: '23:136111', faultId: '23:136077', pillLeft: '100px', faultLeft: '12px' }, // 粤西发光容器母版
  ];
  // V5（用户规格 2026-10-12）：「业务抢通」技能胶囊**粤东/粤西两卡常驻**（两案一致）——
  // 技能胶囊为能力声明，与本案例是否执行抢通无关；「故障定位」胶囊两侧常驻、位置随 V2.18 居中
  for (const s of SKILL_MERGE) {
    P.set(s.textId, { text: '业务抢通', s: { width: '48px' } });
    P.set(s.pillId, { s: { width: '80px', left: s.pillLeft } });
    P.set(s.faultId, { s: { left: s.faultLeft } });
    P.set(s.dropId, { hide: true });
  }
  // V4：步骤5（问题处置）时长标签 per-case（设计烤入"3分钟"）——c1=调度处置 144 分钟 / c2=抢通执行 10 分钟
  P.set(CHEVRONS[4].durId, { text: ctx.caseId === 'c1' ? '144分钟' : '10分钟' });
  // V5.11（用户规格）：房间胶囊（客服/监控室/传输室）统一玻璃蓝样式——
  // border-radius 0.2rem(4px) / 180° 蓝渐变 + 中心辐射底（#5CACFF3D→透明、#91C7FF44→透明）/
  // 0.05rem(1px) #5CACFF 描边（容器 id 手工登记：23:135676 客服 / 23:135678 监控室 /
  // 23:135680 传输室，见 design/regions/flow-chart.js；组间连线同批改白色半透明线、光束滑块保留）
  const ROOM_TAB_STYLE = {
    backgroundImage: 'linear-gradient(180deg, rgba(92,172,255,0.24) 0%, rgba(92,172,255,0) 100%), radial-gradient(circle at 50% 50%, rgba(145,199,255,0.27) 0%, rgba(92,172,255,0) 100%)',
    border: '1px solid rgba(92,172,255,1)',
    borderRadius: '4px',
  };
  for (const id of ['23:135676', '23:135678', '23:135680']) P.set(id, { s: ROOM_TAB_STYLE });
  // V5.12（用户规格）：流程中心/编排中心卡片——border-radius 0.4rem(8px)、#A89FF966 底、
  // 0.05rem(1px) #715AFB 描边（设计原 0.15 底加深为 0.4；id：23:136979 流程中心 / 23:136490 编排中心）
  const SVC_STYLE = {
    backgroundColor: 'rgba(168,159,249,0.4)',
    border: '1px solid rgba(113,90,251,1)',
    borderRadius: '8px',
  };
  for (const id of ['23:136490', '23:136979']) P.set(id, { s: SVC_STYLE });
  // V5.13（用户规格）：顶部导航三图标换设计切图 SVG 原生渲染（高保真图标切图-全量
  // 20261008/0.顶部导航图标）——原图标为位图 sprite 叠层（烤入底色）；隐藏子层、
  // 容器以切图填充：23:137665 协作观测（28×28）/ 23:137692 月亮 / 23:137698 刷新（20×20）
  //（标题装饰位图同批改为 CSS/SVG 重建，见 design/regions/title.js V5.13 注释）
  const NAV_ICONS = [
    { boxId: '23:137665', src: '/icons/ic_ict_highlight_inter_domain_links_textured.svg', hide: ['23:137666', '23:137667', '23:137668', '23:137669'] },
    { boxId: '23:137692', src: '/icons/ic_public_moon.svg', hide: ['23:137694', '23:137695', '23:137697'] },
    { boxId: '23:137698', src: '/icons/ic_public_refresh_clockwise.svg', hide: ['23:137700'] },
  ];
  for (const ic of NAV_ICONS) {
    for (const id of ic.hide) P.set(id, { hide: true });
    P.set(ic.boxId, { s: { backgroundImage: 'url(' + ic.src + ')', backgroundSize: '100% 100%', backgroundRepeat: 'no-repeat' } });
  }
  // V4：外层步骤名（设计烤入）——投诉定界→定界定位、方案生成→问题处置（两案同名，文档口径）
  P.set(CHEVRONS[2].nameId, { text: '定界定位' });
  P.set(CHEVRONS[4].nameId, { text: '问题处置' });
  // V4：粤东/粤西卡迷你步骤标题（设计烤入）——槽1 问题定位→根因定位、槽2 方案生成→抢通执行
  //（槽3 抢通执行两案均不使用→隐藏；发光容器母版无导出标题 id，回放态不渲染、快照态沿用设计文字）
  for (const k of ['YD', 'YX']) {
    P.set(CARDS[k].mini[0].titleId, { text: '根因定位' });
    P.set(CARDS[k].mini[1].titleId, { text: '抢通执行' });
  }
  // V5：工单卡客户名（用户规格）——#FFFFFF / Microsoft YaHei / bold / 0.8rem 行高 1.2rem，
  // 字距 0、左对齐；较长客户名（10/16 字）溢出省略 + 悬浮全文（工单描述行同款 ELLIPSIS）
  const NAME_FONT = {
    ...ELLIPSIS,
    color: '#FFFFFF',
    fontFamily: "'Microsoft YaHei'",
    fontWeight: 'bold',
    fontSize: '0.8rem',
    lineHeight: '1.2rem',
    letterSpacing: '0rem',
    textAlign: 'left',
    width: '136px',
  };
  // V5.23（用户规格）：工单卡位置对调——工单号/客户名文字随案例写入对调后的槽位
  //（原设计烤入 c1/c2 各自槽位的文案，对调后须显式改写 text）
  for (const k of ['c1', 'c2']) {
    const slot = ORDER_SLOT[k];
    P.set(ORDER_NO_IDS[slot], { text: CASES[k].orderNo });
    P.set(CUST_IDS[slot], { text: CASES[k].customer, title: CASES[k].customer, s: NAME_FONT });
  }
  // 面板收起（V2.12）：设计把手与箭头可点提示（收起后由覆盖层副本把手承担展开）；
  // 日志面板包裹层 pointer-events:none，其把手/箭头需显式恢复 auto 才可点
  P.set(LP_HANDLE_ID, { title: '收起工单列表', s: { cursor: 'pointer' } });
  P.set(LP_ARROW_ID, { title: '收起工单列表', s: { cursor: 'pointer' } });
  P.set(LG_HANDLE_ID, { title: '收起A2A-T协作日志', s: { cursor: 'pointer', pointerEvents: 'auto' } });
  P.set(LG_ARROW_ID, { title: '收起A2A-T协作日志', s: { cursor: 'pointer', pointerEvents: 'auto' } });
  // 日志面板标题/计数为真实 DOM 文字（V3.10）：恢复鼠标事件使其可选中/可查（包裹层 pointer-events:none
  // 曾使其不可选中——观感似切图）；logLive 恒 true，LogSensor 覆盖层不挂载，无点击拦截冲突
  P.set(LOGS.titleTextId, { s: { pointerEvents: 'auto', cursor: 'text' } });
  P.set(LOGS.countTextId, { s: { pointerEvents: 'auto', cursor: 'text' } });
  // 点阵背景：V5.20（用户规格）整层去除——不再铺点（原 V2.24..V2.25：浅灰 16px 平铺；
  // V3.4 颜色 #C9C9C9、V3.6 透明度 0.25——均随去除废止）
  P.set(DOT_BG_ID, { hide: true });
  // 回放按钮组图标水平对齐（V2.16）：单步/倍速/停止按钮的 1px 边框使内部绝对定位的图标/
  // 文字整体下移 1px（回放按钮为实底无边框）→ 改 inset box-shadow 描边（视觉等效、不占布局）
  for (const id of ['23:137029', '23:137058', '23:137063']) {
    P.set(id, { s: { border: 'none', boxShadow: 'inset 0 0 0 1px rgba(119,119,119,1)' } });
  }
  //（V3.2 成效指标区域整区删除——原条底切图/顶缘装饰条隐藏补丁随之移除）
  // V3.7：注册中心节点由能开平台组件替代（SubStepPanels 常驻 PlatformNodeCard，144×142
  // 与原 80×86 节点同心 441,305；reg-* 检索线起点改锚平台卡右缘 514，见 paths.js/roles-data.js）
  P.set(REG_ID, { hide: true });
  if (ctx.ordersHidden) P.set(LP_ROOT_ID, { hide: true });
  if (ctx.logHidden) P.set(LG_ROOT_ID, { hide: true });
  const { fx, fy } = fitFactors(ctx);
  const VF = viewFactors(ctx);
  if (ctx.zoom !== 1 || fx !== 1 || fy !== 1 || VF.sx !== 1 || VF.sy !== 1) {
    if (ctx.zoom !== 1) P.set(ZOOM.labelId, { text: Math.round(ctx.zoom * 100) + '%' });
    // 固定节点反向变换（V2.17）：仅抵消区域收起重适配 F——保持设计尺寸与原位，视口/缩放
    // 在整页画布层均匀作用 → 固定节点随屏幕/缩放等比改变（scale(1/f) @ o=(p−F(p))/(f−1)）；
    // 与按钮描边等先置补丁按 key 合并（P.set 整条覆盖曾致非 16:9/收起态描边丢失→图标错位复现）；
    // 无过渡（与区域变换同步瞬时）
    const Pz = overlayFitParams(ctx);
    for (const f of ZOOM.fixedNodes) {
      const b = FLOW_BOXES.get(f.id);
      if (b) {
        const prev = P.get(f.id) || {};
        P.set(f.id, { ...prev, s: { ...prev.s, ...fixedCounterStyle(ctx, Pz, b) } });
      }
    }
    //（点阵背景下缘补齐补丁随 V5.20 点阵整层去除而移除）
  }
  // ---- V2.13 收起重适配·保比例：集群节点/文字保持原始长宽比（连线/底板随区域拉伸铺满）。
  // 恒等补丁常驻（展开态 scale(1,1) 不影响像素回归），transform 过渡与区域变换同步（0.25s）----
  const ctr = rootCounterStyle(ctx);
  const putFit = (id, s) => { const prev = P.get(id) || {}; P.set(id, { ...prev, s: { ...prev.s, ...s } }); };
  for (const cl of CLUSTERS) {
    putFit(cl.root, ctr);
    for (const sid of cl.sats) { const b = FLOW_BOXES.get(sid); if (b) putFit(sid, satCssStyle(ctx, b, cl.center)); }
  }
  for (const s of CHEVRON_SATS) { const b = FLOW_BOXES.get(s.id); if (b) putFit(s.id, satCssStyle(ctx, b, s.anchor)); }
  for (const id of LOG_KEEP) putFit(id, ctr);
  //（V2.14 视口铺满曾在此对非流程图区域原子单元反向视口系数；V2.17 整页等比后移除——
  //  内容随画布等比缩放即 rem 语义，且避免渐变文字节点被 transform 化产生重影）
  // 步骤条文字可选中 + 箭头造型（V2.16；V2.19 间距定稿 0.25rem）：chip 背板后渲染且覆盖标题/时长
  //（文字本为 DOM 文本，穿透鼠标事件即可选中）；chip 在原 159.75 格内收窄 4px 居中
  //（相邻步骤边沿间距 0.25rem=4px——16/8px 时图标紧贴左切口似在条外，收窄后图标距切口余量
  // ~6.9px 稳在条内），clip-path 剪出右侧凸出尖端/左侧朝右凹陷切口，
  // 首枚左缘平/末枚右缘平（传输室未登场时末枚动态右平见 buildPatches）；
  // chip 中心不变 → 反向缩放原点改锚自身中心（覆盖 CHEVRON_SATS 估值）
  CHEVRONS.forEach((ch, i) => {
    const clip = i === 0 ? CHEV_CLIP.first : (i === CHEVRONS.length - 1 ? CHEV_CLIP.last : CHEV_CLIP.mid);
    putFit(ch.chipId, {
      left: (ch.box.x - 305 + 2) + 'px',
      width: (ch.box.w - 4) + 'px',
      clipPath: clip,
      transformOrigin: '50% 50%',
      pointerEvents: 'none',
    });
  });
  if (ctx.speed !== 0.5) P.set(BUTTONS.speed.labelTextId, { text: ctx.speed + 'x' });
  return P;
}

export function buildPatches(world, ctx) {
  const P = new Map();
  const set = (id, patch) => { if (id) P.set(id, patch); };
  const hide = (id) => { if (id) P.set(id, { hide: true }); };

  // ---- 静态占位文案修正（快照/回放一致）：XX → 粤东/粤西 ----
  // 卡片标题（粤东/粤西 SPN 智能体，含粤西发光容器内同名副本）
  set(CARDS.YD.nameTextId, { text: '粤东SPN网络内生智能' });
  set(CARDS.YX.nameTextId, { text: '粤西SPN网络内生智能' });
  set(CARDS.YX.glowNameTextId, { text: '粤西SPN网络内生智能' });
  // 左侧工单卡描述：真实文案 + 溢出省略 + 悬浮全文；
  // c1 协商补充 vlan 后（orderInfo，t=226 Accept）工单信息更新为补充后的端口专线信息
  // V5.23：描述随 ORDER_SLOT 落位
  const d1 = world && world.orderInfo ? CASES.c1.orderDescUpdated : CASES.c1.desc;
  set(ORDERS[ORDER_SLOT.c1].descTextId, { text: d1, title: d1, s: ELLIPSIS });
  set(ORDERS[ORDER_SLOT.c2].descTextId, { text: CASES.c2.desc, title: CASES.c2.desc, s: ELLIPSIS });

  if (!world) {
    for (const k of AGENTS) {
      CARDS[k].mini.forEach((m) => {
        if (m.designState === 'active') return;
        m.slotHideIds.forEach((id) => P.set(id, { hide: true }));
      });
    }
    // 第二条日志：整行切图（斑马纹位图）改文字呈现 —— 位图隐藏、斑马纹以单元格底色补回
    hide(LOGS.zebraSpriteId);
    set(LOGS.zebraCellId, { s: { backgroundColor: 'rgba(119,119,119,0.15)' } });
    // 静态日志行占位文案修正（对应案例一第 2/4/8 条事件的展示文案，V4 工单1）
    set(LOGS.rowTexts.row1Summary, { text: '进行集客专线业务投诉场景网络侧故障诊断，达成诊断目标，电路编号：广州-深圳GE1508KA/P。故障现象：专线中断。' });
    set(LOGS.rowTexts.row2To, { text: '粤西SPN网络内生智能' });
    set(LOGS.rowTexts.row2Summary, { text: '对网络侧故障进行诊断，返回故障根因和修复建议等诊断结果信息。接入端口名称：P36169-YWHJ-棠溪村微网格业务汇聚机房1（990）-1-1-TPN1EM10F-10-ETH' });
    set(LOGS.rowTexts.row3From, { text: '粤西SPN网络内生智能' });
    // V2.13/V2.14：收起或非 16:9 视口（快照态）连线 sprite 位图无法随集群端点重适配 → 整组隐藏，
    // 由覆盖层 SVG 连线（StorylineOverlays 以伪 world 全量呈现）接管
    const TF0 = totalFactors(ctx);
    if (TF0.fx !== 1 || TF0.fy !== 1) {
      for (const L of Object.values(LINES)) hide(L.spriteId);
    }
    // 粤西卡内嵌描述（快照态可见）：占位文案 → 真实描述（V4：c1 粤西=故障侧·光纤中断）
    set(CARDS.YX.descTextId, { text: CASES.c1.d.yx0 });
    // 白色房间高亮底：默认打开不展示（回放态由下方分支按当前房间定位）
    hide(ROOMS.bgId);
    // 快照态点亮日志：仅日志区变实时（隐藏静态行/装饰滚动条），其余保持设计稿
    if (ctx.logLive) {
      LOGS.cellIds.forEach((id) => P.set(id, { hide: true }));
      P.set(LOGS.scrollbarId, { hide: true });
      set(LOGS.countTextId, { text: CASES[ctx.caseId].logs.length + '条' });
    }
    return P;
  }

  // ---- 传输室延迟登场：投诉定界完成、检索命中专线投诉处置智能体（ZX appear，两案例均在
  // 定界步骤结束后的检索窗口末尾）之前，传输室整组不呈现——房间标签、监控室—传输室连线
  // 与滑块、该室 4 个步骤条（根因定位/方案生成/修复验证/投诉报结），均随专线卡同时出现 ----
  const csRoomIdx = ROOMS.rooms.findIndex((r) => r.key === '传输室');
  const csOn = world.visible.ZX;

  // ---- 房间白色高亮底：跟随当前步骤所在房间（客服/监控室/传输室）平移 ----
  const steps = world.steps;
  let ai = steps.lastIndexOf('active');
  if (ai === -1) ai = steps.length - 1; // 全部完成 → 最后一步所在房间（传输室）
  // 传输室未登场时：当前步骤已推进到该室（定界完成→检索命中的空窗），高亮底回落到最近的已登场房间
  if (!csOn) { while (ai > 0 && CASES[ctx.caseId].stepRooms[ai] === csRoomIdx) ai--; }
  const rect = ROOMS.rooms[CASES[ctx.caseId].stepRooms[ai]] || ROOMS.rooms[ROOMS.rooms.length - 1];
  set(ROOMS.bgId, { s: {
    left: rect.left + 'px',
    width: rect.width + 'px',
    transition: 'left 0.5s ease, width 0.5s ease',
  } });
  // 组间连线（客服—监控室—传输室）滑块动效；监控室—传输室段（连线 sprite+滑块）随传输室登场
  ROOMS.glides.forEach((g, i) => {
    if (!csOn && i === csRoomIdx - 1) { hide(g.id); return; }
    // V5.12（用户规格）：光束滑块仅在回放中移动——其余时刻（暂停/完成/快照）不施加
    // 动画类、静止呈现于连线中点
    if (ctx.mode === 'playing') set(g.id, { c: 'st-glide' + i });
  });
  if (!csOn) { hide(CS_TAB_ID); hide(CS_LINK_ID); }

  // ---- 智能体卡片 ----
  for (const k of AGENTS) {
    const card = CARDS[k];
    // 未登场节点隐藏（案例二粤西不登场：完成态同样不呈现）
    if (!world.visible[k]) {
      hide(card.bgId); hide(card.badgePillId); hide(card.badgeTextId);
      if (k === 'YX') hide(card.glowId);
      continue;
    }
    const st = world.caseDone && world.nodes[k] === 'idle' ? 'success' : world.nodes[k];
    if (st === 'idle') {
      set(card.bgId, { c: 'st-idle' });
      hide(card.badgePillId); hide(card.badgeTextId);
    } else if (st === 'running') {
      set(card.bgId, {
        c: 'st-running',
        s: {
          // V2.23：改用 border 简写覆盖（原 borderColor 长属性在 running→success 回落时被 React
          // 单独清空——CSSOM 中简写已展开为长属性、清 color 后回落 currentColor（黑边框），
          // 回放结束后边框变黑即此因；简写键值变化可整组重设，回落自然恢复设计蓝）
          border: '1px solid rgba(0,103,209,1)',
          boxShadow: '0px 0px 25.02px 0px rgba(71,101,184,1), 0px 0px 50.04px 0px rgba(71,101,184,0.5)',
        },
      });
      set(card.badgePillId, { s: { backgroundColor: 'rgba(89,144,253,1)' } });
      set(card.badgeTextId, { text: '进行中', s: { color: 'rgba(255,255,255,1)' } });
    } else {
      set(card.badgePillId, { s: { backgroundColor: 'rgba(13,148,88,1)' } });
      set(card.badgeTextId, { text: '已完成', s: { color: 'rgba(255,255,255,1)' } });
    }
    // 执行中步骤描述 → 卡片高度固定（V5.6 用户规格：不随描述动态增高/回落——
    // 描述至多两行、不超出卡底，见 StepDesc/storyline.css line-clamp；height 补丁仅保持设计值）
    const grown = world.desc[k] ? (card.descExt || 0) : 0;
    const bgPrev = P.get(card.bgId) || {};
    P.set(card.bgId, {
      ...bgPrev,
      s: {
        ...bgPrev.s,
        height: (card.box.h + grown) + 'px',
        transition: 'height 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease',
      },
    });
    // 迷你步骤链：静态圆点全部隐藏（覆盖层统一渲染）；V3.24 未执行到的子步骤整体不出现——
    // todo 标题/连接线隐藏（补丁按次全量重算，状态离开 todo 即恢复渲染），执行到该步时才展示；
    // V4：完成态 caseDone 强制点亮按案例槽位使用集裁剪（usedMini 之外的槽位保持 todo → 不展示）；
    // V5 槽位紧凑：标题随槽位前移补位（使用集第 p 个槽位平移至第 p 个位置，与 MiniCircles
    // 紧凑落位一致），连接线按「位置 p ↔ p+1」呈现——未使用槽位不留空
    const states = world.mini[k];
    const um = (CASES[ctx.caseId] && CASES[ctx.caseId].usedMini) || null;
    const used = um && um[k] ? um[k] : card.mini.map((_, i) => i);
    // V5.5（用户规格）：迷你步骤行水平居中——可见子步骤数 n < 总槽位 N 时，标题/连接线
    // 随行整体右移 (N−n)×间距/2（各卡满行为设计居中版式，满行 shift=0；与 MiniCircles
    // 圆点同源）——每次出现下一个子步骤（n 增）重算一次，0.25s 过渡平滑回中
    const Nsl = card.mini.length;
    const mSpacing = Nsl > 1 ? card.mini[1].slotBox.x - card.mini[0].slotBox.x : 0;
    const nVis = used.filter((i) => world.caseDone || states[i] !== 'todo').length;
    const cShift = (Nsl - nVis) * mSpacing / 2;
    card.mini.forEach((m) => { m.slotHideIds.forEach(hide); });
    // 未使用槽位标题隐藏（回放中其状态恒为 todo；显式隐藏覆盖快照烤入版式）
    card.mini.forEach((m, i) => { if (!used.includes(i)) set(m.titleId, { hide: true }); });
    // 连接线 connId[p]（设计位置 p↔p+1）：使用集内相邻两槽（used[p]、used[p+1]）均执行到
    // 才显示，颜色随位置 p 槽位状态；位置超出使用集（其后无槽位）隐藏；V5.5 随行居中平移
    card.mini.forEach((m, p) => {
      if (!m.connId) return;
      const iA = used[p];
      const iB = used[p + 1];
      if (iA === undefined || iB === undefined) { hide(m.connId); return; }
      const sA = world.caseDone ? 'done' : states[iA];
      const sB = world.caseDone ? 'done' : states[iB];
      if (sA === 'todo' || sB === 'todo') hide(m.connId);
      else set(m.connId, { s: {
        backgroundColor: sA === 'done' ? 'rgba(54,193,141,1)' : 'rgba(243,243,243,0.15)',
        transform: 'translateX(' + cShift + 'px)',
        transition: 'transform 0.25s ease',
      } });
    });
    used.forEach((i, p) => {
      const m = card.mini[i];
      const s = world.caseDone ? 'done' : states[i];
      if (s === 'todo') { set(m.titleId, { hide: true }); return; }
      const ts = s === 'active'
            ? {
              // V3.16 内部子步骤执行中选中态（用户规格：radius 0.2rem / bg #002E6A /
              // border 0.05rem，1rem=20px → 4px/1px）；
              // V3.17 选中态文字定稿：#FFFFFF、HarmonyOS Sans SC Medium、0.5rem/0.9rem（10px/18px）、居中；
              // V3.18 边框对比度增强（#2E86DE → 亮蓝 #5CACFF）+ 加大内边距使胶囊明确包住文字；
              // V3.26 边框（胶囊框）再收敛：padding 6/2 → 4/1（胶囊 = 文字 + 2×4 + 2×1，高 22），
              // 负 margin 同步 -5/-2 保持文字原位不动、胶囊对称扩展
              color: '#FFFFFF',
              fontFamily: "'HarmonyOS Sans SC','HarmonyOS Sans','HarmonyOSHeiTi','Microsoft YaHei','PingFang SC',sans-serif",
              fontWeight: '500',
              fontSize: '10px',
              lineHeight: '18px',
              letterSpacing: '0px',
              textAlign: 'center',
              backgroundColor: '#002E6A',
              border: '1px solid #5CACFF',
              borderRadius: '4px',
              padding: '1px 4px',
              width: 'auto',
              height: 'auto',
              marginLeft: '-5px',
              marginTop: '-2px',
              backgroundImage: 'none',
              WebkitBackgroundClip: 'border-box',
              backgroundClip: 'border-box',
            }
            : { color: 'rgba(255,255,255,1)', backgroundImage: 'none', WebkitBackgroundClip: 'border-box', backgroundClip: 'border-box' };
      // V5 紧凑平移：使用集第 p 个槽位标题移至第 p 个位置（槽间距 52px）；
      // V5.5：+ 居中平移 cShift（可见数变化时整行回中，transition 平滑）
      const dx = card.mini[p].slotBox.x - m.slotBox.x + cShift;
      if (dx) ts.transform = 'translateX(' + dx + 'px)';
      ts.transition = 'transform 0.25s ease';
      set(m.titleId, { s: ts });
    });
  }
  // 粤西：内嵌步骤描述与发光容器在回放态隐藏（描述由覆盖层统一渲染、发光由 st-running 提供）
  hide(CARDS.YX.descTextId);
  hide(CARDS.YX.glowId);

  // ---- 步骤条 ----
  let lastVisChev = -1;
  CHEVRONS.forEach((ch, i) => {
    // 传输室步骤（根因定位/方案生成/修复验证/投诉报结）：随专线投诉处置智能体登场，此前整组隐藏
    if (!csOn && CASES[ctx.caseId].stepRooms[i] === csRoomIdx) {
      [ch.chipId, ch.iconId, ch.nameId, ch.durId].forEach(hide);
      return;
    }
    lastVisChev = i;
    const st = world.steps[i];
    if (st === 'active') {
      set(ch.chipId, { c: 'st-chip-active', s: { backgroundColor: 'rgba(0,103,209,0.4)' } });
    } else if (st === 'todo') {
      [ch.chipId, ch.iconId, ch.nameId, ch.durId].forEach((id) => set(id, { c: 'st-dim' }));
    } else {
      // done：底色显式归一为中性——设计稿曾烤入高亮底（rgba(0,103,209,0.4)），
      // done 态原先不打补丁会残留高亮（停止/默认加载完成态、回放中已完成步骤同样生效）
      set(ch.chipId, { s: { backgroundColor: 'rgba(243,243,243,0.2)' } });
    }
  });
  // 传输室未登场：末枚可见 chip 右缘改平（uiPatches 提供的是中段尖角造型；登场后覆盖消失自动还原。
  // 与 active/todo 态样式合并，避免整条覆盖）
  if (!csOn && lastVisChev >= 0 && lastVisChev < CHEVRONS.length - 1) {
    const lc = CHEVRONS[lastVisChev].chipId;
    const prev = P.get(lc) || {};
    P.set(lc, { ...prev, s: { ...prev.s, clipPath: CHEV_CLIP.last } });
  }

  // ---- 连线与协议胶囊（回放态全部隐藏，由 SVG 覆盖层矢量重绘）----
  // 设计稿连线 sprite 为整框不透明位图（烤入背景）：房间底平移后露矩形色块；
  // 检索连线在设计稿无像素（sprite 为纯背景块）；协议胶囊为矩形底色块（用户要求连线不带）。
  // 完成态（caseDone）所有连线由覆盖层全量呈现（ConnectionLines）。
  for (const L of Object.values(LINES)) {
    hide(L.spriteId);
    hide(L.pillId);
  }
  // 连线静态脉冲短条（矩形 5749 等）：回放态由流动小球替代
  DECOR.segIds.forEach(hide);

  // ---- 日志：静态 3 行与装饰滚动条隐藏（覆盖层渲染），计数文本实时 ----
  LOGS.cellIds.forEach(hide);
  hide(LOGS.scrollbarId);
  set(LOGS.countTextId, { text: world.logs.length + '条' });

  // ---- 左侧工单卡：选中态 / 回放中状态（V5.23：随 ORDER_SLOT 落位） ----
  const other = ctx.caseId === 'c1' ? 'c2' : 'c1';
  const sel = ORDERS[ORDER_SLOT[ctx.caseId]];
  const uns = ORDERS[ORDER_SLOT[other]];
  set(sel.id, { s: { border: '1px solid rgba(46,134,222,1)' } });
  set(uns.id, { s: { border: '1px solid rgba(119,119,119,1)' } });
  ORDERS.checkIds.forEach(hide); // 静态对勾隐藏，覆盖层浮动对勾替代
  if (!world.caseDone) {
    // 回放/单步进行中：选中工单卡状态显示「回放中」（案例本身已完成，非业务进行中）
    set(sel.pillId, { s: { backgroundColor: 'rgba(246,158,57,0.15)' } });
    set(sel.pillTextId, { text: '回放中', s: { color: 'rgba(246,158,57,1)' } });
  }

  return P;
}
