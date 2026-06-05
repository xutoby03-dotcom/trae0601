export async function exportPDFWithAnnotations(viewer, annotations) {
  if (!viewer.pdfDoc) return;

  const PDFLib = await import('https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js');

  const srcData = await viewer.pdfDoc.getData();
  const srcDoc = await PDFLib.PDFDocument.load(srcData);
  const newDoc = await PDFLib.PDFDocument.create();

  for (let i = 0; i < viewer.pageOrder.length; i++) {
    const pageNum = viewer.pageOrder[i];
    const [copiedPage] = await newDoc.copyPages(srcDoc, [pageNum - 1]);
    newDoc.addPage(copiedPage);
  }

  const pageAnns = {};
  for (const ann of annotations) {
    const pi = ann.pageIndex;
    if (!pageAnns[pi]) pageAnns[pi] = [];
    pageAnns[pi].push(ann);
  }

  for (const [pi, anns] of Object.entries(pageAnns)) {
    const pageIdx = parseInt(pi);
    if (pageIdx >= newDoc.getPageCount()) continue;
    const page = newDoc.getPage(pageIdx);
    const { width, height } = page.getSize();

    for (const ann of anns) {
      try {
        if (ann.type === 'highlight') {
          page.drawRectangle({
            x: ann.rect.x * width,
            y: height - (ann.rect.y + ann.rect.h) * height,
            width: ann.rect.w * width,
            height: ann.rect.h * height,
            color: hexToRGB(ann.color, 0.3),
          });
        } else if (ann.type === 'underline' || ann.type === 'strikethrough') {
          const y = ann.type === 'underline'
            ? height - (ann.rect.y + ann.rect.h) * height
            : height - (ann.rect.y + ann.rect.h / 2) * height;
          page.drawLine({
            start: { x: ann.rect.x * width, y },
            end: { x: (ann.rect.x + ann.rect.w) * width, y },
            thickness: 2,
            color: hexToRGB(ann.color, 1),
          });
        } else if (ann.type === 'rect' || ann.type === 'ellipse') {
          if (ann.type === 'rect') {
            page.drawRectangle({
              x: ann.rect.x * width, y: height - (ann.rect.y + ann.rect.h) * height,
              width: ann.rect.w * width, height: ann.rect.h * height,
              borderColor: hexToRGB(ann.color, 1), borderWidth: ann.strokeWidth || 2,
            });
          } else {
            page.drawEllipse({
              x: (ann.rect.x + ann.rect.w / 2) * width,
              y: height - (ann.rect.y + ann.rect.h / 2) * height,
              xScale: ann.rect.w * width / 2, yScale: ann.rect.h * height / 2,
              borderColor: hexToRGB(ann.color, 1), borderWidth: ann.strokeWidth || 2,
            });
          }
        } else if (ann.type === 'line' || ann.type === 'arrow') {
          page.drawLine({
            start: { x: ann.rect.x * width, y: height - (ann.rect.y + ann.rect.h) * height },
            end: { x: (ann.rect.x + ann.rect.w) * width, y: height - ann.rect.y * height },
            thickness: ann.strokeWidth || 2,
            color: hexToRGB(ann.color, 1),
          });
        } else if (ann.type === 'textbox') {
          const font = await newDoc.embedFont(PDFLib.StandardFonts.Helvetica);
          page.drawText(ann.text, {
            x: ann.x * width, y: height - (ann.y * height + ann.fontSize),
            size: ann.fontSize || 14,
            font,
            color: hexToRGB(ann.color, 1),
          });
        } else if (ann.type === 'stamp') {
          if (ann.imageData) {
            const imageBytes = dataUrlToBytes(ann.imageData);
            const isJpg = !ann.imageData.includes('image/png');
            const embeddedImg = isJpg
              ? await newDoc.embedJpg(imageBytes)
              : await newDoc.embedPng(imageBytes);
            const imgW = embeddedImg.width;
            const imgH = embeddedImg.height;
            const drawW = ann.w ? ann.w * width : Math.min(imgW, width * 0.2);
            const drawH = ann.h ? ann.h * height : drawW * (imgH / imgW);
            page.drawImage(embeddedImg, {
              x: ann.x * width,
              y: height - ann.y * height - drawH,
              width: drawW,
              height: drawH,
            });
          } else if (ann.label) {
            const font = await newDoc.embedFont(PDFLib.StandardFonts.HelveticaBold);
            const fontSize = 18;
            const tw = font.widthOfTextAtSize(ann.label, fontSize);
            page.drawRectangle({
              x: ann.x * width, y: height - ann.y * height - fontSize - 8,
              width: tw + 20, height: fontSize + 12,
              color: hexToRGB('#888888', 0.8),
            });
            page.drawText(ann.label, {
              x: ann.x * width + 10, y: height - ann.y * height - fontSize - 2,
              size: fontSize, font, color: hexToRGB('#FFFFFF', 1),
            });
          }
        }
      } catch (e) { console.warn('Export annotation error:', e); }
    }
  }

  const pdfBytes = await newDoc.save();
  downloadBlob(pdfBytes, (viewer.fileName || 'document').replace(/\.pdf$/i, '') + '_annotated.pdf', 'application/pdf');
}

export function exportXFDF(annotations, fileName) {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<xfdf xmlns="http://ns.adobe.com/xfdf/" xml:space="preserve">\n  <annots>\n';
  for (const a of annotations) {
    if (a.type === 'highlight' || a.type === 'underline' || a.type === 'strikethrough') {
      xml += `    <${a.type} color="${a.color}" rect="${a.rect.x} ${a.rect.y} ${a.rect.x + a.rect.w} ${a.rect.y + a.rect.h}" page="${a.pageIndex}"/>\n`;
    } else if (a.type === 'sticky') {
      xml += `    <text color="${a.color}" rect="${a.x} ${a.y} ${a.x + 0.05} ${a.y + 0.05}" page="${a.pageIndex}"><contents>${(a.text || '').replace(/</g, '&lt;')}</contents></text>\n`;
    } else if (a.type === 'pen') {
      xml += `    <ink color="${a.color}" page="${a.pageIndex}"><inklist><gesture>${a.points.map((p) => p.x.toFixed(4) + ',' + p.y.toFixed(4)).join(';')}</gesture></inklist></ink>\n`;
    } else if (a.type === 'rect' || a.type === 'ellipse' || a.type === 'line' || a.type === 'arrow') {
      xml += `    <${a.type === 'arrow' ? 'line' : a.type} color="${a.color}" width="${a.strokeWidth}" rect="${a.rect.x} ${a.rect.y} ${a.rect.x + a.rect.w} ${a.rect.y + a.rect.h}" page="${a.pageIndex}"/>\n`;
    } else if (a.type === 'stamp') {
      xml += `    <stamp rect="${a.x} ${a.y} ${a.x + a.w} ${a.y + a.h}" page="${a.pageIndex}"><contents>${(a.label || '').replace(/</g, '&lt;')}</contents></stamp>\n`;
    } else if (a.type === 'textbox') {
      xml += `    <freetext color="${a.color}" rect="${a.x} ${a.y} ${a.x + a.w} ${a.y + a.h}" page="${a.pageIndex}"><contents>${(a.text || '').replace(/</g, '&lt;')}</contents></freetext>\n`;
    }
  }
  xml += '  </annots>\n</xfdf>';

  const blob = new Blob([xml], { type: 'application/vnd.adobe.xfdf' });
  downloadBlob(blob, (fileName || 'document').replace(/\.pdf$/i, '') + '.xfdf', 'application/vnd.adobe.xfdf');
}

function dataUrlToBytes(dataUrl) {
  const base64 = dataUrl.split(',')[1];
  const binaryStr = atob(base64);
  const bytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }
  return bytes;
}

function hexToRGB(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return { red: r, green: g, blue: b, alpha };
}

function downloadBlob(data, name, type) {
  const blob = data instanceof Blob ? data : new Blob([data], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url);
}
