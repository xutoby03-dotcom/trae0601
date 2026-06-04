import { IndexedDBStore, FileNode } from './IndexedDBStore';
import { Path } from './Path';

export interface Stats {
  path: string;
  name: string;
  type: 'file' | 'directory';
  size: number;
  createdAt: number;
  updatedAt: number;
  isFile: () => boolean;
  isDirectory: () => boolean;
}

export class VirtualFS {
  private store: IndexedDBStore;
  private initialized = false;

  constructor(store?: IndexedDBStore) {
    this.store = store || new IndexedDBStore();
  }

  async init(): Promise<void> {
    if (this.initialized) {
      return;
    }

    await this.store.init();

    const rootNode = await this.store.getFile('/');
    if (!rootNode) {
      await this.createDirectoryNode('/');
      await this.createDirectoryNode('/home');
      await this.createDirectoryNode('/home/user');
    }

    this.initialized = true;
  }

  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new Error('VirtualFS not initialized. Call init() first.');
    }
  }

  private async createDirectoryNode(path: string): Promise<void> {
    const now = Date.now();
    const node: FileNode = {
      path,
      type: 'directory',
      name: Path.basename(path) || '/',
      parentPath: path === '/' ? '' : Path.dirname(path),
      size: 0,
      createdAt: now,
      updatedAt: now,
    };
    await this.store.putFile(node);
  }

  private async createFileNode(path: string, content: string = ''): Promise<void> {
    const now = Date.now();
    const node: FileNode = {
      path,
      type: 'file',
      name: Path.basename(path),
      parentPath: Path.dirname(path),
      size: content.length,
      createdAt: now,
      updatedAt: now,
      content,
    };
    await this.store.putFile(node);
  }

  private async updateNodeTimestamps(path: string): Promise<void> {
    const node = await this.store.getFile(path);
    if (node) {
      node.updatedAt = Date.now();
      await this.store.putFile(node);
    }
  }

  private async assertParentExists(path: string): Promise<void> {
    const parentPath = Path.dirname(path);
    const parent = await this.store.getFile(parentPath);
    if (!parent) {
      throw new Error(`Parent directory does not exist: ${parentPath}`);
    }
    if (parent.type !== 'directory') {
      throw new Error(`Parent is not a directory: ${parentPath}`);
    }
  }

  async mkdir(path: string, { recursive = false }: { recursive?: boolean } = {}): Promise<void> {
    this.ensureInitialized();
    const normalizedPath = Path.normalize(path);

    if (await this.exists(normalizedPath)) {
      throw new Error(`Directory already exists: ${normalizedPath}`);
    }

    if (recursive) {
      const parts = normalizedPath.split('/').filter(Boolean);
      let currentPath = '';
      for (const part of parts) {
        currentPath += '/' + part;
        if (!(await this.exists(currentPath))) {
          await this.assertParentExists(currentPath);
          await this.createDirectoryNode(currentPath);
        }
      }
    } else {
      await this.assertParentExists(normalizedPath);
      await this.createDirectoryNode(normalizedPath);
    }
  }

  async rmdir(path: string, { recursive = false }: { recursive?: boolean } = {}): Promise<void> {
    this.ensureInitialized();
    const normalizedPath = Path.normalize(path);

    if (normalizedPath === '/') {
      throw new Error('Cannot delete root directory');
    }

    const node = await this.store.getFile(normalizedPath);
    if (!node) {
      throw new Error(`Directory does not exist: ${normalizedPath}`);
    }
    if (node.type !== 'directory') {
      throw new Error(`Not a directory: ${normalizedPath}`);
    }

    const children = await this.store.getFilesByParent(normalizedPath);
    if (children.length > 0 && !recursive) {
      throw new Error(`Directory not empty: ${normalizedPath}`);
    }

    if (recursive) {
      const allFiles = await this.store.getAllFiles();
      const toDelete = allFiles.filter(
        (f) => f.path === normalizedPath || f.path.startsWith(normalizedPath + '/')
      );
      for (const file of toDelete.sort((a, b) => b.path.length - a.path.length)) {
        await this.store.deleteFile(file.path);
      }
    } else {
      await this.store.deleteFile(normalizedPath);
    }
  }

  async readdir(path: string): Promise<string[]> {
    this.ensureInitialized();
    const normalizedPath = Path.normalize(path);

    const node = await this.store.getFile(normalizedPath);
    if (!node) {
      throw new Error(`Directory does not exist: ${normalizedPath}`);
    }
    if (node.type !== 'directory') {
      throw new Error(`Not a directory: ${normalizedPath}`);
    }

    const children = await this.store.getFilesByParent(normalizedPath);
    return children.map((child) => child.name);
  }

  async touch(path: string): Promise<void> {
    this.ensureInitialized();
    const normalizedPath = Path.normalize(path);

    if (await this.exists(normalizedPath)) {
      await this.updateNodeTimestamps(normalizedPath);
      return;
    }

    await this.assertParentExists(normalizedPath);
    await this.createFileNode(normalizedPath);
  }

  async writeFile(
    path: string,
    data: string,
    { flag = 'w' }: { flag?: 'w' | 'a' } = {}
  ): Promise<void> {
    this.ensureInitialized();
    const normalizedPath = Path.normalize(path);

    const existing = await this.store.getFile(normalizedPath);

    if (existing && existing.type === 'directory') {
      throw new Error(`Is a directory: ${normalizedPath}`);
    }

    if (!existing) {
      await this.assertParentExists(normalizedPath);
      await this.createFileNode(normalizedPath, data);
      return;
    }

    const content = flag === 'a' ? (existing.content || '') + data : data;
    const now = Date.now();

    const updatedNode: FileNode = {
      ...existing,
      content,
      size: content.length,
      updatedAt: now,
    };
    await this.store.putFile(updatedNode);
  }

  async readFile(path: string, { encoding = 'utf8' }: { encoding?: 'utf8' } = {}): Promise<string> {
    this.ensureInitialized();
    const normalizedPath = Path.normalize(path);

    const node = await this.store.getFile(normalizedPath);
    if (!node) {
      throw new Error(`File does not exist: ${normalizedPath}`);
    }
    if (node.type !== 'file') {
      throw new Error(`Is a directory: ${normalizedPath}`);
    }

    return node.content || '';
  }

  async rm(path: string, { recursive = false, force = false }: { recursive?: boolean; force?: boolean } = {}): Promise<void> {
    this.ensureInitialized();
    const normalizedPath = Path.normalize(path);

    if (normalizedPath === '/') {
      throw new Error('Cannot delete root directory');
    }

    const node = await this.store.getFile(normalizedPath);
    if (!node) {
      if (force) {
        return;
      }
      throw new Error(`File or directory does not exist: ${normalizedPath}`);
    }

    if (node.type === 'directory') {
      const children = await this.store.getFilesByParent(normalizedPath);
      if (children.length > 0 && !recursive) {
        throw new Error(`Directory not empty: ${normalizedPath}. Use recursive option.`);
      }
      await this.rmdir(normalizedPath, { recursive });
    } else {
      await this.store.deleteFile(normalizedPath);
    }
  }

  async stat(path: string): Promise<Stats> {
    this.ensureInitialized();
    const normalizedPath = Path.normalize(path);

    const node = await this.store.getFile(normalizedPath);
    if (!node) {
      throw new Error(`File or directory does not exist: ${normalizedPath}`);
    }

    return {
      path: node.path,
      name: node.name,
      type: node.type,
      size: node.size,
      createdAt: node.createdAt,
      updatedAt: node.updatedAt,
      isFile: () => node.type === 'file',
      isDirectory: () => node.type === 'directory',
    };
  }

  async exists(path: string): Promise<boolean> {
    this.ensureInitialized();
    try {
      const normalizedPath = Path.normalize(path);
      const node = await this.store.getFile(normalizedPath);
      return !!node;
    } catch {
      return false;
    }
  }

  async rename(oldPath: string, newPath: string): Promise<void> {
    this.ensureInitialized();
    const normalizedOldPath = Path.normalize(oldPath);
    const normalizedNewPath = Path.normalize(newPath);

    if (normalizedOldPath === normalizedNewPath) {
      return;
    }

    if (normalizedNewPath.startsWith(normalizedOldPath + '/')) {
      throw new Error(`Cannot move ${normalizedOldPath} into itself`);
    }

    const oldNode = await this.store.getFile(normalizedOldPath);
    if (!oldNode) {
      throw new Error(`Source does not exist: ${normalizedOldPath}`);
    }

    if (await this.exists(normalizedNewPath)) {
      throw new Error(`Destination already exists: ${normalizedNewPath}`);
    }

    await this.assertParentExists(normalizedNewPath);

    if (oldNode.type === 'directory') {
      const allFiles = await this.store.getAllFiles();
      const toMove = allFiles.filter(
        (f) => f.path === normalizedOldPath || f.path.startsWith(normalizedOldPath + '/')
      );

      for (const file of toMove) {
        const relativePath = file.path.slice(normalizedOldPath.length);
        const newFilePath = normalizedNewPath + relativePath;
        const newParentPath = newFilePath === normalizedNewPath
          ? Path.dirname(normalizedNewPath)
          : Path.dirname(newFilePath);

        const newNode: FileNode = {
          ...file,
          path: newFilePath,
          name: Path.basename(newFilePath),
          parentPath: newParentPath,
          updatedAt: Date.now(),
        };

        await this.store.deleteFile(file.path);
        await this.store.putFile(newNode);
      }
    } else {
      const newNode: FileNode = {
        ...oldNode,
        path: normalizedNewPath,
        name: Path.basename(normalizedNewPath),
        parentPath: Path.dirname(normalizedNewPath),
        updatedAt: Date.now(),
      };

      await this.store.deleteFile(normalizedOldPath);
      await this.store.putFile(newNode);
    }
  }

  async copyFile(source: string, destination: string, { flag = 'w' }: { flag?: 'w' | 'a' } = {}): Promise<void> {
    this.ensureInitialized();
    const normalizedSource = Path.normalize(source);
    const normalizedDest = Path.normalize(destination);

    const sourceNode = await this.store.getFile(normalizedSource);
    if (!sourceNode) {
      throw new Error(`Source file does not exist: ${normalizedSource}`);
    }
    if (sourceNode.type !== 'file') {
      throw new Error(`Source is not a file: ${normalizedSource}`);
    }

    const destNode = await this.store.getFile(normalizedDest);
    if (destNode?.type === 'directory') {
      throw new Error(`Destination is a directory: ${normalizedDest}`);
    }

    const content = sourceNode.content || '';

    if (flag === 'a' && destNode) {
      const existingContent = destNode.content || '';
      await this.writeFile(normalizedDest, existingContent + content, { flag: 'w' });
    } else {
      await this.writeFile(normalizedDest, content, { flag: 'w' });
    }
  }

  getStore(): IndexedDBStore {
    return this.store;
  }
}

export const fs = new VirtualFS();
