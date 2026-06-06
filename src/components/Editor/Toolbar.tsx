import React from 'react';
import {
  Bold,
  Italic,
  Underline,
  Highlighter,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  FileText,
  Download,
  Save
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { exportDocument } from '../../utils/export';
import type { ExportFormat } from '../../types';

interface ToolbarProps {
  quillRef: React.RefObject<any>;
}

const Toolbar: React.FC<ToolbarProps> = ({ quillRef }) => {
  const { currentArticle, saveCurrentArticle, toggleTemplateModal } = useStore();

  const handleFormat = (format: string, value?: any) => {
    const editor = quillRef.current?.getEditor();
    if (editor) {
      editor.format(format, value);
    }
  };

  const handleList = (type: 'ordered' | 'bullet') => {
    const editor = quillRef.current?.getEditor();
    if (editor) {
      editor.format('list', type);
    }
  };

  const handleBlockquote = () => {
    const editor = quillRef.current?.getEditor();
    if (editor) {
      const range = editor.getSelection();
      if (range) {
        const formats = editor.getFormat(range.index);
        editor.format('blockquote', !formats.blockquote);
      }
    }
  };

  const handleHighlight = () => {
    const editor = quillRef.current?.getEditor();
    if (editor) {
      const range = editor.getSelection();
      if (range) {
        const formats = editor.getFormat(range.index);
        editor.format('background', formats.background ? false : '#fef08a');
      }
    }
  };

  const handleUndo = () => {
    const editor = quillRef.current?.getEditor();
    if (editor) {
      editor.history.undo();
    }
  };

  const handleRedo = () => {
    const editor = quillRef.current?.getEditor();
    if (editor) {
      editor.history.redo();
    }
  };

  const handleExport = async (format: ExportFormat) => {
    if (currentArticle) {
      await exportDocument(format, currentArticle.content, currentArticle.title);
    }
  };

  const ToolbarButton: React.FC<{
    onClick: () => void;
    title: string;
    children: React.ReactNode;
  }> = ({ onClick, title, children }) => (
    <button
      onClick={onClick}
      title={title}
      className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-all duration-200 hover:scale-105"
    >
      {children}
    </button>
  );

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200">
      <div className="flex items-center gap-1">
        <ToolbarButton onClick={handleUndo} title="撤销">
          <Undo size={18} />
        </ToolbarButton>
        <ToolbarButton onClick={handleRedo} title="重做">
          <Redo size={18} />
        </ToolbarButton>
        
        <div className="w-px h-6 bg-gray-200 mx-2" />
        
        <ToolbarButton onClick={() => handleFormat('bold')} title="加粗">
          <Bold size={18} />
        </ToolbarButton>
        <ToolbarButton onClick={() => handleFormat('italic')} title="斜体">
          <Italic size={18} />
        </ToolbarButton>
        <ToolbarButton onClick={() => handleFormat('underline')} title="下划线">
          <Underline size={18} />
        </ToolbarButton>
        <ToolbarButton onClick={handleHighlight} title="高亮">
          <Highlighter size={18} />
        </ToolbarButton>
        
        <div className="w-px h-6 bg-gray-200 mx-2" />
        
        <ToolbarButton onClick={() => handleList('bullet')} title="无序列表">
          <List size={18} />
        </ToolbarButton>
        <ToolbarButton onClick={() => handleList('ordered')} title="有序列表">
          <ListOrdered size={18} />
        </ToolbarButton>
        <ToolbarButton onClick={handleBlockquote} title="引用">
          <Quote size={18} />
        </ToolbarButton>
      </div>
      
      <div className="flex items-center gap-1">
        <ToolbarButton onClick={() => toggleTemplateModal(true)} title="从模板创建">
          <FileText size={18} />
        </ToolbarButton>
        
        <div className="relative group">
          <ToolbarButton onClick={() => {}} title="导出">
            <Download size={18} />
          </ToolbarButton>
          <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 min-w-[140px]">
            <button
              onClick={() => handleExport('markdown')}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
            >
              导出 Markdown
            </button>
            <button
              onClick={() => handleExport('docx')}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
            >
              导出 HTML
            </button>
            <button
              onClick={() => handleExport('pdf')}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
            >
              导出 PDF
            </button>
          </div>
        </div>
        
        <div className="w-px h-6 bg-gray-200 mx-2" />
        
        <button
          onClick={saveCurrentArticle}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#2a4a73] transition-all duration-200 hover:scale-105 text-sm font-medium"
        >
          <Save size={16} />
          保存
        </button>
      </div>
    </div>
  );
};

export default Toolbar;
