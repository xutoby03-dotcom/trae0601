import { useEmailStore } from '@/store/useEmailStore';
import {
  Monitor, Smartphone, Moon, Sun, Undo2, Redo2, Download, Send,
  LayoutTemplate, FolderOpen, Variable, FileText
} from 'lucide-react';
import { PreviewMode } from '@/types/email';

export default function Toolbar() {
  const {
    previewMode, setPreviewMode, undo, redo, historyIndex, history,
    showVariables, toggleVariables,
    setShowExportModal, setShowSendModal, setShowTemplateLibrary, setShowSavedList,
    currentTemplate, setTemplateName, saveCurrentTemplate, newTemplate,
  } = useEmailStore();

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const previewModes: { mode: PreviewMode; icon: React.ReactNode; label: string }[] = [
    { mode: 'desktop', icon: <Monitor size={16} />, label: '桌面' },
    { mode: 'mobile', icon: <Smartphone size={16} />, label: '手机' },
    { mode: 'dark', icon: <Moon size={16} />, label: '暗黑' },
  ];

  return (
    <div className="h-12 bg-[#1a1d23] border-b border-[#2a2d35] flex items-center px-4 gap-1 shrink-0 z-50">
      <div className="flex items-center gap-2 mr-4">
        <FileText size={20} className="text-blue-400" />
        <input
          value={currentTemplate.name}
          onChange={(e) => setTemplateName(e.target.value)}
          className="bg-transparent text-white text-sm font-medium border-none outline-none w-36 px-1 py-0.5 rounded hover:bg-white/5 focus:bg-white/10 transition-colors"
        />
      </div>

      <div className="flex items-center bg-[#0d0f12] rounded-lg p-0.5 gap-0.5">
        {previewModes.map(({ mode, icon, label }) => (
          <button
            key={mode}
            onClick={() => setPreviewMode(mode)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
              previewMode === mode
                ? 'bg-blue-500 text-white shadow-sm'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {icon}
            {label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-1 ml-4">
        <button
          onClick={undo}
          disabled={!canUndo}
          className={`p-1.5 rounded-md transition-colors ${canUndo ? 'text-gray-400 hover:text-white hover:bg-white/10' : 'text-gray-600 cursor-not-allowed'}`}
          title="撤销"
        >
          <Undo2 size={16} />
        </button>
        <button
          onClick={redo}
          disabled={!canRedo}
          className={`p-1.5 rounded-md transition-colors ${canRedo ? 'text-gray-400 hover:text-white hover:bg-white/10' : 'text-gray-600 cursor-not-allowed'}`}
          title="重做"
        >
          <Redo2 size={16} />
        </button>
      </div>

      <button
        onClick={toggleVariables}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ml-3 transition-colors ${
          showVariables ? 'bg-amber-500/20 text-amber-400' : 'text-gray-400 hover:text-white hover:bg-white/10'
        }`}
        title="变量预览"
      >
        <Variable size={14} />
        变量
      </button>

      <div className="flex-1" />

      <button
        onClick={() => setShowTemplateLibrary(true)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
      >
        <LayoutTemplate size={14} />
        模板库
      </button>

      <button
        onClick={() => setShowSavedList(true)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
      >
        <FolderOpen size={14} />
        已保存
      </button>

      <button
        onClick={newTemplate}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-gray-400 hover:text-white hover:bg-white/10 transition-colors ml-1"
      >
        新建
      </button>

      <div className="w-px h-5 bg-[#2a2d35] mx-2" />

      <button
        onClick={() => saveCurrentTemplate()}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
      >
        保存
      </button>

      <button
        onClick={() => setShowExportModal(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
      >
        <Download size={14} />
        导出
      </button>

      <button
        onClick={() => setShowSendModal(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-colors"
      >
        <Send size={14} />
        测试发送
      </button>
    </div>
  );
}
