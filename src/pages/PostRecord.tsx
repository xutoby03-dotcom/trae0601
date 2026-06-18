import { useStore } from '@/store/useStore'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Armchair, Check, AlertTriangle } from 'lucide-react'
import StatusBadge from '@/components/StatusBadge'
import type { DisinfectMethod, DryingLocation } from '@/types'

const DISINFECT_OPTIONS: { value: DisinfectMethod; label: string }[] = [
  { value: 'alcohol', label: '酒精擦拭' },
  { value: 'chlorine', label: '含氯消毒' },
  { value: 'uv', label: '紫外线消毒' },
  { value: 'other', label: '其他' },
]

const DRYING_OPTIONS: { value: DryingLocation; label: string }[] = [
  { value: 'bathroom', label: '卫生间' },
  { value: 'balcony', label: '阳台' },
  { value: 'other', label: '其他' },
]

export default function PostRecord() {
  const navigate = useNavigate()
  const { devices, usageRecords, addCleanRecord, completeUsage, addMaintenanceAlert, updateDevice } = useStore()

  const cleanableDevices = devices.filter((d) => d.status === 'in_use' || d.status === 'pending_clean')
  const [selectedDevice, setSelectedDevice] = useState('')
  const [cleaner, setCleaner] = useState('')
  const [disinfectMethod, setDisinfectMethod] = useState<DisinfectMethod>('alcohol')
  const [dryingLocation, setDryingLocation] = useState<DryingLocation>('bathroom')
  const [foundLoose, setFoundLoose] = useState(false)
  const [notes, setNotes] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const activeUsage = usageRecords.find(
    (u) => u.deviceId === selectedDevice && u.status === 'in_progress'
  )

  const handleSubmit = () => {
    if (!selectedDevice || !cleaner.trim()) return

    const cleanRecordId = addCleanRecord({
      deviceId: selectedDevice,
      cleaner: cleaner.trim(),
      disinfectMethod,
      dryingLocation,
      foundLoose,
      notes,
      cleanedAt: new Date().toISOString(),
    })

    if (activeUsage) {
      completeUsage(activeUsage.id, cleanRecordId)
    }

    if (foundLoose) {
      updateDevice(selectedDevice, { status: 'disabled' })
      addMaintenanceAlert({
        deviceId: selectedDevice,
        reason: '使用后发现设备松动',
        triggerSource: 'post_check',
        status: 'pending',
        createdAt: new Date().toISOString(),
        resolvedAt: null,
        resolvedBy: null,
      })
    } else {
      updateDevice(selectedDevice, { status: 'available' })
    }

    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto text-center py-16 animate-fadeIn">
        {foundLoose ? (
          <>
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-red-700 font-display">设备已停用</h2>
            <p className="text-sm text-zinc-500 mt-2">发现松动，已生成维修提醒</p>
            <div className="mt-6 flex gap-3 justify-center">
              <button
                onClick={() => navigate('/maintenance')}
                className="px-5 py-2.5 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
              >
                查看维修提醒
              </button>
              <button
                onClick={() => navigate('/')}
                className="px-5 py-2.5 rounded-lg border border-zinc-200 text-sm font-medium text-zinc-600 hover:bg-zinc-50 transition-colors"
              >
                返回首页
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-teal-600" />
            </div>
            <h2 className="text-xl font-bold text-zinc-800 font-display">记录完成</h2>
            <p className="text-sm text-zinc-500 mt-2">清洁记录已保存，设备已恢复可用</p>
            <div className="mt-6 flex gap-3 justify-center">
              <button
                onClick={() => navigate('/')}
                className="px-5 py-2.5 rounded-lg bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 transition-colors"
              >
                返回首页
              </button>
            </div>
          </>
        )}
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn">
      <div>
        <h2 className="text-2xl font-bold text-zinc-800 font-display">清洁记录</h2>
        <p className="text-sm text-zinc-400 mt-1">记录清洁消毒信息，完成后设备恢复可用</p>
      </div>

      <div className="bg-white rounded-xl border border-zinc-100 shadow-sm p-5 space-y-5">
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1.5">选择设备</label>
          {cleanableDevices.length === 0 ? (
            <div className="px-4 py-3 rounded-lg bg-zinc-50 text-sm text-zinc-400">
              暂无待清洁或使用中的设备
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {cleanableDevices.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setSelectedDevice(d.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg border text-left transition-all ${
                    selectedDevice === d.id
                      ? 'bg-teal-50 border-teal-400 shadow-sm'
                      : 'bg-white border-zinc-200 hover:bg-zinc-50'
                  }`}
                >
                  <Armchair className={`w-5 h-5 shrink-0 ${selectedDevice === d.id ? 'text-teal-600' : 'text-zinc-400'}`} />
                  <div>
                    <p className="text-sm font-semibold text-zinc-800">{d.code}</p>
                    <p className="text-[11px] text-zinc-400">承重 {d.weightCapacity}kg</p>
                  </div>
                  <div className="ml-auto">
                    <StatusBadge status={d.status} />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1.5">清洁人 *</label>
          <input
            type="text"
            value={cleaner}
            onChange={(e) => setCleaner(e.target.value)}
            placeholder="请输入清洁人姓名"
            className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1.5">消毒方式</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {DISINFECT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setDisinfectMethod(opt.value)}
                className={`py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                  disinfectMethod === opt.value
                    ? 'bg-teal-50 border-teal-400 text-teal-700'
                    : 'bg-white border-zinc-200 text-zinc-500 hover:bg-zinc-50'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1.5">晾干位置</label>
          <div className="grid grid-cols-3 gap-2">
            {DRYING_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setDryingLocation(opt.value)}
                className={`py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                  dryingLocation === opt.value
                    ? 'bg-teal-50 border-teal-400 text-teal-700'
                    : 'bg-white border-zinc-200 text-zinc-500 hover:bg-zinc-50'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1.5">是否发现松动</label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setFoundLoose(true)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                foundLoose
                  ? 'bg-red-50 border-red-400 text-red-700'
                  : 'bg-white border-zinc-200 text-zinc-500 hover:bg-zinc-50'
              }`}
            >
              是，发现松动
            </button>
            <button
              type="button"
              onClick={() => setFoundLoose(false)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                foundLoose === false
                  ? 'bg-teal-50 border-teal-400 text-teal-700'
                  : 'bg-white border-zinc-200 text-zinc-500 hover:bg-zinc-50'
              }`}
            >
              否，一切正常
            </button>
          </div>
        </div>

        {foundLoose && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-700">发现设备松动</p>
              <p className="text-xs text-red-600 mt-1">设备将自动停用并生成维修提醒，直至维修完成方可重新使用</p>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1.5">备注</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="其他需要记录的信息..."
            rows={3}
            className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 resize-none"
          />
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!selectedDevice || !cleaner.trim()}
        className={`w-full py-3 rounded-xl text-sm font-bold transition-all ${
          selectedDevice && cleaner.trim()
            ? foundLoose
              ? 'bg-red-600 text-white hover:bg-red-700 shadow-sm hover:shadow-md'
              : 'bg-teal-600 text-white hover:bg-teal-700 shadow-sm hover:shadow-md'
            : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
        }`}
      >
        {foundLoose ? '确认并停用设备' : '确认清洁记录'}
      </button>
    </div>
  )
}
