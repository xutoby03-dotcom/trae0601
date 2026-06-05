export class OutlineSidebar {
  constructor() {
    this.tree = document.getElementById('outline-tree');
    this.emptyMsg = document.getElementById('outline-empty');
  }

  async render(pdfDoc) {
    this.tree.innerHTML = '';
    if (!pdfDoc) { this.emptyMsg.classList.remove('hidden'); return; }

    let outline;
    try {
      outline = await pdfDoc.getOutline();
    } catch (e) { outline = null; }

    if (!outline || outline.length === 0) {
      this.emptyMsg.classList.remove('hidden');
      return;
    }
    this.emptyMsg.classList.add('hidden');

    const buildNode = (items) => {
      const frag = document.createDocumentFragment();
      for (const item of items) {
        const node = document.createElement('div');
        node.className = 'outline-node';

        const row = document.createElement('div');
        row.className = 'outline-item';

        const hasChildren = item.items && item.items.length > 0;
        if (hasChildren) {
          const toggle = document.createElement('span');
          toggle.className = 'toggle';
          toggle.textContent = '▼';
          toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const children = node.querySelector('.outline-children');
            if (children) children.classList.toggle('collapsed');
            toggle.textContent = children.classList.contains('collapsed') ? '▶' : '▼';
          });
          row.appendChild(toggle);
        } else {
          const spacer = document.createElement('span');
          spacer.className = 'toggle';
          spacer.textContent = '';
          row.appendChild(spacer);
        }

        const title = document.createElement('span');
        title.textContent = item.title;
        row.appendChild(title);

        row.addEventListener('click', () => this._navigateTo(item));
        node.appendChild(row);

        if (hasChildren) {
          const childrenEl = document.createElement('div');
          childrenEl.className = 'outline-children';
          childrenEl.appendChild(buildNode(item.items));
          node.appendChild(childrenEl);
        }

        frag.appendChild(node);
      }
      return frag;
    };

    this.tree.appendChild(buildNode(outline));
  }

  async _navigateTo(item) {
    if (!item.dest) return;
    const event = new CustomEvent('outline-navigate', {
      detail: { dest: item.dest },
      bubbles: true,
    });
    this.tree.dispatchEvent(event);
  }
}
