import { useState } from 'react'
import { X, UserPlus, Users, Building2, Baby, Phone } from 'lucide-react'
import { useCinemaStore } from '@/store'
import type { RegistrationFormData } from '@/types'

interface RegistrationFormProps {
  screeningId: string
  seatLimit: number
  confirmedCount: number
  onClose: () => void
}

const emptyForm: RegistrationFormData = {
  name: '',
  peopleCount: 1,
  building: '',
  hasChildren: false,
  phone: '',
}

export default function RegistrationForm({ screeningId, seatLimit, confirmedCount, onClose }: RegistrationFormProps) {
  const [form, setForm] = useState<RegistrationFormData>(emptyForm)
  const [result, setResult] = useState<'confirmed' | 'waitlisted' | null>(null)
  const register = useCinemaStore((s) => s.register)

  const remainingSeats = seatLimit - confirmedCount
  const willBeWaitlisted = remainingSeats < form.peopleCount

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const status = register(screeningId, form)
    setResult(status)
  }

  const update = (field: keyof RegistrationFormData, value: string | number | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  if (result) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
           style={{ backgroundColor: 'rgba(27, 40, 56, 0.6)', backdropFilter: 'blur(4px)' }}
           onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center animate-slide-up">
          {result === 'confirmed' ? (
            <>
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                <UserPlus className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-night mb-2">报名成功！</h3>
              <p className="text-night-lighter text-sm">
                您已成功报名，请准时到场。放映当天请凭姓名签到。
              </p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-orange/10 flex items-center justify-center">
                <Users className="w-8 h-8 text-orange" />
              </div>
              <h3 className="text-xl font-bold text-night mb-2">已进入候补</h3>
              <p className="text-night-lighter text-sm">
                座位已满，您已加入候补队列。有人取消报名时，系统会自动为您递补。
              </p>
            </>
          )}
          <button onClick={onClose} className="btn-primary mt-6">
            我知道了
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
         style={{ backgroundColor: 'rgba(27, 40, 56, 0.6)', backdropFilter: 'blur(4px)' }}
         onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="flex items-center justify-between p-5 border-b border-night-lighter/10">
          <h2 className="text-lg font-bold text-night flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-orange" />
            居民报名
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-cream transition-colors">
            <X className="w-5 h-5 text-night-lighter" />
          </button>
        </div>

        <div className="px-5 pt-4">
          <div className="bg-cream rounded-xl p-3 mb-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-night-lighter">剩余座位</span>
              <span className={`font-bold ${remainingSeats > 0 ? 'text-green-600' : 'text-red-500'}`}>
                {remainingSeats > 0 ? remainingSeats : 0} 个
              </span>
            </div>
            <div className="h-2 mt-2 bg-night-lighter/10 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  remainingSeats <= 0 ? 'bg-red-400' : 'bg-gradient-to-r from-orange to-gold'
                }`}
                style={{ width: `${Math.min(100, (confirmedCount / seatLimit) * 100)}%` }}
              />
            </div>
          </div>

          {willBeWaitlisted && remainingSeats > 0 && (
            <div className="bg-orange/5 border border-orange/20 rounded-xl p-3 mb-4 text-sm text-orange">
              当前剩余 {remainingSeats} 个座位，不足 {form.peopleCount} 人，报名后将进入候补队列
            </div>
          )}

          {remainingSeats <= 0 && (
            <div className="bg-orange/5 border border-orange/20 rounded-xl p-3 mb-4 text-sm text-orange">
              座位已满，报名后将进入候补队列
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-5 pt-0 space-y-4">
          <div>
            <label className="label-field">
              <UserPlus className="w-3.5 h-3.5 inline mr-1" />姓名 *
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              className="input-field"
              placeholder="请输入您的姓名"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-field">
                <Users className="w-3.5 h-3.5 inline mr-1" />人数 *
              </label>
              <input
                type="number"
                required
                min={1}
                max={10}
                value={form.peopleCount}
                onChange={(e) => update('peopleCount', parseInt(e.target.value) || 1)}
                className="input-field"
              />
            </div>
            <div>
              <label className="label-field">
                <Building2 className="w-3.5 h-3.5 inline mr-1" />楼栋 *
              </label>
              <input
                type="text"
                required
                value={form.building}
                onChange={(e) => update('building', e.target.value)}
                className="input-field"
                placeholder="如: 3栋501"
              />
            </div>
          </div>

          <div>
            <label className="label-field">
              <Phone className="w-3.5 h-3.5 inline mr-1" />联系电话 *
            </label>
            <input
              type="tel"
              required
              value={form.phone}
              onChange={(e) => update('phone', e.target.value)}
              className="input-field"
              placeholder="请输入联系电话"
            />
          </div>

          <div className="flex items-center gap-3 py-2">
            <label className="relative flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.hasChildren}
                onChange={(e) => update('hasChildren', e.target.checked)}
                className="w-5 h-5 rounded border-night-lighter/30 text-orange focus:ring-orange/30"
              />
              <Baby className="w-4 h-4 text-orange" />
              <span className="text-sm text-night">是否带小孩（需准备儿童座椅）</span>
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" className={willBeWaitlisted ? 'btn-gold flex-1' : 'btn-primary flex-1'}>
              {willBeWaitlisted ? '加入候补' : '确认报名'}
            </button>
            <button type="button" onClick={onClose} className="btn-secondary">
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
