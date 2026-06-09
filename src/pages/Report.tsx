import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '@/store'
import type { Urgency } from '@/types'
import { EQUIPMENT_OPTIONS, FAULT_PRESETS, URGENCY_LABELS } from '@/types'
import {
  AlertTriangle,
  Camera,
  Clock,
  CheckCircle2,
  ChevronRight,
  MapPin,
} from 'lucide-react'

export default function Report() {
  const navigate = useNavigate()
  const rooms = useStore((s) => s.rooms)
  const addTicket = useStore((s) => s.addTicket)

  const [step, setStep] = useState(1)
  const [roomId, setRoomId] = useState('')
  const [equipmentType, setEquipmentType] = useState('')
  const [faultDescription, setFaultDescription] = useState('')
  const [urgency, setUrgency] = useState<Urgency>('normal')
  const [affectedMeetingTime, setAffectedMeetingTime] = useState('')
  const [reporter, setReporter] = useState('')
  const [customFault, setCustomFault] = useState('')

  const selectedRoom = rooms.find((r) => r.id === roomId)
  const availableEquip = selectedRoom?.equipment || EQUIPMENT_OPTIONS
  const faultPresets = FAULT_PRESETS[equipmentType] || []

  const canProceedStep1 = roomId && equipmentType
  const canProceedStep2 = faultDescription.trim()
  const canSubmit = reporter.trim() && faultDescription.trim()

  const handleSelectFaultPreset = (fault: string) => {
    setFaultDescription(fault)
  }

  const handleSubmit = () => {
    if (!canSubmit) return
    const ticket = {
      id: `ticket-${Date.now()}`,
      roomId,
      equipmentType,
      faultDescription: faultDescription.trim(),
      urgency,
      photos: [] as string[],
      affectedMeetingTime,
      status: 'pending' as const,
      createdAt: new Date().toISOString(),
      assignee: '',
      faultCause: '',
      solution: '',
      needVendor: false,
      estimatedRecovery: '',
      completedAt: '',
      reporter: reporter.trim(),
    }
    addTicket(ticket)
    navigate(`/ticket/${ticket.id}`)
  }

  const urgencyOptions: { value: Urgency; label: string; desc: string; color: string; bg: string }[] = [
    { value: 'urgent', label: '紧急', desc: '会议即将开始，设备完全不可用', color: 'text-red-700', bg: 'border-red-300 bg-red-50' },
    { value: 'high', label: '较急', desc: '近期有会议受影响，需要尽快处理', color: 'text-orange-700', bg: 'border-orange-300 bg-orange-50' },
    { value: 'normal', label: '一般', desc: '暂无会议影响，可排队处理', color: 'text-slate-700', bg: 'border-slate-300 bg-slate-50' },
  ]

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900">提交报修</h2>
        <p className="mt-1 text-sm text-slate-500">发现设备问题？快速提交报修工单</p>
      </div>

      <div className="mb-8 flex items-center justify-center gap-2">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-all ${
                s < step
                  ? 'bg-emerald-500 text-white'
                  : s === step
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-400'
              }`}
            >
              {s < step ? <CheckCircle2 className="h-4 w-4" /> : s}
            </div>
            {s < 3 && (
              <div className={`h-0.5 w-12 transition-all ${s < step ? 'bg-emerald-500' : 'bg-slate-200'}`} />
            )}
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {step === 1 && (
          <div>
            <h3 className="text-lg font-semibold text-slate-900">选择会议室和设备</h3>
            <p className="mt-1 text-sm text-slate-500">选择出问题的会议室及对应设备</p>

            <div className="mt-6">
              <label className="mb-2 block text-xs font-medium text-slate-500">选择会议室</label>
              <div className="grid grid-cols-2 gap-2">
                {rooms.map((room) => (
                  <button
                    key={room.id}
                    onClick={() => {
                      setRoomId(room.id)
                      setEquipmentType('')
                      setFaultDescription('')
                    }}
                    className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-left transition-all ${
                      roomId === room.id
                        ? 'border-slate-900 bg-slate-50 shadow-sm'
                        : room.status === 'maintenance'
                        ? 'border-amber-200 bg-amber-50/50 opacity-60'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <MapPin className="h-4 w-4 text-slate-400" />
                    <div>
                      <div className="text-sm font-medium text-slate-900">{room.name}</div>
                      <div className="text-[11px] text-slate-400">{room.floor} · {room.capacity}人</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {roomId && (
              <div className="mt-6">
                <label className="mb-2 block text-xs font-medium text-slate-500">选择故障设备</label>
                <div className="flex flex-wrap gap-2">
                  {availableEquip.map((eq) => (
                    <button
                      key={eq}
                      onClick={() => {
                        setEquipmentType(eq)
                        setFaultDescription('')
                      }}
                      className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium transition-all ${
                        equipmentType === eq
                          ? 'bg-slate-900 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <AlertTriangle className="h-3.5 w-3.5" />
                      {eq}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div>
            <h3 className="text-lg font-semibold text-slate-900">描述故障详情</h3>
            <p className="mt-1 text-sm text-slate-500">选择或输入故障现象，并标记紧急程度</p>

            <div className="mt-6">
              <label className="mb-2 block text-xs font-medium text-slate-500">
                故障现象 — {equipmentType}
              </label>
              {faultPresets.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {faultPresets.map((fault) => (
                    <button
                      key={fault}
                      onClick={() => handleSelectFaultPreset(fault)}
                      className={`inline-flex items-center rounded-full px-3 py-1.5 text-sm transition-all ${
                        faultDescription === fault
                          ? 'bg-amber-100 text-amber-800 ring-1 ring-amber-300'
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {fault}
                    </button>
                  ))}
                </div>
              )}
              <textarea
                value={faultDescription}
                onChange={(e) => setFaultDescription(e.target.value)}
                placeholder="详细描述故障现象..."
                rows={3}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-300 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100"
              />
            </div>

            <div className="mt-6">
              <label className="mb-2 block text-xs font-medium text-slate-500">紧急程度</label>
              <div className="grid grid-cols-3 gap-3">
                {urgencyOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setUrgency(opt.value)}
                    className={`rounded-xl border px-4 py-3 text-left transition-all ${
                      urgency === opt.value
                        ? opt.bg + ' ring-1'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className={`text-sm font-semibold ${opt.color}`}>{opt.label}</div>
                    <div className="mt-0.5 text-[11px] text-slate-500">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <label className="mb-2 block text-xs font-medium text-slate-500">
                <Camera className="mr-1 inline h-3.5 w-3.5" />
                故障照片（示意）
              </label>
              <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-slate-200 py-8 text-sm text-slate-400">
                <Camera className="mr-2 h-5 w-5" />
                点击或拖拽上传照片
              </div>
            </div>

            <div className="mt-6">
              <label className="mb-2 block text-xs font-medium text-slate-500">
                <Clock className="mr-1 inline h-3.5 w-3.5" />
                受影响的会议时间
              </label>
              <input
                type="datetime-local"
                value={affectedMeetingTime}
                onChange={(e) => setAffectedMeetingTime(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100"
              />
              <p className="mt-1 text-[11px] text-slate-400">填写即将受影响的会议时间，紧急工单将优先展示</p>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h3 className="text-lg font-semibold text-slate-900">确认并提交</h3>
            <p className="mt-1 text-sm text-slate-500">确认报修信息并填写报修人</p>

            <div className="mt-6 space-y-4">
              <div className="rounded-xl bg-slate-50 p-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-slate-400">会议室</span>
                    <p className="mt-0.5 font-medium text-slate-900">{selectedRoom?.name}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">楼层</span>
                    <p className="mt-0.5 font-medium text-slate-900">{selectedRoom?.floor}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">故障设备</span>
                    <p className="mt-0.5 font-medium text-slate-900">{equipmentType}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">紧急程度</span>
                    <p className={`mt-0.5 font-medium ${urgency === 'urgent' ? 'text-red-600' : urgency === 'high' ? 'text-orange-600' : 'text-slate-900'}`}>
                      {URGENCY_LABELS[urgency]}
                    </p>
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-sm text-slate-400">故障描述</span>
                  <p className="mt-0.5 text-sm text-slate-900">{faultDescription}</p>
                </div>
                {affectedMeetingTime && (
                  <div className="mt-3">
                    <span className="text-sm text-slate-400">受影响会议时间</span>
                    <p className="mt-0.5 text-sm font-medium text-red-600">
                      {new Date(affectedMeetingTime).toLocaleString('zh-CN')}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-500">报修人姓名</label>
                <input
                  value={reporter}
                  onChange={(e) => setReporter(e.target.value)}
                  placeholder="您的姓名"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-300 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100"
                />
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 flex items-center justify-between">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-100"
            >
              上一步
            </button>
          ) : (
            <div />
          )}
          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={step === 1 ? !canProceedStep1 : !canProceedStep2}
              className="flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-slate-800 disabled:opacity-40"
            >
              下一步
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 disabled:opacity-40"
            >
              <AlertTriangle className="h-4 w-4" />
              提交报修
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
