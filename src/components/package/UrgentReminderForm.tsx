import { useState } from 'react'
import { Phone, MessageSquare, Send, Clock, ChevronRight, CheckCircle } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import type { ReminderChannel, Package as PackageType, UrgentReminder } from '@/types'
import { formatDateTime } from '@/utils/helpers'

interface UrgentReminderFormProps {
  packageId: string
  onClose: () => void
  onDone?: () => void
}

const CHANNEL_OPTIONS: { value: ReminderChannel; label: string; icon: typeof Phone; color: string }[] = [
  { value: 'phone', label: '电话催取', icon: Phone, color: 'from-blue-400 to-blue-600' },
  { value: 'wecom', label: '企业微信', icon: MessageSquare, color: 'from-emerald-400 to-emerald-600' },
]

export default function UrgentReminderForm({ packageId, onClose, onDone }: UrgentReminderFormProps) {
  const { getPackageById, getLocker, addUrgentReminder } = useAppStore()
  const [channel, setChannel] = useState<ReminderChannel>('phone')
  const [note, setNote] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saved, setSaved] = useState(false)

  const pkg = getPackageById(packageId)
  if (!pkg) {
    return (
      <div className="py-8 text-center text-slate-500">
        <p>未找到对应的包裹记录</p>
        <button
          type="button"
          onClick={onClose}
          className="mt-4 px-4 py-2 rounded-lg bg-slate-100 text-slate-600 text-sm hover:bg-slate-200"
        >
          关闭
        </button>
      </div>
    )
  }

  const locker = getLocker(pkg.lockerId)
  const reminders: UrgentReminder[] = [...(pkg.urgentReminders || [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
  const lastReminder = reminders[0]

  const handleSave = () => {
    if (!note.trim()) {
      setErrors({ note: '请填写催取备注' })
      return
    }
    const result = addUrgentReminder(packageId, { channel, note })
    if (result) {
      setSaved(true)
      setTimeout(() => {
        onDone?.()
        onClose()
      }, 900)
    }
  }

  if (saved) {
    return (
      <div className="py-10 text-center animate-fade-in">
        <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center mb-4 shadow-lg shadow-primary-500/30">
          <CheckCircle size={32} className="text-white" />
        </div>
        <h4 className="font-serif font-bold text-xl text-slate-800 mb-1">催取记录已保存</h4>
        <p className="text-sm text-slate-500">已登记{channel === 'phone' ? '电话' : '企业微信'}催取记录</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-5 p-4 rounded-xl bg-gradient-to-r from-warning-50 to-orange-50 border border-warning-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-warning-600 mb-0.5">滞留包裹</p>
          <p className="font-bold text-slate-800">
            {pkg.recipientName} <span className="font-normal text-sm text-slate-500">· {pkg.expressCompany}</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500">柜格</p>
          <p className="font-serif font-bold text-slate-700">{locker?.code || '-'}</p>
        </div>
      </div>
      {lastReminder && (
        <div className="mt-3 pt-3 border-t border-warning-200/60">
          <div className="flex items-start gap-2 text-xs">
            <Clock size={13} className="text-warning-500 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-slate-500">
                上次催取：<span className="font-medium text-slate-700">{formatDateTime(lastReminder.createdAt)}</span>
                <span className="ml-2 inline-block px-1.5 py-0.5 rounded bg-white/70 text-[10px] text-slate-600">
                  {lastReminder.channel === 'phone' ? '电话' : '企业微信'}
                </span>
              </p>
              {lastReminder.note && (
                <p className="text-slate-600 mt-0.5 truncate">「{lastReminder.note}」</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>

      <p className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-1.5">
        <ChevronRight size={15} className="text-primary-500" />
        选择催取方式
      </p>
      <div className="grid grid-cols-2 gap-3 mb-5">
        {CHANNEL_OPTIONS.map((opt) => {
          const Icon = opt.icon
          const active = channel === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setChannel(opt.value)}
              className={`relative p-4 rounded-xl border-2 transition-all ${
                active
                  ? 'border-primary-400 bg-primary-50/60'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className={`w-10 h-10 mx-auto rounded-xl bg-gradient-to-br ${opt.color} flex items-center justify-center mb-2 shadow-md ${active ? 'shadow-lg' : ''}`}>
                <Icon size={18} className="text-white" />
              </div>
              <p className={`text-sm font-bold ${active ? 'text-primary-700' : 'text-slate-700'}`}>
                {opt.label}
              </p>
              {active && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
              )}
            </button>
          )
        })}
      </div>

      <p className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-1.5">
        <ChevronRight size={15} className="text-primary-500" />
        催取备注
      </p>
      <div className="mb-5">
        <textarea
          value={note}
          onChange={(e) => {
            setNote(e.target.value)
            if (errors.note) setErrors({})
          }}
          rows={4}
          placeholder="简单记录沟通情况，例如：已通知本人明天上午来取 / 说已让同事代取 等"
          className={`w-full px-4 py-3 rounded-xl border text-sm resize-none focus:outline-none focus:ring-2 ${
            errors.note
              ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
              : 'border-slate-200 focus:border-primary-400 focus:ring-primary-100'
          }`}
        />
        {errors.note && <p className="mt-1 text-xs text-red-500">{errors.note}</p>}
      </div>

      {reminders.length > 0 && (
        <div className="mb-5">
          <p className="text-sm font-medium text-slate-500 mb-2">历史催取记录（共 {reminders.length} 次）</p>
          <div className="space-y-2 max-h-40 overflow-y-auto scrollbar-thin pr-1">
            {reminders.map((r) => (
              <div key={r.id} className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <div className="flex items-center justify-between mb-1">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-white border border-slate-200 text-slate-600">
                    {r.channel === 'phone' ? <Phone size={11} /> : <MessageSquare size={11} />}
                    {r.channel === 'phone' ? '电话' : '企业微信'}
                  </span>
                  <span className="text-[11px] text-slate-400">{formatDateTime(r.createdAt)}</span>
                </div>
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{r.note}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={onClose}
          className="px-5 py-2.5 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50"
        >
          取消
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-gradient-to-r from-warning-500 to-orange-600 text-white text-sm font-medium hover:from-warning-600 hover:to-orange-700 shadow-md shadow-warning-500/20"
        >
          <Send size={14} />
          保存催取记录
        </button>
      </div>
    </div>
  )
}
