import { cn } from '@/lib/utils'
import { Inbox } from 'lucide-react'
import { ReactNode } from 'react'

export interface EmptyProps {
  icon?: ReactNode
  title?: string
  description?: string
  action?: ReactNode
  className?: string
}

export default function Empty({
  icon,
  title = '暂无数据',
  description,
  action,
  className,
}: EmptyProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-16 px-4 text-center',
        className
      )}
    >
      <div className="mb-4 text-gray-300">
        {icon || <Inbox className="w-16 h-16" />}
      </div>
      <h3 className="text-lg font-medium text-gray-700 mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-gray-500 max-w-sm mb-6">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
