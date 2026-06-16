import { type BoxStatus } from '@/hooks/useStore'

const statusConfig: Record<BoxStatus, { label: string; className: string }> = {
  in_stock: { label: '在库', className: 'bg-blue-100 text-blue-800' },
  in_use: { label: '使用中', className: 'bg-green-100 text-green-800' },
  used_up: { label: '已用完', className: 'bg-gray-100 text-gray-600' },
  suspended: { label: '已暂停', className: 'bg-red-100 text-red-700' },
}

export default function StatusBadge({ status }: { status: BoxStatus }) {
  const config = statusConfig[status]
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  )
}
