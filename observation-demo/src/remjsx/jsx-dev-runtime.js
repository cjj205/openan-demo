// remjsx/jsx-dev-runtime.js — react/jsx-dev-runtime 别名包装（V5.30 rem 缩放，开发模式）。
// 生产构建走 jsx-runtime.js；此处包装 jsxDEV（丢弃开发告警参数语义不变，仅拦截 style）。
import { Fragment, jsxDEV as _jsxDEV } from '../../node_modules/react/jsx-dev-runtime.js';
import { remStyleFor } from './convert.js';
export const jsxDEV = (type, props, key, isStaticChildren, source, self) => (
  props && props.style
    ? _jsxDEV(type, { ...props, style: remStyleFor(type, props.style) }, key, isStaticChildren, source, self)
    : _jsxDEV(type, props, key, isStaticChildren, source, self)
);
export { Fragment };
