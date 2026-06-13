import { AlertTriangle, Phone, Clock, User, LogOut, Snowflake, Package } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { SIZE_LABEL, SIZE_BADGE_COLOR } from '@/utils/constants'
import { formatDateTime, formatDuration } from '@/utils/helpers'

interface UrgentListProps {
  onCheckOut: (packageId: string) => void
}

export default function UrgentList({ onCheckOut }: UrgentListProps) {
  const { getUrgentPackages, getLocker } = useAppStore()
  const packages = getUrgentPackages()

  if (packages.length === 0) {
    return (
      <div className="bg-white rounded-2xl card-shadow p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-warning-100 flex items-center justify-center">
            <AlertTriangle size={20} className="text-warning-600" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-lg text-slate-800">催取区</h3>
            <p className="text-sm text-slate-500">超过48小时未取的包裹</p>
          </div>
        </div>
        <div className="py-12 text-center text-slate-400">
          <div className="w-16 h-16 mx-auto rounded-full bg-slate-100 flex items-center justify-center mb-3">
            <Package size={28} className="text-slate-300" />
          </div>
          <p>暂无滞留包裹</p>
          <p className="text-xs mt-1">所有包裹均在正常领取期内</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl card-shadow overflow-hidden">
      <div className="flex items-center justify-between p-5 border-b border-warning-100 bg-gradient-to-r from-warning-50 to-orange-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-warning-500 flex items-center justify-center animate-pulse-slow">
            <AlertTriangle size={20} className="text-white" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-lg text-slate-800">催取区</h3>
            <p className="text-sm text-slate-500">{packages.length} 个包裹超过48小时未取，需尽快联系</p>
          </div>
        </div>
        <span className="px-3 py-1.5 rounded-full bg-warning-500 text-white text-sm font-bold">
          {packages.length} 件
        </span>
      </div>

      <div className="divide-y divide-slate-100 max-h-[480px] overflow-y-auto scrollbar-thin">
        {packages.map((pkg) => {
          const locker = getLocker(pkg.lockerId)
          return (
            <div key={pkg.id} className="p-4 hover:bg-warning-50/50 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-800">{pkg.recipientName}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${SIZE_BADGE_COLOR[pkg.size]}`}>
                      {SIZE_LABEL[pkg.size]}
                    </span>
                    {locker?.isRefrigerated && (
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700 inline-flex items-center gap-1">
                        <Snowflake size={12} /> 冷藏
                      </span>
                    )}
                    {pkg.isFragile && (
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
                        易碎
                      </span>
                    )}
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-y-1.5 gap-x-4 text-sm">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Phone size={14} className="text-slate-400" />
                      尾号 ****{pkg.phoneLastFour}
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <div className="w-3.5 h-3.5 rounded-sm bg-slate-200 flex items-center justify-center text-[9px] font-bold text-slate-600">📦</div>
                      {pkg.expressCompany}
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <div className="w-3.5 h-3.5 rounded-sm bg-primary-100 flex items-center justify-center text-[9px] font-bold text-primary-700">柜</div>
                      {locker?.code || '-'} · {locker?.location || '-'}
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Clock size={14} className="text-slate-400" />
                      {formatDateTime(pkg.inTime)}
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-warning-500 text-white text-xs font-bold">
                      <Clock size={12} />
                      已滞留 {formatDuration(pkg.inTime)}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <User size={12} />
                    收件人
                  </div>
                  <button
                    onClick={() => onCheckOut(pkg.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-colors shadow-sm"
                  >
                    <LogOut size={14} />
                    取件
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
