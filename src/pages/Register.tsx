import { useState, useRef } from 'react'
import { useFridgeStore } from '@/store/fridgeStore'
import { PackagePlus, Camera, Snowflake, X, Plus, Minus, Trash2, ShoppingCart } from 'lucide-react'

const ALLERGEN_OPTIONS = ['花生', '牛奶', '鸡蛋', '麸质', '大豆', '坚果', '海鲜', '芝麻']
const SHELF_LABELS: Record<number, string> = {
  1: '蔬果区',
  2: '烘焙区',
  3: '乳品蛋类',
  4: '水果区',
  5: '其他',
}

interface PendingItem {
  tempId: string
  name: string
  quantity: number
  source: string
  shelfLayer: number
  expiryDate: string
  coldChain: boolean
  allergens: string[]
  photoUrl: string
}

let tempIdCounter = 0
function nextTempId() {
  return `temp_${++tempIdCounter}_${Date.now()}`
}

export default function Register() {
  const { addFoodItems } = useFridgeStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [pendingList, setPendingList] = useState<PendingItem[]>([])
  const [batchSuccess, setBatchSuccess] = useState(false)
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

  const handleAddToList = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.source || !form.expiryDate) return

    const item: PendingItem = {
      tempId: nextTempId(),
      name: form.name,
      quantity: form.quantity,
      source: form.source,
      shelfLayer: form.shelfLayer,
      expiryDate: form.expiryDate,
      coldChain: form.coldChain,
      allergens: [...form.allergens],
      photoUrl: form.photoUrl,
    }

    setPendingList((list) => [...list, item])
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
  }

  const removePendingItem = (tempId: string) => {
    setPendingList((list) => list.filter((i) => i.tempId !== tempId))
  }

  const updatePendingQuantity = (tempId: string, delta: number) => {
    setPendingList((list) =>
      list.map((i) =>
        i.tempId === tempId ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i
      )
    )
  }

  const handleBatchSubmit = () => {
    if (pendingList.length === 0) return

    addFoodItems(
      pendingList.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        source: item.source,
        shelfLayer: item.shelfLayer,
        expiryDate: item.expiryDate,
        coldChain: item.coldChain,
        allergens: item.allergens.join(','),
        photoUrl: item.photoUrl,
      }))
    )

    setPendingList([])
    setBatchSuccess(true)
    setTimeout(() => setBatchSuccess(false), 3000)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-stone-800 mb-1">📦 食物登记</h2>
        <p className="text-sm text-stone-400">逐条添加到临时清单，确认后一键批量入库</p>
      </div>

      {batchSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl p-4 text-sm font-medium flex items-center gap-2">
          <PackagePlus className="w-4 h-4" />
          批量入库成功！所有食物已入库，首页看板已更新
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <form onSubmit={handleAddToList} className="space-y-5">
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
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition shadow-lg shadow-emerald-600/20 active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              添加到清单
            </button>
          </form>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-sm sticky top-24">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-stone-700 flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-emerald-600" />
                待入库清单
              </h3>
              {pendingList.length > 0 && (
                <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-[10px] font-bold">
                  {pendingList.length}项
                </span>
              )}
            </div>

            {pendingList.length === 0 ? (
              <div className="text-center py-10 text-stone-400 text-sm">
                <ShoppingCart className="w-8 h-8 mx-auto mb-2 opacity-20" />
                <p>清单为空</p>
                <p className="text-[10px] mt-1">在左侧填写食物信息后添加到清单</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
                {pendingList.map((item) => (
                  <div
                    key={item.tempId}
                    className="bg-stone-50 rounded-xl p-3 border border-stone-100 group"
                  >
                    <div className="flex items-start gap-2.5">
                      {item.photoUrl ? (
                        <img src={item.photoUrl} alt={item.name} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shrink-0 text-stone-300 text-sm font-medium border border-stone-100">
                          {item.name.charAt(0)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-semibold text-stone-700 truncate">{item.name}</span>
                          {item.coldChain && <Snowflake className="w-3 h-3 text-blue-400 shrink-0" />}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] text-stone-400">{item.source}</span>
                          <span className="text-[10px] text-stone-300">·</span>
                          <span className="text-[10px] text-stone-400">第{item.shelfLayer}层</span>
                          <span className="text-[10px] text-stone-300">·</span>
                          <span className="text-[10px] text-stone-400">{item.expiryDate}</span>
                        </div>
                        {item.allergens.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {item.allergens.map((a) => (
                              <span key={a} className="px-1 py-0.5 bg-orange-50 text-orange-500 text-[9px] rounded font-medium">
                                {a}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removePendingItem(item.tempId)}
                        className="w-6 h-6 rounded-lg flex items-center justify-center text-stone-300 hover:text-red-500 hover:bg-red-50 transition shrink-0 opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-stone-100">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => updatePendingQuantity(item.tempId, -1)}
                          className="w-7 h-7 rounded-lg border border-stone-200 flex items-center justify-center text-stone-400 hover:bg-stone-100 transition"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-sm font-bold text-stone-700 w-6 text-center">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updatePendingQuantity(item.tempId, 1)}
                          className="w-7 h-7 rounded-lg border border-stone-200 flex items-center justify-center text-stone-400 hover:bg-stone-100 transition"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="text-[10px] text-emerald-600 font-bold">{SHELF_LABELS[item.shelfLayer]}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {pendingList.length > 0 && (
              <div className="mt-4 pt-4 border-t border-stone-100">
                <div className="flex items-center justify-between text-xs text-stone-400 mb-3">
                  <span>共 {pendingList.length} 项</span>
                  <span>
                    合计 <span className="text-emerald-600 font-bold">{pendingList.reduce((s, i) => s + i.quantity, 0)}</span> 份
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleBatchSubmit}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition shadow-lg shadow-emerald-600/20 active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <PackagePlus className="w-4 h-4" />
                  一键入库（{pendingList.length}项）
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
