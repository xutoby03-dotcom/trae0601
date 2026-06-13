import { Snowflake, Thermometer, Phone, Clock, LogOut } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { SIZE_LABEL, SIZE_BADGE_COLOR } from '@/utils/constants'
import { formatDateTime, formatDuration } from '@/utils/helpers'

interface RefrigeratedAlertProps {
  onCheckOut: (packageId: string) => void
}

export default function RefrigeratedAlert({ onCheckOut }: RefrigeratedAlertProps) {
  const { getRefrigeratedPackages, getLocker } = useAppStore()
  const packages = getRefrigeratedPackages()

  if (packages.length === 0) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-100 p-5 card-shadow">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
            <Snowflake size={20} className="text-blue-600" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-lg text-slate-800">冷藏包裹提醒</h3>
            <p className="text-sm text-slate-500">需低温保存的包裹</p>
          </div>
        </div>
        <p className="text-sm text-slate-400 py-2">当前无冷藏包裹 🎉</p>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 rounded-2xl p-0.5 card-shadow">
      <div className="bg-white rounded-[14px] p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center">
                <Snowflake size={20} className="text-white" />
              </div>
              <div className="absolute -inset-1 rounded-xl bg-blue-400/30 animate-pulse-slow -z-10" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-slate-800">冷藏包裹提醒</h3>
              <p className="text-sm text-slate-500 flex items-center gap-1">
                <Thermometer size={12} className="text-blue-500" />
                低温保存中，请尽快领取
              </p>
            </div>
          </div>
          <span className="px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-bold shadow-lg shadow-blue-500/30">
            {packages.length} 件
          </span>
        </div>

        <div className="space-y-3">
          {packages.map((pkg) => {
            const locker = getLocker(pkg.lockerId)
            const hours = Math.floor((Date.now() - new Date(pkg.inTime).getTime()) / 3600000)
            const isLong = hours >= 12
            return (
              <div
                key={pkg.id}
                className={`relative p-4 rounded-xl border transition-all ${
                  isLong
                    ? 'bg-red-50 border-red-200 animate-pulse-slow'
                    : 'bg-blue-50/50 border-blue-100 hover:border-blue-200'
                }`}
              >
                {isLong && (
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-red-500 text-white text-xs font-bold">
                    超过12小时
                  </span>
                )}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-800">{pkg.recipientName}</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${SIZE_BADGE_COLOR[pkg.size]}`}>
                        {SIZE_LABEL[pkg.size]}
                      </span>
                      {pkg.isFragile && (
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
                          易碎
                        </span>
                      )}
                      {pkg.isUrgent && (
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-warning-100 text-warning-700">
                          需催取
                        </span>
                      )}
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-y-1.5 gap-x-4 text-sm">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Phone size={14} className="text-slate-400" />
                        尾号 ****{pkg.phoneLastFour}
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Snowflake size={14} className="text-blue-500" />
                        {locker?.code} · {locker?.location}
                      </div>
                      <div className="flex items-center gap-2 text-slate-600 col-span-2">
                        <Clock size={14} className="text-slate-400" />
                        入柜 {formatDateTime(pkg.inTime)} · 已冷藏 {formatDuration(pkg.inTime)}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => onCheckOut(pkg.id)}
                    className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-medium hover:from-blue-600 hover:to-cyan-600 transition-all shadow-sm"
                  >
                    <LogOut size={14} />
                    取件
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
