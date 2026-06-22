import { AlertTriangle, Lightbulb } from 'lucide-react'
import { useInsectHotel } from '../hooks/useInsectHotel'

export function MaterialAlert() {
  const { getMaterialAlerts } = useInsectHotel()
  const alerts = getMaterialAlerts()

  if (alerts.length === 0) return null

  return (
    <div className="mb-6">
      <div className="bg-amber-50 border-2 border-dashed border-amber-300 rounded-xl p-5 animate-pulse">
        <div className="flex items-start gap-3 mb-4">
          <div className="p-2 bg-amber-200 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-amber-700" />
          </div>
          <div>
            <h3 className="font-bold text-amber-900 text-lg">材料使用提醒</h3>
            <p className="text-amber-700 text-sm">以下材料已超过14天没有昆虫入住迹象</p>
          </div>
        </div>

        <div className="space-y-3">
          {alerts.map((alert, index) => (
            <div
              key={alert.material}
              className="bg-white/70 rounded-lg p-4 border border-amber-200"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-amber-600 font-medium">{alert.materialName}</span>
                  <span className="text-xs bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full">
                    {alert.cellCount}个格口
                  </span>
                </div>
                <span className="text-sm text-amber-600 font-medium">
                  空置 {alert.unusedDays} 天
                </span>
              </div>
              <div className="flex items-start gap-2 text-sm text-amber-700">
                <Lightbulb className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{alert.suggestion}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
