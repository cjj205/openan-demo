// cases.js — 案例剧本数据（故事线事件时间轴，t 为业务秒）
// 回放墙钟 = 业务秒 × TIME_SCALE / speed；日志时间戳为展示文案，不参与计时
//（V3.8：日志 clock 按回放调度时刻经步骤边界映射到业务秒——与步骤条分钟时长对齐，见下方 V3.8 注）
// 日志行数据参考仓库根 case1.js / case2.js（见 case-data.js，与本文件同步维护）
// V2.26：投诉分析流 7 步（受理1分钟/识别2分钟/定界8分钟/根因定位10分钟/方案生成3分钟/
// 修复验证3分钟/报结5分钟，投诉分类并入识别、问题修复→修复验证）——步骤条时长为流程定
// 义的标称值，回放节拍仍按案例业务秒推进；WAIMO 迷你步骤改 投诉识别/定界定位/调度处置/
// 投诉闭环，专线迷你步骤改 数据关联/动态编排/任务诊断/根因总结/修复验证/结果回复；
// 协作日志不再呈现节点内部步骤（from===to）行，仅保留 A2A-T（Task-T / Negotiation-T /
// Notification-T）与检索注册中心日志（Authorization-T 授权类消息不进入日志区域，V2.27）

import { CASE_EVENTS, buildLogs } from './case-data';
import { panelStageBeats } from './panel-timing';

export const TIME_SCALE = 0.25; // 1x 时：案例一 410s→约102s，案例二 195s→约49s

// 迷你步骤描述（卡片内底部渐变文字，≤15 字适配单行）
// c1：跨域全阻（粤东+粤西） / c2：SLA 劣化（仅粤东）
const D1 = {
  ts: '识别业务类型：跨域SPN专线（传输域）',
  dj: '界定：专线故障',
  dd: '调度抢通任务：更换粤东光模块',
  sj: '关联OSS流水、档案与历史告警',
  bd: '编排粤东、粤西并行诊断子任务',
  rw: '双侧SPN链路故障诊断中',
  zg: '根因：粤东光模块老化损坏',
  xf: '双侧抢通执行，验证业务恢复',
  hf: '结果回复WAIMO，工单闭环',
  bjW: '工单办结，端到端用时32分钟',
  wd: '粤东SPN侧链路故障定位中',
  fa: '方案：更换粤东机房A区光模块',
  qt: '更换光模块，业务抢通恢复',
  wdx: '粤西SPN侧链路故障定位中',
  fax: '粤西侧无需修复，排查粤东侧',
  qtx: '粤西无需抢通，本侧保持监测',
};
const D2 = {
  ts: '识别业务类型：SPN专线质量类',
  dj: '界定：粤东（珠江旧城）SLA劣化',
  dd: '调度抢通任务：修正QoS策略',
  sj: '关联OSS流水与SLA性能曲线',
  bd: '编排粤东SPN侧诊断子任务',
  rw: '粤东SPN侧SLA劣化诊断中',
  zg: '根因：QoS限速策略误配置',
  xf: '修正QoS策略，验证SLA恢复',
  hf: '结果回复WAIMO，工单闭环',
  bjW: '工单办结，端到端用时32分钟',
  wd: '粤东SPN侧链路劣化定位中',
  fa: '方案：QoS限速修正至100Mbps',
  qt: '修正QoS策略，SLA指标恢复',
};

// 步骤 → 房间分区索引（0客服/1监控室/2传输室，与 ROOMS.rooms 对应；两案例分组一致）
// 受理→客服；识别、定界→监控室；根因定位、方案生成、修复验证、报结→传输室
const STEP_ROOMS = [0, 1, 1, 2, 2, 2, 2];

const c1 = {
  id: 'c1',
  orderNo: 'GD-SPN-2025082001',
  customer: '某省政务云中心',
  desc: '主备专线同时中断，粤东至粤西段链路全阻，业务完全中断',
  // 协商补充 vlan 后的工单卡信息（t=238 Accept 重发任务时更新，与 case-data.js
  // 「补充cvlan=101，工单信息更新为P781-珠江新城-PTN7900专线中断」同源）
  orderDescUpdated: 'P781-珠江新城-PTN7900专线中断',
  steps: ['投诉受理', '投诉识别', '投诉定界', '根因定位', '方案生成', '修复验证', '投诉报结'],
  durations: [18, 65, 61, 53, 72, 39, 24], // 合计 332s（V3.32：修复验证步骤 269..308 完、报结 308..332；粤西方案生成缩短使链条整体前移）
  d: D1,
  stepRooms: STEP_ROOMS,
  logs: buildLogs(CASE_EVENTS.c1),
  // A2A-T 消息文案（V2.13：回放时展示在连线下方，宽度不超过连线长度、超出以 …… 截断，见 ConnectionFlow）：
  // 按「连线:标签」对应（无标签键 = 该连线默认消息；文案与日志 summary 同源；
  // 注册中心检索线不加消息——检索结果已随胶囊标注）
  // V2.25：专线↔粤东 协商请求（zx-yd-neg 默认）与回复（zx-yd-task:Task-T请求）文案
  // 改由 Negotiation-T 详细面板承载（Propose/Accept 气泡），连线下方不再展示
  // V2.22：c1 协商内容改与 c2 同型（vlan 协商，接入端口 P781-珠江新城-PTN7900、cvlan=101）
  flowMsgs: {
    'lc-waimo-fetch': '工单 GD-SPN-2025082001：主备专线同时中断，粤东至粤西段链路全阻，业务完全中断',
    'waimo-zx-task': '主备专线同时中断，粤东至粤西段链路全阻，业务完全中断',
    'zx-yd-task': '诊断粤东SPN侧链路故障根因',
    'zx-yx-task': '诊断粤西SPN侧链路故障根因',
    'zx-yd-neg:Task-T响应': '诊断成功，粤东光模块老化损坏，端口Down，光功率-28dBm',
    'zx-yx-neg:Task-T响应': '诊断成功，粤西侧正常，端口Up，光功率-7dBm',
    'zx-yd-neg:Notification-T': '抢通结果：已更换光模块，专线业务恢复',
    'waimo-zx-notif': '工单报结通知：根因与抢通结果已同步，工单闭环',
    'lc-waimo-report': '投诉报结：工单办结，端到端用时32分钟，回传流程中心',
  },
  events: [
    { t: 0, type: 'flow', line: 'lc-waimo-fetch', on: true },
    { t: 0, type: 'node', k: 'WAIMO', st: 'running' },
    { t: 0, type: 'step', i: 0, st: 'active' },
    { t: 18, type: 'flow', line: 'lc-waimo-fetch', on: false },
    { t: 18, type: 'step', i: 0, st: 'done' }, { t: 18, type: 'step', i: 1, st: 'active' },
    { t: 18, type: 'mini', k: 'WAIMO', i: 0, st: 'active', desc: D1.ts },
    // 识别步骤窗口 18..83（含原分类环节，内部子步骤不打印日志）
    { t: 83, type: 'mini', k: 'WAIMO', i: 0, st: 'done' },
    { t: 83, type: 'step', i: 1, st: 'done' }, { t: 83, type: 'step', i: 2, st: 'active' },
    { t: 83, type: 'mini', k: 'WAIMO', i: 1, st: 'active', desc: D1.dj },
    { t: 144, type: 'mini', k: 'WAIMO', i: 1, st: 'done' },
    { t: 144, type: 'step', i: 2, st: 'done' }, { t: 144, type: 'step', i: 3, st: 'active' },
    // 定界完成 → 检索注册中心命中专线投诉处置智能体并下发任务（144..158；
    // V3.9：调度处置迷你移至根因总结后——此处仅连线/日志/描述，WAIMO 迷你行保持未勾）
    { t: 144, type: 'flow', line: 'reg-waimo-search', on: true, result: '命中：专线投诉处置智能体' },
    { t: 145, type: 'desc', k: 'WAIMO', desc: '检索注册中心，命中专线投诉处置智能体' },
    { t: 146, type: 'log', i: 0 },
    { t: 150, type: 'flow', line: 'reg-waimo-search', on: false },
    { t: 150, type: 'desc', k: 'WAIMO' },
    { t: 150, type: 'appear', k: 'ZX' },
    { t: 152, type: 'flow', line: 'waimo-zx-task', on: true },
    { t: 152, type: 'log', i: 1 },
    { t: 158, type: 'flow', line: 'waimo-zx-task', on: false },
    // V3.24：Task-T 交互详情面板展示至 178（panel-timing taskTWindowOf）——专线内部子步骤
    // 待面板消失后才开始执行：数据关联 178..188、动态编排 188..197、任务诊断 197..353
    { t: 178, type: 'node', k: 'ZX', st: 'running' },
    { t: 178, type: 'mini', k: 'ZX', i: 0, st: 'active', desc: D1.sj },
    { t: 188, type: 'mini', k: 'ZX', i: 0, st: 'done' }, { t: 188, type: 'mini', k: 'ZX', i: 1, st: 'active', desc: D1.bd },
    { t: 197, type: 'mini', k: 'ZX', i: 1, st: 'done' }, { t: 197, type: 'mini', k: 'ZX', i: 2, st: 'active', desc: D1.rw },
    // 任务诊断持续至双侧诊断结论返回（根因总结移至双侧方案生成结果齐备后）
    { t: 197, type: 'step', i: 3, st: 'done' }, { t: 197, type: 'step', i: 4, st: 'active' },
    { t: 197, type: 'flow', line: 'reg-zx-search', on: true, result: '命中：粤东、粤西SPN网络内生智能' },
    { t: 198, type: 'desc', k: 'ZX', desc: '检索注册中心，命中粤东、粤西SPN网络内生智能' },
    { t: 199, type: 'log', i: 2 },
    { t: 202, type: 'flow', line: 'reg-zx-search', on: false },
    { t: 202, type: 'desc', k: 'ZX' },
    { t: 202, type: 'appear', k: 'YD' }, { t: 202, type: 'appear', k: 'YX' },
    { t: 204, type: 'flow', line: 'zx-yd-task', on: true }, { t: 204, type: 'flow', line: 'zx-yx-task', on: true },
    { t: 204, type: 'log', i: 3 },
    { t: 204, type: 'log', i: 4 },
    { t: 210, type: 'flow', line: 'zx-yd-task', on: false }, { t: 210, type: 'flow', line: 'zx-yx-task', on: false },
    { t: 210, type: 'node', k: 'YD', st: 'running' }, { t: 210, type: 'node', k: 'YX', st: 'running' },
    { t: 210, type: 'mini', k: 'YD', i: 0, st: 'active', desc: D1.wd },
    { t: 210, type: 'mini', k: 'YX', i: 0, st: 'active', desc: D1.wdx },
    { t: 213, type: 'flow', line: 'zx-yd-neg', on: true },
    { t: 213, type: 'log', i: 5 },
    // Negotiation-T 协商窗口开启（request）：详细面板呈现，仅第一条消息（Propose）
    { t: 213, type: 'negotiation', st: 'request' },
    { t: 219, type: 'flow', line: 'zx-yd-neg', on: false },
    // 粤西无参数协商：问题定位完成即进入方案生成（粤东须待专线补齐缺失数据重发任务后，V2.20）
    { t: 224, type: 'mini', k: 'YX', i: 0, st: 'done' },
    { t: 224, type: 'mini', k: 'YX', i: 1, st: 'active', desc: D1.fax },
    // Accept 补充信息后专线以完整参数重新下发任务（Task-T请求，正向 专线→粤东）。
    // 协商节奏（业务秒，随倍速缩放）：请求(213)→回复 25s（1x≈6s）；回复后第二条消息停留 20s（1x=5s）
    { t: 238, type: 'flow', line: 'zx-yd-task', on: true, label: 'Task-T请求' },
    { t: 238, type: 'log', i: 6 },
    // Accept：通过资管查询Skill补充cvlan=101，工单信息更新（工单卡描述同步切换）
    { t: 238, type: 'orderInfo', on: true },
    // 专线返回补充信息（accept）：面板追加第二条消息（滚动下滑 + 光束定射选中 cvlan）
    { t: 238, type: 'negotiation', st: 'accept' },
    // V2.20：粤东问题定位完成、方案生成启动改在重发任务送达后（原 t=224 早于专线回复缺失数据）
    { t: 244, type: 'flow', line: 'zx-yd-task', on: false },
    { t: 244, type: 'mini', k: 'YD', i: 0, st: 'done' },
    { t: 244, type: 'mini', k: 'YD', i: 1, st: 'active', desc: D1.fa },
    // 粤东方案生成完成（Task-T响应：沿协商回程线正向 粤东→专线，不与 Task-T 请求共用 task 线）
    { t: 258, type: 'flow', line: 'zx-yd-neg', on: true, label: 'Task-T响应' },
    { t: 258, type: 'log', i: 7 },
    { t: 258, type: 'mini', k: 'YD', i: 1, st: 'done' },
    // 协商窗口结束（面板淡出卸载）：accept(238) 后 20 业务秒，恰与 Task-T响应 交接
    { t: 258, type: 'negotiation', st: null },
    { t: 264, type: 'flow', line: 'zx-yd-neg', on: false },
    // V3.32：粤西方案生成缩短（224..264，40 业务秒；原 224..348 存在长时间空转）——
    // 粤西方案生成完成（Task-T响应：沿协商回程线正向 粤西→专线，紧接粤东响应之后）
    { t: 264, type: 'flow', line: 'zx-yx-neg', on: true, label: 'Task-T响应' },
    { t: 264, type: 'log', i: 8 },
    { t: 264, type: 'mini', k: 'YX', i: 1, st: 'done' },
    { t: 268, type: 'flow', line: 'zx-yx-neg', on: false },
    { t: 269, type: 'step', i: 4, st: 'done' }, { t: 269, type: 'step', i: 5, st: 'active' },
    // 双侧方案生成结果齐备 → 专线进行根因总结（内部·根因总结）
    { t: 269, type: 'mini', k: 'ZX', i: 2, st: 'done' }, { t: 269, type: 'mini', k: 'ZX', i: 3, st: 'active', desc: D1.zg },
    { t: 279, type: 'mini', k: 'ZX', i: 3, st: 'done' },
    // V3.9：根因总结完成 → WAIMO 调度处置（调度抢通任务）→ 双侧抢通执行 →
    // V3.32：修复验证改至调度处置面板消失后执行（面板窗口 280..304，见 dispatchWindowOf）→
    // 结果回复 → 投诉闭环（子步骤链条定稿顺序）
    { t: 280, type: 'mini', k: 'WAIMO', i: 2, st: 'active', desc: D1.dd },
    { t: 284, type: 'mini', k: 'WAIMO', i: 2, st: 'done' },
    // 抢通执行（粤西无需抢通直接完成、不回消息；粤东更换光模块）
    { t: 285, type: 'mini', k: 'YD', i: 2, st: 'active', desc: D1.qt },
    { t: 285, type: 'mini', k: 'YX', i: 2, st: 'active', desc: D1.qtx },
    { t: 290, type: 'mini', k: 'YX', i: 2, st: 'done' }, { t: 290, type: 'node', k: 'YX', st: 'success' },
    { t: 292, type: 'mini', k: 'YD', i: 2, st: 'done' }, { t: 292, type: 'node', k: 'YD', st: 'success' },
    // 粤东抢通完成 → Notification-T 抢通结果通知专线（沿协商回程线正向 粤东→专线）
    { t: 293, type: 'flow', line: 'zx-yd-neg', on: true, label: 'Notification-T' },
    { t: 293, type: 'log', i: 9 },
    { t: 297, type: 'flow', line: 'zx-yd-neg', on: false },
    // V3.32：修复验证在调度处置面板消失后执行（304 面板退场即修复验证开始，同 Task-T 模式）
    { t: 304, type: 'mini', k: 'ZX', i: 4, st: 'active', desc: D1.xf },
    { t: 308, type: 'mini', k: 'ZX', i: 4, st: 'done' },
    { t: 308, type: 'step', i: 5, st: 'done' }, { t: 308, type: 'step', i: 6, st: 'active' },
    // ⑦投诉报结：专线结果回复（Notification-T 通知 WAIMO）→ WAIMO 投诉闭环 → 工单报结回传流程中心
    { t: 309, type: 'mini', k: 'ZX', i: 5, st: 'active', desc: D1.hf },
    { t: 310, type: 'flow', line: 'waimo-zx-notif', on: true },
    { t: 310, type: 'log', i: 10 },
    { t: 314, type: 'flow', line: 'waimo-zx-notif', on: false },
    // V3.27：投诉闭环（WAIMO mini3）顺延至 Notification-T 面板分步完成后（面板窗口 310..321）
    { t: 321, type: 'mini', k: 'WAIMO', i: 3, st: 'active', desc: D1.bjW },
    { t: 323, type: 'flow', line: 'lc-waimo-report', on: true },
    { t: 328, type: 'flow', line: 'lc-waimo-report', on: false },
    { t: 328, type: 'mini', k: 'ZX', i: 5, st: 'done' }, { t: 328, type: 'mini', k: 'WAIMO', i: 3, st: 'done' },
    { t: 330, type: 'node', k: 'WAIMO', st: 'success' }, { t: 330, type: 'node', k: 'ZX', st: 'success' },
    { t: 332, type: 'step', i: 6, st: 'done' },
    { t: 332, type: 'done' },
  ],
};

const c2 = {
  id: 'c2',
  orderNo: 'GD-SPN-2025082005',
  customer: '某市人民医院',
  desc: '专线SLA劣化，业务明显卡顿、丢包严重，影响远程会诊',
  steps: ['投诉受理', '投诉识别', '投诉定界', '根因定位', '方案生成', '修复验证', '投诉报结'],
  durations: [10, 33, 25, 20, 37, 55, 23], // 合计 203s（V3.32：修复验证步骤延至 180 完、报结 180..203）
  d: D2,
  stepRooms: STEP_ROOMS,
  logs: buildLogs(CASE_EVENTS.c2),
  // A2A-T 消息文案（同 c1；注册中心检索线不加消息；协商请求/回复由详细面板承载——见 c1 flowMsgs 注）
  flowMsgs: {
    'lc-waimo-fetch': '工单 GD-SPN-2025082005：专线SLA劣化，业务卡顿丢包严重，影响远程会诊',
    'waimo-zx-task': '专线SLA劣化，业务卡顿丢包严重，影响远程会诊',
    'zx-yd-task': '诊断珠江旧城专线SLA劣化根因',
    'zx-yd-neg:Notification-T': '抢通结果：QoS限速修正完成，SLA指标恢复',
    'waimo-zx-notif': '工单报结通知：根因与抢通结果已同步，工单闭环',
    'lc-waimo-report': '投诉报结：工单办结，端到端用时32分钟，回传流程中心',
  },
  events: [
    { t: 0, type: 'flow', line: 'lc-waimo-fetch', on: true },
    { t: 0, type: 'node', k: 'WAIMO', st: 'running' },
    { t: 0, type: 'step', i: 0, st: 'active' },
    { t: 10, type: 'flow', line: 'lc-waimo-fetch', on: false },
    { t: 10, type: 'step', i: 0, st: 'done' }, { t: 10, type: 'step', i: 1, st: 'active' },
    { t: 10, type: 'mini', k: 'WAIMO', i: 0, st: 'active', desc: D2.ts },
    // 识别步骤窗口 10..43（含原分类环节，内部子步骤不打印日志）
    { t: 43, type: 'mini', k: 'WAIMO', i: 0, st: 'done' },
    { t: 43, type: 'step', i: 1, st: 'done' }, { t: 43, type: 'step', i: 2, st: 'active' },
    { t: 43, type: 'mini', k: 'WAIMO', i: 1, st: 'active', desc: D2.dj },
    { t: 68, type: 'mini', k: 'WAIMO', i: 1, st: 'done' },
    { t: 68, type: 'step', i: 2, st: 'done' }, { t: 68, type: 'step', i: 3, st: 'active' },
    // 定界完成 → 检索注册中心命中专线投诉处置智能体并下发任务（68..76；
    // V3.9：调度处置迷你移至根因总结后——此处仅连线/日志/描述）
    { t: 68, type: 'flow', line: 'reg-waimo-search', on: true, result: '命中：专线投诉处置智能体' },
    { t: 69, type: 'desc', k: 'WAIMO', desc: '检索注册中心，命中专线投诉处置智能体' },
    { t: 69, type: 'log', i: 0 },
    { t: 71, type: 'flow', line: 'reg-waimo-search', on: false },
    { t: 71, type: 'desc', k: 'WAIMO' },
    { t: 71, type: 'appear', k: 'ZX' },
    { t: 72, type: 'flow', line: 'waimo-zx-task', on: true },
    { t: 72, type: 'log', i: 1 },
    { t: 76, type: 'flow', line: 'waimo-zx-task', on: false },
    // V3.24：Task-T 面板展示至 88——专线内部子步骤待面板消失后开始执行：
    // 数据关联 88..91、动态编排 91..94、任务诊断 94..149
    { t: 88, type: 'node', k: 'ZX', st: 'running' },
    { t: 88, type: 'mini', k: 'ZX', i: 0, st: 'active', desc: D2.sj },
    { t: 88, type: 'step', i: 3, st: 'done' }, { t: 88, type: 'step', i: 4, st: 'active' },
    { t: 88, type: 'flow', line: 'reg-zx-search', on: true, result: '命中：粤东SPN网络内生智能' },
    { t: 89, type: 'desc', k: 'ZX', desc: '检索注册中心，命中粤东SPN网络内生智能' },
    { t: 89, type: 'log', i: 2 },
    { t: 91, type: 'mini', k: 'ZX', i: 0, st: 'done' }, { t: 91, type: 'mini', k: 'ZX', i: 1, st: 'active', desc: D2.bd },
    { t: 91, type: 'flow', line: 'reg-zx-search', on: false },
    { t: 91, type: 'desc', k: 'ZX' },
    { t: 91, type: 'appear', k: 'YD' }, // SLA 劣化：仅粤东登场，粤西不登场
    { t: 92, type: 'flow', line: 'zx-yd-task', on: true },
    { t: 92, type: 'log', i: 3 },
    { t: 94, type: 'mini', k: 'ZX', i: 1, st: 'done' }, { t: 94, type: 'mini', k: 'ZX', i: 2, st: 'active', desc: D2.rw },
    { t: 95, type: 'flow', line: 'zx-yd-task', on: false },
    { t: 95, type: 'node', k: 'YD', st: 'running' },
    { t: 95, type: 'mini', k: 'YD', i: 0, st: 'active', desc: D2.wd },
    // 任务已创建（Task-T响应：沿协商回程线正向 粤东→专线，不与 Task-T 请求共用 task 线）
    { t: 96, type: 'flow', line: 'zx-yd-neg', on: true, label: 'Task-T响应', msg: '诊断任务已创建，开始处理' },
    { t: 96, type: 'log', i: 4 },
    { t: 99, type: 'flow', line: 'zx-yd-neg', on: false },
    { t: 99, type: 'flow', line: 'zx-yd-neg', on: true },
    { t: 99, type: 'log', i: 5 },
    // Negotiation-T 协商窗口开启（request）：详细面板呈现，仅第一条消息（Propose）
    { t: 99, type: 'negotiation', st: 'request' },
    { t: 102, type: 'flow', line: 'zx-yd-neg', on: false },
    // Accept 补充 vlan 后专线以完整参数重新下发任务（Task-T请求，正向 专线→粤东）。
    // 协商节奏（业务秒，随倍速缩放）：请求(99)→回复 25s（1x≈6s）；回复后第二条消息停留 20s（1x=5s）
    { t: 124, type: 'flow', line: 'zx-yd-task', on: true, label: 'Task-T请求' },
    { t: 124, type: 'log', i: 6 },
    // 专线返回补充信息（accept）：面板追加第二条消息（滚动下滑 + 光束定射选中 cvlan）
    { t: 124, type: 'negotiation', st: 'accept' },
    { t: 125, type: 'step', i: 4, st: 'done' }, { t: 125, type: 'step', i: 5, st: 'active' },
    // V2.20：粤东问题定位完成、方案生成启动改在重发任务送达后（原 t=102 早于专线补齐 vlan 的回复）
    { t: 130, type: 'flow', line: 'zx-yd-task', on: false },
    { t: 130, type: 'mini', k: 'YD', i: 0, st: 'done' },
    { t: 130, type: 'mini', k: 'YD', i: 1, st: 'active', desc: D2.fa },
    // 粤东方案生成完成（Task-T响应：沿协商回程线正向 粤东→专线）
    { t: 144, type: 'flow', line: 'zx-yd-neg', on: true, label: 'Task-T响应', msg: '诊断成功，QoS限速策略误配置导致丢包，建议修正' },
    { t: 144, type: 'log', i: 7 },
    { t: 144, type: 'mini', k: 'YD', i: 1, st: 'done' },
    // 协商窗口结束（面板淡出卸载）：accept(124) 后 20 业务秒，恰与 Task-T响应 交接
    { t: 144, type: 'negotiation', st: null },
    { t: 148, type: 'flow', line: 'zx-yd-neg', on: false },
    // 诊断结论返回 → 专线进行根因总结（内部·根因总结）
    { t: 149, type: 'mini', k: 'ZX', i: 2, st: 'done' }, { t: 149, type: 'mini', k: 'ZX', i: 3, st: 'active', desc: D2.zg },
    { t: 155, type: 'mini', k: 'ZX', i: 3, st: 'done' },
    // V3.9：根因总结完成 → WAIMO 调度处置（调度抢通任务，自 68..76 移此）→
    // 抢通执行 → 修复验证 → 结果回复 → 投诉闭环（子步骤链条定稿顺序）
    { t: 156, type: 'mini', k: 'WAIMO', i: 2, st: 'active', desc: D2.dd },
    { t: 159, type: 'mini', k: 'WAIMO', i: 2, st: 'done' },
    // 抢通执行（修正QoS限速策略）
    { t: 160, type: 'mini', k: 'YD', i: 2, st: 'active', desc: D2.qt },
    { t: 164, type: 'mini', k: 'YD', i: 2, st: 'done' }, { t: 164, type: 'node', k: 'YD', st: 'success' },
    // 粤东抢通完成 → Notification-T 抢通结果通知专线（沿协商回程线正向 粤东→专线）
    { t: 165, type: 'flow', line: 'zx-yd-neg', on: true, label: 'Notification-T' },
    { t: 165, type: 'log', i: 8 },
    { t: 169, type: 'flow', line: 'zx-yd-neg', on: false },
    // V3.32：修复验证在调度处置面板消失后执行（面板窗口 156..176，见 dispatchWindowOf；
    // 304/176 面板退场即修复验证开始，同 Task-T 模式）
    { t: 176, type: 'mini', k: 'ZX', i: 4, st: 'active', desc: D2.xf },
    { t: 180, type: 'mini', k: 'ZX', i: 4, st: 'done' },
    { t: 180, type: 'step', i: 5, st: 'done' }, { t: 180, type: 'step', i: 6, st: 'active' },
    // ⑦投诉报结：专线结果回复（Notification-T 通知 WAIMO）→ WAIMO 投诉闭环 → 工单报结回传流程中心
    { t: 181, type: 'mini', k: 'ZX', i: 5, st: 'active', desc: D2.hf },
    { t: 182, type: 'flow', line: 'waimo-zx-notif', on: true },
    { t: 182, type: 'log', i: 9 },
    { t: 186, type: 'flow', line: 'waimo-zx-notif', on: false },
    // V3.27：投诉闭环顺延至 Notification-T 面板分步完成后（面板窗口 182..193）
    { t: 193, type: 'mini', k: 'WAIMO', i: 3, st: 'active', desc: D2.bjW },
    { t: 195, type: 'flow', line: 'lc-waimo-report', on: true },
    { t: 200, type: 'flow', line: 'lc-waimo-report', on: false },
    { t: 200, type: 'mini', k: 'ZX', i: 5, st: 'done' }, { t: 200, type: 'mini', k: 'WAIMO', i: 3, st: 'done' },
    { t: 202, type: 'node', k: 'WAIMO', st: 'success' }, { t: 202, type: 'node', k: 'ZX', st: 'success' },
    { t: 203, type: 'step', i: 6, st: 'done' },
    { t: 203, type: 'done' },
  ],
};

for (const c of [c1, c2]) {
  c.total = c.durations.reduce((a, b) => a + b, 0);
  c.boundaries = [];
  let acc = 0;
  for (const d of c.durations) { acc += d; c.boundaries.push(acc); }
  // V3.8：日志时钟与流程步骤时间对齐——日志事件按其回放调度时刻 t 经步骤边界分段线性
  // 映射到业务秒（步骤条标称 1/2/8/10/3/3/5 分钟、累计 32 分钟），clock = base + 业务秒；
  // 参考数据 CASE_EVENTS 的 t（案例业务秒）仅作事件排序源，不再直接进时钟
  //（原实现 base+t 全部日志挤在 22 秒内，与步骤分钟级时长矛盾）
  {
    const [bh, bm, bs2] = CASE_EVENTS[c.id].base.split(':').map(Number);
    const clockBase = bh * 3600 + bm * 60 + bs2;
    const BMIN = [1, 2, 8, 10, 3, 3, 5];
    let bAcc = 0;
    const biz = [0, ...BMIN.map((m) => (bAcc += m * 60))];
    const rb = [0, ...c.boundaries];
    const bizAt = (t) => {
      for (let i = 0; i < rb.length - 1; i++) {
        if (t <= rb[i + 1] || i === rb.length - 2) {
          return biz[i] + (biz[i + 1] - biz[i]) * (t - rb[i]) / Math.max(1, rb[i + 1] - rb[i]);
        }
      }
      return biz[biz.length - 1];
    };
    const p2 = (v) => String(Math.floor(v)).padStart(2, '0');
    for (const ev of c.events) {
      if (ev.type !== 'log') continue;
      const tot = clockBase + bizAt(ev.t);
      const ms = String(Math.round((tot - Math.floor(tot)) * 1000)).padStart(3, '0');
      c.logs[ev.i].clock = p2(tot / 3600) + ':' + p2(tot / 60 % 60) + ':' + p2(tot % 60) + '.' + ms;
    }
  }
  // 单步节拍：全部事件时刻 + 面板阶段边界（V3.23：意图识别/Task-T/检索面板内部分步，
  // 否则窗口内无事件节拍时单步一步跨过整个窗口——如意图识别 18..83 只能看到第一步）
  // 去重升序；单步逐节拍推进——专线↔粤东/粤西每条消息（含连线胶囊标签）、检索、协商、响应，
  // 以及数据关联/动态编排等内部步骤、各详情面板分步逐一呈现
  c.beats = [...new Set(c.events.map((e) => e.t).concat(panelStageBeats(c)).concat(c.total))].sort((a, b) => a - b);
}

export const CASES = { c1, c2 };
export const AGENTS = ['WAIMO', 'ZX', 'YD', 'YX'];

export function initialWorld(c) {
  const mini = {};
  for (const k of AGENTS) mini[k] = [];
  // 迷你步骤数量按卡片定义（WAIMO 4 / 专线 6 / 粤东 3 / 粤西 3）
  const counts = { WAIMO: 4, ZX: 6, YD: 3, YX: 3 };
  for (const k of AGENTS) for (let i = 0; i < counts[k]; i++) mini[k].push('todo');
  return {
    steps: c.steps.map(() => 'todo'),
    nodes: { WAIMO: 'idle', ZX: 'idle', YD: 'idle', YX: 'idle' },
    visible: { WAIMO: true, ZX: false, YD: false, YX: false },
    mini,
    desc: { WAIMO: null, ZX: null, YD: null, YX: null },
    flows: {},
    seenLines: {},
    orderInfo: false,
    negotiation: null,
    logs: [],
    caseDone: false,
  };
}

export function foldWorld(c, t) {
  const w = initialWorld(c);
  for (const ev of c.events) {
    if (ev.t > t) break;
    switch (ev.type) {
      case 'step': w.steps[ev.i] = ev.st; break;
      case 'node': w.nodes[ev.k] = ev.st; break;
      case 'mini':
        w.mini[ev.k][ev.i] = ev.st;
        w.desc[ev.k] = ev.st === 'active' ? (ev.desc || null) : null;
        break;
      case 'appear': w.visible[ev.k] = true; break;
      case 'flow':
        // 激活连线：rev=响应方向（逆向激光）；label=胶囊文案覆盖（如 Task-T请求）；result=检索结果标注（检索标签后）；
        // msg=A2A-T 消息文案（连线下方展示，事件显式 msg > 案例按「连线:标签」映射 flowMsgs）
        w.flows[ev.line] = ev.on ? {
          rev: !!ev.rev,
          label: ev.label || null,
          result: ev.result || null,
          msg: ev.msg || (c.flowMsgs ? c.flowMsgs[ev.line + (ev.label ? ':' + ev.label : '')] : null) || null,
        } : null;
        if (ev.on) w.seenLines[ev.line] = true;
        break;
      // 工单信息更新（c1：Accept 补充 vlan 后工单卡信息切换，见 c1.orderDescUpdated）
      case 'orderInfo': w.orderInfo = ev.on !== false; break;
      // Negotiation-T 协商窗口（request=仅第一条消息 / accept=追加第二条消息，null=结束）
      case 'negotiation': w.negotiation = ev.st || null; break;
      case 'desc':
        // 无迷你步骤切换的执行中描述（如注册中心检索），desc 置空即结束
        w.desc[ev.k] = ev.desc || null;
        break;
      case 'log': w.logs.push(c.logs[ev.i]); break;
      case 'done': w.caseDone = true; break;
      default: break;
    }
  }
  return w;
}

export function worldSig(w) {
  return [
    w.steps.join(''),
    Object.values(w.nodes).join(''),
    Object.keys(w.visible).map((k) => w.visible[k] ? 1 : 0).join(''),
    Object.keys(w.mini).map((k) => w.mini[k].join('')).join(';'),
    Object.keys(w.desc).map((k) => w.desc[k] || '').join(';'),
    Object.keys(w.flows).filter((k) => w.flows[k]).join(','),
    Object.keys(w.seenLines).length,
    w.logs.length,
    w.orderInfo ? 1 : 0,
    w.negotiation || '',
    w.caseDone ? 1 : 0,
  ].join('|');
}
