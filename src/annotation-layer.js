import { generateId, normalizeRect, canvasToPage, pageToCanvas } from './utils.js';

export class AnnotationManager {
  constructor() {
    this.annotations = [];
    this.undoStack = [];
    this.activeTool = null;
    this.activeColor = '#FFE066';
    this.penColor = '#000000';
    this.penWidth = 2;
    this.shapeColor = '#000000';
    this.shapeWidth = 2;
    this.stampType = null;
    this.stampImageData = null;
    this.textboxColor = '#000000';
    this.textboxFontSize = 14;
    this.isDrawing = false;
    this.drawStart = null;
    this.currentStroke = null;
    this.currentShape = null;

    this._stickyPending = null;
  }

  getAll() { return this.annotations; }
  getByPage(pageIndex) { return this.annotations.filter((a) => a.pageIndex === pageIndex); }

  add(annotation) {
    this.annotations.push(annotation);
    this.undoStack.push({ action: 'add', annotation });
  }

  remove(id) {
    const idx = this.annotations.findIndex((a) => a.id === id);
    if (idx !== -1) {
      const removed = this.annotations.splice(idx, 1)[0];
      this.undoStack.push({ action: 'remove', annotation: removed });
    }
  }

  undo() {
    if (this.undoStack.length === 0) return false;
    const op = this.undoStack.pop();
    if (op.action === 'add') {
      const idx = this.annotations.findIndex((a) => a.id === op.annotation.id);
      if (idx !== -1) this.annotations.splice(idx, 1);
    } else if (op.action === 'remove') {
      this.annotations.push(op.annotation);
    } else if (op.action === 'modify') {
      const idx = this.annotations.findIndex((a) => a.id === op.annotation.id);
      if (idx !== -1) this.annotations[idx] = op.before;
    }
    return true;
  }

  pushModifyUndo(annotation, before) {
    this.undoStack.push({ action: 'modify', annotation, before: { ...before } });
  }

  fromJSON(data) {
    this.annotations = data || [];
    this.undoStack = [];
  }

  toJSON() {
    return this.annotations.map((a) => ({ ...a }));
  }

  toXFDF() {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<xfdf xmlns="http://ns.adobe.com/xfdf/" xml:space="preserve">\n  <annots>\n';
    for (const a of this.annotations) {
      if (a.type === 'highlight' || a.type === 'underline' || a.type === 'strikethrough') {
        xml += `    <${a.type} color="${a.color}" rect="${a.rect.x} ${a.rect.y} ${a.rect.x + a.rect.w} ${a.rect.y + a.rect.h}" page="${a.pageIndex}"/>\n`;
      } else if (a.type === 'sticky') {
        xml += `    <text color="${a.color}" rect="${a.x} ${a.y} ${a.x + 0.05} ${a.y + 0.05}" page="${a.pageIndex}"><contents>${a.text.replace(/</g, '&lt;')}</contents></text>\n`;
      } else if (a.type === 'pen') {
        xml += `    <ink color="${a.color}" page="${a.pageIndex}"><inklist><gesture>${a.points.map((p) => p.x.toFixed(4) + ',' + p.y.toFixed(4)).join(';')}</gesture></inklist></ink>\n`;
      } else if (a.type === 'rect' || a.type === 'ellipse' || a.type === 'line' || a.type === 'arrow') {
        xml += `    <${a.type === 'arrow' ? 'line' : a.type} color="${a.color}" width="${a.strokeWidth}" rect="${a.rect.x} ${a.rect.y} ${a.rect.x + a.rect.w} ${a.rect.y + a.rect.h}" page="${a.pageIndex}"/>\n`;
      } else if (a.type === 'stamp') {
        xml += `    <stamp rect="${a.x} ${a.y} ${a.x + a.w} ${a.y + a.h}" page="${a.pageIndex}"><contents>${(a.label || '').replace(/</g, '&lt;')}</contents></stamp>\n`;
      } else if (a.type === 'textbox') {
        xml += `    <freetext color="${a.color}" rect="${a.x} ${a.y} ${a.x + a.w} ${a.y + a.h}" page="${a.pageIndex}"><contents>${a.text.replace(/</g, '&lt;')}</contents></freetext>\n`;
      }
    }
    xml += '  </annots>\n</xfdf>';
    return xml;
  }

  renderAnnotations(pageIndex, layer, canvas) {
    if (!layer || !canvas) return;
    layer.innerHTML = '';
    const cw = canvas.width / 1.5;
    const ch = canvas.height / 1.5;
    const pageAnns = this.getByPage(pageIndex);

    for (const ann of pageAnns) {
      switch (ann.type) {
        case 'highlight': this._renderHighlight(ann, layer, cw, ch); break;
        case 'underline': this._renderUnderline(ann, layer, cw, ch); break;
        case 'strikethrough': this._renderStrikethrough(ann, layer, cw, ch); break;
        case 'sticky': this._renderSticky(ann, layer, cw, ch); break;
        case 'pen': this._renderPen(ann, layer, cw, ch); break;
        case 'rect': case 'ellipse': case 'line': case 'arrow':
          this._renderShape(ann, layer, cw, ch); break;
        case 'stamp': this._renderStamp(ann, layer, cw, ch); break;
        case 'textbox': this._renderTextbox(ann, layer, cw, ch); break;
      }
    }
  }

  _renderHighlight(ann, layer, cw, ch) {
    const el = document.createElement('div');
    el.className = 'text-highlight';
    const pos = pageToCanvas(ann.rect.x, ann.rect.y, cw, ch);
    const sz = pageToCanvas(ann.rect.w, ann.rect.h, cw, ch);
    el.style.cssText = `left:${pos.x}px;top:${pos.y}px;width:${sz.x}px;height:${sz.y}px;background:${ann.color};opacity:0.5;`;
    el.addEventListener('click', () => { if (this.activeTool === null) this.remove(ann.id); this.rerenderPage(ann.pageIndex); });
    layer.appendChild(el);
  }

  _renderUnderline(ann, layer, cw, ch) {
    const el = document.createElement('div');
    el.className = 'text-underline';
    const pos = pageToCanvas(ann.rect.x, ann.rect.y, cw, ch);
    const sz = pageToCanvas(ann.rect.w, ann.rect.h, cw, ch);
    el.style.cssText = `left:${pos.x}px;top:${pos.y}px;width:${sz.x}px;height:${sz.y}px;`;
    el.querySelector || 0;
    const line = document.createElement('div');
    line.style.cssText = `position:absolute;bottom:0;left:0;right:0;height:2px;background:${ann.color};`;
    el.appendChild(line);
    el.addEventListener('click', () => { if (this.activeTool === null) this.remove(ann.id); this.rerenderPage(ann.pageIndex); });
    layer.appendChild(el);
  }

  _renderStrikethrough(ann, layer, cw, ch) {
    const el = document.createElement('div');
    el.className = 'text-strikethrough';
    const pos = pageToCanvas(ann.rect.x, ann.rect.y, cw, ch);
    const sz = pageToCanvas(ann.rect.w, ann.rect.h, cw, ch);
    el.style.cssText = `left:${pos.x}px;top:${pos.y}px;width:${sz.x}px;height:${sz.y}px;`;
    const line = document.createElement('div');
    line.style.cssText = `position:absolute;top:50%;left:0;right:0;height:2px;background:${ann.color};transform:translateY(-50%);`;
    el.appendChild(line);
    el.addEventListener('click', () => { if (this.activeTool === null) this.remove(ann.id); this.rerenderPage(ann.pageIndex); });
    layer.appendChild(el);
  }

  _renderSticky(ann, layer, cw, ch) {
    const pin = document.createElement('div');
    pin.className = 'sticky-pin';
    const pos = pageToCanvas(ann.x, ann.y, cw, ch);
    pin.style.cssText = `left:${pos.x - 12}px;top:${pos.y - 12}px;`;
    pin.innerHTML = `<svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="${ann.color || '#FFC107'}"/></svg>`;
    pin.addEventListener('mouseenter', () => {
      const popup = document.createElement('div');
      popup.className = 'sticky-popup';
      popup.style.left = (pos.x + 16) + 'px';
      popup.style.top = (pos.y - 8) + 'px';
      popup.innerHTML = `<button class="sticky-close">×</button><div>${ann.text.replace(/\n/g, '<br>')}</div>`;
      popup.querySelector('.sticky-close').addEventListener('click', () => popup.remove());
      layer.appendChild(popup);
      pin._popup = popup;
    });
    pin.addEventListener('mouseleave', () => {
      if (pin._popup) { pin._popup.remove(); pin._popup = null; }
    });
    pin.addEventListener('click', () => {
      if (this.activeTool === null) { this.remove(ann.id); this.rerenderPage(ann.pageIndex); }
    });
    layer.appendChild(pin);
  }

  _renderPen(ann, layer, cw, ch) {
    if (!ann.points || ann.points.length < 2) return;
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'pen-stroke');
    svg.setAttribute('viewBox', `0 0 ${cw} ${ch}`);
    svg.style.cssText = `width:${cw}px;height:${ch}px;position:absolute;top:0;left:0;`;
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const d = ann.points.map((p, i) => {
      const pt = pageToCanvas(p.x, p.y, cw, ch);
      return (i === 0 ? 'M' : 'L') + pt.x.toFixed(2) + ',' + pt.y.toFixed(2);
    }).join(' ');
    path.setAttribute('d', d);
    path.setAttribute('stroke', ann.color);
    path.setAttribute('stroke-width', ann.strokeWidth * (cw / 612));
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('stroke-linejoin', 'round');
    svg.appendChild(path);
    layer.appendChild(svg);
  }

  _renderShape(ann, layer, cw, ch) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'shape-annotation');
    const pos = pageToCanvas(ann.rect.x, ann.rect.y, cw, ch);
    const sz = pageToCanvas(ann.rect.w, ann.rect.h, cw, ch);
    svg.style.cssText = `position:absolute;left:${pos.x}px;top:${pos.y}px;width:${Math.max(sz.x, 4)}px;height:${Math.max(sz.y, 4)}px;overflow:visible;`;
    svg.setAttribute('viewBox', `0 0 ${Math.max(sz.x, 4)} ${Math.max(sz.y, 4)}`);
    const sw = ann.strokeWidth;
    const color = ann.color;
    let shapeEl;
    if (ann.type === 'rect') {
      shapeEl = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      shapeEl.setAttribute('x', sw / 2); shapeEl.setAttribute('y', sw / 2);
      shapeEl.setAttribute('width', Math.max(sz.x - sw, 1)); shapeEl.setAttribute('height', Math.max(sz.y - sw, 1));
      shapeEl.setAttribute('fill', 'none'); shapeEl.setAttribute('stroke', color); shapeEl.setAttribute('stroke-width', sw);
    } else if (ann.type === 'ellipse') {
      shapeEl = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
      shapeEl.setAttribute('cx', sz.x / 2); shapeEl.setAttribute('cy', sz.y / 2);
      shapeEl.setAttribute('rx', Math.max(sz.x / 2 - sw, 1)); shapeEl.setAttribute('ry', Math.max(sz.y / 2 - sw, 1));
      shapeEl.setAttribute('fill', 'none'); shapeEl.setAttribute('stroke', color); shapeEl.setAttribute('stroke-width', sw);
    } else if (ann.type === 'line') {
      shapeEl = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      shapeEl.setAttribute('x1', 0); shapeEl.setAttribute('y1', sz.y);
      shapeEl.setAttribute('x2', sz.x); shapeEl.setAttribute('y2', 0);
      shapeEl.setAttribute('stroke', color); shapeEl.setAttribute('stroke-width', sw);
    } else if (ann.type === 'arrow') {
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', 0); line.setAttribute('y1', sz.y);
      line.setAttribute('x2', sz.x); line.setAttribute('y2', 0);
      line.setAttribute('stroke', color); line.setAttribute('stroke-width', sw);
      g.appendChild(line);
      const headLen = Math.min(12, sz.x / 3, sz.y / 3);
      const angle = Math.atan2(sz.y, sz.x);
      const hx = sz.x; const hy = 0;
      const p1x = hx - headLen * Math.cos(angle - 0.4);
      const p1y = hy + headLen * Math.sin(angle - 0.4);
      const p2x = hx - headLen * Math.cos(angle + 0.4);
      const p2y = hy + headLen * Math.sin(angle + 0.4);
      const head = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      head.setAttribute('points', `${hx},${hy} ${p1x},${p1y} ${p2x},${p2y}`);
      head.setAttribute('fill', color);
      g.appendChild(head);
      svg.appendChild(g);
      layer.appendChild(svg);
      return;
    }
    if (shapeEl) svg.appendChild(shapeEl);
    layer.appendChild(svg);
  }

  _renderStamp(ann, layer, cw, ch) {
    const el = document.createElement('div');
    el.className = 'stamp-annotation';
    const pos = pageToCanvas(ann.x, ann.y, cw, ch);
    el.style.left = pos.x + 'px';
    el.style.top = pos.y + 'px';
    if (ann.imageData) {
      el.classList.add('image-stamp');
      const img = document.createElement('img');
      img.src = ann.imageData;
      el.appendChild(img);
    } else {
      const colors = { '已审阅': '#4CAF50', '草稿': '#FF9800', '机密': '#F44336', '批准': '#2196F3' };
      el.style.background = colors[ann.label] || '#9C27B0';
      el.textContent = ann.label;
    }
    layer.appendChild(el);
  }

  _renderTextbox(ann, layer, cw, ch) {
    const el = document.createElement('div');
    el.className = 'textbox-annotation';
    const pos = pageToCanvas(ann.x, ann.y, cw, ch);
    el.style.left = pos.x + 'px';
    el.style.top = pos.y + 'px';
    el.style.color = ann.color;
    el.style.fontSize = (ann.fontSize * cw / 612) + 'px';
    el.contentEditable = true;
    el.textContent = ann.text;
    const before = { ...ann };
    el.addEventListener('blur', () => {
      ann.text = el.textContent;
      if (ann.text !== before.text) this.pushModifyUndo(ann, before);
    });
    el.addEventListener('click', (e) => {
      if (this.activeTool !== null && this.activeTool !== 'textbox') {
        e.preventDefault();
        this.remove(ann.id);
        this.rerenderPage(ann.pageIndex);
      }
    });
    layer.appendChild(el);
  }

  rerenderPage(pageIndex) {
    if (this.onRerenderPage) this.onRerenderPage(pageIndex);
  }
}
