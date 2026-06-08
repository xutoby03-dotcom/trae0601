import { useState, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Camera, X } from 'lucide-react'
import { useMedicineStore } from '@/store/medicineStore'
import { useMemberStore } from '@/store/memberStore'
import { CATEGORY_CONFIG } from '@/types'
import type { Medicine, MedicineCategory } from '@/types'
import { cn } from '@/lib/utils'

const UNITS = ['粒', '片', '袋', '支', '瓶', '盒', '贴', '支']
const LOCATIONS = ['客厅药箱', '卧室药箱', '急救箱', '儿童药品柜', '老人床头柜', '冰箱', '其他']

export default function AddMedicine() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEdit = !!id
  const { medicines, addMedicine, updateMedicine } = useMedicineStore()
  const { members } = useMemberStore()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const existing = isEdit ? medicines.find(m => m.id === id) : null

  const [form, setForm] = useState({
    name: existing?.name || '',
    purpose: existing?.purpose || '',
    suitableFor: existing?.suitableFor || [] as string[],
    quantity: existing?.quantity || 1,
    unit: existing?.unit || '粒',
    purchaseDate: existing?.purchaseDate || new Date().toISOString().split('T')[0],
    expiryDate: existing?.expiryDate || '',
    storageLocation: existing?.storageLocation || '客厅药箱',
    notes: existing?.notes || '',
    category: existing?.category || 'regular' as MedicineCategory,
    photoUrl: existing?.photoUrl || '',
    dosage: existing?.dosage || '',
    contraindications: existing?.contraindications || '',
    lowStockThreshold: existing?.lowStockThreshold || 3,
  })

  const [photoPreview, setPhotoPreview] = useState(form.photoUrl)

  const updateField = <K extends keyof typeof form>(key: K, value: typeof form[K]) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  const toggleSuitableFor = (tag: string) => {
    setForm(prev => ({
      ...prev,
      suitableFor: prev.suitableFor.includes(tag)
        ? prev.suitableFor.filter(t => t !== tag)
        : [...prev.suitableFor, tag],
    }))
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => {
      const result = reader.result as string
      setPhotoPreview(result)
      updateField('photoUrl', result)
    }
    reader.readAsDataURL(file)
  }

  const removePhoto = () => {
    setPhotoPreview('')
    updateField('photoUrl', '')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSubmit = () => {
    if (!form.name.trim() || !form.expiryDate) return

    if (isEdit && id) {
      updateMedicine(id, form)
    } else {
      const medicine: Medicine = {
        id: crypto.randomUUID(),
        ...form,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      addMedicine(medicine)
    }
    navigate('/')
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </button>
        <h1 className="text-lg font-bold text-amber-900">
          {isEdit ? '编辑药品' : '添加药品'}
        </h1>
      </div>

      <div className="space-y-4">
        <div className="bg-white rounded-2xl p-5 border border-amber-100/50 shadow-sm">
          <h3 className="text-sm font-semibold text-amber-800 mb-3">基本信息</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">药品名称 *</label>
              <input
                type="text"
                value={form.name}
                onChange={e => updateField('name', e.target.value)}
                placeholder="如：布洛芬缓释胶囊"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-100"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">用途</label>
              <input
                type="text"
                value={form.purpose}
                onChange={e => updateField('purpose', e.target.value)}
                placeholder="如：退烧止痛"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-100"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">药品分类</label>
              <div className="flex flex-wrap gap-2">
                {(Object.entries(CATEGORY_CONFIG) as [MedicineCategory, typeof CATEGORY_CONFIG[MedicineCategory]][]).map(([key, config]) => (
                  <button
                    key={key}
                    onClick={() => updateField('category', key)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
                      form.category === key
                        ? `${config.bgColor} ${config.color} border-current`
                        : 'bg-gray-50 text-gray-500 border-gray-200'
                    )}
                  >
                    {config.icon} {config.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-amber-100/50 shadow-sm">
          <h3 className="text-sm font-semibold text-amber-800 mb-3">药盒照片</h3>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            className="hidden"
          />
          {photoPreview ? (
            <div className="relative w-32 h-32 rounded-xl overflow-hidden border border-amber-100">
              <img src={photoPreview} alt="药品照片" className="w-full h-full object-cover" />
              <button
                onClick={removePhoto}
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/40 flex items-center justify-center"
              >
                <X className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-32 h-32 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-emerald-300 hover:text-emerald-500 transition-colors"
            >
              <Camera className="w-6 h-6" />
              <span className="text-xs">上传照片</span>
            </button>
          )}
        </div>

        <div className="bg-white rounded-2xl p-5 border border-amber-100/50 shadow-sm">
          <h3 className="text-sm font-semibold text-amber-800 mb-3">数量与日期</h3>
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-xs text-gray-500 mb-1 block">数量</label>
                <input
                  type="number"
                  min={0}
                  value={form.quantity}
                  onChange={e => updateField('quantity', Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-400"
                />
              </div>
              <div className="w-24">
                <label className="text-xs text-gray-500 mb-1 block">单位</label>
                <select
                  value={form.unit}
                  onChange={e => updateField('unit', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-400"
                >
                  {UNITS.map(u => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">低库存阈值</label>
              <input
                type="number"
                min={0}
                value={form.lowStockThreshold}
                onChange={e => updateField('lowStockThreshold', Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-400"
                placeholder="低于此数量自动提醒补货"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">买入日期</label>
                <input
                  type="date"
                  value={form.purchaseDate}
                  onChange={e => updateField('purchaseDate', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-400"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">有效期至 *</label>
                <input
                  type="date"
                  value={form.expiryDate}
                  onChange={e => updateField('expiryDate', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-400"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">存放位置</label>
              <div className="flex flex-wrap gap-2">
                {LOCATIONS.map(loc => (
                  <button
                    key={loc}
                    onClick={() => updateField('storageLocation', loc)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
                      form.storageLocation === loc
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-300'
                        : 'bg-gray-50 text-gray-500 border-gray-200'
                    )}
                  >
                    {loc}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-amber-100/50 shadow-sm">
          <h3 className="text-sm font-semibold text-amber-800 mb-3">适用人群</h3>
          <div className="flex flex-wrap gap-2">
            {members.map(member => (
              <button
                key={member.id}
                onClick={() => toggleSuitableFor(member.tag)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all',
                  form.suitableFor.includes(member.tag)
                    ? 'bg-sky-50 text-sky-600 border-sky-300'
                    : 'bg-gray-50 text-gray-500 border-gray-200'
                )}
              >
                <span>{member.avatar}</span>
                {member.name}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-amber-100/50 shadow-sm">
          <h3 className="text-sm font-semibold text-amber-800 mb-3">服用说明</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">用法用量</label>
              <textarea
                value={form.dosage}
                onChange={e => updateField('dosage', e.target.value)}
                placeholder="如：每次1粒，每日2次"
                rows={2}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-400 resize-none"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">禁忌提醒</label>
              <textarea
                value={form.contraindications}
                onChange={e => updateField('contraindications', e.target.value)}
                placeholder="如：孕妇禁用"
                rows={2}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-400 resize-none"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">注意事项</label>
              <textarea
                value={form.notes}
                onChange={e => updateField('notes', e.target.value)}
                placeholder="如：饭后服用，不宜空腹"
                rows={2}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-400 resize-none"
              />
            </div>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!form.name.trim() || !form.expiryDate}
          className="w-full py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-200 hover:shadow-xl hover:shadow-emerald-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none transition-all"
        >
          {isEdit ? '保存修改' : '添加药品'}
        </button>
      </div>
    </motion.div>
  )
}
