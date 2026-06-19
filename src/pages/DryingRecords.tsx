import { useState } from 'react'
import { useStore } from '@/store/useStore'
import type { ClothingType, DryingProgram } from '@/types'
import {
  Flame,
  Plus,
  X,
  Check,
  CheckCircle2,
  XCircle,
  Clock,
  Weight,
  Shirt,
  Trash2,
  AlertTriangle,
} from 'lucide-react'

const CLOTHING_TYPES: ClothingType[] = [
  '棉织物',
  '化纤',
  '羊毛',
  '丝绸',
  '混合',
  '毛巾',
  '床单',
]

const DRYING_PROGRAMS: DryingProgram[] = [
  '标准',
  '快速',
  '轻柔',
  '强力',
  '节能',
  '定时',
]

interface DryingForm {
  deviceId: string
  clothingTypes: ClothingType[]
  weight: number
  program: DryingProgram
  duration: number
  filterCleaned: boolean
  date: string
}

const emptyForm: DryingForm = {
  deviceId: '',
  clothingTypes: [],
  weight: 3,
  program: '标准',
  duration: 60,
  filterCleaned: false,
  date: new Date().toISOString().slice(0, 10),
}

export default function DryingRecords() {
  const devices = useStore((s) => s.devices)
  const dryingRecords = useStore((s) => s.dryingRecords)
  const addDryingRecord = useStore((s) => s.addDryingRecord)
  const deleteDryingRecord = useStore((s) => s.deleteDryingRecord)
  const getConsecutiveUncleaned = useStore((s) => s.getConsecutiveUncleaned)
  const isDurationAbnormal = useStore((s) => s.isDurationAbnormal)
  const getAverageDuration = useStore((s) => s.getAverageDuration)

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<DryingForm>({
    ...emptyForm,
    deviceId: devices[0]?.id || '',
  })

  const sortedRecords = [...dryingRecords].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  const handleSave = () => {
    if (!form.deviceId || form.clothingTypes.length === 0) return
    addDryingRecord(form)
    setShowForm(false)
    setForm({
      ...emptyForm,
      deviceId: devices[0]?.id || '',
      date: new Date().toISOString().slice(0, 10),
    })
  }

  const toggleClothingType = (type: ClothingType) => {
    setForm((prev) => ({
      ...prev,
      clothingTypes: prev.clothingTypes.includes(type)
        ? prev.clothingTypes.filter((t) => t !== type)
        : [...prev.clothingTypes, type],
    }))
  }

  const selectedDevice = devices.find((d) => d.id === form.deviceId)
  const consecutiveUncleaned = form.deviceId
    ? getConsecutiveUncleaned(form.deviceId)
    : 0

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <header className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Flame className="w-6 h-6 text-brand-400" />
            <h2 className="font-display text-xl tracking-wider text-brand-400">
              DRYING LOG
            </h2>
          </div>
          <p className="text-surface-300 text-sm font-body">
            每次烘干使用记录
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-sm transition-all duration-200 hover:-translate-y-0.5 font-body"
        >
          <Plus className="w-4 h-4" />
          新增记录
        </button>
      </header>

      {showForm && (
        <div className="mb-6 bg-surface-700/50 rounded-xl border border-brand-500/30 p-6 animate-slide-up">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-medium text-white font-body">
              新增烘干记录
            </h3>
            <button
              onClick={() => setShowForm(false)}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-600/50 text-surface-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs text-surface-300 mb-1.5 font-body">
                选择设备 *
              </label>
              <select
                value={form.deviceId}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, deviceId: e.target.value }))
                }
                className="w-full px-3 py-2.5 bg-surface-800 border border-surface-500/30 rounded-lg text-sm text-white focus:outline-none focus:border-brand-500/50 transition-colors appearance-none font-body"
              >
                <option value="">请选择设备</option>
                {devices.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.model}
                  </option>
                ))}
              </select>
            </div>

            {selectedDevice && consecutiveUncleaned >= 2 && (
              <div className="md:col-span-2 p-3 rounded-lg bg-danger-500/10 border border-danger-500/30">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-danger-400 animate-pulse" />
                  <span className="text-xs text-danger-400 font-body">
                    该设备已连续 {consecutiveUncleaned} 次未清理滤网，强烈建议清理！
                  </span>
                </div>
              </div>
            )}

            <div className="md:col-span-2">
              <label className="block text-xs text-surface-300 mb-1.5 font-body">
                衣物类型 *（多选）
              </label>
              <div className="flex flex-wrap gap-2">
                {CLOTHING_TYPES.map((type) => (
                  <button
                    key={type}
                    onClick={() => toggleClothingType(type)}
                    className={`px-3 py-1.5 rounded-lg text-xs transition-all duration-200 font-body ${
                      form.clothingTypes.includes(type)
                        ? 'bg-brand-500/20 text-brand-400 border border-brand-500/40'
                        : 'bg-surface-800 text-surface-300 border border-surface-500/20 hover:border-surface-500/50'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs text-surface-300 mb-1.5 font-body">
                重量 (kg)
              </label>
              <div className="relative">
                <Weight className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                <input
                  type="number"
                  value={form.weight}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      weight: Number(e.target.value),
                    }))
                  }
                  min={0.1}
                  max={20}
                  step={0.1}
                  className="w-full pl-10 pr-3 py-2.5 bg-surface-800 border border-surface-500/30 rounded-lg text-sm text-white focus:outline-none focus:border-brand-500/50 transition-colors font-body"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-surface-300 mb-1.5 font-body">
                烘干程序
              </label>
              <select
                value={form.program}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    program: e.target.value as DryingProgram,
                  }))
                }
                className="w-full px-3 py-2.5 bg-surface-800 border border-surface-500/30 rounded-lg text-sm text-white focus:outline-none focus:border-brand-500/50 transition-colors appearance-none font-body"
              >
                {DRYING_PROGRAMS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-surface-300 mb-1.5 font-body">
                烘干耗时 (分钟)
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                <input
                  type="number"
                  value={form.duration}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      duration: Number(e.target.value),
                    }))
                  }
                  min={1}
                  max={300}
                  className="w-full pl-10 pr-3 py-2.5 bg-surface-800 border border-surface-500/30 rounded-lg text-sm text-white focus:outline-none focus:border-brand-500/50 transition-colors font-body"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-surface-300 mb-1.5 font-body">
                烘干日期
              </label>
              <input
                type="date"
                value={form.date}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, date: e.target.value }))
                }
                className="w-full px-3 py-2.5 bg-surface-800 border border-surface-500/30 rounded-lg text-sm text-white focus:outline-none focus:border-brand-500/50 transition-colors font-body"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs text-surface-300 mb-1.5 font-body">
                是否清理滤网？
              </label>
              <div className="flex gap-3">
                <button
                  onClick={() =>
                    setForm((prev) => ({ ...prev, filterCleaned: true }))
                  }
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm transition-all duration-200 font-body ${
                    form.filterCleaned
                      ? 'bg-success-500/20 text-success-400 border border-success-500/40'
                      : 'bg-surface-800 text-surface-300 border border-surface-500/20 hover:border-surface-500/50'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  已清理
                </button>
                <button
                  onClick={() =>
                    setForm((prev) => ({ ...prev, filterCleaned: false }))
                  }
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm transition-all duration-200 font-body ${
                    !form.filterCleaned
                      ? 'bg-danger-500/20 text-danger-400 border border-danger-500/40'
                      : 'bg-surface-800 text-surface-300 border border-surface-500/20 hover:border-surface-500/50'
                  }`}
                >
                  <XCircle className="w-4 h-4" />
                  未清理
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-5 pt-4 border-t border-surface-500/30">
            <button
              onClick={handleSave}
              disabled={!form.deviceId || form.clothingTypes.length === 0}
              className="flex items-center gap-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-600 disabled:bg-surface-600 disabled:text-surface-400 text-white rounded-lg text-sm transition-all duration-200 font-body"
            >
              <Check className="w-4 h-4" />
              保存记录
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-5 py-2.5 text-surface-300 hover:text-white rounded-lg text-sm transition-colors font-body"
            >
              取消
            </button>
          </div>
        </div>
      )}

      {sortedRecords.length === 0 ? (
        <div className="bg-surface-700/50 rounded-xl border border-surface-500/30 p-12 text-center">
          <Shirt className="w-16 h-16 text-surface-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2 font-body">
            暂无烘干记录
          </h3>
          <p className="text-surface-400 text-sm font-body">
            点击"新增记录"开始记录每次烘干信息
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedRecords.map((record) => {
            const device = devices.find((d) => d.id === record.deviceId)
            const abnormal = isDurationAbnormal(record)
            const avg = record.deviceId
              ? getAverageDuration(record.deviceId)
              : 0
            return (
              <div
                key={record.id}
                className={`bg-surface-700/50 rounded-xl border p-4 transition-colors animate-fade-in ${
                  abnormal
                    ? 'border-danger-500/30'
                    : 'border-surface-500/30 hover:border-surface-500/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        record.filterCleaned
                          ? 'bg-success-500/15'
                          : 'bg-danger-500/15'
                      }`}
                    >
                      {record.filterCleaned ? (
                        <CheckCircle2 className="w-5 h-5 text-success-400" />
                      ) : (
                        <XCircle className="w-5 h-5 text-danger-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-white font-body">
                        {device?.model || '未知设备'}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-surface-400 font-body">
                          {record.clothingTypes.join('、')}
                        </span>
                        <span className="text-surface-500">·</span>
                        <span className="text-xs text-surface-400 font-body">
                          {record.weight}kg
                        </span>
                        <span className="text-surface-500">·</span>
                        <span className="text-xs text-surface-400 font-body">
                          {record.program}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p
                        className={`text-sm font-display ${
                          abnormal ? 'text-danger-400' : 'text-white'
                        }`}
                      >
                        {record.duration}
                        <span className="text-xs ml-0.5">min</span>
                      </p>
                      {abnormal && (
                        <p className="text-[10px] text-danger-400 font-body">
                          高于平均 {Math.round(avg)} 分钟
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-surface-400 font-body">
                        {record.date}
                      </p>
                      <span
                        className={`inline-block text-[10px] px-1.5 py-0.5 rounded-full mt-0.5 font-body ${
                          record.filterCleaned
                            ? 'bg-success-500/20 text-success-400'
                            : 'bg-danger-500/20 text-danger-400'
                        }`}
                      >
                        {record.filterCleaned ? '已清理' : '未清理'}
                      </span>
                    </div>
                    <button
                      onClick={() => deleteDryingRecord(record.id)}
                      className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-danger-500/10 text-surface-400 hover:text-danger-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
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
