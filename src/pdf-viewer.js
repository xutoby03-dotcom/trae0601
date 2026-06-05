import { generateId, toast, clamp } from './utils.js';
import { saveFile, getFile, saveAnnotations, getAnnotations } from './storage.js';

const pdfjsLib = window.pdfjsLib;
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

export class PDFViewer {
  constructor() {
    this.pdfDoc = null;
    this.currentPage = 1;
    this.totalPages = 0;
    this.scale = 1.0;
    this.pageOrder = [];
    this.pageRotations = {};
    this.fileName = '';
    this.fileId = null;
    this.renderedPages = new Map();
    this.renderTaskMap = new Map();

    this.viewport = document.getElementById('pdf-viewport');
    this.pagesContainer = document.getElementById('pages-container');
    this.pageInput = document.getElementById('page-input');
    this.totalPagesEl = document.getElementById('total-pages');
    this.zoomLevelEl = document.getElementById('zoom-level');
    this.fileNameEl = document.getElementById('file-name');

    this._initScroll();
    this._initNav();
  }

  _initScroll() {
    this.viewport.addEventListener('scroll', () => {
      const pageEls = this.pagesContainer.querySelectorAll('.page-wrapper');
      if (!pageEls.length) return;
      const vpTop = this.viewport.scrollTop + this.viewport.clientHeight / 3;
      let found = 1;
      pageEls.forEach((el, i) => {
        if (el.offsetTop <= vpTop) found = i + 1;
      });
      if (found !== this.currentPage) {
        this.currentPage = found;
        this.pageInput.value = found;
        this._onPageChange();
      }
    });

    this.viewport.addEventListener('wheel', (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        this.setScale(this.scale + delta);
      }
    }, { passive: false });
  }

  _initNav() {
    document.getElementById('btn-prev-page').addEventListener('click', () => this.goToPage(this.currentPage - 1));
    document.getElementById('btn-next-page').addEventListener('click', () => this.goToPage(this.currentPage + 1));
    this.pageInput.addEventListener('change', () => {
      const p = parseInt(this.pageInput.value);
      if (p >= 1 && p <= this.totalPages) this.goToPage(p);
      else this.pageInput.value = this.currentPage;
    });
    document.getElementById('btn-zoom-in').addEventListener('click', () => this.setScale(this.scale + 0.15));
    document.getElementById('btn-zoom-out').addEventListener('click', () => this.setScale(this.scale - 0.15));
  }

  _onPageChange() {
    if (this.onPageChange) this.onPageChange(this.currentPage);
  }

  async loadFromData(data, name) {
    this.fileName = name || '未命名.pdf';
    this.fileId = generateId();
    this.fileNameEl.textContent = this.fileName;

    const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(data) });
    this.pdfDoc = await loadingTask.promise;
    this.totalPages = this.pdfDoc.numPages;
    this.pageOrder = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    this.pageRotations = {};
    this.totalPagesEl.textContent = this.totalPages;
    this.currentPage = 1;
    this.pageInput.value = 1;
    this.scale = 1.0;
    this.zoomLevelEl.textContent = '100%';

    await saveFile(this.fileId, data, this.fileName);
    await this.renderAllPages();
    this._onPageChange();
  }

  async loadFromURL(url) {
    try {
      const resp = await fetch(url);
      if (!resp.ok) throw new Error('无法获取文件');
      const buf = await resp.arrayBuffer();
      const name = url.split('/').pop() || 'remote.pdf';
      await this.loadFromData(buf, name);
    } catch (err) {
      toast('加载 URL 失败: ' + err.message);
    }
  }

  async loadFromStorage(fileId) {
    const rec = await getFile(fileId);
    if (!rec) { toast('文件未找到'); return; }
    this.fileId = fileId;
    this.fileName = rec.name;
    this.fileNameEl.textContent = this.fileName;

    const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(rec.data) });
    this.pdfDoc = await loadingTask.promise;
    this.totalPages = this.pdfDoc.numPages;

    const saved = await getAnnotations(fileId);
    if (saved && saved.pageOrder) this.pageOrder = saved.pageOrder;
    else this.pageOrder = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    if (saved && saved.pageRotations) this.pageRotations = saved.pageRotations;
    else this.pageRotations = {};

    this.totalPagesEl.textContent = this.pageOrder.length;
    this.currentPage = 1;
    this.pageInput.value = 1;
    this.scale = 1.0;
    this.zoomLevelEl.textContent = '100%';

    await this.renderAllPages();
    this._onPageChange();
    return saved;
  }

  async renderAllPages() {
    this.pagesContainer.innerHTML = '';
    this.renderedPages.clear();
    this.cancelPendingRenders();

    for (let idx = 0; idx < this.pageOrder.length; idx++) {
      const pageNum = this.pageOrder[idx];
      const wrapper = document.createElement('div');
      wrapper.className = 'page-wrapper';
      wrapper.dataset.pageIndex = idx;
      wrapper.dataset.pageNum = pageNum;

      const canvas = document.createElement('canvas');
      wrapper.appendChild(canvas);

      const annoLayer = document.createElement('div');
      annoLayer.className = 'annotation-layer';
      wrapper.appendChild(annoLayer);

      this.pagesContainer.appendChild(wrapper);
      this.renderPage(pageNum, canvas, idx);
    }
  }

  cancelPendingRenders() {
    this.renderTaskMap.forEach((task) => {
      try { task.cancel(); } catch (e) {}
    });
    this.renderTaskMap.clear();
  }

  async renderPage(pageNum, canvas, pageIndex) {
    if (!this.pdfDoc) return;
    const page = await this.pdfDoc.getPage(pageNum);
    const rotation = this.pageRotations[pageNum] || 0;
    const viewport = page.getViewport({ scale: this.scale * 1.5, rotation });
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    canvas.style.width = (viewport.width / 1.5) + 'px';
    canvas.style.height = (viewport.height / 1.5) + 'px';

    const ctx = canvas.getContext('2d');
    const task = page.render({ canvasContext: ctx, viewport });
    this.renderTaskMap.set(pageIndex, task);
    try {
      await task.promise;
    } catch (e) {
      if (e.name !== 'RenderingCancelled') console.warn(e);
    } finally {
      this.renderTaskMap.delete(pageIndex);
    }
    this.renderedPages.set(pageIndex, true);
  }

  async rerenderAll() {
    this.cancelPendingRenders();
    const wrappers = this.pagesContainer.querySelectorAll('.page-wrapper');
    for (const wrapper of wrappers) {
      const idx = parseInt(wrapper.dataset.pageIndex);
      const pageNum = parseInt(wrapper.dataset.pageNum);
      const canvas = wrapper.querySelector('canvas');
      await this.renderPage(pageNum, canvas, idx);
      const annoLayer = wrapper.querySelector('.annotation-layer');
      if (annoLayer && this.onAnnotationsNeedRedraw) {
        this.onAnnotationsNeedRedraw(idx, annoLayer, canvas);
      }
    }
  }

  async renderThumbnail(pageNum, canvas, thumbW) {
    if (!this.pdfDoc) return;
    const page = await this.pdfDoc.getPage(pageNum);
    const vp = page.getViewport({ scale: 1 });
    const scale = thumbW / vp.width;
    const viewport = page.getViewport({ scale });
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');
    await page.render({ canvasContext: ctx, viewport }).promise;
  }

  goToPage(p) {
    p = clamp(p, 1, this.pageOrder.length);
    this.currentPage = p;
    this.pageInput.value = p;
    const wrapper = this.pagesContainer.querySelector(`[data-page-index="${p - 1}"]`);
    if (wrapper) {
      wrapper.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    this._onPageChange();
  }

  setScale(s) {
    s = clamp(s, 0.25, 5.0);
    this.scale = s;
    this.zoomLevelEl.textContent = Math.round(s * 100) + '%';
    this.rerenderAll();
  }

  async addBlankPage() {
    if (!this.pdfDoc) return;
    const newPageNum = this.pageOrder.length + 1;
    this.pageOrder.push(newPageNum);
    this.totalPages = this.pageOrder.length;
    this.totalPagesEl.textContent = this.totalPages;

    const wrapper = document.createElement('div');
    wrapper.className = 'page-wrapper';
    const idx = this.pageOrder.length - 1;
    wrapper.dataset.pageIndex = idx;
    wrapper.dataset.pageNum = newPageNum;
    const canvas = document.createElement('canvas');
    wrapper.appendChild(canvas);
    const annoLayer = document.createElement('div');
    annoLayer.className = 'annotation-layer';
    wrapper.appendChild(annoLayer);
    this.pagesContainer.appendChild(wrapper);

    canvas.width = Math.round(612 * this.scale * 1.5);
    canvas.height = Math.round(792 * this.scale * 1.5);
    canvas.style.width = Math.round(612 * this.scale) + 'px';
    canvas.style.height = Math.round(792 * this.scale) + 'px';
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    toast('已添加空白页');
    this._onPageChange();
  }

  removePage(pageIndex) {
    if (this.pageOrder.length <= 1) { toast('至少保留一页'); return; }
    this.pageOrder.splice(pageIndex, 1);
    this.totalPages = this.pageOrder.length;
    this.totalPagesEl.textContent = this.totalPages;
    if (this.currentPage > this.totalPages) this.currentPage = this.totalPages;
    this.pageInput.value = this.currentPage;
    this.renderAllPages();
    if (this.onAnnotationsNeedRedraw) {
      this.pagesContainer.querySelectorAll('.annotation-layer').forEach((l, i) => {
        this.onAnnotationsNeedRedraw(i, l, l.previousElementSibling);
      });
    }
    toast('已删除第 ' + (pageIndex + 1) + ' 页');
    this._onPageChange();
  }

  movePage(fromIdx, toIdx) {
    if (fromIdx === toIdx) return;
    const [item] = this.pageOrder.splice(fromIdx, 1);
    this.pageOrder.splice(toIdx, 0, item);
    this.renderAllPages();
    if (this.onAnnotationsNeedRedraw) {
      this.pagesContainer.querySelectorAll('.annotation-layer').forEach((l, i) => {
        this.onAnnotationsNeedRedraw(i, l, l.previousElementSibling);
      });
    }
    toast('页面已重排');
  }

  getPageWrapper(pageIndex) {
    return this.pagesContainer.querySelector(`[data-page-index="${pageIndex}"]`);
  }
}
