import { useMemo, useState } from 'react'
import { Search, Filter, CheckCircle, Clock, Package, Snowflake, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { SIZE_LABEL, SIZE_BADGE_COLOR } from '@/utils/constants'
import { formatDateTime, formatDuration } from '@/utils/helpers'

type FilterStatus = 'all' | 'active' | 'picked' | 'urgent'

export default function PackageTable() {
  const { packages, getLocker } = useAppStore()
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [sortDesc, setSortDesc] = useState(true)

  const filteredPackages = useMemo(() => {
    let result = [...packages]
    if (search) {
      const q = search.toLowerCase()
      result = result.filter((p) =>
        p.recipientName.toLowerCase().includes(q) ||
        p.phoneLastFour.includes(q) ||
        p.expressCompany.toLowerCase().includes(q) ||
        getLocker(p.lockerId)?.code.toLowerCase().includes(q)
      )
    }
    if (filterStatus === 'active') result = result.filter(p => !p.isPickedUp)
    if (filterStatus === 'picked') result = result.filter(p => p.isPickedUp)
    if (filterStatus === 'urgent') result = result.filter(p => !p.isPickedUp && p.isUrgent)
    return result.sort((a, b) => {
      const ta = new Date(a.inTime).getTime()
      const tb = new Date(b.inTime).getTime()
      return sortDesc ? tb - ta : ta - tb
    })
  }, [packages, search, filterStatus, sortDesc, getLocker])

  const counts = useMemo(() => ({
    all: packages.length,
    active: packages.filter(p => !p.isPickedUp).length,
    picked: packages.filter(p => p.isPickedUp).length,
    urgent: packages.filter(p => !p.isPickedUp && p.isUrgent).length,
  }), [packages])

  return (
    <div className="bg-white rounded-2xl card-shadow overflow-hidden">
      <div className="p-5 border-b border-slate-100">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
              <Package size={20} className="text-purple-600" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-slate-800">包裹记录</h3>
              <p className="text-sm text-slate-500">所有入柜包裹的完整记录</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[200px] relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="搜索收件人、手机号、快递公司或柜格..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
            />
          </div>

          <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-100">
            {(['all', 'active', 'urgent', 'picked'] as FilterStatus[]).map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  filterStatus === s
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {s === 'all' ? `全部 ${counts.all}`
                  : s === 'active' ? `在柜 ${counts.active}`
                  : s === 'urgent' ? `催取 ${counts.urgent}`
                  : `已取 ${counts.picked}`}
              </button>
            ))}
          </div>

          <button
            onClick={() => setSortDesc(!sortDesc)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50"
          >
            <Filter size={14} />
            {sortDesc ? '最新入柜' : '最早入柜'}
            {sortDesc ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </button>
        </div>
      </div>

      {filteredPackages.length === 0 ? (
        <div className="p-16 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-slate-100 flex items-center justify-center mb-3">
            <Package size={28} className="text-slate-300" />
          </div>
          <p className="text-slate-500">暂无符合条件的包裹记录</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">收件人</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">手机尾号</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">快递公司</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">柜格</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">属性</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">入柜时间</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">状态</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPackages.map((pkg) => {
                const locker = getLocker(pkg.lockerId)
                return (
                  <tr key={pkg.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="font-medium text-slate-800">{pkg.recipientName}</div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="font-mono text-sm text-slate-600">****{pkg.phoneLastFour}</span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="text-sm text-slate-700">{pkg.expressCompany}</span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="font-serif font-bold text-slate-700">{locker?.code || '-'}</span>
                        {locker?.isRefrigerated && <Snowflake size={13} className="text-blue-500" />}
                      </div>
                      <span className="text-xs text-slate-400 block">{locker?.location || '-'}</span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${SIZE_BADGE_COLOR[pkg.size]}`}>
                          {SIZE_LABEL[pkg.size]}
                        </span>
                        {pkg.isFragile && <span className="text-lg" title="易碎">💎</span>}
                      </div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-700">{formatDateTime(pkg.inTime)}</div>
                      <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <Clock size={11} />
                        {pkg.isPickedUp ? '存放 ' + formatDuration(pkg.inTime) : '已 ' + formatDuration(pkg.inTime)}
                      </div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      {pkg.isPickedUp ? (
                        <div>
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium">
                            <CheckCircle size={12} />
                            已取件
                          </span>
                          {pkg.outTime && (
                            <p className="text-xs text-slate-400 mt-1">{formatDateTime(pkg.outTime)}</p>
                          )}
                        </div>
                      ) : pkg.isUrgent ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-warning-100 text-warning-700 text-xs font-medium animate-pulse-slow">
                          <AlertTriangle size={12} />
                          需催取
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
                          <Clock size={12} />
                          在柜中
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
        <span>共 <strong className="text-slate-700">{filteredPackages.length}</strong> 条记录</span>
        <span>显示第 1 - {filteredPackages.length} 条</span>
      </div>
    </div>
  )
}
