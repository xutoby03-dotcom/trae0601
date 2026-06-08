import { useWalkStore } from '@/store/useWalkStore'
import { moodModes } from '@/data/moods'

export default function MoodSelector() {
  const activeMoodId = useWalkStore((s) => s.activeMoodId)
  const activateMood = useWalkStore((s) => s.activateMood)

  return (
    <div className="px-4 py-3 border-b border-gray-100">
      <div className="text-xs text-[#8B7073] mb-2 font-medium">心情模式 · 点一下自动推荐</div>
      <div className="flex gap-2">
        {moodModes.map((mood) => {
          const isActive = activeMoodId === mood.id
          return (
            <button
              key={mood.id}
              onClick={() => activateMood(mood.id)}
              className={`
                flex-1 py-2 px-2 rounded-xl text-xs font-medium
                transition-all duration-300 flex flex-col items-center gap-0.5
                ${
                  isActive
                    ? 'bg-[#F97316] text-white shadow-lg shadow-orange-200 scale-105'
                    : 'bg-white/70 text-[#6B5356] hover:bg-white hover:shadow-sm'
                }
              `}
            >
              <span className={`text-lg ${isActive ? 'animate-bounce' : ''}`}>{mood.emoji}</span>
              <span className="leading-tight">{mood.name}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
