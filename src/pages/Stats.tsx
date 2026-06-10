import { useMemo, useState } from 'react'
import { useFamilyStore } from '@/stores/familyStore'
import { getEffectiveWater, DRINK_TYPE_CONFIG } from '@/types'
import type { DrinkType } from '@/types'
import { getWeekDays, getDayLabel } from '@/utils/drinkUtils'
import { BarChart3, Clock, Droplets, TrendingUp, PieChart, ChevronDown } from 'lucide-react'

export default function Stats() {
  const members = useFamilyStore((s) => s.members)
  const records = useFamilyStore((s) => s.records)
  const [selectedMemberId, setSelectedMemberId] = useState<string | 'all'>('all')

  const weekDays = useMemo(() => getWeekDays(), [])

  const weekRecords = useMemo(() => {
    const startOfWeek = weekDays[0]
    return records.filter((r) => {
      const rd = new Date(r.timestamp)
      return rd >= startOfWeek
    })
  }, [records, weekDays])

  const weeklyData = useMemo(() => {
    return members.map((member) => {
      const days = weekDays.map((day) => {
        const dayRecords = weekRecords.filter((r) => {
          const rd = new Date(r.timestamp)
          return r.memberId === member.id &&
            rd.getFullYear() === day.getFullYear() &&
            rd.getMonth() === day.getMonth() &&
            rd.getDate() === day.getDate()
        })
        const total = dayRecords.reduce((sum, r) => sum + getEffectiveWater(r.amount, r.drinkType), 0)
        return {
          day,
          total,
          goal: member.dailyGoal,
          achieved: total >= member.dailyGoal,
        }
      })
      const achievedDays = days.filter((d) => d.achieved).length
      const avgDaily = Math.round(days.reduce((s, d) => s + d.total, 0) / 7)
      return {
        member,
        days,
        achievedDays,
        avgDaily,
      }
    })
  }, [members, weekRecords, weekDays])

  const hourlyDist = useMemo(() => {
    const hours = new Array(24).fill(0)
    weekRecords.forEach((r) => {
      const h = new Date(r.timestamp).getHours()
      hours[h]++
    })
    return hours
  }, [weekRecords])

  const maxHourly = useMemo(() => Math.max(...hourlyDist, 1), [hourlyDist])

  const forgettablePeriods = useMemo(() => {
    const periods = [
      { label: '6-8点', start: 6, end: 8 },
      { label: '8-10点', start: 8, end: 10 },
      { label: '10-12点', start: 10, end: 12 },
      { label: '12-14点', start: 12, end: 14 },
      { label: '14-16点', start: 14, end: 16 },
      { label: '16-18点', start: 16, end: 18 },
      { label: '18-20点', start: 18, end: 20 },
      { label: '20-22点', start: 20, end: 22 },
    ]
    const periodCounts = periods.map((p) => ({
      ...p,
      count: hourlyDist.slice(p.start, p.end).reduce((a, b) => a + b, 0),
    }))
    periodCounts.sort((a, b) => a.count - b.count)
    return periodCounts.slice(0, 3)
  }, [hourlyDist])

  const overallDrinkBreakdown = useMemo(() => {
    const breakdown: Record<DrinkType, { raw: number; effective: number }> = {
      water: { raw: 0, effective: 0 },
      coffee: { raw: 0, effective: 0 },
      tea: { raw: 0, effective: 0 },
      soda: { raw: 0, effective: 0 },
      juice: { raw: 0, effective: 0 },
      milk: { raw: 0, effective: 0 },
    }
    weekRecords.forEach((r) => {
      breakdown[r.drinkType].raw += r.amount
      breakdown[r.drinkType].effective += getEffectiveWater(r.amount, r.drinkType)
    })
    return (Object.entries(breakdown) as [DrinkType, { raw: number; effective: number }][])
      .filter(([, v]) => v.effective > 0 || v.raw > 0)
      .sort(([, a], [, b]) => b.effective - a.effective)
  }, [weekRecords])

  const totalEffectiveDrink = useMemo(() => {
    return overallDrinkBreakdown.reduce((s, [, v]) => s + v.effective, 0) || 1
  }, [overallDrinkBreakdown])

  const memberDrinkBreakdown = useMemo(() => {
    const targetRecords = selectedMemberId === 'all'
      ? weekRecords
      : weekRecords.filter((r) => r.memberId === selectedMemberId)

    const breakdown: Record<DrinkType, { raw: number; effective: number }> = {
      water: { raw: 0, effective: 0 },
      coffee: { raw: 0, effective: 0 },
      tea: { raw: 0, effective: 0 },
      soda: { raw: 0, effective: 0 },
      juice: { raw: 0, effective: 0 },
      milk: { raw: 0, effective: 0 },
    }
    targetRecords.forEach((r) => {
      breakdown[r.drinkType].raw += r.amount
      breakdown[r.drinkType].effective += getEffectiveWater(r.amount, r.drinkType)
    })
    return (Object.entries(breakdown) as [DrinkType, { raw: number; effective: number }][])
  }, [weekRecords, selectedMemberId])

  const selectedMember = selectedMemberId === 'all'
    ? null
    : members.find((m) => m.id === selectedMemberId)

  const memberDrinkTotal = useMemo(() => {
    return memberDrinkBreakdown.reduce((s, [, v]) => s + v.raw, 0) || 1
  }, [memberDrinkBreakdown])

  return (
    <div className="min-h-screen pb-24">
      <div className="max-w-2xl mx-auto px-4 pt-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold font-display text-gradient">饮水统计</h1>
          <p className="text-sm text-gray-400 mt-1 font-body">一周饮水数据全览</p>
        </div>

        {members.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="text-5xl mb-4">📊</div>
            <h2 className="text-lg font-bold font-display text-gray-500 mb-2">暂无数据</h2>
            <p className="text-sm text-gray-400">添加家庭成员后查看统计</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="glass-card rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={16} className="text-ocean-400" />
                <span className="text-sm font-display font-semibold text-gray-600">周达标率</span>
              </div>
              <div className="space-y-3">
                {weeklyData.map(({ member, days, achievedDays }) => (
                  <div key={member.id}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{member.avatar}</span>
                        <span className="font-display font-semibold text-gray-700 text-sm">{member.name}</span>
                      </div>
                      <span className="text-sm font-display font-bold" style={{ color: member.color }}>
                        {achievedDays}/7 天
                      </span>
                    </div>
                    <div className="flex gap-1">
                      {days.map((d, i) => (
                        <div key={i} className="flex-1">
                          <div
                            className="w-full rounded-md transition-all"
                            style={{
                              height: '32px',
                              background: d.achieved
                                ? `linear-gradient(180deg, ${member.color}90, ${member.color})`
                                : `${member.color}20`,
                              position: 'relative',
                            }}
                          >
                            {d.total > 0 && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-[9px] font-display font-bold text-white/80">
                                  {d.total > 0 ? Math.round(d.total / d.goal * 100) + '%' : ''}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="text-[9px] text-gray-400 text-center mt-0.5 font-display">
                            {getDayLabel(d.day)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Clock size={16} className="text-coral-400" />
                <span className="text-sm font-display font-semibold text-gray-600">饮水时段分布</span>
              </div>
              <div className="grid grid-cols-12 gap-1 mb-2">
                {hourlyDist.map((count, hour) => (
                  <div key={hour} className="flex flex-col items-center">
                    <div
                      className="w-full rounded-sm transition-all"
                      style={{
                        height: `${Math.max(Math.round((count / maxHourly) * 48), 4)}px`,
                        background: count === 0
                          ? '#f0f0f0'
                          : `rgba(79, 195, 247, ${0.3 + (count / maxHourly) * 0.7})`,
                      }}
                    />
                    {hour % 4 === 0 && (
                      <span className="text-[8px] text-gray-400 mt-0.5">{hour}</span>
                    )}
                  </div>
                ))}
              </div>

              {forgettablePeriods.length > 0 && forgettablePeriods[0].count < maxHourly * 0.3 && (
                <div className="bg-coral-400/10 rounded-xl p-3 mt-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-sm">⚠️</span>
                    <span className="text-xs font-display font-semibold text-coral-500">容易忘记的时段</span>
                  </div>
                  <div className="flex gap-2">
                    {forgettablePeriods.map((p) => (
                      <span key={p.label} className="text-xs bg-white/60 text-gray-500 px-2 py-1 rounded-lg font-display">
                        {p.label} ({p.count}次)
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="glass-card rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Droplets size={16} className="text-mint-400" />
                <span className="text-sm font-display font-semibold text-gray-600">人均日饮水量</span>
              </div>
              <div className="space-y-3">
                {weeklyData.map(({ member, avgDaily }) => {
                  const maxGoal = Math.max(...members.map((m) => m.dailyGoal))
                  const ratio = avgDaily / maxGoal
                  return (
                    <div key={member.id}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{member.avatar}</span>
                          <span className="font-display font-semibold text-gray-700 text-sm">{member.name}</span>
                        </div>
                        <span className="text-sm font-display font-bold" style={{ color: member.color }}>
                          {avgDaily}ml/天
                        </span>
                      </div>
                      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${Math.min(ratio * 100, 100)}%`,
                            background: `linear-gradient(90deg, ${member.color}60, ${member.color})`,
                          }}
                        />
                      </div>
                      <div className="flex justify-between mt-0.5">
                        <span className="text-[10px] text-gray-300">日均 {avgDaily}ml</span>
                        <span className="text-[10px] text-gray-300">目标 {member.dailyGoal}ml</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {overallDrinkBreakdown.length > 0 && (
              <div className="glass-card rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 size={16} className="text-lavender-400" />
                  <span className="text-sm font-display font-semibold text-gray-600">全家饮品结构（按折算白水）</span>
                </div>
                <div className="flex gap-1 h-8 rounded-lg overflow-hidden mb-3">
                  {overallDrinkBreakdown.map(([type, data]) => (
                    <div
                      key={type}
                      className="transition-all duration-500"
                      style={{
                        width: `${(data.effective / totalEffectiveDrink) * 100}%`,
                        background: DRINK_TYPE_CONFIG[type].color,
                      }}
                      title={`${DRINK_TYPE_CONFIG[type].label}: ${data.effective}ml（原始 ${data.raw}ml）`}
                    />
                  ))}
                </div>
                <div className="flex flex-wrap gap-3">
                  {overallDrinkBreakdown.map(([type, data]) => (
                    <div key={type} className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: DRINK_TYPE_CONFIG[type].color }} />
                      <span className="text-xs font-display text-gray-500">
                        {DRINK_TYPE_CONFIG[type].label} {Math.round((data.effective / totalEffectiveDrink) * 100)}%
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="text-[11px] text-gray-400 font-body">
                    已按饮品类型折算白水当量（白水 100% / 茶 80% / 咖啡 60% / 果汁 50% / 碳酸 40%）
                  </div>
                </div>
              </div>
            )}

            <div className="glass-card rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <PieChart size={16} className="text-ocean-400" />
                  <span className="text-sm font-display font-semibold text-gray-600">个人饮品结构</span>
                </div>
                <div className="relative">
                  <select
                    value={selectedMemberId}
                    onChange={(e) => setSelectedMemberId(e.target.value)}
                    className="appearance-none bg-white/60 border border-gray-100 rounded-xl px-3 py-1.5 pr-8 text-sm font-display text-gray-600 focus:outline-none focus:ring-2 focus:ring-ocean-200"
                  >
                    <option value="all">👨‍👩‍👧 全家</option>
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>{m.avatar} {m.name}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {selectedMember && (
                <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-100">
                  <span className="text-2xl">{selectedMember.avatar}</span>
                  <div>
                    <div className="font-display font-semibold text-gray-700">{selectedMember.name} · 本周饮品</div>
                    <div className="text-xs text-gray-400">
                      原始总量 {memberDrinkBreakdown.reduce((s, [, v]) => s + v.raw, 0)}ml /
                      折算白水 {memberDrinkBreakdown.reduce((s, [, v]) => s + v.effective, 0)}ml
                    </div>
                  </div>
                </div>
              )}

              {selectedMemberId === 'all' && (
                <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-100">
                  <span className="text-2xl">👨‍👩‍👧</span>
                  <div>
                    <div className="font-display font-semibold text-gray-700">全家 · 本周饮品</div>
                    <div className="text-xs text-gray-400">
                      原始总量 {memberDrinkBreakdown.reduce((s, [, v]) => s + v.raw, 0)}ml /
                      折算白水 {memberDrinkBreakdown.reduce((s, [, v]) => s + v.effective, 0)}ml
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2.5">
                {memberDrinkBreakdown.map(([type, data]) => (
                  <div key={type} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ background: DRINK_TYPE_CONFIG[type].color }} />
                        <span className="font-display font-medium text-gray-600">{DRINK_TYPE_CONFIG[type].label}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-400 font-mono">原始 {data.raw}ml</span>
                        <span className="text-sm font-display font-bold" style={{ color: DRINK_TYPE_CONFIG[type].color }}>
                          折算 {data.effective}ml
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1 h-4 rounded-md overflow-hidden bg-gray-50">
                      <div
                        className="h-full rounded-md transition-all duration-500"
                        style={{
                          width: `${(data.raw / memberDrinkTotal) * 100}%`,
                          background: `linear-gradient(90deg, ${DRINK_TYPE_CONFIG[type].color}30, ${DRINK_TYPE_CONFIG[type].color}60)`,
                        }}
                      />
                    </div>
                    <div className="text-[10px] text-gray-300 text-right font-mono">
                      {DRINK_TYPE_CONFIG[type].label}折算率 {Math.round(DRINK_TYPE_CONFIG[type].ratio * 100)}%
                    </div>
                  </div>
                ))}
              </div>

              {memberDrinkBreakdown.reduce((s, [, v]) => s + v.raw, 0) === 0 && (
                <div className="text-center py-6 text-gray-300 text-sm font-display">
                  本周暂无记录
                </div>
              )}
            </div>

            <div className="glass-card rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm">💡</span>
                <span className="text-sm font-display font-semibold text-gray-600">饮水小贴士</span>
              </div>
              <div className="space-y-2">
                <div className="flex gap-2 items-start">
                  <span className="text-coral-400 text-sm mt-0.5">•</span>
                  <p className="text-xs text-gray-500 font-body leading-relaxed">咖啡和茶有利尿作用，实际补水量只有60-80%，建议搭配白水饮用</p>
                </div>
                <div className="flex gap-2 items-start">
                  <span className="text-ocean-400 text-sm mt-0.5">•</span>
                  <p className="text-xs text-gray-500 font-body leading-relaxed">运动后30分钟内补充水分效果最佳，每次200-300ml为宜</p>
                </div>
                <div className="flex gap-2 items-start">
                  <span className="text-lavender-400 text-sm mt-0.5">•</span>
                  <p className="text-xs text-gray-500 font-body leading-relaxed">睡前2小时减少饮水，避免夜间频繁起夜影响睡眠</p>
                </div>
                <div className="flex gap-2 items-start">
                  <span className="text-mint-400 text-sm mt-0.5">•</span>
                  <p className="text-xs text-gray-500 font-body leading-relaxed">老人和孩子的饮水提醒更重要，少量多次比一次大量更健康</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
