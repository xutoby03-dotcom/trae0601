import { useState } from 'react'
import { Plus, Pencil, Trash2, Fuel, MapPin, User, CreditCard } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useStore } from '@/store'
import Modal from '@/components/Modal'
import { VehicleStatusBadge } from '@/components/StatusBadges'
import FuelBar from '@/components/FuelBar'
import type { Vehicle, VehicleStatus } from '@/types'

interface VehicleForm {
  plateNumber: string
  model: string
  fuelCard: string
  parkingSpot: string
  custodian: string
  photo: string
  currentFuel: number
  currentMileage: number
  status: VehicleStatus
}

const emptyForm: VehicleForm = {
  plateNumber: '',
  model: '',
  fuelCard: '',
  parkingSpot: '',
  custodian: '',
  photo: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20white%20sedan%20car%20studio%20photography%20front%20view%20clean%20background&image_size=landscape_4_3',
  currentFuel: 80,
  currentMileage: 0,
  status: 'available',
}

export default function VehicleList() {
  const vehicles = useStore((s) => s.vehicles)
  const addVehicle = useStore((s) => s.addVehicle)
  const updateVehicle = useStore((s) => s.updateVehicle)
  const deleteVehicle = useStore((s) => s.deleteVehicle)

  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<VehicleForm>(emptyForm)
  const [errors, setErrors] = useState<Partial<Record<keyof VehicleForm, string>>>({})

  function openCreate() {
    setEditingId(null)
    setForm(emptyForm)
    setErrors({})
    setModalOpen(true)
  }

  function openEdit(v: Vehicle) {
    setEditingId(v.id)
    setForm({
      plateNumber: v.plateNumber,
      model: v.model,
      fuelCard: v.fuelCard,
      parkingSpot: v.parkingSpot,
      custodian: v.custodian,
      photo: v.photo,
      currentFuel: v.currentFuel,
      currentMileage: v.currentMileage,
      status: v.status,
    })
    setErrors({})
    setModalOpen(true)
  }

  function validate() {
    const e: Partial<Record<keyof VehicleForm, string>> = {}
    if (!form.plateNumber.trim()) e.plateNumber = '请输入车牌号'
    if (!form.model.trim()) e.model = '请输入车型'
    if (!form.parkingSpot.trim()) e.parkingSpot = '请输入停车位'
    if (!form.custodian.trim()) e.custodian = '请输入保管人'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSubmit() {
    if (!validate()) return
    if (editingId) {
      updateVehicle(editingId, form)
    } else {
      addVehicle(form)
    }
    setModalOpen(false)
  }

  function handleDelete(id: string) {
    if (confirm('确认删除该车辆档案？')) deleteVehicle(id)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">车辆档案</h1>
          <p className="text-sm text-slate-500 mt-1">
            管理公司公车基础信息，包括车牌、油卡、停车位及当前油量
          </p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus size={18} />
          新增车辆
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {vehicles.map((v) => (
          <div key={v.id} className="card !p-0 overflow-hidden group">
            <div className="relative h-48 overflow-hidden bg-slate-100">
              <img
                src={v.photo}
                alt={v.plateNumber}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute top-3 right-3">
                <VehicleStatusBadge status={v.status} />
              </div>
              <div className="absolute top-3 left-3">
                <div className="px-3 py-1.5 rounded-lg bg-white/90 backdrop-blur-sm border border-white/60 shadow-sm">
                  <div className="text-xs text-slate-500">车牌号</div>
                  <div className="font-semibold text-slate-900 font-mono tracking-wide">
                    {v.plateNumber}
                  </div>
                </div>
              </div>
              <div className="absolute bottom-3 left-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button
                  onClick={() => openEdit(v)}
                  className="flex-1 bg-white/95 backdrop-blur-sm text-slate-700 text-sm font-medium py-2 px-3 rounded-xl shadow-sm hover:bg-white flex items-center justify-center gap-1.5"
                >
                  <Pencil size={14} />
                  编辑
                </button>
                <button
                  onClick={() => handleDelete(v.id)}
                  className="bg-white/95 backdrop-blur-sm text-red-600 text-sm font-medium py-2 px-3 rounded-xl shadow-sm hover:bg-red-50 flex items-center justify-center gap-1.5"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <div className="font-semibold text-slate-900 text-lg">{v.model}</div>
              </div>
              <div className="space-y-2.5">
                <InfoRow icon={CreditCard} label="油卡号" value={v.fuelCard} />
                <InfoRow icon={MapPin} label="停车位" value={v.parkingSpot} />
                <InfoRow icon={User} label="保管人" value={v.custodian} />
                <div className="flex items-start gap-2.5">
                  <Fuel size={15} className="mt-0.5 text-slate-400 shrink-0" />
                  <div className="flex-1">
                    <FuelBar value={v.currentFuel} />
                  </div>
                </div>
                <div className="flex items-center gap-2.5 pt-2 border-t border-slate-100">
                  <div className="flex-1">
                    <div className="text-xs text-slate-500">当前里程</div>
                    <div className="font-mono font-semibold text-slate-800">
                      {v.currentMileage.toLocaleString()} km
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        {vehicles.length === 0 && (
          <div className="md:col-span-2 xl:col-span-3 card text-center py-16 text-slate-400">
            暂无车辆档案，点击右上角"新增车辆"开始录入
          </div>
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? '编辑车辆档案' : '新增车辆档案'}
        width="max-w-3xl"
        footer={
          <div className="flex items-center justify-end gap-2">
            <button onClick={() => setModalOpen(false)} className="btn-secondary">
              取消
            </button>
            <button onClick={handleSubmit} className="btn-primary">
              {editingId ? '保存修改' : '创建档案'}
            </button>
          </div>
        }
      >
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="车牌号 *" error={errors.plateNumber}>
              <input
                className="form-input"
                placeholder="如：京A·88888"
                value={form.plateNumber}
                onChange={(e) => setForm({ ...form, plateNumber: e.target.value })}
              />
            </Field>
            <Field label="车型 *" error={errors.model}>
              <input
                className="form-input"
                placeholder="如：丰田 凯美瑞 2024款"
                value={form.model}
                onChange={(e) => setForm({ ...form, model: e.target.value })}
              />
            </Field>
            <Field label="油卡号" error={errors.fuelCard}>
              <input
                className="form-input"
                placeholder="如：FC-2024-001"
                value={form.fuelCard}
                onChange={(e) => setForm({ ...form, fuelCard: e.target.value })}
              />
            </Field>
            <Field label="停车位 *" error={errors.parkingSpot}>
              <input
                className="form-input"
                placeholder="如：地下车库 B1-01"
                value={form.parkingSpot}
                onChange={(e) => setForm({ ...form, parkingSpot: e.target.value })}
              />
            </Field>
            <Field label="保管人 *" error={errors.custodian}>
              <input
                className="form-input"
                placeholder="如：张经理（行政部）"
                value={form.custodian}
                onChange={(e) => setForm({ ...form, custodian: e.target.value })}
              />
            </Field>
            <Field label="车辆状态" error={errors.status}>
              <select
                className="form-input"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as VehicleStatus })}
              >
                <option value="available">可用</option>
                <option value="maintenance">维修中</option>
                <option value="disabled">停用</option>
              </select>
            </Field>
            <Field label="当前里程 (km)">
              <input
                type="number"
                className="form-input"
                value={form.currentMileage}
                onChange={(e) =>
                  setForm({ ...form, currentMileage: Number(e.target.value) || 0 })
                }
              />
            </Field>
            <Field label={`初始油量：${form.currentFuel}%`}>
              <input
                type="range"
                min={0}
                max={100}
                value={form.currentFuel}
                onChange={(e) =>
                  setForm({ ...form, currentFuel: Number(e.target.value) })
                }
                className="w-full accent-primary-600"
              />
              <FuelBar value={form.currentFuel} showLabel={false} />
            </Field>
            <div className="md:col-span-2">
              <Field label="车辆照片 URL">
                <input
                  className="form-input"
                  value={form.photo}
                  onChange={(e) => setForm({ ...form, photo: e.target.value })}
                />
              </Field>
            </div>
            <div className="md:col-span-2">
              <div className="rounded-2xl overflow-hidden border border-slate-200 h-48 bg-slate-50">
                <img
                  src={form.photo}
                  alt="车辆预览"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}

function InfoRow({
  icon: Icon, label, value,
}: {
  icon: LucideIcon
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon size={15} className="mt-0.5 text-slate-400 shrink-0" />
      <div className="min-w-0">
        <div className="text-xs text-slate-500">{label}</div>
        <div className="text-sm font-medium text-slate-800 truncate">{value || '-'}</div>
      </div>
    </div>
  )
}

function Field({
  label, error, children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      {children}
      {error && <div className="text-xs text-red-500 mt-1">{error}</div>}
    </div>
  )
}
