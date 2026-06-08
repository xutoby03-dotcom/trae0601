import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Pencil, Trash2, Wrench, Activity } from 'lucide-react'
import { useGearStore } from '@/store/gearStore'
import { useUsageStore } from '@/store/usageStore'
import { useMaintenanceStore } from '@/store/maintenanceStore'
import { GEAR_TYPE_LABELS, GEAR_TYPE_ICONS, USAGE_UNIT_LABELS, FREQUENCY_LABELS } from '@/types'
import { getGearStatus, getTotalUsage, getDaysUntilMaintenance, getStatusColor } from '@/utils/statusCalc'
import { getDepreciationPercent, getRemainingValue, getLifeExpectancy } from '@/utils/depreciationCalc'
import { getTemplatesForType } from '@/utils/maintenanceTemplates'
import StatusBadge from '@/components/StatusBadge'
import RingChart from '@/components/RingChart'
import ProgressBar from '@/components/ProgressBar'
import Timeline from '@/components/Timeline'

export default function GearDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const gears = useGearStore((s) => s.gears)
  const deleteGear = useGearStore((s) => s.deleteGear)
  const usageRecords = useUsageStore((s) => s.records)
  const maintenanceRecords = useMaintenanceStore((s) => s.records)
  const addMaintenanceRecord = useMaintenanceStore((s) => s.addRecord)
  const updateGear = useGearStore((s) => s.updateGear)

  const gear = gears.find((g) => g.id === id)
  if (!gear) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-white/40">装备不存在</p>
      </div>
    )
  }

  const status = getGearStatus(gear, usageRecords)
  const totalUsage = getTotalUsage(gear, usageRecords)
  const daysUntil = getDaysUntilMaintenance(gear)
  const statusColor = getStatusColor(status)
  const depreciPercent = getDepreciationPercent(gear, usageRecords)
  const remainingValue = getRemainingValue(gear, usageRecords)
  const life = getLifeExpectancy(gear, usageRecords)
  const gearUsageRecords = usageRecords.filter((r) => r.gearId === gear.id)
  const gearMaintenanceRecords = maintenanceRecords.filter((r) => r.gearId === gear.id)
  const templates = getTemplatesForType(gear.type)

  const gearImage = gear.photo || (
    `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(
      gear.type === 'running_shoe'
        ? 'Professional running shoes on dark background, product photography'
        : gear.type === 'racket'
          ? 'Tennis racket on dark background, product photography'
          : gear.type === 'bicycle'
            ? 'Road bicycle on dark background, product photography'
            : gear.type === 'yoga_mat'
              ? 'Yoga mat on dark background, product photography'
              : 'Sports equipment on dark background, product photography'
    )}&image_size=landscape_16_9`
  )

  const handleDelete = () => {
    deleteGear(gear.id)
    navigate('/')
  }

  const handleCompleteMaintenance = (templateName: string) => {
    addMaintenanceRecord({
      id: crypto.randomUUID(),
      gearId: gear.id,
      date: new Date().toISOString().split('T')[0],
      type: templateName,
      note: '已完成保养',
    })
    updateGear(gear.id, {
      lastMaintenanceDate: new Date().toISOString().split('T')[0],
    })
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-1.5 text-sm text-white/40 transition-colors hover:text-white/70"
        >
          <ArrowLeft size={16} />
          返回
        </Link>
        <div className="flex gap-2">
          <Link
            to={`/edit/${gear.id}`}
            className="flex items-center gap-1 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-1.5 text-xs text-white/50 transition-colors hover:text-white/80"
          >
            <Pencil size={12} />
            编辑
          </Link>
          <button
            onClick={handleDelete}
            className="flex items-center gap-1 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-1.5 text-xs text-red-400/60 transition-colors hover:text-red-400"
          >
            <Trash2 size={12} />
            删除
          </button>
        </div>
      </div>

      <div className="relative mb-6 overflow-hidden rounded-2xl">
        <img
          src={gearImage}
          alt={gear.name}
          className="h-48 w-full object-cover sm:h-64"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F1F17] via-[#0F1F17]/50 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-end justify-between">
            <div>
              <div className="mb-1 flex items-center gap-2">
                <span className="text-lg">{GEAR_TYPE_ICONS[gear.type]}</span>
                <span className="rounded-md bg-white/10 px-1.5 py-0.5 text-[10px] text-white/60 backdrop-blur-sm">
                  {GEAR_TYPE_LABELS[gear.type]}
                </span>
              </div>
              <h1 className="font-['Playfair_Display'] text-2xl font-bold text-[#F5F0EB]">
                {gear.name}
              </h1>
            </div>
            <StatusBadge status={status} size="md" />
          </div>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-3 text-center">
          <div className="text-[10px] text-white/30">购买价格</div>
          <div className="mt-1 text-base font-bold text-[#F5F0EB]">¥{gear.price}</div>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-3 text-center">
          <div className="text-[10px] text-white/30">使用频率</div>
          <div className="mt-1 text-base font-bold text-[#F5F0EB]">{FREQUENCY_LABELS[gear.usageFrequency]}</div>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-3 text-center">
          <div className="text-[10px] text-white/30">剩余价值</div>
          <div className="mt-1 text-base font-bold text-[#F5F0EB]">¥{Math.round(remainingValue)}</div>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-3 text-center">
          <div className="text-[10px] text-white/30">保养倒计时</div>
          <div className={`mt-1 text-base font-bold ${daysUntil !== null && daysUntil <= 0 ? 'text-red-400' : 'text-[#F5F0EB]'}`}>
            {daysUntil !== null ? `${daysUntil}天` : '-'}
          </div>
        </div>
      </div>

      <div className="mb-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
        <div className="flex items-center gap-6">
          <RingChart
            percent={depreciPercent}
            color={statusColor}
            label="折旧率"
            sublabel={`已使用 ${life.used} ${USAGE_UNIT_LABELS[life.unit]}`}
          />
          <div className="flex-1">
            <h3 className="mb-3 text-sm font-medium text-white/60">寿命进度</h3>
            <ProgressBar
              value={life.used}
              max={life.total}
              unit={USAGE_UNIT_LABELS[life.unit]}
              color={statusColor}
              height={8}
            />
            <div className="mt-3 text-xs text-white/30">
              这{gear.type === 'running_shoe' ? '双跑鞋' : gear.type === 'bicycle' ? '辆自行车' : '件装备'}
              已经{gear.maxUsageUnit === 'km' ? `跑了 ${Math.round(totalUsage)} 公里` : gear.maxUsageUnit === 'hours' ? `使用了 ${Math.round(totalUsage)} 小时` : `使用了 ${Math.round(totalUsage)} 次`}
            </div>
          </div>
        </div>
      </div>

      {templates.length > 0 && (
        <div className="mb-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-white/60">
            <Wrench size={14} />
            保养操作
          </h3>
          <div className="space-y-2">
            {templates.map((t) => (
              <div
                key={t.name}
                className="flex items-center justify-between rounded-xl border border-white/[0.04] bg-white/[0.01] px-4 py-3"
              >
                <div>
                  <div className="text-sm text-[#F5F0EB]">{t.name}</div>
                  <div className="text-[11px] text-white/30">
                    {t.cycleDays > 0 ? `每 ${t.cycleDays} 天` : '按使用量'}
                    {t.tools.length > 0 && ` · 需要 ${t.tools.length} 件工具`}
                  </div>
                </div>
                <button
                  onClick={() => handleCompleteMaintenance(t.name)}
                  className="rounded-lg bg-[#FF6B35]/10 px-3 py-1.5 text-xs font-medium text-[#FF6B35] transition-colors hover:bg-[#FF6B35]/20"
                >
                  完成
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mb-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-white/60">
          <Activity size={14} />
          使用历史
        </h3>
        <Timeline records={gearUsageRecords} unit={gear.maxUsageUnit} />
        {gearUsageRecords.length > 0 && (
          <Link
            to="/record"
            className="mt-3 block rounded-xl border border-dashed border-white/10 py-2 text-center text-xs text-white/30 transition-colors hover:border-white/20 hover:text-white/50"
          >
            + 记录更多使用
          </Link>
        )}
      </div>

      {gearMaintenanceRecords.length > 0 && (
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
          <h3 className="mb-3 text-sm font-medium text-white/60">保养记录</h3>
          <div className="space-y-2">
            {[...gearMaintenanceRecords]
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between rounded-lg border border-white/[0.04] bg-white/[0.01] px-3 py-2"
                >
                  <div className="text-sm text-[#F5F0EB]">{r.type}</div>
                  <span className="text-[11px] text-white/30">{r.date}</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}
