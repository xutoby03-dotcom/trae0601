import { useEffect, useCallback, useState } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { SchemaTree } from '@/components/SchemaTree';
import { SqlEditor } from '@/components/SqlEditor';
import { ResultTable } from '@/components/ResultTable';
import { ProblemPanel } from '@/components/ProblemPanel';
import { Toolbar } from '@/components/Toolbar';
import { ExecutionPlan } from '@/components/ExecutionPlan';
import { HistoryDrawer } from '@/components/HistoryDrawer';
import { useSqlStore } from '@/stores/useSqlStore';
import { useEditorStore } from '@/stores/useEditorStore';
import { Database, Play } from 'lucide-react';

export default function Home() {
  const { initializeSqlEngine, isInitializing, initError } = useSqlStore();
  const { theme, sql, undo, redo, canUndo, canRedo } = useEditorStore();
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);

  useEffect(() => {
    initializeSqlEngine();
  }, [initializeSqlEngine]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'F5' || (e.ctrlKey && e.key === 'Enter')) {
        e.preventDefault();
        const runButton = document.querySelector('[title="运行 (F5)"]') as HTMLButtonElement;
        if (runButton) runButton.click();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo) undo();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        if (canRedo) redo();
      }
    },
    [canUndo, canRedo, undo, redo]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (initError) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center p-8">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
            SQL 引擎初始化失败
          </h2>
          <p className="text-gray-600 dark:text-gray-400">{initError}</p>
          <p className="text-sm text-gray-500 mt-4">请刷新页面重试</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <header className="flex items-center justify-between px-4 py-2 bg-gradient-to-r from-slate-800 to-slate-900 text-white">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Database className="w-6 h-6 text-cyan-400" />
            <h1 className="text-lg font-bold">SQL Practice Platform</h1>
          </div>
          <span className="text-xs text-gray-400 hidden sm:block">
            基于 sql.js 的浏览器端 SQL 练习平台
          </span>
        </div>
        <div className="flex items-center gap-4">
          {isInitializing && (
            <div className="flex items-center gap-2 text-sm text-cyan-400">
              <div className="w-3 h-3 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
              初始化中...
            </div>
          )}
          <button
            onClick={() => setShowLeftPanel(!showLeftPanel)}
            className="px-2 py-1 text-sm hover:bg-white/10 rounded transition-colors"
            title="切换左侧面板"
          >
            {showLeftPanel ? '◀' : '▶'}
          </button>
          <button
            onClick={() => setShowRightPanel(!showRightPanel)}
            className="px-2 py-1 text-sm hover:bg-white/10 rounded transition-colors"
            title="切换右侧面板"
          >
            {showRightPanel ? '▶' : '◀'}
          </button>
        </div>
      </header>

      <Toolbar
        onToggleHistory={() => setShowHistoryDrawer((v) => !v)}
        onToggleSettings={() => {}}
      />

      <div className="flex-1 flex overflow-hidden">
        <PanelGroup direction="horizontal">
          {showLeftPanel && (
            <>
              <Panel defaultSize={20} minSize={15} maxSize={40}>
                <SchemaTree />
              </Panel>
              <PanelResizeHandle className="w-1 bg-gray-200 dark:bg-gray-700 hover:bg-cyan-500 dark:hover:bg-cyan-500 transition-colors cursor-col-resize" />
            </>
          )}

          <Panel>
            <PanelGroup direction="vertical">
              <Panel defaultSize={50} minSize={20}>
                <div className="h-full flex flex-col">
                  <div className="flex-1 relative">
                    <SqlEditor />
                    {isInitializing && (
                      <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                          <p className="text-sm text-gray-500">正在初始化 SQL 引擎...</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <ExecutionPlan />
                </div>
              </Panel>
              <PanelResizeHandle className="h-1 bg-gray-200 dark:bg-gray-700 hover:bg-cyan-500 dark:hover:bg-cyan-500 transition-colors cursor-row-resize" />
              <Panel defaultSize={50} minSize={20}>
                <ResultTable />
              </Panel>
            </PanelGroup>
          </Panel>

          {showRightPanel && (
            <>
              <PanelResizeHandle className="w-1 bg-gray-200 dark:bg-gray-700 hover:bg-cyan-500 dark:hover:bg-cyan-500 transition-colors cursor-col-resize" />
              <Panel defaultSize={25} minSize={15} maxSize={40}>
                <ProblemPanel />
              </Panel>
            </>
          )}
        </PanelGroup>
      </div>

      <HistoryDrawer open={showHistoryDrawer} onClose={() => setShowHistoryDrawer(false)} />

      <footer className="px-4 py-1.5 bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-4">
          <span>按 F5 或 Ctrl+Enter 运行查询</span>
          <span>|</span>
          <span>sql.js (SQLite)</span>
        </div>
        <div className="flex items-center gap-2">
          <span>SQL 长度: {sql.length}</span>
        </div>
      </footer>
    </div>
  );
}
