import { useState, useEffect } from 'react'
import { useStore } from '@/store/useStore'
import type { LintAmount, CondensateStatus } from '@/types'
import {
  Sparkles,
  Plus,
  X,
  Check,
  Wind,
  Trash2,
  Volume2,
  Droplets,
  AlertTriangle,
  Eye,
  CalendarClock,
  FileText,
} from 'lucide-react'
import { useLocation } from 'react-router-dom'

const LINT_AMOUNTS: LintAmount[] = ['少量', '中等', '大量', '极多']

const CONDENSATE_STATUSES: CondensateStatus[] = ['正常', '需清理', '已满']

const LINT_COLORS: Record<LintAmount, string> = {
  少量: 'bg-success-500/20 text-success-400 border-success-500/40',
  中等: 'bg-warning-500/20 text-warning-400 border-warning-500/40',
  大量: 'bg-brand-500/20 text-brand-400 border-brand-500/40',
  极多: 'bg-danger-500/20 text-danger-400 border-danger-500/40',
}

interface CleaningForm {
  deviceId: string
  dryingRecordId: string
  lintAmount: LintAmount
  ventChecked: boolean
  hasOdor: boolean
  hasNoise: boolean
  condensateStatus: CondensateStatus
  notes: string
  date: string
}

export default function CleaningRecords() {
  const devices = useStore((s) => s.devices)
  const dryingRecords = useStore((s) => s.dryingRecords)
  const cleaningRecords = useStore((s) => s.cleaningRecords)
  const addCleaningRecord = useStore((s) => s.addCleaningRecord)
  const deleteCleaningRecord = useStore((s) => s.deleteCleaningRecord)
  const nextDeepCleanDate = useStore((s) => s.nextDeepCleanDate)
  const setNextDeepCleanDate = useStore((s) => s.setNextDeepCleanDate)
  const location = useLocation()

  const uncleanedRecords = dryingRecords.filter((r) => !r.filterCleaned)

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<CleaningForm>({
    deviceId: devices[0]?.id || '',
    dryingRecordId: uncleanedRecords[0]?.id || '',
    lintAmount: '中等',
    ventChecked: false,
    hasOdor: false,
    hasNoise: false,
    condensateStatus: '正常',
    notes: '',
    date: new Date().toISOString().slice(0, 10),
  })

  useEffect(() => {
    const state = location.state as
      | { prefillDeviceId?: string; prefillDryingRecordId?: string }
      | undefined
    if (state?.prefillDeviceId || state?.prefillDryingRecordId) {
      setForm((prev) => ({
        ...prev,
        deviceId: state.prefillDeviceId || prev.deviceId,
        dryingRecordId: state.prefillDryingRecordId || prev.dryingRecordId,
      }))
      setShowForm(true)
    }
  }, [location.state])

  const [showDeepCleanSetting, setShowDeepCleanSetting] = useState(false)
  const [deepCleanDate, setDeepCleanDate] = useState(nextDeepCleanDate)

  const sortedRecords = [...cleaningRecords].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  const handleSave = () => {
    if (!form.deviceId) return
    addCleaningRecord(form)
    setShowForm(false)
    setForm({
      deviceId: devices[0]?.id || '',
      dryingRecordId: '',
      lintAmount: '中等',
      ventChecked: false,
      hasOdor: false,
      hasNoise: false,
      condensateStatus: '正常',
      notes: '',
      date: new Date().toISOString().slice(0, 10),
    })
  }

  const handleSaveDeepCleanDate = () => {
    setNextDeepCleanDate(deepCleanDate)
    setShowDeepCleanSetting(false)
  }

  const selectedDeviceDryingRecords = dryingRecords.filter(
    (r) => r.deviceId === form.deviceId
  )

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <header className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-6 h-6 text-brand-400" />
            <h2 className="font-display text-xl tracking-wider text-brand-400">
              CLEANING LOG
            </h2>
          </div>
          <p className="text-surface-300 text-sm font-body">
            滤网清理与检查记录
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowDeepCleanSetting(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-surface-600 hover:bg-surface-500 text-surface-200 rounded-lg text-sm transition-all duration-200 font-body"
          >
            <CalendarClock className="w-4 h-4" />
            深度清洁日期
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-sm transition-all duration-200 hover:-translate-y-0.5 font-body"
          >
            <Plus className="w-4 h-4" />
            新增清理记录
          </button>
        </div>
      </header>

      {showDeepCleanSetting && (
        <div className="mb-6 bg-surface-700/50 rounded-xl border border-brand-500/30 p-6 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-white font-body">
              设置下次深度清洁日期
            </h3>
            <button
              onClick={() => setShowDeepCleanSetting(false)}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-600/50 text-surface-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-4">
            <input
              type="date"
              value={deepCleanDate}
              onChange={(e) => setDeepCleanDate(e.target.value)}
              className="px-3 py-2.5 bg-surface-800 border border-surface-500/30 rounded-lg text-sm text-white focus:outline-none focus:border-brand-500/50 transition-colors font-body"
            />
            <button
              onClick={handleSaveDeepCleanDate}
              className="flex items-center gap-2 px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-sm transition-all duration-200 font-body"
            >
              <Check className="w-4 h-4" />
              保存
            </button>
          </div>
          {nextDeepCleanDate && (
            <p className="text-xs text-surface-400 mt-2 font-body">
              当前设置：{nextDeepCleanDate}
            </p>
          )}
        </div>
      )}

      {showForm && (
        <div className="mb-6 bg-surface-700/50 rounded-xl border border-brand-500/30 p-6 animate-slide-up">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-medium text-white font-body">
              新增清理记录
            </h3>
            <button
              onClick={() => setShowForm(false)}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-600/50 text-surface-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-surface-300 mb-1.5 font-body">
                选择设备 *
              </label>
              <select
                value={form.deviceId}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    deviceId: e.target.value,
                    dryingRecordId: '',
                  }))
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

            <div>
              <label className="block text-xs text-surface-300 mb-1.5 font-body">
                关联烘干记录
              </label>
              <select
                value={form.dryingRecordId}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    dryingRecordId: e.target.value,
                  }))
                }
                className="w-full px-3 py-2.5 bg-surface-800 border border-surface-500/30 rounded-lg text-sm text-white focus:outline-none focus:border-brand-500/50 transition-colors appearance-none font-body"
              >
                <option value="">无关联</option>
                {selectedDeviceDryingRecords.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.date} - {r.clothingTypes.join('、')} - {r.duration}分钟
                    {!r.filterCleaned ? ' (未清理)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs text-surface-300 mb-1.5 font-body">
                绒毛量
              </label>
              <div className="flex gap-3">
                {LINT_AMOUNTS.map((amount) => (
                  <button
                    key={amount}
                    onClick={() =>
                      setForm((prev) => ({ ...prev, lintAmount: amount }))
                    }
                    className={`flex-1 py-2.5 rounded-lg text-xs transition-all duration-200 border font-body ${
                      form.lintAmount === amount
                        ? LINT_COLORS[amount]
                        : 'bg-surface-800 text-surface-300 border-surface-500/20 hover:border-surface-500/50'
                    }`}
                  >
                    {amount}
                  </button>
                ))}
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs text-surface-300 mb-3 font-body">
                检查项目
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      ventChecked: !prev.ventChecked,
                    }))
                  }
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm transition-all duration-200 border font-body ${
                    form.ventChecked
                      ? 'bg-success-500/20 text-success-400 border-success-500/40'
                      : 'bg-surface-800 text-surface-300 border-surface-500/20 hover:border-surface-500/50'
                  }`}
                >
                  <Wind className="w-4 h-4" />
                  排风口检查
                </button>

                <button
                  onClick={() =>
                    setForm((prev) => ({ ...prev, hasOdor: !prev.hasOdor }))
                  }
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm transition-all duration-200 border font-body ${
                    form.hasOdor
                      ? 'bg-warning-500/20 text-warning-400 border-warning-500/40'
                      : 'bg-surface-800 text-surface-300 border-surface-500/20 hover:border-surface-500/50'
                  }`}
                >
                  <AlertTriangle className="w-4 h-4" />
                  异味
                </button>

                <button
                  onClick={() =>
                    setForm((prev) => ({ ...prev, hasNoise: !prev.hasNoise }))
                  }
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm transition-all duration-200 border font-body ${
                    form.hasNoise
                      ? 'bg-warning-500/20 text-warning-400 border-warning-500/40'
                      : 'bg-surface-800 text-surface-300 border-surface-500/20 hover:border-surface-500/50'
                  }`}
                >
                  <Volume2 className="w-4 h-4" />
                  噪音
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs text-surface-300 mb-1.5 font-body">
                冷凝水盒状态
              </label>
              <div className="flex gap-2">
                {CONDENSATE_STATUSES.map((status) => (
                  <button
                    key={status}
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        condensateStatus: status,
                      }))
                    }
                    className={`flex-1 py-2.5 rounded-lg text-xs transition-all duration-200 border font-body ${
                      form.condensateStatus === status
                        ? status === '正常'
                          ? 'bg-success-500/20 text-success-400 border-success-500/40'
                          : status === '需清理'
                          ? 'bg-warning-500/20 text-warning-400 border-warning-500/40'
                          : 'bg-danger-500/20 text-danger-400 border-danger-500/40'
                        : 'bg-surface-800 text-surface-300 border-surface-500/20 hover:border-surface-500/50'
                    }`}
                  >
                    <Droplets className="w-3 h-3 inline mr-1" />
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs text-surface-300 mb-1.5 font-body">
                清理日期
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
                备注
              </label>
              <textarea
                value={form.notes}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, notes: e.target.value }))
                }
                rows={3}
                placeholder="记录任何需要注意的事项..."
                className="w-full px-3 py-2.5 bg-surface-800 border border-surface-500/30 rounded-lg text-sm text-white placeholder-surface-400 focus:outline-none focus:border-brand-500/50 transition-colors resize-none font-body"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 mt-5 pt-4 border-t border-surface-500/30">
            {nextDeepCleanDate && (
              <div className="mr-auto flex items-center gap-2 px-3 py-1.5 bg-brand-500/10 border border-brand-500/20 rounded-lg">
                <CalendarClock className="w-3.5 h-3.5 text-brand-400" />
                <span className="text-xs text-brand-400 font-body">
                  保存后下次深度清洁日期将自动顺延 90 天
                </span>
              </div>
            )}
            <button
              onClick={handleSave}
              disabled={!form.deviceId}
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
          <Sparkles className="w-16 h-16 text-surface-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2 font-body">
            暂无清理记录
          </h3>
          <p className="text-surface-400 text-sm font-body">
            点击"新增清理记录"开始记录每次滤网清理详情
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedRecords.map((record) => {
            const device = devices.find((d) => d.id === record.deviceId)
            const hasIssue = record.hasOdor || record.hasNoise || record.condensateStatus !== '正常'
            return (
              <div
                key={record.id}
                className={`bg-surface-700/50 rounded-xl border p-5 transition-colors animate-fade-in ${
                  hasIssue
                    ? 'border-warning-500/30'
                    : 'border-surface-500/30 hover:border-surface-500/50'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-brand-500/15 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-brand-400" />
                    </div>
                    <div>
                      <p className="text-sm text-white font-body">
                        {device?.model || '未知设备'}
                      </p>
                      <p className="text-xs text-surface-400 font-body">
                        {record.date}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full border font-body ${
                        LINT_COLORS[record.lintAmount]
                      }`}
                    >
                      绒毛：{record.lintAmount}
                    </span>
                    <button
                      onClick={() => deleteCleaningRecord(record.id)}
                      className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-danger-500/10 text-surface-400 hover:text-danger-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-body ${
                      record.ventChecked
                        ? 'bg-success-500/10 text-success-400'
                        : 'bg-surface-800/50 text-surface-400'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    排风口{record.ventChecked ? '已检查' : '未检查'}
                  </div>
                  <div
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-body ${
                      record.hasOdor
                        ? 'bg-warning-500/10 text-warning-400'
                        : 'bg-surface-800/50 text-surface-400'
                    }`}
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {record.hasOdor ? '有异味' : '无异味'}
                  </div>
                  <div
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-body ${
                      record.hasNoise
                        ? 'bg-warning-500/10 text-warning-400'
                        : 'bg-surface-800/50 text-surface-400'
                    }`}
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    {record.hasNoise ? '有噪音' : '无噪音'}
                  </div>
                  <div
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-body ${
                      record.condensateStatus === '正常'
                        ? 'bg-success-500/10 text-success-400'
                        : record.condensateStatus === '需清理'
                        ? 'bg-warning-500/10 text-warning-400'
                        : 'bg-danger-500/10 text-danger-400'
                    }`}
                  >
                    <Droplets className="w-3.5 h-3.5" />
                    冷凝水：{record.condensateStatus}
                  </div>
                </div>

                {record.notes && (
                  <div className="mt-3 flex items-start gap-2 px-3 py-2 rounded-lg bg-surface-800/30">
                    <FileText className="w-3.5 h-3.5 text-surface-400 mt-0.5" />
                    <p className="text-xs text-surface-300 font-body">
                      {record.notes}
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
