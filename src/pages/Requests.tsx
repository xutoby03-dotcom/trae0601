import { useState, useEffect } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { Plus, Search } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { SIZES, SEASONS, GENDERS, SIZE_LABELS } from '@/types'

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}小时前`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}天前`
  const months = Math.floor(days / 30)
  return `${months}个月前`
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  open: { label: '开放', className: 'tag-green' },
  matched: { label: '已匹配', className: 'tag-blue' },
  closed: { label: '已关闭', className: 'bg-gray-100 text-gray-500 text-xs font-semibold px-2.5 py-0.5 rounded-full' },
}

export default function Requests() {
  const { purchaseRequests, getUserById } = useStore()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const paramsSize = searchParams.get('size')
  const paramsSeason = searchParams.get('season')
  const paramsGender = searchParams.get('gender')

  const [sizeFilter, setSizeFilter] = useState<string>(paramsSize && SIZES.includes(paramsSize as any) ? paramsSize : 'all')
  const [seasonFilter, setSeasonFilter] = useState<string>(paramsSeason && SEASONS.includes(paramsSeason as any) ? paramsSeason : 'all')

  useEffect(() => {
    if (paramsSize && SIZES.includes(paramsSize as any)) {
      setSizeFilter(paramsSize)
    }
    if (paramsSeason && SEASONS.includes(paramsSeason as any)) {
      setSeasonFilter(paramsSeason)
    }
  }, [paramsSize, paramsSeason])

  const filtered = purchaseRequests.filter((r) => {
    if (sizeFilter !== 'all' && r.size !== sizeFilter) return false
    if (seasonFilter !== 'all' && r.season !== seasonFilter) return false
    return true
  })

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-gradient-to-br from-orange-400 via-orange-500 to-amber-500 px-5 pt-10 pb-5 rounded-b-3xl shadow-lg">
        <h1 className="text-3xl font-black text-white tracking-wide">求购需求</h1>
        <p className="text-orange-100 text-sm mt-1 font-medium">找不到想要的？发布求购让更多人看到</p>
      </div>

      <div className="px-4 mt-4 space-y-3">
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setSizeFilter('all')}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
              sizeFilter === 'all'
                ? 'bg-orange-500 text-white shadow-sm'
                : 'bg-orange-50 text-orange-500 hover:bg-orange-100'
            }`}
          >
            全部尺码
          </button>
          {SIZES.map((s) => (
            <button
              key={s}
              onClick={() => setSizeFilter(s)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                sizeFilter === s
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'bg-orange-50 text-orange-500 hover:bg-orange-100'
              }`}
            >
              {SIZE_LABELS[s]}
            </button>
          ))}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setSeasonFilter('all')}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
              seasonFilter === 'all'
                ? 'bg-orange-500 text-white shadow-sm'
                : 'bg-orange-50 text-orange-500 hover:bg-orange-100'
            }`}
          >
            全部季节
          </button>
          {SEASONS.map((s) => (
            <button
              key={s}
              onClick={() => setSeasonFilter(s)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                seasonFilter === s
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'bg-orange-50 text-orange-500 hover:bg-orange-100'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 mt-4 pb-6 space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-sm">暂无求购需求</p>
          </div>
        )}
        {filtered.map((req) => {
          const user = getUserById(req.userId)
          const statusCfg = STATUS_CONFIG[req.status]
          return (
            <div
              key={req.id}
              className="card p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {req.urgent && (
                    <span className="tag-red">急需</span>
                  )}
                  <span className="tag-orange">{SIZE_LABELS[req.size] || req.size}</span>
                  <span className="tag-blue">{req.season}</span>
                  <span className="tag-purple">{req.gender}</span>
                </div>
                <span className={statusCfg.className}>{statusCfg.label}</span>
              </div>

              <p className="text-sm text-gray-700 mb-3 line-clamp-2">{req.description}</p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span>{user?.name || '未知用户'}</span>
                  <span>{timeAgo(req.createdAt)}</span>
                </div>
                {req.status === 'open' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      navigate(`/?size=${req.size}&season=${req.season}&gender=${req.gender}`)
                    }}
                    className="flex items-center gap-1 text-[10px] font-semibold text-orange-500 bg-orange-50 hover:bg-orange-100 px-2 py-1 rounded-full transition-all duration-200"
                  >
                    <Search size={10} />
                    找同款校服
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <Link
        to="/requests/publish"
        className="fixed bottom-24 right-6 w-14 h-14 bg-orange-500 hover:bg-orange-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 active:scale-95 z-40"
      >
        <Plus size={24} />
      </Link>
    </div>
  )
}
