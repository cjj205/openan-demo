// SubStepPanels.jsx — 能开平台节点卡（替代注册中心设计节点）+ 子步骤执行期详情面板
// V3.7：组件源自 A2A-T移动样板间展屏设计-V3.1/react-panels（复制入 src/components/panels/）；
// 平台卡 144×142 中心与原注册中心节点中心重合（441,305），reg-* 检索线起点随之改锚卡右缘 514；
// 详情面板触发（回放态）：WAIMO mini0=投诉识别→意图识别 / mini2=调度处置→调度处置、
// ZX mini1=动态编排→动态编排、检索线激活→检索智能体（置于平台卡右侧）；
// V3.13：Task-T 面板与 Notification-T 面板（原均在连线盒水平居中、下缘 +12px）；
// V3.22：Task-T 窗口延展为 任务下发→编排完成 并左移避让 ZX 卡迷你芯片（见 taskTWindow）、
// 检索/Task-T/意图面板动态分步（面板内部时钟 useStageClock / 选中渐显）；
// 面板外层 satCssStyle 锚对应卡集群中心（收起/展开随卡刚体平移），内层 st-panel-in 入场动画
import React from 'react';
import { CARDS, LINES, satCssStyle } from '../roles';
import { CASES, TIME_SCALE } from '../cases';
import { taskTWindowOf, searchWindowOf, orchestrationWindowOf, notifWindowOf, dispatchWindowOf, intentWindowOf } from '../panel-timing';
import PlatformNodeCard from '../../components/panels/PlatformNodeCard.jsx';
import IntentRecognitionPanel from '../../components/panels/IntentRecognitionPanel.jsx';
import SearchAgentPanel from '../../components/panels/SearchAgentPanel.jsx';
import DispatchPanel from '../../components/panels/DispatchPanel.jsx';
import DynamicOrchestrationPanel from '../../components/panels/DynamicOrchestrationPanel.jsx';
import TaskTPanel from '../../components/panels/TaskTPanel.jsx';
import NotificationTPanel from '../../components/panels/NotificationTPanel.jsx';
import '../../components/panels/panels.css';

const center = (b) => ({ x: b.x + b.w / 2, y: b.y + b.h / 2 });

// 能开平台（快照/回放常驻）
const PLATFORM = { x: 369, y: 234, w: 144, h: 142 };

// WAIMO—专线 两卡中心中点（Task-T / Notification-T 面板锚点，随两侧卡片刚体平移）
const WZ_MID = (() => {
  const a = center(CARDS.WAIMO.box), b = center(CARDS.ZX.box);
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
})();

// 连线下方面板盒：连线盒水平居中、下缘 +12px
const belowLine = (key, w, h) => {
  const b = LINES[key].box;
  return { x: Math.round(b.x + b.w / 2 - w / 2), y: Math.round(b.y + b.h + 12), w, h };
};

// 子步骤详情面板（回放态，执行到对应子步骤/连线激活期时呈现）
// V3.15：检索面板拆分两处——WAIMO 检索（reg-waimo-search）在平台卡右侧、选中「专线投诉处置智能体」；
// 专线检索（reg-zx-search）在专线卡正下方、选中「粤东/粤西」（案例二粤西不登场仅选中粤东）
const PANEL_DEFS = [
  {
    // V3.21：意图识别面板分步动态（输入→Reasoning→Action→Observation→输出）——
    // 传入激活窗口与播放上下文（t/mode/speed），面板内部时钟按窗口进度推进；
    // V3.28：WAIMO 卡增高至 252（底缘 691），面板自 677 下移至 699 避让；
    // V3.31：窗口改 intentWindowOf（mini0 窗口上限 36 业务秒——全窗 65 秒分步偏慢）
    key: 'intent', Comp: IntentRecognitionPanel,
    props: (pub) => ({ ...intentWindowOf(CASES[pub.caseId]), t: pub.t, mode: pub.mode, speed: pub.speed, timeScale: TIME_SCALE }),
    when: (w, pub) => { const { t0, t1 } = intentWindowOf(CASES[pub.caseId]); return pub.t >= t0 && pub.t < t1; },
    box: { x: 580, y: 699, w: 498, h: 232 }, anchor: () => center(CARDS.WAIMO.box),
  },
  {
    // V3.30：调度处置面板三段分步（①手机 → ②左侧消息气泡 → ③右侧回复气泡）；
    // V3.32：窗口 = WAIMO mini2 激活 → ZX mini4（修复验证）激活——面板消失后
    // 才执行修复验证（mini2 仅 4/3 业务秒，延展窗口保分步节奏可读）
    key: 'dispatch', Comp: DispatchPanel,
    props: (pub) => ({ ...dispatchWindowOf(CASES[pub.caseId]), t: pub.t, mode: pub.mode, speed: pub.speed, timeScale: TIME_SCALE }),
    when: (w, pub) => { const { t0, t1 } = dispatchWindowOf(CASES[pub.caseId]); return pub.t >= t0 && pub.t < t1; },
    box: { x: 733, y: 699, w: 192, h: 352 }, anchor: () => center(CARDS.WAIMO.box),
  },
  {
    // V3.27：动态编排面板三段分步（左侧元素 → 编排引擎 → 右侧元素）；窗口 = mini1 激活
    // → mini2（任务诊断）激活——分步在下一子步骤开始前完成（面板消失即下一子步骤开始）
    key: 'orchestration', Comp: DynamicOrchestrationPanel,
    props: (pub) => ({ ...orchestrationWindowOf(CASES[pub.caseId]), t: pub.t, mode: pub.mode, speed: pub.speed, timeScale: TIME_SCALE }),
    when: (w, pub) => { const { t0, t1 } = orchestrationWindowOf(CASES[pub.caseId]); return pub.t >= t0 && pub.t < t1; },
    box: { x: 1011, y: 701, w: 574, h: 218 }, anchor: () => center(CARDS.ZX.box),
  },
  {
    // V3.22：检索面板动态选中（相位驱动，窗口=连线激活期+4 业务秒）——前半未选，
    // 后半目标项高亮渐显；seek 挂载按相位直接落位
    key: 'search-waimo', Comp: SearchAgentPanel,
    props: (pub) => ({ ...searchWindowOf(CASES[pub.caseId], 'reg-waimo-search'), t: pub.t, mode: pub.mode, speed: pub.speed, timeScale: TIME_SCALE, selected: ['zx'] }),
    when: (w, pub) => { const { t0, t1 } = searchWindowOf(CASES[pub.caseId], 'reg-waimo-search'); return pub.t >= t0 && pub.t < t1; },
    box: { x: 521, y: 234, w: 236, h: 194 }, anchor: () => center(PLATFORM),
  },
  {
    // V3.19：专线检索面板置于检索结果文字（命中：粤东、粤西SPN…，胶囊右侧 1042..1235 × 280..296）
    // 下方（顶 306）；右缘收敛至 1132 避让专线卡左上角徽章/标题（卡左缘 1136）
    key: 'search-zx', Comp: SearchAgentPanel,
    props: (pub) => ({ ...searchWindowOf(CASES[pub.caseId], 'reg-zx-search'), t: pub.t, mode: pub.mode, speed: pub.speed, timeScale: TIME_SCALE, selected: pub.caseId === 'c2' ? ['yd'] : ['yd', 'yx'] }),
    when: (w, pub) => { const { t0, t1 } = searchWindowOf(CASES[pub.caseId], 'reg-zx-search'); return pub.t >= t0 && pub.t < t1; },
    box: { x: 896, y: 306, w: 236, h: 194 },
    anchor: () => ({ x: (center(PLATFORM).x + center(CARDS.ZX.box).x) / 2, y: (center(PLATFORM).y + center(CARDS.ZX.box).y) / 2 }),
  },
  {
    // V3.24：Task-T 面板窗口 = 任务下发 → 专线首个内部子步骤开始（面板消失后子步骤才执行，
    // 见 taskTWindowOf），8 段分步动态 + 滚动跟随；位置自连线居中左移至右缘齐 ZX 卡左缘
    // （778..1136），不与专线卡迷你步骤/描述区域重叠
    key: 'task-t', Comp: TaskTPanel,
    props: (pub) => ({ ...taskTWindowOf(CASES[pub.caseId]), t: pub.t, mode: pub.mode, speed: pub.speed, timeScale: TIME_SCALE }),
    when: (w, pub) => { const { t0, t1 } = taskTWindowOf(CASES[pub.caseId]); return pub.t >= t0 && pub.t < t1; },
    box: { x: 778, y: 562, w: 358, h: 330 }, anchor: () => WZ_MID,
  },
  {
    // V3.27：Notification-T 面板三段分步（抢通前 → 箭头 → 抢通后）；窗口 = waimo-zx-notif
    // 连线激活 → WAIMO mini3（投诉闭环）激活——分步完成后投诉闭环才开始
    key: 'notif-t', Comp: NotificationTPanel,
    props: (pub) => ({ ...notifWindowOf(CASES[pub.caseId]), t: pub.t, mode: pub.mode, speed: pub.speed, timeScale: TIME_SCALE }),
    when: (w, pub) => { const { t0, t1 } = notifWindowOf(CASES[pub.caseId]); return pub.t >= t0 && pub.t < t1; },
    box: belowLine('waimo-zx-notif', 352, 236), anchor: () => WZ_MID,
  },
];

export default function SubStepPanels({ world, pub }) {
  const active = world ? PANEL_DEFS.filter((p) => p.when(world, pub)) : [];
  return (
    <>
      {/* 能开平台节点卡（注册中心为其内嵌子卡）；V3.14：z-index 40——全页最高内容层级，
          高于连线（14/15）/工具条（20）/日志表（21）/把手（22）/协商层（25）/倍速菜单（30），
          确保详情面板不被 A2A-T 协作日志等任何区域遮挡 */}
      <div style={{ position: 'absolute', left: PLATFORM.x, top: PLATFORM.y, width: PLATFORM.w, height: PLATFORM.h,
        zIndex: 40, ...satCssStyle(pub, PLATFORM, center(PLATFORM)) }}>
        <PlatformNodeCard />
      </div>
      {/* 子步骤详情面板（全页最高层级，不被遮挡）；props 可为对象或 (pub)=>对象 */}
      {active.map((p) => {
        const pr = typeof p.props === 'function' ? p.props(pub) : p.props
        return (
          <div key={p.key} style={{ position: 'absolute', left: p.box.x, top: p.box.y, width: p.box.w, height: p.box.h,
            zIndex: 40, ...satCssStyle(pub, p.box, p.anchor()) }}>
            <div className="st-panel-in" style={{ width: '100%', height: '100%' }}>
              <p.Comp {...pr} />
            </div>
          </div>
        )
      })}
    </>
  );
}
