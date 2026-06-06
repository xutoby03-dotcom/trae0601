import { openDB, IDBPDatabase } from 'idb';
import type { Article, Folder, Tag } from '../types';

const DB_NAME = 'writing-assistant-db';
const DB_VERSION = 1;

interface DBSchema {
  articles: {
    key: string;
    value: Article;
    indexes: { 'by-folder': string; 'by-updated': Date };
  };
  folders: {
    key: string;
    value: Folder;
    indexes: { 'by-parent': string | null };
  };
  tags: {
    key: string;
    value: Tag;
  };
}

let dbInstance: IDBPDatabase<DBSchema> | null = null;

export async function initDB(): Promise<IDBPDatabase<DBSchema>> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<DBSchema>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('articles')) {
        const articleStore = db.createObjectStore('articles', { keyPath: 'id' });
        articleStore.createIndex('by-folder', 'folderId');
        articleStore.createIndex('by-updated', 'updatedAt');
      }

      if (!db.objectStoreNames.contains('folders')) {
        const folderStore = db.createObjectStore('folders', { keyPath: 'id' });
        folderStore.createIndex('by-parent', 'parentId');
      }

      if (!db.objectStoreNames.contains('tags')) {
        db.createObjectStore('tags', { keyPath: 'id' });
      }
    },
  });

  return dbInstance;
}

export async function getAllArticles(): Promise<Article[]> {
  const db = await initDB();
  const articles = await db.getAll('articles');
  return articles.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export async function getArticleById(id: string): Promise<Article | undefined> {
  const db = await initDB();
  return db.get('articles', id);
}

export async function saveArticle(article: Article): Promise<void> {
  const db = await initDB();
  await db.put('articles', article);
}

export async function deleteArticle(id: string): Promise<void> {
  const db = await initDB();
  await db.delete('articles', id);
}

export async function getArticlesByFolder(folderId: string): Promise<Article[]> {
  const db = await initDB();
  return db.getAllFromIndex('articles', 'by-folder', folderId);
}

export async function searchArticles(query: string): Promise<Article[]> {
  const articles = await getAllArticles();
  const lowerQuery = query.toLowerCase();
  return articles.filter(
    article =>
      article.title.toLowerCase().includes(lowerQuery) ||
      article.content.toLowerCase().includes(lowerQuery) ||
      article.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}

export async function getAllFolders(): Promise<Folder[]> {
  const db = await initDB();
  return db.getAll('folders');
}

export async function saveFolder(folder: Folder): Promise<void> {
  const db = await initDB();
  await db.put('folders', folder);
}

export async function deleteFolder(id: string): Promise<void> {
  const db = await initDB();
  await db.delete('folders', id);
}

export async function getFoldersByParent(parentId: string | null): Promise<Folder[]> {
  const db = await initDB();
  return db.getAllFromIndex('folders', 'by-parent', parentId);
}

export async function getAllTags(): Promise<Tag[]> {
  const db = await initDB();
  return db.getAll('tags');
}

export async function saveTag(tag: Tag): Promise<void> {
  const db = await initDB();
  await db.put('tags', tag);
}

export async function deleteTag(id: string): Promise<void> {
  const db = await initDB();
  await db.delete('tags', id);
}

export async function initDefaultData(): Promise<void> {
  const db = await initDB();
  
  const folders = await getAllFolders();
  if (folders.length === 0) {
    const defaultFolders: Folder[] = [
      {
        id: 'folder-default',
        name: '我的文章',
        parentId: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'folder-work',
        name: '工作文档',
        parentId: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'folder-personal',
        name: '个人随笔',
        parentId: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    for (const folder of defaultFolders) {
      await db.put('folders', folder);
    }
  }

  const articles = await getAllArticles();
  if (articles.length === 0) {
    const sampleArticle: Article = {
      id: 'article-sample',
      title: '欢迎使用写作助手',
      content: `<h1>欢迎使用写作助手 ✨</h1>
<p>这是一款功能强大的写作辅助工具，帮助您提升写作效率和文章质量。</p>
<h2>主要功能</h2>
<ul>
<li><strong>富文本编辑</strong>：支持加粗、斜体、下划线、高亮、列表、引用等格式</li>
<li><strong>实时分析</strong>：自动统计字数、检测错别字、分析用词重复、评估可读性</li>
<li><strong>智能改写</strong>：选中文本右键，可切换简洁、正式、活泼三种风格</li>
<li><strong>模板库</strong>：提供8种常用写作模板，一键导入快速开始</li>
<li><strong>文章管理</strong>：支持文件夹分类、标签管理、全文搜索</li>
<li><strong>多格式导出</strong>：支持导出为Markdown、HTML、PDF格式</li>
</ul>
<h2>开始使用</h2>
<p>点击左侧「新建文章」开始创作，或从模板库选择一个模板快速开始。</p>
<blockquote>
<p>写作是思想的表达，好的工具让表达更顺畅。</p>
</blockquote>
<p>祝您写作愉快！</p>`,
      folderId: 'folder-default',
      tags: ['示例', '欢迎'],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await db.put('articles', sampleArticle);
  }
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
