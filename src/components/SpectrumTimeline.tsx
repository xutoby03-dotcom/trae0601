import { useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { useStore } from '@/store/useStore'
import { cn } from '@/lib/utils'

interface SpectrumTimelineProps {
  planId: string
  onDayChange?: (dayIndex: number) => void
}

export default function SpectrumTimeline({ planId, onDayChange }: SpectrumTimelineProps) {
  const schedules = useStore(s =>
    s.schedules.filter(sc => sc.planId === planId).sort((a, b) => a.dayIndex - b.dayIndex)
  )
  const updateSchedule = useStore(s => s.updateSchedule)

  const [selectedDay, setSelectedDay] = useState<number>(0)

  const chartData = schedules.map(sc => ({
    day: `第${sc.dayIndex + 1}天`,
    dayIndex: sc.dayIndex,
    蓝光: sc.blueRatio,
    白光: sc.whiteRatio,
    紫光: sc.purpleRatio,
    亮度: sc.brightness,
  }))

  const currentSchedule = schedules.find(sc => sc.dayIndex === selectedDay)

  const handleSliderChange = (field: 'blueRatio' | 'whiteRatio' | 'purpleRatio' | 'brightness', value: number) => {
    updateSchedule(planId, selectedDay, { [field]: value })
  }

  const sliders: { label: string; field: 'blueRatio' | 'whiteRatio' | 'purpleRatio' | 'brightness'; color: string; trackColor: string }[] = [
    { label: '蓝光比例', field: 'blueRatio', color: '#1e40af', trackColor: 'bg-blue-800' },
    { label: '白光比例', field: 'whiteRatio', color: '#fef9ef', trackColor: 'bg-amber-100' },
    { label: '紫光比例', field: 'purpleRatio', color: '#a78bfa', trackColor: 'bg-purple-400' },
    { label: '亮度', field: 'brightness', color: '#22d3ee', trackColor: 'bg-cyan-400' },
  ]

  return (
    <div className="space-y-4">
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
        <h3 className="text-sm font-medium text-gray-300 mb-3">光谱分布</h3>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="day"
              tick={{ fill: '#9ca3af', fontSize: 11 }}
              stroke="#4b5563"
              interval={Math.max(0, Math.floor(chartData.length / 8))}
            />
            <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} stroke="#4b5563" />
            <Tooltip
              contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 8, color: '#e5e7eb' }}
              labelStyle={{ color: '#9ca3af' }}
            />
            <Area type="monotone" dataKey="蓝光" stackId="1" stroke="#1e40af" fill="#1e40af" fillOpacity={0.7} />
            <Area type="monotone" dataKey="白光" stackId="1" stroke="#fef9ef" fill="#fef9ef" fillOpacity={0.4} />
            <Area type="monotone" dataKey="紫光" stackId="1" stroke="#a78bfa" fill="#a78bfa" fillOpacity={0.6} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
        <h3 className="text-sm font-medium text-gray-300 mb-3">亮度曲线</h3>
        <ResponsiveContainer width="100%" height={120}>
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="day"
              tick={{ fill: '#9ca3af', fontSize: 11 }}
              stroke="#4b5563"
              interval={Math.max(0, Math.floor(chartData.length / 8))}
            />
            <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} stroke="#4b5563" />
            <Line type="monotone" dataKey="亮度" stroke="#22d3ee" strokeWidth={2} dot={{ r: 3, fill: '#22d3ee' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
        <h3 className="text-sm font-medium text-gray-300 mb-3">选择天数</h3>
        <div className="flex flex-wrap gap-2">
          {schedules.map(sc => (
            <button
              key={sc.dayIndex}
              onClick={() => { setSelectedDay(sc.dayIndex); onDayChange?.(sc.dayIndex) }}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium transition',
                sc.dayIndex === selectedDay
                  ? 'bg-cyan-500 text-gray-900 shadow-lg shadow-cyan-500/30'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 border border-gray-600'
              )}
            >
              第{sc.dayIndex + 1}天
            </button>
          ))}
        </div>
      </div>

      {currentSchedule && (
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 space-y-4">
          <h3 className="text-sm font-medium text-gray-300">
            第{selectedDay + 1}天 参数调节
          </h3>
          {sliders.map(slider => (
            <div key={slider.field}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-gray-400">{slider.label}</span>
                <span className="text-xs font-mono" style={{ color: slider.color }}>
                  {currentSchedule[slider.field]}%
                </span>
              </div>
              <div className="relative h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className={cn('absolute inset-y-0 left-0 rounded-full transition-all', slider.trackColor)}
                  style={{ width: `${currentSchedule[slider.field]}%` }}
                />
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={currentSchedule[slider.field]}
                  onChange={e => handleSliderChange(slider.field, Number(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
