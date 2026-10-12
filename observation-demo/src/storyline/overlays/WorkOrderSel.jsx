// WorkOrderSel.jsx — 工单卡选中角标（跟随选中卡）
// V2.7：整卡点击切换案例由 LayerView interactions 直接挂接在设计 DOM 卡片容器上（无覆盖按钮），
// 卡内文字（工单号/客户/描述）可正常选中复制；拖拽选字不触发切换（见 StorylineContext interactions）
// V2.29：选中角标改用设计切图 ic_selected.svg（32×32 蓝角标+白对勾，与设计稿静态选中样式同源）
import React from 'react';
import { ORDERS } from '../roles';

export default function WorkOrderSel({ pub }) {
  const sel = pub.caseId === 'c1' ? ORDERS.c1 : ORDERS.c2;
  const cb = ORDERS.checkBox;
  const relX = cb.x - ORDERS.c1.box.x;
  const relY = cb.y - ORDERS.c1.box.y;
  return (
    <div className="st-layer st-orders">
      {pub.mode !== 'snapshot' ? (
        <div className="st-check" style={{ left: sel.box.x + relX, top: sel.box.y + relY }}>
          <img src="/icons/ic_selected.svg" alt="" draggable={false} />
        </div>
      ) : null}
    </div>
  );
}

