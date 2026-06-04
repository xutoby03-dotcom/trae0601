export interface FSNode {
  id: string;
  name: string;
  type: 'file' | 'dir';
  parentId: string | null;
  content?: string;
  createdAt: number;
  updatedAt: number;
  permissions: number;
  owner: string;
}

export interface FileSystemState {
  nodes: Map<string, FSNode>;
  rootId: string;
  homeId: string;
}

export interface PersistedFilesystem {
  nodes: FSNode[];
}
