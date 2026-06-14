import { cn } from '@/lib/utils';

interface Column<T> {
  key: keyof T | string;
  header: string;
  cell?: (item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
  className?: string;
  headerClassName?: string;
  rowClassName?: string;
}

export function DataTable<T extends { id?: string; [key: string]: any }>({
  columns,
  data,
  emptyMessage = '暂无数据',
  className,
  headerClassName,
  rowClassName,
}: DataTableProps<T>) {
  return (
    <div className={cn('overflow-x-auto rounded-2xl bg-white shadow-card', className)}>
      <table className="w-full">
        <thead>
          <tr
            className={cn(
              'bg-slate-50 border-b border-slate-100',
              headerClassName
            )}
          >
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-6 py-12 text-center text-slate-400"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item, index) => (
              <tr
                key={item.id || index}
                className={cn(
                  'hover:bg-slate-50/50 transition-colors',
                  rowClassName
                )}
              >
                {columns.map((col) => (
                  <td
                    key={String(col.key)}
                    className={cn('px-6 py-4 text-sm text-slate-700', col.className)}
                  >
                    {col.cell ? col.cell(item) : String(item[col.key as keyof T] ?? '')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
