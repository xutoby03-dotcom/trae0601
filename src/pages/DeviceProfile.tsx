import { useState, useRef } from 'react'
import { useStore } from '@/store/useStore'
import type { VentType } from '@/types'
import {
  Server,
  Plus,
  Pencil,
  Trash2,
  MapPin,
  Wind,
  Calendar,
  Weight,
  ImagePlus,
  X,
  Check,
} from 'lucide-react'

const VENT_TYPES: VentType[] = ['排风管外排', '冷凝式', '热泵式']

interface DeviceForm {
  model: string
  capacity: number
  location: string
  ventType: VentType
  purchaseDate: string
  photoUrl: string
}

const emptyForm: DeviceForm = {
  model: '',
  capacity: 8,
  location: '',
  ventType: '排风管外排',
  purchaseDate: '',
  photoUrl: '',
}

export default function DeviceProfile() {
  const devices = useStore((s) => s.devices)
  const addDevice = useStore((s) => s.addDevice)
  const updateDevice = useStore((s) => s.updateDevice)
  const deleteDevice = useStore((s) => s.deleteDevice)

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<DeviceForm>(emptyForm)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleOpenForm = (device?: (typeof devices)[0]) => {
    if (device) {
      setEditingId(device.id)
      setForm({
        model: device.model,
        capacity: device.capacity,
        location: device.location,
        ventType: device.ventType,
        purchaseDate: device.purchaseDate,
        photoUrl: device.photoUrl,
      })
    } else {
      setEditingId(null)
      setForm(emptyForm)
    }
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingId(null)
    setForm(emptyForm)
  }

  const handleSave = () => {
    if (!form.model.trim()) return
    if (editingId) {
      updateDevice(editingId, form)
    } else {
      addDevice(form)
    }
    handleCloseForm()
  }

  const handleDelete = (id: string) => {
    deleteDevice(id)
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => {
      setForm((prev) => ({ ...prev, photoUrl: reader.result as string }))
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <header className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Server className="w-6 h-6 text-brand-400" />
            <h2 className="font-display text-xl tracking-wider text-brand-400">
              DEVICE PROFILE
            </h2>
          </div>
          <p className="text-surface-300 text-sm font-body">烘干机设备档案管理</p>
        </div>
        <button
          onClick={() => handleOpenForm()}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-sm transition-all duration-200 hover:-translate-y-0.5 font-body"
        >
          <Plus className="w-4 h-4" />
          添加设备
        </button>
      </header>

      {showForm && (
        <div className="mb-6 bg-surface-700/50 rounded-xl border border-brand-500/30 p-6 animate-slide-up">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-medium text-white font-body">
              {editingId ? '编辑设备' : '添加新设备'}
            </h3>
            <button
              onClick={handleCloseForm}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-600/50 text-surface-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-surface-300 mb-1.5 font-body">
                设备型号 *
              </label>
              <input
                type="text"
                value={form.model}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, model: e.target.value }))
                }
                placeholder="例: 西门子 WT47W5600W"
                className="w-full px-3 py-2.5 bg-surface-800 border border-surface-500/30 rounded-lg text-sm text-white placeholder-surface-400 focus:outline-none focus:border-brand-500/50 transition-colors font-body"
              />
            </div>

            <div>
              <label className="block text-xs text-surface-300 mb-1.5 font-body">
                容量 (kg)
              </label>
              <div className="relative">
                <Weight className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                <input
                  type="number"
                  value={form.capacity}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      capacity: Number(e.target.value),
                    }))
                  }
                  min={1}
                  max={20}
                  className="w-full pl-10 pr-3 py-2.5 bg-surface-800 border border-surface-500/30 rounded-lg text-sm text-white placeholder-surface-400 focus:outline-none focus:border-brand-500/50 transition-colors font-body"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-surface-300 mb-1.5 font-body">
                安装位置
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, location: e.target.value }))
                  }
                  placeholder="例: 阳台"
                  className="w-full pl-10 pr-3 py-2.5 bg-surface-800 border border-surface-500/30 rounded-lg text-sm text-white placeholder-surface-400 focus:outline-none focus:border-brand-500/50 transition-colors font-body"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-surface-300 mb-1.5 font-body">
                排风方式
              </label>
              <div className="relative">
                <Wind className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                <select
                  value={form.ventType}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      ventType: e.target.value as VentType,
                    }))
                  }
                  className="w-full pl-10 pr-3 py-2.5 bg-surface-800 border border-surface-500/30 rounded-lg text-sm text-white focus:outline-none focus:border-brand-500/50 transition-colors appearance-none font-body"
                >
                  {VENT_TYPES.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs text-surface-300 mb-1.5 font-body">
                购买日期
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                <input
                  type="date"
                  value={form.purchaseDate}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      purchaseDate: e.target.value,
                    }))
                  }
                  className="w-full pl-10 pr-3 py-2.5 bg-surface-800 border border-surface-500/30 rounded-lg text-sm text-white focus:outline-none focus:border-brand-500/50 transition-colors font-body"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-surface-300 mb-1.5 font-body">
                设备照片
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
              {form.photoUrl ? (
                <div className="relative w-full h-20 rounded-lg overflow-hidden border border-surface-500/30">
                  <img
                    src={form.photoUrl}
                    alt="设备照片"
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() =>
                      setForm((prev) => ({ ...prev, photoUrl: '' }))
                    }
                    className="absolute top-1 right-1 w-6 h-6 bg-surface-900/80 rounded-full flex items-center justify-center text-white hover:bg-danger-500 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-20 border-2 border-dashed border-surface-500/30 rounded-lg flex items-center justify-center gap-2 text-surface-400 hover:border-brand-500/30 hover:text-brand-400 transition-colors"
                >
                  <ImagePlus className="w-5 h-5" />
                  <span className="text-xs font-body">上传照片</span>
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 mt-5 pt-4 border-t border-surface-500/30">
            <button
              onClick={handleSave}
              disabled={!form.model.trim()}
              className="flex items-center gap-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-600 disabled:bg-surface-600 disabled:text-surface-400 text-white rounded-lg text-sm transition-all duration-200 font-body"
            >
              <Check className="w-4 h-4" />
              {editingId ? '保存修改' : '添加设备'}
            </button>
            <button
              onClick={handleCloseForm}
              className="px-5 py-2.5 text-surface-300 hover:text-white rounded-lg text-sm transition-colors font-body"
            >
              取消
            </button>
          </div>
        </div>
      )}

      {devices.length === 0 && !showForm ? (
        <div className="bg-surface-700/50 rounded-xl border border-surface-500/30 p-12 text-center">
          <Server className="w-16 h-16 text-surface-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2 font-body">
            暂无设备
          </h3>
          <p className="text-surface-400 text-sm font-body">
            点击上方"添加设备"按钮开始录入烘干机信息
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {devices.map((device) => (
            <div
              key={device.id}
              className="bg-surface-700/50 rounded-xl border border-surface-500/30 overflow-hidden hover:border-brand-500/30 transition-colors animate-fade-in"
            >
              {device.photoUrl && (
                <div className="w-full h-40 overflow-hidden">
                  <img
                    src={device.photoUrl}
                    alt={device.model}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-base font-medium text-white font-body">
                    {device.model}
                  </h3>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenForm(device)}
                      className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-surface-600/50 text-surface-400 hover:text-brand-400 transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(device.id)}
                      className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-danger-500/10 text-surface-400 hover:text-danger-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-surface-300 font-body">
                    <Weight className="w-3.5 h-3.5 text-surface-400" />
                    <span>容量：{device.capacity}kg</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-surface-300 font-body">
                    <MapPin className="w-3.5 h-3.5 text-surface-400" />
                    <span>位置：{device.location || '未设置'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-surface-300 font-body">
                    <Wind className="w-3.5 h-3.5 text-surface-400" />
                    <span>排风：{device.ventType}</span>
                  </div>
                  {device.purchaseDate && (
                    <div className="flex items-center gap-2 text-xs text-surface-300 font-body">
                      <Calendar className="w-3.5 h-3.5 text-surface-400" />
                      <span>购买：{device.purchaseDate}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
