import { useInsectHotel } from '../hooks/useInsectHotel'

export function StatusStats() {
  const { getStatusStats, cells } = useInsectHotel()
  const stats = getStatusStats()
  const total = cells.length

  const statItems = [
    {
      label: '已入住',
      value: stats.occupied,
      emoji: '🏠',
      color: 'bg-green-100 border-green-300 text-green-800',
      barColor: 'bg-green-500',
    },
    {
      label: '观察中',
      value: stats.underObservation,
      emoji: '👀',
      color: 'bg-amber-100 border-amber-300 text-amber-800',
      barColor: 'bg-amber-500',
    },
    {
      label: '空置',
      value: stats.empty,
      emoji: '🔲',
      color: 'bg-stone-100 border-stone-300 text-stone-700',
      barColor: 'bg-stone-400',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {statItems.map((item, index) => {
        const percentage = total > 0 ? Math.round((item.value / total) * 100) : 0
        return (
          <div
            key={item.label}
            className={`p-5 rounded-xl border-2 border-dashed ${item.color} transition-all duration-300 hover:scale-[1.02]`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-3xl">{item.emoji}</span>
              <span className="text-xs px-2 py-1 bg-white/50 rounded-full">
                {percentage}%
              </span>
            </div>
            <div className="text-3xl font-bold mb-1">{item.value}</div>
            <div className="text-sm mb-3">{item.label}</div>
            <div className="w-full h-2 bg-white/50 rounded-full overflow-hidden">
              <div
                className={`h-full ${item.barColor} rounded-full transition-all duration-700`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
