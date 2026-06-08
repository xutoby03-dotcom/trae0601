import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, X, Plus, Tag, DollarSign, Calendar, Star, Package, Truck, AlertCircle } from 'lucide-react'
import { useStore } from '@/store/useStore'
import type { Condition, Category, EstimateResult } from '@/types'

const conditions: Condition[] = ['全新', '9成新', '8成新', '7成新', '6成新及以下']
const categories: Category[] = ['数码', '家电', '服装', '书籍', '家居', '其他']

export default function Publish() {
  const navigate = useNavigate()
  const { createItem, estimatePrice, loading } = useStore()

  const [name, setName] = useState('')
  const [brand, setBrand] = useState('')
  const [originalPrice, setOriginalPrice] = useState('')
  const [purchaseDate, setPurchaseDate] = useState('')
  const [condition, setCondition] = useState<Condition | ''>('')
  const [accessoriesComplete, setAccessoriesComplete] = useState(false)
  const [category, setCategory] = useState<Category | ''>('')
  const [flaws, setFlaws] = useState('')
  const [freeShipping, setFreeShipping] = useState(false)
  const [photoUrls, setPhotoUrls] = useState<string[]>([])
  const [photoInput, setPhotoInput] = useState('')
  const [finalPrice, setFinalPrice] = useState('')
  const [estimate, setEstimate] = useState<EstimateResult | null>(null)
  const [estimating, setEstimating] = useState(false)

  const canEstimate = originalPrice && purchaseDate && condition && category

  const doEstimate = useCallback(async () => {
    if (!canEstimate) return
    setEstimating(true)
    const result = await estimatePrice({
      originalPrice: Number(originalPrice),
      purchaseDate,
      condition,
      accessoriesComplete,
      category,
    })
    setEstimate(result)
    setEstimating(false)
  }, [canEstimate, originalPrice, purchaseDate, condition, accessoriesComplete, category, estimatePrice])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (canEstimate) doEstimate()
    }, 500)
    return () => clearTimeout(timer)
  }, [canEstimate, doEstimate])

  const addPhoto = () => {
    const url = photoInput.trim()
    if (url && !photoUrls.includes(url)) {
      setPhotoUrls([...photoUrls, url])
      setPhotoInput('')
    }
  }

  const removePhoto = (index: number) => {
    setPhotoUrls(photoUrls.filter((_, i) => i !== index))
  }

  const applySuggestedPrice = () => {
    if (estimate) {
      setFinalPrice(String(estimate.suggestedPrice))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !condition || !category) return

    const item = await createItem({
      name,
      brand,
      originalPrice: Number(originalPrice),
      purchaseDate,
      condition,
      accessoriesComplete,
      category,
      flaws,
      freeShipping,
      photos: photoUrls,
      currentPrice: Number(finalPrice) || estimate?.suggestedPrice || Number(originalPrice),
      suggestedPriceMin: estimate?.suggestedMin || 0,
      suggestedPriceMax: estimate?.suggestedMax || 0,
    })

    if (item) {
      useStore.getState().fetchItems()
      navigate('/')
    }
  }

  const isValid = name.trim() !== '' && condition !== '' && category !== ''

  return (
    <div className="min-h-screen bg-carbon-50 font-body">
      <div className="container mx-auto px-6 py-10">
        <div className="flex gap-10">
          <form onSubmit={handleSubmit} className="w-[480px] shrink-0 space-y-6">
            <h1 className="font-display text-2xl text-carbon-700">发布闲置</h1>

            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-sm font-medium text-carbon-600">
                <Tag className="h-4 w-4" />物品名称 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full border border-carbon-200 rounded-lg px-3 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-sm font-medium text-carbon-600">
                <Star className="h-4 w-4" />品牌
              </label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full border border-carbon-200 rounded-lg px-3 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-sm font-medium text-carbon-600">
                <DollarSign className="h-4 w-4" />原价
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-carbon-400">¥</span>
                <input
                  type="number"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(e.target.value)}
                  min="0"
                  step="0.01"
                  className="w-full border border-carbon-200 rounded-lg pl-7 pr-3 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-sm font-medium text-carbon-600">
                <Calendar className="h-4 w-4" />购买时间
              </label>
              <input
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className="w-full border border-carbon-200 rounded-lg px-3 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-sm font-medium text-carbon-600">
                <Package className="h-4 w-4" />成色
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as Condition)}
                className="w-full border border-carbon-200 rounded-lg px-3 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition bg-white"
              >
                <option value="">请选择</option>
                {conditions.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-sm font-medium text-carbon-600">
                <Package className="h-4 w-4" />配件是否齐全
              </label>
              <button
                type="button"
                onClick={() => setAccessoriesComplete(!accessoriesComplete)}
                className={`relative w-11 h-6 rounded-full transition-colors ${accessoriesComplete ? 'bg-brand-500' : 'bg-carbon-200'}`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${accessoriesComplete ? 'translate-x-5' : ''}`}
                />
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-sm font-medium text-carbon-600">
                <Tag className="h-4 w-4" />分类
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full border border-carbon-200 rounded-lg px-3 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition bg-white"
              >
                <option value="">请选择</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-sm font-medium text-carbon-600">
                <AlertCircle className="h-4 w-4" />瑕疵说明
              </label>
              <textarea
                value={flaws}
                onChange={(e) => setFlaws(e.target.value)}
                rows={3}
                className="w-full border border-carbon-200 rounded-lg px-3 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition resize-none"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-sm font-medium text-carbon-600">
                <Truck className="h-4 w-4" />是否包邮
              </label>
              <button
                type="button"
                onClick={() => setFreeShipping(!freeShipping)}
                className={`relative w-11 h-6 rounded-full transition-colors ${freeShipping ? 'bg-brand-500' : 'bg-carbon-200'}`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${freeShipping ? 'translate-x-5' : ''}`}
                />
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-sm font-medium text-carbon-600">照片URL</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={photoInput}
                  onChange={(e) => setPhotoInput(e.target.value)}
                  placeholder="输入图片URL"
                  className="flex-1 border border-carbon-200 rounded-lg px-3 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition"
                />
                <button
                  type="button"
                  onClick={addPhoto}
                  className="flex items-center gap-1 px-3 py-2 border border-carbon-200 rounded-lg text-sm text-carbon-600 hover:bg-carbon-50 transition"
                >
                  <Plus className="h-4 w-4" />添加
                </button>
              </div>
              {photoUrls.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {photoUrls.map((url, i) => (
                    <div key={i} className="relative group">
                      <img
                        src={url}
                        alt={`照片 ${i + 1}`}
                        className="w-16 h-16 object-cover rounded-lg border border-carbon-200"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(i)}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={!isValid || loading}
              className="w-full bg-brand-500 text-white rounded-lg py-3 font-medium hover:bg-brand-600 transition disabled:opacity-50"
            >
              {loading ? '发布中...' : '发布'}
            </button>
          </form>

          <div className="flex-1">
            <div className="sticky top-24">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Sparkles className="h-5 w-5 text-brand-500" />
                  <h2 className="text-lg font-semibold text-carbon-700">智能估价</h2>
                </div>

                {!canEstimate && (
                  <p className="text-sm text-carbon-400 text-center py-8">
                    请填写原价、购买时间、成色和分类以获取估价
                  </p>
                )}

                {estimating && (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}

                {canEstimate && estimate && !estimating && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <p className="text-sm text-carbon-400 mb-1">建议售价</p>
                      <p className="text-4xl font-bold text-brand-500">
                        ¥{estimate.suggestedPrice.toLocaleString()}
                      </p>
                      <p className="text-sm text-carbon-400 mt-1">
                        ¥{estimate.suggestedMin.toLocaleString()} - ¥{estimate.suggestedMax.toLocaleString()}
                      </p>
                    </div>

                    <div className="relative h-3 bg-carbon-100 rounded-full overflow-hidden">
                      <div
                        className="absolute h-full rounded-full"
                        style={{
                          left: `${((estimate.suggestedMin / estimate.suggestedMax) * 100)}%`,
                          right: '0%',
                          background: 'linear-gradient(90deg, #FFE6CC, #E8763A, #CC5F25)',
                          width: `${100 - (estimate.suggestedMin / estimate.suggestedMax) * 100}%`,
                        }}
                      />
                      <div
                        className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-brand-500 rounded-full shadow"
                        style={{
                          left: `${((estimate.suggestedPrice - estimate.suggestedMin) / (estimate.suggestedMax - estimate.suggestedMin)) * ((estimate.suggestedMax - estimate.suggestedMin) / estimate.suggestedMax) * 100 + (estimate.suggestedMin / estimate.suggestedMax) * 100}%`,
                          transform: 'translate(-50%, -50%)',
                        }}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-carbon-600">最终定价</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-carbon-400">¥</span>
                        <input
                          type="number"
                          value={finalPrice}
                          onChange={(e) => setFinalPrice(e.target.value)}
                          min="0"
                          step="0.01"
                          className="w-full border border-carbon-200 rounded-lg pl-7 pr-3 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={applySuggestedPrice}
                      className="w-full py-2 border border-brand-500 text-brand-500 rounded-lg text-sm font-medium hover:bg-brand-50 transition"
                    >
                      使用建议价
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
