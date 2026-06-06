import { useState, useEffect, useCallback } from 'react';
import { Search, X, AlertCircle } from 'lucide-react';
import { JSONPath } from 'jsonpath-plus';
import { useJsonStore } from '@/store/jsonStore';
import { normalizeJsonPath, getParentPaths } from '@/utils/jsonUtils';

export function SearchBar() {
  const { searchPath, setSearchPath, parsedData, setHighlightedPaths, expandedPaths } = useJsonStore();
  const [localValue, setLocalValue] = useState(searchPath);
  const [error, setError] = useState<string | null>(null);
  const [matchCount, setMatchCount] = useState(0);

  const executeSearch = useCallback(
    (path: string) => {
      if (!path || !parsedData) {
        setHighlightedPaths(new Set());
        setMatchCount(0);
        setError(null);
        return;
      }

      try {
        const results = JSONPath({
          path,
          json: parsedData,
          resultType: 'path',
        });

        const rawPaths = results as string[];
        const normalizedPaths = rawPaths.map(normalizeJsonPath);
        const highlightedSet = new Set(normalizedPaths);

        setHighlightedPaths(highlightedSet);
        setMatchCount(highlightedSet.size);

        if (highlightedSet.size > 0) {
          const { expandedPaths: currentExpanded, toggleExpand } = useJsonStore.getState();
          const newExpanded = new Set(currentExpanded);

          normalizedPaths.forEach((p) => {
            const parents = getParentPaths(p);
            parents.forEach((parent) => newExpanded.add(parent));
            newExpanded.add(p);
          });

          useJsonStore.setState({ expandedPaths: newExpanded });

          setTimeout(() => {
            const firstPath = normalizedPaths[0];
            const element = document.querySelector(`[data-json-path="${CSS.escape(firstPath)}"]`);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }, 100);
        }

        setError(null);
      } catch (e) {
        setError((e as Error).message);
        setHighlightedPaths(new Set());
        setMatchCount(0);
      }
    },
    [parsedData, setHighlightedPaths]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      executeSearch(localValue);
      setSearchPath(localValue);
    }, 300);
    return () => clearTimeout(timer);
  }, [localValue, executeSearch, setSearchPath]);

  const handleClear = () => {
    setLocalValue('');
    setSearchPath('');
    setHighlightedPaths(new Set());
    setMatchCount(0);
    setError(null);
  };

  return (
    <div className="relative flex-1 max-w-xl">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          placeholder="输入 JSONPath，如 $.users[0].name"
          className="w-full pl-10 pr-24 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 font-mono"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {matchCount > 0 && (
            <span className="text-xs text-gray-400 bg-gray-700 px-2 py-0.5 rounded">
              {matchCount} 匹配
            </span>
          )}
          {localValue && (
            <button
              onClick={handleClear}
              className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      {error && (
        <div className="absolute top-full left-0 right-0 mt-1 flex items-center gap-2 text-xs text-red-400 bg-red-900/30 px-3 py-1.5 rounded-lg border border-red-500/30">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="font-mono truncate">{error}</span>
        </div>
      )}
    </div>
  );
}
