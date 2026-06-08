import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '@/store/useStore'
import { CATEGORIES, CATEGORY_COLORS, PRE_MOODS, POST_FEELINGS, PAYMENT_METHODS, MOOD_EMOJIS, MOOD_COLORS, POST_FEELING_EMOJIS } from '@/types'
import type { Category, PreMood, PostFeeling, PaymentMethod } from '@/types'
import { generateId } from '@/utils/helpers'
import { ArrowLeft, Check } from 'lucide-react'

export default function NewExpense() {
  const navigate = useNavigate()
  const addExpense = useStore((s) => s.addExpense)

  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState<Category>('吃饭')
  const [merchant, setMerchant] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('微信')
  const [isPlanned, setIsPlanned] = useState(true)
  const [preMood, setPreMood] = useState<PreMood>('平静')
  const [postFeeling, setPostFeeling] = useState<PostFeeling>('满足')

  const displayAmount = amount ? parseFloat(amount) : 0
  const canSave = displayAmount > 0

  const handleSave = () => {
    if (!canSave) return
    addExpense({
      id: generateId(),
      amount: displayAmount,
      category,
      merchant,
      paymentMethod,
      isPlanned,
      preMood,
      postFeeling,
      review: '',
      regretStatus: '',
      createdAt: new Date().toISOString(),
    })
    navigate('/')
  }

  return (
    <div className="animate-fade-in min-h-screen pb-28">
      <header className="sticky top-0 z-20 flex items-center justify-between px-4 py-3 bg-midnight/80 backdrop-blur-md">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-white/70 active:scale-95 transition-transform">
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-lg font-medium text-white">记一笔</h1>
        <button onClick={handleSave} disabled={!canSave} className={`p-2 -mr-2 transition-transform active:scale-95 ${canSave ? 'text-coral' : 'text-white/30'}`}>
          <Check size={22} />
        </button>
      </header>

      <div className="px-4 pt-4 space-y-6">
        <div className="text-center mb-6">
          <p className="text-4xl font-bold text-white">
            ¥{displayAmount > 0 ? displayAmount.toFixed(2) : '0.00'}
          </p>
        </div>

        <div className="mb-6">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="输入金额"
            className="w-full glass rounded-xl px-5 py-4 text-2xl text-white text-center outline-none placeholder:text-white/30"
          />
        </div>

        <div className="mb-6">
          <p className="text-sm text-white/50 mb-2">类别</p>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {CATEGORIES.map((cat) => {
              const color = CATEGORY_COLORS[cat]
              const selected = category === cat
              return (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selected
                      ? 'scale-105 border-2'
                      : 'border border-white/10 opacity-70'
                  }`}
                  style={{
                    backgroundColor: selected ? color + '40' : color + '15',
                    borderColor: selected ? color : 'rgba(255,255,255,0.1)',
                    color: color,
                  }}
                >
                  {cat}
                </button>
              )
            })}
          </div>
        </div>

        <div className="mb-6">
          <p className="text-sm text-white/50 mb-2">商家</p>
          <input
            type="text"
            value={merchant}
            onChange={(e) => setMerchant(e.target.value)}
            placeholder="输入商家名称"
            className="w-full glass rounded-xl px-4 py-3 text-white outline-none placeholder:text-white/30"
          />
        </div>

        <div className="mb-6">
          <p className="text-sm text-white/50 mb-2">支付方式</p>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {PAYMENT_METHODS.map((method) => {
              const selected = paymentMethod === method
              return (
                <button
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all glass ${
                    selected
                      ? 'scale-105 border-2 border-coral/60 bg-coral/20 text-coral'
                      : 'border border-white/10 text-white/70'
                  }`}
                >
                  {method}
                </button>
              )
            })}
          </div>
        </div>

        <div className="mb-6">
          <p className="text-sm text-white/50 mb-2">是否计划内</p>
          <div className="flex gap-3">
            <button
              onClick={() => setIsPlanned(true)}
              className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${
                isPlanned
                  ? 'gradient-mint text-white shadow-lg shadow-mint/20'
                  : 'glass text-white/50'
              }`}
            >
              计划内
            </button>
            <button
              onClick={() => setIsPlanned(false)}
              className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${
                !isPlanned
                  ? 'gradient-coral text-white shadow-lg shadow-coral/20'
                  : 'glass text-white/50'
              }`}
            >
              非计划
            </button>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-sm text-white/50 mb-2">购买前心情</p>
          <div className="grid grid-cols-3 gap-2">
            {PRE_MOODS.map((mood) => {
              const color = MOOD_COLORS[mood]
              const selected = preMood === mood
              return (
                <button
                  key={mood}
                  onClick={() => setPreMood(mood)}
                  className={`flex items-center justify-center gap-1.5 py-3 rounded-xl text-sm font-medium transition-all ${
                    selected ? 'scale-105 border-2' : 'border border-white/10'
                  }`}
                  style={{
                    backgroundColor: selected ? color + '30' : 'transparent',
                    borderColor: selected ? color : 'rgba(255,255,255,0.1)',
                    color: selected ? color : 'rgba(255,255,255,0.5)',
                  }}
                >
                  <span>{MOOD_EMOJIS[mood]}</span>
                  <span>{mood}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="mb-6">
          <p className="text-sm text-white/50 mb-2">买完后感受</p>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {POST_FEELINGS.map((feeling) => {
              const selected = postFeeling === feeling
              return (
                <button
                  key={feeling}
                  onClick={() => setPostFeeling(feeling)}
                  className={`shrink-0 flex items-center gap-1.5 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    selected
                      ? 'scale-105 border-2 border-gold/60 bg-gold/15 text-gold'
                      : 'border border-white/10 text-white/50'
                  }`}
                >
                  <span>{POST_FEELING_EMOJIS[feeling]}</span>
                  <span>{feeling}</span>
                </button>
              )
            })}
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={!canSave}
          className={`w-full gradient-coral rounded-2xl py-4 text-white font-medium text-lg transition-all active:scale-[0.98] ${
            canSave ? '' : 'opacity-50'
          }`}
        >
          保存
        </button>
      </div>
    </div>
  )
}
