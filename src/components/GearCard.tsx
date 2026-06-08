import { Link } from 'react-router-dom'
import type { Gear, GearStatus, UsageRecord } from '@/types'
import { GEAR_TYPE_LABELS, GEAR_TYPE_ICONS, USAGE_UNIT_LABELS } from '@/types'
import { getTotalUsage, getDaysUntilMaintenance, getStatusColor } from '@/utils/statusCalc'
import StatusBadge from './StatusBadge'

interface GearCardProps {
  gear: Gear
  status: GearStatus
  usageRecords: UsageRecord[]
}

export default function GearCard({ gear, status, usageRecords }: GearCardProps) {
  const totalUsage = getTotalUsage(gear, usageRecords)
  const usagePercent = gear.maxUsage > 0 ? (totalUsage / gear.maxUsage) * 100 : 0
  const daysUntil = getDaysUntilMaintenance(gear)
  const statusColor = getStatusColor(status)

  const gearImage = gear.photo || (
    `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(
      gear.type === 'running_shoe'
        ? 'Professional running shoes on dark background, product photography, sleek design'
        : gear.type === 'racket'
          ? 'Tennis racket on dark background, product photography, carbon fiber'
          : gear.type === 'bicycle'
            ? 'Road bicycle on dark background, product photography, minimalist'
            : gear.type === 'yoga_mat'
              ? 'Rolled yoga mat on dark background, product photography, clean'
              : 'Sports equipment on dark background, product photography'
    )}&image_size=square`
  )

  return (
    <Link
      to={`/gear/${gear.id}`}
      className="group block overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] transition-all duration-300 hover:-translate-y-1 hover:border-white/10 hover:shadow-lg hover:shadow-black/20"
    >
      <div className="relative h-40 overflow-hidden">
        <img
          src={gearImage}
          alt={gear.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F1F17] via-[#0F1F17]/40 to-transparent" />
        <div className="absolute right-3 top-3">
          <StatusBadge status={status} />
        </div>
        <div className="absolute bottom-3 left-3 right-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">{GEAR_TYPE_ICONS[gear.type]}</span>
            <span className="rounded-md bg-white/10 px-1.5 py-0.5 text-[10px] text-white/60 backdrop-blur-sm">
              {GEAR_TYPE_LABELS[gear.type]}
            </span>
          </div>
        </div>
      </div>
      <div className="p-4">
        <h3 className="mb-2 text-sm font-semibold text-[#F5F0EB] group-hover:text-[#FF6B35] transition-colors">
          {gear.name}
        </h3>
        {gear.maxUsage > 0 && (
          <div className="mb-2">
            <div className="mb-1 flex items-center justify-between text-[11px]">
              <span className="text-white/40">
                {Math.round(totalUsage)} / {gear.maxUsage} {USAGE_UNIT_LABELS[gear.maxUsageUnit]}
              </span>
              <span style={{ color: statusColor }}>
                {Math.round(usagePercent)}%
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${Math.min(usagePercent, 100)}%`,
                  background: `linear-gradient(90deg, ${statusColor}80, ${statusColor})`,
                }}
              />
            </div>
          </div>
        )}
        {daysUntil !== null && (
          <div className="text-[11px] text-white/30">
            {daysUntil > 0 ? (
              <span>
                距下次保养 <span className="text-white/50">{daysUntil} 天</span>
              </span>
            ) : (
              <span className="text-red-400/80">保养已超期 {-daysUntil} 天</span>
            )}
          </div>
        )}
      </div>
    </Link>
  )
}
