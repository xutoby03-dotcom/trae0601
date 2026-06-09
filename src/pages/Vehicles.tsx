import { useState } from 'react'
import { useStoreContext } from '../store/context'
import { Plus, Car, Edit3, Trash2, X, Check } from 'lucide-react'
import type { Vehicle } from '../types'

const emptyForm: Omit<Vehicle, 'id'> = {
  plateNumber: '',
  model: '',
  purchaseDate: '',
  currentMileage: 0,
  insuranceExpiry: '',
  inspectionExpiry: '',
  preferredShop: '',
}

export default function Vehicles() {
  const { vehicles, addVehicle, updateVehicle, deleteVehicle } = useStoreContext()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<Omit<Vehicle, 'id'>>(emptyForm)

  const resetForm = () => {
    setForm(emptyForm)
    setShowForm(false)
    setEditingId(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingId) {
      updateVehicle(editingId, form)
    } else {
      addVehicle(form)
    }
    resetForm()
  }

  const startEdit = (v: Vehicle) => {
    setForm({
      plateNumber: v.plateNumber,
      model: v.model,
      purchaseDate: v.purchaseDate,
      currentMileage: v.currentMileage,
      insuranceExpiry: v.insuranceExpiry,
      inspectionExpiry: v.inspectionExpiry,
      preferredShop: v.preferredShop,
    })
    setEditingId(v.id)
    setShowForm(true)
  }

  const daysUntil = (dateStr: string) => {
    if (!dateStr) return null
    const diff = Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    return diff
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">我的车辆</h2>
        <button
          onClick={() => { resetForm(); setShowForm(true) }}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          添加车辆
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center p-4" onClick={resetForm}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold">{editingId ? '编辑车辆' : '添加车辆'}</h3>
              <button onClick={resetForm} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">车牌号 *</label>
                <input required value={form.plateNumber} onChange={e => setForm(f => ({ ...f, plateNumber: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="如：京A12345" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">车型 *</label>
                <input required value={form.model} onChange={e => setForm(f => ({ ...f, model: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="如：丰田凯美瑞 2022款" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">购买日期</label>
                  <input type="date" value={form.purchaseDate} onChange={e => setForm(f => ({ ...f, purchaseDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">当前里程(km)</label>
                  <input type="number" min="0" value={form.currentMileage || ''} onChange={e => setForm(f => ({ ...f, currentMileage: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">保险到期日</label>
                  <input type="date" value={form.insuranceExpiry} onChange={e => setForm(f => ({ ...f, insuranceExpiry: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">年检到期日</label>
                  <input type="date" value={form.inspectionExpiry} onChange={e => setForm(f => ({ ...f, inspectionExpiry: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">常去维修店</label>
                <input value={form.preferredShop} onChange={e => setForm(f => ({ ...f, preferredShop: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="如：小张汽修 朝阳区店" />
              </div>
              <button type="submit"
                className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-1.5">
                <Check className="w-4 h-4" />
                {editingId ? '保存修改' : '添加车辆'}
              </button>
            </form>
          </div>
        </div>
      )}

      {vehicles.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Car className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg">还没有添加车辆</p>
          <p className="text-sm mt-1">点击上方按钮添加你的第一辆车</p>
        </div>
      ) : (
        <div className="space-y-4">
          {vehicles.map(v => {
            const insDays = daysUntil(v.insuranceExpiry)
            const inspDays = daysUntil(v.inspectionExpiry)
            return (
              <div key={v.id} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                      <Car className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{v.plateNumber}</h3>
                      <p className="text-sm text-gray-500">{v.model}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => startEdit(v)} className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button onClick={() => { if (confirm('确认删除该车辆及其所有记录？')) deleteVehicle(v.id) }}
                      className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">当前里程</p>
                    <p className="text-sm font-semibold">{v.currentMileage.toLocaleString()} km</p>
                  </div>
                  <div className={`rounded-lg p-3 ${insDays !== null && insDays <= 30 ? 'bg-amber-50' : 'bg-gray-50'}`}>
                    <p className="text-xs text-gray-500 mb-1">保险到期</p>
                    <p className={`text-sm font-semibold ${insDays !== null && insDays <= 30 ? 'text-amber-600' : ''}`}>
                      {v.insuranceExpiry || '未设置'}
                      {insDays !== null && <span className="text-xs ml-1">({insDays > 0 ? `剩${insDays}天` : `逾期${-insDays}天`})</span>}
                    </p>
                  </div>
                  <div className={`rounded-lg p-3 ${inspDays !== null && inspDays <= 30 ? 'bg-amber-50' : 'bg-gray-50'}`}>
                    <p className="text-xs text-gray-500 mb-1">年检到期</p>
                    <p className={`text-sm font-semibold ${inspDays !== null && inspDays <= 30 ? 'text-amber-600' : ''}`}>
                      {v.inspectionExpiry || '未设置'}
                      {inspDays !== null && <span className="text-xs ml-1">({inspDays > 0 ? `剩${inspDays}天` : `逾期${-inspDays}天`})</span>}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">常去维修店</p>
                    <p className="text-sm font-semibold truncate">{v.preferredShop || '未设置'}</p>
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
