import { cn } from '@/lib/utils'

type StatusType = 'normal' | 'abnormal' | 'warning' | 'pending' | 'resolved' | 'fermenting' | 'completed'

interface StatusBadgeProps {
  status: StatusType
  children?: React.ReactNode
}

const statusStyles: Record<StatusType, string> = {
  normal: 'bg-green-100 text-green-800',
  resolved: 'bg-green-100 text-green-800',
  completed: 'bg-green-100 text-green-800',
  abnormal: 'bg-red-100 text-red-800 animate-pulseRed',
  pending: 'bg-red-100 text-red-800',
  warning: 'bg-yellow-100 text-yellow-800',
  fermenting: 'bg-blue-100 text-blue-800',
}

const statusText: Record<StatusType, string> = {
  normal: '正常',
  abnormal: '异常',
  warning: '警告',
  pending: '待处理',
  resolved: '已解决',
  fermenting: '发酵中',
  completed: '已完成',
}

export default function StatusBadge({ status, children }: StatusBadgeProps) {
  return (
    <span className={cn('inline-flex items-center rounded px-2.5 py-0.5 text-xs font-medium', statusStyles[status])}>
      {children ?? statusText[status]}
    </span>
  )
}
