import { useState } from 'react';
import { Eye, GitCompare, Table, Download, ChevronDown, FileJson, FileText } from 'lucide-react';
import { ViewMode } from '@/types';
import { useJsonStore } from '@/store/jsonStore';
import { SearchBar } from './SearchBar';
import { formatJson, jsonToYaml, downloadFile } from '@/utils/jsonUtils';

export function Header() {
  const { viewMode, setViewMode, parsedData } = useJsonStore();
  const [showExportMenu, setShowExportMenu] = useState(false);

  const tabs: { mode: ViewMode; label: string; icon: React.ReactNode }[] = [
    { mode: 'view', label: '视图', icon: <Eye className="w-4 h-4" /> },
    { mode: 'compare', label: '对比', icon: <GitCompare className="w-4 h-4" /> },
    { mode: 'table', label: '表格', icon: <Table className="w-4 h-4" /> },
  ];

  const handleExportJson = () => {
    if (!parsedData) return;
    const content = formatJson(parsedData);
    downloadFile(content, 'data.json', 'application/json');
    setShowExportMenu(false);
  };

  const handleExportYaml = () => {
    if (!parsedData) return;
    const content = jsonToYaml(parsedData);
    downloadFile(content, 'data.yaml', 'text/yaml');
    setShowExportMenu(false);
  };

  return (
    <header className="h-14 bg-gray-800 border-b border-gray-700 flex items-center px-4 gap-4 flex-shrink-0">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
          <FileJson className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-lg font-semibold text-white">JSON 可视化工具</h1>
      </div>

      <div className="h-6 w-px bg-gray-700" />

      <div className="flex items-center bg-gray-900 rounded-lg p-1">
        {tabs.map((tab) => (
          <button
            key={tab.mode}
            onClick={() => setViewMode(tab.mode)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              viewMode === tab.mode
                ? 'bg-gray-700 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {viewMode === 'view' && <SearchBar />}

      <div className="flex-1" />

      <div className="relative">
        <button
          onClick={() => setShowExportMenu(!showExportMenu)}
          disabled={!parsedData}
          className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Download className="w-4 h-4" />
          导出
          <ChevronDown className="w-4 h-4" />
        </button>

        {showExportMenu && (
          <div className="absolute right-0 top-full mt-1 w-40 bg-gray-800 border border-gray-700 rounded-lg shadow-xl py-1 z-50">
            <button
              onClick={handleExportJson}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-200 hover:bg-gray-700 transition-colors"
            >
              <FileJson className="w-4 h-4 text-yellow-400" />
              导出 JSON
            </button>
            <button
              onClick={handleExportYaml}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-200 hover:bg-gray-700 transition-colors"
            >
              <FileText className="w-4 h-4 text-green-400" />
              导出 YAML
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
