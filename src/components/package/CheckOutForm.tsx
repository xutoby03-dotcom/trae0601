import { useState } from 'react'
import { LogOut, Search, Check, AlertCircle, Phone, Clock, User, Snowflake, MessageSquare, Send } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import type { Package as PackageType } from '@/types'
import { SIZE_LABEL, SIZE_BADGE_COLOR } from '@/utils/constants'
import { formatDateTime, formatDuration, validatePhoneLastFour } from '@/utils/helpers'

interface CheckOutFormProps {
  onSubmit: () => void
  onCancel: () => void
  preSelectedPackageId?: string
}

type Step = 'search' | 'confirm'

export default function CheckOutForm({ onSubmit, onCancel, preSelectedPackageId }: CheckOutFormProps) {
  const { findPackagesByPhone, getPackageById, getLocker, checkOutPackage } = useAppStore()
  const [step, setStep] = useState<Step>(preSelectedPackageId ? 'confirm' : 'search')
  const [phoneInput, setPhoneInput] = useState('')
  const [error, setError] = useState('')
  const [matches, setMatches] = useState<PackageType[]>([])
  const [selectedPkg, setSelectedPkg] = useState<PackageType | null>(
    preSelectedPackageId ? getPackageById(preSelectedPackageId) || null : null
  )
  const [successMessage, setSuccessMessage] = useState('')

  const handleSearch = () => {
    if (!validatePhoneLastFour(phoneInput)) {
      setError('请输入4位数字的手机号后四位')
      setMatches([])
      return
    }
    const found = findPackagesByPhone(phoneInput)
    if (found.length === 0) {
      setError('未找到匹配的待取包裹，请核对手机号后四位')
      setMatches([])
      return
    }
    setMatches(found)
    setSelectedPkg(found[0])
    setStep('confirm')
    setError('')
  }

  const handleConfirm = () => {
    if (!selectedPkg) return
    checkOutPackage(selectedPkg.id)
    const locker = getLocker(selectedPkg.lockerId)
    setSuccessMessage(`已为 ${selectedPkg.recipientName} 取出 ${locker?.code || ''} 柜格的包裹`)
    setTimeout(() => onSubmit(), 1500)
  }

  return (
    <div>
      {successMessage ? (
        <div className="py-12 text-center animate-fade-in">
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center mb-5 shadow-lg shadow-primary-500/30">
            <Check size={40} className="text-white" />
          </div>
          <h3 className="font-serif font-bold text-2xl text-slate-800 mb-2">取件成功！</h3>
          <p className="text-slate-500">{successMessage}</p>
        </div>
      ) : step === 'search' ? (
        <div>
          <div className="flex items-center gap-3 mb-6 p-4 rounded-xl bg-warning-50 border border-warning-100">
            <Search size={20} className="text-warning-600 shrink-0" />
            <p className="text-sm text-warning-800">请输入收件人手机号的<span className="font-bold">后四位</span>，系统将自动匹配待取包裹</p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              手机号后四位 <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-3">
              <div className={`flex-1 relative rounded-lg border transition-all ${
                error ? 'border-red-300' : 'border-slate-200 focus-within:border-primary-400 focus-within:ring-2 focus-within:ring-primary-100'
              }`}>
                <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <span className="absolute left-12 top-1/2 -translate-y-1/2 text-slate-400 font-mono">****</span>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={4}
                  value={phoneInput}
                  onChange={(e) => {
                    setPhoneInput(e.target.value.replace(/\D/g, ''))
                    setError('')
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-20 pr-4 py-3 bg-transparent text-sm font-mono tracking-[0.3em] text-xl font-bold focus:outline-none"
                  placeholder="1234"
                />
              </div>
              <button
                type="button"
                onClick={handleSearch}
                disabled={phoneInput.length !== 4}
                className={`inline-flex items-center gap-1.5 px-6 py-3 rounded-lg text-sm font-medium shadow-sm transition-all ${
                  phoneInput.length === 4
                    ? 'bg-primary-600 text-white hover:bg-primary-700'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Search size={16} />
                查询
              </button>
            </div>
            {error && (
              <div className="mt-3 flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-100">
                <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <p className="text-xs text-slate-500 mb-2">💡 使用提示</p>
            <ul className="space-y-1 text-xs text-slate-500">
              <li>• 取件时请务必核对手机号后四位，确保包裹交给正确的收件人</li>
              <li>• 如手机号后四位有多个匹配包裹，可在下一步选择对应包裹</li>
              <li>• 超过48小时未取的包裹会标记为催取状态，请优先处理</li>
            </ul>
          </div>

          <div className="flex items-center justify-end mt-6 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50"
            >
              取消
            </button>
          </div>
        </div>
      ) : (
        <div>
          {matches.length > 1 && (
            <div className="mb-5 p-3 rounded-xl bg-blue-50 border border-blue-100">
              <p className="text-sm text-blue-800 mb-2">找到 <span className="font-bold">{matches.length}</span> 个匹配包裹，请选择要取件的包裹：</p>
              <div className="flex flex-wrap gap-2">
                {matches.map((pkg) => {
                  const locker = getLocker(pkg.lockerId)
                  return (
                    <button
                      key={pkg.id}
                      type="button"
                      onClick={() => setSelectedPkg(pkg)}
                      className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                        selectedPkg?.id === pkg.id
                          ? 'bg-primary-600 text-white shadow-sm'
                          : 'bg-white border border-slate-200 text-slate-600 hover:border-primary-300'
                      }`}
                    >
                      {pkg.recipientName} · {locker?.code} · {pkg.expressCompany}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {selectedPkg && (() => {
            const locker = getLocker(selectedPkg.lockerId)
            const hours = Math.floor((Date.now() - new Date(selectedPkg.inTime).getTime()) / 3600000)
            return (
              <div className="rounded-2xl border-2 border-slate-200 overflow-hidden">
                <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-5 py-4 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                        <LogOut size={22} />
                      </div>
                      <div>
                        <p className="text-xs text-white/70">取件确认</p>
                        <p className="font-serif font-bold text-lg">请核对以下信息</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-white/70">柜格编号</p>
                      <p className="font-serif font-bold text-2xl">{locker?.code || '-'}</p>
                    </div>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-xl bg-slate-50">
                      <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                        <User size={12} /> 收件人
                      </div>
                      <p className="font-bold text-slate-800 text-lg">{selectedPkg.recipientName}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50">
                      <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                        <Phone size={12} /> 手机号后四位
                      </div>
                      <p className="font-mono font-bold text-slate-800 text-lg tracking-wider">****{selectedPkg.phoneLastFour}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-xl bg-slate-50">
                      <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">快递公司</div>
                      <p className="font-bold text-slate-800">{selectedPkg.expressCompany}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50">
                      <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">包裹属性</div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${SIZE_BADGE_COLOR[selectedPkg.size]}`}>
                          {SIZE_LABEL[selectedPkg.size]}
                        </span>
                        {locker?.isRefrigerated && (
                          <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700 inline-flex items-center gap-1">
                            <Snowflake size={12} /> 冷藏
                          </span>
                        )}
                        {selectedPkg.isFragile && (
                          <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">易碎</span>
                        )}
                        {selectedPkg.isUrgent && (
                          <span className="px-2 py-0.5 rounded text-xs font-medium bg-warning-100 text-warning-700">催取</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className={`p-4 rounded-xl border-2 ${
                    hours >= 48
                      ? 'bg-warning-50 border-warning-300'
                      : hours >= 12 && locker?.isRefrigerated
                        ? 'bg-blue-50 border-blue-300'
                        : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                          <Clock size={12} /> 入柜时间
                        </div>
                        <p className="font-medium text-slate-700">{formatDateTime(selectedPkg.inTime)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-500 mb-1">已存放</p>
                        <p className={`font-bold ${
                          hours >= 48
                            ? 'text-warning-600 text-xl'
                            : hours >= 12 && locker?.isRefrigerated
                              ? 'text-blue-600 text-xl'
                              : 'text-slate-700 text-lg'
                        }`}>
                          {formatDuration(selectedPkg.inTime)}
                        </p>
                      </div>
                    </div>
                    {hours >= 48 && (
                      <p className="mt-2 text-xs text-warning-700 bg-warning-100 rounded-lg px-3 py-1.5">
                        ⚠️ 该包裹已超过48小时未取，请确认已通知收件人
                      </p>
                    )}
                    {hours < 48 && locker?.isRefrigerated && hours >= 12 && (
                      <p className="mt-2 text-xs text-blue-700 bg-blue-100 rounded-lg px-3 py-1.5">
                        ❄️ 冷藏包裹建议尽快领取，以免影响包裹品质
                      </p>
                    )}
                  </div>

                  {selectedPkg.urgentReminders && selectedPkg.urgentReminders.length > 0 && (() => {
                    const sorted = [...selectedPkg.urgentReminders].sort(
                      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                    )
                    return (
                      <div className="mt-4 p-4 rounded-xl border-2 border-warning-200 bg-gradient-to-br from-warning-50 to-orange-50">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-bold text-warning-800 flex items-center gap-1.5">
                            <Send size={15} />
                            催取记录（共 {sorted.length} 次）
                          </p>
                          <span className="text-xs text-warning-600 inline-flex items-center gap-1">
                            最近催取：{formatDuration(sorted[0].createdAt)}前
                          </span>
                        </div>
                        <div className="space-y-2 max-h-40 overflow-y-auto scrollbar-thin pr-1">
                          {sorted.map((r) => (
                            <div key={r.id} className="p-2.5 rounded-lg bg-white/90 border border-warning-100">
                              <div className="flex items-center justify-between mb-1">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-white border border-warning-200 text-warning-700">
                                  {r.channel === 'phone' ? <Phone size={11} /> : <MessageSquare size={11} />}
                                  {r.channel === 'phone' ? '电话催取' : '企业微信'}
                                </span>
                                <span className="text-[11px] text-slate-400">{formatDateTime(r.createdAt)}</span>
                              </div>
                              <p className="text-sm text-slate-700">「{r.note}」</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })()}
                </div>
              </div>
            )
          })()}

          <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setStep('search')
                setMatches([])
                setSelectedPkg(null)
                setPhoneInput('')
              }}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50"
            >
              ← 重新查询
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
                onClick={handleConfirm}
                className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-lg bg-gradient-to-r from-primary-500 to-primary-700 text-white text-sm font-bold hover:from-primary-600 hover:to-primary-800 transition-all shadow-lg shadow-primary-500/30"
              >
                <Check size={16} />
                确认取件
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
