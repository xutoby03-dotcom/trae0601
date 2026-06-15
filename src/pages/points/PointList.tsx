import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, MapPin, User, Clock, Camera, Trash2, Edit } from 'lucide-react'
import { api } from '@/utils/api'
import type { Point } from '@/types'
import ConfirmDialog from '@/components/ConfirmDialog'

export default function PointList() {
  const [points, setPoints] = useState<Point[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    loadPoints()
  }, [search])

  const loadPoints = async () => {
    try {
      setLoading(true)
      const data = await api.get<Point[]>(`/points${search ? `?search=${encodeURIComponent(search)}` : ''}`)
      setPoints(data)
    } catch (error) {
      console.error('加载点位失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/points/${id}`)
      setPoints(points.filter((p) => p.id !== id))
      setDeleteId(null)
    } catch (error) {
      console.error('删除失败:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="搜索楼栋、位置或督导员..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          />
        </div>
        <button
          onClick={() => navigate('/points/new')}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors font-medium shadow-sm"
        >
          <Plus className="w-5 h-5" />
          新增点位
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="bg-white rounded-xl p-5 h-48 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {points.map((point) => (
            <div
              key={point.id}
              className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-emerald-200 transition-all duration-200 cursor-pointer group"
              onClick={() => navigate(`/points/${point.id}`)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      navigate(`/points/${point.id}/edit`)
                    }}
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setDeleteId(point.id)
                    }}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-1">{point.building}</h3>
              <p className="text-sm text-gray-500 mb-4">{point.location}</p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <User className="w-4 h-4 text-gray-400" />
                  <span>{point.supervisor || '未指派'}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="truncate">{point.open_hours || '未设置'}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Camera className="w-4 h-4 text-gray-400" />
                  <span>{point.camera_position || '未设置'}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-4">
                {point.bin_types.map((type) => (
                  <span
                    key={type}
                    className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-md"
                  >
                    {type}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && points.length === 0 && (
        <div className="text-center py-20">
          <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">暂无点位数据</p>
        </div>
      )}

      <ConfirmDialog
        open={deleteId !== null}
        title="确认删除"
        message="删除点位将同时删除相关的巡查记录和工单，确定要删除吗？"
        type="danger"
        confirmText="删除"
        onConfirm={() => deleteId && handleDelete(deleteId)}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  )
}
