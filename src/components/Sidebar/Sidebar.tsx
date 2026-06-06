import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Search,
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronLeft,
  Trash2,
  File,
  FilePlus,
  Tag
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { stripHtml } from '../../utils/textAnalysis';

const Sidebar: React.FC = () => {
  const {
    articles,
    folders,
    tags,
    currentArticle,
    selectedFolderId,
    selectedTagId,
    searchQuery,
    sidebarCollapsed,
    selectArticle,
    createNewArticle,
    removeArticle,
    setSearchQuery,
    setSelectedFolderId,
    setSelectedTagId,
    toggleSidebar,
    toggleTemplateModal
  } = useStore();

  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['folder-default', 'folder-work', 'folder-personal']));

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  };

  const handleFolderClick = (folderId: string) => {
    if (selectedFolderId === folderId) {
      setSelectedFolderId(null);
    } else {
      setSelectedFolderId(folderId);
    }
  };

  const formatDate = (date: Date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return '今天';
    if (days === 1) return '昨天';
    if (days < 7) return `${days}天前`;
    return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  };

  const getArticleExcerpt = (content: string) => {
    const text = stripHtml(content).slice(0, 50);
    return text.length > 50 ? text + '...' : text;
  };

  if (sidebarCollapsed) {
    return (
      <div className="w-14 bg-[#1e3a5f] flex flex-col items-center py-4 gap-3">
        <button
          onClick={toggleSidebar}
          className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          title="展开侧边栏"
        >
          <ChevronRight size={20} />
        </button>
        <button
          onClick={() => createNewArticle()}
          className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          title="新建文章"
        >
          <Plus size={20} />
        </button>
        <button
          onClick={() => toggleTemplateModal(true)}
          className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          title="从模板创建"
        >
          <FilePlus size={20} />
        </button>
      </div>
    );
  }

  return (
    <div className="w-72 bg-[#1e3a5f] flex flex-col text-white overflow-hidden">
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileText size={22} className="text-[#f59e0b]" />
            <span className="font-bold text-lg">写作助手</span>
          </div>
          <button
            onClick={toggleSidebar}
            className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            title="收起侧边栏"
          >
            <ChevronLeft size={18} />
          </button>
        </div>
        
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索文章..."
            className="w-full pl-9 pr-4 py-2 bg-white/10 border border-white/10 rounded-lg text-sm text-white placeholder-white/40 focus:outline-none focus:border-white/20 focus:bg-white/15 transition-colors"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          <button
            onClick={() => createNewArticle()}
            className="w-full flex items-center gap-2 px-3 py-2.5 bg-[#f59e0b] hover:bg-[#fbbf24] text-[#1e3a5f] rounded-lg font-medium transition-all duration-200 hover:scale-[1.02] mb-3"
          >
            <Plus size={18} />
            新建文章
          </button>
          
          <button
            onClick={() => toggleTemplateModal(true)}
            className="w-full flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors mb-4"
          >
            <FilePlus size={16} />
            从模板创建
          </button>

          <div className="text-xs text-white/40 uppercase tracking-wider mb-2 px-2">
            文件夹
          </div>
          
          <div className="space-y-1 mb-4">
            <button
              onClick={() => setSelectedFolderId(null)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                selectedFolderId === null
                  ? 'bg-white/20 text-white'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Folder size={16} />
              全部文章
              <span className="ml-auto text-xs text-white/40">{articles.length}</span>
            </button>
            
            {folders.map(folder => {
              const folderArticles = articles.filter(a => a.folderId === folder.id);
              const isExpanded = expandedFolders.has(folder.id);
              const isSelected = selectedFolderId === folder.id;
              
              return (
                <div key={folder.id}>
                  <button
                    onClick={() => {
                      toggleFolder(folder.id);
                      handleFolderClick(folder.id);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'text-white/70 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {isExpanded ? (
                      <ChevronRight size={14} className="text-white/40 -rotate-90" />
                    ) : (
                      <ChevronRight size={14} className="text-white/40" />
                    )}
                    {isExpanded ? (
                      <FolderOpen size={16} className="text-[#f59e0b]" />
                    ) : (
                      <Folder size={16} className="text-[#f59e0b]" />
                    )}
                    {folder.name}
                    <span className="ml-auto text-xs text-white/40">
                      {folderArticles.length}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>

          <div className="text-xs text-white/40 uppercase tracking-wider mb-2 px-2">
            标签
          </div>
          
          <div className="flex flex-wrap gap-1.5 px-2 mb-4">
            <button
              onClick={() => setSelectedTagId(null)}
              className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                selectedTagId === null
                  ? 'bg-white/30 text-white'
                  : 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white'
              }`}
            >
              全部
            </button>
            {tags.map(tag => {
              const count = articles.filter(a => a.tags.includes(tag.name)).length;
              return (
                <button
                  key={tag.id}
                  onClick={() => setSelectedTagId(selectedTagId === tag.id ? null : tag.id)}
                  className={`px-2 py-1 rounded-full text-xs font-medium transition-colors flex items-center gap-1 ${
                    selectedTagId === tag.id
                      ? 'bg-white/30 text-white'
                      : 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white'
                  }`}
                  style={{
                    borderLeft: selectedTagId === tag.id ? `3px solid ${tag.color}` : `3px solid transparent`
                  }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: tag.color }}
                  />
                  {tag.name}
                  {count > 0 && (
                    <span className="text-white/40 ml-0.5">{count}</span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="text-xs text-white/40 uppercase tracking-wider mb-2 px-2">
            {selectedFolderId ? '当前文件夹' : selectedTagId ? '标签文章' : '最近文章'}
          </div>
          
          <div className="space-y-1">
            {articles.length === 0 ? (
              <div className="px-3 py-4 text-center text-white/40 text-sm">
                暂无文章
              </div>
            ) : (
              articles.map(article => (
                <div
                  key={article.id}
                  className={`group relative px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                    currentArticle?.id === article.id
                      ? 'bg-white/20'
                      : 'hover:bg-white/10'
                  }`}
                  onClick={() => selectArticle(article.id)}
                >
                  <div className="flex items-start gap-2">
                    <File size={14} className="text-white/40 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate text-white">
                        {article.title || '未命名文章'}
                      </div>
                      <div className="text-xs text-white/40 truncate mt-0.5">
                        {getArticleExcerpt(article.content)}
                      </div>
                      {article.tags && article.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {article.tags.slice(0, 3).map((tagName, idx) => {
                            const tag = tags.find(t => t.name === tagName);
                            return (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium"
                                style={{
                                  backgroundColor: tag ? `${tag.color}20` : 'rgba(255,255,255,0.1)',
                                  color: tag ? tag.color : 'rgba(255,255,255,0.6)'
                                }}
                              >
                                <span
                                  className="w-1 h-1 rounded-full"
                                  style={{ backgroundColor: tag?.color || 'rgba(255,255,255,0.4)' }}
                                />
                                {tagName}
                              </span>
                            );
                          })}
                        </div>
                      )}
                      <div className="text-xs text-white/30 mt-1">
                        {formatDate(article.updatedAt)}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('确定要删除这篇文章吗？')) {
                        removeArticle(article.id);
                      }
                    }}
                    className="absolute right-2 top-2 p-1 text-white/0 group-hover:text-white/40 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                    title="删除文章"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
