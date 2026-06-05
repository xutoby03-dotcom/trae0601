import { PDFViewer } from './pdf-viewer.js';
import { ThumbnailSidebar } from './thumbnail-sidebar.js';
import { OutlineSidebar } from './outline-sidebar.js';
import { AnnotationManager } from './annotation-layer.js';
import { ToolHandler } from './tools.js';
import { SearchEngine } from './search.js';
import { exportPDFWithAnnotations, exportXFDF } from './export.js';
import { saveAnnotations, getAnnotations, listFiles, deleteFile } from './storage.js';
import { toast, generateId } from './utils.js';

class App {
  constructor() {
    this.viewer = new PDFViewer();
    this.thumbnails = new ThumbnailSidebar(this.viewer);
    this.outline = new OutlineSidebar();
    this.annoManager = new AnnotationManager();
    this.tools = new ToolHandler(this.annoManager, this.viewer);
    this.search = new SearchEngine(this.viewer);
    this.darkMode = false;
    this.saveTimer = null;

    this._wireEvents();
    this._initDragDrop();
    this._initKeyboard();
  }

  _wireEvents() {
    this.viewer.onPageChange = (page) => {
      this.thumbnails.updateActive(page);
      this._renderPageAnnotations();
    };

    this.viewer.onAnnotationsNeedRedraw = (idx, layer, canvas) => {
      this.annoManager.renderAnnotations(idx, layer, canvas);
    };

    this.annoManager.onRerenderPage = (pageIndex) => {
      const wrapper = this.viewer.getPageWrapper(pageIndex);
      if (wrapper) {
        const layer = wrapper.querySelector('.annotation-layer');
        const canvas = wrapper.querySelector('canvas');
        this.annoManager.renderAnnotations(pageIndex, layer, canvas);
      }
      this._scheduleSave();
    };

    document.getElementById('outline-tree').addEventListener('outline-navigate', async (e) => {
      const dest = e.detail.dest;
      if (!this.viewer.pdfDoc || !dest) return;
      try {
        let destArray;
        if (typeof dest === 'string') {
          destArray = await this.viewer.pdfDoc.getDestination(dest);
        } else {
          destArray = dest;
        }
        if (destArray && destArray[0]) {
          const pageIdx = await this.viewer.pdfDoc.getPageIndex(destArray[0]);
          this.viewer.goToPage(pageIdx + 1);
        }
      } catch (err) { console.warn('Outline navigation error:', err); }
    });

    document.getElementById('btn-open').addEventListener('click', () => {
      document.getElementById('file-input').click();
    });
    document.getElementById('file-input').addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (file) await this._loadFile(file);
      e.target.value = '';
    });

    document.getElementById('btn-add-blank').addEventListener('click', async () => {
      await this.viewer.addBlankPage();
      await this.thumbnails.render();
      this.tools.show();
      this._scheduleSave();
    });

    document.getElementById('btn-insert-image').addEventListener('click', () => {
      document.getElementById('image-input').click();
    });
    document.getElementById('image-input').addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      await this._insertImageAsPage(file);
      e.target.value = '';
    });

    document.getElementById('btn-export-pdf').addEventListener('click', () => {
      if (!this.viewer.pdfDoc) { toast('请先打开 PDF'); return; }
      exportPDFWithAnnotations(this.viewer, this.annoManager.getAll());
      toast('正在导出 PDF...');
    });

    document.getElementById('btn-export-xfdf').addEventListener('click', () => {
      if (!this.viewer.pdfDoc) { toast('请先打开 PDF'); return; }
      exportXFDF(this.annoManager.getAll(), this.viewer.fileName);
      toast('正在导出 XFDF...');
    });

    document.getElementById('btn-search').addEventListener('click', () => {
      const bar = document.getElementById('search-bar');
      bar.classList.toggle('hidden');
      if (!bar.classList.contains('hidden')) {
        document.getElementById('search-input').focus();
      } else {
        this.search.clearHighlights();
      }
    });

    let searchDebounce;
    document.getElementById('search-input').addEventListener('input', (e) => {
      clearTimeout(searchDebounce);
      searchDebounce = setTimeout(() => this.search.search(e.target.value), 400);
    });
    document.getElementById('search-prev').addEventListener('click', () => this.search.prev());
    document.getElementById('search-next').addEventListener('click', () => this.search.next());
    document.getElementById('search-close').addEventListener('click', () => {
      document.getElementById('search-bar').classList.add('hidden');
      this.search.clearHighlights();
    });

    document.getElementById('btn-dark').addEventListener('click', () => this._toggleDarkMode());

    document.getElementById('btn-undo').addEventListener('click', () => {
      if (this.annoManager.undo()) {
        this._renderAllAnnotations();
        this._scheduleSave();
        this._refreshAnnotationList();
        toast('已撤销');
      }
    });

    document.addEventListener('annotations:changed', () => {
      this._refreshAnnotationList();
    });
  }

  _initDragDrop() {
    const viewport = document.getElementById('pdf-viewport');
    const overlay = document.getElementById('drop-overlay');

    let dragCounter = 0;
    viewport.addEventListener('dragenter', (e) => {
      e.preventDefault();
      dragCounter++;
      overlay.classList.remove('hidden');
    });
    viewport.addEventListener('dragleave', (e) => {
      e.preventDefault();
      dragCounter--;
      if (dragCounter <= 0) { overlay.classList.add('hidden'); dragCounter = 0; }
    });
    viewport.addEventListener('dragover', (e) => e.preventDefault());
    viewport.addEventListener('drop', async (e) => {
      e.preventDefault();
      dragCounter = 0;
      overlay.classList.add('hidden');

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        const file = files[0];
        if (file.type === 'application/pdf') {
          await this._loadFile(file);
        } else if (file.type.startsWith('image/')) {
          await this._insertImageAsPage(file);
        } else {
          toast('请拖入 PDF 或图片文件');
        }
      }

      const url = e.dataTransfer.getData('text/uri-list') || e.dataTransfer.getData('text/plain');
      if (url && url.startsWith('http')) {
        await this.viewer.loadFromURL(url);
        this._onPDFLoaded();
      }
    });

    document.body.addEventListener('paste', async (e) => {
      const text = e.clipboardData.getData('text/plain');
      if (text && text.startsWith('http') && text.toLowerCase().endsWith('.pdf')) {
        e.preventDefault();
        await this.viewer.loadFromURL(text);
        this._onPDFLoaded();
      }
    });
  }

  _initKeyboard() {
    document.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.contentEditable === 'true') return;

      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        this.viewer.goToPage(this.viewer.currentPage - 1);
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        this.viewer.goToPage(this.viewer.currentPage + 1);
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        const bar = document.getElementById('search-bar');
        bar.classList.remove('hidden');
        document.getElementById('search-input').focus();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (this.annoManager.undo()) {
          this._renderAllAnnotations();
          this._scheduleSave();
          this._refreshAnnotationList();
          toast('已撤销');
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
        e.preventDefault();
        document.getElementById('file-input').click();
      } else if (e.key === 'Escape') {
        this.annoManager.activeTool = null;
        document.querySelectorAll('.tool-btn').forEach((b) => b.classList.remove('active'));
        document.querySelectorAll('.annotation-layer').forEach((l) => l.classList.remove('interactive'));
        this.tools._hideAllOptions();
        document.getElementById('search-bar').classList.add('hidden');
        this.search.clearHighlights();
      }
    });
  }

  async _loadFile(file) {
    const buf = await file.arrayBuffer();
    await this.viewer.loadFromData(buf, file.name);
    await this._onPDFLoaded();
    await this._refreshFileList();
  }

  async _onPDFLoaded() {
    const saved = this.viewer.fileId ? await getAnnotations(this.viewer.fileId) : null;
    if (saved && saved.annotations) {
      this.annoManager.fromJSON(saved.annotations);
    } else {
      this.annoManager.fromJSON([]);
    }

    await this.thumbnails.render();
    await this.outline.render(this.viewer.pdfDoc);
    this.tools.show();
    this._renderAllAnnotations();
    this._refreshAnnotationList();
    toast('PDF 已加载: ' + this.viewer.fileName);
  }

  async _insertImageAsPage(file) {
    if (!this.viewer.pdfDoc) {
      toast('请先打开一个 PDF');
      return;
    }
    const reader = new FileReader();
    reader.onload = async (e) => {
      const img = new Image();
      img.onload = async () => {
        const newPageNum = this.viewer.pageOrder.length + 1;
        this.viewer.pageOrder.push(newPageNum);
        this.viewer.totalPages = this.viewer.pageOrder.length;
        this.viewer.totalPagesEl.textContent = this.viewer.totalPages;

        const idx = this.viewer.pageOrder.length - 1;
        const wrapper = document.createElement('div');
        wrapper.className = 'page-wrapper';
        wrapper.dataset.pageIndex = idx;
        wrapper.dataset.pageNum = newPageNum;

        const canvas = document.createElement('canvas');
        const maxW = 612 * this.viewer.scale * 1.5;
        const scale = maxW / img.width;
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.style.width = Math.round(canvas.width / 1.5) + 'px';
        canvas.style.height = Math.round(canvas.height / 1.5) + 'px';
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        wrapper.appendChild(canvas);
        const annoLayer = document.createElement('div');
        annoLayer.className = 'annotation-layer';
        wrapper.appendChild(annoLayer);
        this.viewer.pagesContainer.appendChild(wrapper);

        await this.thumbnails.render();
        this.tools.show();
        toast('已插入图片页面');
        this._scheduleSave();
        await this._refreshFileList();
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  _renderPageAnnotations() {
    const wrappers = this.viewer.pagesContainer.querySelectorAll('.page-wrapper');
    wrappers.forEach((wrapper) => {
      const idx = parseInt(wrapper.dataset.pageIndex);
      const layer = wrapper.querySelector('.annotation-layer');
      const canvas = wrapper.querySelector('canvas');
      if (layer && canvas) {
        this.annoManager.renderAnnotations(idx, layer, canvas);
      }
    });
  }

  _renderAllAnnotations() {
    this._renderPageAnnotations();
  }

  _refreshAnnotationList() {
    const container = document.getElementById('annotation-list');
    const emptyMsg = document.getElementById('annotation-list-empty');
    container.innerHTML = '';

    const annotations = this.annoManager.getAll();
    if (annotations.length === 0) {
      emptyMsg.classList.remove('hidden');
      return;
    }
    emptyMsg.classList.add('hidden');

    const grouped = {};
    for (const ann of annotations) {
      const key = ann.pageIndex;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(ann);
    }

    const sortedPages = Object.keys(grouped).sort((a, b) => a - b);

    for (const pageIdx of sortedPages) {
      const header = document.createElement('div');
      header.className = 'anno-group-header';
      header.textContent = '第 ' + (parseInt(pageIdx) + 1) + ' 页';
      container.appendChild(header);

      for (const ann of grouped[pageIdx]) {
        const item = document.createElement('div');
        item.className = 'anno-list-item';

        const icon = document.createElement('span');
        icon.className = 'anno-icon ' + ann.type;
        const iconChars = {
          highlight: 'H', underline: 'U', strikethrough: 'S',
          sticky: '📌', pen: '✏', rect: '▭', ellipse: '◯',
          line: '╱', arrow: '→', stamp: '🔒', textbox: 'T',
        };
        icon.textContent = iconChars[ann.type] || '?';
        item.appendChild(icon);

        const summary = document.createElement('span');
        summary.className = 'anno-summary';
        summary.textContent = this._getAnnoSummary(ann);
        item.appendChild(summary);

        item.addEventListener('click', () => {
          this.viewer.goToPage(parseInt(pageIdx) + 1);
          setTimeout(() => this._flashAnnotation(ann.id, pageIdx), 300);
        });

        container.appendChild(item);
      }
    }
  }

  _getAnnoSummary(ann) {
    const trunc = (s, n) => s.length > n ? s.slice(0, n) + '…' : s;
    switch (ann.type) {
      case 'highlight': case 'underline': case 'strikethrough':
        if (ann.text) return trunc(ann.text.replace(/\n/g, ' '), 20);
        return ann.rect ? `选中区域 ${(ann.rect.x * 100).toFixed(0)}%,${(ann.rect.y * 100).toFixed(0)}%` : '';
      case 'sticky':
        return ann.text ? trunc(ann.text.replace(/\n/g, ' '), 20) : '便签';
      case 'pen':
        return `画笔 @${ann.points && ann.points[0] ? (ann.points[0].x * 100).toFixed(0) + '%,' + (ann.points[0].y * 100).toFixed(0) + '%' : ''}`;
      case 'rect': case 'ellipse': case 'line': case 'arrow':
        return `${ann.type} @${ann.rect ? (ann.rect.x * 100).toFixed(0) + '%,' + (ann.rect.y * 100).toFixed(0) + '%' : ''}`;
      case 'stamp':
        return ann.label === 'custom' ? '自定义图章' : (ann.label || '图章');
      case 'textbox':
        return ann.text ? trunc(ann.text.replace(/\n/g, ' '), 20) : '文字框';
      default:
        return ann.type;
    }
  }

  _flashAnnotation(annoId, pageIdx) {
    const wrapper = this.viewer.getPageWrapper(parseInt(pageIdx));
    if (!wrapper) return;
    const el = wrapper.querySelector(`[data-anno-id="${annoId}"]`);
    if (!el) return;
    el.classList.remove('anno-flash');
    void el.offsetWidth;
    el.classList.add('anno-flash');
    setTimeout(() => el.classList.remove('anno-flash'), 1500);
  }

  _toggleDarkMode() {
    this.darkMode = !this.darkMode;
    document.body.classList.toggle('dark', this.darkMode);
    const btn = document.getElementById('btn-dark');
    btn.title = this.darkMode ? '浅色模式' : '深色模式';
    toast(this.darkMode ? '已切换深色模式' : '已切换浅色模式');
  }

  _scheduleSave() {
    clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => this._save(), 1000);
  }

  async _save() {
    if (!this.viewer.fileId) return;
    try {
      await saveAnnotations(
        this.viewer.fileId,
        this.annoManager.toJSON(),
        this.viewer.pageOrder,
        this.viewer.pageRotations
      );
    } catch (e) {
      console.warn('Save error:', e);
    }
  }

  async _refreshFileList() {
    const container = document.getElementById('file-list');
    container.innerHTML = '';
    let files;
    try {
      files = await listFiles();
    } catch (e) { return; }
    files.sort((a, b) => b.lastOpened - a.lastOpened);

    for (const f of files) {
      const item = document.createElement('div');
      item.className = 'file-list-item' + (f.id === this.viewer.fileId ? ' active' : '');

      const nameEl = document.createElement('span');
      nameEl.className = 'file-list-name';
      nameEl.textContent = f.name || '未命名';
      nameEl.title = f.name || '未命名';
      item.appendChild(nameEl);

      const delBtn = document.createElement('button');
      delBtn.className = 'file-list-delete';
      delBtn.textContent = '×';
      delBtn.title = '删除';
      delBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        await deleteFile(f.id);
        if (f.id === this.viewer.fileId) {
          this.viewer.pdfDoc = null;
          this.viewer.pagesContainer.innerHTML = '';
          this.viewer.fileId = null;
          this.viewer.fileNameEl.textContent = '未打开文件';
          this.viewer.totalPagesEl.textContent = '0';
          this.annoManager.fromJSON([]);
        }
        toast('已删除: ' + (f.name || '未命名'));
        await this._refreshFileList();
      });
      item.appendChild(delBtn);

      item.addEventListener('click', async () => {
        if (f.id === this.viewer.fileId) return;
        try {
          await this.viewer.loadFromStorage(f.id);
          await this._onPDFLoaded();
          await this._refreshFileList();
        } catch (e) {
          console.warn('Switch file error:', e);
          toast('切换文件失败');
        }
      });

      container.appendChild(item);
    }
  }
}

const app = new App();

(async () => {
  await app._refreshFileList();
  const files = await listFiles();
  if (files.length > 0) {
    const latest = files.sort((a, b) => b.lastOpened - a.lastOpened)[0];
    try {
      await app.viewer.loadFromStorage(latest.id);
      await app._onPDFLoaded();
      await app._refreshFileList();
    } catch (e) {
      console.warn('Failed to load last file:', e);
    }
  }
})();
