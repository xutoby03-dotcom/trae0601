import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

export interface Column<T> {
  key: string
  title: string
  width?: string
  render?: (row: T) => ReactNode
}

export interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  onRowClick?: (row: T) => void
  className?: string
}

export default function DataTable<T extends object>({
  columns,
  data,
  onRowClick,
  className,
}: DataTableProps<T>) {
  return (
    <div className={cn('w-full overflow-hidden rounded-xl border border-gray-200 bg-white', className)}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                  style={{ width: column.width }}
                >
                  {column.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={cn(
                  'transition-colors duration-150',
                  rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50/50',
                  onRowClick && 'cursor-pointer hover:bg-primary-50/50'
                )}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-3.5 text-sm text-gray-700">
                    {column.render
                      ? column.render(row)
                      : String((row as Record<string, unknown>)[column.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
