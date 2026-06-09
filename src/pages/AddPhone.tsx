import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Camera, X, TrendingDown, TrendingUp, AlertCircle } from 'lucide-react'
import { BRANDS, CAPACITIES, COLORS, SCREEN_CONDITIONS, ACCESSORIES, type ScreenCondition } from '@/types'
import { usePhoneStore } from '@/store'
import { calculateValuation } from '@/utils/valuation'

const currentYear = new Date().getFullYear()
const PURCHASE_YEARS = Array.from({ length: currentYear - 2015 + 1 }, (_, i) => 2015 + i)

const defaultForm = {
  brand: 'Apple',
  model: '',
  capacity: null as string | null,
  color: '黑色',
  purchaseYear: null as number | null,
  screenCondition: 'intact' as ScreenCondition,
  batteryHealth: null as number | null,
  waterDamage: false,
  accountLocked: false,
  accessories: [] as string[],
  photos: [] as string[],
}

export default function AddPhone() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = !!id
  const { addPhone, updatePhone, phones } = usePhoneStore()

  const [form, setForm] = useState(defaultForm)
  const [showModelError, setShowModelError] = useState(false)
  const [batteryTouched, setBatteryTouched] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEdit) {
      const phone = phones.find((p) => p.id === id)
      if (phone) {
        setForm({
          brand: phone.brand,
          model: phone.model,
          capacity: phone.capacity,
          color: phone.color,
          purchaseYear: phone.purchaseYear,
          screenCondition: phone.screenCondition,
          batteryHealth: phone.batteryHealth,
          waterDamage: phone.waterDamage,
          accountLocked: phone.accountLocked,
          accessories: phone.accessories,
          photos: phone.photos,
        })
        setBatteryTouched(phone.batteryHealth !== null)
      }
    }
  }, [id, isEdit, phones])

  const valuation = calculateValuation(form)

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  const toggleAccessory = (acc: string) =>
    setForm((f) => ({
      ...f,
      accessories: f.accessories.includes(acc) ? f.accessories.filter((a) => a !== acc) : [...f.accessories, acc],
    }))

  const handlePhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    Array.from(files).forEach((file) => {
      const reader = new FileReader()
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string
        setForm((f) => ({ ...f, photos: [...f.photos, dataUrl] }))
      }
      reader.readAsDataURL(file)
    })
  }

  const removePhoto = (idx: number) =>
    setForm((f) => ({ ...f, photos: f.photos.filter((_, i) => i !== idx) }))

  const handleSave = () => {
    if (!form.model.trim()) {
      setShowModelError(true)
      return
    }
    if (isEdit) {
      updatePhone(id!, form)
      navigate(-1)
    } else {
      const newId = addPhone(form)
      navigate(`/phone/${newId}`)
    }
  }

  const bh = form.batteryHealth
  const batteryColor = bh === null ? '#9ca3af' : bh > 80 ? '#52B788' : bh >= 60 ? '#F77F00' : '#E63946'
  const batteryDisplay = bh !== null ? `${bh}%` : '未填写'

  return (
    <div className="min-h-screen bg-gray-50 pb-36">
      <header className="sticky top-0 z-10 flex items-center gap-3 bg-[#1B4332] px-4 py-3 text-white">
        <ArrowLeft className="cursor-pointer" size={22} onClick={() => navigate(-1)} />
        <h1 className="text-lg font-semibold">{isEdit ? '编辑手机' : '添加手机'}</h1>
      </header>

      <Section title="基础信息">
        <Field label="品牌">
          <select className="input-base" value={form.brand} onChange={(e) => set('brand', e.target.value)}>
            {BRANDS.map((b) => <option key={b}>{b}</option>)}
          </select>
        </Field>
        <Field label="型号">
          <div>
            <input
              className={`input-base ${showModelError && !form.model.trim() ? 'border-red-400 focus:border-red-400 focus:ring-red-400/30' : ''}`}
              placeholder="如 iPhone 14 Pro"
              value={form.model}
              onChange={(e) => { set('model', e.target.value); if (e.target.value.trim()) setShowModelError(false) }}
              onBlur={() => { if (!form.model.trim()) setShowModelError(true) }}
            />
            {showModelError && !form.model.trim() && (
              <div className="mt-1 flex items-center gap-1 text-xs text-red-500">
                <AlertCircle size={12} />
                <span>请填写手机型号</span>
              </div>
            )}
          </div>
        </Field>
        <Field label="容量">
          <select
            className="input-base"
            value={form.capacity ?? ''}
            onChange={(e) => set('capacity', e.target.value || null)}
          >
            <option value="">请选择容量</option>
            {CAPACITIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="颜色">
          <select className="input-base" value={form.color} onChange={(e) => set('color', e.target.value)}>
            {COLORS.map((c) => <option key={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="购买年份">
          <select
            className="input-base"
            value={form.purchaseYear ?? ''}
            onChange={(e) => set('purchaseYear', e.target.value ? +e.target.value : null)}
          >
            <option value="">请选择年份</option>
            {PURCHASE_YEARS.map((y) => <option key={y}>{y}</option>)}
          </select>
        </Field>
      </Section>

      <Section title="状态评估">
        <Field label="屏幕状态">
          <div className="flex gap-2">
            {SCREEN_CONDITIONS.map((sc) => (
              <button
                key={sc.value}
                onClick={() => set('screenCondition', sc.value)}
                className={`rounded-lg border px-3 py-1.5 text-sm transition ${
                  form.screenCondition === sc.value ? 'border-[#52B788] bg-[#52B788]/10 text-[#1B4332]' : 'border-gray-200 text-gray-500'
                }`}
              >
                {sc.label}
              </button>
            ))}
          </div>
        </Field>
        <Field label={`电池健康度 ${batteryDisplay}`}>
          <div className="flex items-center gap-3">
            {bh !== null ? (
              <>
                <input
                  type="range" min={0} max={100} value={bh}
                  onChange={(e) => set('batteryHealth', +e.target.value)}
                  className="h-2 flex-1 appearance-none rounded-full accent-[#52B788]"
                  style={{ background: `linear-gradient(to right, ${batteryColor} ${bh}%, #e5e7eb ${bh}%)` }}
                />
                <span className="w-10 text-right text-sm font-medium" style={{ color: batteryColor }}>{bh}%</span>
              </>
            ) : (
              <button
                onClick={() => { set('batteryHealth', 85); setBatteryTouched(true) }}
                className="rounded-lg border border-dashed border-gray-300 px-4 py-1.5 text-sm text-gray-400 transition hover:border-[#52B788] hover:text-[#52B788]"
              >
                点击填写电池健康度
              </button>
            )}
            {batteryTouched && bh !== null && (
              <button
                onClick={() => { set('batteryHealth', null); setBatteryTouched(false) }}
                className="text-xs text-gray-400 underline"
              >
                清除
              </button>
            )}
          </div>
        </Field>
        <Field label="进水损坏">
          <Toggle checked={form.waterDamage} onChange={(v) => set('waterDamage', v)} />
        </Field>
        <Field label="账号未退出">
          <Toggle checked={form.accountLocked} onChange={(v) => set('accountLocked', v)} />
        </Field>
      </Section>

      <Section title="配件与照片">
        <div className="flex flex-wrap gap-2">
          {ACCESSORIES.map((acc) => (
            <button
              key={acc}
              onClick={() => toggleAccessory(acc)}
              className={`rounded-lg border px-3 py-1.5 text-sm transition ${
                form.accessories.includes(acc) ? 'border-[#52B788] bg-[#52B788]/10 text-[#1B4332]' : 'border-gray-200 text-gray-500'
              }`}
            >
              {acc}
            </button>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {form.photos.map((p, i) => (
            <div key={i} className="relative h-20 w-20">
              <img src={p} className="h-full w-full rounded-lg object-cover" />
              <button onClick={() => removePhoto(i)} className="absolute -right-1 -top-1 rounded-full bg-white shadow">
                <X size={14} className="text-red-500" />
              </button>
            </div>
          ))}
          <button
            onClick={() => fileRef.current?.click()}
            className="flex h-20 w-20 flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 text-gray-400"
          >
            <Camera size={22} />
            <span className="mt-0.5 text-xs">添加照片</span>
          </button>
          <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePhotos} />
        </div>
      </Section>

      <div className="fixed inset-x-0 bottom-0 border-t bg-white/80 px-4 py-3 backdrop-blur-md">
        <div className="mb-2 text-center text-xl font-bold text-[#1B4332]">
          ¥{valuation.estimatedMin} ~ ¥{valuation.estimatedMax}
        </div>
        <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-xs">
          {valuation.deductions.map((d, i) => (
            <span key={i} className="flex items-center gap-0.5 text-red-500">
              <TrendingDown size={12} /> {d.label} -¥{d.amount}
            </span>
          ))}
          {valuation.additions.map((a, i) => (
            <span key={i} className="flex items-center gap-0.5 text-[#52B788]">
              <TrendingUp size={12} /> {a.label} +¥{a.amount}
            </span>
          ))}
        </div>
        <button
          onClick={handleSave}
          className="mt-3 w-full rounded-xl bg-[#1B4332] py-3 text-base font-semibold text-white active:bg-[#2d6a4f]"
        >
          保存
        </button>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mx-4 mt-4 rounded-xl bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2 text-base font-semibold text-[#1B4332]">
        <span className="h-4 w-1 rounded bg-[#52B788]" />
        {title}
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="shrink-0 pt-2 text-sm text-gray-600">{label}</span>
      <div className="flex-1">{children}</div>
    </div>
  )
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative h-7 w-12 rounded-full transition-colors ${checked ? 'bg-[#52B788]' : 'bg-gray-300'}`}
    >
      <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${checked ? 'left-[22px]' : 'left-0.5'}`} />
    </button>
  )
}
