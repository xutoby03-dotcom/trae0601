import { useStore } from '@/store/useStore'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Armchair, ArrowLeft, Pencil, Trash2, History, AlertTriangle } from 'lucide-react'
import StatusBadge from '@/components/StatusBadge'
import { ARMREST_TYPE_MAP, FOOT_PAD_STATUS_MAP, formatDateTime, formatDate } from '@/utils/helpers'

export default function DeviceDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { devices, checkRecords, cleanRecords, maintenanceAlerts, deleteDevice, getActiveUsageForDevice } = useStore()

  const device = devices.find((d) => d.id === id)
  if (!device) {
    return (
      <div className="text-center py-16">
        <p className="text-sm text-zinc-400">设备不存在</p>
        <Link to="/devices" className="text-sm text-teal-600 mt-2 inline-block">返回列表</Link>
      </div>
    )
  }

  const deviceChecks = checkRecords.filter((r) => r.deviceId === device.id).sort((a, b) => new Date(b.checkedAt).getTime() - new Date(a.checkedAt).getTime())
  const deviceCleans = cleanRecords.filter((r) => r.deviceId === device.id).sort((a, b) => new Date(b.cleanedAt).getTime() - new Date(a.cleanedAt).getTime())
  const deviceAlerts = maintenanceAlerts.filter((a) => a.deviceId === device.id).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  const activeUsage = getActiveUsageForDevice(device.id)

  const handleDelete = () => {
    if (window.confirm(`确认删除设备 ${device.code}？此操作不可撤销。`)) {
      deleteDevice(device.id)
      navigate('/devices')
    }
  }

  const infoItems = [
    { label: '设备编号', value: device.code },
    { label: '承重能力', value: `${device.weightCapacity} kg` },
    { label: '扶手类型', value: ARMREST_TYPE_MAP[device.armrestType] },
    { label: '脚垫状态', value: FOOT_PAD_STATUS_MAP[device.footPadStatus].label, color: FOOT_PAD_STATUS_MAP[device.footPadStatus].color },
    { label: '购入日期', value: formatDate(device.purchaseDate) },
    { label: '当前状态', value: null },
  ]

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center gap-3">
        <Link to="/devices" className="p-2 rounded-lg hover:bg-zinc-100 transition-colors">
          <ArrowLeft className="w-5 h-5 text-zinc-500" />
        </Link>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-zinc-800 font-display">{device.code}</h2>
          <p className="text-sm text-zinc-400">设备详情与历史记录</p>
        </div>
        <Link
          to={`/devices/${device.id}/edit`}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-zinc-600 bg-white border border-zinc-200 hover:bg-zinc-50 transition-colors"
        >
          <Pencil className="w-3.5 h-3.5" />
          编辑
        </Link>
        <button
          onClick={handleDelete}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-red-600 bg-white border border-red-200 hover:bg-red-50 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          删除
        </button>
      </div>

      {activeUsage && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
            <Armchair className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-blue-800">设备使用中</p>
            <p className="text-xs text-blue-600">开始于 {formatDateTime(activeUsage.startTime)}</p>
          </div>
          <Link
            to="/post-record"
            className="ml-auto text-xs font-medium text-blue-700 hover:text-blue-900 underline"
          >
            填写使用后记录 →
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-zinc-100 overflow-hidden shadow-sm">
            <div className="h-48 bg-zinc-100">
              {device.photo ? (
                <img src={device.photo} alt={device.code} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Armchair className="w-12 h-12 text-zinc-300" />
                </div>
              )}
            </div>
            <div className="p-5 space-y-3">
              {infoItems.map((item) => (
                <div key={item.label} className="flex justify-between items-center">
                  <span className="text-xs text-zinc-400">{item.label}</span>
                  {item.label === '当前状态' ? (
                    <StatusBadge status={device.status} />
                  ) : (
                    <span className={`text-sm font-medium ${item.color ?? 'text-zinc-700'}`}>{item.value}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {deviceAlerts.length > 0 && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <h4 className="text-xs font-bold text-red-700">维修记录</h4>
              </div>
              <div className="space-y-2">
                {deviceAlerts.map((alert) => (
                  <div key={alert.id} className="text-xs">
                    <p className="text-red-700">{alert.reason}</p>
                    <p className="text-red-400 mt-0.5">
                      {formatDateTime(alert.createdAt)}
                      {alert.status === 'resolved' && ` · 已解决 (${alert.resolvedBy})`}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-zinc-100 shadow-sm">
            <div className="px-5 py-4 border-b border-zinc-50 flex items-center gap-2">
              <History className="w-4 h-4 text-zinc-400" />
              <h3 className="text-sm font-bold text-zinc-700">使用前检查记录</h3>
            </div>
            <div className="p-4">
              {deviceChecks.length === 0 ? (
                <p className="text-xs text-zinc-400 text-center py-6">暂无检查记录</p>
              ) : (
                <div className="space-y-2">
                  {deviceChecks.map((rec) => (
                    <div key={rec.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-zinc-50">
                      <div className={`w-2 h-2 rounded-full shrink-0 ${rec.allPassed ? 'bg-teal-400' : 'bg-red-400'}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-zinc-700">
                          <span className="font-semibold">{rec.checkedBy}</span> 检查 · 座面{rec.seatOk ? '✓' : '✗'} 靠背{rec.backrestOk ? '✓' : '✗'} 脚垫{rec.footPadOk ? '✓' : '✗'} 螺丝{rec.screwsOk ? '✓' : '✗'} 排水孔{rec.drainHoleOk ? '✓' : '✗'}
                        </p>
                        <p className="text-[10px] text-zinc-400 mt-0.5">{formatDateTime(rec.checkedAt)}</p>
                      </div>
                      <span className={`text-[10px] font-semibold ${rec.allPassed ? 'text-teal-600' : 'text-red-600'}`}>
                        {rec.allPassed ? '通过' : '未通过'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-zinc-100 shadow-sm">
            <div className="px-5 py-4 border-b border-zinc-50 flex items-center gap-2">
              <History className="w-4 h-4 text-zinc-400" />
              <h3 className="text-sm font-bold text-zinc-700">清洁消毒记录</h3>
            </div>
            <div className="p-4">
              {deviceCleans.length === 0 ? (
                <p className="text-xs text-zinc-400 text-center py-6">暂无清洁记录</p>
              ) : (
                <div className="space-y-2">
                  {deviceCleans.map((rec) => (
                    <div key={rec.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-zinc-50">
                      <div className={`w-2 h-2 rounded-full shrink-0 ${rec.foundLoose ? 'bg-red-400' : 'bg-teal-400'}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-zinc-700">
                          <span className="font-semibold">{rec.cleaner}</span> · {rec.disinfectMethod === 'alcohol' ? '酒精擦拭' : rec.disinfectMethod === 'chlorine' ? '含氯消毒' : rec.disinfectMethod === 'uv' ? '紫外线' : '其他'}
                          {rec.foundLoose && <span className="text-red-600 ml-1">· 发现松动!</span>}
                        </p>
                        <p className="text-[10px] text-zinc-400 mt-0.5">{formatDateTime(rec.cleanedAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
