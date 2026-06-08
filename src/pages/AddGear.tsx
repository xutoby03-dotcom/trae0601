import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGearStore } from '@/store/gearStore'
import type { GearType, UsageUnit, UsageFrequency } from '@/types'
import { GEAR_TYPE_LABELS, GEAR_TYPE_ICONS, USAGE_UNIT_LABELS, FREQUENCY_LABELS } from '@/types'
import { maintenanceTemplates } from '@/utils/maintenanceTemplates'

const gearTypes: GearType[] = ['running_shoe', 'racket', 'bicycle', 'yoga_mat', 'other']
const usageUnits: UsageUnit[] = ['km', 'hours', 'times']
const frequencies: UsageFrequency[] = ['daily', 'weekly', 'biweekly', 'monthly']

export default function AddGear() {
  const navigate = useNavigate()
  const addGear = useGearStore((s) => s.addGear)
  const [name, setName] = useState('')
  const [type, setType] = useState<GearType>('running_shoe')
  const [purchaseDate, setPurchaseDate] = useState(
    new Date().toISOString().split('T')[0]
  )
  const [price, setPrice] = useState('')
  const [usageFrequency, setUsageFrequency] = useState<UsageFrequency>('weekly')
  const [maintenanceCycleDays, setMaintenanceCycleDays] = useState('')
  const [maxUsage, setMaxUsage] = useState('')
  const [maxUsageUnit, setMaxUsageUnit] = useState<UsageUnit>('km')
  const [photo, setPhoto] = useState('')

  const handleTypeSelect = (t: GearType) => {
    setType(t)
    const template = maintenanceTemplates.find((mt) => mt.gearType === t && mt.cycleDays > 0)
    const retireTemplate = maintenanceTemplates.find((mt) => mt.gearType === t && mt.cycleDays === 0)
    if (template) {
      setMaintenanceCycleDays(String(template.cycleDays))
      setMaxUsage(String(template.maxUsage))
      setMaxUsageUnit(template.maxUsageUnit)
    }
    if (retireTemplate && !template) {
      setMaxUsage(String(retireTemplate.maxUsage))
      setMaxUsageUnit(retireTemplate.maxUsageUnit)
    }
    if (t === 'running_shoe' || t === 'bicycle') setMaxUsageUnit('km')
    if (t === 'yoga_mat') setMaxUsageUnit('hours')
    if (t === 'racket') setMaxUsageUnit('times')
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      setPhoto(ev.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    addGear({
      id: crypto.randomUUID(),
      name: name.trim(),
      type,
      purchaseDate,
      price: parseFloat(price) || 0,
      usageFrequency,
      maintenanceCycleDays: parseInt(maintenanceCycleDays) || 30,
      maxUsage: parseFloat(maxUsage) || 500,
      maxUsageUnit,
      photo,
      lastMaintenanceDate: purchaseDate,
      createdAt: new Date().toISOString(),
    })
    navigate('/')
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-6 font-['Playfair_Display'] text-2xl font-bold text-[#F5F0EB]">
        添加装备
      </h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
          <h2 className="mb-4 text-xs font-medium uppercase tracking-wider text-white/40">
            装备类型
          </h2>
          <div className="grid grid-cols-5 gap-2">
            {gearTypes.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => handleTypeSelect(t)}
                className={`flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 transition-all duration-200 ${
                  type === t
                    ? 'border-[#FF6B35]/40 bg-[#FF6B35]/10 text-[#FF6B35]'
                    : 'border-white/[0.06] bg-white/[0.02] text-white/40 hover:border-white/10'
                }`}
              >
                <span className="text-xl">{GEAR_TYPE_ICONS[t]}</span>
                <span className="text-[10px] font-medium">{GEAR_TYPE_LABELS[t]}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
          <h2 className="mb-4 text-xs font-medium uppercase tracking-wider text-white/40">
            基本信息
          </h2>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs text-white/50">装备名称</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例如：Nike Pegasus 40"
                className="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-2.5 text-sm text-[#F5F0EB] placeholder-white/20 outline-none transition-colors focus:border-[#FF6B35]/40"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs text-white/50">购买日期</label>
                <input
                  type="date"
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                  className="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-2.5 text-sm text-[#F5F0EB] outline-none transition-colors focus:border-[#FF6B35]/40"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs text-white/50">价格 (¥)</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="899"
                  min="0"
                  step="0.01"
                  className="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-2.5 text-sm text-[#F5F0EB] placeholder-white/20 outline-none transition-colors focus:border-[#FF6B35]/40"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-white/50">使用频率</label>
              <div className="flex gap-2">
                {frequencies.map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setUsageFrequency(f)}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                      usageFrequency === f
                        ? 'border-[#FF6B35]/40 bg-[#FF6B35]/10 text-[#FF6B35]'
                        : 'border-white/[0.06] bg-white/[0.02] text-white/40 hover:border-white/10'
                    }`}
                  >
                    {FREQUENCY_LABELS[f]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
          <h2 className="mb-4 text-xs font-medium uppercase tracking-wider text-white/40">
            保养设置
          </h2>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs text-white/50">保养周期 (天)</label>
              <input
                type="number"
                value={maintenanceCycleDays}
                onChange={(e) => setMaintenanceCycleDays(e.target.value)}
                placeholder="30"
                min="0"
                className="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-2.5 text-sm text-[#F5F0EB] placeholder-white/20 outline-none transition-colors focus:border-[#FF6B35]/40"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-white/50">最大使用量</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={maxUsage}
                  onChange={(e) => setMaxUsage(e.target.value)}
                  placeholder="500"
                  min="0"
                  className="flex-1 rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-2.5 text-sm text-[#F5F0EB] placeholder-white/20 outline-none transition-colors focus:border-[#FF6B35]/40"
                />
                <div className="flex gap-1">
                  {usageUnits.map((u) => (
                    <button
                      key={u}
                      type="button"
                      onClick={() => setMaxUsageUnit(u)}
                      className={`rounded-lg border px-2.5 py-2 text-xs font-medium transition-all duration-200 ${
                        maxUsageUnit === u
                          ? 'border-[#FF6B35]/40 bg-[#FF6B35]/10 text-[#FF6B35]'
                          : 'border-white/[0.06] bg-white/[0.02] text-white/40'
                      }`}
                    >
                      {USAGE_UNIT_LABELS[u]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
          <h2 className="mb-4 text-xs font-medium uppercase tracking-wider text-white/40">
            装备照片
          </h2>
          {photo ? (
            <div className="relative mb-3">
              <img
                src={photo}
                alt="装备照片"
                className="h-40 w-full rounded-xl object-cover"
              />
              <button
                type="button"
                onClick={() => setPhoto('')}
                className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-1 text-xs text-white/80 hover:bg-black/80"
              >
                移除
              </button>
            </div>
          ) : (
            <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-dashed border-white/10 py-8 transition-colors hover:border-white/20">
              <span className="text-3xl">📷</span>
              <span className="text-xs text-white/30">点击上传装备照片</span>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </label>
          )}
        </div>

        <button
          type="submit"
          className="w-full rounded-xl bg-[#FF6B35] py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-[#FF6B35]/90 hover:shadow-lg hover:shadow-[#FF6B35]/20"
        >
          添加装备
        </button>
      </form>
    </div>
  )
}
