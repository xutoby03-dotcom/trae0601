import { create } from 'zustand';
import type { Article, Folder, Tag, AnalysisResult, RewriteStyle } from '../types';
import {
  getAllArticles,
  getArticleById,
  saveArticle,
  deleteArticle,
  searchArticles,
  getAllFolders,
  saveFolder,
  deleteFolder,
  getAllTags,
  generateId,
  initDefaultData
} from '../utils/db';
import { analyzeText } from '../utils/textAnalysis';

interface AppState {
  articles: Article[];
  allArticles: Article[];
  folders: Folder[];
  tags: Tag[];
  currentArticle: Article | null;
  selectedFolderId: string | null;
  selectedTagId: string | null;
  searchQuery: string;
  analysisResult: AnalysisResult | null;
  isTemplateModalOpen: boolean;
  sidebarCollapsed: boolean;
  analysisPanelCollapsed: boolean;
  contextMenu: {
    visible: boolean;
    x: number;
    y: number;
    selectedText: string;
  } | null;

  initApp: () => Promise<void>;
  loadArticles: () => Promise<void>;
  loadFolders: () => Promise<void>;
  loadTags: () => Promise<void>;
  selectArticle: (id: string) => Promise<void>;
  createNewArticle: (templateContent?: string, templateTitle?: string) => Promise<void>;
  updateCurrentArticle: (updates: Partial<Article>) => void;
  saveCurrentArticle: () => Promise<void>;
  removeArticle: (id: string) => Promise<void>;
  setSearchQuery: (query: string) => void;
  setSelectedFolderId: (id: string | null) => void;
  setSelectedTagId: (id: string | null) => void;
  setAllArticles: (articles: Article[]) => void;
  analyzeContent: (html: string) => void;
  createFolder: (name: string, parentId?: string | null) => Promise<void>;
  removeFolder: (id: string) => Promise<void>;
  toggleTemplateModal: (open: boolean) => void;
  toggleSidebar: () => void;
  toggleAnalysisPanel: () => void;
  showContextMenu: (x: number, y: number, selectedText: string) => void;
  hideContextMenu: () => void;
  applyRewrite: (style: RewriteStyle, newText: string) => void;
}

export const useStore = create<AppState>((set, get) => ({
  articles: [],
  allArticles: [],
  folders: [],
  tags: [],
  currentArticle: null,
  selectedFolderId: null,
  selectedTagId: null,
  searchQuery: '',
  analysisResult: null,
  isTemplateModalOpen: false,
  sidebarCollapsed: false,
  analysisPanelCollapsed: false,
  contextMenu: null,

  initApp: async () => {
    await initDefaultData();
    await get().loadFolders();
    await get().loadArticles();
    await get().loadTags();
    
    const state = get();
    if (state.articles.length > 0 && !state.currentArticle) {
      await get().selectArticle(state.articles[0].id);
    }
  },

  loadArticles: async () => {
    const state = get();
    const allArticles = await getAllArticles();
    
    set({ allArticles });
    
    let filtered = [...allArticles];
    
    if (state.searchQuery) {
      const lowerQuery = state.searchQuery.toLowerCase();
      filtered = filtered.filter(
        article =>
          article.title.toLowerCase().includes(lowerQuery) ||
          article.content.toLowerCase().includes(lowerQuery) ||
          article.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
      );
    }
    
    if (state.selectedFolderId) {
      filtered = filtered.filter(a => a.folderId === state.selectedFolderId);
    }
    
    if (state.selectedTagId) {
      const selectedTag = state.tags.find(t => t.id === state.selectedTagId);
      if (selectedTag) {
        filtered = filtered.filter(a => a.tags.includes(selectedTag.name));
      }
    }
    
    set({ articles: filtered });
  },

  setAllArticles: (articles: Article[]) => {
    set({ allArticles: articles });
  },

  loadFolders: async () => {
    const folders = await getAllFolders();
    set({ folders });
  },

  loadTags: async () => {
    const tags = await getAllTags();
    set({ tags });
  },

  selectArticle: async (id: string) => {
    const article = await getArticleById(id);
    if (article) {
      set({ currentArticle: article });
      get().analyzeContent(article.content);
    }
  },

  createNewArticle: async (templateContent?: string, templateTitle?: string) => {
    const state = get();
    const newArticle: Article = {
      id: generateId(),
      title: templateTitle || '未命名文章',
      content: templateContent || '<p>开始写作...</p>',
      folderId: state.selectedFolderId || 'folder-default',
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await saveArticle(newArticle);
    set({ currentArticle: newArticle });
    get().analyzeContent(newArticle.content);
    await get().loadArticles();
  },

  updateCurrentArticle: (updates: Partial<Article>) => {
    const state = get();
    if (state.currentArticle) {
      const updated = { ...state.currentArticle, ...updates, updatedAt: new Date() };
      set({ currentArticle: updated });
    }
  },

  saveCurrentArticle: async () => {
    const state = get();
    if (state.currentArticle) {
      await saveArticle(state.currentArticle);
      await get().loadArticles();
    }
  },

  removeArticle: async (id: string) => {
    await deleteArticle(id);
    const state = get();
    if (state.currentArticle?.id === id) {
      set({ currentArticle: null, analysisResult: null });
    }
    await get().loadArticles();
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
    get().loadArticles();
  },

  setSelectedFolderId: (id: string | null) => {
    set({ selectedFolderId: id });
    get().loadArticles();
  },

  setSelectedTagId: (id: string | null) => {
    set({ selectedTagId: id });
    get().loadArticles();
  },

  analyzeContent: (html: string) => {
    const result = analyzeText(html);
    set({ analysisResult: result });
  },

  createFolder: async (name: string, parentId: string | null = null) => {
    const newFolder: Folder = {
      id: generateId(),
      name,
      parentId,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    await saveFolder(newFolder);
    await get().loadFolders();
  },

  removeFolder: async (id: string) => {
    await deleteFolder(id);
    const state = get();
    if (state.selectedFolderId === id) {
      set({ selectedFolderId: null });
    }
    await get().loadFolders();
    await get().loadArticles();
  },

  toggleTemplateModal: (open: boolean) => {
    set({ isTemplateModalOpen: open });
  },

  toggleSidebar: () => {
    set(state => ({ sidebarCollapsed: !state.sidebarCollapsed }));
  },

  toggleAnalysisPanel: () => {
    set(state => ({ analysisPanelCollapsed: !state.analysisPanelCollapsed }));
  },

  showContextMenu: (x: number, y: number, selectedText: string) => {
    set({ contextMenu: { visible: true, x, y, selectedText } });
  },

  hideContextMenu: () => {
    set({ contextMenu: null });
  },

  applyRewrite: (style: RewriteStyle, newText: string) => {
    const state = get();
    if (!state.currentArticle) return;
    
    const quillEditor = (window as any).quillEditor;
    const editor = quillEditor?.getEditor?.();
    if (!editor) return;
    
    const range = editor.getSelection();
    if (!range) return;
    
    editor.deleteText(range.index, range.length);
    editor.insertText(range.index, newText);
    
    const updatedContent = editor.root.innerHTML;
    const updated = { 
      ...state.currentArticle, 
      content: updatedContent, 
      updatedAt: new Date() 
    };
    set({ currentArticle: updated });
    
    get().analyzeContent(updatedContent);
    get().saveCurrentArticle();
  }
}));
