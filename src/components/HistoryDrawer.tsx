import { useState, useEffect } from 'react';
import { X, Clock, Play, Trash2, Database as DbIcon } from 'lucide-react';
import { getProgress } from '@/utils/indexedDB';
import { useEditorStore } from '@/stores/useEditorStore';
import { useSqlStore } from '@/stores/useSqlStore';
import type { QueryHistoryItem } from '@/types';
import { cn } from '@/lib/utils';
import { databases } from '@/data/databases';

interface HistoryDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function HistoryDrawer({ open, onClose }: HistoryDrawerProps) {
  const { setSql, setShowHistory } = useEditorStore();
  const { switchDatabase } = useSqlStore();
  const [history, setHistory] = useState<QueryHistoryItem[]>([]);

  useEffect(() => {
    if (open) {
      getProgress().then((p) => setHistory(p.queryHistory));
    }
  }, [open]);

  const handleSelect = (item: QueryHistoryItem) => {
    setSql(item.sql, true);
    switchDatabase(item.databaseId);
    setShowHistory(false);
    onClose();
  };

  const getDbName = (id: string) => {
    return databases.find((d) => d.id === id)?.name ?? id;
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 w-96 bg-white dark:bg-gray-800 shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-200">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <h2 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            历史查询
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-auto">
          {history.length === 0 ? (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              <Clock className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p>暂无历史记录</p>
              <p className="text-sm mt-1">运行查询后会自动保存</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors group"
                  onClick={() => handleSelect(item)}
                >
                  <div className="flex items-start gap-2">
                    <Play className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <pre className="text-sm text-gray-700 dark:text-gray-300 font-mono whitespace-pre-wrap break-all line-clamp-3">
                        {item.sql}
                      </pre>
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <DbIcon className="w-3 h-3" />
                          {getDbName(item.databaseId)}
                        </span>
                        <span>
                          {item.result?.error ? (
                            <span className="text-red-500">错误</span>
                          ) : (
                            <span>{item.result?.rows?.length ?? 0} 行</span>
                          )}
                        </span>
                        <span>
                          {new Date(item.executedAt).toLocaleString('zh-CN', {
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
