# A2A-T 移动样板间展屏（React 高保真还原）

由 `../codegen/generate.js` 从 Pixso 交付包（design.json + 2x 整帧 PNG + 图标切图）自动生成。

## 运行

```bash
npm install
npm run dev      # 开发
npm run build    # 构建
```

## 结构

- `src/components/ScreenCanvas.jsx` — 1920×1080 画布：**整页等比缩放（V2.17，rem 语义：k=min(vw/1920,vh/1080) 居中适配，1rem≡16·k px——全部文字/图标/圆形/间距随屏幕等比，大屏字大、圆恒正圆）** ∘ 用户缩放 Z=scale(zoom) 绕设计中心 (960,540)（V2.16）
- `src/components/LayerView.jsx` — 通用图层渲染器（div / text / icon / sprite 四种；uiPatches 与世界补丁 s 深合并+transition 拼接（V2.13，集群 transform 与卡高/状态样式共存）；icon 节点支持 `src` 补丁（V2.15，业务抢通扳手）；节点带 data-id 便于测试定位）
- `src/components/regions/FlowChartRegion.jsx` — 流程图区域（V2.16 起仅承担面板收起重适配变换；缩放已移至整页画布层，.fc-zoom 保留为子节点承载层不再变换）
- `src/design/regions/*.js` — 七大区域图层树数据（背景/流程图/工单面板/协作日志/成效指标/标题/顶部导航）
- `public/design/sprite-2x.png` — 2x 整帧设计图，矢量/蒙版图层的像素级裁切源
- `public/icons/` — `高保真图标切图` 导出的 SVG 图标（`variants/` 为按实例颜色生成的改色副本）

## 渲染策略

- **文字全部为真实 CSS 文本，可直接鼠标选中复制**（148 个文字节点）
- 矩形/椭圆/文字/渐变/阴影/描边 → 真实 CSS 代码（可改数据、可加交互）
- 图标（按图层名匹配，同名多变体时按尺寸+颜色选版，必要时生成改色副本）→ `<img>` 引用 SVG（`public/icons`，变体在 `variants/`）
- 旋转/翻转的容器（如左右两侧玻璃面板）→ CSS `transform: matrix()`，渐变/描边按本地坐标系渲染
- 顶部导航高亮条（蒙版组）→ 渐变容器 + overflow 裁剪 + 旋转光斑 matrix 子元素
- 步骤时长底板、数字圆徽章等规则图形 → CSS 圆角近似
- 纯矢量路径、小图标蒙版组 → 精灵图裁切（`background-position` 从整帧 PNG 裁切，像素级一致）
- 背景大图 → CSS 渐变重建（从设计稿像素采样拟合）
- 生成器会自动消除"裁切图含文字 + CSS 再渲染一遍"导致的文字重影（fixpoint 迭代），最终 0 处重影

## 如何改成动态数据

图层数据里每个节点都有 `name`（设计稿图层名）和 `id`：
1. 在 `src/design/regions/*.js` 中找到对应节点（按 name 搜索）
2. 把它抽成受控组件或在 `LayerView` 中按 name 特判注入 props

## 动态故事线（src/storyline/）

回放引擎叠加在静态还原层之上，详见《技术方案文档.md》第二节：

- `StorylineContext.jsx` — 播放头状态机（play/pause/单步·逐事件节拍/0.5~16x 倍速/停止→全完成态/seek/案例切换→完成态；V2.13 起默认加载为完成态；V2.16 修复：播放循环发布携带 vscale）+ 画布缩放（50%~200%，V2.16 整页画布级）+ 日志实时模式 + 面板收起（V2.12：logHidden/ordersHidden 纯 UI 状态与 toggle API，makeInteractions 挂接设计把手）+ 视口铺满系数 vscale（V2.14：resize 监听，Provider 移至 ScreenCanvas 外）；仅在事件边界发布状态，连续动效交给 CSS/SMIL
- `cases.js` — 案例一/二剧本（事件时间轴、步骤房间分组、迷你步骤真实描述、工单元数据、单步节拍 beats=全部事件时刻去重升序；V2.11：Task-T响应/Notification-T 抢通结果走协商回程线正向，不与 Task-T 请求共用 task 线；V2.13：flowMsgs 连线消息映射——回放时 A2A-T 消息展示在连线下方、宽度不超连线（注册中心检索线不加），事件可显式 msg 覆盖）
- `case-data.js` — 协作日志参考数据（与仓库根 case1.js/case2.js 同步维护；buildLogs 生成徽章/时钟/收发方/摘要/完整 Prompt；V2.10：协商 Accept 响应改为 Task-T 请求；V2.11：日志跟随故事线——WAIMO 分类/定界 与 专线 数据关联/动态编排 内部条目与卡片迷你步骤同步，20/19 条）
- `roles-data.js` / `paths.js` — 节点 id 注册表与连线端点（`node ../codegen/export-storyline-data.js` 生成，勿手改）
- `roles.js` — 世界状态 → 节点补丁（hide/className/inline style/文本覆盖/title）+ 静态占位文案粤东粤西化 + 房间高亮底定位 + 传输室延迟登场（标签/监控室—传输室连线与滑块/传输室 4 步骤条随专线投诉处置智能体出现，登场前高亮底回落监控室）+ 技能胶囊合并「业务抢通」（粤东/粤西卡 生成抢通方案+抢通方案下发 → 一枚 80px 胶囊，含发光母版副本；V2.15 图标改扳手 ic_wrench.svg）+ 面板收起重适配（V2.12：fitFactors/regionFitStyle/overlayFitStyle/logFitStyle——收起后拓扑铺满释放区、固定元素复合反向原位）+ **收起保比例（V2.13：集群注册/卫星锚定 satCssStyle 闭式解/satSvgTransform、连线端点重适配 remapPathEnds/H→L 升格、胶囊反向、DOM-frame 盒索引、快照收起 SVG 连线接管、步骤 chip 穿透可选中）** + **V2.17：整页等比（viewFactors 恒 1/totalFactors 仅收起系数/VIEW_KEEP 移除——渐变文字不再被 transform 化（重影修复）；固定节点段按 key 合并（描边补丁不再被覆盖））** + **V2.16：缩放移至整页画布层（overlayFitParams=W:F 绕 1645,48、fixedCounterStyle d=s·f 固定元素随缩放、satSvgTransform/remapPathEnds 去 z；CHEV_CLIP 步骤条箭头造型（右凸左凹朝右、首末外缘平、间距 0.25rem、传输室未登场末枚动态右平）；回放按钮组描边 inset 化对齐）** + **V2.18/19：技能胶囊对居中（left 27/115）；成效标题条六连烤字切图与顶缘装饰条删除、标题 18px；步骤条 done 态底色归一（设计烤入的⑦高亮不再残留）** + 纯 UI 补丁（缩放百分比/倍速标签/固定元素反向变换/面板隐藏与把手提示）
- `overlays/` — 连线矢量层(高保真逐像素几何：水平段/立柱/肘弯+V形箭头，替代不透明 sprite；端点随集群刚体重适配、中间点随区域/视口拉伸=连线拉长、快照收起/非16:9 视口伪 world 全量接管)/激光彗星+协议胶囊(彗星短条以 stroke-dashoffset 沿整条 path 滑动，行程按重映射后实际长度；胶囊随调用呈现设计稿文案配色，请求走 task 线、Task-T响应(绿)/Notification-T(青) 走协商回程线；胶囊中心反向缩放保比例；**V2.13 连线下方 A2A-T 消息行：12px（V2.16）、与连线 1rem 间距（V2.17）、宽度不超连线、超出……截断、检索线不加**)/迷你步骤图标(纯SVG：绿圈对号/数字圈/loading；槽位集群锚定 satSvgTransform)/步骤描述(迷你步骤行下方，卡内放不下自动增高卡片 st-desccard+连线贴新卡底 dGrow；外层容器集群锚定)/受控日志表(斑马纹+徽章分色；无横向滚动条；左栏收起 left/width 真实重排；**V2.13 左栏收起真实重排；V2.17 整页等比下随画布缩放**)/工具栏点击层(倍速菜单/暂停图标视口反向)/工单选中层(浮动全文/对勾视口反向)/缩放工具条/日志传感器/组间连线滑块动效(动态 keyframes)/面板收起把手(PanelHandles：收起态边缘副本把手，视口反向)
- 回放态连线 sprite/协议胶囊/静态脉冲短条全部隐藏（sprite 为烤入背景的不透明位图，房间底平移后会露矩形色块；检索连线在设计稿无像素），由 `ConnectionLines` 矢量重绘；完成态（caseDone）全节点登场+全连线静态呈现
- `LayerView` 已按 `node.id` 注入补丁（uiPatches 与世界补丁 `s` 深合并+transition 拼接）；**默认加载=所选案例完成态**（V2.13；节点/步骤已完成、连线静态全量、日志全量）；快照态（world=null 设计快照+透明交互层）为内部模式；停止→全完成态
- URL 参数：`?case=1|2`、`?story=seek&t=秒`（跳到指定时刻，快照态）、`?story=auto&speed=N`（自动回放）；控制台 `window.__story` 可编程控制

## 已知偏差

- 文字：本机未安装 HarmonyOS Sans SC，回退微软雅黑，字形与设计稿略有差异（像素 diff 的主要来源）。将字体文件放入 `src/assets/fonts/` 并在 styles.css 添加 @font-face 后可消除。
- **用户要求的有意偏差（verify.ps1 基线 12.51/20.02% 的主要来源）**：①监控室白色高亮底快照态隐藏（回放跟随步骤平移）——约 368k px；②第二条日志改文字+CSS 斑马纹（原整行切图）；③XX 占位文案替换为粤东/粤西真实文案（卡片标题/工单描述/静态日志行/卡内描述）。剔除房间底区域后其余画面 10.84/10.55%，与替换前基线相当。
- 流程图中带 y150-350 区域背景光晕拟合略有偏差（+7~10/255）。
- 左侧玻璃面板渐变按设计像素手动校准（shared gradientTransform 在该实例上投影超界）。

## 重新生成

1. `node ../codegen/generate.js`（覆盖 src/design、components 与静态资源，storyline 模块不受影响）
2. `node ../codegen/export-storyline-data.js`（重新导出 roles-data.js / paths.js；`--check` 只校验）
环境变量 `BAKE_TEXT=1` 可把压在裁切层上的文字一并烤成切图（像素零差异但不可选中）。
