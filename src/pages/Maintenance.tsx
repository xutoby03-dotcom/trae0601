import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { Sparkles, CircleDot, Wrench, FileText, Plus, Trash2, Calendar } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { MAINTENANCE_TYPE_LABELS, SIDE_LABELS } from '@/types'
import type { MaintenanceRecord } from '@/types'

const TYPE_CONFIG: Record<MaintenanceRecord['type'], { icon: typeof Sparkles; color: string; dot: string }> = {
  clean_filter: { icon: Sparkles, color: 'text-green-500', dot: 'bg-green-500' },
  replace_ear_tip: { icon: CircleDot, color: 'text-blue-500', dot: 'bg-blue-500' },
  repair: { icon: Wrench, color: 'text-red-500', dot: 'bg-red-500' },
  other: { icon: FileText, color: 'text-gray-500', dot: 'bg-gray-400' },
}

export default function Maintenance() {
  const { hearingAids, maintenanceRecords, addMaintenanceRecord, deleteMaintenanceRecord } = useStore()
  const [aidId, setAidId] = useState(hearingAids[0]?.id ?? '')
  const [type, setType] = useState<MaintenanceRecord['type']>('clean_filter')
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [notes, setNotes] = useState('')

  const sorted = [...maintenanceRecords].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  const handleSubmit = () => {
    if (!aidId) return
    addMaintenanceRecord({ id: crypto.randomUUID(), aidId, date, type, notes })
    setNotes('')
  }

  const getAidLabel = (id: string) => {
    const aid = hearingAids.find((a) => a.id === id)
    return aid ? `${SIDE_LABELS[aid.side]} ${aid.model}` : '未知设备'
  }

  return (
    <div className="min-h-screen bg-[#FDF8F3] px-4 py-6 max-w-lg mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-[#2D3A4A]">维护记录</h1>
        <p className="text-sm text-[#2D3A4A]/60 mt-1">记录清洁、更换和维修</p>
      </header>

      <div className="bg-white rounded-2xl shadow-sm p-5 mb-8">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#2D3A4A] mb-1">助听器</label>
            <select
              value={aidId}
              onChange={(e) => setAidId(e.target.value)}
              className="w-full rounded-xl border border-[#E8913A]/30 bg-[#FDF8F3] px-3 py-2.5 text-sm text-[#2D3A4A] focus:outline-none focus:ring-2 focus:ring-[#E8913A]/40"
            >
              {hearingAids.map((a) => (
                <option key={a.id} value={a.id}>
                  {SIDE_LABELS[a.side]} {a.model}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2D3A4A] mb-1">维护类型</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as MaintenanceRecord['type'])}
              className="w-full rounded-xl border border-[#E8913A]/30 bg-[#FDF8F3] px-3 py-2.5 text-sm text-[#2D3A4A] focus:outline-none focus:ring-2 focus:ring-[#E8913A]/40"
            >
              {(Object.entries(MAINTENANCE_TYPE_LABELS) as [MaintenanceRecord['type'], string][]).map(
                ([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                )
              )}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2D3A4A] mb-1">日期</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#E8913A]" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-[#E8913A]/30 bg-[#FDF8F3] pl-9 pr-3 py-2.5 text-sm text-[#2D3A4A] focus:outline-none focus:ring-2 focus:ring-[#E8913A]/40"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2D3A4A] mb-1">备注</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-[#E8913A]/30 bg-[#FDF8F3] px-3 py-2.5 text-sm text-[#2D3A4A] resize-none focus:outline-none focus:ring-2 focus:ring-[#E8913A]/40"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={!aidId}
            className="w-full flex items-center justify-center gap-2 bg-[#E8913A] text-white rounded-xl py-2.5 text-sm font-medium hover:bg-[#d07e2e] transition-colors disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            添加记录
          </button>
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-[#2D3A4A]/40">
          <Wrench className="w-12 h-12 mb-3" />
          <p className="text-sm">暂无维护记录</p>
          <p className="text-xs mt-1">添加第一条维护记录开始追踪</p>
        </div>
      ) : (
        <div className="relative pl-6 border-l-2 border-[#E8913A]/20 space-y-6">
          {sorted.map((record) => {
            const cfg = TYPE_CONFIG[record.type]
            const Icon = cfg.icon
            return (
              <div key={record.id} className="relative">
                <div className={`absolute -left-[29px] top-1 w-4 h-4 rounded-full ${cfg.dot} ring-4 ring-[#FDF8F3]`} />
                <div className="bg-white rounded-xl shadow-sm p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${cfg.color}`} />
                      <span className="text-sm font-medium text-[#2D3A4A]">
                        {MAINTENANCE_TYPE_LABELS[record.type]}
                      </span>
                    </div>
                    <button
                      onClick={() => deleteMaintenanceRecord(record.id)}
                      className="p-1 text-[#2D3A4A]/30 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-[#2D3A4A]/50 mt-1.5">
                    {format(parseISO(record.date), 'yyyy年M月d日')} · {getAidLabel(record.aidId)}
                  </p>
                  {record.notes && (
                    <p className="text-xs text-[#2D3A4A]/70 mt-2 leading-relaxed">{record.notes}</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
