import { useEffect, useRef } from 'react';
import { Copy, Link, FileCode, ChevronRight } from 'lucide-react';
import { useJsonStore } from '@/store/jsonStore';
import { copyToClipboard, formatJson } from '@/utils/jsonUtils';

export function ContextMenu() {
  const { contextMenu, setContextMenu } = useJsonStore();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setContextMenu({ visible: false, x: 0, y: 0, node: null });
      }
    };

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setContextMenu({ visible: false, x: 0, y: 0, node: null });
      }
    };

    if (contextMenu.visible) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEsc);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [contextMenu.visible, setContextMenu]);

  if (!contextMenu.visible || !contextMenu.node) return null;

  const node = contextMenu.node;

  const handleCopyPath = async () => {
    await copyToClipboard(node.path);
    setContextMenu({ visible: false, x: 0, y: 0, node: null });
  };

  const handleCopyValue = async () => {
    const valueStr = typeof node.value === 'string' ? node.value : formatJson(node.value);
    await copyToClipboard(valueStr);
    setContextMenu({ visible: false, x: 0, y: 0, node: null });
  };

  const handleCopySubtree = async () => {
    await copyToClipboard(formatJson(node.value));
    setContextMenu({ visible: false, x: 0, y: 0, node: null });
  };

  const menuStyle: React.CSSProperties = {
    left: contextMenu.x,
    top: contextMenu.y,
  };

  return (
    <div
      ref={menuRef}
      className="fixed z-50 min-w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl py-1"
      style={menuStyle}
    >
      <button
        onClick={handleCopyPath}
        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-200 hover:bg-gray-700 transition-colors"
      >
        <Link className="w-4 h-4 text-gray-400" />
        <span>复制路径</span>
        <span className="ml-auto text-xs text-gray-500 font-mono">{node.path}</span>
      </button>
      <button
        onClick={handleCopyValue}
        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-200 hover:bg-gray-700 transition-colors"
      >
        <Copy className="w-4 h-4 text-gray-400" />
        <span>复制值</span>
      </button>
      <button
        onClick={handleCopySubtree}
        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-200 hover:bg-gray-700 transition-colors"
      >
        <FileCode className="w-4 h-4 text-gray-400" />
        <span>复制子树 JSON</span>
      </button>
    </div>
  );
}
