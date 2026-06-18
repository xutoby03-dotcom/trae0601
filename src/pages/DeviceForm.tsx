import { useStore } from '@/store/useStore'
import { useNavigate, useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import type { ArmrestType, FootPadStatus } from '@/types'

export default function DeviceForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { devices, addDevice, updateDevice } = useStore()
  const isEdit = Boolean(id)

  const [code, setCode] = useState('')
  const [weightCapacity, setWeightCapacity] = useState(120)
  const [armrestType, setArmrestType] = useState<ArmrestType>('fixed')
  const [footPadStatus, setFootPadStatus] = useState<FootPadStatus>('good')
  const [purchaseDate, setPurchaseDate] = useState('')
  const [photo, setPhoto] = useState('')

  useEffect(() => {
    if (isEdit && id) {
      const device = devices.find((d) => d.id === id)
      if (device) {
        setCode(device.code)
        setWeightCapacity(device.weightCapacity)
        setArmrestType(device.armrestType)
        setFootPadStatus(device.footPadStatus)
        setPurchaseDate(device.purchaseDate)
        setPhoto(device.photo)
      }
    }
  }, [isEdit, id, devices])

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => {
      setPhoto(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim()) return

    if (isEdit && id) {
      updateDevice(id, {
        code: code.trim(),
        weightCapacity,
        armrestType,
        footPadStatus,
        purchaseDate,
        photo,
      })
    } else {
      addDevice({
        code: code.trim(),
        weightCapacity,
        armrestType,
        footPadStatus,
        purchaseDate,
        photo,
        status: 'available',
      })
    }
    navigate('/devices')
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn">
      <div>
        <h2 className="text-2xl font-bold text-zinc-800 font-display">
          {isEdit ? '编辑设备' : '新增设备'}
        </h2>
        <p className="text-sm text-zinc-400 mt-1">
          {isEdit ? '修改助浴椅设备信息' : '录入新的助浴椅设备'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-zinc-100 shadow-sm p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1.5">设备编号 *</label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="如 ZY-004"
            required
            className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1.5">承重能力 (kg)</label>
          <input
            type="number"
            value={weightCapacity}
            onChange={(e) => setWeightCapacity(Number(e.target.value))}
            min={50}
            max={300}
            className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1.5">扶手类型</label>
          <div className="flex gap-3">
            {([
              { value: 'fixed', label: '固定扶手' },
              { value: 'removable', label: '可拆卸扶手' },
              { value: 'none', label: '无扶手' },
            ] as const).map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setArmrestType(opt.value)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                  armrestType === opt.value
                    ? 'bg-teal-50 border-teal-400 text-teal-700'
                    : 'bg-white border-zinc-200 text-zinc-500 hover:bg-zinc-50'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1.5">防滑脚垫状态</label>
          <div className="flex gap-3">
            {([
              { value: 'good', label: '完好', activeClass: 'bg-teal-50 border-teal-400 text-teal-700' },
              { value: 'worn', label: '磨损', activeClass: 'bg-amber-50 border-amber-400 text-amber-700' },
              { value: 'cracked', label: '开裂', activeClass: 'bg-red-50 border-red-400 text-red-700' },
            ] as const).map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setFootPadStatus(opt.value)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                  footPadStatus === opt.value
                    ? opt.activeClass
                    : 'bg-white border-zinc-200 text-zinc-500 hover:bg-zinc-50'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1.5">购入日期</label>
          <input
            type="date"
            value={purchaseDate}
            onChange={(e) => setPurchaseDate(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1.5">设备照片</label>
          <div className="flex items-start gap-4">
            {photo && (
              <div className="w-24 h-24 rounded-lg overflow-hidden bg-zinc-100 shrink-0">
                <img src={photo} alt="设备照片" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="flex-1">
              <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-dashed border-zinc-300 text-sm text-zinc-500 hover:bg-zinc-50 hover:border-zinc-400 transition-colors cursor-pointer">
                📷 上传照片
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
              <p className="text-[11px] text-zinc-400 mt-1.5">支持 JPG、PNG 格式</p>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="flex-1 py-2.5 rounded-lg bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 transition-colors shadow-sm"
          >
            {isEdit ? '保存修改' : '添加设备'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/devices')}
            className="px-6 py-2.5 rounded-lg border border-zinc-200 text-sm font-medium text-zinc-600 hover:bg-zinc-50 transition-colors"
          >
            取消
          </button>
        </div>
      </form>
    </div>
  )
}
