import type { Observation } from '../types'
import {
  VISITOR_NAMES,
  VISITOR_EMOJIS,
  WEATHER_EMOJIS,
} from '../types'
import { formatDateDisplay } from '../utils/dateUtils'

interface ObservationTimelineProps {
  observations: Observation[]
}

export function ObservationTimeline({ observations }: ObservationTimelineProps) {
  if (observations.length === 0) {
    return (
      <div className="text-center py-12 text-stone-400">
        <div className="text-4xl mb-2">📭</div>
        <p>还没有观察记录</p>
      </div>
    )
  }

  return (
    <div className="relative">
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-stone-200" />

      <div className="space-y-6">
        {observations.map((obs, index) => {
          const hasActivity =
            obs.hasSeal || obs.hasBiteMarks || obs.hasEmergenceHole || obs.visitorTypes.length > 0

          return (
            <div
              key={obs.id}
              className="relative pl-14"
              style={{ animation: `slideIn 0.5s ease ${index * 50}ms both` }}
            >
              <div
                className={`absolute left-4 top-0 w-5 h-5 rounded-full border-4 ${
                  hasActivity
                    ? 'bg-green-500 border-green-200'
                    : 'bg-stone-300 border-stone-100'
                }`}
              />

              <div className="bg-white rounded-xl border-2 border-dashed border-stone-200 p-4 hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{WEATHER_EMOJIS[obs.weather]}</span>
                    <span className="font-bold text-stone-800">
                      {formatDateDisplay(obs.observationDate)}
                    </span>
                  </div>
                  <span className="text-xs text-stone-400">
                    记录人：{obs.recorder}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  {obs.hasSeal && (
                    <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs">
                      🔒 有封口
                    </span>
                  )}
                  {obs.hasBiteMarks && (
                    <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs">
                      🦷 有啃痕
                    </span>
                  )}
                  {obs.hasEmergenceHole && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                      🕳️ 有羽化孔
                    </span>
                  )}
                  {!hasActivity && (
                    <span className="px-2 py-1 bg-stone-100 text-stone-500 rounded-full text-xs">
                      无明显活动
                    </span>
                  )}
                </div>

                {obs.visitorTypes.length > 0 && (
                  <div className="mb-3">
                    <span className="text-xs text-stone-500">访客：</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {obs.visitorTypes.map((v) => (
                        <span
                          key={v}
                          className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs flex items-center gap-1"
                        >
                          {VISITOR_EMOJIS[v]} {VISITOR_NAMES[v]}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {obs.notes && (
                  <div className="text-sm text-stone-600 bg-stone-50 rounded-lg p-3">
                    💬 {obs.notes}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  )
}
