import { useState, useMemo, useCallback } from 'react'
import { v4 } from 'uuid'
import { db } from '../db'
import { ClothingItem, ClothingCategory, ClothingColor, Season, Thickness, Occasion, CATEGORY_LABELS, COLOR_LABELS, THICKNESS_LABELS, COLOR_HEX } from '../types'

type ColorGroup = 'warm' | 'cool' | 'neutral'

const COLOR_GROUPS: Record<ColorGroup, ClothingColor[]> = {
  warm: ['red', 'orange', 'yellow', 'brown', 'beige', 'khaki'],
  cool: ['blue', 'navy', 'purple', 'green'],
  neutral: ['black', 'white', 'gray', 'denim'],
}

function getColorGroup(color: ClothingColor): ColorGroup {
  if (color === 'multicolor') return 'neutral'
  for (const [group, colors] of Object.entries(COLOR_GROUPS) as [ColorGroup, ClothingColor[]][]) {
    if (colors.includes(color)) return group
  }
  return 'neutral'
}

function scoreColorHarmony(items: ClothingItem[]): number {
  const groups = items.map(item => getColorGroup(item.color))
  let score = 0
  for (let i = 0; i < groups.length; i++) {
    for (let j = i + 1; j < groups.length; j++) {
      if (groups[i] === groups[j]) score += 3
      else if (groups[i] === 'neutral' || groups[j] === 'neutral') score += 2
      else score += 1
    }
  }
  return score
}

const SLOT_CATEGORIES: ClothingCategory[] = ['tops', 'pants', 'outerwear', 'shoes', 'accessories']

function tempToSeasons(temp: number): Season[] {
  if (temp < 10) return ['winter', 'all']
  if (temp > 20) return ['summer', 'all']
  return ['spring', 'autumn', 'all']
}

function filterByThickness(items: ClothingItem[], temp: number): ClothingItem[] {
  if (temp < 10) return items.filter(i => i.thickness === 'thick' || i.thickness === 'medium')
  if (temp > 20) return items.filter(i => i.thickness === 'thin' || i.thickness === 'medium')
  return items.filter(i => i.thickness === 'medium' || i.thickness === 'thin' || i.thickness === 'thick')
}

function filterByRain(items: ClothingItem[], isRaining: boolean): ClothingItem[] {
  if (!isRaining) return items
  return items.filter(i => {
    if (i.category === 'shoes') {
      return i.thickness !== 'thin'
    }
    return i.thickness !== 'thin'
  })
}

function filterByFormal(items: ClothingItem[], isFormal: boolean): ClothingItem[] {
  if (!isFormal) return items
  return items.filter(i => i.occasion.some(o => o === 'formal' || o === 'work'))
}

function filterBySeason(items: ClothingItem[], seasons: Season[]): ClothingItem[] {
  return items.filter(i => i.season.some(s => seasons.includes(s)))
}

function generateOutfits(filtered: Record<ClothingCategory, ClothingItem[]>, temp: number, count: number): ClothingItem[][] {
  const hasOuterwear = filtered.outerwear.length > 0
  const needOuterwear = temp < 10

  const tops = filtered.tops
  const pants = filtered.pants
  const outerwear = needOuterwear && hasOuterwear ? filtered.outerwear : (hasOuterwear ? filtered.outerwear : [])
  const shoes = filtered.shoes
  const accessories = filtered.accessories

  if (tops.length === 0 || pants.length === 0) return []
  if (needOuterwear && !hasOuterwear) return []

  const candidates: { items: ClothingItem[]; score: number }[] = []

  const maxAttempts = 60
  const usedKeys = new Set<string>()

  for (let attempt = 0; attempt < maxAttempts && candidates.length < count * 3; attempt++) {
    const picked: ClothingItem[] = []
    const pickRandom = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]

    picked.push(pickRandom(tops))
    picked.push(pickRandom(pants))

    if (needOuterwear && outerwear.length > 0) {
      picked.push(pickRandom(outerwear))
    } else if (outerwear.length > 0 && Math.random() > 0.4) {
      picked.push(pickRandom(outerwear))
    }

    if (shoes.length > 0) picked.push(pickRandom(shoes))
    if (accessories.length > 0 && Math.random() > 0.5) picked.push(pickRandom(accessories))

    const key = picked.map(i => i.id).sort().join(',')
    if (usedKeys.has(key)) continue
    usedKeys.add(key)

    candidates.push({
      items: picked,
      score: scoreColorHarmony(picked),
    })
  }

  candidates.sort((a, b) => b.score - a.score)
  return candidates.slice(0, count).map(c => c.items)
}

export default function WeatherMode() {
  const [temperature, setTemperature] = useState(20)
  const [isRaining, setIsRaining] = useState(false)
  const [isFormal, setIsFormal] = useState(false)
  const [savedMessage, setSavedMessage] = useState('')

  const allClothes = useMemo(() => db.getAllClothes(), [])

  const filteredClothes = useMemo(() => {
    const seasons = tempToSeasons(temperature)
    let items = filterBySeason(allClothes, seasons)
    items = filterByThickness(items, temperature)
    items = filterByRain(items, isRaining)
    items = filterByFormal(items, isFormal)

    const byCategory: Record<ClothingCategory, ClothingItem[]> = {
      tops: [],
      pants: [],
      outerwear: [],
      shoes: [],
      accessories: [],
    }
    items.forEach(item => {
      byCategory[item.category].push(item)
    })

    if (temperature < 10 && byCategory.outerwear.length === 0) {
      const allOuterwear = allClothes.filter(i => i.category === 'outerwear')
      const seasonMatch = allOuterwear.filter(i => i.season.some(s => seasons.includes(s)))
      byCategory.outerwear = seasonMatch
    }

    return byCategory
  }, [allClothes, temperature, isRaining, isFormal])

  const outfits = useMemo(() => {
    return generateOutfits(filteredClothes, temperature, 5)
  }, [filteredClothes, temperature])

  const canFormOutfits = filteredClothes.tops.length > 0 && filteredClothes.pants.length > 0
    && (temperature >= 10 || filteredClothes.outerwear.length > 0)

  const handleWear = useCallback((items: ClothingItem[]) => {
    const itemIds = items.map(i => i.id)
    const today = new Date().toISOString().slice(0, 10)
    const outfit = {
      id: v4(),
      name: `${temperature}°C穿搭`,
      items: itemIds,
      date: today,
      createdAt: new Date().toISOString(),
    }
    db.addOutfit(outfit)
    db.incrementWearCount(itemIds)
    setSavedMessage('已保存到今日穿搭！')
    setTimeout(() => setSavedMessage(''), 2000)
  }, [temperature])

  const tempEmoji = temperature < 10 ? '🥶' : temperature > 30 ? '☀️' : temperature > 20 ? '🌤️' : '🌥️'
  const tempPercent = ((temperature + 10) / 50) * 100

  const styles: Record<string, React.CSSProperties | ((...args: any[]) => React.CSSProperties)> = {
    container: {
      padding: 24,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      backgroundColor: '#f0f2f5',
      height: '100%',
      overflowY: 'auto',
    },
    title: {
      fontSize: 20,
      fontWeight: 700,
      color: '#1a1a2e',
      marginBottom: 20,
    },
    controlPanel: {
      backgroundColor: '#fff',
      borderRadius: 12,
      padding: 20,
      marginBottom: 20,
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    },
    sliderRow: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      marginBottom: 16,
    },
    tempDisplay: {
      fontSize: 32,
      fontWeight: 700,
      minWidth: 70,
      textAlign: 'center' as const,
    },
    sliderWrapper: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column' as const,
      gap: 4,
    },
    sliderLabels: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: 11,
      color: '#999',
    },
    slider: {
      width: '100%',
      height: 8,
      borderRadius: 4,
      outline: 'none',
      WebkitAppearance: 'none' as any,
      appearance: 'none' as any,
      background: 'linear-gradient(to right, #3b82f6, #60a5fa, #fbbf24, #ef4444)',
      cursor: 'pointer',
    },
    toggleRow: {
      display: 'flex',
      gap: 12,
    },
    toggleBtn: (active: boolean) => ({
      flex: 1,
      padding: '10px 16px',
      borderRadius: 8,
      border: active ? '2px solid #1677ff' : '2px solid #e8e8e8',
      backgroundColor: active ? '#e6f4ff' : '#fff',
      color: active ? '#1677ff' : '#666',
      fontSize: 14,
      fontWeight: 600 as const,
      cursor: 'pointer',
      transition: 'all 0.2s',
      textAlign: 'center' as const,
    }),
    filterInfo: {
      backgroundColor: '#fff',
      borderRadius: 12,
      padding: 16,
      marginBottom: 20,
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    },
    filterTags: {
      display: 'flex',
      flexWrap: 'wrap' as const,
      gap: 8,
      marginTop: 8,
    },
    filterTag: {
      padding: '4px 10px',
      borderRadius: 12,
      backgroundColor: '#f0f2f5',
      fontSize: 12,
      color: '#555',
    },
    outfitGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: 16,
    },
    outfitCard: {
      backgroundColor: '#fff',
      borderRadius: 12,
      padding: 16,
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      display: 'flex',
      flexDirection: 'column' as const,
      gap: 8,
    },
    outfitCardHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
    },
    outfitIndex: {
      fontSize: 14,
      fontWeight: 700,
      color: '#1a1a2e',
    },
    outfitScore: {
      fontSize: 12,
      color: '#999',
    },
    outfitItems: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: 6,
    },
    outfitItemRow: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '6px 8px',
      borderRadius: 8,
      backgroundColor: '#fafafa',
    },
    outfitItemPhoto: {
      width: 44,
      height: 44,
      objectFit: 'cover' as const,
      borderRadius: 6,
      flexShrink: 0,
    },
    outfitItemInfo: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: 2,
      overflow: 'hidden',
    },
    outfitItemName: {
      fontSize: 13,
      fontWeight: 500,
      color: '#333',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap' as const,
    },
    outfitItemMeta: {
      fontSize: 11,
      color: '#999',
    },
    colorDot: (color: ClothingColor) => ({
      width: 10,
      height: 10,
      borderRadius: '50%',
      display: 'inline-block',
      marginRight: 4,
      verticalAlign: 'middle',
      backgroundColor: color === 'multicolor' ? undefined : COLOR_HEX[color],
      background: color === 'multicolor' ? COLOR_HEX[color] : undefined,
      flexShrink: 0,
    }),
    wearBtn: {
      marginTop: 8,
      padding: '8px 0',
      borderRadius: 8,
      border: 'none',
      backgroundColor: '#1677ff',
      color: '#fff',
      fontSize: 14,
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      width: '100%',
    },
    emptyState: {
      textAlign: 'center' as const,
      padding: '40px 20px',
      backgroundColor: '#fff',
      borderRadius: 12,
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    },
    emptyIcon: {
      fontSize: 48,
      marginBottom: 12,
    },
    emptyText: {
      fontSize: 15,
      color: '#999',
      marginBottom: 8,
    },
    emptySubtext: {
      fontSize: 13,
      color: '#bbb',
    },
    toast: {
      position: 'fixed' as const,
      top: 20,
      left: '50%',
      transform: 'translateX(-50%)',
      padding: '10px 24px',
      borderRadius: 8,
      backgroundColor: '#52c41a',
      color: '#fff',
      fontSize: 14,
      fontWeight: 600,
      boxShadow: '0 4px 12px rgba(82,196,26,0.3)',
      zIndex: 1000,
      animation: 'fadeInOut 2s ease-in-out',
    },
  }

  const getActiveFilters = () => {
    const filters: string[] = []
    if (temperature < 10) {
      filters.push('厚/中等厚度')
      filters.push('需要外套')
    } else if (temperature > 20) {
      filters.push('薄/中等厚度')
    } else {
      filters.push('中等厚度')
    }
    if (isRaining) filters.push('适合雨天')
    if (isFormal) filters.push('正式/通勤')
    const seasons = tempToSeasons(temperature)
    filters.push(seasons.filter(s => s !== 'all').map(s => s === 'spring' ? '春' : s === 'summer' ? '夏' : s === 'autumn' ? '秋' : '冬').join('/') + '季')
    return filters
  }

  return (
    <div style={styles.container as React.CSSProperties}>
      {savedMessage && <div style={styles.toast as React.CSSProperties}>{savedMessage}</div>}

      <div style={styles.title as React.CSSProperties}>🌤️ 天气穿搭推荐</div>

      <div style={styles.controlPanel as React.CSSProperties}>
        <div style={styles.sliderRow as React.CSSProperties}>
          <span style={{ fontSize: 28 }}>{tempEmoji}</span>
          <div style={{ ...(styles.sliderWrapper as React.CSSProperties), flex: 1 }}>
            <input
              type="range"
              min={-10}
              max={40}
              value={temperature}
              onChange={e => setTemperature(Number(e.target.value))}
              style={styles.slider as React.CSSProperties}
            />
            <div style={styles.sliderLabels as React.CSSProperties}>
              <span>-10°C 🥶</span>
              <span>40°C ☀️</span>
            </div>
          </div>
          <span style={{ ...(styles.tempDisplay as React.CSSProperties), color: temperature < 10 ? '#3b82f6' : temperature > 25 ? '#ef4444' : '#f59e0b' }}>
            {temperature}°C
          </span>
        </div>

        <div style={styles.toggleRow as React.CSSProperties}>
          <button
            style={(styles.toggleBtn as (active: boolean) => React.CSSProperties)(isRaining)}
            onClick={() => setIsRaining(!isRaining)}
          >
            {isRaining ? '🌧️ 下雨' : '☀️ 晴天'}
          </button>
          <button
            style={(styles.toggleBtn as (active: boolean) => React.CSSProperties)(isFormal)}
            onClick={() => setIsFormal(!isFormal)}
          >
            {isFormal ? '🎩 正式场合' : '👕 休闲'}
          </button>
        </div>
      </div>

      <div style={styles.filterInfo as React.CSSProperties}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#666' }}>筛选条件</div>
        <div style={styles.filterTags as React.CSSProperties}>
          {getActiveFilters().map((f, i) => (
            <span key={i} style={styles.filterTag as React.CSSProperties}>{f}</span>
          ))}
          <span style={styles.filterTag as React.CSSProperties}>
            上衣 {filteredClothes.tops.length} | 裤子 {filteredClothes.pants.length} | 外套 {filteredClothes.outerwear.length} | 鞋子 {filteredClothes.shoes.length} | 配饰 {filteredClothes.accessories.length}
          </span>
        </div>
      </div>

      {canFormOutfits && outfits.length > 0 ? (
        <div style={styles.outfitGrid as React.CSSProperties}>
          {outfits.map((items, idx) => (
            <div key={idx} style={styles.outfitCard as React.CSSProperties}>
              <div style={styles.outfitCardHeader as React.CSSProperties}>
                <span style={styles.outfitIndex as React.CSSProperties}>推荐 #{idx + 1}</span>
                <span style={styles.outfitScore as React.CSSProperties}>
                  搭配指数 {scoreColorHarmony(items)}
                </span>
              </div>
              <div style={styles.outfitItems as React.CSSProperties}>
                {items.map(item => (
                  <div key={item.id} style={styles.outfitItemRow as React.CSSProperties}>
                    <img src={item.photo} alt={item.name} style={styles.outfitItemPhoto as React.CSSProperties} />
                    <div style={styles.outfitItemInfo as React.CSSProperties}>
                      <span style={styles.outfitItemName as React.CSSProperties}>
                        <span style={(styles.colorDot as (color: ClothingColor) => React.CSSProperties)(item.color)} />
                        {item.name}
                      </span>
                      <span style={styles.outfitItemMeta as React.CSSProperties}>
                        {CATEGORY_LABELS[item.category]} · {THICKNESS_LABELS[item.thickness]} · {COLOR_LABELS[item.color]}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <button style={styles.wearBtn as React.CSSProperties} onClick={() => handleWear(items)}>
                穿这套
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div style={styles.emptyState as React.CSSProperties}>
          <div style={styles.emptyIcon as React.CSSProperties}>👗</div>
          <div style={styles.emptyText as React.CSSProperties}>衣物不足以组成完整穿搭</div>
          <div style={styles.emptySubtext as React.CSSProperties}>
            {filteredClothes.tops.length === 0 && '缺少上衣 · '}
            {filteredClothes.pants.length === 0 && '缺少裤子 · '}
            {temperature < 10 && filteredClothes.outerwear.length === 0 && '低温需外套 · '}
            {'请添加更多衣物或调整筛选条件'}
          </div>
        </div>
      )}

      <style>{`
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #fff;
          border: 3px solid #1677ff;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0,0,0,0.15);
          margin-top: -6px;
        }
        input[type="range"]::-webkit-slider-runnable-track {
          height: 8px;
          border-radius: 4px;
        }
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translateX(-50%) translateY(-10px); }
          15% { opacity: 1; transform: translateX(-50%) translateY(0); }
          85% { opacity: 1; transform: translateX(-50%) translateY(0); }
          100% { opacity: 0; transform: translateX(-50%) translateY(-10px); }
        }
      `}</style>
    </div>
  )
}
