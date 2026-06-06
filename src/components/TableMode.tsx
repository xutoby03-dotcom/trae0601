import { useMemo, useState } from 'react';
import { useJsonStore } from '@/store/jsonStore';
import { flattenToTable } from '@/utils/jsonUtils';
import { TableColumn, TableRow } from '@/types';
import { ArrowUpDown, Search, Info } from 'lucide-react';

type SortDirection = 'asc' | 'desc' | null;

export function TableMode() {
  const { parsedData } = useJsonStore();
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { columns, rows } = useMemo(() => {
    if (!parsedData) return { columns: [] as TableColumn[], rows: [] as TableRow[] };
    return flattenToTable(parsedData);
  }, [parsedData]);

  const filteredAndSortedRows = useMemo(() => {
    let result = [...rows];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter((row) =>
        Object.values(row).some((val) => String(val ?? '').toLowerCase().includes(term))
      );
    }

    if (sortKey && sortDirection) {
      result.sort((a, b) => {
        const aVal = a[sortKey];
        const bVal = b[sortKey];

        if (aVal === null && bVal === null) return 0;
        if (aVal === null) return 1;
        if (bVal === null) return -1;

        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
        }

        const aStr = String(aVal);
        const bStr = String(bVal);
        return sortDirection === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
      });
    }

    return result;
  }, [rows, sortKey, sortDirection, searchTerm]);

  const handleSort = (key: string) => {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDirection('asc');
    } else {
      if (sortDirection === 'asc') setSortDirection('desc');
      else if (sortDirection === 'desc') {
        setSortDirection(null);
        setSortKey(null);
      } else setSortDirection('asc');
    }
  };

  if (!parsedData) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        请输入有效的 JSON 数据
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-3">
        <Info className="w-12 h-12 text-gray-600" />
        <p>无法转换为表格</p>
        <p className="text-sm">请确保 JSON 包含数组数据</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-900">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800/50 border-b border-gray-700 gap-4">
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400 font-medium">表格视图</span>
          <span className="text-xs text-gray-500">
            {filteredAndSortedRows.length} 行 × {columns.length} 列
          </span>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="搜索..."
            className="pl-9 pr-4 py-1.5 bg-gray-800 border border-gray-700 rounded-md text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 w-56"
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-gray-800 z-10">
            <tr>
              <th className="px-3 py-2 text-left text-gray-400 font-medium border-b border-gray-700 bg-gray-800 w-12">
                #
              </th>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-3 py-2 text-left text-gray-400 font-medium border-b border-gray-700 bg-gray-800 cursor-pointer hover:bg-gray-700/50 transition-colors whitespace-nowrap"
                  onClick={() => handleSort(col.key)}
                >
                  <div className="flex items-center gap-1.5">
                    {col.title}
                    <ArrowUpDown
                      className={`w-3.5 h-3.5 ${
                        sortKey === col.key ? 'text-blue-400' : 'text-gray-600'
                      }`}
                    />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedRows.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={`border-b border-gray-800 ${
                  rowIndex % 2 === 0 ? 'bg-gray-900' : 'bg-gray-900/50'
                } hover:bg-gray-800/50 transition-colors`}
              >
                <td className="px-3 py-2 text-gray-500 font-mono">{rowIndex + 1}</td>
                {columns.map((col) => {
                  const value = row[col.key];
                  const displayValue =
                    value === null || value === undefined
                      ? '-'
                      : typeof value === 'object'
                      ? JSON.stringify(value)
                      : String(value);

                  let valueClass = 'text-gray-300';
                  if (typeof value === 'string') valueClass = 'text-green-400';
                  else if (typeof value === 'number') valueClass = 'text-purple-400';
                  else if (typeof value === 'boolean') valueClass = 'text-red-400';
                  else if (value === null) valueClass = 'text-gray-500';

                  return (
                    <td
                      key={col.key}
                      className={`px-3 py-2 font-mono truncate max-w-xs ${valueClass}`}
                      title={displayValue}
                    >
                      {displayValue}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
