import { useMemo, useState } from 'react';
import { Plus, Minus, RefreshCw, Edit3, X, ChevronDown, ChevronUp } from 'lucide-react';
import { JsonEditor } from './JsonEditor';
import { DiffViewer } from './DiffViewer';
import { useJsonStore } from '@/store/jsonStore';
import { diffJson, formatJson } from '@/utils/jsonUtils';

export function CompareMode() {
  const { jsonText, jsonText2, setJsonText, setJsonText2, parsedData, parsedData2, parseError, parseError2 } =
    useJsonStore();
  const [showLeftEditor, setShowLeftEditor] = useState(false);
  const [showRightEditor, setShowRightEditor] = useState(false);

  const formattedLeft = useMemo(() => {
    if (parsedData) return formatJson(parsedData);
    return jsonText;
  }, [parsedData, jsonText]);

  const formattedRight = useMemo(() => {
    if (parsedData2) return formatJson(parsedData2);
    return jsonText2;
  }, [parsedData2, jsonText2]);

  const diffs = useMemo(() => {
    if (!parsedData || !parsedData2) return [];
    return diffJson(parsedData, parsedData2);
  }, [parsedData, parsedData2]);

  const stats = useMemo(() => {
    let added = 0;
    let removed = 0;
    let modified = 0;
    diffs.forEach((d) => {
      if (d.type === 'added') added++;
      else if (d.type === 'removed') removed++;
      else modified++;
    });
    return { added, removed, modified };
  }, [diffs]);

  const showDiffView = !parseError && !parseError2 && parsedData && parsedData2;

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800/50 border-b border-gray-700">
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400 font-medium">JSON 对比</span>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-green-400" />
              <span className="text-sm text-green-400">{stats.added} 新增</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Minus className="w-4 h-4 text-red-400" />
              <span className="text-sm text-red-400">{stats.removed} 删除</span>
            </div>
            <div className="flex items-center gap-1.5">
              <RefreshCw className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-yellow-400">{stats.modified} 修改</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col border-r border-gray-700">
          <div className="px-4 py-2 bg-gray-800/30 border-b border-gray-700 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-sm text-gray-400">原始 JSON (左侧)</span>
            <div className="flex-1" />
            <button
              onClick={() => setShowLeftEditor(!showLeftEditor)}
              className="flex items-center gap-1 px-2 py-1 text-xs text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
            >
              {showLeftEditor ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5" />
                  收起编辑
                </>
              ) : (
                <>
                  <Edit3 className="w-3.5 h-3.5" />
                  编辑
                </>
              )}
            </button>
          </div>

          {showLeftEditor && (
            <div className="h-48 border-b border-gray-700 overflow-hidden flex-shrink-0">
              <JsonEditor value={jsonText} onChange={setJsonText} error={parseError} />
            </div>
          )}

          <div className="flex-1 overflow-hidden">
            {showDiffView ? (
              <DiffViewer oldText={formattedLeft} newText={formattedRight} side="left" />
            ) : (
              <JsonEditor value={jsonText} onChange={setJsonText} error={parseError} />
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          <div className="px-4 py-2 bg-gray-800/30 border-b border-gray-700 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-purple-500" />
            <span className="text-sm text-gray-400">新 JSON (右侧)</span>
            <div className="flex-1" />
            <button
              onClick={() => setShowRightEditor(!showRightEditor)}
              className="flex items-center gap-1 px-2 py-1 text-xs text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
            >
              {showRightEditor ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5" />
                  收起编辑
                </>
              ) : (
                <>
                  <Edit3 className="w-3.5 h-3.5" />
                  编辑
                </>
              )}
            </button>
          </div>

          {showRightEditor && (
            <div className="h-48 border-b border-gray-700 overflow-hidden flex-shrink-0">
              <JsonEditor
                value={jsonText2}
                onChange={setJsonText2}
                error={parseError2}
                placeholder="在此粘贴要对比的 JSON..."
              />
            </div>
          )}

          <div className="flex-1 overflow-hidden">
            {showDiffView ? (
              <DiffViewer oldText={formattedLeft} newText={formattedRight} side="right" />
            ) : (
              <JsonEditor
                value={jsonText2}
                onChange={setJsonText2}
                error={parseError2}
                placeholder="在此粘贴要对比的 JSON..."
              />
            )}
          </div>
        </div>
      </div>

      {diffs.length > 0 && (
        <div className="h-48 border-t border-gray-700 bg-gray-900/50 overflow-hidden flex flex-col">
          <div className="px-4 py-2 bg-gray-800/50 border-b border-gray-700">
            <span className="text-sm text-gray-400 font-medium">差异详情 ({diffs.length})</span>
          </div>
          <div className="flex-1 overflow-auto py-1">
            {diffs.map((diff, index) => (
              <div
                key={index}
                className={`flex items-start gap-3 px-4 py-1.5 text-sm font-mono ${
                  diff.type === 'added'
                    ? 'bg-green-900/20 hover:bg-green-900/30'
                    : diff.type === 'removed'
                    ? 'bg-red-900/20 hover:bg-red-900/30'
                    : 'bg-yellow-900/20 hover:bg-yellow-900/30'
                }`}
              >
                <span
                  className={`flex-shrink-0 w-6 h-6 rounded flex items-center justify-center ${
                    diff.type === 'added'
                      ? 'bg-green-500/20 text-green-400'
                      : diff.type === 'removed'
                      ? 'bg-red-500/20 text-red-400'
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}
                >
                  {diff.type === 'added' && <Plus className="w-3.5 h-3.5" />}
                  {diff.type === 'removed' && <Minus className="w-3.5 h-3.5" />}
                  {diff.type === 'modified' && <RefreshCw className="w-3.5 h-3.5" />}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-blue-400 truncate">{diff.path}</div>
                  {diff.type === 'modified' && (
                    <div className="text-xs mt-0.5">
                      <span className="text-red-400">- {JSON.stringify(diff.oldValue)}</span>
                      <span className="text-gray-600 mx-2">→</span>
                      <span className="text-green-400">+ {JSON.stringify(diff.newValue)}</span>
                    </div>
                  )}
                  {diff.type === 'added' && (
                    <div className="text-xs mt-0.5 text-green-400">+ {JSON.stringify(diff.newValue)}</div>
                  )}
                  {diff.type === 'removed' && (
                    <div className="text-xs mt-0.5 text-red-400">- {JSON.stringify(diff.oldValue)}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
