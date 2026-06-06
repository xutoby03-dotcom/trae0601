import { useState, useEffect, useCallback, useRef } from 'react';
import { Search, X, AlertCircle, ChevronUp, ChevronDown } from 'lucide-react';
import { JSONPath } from 'jsonpath-plus';
import { useJsonStore } from '@/store/jsonStore';
import { normalizeJsonPath, getParentPaths } from '@/utils/jsonUtils';

export function SearchBar() {
  const {
    searchPath,
    setSearchPath,
    parsedData,
    setHighlightedPaths,
    setMatchedPaths,
    matchedPaths,
    currentMatchIndex,
    goToNextMatch,
    goToPrevMatch,
    setCurrentMatchIndex,
  } = useJsonStore();
  const [localValue, setLocalValue] = useState(searchPath);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const executeSearch = useCallback(
    (path: string, scrollToFirst: boolean = true) => {
      if (!path || !parsedData) {
        setHighlightedPaths(new Set());
        setMatchedPaths([]);
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
        const uniquePaths = [...new Set(normalizedPaths)];
        const highlightedSet = new Set(uniquePaths);

        setHighlightedPaths(highlightedSet);
        setMatchedPaths(uniquePaths);

        if (uniquePaths.length > 0) {
          const { expandedPaths: currentExpanded } = useJsonStore.getState();
          const newExpanded = new Set(currentExpanded);

          uniquePaths.forEach((p) => {
            const parents = getParentPaths(p);
            parents.forEach((parent) => newExpanded.add(parent));
            newExpanded.add(p);
          });

          useJsonStore.setState({ expandedPaths: newExpanded });

          if (scrollToFirst) {
            setTimeout(() => {
              const firstPath = uniquePaths[0];
              const element = document.querySelector(`[data-json-path="${CSS.escape(firstPath)}"]`);
              if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            }, 100);
          }
        }

        setError(null);
      } catch (e) {
        setError((e as Error).message);
        setHighlightedPaths(new Set());
        setMatchedPaths([]);
      }
    },
    [parsedData, setHighlightedPaths, setMatchedPaths]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      executeSearch(localValue);
      setSearchPath(localValue);
    }, 150);
    return () => clearTimeout(timer);
  }, [localValue, executeSearch, setSearchPath]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      executeSearch(localValue);
      setSearchPath(localValue);
    }
  };

  const handleClear = () => {
    setLocalValue('');
    setSearchPath('');
    setHighlightedPaths(new Set());
    setMatchedPaths([]);
    setError(null);
    inputRef.current?.focus();
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    goToPrevMatch();
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    goToNextMatch();
  };

  return (
    <div className="relative flex-1 max-w-xl">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="输入 JSONPath，如 $.users[0].name"
          className="w-full pl-10 pr-40 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 font-mono"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {matchedPaths.length > 0 && (
            <div className="flex items-center gap-1 bg-gray-700 rounded px-1 py-0.5">
              <button
                onClick={handlePrev}
                className="p-0.5 text-gray-400 hover:text-white hover:bg-gray-600 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                disabled={matchedPaths.length === 0}
                title="上一个"
              >
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs text-gray-300 font-mono min-w-12 text-center">
                {currentMatchIndex >= 0 ? `${currentMatchIndex + 1}/${matchedPaths.length}` : `${matchedPaths.length}`} 匹配
              </span>
              <button
                onClick={handleNext}
                className="p-0.5 text-gray-400 hover:text-white hover:bg-gray-600 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                disabled={matchedPaths.length === 0}
                title="下一个"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          {localValue && (
            <button
              onClick={handleClear}
              className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors ml-1"
              title="清除"
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
