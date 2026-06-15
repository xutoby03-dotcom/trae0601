import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Megaphone, Users, Calendar, MapPin } from 'lucide-react'
import { api } from '@/utils/api'
import { formatDate, formatRelativeTime } from '@/utils/date'
import type { Promotion } from '@/types'

export default function PromotionList() {
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    loadPromotions()
  }, [search])

  const loadPromotions = async () => {
    try {
      setLoading(true)
      let url = '/promotions'
      if (search) {
        url += `?search=${encodeURIComponent(search)}`
      }
      const data = await api.get<Promotion[]>(url)
      setPromotions(data)
    } catch (error) {
      console.error('加载宣传记录失败:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="搜索宣传活动..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          />
        </div>
        <button
          onClick={() => navigate('/promotions/new')}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors font-medium shadow-sm"
        >
          <Plus className="w-5 h-5" />
          新增宣传
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-xl p-5 h-44 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {promotions.map((promo) => (
            <div
              key={promo.id}
              className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-emerald-200 transition-all cursor-pointer"
              onClick={() => navigate(`/promotions/${promo.id}`)}
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Megaphone className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-800 truncate">{promo.title}</h4>
                  <p className="text-sm text-gray-500">{promo.type || '未设置类型'}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>{formatDate(promo.date)}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="truncate">{promo.location || '未设置地点'}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span>{promo.participants}人参与</span>
                </div>
              </div>
              {promo.related_points.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-2">关联点位</p>
                  <div className="flex flex-wrap gap-1">
                    {promo.related_points.slice(0, 3).map((pointId) => (
                      <span
                        key={pointId}
                        className="px-2 py-0.5 text-xs bg-emerald-50 text-emerald-700 rounded"
                      >
                        {pointId}号楼
                      </span>
                    ))}
                    {promo.related_points.length > 3 && (
                      <span className="text-xs text-gray-400">
                        +{promo.related_points.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {!loading && promotions.length === 0 && (
        <div className="text-center py-20">
          <Megaphone className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">暂无宣传记录</p>
        </div>
      )}
    </div>
  )
}
