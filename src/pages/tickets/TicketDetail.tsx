import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  User,
  Calendar,
  MapPin,
  FileText,
  Image,
  CheckCircle,
  XCircle,
  Clock,
  Edit,
} from 'lucide-react'
import { api } from '@/utils/api'
import { formatDateTime, getDurationHours, formatDuration } from '@/utils/date'
import type { Ticket } from '@/types'
import StatusBadge from '@/components/StatusBadge'
import ConfirmDialog from '@/components/ConfirmDialog'

export default function TicketDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [loading, setLoading] = useState(true)
  const [showResolveDialog, setShowResolveDialog] = useState(false)
  const [showCloseDialog, setShowCloseDialog] = useState(false)
  const [repairNotes, setRepairNotes] = useState('')
  const [repairPhotos, setRepairPhotos] = useState<string[]>([])

  useEffect(() => {
    loadTicket()
  }, [id])

  const loadTicket = async () => {
    try {
      setLoading(true)
      const data = await api.get<Ticket>(`/tickets/${id}`)
      setTicket(data)
    } catch (error) {
      console.error('加载工单详情失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleResolve = async () => {
    try {
      await api.post(`/tickets/${id}/resolve`, {
        repair_photos: repairPhotos,
        repair_notes: repairNotes,
      })
      setShowResolveDialog(false)
      loadTicket()
    } catch (error) {
      console.error('提交整改失败:', error)
      alert('提交失败')
    }
  }

  const handleClose = async () => {
    try {
      await api.post(`/tickets/${id}/close`, {})
      setShowCloseDialog(false)
      loadTicket()
    } catch (error) {
      console.error('关闭工单失败:', error)
      alert('关闭失败')
    }
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    Array.from(files).forEach((file) => {
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          setRepairPhotos((prev) => [...prev, event.target!.result as string])
        }
      }
      reader.readAsDataURL(file)
    })
    e.target.value = ''
  }

  if (loading) {
    return <div className="animate-pulse bg-white rounded-xl h-96" />
  }

  if (!ticket) {
    return <div>工单不存在</div>
  }

  const repairDuration =
    ticket.assigned_at && ticket.resolved_at
      ? getDurationHours(ticket.assigned_at, ticket.resolved_at)
      : null

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
        <div className="flex gap-2">
          {(ticket.status === 'pending' || ticket.status === 'processing') && (
            <button
              onClick={() => setShowResolveDialog(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors font-medium"
            >
              <CheckCircle className="w-4 h-4" />
              提交整改
            </button>
          )}
          {ticket.status === 'resolved' && (
            <button
              onClick={() => setShowCloseDialog(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
            >
              <XCircle className="w-4 h-4" />
              关闭工单
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-start gap-4 mb-6">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${
              ticket.priority === 'high'
                ? 'bg-red-50'
                : ticket.priority === 'medium'
                ? 'bg-amber-50'
                : 'bg-green-50'
            }`}
          >
            <FileText
              className={`w-7 h-7 ${
                ticket.priority === 'high'
                  ? 'text-red-600'
                  : ticket.priority === 'medium'
                  ? 'text-amber-600'
                  : 'text-green-600'
              }`}
            />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-xl font-bold text-gray-800">{ticket.title}</h2>
              <StatusBadge type="status" value={ticket.status} />
              <StatusBadge type="priority" value={ticket.priority} />
            </div>
            <p className="text-gray-500">{ticket.building} - {ticket.location}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 pb-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">处理人</p>
              <p className="font-medium text-gray-800 text-sm">{ticket.assignee || '未指派'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">创建时间</p>
              <p className="font-medium text-gray-800 text-sm">{formatDateTime(ticket.created_at)}</p>
            </div>
          </div>
          {ticket.resolved_at && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">整改完成</p>
                <p className="font-medium text-gray-800 text-sm">{formatDateTime(ticket.resolved_at)}</p>
              </div>
            </div>
          )}
          {repairDuration !== null && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">整改耗时</p>
                <p className="font-medium text-gray-800 text-sm">{formatDuration(repairDuration)}</p>
              </div>
            </div>
          )}
        </div>

        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-2">问题描述</h4>
          <p className="text-gray-600">{ticket.description || '暂无描述'}</p>
        </div>

        {ticket.inspection_problems && ticket.inspection_problems.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">问题类型</h4>
            <div className="flex flex-wrap gap-2">
              {ticket.inspection_problems.map((type) => (
                <span
                  key={type}
                  className="px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-sm font-medium"
                >
                  {type}
                </span>
              ))}
            </div>
          </div>
        )}

        {ticket.inspection_photos && ticket.inspection_photos.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <Image className="w-4 h-4" />
              问题照片 ({ticket.inspection_photos.length}张)
            </h4>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
              {ticket.inspection_photos.map((photo, index) => (
                <div
                  key={index}
                  className="aspect-square rounded-lg overflow-hidden bg-gray-100"
                >
                  <img src={photo} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}

        {ticket.repair_notes && (
          <div className="mt-6 pt-6 border-t border-gray-100">
            <h4 className="text-sm font-medium text-gray-700 mb-2">整改说明</h4>
            <p className="text-gray-600">{ticket.repair_notes}</p>
          </div>
        )}

        {ticket.repair_photos && ticket.repair_photos.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-100">
            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <Image className="w-4 h-4" />
              整改后照片 ({ticket.repair_photos.length}张)
            </h4>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
              {ticket.repair_photos.map((photo, index) => (
                <div
                  key={index}
                  className="aspect-square rounded-lg overflow-hidden bg-gray-100"
                >
                  <img src={photo} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={showResolveDialog}
        title="提交整改"
        message="请确认已完成整改并上传相关照片"
        confirmText="提交"
        onConfirm={handleResolve}
        onCancel={() => setShowResolveDialog(false)}
      >
        <div className="space-y-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">整改说明</label>
            <textarea
              value={repairNotes}
              onChange={(e) => setRepairNotes(e.target.value)}
              rows={3}
              placeholder="请描述整改情况..."
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">整改照片</label>
            <div className="grid grid-cols-4 gap-2">
              {repairPhotos.map((photo, index) => (
                <div key={index} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <img src={photo} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
              <label className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition-all">
                <span className="text-2xl text-gray-400">+</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      </ConfirmDialog>

      <ConfirmDialog
        open={showCloseDialog}
        title="关闭工单"
        message="确认整改合格，关闭此工单吗？"
        confirmText="确认关闭"
        type="primary"
        onConfirm={handleClose}
        onCancel={() => setShowCloseDialog(false)}
      />
    </div>
  )
}
