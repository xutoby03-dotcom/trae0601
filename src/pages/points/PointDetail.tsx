import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, MapPin, User, Clock, Camera, AlertTriangle, FileText, Edit } from 'lucide-react'
import { api } from '@/utils/api'
import { formatDateTime } from '@/utils/date'
import type { Point } from '@/types'
import StatusBadge from '@/components/StatusBadge'

export default function PointDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [point, setPoint] = useState<Point | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPoint()
  }, [id])

  const loadPoint = async () => {
    try {
      setLoading(true)
      const data = await api.get<Point>(`/points/${id}`)
      setPoint(data)
    } catch (error) {
      console.error('加载点位详情失败:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="animate-pulse bg-white rounded-xl h-96" />
  }

  if (!point) {
    return <div>点位不存在</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          返回点位列表
        </button>
        <button
          onClick={() => navigate(`/points/${id}/edit`)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
        >
          <Edit className="w-4 h-4" />
          编辑
        </button>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center flex-shrink-0">
            <MapPin className="w-7 h-7 text-emerald-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-800 mb-1">{point.building}</h2>
            <p className="text-gray-500">{point.location}</p>
          </div>
          {point.openTickets && point.openTickets > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">{point.openTickets} 个待处理工单</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">督导员</p>
              <p className="font-medium text-gray-800">{point.supervisor || '未指派'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">开放时段</p>
              <p className="font-medium text-gray-800 text-sm">{point.open_hours || '未设置'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
              <Camera className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">摄像头</p>
              <p className="font-medium text-gray-800">{point.camera_position || '未设置'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">桶类型</p>
              <div className="flex gap-1">
                {point.bin_types.slice(0, 2).map((type) => (
                  <span key={type} className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">
                    {type}
                  </span>
                ))}
                {point.bin_types.length > 2 && (
                  <span className="text-xs text-gray-400">+{point.bin_types.length - 2}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {point.photos && point.photos.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-100">
            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <Camera className="w-4 h-4" />
              点位照片 ({point.photos.length}张)
            </h4>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
              {point.photos.map((photo, index) => (
                <div
                  key={index}
                  className="aspect-square rounded-lg overflow-hidden bg-gray-100 cursor-pointer hover:opacity-90 transition-opacity"
                >
                  <img src={photo} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}

        {point.description && (
          <div className="mt-6 pt-6 border-t border-gray-100">
            <h4 className="text-sm font-medium text-gray-700 mb-2">备注说明</h4>
            <p className="text-gray-600">{point.description}</p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">最近巡查记录</h3>
        {point.recentInspections && point.recentInspections.length > 0 ? (
          <div className="space-y-3">
            {point.recentInspections.map((inspection) => (
              <div
                key={inspection.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                onClick={() => navigate(`/inspections/${inspection.id}`)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <div>
                    <p className="font-medium text-gray-800">
                      {inspection.problem_types.join('、')}
                    </p>
                    <p className="text-sm text-gray-500">
                      {inspection.inspector} · {formatDateTime(inspection.inspection_time)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {inspection.is_serious === 1 && (
                    <StatusBadge type="priority" value="high" />
                  )}
                  {inspection.photos.length > 0 && (
                    <span className="text-sm text-gray-500">
                      {inspection.photos.length}张照片
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">暂无巡查记录</p>
          </div>
        )}
      </div>
    </div>
  )
}
