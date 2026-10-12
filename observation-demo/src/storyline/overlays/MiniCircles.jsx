// MiniCircles.jsx — 迷你步骤图标（纯 SVG：待办数字圈 / 进行中 loading 旋转 / 完成绿圈+对号）
// 对号路径自设计稿像素拟合：顶点 (5.7,8)，两臂 (3.2,6.2)/(10,3.2)；
// 颜色/线宽全部走 SVG presentation attributes（不依赖 CSS 加载，避免样式表缺失/未热更时回落到默认黑色）；
// 快照态 loading 槽位沿用静态 <img>（保持像素基准确定性，避免旋转角随机导致截图抖动）
import React from 'react';
import { CARDS, AGENTS, satSvgTransform } from '../roles';

const CHECK_D = 'M3.2 6.2 L5.7 8 L10 3.2';
const FONT = "'HarmonyOS Sans SC','HarmonyOS Sans','HarmonyHeiTi','Microsoft YaHei','PingFang SC',sans-serif";
const GREEN = 'rgba(54,193,141,1)';

// 执行中 loading 弧段（V2.21 原生 SVG）：270° 开口弧（顶部留缺口）——原图标 ic_public_loading_clockwise
// 为完整圆环 + 两个 ~1px 箭头（14 单位 viewBox 内 0.9×0.6），旋转对称、旋转不可辨（实测动画 0.75s/圈
// 运行正常——用户反馈"看不出在转动"非速度问题，乃图形对称所致）；开口弧为经典 spinner 造型，
// 任何转速下旋转清晰可见。
// V3.23 用户反馈对比度不足：弧线自品牌蓝 #2070F3 提亮至 #5CACFF 并加粗（1.2→1.5），
// 底盘自 15% 浅蓝加深为 30% 品牌蓝——亮弧/深盘/暗卡三层对比（辉光 filter 见 .st-mc-spin）
const SPIN_BG = { cx: 7, cy: 7, r: 8, fill: 'rgba(32,112,243,0.30)' };
const SPIN_ARC = 'M12.23 1.77A7.4 7.4 0 1 1 1.77 1.77';

const RING = {
  done: { stroke: GREEN, fill: 'rgba(9,170,113,0.15)' },
  todo: { stroke: 'rgba(119,119,119,1)', fill: 'rgba(243,243,243,0.2)' },
};

export default function MiniCircles({ world, pub }) {
  const live = !!world;
  const els = [];
  for (const k of AGENTS) {
    if (live && !world.visible[k]) continue; // 未登场节点不渲染（含完成态：案例二粤西）
    const card = CARDS[k];
    // V2.13：槽位锚定卡集群（T = W⁻¹∘(Z+Δ)，展开态退化为原 translate）——图标/数字保持原比例随卡平移
    const anchor = { x: card.box.x + card.box.w / 2, y: card.box.y + card.box.h / 2 };
    card.mini.forEach((m, i) => {
      const s = live ? (world.caseDone ? 'done' : world.mini[k][i]) : (m.designState || 'todo');
      if (live && s === 'todo') return; // V3.24：未执行到的子步骤不渲染（执行到该步时才出现）
      if (!live && s === 'active') return; // 快照态：静态 <img> 已呈现该槽位
      const b = m.slotBox;
      els.push(
        <g key={k + '-' + i} className={'st-mc st-mc-' + s}
          style={{ transform: satSvgTransform(pub, b, anchor), transition: 'transform 0.25s ease' }}>
          {s === 'active' ? (
            // 执行中 loading：16px 居中放大（14px 槽位内 +2px）+ CSS 辉光（见 .st-mc-spin）；
            // V2.21 改原生 SVG 开口弧（原图标整环旋转不可辨），动画仍由 .st-mc-spin 统一旋转
            <g className="st-mc-spin">
              <circle cx={SPIN_BG.cx} cy={SPIN_BG.cy} r={SPIN_BG.r} fill={SPIN_BG.fill} />
              <path d={SPIN_ARC} fill="none" stroke="#5CACFF"
                strokeWidth="1.5" strokeLinecap="round" />
            </g>
          ) : (
            <>
              <circle className="st-mc-ring" cx="7" cy="7" r="6.5"
                fill={RING[s].fill} stroke={RING[s].stroke} strokeWidth="1" />
              {s === 'todo'
                ? <text className="st-mc-num" x="7" y="10.2" textAnchor="middle"
                    fill="rgba(147,147,147,1)" fontSize="10" fontWeight="400" fontFamily={FONT}>{i + 1}</text>
                : <path className="st-mc-check" d={CHECK_D}
                    fill="none" stroke={GREEN} strokeWidth="1.1"
                    strokeLinecap="round" strokeLinejoin="round" />}
            </>
          )}
        </g>
      );
    });
  }
  if (!els.length) return null;
  return (
    <svg className="st-layer st-mc-svg" viewBox="0 0 1920 1080" width="1920" height="1080" aria-hidden="true">{els}</svg>
  );
}
