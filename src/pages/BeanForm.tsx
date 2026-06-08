import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import { useCoffeeStore } from '@/store/coffeeStore'
import FlavorSlider from '@/components/FlavorSlider'
import { ROAST_LEVELS, PROCESS_METHODS, FLAVOR_KEYS, FLAVOR_LABELS } from '@/utils/constants'
import type { CoffeeBean, RoastLevel, ProcessMethod, Flavor } from '@/types'

type FormData = Omit<CoffeeBean, 'id' | 'createdAt' | 'updatedAt'>

const initialFormData: FormData = {
  name: '',
  origin: '',
  roastLevel: 'medium',
  processMethod: 'washed',
  purchaseDate: new Date().toISOString().split('T')[0],
  openDate: null,
  price: null,
  weightTotal: 250,
  weightRemaining: 250,
  flavor: {
    acidity: 5,
    sweetness: 5,
    bitterness: 5,
    body: 5,
    aroma: 5,
  },
}

export default function BeanForm() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEditing = Boolean(id)
  const { beans, addBean, updateBean } = useCoffeeStore()

  const [form, setForm] = useState<FormData>(initialFormData)

  useEffect(() => {
    if (isEditing && id) {
      const bean = beans.find((b) => b.id === id)
      if (bean) {
        const { id: _id, createdAt: _ca, updatedAt: _ua, ...rest } = bean
        setForm(rest)
      }
    }
  }, [isEditing, id, beans])

  useEffect(() => {
    if (!isEditing) {
      setForm((prev) => ({ ...prev, weightRemaining: prev.weightTotal }))
    }
  }, [form.weightTotal, isEditing])

  const updateField = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const updateFlavor = (key: keyof Flavor, value: number) => {
    setForm((prev) => ({
      ...prev,
      flavor: { ...prev.flavor, [key]: value },
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isEditing && id) {
      updateBean(id, form)
      navigate(`/beans/${id}`)
    } else {
      addBean(form)
      navigate('/')
    }
  }

  return (
    <div className="min-h-screen bg-[#FDF6EC] pb-24">
      <header className="sticky top-0 z-10 bg-[#FDF6EC]/90 backdrop-blur-sm border-b border-[#E8D5BC]">
        <div className="max-w-lg mx-auto flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 rounded-lg hover:bg-[#E8D5BC]/50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-[#6F4E37]" />
          </button>
          <h1 className="text-lg font-semibold text-[#3E2412]">
            {isEditing ? '编辑咖啡豆' : '新增咖啡豆'}
          </h1>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="max-w-lg mx-auto px-4 mt-4 space-y-4">
        <section className="bg-white/80 rounded-2xl shadow-sm border border-[#E8D5BC] p-5 space-y-4">
          <h2 className="text-base font-semibold text-[#6F4E37] pb-2 border-b border-[#F5E6D3]">
            基本信息
          </h2>

          <div className="space-y-1">
            <label className="text-sm font-medium text-[#6F4E37]">豆名</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[#E8D5BC] bg-[#FDF6EC]/50 text-[#3E2412] text-sm focus:outline-none focus:border-[#6F4E37] focus:ring-1 focus:ring-[#6F4E37]/30 transition-colors"
              placeholder="咖啡豆名称"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-[#6F4E37]">产地</label>
            <input
              type="text"
              required
              value={form.origin}
              onChange={(e) => updateField('origin', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[#E8D5BC] bg-[#FDF6EC]/50 text-[#3E2412] text-sm focus:outline-none focus:border-[#6F4E37] focus:ring-1 focus:ring-[#6F4E37]/30 transition-colors"
              placeholder="产地国家/地区"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-[#6F4E37]">烘焙度</label>
            <select
              value={form.roastLevel}
              onChange={(e) => updateField('roastLevel', e.target.value as RoastLevel)}
              className="w-full px-3 py-2 rounded-lg border border-[#E8D5BC] bg-[#FDF6EC]/50 text-[#3E2412] text-sm focus:outline-none focus:border-[#6F4E37] focus:ring-1 focus:ring-[#6F4E37]/30 transition-colors"
            >
              {ROAST_LEVELS.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-[#6F4E37]">处理法</label>
            <select
              value={form.processMethod}
              onChange={(e) => updateField('processMethod', e.target.value as ProcessMethod)}
              className="w-full px-3 py-2 rounded-lg border border-[#E8D5BC] bg-[#FDF6EC]/50 text-[#3E2412] text-sm focus:outline-none focus:border-[#6F4E37] focus:ring-1 focus:ring-[#6F4E37]/30 transition-colors"
            >
              {PROCESS_METHODS.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-[#6F4E37]">购买日期</label>
            <input
              type="date"
              required
              value={form.purchaseDate}
              onChange={(e) => updateField('purchaseDate', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[#E8D5BC] bg-[#FDF6EC]/50 text-[#3E2412] text-sm focus:outline-none focus:border-[#6F4E37] focus:ring-1 focus:ring-[#6F4E37]/30 transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-[#6F4E37]">开封日期</label>
            <input
              type="date"
              value={form.openDate ?? ''}
              onChange={(e) => updateField('openDate', e.target.value || null)}
              className="w-full px-3 py-2 rounded-lg border border-[#E8D5BC] bg-[#FDF6EC]/50 text-[#3E2412] text-sm focus:outline-none focus:border-[#6F4E37] focus:ring-1 focus:ring-[#6F4E37]/30 transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-[#6F4E37]">价格（元）</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.price ?? ''}
              onChange={(e) => updateField('price', e.target.value ? Number(e.target.value) : null)}
              className="w-full px-3 py-2 rounded-lg border border-[#E8D5BC] bg-[#FDF6EC]/50 text-[#3E2412] text-sm focus:outline-none focus:border-[#6F4E37] focus:ring-1 focus:ring-[#6F4E37]/30 transition-colors"
              placeholder="可选"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-[#6F4E37]">总克数</label>
            <input
              type="number"
              required
              min="1"
              value={form.weightTotal}
              onChange={(e) => updateField('weightTotal', Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border border-[#E8D5BC] bg-[#FDF6EC]/50 text-[#3E2412] text-sm focus:outline-none focus:border-[#6F4E37] focus:ring-1 focus:ring-[#6F4E37]/30 transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-[#6F4E37]">剩余克数</label>
            <input
              type="number"
              required
              min="0"
              value={form.weightRemaining}
              onChange={(e) => updateField('weightRemaining', Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border border-[#E8D5BC] bg-[#FDF6EC]/50 text-[#3E2412] text-sm focus:outline-none focus:border-[#6F4E37] focus:ring-1 focus:ring-[#6F4E37]/30 transition-colors"
            />
          </div>
        </section>

        <section className="bg-white/80 rounded-2xl shadow-sm border border-[#E8D5BC] p-5 space-y-4">
          <h2 className="text-base font-semibold text-[#6F4E37] pb-2 border-b border-[#F5E6D3]">
            风味感受
          </h2>

          <div className="space-y-5">
            {FLAVOR_KEYS.map((key) => (
              <FlavorSlider
                key={key}
                label={FLAVOR_LABELS[key]}
                value={form.flavor[key]}
                onChange={(value) => updateFlavor(key, value)}
              />
            ))}
          </div>
        </section>

        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#6F4E37] text-white font-semibold text-sm hover:bg-[#5C3A1E] active:scale-[0.98] transition-all shadow-md"
        >
          <Save className="w-4 h-4" />
          保存
        </button>
      </form>
    </div>
  )
}
