import { useState, useCallback, useRef, useEffect } from 'react';
import { Header } from '@/components/Header';
import { JsonEditor } from '@/components/JsonEditor';
import { TreeView } from '@/components/TreeView';
import { ContextMenu } from '@/components/ContextMenu';
import { CompareMode } from '@/components/CompareMode';
import { TableMode } from '@/components/TableMode';
import { useJsonStore } from '@/store/jsonStore';
import { GripVertical } from 'lucide-react';

export default function Home() {
  const { viewMode, jsonText, setJsonText, treeData, parseError, setContextMenu } = useJsonStore();
  const [splitPosition, setSplitPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const handleMouseDown = useCallback(() => {
    isDragging.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const position = ((e.clientX - rect.left) / rect.width) * 100;
      setSplitPosition(Math.min(Math.max(position, 10), 90));
    },
    []
  );

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, []);

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const handleContainerClick = () => {
    setContextMenu({ visible: false, x: 0, y: 0, node: null });
  };

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-white overflow-hidden">
      <Header />

      <main
        ref={containerRef}
        className="flex-1 overflow-hidden"
        onClick={handleContainerClick}
      >
        {viewMode === 'view' && (
          <div className="h-full flex">
            <div
              className="h-full flex flex-col border-r border-gray-700"
              style={{ width: `${splitPosition}%` }}
            >
              <div className="px-4 py-2 bg-gray-800/50 border-b border-gray-700 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-sm text-gray-400">JSON 编辑器</span>
              </div>
              <div className="flex-1 overflow-hidden">
                <JsonEditor value={jsonText} onChange={setJsonText} error={parseError} />
              </div>
            </div>

            <div
              className="w-1 bg-gray-700 hover:bg-blue-500 cursor-col-resize flex items-center justify-center transition-colors group"
              onMouseDown={handleMouseDown}
            >
              <GripVertical className="w-3 h-3 text-gray-500 group-hover:text-blue-400" />
            </div>

            <div
              className="h-full"
              style={{ width: `${100 - splitPosition}%` }}
            >
              <TreeView treeData={treeData} />
            </div>
          </div>
        )}

        {viewMode === 'compare' && <CompareMode />}

        {viewMode === 'table' && <TableMode />}
      </main>

      <ContextMenu />
    </div>
  );
}
