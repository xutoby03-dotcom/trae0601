import { useState, useMemo } from 'react'
import { useLabStore } from '@/store'
import { Wrench, CheckCircle2, Clock, ImageOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, differenceInDays } from 'date-fns'

export default function RepairPage() {
  const { coats, repairRecords, repairComplete } = useLabStore()
  const [activeId, setActiveId] = useState<string | null>(null)
  const [note, setNote] = useState('')

  const pending = useMemo(() => repairRecords.filter(r => r.status === 'pending'), [repairRecords])
  const repaired = useMemo(() => repairRecords.filter(r => r.status === 'repaired'), [repairRecords])

  const getCoat = (coatId: string) => coats.find(c => c.id === coatId)

  const daysWaiting = (createdAt: string) => differenceInDays(new Date(), new Date(createdAt))

  const daysBadgeCls = (d: number) =>
    d >= 7
      ? 'bg-red-500 text-white animate-pulse'
      : d >= 3
        ? 'bg-orange-500 text-white'
        : 'bg-gray-200 text-gray-600'

  const handleSubmit = () => {
    if (!activeId || !note.trim()) return
    repairComplete(activeId, note.trim())
    setActiveId(null)
    setNote('')
  }

  return (
    <div className="min-h-screen bg-[#F7F8FA] p-6">
      <div className="mb-6 flex items-center gap-3">
        <h1 className="text-2xl font-bold text-gray-900">待维修区</h1>
        <span className="rounded-full bg-[#0D7377] px-3 py-0.5 text-sm font-semibold text-white">
          {pending.length}
        </span>
      </div>

      {pending.length === 0 && (
        <p className="text-gray-400">暂无待维修记录</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pending.map(r => {
          const coat = getCoat(r.coatId)
          const days = daysWaiting(r.createdAt)
          return (
            <div key={r.id} className="rounded-xl bg-white p-5 shadow-sm border border-gray-100 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-base font-bold text-gray-900">{coat?.code ?? '—'}</span>
                <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', daysBadgeCls(days))}>
                  <Clock className="mr-1 inline h-3 w-3" />
                  {days}天
                </span>
              </div>
              <span className="text-sm text-[#6B7280]">{coat?.studentName ?? '—'}</span>
              <span className="inline-block w-fit rounded-full bg-orange-100 px-3 py-0.5 text-xs font-semibold text-[#E8590C]">
                {r.damageLocation}
              </span>
              <p className="text-sm text-gray-600">{r.damageNote}</p>
              <div className="flex h-28 items-center justify-center rounded-lg bg-gray-100 text-gray-300">
                <ImageOff className="h-8 w-8" />
              </div>
              <button
                onClick={() => { setActiveId(r.id); setNote('') }}
                className="mt-auto w-full rounded-lg bg-[#0D7377] py-2 text-sm font-semibold text-white hover:bg-[#0a5c5f] transition-colors"
              >
                维修完成
              </button>
            </div>
          )
        })}
      </div>

      {repaired.length > 0 && (
        <div className="mt-10">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-800">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            已完成维修
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {repaired.map(r => {
              const coat = getCoat(r.coatId)
              return (
                <div key={r.id} className="rounded-xl bg-white p-5 shadow-sm border border-gray-100 flex flex-col gap-2 opacity-70">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-base font-bold text-gray-900">{coat?.code ?? '—'}</span>
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  </div>
                  <span className="text-sm text-[#6B7280]">{coat?.studentName ?? '—'}</span>
                  <span className="inline-block w-fit rounded-full bg-orange-100 px-3 py-0.5 text-xs font-semibold text-[#E8590C]">
                    {r.damageLocation}
                  </span>
                  <p className="text-sm text-gray-500">{r.damageNote}</p>
                  {r.repairNote && (
                    <p className="text-sm text-green-700">维修备注：{r.repairNote}</p>
                  )}
                  {r.repairedAt && (
                    <span className="text-xs text-gray-400">
                      完成于 {format(new Date(r.repairedAt), 'yyyy-MM-dd HH:mm')}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {activeId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setActiveId(null)}>
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="mb-4 text-lg font-bold text-gray-900">维修完成备注</h3>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="请输入维修备注..."
              className="w-full rounded-lg border border-gray-200 p-3 text-sm text-gray-700 focus:border-[#0D7377] focus:outline-none focus:ring-1 focus:ring-[#0D7377] resize-none h-28"
            />
            <div className="mt-4 flex justify-end gap-3">
              <button onClick={() => setActiveId(null)} className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
                取消
              </button>
              <button
                onClick={handleSubmit}
                disabled={!note.trim()}
                className="rounded-lg bg-[#0D7377] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0a5c5f] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                确认完成
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
