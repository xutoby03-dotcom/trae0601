import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useCarpoolStore } from '@/store/useCarpoolStore'
import CarpoolCard from '@/components/CarpoolCard'
import FilterBar, { type FilterState } from '@/components/FilterBar'
import { getTimeGroup, TIME_GROUP_LABELS, type TimeGroup } from '@/utils/time'
import type { Carpool } from '@/types'
import { Plus, Car } from 'lucide-react'

const GROUP_ORDER: TimeGroup[] = ['today', 'tomorrow', 'thisWeek']

export default function Home() {
  const carpools = useCarpoolStore((s) => s.carpools)
  const [filters, setFilters] = useState<FilterState>({
    destination: '',
    timePeriod: 'all',
    minSeats: 0,
  })

  const filtered = useMemo(() => {
    return carpools
      .filter((c) => {
        if (c.status === 'departed' || c.status === 'cancelled') return false
        if (filters.destination && !c.destination.includes(filters.destination)) return false
        if (filters.timePeriod !== 'all') {
          const group = getTimeGroup(c.departureTime)
          if (group !== filters.timePeriod) return false
        }
        if (filters.minSeats > 0) {
          const remaining = c.totalSeats - c.passengers.length
          if (remaining < filters.minSeats) return false
        }
        return true
      })
      .sort((a, b) => new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime())
  }, [carpools, filters])

  const grouped = useMemo(() => {
    const map = new Map<TimeGroup, Carpool[]>()
    GROUP_ORDER.forEach((g) => map.set(g, []))
    filtered.forEach((c) => {
      const group = getTimeGroup(c.departureTime)
      if (group === 'past') return
      const list = map.get(group)
      if (list) list.push(c)
    })
    return map
  }, [filtered])

  const hasAny = GROUP_ORDER.some((g) => (grouped.get(g)?.length ?? 0) > 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">邻里拼车</h1>
          <p className="text-sm text-slate-400 mt-0.5">和邻居一起出发，省钱又环保</p>
        </div>
        <Link
          to="/publish"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium shadow-lg shadow-orange-200 hover:shadow-xl hover:shadow-orange-300 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>发布拼车</span>
        </Link>
      </div>

      <FilterBar filters={filters} onChange={setFilters} />

      {!hasAny && (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-orange-50 flex items-center justify-center">
            <Car className="w-8 h-8 text-orange-300" />
          </div>
          <p className="text-slate-400 text-sm">暂无拼车信息</p>
          <Link
            to="/publish"
            className="inline-flex items-center gap-1 mt-3 text-sm text-orange-600 hover:text-orange-700 font-medium"
          >
            <Plus className="w-4 h-4" />
            发布第一条拼车
          </Link>
        </div>
      )}

      {GROUP_ORDER.map((group) => {
        const list = grouped.get(group) ?? []
        if (list.length === 0) return null

        return (
          <section key={group} className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-2.5 h-2.5 rounded-full ${
                group === 'today' ? 'bg-orange-500' :
                group === 'tomorrow' ? 'bg-amber-400' : 'bg-emerald-400'
              }`} />
              <h2 className="font-bold text-slate-700 text-base">{TIME_GROUP_LABELS[group]}</h2>
              <span className="text-xs text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">
                {list.length}条
              </span>
              <div className="flex-1 h-px bg-slate-100" />
            </div>

            <div className="relative pl-5">
              <div className={`absolute left-[4px] top-0 bottom-0 w-0.5 rounded-full ${
                group === 'today' ? 'bg-orange-200' :
                group === 'tomorrow' ? 'bg-amber-200' : 'bg-emerald-200'
              }`} />
              <div className="space-y-3">
                {list.map((carpool) => (
                  <CarpoolCard key={carpool.id} carpool={carpool} />
                ))}
              </div>
            </div>
          </section>
        )
      })}
    </div>
  )
}
