import { Link } from 'react-router-dom'
import type { Tool } from '@/types'
import { useUserStore } from '@/store/userStore'
import StatusBadge from './StatusBadge'
import CategoryBadge from './CategoryBadge'
import { MapPin, Clock, Shield } from 'lucide-react'

interface ToolCardProps {
  tool: Tool
}

export default function ToolCard({ tool }: ToolCardProps) {
  const getUserById = useUserStore(s => s.getUserById)
  const owner = getUserById(tool.ownerId)

  return (
    <Link
      to={`/tool/${tool.id}`}
      className="group block bg-white rounded-2xl border border-wood-200 overflow-hidden shadow-wood hover:shadow-wood-md transition-all duration-300 hover:-translate-y-1"
    >
      <div className="relative h-44 overflow-hidden">
        <img
          src={tool.photo}
          alt={tool.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3">
          <StatusBadge status={tool.status} />
        </div>
        <div className="absolute top-3 right-3">
          <CategoryBadge category={tool.category} />
        </div>
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/40 to-transparent" />
      </div>

      <div className="p-4">
        <h3 className="font-serif-sc font-semibold text-wood-800 text-base mb-2 group-hover:text-grass-700 transition-colors">
          {tool.name}
        </h3>

        <div className="space-y-1.5 text-xs text-wood-500">
          <div className="flex items-center gap-1.5">
            <MapPin size={12} className="text-wood-400 flex-shrink-0" />
            <span className="truncate">{tool.pickupLocation}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock size={12} className="text-wood-400 flex-shrink-0" />
            <span>可借 {tool.maxBorrowHours} 小时</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Shield size={12} className="text-wood-400 flex-shrink-0" />
            <span>押金 ¥{tool.deposit}</span>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-wood-100 flex items-center gap-2">
          <img
            src={owner?.avatar || ''}
            alt={owner?.name || ''}
            className="w-5 h-5 rounded-full"
          />
          <span className="text-xs text-wood-500">{owner?.name || '未知'} 提供</span>
        </div>
      </div>
    </Link>
  )
}
