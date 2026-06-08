import { useMemo } from 'react'
import { db } from '../db'
import { ClothingColor, ClothingCategory, Occasion, COLOR_LABELS, COLOR_HEX, CATEGORY_LABELS, OCCASION_LABELS } from '../types'

const PASTEL_COLORS = ['#a8d8ea', '#aa96da', '#fcbad3', '#ffffd2', '#a8e6cf']

export default function StatisticsPage() {
  const clothes = db.getAllClothes()
  const outfits = db.getAllOutfits()

  const totalClothes = clothes.length
  const totalOutfits = outfits.length
  const avgWear = totalClothes > 0 ? (clothes.reduce((s, c) => s + c.totalWearCount, 0) / totalClothes).toFixed(1) : '0'
  const totalValue = clothes.reduce((s, c) => s + (c.price || 0), 0)

  const leastWorn = useMemo(() => {
    return [...clothes].sort((a, b) => a.totalWearCount - b.totalWearCount).slice(0, 10)
  }, [clothes])

  const colorDist = useMemo(() => {
    const map: Partial<Record<ClothingColor, number>> = {}
    clothes.forEach(c => { map[c.color] = (map[c.color] || 0) + 1 })
    return (Object.entries(map) as [ClothingColor, number][])
      .sort((a, b) => b[1] - a[1])
  }, [clothes])

  const categoryDist = useMemo(() => {
    const map: Partial<Record<ClothingCategory, number>> = {}
    clothes.forEach(c => { map[c.category] = (map[c.category] || 0) + 1 })
    return (Object.entries(map) as [ClothingCategory, number][])
      .sort((a, b) => b[1] - a[1])
  }, [clothes])

  const occasionDist = useMemo(() => {
    const map: Partial<Record<Occasion, number>> = {}
    clothes.forEach(c => {
      c.occasion.forEach(o => { map[o] = (map[o] || 0) + 1 })
    })
    return (Object.entries(map) as [Occasion, number][])
      .sort((a, b) => b[1] - a[1])
  }, [clothes])

  const monthlyTrend = useMemo(() => {
    const now = new Date()
    const months: { label: string; count: number }[] = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const year = d.getFullYear()
      const month = d.getMonth()
      const label = `${month + 1}月`
      const count = outfits.filter(o => {
        const od = new Date(o.date)
        return od.getFullYear() === year && od.getMonth() === month
      }).length
      months.push({ label, count })
    }
    return months
  }, [outfits])

  const occasionTotal = occasionDist.reduce((s, [, v]) => s + v, 0)
  const occasionConic = occasionDist.map(([, v], i) => {
    const start = occasionDist.slice(0, i).reduce((s, [, v2]) => s + (v2 / occasionTotal) * 360, 0)
    const end = start + (v / occasionTotal) * 360
    return `${PASTEL_COLORS[i % PASTEL_COLORS.length]} ${start}deg ${end}deg`
  }).join(', ')

  const maxColorCount = Math.max(...colorDist.map(([, v]) => v), 1)
  const maxCatCount = Math.max(...categoryDist.map(([, v]) => v), 1)
  const maxMonthCount = Math.max(...monthlyTrend.map(m => m.count), 1)

  return (
    <div style={{ padding: 24, maxWidth: 960, margin: '0 auto' }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>衣橱统计</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        <StatCard label="衣物总数" value={totalClothes} unit="件" />
        <StatCard label="穿搭总数" value={totalOutfits} unit="套" />
        <StatCard label="平均穿着次数" value={avgWear} unit="次" />
        <StatCard label="衣橱总价值" value={`¥${totalValue.toLocaleString()}`} />
      </div>

      <Section title="利用率最低">
        <div style={{ display: 'grid', gap: 8 }}>
          {leastWorn.map(item => (
            <div key={item.id} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 14px', borderRadius: 10, background: '#fff',
              border: item.totalWearCount === 0 ? '1px solid #e53935' : '1px solid #f0f0f0',
            }}>
              <img src={item.photo} alt={item.name} style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover' }} />
              <span style={{ flex: 1, fontSize: 14 }}>{item.name}</span>
              <span style={{
                fontSize: 13, fontWeight: 600,
                color: item.totalWearCount === 0 ? '#e53935' : '#666',
              }}>
                {item.totalWearCount} 次
              </span>
            </div>
          ))}
          {leastWorn.length === 0 && <EmptyHint />}
        </div>
      </Section>

      <Section title="颜色分布">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {colorDist.map(([color, count]) => (
            <div key={color} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 48, fontSize: 13, textAlign: 'right', color: '#555' }}>{COLOR_LABELS[color]}</span>
              <div style={{ flex: 1, background: '#f5f5f5', borderRadius: 6, height: 28, position: 'relative', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${(count / maxColorCount) * 100}%`,
                  background: COLOR_HEX[color],
                  borderRadius: 6,
                  transition: 'width 0.3s',
                  display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 8,
                }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: color === 'white' || color === 'beige' || color === 'yellow' ? '#333' : '#fff' }}>{count}</span>
                </div>
              </div>
            </div>
          ))}
          {colorDist.length === 0 && <EmptyHint />}
        </div>
      </Section>

      <Section title="分类统计">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {categoryDist.map(([cat, count], i) => (
            <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 48, fontSize: 13, textAlign: 'right', color: '#555' }}>{CATEGORY_LABELS[cat]}</span>
              <div style={{ flex: 1, background: '#f5f5f5', borderRadius: 6, height: 28, position: 'relative', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${(count / maxCatCount) * 100}%`,
                  background: PASTEL_COLORS[i % PASTEL_COLORS.length],
                  borderRadius: 6,
                  transition: 'width 0.3s',
                  display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 8,
                }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#333' }}>{count}</span>
                </div>
              </div>
            </div>
          ))}
          {categoryDist.length === 0 && <EmptyHint />}
        </div>
      </Section>

      <Section title="场合覆盖">
        <div style={{ display: 'flex', alignItems: 'center', gap: 32, flexWrap: 'wrap' }}>
          {occasionDist.length > 0 ? (
            <>
              <div style={{
                width: 180, height: 180, borderRadius: '50%',
                background: `conic-gradient(${occasionConic})`,
                flexShrink: 0,
              }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {occasionDist.map(([occ, count], i) => (
                  <div key={occ} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 14, height: 14, borderRadius: 3, background: PASTEL_COLORS[i % PASTEL_COLORS.length], flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: '#555' }}>{OCCASION_LABELS[occ]}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#333' }}>{count}</span>
                  </div>
                ))}
              </div>
            </>
          ) : <EmptyHint />}
        </div>
      </Section>

      <Section title="月度穿搭趋势">
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 160 }}>
          {monthlyTrend.map(m => (
            <div key={m.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#333' }}>{m.count}</span>
              <div style={{
                width: '100%',
                maxWidth: 48,
                height: maxMonthCount > 0 ? `${(m.count / maxMonthCount) * 120}px` : 0,
                minHeight: m.count > 0 ? 4 : 0,
                background: 'linear-gradient(180deg, #a8d8ea, #7ec8e3)',
                borderRadius: '6px 6px 2px 2px',
                transition: 'height 0.3s',
              }} />
              <span style={{ fontSize: 12, color: '#888' }}>{m.label}</span>
            </div>
          ))}
        </div>
      </Section>
    </div>
  )
}

function StatCard({ label, value, unit }: { label: string; value: string | number; unit?: string }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 14, padding: '20px 18px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    }}>
      <div style={{ fontSize: 13, color: '#999', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 700, color: '#222' }}>
        {value}{unit && <span style={{ fontSize: 14, fontWeight: 400, color: '#999', marginLeft: 2 }}>{unit}</span>}
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 14, padding: '20px 18px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 20,
    }}>
      <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: '#333' }}>{title}</h2>
      {children}
    </div>
  )
}

function EmptyHint() {
  return <div style={{ fontSize: 13, color: '#bbb', padding: '12px 0', textAlign: 'center' }}>暂无数据</div>
}
