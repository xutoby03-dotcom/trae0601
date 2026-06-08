import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useToolStore } from '@/store/toolStore'
import { useBorrowStore } from '@/store/borrowStore'
import { useUserStore } from '@/store/userStore'
import StatusBadge from '@/components/StatusBadge'
import CategoryBadge from '@/components/CategoryBadge'
import { CURRENT_USER_ID } from '@/data/mockData'
import {
  ArrowLeft, MapPin, Clock, Shield, FileText, User,
  CalendarDays, MessageSquare, CheckCircle, AlertTriangle
} from 'lucide-react'

export default function ToolDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const getToolById = useToolStore(s => s.getToolById)
  const getUserById = useUserStore(s => s.getUserById)
  const requestBorrow = useBorrowStore(s => s.requestBorrow)
  const getBorrowRecordsByTool = useBorrowStore(s => s.getBorrowRecordsByTool)
  const [showBorrowModal, setShowBorrowModal] = useState(false)
  const [borrowSuccess, setBorrowSuccess] = useState(false)

  const tool = id ? getToolById(id) : undefined
  const owner = tool ? getUserById(tool.ownerId) : undefined
  const borrowRecords = id ? getBorrowRecordsByTool(id) : []
  const isOwnTool = tool?.ownerId === CURRENT_USER_ID

  const [borrowForm, setBorrowForm] = useState({
    startTime: '',
    expectedReturnTime: '',
    purpose: '',
  })

  if (!tool) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-wood-500 mb-4">工具不存在</p>
          <Link to="/" className="text-grass-600 hover:underline text-sm">返回首页</Link>
        </div>
      </div>
    )
  }

  const handleBorrow = (e: React.FormEvent) => {
    e.preventDefault()
    if (!borrowForm.startTime || !borrowForm.expectedReturnTime || !borrowForm.purpose) return
    requestBorrow(tool.id, borrowForm.purpose, borrowForm.startTime, borrowForm.expectedReturnTime)
    setShowBorrowModal(false)
    setBorrowSuccess(true)
    setTimeout(() => setBorrowSuccess(false), 3000)
  }

  const formatTime = (iso: string) => {
    if (!iso) return '-'
    const d = new Date(iso)
    return d.toLocaleString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="min-h-screen pb-8">
      <div className="relative h-64 sm:h-80 overflow-hidden">
        <img src={tool.photo} alt={tool.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/50 transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center gap-2 mb-2">
            <StatusBadge status={tool.status} size="md" />
            <CategoryBadge category={tool.category} />
          </div>
          <h1 className="font-serif-sc text-2xl font-bold text-white">{tool.name}</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-4">
        {borrowSuccess && (
          <div className="bg-grass-50 border border-grass-200 rounded-xl p-4 mb-4 flex items-center gap-2">
            <CheckCircle size={18} className="text-grass-600" />
            <span className="text-sm text-grass-700">预约申请已提交，等待工具主人确认</span>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-wood-md border border-wood-100 p-5 mb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoItem icon={MapPin} label="取还地点" value={tool.pickupLocation} />
            <InfoItem icon={Clock} label="可借时长" value={`${tool.maxBorrowHours} 小时`} />
            <InfoItem icon={Shield} label="押金" value={`¥${tool.deposit}`} />
            <InfoItem icon={User} label="提供者" value={owner?.name || '未知'} />
          </div>

          {tool.notes && (
            <div className="mt-4 pt-4 border-t border-wood-100">
              <InfoItem icon={FileText} label="使用注意事项" value={tool.notes} />
            </div>
          )}
        </div>

        {!isOwnTool && tool.status === 'available' && (
          <button
            onClick={() => setShowBorrowModal(true)}
            className="w-full py-3 rounded-xl bg-grass-600 hover:bg-grass-700 text-white font-medium text-sm transition-colors shadow-wood mb-4"
          >
            预约借用
          </button>
        )}

        {isOwnTool && (
          <div className="bg-wood-100 rounded-xl p-4 mb-4 flex items-center gap-2">
            <AlertTriangle size={16} className="text-wood-500" />
            <span className="text-xs text-wood-600">这是您登记的工具，可以在"借还"页面管理借用请求</span>
          </div>
        )}

        {tool.status !== 'available' && !isOwnTool && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4 flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-500" />
            <span className="text-xs text-amber-700">该工具当前不可借用</span>
          </div>
        )}

        {borrowRecords.length > 0 && (
          <div className="bg-white rounded-2xl shadow-wood-md border border-wood-100 p-5">
            <h3 className="font-serif-sc font-semibold text-wood-800 mb-4">借用记录</h3>
            <div className="space-y-3">
              {borrowRecords.map(record => {
                const borrower = getUserById(record.borrowerId)
                return (
                  <div key={record.id} className="flex items-start gap-3 p-3 rounded-xl bg-wood-50/50 border border-wood-100">
                    <img src={borrower?.avatar || ''} alt="" className="w-8 h-8 rounded-full mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-wood-700">{borrower?.name}</span>
                        <BorrowRecordStatusBadge status={record.status} />
                      </div>
                      <p className="text-xs text-wood-500 mb-1">{record.purpose}</p>
                      <div className="flex items-center gap-3 text-xs text-wood-400">
                        <span>{formatTime(record.startTime)} ~ {formatTime(record.expectedReturnTime)}</span>
                        {record.isOverdue && <span className="text-red-500">逾期</span>}
                        {record.hasDamage && <span className="text-amber-600">有损坏</span>}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {showBorrowModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-wood-lg w-full max-w-md p-6">
            <h3 className="font-serif-sc text-lg font-semibold text-wood-800 mb-4">预约借用「{tool.name}」</h3>
            <form onSubmit={handleBorrow} className="space-y-4">
              <div>
                <label className="flex items-center gap-1.5 text-sm font-medium text-wood-700 mb-2">
                  <CalendarDays size={14} />
                  借用开始时间
                </label>
                <input
                  type="datetime-local"
                  required
                  value={borrowForm.startTime}
                  onChange={e => setBorrowForm(f => ({ ...f, startTime: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-wood-200 text-sm focus:ring-2 focus:ring-grass-400 outline-none"
                />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-sm font-medium text-wood-700 mb-2">
                  <CalendarDays size={14} />
                  预计归还时间
                </label>
                <input
                  type="datetime-local"
                  required
                  value={borrowForm.expectedReturnTime}
                  onChange={e => setBorrowForm(f => ({ ...f, expectedReturnTime: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-wood-200 text-sm focus:ring-2 focus:ring-grass-400 outline-none"
                />
                <p className="text-xs text-wood-400 mt-1">建议不超过 {tool.maxBorrowHours} 小时</p>
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-sm font-medium text-wood-700 mb-2">
                  <MessageSquare size={14} />
                  借用用途
                </label>
                <textarea
                  required
                  rows={3}
                  value={borrowForm.purpose}
                  onChange={e => setBorrowForm(f => ({ ...f, purpose: e.target.value }))}
                  placeholder="请说明借用用途..."
                  className="w-full px-4 py-2.5 rounded-xl border border-wood-200 text-sm focus:ring-2 focus:ring-grass-400 outline-none resize-none"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowBorrowModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-wood-200 text-wood-600 text-sm font-medium hover:bg-wood-50 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-grass-600 hover:bg-grass-700 text-white text-sm font-medium transition-colors"
                >
                  提交预约
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function InfoItem({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <Icon size={16} className="text-wood-400 mt-0.5 flex-shrink-0" />
      <div>
        <div className="text-xs text-wood-400">{label}</div>
        <div className="text-sm text-wood-700 font-medium">{value}</div>
      </div>
    </div>
  )
}

function BorrowRecordStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    active: 'bg-blue-100 text-blue-700',
    returned: 'bg-grass-100 text-grass-700',
    overdue: 'bg-red-100 text-red-700',
  }
  const labels: Record<string, string> = {
    pending: '待确认',
    active: '借用中',
    returned: '已归还',
    overdue: '已逾期',
  }
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${styles[status] || ''}`}>
      {labels[status] || status}
    </span>
  )
}
