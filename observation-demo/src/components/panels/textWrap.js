// textWrap.js — 文本折行估算（V5：气泡/卡片高度包裹文字）
// CJK/全角与西文宽度可参数化（默认 12px 字号：CJK 12px、西文 6.5px——偏保守，
// 实际西文略窄，估算行数只多不少，容器高度不会小于文字高度）；拉丁词不拆行，贪心逐词填充换行
// V5.4：卡底描述（11px）传 cjkW=11/latW=6 估算折行（用户规格：超出卡片宽度换行展示）
const charW = (ch, cjkW, latW) => (ch.charCodeAt(0) > 0x2e7f ? cjkW : latW)

export default function wrapLines(text, width, cjkW = 12, latW = 6.5) {
  const tokens = []
  for (const ch of text) {
    const cjk = ch.charCodeAt(0) > 0x2e7f
    const lat = /[A-Za-z0-9]/.test(ch)
    if (!cjk && lat) {
      const last = tokens[tokens.length - 1]
      if (last && last.lat) last.w += charW(ch, cjkW, latW)
      else tokens.push({ w: charW(ch, cjkW, latW), lat: true })
    } else {
      tokens.push({ w: charW(ch, cjkW, latW) })
    }
  }
  let lines = 1, x = 0
  for (const tk of tokens) {
    if (x > 0 && x + tk.w > width) { lines++; x = tk.w }
    else x += tk.w
  }
  return lines
}
