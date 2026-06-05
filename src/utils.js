export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function toast(msg, duration = 2000) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.remove('hidden');
  el.classList.add('show');
  clearTimeout(el._timer);
  el._timer = setTimeout(() => {
    el.classList.remove('show');
    setTimeout(() => el.classList.add('hidden'), 300);
  }, duration);
}

export function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

export function normalizeRect(x1, y1, x2, y2) {
  return { x: Math.min(x1, x2), y: Math.min(y1, y2), w: Math.abs(x2 - x1), h: Math.abs(y2 - y1) };
}

export function pageToCanvas(rx, ry, canvasW, canvasH) {
  return { x: rx * canvasW, y: ry * canvasH };
}

export function canvasToPage(cx, cy, canvasW, canvasH) {
  return { x: cx / canvasW, y: cy / canvasH };
}
