import type { ExportFormat } from '../types';
import { stripHtml } from './textAnalysis';

export function exportToMarkdown(html: string, title: string): string {
  let markdown = '';
  
  if (title) {
    markdown += `# ${title}\n\n`;
  }
  
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  
  function convertNode(node: Node): string {
    let result = '';
    
    if (node.nodeType === Node.TEXT_NODE) {
      result = node.textContent || '';
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const elem = node as HTMLElement;
      const tagName = elem.tagName.toLowerCase();
      
      switch (tagName) {
        case 'h1':
          result = `# ${elem.textContent}\n\n`;
          break;
        case 'h2':
          result = `## ${elem.textContent}\n\n`;
          break;
        case 'h3':
          result = `### ${elem.textContent}\n\n`;
          break;
        case 'h4':
          result = `#### ${elem.textContent}\n\n`;
          break;
        case 'h5':
          result = `##### ${elem.textContent}\n\n`;
          break;
        case 'h6':
          result = `###### ${elem.textContent}\n\n`;
          break;
        case 'p':
          result = `${elem.textContent}\n\n`;
          break;
        case 'strong':
        case 'b':
          result = `**${elem.textContent}**`;
          break;
        case 'em':
        case 'i':
          result = `*${elem.textContent}*`;
          break;
        case 'u':
          result = `<u>${elem.textContent}</u>`;
          break;
        case 'blockquote':
          const lines = elem.textContent?.split('\n') || [];
          result = lines.map(line => `> ${line}`).join('\n') + '\n\n';
          break;
        case 'ul':
          let ulResult = '';
          elem.querySelectorAll('li').forEach(li => {
            ulResult += `- ${li.textContent}\n`;
          });
          result = ulResult + '\n';
          break;
        case 'ol':
          let olResult = '';
          let index = 1;
          elem.querySelectorAll('li').forEach(li => {
            olResult += `${index}. ${li.textContent}\n`;
            index++;
          });
          result = olResult + '\n';
          break;
        case 'br':
          result = '\n';
          break;
        case 'hr':
          result = '---\n\n';
          break;
        default:
          let childResult = '';
          node.childNodes.forEach(child => {
            childResult += convertNode(child);
          });
          result = childResult;
      }
    }
    
    return result;
  }
  
  tempDiv.childNodes.forEach(child => {
    markdown += convertNode(child);
  });
  
  return markdown;
}

export async function exportToDocx(html: string, title: string): Promise<void> {
  const markdown = exportToMarkdown(html, title);
  const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${title || '文档'}.md`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadMarkdown(html: string, title: string): void {
  const markdown = exportToMarkdown(html, title);
  const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${title || '文档'}.md`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadHTML(html: string, title: string): void {
  const fullHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title || '文档'}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px 20px; line-height: 1.8; color: #333; }
    h1, h2, h3, h4, h5, h6 { color: #1a1a1a; margin-top: 1.5em; margin-bottom: 0.5em; }
    h1 { font-size: 2em; border-bottom: 2px solid #eee; padding-bottom: 0.3em; }
    h2 { font-size: 1.5em; border-bottom: 1px solid #eee; padding-bottom: 0.3em; }
    blockquote { border-left: 4px solid #ddd; margin: 1em 0; padding: 0.5em 1em; color: #666; background: #f9f9f9; }
    ul, ol { padding-left: 2em; }
    li { margin: 0.3em 0; }
    strong { font-weight: 600; }
    em { font-style: italic; }
    p { margin: 1em 0; }
  </style>
</head>
<body>
  ${html}
</body>
</html>`;
  
  const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${title || '文档'}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function exportToPDF(html: string, title: string): Promise<void> {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('请允许弹出窗口以导出PDF');
    return;
  }
  
  const fullHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>${title || '文档'}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px 20px; line-height: 1.8; color: #333; }
    h1, h2, h3, h4, h5, h6 { color: #1a1a1a; margin-top: 1.5em; margin-bottom: 0.5em; }
    h1 { font-size: 2em; border-bottom: 2px solid #eee; padding-bottom: 0.3em; }
    h2 { font-size: 1.5em; border-bottom: 1px solid #eee; padding-bottom: 0.3em; }
    blockquote { border-left: 4px solid #ddd; margin: 1em 0; padding: 0.5em 1em; color: #666; background: #f9f9f9; }
    ul, ol { padding-left: 2em; }
    li { margin: 0.3em 0; }
    strong { font-weight: 600; }
    em { font-style: italic; }
    p { margin: 1em 0; }
    @media print {
      body { padding: 20px; }
    }
  </style>
</head>
<body>
  ${html}
  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 500);
    };
  </script>
</body>
</html>`;
  
  printWindow.document.write(fullHtml);
  printWindow.document.close();
}

export async function exportDocument(
  format: ExportFormat,
  html: string,
  title: string
): Promise<void> {
  switch (format) {
    case 'markdown':
      downloadMarkdown(html, title);
      break;
    case 'docx':
      downloadHTML(html, title);
      break;
    case 'pdf':
      await exportToPDF(html, title);
      break;
  }
}

export function getFormatName(format: ExportFormat): string {
  const names: Record<ExportFormat, string> = {
    docx: 'Word 文档',
    markdown: 'Markdown',
    pdf: 'PDF'
  };
  return names[format];
}
