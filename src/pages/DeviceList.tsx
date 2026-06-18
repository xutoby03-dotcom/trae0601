import { useStore } from '@/store/useStore'
import { Link } from 'react-router-dom'
import { Plus, Search, Armchair } from 'lucide-react'
import { useState } from 'react'
import StatusBadge from '@/components/StatusBadge'
import { ARMREST_TYPE_MAP, FOOT_PAD_STATUS_MAP } from '@/utils/helpers'
import type { DeviceStatus } from '@/types'

const STATUS_FILTERS: { value: DeviceStatus | 'all'; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'available', label: '可用' },
  { value: 'in_use', label: '使用中' },
  { value: 'pending_clean', label: '待清洁' },
  { value: 'pending_maintenance', label: '待维修' },
  { value: 'disabled', label: '已停用' },
]

export default function DeviceList() {
  const { devices } = useStore()
  const [filter, setFilter] = useState<DeviceStatus | 'all'>('all')
  const [search, setSearch] = useState('')

  const filtered = devices.filter((d) => {
    if (filter !== 'all' && d.status !== filter) return false
    if (search && !d.code.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-zinc-800 font-display">设备档案</h2>
          <p className="text-sm text-zinc-400 mt-1">管理所有助浴椅设备信息</p>
        </div>
        <Link
          to="/devices/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          新增设备
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="搜索设备编号..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 bg-white"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s.value}
              onClick={() => setFilter(s.value)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                filter === s.value
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'bg-white text-zinc-500 border border-zinc-200 hover:bg-zinc-50'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <Armchair className="w-12 h-12 text-zinc-200 mx-auto mb-3" />
          <p className="text-sm text-zinc-400">暂无匹配设备</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((device) => (
            <Link
              key={device.id}
              to={`/devices/${device.id}`}
              className="bg-white rounded-xl border border-zinc-100 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group"
            >
              <div className="h-40 bg-zinc-100 relative overflow-hidden">
                {device.photo ? (
                  <img
                    src={device.photo}
                    alt={device.code}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Armchair className="w-10 h-10 text-zinc-300" />
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  <StatusBadge status={device.status} />
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-base font-bold text-zinc-800 group-hover:text-teal-700 transition-colors">{device.code}</h3>
                <div className="mt-2 space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">承重</span>
                    <span className="text-zinc-700 font-medium">{device.weightCapacity}kg</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">扶手</span>
                    <span className="text-zinc-700 font-medium">{ARMREST_TYPE_MAP[device.armrestType]}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">脚垫</span>
                    <span className={`font-medium ${FOOT_PAD_STATUS_MAP[device.footPadStatus].color}`}>
                      {FOOT_PAD_STATUS_MAP[device.footPadStatus].label}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
