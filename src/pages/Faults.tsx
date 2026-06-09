import { useState } from 'react'
import { useStoreContext } from '../store/context'
import { Plus, AlertTriangle, X, Check, Trash2, Link2, Filter } from 'lucide-react'
import type { FaultRecord } from '../types'

const SEVERITY_MAP = {
  low: { label: '轻微', color: 'bg-green-50 text-green-700 border-green-200' },
  medium: { label: '一般', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  high: { label: '严重', color: 'bg-red-50 text-red-700 border-red-200' },
}

const STATUS_MAP = {
  pending: { label: '待处理', color: 'bg-gray-100 text-gray-600' },
  processing: { label: '处理中', color: 'bg-blue-50 text-blue-600' },
  resolved: { label: '已解决', color: 'bg-green-50 text-green-600' },
}

const COMMON_FAULTS = ['异响', '胎压低', '刹车抖动', '启动困难', '油耗异常', '漏油', '空调不制冷', '仪表盘报警', '跑偏', '抖动', '异味', '其他']

export default function Faults() {
  const { vehicles, faultRecords, maintenanceRecords, addFaultRecord, updateFaultRecord, deleteFaultRecord, linkFaultToMaintenance } = useStoreContext()
  const [showForm, setShowForm] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [linkingFaultId, setLinkingFaultId] = useState<string | null>(null)
  const [form, setForm] = useState<Omit<FaultRecord, 'id'>>({
    vehicleId: '',
    date: new Date().toISOString().slice(0, 10),
    description: '',
    severity: 'medium',
    status: 'pending',
    linkedMaintenanceId: null,
    resolvedDate: null,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    addFaultRecord(form)
    setForm({
      vehicleId: form.vehicleId,
      date: new Date().toISOString().slice(0, 10),
      description: '',
      severity: 'medium',
      status: 'pending',
      linkedMaintenanceId: null,
      resolvedDate: null,
    })
    setShowForm(false)
  }

  const filtered = filterStatus === 'all'
    ? faultRecords
    : faultRecords.filter(f => f.status === filterStatus)

  const sorted = [...filtered].sort((a, b) => b.date.localeCompare(a.date))

  const getVehiclePlate = (id: string) => vehicles.find(v => v.id === id)?.plateNumber ?? '未知'
  const getVehicleMileage = (id: string) => vehicles.find(v => v.id === id)?.currentMileage ?? 0

  const vehicleMaintenanceRecords = (vehicleId: string) =>
    maintenanceRecords.filter(r => r.vehicleId === vehicleId)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">故障记录</h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          记录故障
        </button>
      </div>

      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
        <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
        {(['all', 'pending', 'processing', 'resolved'] as const).map(s => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              filterStatus === s ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {s === 'all' ? '全部' : STATUS_MAP[s].label}
          </button>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold">记录故障</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">车辆 *</label>
                <select required value={form.vehicleId} onChange={e => setForm(f => ({ ...f, vehicleId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
                  <option value="">选择车辆</option>
                  {vehicles.map(v => <option key={v.id} value={v.id}>{v.plateNumber} - {v.model}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">故障日期 *</label>
                <input type="date" required value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">故障描述</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {COMMON_FAULTS.map(f => {
                    const selected = form.description.includes(f)
                    return (
                      <button key={f} type="button"
                        onClick={() => {
                          if (selected) {
                            setForm(prev => ({ ...prev, description: prev.description.replace(f, '').replace(/,\s*,/, ',').replace(/^,\s*|,\s*$/g, '') }))
                          } else {
                            setForm(prev => ({ ...prev, description: prev.description ? `${prev.description}, ${f}` : f }))
                          }
                        }}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                          selected ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {f}
                      </button>
                    )
                  })}
                </div>
                <textarea required value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                  rows={2} placeholder="详细描述故障现象" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">严重程度</label>
                <div className="flex gap-2">
                  {(['low', 'medium', 'high'] as const).map(s => (
                    <button key={s} type="button"
                      onClick={() => setForm(f => ({ ...f, severity: s }))}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                        form.severity === s ? SEVERITY_MAP[s].color : 'border-gray-200 text-gray-400 hover:bg-gray-50'
                      }`}
                    >
                      {SEVERITY_MAP[s].label}
                    </button>
                  ))}
                </div>
              </div>
              <button type="submit"
                className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-1.5">
                <Check className="w-4 h-4" />
                保存故障
              </button>
            </form>
          </div>
        </div>
      )}

      {linkingFaultId && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setLinkingFaultId(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold">关联维修单</h3>
              <button onClick={() => setLinkingFaultId(null)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            {(() => {
              const fault = faultRecords.find(f => f.id === linkingFaultId)
              if (!fault) return null
              const records = vehicleMaintenanceRecords(fault.vehicleId)
              if (records.length === 0) {
                return <p className="text-gray-400 text-sm text-center py-6">该车辆暂无保养记录，请先添加保养记录</p>
              }
              return (
                <div className="space-y-2">
                  {records.map(r => (
                    <button
                      key={r.id}
                      onClick={() => { linkFaultToMaintenance(linkingFaultId, r.id); setLinkingFaultId(null) }}
                      className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{r.date}</span>
                        <span className="text-sm font-semibold text-gray-900">¥{r.cost.toFixed(2)}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{r.items}</p>
                    </button>
                  ))}
                </div>
              )
            })()}
          </div>
        </div>
      )}

      {sorted.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <AlertTriangle className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg">暂无故障记录</p>
          <p className="text-sm mt-1">点击上方按钮记录车辆故障</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map(f => {
            const sev = SEVERITY_MAP[f.severity]
            const stat = STATUS_MAP[f.status]
            const linkedRecord = f.linkedMaintenanceId ? maintenanceRecords.find(r => r.id === f.linkedMaintenanceId) : null
            return (
              <div key={f.id} className={`bg-white rounded-xl border p-4 ${f.status === 'resolved' ? 'border-gray-100 opacity-70' : 'border-gray-200'}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-medium px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full">{getVehiclePlate(f.vehicleId)}</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${sev.color}`}>{sev.label}</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${stat.color}`}>{stat.label}</span>
                    <span className="text-sm text-gray-500">{f.date}</span>
                  </div>
                  <div className="flex gap-1">
                    {f.status !== 'resolved' && (
                      <button onClick={() => setLinkingFaultId(f.id)}
                        className="p-1.5 text-gray-300 hover:text-blue-500 transition-colors" title="关联维修单">
                        <Link2 className="w-4 h-4" />
                      </button>
                    )}
                    {f.status === 'pending' && (
                      <button onClick={() => updateFaultRecord(f.id, { status: 'processing' })}
                        className="p-1.5 text-gray-300 hover:text-amber-500 transition-colors" title="标记处理中">
                        <AlertTriangle className="w-4 h-4" />
                      </button>
                    )}
                    <button onClick={() => { if (confirm('确认删除该故障记录？')) deleteFaultRecord(f.id) }}
                      className="p-1.5 text-gray-300 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-800">{f.description}</p>
                {linkedRecord && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-green-600 bg-green-50 px-3 py-1.5 rounded-lg">
                    <Link2 className="w-3 h-3" />
                    <span>已关联维修：{linkedRecord.date} | {linkedRecord.items} | ¥{linkedRecord.cost.toFixed(2)}</span>
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
