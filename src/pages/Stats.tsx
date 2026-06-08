import { useState } from 'react'
import { TrendingUp, DollarSign, Calendar, PawPrint } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import { usePetStore } from '@/store'
import { RECORD_TYPE_CONFIG } from '@/types'
import type { HealthRecordType } from '@/types'

const TYPE_KEYS: HealthRecordType[] = ['vaccine', 'deworming', 'checkup', 'allergy', 'surgery']

function formatYuan(value: number) {
  return `¥${value.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

interface CustomLabelProps {
  cx: number
  cy: number
  midAngle: number
  innerRadius: number
  outerRadius: number
  percent: number
}

function renderCustomLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }: CustomLabelProps) {
  if (percent < 0.05) return null
  const RADIAN = Math.PI / 180
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

export default function Stats() {
  const currentYear = new Date().getFullYear()
  const [selectedYear, setSelectedYear] = useState(currentYear)
  const getCostStats = usePetStore((s) => s.getCostStats)
  const pets = usePetStore((s) => s.pets)

  const stats = getCostStats(selectedYear)
  const hasData = stats.total > 0

  const pieData = TYPE_KEYS
    .map((key) => ({
      name: RECORD_TYPE_CONFIG[key].label,
      value: stats.byType[key],
      color: RECORD_TYPE_CONFIG[key].color,
    }))
    .filter((d) => d.value > 0)

  const years = [currentYear, currentYear - 1]

  function getPetPhoto(petId: string) {
    const pet = pets.find((p) => p.id === petId)
    return pet?.photo || ''
  }

  function getPetSpecies(petId: string) {
    const pet = pets.find((p) => p.id === petId)
    return pet?.species || 'cat'
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <header>
        <div className="flex items-center justify-between mb-4">
          <h1 className="font-serif text-3xl font-bold text-warm-800">费用统计</h1>
          <div className="w-10 h-10 bg-warm-100 rounded-full flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-warm-400" />
          </div>
        </div>

        <div className="flex gap-2">
          {years.map((year) => (
            <button
              key={year}
              onClick={() => setSelectedYear(year)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                selectedYear === year
                  ? 'bg-warm-400 text-white shadow-sm'
                  : 'bg-white text-warm-600 border border-warm-200 hover:bg-warm-50'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              {year}年
            </button>
          ))}
        </div>
      </header>

      {!hasData ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-24 h-24 bg-warm-100 rounded-full flex items-center justify-center mb-4">
            <DollarSign className="w-12 h-12 text-warm-300" />
          </div>
          <h2 className="font-serif text-xl font-semibold text-warm-800 mb-2">暂无数据</h2>
          <p className="text-warm-400 text-sm">{selectedYear}年还没有健康记录</p>
        </div>
      ) : (
        <>
          <section className="card overflow-hidden">
            <div className="bg-gradient-to-br from-warm-400 via-warm-500 to-warm-600 p-6 text-white">
              <div className="flex items-center gap-2 mb-2 opacity-90">
                <DollarSign className="w-4 h-4" />
                <span className="text-sm font-medium">年度总费用</span>
              </div>
              <div className="text-4xl font-bold tracking-tight">
                {formatYuan(stats.total)}
              </div>
              <div className="mt-2 text-sm opacity-80">{selectedYear}年</div>
            </div>
          </section>

          <section>
            <h2 className="section-title flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-warm-400" />
              分类占比
            </h2>
            <div className="card p-4">
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={90}
                      paddingAngle={3}
                      dataKey="value"
                      labelLine={false}
                      label={renderCustomLabel}
                    >
                      {pieData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => formatYuan(value)}
                      contentStyle={{
                        borderRadius: '12px',
                        border: 'none',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        fontSize: '13px',
                      }}
                    />
                    <Legend
                      iconType="circle"
                      iconSize={8}
                      formatter={(value: string) => (
                        <span style={{ color: '#78716c', fontSize: '13px' }}>{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-2">
                {TYPE_KEYS.map((key) => {
                  const config = RECORD_TYPE_CONFIG[key]
                  const cost = stats.byType[key]
                  if (cost === 0) return null
                  return (
                    <div key={key} className="flex items-center gap-2 bg-warm-50 rounded-xl px-3 py-2">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: config.color }} />
                      <span className="text-xs text-warm-600 flex-1">{config.label}</span>
                      <span className="text-xs font-semibold text-warm-800">{formatYuan(cost)}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>

          <section>
            <h2 className="section-title flex items-center gap-2 mb-3">
              <Calendar className="w-5 h-5 text-warm-400" />
              月度趋势
            </h2>
            <div className="card p-4">
              <div className="h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.byMonth} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f5f0eb" />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 11, fill: '#a8a29e' }}
                      axisLine={{ stroke: '#e7e5e4' }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#a8a29e' }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v: number) => v > 0 ? `${v}` : ''}
                    />
                    <Tooltip
                      formatter={(value: number) => [formatYuan(value), '费用']}
                      labelFormatter={(label: string) => `${selectedYear}年${label}`}
                      contentStyle={{
                        borderRadius: '12px',
                        border: 'none',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        fontSize: '13px',
                      }}
                    />
                    <Bar dataKey="cost" fill="#D4A574" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>

          {stats.byPet.length > 0 && (
            <section>
              <h2 className="section-title flex items-center gap-2 mb-3">
                <PawPrint className="w-5 h-5 text-warm-400" />
                宠物费用对比
              </h2>
              <div className="space-y-3">
                {stats.byPet
                  .sort((a, b) => b.cost - a.cost)
                  .map((item) => {
                    const maxCost = Math.max(...stats.byPet.map((p) => p.cost))
                    const percentage = maxCost > 0 ? (item.cost / maxCost) * 100 : 0
                    const species = getPetSpecies(item.petId)
                    const photo = getPetPhoto(item.petId)

                    return (
                      <div key={item.petId} className="card p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex-shrink-0">
                            {photo ? (
                              <img src={photo} alt={item.petName} className="w-10 h-10 rounded-full object-cover" />
                            ) : (
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${species === 'cat' ? 'bg-pet-orange/10' : 'bg-pet-blue/10'}`}>
                                <PawPrint className={`w-5 h-5 ${species === 'cat' ? 'text-pet-orange' : 'text-pet-blue'}`} />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="font-medium text-warm-800 text-sm">{item.petName}</span>
                          </div>
                          <span className="text-sm font-bold text-warm-800">{formatYuan(item.cost)}</span>
                        </div>
                        <div className="h-2 bg-warm-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-warm-400 to-warm-500 rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}
