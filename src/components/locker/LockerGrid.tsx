import { useMemo, useState } from 'react'
import { Search, Filter, Plus, Image, X } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import LockerCard from './LockerCard'
import type { LockerSize, LockerStatus } from '@/types'
import { LOCKER_SIZE_OPTIONS } from '@/utils/constants'
import type { Locker } from '@/types'

interface LockerGridProps {
  onAdd?: () => void
  onEdit?: (locker: Locker) => void
  onDelete?: (locker: Locker) => void
  onSelect?: (locker: Locker) => void
  selectable?: boolean
  selectedId?: string
  showToolbar?: boolean
}

type FilterStatus = 'all' | LockerStatus

export default function LockerGrid({ onAdd, onEdit, onDelete, onSelect, selectable, selectedId, showToolbar = true }: LockerGridProps) {
  const { lockers, getPackageById } = useAppStore()
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [filterSize, setFilterSize] = useState<LockerSize | 'all'>('all')
  const [onlyRefrigerated, setOnlyRefrigerated] = useState(false)

  const filteredLockers = useMemo(() => {
    return lockers.filter((l) => {
      if (search && !l.code.toLowerCase().includes(search.toLowerCase()) && !l.location.toLowerCase().includes(search.toLowerCase())) {
        return false
      }
      if (filterStatus !== 'all' && l.status !== filterStatus) return false
      if (filterSize !== 'all' && l.size !== filterSize) return false
      if (onlyRefrigerated && !l.isRefrigerated) return false
      return true
    })
  }, [lockers, search, filterStatus, filterSize, onlyRefrigerated])

  const counts = useMemo(() => ({
    all: lockers.length,
    empty: lockers.filter(l => l.status === 'empty').length,
    occupied: lockers.filter(l => l.status === 'occupied').length,
    urgent: lockers.filter(l => l.status === 'urgent').length,
  }), [lockers])

  return (
    <div>
      {showToolbar && (
        <div className="bg-white rounded-2xl card-shadow p-4 mb-5">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[200px] relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="搜索柜格编号或位置..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-100">
              {(['all', 'empty', 'occupied', 'urgent'] as FilterStatus[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    filterStatus === s
                      ? 'bg-white text-slate-800 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {s === 'all' ? '全部' : s === 'empty' ? `空闲 ${counts.empty}` : s === 'occupied' ? `占用 ${counts.occupied}` : `催取 ${counts.urgent}`}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Filter size={14} className="text-slate-400" />
              <select
                value={filterSize}
                onChange={(e) => setFilterSize(e.target.value as LockerSize | 'all')}
                className="px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 bg-white"
              >
                <option value="all">所有大小</option>
                {LOCKER_SIZE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label} · {opt.volume}</option>
                ))}
              </select>
            </div>

            {onAdd && (
              <button
                onClick={onAdd}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-colors shadow-sm hover:shadow"
              >
                <Plus size={16} />
                新增柜格
              </button>
            )}
          </div>
        </div>
      )}

      {filteredLockers.length === 0 ? (
        <div className="bg-white rounded-2xl card-shadow p-16 text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-slate-100 flex items-center justify-center mb-4">
            <Image size={32} className="text-slate-300" />
          </div>
          <h4 className="font-bold text-slate-700 mb-1">未找到柜格</h4>
          <p className="text-sm text-slate-500">请尝试调整筛选条件或新增柜格</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 group">
          {filteredLockers.map((locker) => (
            <LockerCard
              key={locker.id}
              locker={locker}
              currentPackage={locker.currentPackageId ? getPackageById(locker.currentPackageId) || undefined : undefined}
              onClick={selectable ? () => onSelect?.(locker) : undefined}
              onEdit={onEdit ? () => onEdit(locker) : undefined}
              onDelete={onDelete ? () => onDelete(locker) : undefined}
              selectable={selectable}
              selected={selectedId === locker.id}
            />
          ))}
        </div>
      )}
    </div>
  )
}
