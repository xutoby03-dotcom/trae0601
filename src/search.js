const pdfjsLib = window.pdfjsLib;

export class SearchEngine {
  constructor(viewer) {
    this.viewer = viewer;
    this.results = [];
    this.currentIdx = -1;
    this.searchInput = document.getElementById('search-input');
    this.searchCount = document.getElementById('search-count');
  }

  async search(query) {
    this.clearHighlights();
    if (!query || !this.viewer.pdfDoc) {
      this.results = [];
      this.currentIdx = -1;
      this.searchCount.textContent = '0/0';
      return;
    }

    this.results = [];
    const q = query.toLowerCase();

    for (let i = 1; i <= this.viewer.pdfDoc.numPages; i++) {
      try {
        const page = await this.viewer.pdfDoc.getPage(i);
        const textContent = await page.getTextContent();
        const text = textContent.items.map((item) => item.str).join(' ').toLowerCase();
        let pos = 0;
        while ((pos = text.indexOf(q, pos)) !== -1) {
          this.results.push({ pageNum: i, pos, query });
          pos += q.length;
        }
      } catch (e) { continue; }
    }

    this.currentIdx = this.results.length > 0 ? 0 : -1;
    this.searchCount.textContent = `${this.currentIdx + 1}/${this.results.length}`;

    if (this.results.length > 0) {
      await this._highlightResults();
      this._goToCurrent();
    }
  }

  async _highlightResults() {
    const pagesContainer = this.viewer.pagesContainer;
    const grouped = {};
    for (let gi = 0; gi < this.results.length; gi++) {
      const r = this.results[gi];
      if (!grouped[r.pageNum]) grouped[r.pageNum] = [];
      grouped[r.pageNum].push({ hit: r, globalIdx: gi });
    }

    for (const [pageNum, entries] of Object.entries(grouped)) {
      const wrapper = pagesContainer.querySelector(`[data-page-num="${pageNum}"]`);
      if (!wrapper) continue;
      let layer = wrapper.querySelector('.search-highlight-layer');
      if (!layer) {
        layer = document.createElement('div');
        layer.className = 'search-highlight-layer';
        layer.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;';
        wrapper.appendChild(layer);
      }
      layer.innerHTML = '';

      try {
        const page = await this.viewer.pdfDoc.getPage(parseInt(pageNum));
        const textContent = await page.getTextContent();
        const viewport = page.getViewport({ scale: this.viewer.scale * 1.5 });
        const textItems = textContent.items;

        for (const entry of entries) {
          const hit = entry.hit;
          let charPos = 0;
          for (const item of textItems) {
            const itemText = item.str.toLowerCase();
            const nextCharPos = charPos + itemText.length + 1;
            if (charPos <= hit.pos && nextCharPos > hit.pos) {
              const tx = pdfjsLib.Util.transform(viewport.transform, item.transform);
              const el = document.createElement('div');
              el.className = 'search-highlight';
              el.dataset.resultIdx = entry.globalIdx;
              el.style.left = (tx[4] / 1.5) + 'px';
              el.style.top = ((tx[5] - Math.abs(tx[3])) / 1.5) + 'px';
              el.style.width = (Math.abs(item.width) * viewport.scale / 1.5) + 'px';
              el.style.height = (Math.abs(tx[3]) / 1.5) + 'px';
              layer.appendChild(el);
              break;
            }
            charPos = nextCharPos;
          }
        }
      } catch (e) { continue; }
    }
  }

  _goToCurrent() {
    if (this.currentIdx < 0 || this.currentIdx >= this.results.length) return;
    const hit = this.results[this.currentIdx];
    const pageIndex = this.viewer.pageOrder.indexOf(hit.pageNum);
    if (pageIndex >= 0) this.viewer.goToPage(pageIndex + 1);
    this.searchCount.textContent = `${this.currentIdx + 1}/${this.results.length}`;

    document.querySelectorAll('.search-highlight.current').forEach((el) => el.classList.remove('current'));
    const el = document.querySelector(`.search-highlight[data-result-idx="${this.currentIdx}"]`);
    if (el) {
      el.classList.add('current');
      el.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }

  next() {
    if (this.results.length === 0) return;
    this.currentIdx = (this.currentIdx + 1) % this.results.length;
    this._goToCurrent();
  }

  prev() {
    if (this.results.length === 0) return;
    this.currentIdx = (this.currentIdx - 1 + this.results.length) % this.results.length;
    this._goToCurrent();
  }

  clearHighlights() {
    document.querySelectorAll('.search-highlight-layer').forEach((el) => el.remove());
  }
}
