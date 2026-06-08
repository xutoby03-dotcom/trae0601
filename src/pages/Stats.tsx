import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useToolStore } from '@/store/toolStore'
import { useBorrowStore } from '@/store/borrowStore'
import { useUserStore } from '@/store/userStore'
import { CATEGORY_LABELS } from '@/types'
import { Trophy, Wrench, Users, BarChart3, TrendingUp, Medal, AlertTriangle, Flame } from 'lucide-react'

export default function Stats() {
  const tools = useToolStore(s => s.tools)
  const borrowRecords = useBorrowStore(s => s.borrowRecords)
  const users = useUserStore(s => s.users)

  const toolPopularity = useMemo(() => {
    const countMap: Record<string, number> = {}
    borrowRecords.forEach(r => {
      countMap[r.toolId] = (countMap[r.toolId] || 0) + 1
    })
    return tools
      .map(t => ({ ...t, borrowCount: countMap[t.id] || 0 }))
      .sort((a, b) => b.borrowCount - a.borrowCount)
  }, [tools, borrowRecords])

  const [onlyWithBorrows, setOnlyWithBorrows] = useState(false)

  const contributorRanking = useMemo(() => {
    const toolCountMap: Record<string, number> = {}
    tools.forEach(t => {
      toolCountMap[t.ownerId] = (toolCountMap[t.ownerId] || 0) + 1
    })
    const effectiveBorrowStatuses = new Set(['active', 'returned', 'overdue'])
    const borrowCountMap: Record<string, number> = {}
    borrowRecords.forEach(r => {
      if (effectiveBorrowStatuses.has(r.status)) {
        borrowCountMap[r.ownerId] = (borrowCountMap[r.ownerId] || 0) + 1
      }
    })
    return users
      .map(u => ({
        ...u,
        toolCount: toolCountMap[u.id] || 0,
        borrowCount: borrowCountMap[u.id] || 0,
      }))
      .filter(u => onlyWithBorrows ? u.borrowCount > 0 : u.toolCount > 0)
      .sort((a, b) => onlyWithBorrows ? b.borrowCount - a.borrowCount : b.toolCount - a.toolCount)
  }, [tools, users, borrowRecords, onlyWithBorrows])

  const categoryStats = useMemo(() => {
    const stats: Record<string, { total: number; available: number; borrowed: number }> = {}
    tools.forEach(t => {
      if (!stats[t.category]) {
        stats[t.category] = { total: 0, available: 0, borrowed: 0 }
      }
      stats[t.category].total++
      if (t.status === 'available') stats[t.category].available++
      if (t.status === 'borrowed') stats[t.category].borrowed++
    })
    return Object.entries(stats).map(([key, val]) => ({
      category: key,
      label: CATEGORY_LABELS[key as keyof typeof CATEGORY_LABELS] || key,
      ...val,
    }))
  }, [tools])

  const overallStats = useMemo(() => {
    const totalBorrows = borrowRecords.length
    const returnedOnTime = borrowRecords.filter(r => r.status === 'returned' && !r.isOverdue).length
    const damaged = borrowRecords.filter(r => r.hasDamage).length
    const overdueMarked = borrowRecords.filter(r => r.isOverdue).length
    const overdueActive = borrowRecords.filter(
      r => r.status === 'active' && new Date() > new Date(r.expectedReturnTime)
    ).length
    const overdueTotal = overdueMarked + overdueActive
    return {
      totalTools: tools.length,
      totalBorrows,
      overdueActive,
      damageCount: damaged,
      overdueTotal,
      onTimeRate: totalBorrows > 0 ? Math.round((returnedOnTime / totalBorrows) * 100) : 0,
      damageRate: totalBorrows > 0 ? Math.round((damaged / totalBorrows) * 100) : 0,
      overdueRate: totalBorrows > 0 ? Math.round((overdueTotal / totalBorrows) * 100) : 0,
    }
  }, [tools, borrowRecords])

  const maxBorrowCount = Math.max(...toolPopularity.map(t => t.borrowCount), 1)
  const maxToolCount = Math.max(...contributorRanking.map(u => onlyWithBorrows ? u.borrowCount : u.toolCount), 1)

  return (
    <div className="min-h-screen pb-8">
      <div className="bg-gradient-to-br from-wood-800 to-wood-700 px-4 py-6">
        <div className="container mx-auto">
          <h1 className="font-serif-sc text-2xl font-bold text-wood-50 mb-1">数据统计</h1>
          <p className="text-wood-200 text-sm">了解社区工具共享情况</p>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-4 space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <StatCard icon={Wrench} label="工具总数" value={overallStats.totalTools} color="grass" />
          <StatCard icon={TrendingUp} label="总借次数" value={overallStats.totalBorrows} color="blue" />
          <StatCard icon={BarChart3} label="准时率" value={`${overallStats.onTimeRate}%`} color="green" />
          <StatCard
            icon={AlertTriangle}
            label="逾期中"
            value={overallStats.overdueActive}
            color="red"
            highlight={overallStats.overdueActive > 0}
          />
          <StatCard
            icon={Flame}
            label="损坏次数"
            value={overallStats.damageCount}
            color="orange"
            highlight={overallStats.damageCount > 0}
          />
          <StatCard icon={Users} label="参与者" value={users.length} color="amber" />
        </div>

        <div className="bg-white rounded-2xl shadow-wood-md border border-wood-100 p-5">
          <h3 className="font-serif-sc font-semibold text-wood-800 mb-4 flex items-center gap-2">
            <Trophy size={16} className="text-amber-500" />
            最受欢迎工具
          </h3>
          <div className="space-y-2">
            {toolPopularity.slice(0, 5).map((tool, idx) => (
              <Link
                key={tool.id}
                to={`/tool/${tool.id}`}
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-wood-50 transition-colors group"
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  idx === 0 ? 'bg-amber-100 text-amber-700' :
                  idx === 1 ? 'bg-gray-100 text-gray-600' :
                  idx === 2 ? 'bg-orange-100 text-orange-700' :
                  'bg-wood-50 text-wood-500'
                }`}>
                  {idx + 1}
                </div>
                <img src={tool.photo} alt={tool.name} className="w-10 h-10 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-wood-800 truncate group-hover:text-grass-700 transition-colors">{tool.name}</div>
                  <div className="text-xs text-wood-400">被借 {tool.borrowCount} 次</div>
                </div>
                <div className="w-24 bg-wood-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-grass-500 transition-all duration-700"
                    style={{ width: `${(tool.borrowCount / maxBorrowCount) * 100}%` }}
                  />
                </div>
              </Link>
            ))}
            {toolPopularity.every(t => t.borrowCount === 0) && (
              <p className="text-center text-sm text-wood-400 py-4">暂无借用数据</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-wood-md border border-wood-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif-sc font-semibold text-wood-800 flex items-center gap-2">
              <Medal size={16} className="text-grass-600" />
              工具贡献排行
            </h3>
            <button
              onClick={() => setOnlyWithBorrows(v => !v)}
              className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${
                onlyWithBorrows
                  ? 'bg-grass-600 text-white border-grass-600'
                  : 'bg-wood-50 text-wood-600 border-wood-200 hover:border-grass-400'
              }`}
            >
              {onlyWithBorrows ? '只看真借出' : '全部贡献者'}
            </button>
          </div>
          <div className="space-y-2">
            {contributorRanking.map((user, idx) => (
              <div key={user.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-wood-50 transition-colors">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  idx === 0 ? 'bg-amber-100 text-amber-700' :
                  idx === 1 ? 'bg-gray-100 text-gray-600' :
                  idx === 2 ? 'bg-orange-100 text-orange-700' :
                  'bg-wood-50 text-wood-500'
                }`}>
                  {idx + 1}
                </div>
                <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-full" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-wood-800">{user.name}</div>
                  <div className="text-xs text-wood-400">
                    {onlyWithBorrows
                      ? `借出 ${user.borrowCount} 次 · 信用 ${user.creditScore}`
                      : `贡献 ${user.toolCount} 件工具 · 信用 ${user.creditScore}`}
                  </div>
                </div>
                <div className="w-20 bg-wood-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${onlyWithBorrows ? 'bg-blue-500' : 'bg-wood-500'}`}
                    style={{ width: `${((onlyWithBorrows ? user.borrowCount : user.toolCount) / maxToolCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
            {contributorRanking.length === 0 && (
              <p className="text-center text-sm text-wood-400 py-4">暂无数据</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-wood-md border border-wood-100 p-5">
          <h3 className="font-serif-sc font-semibold text-wood-800 mb-4 flex items-center gap-2">
            <BarChart3 size={16} className="text-blue-500" />
            分类统计
          </h3>
          <div className="space-y-3">
            {categoryStats.map(cat => (
              <div key={cat.category} className="border border-wood-100 rounded-xl p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-wood-700">{cat.label}</span>
                  <span className="text-xs text-wood-400">共 {cat.total} 件</span>
                </div>
                <div className="flex gap-1 h-3">
                  <div
                    className="bg-grass-400 rounded-l-md transition-all duration-700"
                    style={{ width: `${(cat.available / cat.total) * 100}%` }}
                    title={`空闲 ${cat.available}`}
                  />
                  <div
                    className="bg-amber-400 transition-all duration-700"
                    style={{ width: `${(cat.borrowed / cat.total) * 100}%` }}
                    title={`借出 ${cat.borrowed}`}
                  />
                  <div
                    className="bg-red-400 rounded-r-md transition-all duration-700"
                    style={{ width: `${((cat.total - cat.available - cat.borrowed) / cat.total) * 100}%` }}
                    title="维修中"
                  />
                </div>
                <div className="flex gap-3 mt-2 text-xs text-wood-400">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-grass-400" />
                    空闲 {cat.available}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    借出 {cat.borrowed}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-red-400" />
                    维修 {cat.total - cat.available - cat.borrowed}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  highlight,
}: {
  icon: React.ElementType
  label: string
  value: number | string
  color: 'grass' | 'blue' | 'green' | 'amber' | 'red' | 'orange'
  highlight?: boolean
}) {
  const colorMap = {
    grass: 'bg-grass-50 text-grass-600',
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
    orange: 'bg-orange-50 text-orange-600',
  }
  const iconBgMap = {
    grass: 'bg-grass-100 text-grass-600',
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-emerald-100 text-emerald-600',
    amber: 'bg-amber-100 text-amber-600',
    red: 'bg-red-100 text-red-600',
    orange: 'bg-orange-100 text-orange-600',
  }
  return (
    <div className={`bg-white rounded-xl shadow-wood border p-4 ${highlight ? 'border-red-200 ring-1 ring-red-100' : 'border-wood-100'}`}>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${iconBgMap[color]}`}>
        <Icon size={16} />
      </div>
      <div className={`text-lg font-bold ${highlight ? 'text-red-600' : 'text-wood-800'}`}>{value}</div>
      <div className="text-xs text-wood-400">{label}</div>
    </div>
  )
}
