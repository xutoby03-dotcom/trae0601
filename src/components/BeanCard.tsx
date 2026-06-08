import { Link } from 'react-router-dom'
import { AlertTriangle, Clock, MapPin } from 'lucide-react'
import type { CoffeeBean } from '@/types'
import { getRoastColor, getRoastLabel, getProcessLabel, daysSinceOpen } from '@/utils/helpers'

interface BeanCardProps {
  bean: CoffeeBean
}

export default function BeanCard({ bean }: BeanCardProps) {
  const colors = getRoastColor(bean.roastLevel)
  const isFinished = bean.weightRemaining <= 0
  const isLowStock = bean.weightRemaining > 0 && bean.weightRemaining < 50
  const isOpenTooLong = bean.openDate ? daysSinceOpen(bean.openDate) > 30 : false
  const weightRatio = bean.weightTotal > 0 ? bean.weightRemaining / bean.weightTotal : 0

  return (
    <Link
      to={`/beans/${bean.id}`}
      className="relative block rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group"
      style={{ backgroundColor: colors.bg }}
    >
      {isFinished && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 rounded-2xl">
          <span className="text-white text-2xl font-bold tracking-widest">已喝完</span>
        </div>
      )}

      <div
        className="h-12 flex items-center justify-center"
        style={{ backgroundColor: colors.band }}
      >
        <span
          className="text-sm font-semibold tracking-wide uppercase"
          style={{ color: colors.text }}
        >
          {getRoastLabel(bean.roastLevel)}
        </span>
      </div>

      <div className={`p-4 flex flex-col gap-3 ${isFinished ? 'opacity-50' : ''}`}>
        <h3
          className="text-lg font-bold leading-tight line-clamp-2"
          style={{ fontFamily: '"Playfair Display", serif', color: colors.text }}
        >
          {bean.name}
        </h3>

        <div className="flex items-center gap-1.5 text-sm" style={{ color: colors.text, opacity: 0.8 }}>
          <MapPin size={14} />
          <span>{bean.origin}</span>
        </div>

        <div className="flex flex-wrap gap-2">
          <span
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
            style={{ backgroundColor: colors.band, color: colors.text }}
          >
            {getRoastLabel(bean.roastLevel)}
          </span>
          <span
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border"
            style={{ borderColor: colors.band, color: colors.text }}
          >
            {getProcessLabel(bean.processMethod)}
          </span>
        </div>

        <div className="mt-1">
          <div className="flex items-center justify-between text-xs mb-1" style={{ color: colors.text, opacity: 0.7 }}>
            <span>剩余量</span>
            <span>{bean.weightRemaining}g / {bean.weightTotal}g</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: colors.band, opacity: 0.3 }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.max(0, Math.min(100, weightRatio * 100))}%`, backgroundColor: colors.band }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 mt-1">
          {isLowStock && (
            <span className="inline-flex items-center gap-1 text-amber-600 text-xs font-medium">
              <AlertTriangle size={13} />
              库存不足
            </span>
          )}
          {isOpenTooLong && (
            <span className="inline-flex items-center gap-1 text-orange-600 text-xs font-medium">
              <Clock size={13} />
              开封较久
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
