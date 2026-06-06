import { Story } from './types';
import jsPDF from 'jspdf';

export async function exportToPDF(story: Story): Promise<void> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;

  doc.setFillColor(102, 126, 234);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(36);
  doc.text(story.title, pageWidth / 2, pageHeight / 2 - 20, { align: 'center' });
  
  doc.setFontSize(14);
  doc.text(`类型：${story.type}`, pageWidth / 2, pageHeight / 2 + 20, { align: 'center' });
  doc.text(`主人公：${story.protagonist.name}`, pageWidth / 2, pageHeight / 2 + 40, { align: 'center' });
  doc.text(`场景：${story.scene}`, pageWidth / 2, pageHeight / 2 + 60, { align: 'center' });
  
  const date = new Date(story.createdAt);
  doc.setFontSize(12);
  doc.text(`创建时间：${date.toLocaleDateString()}`, pageWidth / 2, pageHeight / 2 + 90, { align: 'center' });

  doc.addPage();
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(24);
  doc.text('目录', pageWidth / 2, 30, { align: 'center' });

  doc.setFontSize(14);
  let yPos = 60;
  story.paragraphs.forEach((_, index) => {
    doc.text(`第 ${index + 1} 章 ..................... ${index + 3}`, margin, yPos);
    yPos += 15;
  });

  doc.addPage();
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  yPos = margin;
  doc.setTextColor(0, 0, 0);

  story.paragraphs.forEach((paragraph, index) => {
    if (yPos > pageHeight - margin) {
      doc.addPage();
      yPos = margin;
    }

    doc.setFontSize(18);
    doc.text(`第 ${index + 1} 章`, margin, yPos);
    yPos += 12;

    doc.setFontSize(12);
    const lines = doc.splitTextToSize(paragraph.content, contentWidth);
    
    if (paragraph.type === 'dialogue' && paragraph.speaker) {
      doc.setTextColor(102, 126, 234);
      doc.text(`${paragraph.speaker}：`, margin, yPos);
      yPos += 8;
      doc.setTextColor(0, 0, 0);
    }

    lines.forEach((line: string) => {
      if (yPos > pageHeight - margin) {
        doc.addPage();
        yPos = margin;
      }
      doc.text(line, paragraph.type === 'dialogue' ? margin + 10 : margin, yPos);
      yPos += 7;
    });

    yPos += 10;
  });

  doc.save(`${story.title}.pdf`);
}

export async function exportToEPUB(story: Story): Promise<void> {
  const content = `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="pub-id">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:title>${story.title}</dc:title>
    <dc:creator>故事生成器</dc:creator>
    <dc:language>zh-CN</dc:language>
    <dc:identifier id="pub-id">${story.id}</dc:identifier>
  </metadata>
  <manifest>
    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
    <item id="title" href="title.xhtml" media-type="application/xhtml+xml"/>
    ${story.paragraphs.map((_, i) => `<item id="chapter${i+1}" href="chapter${i+1}.xhtml" media-type="application/xhtml+xml"/>`).join('\n    ')}
  </manifest>
  <spine>
    <itemref idref="title"/>
    <itemref idref="nav"/>
    ${story.paragraphs.map((_, i) => `<itemref idref="chapter${i+1}"/>`).join('\n    ')}
  </spine>
</package>`;

  const titlePage = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="zh-CN">
<head>
  <title>${story.title}</title>
  <style>
    body { text-align: center; padding-top: 30%; font-family: serif; }
    h1 { font-size: 2em; color: #333; }
    p { color: #666; }
  </style>
</head>
<body>
  <h1>${story.title}</h1>
  <p>类型：${story.type}</p>
  <p>主人公：${story.protagonist.name}</p>
  <p>场景：${story.scene}</p>
</body>
</html>`;

  const nav = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="zh-CN">
<head>
  <title>目录</title>
</head>
<body>
  <nav epub:type="toc" id="toc">
    <h1>目录</h1>
    <ol>
      ${story.paragraphs.map((_, i) => `<li><a href="chapter${i+1}.xhtml">第 ${i+1} 章</a></li>`).join('\n      ')}
    </ol>
  </nav>
</body>
</html>`;

  const chapters = story.paragraphs.map((p, i) => `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="zh-CN">
<head>
  <title>第 ${i+1} 章</title>
  <style>
    .dialogue { color: #667eea; font-style: italic; }
    .speaker { font-weight: bold; }
  </style>
</head>
<body>
  <h2>第 ${i+1} 章</h2>
  ${p.type === 'dialogue' && p.speaker 
    ? `<p class="dialogue"><span class="speaker">${p.speaker}：</span>${p.content}</p>`
    : `<p>${p.content}</p>`}
</body>
</html>`);

  const blob = new Blob([content, titlePage, nav, ...chapters], { type: 'application/epub+zip' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${story.title}.epub`;
  a.click();
  URL.revokeObjectURL(url);
}
