import { useStore } from '@/store/useStore'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Wrench, AlertTriangle, Check, ArrowRight, Armchair } from 'lucide-react'
import { DEVICE_STATUS_MAP, formatDateTime } from '@/utils/helpers'
import StatusBadge from '@/components/StatusBadge'

export default function Maintenance() {
  const navigate = useNavigate()
  const { maintenanceAlerts, devices, resolveAlertAndRestoreDevice } = useStore()

  const [resolveMode, setResolveMode] = useState<string | null>(null)
  const [resolvedBy, setResolvedBy] = useState('')
  const [resolvedNotes, setResolvedNotes] = useState('')

  const pendingAlerts = maintenanceAlerts
    .filter((a) => a.status === 'pending')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const resolvedAlerts = maintenanceAlerts
    .filter((a) => a.status === 'resolved')
    .sort((a, b) => new Date(b.resolvedAt!).getTime() - new Date(a.resolvedAt!).getTime())

  const getDevice = (id: string) => devices.find((d) => d.id === id)

  const handleResolve = (alertId: string) => {
    if (!resolvedBy.trim()) return
    resolveAlertAndRestoreDevice(alertId, resolvedBy.trim(), resolvedNotes.trim())
    setResolveMode(null)
    setResolvedBy('')
    setResolvedNotes('')
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h2 className="text-2xl font-bold text-zinc-800 font-display">维修提醒</h2>
        <p className="text-sm text-zinc-400 mt-1">处理设备异常与维修工单</p>
      </div>

      {pendingAlerts.length === 0 && resolvedAlerts.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-teal-500" />
          </div>
          <h3 className="text-lg font-semibold text-zinc-700">一切正常</h3>
          <p className="text-sm text-zinc-400 mt-1">暂无待处理维修提醒</p>
        </div>
      ) : (
        <>
          {pendingAlerts.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <h3 className="text-sm font-bold text-red-700">待处理 ({pendingAlerts.length})</h3>
              </div>
              {pendingAlerts.map((alert) => {
                const device = getDevice(alert.deviceId)
                if (!device) return null
                return (
                  <div
                    key={alert.id}
                    className="bg-white rounded-xl border border-red-200 shadow-sm overflow-hidden"
                  >
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center shrink-0 mt-0.5">
                            <Wrench className="w-5 h-5 text-red-500" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-zinc-800">{device.code}</span>
                              <StatusBadge status={device.status} />
                            </div>
                            <p className="text-sm text-red-700 mt-1 font-medium">{alert.reason}</p>
                            <p className="text-xs text-zinc-400 mt-1">
                              触发时间：{formatDateTime(alert.createdAt)}
                              {alert.triggerSource === 'pre_check' && ' · 使用前检查'}
                              {alert.triggerSource === 'post_check' && ' · 使用后检查'}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center gap-3">
                        <button
                          onClick={() => navigate(`/devices/${device.id}`)}
                          className="flex-1 py-2 rounded-lg border border-zinc-200 text-sm font-medium text-zinc-600 hover:bg-zinc-50 transition-colors flex items-center justify-center gap-1.5"
                        >
                          <Armchair className="w-3.5 h-3.5" />
                          查看设备
                        </button>
                        <button
                          onClick={() => setResolveMode(alert.id)}
                          className="flex-1 py-2 rounded-lg bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 transition-colors flex items-center justify-center gap-1.5"
                        >
                          <Check className="w-3.5 h-3.5" />
                          维修完成
                        </button>
                      </div>

                      {resolveMode === alert.id && (
                        <div className="mt-4 pt-4 border-t border-zinc-100 space-y-2">
                          <input
                            type="text"
                            value={resolvedBy}
                            onChange={(e) => setResolvedBy(e.target.value)}
                            placeholder="维修人姓名"
                            className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400"
                          />
                          <textarea
                            value={resolvedNotes}
                            onChange={(e) => setResolvedNotes(e.target.value)}
                            placeholder="处理结果，如：脚垫更换、螺丝拧紧、靠背加固..."
                            rows={2}
                            className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 resize-none"
                          />
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => {
                                setResolveMode(null)
                                setResolvedBy('')
                                setResolvedNotes('')
                              }}
                              className="px-4 py-2 rounded-lg border border-zinc-200 text-sm font-medium text-zinc-600 hover:bg-zinc-50 transition-colors"
                            >
                              取消
                            </button>
                            <button
                              onClick={() => handleResolve(alert.id)}
                              disabled={!resolvedBy.trim()}
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                resolvedBy.trim()
                                  ? 'bg-teal-600 text-white hover:bg-teal-700'
                                  : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
                              }`}
                            >
                              确认完成
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {resolvedAlerts.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-zinc-500">已解决 ({resolvedAlerts.length})</h3>
              {resolvedAlerts.map((alert) => {
                const device = getDevice(alert.deviceId)
                return (
                  <div
                    key={alert.id}
                    className="bg-white rounded-xl border border-zinc-100 p-4 opacity-60"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center shrink-0">
                        <Check className="w-4 h-4 text-teal-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-zinc-700">
                          <span className="font-semibold">{device?.code ?? alert.deviceId}</span> · {alert.reason}
                        </p>
                        {alert.resolvedNotes && (
                          <p className="text-xs text-teal-600 mt-1">处理：{alert.resolvedNotes}</p>
                        )}
                        <p className="text-[11px] text-zinc-400 mt-0.5">
                          维修人：{alert.resolvedBy} · {formatDateTime(alert.resolvedAt!)}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}
