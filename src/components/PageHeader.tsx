import { useApp } from '@/store/app'
import { MapPin, Calendar, Clock, Users, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: React.ReactNode }) {
  const { currentExhibition } = useApp()
  const ex = currentExhibition

  const statusMap: Record<string, { label: string; cls: string }> = {
    draft: { label: '草稿', cls: 'bg-gray-100 text-gray-600' },
    published: { label: '已发布', cls: 'bg-green-100 text-green-700' },
    ongoing: { label: '进行中', cls: 'bg-blue-100 text-blue-700' },
    ended: { label: '已结束', cls: 'bg-zinc-100 text-zinc-500' },
  }

  return (
    <header className="px-8 py-6 border-b border-forest-100/60 bg-gradient-to-r from-white via-white to-forest-50/50">
      <div className="flex items-start justify-between gap-6">
        <div className="min-w-0 flex-1">
          <h1 className="title-xl">{title}</h1>
          {subtitle && <p className="text-sm text-forest-500 mt-1">{subtitle}</p>}
          {ex && (
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
              <span className={cn('badge', statusMap[ex.status]?.cls)}>{statusMap[ex.status]?.label}</span>
              <span className="flex items-center gap-1.5 text-forest-600">
                <MapPin className="w-3.5 h-3.5 text-copper-500" />{ex.venue}
              </span>
              <span className="flex items-center gap-1.5 text-forest-600">
                <Calendar className="w-3.5 h-3.5 text-copper-500" />{ex.start_date} 至 {ex.end_date}
              </span>
              <span className="flex items-center gap-1.5 text-forest-600">
                <Clock className="w-3.5 h-3.5 text-copper-500" />{ex.open_time} - {ex.close_time}
              </span>
              <span className="flex items-center gap-1.5 text-forest-600">
                <Users className="w-3.5 h-3.5 text-copper-500" />共 {ex.booth_count} 个摊位
              </span>
            </div>
          )}
        </div>
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>
    </header>
  )
}

export default PageHeader
