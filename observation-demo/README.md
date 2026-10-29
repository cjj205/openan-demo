# Observation Demo(A2A-T 展屏)

OpenAN 观测场景演示大屏:高保真呈现 A2A-T 多智能体协作全流程,内置两个端到端案例(WAIMO 故障分类定界、专线投诉处置与动态编排),支持故事线回放。

基于 React 18 + Vite 构建。

## 运行

```bash
npm install
npm run dev      # 开发
npm run build    # 构建
npm run preview  # 预览构建产物
```

> 本目录为浏览器版演示;`package.json` 中的 Electron 打包脚本(`electron:preview`、`dist:exe`)不适用于本仓库。

## 功能

- 两个端到端案例,默认加载完成态
- 故事线回放:播放/暂停/单步、0.5~16x 倍速、停止回完成态
- 分阶段详情面板:意图识别、智能体检索、协商、调度下发、任务/授权/通知
- 智能体协作日志、A2A-T 消息流与协议胶囊动画

## URL 参数

- `?case=1|2` — 切换案例
- `?story=seek&t=秒` — 跳到指定时刻
- `?story=auto&speed=N` — 自动回放

## 目录结构

```
src/
  components/   画布渲染、面板与协商组件
  design/       界面图层数据(七大区域)
  storyline/    故事线回放引擎(案例剧本、世界状态、连线动画)
public/
  icons/        图标资源
  assets/       图片资源
  design/       设计精灵图
```
