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
import { Search, ChevronUp, ChevronDown, ArrowUpDown, Copy, Check, AlertCircle, Info, Filter } from 'lucide-react';
import { useEditorStore } from '@/stores/useEditorStore';
import { cn } from '@/lib/utils';

export function ResultTable() {
  const { result } = useEditorStore();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
  const [copiedCell, setCopiedCell] = useState<string | null>(null);
  const [openFilterCol, setOpenFilterCol] = useState<string | null>(null);
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const resizingCol = useRef<string | null>(null);
  const resizeStartX = useRef(0);
  const resizeStartW = useRef(0);

  const columns = useMemo<ColumnDef<any>[]>(() => {
    if (!result?.columns?.length) return [];
    return result.columns.map((col) => ({
      id: col,
      accessorKey: col,
      header: () => col,
      cell: ({ getValue }) => getValue(),
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
    state: { sorting, globalFilter },
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

  const handleResizeMouseDown = useCallback(
    (e: React.MouseEvent, colId: string) => {
      e.preventDefault();
      e.stopPropagation();
      resizingCol.current = colId;
      resizeStartX.current = e.clientX;
      resizeStartW.current = columnWidths[colId] ?? 150;

      const handleMouseMove = (ev: MouseEvent) => {
        if (!resizingCol.current) return;
        const delta = ev.clientX - resizeStartX.current;
        const newW = Math.max(60, resizeStartW.current + delta);
        setColumnWidths((prev) => ({ ...prev, [resizingCol.current!]: newW }));
      };

      const handleMouseUp = () => {
        resizingCol.current = null;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [columnWidths]
  );

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
        <table className="w-full text-sm" style={{ tableLayout: 'fixed' }}>
          <thead className="sticky top-0 bg-gray-100 dark:bg-gray-800 z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const colW = columnWidths[header.id] ?? 150;
                  const isFilterOpen = openFilterCol === header.id;
                  return (
                    <th
                      key={header.id}
                      className="px-3 py-2 text-left font-medium text-gray-700 dark:text-gray-200 border-b border-r border-gray-200 dark:border-gray-700 select-none relative group/th"
                      style={{ width: colW, minWidth: 60 }}
                    >
                      <div
                        className="flex items-center gap-1 cursor-pointer hover:text-gray-900 dark:hover:text-white"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        <span className="ml-auto flex items-center gap-0.5">
                          {header.column.getIsSorted() === 'asc' ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : header.column.getIsSorted() === 'desc' ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ArrowUpDown className="w-3 h-3 opacity-40" />
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenFilterCol(isFilterOpen ? null : header.id);
                            }}
                            className={cn(
                              'p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600',
                              columnFilters[header.id] ? 'text-blue-500' : 'text-gray-400 opacity-0 group-hover/th:opacity-100'
                            )}
                            title="过滤此列"
                          >
                            <Filter className="w-3 h-3" />
                          </button>
                        </span>
                      </div>
                      {isFilterOpen && (
                        <div className="mt-1" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="text"
                            placeholder="过滤..."
                            autoFocus
                            value={columnFilters[header.id] ?? ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setColumnFilters((prev) => ({ ...prev, [header.id]: val }));
                              header.column.setFilterValue(val || undefined);
                            }}
                            className="w-full px-2 py-0.5 text-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded outline-none focus:border-blue-500"
                          />
                        </div>
                      )}
                      <div
                        className="absolute right-0 top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-cyan-400 dark:hover:bg-cyan-400 z-20"
                        onMouseDown={(e) => handleResizeMouseDown(e, header.id)}
                      />
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {virtualRows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-3 py-8 text-center text-gray-500"
                >
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
                        className="px-3 py-1.5 text-gray-700 dark:text-gray-300 group relative border-r border-gray-100 dark:border-gray-800"
                        onDoubleClick={() => handleCopyCell(cell.getValue())}
                        title="双击复制"
                      >
                        <div className="whitespace-pre-wrap break-words text-sm">
                          {formatValue(cell.getValue())}
                        </div>
                        <Copy
                          className={cn(
                            'w-3 h-3 absolute top-1 right-1 opacity-0 group-hover:opacity-60 transition-opacity',
                            copiedCell === String(cell.getValue()) && 'opacity-100 text-green-500'
                          )}
                        />
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
