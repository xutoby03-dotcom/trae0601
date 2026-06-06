import { TreeNode } from './TreeNode';
import { TreeNode as TreeNodeType } from '@/types';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useJsonStore } from '@/store/jsonStore';

interface TreeViewProps {
  treeData: TreeNodeType | null;
}

export function TreeView({ treeData }: TreeViewProps) {
  const { expandedPaths, expandAll, collapseAll } = useJsonStore();
  const expandedCount = expandedPaths.size;

  if (!treeData) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        请输入有效的 JSON 数据
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-900">
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700 bg-gray-800/50">
        <span className="text-sm text-gray-400 font-medium">树形视图</span>
        <div className="flex items-center gap-2">
          <button
            onClick={expandAll}
            className="flex items-center gap-1 px-2 py-1 text-xs text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
            title="展开全部"
          >
            <ChevronDown className="w-3.5 h-3.5" />
            展开
          </button>
          <button
            onClick={collapseAll}
            className="flex items-center gap-1 px-2 py-1 text-xs text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
            title="收起全部"
          >
            <ChevronRight className="w-3.5 h-3.5" />
            收起
          </button>
          <span className="text-xs text-gray-500">已展开 {expandedCount} 项</span>
        </div>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <TreeNode node={treeData} depth={0} />
      </div>
    </div>
  );
}
