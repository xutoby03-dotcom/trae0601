import { useState, useEffect, useRef, useMemo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Camera, DollarSign, Upload, X } from 'lucide-react'
import { useAppState } from '../store/AppContext'
import { CATEGORY_CONFIG } from '../types'
import type { ExpenseCategory, ExpenseStatus } from '../types'

const CATEGORIES: ExpenseCategory[] = ['transport', 'hotel', 'food', 'ticket', 'shopping', 'other']

function getToday() {
  return new Date().toISOString().split('T')[0]
}

export default function AddExpense() {
  const { tripId } = useParams<{ tripId: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { state, dispatch } = useAppState()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const expenseId = searchParams.get('expenseId')
  const trip = state.trips.find(t => t.id === tripId)
  const existingExpense = expenseId ? trip?.expenses.find(e => e.id === expenseId) : null
  const isEditing = !!existingExpense

  const activeParticipants = useMemo(
    () => trip?.participants.filter(p => p.isActive) ?? [],
    [trip]
  )

  const [amount, setAmount] = useState(existingExpense?.amount.toString() ?? '')
  const [category, setCategory] = useState<ExpenseCategory>(existingExpense?.category ?? 'food')
  const [description, setDescription] = useState(existingExpense?.description ?? '')
  const [payerId, setPayerId] = useState(existingExpense?.payerId ?? '')
  const [date, setDate] = useState(existingExpense?.date ?? getToday())
  const [splitAmong, setSplitAmong] = useState<string[]>(
    existingExpense?.splitAmong ?? activeParticipants.map(p => p.id)
  )
  const [useSharedFund, setUseSharedFund] = useState(existingExpense?.useSharedFund ?? false)
  const [photo, setPhoto] = useState(existingExpense?.photo ?? '')
  const [notes, setNotes] = useState(existingExpense?.notes ?? '')
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!payerId && activeParticipants.length > 0) {
      setPayerId(activeParticipants[0].id)
    }
  }, [activeParticipants, payerId])

  useEffect(() => {
    if (!existingExpense && activeParticipants.length > 0) {
      setSplitAmong(activeParticipants.map(p => p.id))
    }
  }, [activeParticipants, existingExpense])

  function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => {
      setPhoto(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  function toggleSplitParticipant(id: string) {
    setSplitAmong(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  function toggleSelectAll() {
    if (splitAmong.length === activeParticipants.length) {
      setSplitAmong([])
    } else {
      setSplitAmong(activeParticipants.map(p => p.id))
    }
  }

  function validate(): boolean {
    const newErrors: Record<string, string> = {}
    const numAmount = parseFloat(amount)
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      newErrors.amount = '请输入有效金额'
    }
    if (!description.trim()) {
      newErrors.description = '请输入描述'
    }
    if (!payerId) {
      newErrors.payerId = '请选择付款人'
    }
    if (splitAmong.length === 0) {
      newErrors.splitAmong = '请至少选择一位分摊人'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate() || !tripId) return

    const expenseData = {
      payerId,
      amount: parseFloat(amount),
      category,
      date,
      description: description.trim(),
      splitAmong,
      photo: photo || undefined,
      notes,
      status: 'pending' as ExpenseStatus,
      useSharedFund,
    }

    if (isEditing && expenseId) {
      dispatch({
        type: 'UPDATE_EXPENSE',
        payload: { tripId, expenseId, ...expenseData },
      })
    } else {
      dispatch({ type: 'ADD_EXPENSE', payload: { tripId, ...expenseData } })
    }

    navigate(-1)
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">未找到旅行</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="sticky top-0 z-10 bg-white border-b border-gray-100">
        <div className="flex items-center gap-3 px-4 h-14">
          <button onClick={() => navigate(-1)} className="p-1 -ml-1 text-gray-600">
            <ArrowLeft size={22} />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">
            {isEditing ? '编辑花费' : '添加花费'}
          </h1>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="px-4 pt-6 space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign size={20} className="text-orange-500" />
            <span className="text-sm text-gray-500">金额</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-gray-300">¥</span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0.00"
              className="text-4xl font-bold text-gray-900 bg-transparent outline-none w-full placeholder:text-gray-200"
            />
          </div>
          {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-sm text-gray-500 mb-3">分类</p>
          <div className="grid grid-cols-3 gap-2">
            {CATEGORIES.map(cat => {
              const config = CATEGORY_CONFIG[cat]
              const isSelected = category === cat
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`flex flex-col items-center gap-1 py-3 rounded-xl transition-all ${
                    isSelected
                      ? 'bg-orange-50 ring-2 ring-orange-400'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-2xl">{config.icon}</span>
                  <span className={`text-xs ${isSelected ? 'text-orange-600 font-medium' : 'text-gray-600'}`}>
                    {config.label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <label className="text-sm text-gray-500 mb-2 block">描述</label>
          <input
            type="text"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="例如：午餐、打车去机场"
            className="w-full px-3 py-2.5 bg-gray-50 rounded-xl text-gray-900 placeholder:text-gray-300 outline-none focus:ring-2 focus:ring-orange-300 transition-all"
          />
          {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <label className="text-sm text-gray-500 mb-3 block">付款人</label>
          <div className="space-y-2">
            {activeParticipants.map(p => (
              <label
                key={p.id}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                  payerId === p.id ? 'bg-orange-50 ring-2 ring-orange-400' : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium shrink-0"
                  style={{ backgroundColor: p.color }}
                >
                  {p.name[0]}
                </div>
                <span className="text-sm text-gray-900 flex-1">{p.name}</span>
                <input
                  type="radio"
                  name="payerId"
                  value={p.id}
                  checked={payerId === p.id}
                  onChange={() => setPayerId(p.id)}
                  className="accent-orange-500"
                />
              </label>
            ))}
          </div>
          {errors.payerId && <p className="text-red-500 text-xs mt-1">{errors.payerId}</p>}
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <label className="text-sm text-gray-500 mb-2 block">日期</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full px-3 py-2.5 bg-gray-50 rounded-xl text-gray-900 outline-none focus:ring-2 focus:ring-orange-300 transition-all"
          />
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm text-gray-500">分摊人</label>
            <button
              type="button"
              onClick={toggleSelectAll}
              className="text-xs text-orange-500 font-medium"
            >
              {splitAmong.length === activeParticipants.length ? '取消全选' : '全选'}
            </button>
          </div>
          <div className="space-y-2">
            {activeParticipants.map(p => (
              <label
                key={p.id}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                  splitAmong.includes(p.id) ? 'bg-orange-50' : 'bg-gray-50'
                }`}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium shrink-0"
                  style={{ backgroundColor: p.color }}
                >
                  {p.name[0]}
                </div>
                <span className="text-sm text-gray-900 flex-1">{p.name}</span>
                <input
                  type="checkbox"
                  checked={splitAmong.includes(p.id)}
                  onChange={() => toggleSplitParticipant(p.id)}
                  className="accent-orange-500 size-4"
                />
              </label>
            ))}
          </div>
          {errors.splitAmong && <p className="text-red-500 text-xs mt-1">{errors.splitAmong}</p>}
          {splitAmong.length > 0 && (
            <p className="text-xs text-gray-400 mt-2">
              每人 ¥{(parseFloat(amount || '0') / splitAmong.length).toFixed(2)}
            </p>
          )}
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-900 font-medium">使用公费</p>
              <p className="text-xs text-gray-400">从公费基金中支付</p>
            </div>
            <button
              type="button"
              onClick={() => setUseSharedFund(!useSharedFund)}
              className={`relative w-12 h-7 rounded-full transition-colors ${
                useSharedFund ? 'bg-orange-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                  useSharedFund ? 'translate-x-5.5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <label className="text-sm text-gray-500 mb-2 block">拍照/上传</label>
          {photo ? (
            <div className="relative w-24 h-24">
              <img src={photo} alt="凭证" className="w-24 h-24 rounded-xl object-cover" />
              <button
                type="button"
                onClick={() => setPhoto('')}
                className="absolute -top-2 -right-2 w-6 h-6 bg-gray-800 text-white rounded-full flex items-center justify-center"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-24 h-24 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-orange-300 hover:text-orange-400 transition-colors"
            >
              <Camera size={24} />
              <Upload size={14} />
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            className="hidden"
          />
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <label className="text-sm text-gray-500 mb-2 block">备注</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="添加备注..."
            rows={3}
            className="w-full px-3 py-2.5 bg-gray-50 rounded-xl text-gray-900 placeholder:text-gray-300 outline-none focus:ring-2 focus:ring-orange-300 transition-all resize-none"
          />
        </div>

        <button
          type="submit"
          className="w-full py-4 bg-orange-500 text-white font-semibold rounded-2xl text-lg shadow-lg shadow-orange-200 active:bg-orange-600 transition-colors"
        >
          {isEditing ? '保存修改' : '添加花费'}
        </button>
      </form>
    </div>
  )
}
