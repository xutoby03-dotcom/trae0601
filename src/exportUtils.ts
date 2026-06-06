import { Story } from './types';
import jsPDF from 'jspdf';
import JSZip from 'jszip';

const FONT_NAME = 'NotoSansSC';
const FONT_CDN_URL = 'https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-sc@5.0.18/files/noto-sans-sc-chinese-simplified-400-normal.ttf';

async function loadChineseFont(doc: jsPDF): Promise<boolean> {
  try {
    const response = await fetch(FONT_CDN_URL);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const buffer = await response.arrayBuffer();
    const base64 = btoa(
      new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
    );

    doc.addFileToVFS(`${FONT_NAME}.ttf`, base64);
    doc.addFont(`${FONT_NAME}.ttf`, FONT_NAME, 'normal');
    doc.setFont(FONT_NAME);

    return true;
  } catch (e) {
    const msg = `中文字体加载失败: ${e instanceof Error ? e.message : String(e)}，PDF 中文将显示为方块。请检查网络连接后重试。`;
    alert(msg);
    console.warn(msg);
    return false;
  }
}

export async function exportToPDF(story: Story): Promise<void> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;

  const hasChineseFont = await loadChineseFont(doc);

  // ========== 封面页 ==========
  doc.setFillColor(102, 126, 234);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(36);
  if (hasChineseFont) doc.setFont(FONT_NAME);
  doc.text(story.title, pageWidth / 2, pageHeight / 2 - 20, { align: 'center' });
  
  doc.setFontSize(14);
  if (hasChineseFont) doc.setFont(FONT_NAME);
  doc.text(`类型：${story.type}`, pageWidth / 2, pageHeight / 2 + 20, { align: 'center' });
  doc.text(`主人公：${story.protagonist.name}`, pageWidth / 2, pageHeight / 2 + 40, { align: 'center' });
  doc.text(`场景：${story.scene}`, pageWidth / 2, pageHeight / 2 + 60, { align: 'center' });
  
  const date = new Date(story.createdAt);
  doc.setFontSize(12);
  if (hasChineseFont) doc.setFont(FONT_NAME);
  doc.text(`创建时间：${date.toLocaleDateString()}`, pageWidth / 2, pageHeight / 2 + 90, { align: 'center' });

  // ========== 目录页 ==========
  doc.addPage();
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(24);
  if (hasChineseFont) doc.setFont(FONT_NAME);
  doc.text('目录', pageWidth / 2, 30, { align: 'center' });

  doc.setFontSize(14);
  if (hasChineseFont) doc.setFont(FONT_NAME);
  let yPos = 60;
  story.paragraphs.forEach((_, index) => {
    const chapterNum = index + 1;
    const pageNum = index + 3;
    const dots = '.'.repeat(Math.max(0, 30 - String(chapterNum).length - String(pageNum).length));
    doc.text(`第 ${chapterNum} 章 ${dots} ${pageNum}`, margin, yPos);
    yPos += 15;
  });

  // ========== 章节内容 ==========
  doc.addPage();
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  yPos = margin;
  doc.setTextColor(0, 0, 0);

  story.paragraphs.forEach((paragraph, index) => {
    if (yPos > pageHeight - margin) {
      doc.addPage();
      yPos = margin;
      if (hasChineseFont) doc.setFont(FONT_NAME);
    }

    doc.setFontSize(18);
    if (hasChineseFont) doc.setFont(FONT_NAME);
    doc.text(`第 ${index + 1} 章`, margin, yPos);
    yPos += 12;

    doc.setFontSize(12);
    if (hasChineseFont) doc.setFont(FONT_NAME);
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
        if (hasChineseFont) doc.setFont(FONT_NAME);
      }
      doc.text(line, paragraph.type === 'dialogue' ? margin + 10 : margin, yPos);
      yPos += 7;
    });

    yPos += 10;
  });

  doc.save(`${story.title}.pdf`);
}

export async function exportToEPUB(story: Story): Promise<void> {
  const zip = new JSZip();

  // 1. mimetype 文件（必须不压缩，放在最前面）
  zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' });

  // 2. META-INF/container.xml
  zip.file('META-INF/container.xml', `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`);

  // 3. OEBPS 目录下的文件
  const oebps = zip.folder('OEBPS');
  if (!oebps) throw new Error('无法创建 OEBPS 目录');

  // content.opf
  const contentOpf = `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="pub-id">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:title>${story.title}</dc:title>
    <dc:creator>故事生成器</dc:creator>
    <dc:language>zh-CN</dc:language>
    <dc:identifier id="pub-id">${story.id}</dc:identifier>
    <meta property="dcterms:modified">${new Date().toISOString().slice(0, 19) + 'Z'}</meta>
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
  oebps.file('content.opf', contentOpf);

  // title.xhtml - 封面页
  const titlePage = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="zh-CN">
<head>
  <meta charset="UTF-8"/>
  <title>${story.title}</title>
  <style type="text/css">
    body { text-align: center; padding-top: 30%; font-family: "Noto Sans SC", sans-serif; }
    h1 { font-size: 2em; color: #333; margin-bottom: 1em; }
    p { color: #666; margin: 0.5em 0; }
  </style>
</head>
<body>
  <h1>${story.title}</h1>
  <p>类型：${story.type}</p>
  <p>主人公：${story.protagonist.name}</p>
  <p>场景：${story.scene}</p>
  <p style="margin-top: 2em; font-size: 0.9em;">由故事生成器创作</p>
</body>
</html>`;
  oebps.file('title.xhtml', titlePage);

  // nav.xhtml - 导航/目录
  const nav = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="zh-CN">
<head>
  <meta charset="UTF-8"/>
  <title>目录</title>
  <style type="text/css">
    body { font-family: "Noto Sans SC", sans-serif; padding: 1em; }
    h1 { font-size: 1.5em; margin-bottom: 1em; }
    ol { list-style-type: none; padding-left: 0; }
    li { margin: 0.5em 0; }
    a { color: #667eea; text-decoration: none; }
  </style>
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
  oebps.file('nav.xhtml', nav);

  // 各章节 xhtml
  story.paragraphs.forEach((p, i) => {
    const chapter = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="zh-CN">
<head>
  <meta charset="UTF-8"/>
  <title>第 ${i+1} 章</title>
  <style type="text/css">
    body { font-family: "Noto Sans SC", sans-serif; line-height: 1.8; padding: 1em; }
    h2 { font-size: 1.3em; margin-bottom: 1em; color: #333; }
    .dialogue { color: #667eea; margin: 0.5em 0; }
    .speaker { font-weight: bold; }
    p { text-indent: 2em; margin: 0.5em 0; }
  </style>
</head>
<body>
  <h2>第 ${i+1} 章</h2>
  ${p.type === 'dialogue' && p.speaker 
    ? `<p class="dialogue"><span class="speaker">${p.speaker}：</span>${p.content}</p>`
    : `<p>${p.content}</p>`}
</body>
</html>`;
    oebps.file(`chapter${i+1}.xhtml`, chapter);
  });

  // 生成 zip 并下载
  const blob = await zip.generateAsync({
    type: 'blob',
    mimeType: 'application/epub+zip',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 }
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${story.title}.epub`;
  a.click();
  URL.revokeObjectURL(url);
}
