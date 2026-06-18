import { useStore } from '@/store/useStore'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Armchair, Check, X, AlertTriangle } from 'lucide-react'
import StatusBadge from '@/components/StatusBadge'

interface CheckItem {
  key: string
  label: string
  icon: string
  failReason: string
}

const CHECK_ITEMS: CheckItem[] = [
  { key: 'seatOk', label: '座面完好', icon: '🪑', failReason: '座面损坏或变形' },
  { key: 'backrestOk', label: '靠背稳固', icon: '🛋️', failReason: '靠背晃动或不稳' },
  { key: 'footPadOk', label: '脚垫完好', icon: '🦶', failReason: '防滑脚垫开裂或磨损严重' },
  { key: 'screwsOk', label: '螺丝无缺失', icon: '🔧', failReason: '螺丝缺失或松动' },
  { key: 'drainHoleOk', label: '排水孔畅通', icon: '💧', failReason: '排水孔堵塞' },
]

export default function PreCheck() {
  const navigate = useNavigate()
  const { devices, addCheckRecord, startUsage, addMaintenanceAlert, updateDevice } = useStore()

  const availableDevices = devices.filter((d) => d.status === 'available')

  const [selectedDevice, setSelectedDevice] = useState('')
  const [checkedBy, setCheckedBy] = useState('')
  const [checks, setChecks] = useState<Record<string, boolean | null>>({
    seatOk: null,
    backrestOk: null,
    footPadOk: null,
    screwsOk: null,
    drainHoleOk: null,
  })
  const [submitted, setSubmitted] = useState(false)

  const allChecked = Object.values(checks).every((v) => v !== null)
  const allPassed = Object.values(checks).every((v) => v === true)

  const handleCheck = (key: string, value: boolean) => {
    setChecks((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = () => {
    if (!selectedDevice || !allChecked || !checkedBy.trim()) return

    const checkRecordId = addCheckRecord({
      deviceId: selectedDevice,
      seatOk: checks.seatOk!,
      backrestOk: checks.backrestOk!,
      footPadOk: checks.footPadOk!,
      screwsOk: checks.screwsOk!,
      drainHoleOk: checks.drainHoleOk!,
      allPassed,
      checkedAt: new Date().toISOString(),
      checkedBy: checkedBy.trim(),
    })

    if (!allPassed) {
      const failedItems = CHECK_ITEMS.filter((item) => !checks[item.key])
      const reasons = failedItems.map((item) => item.failReason).join('、')

      updateDevice(selectedDevice, { status: 'disabled' })
      addMaintenanceAlert({
        deviceId: selectedDevice,
        reason: reasons,
        triggerSource: 'pre_check',
        status: 'pending',
        createdAt: new Date().toISOString(),
        resolvedAt: null,
        resolvedBy: null,
      })
    } else {
      startUsage(selectedDevice, checkRecordId)
    }

    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto text-center py-16 animate-fadeIn">
        {allPassed ? (
          <>
            <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-teal-600" />
            </div>
            <h2 className="text-xl font-bold text-zinc-800 font-display">检查通过</h2>
            <p className="text-sm text-zinc-500 mt-2">设备已开始使用，请注意安全</p>
            <div className="mt-6 flex gap-3 justify-center">
              <button
                onClick={() => navigate('/')}
                className="px-5 py-2.5 rounded-lg bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 transition-colors"
              >
                返回首页
              </button>
              <button
                onClick={() => navigate('/post-record')}
                className="px-5 py-2.5 rounded-lg border border-zinc-200 text-sm font-medium text-zinc-600 hover:bg-zinc-50 transition-colors"
              >
                使用后记录
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-red-700 font-display">检查未通过</h2>
            <p className="text-sm text-zinc-500 mt-2">设备已停用，已生成维修提醒</p>
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4 text-left max-w-sm mx-auto">
              <p className="text-sm text-red-700 font-semibold mb-1">异常项目：</p>
              <ul className="space-y-1">
                {CHECK_ITEMS.filter((item) => !checks[item.key]).map((item) => (
                  <li key={item.key} className="text-sm text-red-600">• {item.failReason}</li>
                ))}
              </ul>
            </div>
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
        )}
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn">
      <div>
        <h2 className="text-2xl font-bold text-zinc-800 font-display">使用前检查</h2>
        <p className="text-sm text-zinc-400 mt-1">使用助浴椅前，请逐项完成安全检查</p>
      </div>

      <div className="bg-white rounded-xl border border-zinc-100 shadow-sm p-5 space-y-5">
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1.5">选择设备</label>
          {availableDevices.length === 0 ? (
            <div className="px-4 py-3 rounded-lg bg-zinc-50 text-sm text-zinc-400">
              暂无可用设备
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {availableDevices.map((d) => (
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
          <label className="block text-sm font-medium text-zinc-700 mb-1.5">检查人</label>
          <input
            type="text"
            value={checkedBy}
            onChange={(e) => setCheckedBy(e.target.value)}
            placeholder="请输入检查人姓名"
            className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-zinc-100 shadow-sm p-5 space-y-4">
        <h3 className="text-sm font-bold text-zinc-700">安全检查清单</h3>
        {CHECK_ITEMS.map((item) => (
          <div
            key={item.key}
            className={`flex items-center gap-4 px-4 py-3.5 rounded-lg border transition-all ${
              checks[item.key] === true
                ? 'bg-teal-50 border-teal-200'
                : checks[item.key] === false
                ? 'bg-red-50 border-red-200'
                : 'bg-zinc-50 border-zinc-200'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-sm font-medium text-zinc-700 flex-1">{item.label}</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleCheck(item.key, true)}
                className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                  checks[item.key] === true
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'bg-white border border-zinc-200 text-zinc-400 hover:bg-teal-50'
                }`}
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handleCheck(item.key, false)}
                className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                  checks[item.key] === false
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'bg-white border border-zinc-200 text-zinc-400 hover:bg-red-50'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {!allPassed && allChecked && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-700">存在异常项</p>
            <p className="text-xs text-red-600 mt-1">设备将自动停用并生成维修提醒，直至维修完成方可重新使用</p>
          </div>
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={!selectedDevice || !allChecked || !checkedBy.trim()}
        className={`w-full py-3 rounded-xl text-sm font-bold transition-all ${
          selectedDevice && allChecked && checkedBy.trim()
            ? allPassed
              ? 'bg-teal-600 text-white hover:bg-teal-700 shadow-sm hover:shadow-md'
              : 'bg-red-600 text-white hover:bg-red-700 shadow-sm hover:shadow-md'
            : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
        }`}
      >
        {allChecked && !allPassed ? '确认并停用设备' : '确认检查并开始使用'}
      </button>
    </div>
  )
}
