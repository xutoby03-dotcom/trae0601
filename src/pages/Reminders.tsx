import { useState } from 'react'
import { Bell, Moon, DoorOpen, Wrench, Plus, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'
import { useStore } from '@/store/useStore'
import type { Reminder } from '@/types'
import { REMINDER_TYPE_LABELS, SIDE_LABELS } from '@/types'

const TYPE_ICONS: Record<Reminder['type'], typeof Moon> = {
  before_sleep_charge: Moon,
  before_out_check: DoorOpen,
  regular_maintenance: Wrench,
  custom: Bell,
}

export default function Reminders() {
  const { hearingAids, reminders, addReminder, deleteReminder, toggleReminder } = useStore()
  const [type, setType] = useState<Reminder['type']>('before_sleep_charge')
  const [time, setTime] = useState('21:00')
  const [description, setDescription] = useState('')
  const [selectedAidIds, setSelectedAidIds] = useState<string[]>([])
  const [formOpen, setFormOpen] = useState(false)

  const handleAdd = () => {
    if (!time || !description.trim()) return
    addReminder({
      id: crypto.randomUUID(),
      type,
      time,
      description: description.trim(),
      aidIds: selectedAidIds,
      enabled: true,
    })
    setType('before_sleep_charge')
    setTime('21:00')
    setDescription('')
    setSelectedAidIds([])
  }

  const toggleAid = (aidId: string) => {
    setSelectedAidIds((prev) =>
      prev.includes(aidId) ? prev.filter((id) => id !== aidId) : [...prev, aidId]
    )
  }

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这条提醒吗？')) deleteReminder(id)
  }

  return (
    <div className="min-h-screen bg-[#FDF8F3] px-4 py-6 pb-24">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-[#2D3A4A]">提醒设置</h1>
        <p className="mt-1 text-sm text-[#2D3A4A]/60">家人可以为老人设置日常提醒</p>
      </header>

      <div className="mb-6 rounded-2xl bg-white shadow-sm border border-[#E8913A]/10 overflow-hidden">
        <button
          onClick={() => setFormOpen(!formOpen)}
          className="w-full flex items-center justify-between px-5 py-4 text-[#2D3A4A] font-semibold"
        >
          <span className="flex items-center gap-2">
            <Plus size={18} className="text-[#E8913A]" />
            添加提醒
          </span>
          <span className={`transition-transform ${formOpen ? 'rotate-45' : ''}`}>+</span>
        </button>

        {formOpen && (
          <div className="px-5 pb-5 space-y-4 border-t border-[#E8913A]/10 pt-4">
            <div>
              <label className="block text-xs font-medium text-[#2D3A4A]/70 mb-1">提醒类型</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as Reminder['type'])}
                className="w-full rounded-xl border border-[#2D3A4A]/15 bg-[#FDF8F3] px-3 py-2.5 text-sm text-[#2D3A4A] focus:outline-none focus:ring-2 focus:ring-[#E8913A]/40"
              >
                {(Object.entries(REMINDER_TYPE_LABELS) as [Reminder['type'], string][]).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#2D3A4A]/70 mb-1">提醒时间</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full rounded-xl border border-[#2D3A4A]/15 bg-[#FDF8F3] px-3 py-2.5 text-sm text-[#2D3A4A] focus:outline-none focus:ring-2 focus:ring-[#E8913A]/40"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#2D3A4A]/70 mb-1">描述</label>
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="输入提醒描述"
                className="w-full rounded-xl border border-[#2D3A4A]/15 bg-[#FDF8F3] px-3 py-2.5 text-sm text-[#2D3A4A] placeholder-[#2D3A4A]/30 focus:outline-none focus:ring-2 focus:ring-[#E8913A]/40"
              />
            </div>

            {hearingAids.length > 0 && (
              <div>
                <label className="block text-xs font-medium text-[#2D3A4A]/70 mb-1.5">关联助听器</label>
                <div className="flex flex-wrap gap-2">
                  {hearingAids.map((aid) => (
                    <label
                      key={aid.id}
                      className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs cursor-pointer transition-colors ${
                        selectedAidIds.includes(aid.id)
                          ? 'border-[#E8913A] bg-[#E8913A]/10 text-[#E8913A]'
                          : 'border-[#2D3A4A]/15 text-[#2D3A4A]/60'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedAidIds.includes(aid.id)}
                        onChange={() => toggleAid(aid.id)}
                        className="sr-only"
                      />
                      {SIDE_LABELS[aid.side]} {aid.model}
                    </label>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={handleAdd}
              disabled={!time || !description.trim()}
              className="w-full rounded-xl bg-[#E8913A] py-2.5 text-sm font-semibold text-white disabled:opacity-40 active:scale-[0.98] transition-transform"
            >
              添加提醒
            </button>
          </div>
        )}
      </div>

      {reminders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-[#2D3A4A]/30">
          <Bell size={48} strokeWidth={1.5} />
          <p className="mt-3 text-sm">暂无提醒，点击上方添加</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reminders.map((reminder) => {
            const Icon = TYPE_ICONS[reminder.type]
            return (
              <div
                key={reminder.id}
                className={`rounded-2xl bg-white shadow-sm border border-[#E8913A]/10 p-4 transition-opacity ${
                  !reminder.enabled ? 'opacity-50' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-xl bg-[#E8913A]/10 p-2">
                      <Icon size={18} className="text-[#E8913A]" />
                    </div>
                    <div>
                      <p className="font-semibold text-[#2D3A4A] text-sm">
                        {REMINDER_TYPE_LABELS[reminder.type]}
                      </p>
                      <p className="text-[#E8913A] text-xs font-medium mt-0.5">{reminder.time}</p>
                      {reminder.description && (
                        <p className="text-[#2D3A4A]/60 text-xs mt-1">{reminder.description}</p>
                      )}
                      {reminder.aidIds.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {reminder.aidIds.map((aidId) => {
                            const aid = hearingAids.find((a) => a.id === aidId)
                            if (!aid) return null
                            return (
                              <span
                                key={aidId}
                                className="rounded-md bg-[#2D3A4A]/8 px-2 py-0.5 text-[10px] text-[#2D3A4A]/70"
                              >
                                {SIDE_LABELS[aid.side]} {aid.model}
                              </span>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => toggleReminder(reminder.id)} className="shrink-0">
                      {reminder.enabled ? (
                        <ToggleRight size={28} className="text-[#E8913A]" />
                      ) : (
                        <ToggleLeft size={28} className="text-[#2D3A4A]/30" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(reminder.id)}
                      className="shrink-0 rounded-lg p-1.5 text-[#2D3A4A]/30 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
