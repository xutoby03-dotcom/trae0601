import { useStore } from '@/store'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, Plus, Droplets, ArrowRight } from 'lucide-react'
import type { FilterWithStatus, FilterType } from '@/types'
import { FILTER_TYPE_ICONS } from '@/types'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { useState } from 'react'
import { ReplacementFormModal, WaterQualityFormModal } from '@/components/FormModals'

function RingProgress({ percent, status }: { percent: number; status: string }) {
  const radius = 36
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percent / 100) * circumference
  const color = status === 'expired' ? '#ef4444' : status === 'warning' ? '#f59e0b' : '#10b981'

  return (
    <svg width="88" height="88" className="transform -rotate-90">
      <circle cx="44" cy="44" r={radius} fill="none" stroke="#f1f5f9" strokeWidth="6" />
      <circle
        cx="44" cy="44" r={radius} fill="none"
        stroke={color} strokeWidth="6" strokeLinecap="round"
        strokeDasharray={circumference} strokeDashoffset={offset}
        className="transition-all duration-1000 ease-out"
      />
    </svg>
  )
}

function FilterCard({ filter }: { filter: FilterWithStatus }) {
  const navigate = useNavigate()
  const borderColor = filter.status === 'expired' ? 'border-red-400' : filter.status === 'warning' ? 'border-amber-400' : 'border-emerald-400'
  const bgColor = filter.status === 'expired' ? 'bg-red-50/50' : filter.status === 'warning' ? 'bg-amber-50/50' : 'bg-white'
  const statusText = filter.status === 'expired' ? '已超期' : filter.status === 'warning' ? '即将到期' : '正常'
  const statusCls = filter.status === 'expired' ? 'text-red-600 bg-red-100' : filter.status === 'warning' ? 'text-amber-600 bg-amber-100' : 'text-emerald-600 bg-emerald-100'

  return (
    <div
      className={`relative ${bgColor} rounded-2xl border-l-4 ${borderColor} p-5 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group`}
      onClick={() => navigate('/replacements')}
    >
      <div className="flex items-start gap-4">
        <div className="relative flex-shrink-0">
          <RingProgress percent={filter.remainingPercent} status={filter.status} />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-display font-bold text-slate-700">{filter.remainingPercent}%</span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-base">{FILTER_TYPE_ICONS[filter.filterType]}</span>
            <h3 className="font-display font-semibold text-slate-800 text-base">{filter.filterType}</h3>
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${statusCls}`}>{statusText}</span>
          </div>
          <p className="text-xs text-slate-400 mb-1">
            {filter.purifier.brand} {filter.purifier.model}
          </p>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className={filter.remainingDays <= 0 ? 'text-red-500 font-semibold' : ''}>
              {filter.remainingDays <= 0
                ? `超期 ${Math.abs(filter.remainingDays)} 天`
                : `剩余 ${filter.remainingDays} 天`}
            </span>
            {filter.lastReplaceDate && (
              <span>
                上次换芯 {format(new Date(filter.lastReplaceDate), 'M/d', { locale: zhCN })}
              </span>
            )}
          </div>
          {filter.purchaseLink && (
            <a
              href={filter.purchaseLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[10px] text-brand-600 hover:text-brand-700 mt-1.5 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              去购买 <ArrowRight className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { purifiers, getFiltersWithStatus, getWaterQualityAlert } = useStore()
  const filters = getFiltersWithStatus()
  const alert = getWaterQualityAlert()
  const [showReplaceModal, setShowReplaceModal] = useState(false)
  const [showQualityModal, setShowQualityModal] = useState(false)
  const navigate = useNavigate()

  const expiredFilters = filters.filter((f) => f.status === 'expired')
  const warningFilters = filters.filter((f) => f.status === 'warning')
  const normalFilters = filters.filter((f) => f.status === 'normal')
  const sortedFilters = [...expiredFilters, ...warningFilters, ...normalFilters]

  const groupedFilters: Record<FilterType, FilterWithStatus[]> = {} as any
  sortedFilters.forEach((f) => {
    if (!groupedFilters[f.filterType]) groupedFilters[f.filterType] = []
    groupedFilters[f.filterType].push(f)
  })

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="font-display text-2xl md:text-3xl font-bold text-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-brand-500/20">
            <Droplets className="w-5 h-5 text-white" />
          </div>
          滤芯管家
        </h1>
        <p className="text-sm text-slate-400 mt-1 ml-[52px]">实时掌握家中滤芯状态</p>
      </div>

      {alert.hasAlert && (
        <div
          className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl flex items-center gap-3 cursor-pointer hover:shadow-md transition-all animate-fade-in"
          onClick={() => navigate('/water-quality')}
        >
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center animate-pulse-slow">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800">水质异常预警</p>
            <p className="text-xs text-amber-600 mt-0.5">{alert.message}</p>
          </div>
          <ArrowRight className="w-4 h-4 text-amber-400" />
        </div>
      )}

      {expiredFilters.length > 0 && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="text-xs text-red-700">
            <span className="font-semibold">{expiredFilters.length}</span> 个滤芯已超期，请尽快更换
          </p>
        </div>
      )}

      {purifiers.length === 0 ? (
        <div className="text-center py-20 animate-fade-in">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-brand-50 flex items-center justify-center">
            <Droplets className="w-10 h-10 text-brand-300" />
          </div>
          <h2 className="font-display text-lg font-semibold text-slate-600 mb-2">还没有添加净水器</h2>
          <p className="text-sm text-slate-400 mb-6">添加你的第一台净水器，开始管理滤芯</p>
          <button
            onClick={() => navigate('/purifiers')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-brand-600 to-cyan-600 hover:from-brand-700 hover:to-cyan-700 shadow-lg shadow-brand-500/20 transition-all"
          >
            <Plus className="w-4 h-4" /> 添加净水器
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-white rounded-xl p-3 border border-slate-100 text-center">
              <p className="text-2xl font-display font-bold text-red-500">{expiredFilters.length}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">已超期</p>
            </div>
            <div className="bg-white rounded-xl p-3 border border-slate-100 text-center">
              <p className="text-2xl font-display font-bold text-amber-500">{warningFilters.length}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">即将到期</p>
            </div>
            <div className="bg-white rounded-xl p-3 border border-slate-100 text-center">
              <p className="text-2xl font-display font-bold text-emerald-500">{normalFilters.length}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">正常</p>
            </div>
          </div>

          {Object.entries(groupedFilters).map(([type, typeFilters]) => (
            <div key={type} className="mb-6">
              <h2 className="font-display text-sm font-semibold text-slate-600 mb-3 flex items-center gap-2">
                <span>{FILTER_TYPE_ICONS[type as FilterType]}</span>
                {type}
                <span className="text-xs text-slate-400 font-normal">({typeFilters.length})</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {typeFilters.map((f) => (
                  <FilterCard key={f.id} filter={f} />
                ))}
              </div>
            </div>
          ))}

          <div className="fixed bottom-24 md:bottom-8 right-6 flex flex-col gap-3 z-40">
            <button
              onClick={() => setShowQualityModal(true)}
              className="w-12 h-12 rounded-full bg-white shadow-lg border border-slate-200 flex items-center justify-center text-cyan-600 hover:bg-cyan-50 hover:shadow-xl transition-all"
              title="记录水质"
            >
              <Droplets className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowReplaceModal(true)}
              className="w-12 h-12 rounded-full bg-gradient-to-r from-brand-600 to-cyan-600 shadow-lg shadow-brand-500/30 flex items-center justify-center text-white hover:shadow-xl transition-all"
              title="记录换芯"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </>
      )}

      <ReplacementFormModal open={showReplaceModal} onClose={() => setShowReplaceModal(false)} />
      <WaterQualityFormModal open={showQualityModal} onClose={() => setShowQualityModal(false)} />
    </div>
  )
}
