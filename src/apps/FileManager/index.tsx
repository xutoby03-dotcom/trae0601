import React, { useState, useEffect } from 'react';
import { Folder, FileText, Image, Music, File, ChevronLeft, ChevronRight, Home, Plus, Trash2 } from 'lucide-react';
import { VirtualFile } from '../../types';
import { getFiles, saveFiles } from '../../utils/idb';

const FileManager: React.FC = () => {
  const [files, setFiles] = useState<VirtualFile[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [path, setPath] = useState<VirtualFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    let savedFiles = await getFiles();
    if (savedFiles.length === 0) {
      const defaultFiles: VirtualFile[] = [
        { id: 'folder-docs', name: '文档', type: 'folder', parentId: null, createdAt: Date.now(), updatedAt: Date.now() },
        { id: 'folder-pics', name: '图片', type: 'folder', parentId: null, createdAt: Date.now(), updatedAt: Date.now() },
        { id: 'folder-music', name: '音乐', type: 'folder', parentId: null, createdAt: Date.now(), updatedAt: Date.now() },
        { id: 'file-1', name: '欢迎使用.txt', type: 'file', content: '欢迎使用虚拟桌面系统！\n\n这是一个功能完整的网页版虚拟桌面。', parentId: null, createdAt: Date.now(), updatedAt: Date.now() },
        { id: 'file-2', name: '备忘录.txt', type: 'file', content: '这是一个备忘录文件。', parentId: 'folder-docs', createdAt: Date.now(), updatedAt: Date.now() },
      ];
      await saveFiles(defaultFiles);
      savedFiles = defaultFiles;
    }
    setFiles(savedFiles);
  };

  const currentFiles = files.filter(f => f.parentId === currentFolderId);

  const getFileIcon = (file: VirtualFile) => {
    if (file.type === 'folder') return <Folder size={24} className="text-yellow-500" />;
    if (file.name.endsWith('.txt')) return <FileText size={24} className="text-blue-500" />;
    if (file.name.endsWith('.png') || file.name.endsWith('.jpg')) return <Image size={24} className="text-green-500" />;
    if (file.name.endsWith('.mp3')) return <Music size={24} className="text-purple-500" />;
    return <File size={24} className="text-gray-500" />;
  };

  const handleDoubleClick = (file: VirtualFile) => {
    if (file.type === 'folder') {
      setPath([...path, file]);
      setCurrentFolderId(file.id);
      setSelectedFile(null);
    }
  };

  const handleBack = () => {
    if (path.length > 0) {
      const newPath = path.slice(0, -1);
      setPath(newPath);
      setCurrentFolderId(newPath.length > 0 ? newPath[newPath.length - 1].id : null);
      setSelectedFile(null);
    }
  };

  const handleForward = () => {
  };

  const handleHome = () => {
    setPath([]);
    setCurrentFolderId(null);
    setSelectedFile(null);
  };

  const handleNewFolder = async () => {
    const now = Date.now();
    const newFolder: VirtualFile = {
      id: `folder-${now}`,
      name: `新建文件夹`,
      type: 'folder',
      parentId: currentFolderId,
      createdAt: now,
      updatedAt: now,
    };
    const newFiles = [...files, newFolder];
    setFiles(newFiles);
    await saveFiles(newFiles);
  };

  const handleNewFile = async () => {
    const now = Date.now();
    const newFile: VirtualFile = {
      id: `file-${now}`,
      name: `新建文件.txt`,
      type: 'file',
      content: '',
      parentId: currentFolderId,
      createdAt: now,
      updatedAt: now,
    };
    const newFiles = [...files, newFile];
    setFiles(newFiles);
    await saveFiles(newFiles);
  };

  const handleDelete = async () => {
    if (!selectedFile) return;
    const deleteRecursive = (id: string): string[] => {
      const toDelete = [id];
      const children = files.filter(f => f.parentId === id);
      children.forEach(child => {
        toDelete.push(...deleteRecursive(child.id));
      });
      return toDelete;
    };
    const idsToDelete = deleteRecursive(selectedFile);
    const newFiles = files.filter(f => !idsToDelete.includes(f.id));
    setFiles(newFiles);
    setSelectedFile(null);
    await saveFiles(newFiles);
  };

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--color-window-background)' }}>
      <div 
        className="flex items-center gap-1 px-2 py-2 border-b"
        style={{ borderColor: 'var(--color-taskbar-border)' }}
      >
        <button
          className="p-1.5 rounded transition-colors hover:bg-white/10 disabled:opacity-50"
          onClick={handleBack}
          disabled={path.length === 0}
        >
          <ChevronLeft size={18} style={{ color: 'var(--color-text-primary)' }} />
        </button>
        <button
          className="p-1.5 rounded transition-colors hover:bg-white/10"
          onClick={handleForward}
          disabled
        >
          <ChevronRight size={18} style={{ color: 'var(--color-text-primary)' }} />
        </button>
        <button
          className="p-1.5 rounded transition-colors hover:bg-white/10"
          onClick={handleHome}
        >
          <Home size={18} style={{ color: 'var(--color-text-primary)' }} />
        </button>
        <div 
          className="flex-1 px-3 py-1.5 rounded text-sm ml-2"
          style={{
            background: 'var(--color-input-background)',
            color: 'var(--color-text-primary)',
            border: '1px solid var(--color-input-border)',
          }}
        >
          {['此电脑', ...path.map(p => p.name)].join(' / ')}
        </div>
        <div className="flex items-center gap-1 ml-2">
          <button
            className="p-1.5 rounded transition-colors hover:bg-white/10"
            onClick={handleNewFolder}
            title="新建文件夹"
          >
            <Folder size={18} style={{ color: 'var(--color-text-primary)' }} />
          </button>
          <button
            className="p-1.5 rounded transition-colors hover:bg-white/10"
            onClick={handleNewFile}
            title="新建文件"
          >
            <Plus size={18} style={{ color: 'var(--color-text-primary)' }} />
          </button>
          <button
            className="p-1.5 rounded transition-colors hover:bg-red-500/20 disabled:opacity-50"
            onClick={handleDelete}
            disabled={!selectedFile}
            title="删除"
          >
            <Trash2 size={18} className="text-red-500" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
          {currentFiles.map(file => (
            <div
              key={file.id}
              className={`flex flex-col items-center gap-1 p-2 rounded cursor-pointer transition-colors ${
                selectedFile === file.id ? 'bg-blue-500/20' : 'hover:bg-white/10'
              }`}
              onClick={() => setSelectedFile(file.id)}
              onDoubleClick={() => handleDoubleClick(file)}
            >
              {getFileIcon(file)}
              <span 
                className="text-xs text-center truncate w-full"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {file.name}
              </span>
            </div>
          ))}
          {currentFiles.length === 0 && (
            <div 
              className="col-span-full flex flex-col items-center justify-center py-16 text-center"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              <Folder size={48} className="mb-2 opacity-50" />
              <p className="text-sm">此文件夹为空</p>
            </div>
          )}
        </div>
      </div>

      <div 
        className="px-3 py-1.5 border-t text-xs"
        style={{ 
          borderColor: 'var(--color-taskbar-border)',
          color: 'var(--color-text-secondary)',
        }}
      >
        {currentFiles.length} 项
      </div>
    </div>
  );
};

export default FileManager;
