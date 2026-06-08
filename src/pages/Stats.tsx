import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { MOOD_CONFIG, MEDIA_TYPE_CONFIG, type Mood } from '@/lib/types'
import { useAppStore } from '@/store/useAppStore'

const MOODS: Mood[] = ['tired', 'annoyed', 'happy', 'insomnia', 'want-cry', 'want-learn', 'want-empty']

export default function Stats() {
  const consumptionRecords = useAppStore((s) => s.consumptionRecords)
  const blindDrawRecords = useAppStore((s) => s.blindDrawRecords)
  const mediaItems = useAppStore((s) => s.mediaItems)

  const moodDistribution = useMemo(() => {
    const counts: Record<string, number> = {}
    consumptionRecords.forEach((r) => {
      counts[r.mood] = (counts[r.mood] || 0) + 1
    })
    return MOODS.map((mood) => ({
      name: `${MOOD_CONFIG[mood].emoji} ${MOOD_CONFIG[mood].label}`,
      value: counts[mood] || 0,
      color: MOOD_CONFIG[mood].color,
    })).filter((d) => d.value > 0)
  }, [consumptionRecords])

  const typeDistribution = useMemo(() => {
    const counts: Record<string, number> = {}
    consumptionRecords.forEach((r) => {
      const item = mediaItems.find((i) => i.id === r.mediaId)
      if (item) {
        counts[item.type] = (counts[item.type] || 0) + 1
      }
    })
    return Object.entries(counts).map(([type, count]) => ({
      name: `${MEDIA_TYPE_CONFIG[type as keyof typeof MEDIA_TYPE_CONFIG].icon} ${MEDIA_TYPE_CONFIG[type as keyof typeof MEDIA_TYPE_CONFIG].label}`,
      value: count,
      color: MEDIA_TYPE_CONFIG[type as keyof typeof MEDIA_TYPE_CONFIG].color,
    }))
  }, [consumptionRecords, mediaItems])

  const recentRecords = useMemo(() => {
    return [...consumptionRecords]
      .sort((a, b) => new Date(b.consumedAt).getTime() - new Date(a.consumedAt).getTime())
      .slice(0, 10)
      .map((r) => {
        const item = mediaItems.find((i) => i.id === r.mediaId)
        return { ...r, item }
      })
  }, [consumptionRecords, mediaItems])

  const swapRecords = useMemo(() => {
    return blindDrawRecords
      .filter((r) => !r.accepted && r.swapReason)
      .sort((a, b) => new Date(b.drawnAt).getTime() - new Date(a.drawnAt).getTime())
      .slice(0, 10)
      .map((r) => {
        const item = mediaItems.find((i) => i.id === r.mediaId)
        return { ...r, item }
      })
  }, [blindDrawRecords, mediaItems])

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-indigo-600/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-2xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-xl font-serif text-amber-100/90">消费画像</h1>
          <p className="text-slate-500 text-xs mt-0.5">
            看看最近都在什么心情下看了什么
          </p>
        </motion.div>

        {consumptionRecords.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-600 text-sm">还没有消费记录</p>
            <p className="text-slate-700 text-xs mt-1">去首页选个心情，看看推荐吧</p>
          </div>
        ) : (
          <>
            <section className="mb-10">
              <h2 className="text-amber-200/70 font-serif text-sm mb-4">心情分布</h2>
              {moodDistribution.length > 0 ? (
                <div className="bg-slate-800/30 rounded-xl border border-slate-700/30 p-4">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={moodDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        dataKey="value"
                        stroke="none"
                      >
                        {moodDistribution.map((entry, i) => (
                          <Cell key={i} fill={entry.color} fillOpacity={0.7} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1e293b',
                          border: '1px solid #334155',
                          borderRadius: '8px',
                          fontSize: '12px',
                          color: '#e2e8f0',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap justify-center gap-3 mt-2">
                    {moodDistribution.map((d) => (
                      <span key={d.name} className="text-xs text-slate-400">
                        <span
                          className="inline-block w-2 h-2 rounded-full mr-1"
                          style={{ backgroundColor: d.color }}
                        />
                        {d.name} ({d.value})
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-slate-600 text-xs">暂无数据</p>
              )}

              {typeDistribution.length > 0 && (
                <>
                  <h2 className="text-amber-200/70 font-serif text-sm mb-4 mt-8">类型分布</h2>
                  <div className="bg-slate-800/30 rounded-xl border border-slate-700/30 p-4">
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie
                          data={typeDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={70}
                          dataKey="value"
                          stroke="none"
                        >
                          {typeDistribution.map((entry, i) => (
                            <Cell key={i} fill={entry.color} fillOpacity={0.7} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#1e293b',
                            border: '1px solid #334155',
                            borderRadius: '8px',
                            fontSize: '12px',
                            color: '#e2e8f0',
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-wrap justify-center gap-3 mt-2">
                      {typeDistribution.map((d) => (
                        <span key={d.name} className="text-xs text-slate-400">
                          <span
                            className="inline-block w-2 h-2 rounded-full mr-1"
                            style={{ backgroundColor: d.color }}
                          />
                          {d.name} ({d.value})
                        </span>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </section>

            <section className="mb-10">
              <h2 className="text-amber-200/70 font-serif text-sm mb-4">近期动态</h2>
              <div className="relative pl-6 border-l border-slate-800/60">
                {recentRecords.map((r) => (
                  <div key={r.id} className="mb-4 relative">
                    <div className="absolute -left-[29px] top-1 w-3 h-3 rounded-full bg-slate-800 border-2 border-amber-600/40" />
                    <div className="bg-slate-800/30 rounded-lg border border-slate-700/20 p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm">{MOOD_CONFIG[r.mood as Mood].emoji}</span>
                        <span className="text-slate-400 text-xs">{MOOD_CONFIG[r.mood as Mood].label}</span>
                        <span className="text-slate-600 text-[10px]">{formatDate(r.consumedAt)}</span>
                      </div>
                      {r.item && (
                        <p className="text-white text-sm font-serif">
                          {MEDIA_TYPE_CONFIG[r.item.type].icon} {r.item.title}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {swapRecords.length > 0 && (
              <section>
                <h2 className="text-amber-200/70 font-serif text-sm mb-4">盲抽换掉记录</h2>
                <div className="space-y-2">
                  {swapRecords.map((r) => (
                    <div
                      key={r.id}
                      className="bg-slate-800/30 rounded-lg border border-slate-700/20 p-3"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {r.item && (
                          <span className="text-white text-sm font-serif">
                            {MEDIA_TYPE_CONFIG[r.item.type].icon} {r.item.title}
                          </span>
                        )}
                        <span className="text-slate-600 text-[10px]">{formatDate(r.drawnAt)}</span>
                      </div>
                      <p className="text-slate-400 text-xs bg-slate-700/20 rounded px-2 py-1 italic">
                        「{r.swapReason}」
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  )
}
