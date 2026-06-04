import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  ColumnDef,
  SortingState,
  flexRender,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Search, ChevronUp, ChevronDown, ArrowUpDown, Copy, Check, AlertCircle, Info } from 'lucide-react';
import { useEditorStore } from '@/stores/useEditorStore';
import { cn } from '@/lib/utils';

export function ResultTable() {
  const { result, isExecuting } = useEditorStore();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
  const [copiedCell, setCopiedCell] = useState<string | null>(null);
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const columns = useMemo<ColumnDef<any>[]>(() => {
    if (!result?.columns?.length) return [];
    return result.columns.map((col) => ({
      id: col,
      accessorKey: col,
      header: () => col,
      cell: ({ getValue }) => {
        const value = getValue();
        return value;
      },
    }));
  }, [result?.columns]);

  const data = useMemo(() => {
    if (!result?.rows?.length || !result?.columns?.length) return [];
    return result.rows.map((row) => {
      const obj: Record<string, any> = {};
      result.columns.forEach((col, idx) => {
        obj[col] = row[idx];
      });
      return obj;
    });
  }, [result?.rows, result?.columns]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const { rows } = table.getRowModel();

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 32,
    overscan: 20,
  });

  const virtualRows = rowVirtualizer.getVirtualItems();

  const handleCopyCell = useCallback(async (value: any) => {
    const text = value === null ? 'NULL' : String(value);
    await navigator.clipboard.writeText(text);
    setCopiedCell(text);
    setTimeout(() => setCopiedCell(null), 1500);
  }, []);

  const formatValue = (value: any) => {
    if (value === null) {
      return <span className="italic text-gray-400 dark:text-gray-500">NULL</span>;
    }
    if (typeof value === 'number') {
      return value.toLocaleString();
    }
    return String(value);
  };

  if (!result) {
    return (
      <div className="h-full flex items-center justify-center bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <Info className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>运行SQL查询来查看结果</p>
          <p className="text-sm mt-1">按 F5 或点击运行按钮</p>
        </div>
      </div>
    );
  }

  if (result.error) {
    return (
      <div className="h-full flex items-center justify-center bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
        <div className="text-center text-red-500 dark:text-red-400 max-w-lg px-4">
          <AlertCircle className="w-12 h-12 mx-auto mb-3" />
          <p className="font-semibold mb-2">查询错误</p>
          <p className="font-mono text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded text-left overflow-auto">
            {result.error}
          </p>
        </div>
      </div>
    );
  }

  if (result.affectedRows !== undefined && result.rows.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <Check className="w-12 h-12 mx-auto mb-2 text-green-500" />
          <p>执行成功</p>
          <p className="text-sm mt-1">影响行数: {result.affectedRows}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-2 p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="flex-1 flex items-center gap-2">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="搜索结果..."
            value={globalFilter ?? ''}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400"
          />
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {rows.length} 行 | {result.executionTime.toFixed(2)}ms
        </div>
      </div>

      <div
        ref={tableContainerRef}
        className="flex-1 overflow-auto"
        onWheel={(e) => {
          if (e.ctrlKey) e.preventDefault();
        }}
      >
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-gray-100 dark:bg-gray-800 z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-3 py-2 text-left font-medium text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 select-none"
                    style={{ minWidth: '120px' }}
                  >
                    <div
                      className={cn(
                        'flex items-center gap-1 cursor-pointer hover:text-gray-900 dark:hover:text-white',
                        header.column.getCanSort() && 'cursor-pointer'
                      )}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      <span className="ml-auto">
                        {header.column.getIsSorted() === 'asc' ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : header.column.getIsSorted() === 'desc' ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 opacity-50" />
                        )}
                      </span>
                    </div>
                    <input
                      type="text"
                      placeholder="过滤..."
                      value={columnFilters[header.id] ?? ''}
                      onChange={(e) => {
                        setColumnFilters((prev) => ({
                          ...prev,
                          [header.id]: e.target.value,
                        }));
                        header.column.setFilterValue(e.target.value || undefined);
                      }}
                      className="mt-1 w-full px-2 py-0.5 text-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded outline-none focus:border-blue-500"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {virtualRows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-3 py-8 text-center text-gray-500">
                  没有匹配的结果
                </td>
              </tr>
            ) : (
              virtualRows.map((virtualRow) => {
                const row = rows[virtualRow.index];
                return (
                  <tr
                    key={row.id}
                    className={cn(
                      'border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors',
                      virtualRow.index % 2 === 0 && 'bg-gray-50/50 dark:bg-gray-800/30'
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="px-3 py-1.5 text-gray-700 dark:text-gray-300 cursor-pointer group whitespace-nowrap overflow-hidden text-ellipsis"
                        style={{ maxWidth: '200px' }}
                        onClick={() => handleCopyCell(cell.getValue())}
                        title={cell.getValue() === null ? 'NULL' : String(cell.getValue())}
                      >
                        <div className="flex items-center gap-1">
                          <span className="flex-1 truncate">
                            {formatValue(cell.getValue())}
                          </span>
                          <Copy
                            className={cn(
                              'w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0',
                              copiedCell === String(cell.getValue()) && 'opacity-100 text-green-500'
                            )}
                          />
                        </div>
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
