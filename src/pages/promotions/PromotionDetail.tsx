import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Megaphone, Users, Calendar, MapPin, FileText, Image, Edit, Trash2 } from 'lucide-react'
import { api } from '@/utils/api'
import { formatDate, formatDateTime } from '@/utils/date'
import type { Promotion } from '@/types'
import ConfirmDialog from '@/components/ConfirmDialog'

export default function PromotionDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [promotion, setPromotion] = useState<Promotion | null>(null)
  const [loading, setLoading] = useState(true)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    loadPromotion()
  }, [id])

  const loadPromotion = async () => {
    try {
      setLoading(true)
      const data = await api.get<Promotion>(`/promotions/${id}`)
      setPromotion(data)
    } catch (error) {
      console.error('加载宣传详情失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!promotion) return
    try {
      setDeleting(true)
      await api.delete(`/promotions/${promotion.id}`)
      navigate('/promotions')
    } catch (error) {
      console.error('删除宣传记录失败:', error)
    } finally {
      setDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  if (loading) {
    return <div className="animate-pulse bg-white rounded-xl h-96" />
  }

  if (!promotion) {
    return <div>宣传记录不存在</div>
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
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/promotions/${promotion.id}/edit`)}
            className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Edit className="w-4 h-4" />
            编辑
          </button>
          <button
            onClick={() => setShowDeleteDialog(true)}
            className="flex items-center gap-2 px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            删除
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center flex-shrink-0">
            <Megaphone className="w-7 h-7 text-purple-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{promotion.title}</h2>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm font-medium">
                {promotion.type || '未分类'}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">活动日期</p>
              <p className="font-medium text-gray-800">{formatDate(promotion.date)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">参与人数</p>
              <p className="font-medium text-gray-800">{promotion.participants}人</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
              <MapPin className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">活动地点</p>
              <p className="font-medium text-gray-800">{promotion.location || '未设置'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">创建时间</p>
              <p className="font-medium text-gray-800 text-sm">{formatDateTime(promotion.created_at)}</p>
            </div>
          </div>
        </div>

        {promotion.points_detail && promotion.points_detail.length > 0 && (
          <div className="mb-6 pb-6 border-b border-gray-100">
            <h4 className="text-sm font-medium text-gray-700 mb-3">关联点位</h4>
            <div className="flex flex-wrap gap-2">
              {promotion.points_detail.map((point) => (
                <span
                  key={point.id}
                  className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium cursor-pointer hover:bg-emerald-100 transition-colors"
                  onClick={() => navigate(`/points/${point.id}`)}
                >
                  {point.building} - {point.location}
                </span>
              ))}
            </div>
          </div>
        )}

        {promotion.content && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">宣传内容</h4>
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-gray-600 whitespace-pre-wrap">{promotion.content}</p>
            </div>
          </div>
        )}

        {promotion.photos.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <Image className="w-4 h-4" />
              活动照片 ({promotion.photos.length}张)
            </h4>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
              {promotion.photos.map((photo, index) => (
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
      </div>

      <ConfirmDialog
        open={showDeleteDialog}
        title="删除宣传记录"
        message="确定要删除这条宣传记录吗？删除后无法恢复。"
        confirmText="删除"
        cancelText="取消"
        loading={deleting}
        danger
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
      />
    </div>
  )
}
