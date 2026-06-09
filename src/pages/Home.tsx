import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, MapPin, Calendar, Users, Trash2, X, ChevronRight, Wallet } from 'lucide-react'
import { useAppState } from '../store/AppContext'
import type { Trip, Participant } from '../types'
import { calculateBudgetUsage } from '../utils/settlement'

interface FormState {
  destination: string
  startDate: string
  endDate: string
  participantNames: string[]
  budget: string
}

const initialForm: FormState = {
  destination: '',
  startDate: '',
  endDate: '',
  participantNames: ['', ''],
  budget: '',
}

function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}月${d.getDate()}日`
}

function formatDateRange(start: string, end: string): string {
  if (!start || !end) return ''
  const s = new Date(start)
  const e = new Date(end)
  if (s.getFullYear() === e.getFullYear()) {
    return `${s.getFullYear()}年 ${formatDate(start)} - ${formatDate(end)}`
  }
  return `${formatDate(start)} - ${formatDate(end)}`
}

function TripCard({ trip }: { trip: Trip }) {
  const navigate = useNavigate()
  const budgetInfo = calculateBudgetUsage(trip)
  const activeParticipants = trip.participants.filter((p: Participant) => p.isActive)
  const pct = Math.min(budgetInfo.percentage, 100)

  const barColor =
    budgetInfo.percentage > 100
      ? 'bg-red-500'
      : budgetInfo.percentage > 80
        ? 'bg-amber-400'
        : 'bg-teal-500'

  return (
    <div
      onClick={() => navigate(`/trip/${trip.id}`)}
      className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 cursor-pointer hover:shadow-md hover:border-primary-200 transition-all duration-200 active:scale-[0.98]"
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-1.5">
          ✈️ {trip.destination}
        </h3>
        <ChevronRight className="w-4 h-4 text-slate-400 mt-1 shrink-0" />
      </div>

      <div className="flex items-center gap-1.5 text-sm text-slate-500 mb-3">
        <Calendar className="w-3.5 h-3.5" />
        <span>{formatDateRange(trip.startDate, trip.endDate)}</span>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <Users className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-sm text-slate-500">{activeParticipants.length}人</span>
        <div className="flex -space-x-1.5 ml-1">
          {activeParticipants.slice(0, 6).map((p: Participant) => (
            <div
              key={p.id}
              className="w-5 h-5 rounded-full border-2 border-white shrink-0"
              style={{ backgroundColor: p.color }}
              title={p.name}
            />
          ))}
          {activeParticipants.length > 6 && (
            <div className="w-5 h-5 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] text-slate-500 shrink-0">
              +{activeParticipants.length - 6}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1">
            <Wallet className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500">
              ¥{budgetInfo.totalSpent.toFixed(0)} / ¥{trip.budget.toFixed(0)}
            </span>
          </div>
          <span
            className={`text-xs font-medium ${
              budgetInfo.percentage > 100
                ? 'text-red-500'
                : budgetInfo.percentage > 80
                  ? 'text-amber-500'
                  : 'text-teal-600'
            }`}
          >
            {budgetInfo.percentage.toFixed(0)}%
          </span>
        </div>
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${barColor}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  )
}

function CreateTripModal({
  show,
  onClose,
}: {
  show: boolean
  onClose: () => void
}) {
  const { dispatch } = useAppState()
  const [form, setForm] = useState<FormState>(initialForm)
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})

  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  function addParticipant() {
    setForm(prev => ({
      ...prev,
      participantNames: [...prev.participantNames, ''],
    }))
  }

  function removeParticipant(index: number) {
    setForm(prev => ({
      ...prev,
      participantNames: prev.participantNames.filter((_, i) => i !== index),
    }))
  }

  function updateParticipant(index: number, name: string) {
    setForm(prev => ({
      ...prev,
      participantNames: prev.participantNames.map((n, i) => (i === index ? name : n)),
    }))
    if (errors.participantNames) {
      setErrors(prev => {
        const next = { ...prev }
        delete next.participantNames
        return next
      })
    }
  }

  function validate(): boolean {
    const newErrors: Partial<Record<keyof FormState, string>> = {}

    if (!form.destination.trim()) {
      newErrors.destination = '请输入目的地'
    }
    if (!form.startDate) {
      newErrors.startDate = '请选择开始日期'
    }
    if (!form.endDate) {
      newErrors.endDate = '请选择结束日期'
    }
    if (form.startDate && form.endDate && form.startDate > form.endDate) {
      newErrors.endDate = '结束日期不能早于开始日期'
    }
    const validNames = form.participantNames.filter(n => n.trim())
    if (validNames.length < 2) {
      newErrors.participantNames = '至少需要2位参与者'
    }
    const hasDuplicate = new Set(validNames.map(n => n.trim())).size !== validNames.length
    if (hasDuplicate) {
      newErrors.participantNames = '参与者姓名不能重复'
    }
    const budget = parseFloat(form.budget)
    if (!form.budget || isNaN(budget) || budget <= 0) {
      newErrors.budget = '请输入有效的预算金额'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function handleSubmit() {
    if (!validate()) return

    dispatch({
      type: 'ADD_TRIP',
      payload: {
        destination: form.destination.trim(),
        startDate: form.startDate,
        endDate: form.endDate,
        participantNames: form.participantNames.filter(n => n.trim()),
        budget: parseFloat(form.budget),
      },
    })

    setForm(initialForm)
    setErrors({})
    onClose()
  }

  function handleClose() {
    setForm(initialForm)
    setErrors({})
    onClose()
  }

  if (!show) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative bg-white w-full max-w-lg rounded-t-3xl sm:rounded-2xl max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="sticky top-0 bg-white z-10 px-5 pt-5 pb-3 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800">✨ 创建新旅行</h2>
            <button
              onClick={handleClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              <MapPin className="w-3.5 h-3.5 inline mr-1" />
              目的地
            </label>
            <input
              type="text"
              value={form.destination}
              onChange={e => updateField('destination', e.target.value)}
              placeholder="例如：东京、巴厘岛"
              className={`w-full px-3 py-2.5 rounded-xl border ${
                errors.destination ? 'border-red-400 bg-red-50' : 'border-slate-200'
              } focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-colors text-slate-800 placeholder:text-slate-400`}
            />
            {errors.destination && (
              <p className="text-xs text-red-500 mt-1">{errors.destination}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">开始日期</label>
              <input
                type="date"
                value={form.startDate}
                onChange={e => updateField('startDate', e.target.value)}
                className={`w-full px-3 py-2.5 rounded-xl border ${
                  errors.startDate ? 'border-red-400 bg-red-50' : 'border-slate-200'
                } focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-colors text-slate-800`}
              />
              {errors.startDate && (
                <p className="text-xs text-red-500 mt-1">{errors.startDate}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">结束日期</label>
              <input
                type="date"
                value={form.endDate}
                onChange={e => updateField('endDate', e.target.value)}
                className={`w-full px-3 py-2.5 rounded-xl border ${
                  errors.endDate ? 'border-red-400 bg-red-50' : 'border-slate-200'
                } focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-colors text-slate-800`}
              />
              {errors.endDate && (
                <p className="text-xs text-red-500 mt-1">{errors.endDate}</p>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium text-slate-700">
                <Users className="w-3.5 h-3.5 inline mr-1" />
                参与者
              </label>
              <button
                type="button"
                onClick={addParticipant}
                className="text-sm text-primary-500 hover:text-primary-600 font-medium flex items-center gap-0.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                添加
              </button>
            </div>
            <div className="space-y-2">
              {form.participantNames.map((name, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={name}
                    onChange={e => updateParticipant(i, e.target.value)}
                    placeholder={`参与者 ${i + 1}`}
                    className={`flex-1 px-3 py-2 rounded-xl border ${
                      errors.participantNames && !name.trim()
                        ? 'border-red-400 bg-red-50'
                        : 'border-slate-200'
                    } focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-colors text-slate-800 placeholder:text-slate-400`}
                  />
                  {form.participantNames.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeParticipant(i)}
                      className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {errors.participantNames && (
              <p className="text-xs text-red-500 mt-1">{errors.participantNames}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              <Wallet className="w-3.5 h-3.5 inline mr-1" />
              总预算 (¥)
            </label>
            <input
              type="number"
              value={form.budget}
              onChange={e => updateField('budget', e.target.value)}
              placeholder="0.00"
              min="0"
              step="100"
              className={`w-full px-3 py-2.5 rounded-xl border ${
                errors.budget ? 'border-red-400 bg-red-50' : 'border-slate-200'
              } focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-colors text-slate-800 placeholder:text-slate-400`}
            />
            {errors.budget && (
              <p className="text-xs text-red-500 mt-1">{errors.budget}</p>
            )}
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-slate-100 px-5 py-4">
          <button
            onClick={handleSubmit}
            className="w-full py-3 bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-white font-semibold rounded-xl shadow-sm transition-colors"
          >
            创建旅行
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const { state, dispatch } = useAppState()
  const [showCreate, setShowCreate] = useState(false)

  function handleDeleteTrip(tripId: string, e: React.MouseEvent) {
    e.stopPropagation()
    dispatch({ type: 'DELETE_TRIP', payload: { tripId } })
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-800">
            🧳 旅行分账
          </h1>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            新旅行
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-4">
        {state.trips.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mb-4">
              <MapPin className="w-9 h-9 text-primary-400" />
            </div>
            <h2 className="text-lg font-semibold text-slate-700 mb-1">还没有旅行记录</h2>
            <p className="text-sm text-slate-400 mb-6">点击「新旅行」开始你的第一次分账吧</p>
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-white font-semibold rounded-xl shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              创建旅行
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {state.trips.map(trip => (
              <div key={trip.id} className="relative group">
                <TripCard trip={trip} />
                <button
                  onClick={e => handleDeleteTrip(trip.id, e)}
                  className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full bg-slate-100/80 hover:bg-red-50 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all duration-200"
                  title="删除旅行"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      <CreateTripModal show={showCreate} onClose={() => setShowCreate(false)} />
    </div>
  )
}
