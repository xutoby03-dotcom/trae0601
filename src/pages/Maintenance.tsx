import { useState } from 'react'
import { useStoreContext } from '../store/context'
import { Plus, Wrench, X, Check, Trash2, Filter } from 'lucide-react'
import type { MaintenanceRecord } from '../types'

const MAINTENANCE_ITEMS = ['机油更换', '机油滤清器', '空气滤清器', '空调滤清器', '轮胎更换', '轮胎换位', '刹车片更换', '刹车油更换', '冷却液更换', '变速箱油', '火花塞更换', '电瓶更换', '雨刮片', '正时皮带', '年检', '保险续保', '其他']

export default function Maintenance() {
  const { vehicles, maintenanceRecords, addMaintenanceRecord, deleteMaintenanceRecord } = useStoreContext()
  const [showForm, setShowForm] = useState(false)
  const [filterVehicle, setFilterVehicle] = useState<string>('all')
  const [form, setForm] = useState<Omit<MaintenanceRecord, 'id'>>({
    vehicleId: '',
    date: new Date().toISOString().slice(0, 10),
    items: '',
    mileage: 0,
    cost: 0,
    partsBrand: '',
    nextSuggestedMileage: 0,
    notes: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    addMaintenanceRecord(form)
    setForm({
      vehicleId: form.vehicleId,
      date: new Date().toISOString().slice(0, 10),
      items: '',
      mileage: form.mileage,
      cost: 0,
      partsBrand: '',
      nextSuggestedMileage: 0,
      notes: '',
    })
    setShowForm(false)
  }

  const filtered = filterVehicle === 'all'
    ? maintenanceRecords
    : maintenanceRecords.filter(r => r.vehicleId === filterVehicle)

  const sorted = [...filtered].sort((a, b) => b.date.localeCompare(a.date))

  const getVehiclePlate = (id: string) => vehicles.find(v => v.id === id)?.plateNumber ?? '未知'

  const formatItems = (items: string) => {
    const arr = items.split(',').map(s => s.trim()).filter(Boolean)
    return arr
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">保养记录</h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          添加记录
        </button>
      </div>

      {vehicles.length > 0 && (
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
          <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <button
            onClick={() => setFilterVehicle('all')}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              filterVehicle === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            全部
          </button>
          {vehicles.map(v => (
            <button
              key={v.id}
              onClick={() => setFilterVehicle(v.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                filterVehicle === v.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {v.plateNumber}
            </button>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold">添加保养记录</h3>
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">保养日期 *</label>
                  <input type="date" required value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">当前里程(km) *</label>
                  <input type="number" required min="0" value={form.mileage || ''} onChange={e => setForm(f => ({ ...f, mileage: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">保养项目</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {MAINTENANCE_ITEMS.map(item => {
                    const selected = formatItems(form.items).includes(item)
                    return (
                      <button key={item} type="button"
                        onClick={() => {
                          const current = formatItems(form.items)
                          const next = selected ? current.filter(i => i !== item) : [...current, item]
                          setForm(f => ({ ...f, items: next.join(', ') }))
                        }}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                          selected ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {item}
                      </button>
                    )
                  })}
                </div>
                <input value={form.items} onChange={e => setForm(f => ({ ...f, items: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="也可手动输入，逗号分隔" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">费用(元) *</label>
                  <input type="number" required min="0" step="0.01" value={form.cost || ''} onChange={e => setForm(f => ({ ...f, cost: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">配件品牌</label>
                  <input value={form.partsBrand} onChange={e => setForm(f => ({ ...f, partsBrand: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="如：美孚1号 5W-30" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">下次建议里程(km)</label>
                <input type="number" min="0" value={form.nextSuggestedMileage || ''} onChange={e => setForm(f => ({ ...f, nextSuggestedMileage: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="如：65000" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">备注</label>
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                  rows={2} placeholder="其他备注信息" />
              </div>
              <button type="submit"
                className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-1.5">
                <Check className="w-4 h-4" />
                保存记录
              </button>
            </form>
          </div>
        </div>
      )}

      {sorted.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Wrench className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg">暂无保养记录</p>
          <p className="text-sm mt-1">点击上方按钮添加保养记录</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map(r => {
            const vehicle = vehicles.find(v => v.id === r.vehicleId)
            const kmLeft = r.nextSuggestedMileage > 0 && vehicle
              ? r.nextSuggestedMileage - vehicle.currentMileage
              : null
            return (
              <div key={r.id} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full">{getVehiclePlate(r.vehicleId)}</span>
                      <span className="text-sm text-gray-500">{r.date}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {formatItems(r.items).map((item, i) => (
                        <span key={i} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">{item}</span>
                      ))}
                    </div>
                  </div>
                  <button onClick={() => { if (confirm('确认删除该记录？')) deleteMaintenanceRecord(r.id) }}
                    className="p-1.5 text-gray-300 hover:text-red-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-600">
                  <span>里程：{r.mileage.toLocaleString()} km</span>
                  <span className="font-semibold text-gray-900">¥{r.cost.toFixed(2)}</span>
                  {r.partsBrand && <span>配件：{r.partsBrand}</span>}
                  {kmLeft !== null && (
                    <span className={kmLeft <= 500 ? 'text-amber-600 font-medium' : 'text-green-600'}>
                      {kmLeft > 0 ? `距下次保养 ${kmLeft.toLocaleString()} km` : `已超出 ${(-kmLeft).toLocaleString()} km`}
                    </span>
                  )}
                </div>
                {r.notes && <p className="mt-2 text-xs text-gray-400">{r.notes}</p>}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
