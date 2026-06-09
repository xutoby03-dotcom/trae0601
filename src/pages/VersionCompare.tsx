import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useBakingStore } from '@/store/bakingStore'
import {
  PROBLEM_TAG_LABELS,
  PRODUCT_TYPE_LABELS,
  RESULT_LABELS,
  ADJUSTMENT_ITEM_LABELS,
  type AdjustmentItem,
} from '@/types'
import {
  ArrowLeft,
  GitBranch,
  Star,
  ChefHat,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Thermometer,
  ImageOff,
  BookOpen,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react'
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Legend,
} from 'recharts'

const TASTE_DIMENSIONS = [
  { key: 'tasteScore', label: '口感' },
  { key: 'appearance', label: '外观' },
  { key: 'texture', label: '组织' },
  { key: 'sweetness', label: '甜度' },
  { key: 'moisture', label: '湿润度' },
]

function deriveDimensions(score: number) {
  return {
    tasteScore: score * 20,
    appearance: Math.max(0, score * 20 - Math.random() * 10),
    texture: Math.max(0, score * 18 + Math.random() * 5),
    sweetness: 60 + Math.random() * 30,
    moisture: score * 15 + Math.random() * 15,
  }
}

const VERSION_COLORS = ['#D4A574', '#8B5E3C', '#27AE60', '#F39C12']

function AdjustmentBadge({ item, before, after, unit }: { item: AdjustmentItem; before: number; after: number; unit: string }) {
  const diff = after - before
  const Icon = diff > 0 ? TrendingUp : diff < 0 ? TrendingDown : Minus
  const color = diff > 0 ? 'text-bake-red' : diff < 0 ? 'text-bake-green' : 'text-bake-brown/50'
  const bg = diff > 0 ? 'bg-bake-red/10' : diff < 0 ? 'bg-bake-green/10' : 'bg-bake-light'
  const sign = diff > 0 ? '+' : ''

  return (
    <span className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full ${bg} ${color} font-medium`}>
      <Icon className="w-3 h-3" />
      {ADJUSTMENT_ITEM_LABELS[item]}
      <span className="font-mono">{sign}{diff}{unit}</span>
    </span>
  )
}

export default function VersionCompare() {
  const { productId } = useParams<{ productId: string }>()
  const { getRecordsByProduct } = useBakingStore()

  const versions = productId ? getRecordsByProduct(productId) : []

  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(versions.slice(-3).map((v) => v.id))
  )

  if (versions.length < 2) {
    return (
      <div className="min-h-screen bg-bake-cream flex items-center justify-center font-body">
        <div className="text-center">
          <GitBranch className="w-12 h-12 text-bake-caramel mx-auto mb-3" />
          <p className="text-bake-dark">至少需要2个版本才能对比</p>
          <Link to="/" className="inline-block mt-4 text-bake-brown hover:text-bake-dark underline">
            返回首页
          </Link>
        </div>
      </div>
    )
  }

  const toggleVersion = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        if (next.size > 1) next.delete(id)
      } else {
        if (next.size < 4) next.add(id)
      }
      return next
    })
  }

  const selectedVersions = versions.filter((v) => selectedIds.has(v.id))

  const radarData = TASTE_DIMENSIONS.map((dim) => {
    const entry: Record<string, string | number> = { dimension: dim.label }
    selectedVersions.forEach((v) => {
      const dims = deriveDimensions(v.tasteScore)
      entry[v.versionLabel] = Math.round(dims[dim.key as keyof typeof dims])
    })
    return entry
  })

  const productName = versions[0]?.productName ?? ''

  return (
    <div className="min-h-screen bg-bake-cream font-body">
      <header className="sticky top-0 z-10 bg-bake-card/95 backdrop-blur-sm border-b border-bake-border">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link to="/" className="p-1.5 rounded-lg hover:bg-bake-warm transition-colors text-bake-brown">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-display font-bold text-bake-dark truncate">
              版本对比
            </h1>
            <p className="text-xs text-bake-brown/60 truncate">{productName}</p>
          </div>
          <Link
            to={`/version/${productId}`}
            className="text-xs px-3 py-1.5 rounded-full bg-bake-caramel/15 text-bake-caramel hover:bg-bake-caramel/25 transition-colors font-medium"
          >
            版本管理
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        <section className="rounded-bake bg-bake-card p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-bake-brown mb-3">选择对比版本（2-4个）</h2>
          <div className="flex flex-wrap gap-2">
            {versions.map((v, idx) => {
              const isSelected = selectedIds.has(v.id)
              const colorIdx = selectedVersions.indexOf(v)
              return (
                <button
                  key={v.id}
                  onClick={() => toggleVersion(v.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    isSelected
                      ? 'text-white shadow-sm'
                      : 'bg-bake-light text-bake-brown/60 border border-bake-border hover:border-bake-caramel'
                  }`}
                  style={isSelected ? { backgroundColor: VERSION_COLORS[colorIdx % VERSION_COLORS.length] } : undefined}
                >
                  {v.versionLabel}
                  <span className="opacity-70">
                    {RESULT_LABELS[v.result]}
                  </span>
                </button>
              )
            })}
          </div>
        </section>

        {selectedVersions.length >= 2 && (
          <>
            <section className="rounded-bake bg-bake-card p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-bake-brown mb-4">照片 · 评分 · 配方</h2>
              <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${selectedVersions.length}, 1fr)` }}>
                {selectedVersions.map((v, idx) => (
                  <div key={v.id} className="text-center">
                    <div
                      className="h-3 rounded-t-bake"
                      style={{ backgroundColor: VERSION_COLORS[idx % VERSION_COLORS.length] }}
                    />
                    <div className="border border-t-0 border-bake-border rounded-b-bake p-3 space-y-3">
                      <p className="text-xs font-semibold text-bake-dark">
                        {v.versionLabel} · {RESULT_LABELS[v.result]}
                      </p>

                      {v.photos.length > 0 ? (
                        <div className="space-y-1.5">
                          {v.photos.slice(0, 2).map((photo, i) => (
                            <img
                              key={i}
                              src={photo}
                              alt={`${v.versionLabel} 照片 ${i + 1}`}
                              className="w-full aspect-square object-cover rounded-lg"
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="w-full aspect-square rounded-lg bg-bake-light flex items-center justify-center">
                          <ImageOff className="w-6 h-6 text-bake-border" />
                        </div>
                      )}

                      <div className="flex items-center justify-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3 h-3 ${
                              star <= v.tasteScore
                                ? 'fill-bake-caramel text-bake-caramel'
                                : 'text-bake-border'
                            }`}
                          />
                        ))}
                        <span className="ml-1 text-[10px] text-bake-brown/50">{v.tasteScore}/5</span>
                      </div>

                      {v.adjustments.length > 0 && (
                        <div className="space-y-1.5 pt-1 border-t border-bake-border">
                          <p className="text-[10px] text-bake-brown/50 font-medium">本版调整</p>
                          <div className="flex flex-wrap gap-1">
                            {v.adjustments.map((a) => (
                              <AdjustmentBadge
                                key={a.id}
                                item={a.item}
                                before={a.before}
                                after={a.after}
                                unit={a.unit}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="pt-1 border-t border-bake-border">
                          <p className="text-[10px] text-bake-brown/50 font-medium flex items-center gap-1 mb-1">
                            <BookOpen className="w-3 h-3" />
                            配方
                          </p>
                          {v.recipe ? (
                            <div className="bg-bake-warm/30 rounded-lg p-2 font-mono text-[11px] text-bake-dark/70 leading-relaxed whitespace-pre-wrap text-left max-h-36 overflow-y-auto">
                              {v.recipe}
                            </div>
                          ) : (
                            <div className="bg-bake-light rounded-lg p-2 text-[11px] text-bake-brown/30 text-center italic">
                              未记录配方
                            </div>
                          )}
                        </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-bake bg-bake-card p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-bake-brown mb-4">口感评分雷达图</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#E8D5C4" />
                    <PolarAngleAxis dataKey="dimension" tick={{ fill: '#5C3D2E', fontSize: 12 }} />
                    {selectedVersions.map((v, idx) => (
                      <Radar
                        key={v.id}
                        name={v.versionLabel}
                        dataKey={v.versionLabel}
                        stroke={VERSION_COLORS[idx % VERSION_COLORS.length]}
                        fill={VERSION_COLORS[idx % VERSION_COLORS.length]}
                        fillOpacity={0.15}
                        strokeWidth={2}
                      />
                    ))}
                    <Legend
                      wrapperStyle={{ fontSize: 12, color: '#5C3D2E' }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="rounded-bake bg-bake-card p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-bake-brown mb-4">配方变化一览</h2>
              <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${selectedVersions.length}, 1fr)` }}>
                {selectedVersions.map((v, idx) => (
                  <div key={v.id}>
                    <div
                      className="text-xs font-semibold text-white text-center py-1.5 rounded-t-bake"
                      style={{ backgroundColor: VERSION_COLORS[idx % VERSION_COLORS.length] }}
                    >
                      {v.versionLabel}
                    </div>
                    <div className="border border-t-0 border-bake-border rounded-b-bake p-3 space-y-2">
                      {v.adjustments.length > 0 ? (
                        <div className="space-y-1.5">
                          {v.adjustments.map((a) => {
                            const diff = a.after - a.before
                            return (
                              <div
                                key={a.id}
                                className={`flex items-center justify-between px-2 py-1.5 rounded-lg text-xs ${
                                  diff > 0 ? 'bg-bake-red/8' : diff < 0 ? 'bg-bake-green/8' : 'bg-bake-light'
                                }`}
                              >
                                <span className="font-medium text-bake-dark">
                                  {ADJUSTMENT_ITEM_LABELS[a.item]}
                                </span>
                                <div className="flex items-center gap-1 font-mono">
                                  <span className="text-bake-brown/50">{a.before}</span>
                                  <span className="text-bake-brown/30">→</span>
                                  <span className={diff > 0 ? 'text-bake-red font-semibold' : diff < 0 ? 'text-bake-green font-semibold' : 'text-bake-dark'}>
                                    {a.after}
                                  </span>
                                  <span className="text-bake-brown/40">{a.unit}</span>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        <p className="text-[11px] text-bake-brown/40 text-center py-2">无调整项</p>
                      )}

                      <div className="mt-2 pt-2 border-t border-bake-border">
                          {v.recipe ? (
                            <div className="bg-bake-warm/30 rounded-lg p-2 font-mono text-[11px] text-bake-dark/70 leading-relaxed whitespace-pre-wrap max-h-28 overflow-y-auto">
                              {v.recipe}
                            </div>
                          ) : (
                            <div className="bg-bake-light rounded-lg p-2 text-[11px] text-bake-brown/30 text-center italic">
                              未记录配方
                            </div>
                          )}
                        </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-bake bg-bake-card p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-bake-brown mb-4">参数对比</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-bake-border">
                      <th className="text-left py-2 pr-3 text-bake-brown/60 font-medium">参数</th>
                      {selectedVersions.map((v, idx) => (
                        <th
                          key={v.id}
                          className="text-center py-2 px-2 font-medium"
                          style={{ color: VERSION_COLORS[idx % VERSION_COLORS.length] }}
                        >
                          {v.versionLabel}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-bake-border/50">
                      <td className="py-2 pr-3 text-bake-dark">烤箱温度</td>
                      {selectedVersions.map((v, i) => {
                        const prev = i > 0 ? selectedVersions[i - 1] : null
                        const changed = prev && v.ovenTemp !== prev.ovenTemp
                        return (
                          <td key={v.id} className={`text-center py-2 px-2 ${changed ? 'text-bake-red font-semibold' : 'text-bake-dark'}`}>
                            {v.ovenTemp}℃
                          </td>
                        )
                      })}
                    </tr>
                    <tr className="border-b border-bake-border/50">
                      <td className="py-2 pr-3 text-bake-dark">烘烤时间</td>
                      {selectedVersions.map((v, i) => {
                        const prev = i > 0 ? selectedVersions[i - 1] : null
                        const changed = prev && v.bakeTime !== prev.bakeTime
                        return (
                          <td key={v.id} className={`text-center py-2 px-2 ${changed ? 'text-bake-red font-semibold' : 'text-bake-dark'}`}>
                            {v.bakeTime}分钟
                          </td>
                        )
                      })}
                    </tr>
                    <tr className="border-b border-bake-border/50">
                      <td className="py-2 pr-3 text-bake-dark">面粉类型</td>
                      {selectedVersions.map((v) => (
                        <td key={v.id} className="text-center py-2 px-2 text-bake-dark">
                          {v.flourType}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-bake-border/50">
                      <td className="py-2 pr-3 text-bake-dark">口感评分</td>
                      {selectedVersions.map((v, i) => {
                        const prev = i > 0 ? selectedVersions[i - 1] : null
                        const changed = prev && v.tasteScore !== prev.tasteScore
                        const improved = prev && v.tasteScore > prev.tasteScore
                        return (
                          <td key={v.id} className={`text-center py-2 px-2 ${improved ? 'text-bake-green font-semibold' : changed ? 'text-bake-red font-semibold' : 'text-bake-dark'}`}>
                            {v.tasteScore}/5
                          </td>
                        )
                      })}
                    </tr>
                    <tr className="border-b border-bake-border/50">
                      <td className="py-2 pr-3 text-bake-dark">问题</td>
                      {selectedVersions.map((v) => (
                        <td key={v.id} className="text-center py-2 px-2 text-bake-dark">
                          {v.problemTags.length > 0
                            ? v.problemTags.map((t) => PROBLEM_TAG_LABELS[t]).join('、')
                            : '无'}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-2 pr-3 text-bake-dark">调整</td>
                      {selectedVersions.map((v) => (
                        <td key={v.id} className="text-center py-2 px-2">
                          {v.adjustments.length > 0
                            ? v.adjustments.map((a) => (
                                <span
                                  key={a.id}
                                  className="inline-flex items-center gap-0.5 text-[11px] mr-1"
                                >
                                  <span className="font-medium text-bake-dark">
                                    {ADJUSTMENT_ITEM_LABELS[a.item]}
                                  </span>
                                  <span className="font-mono text-bake-brown/60">
                                    {a.before}→{a.after}{a.unit}
                                  </span>
                                </span>
                              ))
                            : <span className="text-bake-brown/30">-</span>}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  )
}
