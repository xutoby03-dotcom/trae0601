import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useStore } from '@/store/useStore'
import { CATEGORY_COLORS, MOOD_EMOJIS, MOOD_COLORS, POST_FEELING_EMOJIS } from '@/types'
import type { RegretStatus } from '@/types'
import { REGRET_STATUSES } from '@/types'
import { formatAmount, formatDateTime } from '@/utils/helpers'
import { ArrowLeft, Trash2, Save } from 'lucide-react'

const REGRET_BUTTON_STYLES: Record<RegretStatus, { active: string; text: string }> = {
  '后悔': { active: 'bg-coral/20 border-coral text-coral', text: '后悔' },
  '不后悔': { active: 'bg-mint/20 border-mint text-mint', text: '不后悔' },
  '可替代': { active: 'bg-gold/20 border-gold text-gold', text: '可替代' },
}

export default function ExpenseDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { expenses, updateExpense, deleteExpense } = useStore()

  const expense = expenses.find((e) => e.id === id)

  const [review, setReview] = useState(expense?.review ?? '')
  const [regretStatus, setRegretStatus] = useState<RegretStatus | ''>(expense?.regretStatus ?? '')

  if (!expense) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-white/50 text-lg">未找到该记录</p>
      </div>
    )
  }

  const handleSave = () => {
    updateExpense(expense.id, { review, regretStatus })
    navigate(-1)
  }

  const handleDelete = () => {
    if (window.confirm('确定要删除这条记录吗？')) {
      deleteExpense(expense.id)
      navigate('/')
    }
  }

  const isRegret = regretStatus === '后悔'

  return (
    <div className="animate-fade-in px-4 pb-8 pt-4 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl glass hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-white/70" />
        </button>
        <h1 className="text-lg font-medium text-white">支出详情</h1>
        <button
          onClick={handleDelete}
          className="p-2 rounded-xl glass hover:bg-coral/20 transition-colors"
        >
          <Trash2 className="w-5 h-5 text-coral" />
        </button>
      </div>

      <div
        className="glass rounded-2xl p-5 mb-6"
        style={{ borderLeft: `4px solid ${CATEGORY_COLORS[expense.category]}` }}
      >
        <p className="text-3xl font-bold text-white mb-4">
          ¥{formatAmount(expense.amount)}
        </p>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-white/40">类别</span>
            <p className="text-white/90">{expense.category}</p>
          </div>
          <div>
            <span className="text-white/40">商家</span>
            <p className="text-white/90">{expense.merchant}</p>
          </div>
          <div>
            <span className="text-white/40">支付方式</span>
            <p className="text-white/90">{expense.paymentMethod}</p>
          </div>
          <div>
            <span className="text-white/40">计划</span>
            <p className="text-white/90">{expense.isPlanned ? '计划内' : '非计划'}</p>
          </div>
          <div>
            <span className="text-white/40">购买前心情</span>
            <p style={{ color: MOOD_COLORS[expense.preMood] }}>
              {MOOD_EMOJIS[expense.preMood]} {expense.preMood}
            </p>
          </div>
          <div>
            <span className="text-white/40">买后感受</span>
            <p className="text-white/90">
              {POST_FEELING_EMOJIS[expense.postFeeling]} {expense.postFeeling}
            </p>
          </div>
        </div>
        <p className="text-white/30 text-xs mt-4">{formatDateTime(expense.createdAt)}</p>
      </div>

      <div className="mb-6">
        <h2 className="text-white/80 text-sm font-medium mb-3 flex items-center gap-2">
          复盘
          <span className="flex-1 h-px bg-white/10" />
        </h2>
        <textarea
          value={review}
          onChange={(e) => setReview(e.target.value)}
          placeholder="写下你对这笔消费的复盘..."
          className="w-full glass rounded-xl p-4 text-white/90 text-sm placeholder-white/20 bg-transparent outline-none resize-none min-h-[120px]"
        />
      </div>

      <div className="mb-6">
        <h2 className="text-white/80 text-sm font-medium mb-3">这笔消费...</h2>
        <div className="flex gap-3">
          {REGRET_STATUSES.map((status) => {
            const style = REGRET_BUTTON_STYLES[status]
            const isSelected = regretStatus === status
            return (
              <button
                key={status}
                onClick={() => setRegretStatus(regretStatus === status ? '' : status)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                  isSelected
                    ? style.active
                    : 'glass border-white/10 text-white/50'
                }`}
              >
                {style.text}
              </button>
            )
          })}
        </div>
      </div>

      <button
        onClick={handleSave}
        className={`w-full ${isRegret ? 'gradient-coral' : 'gradient-mint'} rounded-2xl py-3 flex items-center justify-center gap-2 text-white font-medium transition-opacity hover:opacity-90`}
      >
        <Save className="w-4 h-4" />
        保存复盘
      </button>
    </div>
  )
}
