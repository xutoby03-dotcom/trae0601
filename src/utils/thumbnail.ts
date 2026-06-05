import { EmailComponent } from '@/types/email';

const W = 120;
const H = 80;
const PAD = 4;
const COMP_H = 10;
const COMP_GAP = 2;
const MAX_COMPS = 5;

function escXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function compToSvgElement(comp: EmailComponent, y: number, maxW: number): string {
  const innerW = maxW - PAD * 2;
  const cx = PAD;

  switch (comp.type) {
    case 'heading': {
      const text = (comp.properties.text || '').substring(0, 10);
      const fs = Math.min(8, Math.max(5, innerW / 14));
      return `<text x="${cx + 2}" y="${y + 7}" font-size="${fs}" font-weight="bold" fill="${comp.properties.color || '#1a1a1a'}" font-family="Arial">${escXml(text)}</text>`;
    }
    case 'paragraph': {
      const text = (comp.properties.text || '').substring(0, 18);
      const fs = 5;
      return `<text x="${cx + 2}" y="${y + 6}" font-size="${fs}" fill="${comp.properties.color || '#333'}" font-family="Arial">${escXml(text)}</text>`;
    }
    case 'button': {
      const bw = Math.min(50, innerW * 0.5);
      const bh = 7;
      return `<rect x="${cx + (innerW - bw) / 2}" y="${y + 1}" width="${bw}" height="${bh}" rx="2" fill="${comp.properties.backgroundColor || '#3b82f6'}"/><text x="${cx + innerW / 2}" y="${y + 6}" font-size="4" fill="${comp.properties.color || '#fff'}" text-anchor="middle" font-family="Arial">${escXml((comp.properties.text || '').substring(0, 6))}</text>`;
    }
    case 'image': {
      return `<rect x="${cx}" y="${y}" width="${innerW}" height="${COMP_H}" rx="1" fill="#e5e7eb"/><text x="${cx + innerW / 2}" y="${y + 7}" font-size="4" fill="#9ca3af" text-anchor="middle" font-family="Arial">IMG</text>`;
    }
    case 'divider': {
      const lineColor = comp.properties.color || '#e5e7eb';
      return `<line x1="${cx}" y1="${y + COMP_H / 2}" x2="${cx + innerW}" y2="${y + COMP_H / 2}" stroke="${lineColor}" stroke-width="${comp.properties.thickness || 1}"/>`;
    }
    case 'spacer': {
      return '';
    }
    case 'two-column': {
      const colW = (innerW - 4) / 2;
      const left = comp.children?.[0] || [];
      const right = comp.children?.[1] || [];
      let svg = `<rect x="${cx}" y="${y}" width="${colW}" height="${COMP_H}" rx="1" fill="none" stroke="#d1d5db" stroke-dasharray="2"/>`;
      svg += `<rect x="${cx + colW + 4}" y="${y}" width="${colW}" height="${COMP_H}" rx="1" fill="none" stroke="#d1d5db" stroke-dasharray="2"/>`;
      if (left.length > 0) svg += `<text x="${cx + 2}" y="${y + 6}" font-size="4" fill="#6b7280" font-family="Arial">${escXml(left[0].properties.text || left[0].type).substring(0, 8)}</text>`;
      if (right.length > 0) svg += `<text x="${cx + colW + 6}" y="${y + 6}" font-size="4" fill="#6b7280" font-family="Arial">${escXml(right[0].properties.text || right[0].type).substring(0, 8)}</text>`;
      return svg;
    }
    case 'three-column': {
      const colW = (innerW - 8) / 3;
      const cols = comp.children || [[], [], []];
      let svg = '';
      for (let i = 0; i < 3; i++) {
        const xOff = cx + i * (colW + 4);
        svg += `<rect x="${xOff}" y="${y}" width="${colW}" height="${COMP_H}" rx="1" fill="none" stroke="#d1d5db" stroke-dasharray="2"/>`;
        if (cols[i]?.length > 0) svg += `<text x="${xOff + 2}" y="${y + 6}" font-size="3.5" fill="#6b7280" font-family="Arial">${escXml(cols[i][0].properties.text || cols[i][0].type).substring(0, 5)}</text>`;
      }
      return svg;
    }
    case 'social-icons': {
      const platforms = comp.properties.platforms || [];
      const icons = platforms.slice(0, 4).map((p: any) => p.icon || '●').join(' ');
      return `<text x="${cx + innerW / 2}" y="${y + 7}" font-size="6" text-anchor="middle" font-family="Arial">${escXml(icons)}</text>`;
    }
    case 'footer': {
      const text = (comp.properties.text || '').split('\n')[0].substring(0, 14);
      return `<text x="${cx + 2}" y="${y + 5}" font-size="4" fill="${comp.properties.color || '#999'}" font-family="Arial">${escXml(text)}</text>`;
    }
    default:
      return '';
  }
}

export function generateThumbnail(components: EmailComponent[], backgroundColor: string): string {
  let svgContent = '';
  let y = PAD;
  const innerW = W - PAD * 2;

  const takeComps = components.slice(0, MAX_COMPS);
  for (const comp of takeComps) {
    svgContent += compToSvgElement(comp, y, W);
    y += COMP_H + COMP_GAP;
  }

  if (components.length > MAX_COMPS) {
    svgContent += `<text x="${W / 2}" y="${y + 6}" font-size="4" fill="#9ca3af" text-anchor="middle" font-family="Arial">+${components.length - MAX_COMPS} more</text>`;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="${escXml(backgroundColor)}" rx="4"/><rect x="${PAD}" y="${PAD}" width="${innerW}" height="${H - PAD * 2}" rx="2" fill="#ffffff" opacity="0.9"/>${svgContent}</svg>`;

  return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
}
