import { useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useCineQuoteStore } from '@/store'
import { ArrowLeft, Film, Heart, Users, TrendingUp, BarChart3 } from 'lucide-react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts'
import { cn } from '@/lib/utils'

const EMOTION_CHART_COLORS: Record<string, string> = {
  '感动': '#f43f5e',
  '励志': '#f59e0b',
  '忧郁': '#3b82f6',
  '热血': '#dc2626',
  '浪漫': '#ec4899',
  '幽默': '#22c55e',
  '悲伤': '#6366f1',
  '哲理': '#8b5cf6',
  '温暖': '#f97316',
  '震撼': '#06b6d4',
  '讽刺': '#eab308',
  '孤独': '#64748b',
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-cinema-700 text-white rounded-lg px-3 py-2 text-sm shadow-lg">
      <p>{payload[0].name}: {payload[0].value}</p>
    </div>
  )
}

export default function Stats() {
  const { quotes, movies, initialized, init } = useCineQuoteStore()

  useEffect(() => {
    if (!initialized) init()
  }, [initialized, init])

  const totalQuotes = quotes.length
  const totalMovies = movies.length
  const uniqueCharacters = useMemo(
    () => new Set(quotes.map((q) => q.character)).size,
    [quotes]
  )
  const mostCommonEmotion = useMemo(() => {
    if (quotes.length === 0) return '-'
    const counts: Record<string, number> = {}
    quotes.forEach((q) => q.emotions.forEach((e) => (counts[e] = (counts[e] || 0) + 1)))
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || '-'
  }, [quotes])

  const emotionData = useMemo(() => {
    const counts: Record<string, number> = {}
    quotes.forEach((q) => q.emotions.forEach((e) => (counts[e] = (counts[e] || 0) + 1)))
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value, color: EMOTION_CHART_COLORS[name] || '#888' }))
      .sort((a, b) => b.value - a.value)
  }, [quotes])

  const movieRankData = useMemo(() => {
    const counts: Record<string, number> = {}
    quotes.forEach((q) => {
      const movie = movies.find((m) => m.id === q.movieId)
      if (movie) counts[movie.name] = (counts[movie.name] || 0) + 1
    })
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, count]) => ({ name, count }))
  }, [quotes, movies])

  const characterRankData = useMemo(() => {
    const counts: Record<string, number> = {}
    quotes.forEach((q) => (counts[q.character] = (counts[q.character] || 0) + 1))
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, count]) => ({ name, count }))
  }, [quotes])

  const trendData = useMemo(() => {
    const now = new Date()
    const months: { key: string; label: string; count: number }[] = []
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      months.push({ key, label: key, count: 0 })
    }
    quotes.forEach((q) => {
      const d = new Date(q.createdAt)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const entry = months.find((m) => m.key === key)
      if (entry) entry.count++
    })
    return months
  }, [quotes])

  if (totalQuotes === 0) {
    return (
      <div className="min-h-screen bg-cinema-900 p-6 flex flex-col items-center justify-center text-cinema-500">
        <Film className="w-16 h-16 mb-4" />
        <p className="text-lg">还没有收藏任何台词</p>
        <Link to="/" className="mt-4 text-amber-primary hover:underline">
          返回首页
        </Link>
        <div className="grain-overlay" />
      </div>
    )
  }

  const statsCards = [
    { label: '台词总数', value: totalQuotes, icon: Film, color: 'text-amber-primary' },
    { label: '电影总数', value: totalMovies, icon: Heart, color: 'text-pink-400' },
    { label: '角色总数', value: uniqueCharacters, icon: Users, color: 'text-cyan-400' },
    { label: '最多情绪', value: mostCommonEmotion, icon: TrendingUp, color: 'text-green-400' },
  ]

  return (
    <div className="min-h-screen bg-cinema-900 p-6">
      <div className="flex items-center gap-3 mb-8">
        <Link to="/" className="text-cinema-500 hover:text-amber-primary transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="font-display text-2xl font-bold text-white">收藏统计</h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {statsCards.map((card) => (
          <div key={card.label} className="bg-cinema-800 rounded-xl p-4 flex flex-col items-center gap-2">
            <card.icon className={cn('w-6 h-6', card.color)} />
            <span className="text-cinema-500 text-sm">{card.label}</span>
            <span className="text-white font-bold text-xl">{card.value}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-cinema-800 rounded-xl p-4">
          <h2 className="font-display text-lg text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-amber-primary" />
            情绪分布
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={emotionData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                dataKey="value"
                nameKey="name"
                stroke="none"
              >
                {emotionData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 mt-2 justify-center">
            {emotionData.map((e) => (
              <span key={e.name} className="flex items-center gap-1 text-xs text-cinema-500">
                <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: e.color }} />
                {e.name}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-cinema-800 rounded-xl p-4">
          <h2 className="font-display text-lg text-white mb-4 flex items-center gap-2">
            <Film className="w-5 h-5 text-amber-primary" />
            电影排行
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={movieRankData} layout="vertical" margin={{ left: 20 }}>
              <XAxis type="number" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" width={80} tick={{ fill: '#e8e8f0', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="台词数" fill="#e2b714" radius={[0, 4, 4, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-cinema-800 rounded-xl p-4">
          <h2 className="font-display text-lg text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-400" />
            角色排行
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={characterRankData} layout="vertical" margin={{ left: 20 }}>
              <XAxis type="number" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" width={80} tick={{ fill: '#e8e8f0', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="台词数" fill="#06b6d4" radius={[0, 4, 4, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-cinema-800 rounded-xl p-4">
          <h2 className="font-display text-lg text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-primary" />
            收藏趋势
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#30304d" />
              <XAxis dataKey="label" tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="count" name="收藏数" stroke="#e2b714" strokeWidth={2} dot={{ fill: '#e2b714', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grain-overlay" />
    </div>
  )
}
