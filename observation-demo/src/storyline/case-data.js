// case-data.js — A2A-T 协作日志参考数据（前段与仓库根 case1.js / case2.js 保持同步）
// t 为案例业务秒；clock 由 base + t 换算为 +08:00 展示时间（HH:mm:ss.SSS）
// dir: request=请求 / response=响应
// V2.26：协作日志不再呈现节点内部子步骤（from===to 的内部行全部移除，
// 含 WAIMO 受理/识别/分类/定界/报结 与 专线 数据关联/动态编排/根因分析/工单报结）——
// 仅保留 A2A-T（Task-T/Negotiation-T/Notification-T 跨节点）与检索注册中心日志；
// 内部子步骤改由智能体卡片迷你步骤呈现（WAIMO：投诉识别/定界定位/调度处置/投诉闭环，
// 专线：数据关联/动态编排/任务诊断/根因总结/修复验证/结果回复）
// V2.27：Authorization-T（授权类消息）不进入协作日志区域
// V2.7 尾段更新：双侧方案生成返回 → 专线根因分析 → 抢通执行 →
// 粤东 Notification-T 抢通结果 → 专线工单报结（Notification-T→WAIMO）→ WAIMO 投诉报结（回传流程中心）
// V2.10：协商 Accept 响应改为 Task-T 请求（协商补充后以完整参数重发诊断任务，与连线「Task-T请求」胶囊一致）
export const CASE_EVENTS = {
  c1: {
    base: '22:23:00',
    events: [
      { t: 7, type: '检索', from: '注册中心', to: 'WAIMO投诉处理智能体', summary: '检索命中：专线投诉处置智能体',
        message: '## 检索请求\nagent.skill = 专线投诉诊断\n\n## 检索结果\n1. 专线投诉处置智能体（传输工作台）\n   - 技能：任务规划 / 并行调度 / 综合研判' },
      { t: 8, type: 'Task-T', dir: 'request', from: 'WAIMO投诉处理智能体', to: '专线投诉处置智能体', summary: '主备专线同时中断，粤东至粤西段链路全阻，业务完全中断',
        message: '## 任务类型(Task Type)\nSPN专线投诉诊断\n\n## 任务描述(Task Description)\n主备专线同时中断，粤东至粤西段链路全阻，业务完全中断，请协调传输侧相关Agent进行故障诊断\n\n## 任务目标(Task Target)\n基于专线业务的故障现象，诊断并返回网络侧的故障根因\n\n## 任务对象(Task Object)\n专线名称：ZC-GD-001\n\n## 任务上下文(Task Context)\n1. 故障现象：专线中断\n2. 故障发生时间：2026-08-20T14:18:23Z\n3. OSS侧的事件流水号：TS-20250802001\n\n## 预期输出(Expected Output)\n1. 诊断结果类型（诊断成功、诊断失败、诊断未开始、诊断未结束）\n2. 诊断结果详细信息\n3. 修复建议' },
      { t: 11, type: '检索', from: '注册中心', to: '专线投诉处置智能体', summary: '检索命中：粤东SPN网络内生智能、粤西SPN网络内生智能',
        message: '## 检索请求\nagent.skill = 专线故障定位·抢通\n\n## 检索结果\n1. 粤东SPN网络内生智能（专线故障定位·抢通）\n2. 粤西SPN网络内生智能（专线故障定位·抢通）' },
      { t: 12, type: 'Task-T', dir: 'request', from: '专线投诉处置智能体', to: '粤东SPN网络内生智能', summary: '诊断粤东SPN侧链路故障根因',
        message: '## 任务类型(Task Type)\nSPN专线投诉诊断\n\n## 任务描述(Task Description)\n基于专线故障现象，诊断粤东SPN侧链路故障根因\n\n## 任务目标(Task Target)\n基于专线业务的故障现象，诊断并返回粤东SPN侧的故障根因\n\n## 任务对象(Task Object)\n专线名称：ZC-GD-001\n接入端口名称：P781-珠江新城-PTN7900\n\n## 任务上下文(Task Context)\n1. 故障现象：专线中断\n2. 故障发生时间：2026-08-20T14:18:23Z\n3. OSS侧的事件流水号：TS-20250802001\n\n## 预期输出(Expected Output)\n1. 诊断结果类型（诊断成功、诊断失败、诊断未开始、诊断未结束）\n2. 诊断结果详细信息\n3. 修复建议' },
      { t: 12, type: 'Task-T', dir: 'request', from: '专线投诉处置智能体', to: '粤西SPN网络内生智能', summary: '诊断粤西SPN侧链路故障根因',
        message: '## 任务类型(Task Type)\nSPN专线投诉诊断\n\n## 任务描述(Task Description)\n基于专线故障现象，诊断粤西SPN侧链路故障根因\n\n## 任务目标(Task Target)\n基于专线业务的故障现象，诊断并返回粤西SPN侧的故障根因\n\n## 任务对象(Task Object)\n专线名称：ZC-GD-001\n\n## 任务上下文(Task Context)\n1. 故障现象：专线中断\n2. 故障发生时间：2026-08-20T14:18:23Z\n3. OSS侧的事件流水号：TS-20250802001\n\n## 预期输出(Expected Output)\n1. 诊断结果类型（诊断成功、诊断失败、诊断未开始、诊断未结束）\n2. 诊断结果详细信息\n3. 修复建议' },
      { t: 14, type: 'Negotiation-T', dir: 'request', from: '粤东SPN网络内生智能', to: '专线投诉处置智能体', summary: '接入端口下挂多个VLAN子接口，请明确本业务的具体vlan信息',
        message: '## 协商上下文\n- id: d5a9c2e6-4b7d-4f1a-9c3e-8e2b6d4f0a71\n- round: 1\n- maxRounds: 5\n\n## 信息协商\n接入端口下挂多个VLAN子接口，请明确本业务的具体vlan信息。\n\n## 所需信息项\n1. vlan ID，含义：接入端口下挂多个VLAN子接口，需明确本业务的具体vlan以唯一定位专业业务，格式要求：cvlan=<vlan号>，样例：cvlan=100' },
      { t: 15, type: 'Task-T', dir: 'request', from: '专线投诉处置智能体', to: '粤东SPN网络内生智能', summary: '协商补充vlan后，以完整参数重发诊断任务',
        message: '## 任务类型(Task Type)\nSPN专线投诉诊断\n\n## 任务描述(Task Description)\n信息协商补充完成后（Accept：通过资管查询Skill获取到vlan信息，补充cvlan=101，工单信息更新为P781-珠江新城-PTN7900专线中断），以完整参数重新下发诊断任务，基于专线故障现象诊断粤东SPN侧链路故障根因\n\n## 任务目标(Task Target)\n基于专线业务的故障现象，诊断并返回粤东SPN侧的故障根因\n\n## 任务对象(Task Object)\n专线名称：ZC-GD-001\n接入端口名称：P781-珠江新城-PTN7900(cvlan=101)\n\n## 任务上下文(Task Context)\n1. 故障现象：专线中断\n2. 故障发生时间：2026-08-20T14:18:23Z\n3. OSS侧的事件流水号：TS-20250802001\n4. vlan ID：cvlan=101（协商补充）\n\n## 预期输出(Expected Output)\n1. 诊断结果类型（诊断成功、诊断失败、诊断未开始、诊断未结束）\n2. 诊断结果详细信息\n3. 修复建议' },
      { t: 17, type: 'Task-T', dir: 'response', from: '粤东SPN网络内生智能', to: '专线投诉处置智能体', summary: '诊断成功，粤东光模块老化损坏，端口Down，光功率-28dBm',
        message: '1. 诊断结果类型：诊断成功\n2. 诊断结果详细信息：粤东SPN侧端口状态Down，光功率-28dBm（正常阈值≥-12dBm，低于阈值16dB），LOS告警，故障根因为珠江新城机房光模块老化损坏导致光功率严重衰减\n3. 修复建议：立即更换P781-珠江新城-PTN7900端口光模块，风险等级medium' },
      { t: 18, type: 'Task-T', dir: 'response', from: '粤西SPN网络内生智能', to: '专线投诉处置智能体', summary: '诊断成功，粤西侧正常，端口Up，光功率-7dBm',
        message: '1. 诊断结果类型：诊断成功\n2. 诊断结果详细信息：粤西SPN侧端口状态Up，光功率-7dBm（正常范围，≥-12dBm阈值），无异常告警，本侧设备与链路均正常，故障位于对端\n3. 修复建议：粤西侧无需修复，建议重点排查粤东SPN侧设备及链路' },
      { t: 20, type: 'Notification-T', from: '粤东SPN网络内生智能', to: '专线投诉处置智能体', summary: '抢通结果：已更换光模块，专线业务恢复',
        message: '1. 通知类型：抢通结果通知\n2. 抢通结果详细信息：已更换P781-珠江新城-PTN7900端口光模块，端口Up，光功率恢复正常，专线业务恢复\n3. 通知对象：专线投诉处置智能体' },
      { t: 22, type: 'Notification-T', from: '专线投诉处置智能体', to: 'WAIMO投诉处理智能体', summary: '工单报结通知：根因与抢通结果已同步，工单闭环',
        message: '1. 通知类型：工单报结通知\n2. 通知内容：故障根因为珠江新城机房光模块老化损坏，已更换光模块完成抢通，专线业务恢复，投诉工单申请闭环\n3. 通知对象：WAIMO投诉处理智能体' },
    ],
  },
  c2: {
    base: '23:05:00',
    events: [
      { t: 7, type: '检索', from: '注册中心', to: 'WAIMO投诉处理智能体', summary: '检索命中：专线投诉处置智能体',
        message: '## 检索请求\nagent.skill = 专线投诉诊断\n\n## 检索结果\n1. 专线投诉处置智能体（传输工作台）\n   - 技能：任务规划 / 并行调度 / 综合研判' },
      { t: 8, type: 'Task-T', dir: 'request', from: 'WAIMO投诉处理智能体', to: '专线投诉处置智能体', summary: '专线SLA劣化，业务卡顿丢包严重，影响远程会诊',
        message: '## 任务类型(Task Type)\nSPN专线投诉诊断\n\n## 任务描述(Task Description)\n专线SLA劣化，业务明显卡顿、丢包严重，影响远程会诊，请协调传输侧进行故障诊断\n\n## 任务目标(Task Target)\n基于专线业务的故障现象，诊断并返回网络侧的故障根因\n\n## 任务对象(Task Object)\n接入端口名称：P533-珠江旧城-PTN3900-23-TPA1EG24-1\n\n## 任务上下文(Task Context)\n1. 故障现象：专线质量差\n2. 故障发生时间：2026-08-20T15:02:35Z\n3. OSS侧的事件流水号：TS-2025082005\n\n## 预期输出(Expected Output)\n1. 诊断结果类型（诊断成功、诊断失败、诊断未开始、诊断未结束）\n2. 诊断结果详细信息\n3. 修复建议' },
      { t: 11, type: '检索', from: '注册中心', to: '专线投诉处置智能体', summary: '检索命中：粤东SPN网络内生智能',
        message: '## 检索请求\nagent.skill = 专线故障定位·抢通（粤东·珠江旧城）\n\n## 检索结果\n1. 粤东SPN网络内生智能（专线故障定位·抢通）' },
      { t: 12, type: 'Task-T', dir: 'request', from: '专线投诉处置智能体', to: '粤东SPN网络内生智能', summary: '诊断珠江旧城专线SLA劣化根因',
        message: '## 任务类型(Task Type)\nSPN专线投诉诊断\n\n## 任务描述(Task Description)\n基于专线SLA劣化现象，诊断粤东SPN侧链路故障根因\n\n## 任务目标(Task Target)\n基于专线业务的故障现象，诊断并返回粤东SPN侧的故障根因\n\n## 任务对象(Task Object)\n接入端口名称：P533-珠江旧城-PTN3900-23-TPA1EG24-1\n\n## 任务上下文(Task Context)\n1. 故障现象：专线质量差\n2. 故障发生时间：2026-08-20T15:02:35Z\n3. OSS侧的事件流水号：TS-2025082005\n\n## 预期输出(Expected Output)\n1. 诊断结果类型（诊断成功、诊断失败、诊断未开始、诊断未结束）\n2. 诊断结果详细信息\n3. 修复建议' },
      { t: 13, type: 'Task-T', dir: 'response', from: '粤东SPN网络内生智能', to: '专线投诉处置智能体', summary: '诊断任务已创建，开始处理',
        message: '1. 诊断结果类型：诊断未开始\n2. 诊断结果详细信息：粤东SPN侧诊断任务已创建，开始处理' },
      { t: 14, type: 'Negotiation-T', dir: 'request', from: '粤东SPN网络内生智能', to: '专线投诉处置智能体', summary: '接入端口名称缺少vlan信息，无法唯一定位专业业务',
        message: '## 协商上下文\n- id: b7c4e3f2-9a1d-4c8b-8e2f-6d9a5c3b1e42\n- round: 1\n- maxRounds: 5\n\n## 信息协商\n请根据<所需信息项>补充相关内容。\n\n## 所需信息项\n1. vlan ID，含义：用于唯一定位专业业务的Vlan标识，格式要求：cvlan=<vlan号>，样例：cvlan=100' },
      { t: 15, type: 'Task-T', dir: 'request', from: '专线投诉处置智能体', to: '粤东SPN网络内生智能', summary: '协商补充vlan后，以完整参数重发诊断任务',
        message: '## 任务类型(Task Type)\nSPN专线投诉诊断\n\n## 任务描述(Task Description)\n信息协商补充完成后，以完整参数重新下发诊断任务，诊断珠江旧城专线SLA劣化根因\n\n## 任务目标(Task Target)\n基于专线业务的故障现象，诊断并返回粤东SPN侧的故障根因\n\n## 任务对象(Task Object)\n接入端口名称：P533-珠江旧城-PTN3900-23-TPA1EG24-1(cvlan=100)\n\n## 任务上下文(Task Context)\n1. 故障现象：专线质量差\n2. 故障发生时间：2026-08-20T15:02:35Z\n3. OSS侧的事件流水号：TS-2025082005\n4. vlan ID：cvlan=100（协商补充）\n\n## 预期输出(Expected Output)\n1. 诊断结果类型（诊断成功、诊断失败、诊断未开始、诊断未结束）\n2. 诊断结果详细信息\n3. 修复建议' },
      { t: 16, type: 'Task-T', dir: 'response', from: '粤东SPN网络内生智能', to: '专线投诉处置智能体', summary: '诊断成功，QoS限速策略误配置导致丢包，建议修正',
        message: '1. 诊断结果类型：诊断成功\n2. 诊断结果详细信息：QoS限速策略误配置，端口P533-珠江旧城-PTN3900-23-TPA1EG24-1(cvlan=100)限速阈值设置为10Mbps，低于实际业务需求50Mbps；高峰时段丢包率约8%，业务严重卡顿\n3. 修复建议：修正QoS限速策略至≥100Mbps，风险等级low' },
      { t: 18, type: 'Notification-T', from: '粤东SPN网络内生智能', to: '专线投诉处置智能体', summary: '抢通结果：QoS限速修正完成，SLA指标恢复',
        message: '1. 通知类型：抢通结果通知\n2. 抢通结果详细信息：已修正QoS限速策略至100Mbps，端口P533-珠江旧城-PTN3900-23-TPA1EG24-1(cvlan=100)丢包恢复，SLA指标恢复正常水平\n3. 通知对象：专线投诉处置智能体' },
      { t: 20, type: 'Notification-T', from: '专线投诉处置智能体', to: 'WAIMO投诉处理智能体', summary: '工单报结通知：根因与抢通结果已同步，工单闭环',
        message: '1. 通知类型：工单报结通知\n2. 通知内容：故障根因为QoS限速策略误配置，已修正限速策略完成抢通，SLA指标恢复，投诉工单申请闭环\n3. 通知对象：WAIMO投诉处理智能体' },
    ],
  },
};

// 由参考数据生成日志行（badge/clock/from/to/summary/prompt/step）
// 徽章规则：检索 →「检索」；Notification-T →「Notification-T通知」；
// 其余 Task-T/Negotiation-T + 请求/响应（内部行已按 V2.26 移除，仅 A2A-T 与检索；
// Authorization-T 授权类消息不进入协作日志，见文件头 V2.27 注）
export function buildLogs(src) {
  const [h, m, s] = src.base.split(':').map(Number);
  const base = h * 3600 + m * 60 + s;
  return src.events.map((e) => {
    const tot = base + e.t;
    const p2 = (v) => String(v).padStart(2, '0');
    const ms = String(Math.round((tot - Math.floor(tot)) * 1000)).padStart(3, '0');
    const badge = e.from === e.to
      ? '内部'
      : e.type === '检索'
        ? '检索'
        : e.type === 'Notification-T'
          ? 'Notification-T通知'
          : e.type + (e.dir === 'response' ? '响应' : '请求');
    return {
      badge,
      clock: p2(Math.floor(tot / 3600)) + ':' + p2(Math.floor(tot / 60) % 60) + ':' + p2(Math.floor(tot) % 60) + '.' + ms,
      from: e.from,
      to: e.to,
      summary: e.summary,
      prompt: e.message,
      step: e.step || null,
    };
  });
}
