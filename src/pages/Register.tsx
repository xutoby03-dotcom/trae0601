import { useState, useRef } from 'react'
import { useFridgeStore } from '@/store/fridgeStore'
import { PackagePlus, Camera, Snowflake, X } from 'lucide-react'

const ALLERGEN_OPTIONS = ['花生', '牛奶', '鸡蛋', '麸质', '大豆', '坚果', '海鲜', '芝麻']

export default function Register() {
  const { addFoodItem } = useFridgeStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState({
    name: '',
    quantity: 1,
    source: '',
    shelfLayer: 1,
    expiryDate: '',
    coldChain: false,
    allergens: [] as string[],
    photoUrl: '',
  })

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      setForm((f) => ({ ...f, photoUrl: ev.target?.result as string }))
    }
    reader.readAsDataURL(file)
  }

  const toggleAllergen = (allergen: string) => {
    setForm((f) => ({
      ...f,
      allergens: f.allergens.includes(allergen)
        ? f.allergens.filter((a) => a !== allergen)
        : [...f.allergens, allergen],
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.source || !form.expiryDate) return

    addFoodItem({
      name: form.name,
      quantity: form.quantity,
      source: form.source,
      shelfLayer: form.shelfLayer,
      expiryDate: form.expiryDate,
      coldChain: form.coldChain,
      allergens: form.allergens.join(','),
      photoUrl: form.photoUrl,
    })

    setSuccess(true)
    setForm({
      name: '',
      quantity: 1,
      source: '',
      shelfLayer: 1,
      expiryDate: '',
      coldChain: false,
      allergens: [],
      photoUrl: '',
    })
    setTimeout(() => setSuccess(false), 3000)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-stone-800 mb-1">📦 食物登记</h2>
        <p className="text-sm text-stone-400">志愿者录入捐赠食物信息</p>
      </div>

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl p-4 text-sm font-medium flex items-center gap-2">
          <PackagePlus className="w-4 h-4" />
          登记成功！食物已入库，首页看板已更新
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl border border-stone-200 p-6 space-y-5 shadow-sm">
          <h3 className="text-sm font-bold text-stone-700 flex items-center gap-2">
            <span className="w-6 h-6 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center text-xs font-bold">1</span>
            基本信息
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-stone-500 mb-1.5">食物名称 *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="如：有机白菜"
                className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-500 mb-1.5">数量 *</label>
              <input
                type="number"
                required
                min={1}
                value={form.quantity}
                onChange={(e) => setForm((f) => ({ ...f, quantity: parseInt(e.target.value) || 1 }))}
                className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-500 mb-1.5">来源 *</label>
              <input
                type="text"
                required
                value={form.source}
                onChange={(e) => setForm((f) => ({ ...f, source: e.target.value }))}
                placeholder="如：张阿姨捐赠"
                className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-500 mb-1.5">存放层</label>
              <select
                value={form.shelfLayer}
                onChange={(e) => setForm((f) => ({ ...f, shelfLayer: parseInt(e.target.value) }))}
                className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition bg-white"
              >
                <option value={1}>第1层 · 蔬果区</option>
                <option value={2}>第2层 · 烘焙区</option>
                <option value={3}>第3层 · 乳品蛋类</option>
                <option value={4}>第4层 · 水果区</option>
                <option value={5}>第5层 · 其他</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-stone-200 p-6 space-y-5 shadow-sm">
          <h3 className="text-sm font-bold text-stone-700 flex items-center gap-2">
            <span className="w-6 h-6 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center text-xs font-bold">2</span>
            安全信息
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-stone-500 mb-1.5">保质期截止日期 *</label>
              <input
                type="date"
                required
                value={form.expiryDate}
                onChange={(e) => setForm((f) => ({ ...f, expiryDate: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition"
              />
            </div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, coldChain: !f.coldChain }))}
                className={`w-full px-3 py-2.5 rounded-xl border text-sm font-medium transition flex items-center justify-center gap-2 ${
                  form.coldChain
                    ? 'bg-blue-50 border-blue-300 text-blue-700'
                    : 'bg-stone-50 border-stone-200 text-stone-400'
                }`}
              >
                <Snowflake className="w-4 h-4" />
                {form.coldChain ? '需要冷链 ✦' : '无需冷链'}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-500 mb-2">过敏原标签</label>
            <div className="flex flex-wrap gap-2">
              {ALLERGEN_OPTIONS.map((allergen) => (
                <button
                  key={allergen}
                  type="button"
                  onClick={() => toggleAllergen(allergen)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    form.allergens.includes(allergen)
                      ? 'bg-orange-100 text-orange-700 border border-orange-300'
                      : 'bg-stone-50 text-stone-400 border border-stone-200 hover:border-stone-300'
                  }`}
                >
                  {allergen}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-stone-200 p-6 space-y-5 shadow-sm">
          <h3 className="text-sm font-bold text-stone-700 flex items-center gap-2">
            <span className="w-6 h-6 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center text-xs font-bold">3</span>
            照片记录
          </h3>

          <div>
            {form.photoUrl ? (
              <div className="relative w-32 h-32 rounded-xl overflow-hidden border border-stone-200">
                <img src={form.photoUrl} alt="食物照片" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, photoUrl: '' }))}
                  className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-32 h-32 rounded-xl border-2 border-dashed border-stone-300 flex flex-col items-center justify-center gap-2 text-stone-400 hover:border-emerald-400 hover:text-emerald-500 transition"
              >
                <Camera className="w-6 h-6" />
                <span className="text-[10px] font-medium">上传照片</span>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition shadow-lg shadow-emerald-600/20 active:scale-[0.98]"
        >
          确认入库
        </button>
      </form>
    </div>
  )
}
