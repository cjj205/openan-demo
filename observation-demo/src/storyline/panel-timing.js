// panel-timing.js — 面板分步节奏（V3.23）
// 三处共用单一来源：IntentRecognitionPanel（步权重）、SubStepPanels（挂载窗口/props）、
// cases.js（单步节拍 c.beats 并入面板阶段边界——否则窗口内无事件节拍时单步按钮
// 一步跨过整个窗口，如意图识别 18..83，用户只能看到第一步）。
// 纯函数（入参为案例对象 c），不依赖其他模块

// 意图识别面板 5 步权重：V3.28 首步（输入）停留 30%→20%（第一步与第二步间隔缩短），
// 中间三步（Reasoning/Action/Observation）保持加速展示，末步（输出）停留至窗口结束
export const INTENT_WEIGHTS = [0.20, 0.10, 0.10, 0.10, 0.50];

// Task-T 面板 8 段（均分）
export const TASKT_STEPS = 8;

// V3.26：动态编排面板 3 段（左侧元素 → 编排引擎 → 右侧元素）
export const ORCH_WEIGHTS = [0.3, 0.3, 0.4];

// V3.26：Notification-T 面板 3 段（抢通前 → 箭头 → 抢通后）；
// V3.27 末段提前至 50%（窗口终点=下一子步骤，末段须留出展示停留）
export const NOTIF_WEIGHTS = [0.3, 0.2, 0.5];

// V3.30：调度处置面板 3 段（手机 → 左侧消息气泡 → 右侧回复气泡）；
// 末段（回复气泡）停留至窗口结束（同 NOTIF 末段留展示停留）
export const DISPATCH_WEIGHTS = [0.3, 0.3, 0.4];

export const miniWindowOf = (c, k, i) => {
  let t0 = 0, t1 = 0;
  for (const e of c.events) {
    if (e.type === 'mini' && e.k === k && e.i === i) {
      if (e.st === 'active') t0 = e.t;
      else if (e.st === 'done' && e.t >= t0) { t1 = e.t; break; }
    }
  }
  return { t0, t1: t1 || t0 };
};

const flowWindowOf = (c, line) => {
  let t0 = 0, t1 = 0;
  for (const e of c.events) {
    if (e.type === 'flow' && e.line === line) {
      if (e.on && !t0) t0 = e.t;
      else if (!e.on && t0) { t1 = e.t; break; }
    }
  }
  return { t0, t1: t1 || t0 + 1 };
};

export const taskTWindowOf = (c) => {
  let t0 = 0;
  for (const e of c.events) if (e.type === 'flow' && e.line === 'waimo-zx-task' && e.on) { t0 = e.t; break; }
  let t1 = t0 + 16;
  // V3.24：窗口终点 = 专线首个内部子步骤开始（数据关联）——面板消失后子步骤才执行；
  // 下限 16 业务秒保证 8 段分步节奏可读（c1 152..178 / c2 72..88）
  for (const e of c.events) if (e.type === 'mini' && e.k === 'ZX' && e.i === 0 && e.st === 'active') { t1 = Math.max(e.t, t0 + 16); break; }
  return { t0, t1 };
};

// V3.22：检索面板窗口；V3.28 去掉尾段（连线关闭即消失）；V3.31 恢复 +6 业务秒尾——
// 检索面板两段分步偏快（选中高亮一闪而过），尾段驻留至下一面板登场前：
//   - waimo 检索尾段不得越过 Task-T 面板起点（两面板不同时出现）；
//   - zx 检索 c1 尾段自由（后续至协商层 213 前无面板）；c2 尾段恰逢动态编排面板
//     （编排起点=检索连线关闭时刻）——尾段截断，维持原窗口
export const searchWindowOf = (c, line) => {
  const w = flowWindowOf(c, line);
  let t1 = w.t1 + 6;
  if (line === 'reg-waimo-search') t1 = Math.min(t1, taskTWindowOf(c).t0);
  else if (line === 'reg-zx-search') {
    // c2 编排面板起点=检索连线关闭时刻（相等也须截断，否则尾段跨入编排面板窗口）
    const orch0 = orchestrationWindowOf(c).t0;
    if (orch0 >= w.t1) t1 = Math.min(t1, orch0);
  }
  return { t0: w.t0, t1: Math.max(t1, w.t1) };
};

// V3.26：动态编排面板窗口；V3.27 改为 mini1（动态编排）激活 → mini2（任务诊断）激活——
// 面板分步在下一子步骤开始前完成（面板消失即下一子步骤开始，同 Task-T 模式）
export const orchestrationWindowOf = (c) => {
  const w1 = miniWindowOf(c, 'ZX', 1);
  const w2 = miniWindowOf(c, 'ZX', 2);
  return { t0: w1.t0, t1: Math.max(w1.t1, w2.t0 || 0) };
};

// V3.27：Notification-T 面板窗口——waimo-zx-notif 连线激活 → WAIMO mini3（投诉闭环）激活
//（下一子步骤开始前分步完成；下限 8 业务秒保底节奏）
export const notifWindowOf = (c) => {
  const { t0 } = flowWindowOf(c, 'waimo-zx-notif');
  const w = miniWindowOf(c, 'WAIMO', 3);
  return { t0, t1: Math.max(w.t0 || t0 + 8, t0 + 8) };
};

// V3.30：调度处置面板窗口——WAIMO mini2（调度处置）激活起，mini2 仅 4/3 业务秒，
// 延展窗口保三段分步节奏可读；V3.32 终点改为 ZX mini4（修复验证）激活——
// 修复验证在面板消失后执行（面板退场即修复验证开始，同 Task-T/专线子步骤交接模式；
// 窗口延展期内抢通执行/抢通结果通知均为其他卡活动，不与 WAIMO 子步骤冲突）
export const dispatchWindowOf = (c) => {
  const w = miniWindowOf(c, 'WAIMO', 2);
  const v = miniWindowOf(c, 'ZX', 4);
  return { t0: w.t0, t1: Math.max(w.t0, v.t0 || w.t1) };
};

// V3.31：意图识别面板窗口——mini0 激活窗口收敛上限 36 业务秒（c1 全窗 65 秒 ≈16 墙秒，
// 分步推进偏慢；提前完成分步退场。mini0 加载与描述文本仍持续至原窗口结束，
// c2 窗口 33 秒短于上限不受影响）
export const intentWindowOf = (c) => {
  const w = miniWindowOf(c, 'WAIMO', 0);
  return { t0: w.t0, t1: Math.min(w.t1, w.t0 + 36) };
};

// 面板阶段边界时刻（业务秒，不含窗口起点——起点本身即事件节拍）：
// 各窗口按步权重取累计边界；+0.01 容差确保单步落点越过边界（浮点比较安全）；
// 检索面板 2 段（50% 选中边界）
export function panelStageBeats(c) {
  const beats = [];
  const push = (win, weights) => {
    let acc = 0;
    for (let i = 0; i < weights.length - 1; i++) {
      acc += weights[i];
      const b = win.t0 + (win.t1 - win.t0) * acc + 0.01;
      if (b > win.t0 + 0.01 && b < win.t1) beats.push(b);
    }
  };
  push(intentWindowOf(c), INTENT_WEIGHTS);
  push(taskTWindowOf(c), Array(TASKT_STEPS).fill(1 / TASKT_STEPS));
  push(searchWindowOf(c, 'reg-waimo-search'), [0.5, 0.5]);
  push(searchWindowOf(c, 'reg-zx-search'), [0.5, 0.5]);
  push(orchestrationWindowOf(c), ORCH_WEIGHTS);
  push(notifWindowOf(c), NOTIF_WEIGHTS);
  push(dispatchWindowOf(c), DISPATCH_WEIGHTS);
  return beats;
}
