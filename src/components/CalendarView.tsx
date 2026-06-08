import { useState, useMemo, useEffect } from 'react'
import { db } from '../db'
import { Outfit, CATEGORY_LABELS, COLOR_HEX } from '../types'

function formatDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function getMonthRange(year: number, month: number) {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const start = new Date(firstDay)
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7))
  const end = new Date(lastDay)
  end.setDate(end.getDate() + (7 - ((end.getDay() + 1) % 7)) % 7)
  return { start, end }
}

function getCalendarDays(year: number, month: number): Date[] {
  const { start, end } = getMonthRange(year, month)
  const days: Date[] = []
  const current = new Date(start)
  while (current <= end) {
    days.push(new Date(current))
    current.setDate(current.getDate() + 1)
  }
  return days
}

const WEEKDAYS = ['一', '二', '三', '四', '五', '六', '日']
const MONTHS = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']

export default function CalendarView() {
  const [year, setYear] = useState(new Date().getFullYear())
  const [month, setMonth] = useState(new Date().getMonth())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [outfits, setOutfits] = useState<Outfit[]>([])
  const [clothesMap, setClothesMap] = useState<Record<string, { name: string; photo: string; category: string; color: string }>>({})

  const calendarDays = useMemo(() => getCalendarDays(year, month), [year, month])

  const rangeStart = useMemo(() => {
    const { start } = getMonthRange(year, month)
    const before = new Date(start)
    before.setDate(before.getDate() - 3)
    return formatDate(before)
  }, [year, month])

  const rangeEnd = useMemo(() => {
    const { end } = getMonthRange(year, month)
    return formatDate(end)
  }, [year, month])

  useEffect(() => {
    const data = db.getOutfitsInRange(rangeStart, rangeEnd)
    setOutfits(data)
    const allIds = new Set<string>()
    data.forEach(o => o.items.forEach(id => allIds.add(id)))
    const map: Record<string, { name: string; photo: string; category: string; color: string }> = {}
    allIds.forEach(id => {
      const item = db.getClothingById(id)
      if (item) {
        map[id] = { name: item.name, photo: item.photo, category: item.category, color: item.color }
      }
    })
    setClothesMap(map)
  }, [rangeStart, rangeEnd])

  const outfitsByDate = useMemo(() => {
    const map: Record<string, Outfit[]> = {}
    outfits.forEach(o => {
      if (!map[o.date]) map[o.date] = []
      map[o.date].push(o)
    })
    return map
  }, [outfits])

  const recentItemIds = useMemo(() => {
    if (!selectedDate) return new Set<string>()
    const selected = new Date(selectedDate)
    const ids = new Set<string>()
    for (let i = 1; i <= 3; i++) {
      const prev = new Date(selected)
      prev.setDate(prev.getDate() - i)
      const key = formatDate(prev)
      const dayOutfits = outfitsByDate[key] || []
      dayOutfits.forEach(o => o.items.forEach(id => ids.add(id)))
    }
    return ids
  }, [selectedDate, outfitsByDate])

  const isRepeatingOutfit = (outfit: Outfit, dateStr: string): boolean => {
    const current = new Date(dateStr)
    for (let i = 1; i <= 3; i++) {
      const prev = new Date(current)
      prev.setDate(prev.getDate() - i)
      const key = formatDate(prev)
      const prevOutfits = outfitsByDate[key] || []
      for (const po of prevOutfits) {
        if (po.items.length === outfit.items.length && po.items.every(id => outfit.items.includes(id))) {
          return true
        }
      }
    }
    return false
  }

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }

  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  const goToday = () => {
    const now = new Date()
    setYear(now.getFullYear())
    setMonth(now.getMonth())
  }

  const selectedOutfits = selectedDate ? (outfitsByDate[selectedDate] || []) : []

  const handleDelete = (id: string) => {
    db.deleteOutfit(id)
    setOutfits(prev => prev.filter(o => o.id !== id))
  }

  const isCurrentMonth = (date: Date) => date.getMonth() === month && date.getFullYear() === year

  return (
    <div style={{ display: 'flex', height: '100%', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <div style={{ flex: 1, padding: 24, overflow: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={prevMonth} style={navBtnStyle}>‹</button>
            <span style={{ fontSize: 22, fontWeight: 700, color: '#1a1a2e', minWidth: 160, textAlign: 'center' }}>
              {year}年 {MONTHS[month]}
            </span>
            <button onClick={nextMonth} style={navBtnStyle}>›</button>
          </div>
          <button onClick={goToday} style={{ ...navBtnStyle, fontSize: 13, padding: '6px 16px', fontWeight: 500 }}>
            今天
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, backgroundColor: '#e8e8ef', borderRadius: 12, overflow: 'hidden' }}>
          {WEEKDAYS.map(d => (
            <div key={d} style={{ textAlign: 'center', padding: '10px 0', backgroundColor: '#f0f0f5', fontWeight: 600, fontSize: 13, color: '#666' }}>
              {d}
            </div>
          ))}
          {calendarDays.map((date, i) => {
            const dateStr = formatDate(date)
            const dayOutfits = outfitsByDate[dateStr] || []
            const inMonth = isCurrentMonth(date)
            const isSelected = selectedDate === dateStr
            const isToday = formatDate(new Date()) === dateStr

            return (
              <div
                key={i}
                onClick={() => setSelectedDate(dateStr)}
                style={{
                  backgroundColor: isSelected ? '#ede9fe' : inMonth ? '#fff' : '#f8f8fb',
                  minHeight: 100,
                  padding: 6,
                  cursor: 'pointer',
                  transition: 'background-color 0.15s',
                  position: 'relative',
                  opacity: inMonth ? 1 : 0.45,
                  borderBottom: isSelected ? '2px solid #7c3aed' : '2px solid transparent',
                }}
              >
                <div style={{
                  fontSize: 13,
                  fontWeight: isToday ? 700 : 400,
                  color: isToday ? '#7c3aed' : '#333',
                  marginBottom: 4,
                  width: 24,
                  height: 24,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  backgroundColor: isToday ? '#ede9fe' : 'transparent',
                }}>
                  {date.getDate()}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  {dayOutfits.slice(0, 2).map(outfit => {
                    const repeating = isRepeatingOutfit(outfit, dateStr)
                    return (
                      <div key={outfit.id} style={{ position: 'relative' }}>
                        <div style={{ display: 'flex', marginLeft: outfit.items.length > 1 ? 0 : 0 }}>
                          {outfit.items.slice(0, 3).map((itemId, j) => {
                            const item = clothesMap[itemId]
                            return (
                              <div
                                key={itemId}
                                style={{
                                  width: 28,
                                  height: 28,
                                  borderRadius: 4,
                                  overflow: 'hidden',
                                  border: '1.5px solid #fff',
                                  marginLeft: j > 0 ? -8 : 0,
                                  position: 'relative',
                                  zIndex: 3 - j,
                                  boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                                }}
                              >
                                {item ? (
                                  <img src={item.photo} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                  <div style={{ width: '100%', height: '100%', backgroundColor: '#ddd' }} />
                                )}
                              </div>
                            )
                          })}
                        </div>
                        {repeating && (
                          <span style={{
                            position: 'absolute',
                            top: -6,
                            right: -8,
                            fontSize: 9,
                            fontWeight: 700,
                            backgroundColor: '#fbbf24',
                            color: '#78350f',
                            padding: '0 4px',
                            borderRadius: 6,
                            lineHeight: '16px',
                            whiteSpace: 'nowrap',
                            zIndex: 5,
                          }}>
                            ⚠️重复
                          </span>
                        )}
                      </div>
                    )
                  })}
                  {dayOutfits.length > 2 && (
                    <span style={{ fontSize: 10, color: '#7c3aed', fontWeight: 600, alignSelf: 'center', marginLeft: 2 }}>
                      +{dayOutfits.length - 2}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div style={{
        width: selectedDate ? 360 : 0,
        overflow: 'hidden',
        transition: 'width 0.3s ease',
        borderLeft: selectedDate ? '1px solid #e5e5ea' : 'none',
        backgroundColor: '#fff',
        flexShrink: 0,
      }}>
        {selectedDate && (
          <div style={{ padding: 24, height: '100%', overflow: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#1a1a2e' }}>
                {selectedDate}
              </h3>
              <button onClick={() => setSelectedDate(null)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#999', padding: 4 }}>
                ✕
              </button>
            </div>

            {selectedOutfits.length === 0 ? (
              <p style={{ color: '#999', fontSize: 14, textAlign: 'center', marginTop: 40 }}>当天没有穿搭记录</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {selectedOutfits.map(outfit => (
                  <div key={outfit.id} style={{
                    backgroundColor: '#f9f9fb',
                    borderRadius: 12,
                    padding: 16,
                    border: '1px solid #eee',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <span style={{ fontWeight: 600, fontSize: 15, color: '#333' }}>{outfit.name}</span>
                      <button
                        onClick={() => handleDelete(outfit.id)}
                        style={{
                          background: '#fef2f2',
                          color: '#dc2626',
                          border: '1px solid #fecaca',
                          borderRadius: 6,
                          padding: '4px 10px',
                          fontSize: 12,
                          cursor: 'pointer',
                          fontWeight: 500,
                        }}
                      >
                        删除
                      </button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {outfit.items.map(itemId => {
                        const item = clothesMap[itemId]
                        if (!item) return null
                        const isRecent = recentItemIds.has(itemId)
                        return (
                          <div
                            key={itemId}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 10,
                              padding: 8,
                              borderRadius: 8,
                              backgroundColor: isRecent ? '#fef3c7' : '#fff',
                              border: isRecent ? '1px solid #fbbf24' : '1px solid #eee',
                            }}
                          >
                            <div style={{
                              width: 48,
                              height: 48,
                              borderRadius: 8,
                              overflow: 'hidden',
                              flexShrink: 0,
                              border: `2px solid ${isRecent ? '#fbbf24' : '#eee'}`,
                            }}>
                              <img src={item.photo} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 14, fontWeight: 600, color: '#333', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {item.name}
                              </div>
                              <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
                                {CATEGORY_LABELS[item.category as keyof typeof CATEGORY_LABELS]}
                              </div>
                            </div>
                            <div style={{
                              width: 18,
                              height: 18,
                              borderRadius: '50%',
                              background: COLOR_HEX[item.color as keyof typeof COLOR_HEX],
                              flexShrink: 0,
                              border: '1.5px solid #ddd',
                            }} />
                            {isRecent && (
                              <span style={{
                                fontSize: 10,
                                fontWeight: 700,
                                color: '#92400e',
                                backgroundColor: '#fde68a',
                                padding: '2px 6px',
                                borderRadius: 4,
                                whiteSpace: 'nowrap',
                              }}>
                                近3天穿过
                              </span>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

const navBtnStyle: React.CSSProperties = {
  background: '#f3f0ff',
  border: '1px solid #ddd6fe',
  borderRadius: 8,
  padding: '6px 12px',
  fontSize: 18,
  cursor: 'pointer',
  color: '#7c3aed',
  fontWeight: 600,
  lineHeight: 1,
  transition: 'background-color 0.15s',
}
