import { AnnotationManager } from './annotation-layer.js';
import { generateId, canvasToPage, normalizeRect } from './utils.js';

export class ToolHandler {
  constructor(annoManager, viewer) {
    this.am = annoManager;
    this.viewer = viewer;
    this.isDrawing = false;
    this.startPt = null;
    this.currentPoints = [];
    this.tempEl = null;

    this.toolbar = document.getElementById('annotation-toolbar');
    this._initToolbar();
    this._initInteraction();
  }

  show() { this.toolbar.classList.remove('hidden'); }
  hide() { this.toolbar.classList.add('hidden'); }

  _initToolbar() {
    this.toolbar.querySelectorAll('.tool-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const tool = btn.dataset.tool;
        if (this.am.activeTool === tool) {
          this.am.activeTool = null;
          btn.classList.remove('active');
          this._hideAllOptions();
        } else {
          this.toolbar.querySelectorAll('.tool-btn').forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');
          this.am.activeTool = tool;
          this._showToolOptions(tool);
        }
        this._updateLayerInteractive();
      });
    });

    const textColorPicker = document.getElementById('text-anno-color');
    if (textColorPicker) {
      textColorPicker.querySelectorAll('.color-dot').forEach((dot) => {
        dot.addEventListener('click', () => {
          textColorPicker.querySelectorAll('.color-dot').forEach((d) => d.classList.remove('active'));
          dot.classList.add('active');
          this.am.activeColor = dot.dataset.color;
        });
      });
    }

    const penOpts = document.getElementById('pen-options');
    if (penOpts) {
      penOpts.querySelectorAll('.color-dot').forEach((dot) => {
        dot.addEventListener('click', () => {
          penOpts.querySelectorAll('.color-dot').forEach((d) => d.classList.remove('active'));
          dot.classList.add('active');
          this.am.penColor = dot.dataset.color;
        });
      });
      document.getElementById('pen-width').addEventListener('change', (e) => {
        this.am.penWidth = parseInt(e.target.value);
      });
    }

    const shapeOpts = document.getElementById('shape-options');
    if (shapeOpts) {
      shapeOpts.querySelectorAll('.color-dot').forEach((dot) => {
        dot.addEventListener('click', () => {
          shapeOpts.querySelectorAll('.color-dot').forEach((d) => d.classList.remove('active'));
          dot.classList.add('active');
          this.am.shapeColor = dot.dataset.color;
        });
      });
      document.getElementById('shape-width').addEventListener('change', (e) => {
        this.am.shapeWidth = parseInt(e.target.value);
      });
    }

    const stampPanel = document.getElementById('stamp-panel');
    if (stampPanel) {
      stampPanel.querySelectorAll('.stamp-preset').forEach((btn) => {
        btn.addEventListener('click', () => {
          this.am.stampType = btn.dataset.stamp;
          this.am.stampImageData = null;
        });
      });
      document.getElementById('stamp-image-input').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
          this.am.stampType = 'custom';
          this.am.stampImageData = ev.target.result;
        };
        reader.readAsDataURL(file);
      });
    }

    const tbOpts = document.getElementById('textbox-options');
    if (tbOpts) {
      tbOpts.querySelectorAll('.color-dot').forEach((dot) => {
        dot.addEventListener('click', () => {
          tbOpts.querySelectorAll('.color-dot').forEach((d) => d.classList.remove('active'));
          dot.classList.add('active');
          this.am.textboxColor = dot.dataset.color;
          this.am.applyTextboxStyle(dot.dataset.color, null);
        });
      });
      document.getElementById('textbox-fontsize').addEventListener('change', (e) => {
        const fs = parseInt(e.target.value);
        this.am.textboxFontSize = fs;
        this.am.applyTextboxStyle(null, fs);
      });
    }
  }

  _showToolOptions(tool) {
    this._hideAllOptions();
    const map = {
      pen: 'pen-options',
      rect: 'shape-options', ellipse: 'shape-options', arrow: 'shape-options', line: 'shape-options',
      stamp: 'stamp-panel',
      textbox: 'textbox-options',
    };
    const id = map[tool];
    if (id) {
      const el = document.getElementById(id);
      if (el) el.style.display = '';
    }
  }

  _hideAllOptions() {
    ['pen-options', 'shape-options', 'stamp-panel', 'textbox-options'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });
  }

  _updateLayerInteractive() {
    const interactive = this.am.activeTool !== null;
    document.querySelectorAll('.annotation-layer').forEach((l) => {
      l.classList.toggle('interactive', interactive);
    });
  }

  _initInteraction() {
    const viewport = document.getElementById('pdf-viewport');

    viewport.addEventListener('mousedown', (e) => {
      const layer = e.target.closest('.annotation-layer.interactive');
      if (!layer) return;
      const tool = this.am.activeTool;
      if (!tool) return;
      e.preventDefault();

      const wrapper = layer.closest('.page-wrapper');
      const canvas = wrapper.querySelector('canvas');
      const cw = canvas.width / 1.5;
      const ch = canvas.height / 1.5;
      const pageIndex = parseInt(wrapper.dataset.pageIndex);
      const rect = layer.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      const pt = canvasToPage(cx, cy, cw, ch);

      if (tool === 'sticky') {
        this._openStickyModal(pageIndex, pt.x, pt.y);
        return;
      }

      if (tool === 'stamp') {
        this._placeStamp(pageIndex, pt.x, pt.y);
        return;
      }

      if (tool === 'textbox') {
        this._placeTextbox(pageIndex, pt.x, pt.y);
        return;
      }

      this.isDrawing = true;
      this.startPt = { ...pt, cx, cy };
      this._drawingPageIndex = pageIndex;
      this._drawingLayer = layer;
      this._drawingCanvas = canvas;
      this.currentPoints = [pt];

      if (tool === 'pen') {
        this._createTempPen(layer, cx, cy, cw, ch);
      }
    });

    viewport.addEventListener('mousemove', (e) => {
      if (!this.isDrawing) return;
      e.preventDefault();

      const layer = this._drawingLayer;
      const canvas = this._drawingCanvas;
      const cw = canvas.width / 1.5;
      const ch = canvas.height / 1.5;
      const rect = layer.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      const pt = canvasToPage(cx, cy, cw, ch);
      const tool = this.am.activeTool;

      if (tool === 'pen') {
        this.currentPoints.push(pt);
        this._updateTempPen(cx, cy, cw, ch);
      } else if (['rect', 'ellipse', 'line', 'arrow'].includes(tool)) {
        this._updateTempShape(layer, this.startPt.cx, this.startPt.cy, cx, cy, tool, cw, ch);
      } else if (['highlight', 'underline', 'strikethrough'].includes(tool)) {
        this._updateTempHighlight(layer, this.startPt.cx, this.startPt.cy, cx, cy, cw, ch);
      }
    });

    viewport.addEventListener('mouseup', async (e) => {
      if (!this.isDrawing) return;
      this.isDrawing = false;

      const layer = this._drawingLayer;
      const canvas = this._drawingCanvas;
      const cw = canvas.width / 1.5;
      const ch = canvas.height / 1.5;
      const rect = layer.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      const pt = canvasToPage(cx, cy, cw, ch);
      const tool = this.am.activeTool;
      const pageIndex = this._drawingPageIndex;

      if (tool === 'pen') {
        if (this.currentPoints.length >= 2) {
          this.am.add({
            id: generateId(), type: 'pen', pageIndex,
            points: [...this.currentPoints],
            color: this.am.penColor, strokeWidth: this.am.penWidth,
          });
        }
      } else if (['rect', 'ellipse', 'line', 'arrow'].includes(tool)) {
        const r = normalizeRect(this.startPt.x, this.startPt.y, pt.x, pt.y);
        if (r.w > 0.005 && r.h > 0.005) {
          this.am.add({
            id: generateId(), type: tool, pageIndex, rect: r,
            color: this.am.shapeColor, strokeWidth: this.am.shapeWidth,
          });
        }
      } else if (['highlight', 'underline', 'strikethrough'].includes(tool)) {
        const r = normalizeRect(this.startPt.x, this.startPt.y, pt.x, pt.y);
        if (r.w > 0.005 && r.h > 0.005) {
          const selectedText = await this._extractTextInRect(pageIndex, r);
          this.am.add({
            id: generateId(), type: tool, pageIndex, rect: r,
            color: this.am.activeColor, text: selectedText,
          });
        }
      }

      if (this.tempEl) { this.tempEl.remove(); this.tempEl = null; }
      this.am.rerenderPage(pageIndex);
    });
  }

  _createTempPen(layer, cx, cy, cw, ch) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.style.cssText = `position:absolute;top:0;left:0;width:${cw}px;height:${ch}px;pointer-events:none;z-index:10;`;
    svg.setAttribute('viewBox', `0 0 ${cw} ${ch}`);
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', `M${cx},${cy}`);
    path.setAttribute('stroke', this.am.penColor);
    path.setAttribute('stroke-width', this.am.penWidth * (cw / 612));
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke-linecap', 'round');
    path.id = 'temp-pen-path';
    svg.appendChild(path);
    layer.appendChild(svg);
    this.tempEl = svg;
  }

  _updateTempPen(cx, cy, cw, ch) {
    if (!this.tempEl) return;
    const path = this.tempEl.querySelector('#temp-pen-path');
    if (path) {
      path.setAttribute('d', path.getAttribute('d') + ` L${cx},${cy}`);
    }
  }

  _updateTempShape(layer, x1, y1, x2, y2, type, cw, ch) {
    if (this.tempEl) this.tempEl.remove();
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.style.cssText = `position:absolute;top:0;left:0;width:${cw}px;height:${ch}px;pointer-events:none;z-index:10;overflow:visible;`;
    svg.setAttribute('viewBox', `0 0 ${cw} ${ch}`);

    const r = normalizeRect(x1, y1, x2, y2);
    const sw = this.am.shapeWidth;
    const color = this.am.shapeColor;
    let el;
    if (type === 'rect') {
      el = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      el.setAttribute('x', r.x); el.setAttribute('y', r.y);
      el.setAttribute('width', Math.max(r.w, 1)); el.setAttribute('height', Math.max(r.h, 1));
      el.setAttribute('fill', 'none'); el.setAttribute('stroke', color); el.setAttribute('stroke-width', sw);
    } else if (type === 'ellipse') {
      el = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
      el.setAttribute('cx', r.x + r.w / 2); el.setAttribute('cy', r.y + r.h / 2);
      el.setAttribute('rx', Math.max(r.w / 2, 1)); el.setAttribute('ry', Math.max(r.h / 2, 1));
      el.setAttribute('fill', 'none'); el.setAttribute('stroke', color); el.setAttribute('stroke-width', sw);
    } else if (type === 'line') {
      el = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      el.setAttribute('x1', x1); el.setAttribute('y1', y1);
      el.setAttribute('x2', x2); el.setAttribute('y2', y2);
      el.setAttribute('stroke', color); el.setAttribute('stroke-width', sw);
    } else if (type === 'arrow') {
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      const ln = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      ln.setAttribute('x1', x1); ln.setAttribute('y1', y1);
      ln.setAttribute('x2', x2); ln.setAttribute('y2', y2);
      ln.setAttribute('stroke', color); ln.setAttribute('stroke-width', sw);
      g.appendChild(ln);
      const dx = x2 - x1; const dy = y2 - y1;
      const len = Math.sqrt(dx * dx + dy * dy);
      if (len > 10) {
        const headLen = Math.min(12, len / 3);
        const angle = Math.atan2(dy, dx);
        const p1x = x2 - headLen * Math.cos(angle - 0.4);
        const p1y = y2 - headLen * Math.sin(angle - 0.4);
        const p2x = x2 - headLen * Math.cos(angle + 0.4);
        const p2y = y2 - headLen * Math.sin(angle + 0.4);
        const head = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        head.setAttribute('points', `${x2},${y2} ${p1x},${p1y} ${p2x},${p2y}`);
        head.setAttribute('fill', color);
        g.appendChild(head);
      }
      svg.appendChild(g);
      layer.appendChild(svg);
      this.tempEl = svg;
      return;
    }
    if (el) svg.appendChild(el);
    layer.appendChild(svg);
    this.tempEl = svg;
  }

  _updateTempHighlight(layer, x1, y1, x2, y2, cw, ch) {
    if (this.tempEl) this.tempEl.remove();
    const r = normalizeRect(x1, y1, x2, y2);
    const el = document.createElement('div');
    el.style.cssText = `position:absolute;left:${r.x}px;top:${r.y}px;width:${Math.max(r.w, 1)}px;height:${Math.max(r.h, 1)}px;background:${this.am.activeColor};opacity:0.4;pointer-events:none;z-index:10;border-radius:2px;`;
    layer.appendChild(el);
    this.tempEl = el;
  }

  _openStickyModal(pageIndex, x, y) {
    const modal = document.getElementById('sticky-modal');
    const textarea = document.getElementById('sticky-text');
    modal.classList.remove('hidden');
    textarea.value = '';
    textarea.focus();

    const saveBtn = document.getElementById('sticky-save');
    const cancelBtn = document.getElementById('sticky-cancel');

    const cleanup = () => {
      modal.classList.add('hidden');
      saveBtn.replaceWith(saveBtn.cloneNode(true));
      cancelBtn.replaceWith(cancelBtn.cloneNode(true));
    };

    document.getElementById('sticky-save').addEventListener('click', () => {
      const text = textarea.value.trim();
      if (text) {
        this.am.add({
          id: generateId(), type: 'sticky', pageIndex, x, y,
          text, color: this.am.activeColor || '#FFC107',
        });
        this.am.rerenderPage(pageIndex);
      }
      cleanup();
    });

    document.getElementById('sticky-cancel').addEventListener('click', cleanup);
  }

  _placeStamp(pageIndex, x, y) {
    if (this.am.stampType === 'custom' && this.am.stampImageData) {
      this.am.add({
        id: generateId(), type: 'stamp', pageIndex, x, y,
        w: 0.15, h: 0.1,
        label: 'custom', imageData: this.am.stampImageData,
      });
    } else if (this.am.stampType) {
      this.am.add({
        id: generateId(), type: 'stamp', pageIndex, x, y,
        w: 0.12, h: 0.04,
        label: this.am.stampType,
      });
    }
    this.am.rerenderPage(pageIndex);
  }

  _placeTextbox(pageIndex, x, y) {
    this.am.add({
      id: generateId(), type: 'textbox', pageIndex, x, y,
      w: 0.25, h: 0.05,
      text: '输入文字',
      color: this.am.textboxColor,
      fontSize: this.am.textboxFontSize,
    });
    this.am.rerenderPage(pageIndex);
  }

  async _extractTextInRect(pageIndex, normRect) {
    if (!this.viewer.pdfDoc) return '';
    try {
      const pageNum = this.viewer.pageOrder[pageIndex];
      if (!pageNum) return '';
      const page = await this.viewer.pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1 });
      const textContent = await page.getTextContent();
      const items = textContent.items;
      if (!items || items.length === 0) return '';

      const rx = normRect.x;
      const ry = normRect.y;
      const rr = rx + normRect.w;
      const rb = ry + normRect.h;

      const hits = [];
      for (const item of items) {
        if (!item.str || !item.transform) continue;
        const tx = pdfjsLib.Util.transform(viewport.transform, item.transform);
        const itemX = tx[4] / viewport.width;
        const itemY = 1 - tx[5] / viewport.height;
        const itemW = Math.abs(item.width) / viewport.width;
        const itemH = Math.abs(tx[3]) / viewport.height;

        const overlapX = Math.min(itemX + itemW, rr) - Math.max(itemX, rx);
        const overlapY = Math.min(itemY + itemH, rb) - Math.max(itemY, ry);
        if (overlapX > 0 && overlapY > 0) {
          hits.push({ x: itemX, str: item.str });
        }
      }

      hits.sort((a, b) => a.x - b.x);
      return hits.map((h) => h.str).join('');
    } catch (e) {
      return '';
    }
  }
}
