import { useNavigate, Link } from 'react-router-dom'
import { Plus, Calendar, PawPrint } from 'lucide-react'
import { useStore } from '@/store'
import { formatDate } from '@/utils/helpers'

export default function FosterList() {
  const navigate = useNavigate()
  const { fosters, pets } = useStore()

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-warm-800">寄养交接</h1>
          <p className="text-sm text-warm-400 mt-1">管理所有寄养交接单</p>
        </div>
        <Link to="/foster/new" className="btn-primary inline-flex items-center gap-2 text-sm">
          <Plus className="h-4 w-4" />
          新建寄养
        </Link>
      </div>

      {fosters.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-warm-400">
          <PawPrint className="h-16 w-16 mb-4 opacity-30" />
          <p className="text-lg font-display">还没有寄养记录</p>
          <p className="text-sm mt-1">创建第一份寄养交接单吧</p>
          <Link to="/foster/new" className="btn-primary mt-6 inline-flex items-center gap-2 text-sm">
            <Plus className="h-4 w-4" />
            新建寄养
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {fosters.map((foster) => {
            const pet = pets.find((p) => p.id === foster.petId)
            const today = new Date().toISOString().split('T')[0]
            const isActive = foster.startDate <= today && foster.endDate >= today
            return (
              <Link
                key={foster.id}
                to={`/foster/${foster.id}`}
                className="section-card flex items-center gap-4 rounded-xl border-2 border-warm-100 bg-white p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-warm-100">
                  <PawPrint className="h-6 w-6 text-warm-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-base font-medium text-warm-800 truncate">
                      {pet?.name || '未知宠物'}
                    </p>
                    {isActive && (
                      <span className="inline-flex items-center rounded-full bg-leaf-50 px-2 py-0.5 text-xs font-medium text-leaf-500 border border-leaf-200">
                        进行中
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-sm text-warm-400">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{formatDate(foster.startDate)} - {formatDate(foster.endDate)}</span>
                    <span className="text-warm-200">|</span>
                    <span>{foster.feederName}</span>
                  </div>
                </div>
                <div className="text-warm-300 text-sm">→</div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
