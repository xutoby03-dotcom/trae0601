import { memo } from 'react';
import { ChevronRight, ChevronDown, Braces, List, Hash, Type, Circle, CircleDot } from 'lucide-react';
import { TreeNode as TreeNodeType } from '@/types';
import { useJsonStore } from '@/store/jsonStore';

interface TreeNodeProps {
  node: TreeNodeType;
  depth: number;
}

const typeColors: Record<string, string> = {
  object: 'text-yellow-400',
  array: 'text-orange-400',
  string: 'text-green-400',
  number: 'text-purple-400',
  boolean: 'text-red-400',
  null: 'text-gray-500',
};

const TypeIcon = ({ type }: { type: string }) => {
  const iconClass = 'w-3.5 h-3.5';
  switch (type) {
    case 'object':
      return <Braces className={`${iconClass} ${typeColors.object}`} />;
    case 'array':
      return <List className={`${iconClass} ${typeColors.array}`} />;
    case 'string':
      return <Type className={`${iconClass} ${typeColors.string}`} />;
    case 'number':
      return <Hash className={`${iconClass} ${typeColors.number}`} />;
    case 'boolean':
      return <CircleDot className={`${iconClass} ${typeColors.boolean}`} />;
    case 'null':
      return <Circle className={`${iconClass} ${typeColors.null}`} />;
    default:
      return null;
  }
};

function TreeNodeComponent({ node, depth }: TreeNodeProps) {
  const { expandedPaths, highlightedPaths, toggleExpand, setContextMenu } = useJsonStore();
  const isExpanded = expandedPaths.has(node.path);
  const isHighlighted = highlightedPaths.has(node.path);
  const hasChildren = node.children && node.children.length > 0;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasChildren) {
      toggleExpand(node.path);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      node,
    });
  };

  const renderValue = () => {
    if (node.type === 'string') {
      return <span className={typeColors.string}>"{node.value as string}"</span>;
    }
    if (node.type === 'number') {
      return <span className={typeColors.number}>{String(node.value)}</span>;
    }
    if (node.type === 'boolean') {
      return <span className={typeColors.boolean}>{String(node.value)}</span>;
    }
    if (node.type === 'null') {
      return <span className={typeColors.null}>null</span>;
    }
    if (node.type === 'object') {
      const count = Object.keys(node.value as object).length;
      return (
        <span className="text-gray-400">
          {'{'} {count} {count === 1 ? 'key' : 'keys'} {'}'}
        </span>
      );
    }
    if (node.type === 'array') {
      const count = (node.value as any[]).length;
      return (
        <span className="text-gray-400">
          [{count} {count === 1 ? 'item' : 'items'}]
        </span>
      );
    }
    return null;
  };

  return (
    <div className="select-none" data-json-path={node.path}>
      <div
        className={`flex items-center py-0.5 px-2 rounded cursor-pointer transition-colors group hover:bg-gray-700/50 ${
          isHighlighted ? 'bg-yellow-500/20 ring-1 ring-yellow-500/50' : ''
        }`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
      >
        <span className="w-5 h-5 flex items-center justify-center mr-1">
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-500" />
            )
          ) : null}
        </span>

        <TypeIcon type={node.type} />

        <span className="ml-2 text-blue-400 font-mono text-sm">{node.key}</span>

        {node.key !== '$' && <span className="text-gray-500 mx-1">:</span>}

        <span className="ml-1 font-mono text-sm">{renderValue()}</span>
      </div>

      {isExpanded && hasChildren && (
        <div>
          {node.children!.map((child, index) => (
            <TreeNodeComponent key={`${child.path}-${index}`} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export const TreeNode = memo(TreeNodeComponent);
