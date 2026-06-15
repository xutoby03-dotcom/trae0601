import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, User, Calendar, MapPin, FileText, Image, Ticket as TicketIcon } from 'lucide-react'
import { api } from '@/utils/api'
import { formatDateTime } from '@/utils/date'
import type { Inspection } from '@/types'
import StatusBadge from '@/components/StatusBadge'

export default function InspectionDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [inspection, setInspection] = useState<Inspection | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadInspection()
  }, [id])

  const loadInspection = async () => {
    try {
      setLoading(true)
      const data = await api.get<Inspection>(`/inspections/${id}`)
      setInspection(data)
    } catch (error) {
      console.error('加载巡查详情失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTicket = () => {
    if (!inspection) return
    navigate(`/tickets/new?inspection_id=${inspection.id}&point_id=${inspection.point_id}`)
  }

  if (loading) {
    return <div className="animate-pulse bg-white rounded-xl h-96" />
  }

  if (!inspection) {
    return <div>巡查记录不存在</div>
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          返回列表
        </button>
        {inspection.is_serious === 1 && !inspection.ticket && (
          <button
            onClick={handleCreateTicket}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-medium"
          >
            <TicketIcon className="w-4 h-4" />
            创建工单
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center flex-shrink-0">
            <FileText className="w-7 h-7 text-emerald-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold text-gray-800">{inspection.building}</h2>
              {inspection.is_serious === 1 && (
                <StatusBadge type="priority" value="high" />
              )}
            </div>
            <p className="text-gray-500">{inspection.location}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">巡查人</p>
              <p className="font-medium text-gray-800">{inspection.inspector}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
              <Calendar className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">巡查时间</p>
              <p className="font-medium text-gray-800 text-sm">
                {formatDateTime(inspection.inspection_time)}
              </p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">发现的问题</h4>
          <div className="flex flex-wrap gap-2">
            {inspection.problem_types.map((type) => (
              <span
                key={type}
                className="px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-sm font-medium"
              >
                {type}
              </span>
            ))}
          </div>
        </div>

        {inspection.notes && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-2">备注说明</h4>
            <p className="text-gray-600">{inspection.notes}</p>
          </div>
        )}

        {inspection.photos.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <Image className="w-4 h-4" />
              现场照片 ({inspection.photos.length}张)
            </h4>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
              {inspection.photos.map((photo, index) => (
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

        {inspection.ticket && (
          <div className="mt-6 pt-6 border-t border-gray-100">
            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <TicketIcon className="w-4 h-4" />
              关联工单
            </h4>
            <div
              className="p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => navigate(`/tickets/${inspection.ticket!.id}`)}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium text-gray-800">{inspection.ticket.title}</p>
                <StatusBadge type="status" value={inspection.ticket.status} />
              </div>
              <p className="text-sm text-gray-500">
                指派：{inspection.ticket.assignee || '未指派'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
