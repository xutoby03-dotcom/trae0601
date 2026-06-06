import { create } from 'zustand';
import { JsonValue, ViewMode, ContextMenuState, TreeNode } from '@/types';
import { parseJson, buildTree } from '@/utils/jsonUtils';

interface JsonStore {
  jsonText: string;
  jsonText2: string;
  parsedData: JsonValue | null;
  parsedData2: JsonValue | null;
  treeData: TreeNode | null;
  treeData2: TreeNode | null;
  parseError: string | null;
  parseError2: string | null;
  viewMode: ViewMode;
  searchPath: string;
  highlightedPaths: Set<string>;
  contextMenu: ContextMenuState;
  expandedPaths: Set<string>;

  setJsonText: (text: string) => void;
  setJsonText2: (text: string) => void;
  setViewMode: (mode: ViewMode) => void;
  setSearchPath: (path: string) => void;
  setHighlightedPaths: (paths: Set<string>) => void;
  setContextMenu: (menu: ContextMenuState) => void;
  toggleExpand: (path: string) => void;
  expandAll: () => void;
  collapseAll: () => void;
}

const sampleJson = {
  users: [
    {
      id: 1,
      name: '张三',
      email: 'zhangsan@example.com',
      active: true,
      profile: {
        age: 28,
        city: '北京',
        tags: ['developer', 'admin'],
      },
    },
    {
      id: 2,
      name: '李四',
      email: 'lisi@example.com',
      active: false,
      profile: {
        age: 32,
        city: '上海',
        tags: ['designer'],
      },
    },
  ],
  metadata: {
    total: 2,
    page: 1,
    perPage: 10,
  },
};

export const useJsonStore = create<JsonStore>((set, get) => {
  const initialText = JSON.stringify(sampleJson, null, 2);
  const initialData = sampleJson as JsonValue;
  const initialTree = buildTree(initialData);

  return {
    jsonText: initialText,
    jsonText2: '',
    parsedData: initialData,
    parsedData2: null,
    treeData: initialTree,
    treeData2: null,
    parseError: null,
    parseError2: null,
    viewMode: 'view',
    searchPath: '',
    highlightedPaths: new Set(),
    contextMenu: { visible: false, x: 0, y: 0, node: null },
    expandedPaths: new Set(['$', '$.users', '$.users[0]', '$.users[0].profile', '$.metadata']),

    setJsonText: (text: string) => {
      const { data, error } = parseJson(text);
      const treeData = data ? buildTree(data) : null;
      set({
        jsonText: text,
        parsedData: data,
        treeData,
        parseError: error,
      });
    },

    setJsonText2: (text: string) => {
      const { data, error } = parseJson(text);
      const treeData = data ? buildTree(data) : null;
      set({
        jsonText2: text,
        parsedData2: data,
        treeData2: treeData,
        parseError2: error,
      });
    },

    setViewMode: (mode: ViewMode) => set({ viewMode: mode }),

    setSearchPath: (path: string) => set({ searchPath: path }),

    setHighlightedPaths: (paths: Set<string>) => set({ highlightedPaths: paths }),

    setContextMenu: (menu: ContextMenuState) => set({ contextMenu: menu }),

    toggleExpand: (path: string) => {
      const { expandedPaths } = get();
      const newExpanded = new Set(expandedPaths);
      if (newExpanded.has(path)) {
        newExpanded.delete(path);
      } else {
        newExpanded.add(path);
      }
      set({ expandedPaths: newExpanded });
    },

    expandAll: () => {
      const { treeData } = get();
      if (!treeData) return;
      const allPaths = new Set<string>();
      const collectPaths = (node: TreeNode) => {
        allPaths.add(node.path);
        if (node.children) {
          node.children.forEach(collectPaths);
        }
      };
      collectPaths(treeData);
      set({ expandedPaths: allPaths });
    },

    collapseAll: () => {
      set({ expandedPaths: new Set(['$']) });
    },
  };
});
