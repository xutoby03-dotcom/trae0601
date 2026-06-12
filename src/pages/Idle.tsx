import { useMemo } from 'react'
import { Clock, Droplets, Trash2, Package } from 'lucide-react'
import type { IdleAction } from '@/types'
import { CATEGORY_LABELS, COLOR_LABELS, COLOR_HEX, WASH_STATUS_LABELS } from '@/types'
import { useWardrobeStore, getDaysSince } from '@/store/wardrobeStore'

export default function Idle() {
  const clothing = useWardrobeStore((s) => s.clothing)
  const markIdleAction = useWardrobeStore((s) => s.markIdleAction)
  const markWashStatus = useWardrobeStore((s) => s.markWashStatus)

  const idleItems = useMemo(() => {
    return clothing
      .map((item) => ({ item, days: getDaysSince(item.lastWornDate, item.createdAt) }))
      .filter(({ days }) => days > 30)
      .sort((a, b) => b.days - a.days)
  }, [clothing])

  const handleAction = (id: string, action: IdleAction) => {
    if (action === 'wash') {
      markWashStatus(id, 'washing')
    }
    markIdleAction(id, action)
  }

  if (idleItems.length === 0) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh]">
        <Clock className="w-16 h-16 text-warm-400 mb-4" />
        <p className="text-warm-400 text-lg">太棒了！所有衣物都在轮换中 🎉</p>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-warm-900">闲置提醒</h1>
        <p className="text-warm-400 text-sm mt-1">共 {idleItems.length} 件衣物超过30天未穿着</p>
      </div>

      <div className="space-y-4">
        {idleItems.map(({ item, days }) => (
          <div key={item.id} className="bg-white rounded-2xl p-4 shadow-sm animate-fade-in">
            <div className="flex items-start gap-4">
              <div className="shrink-0">
                {item.photoUrl ? (
                  <img
                    src={item.photoUrl}
                    alt={item.name}
                    className="w-16 h-20 rounded-xl object-cover"
                  />
                ) : (
                  <div
                    className="w-16 h-20 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: COLOR_HEX[item.color] }}
                  >
                    <span className="text-white text-xs font-medium">
                      {COLOR_LABELS[item.color]}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-display font-semibold text-warm-900 truncate">
                  {item.name}
                </h3>
                <div className="flex items-center gap-2 mt-1 text-sm text-warm-400">
                  <span>{CATEGORY_LABELS[item.category]}</span>
                  <span>·</span>
                  <span>{COLOR_LABELS[item.color]}</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="inline-block px-2 py-0.5 rounded-full text-xs bg-warm-100 text-warm-600">
                    {WASH_STATUS_LABELS[item.washStatus]}
                  </span>
                  <span className="text-xs text-warm-400">
                    上次穿着: {item.lastWornDate || '未记录'}
                  </span>
                </div>
              </div>

              <div className="shrink-0 text-right">
                <div className="text-3xl font-bold text-warm-900">
                  {days}
                  <span className="text-sm font-normal text-warm-400 ml-0.5">天</span>
                </div>
                <div className="w-20 h-1.5 bg-warm-100 rounded-full mt-2">
                  <div
                    className="h-full bg-warm-500 rounded-full"
                    style={{ width: `${Math.min((days / 90) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => handleAction(item.id, 'wash')}
                className="flex items-center gap-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg px-3 py-1.5 text-xs font-medium"
              >
                <Droplets className="w-3.5 h-3.5" />
                送洗
              </button>
              <button
                onClick={() => handleAction(item.id, 'store')}
                className="flex items-center gap-1 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg px-3 py-1.5 text-xs font-medium"
              >
                <Package className="w-3.5 h-3.5" />
                收纳
              </button>
              <button
                onClick={() => handleAction(item.id, 'discard')}
                className="flex items-center gap-1 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg px-3 py-1.5 text-xs font-medium"
              >
                <Trash2 className="w-3.5 h-3.5" />
                淘汰
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
