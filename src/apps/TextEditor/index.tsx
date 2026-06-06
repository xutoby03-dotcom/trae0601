import React, { useState, useEffect } from 'react';
import { FileText, Save, FilePlus, Copy, Trash2 } from 'lucide-react';
import { VirtualFile } from '../../types';
import { getFiles, saveFiles } from '../../utils/idb';

const TextEditor: React.FC = () => {
  const [content, setContent] = useState('');
  const [fileName, setFileName] = useState('未命名文档.txt');
  const [files, setFiles] = useState<VirtualFile[]>([]);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    const savedFiles = await getFiles();
    const textFiles = savedFiles.filter(f => f.type === 'file');
    setFiles(textFiles);
  };

  const handleNewFile = () => {
    setContent('');
    setFileName('未命名文档.txt');
    setSelectedFileId(null);
  };

  const handleSave = async () => {
    const now = Date.now();
    let newFiles: VirtualFile[];
    
    if (selectedFileId) {
      newFiles = files.map(f => 
        f.id === selectedFileId 
          ? { ...f, name: fileName, content, updatedAt: now }
          : f
      );
    } else {
      const newFile: VirtualFile = {
        id: `file-${now}`,
        name: fileName,
        type: 'file',
        content,
        parentId: null,
        createdAt: now,
        updatedAt: now,
      };
      newFiles = [...files, newFile];
      setSelectedFileId(newFile.id);
    }
    
    setFiles(newFiles);
    await saveFiles(newFiles);
  };

  const handleOpenFile = (file: VirtualFile) => {
    setContent(file.content || '');
    setFileName(file.name);
    setSelectedFileId(file.id);
  };

  const handleDeleteFile = async (fileId: string) => {
    const newFiles = files.filter(f => f.id !== fileId);
    setFiles(newFiles);
    await saveFiles(newFiles);
    if (selectedFileId === fileId) {
      handleNewFile();
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
  };

  return (
    <div className="flex h-full" style={{ background: 'var(--color-window-background)' }}>
      {showSidebar && (
        <div 
          className="w-48 border-r flex flex-col"
          style={{ borderColor: 'var(--color-taskbar-border)' }}
        >
          <div className="p-2 border-b" style={{ borderColor: 'var(--color-taskbar-border)' }}>
            <button
              className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded transition-colors hover:bg-white/10"
              style={{ color: 'var(--color-text-primary)' }}
              onClick={handleNewFile}
            >
              <FilePlus size={16} />
              <span>新建文档</span>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-1">
            {files.map(file => (
              <div
                key={file.id}
                className={`flex items-center gap-2 px-2 py-1.5 text-sm rounded cursor-pointer group ${
                  selectedFileId === file.id ? 'bg-blue-500/20' : 'hover:bg-white/10'
                }`}
                style={{ color: 'var(--color-text-primary)' }}
                onClick={() => handleOpenFile(file)}
              >
                <FileText size={14} className="flex-shrink-0" />
                <span className="flex-1 truncate text-xs">{file.name}</span>
                <button
                  className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-red-500/20 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteFile(file.id);
                  }}
                >
                  <Trash2 size={12} className="text-red-500" />
                </button>
              </div>
            ))}
            {files.length === 0 && (
              <p className="text-xs px-2 py-4 text-center" style={{ color: 'var(--color-text-secondary)' }}>
                暂无文档
              </p>
            )}
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col">
        <div 
          className="flex items-center gap-1 px-2 py-1 border-b"
          style={{ borderColor: 'var(--color-taskbar-border)' }}
        >
          <button
            className="p-1.5 rounded transition-colors hover:bg-white/10"
            onClick={handleNewFile}
            title="新建"
          >
            <FilePlus size={16} style={{ color: 'var(--color-text-primary)' }} />
          </button>
          <button
            className="p-1.5 rounded transition-colors hover:bg-white/10"
            onClick={handleSave}
            title="保存"
          >
            <Save size={16} style={{ color: 'var(--color-text-primary)' }} />
          </button>
          <button
            className="p-1.5 rounded transition-colors hover:bg-white/10"
            onClick={handleCopy}
            title="复制"
          >
            <Copy size={16} style={{ color: 'var(--color-text-primary)' }} />
          </button>
          <div className="flex-1" />
          <input
            type="text"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            className="px-2 py-1 text-sm rounded w-48"
            style={{
              background: 'var(--color-input-background)',
              color: 'var(--color-text-primary)',
              border: '1px solid var(--color-input-border)',
            }}
          />
        </div>

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="flex-1 p-4 resize-none outline-none font-mono text-sm"
          style={{
            background: 'var(--color-window-background)',
            color: 'var(--color-text-primary)',
          }}
          placeholder="开始输入..."
          spellCheck={false}
        />
      </div>
    </div>
  );
};

export default TextEditor;
