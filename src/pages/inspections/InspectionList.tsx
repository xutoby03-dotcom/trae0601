import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, ClipboardList, Filter, Image } from 'lucide-react'
import { api } from '@/utils/api'
import { formatDateTime, formatRelativeTime } from '@/utils/date'
import type { Inspection } from '@/types'
import StatusBadge from '@/components/StatusBadge'

export default function InspectionList() {
  const [inspections, setInspections] = useState<Inspection[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'serious'>('all')
  const navigate = useNavigate()

  useEffect(() => {
    loadInspections()
  }, [filter, search])

  const loadInspections = async () => {
    try {
      setLoading(true)
      let url = '/inspections'
      const params: string[] = []
      if (filter === 'serious') params.push('is_serious=true')
      if (search) params.push(`search=${encodeURIComponent(search)}`)
      if (params.length > 0) url += `?${params.join('&')}`

      const data = await api.get<Inspection[]>(url)
      setInspections(data)
    } catch (error) {
      console.error('加载巡查记录失败:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="搜索巡查记录..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              全部
            </button>
            <button
              onClick={() => setFilter('serious')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                filter === 'serious'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Filter className="w-4 h-4" />
              严重问题
            </button>
          </div>
        </div>
        <button
          onClick={() => navigate('/inspections/new')}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors font-medium shadow-sm"
        >
          <Plus className="w-5 h-5" />
          新增巡查
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="bg-white rounded-xl p-5 h-24 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {inspections.map((inspection) => (
            <div
              key={inspection.id}
              className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-emerald-200 transition-all cursor-pointer"
              onClick={() => navigate(`/inspections/${inspection.id}`)}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <ClipboardList className="w-6 h-6 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className="font-semibold text-gray-800">{inspection.building}</h4>
                    {inspection.is_serious === 1 && (
                      <StatusBadge type="priority" value="high" />
                    )}
                    {inspection.ticket && (
                      <StatusBadge type="status" value={inspection.ticket.status} />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {inspection.problem_types.join('、')}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>巡查人：{inspection.inspector}</span>
                    <span>{formatDateTime(inspection.inspection_time)}</span>
                    {inspection.photos.length > 0 && (
                      <span className="flex items-center gap-1">
                        <Image className="w-3.5 h-3.5" />
                        {inspection.photos.length}张照片
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-sm text-gray-400">
                    {formatRelativeTime(inspection.inspection_time)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && inspections.length === 0 && (
        <div className="text-center py-20">
          <ClipboardList className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">暂无巡查记录</p>
        </div>
      )}
    </div>
  )
}
