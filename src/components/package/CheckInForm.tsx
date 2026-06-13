import { useState } from 'react'
import { PackagePlus, Save, ChevronRight } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import type { Locker, LockerSize } from '@/types'
import { EXPRESS_COMPANIES, LOCKER_SIZE_OPTIONS } from '@/utils/constants'
import { validatePhoneLastFour } from '@/utils/helpers'
import LockerGrid from '../locker/LockerGrid'

interface CheckInFormProps {
  onSubmit: () => void
  onCancel: () => void
  preSelectedLockerId?: string
}

type Step = 'info' | 'locker'

export default function CheckInForm({ onSubmit, onCancel, preSelectedLockerId }: CheckInFormProps) {
  const { lockers, getLockerByCode, checkInPackage } = useAppStore()
  const [step, setStep] = useState<Step>(preSelectedLockerId ? 'info' : 'locker')
  const [selectedLocker, setSelectedLocker] = useState<Locker | null>(
    preSelectedLockerId ? lockers.find(l => l.id === preSelectedLockerId) || null : null
  )

  const [recipientName, setRecipientName] = useState('')
  const [phoneLastFour, setPhoneLastFour] = useState('')
  const [expressCompany, setExpressCompany] = useState<string>(EXPRESS_COMPANIES[0])
  const [size, setSize] = useState<LockerSize>('medium')
  const [isFragile, setIsFragile] = useState(false)
  const [codeSearch, setCodeSearch] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleCodeSearch = () => {
    const locker = getLockerByCode(codeSearch.trim().toUpperCase())
    if (!locker) {
      setErrors({ code: '未找到该编号的柜格' })
      return
    }
    if (locker.status !== 'empty') {
      setErrors({ code: `该柜格当前状态：${locker.status === 'occupied' ? '已占用' : '催取中'}` })
      return
    }
    setSelectedLocker(locker)
    setStep('info')
    setErrors({})
  }

  const validateInfo = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!recipientName.trim()) newErrors.recipientName = '请输入收件人姓名'
    if (!validatePhoneLastFour(phoneLastFour)) newErrors.phoneLastFour = '请输入4位数字'
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return false
    }
    return true
  }

  const handleSubmit = () => {
    if (!selectedLocker) return
    if (!validateInfo()) return
    checkInPackage({
      lockerId: selectedLocker.id,
      recipientName: recipientName.trim(),
      phoneLastFour,
      expressCompany,
      size,
      isFragile,
    })
    onSubmit()
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        {[
          { step: 'locker' as Step, label: '选择柜格', num: 1 },
          { step: 'info' as Step, label: '填写包裹信息', num: 2 },
        ].map((s, idx) => (
          <div key={s.step} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
              (step === s.step) ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30'
              : idx < ['locker', 'info'].indexOf(step) ? 'bg-primary-100 text-primary-700'
              : 'bg-slate-100 text-slate-400'
            }`}>
              {idx < ['locker', 'info'].indexOf(step) ? '✓' : s.num}
            </div>
            <span className={`text-sm font-medium ${step === s.step ? 'text-slate-800' : 'text-slate-400'}`}>{s.label}</span>
            {idx < 1 && <ChevronRight size={16} className="text-slate-300" />}
          </div>
        ))}
      </div>

      {step === 'locker' ? (
        <div>
          <div className="flex items-center gap-2 mb-5 p-4 rounded-xl bg-primary-50 border border-primary-100">
            <PackagePlus size={20} className="text-primary-600 shrink-0" />
            <p className="text-sm text-primary-800">请选择一个<span className="font-bold">空闲</span>的柜格存放包裹，也可输入编号快速定位</p>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 relative">
              <input
                type="text"
                value={codeSearch}
                onChange={(e) => setCodeSearch(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && handleCodeSearch()}
                placeholder="输入柜格编号快速选择，如 A-01"
                className={`w-full px-4 py-3 rounded-lg border text-sm focus:outline-none focus:ring-2 ${
                  errors.code
                    ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                    : 'border-slate-200 focus:border-primary-400 focus:ring-primary-100'
                }`}
              />
            </div>
            <button
              type="button"
              onClick={handleCodeSearch}
              className="px-5 py-3 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-colors"
            >
              确定
            </button>
          </div>
          {errors.code && <p className="mb-4 -mt-2 text-xs text-red-500">{errors.code}</p>}

          <div className="max-h-[420px] overflow-y-auto scrollbar-thin pr-1">
            <LockerGrid
              selectable
              selectedId={selectedLocker?.id}
              onSelect={(l) => setSelectedLocker(l)}
              showToolbar={false}
            />
          </div>

          <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50"
            >
              取消
            </button>
            <button
              type="button"
              disabled={!selectedLocker}
              onClick={() => { setStep('info'); setErrors({}) }}
              className={`inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-sm font-medium shadow-sm transition-all ${
                selectedLocker
                  ? 'bg-primary-600 text-white hover:bg-primary-700'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              下一步
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      ) : (
        <div>
          {selectedLocker && (
            <div className="mb-5 p-4 rounded-xl bg-gradient-to-r from-primary-50 to-teal-50 border border-primary-100">
              <p className="text-xs text-primary-600 mb-1">已选柜格</p>
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-serif font-bold text-xl text-slate-800">{selectedLocker.code}</span>
                  <span className="ml-3 text-sm text-slate-600">· {selectedLocker.location}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setStep('locker')}
                  className="text-sm text-primary-600 font-medium hover:text-primary-700"
                >
                  重新选择
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                收件人姓名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="请输入收件人姓名"
                className={`w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 ${
                  errors.recipientName
                    ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                    : 'border-slate-200 focus:border-primary-400 focus:ring-primary-100'
                }`}
              />
              {errors.recipientName && <p className="mt-1 text-xs text-red-500">{errors.recipientName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                手机号后四位 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={4}
                value={phoneLastFour}
                onChange={(e) => setPhoneLastFour(e.target.value.replace(/\D/g, ''))}
                placeholder="4位数字，如 1234"
                className={`w-full px-4 py-2.5 rounded-lg border text-sm tracking-widest font-mono focus:outline-none focus:ring-2 ${
                  errors.phoneLastFour
                    ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                    : 'border-slate-200 focus:border-primary-400 focus:ring-primary-100'
                }`}
              />
              {errors.phoneLastFour && <p className="mt-1 text-xs text-red-500">{errors.phoneLastFour}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">快递公司</label>
              <select
                value={expressCompany}
                onChange={(e) => setExpressCompany(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 bg-white"
              >
                {EXPRESS_COMPANIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">包裹大小</label>
              <select
                value={size}
                onChange={(e) => setSize(e.target.value as LockerSize)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 bg-white"
              >
                {LOCKER_SIZE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label} · {opt.volume}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-5">
            <label className="block text-sm font-medium text-slate-700 mb-2">包裹属性</label>
            <label className={`inline-flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all ${
              isFragile ? 'border-red-400 bg-red-50' : 'border-slate-200 hover:border-slate-300'
            }`}>
              <div className={`relative w-11 h-6 rounded-full transition-colors ${
                isFragile ? 'bg-red-500' : 'bg-slate-300'
              }`}>
                <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                  isFragile ? 'translate-x-5' : ''
                }`} />
                <input
                  type="checkbox"
                  checked={isFragile}
                  onChange={(e) => setIsFragile(e.target.checked)}
                  className="sr-only"
                />
              </div>
              <div className="text-xl">💎</div>
              <div>
                <p className={`text-sm font-medium ${isFragile ? 'text-red-700' : 'text-slate-700'}`}>易碎品</p>
                <p className="text-xs text-slate-500">玻璃、陶瓷等需小心轻放的物品</p>
              </div>
            </label>
          </div>

          <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => { setStep('locker'); setErrors({}) }}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50"
            >
              <ChevronRight size={15} className="rotate-180" />
              上一步
            </button>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="px-5 py-2.5 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-colors shadow-sm"
              >
                <Save size={15} />
                确认入柜
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
