import { useState } from 'react';
import { useEmailStore } from '@/store/useEmailStore';
import { generateFullHtml } from '@/utils/exportHtml';
import { X, Copy, Check, Download } from 'lucide-react';

export default function ExportModal() {
  const { showExportModal, setShowExportModal, currentTemplate, variables, showVariables } = useEmailStore();
  const [copied, setCopied] = useState(false);

  if (!showExportModal) return null;

  const html = generateFullHtml(currentTemplate.components, currentTemplate.backgroundColor, variables, showVariables);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(html);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const safeName = (currentTemplate.name || 'untitled').replace(/[\\/:*?"<>|]/g, '_');
    a.href = url;
    a.download = safeName.endsWith('.html') ? safeName : safeName + '.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowExportModal(false)}>
      <div className="bg-[#1a1d23] rounded-xl shadow-2xl w-[720px] max-h-[80vh] flex flex-col border border-[#2a2d35]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#2a2d35]">
          <h3 className="text-sm font-semibold text-white">导出 HTML</h3>
          <button onClick={() => setShowExportModal(false)} className="text-gray-400 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-auto p-4">
          <pre className="bg-[#0d0f12] rounded-lg p-4 text-xs text-green-400 font-mono overflow-auto max-h-[55vh] whitespace-pre-wrap break-all leading-relaxed border border-[#1a1d23]">
            {html}
          </pre>
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-[#2a2d35]">
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-all"
          >
            <Download size={14} /> 下载 HTML 文件
          </button>
          <button
            onClick={handleCopy}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              copied ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
            }`}
          >
            {copied ? <><Check size={14} /> 已复制</> : <><Copy size={14} /> 复制代码</>}
          </button>
        </div>
      </div>
    </div>
  );
}
