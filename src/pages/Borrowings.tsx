import { useState } from 'react'
import { useBorrowStore } from '@/store/borrowStore'
import { useToolStore } from '@/store/toolStore'
import { useUserStore } from '@/store/userStore'
import { CURRENT_USER_ID } from '@/data/mockData'
import type { BorrowRecord } from '@/types'
import {
  BookOpen, ArrowRightLeft, Clock, CheckCircle, AlertTriangle,
  Camera, Image, Star, TrendingUp, TrendingDown
} from 'lucide-react'

type TabType = 'borrowed' | 'lent' | 'credit'

export default function Borrowings() {
  const [tab, setTab] = useState<TabType>('borrowed')

  return (
    <div className="min-h-screen pb-8">
      <div className="bg-gradient-to-br from-wood-800 to-wood-700 px-4 py-6">
        <div className="container mx-auto">
          <h1 className="font-serif-sc text-2xl font-bold text-wood-50 mb-1">借还管理</h1>
          <p className="text-wood-200 text-sm">管理你的借入借出记录</p>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-4">
        <div className="bg-white rounded-2xl shadow-wood-md border border-wood-100 overflow-hidden">
          <div className="flex border-b border-wood-100">
            {([
              { key: 'borrowed', label: '我借的', icon: BookOpen },
              { key: 'lent', label: '我借出的', icon: ArrowRightLeft },
              { key: 'credit', label: '信用分', icon: Star },
            ] as const).map(item => (
              <button
                key={item.key}
                onClick={() => setTab(item.key)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-medium transition-colors ${
                  tab === item.key
                    ? 'text-grass-600 border-b-2 border-grass-600 bg-grass-50/50'
                    : 'text-wood-500 hover:text-wood-700'
                }`}
              >
                <item.icon size={16} />
                {item.label}
              </button>
            ))}
          </div>

          <div className="p-4">
            {tab === 'borrowed' && <BorrowedTab />}
            {tab === 'lent' && <LentTab />}
            {tab === 'credit' && <CreditTab />}
          </div>
        </div>
      </div>
    </div>
  )
}

function BorrowedTab() {
  const getBorrowRecordsByBorrower = useBorrowStore(s => s.getBorrowRecordsByBorrower)
  const returnTool = useBorrowStore(s => s.returnTool)
  const getToolById = useToolStore(s => s.getToolById)
  const getUserById = useUserStore(s => s.getUserById)
  const records = getBorrowRecordsByBorrower(CURRENT_USER_ID)

  const [returningId, setReturningId] = useState<string | null>(null)
  const [returnForm, setReturnForm] = useState({
    returnPhoto: '',
    hasDamage: false,
    damageDescription: '',
    damageCompensation: 0,
  })

  if (records.length === 0) {
    return <EmptyState text="暂无借入记录" />
  }

  const handleReturn = (recordId: string) => {
    returnTool(
      recordId,
      returnForm.returnPhoto,
      returnForm.hasDamage,
      returnForm.damageDescription,
      returnForm.damageCompensation
    )
    setReturningId(null)
    setReturnForm({ returnPhoto: '', hasDamage: false, damageDescription: '', damageCompensation: 0 })
  }

  const getDisplayStatus = (record: BorrowRecord) => {
    if (record.status === 'active' && new Date() > new Date(record.expectedReturnTime)) {
      return 'overdue'
    }
    return record.status
  }

  return (
    <div className="space-y-3">
      {records.map(record => {
        const tool = getToolById(record.toolId)
        const owner = getUserById(record.ownerId)
        if (!tool) return null
        const displayStatus = getDisplayStatus(record)
        const isOverdueNow = displayStatus === 'overdue'

        return (
          <div key={record.id} className="border border-wood-100 rounded-xl overflow-hidden">
            <div className="flex items-start gap-3 p-4">
              <img
                src={tool.photo}
                alt={tool.name}
                className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-wood-800 text-sm">{tool.name}</span>
                  <RecordStatusBadge status={displayStatus} />
                </div>
                <p className="text-xs text-wood-500 mb-1">{record.purpose}</p>
                <div className="text-xs text-wood-400">
                  提供者：{owner?.name} · {formatTime(record.startTime)} ~ {formatTime(record.expectedReturnTime)}
                </div>
                {(isOverdueNow || record.isOverdue) && (
                  <div className="flex items-center gap-1 text-xs text-red-500 mt-1">
                    <AlertTriangle size={12} />
                    已逾期
                  </div>
                )}
                {record.hasDamage && (
                  <div className="flex items-center gap-1 text-xs text-amber-600 mt-1">
                    <AlertTriangle size={12} />
                    有损坏 · 赔付 ¥{record.damageCompensation}
                  </div>
                )}
              </div>
            </div>

            {(record.status === 'active') && returningId !== record.id && (
              <div className="px-4 pb-3">
                <button
                  onClick={() => setReturningId(record.id)}
                  className={`w-full py-2 rounded-lg text-white text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${
                    isOverdueNow ? 'bg-red-500 hover:bg-red-600' : 'bg-grass-600 hover:bg-grass-700'
                  }`}
                >
                  <CheckCircle size={14} />
                  归还工具
                </button>
              </div>
            )}

            {returningId === record.id && (
              <div className="px-4 pb-4 border-t border-wood-100 pt-3 space-y-3">
                <div className="flex items-center gap-2">
                  <Camera size={14} className="text-wood-400" />
                  <span className="text-xs text-wood-600">归还确认</span>
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-medium text-wood-700 mb-2">
                    <Image size={14} />
                    归还照片
                  </label>
                  {returnForm.returnPhoto ? (
                    <div className="relative w-full h-36 rounded-xl overflow-hidden border border-wood-200 mb-2">
                      <img src={returnForm.returnPhoto} alt="归还照片" className="w-full h-full object-cover" />
                      <button
                        onClick={() => setReturnForm(f => ({ ...f, returnPhoto: '' }))}
                        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 text-sm"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => setReturnForm(f => ({ ...f, returnPhoto: tool.photo }))}
                      className="w-full h-24 rounded-xl border-2 border-dashed border-wood-200 flex flex-col items-center justify-center bg-wood-50/50 hover:border-grass-400 transition-colors cursor-pointer"
                    >
                      <Camera size={20} className="text-wood-300 mb-1" />
                      <span className="text-xs text-wood-400">点击上传归还照片</span>
                    </div>
                  )}
                  <input
                    type="text"
                    value={returnForm.returnPhoto}
                    onChange={e => setReturnForm(f => ({ ...f, returnPhoto: e.target.value }))}
                    placeholder="或输入图片地址"
                    className="w-full px-3 py-2 rounded-lg border border-wood-200 text-sm focus:ring-2 focus:ring-grass-400 outline-none mt-2"
                  />
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={returnForm.hasDamage}
                    onChange={e => setReturnForm(f => ({ ...f, hasDamage: e.target.checked }))}
                    className="rounded border-wood-300 text-red-500 focus:ring-red-400"
                  />
                  <span className="text-sm text-wood-700">工具存在损坏</span>
                </label>
                {returnForm.hasDamage && (
                  <>
                    <textarea
                      rows={2}
                      value={returnForm.damageDescription}
                      onChange={e => setReturnForm(f => ({ ...f, damageDescription: e.target.value }))}
                      placeholder="描述损坏情况..."
                      className="w-full px-3 py-2 rounded-lg border border-wood-200 text-sm focus:ring-2 focus:ring-grass-400 outline-none resize-none"
                    />
                    <input
                      type="number"
                      min={0}
                      value={returnForm.damageCompensation}
                      onChange={e => setReturnForm(f => ({ ...f, damageCompensation: Number(e.target.value) }))}
                      placeholder="赔付金额（元）"
                      className="w-full px-3 py-2 rounded-lg border border-wood-200 text-sm focus:ring-2 focus:ring-grass-400 outline-none"
                    />
                  </>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setReturningId(null)
                      setReturnForm({ returnPhoto: '', hasDamage: false, damageDescription: '', damageCompensation: 0 })
                    }}
                    className="flex-1 py-2 rounded-lg border border-wood-200 text-wood-600 text-sm"
                  >
                    取消
                  </button>
                  <button
                    onClick={() => handleReturn(record.id)}
                    className="flex-1 py-2 rounded-lg bg-grass-600 hover:bg-grass-700 text-white text-sm font-medium transition-colors"
                  >
                    确认归还
                  </button>
                </div>
              </div>
            )}

            {record.status === 'pending' && (
              <div className="px-4 pb-3">
                <div className="flex items-center gap-1.5 text-xs text-yellow-600 bg-yellow-50 rounded-lg px-3 py-2">
                  <Clock size={12} />
                  等待工具主人确认
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function LentTab() {
  const getBorrowRecordsByOwner = useBorrowStore(s => s.getBorrowRecordsByOwner)
  const confirmBorrow = useBorrowStore(s => s.confirmBorrow)
  const getToolById = useToolStore(s => s.getToolById)
  const getUserById = useUserStore(s => s.getUserById)
  const records = getBorrowRecordsByOwner(CURRENT_USER_ID)

  const getDisplayStatus = (record: BorrowRecord) => {
    if (record.status === 'active' && new Date() > new Date(record.expectedReturnTime)) {
      return 'overdue'
    }
    return record.status
  }

  if (records.length === 0) {
    return <EmptyState text="暂无借出记录" />
  }

  return (
    <div className="space-y-3">
      {records.map(record => {
        const tool = getToolById(record.toolId)
        const borrower = getUserById(record.borrowerId)
        if (!tool) return null
        const displayStatus = getDisplayStatus(record)
        const isOverdueNow = displayStatus === 'overdue'

        return (
          <div key={record.id} className="border border-wood-100 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <img
                src={tool.photo}
                alt={tool.name}
                className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-wood-800 text-sm">{tool.name}</span>
                  <RecordStatusBadge status={displayStatus} />
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <img src={borrower?.avatar || ''} alt="" className="w-5 h-5 rounded-full" />
                  <span className="text-xs text-wood-600">{borrower?.name}</span>
                </div>
                <p className="text-xs text-wood-500 mb-1">{record.purpose}</p>
                <div className="text-xs text-wood-400">
                  {formatTime(record.startTime)} ~ {formatTime(record.expectedReturnTime)}
                </div>
                {(isOverdueNow || record.isOverdue) && (
                  <div className="flex items-center gap-1 text-xs text-red-500 mt-1">
                    <AlertTriangle size={12} />
                    已逾期
                  </div>
                )}
                {record.hasDamage && (
                  <div className="text-xs text-amber-600 mt-1">
                    损坏：{record.damageDescription} · 赔付 ¥{record.damageCompensation}
                  </div>
                )}
              </div>
            </div>

            {record.status === 'pending' && (
              <button
                onClick={() => confirmBorrow(record.id)}
                className="mt-3 w-full py-2 rounded-lg bg-grass-600 hover:bg-grass-700 text-white text-sm font-medium transition-colors"
              >
                确认借出
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}

function CreditTab() {
  const getCurrentUser = useUserStore(s => s.getCurrentUser)
  const creditLogs = useUserStore(s => s.creditLogs)
  const user = getCurrentUser()
  const userLogs = creditLogs
    .filter(l => l.userId === user.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const creditLevel = user.creditScore >= 110 ? '优秀' : user.creditScore >= 90 ? '良好' : user.creditScore >= 70 ? '一般' : '较差'
  const levelColor = user.creditScore >= 110 ? 'text-grass-600' : user.creditScore >= 90 ? 'text-blue-600' : user.creditScore >= 70 ? 'text-amber-600' : 'text-red-600'

  return (
    <div>
      <div className="text-center py-6 border-b border-wood-100 mb-4">
        <div className="text-5xl font-bold text-wood-800 mb-1">{user.creditScore}</div>
        <div className={`text-sm font-medium ${levelColor}`}>信用{creditLevel}</div>
      </div>

      <div className="space-y-2">
        {userLogs.map(log => (
          <div key={log.id} className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-wood-50 transition-colors">
            {log.change > 0 ? (
              <TrendingUp size={16} className="text-grass-600" />
            ) : (
              <TrendingDown size={16} className="text-red-500" />
            )}
            <div className="flex-1 min-w-0">
              <div className="text-sm text-wood-700">{log.reason}</div>
              <div className="text-xs text-wood-400">{formatTime(log.createdAt)}</div>
            </div>
            <span className={`text-sm font-semibold ${log.change > 0 ? 'text-grass-600' : 'text-red-500'}`}>
              {log.change > 0 ? '+' : ''}{log.change}
            </span>
          </div>
        ))}
        {userLogs.length === 0 && <EmptyState text="暂无信用变动记录" />}
      </div>
    </div>
  )
}

function RecordStatusBadge({ status }: { status: BorrowRecord['status'] }) {
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
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  )
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="text-center py-12">
      <BookOpen size={32} className="mx-auto text-wood-300 mb-3" />
      <p className="text-sm text-wood-400">{text}</p>
    </div>
  )
}

function formatTime(iso: string) {
  if (!iso) return '-'
  const d = new Date(iso)
  return d.toLocaleString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}
