import { useState } from 'react'
import { useFridgeStore } from '@/store/fridgeStore'
import { formatDateTime } from '@/utils/fridge'
import { SprayCan, Thermometer, Wind, CheckCircle2, Clock } from 'lucide-react'

export default function Cleaning() {
  const { cleaningRecords, addCleaningRecord } = useFridgeStore()
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState({
    temperature: 4,
    disinfectionTime: '',
    abnormalOdor: '',
    notes: '',
    recorderName: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.recorderName) return

    addCleaningRecord({
      temperature: form.temperature,
      disinfectionTime: form.disinfectionTime || new Date().toISOString(),
      abnormalOdor: form.abnormalOdor,
      notes: form.notes,
      recorderName: form.recorderName,
    })

    setSuccess(true)
    setForm({
      temperature: 4,
      disinfectionTime: '',
      abnormalOdor: '',
      notes: '',
      recorderName: '',
    })
    setTimeout(() => setSuccess(false), 3000)
  }

  const sortedRecords = [...cleaningRecords].sort(
    (a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()
  )

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-stone-800 mb-1">🧹 清洁记录</h2>
        <p className="text-sm text-stone-400">记录冰箱温度、消毒和异常情况</p>
      </div>

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl p-4 text-sm font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          记录成功！
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-stone-200 p-6 space-y-5 shadow-sm">
            <h3 className="text-sm font-bold text-stone-700 flex items-center gap-2">
              <SprayCan className="w-4 h-4 text-emerald-600" />
              新增记录
            </h3>

            <div>
              <label className="block text-xs font-medium text-stone-500 mb-1.5">
                <Thermometer className="w-3 h-3 inline mr-1" />
                冰箱温度（℃）
              </label>
              <input
                type="number"
                step={0.1}
                value={form.temperature}
                onChange={(e) => setForm((f) => ({ ...f, temperature: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition"
              />
              <p className="text-[10px] text-stone-400 mt-1">正常范围：0~8℃</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-500 mb-1.5">
                <SprayCan className="w-3 h-3 inline mr-1" />
                消毒时间
              </label>
              <input
                type="datetime-local"
                value={form.disinfectionTime}
                onChange={(e) => setForm((f) => ({ ...f, disinfectionTime: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-500 mb-1.5">
                <Wind className="w-3 h-3 inline mr-1" />
                异常异味
              </label>
              <textarea
                value={form.abnormalOdor}
                onChange={(e) => setForm((f) => ({ ...f, abnormalOdor: e.target.value }))}
                placeholder="如无异常留空，有异味请描述"
                rows={2}
                className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-500 mb-1.5">备注</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                placeholder="其他需要记录的信息"
                rows={2}
                className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-500 mb-1.5">记录人姓名 *</label>
              <input
                type="text"
                required
                value={form.recorderName}
                onChange={(e) => setForm((f) => ({ ...f, recorderName: e.target.value }))}
                placeholder="请输入姓名"
                className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition shadow-lg shadow-emerald-600/20 active:scale-[0.98]"
            >
              提交记录
            </button>
          </form>
        </div>

        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-stone-700 flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-stone-400" />
              历史记录
            </h3>

            {sortedRecords.length === 0 ? (
              <div className="text-center py-8 text-stone-400 text-sm">
                暂无清洁记录
              </div>
            ) : (
              <div className="space-y-0">
                {sortedRecords.map((record, idx) => (
                  <div key={record.id} className="relative pl-6 pb-6 last:pb-0">
                    {idx < sortedRecords.length - 1 && (
                      <div className="absolute left-[7px] top-4 bottom-0 w-px bg-stone-200" />
                    )}
                    <div className="absolute left-0 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-emerald-400 bg-white" />
                    <div className="bg-stone-50 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-stone-500">
                          {formatDateTime(record.recordedAt)}
                        </span>
                        <span className="text-xs text-stone-400">记录人：{record.recorderName}</span>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${
                          record.temperature >= 0 && record.temperature <= 8
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          <Thermometer className="w-3 h-3" />
                          {record.temperature}℃
                        </span>
                        {record.disinfectionTime && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-blue-100 text-blue-700">
                            <SprayCan className="w-3 h-3" />
                            已消毒
                          </span>
                        )}
                        {record.abnormalOdor && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-amber-100 text-amber-700">
                            <Wind className="w-3 h-3" />
                            {record.abnormalOdor}
                          </span>
                        )}
                      </div>
                      {record.notes && (
                        <p className="text-xs text-stone-500 mt-2">{record.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
