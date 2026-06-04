import { useState, useCallback } from 'react';
import {
  Play,
  RotateCcw,
  Undo2,
  Redo2,
  Save,
  History,
  Settings,
  Sun,
  Moon,
  Download,
  Upload,
  Trash2,
  FileText,
  Zap,
} from 'lucide-react';
import { useEditorStore } from '@/stores/useEditorStore';
import { useSqlStore } from '@/stores/useSqlStore';
import { format } from 'sql-formatter';
import { exportData, importData, clearAllData, getProgress, addToHistory } from '@/utils/indexedDB';
import { checkProblemMatch } from '@/utils/sqlHelper';
import { cn } from '@/lib/utils';

interface ToolbarProps {
  onToggleHistory?: () => void;
  onToggleSettings?: () => void;
}

export function Toolbar({ onToggleHistory, onToggleSettings }: ToolbarProps) {
  const {
    sql,
    setSql,
    theme,
    toggleTheme,
    setResult,
    setIsExecuting,
    currentProblemId,
    setProblemResultMatch,
    showExecutionPlan,
    setShowExecutionPlan,
    canUndo,
    canRedo,
    undo,
    redo,
  } = useEditorStore();
  const { executeQuery, currentDatabaseId, isInitializing } = useSqlStore();
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [queryName, setQueryName] = useState('');
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState('');

  const handleRunQuery = useCallback(async () => {
    if (!sql.trim() || isInitializing) return;

    setIsExecuting(true);
    const result = await executeQuery(sql);
    setResult(result);
    setIsExecuting(false);

    await addToHistory({
      id: Date.now().toString(),
      sql,
      databaseId: currentDatabaseId,
      result,
      executedAt: Date.now(),
    });

    await checkProblemMatch({
      currentProblemId,
      result,
      executeQuery,
      onMatchChange: setProblemResultMatch,
    });
  }, [sql, executeQuery, setResult, setIsExecuting, currentDatabaseId, currentProblemId, setProblemResultMatch, isInitializing]);

  const handleFormat = useCallback(() => {
    try {
      const formatted = format(sql, {
        language: 'sqlite',
        keywordCase: 'upper',
        indentStyle: 'standard',
        tabWidth: 2,
        linesBetweenQueries: 2,
      });
      setSql(formatted);
    } catch (e) {
      console.error('Format error:', e);
    }
  }, [sql, setSql]);

  const handleSaveQuery = useCallback(() => {
    setShowSaveModal(true);
    setQueryName(`查询 ${new Date().toLocaleString('zh-CN')}`);
  }, []);

  const handleConfirmSave = useCallback(async () => {
    if (!queryName.trim()) return;
    const { saveQuery } = await import('@/utils/indexedDB');
    await saveQuery({
      id: Date.now().toString(),
      name: queryName,
      sql,
      databaseId: currentDatabaseId,
      createdAt: Date.now(),
    });
    setShowSaveModal(false);
    setQueryName('');
  }, [queryName, sql, currentDatabaseId]);

  const handleExport = useCallback(async () => {
    const data = await exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sql-practice-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExportModal(false);
  }, []);

  const handleImport = useCallback(async () => {
    const success = await importData(importText);
    if (success) {
      setShowImportModal(false);
      setImportText('');
      window.location.reload();
    } else {
      alert('导入失败：无效的数据格式');
    }
  }, [importText]);

  const handleClearData = useCallback(async () => {
    if (confirm('确定要清除所有数据吗？此操作不可撤销！')) {
      await clearAllData();
      window.location.reload();
    }
  }, []);

  return (
    <>
      <div className="flex items-center gap-1 px-3 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={handleRunQuery}
          disabled={isInitializing}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-colors',
            isInitializing
              ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700 text-white'
          )}
          title="运行 (F5)"
        >
          <Play className="w-4 h-4" />
          运行
        </button>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

        <button
          onClick={handleFormat}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          title="格式化 SQL"
        >
          <FileText className="w-4 h-4" />
          格式化
        </button>

        <button
          onClick={undo}
          disabled={!canUndo}
          className={cn(
            'flex items-center gap-1 px-2.5 py-1.5 rounded text-sm transition-colors',
            canUndo
              ? 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              : 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
          )}
          title="撤销 (Ctrl+Z)"
        >
          <Undo2 className="w-4 h-4" />
          撤销
        </button>

        <button
          onClick={redo}
          disabled={!canRedo}
          className={cn(
            'flex items-center gap-1 px-2.5 py-1.5 rounded text-sm transition-colors',
            canRedo
              ? 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              : 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
          )}
          title="重做 (Ctrl+Y)"
        >
          <Redo2 className="w-4 h-4" />
          重做
        </button>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

        <button
          onClick={handleSaveQuery}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          title="保存查询"
        >
          <Save className="w-4 h-4" />
          保存
        </button>

        <button
          onClick={onToggleHistory}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          title="历史记录"
        >
          <History className="w-4 h-4" />
          历史
        </button>

        <button
          onClick={() => setShowExecutionPlan(!showExecutionPlan)}
          className={cn(
            'flex items-center gap-1 px-2.5 py-1.5 rounded text-sm transition-colors',
            showExecutionPlan
              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          )}
          title="执行计划"
        >
          <Zap className="w-4 h-4" />
          执行计划
        </button>

        <div className="flex-1" />

        <button
          onClick={toggleTheme}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          title="切换主题"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        <button
          onClick={() => setShowExportModal(true)}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          title="导出数据"
        >
          <Download className="w-4 h-4" />
        </button>

        <button
          onClick={() => setShowImportModal(true)}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          title="导入数据"
        >
          <Upload className="w-4 h-4" />
        </button>

        <button
          onClick={onToggleSettings}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          title="设置"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {showSaveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 shadow-xl">
            <h3 className="font-semibold text-lg mb-4 text-gray-800 dark:text-gray-200">保存查询</h3>
            <input
              type="text"
              value={queryName}
              onChange={(e) => setQueryName(e.target.value)}
              placeholder="输入查询名称..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 mb-4"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowSaveModal(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                取消
              </button>
              <button
                onClick={handleConfirmSave}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {showExportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 shadow-xl">
            <h3 className="font-semibold text-lg mb-4 text-gray-800 dark:text-gray-200">导出数据</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              导出所有学习进度、保存的查询和历史记录。
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                取消
              </button>
              <button
                onClick={handleExport}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                导出
              </button>
            </div>
          </div>
        </div>
      )}

      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 shadow-xl">
            <h3 className="font-semibold text-lg mb-4 text-gray-800 dark:text-gray-200">导入数据</h3>
            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder="粘贴导出的 JSON 数据..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 mb-4 h-32 font-mono text-xs"
            />
            <div className="flex justify-between">
              <button
                onClick={handleClearData}
                className="px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                清除所有数据
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  取消
                </button>
                <button
                  onClick={handleImport}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  导入
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
