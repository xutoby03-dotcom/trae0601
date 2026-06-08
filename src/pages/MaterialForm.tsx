import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import { useStore } from '@/store/useStore'
import type { Category, StorageType } from '@/types'
import { CATEGORIES, STORAGE_TYPES, UNITS } from '@/types'
import { COLOR_PRESETS } from '@/utils/color'
import { getColorName } from '@/utils/color'

export default function MaterialForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const materials = useStore((s) => s.materials)
  const addMaterial = useStore((s) => s.addMaterial)
  const updateMaterial = useStore((s) => s.updateMaterial)

  const existingMaterial = id ? materials.find((m) => m.id === id) : null

  const [form, setForm] = useState({
    name: existingMaterial?.name || '',
    category: existingMaterial?.category || '滴胶' as Category,
    colorHex: existingMaterial?.colorHex || '#8B5E3C',
    colorName: existingMaterial?.colorName || '',
    specification: existingMaterial?.specification || '',
    quantity: existingMaterial?.quantity || 0,
    unit: existingMaterial?.unit || '个',
    purchaseUrl: existingMaterial?.purchaseUrl || '',
    price: existingMaterial?.price || 0,
    storageType: existingMaterial?.storageType || '盒子' as StorageType,
    storageBox: existingMaterial?.storageBox || '',
    storageCompartment: existingMaterial?.storageCompartment || '',
    storageBag: existingMaterial?.storageBag || '',
    lowStockThreshold: existingMaterial?.lowStockThreshold || 5,
  })

  const updateField = <K extends keyof typeof form>(key: K, value: typeof form[K]) => {
    setForm((prev) => {
      const updated = { ...prev, [key]: value }
      if (key === 'colorHex') {
        updated.colorName = getColorName(value as string)
      }
      return updated
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return

    const colorName = form.colorName || getColorName(form.colorHex)

    if (existingMaterial) {
      updateMaterial(id!, { ...form, colorName })
    } else {
      addMaterial({ ...form, colorName })
    }
    navigate('/')
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="btn-secondary p-2.5">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h2 className="font-serif text-2xl font-bold text-bark">
          {existingMaterial ? '编辑材料' : '新增材料'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card space-y-4">
          <h3 className="section-title">基本信息</h3>
          <div>
            <label className="block text-sm font-medium text-bark mb-1.5">材料名称 *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder="如：透明滴胶、4mm米珠、棉麻布"
              className="input-field"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-bark mb-1.5">类别</label>
              <select
                value={form.category}
                onChange={(e) => updateField('category', e.target.value as Category)}
                className="select-field"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-bark mb-1.5">规格</label>
              <input
                type="text"
                value={form.specification}
                onChange={(e) => updateField('specification', e.target.value)}
                placeholder="如：4mm、A4大小、500ml"
                className="input-field"
              />
            </div>
          </div>
        </div>

        <div className="card space-y-4">
          <h3 className="section-title">颜色与规格</h3>
          <div>
            <label className="block text-sm font-medium text-bark mb-1.5">颜色</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {COLOR_PRESETS.map((preset) => (
                <button
                  key={preset.hex}
                  type="button"
                  onClick={() => updateField('colorHex', preset.hex)}
                  className={`w-8 h-8 rounded-lg border-2 transition-all duration-150 hover:scale-110 ${
                    form.colorHex === preset.hex ? 'border-caramel scale-110 shadow-craft' : 'border-sand-light'
                  }`}
                  style={{ backgroundColor: preset.hex }}
                  title={preset.name}
                />
              ))}
            </div>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={form.colorHex}
                onChange={(e) => updateField('colorHex', e.target.value)}
                className="w-12 h-12 rounded-xl cursor-pointer border-2 border-sand-light"
              />
              <input
                type="text"
                value={form.colorHex}
                onChange={(e) => updateField('colorHex', e.target.value)}
                className="input-field w-32"
                placeholder="#RRGGBB"
              />
              <span className="text-sm text-sand">
                识别为: {form.colorName || getColorName(form.colorHex)}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-bark mb-1.5">数量</label>
              <input
                type="number"
                value={form.quantity}
                onChange={(e) => updateField('quantity', Number(e.target.value))}
                min="0"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-bark mb-1.5">单位</label>
              <select
                value={form.unit}
                onChange={(e) => updateField('unit', e.target.value)}
                className="select-field"
              >
                {UNITS.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-bark mb-1.5">低库存阈值</label>
              <input
                type="number"
                value={form.lowStockThreshold}
                onChange={(e) => updateField('lowStockThreshold', Number(e.target.value))}
                min="0"
                className="input-field"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-bark mb-1.5">价格 (¥)</label>
            <input
              type="number"
              value={form.price || ''}
              onChange={(e) => updateField('price', Number(e.target.value))}
              min="0"
              step="0.01"
              placeholder="0.00"
              className="input-field"
            />
          </div>
        </div>

        <div className="card space-y-4">
          <h3 className="section-title">收纳信息</h3>
          <div>
            <label className="block text-sm font-medium text-bark mb-1.5">收纳类型</label>
            <div className="flex gap-3">
              {STORAGE_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => updateField('storageType', type)}
                  className={`px-5 py-2.5 rounded-full font-medium transition-all duration-200 ${
                    form.storageType === type
                      ? 'bg-caramel text-white shadow-craft'
                      : 'bg-parchment text-caramel-dark hover:bg-sand-light'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
          {form.storageType === '盒子' && (
            <div>
              <label className="block text-sm font-medium text-bark mb-1.5">盒子名称</label>
              <input
                type="text"
                value={form.storageBox}
                onChange={(e) => updateField('storageBox', e.target.value)}
                placeholder="如：滴胶专用盒、珠子收纳盒A"
                className="input-field"
              />
            </div>
          )}
          {form.storageType === '格子' && (
            <div>
              <label className="block text-sm font-medium text-bark mb-1.5">格子位置</label>
              <input
                type="text"
                value={form.storageCompartment}
                onChange={(e) => updateField('storageCompartment', e.target.value)}
                placeholder="如：3层2格、左侧第5格"
                className="input-field"
              />
            </div>
          )}
          {form.storageType === '袋子' && (
            <div>
              <label className="block text-sm font-medium text-bark mb-1.5">袋子名称</label>
              <input
                type="text"
                value={form.storageBag}
                onChange={(e) => updateField('storageBag', e.target.value)}
                placeholder="如：布料袋、蕾丝袋"
                className="input-field"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-bark mb-1.5">购买链接</label>
            <input
              type="url"
              value={form.purchaseUrl}
              onChange={(e) => updateField('purchaseUrl', e.target.value)}
              placeholder="https://..."
              className="input-field"
            />
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary">
            取消
          </button>
          <button type="submit" className="btn-primary flex items-center gap-2">
            <Save className="w-4 h-4" />
            {existingMaterial ? '保存修改' : '添加材料'}
          </button>
        </div>
      </form>
    </div>
  )
}
