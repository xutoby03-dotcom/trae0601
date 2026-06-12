import { Search, Filter, X } from 'lucide-react'
import { useReferralStore } from '@/store/referralStore'
import { POSITIONS, REFERRERS } from '@/types'

export default function FilterBar() {
  const filterPosition = useReferralStore((s) => s.filterPosition)
  const filterReferrer = useReferralStore((s) => s.filterReferrer)
  const setFilterPosition = useReferralStore((s) => s.setFilterPosition)
  const setFilterReferrer = useReferralStore((s) => s.setFilterReferrer)

  const hasFilter = filterPosition || filterReferrer

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-warm-200 p-5">
      <div className="flex items-center gap-2 mb-4">
        <Filter size={18} className="text-terra" />
        <h2 className="text-base font-semibold text-charcoal">筛选条件</h2>
        {hasFilter && (
          <button
            onClick={() => {
              setFilterPosition('')
              setFilterReferrer('')
            }}
            className="ml-auto inline-flex items-center gap-1 text-sm text-warm-500 hover:text-terra transition-colors"
          >
            <X size={14} />
            清除筛选
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-charcoal mb-1.5">
            目标岗位
          </label>
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-400"
            />
            <select
              value={filterPosition}
              onChange={(e) => setFilterPosition(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-warm-200 bg-warm-50 focus:outline-none focus:ring-2 focus:ring-terra/30 focus:border-terra transition-all appearance-none cursor-pointer"
            >
              <option value="">全部岗位</option>
              {POSITIONS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-charcoal mb-1.5">
            推荐人
          </label>
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-400"
            />
            <select
              value={filterReferrer}
              onChange={(e) => setFilterReferrer(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-warm-200 bg-warm-50 focus:outline-none focus:ring-2 focus:ring-terra/30 focus:border-terra transition-all appearance-none cursor-pointer"
            >
              <option value="">全部推荐人</option>
              {REFERRERS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}
