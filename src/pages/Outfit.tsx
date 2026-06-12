import { useState, useMemo } from 'react'
import { Check, AlertTriangle, Droplets, Thermometer, Palette } from 'lucide-react'
import type { Clothing, Season } from '@/types'
import { CATEGORY_LABELS, COLOR_LABELS, COLOR_HEX, getColorsThatClash, SEASON_LABELS } from '@/types'
import { useWardrobeStore, generateId, getCurrentSeason } from '@/store/wardrobeStore'

type CategoryKey = 'top' | 'bottom' | 'outerwear' | 'shoes'

const OUTFIT_CATEGORIES: CategoryKey[] = ['top', 'bottom', 'outerwear', 'shoes']

interface SelectedIds {
  top: string
  bottom: string
  outerwear: string
  shoes: string
}

interface AlertItem {
  type: 'clash' | 'season' | 'dirty'
  title: string
  description: string
}

export default function Outfit() {
  const clothing = useWardrobeStore((s) => s.clothing)
  const addOutfitRecord = useWardrobeStore((s) => s.addOutfitRecord)

  const [selectedIds, setSelectedIds] = useState<SelectedIds>({
    top: '',
    bottom: '',
    outerwear: '',
    shoes: '',
  })

  const currentSeason = getCurrentSeason() as Season

  const today = new Date()
  const dateStr = today.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  })

  const categorizedClothing = useMemo(() => {
    const result: Record<CategoryKey, Clothing[]> = {
      top: [],
      bottom: [],
      outerwear: [],
      shoes: [],
    }
    for (const item of clothing) {
      if (item.category in result) {
        result[item.category as CategoryKey].push(item)
      }
    }
    return result
  }, [clothing])

  const selectedItems = useMemo(() => {
    const items: Clothing[] = []
    for (const key of OUTFIT_CATEGORIES) {
      const id = selectedIds[key]
      if (id) {
        const found = clothing.find((c) => c.id === id)
        if (found) items.push(found)
      }
    }
    return items
  }, [selectedIds, clothing])

  const alerts = useMemo(() => {
    const result: AlertItem[] = []

    const colors = selectedItems.map((item) => item.color)
    for (let i = 0; i < colors.length; i++) {
      for (let j = i + 1; j < colors.length; j++) {
        const clashes = getColorsThatClash(colors[i])
        if (clashes.includes(colors[j])) {
          const itemA = selectedItems.find((it) => it.color === colors[i])!
          const itemB = selectedItems.find((it) => it.color === colors[j] && it.id !== itemA.id)!
          result.push({
            type: 'clash',
            title: '颜色冲突',
            description: `${itemA.name}（${COLOR_LABELS[colors[i]]}）与${itemB.name}（${COLOR_LABELS[colors[j]]}）颜色搭配不协调`,
          })
        }
      }
    }

    for (const item of selectedItems) {
      if (!item.seasons.includes(currentSeason)) {
        result.push({
          type: 'season',
          title: '季节不匹配',
          description: `${item.name} 不适合${SEASON_LABELS[currentSeason]}季穿着`,
        })
      }
    }

    for (const item of selectedItems) {
      if (item.washStatus === 'dirty') {
        result.push({
          type: 'dirty',
          title: '衣物未清洗',
          description: `${item.name} 尚未清洗，建议更换`,
        })
      }
    }

    return result
  }, [selectedItems, currentSeason])

  const canConfirm = selectedIds.top && selectedIds.bottom && selectedIds.shoes

  const handleSelect = (category: CategoryKey, id: string) => {
    setSelectedIds((prev) => ({
      ...prev,
      [category]: prev[category] === id ? '' : id,
    }))
  }

  const handleConfirm = () => {
    if (!canConfirm) return
    addOutfitRecord({
      id: generateId(),
      date: today.toISOString().slice(0, 10),
      topId: selectedIds.top,
      bottomId: selectedIds.bottom,
      outerwearId: selectedIds.outerwear,
      shoesId: selectedIds.shoes,
      createdAt: new Date().toISOString(),
    })
    setSelectedIds({ top: '', bottom: '', outerwear: '', shoes: '' })
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-charcoal">每日搭配</h1>
          <p className="text-sm text-charcoal/50 mt-1">{dateStr}</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {OUTFIT_CATEGORIES.map((category) => (
                <div key={category}>
                  <h2 className="font-display text-lg font-semibold text-charcoal mb-3">
                    {CATEGORY_LABELS[category]}
                    {category === 'outerwear' && (
                      <span className="text-xs font-body text-charcoal/40 ml-1">（可选）</span>
                    )}
                  </h2>
                  <div className="space-y-2">
                    {categorizedClothing[category].length === 0 && (
                      <p className="text-xs text-charcoal/40 py-4 text-center">暂无衣物</p>
                    )}
                    {categorizedClothing[category].map((item) => {
                      const isSelected = selectedIds[category] === item.id
                      return (
                        <div
                          key={item.id}
                          onClick={() => handleSelect(category, item.id)}
                          className={`bg-white rounded-xl p-2 flex items-center gap-3 cursor-pointer border-2 transition-all ${
                            isSelected
                              ? 'border-warm-500 bg-warm-50 ring-2 ring-warm-500'
                              : 'border-transparent hover:border-warm-200'
                          }`}
                        >
                          {item.photoUrl ? (
                            <img
                              src={item.photoUrl}
                              alt={item.name}
                              className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                            />
                          ) : (
                            <div
                              className="w-12 h-12 rounded-lg flex-shrink-0 flex items-center justify-center"
                              style={{ backgroundColor: COLOR_HEX[item.color] }}
                            >
                              <span className="text-[10px] text-white/80 font-medium">
                                {item.name.slice(0, 1)}
                              </span>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-charcoal truncate">{item.name}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span
                                className="w-3 h-3 rounded-full flex-shrink-0 border border-charcoal/10"
                                style={{ backgroundColor: COLOR_HEX[item.color] }}
                              />
                              <span className="text-[10px] text-charcoal/50">{COLOR_LABELS[item.color]}</span>
                            </div>
                          </div>
                          {isSelected && (
                            <Check size={16} className="text-warm-500 flex-shrink-0" />
                          )}
                          {item.washStatus === 'dirty' && !isSelected && (
                            <Droplets size={14} className="text-red-400 flex-shrink-0" />
                          )}
                          {item.washStatus === 'washing' && !isSelected && (
                            <Droplets size={14} className="text-amber-400 flex-shrink-0" />
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <button
                onClick={handleConfirm}
                disabled={!canConfirm}
                className="w-full py-3 rounded-xl bg-warm-500 text-white text-sm font-medium hover:bg-warm-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-warm-500/25"
              >
                确认搭配
              </button>
            </div>
          </div>

          <div className="lg:w-80 flex-shrink-0">
            <h2 className="font-display text-lg font-semibold text-charcoal mb-3 flex items-center gap-2">
              <AlertTriangle size={18} className="text-amber-500" />
              智能提醒
            </h2>
            {alerts.length === 0 && selectedItems.length > 0 && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-start gap-3">
                <Check size={18} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-emerald-800">搭配良好</p>
                  <p className="text-xs text-emerald-600 mt-0.5">当前搭配没有发现问题</p>
                </div>
              </div>
            )}
            {alerts.length === 0 && selectedItems.length === 0 && (
              <div className="bg-warm-50 border border-warm-200 rounded-xl p-3">
                <p className="text-xs text-charcoal/40 text-center">选择衣物后将显示搭配提醒</p>
              </div>
            )}
            <div className="space-y-2">
              {alerts.map((alert, index) => {
                if (alert.type === 'clash') {
                  return (
                    <div
                      key={index}
                      className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-3"
                    >
                      <Palette size={18} className="text-amber-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-amber-800">{alert.title}</p>
                        <p className="text-xs text-amber-600 mt-0.5">{alert.description}</p>
                      </div>
                    </div>
                  )
                }
                if (alert.type === 'season') {
                  return (
                    <div
                      key={index}
                      className="bg-orange-50 border border-orange-200 rounded-xl p-3 flex items-start gap-3"
                    >
                      <Thermometer size={18} className="text-orange-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-orange-800">{alert.title}</p>
                        <p className="text-xs text-orange-600 mt-0.5">{alert.description}</p>
                      </div>
                    </div>
                  )
                }
                if (alert.type === 'dirty') {
                  return (
                    <div
                      key={index}
                      className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-3"
                    >
                      <Droplets size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-red-800">{alert.title}</p>
                        <p className="text-xs text-red-600 mt-0.5">{alert.description}</p>
                      </div>
                    </div>
                  )
                }
                return null
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
