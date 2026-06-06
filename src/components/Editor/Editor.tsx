import React, { useRef, useEffect, useCallback, useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useStore } from '../../store/useStore';
import Toolbar from './Toolbar';
import ContextMenu from './ContextMenu';
import { debounce } from 'lodash-es';

const modules = {
  toolbar: false,
  history: {
    delay: 500,
    maxStack: 100,
    userOnly: false
  }
};

const formats = [
  'bold', 'italic', 'underline', 'strike',
  'list', 'bullet', 'ordered',
  'blockquote', 'code-block',
  'header', 'size',
  'color', 'background',
  'link', 'image',
  'align',
  'indent'
];

const Editor: React.FC = () => {
  const quillRef = useRef<ReactQuill>(null);
  const { 
    currentArticle, 
    updateCurrentArticle, 
    analyzeContent,
    saveCurrentArticle,
    showContextMenu,
    hideContextMenu
  } = useStore();
  const [isSaving, setIsSaving] = useState(false);

  const debouncedAnalyze = useCallback(
    debounce((html: string) => {
      analyzeContent(html);
    }, 300),
    [analyzeContent]
  );

  const debouncedSave = useCallback(
    debounce(async () => {
      setIsSaving(true);
      await saveCurrentArticle();
      setTimeout(() => setIsSaving(false), 500);
    }, 2000),
    [saveCurrentArticle]
  );

  useEffect(() => {
    (window as any).quillEditor = quillRef.current;
  }, []);

  const handleChange = (content: string) => {
    if (currentArticle) {
      updateCurrentArticle({ content: content });
      debouncedAnalyze(content);
      debouncedSave();
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (currentArticle) {
      updateCurrentArticle({ title: e.target.value });
      debouncedSave();
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    
    const selection = window.getSelection();
    const selectedText = selection?.toString().trim() || '';
    
    if (selectedText) {
      const x = e.clientX;
      const y = e.clientY;
      showContextMenu(x, y, selectedText);
    }
  };

  const handleEditorClick = () => {
    hideContextMenu();
  };

  if (!currentArticle) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-500">
          <p className="text-lg">选择或创建一篇文章开始写作</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden" onContextMenu={handleContextMenu} onClick={handleEditorClick}>
      <Toolbar quillRef={quillRef} />
      
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-8 py-8">
          <input
            type="text"
            value={currentArticle.title}
            onChange={handleTitleChange}
            placeholder="输入文章标题..."
            className="w-full text-3xl font-bold text-gray-900 border-none outline-none bg-transparent mb-6 placeholder:text-gray-300"
            style={{ fontFamily: "'Playfair Display', serif" }}
          />
          
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-6">
            <span>
              {new Date(currentArticle.updatedAt).toLocaleString('zh-CN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
            {isSaving && <span className="text-[#f59e0b]">保存中...</span>}
          </div>
          
          <div className="prose prose-lg max-w-none">
            <ReactQuill
              ref={quillRef}
              theme="snow"
              value={currentArticle.content}
              onChange={handleChange}
              modules={modules}
              formats={formats}
              placeholder="开始写作..."
              className="min-h-[500px]"
            />
          </div>
        </div>
      </div>
      
      <ContextMenu />
    </div>
  );
};

export default Editor;
