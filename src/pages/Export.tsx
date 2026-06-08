import { useState } from 'react'
import { useTravelStore } from '@/store/useTravelStore'
import { TAG_CONFIG, ALL_TAGS } from '@/types'
import { formatDate, formatDateFull } from '@/utils/helpers'
import { Link } from 'react-router-dom'
import { Download, Camera, Receipt, MapPin, Check } from 'lucide-react'
import html2canvas from 'html2canvas'

export default function Export() {
  const { currentTripId, trips, getTripDays, getTripPhotos, getTripTotalCost, getTagCost, getDayCost } = useTravelStore()
  const trip = trips.find((t) => t.id === currentTripId)
  const [copied, setCopied] = useState(false)

  if (!trip) {
    return (
      <div className="page-container flex flex-col items-center justify-center gap-4 pt-20">
        <Camera className="w-16 h-16 text-warm-peach" />
        <p className="text-warm-brown/50 text-lg">暂无旅行数据</p>
        <Link to="/" className="btn-primary">返回首页</Link>
      </div>
    )
  }

  const days = getTripDays(trip.id)
  const photos = getTripPhotos(trip.id)
  const totalCost = getTripTotalCost(trip.id)
  const locations = [...new Set(days.map((d) => d.location))]
  const keyPhotos = photos.slice(0, 3)

  const tagCosts = ALL_TAGS.map((tag) => ({
    tag,
    cost: getTagCost(trip.id, tag),
    config: TAG_CONFIG[tag],
  })).filter(t => t.cost > 0)

  const dailyCosts = days.map((d) => ({
    date: d.date,
    location: d.location,
    cost: getDayCost(d.id),
  }))
  const maxDailyCost = Math.max(...dailyCosts.map((d) => d.cost), 1)

  const handleExportPoster = async () => {
    const el = document.getElementById('poster')
    if (!el) return
    const canvas = await html2canvas(el, { scale: 2, useCORS: true })
    const link = document.createElement('a')
    link.download = `${trip.title}-海报.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  const sanitizeFilename = (name: string) =>
    name.replace(/[\\/:*?"<>|]/g, '-').replace(/\s+/g, ' ').trim()

  const handleExportCost = () => {
    const lines: string[] = []
    lines.push(`【${trip.title} 花费小结】`)
    lines.push(`总花费：¥${totalCost.toFixed(0)}`)
    lines.push('')
    lines.push('分类统计：')
    tagCosts.forEach(({ tag, cost, config }) => {
      lines.push(`  ${config.emoji} ${tag}：¥${cost.toFixed(0)}`)
    })
    lines.push('')
    lines.push('每日花费：')
    dailyCosts.forEach(({ date, location, cost }) => {
      lines.push(`  ${formatDate(date)} ${location}：¥${cost.toFixed(0)}`)
    })
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${sanitizeFilename(trip.title)}-花费小结.txt`
    a.click()
    URL.revokeObjectURL(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="page-container px-4 pt-4">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/" className="text-warm-brown/60 hover:text-warm-orange transition-colors text-sm">
          ← 返回
        </Link>
        <h1 className="section-title">导出</h1>
      </div>

      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Camera className="w-5 h-5 text-warm-orange" />
          <h2 className="text-lg font-semibold text-warm-brown">路线海报</h2>
        </div>

        <div
          id="poster"
          className="rounded-2xl overflow-hidden p-6 text-white relative"
          style={{ background: 'linear-gradient(135deg, #E8722A 0%, #FFD4B2 60%, #FFF8F0 100%)' }}
        >
          <div className="absolute top-4 right-4 text-6xl opacity-10">✈️</div>
          <div className="absolute bottom-4 left-4 text-5xl opacity-10">🌍</div>

          <p className="text-xs uppercase tracking-widest opacity-70 mb-2 font-display">Travel Story</p>
          <h3 className="text-2xl font-bold mb-1 font-display">{trip.title}</h3>
          <p className="text-sm opacity-80 mb-4">
            {formatDateFull(trip.startDate)} — {formatDateFull(trip.endDate)}
          </p>

          <div className="flex items-center gap-1 text-sm mb-5 flex-wrap">
            <MapPin className="w-3.5 h-3.5" />
            {locations.map((loc, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && <span className="opacity-60">→</span>}
                <span>{loc}</span>
              </span>
            ))}
          </div>

          {keyPhotos.length > 0 && (
            <div className="flex gap-2 mb-4">
              {keyPhotos.map((p) => (
                <img
                  key={p.id}
                  src={p.url}
                  alt={p.location}
                  crossOrigin="anonymous"
                  className="w-1/3 h-20 object-cover rounded-lg"
                />
              ))}
            </div>
          )}

          <div className="flex items-center justify-between text-xs opacity-60">
            <span>{days.length}天 · {photos.length}张照片</span>
            <span>¥{totalCost.toFixed(0)}</span>
          </div>
        </div>

        <button
          onClick={handleExportPoster}
          className="btn-primary w-full flex items-center justify-center gap-2 py-3 mt-4"
        >
          <Download className="w-4 h-4" />
          导出海报
        </button>
      </div>

      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Receipt className="w-5 h-5 text-warm-orange" />
          <h2 className="text-lg font-semibold text-warm-brown">花费小结</h2>
        </div>

        <div className="card mb-4">
          <p className="text-sm text-warm-brown/50 mb-1">总花费</p>
          <p className="text-3xl font-bold text-warm-orange">¥{totalCost.toFixed(0)}</p>
        </div>

        {tagCosts.length > 0 && (
          <div className="card mb-4">
            <p className="text-sm font-medium text-warm-brown mb-3">分类统计</p>
            <div className="space-y-3">
              {tagCosts.map(({ tag, cost, config }) => (
                <div key={tag}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-warm-brown/70">{config.emoji} {tag}</span>
                    <span className="font-medium" style={{ color: config.color }}>
                      ¥{cost.toFixed(0)}
                    </span>
                  </div>
                  <div className="h-2 bg-warm-cream rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: totalCost > 0 ? `${(cost / totalCost) * 100}%` : '0%',
                        backgroundColor: config.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="card mb-4">
          <p className="text-sm font-medium text-warm-brown mb-3">每日花费</p>
          <div className="space-y-2">
            {dailyCosts.map(({ date, location, cost }) => (
              <div key={date} className="flex items-center gap-2">
                <span className="text-xs text-warm-brown/50 w-20 shrink-0 truncate">{formatDate(date)} {location}</span>
                <div className="flex-1 h-5 bg-warm-cream rounded overflow-hidden">
                  <div
                    className="h-full rounded transition-all"
                    style={{
                      width: `${(cost / maxDailyCost) * 100}%`,
                      background: 'linear-gradient(to right, #E8722A, #FFD4B2)',
                    }}
                  />
                </div>
                <span className="text-xs font-medium text-warm-brown w-14 text-right shrink-0">
                  ¥{cost.toFixed(0)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={handleExportCost}
          className="btn-primary w-full flex items-center justify-center gap-2 py-3"
        >
          {copied ? <Check className="w-4 h-4" /> : <Download className="w-4 h-4" />}
          {copied ? '下载完成' : '导出花费小结'}
        </button>
      </div>
    </div>
  )
}
