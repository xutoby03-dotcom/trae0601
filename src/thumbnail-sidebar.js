import { PDFViewer } from './pdf-viewer.js';

export class ThumbnailSidebar {
  constructor(viewer) {
    this.viewer = viewer;
    this.list = document.getElementById('thumbnail-list');
    this.previewEl = null;
    this.dragSrcIdx = null;
  }

  async render() {
    this.list.innerHTML = '';
    const v = this.viewer;
    if (!v.pdfDoc) return;

    for (let i = 0; i < v.pageOrder.length; i++) {
      const pageNum = v.pageOrder[i];
      const item = document.createElement('div');
      item.className = 'thumbnail-item' + (i === v.currentPage - 1 ? ' active' : '');
      item.dataset.index = i;
      item.draggable = true;

      const canvas = document.createElement('canvas');
      item.appendChild(canvas);

      const label = document.createElement('div');
      label.className = 'thumb-label';
      label.textContent = (i + 1);
      item.appendChild(label);

      const delBtn = document.createElement('button');
      delBtn.className = 'thumb-delete';
      delBtn.textContent = '×';
      delBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        v.removePage(i);
        this.render();
      });
      item.appendChild(delBtn);

      item.addEventListener('click', () => v.goToPage(i + 1));

      item.addEventListener('mouseenter', () => this._showPreview(pageNum, item));
      item.addEventListener('mouseleave', () => this._hidePreview());

      item.addEventListener('dragstart', (e) => {
        this.dragSrcIdx = i;
        item.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
      });
      item.addEventListener('dragend', () => {
        item.classList.remove('dragging');
        this.dragSrcIdx = null;
      });
      item.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
      });
      item.addEventListener('drop', (e) => {
        e.preventDefault();
        if (this.dragSrcIdx !== null && this.dragSrcIdx !== i) {
          v.movePage(this.dragSrcIdx, i);
          this.render();
        }
      });

      this.list.appendChild(item);

      try {
        await v.renderThumbnail(pageNum, canvas, 160);
      } catch (e) {
        canvas.width = 160;
        canvas.height = 220;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#eee';
        ctx.fillRect(0, 0, 160, 220);
        ctx.fillStyle = '#999';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('P' + pageNum, 80, 115);
      }
    }
  }

  updateActive(currentPage) {
    this.list.querySelectorAll('.thumbnail-item').forEach((item) => {
      const idx = parseInt(item.dataset.index);
      item.classList.toggle('active', idx === currentPage - 1);
    });
  }

  _showPreview(pageNum, anchorEl) {
    this._hidePreview();
    const preview = document.createElement('div');
    preview.className = 'thumbnail-preview';
    const canvas = document.createElement('canvas');
    preview.appendChild(canvas);
    document.body.appendChild(preview);
    this.previewEl = preview;

    const rect = anchorEl.getBoundingClientRect();
    preview.style.left = (rect.right + 8) + 'px';
    preview.style.top = rect.top + 'px';

    this.viewer.renderThumbnail(pageNum, canvas, 280).catch(() => {});
  }

  _hidePreview() {
    if (this.previewEl) {
      this.previewEl.remove();
      this.previewEl = null;
    }
  }
}
