import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '@/store/useStore'
import { getLevelLabel, getLevelColor } from '@/utils/degradation'
import { Plus, Pencil, Trash2, X, Battery, Bike } from 'lucide-react'
import type { Vehicle } from '@/store/types'

type VehicleForm = Omit<Vehicle, 'id' | 'degradationLevel' | 'lastCheckupDate'>

const emptyForm: VehicleForm = {
  userId: '',
  brand: '',
  batteryModel: '',
  purchaseDate: '',
  nominalRange: 60,
  chargeHabit: 'daily',
  heatAnomaly: 'none',
  building: '',
}

const chargeLabels: Record<string, string> = { daily: '每天充', every2days: '隔天充', every3days: '三天一充' }
const heatLabels: Record<string, string> = { none: '无', occasional: '偶尔', yes: '有' }

export default function Vehicles() {
  const { currentUser, vehicles, addVehicle, updateVehicle, deleteVehicle } = useStore()
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<VehicleForm>(emptyForm)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const filtered = currentUser
    ? currentUser.role === 'admin'
      ? vehicles
      : vehicles.filter((v) => v.userId === currentUser.id)
    : []

  const openAdd = () => {
    setEditingId(null)
    setForm({ ...emptyForm, userId: currentUser?.id ?? '', building: currentUser?.building ?? '' })
    setShowModal(true)
  }

  const openEdit = (v: Vehicle) => {
    setEditingId(v.id)
    setForm({
      userId: v.userId,
      brand: v.brand,
      batteryModel: v.batteryModel,
      purchaseDate: v.purchaseDate,
      nominalRange: v.nominalRange,
      chargeHabit: v.chargeHabit,
      heatAnomaly: v.heatAnomaly,
      building: v.building,
    })
    setShowModal(true)
  }

  const handleSubmit = () => {
    if (!form.brand || !form.batteryModel || !form.building) return
    if (editingId) {
      updateVehicle(editingId, form)
    } else {
      addVehicle(form)
    }
    setShowModal(false)
  }

  const colorMap: Record<string, string> = {
    emerald: 'bg-emerald-500/20 text-emerald-400',
    amber: 'bg-amber-500/20 text-amber-400',
    orange: 'bg-orange-500/20 text-orange-400',
    red: 'bg-red-500/20 text-red-400',
    rose: 'bg-rose-500/20 text-rose-400',
  }

  return (
    <div className="min-h-screen bg-zinc-950 p-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="flex items-center gap-2 text-2xl font-bold text-white">
            <Bike className="h-7 w-7 text-emerald-500" />车辆管理
          </h1>
          <button onClick={openAdd} className="flex items-center gap-1 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">
            <Plus className="h-4 w-4" />添加车辆
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((v) => {
            const color = getLevelColor(v.degradationLevel)
            return (
              <div key={v.id} className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
                <div className="mb-2 flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{v.brand}</h3>
                    <p className="text-sm text-zinc-400">{v.batteryModel}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${colorMap[color]}`}>
                    {getLevelLabel(v.degradationLevel)}
                  </span>
                </div>
                <div className="mb-3 grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-zinc-300">
                  <span>楼栋：{v.building}</span>
                  <span>续航：{v.nominalRange}km</span>
                  <span>充电：{chargeLabels[v.chargeHabit]}</span>
                  <span>发热：{heatLabels[v.heatAnomaly]}</span>
                </div>
                <div className="flex items-center justify-between border-t border-zinc-800 pt-3">
                  <Link to={`/checkup/${v.id}`} className="flex items-center gap-1 text-sm text-emerald-400 hover:text-emerald-300">
                    <Battery className="h-4 w-4" />电池体检
                  </Link>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(v)} className="rounded p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => setDeleteId(v.id)} className="rounded p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-red-400">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {filtered.length === 0 && (
          <p className="mt-12 text-center text-zinc-500">暂无车辆记录</p>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setShowModal(false)}>
          <div className="w-full max-w-md rounded-xl bg-zinc-900 p-6" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">{editingId ? '编辑车辆' : '添加车辆'}</h2>
              <button onClick={() => setShowModal(false)} className="text-zinc-400 hover:text-white"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm text-zinc-300">品牌型号</label>
                <input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-white outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="mb-1 block text-sm text-zinc-300">电池型号</label>
                <input value={form.batteryModel} onChange={(e) => setForm({ ...form, batteryModel: e.target.value })} className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-white outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="mb-1 block text-sm text-zinc-300">购买日期</label>
                <input type="date" value={form.purchaseDate} onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })} className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-white outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="mb-1 block text-sm text-zinc-300">标称续航km</label>
                <input type="number" value={form.nominalRange} onChange={(e) => setForm({ ...form, nominalRange: +e.target.value })} className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-white outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="mb-1 block text-sm text-zinc-300">充电习惯</label>
                <select value={form.chargeHabit} onChange={(e) => setForm({ ...form, chargeHabit: e.target.value as VehicleForm['chargeHabit'] })} className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-white outline-none focus:border-emerald-500">
                  <option value="daily">每天充</option>
                  <option value="every2days">隔天充</option>
                  <option value="every3days">三天一充</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm text-zinc-300">发热记录</label>
                <select value={form.heatAnomaly} onChange={(e) => setForm({ ...form, heatAnomaly: e.target.value as VehicleForm['heatAnomaly'] })} className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-white outline-none focus:border-emerald-500">
                  <option value="none">无</option>
                  <option value="occasional">偶尔</option>
                  <option value="yes">有</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm text-zinc-300">楼栋号</label>
                <input value={form.building} onChange={(e) => setForm({ ...form, building: e.target.value })} className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-white outline-none focus:border-emerald-500" />
              </div>
            </div>
            <button onClick={handleSubmit} className="mt-5 w-full rounded-lg bg-emerald-600 py-2.5 font-medium text-white hover:bg-emerald-700">
              {editingId ? '保存修改' : '添加车辆'}
            </button>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setDeleteId(null)}>
          <div className="w-full max-w-sm rounded-xl bg-zinc-900 p-6 text-center" onClick={(e) => e.stopPropagation()}>
            <p className="mb-4 text-white">确定删除该车辆？相关体检记录也将一并删除。</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 rounded-lg border border-zinc-700 py-2 text-zinc-300 hover:bg-zinc-800">取消</button>
              <button onClick={() => { deleteVehicle(deleteId); setDeleteId(null) }} className="flex-1 rounded-lg bg-red-600 py-2 text-white hover:bg-red-700">删除</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
