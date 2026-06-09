import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Plus, BedDouble, DoorOpen, User, Clock, Pencil, Trash2, AlertTriangle } from 'lucide-react'
import { useStore } from '@/store'
import { cn } from '@/lib/utils'
import type { Property } from '@/types'
import PropertyForm from '@/components/PropertyForm'

const STATUS_CONFIG: Record<Property['status'], { label: string; className: string }> = {
  checkout_today: {
    label: '今日退房',
    className: 'bg-amber-100 text-amber-700 border-amber-200',
  },
  cleaning: {
    label: '清洁中',
    className: 'bg-orange-100 text-orange-700 border-orange-200',
  },
  reviewing: {
    label: '审核中',
    className: 'bg-blue-100 text-blue-700 border-blue-200',
  },
  ready: {
    label: '已就绪',
    className: 'bg-sage-100 text-sage-700 border-sage-200',
  },
  vacant: {
    label: '空闲',
    className: 'bg-gray-100 text-gray-500 border-gray-200',
  },
}

export default function Properties() {
  const navigate = useNavigate()
  const properties = useStore((s) => s.properties)
  const staff = useStore((s) => s.staff)
  const deleteProperty = useStore((s) => s.deleteProperty)

  const [search, setSearch] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingProperty, setEditingProperty] = useState<Property | null>(null)

  const filtered = properties.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.address.toLowerCase().includes(search.toLowerCase())
  )

  const getCleanerName = (cleanerId: string) => {
    const s = staff.find((s) => s.id === cleanerId)
    return s?.name ?? '未分配'
  }

  const handleEdit = (property: Property) => {
    setEditingProperty(property)
    setDrawerOpen(true)
  }

  const handleAdd = () => {
    setEditingProperty(null)
    setDrawerOpen(true)
  }

  const handleClose = () => {
    setDrawerOpen(false)
    setEditingProperty(null)
  }

  const handleDelete = (id: string) => {
    deleteProperty(id)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif font-bold text-2xl text-warm-800">房源管理</h1>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-warm-500 text-white text-sm font-medium hover:bg-warm-600 shadow-md shadow-warm-500/25 transition-all"
        >
          <Plus className="w-4 h-4" />
          添加房源
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-300" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜索房源名称或地址..."
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-warm-200 bg-white text-warm-800 text-sm placeholder:text-warm-300 focus:outline-none focus:ring-2 focus:ring-warm-400 focus:border-transparent transition-all shadow-sm"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-warm-300">
          <DoorOpen className="w-12 h-12 mb-3" />
          <p className="text-sm">暂无房源数据</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((property) => {
            const statusCfg = STATUS_CONFIG[property.status]
            return (
              <div
                key={property.id}
                onClick={() => navigate(`/properties/${property.id}`)}
                className="bg-white rounded-xl border border-warm-200/80 shadow-sm hover:shadow-md hover:border-warm-300 transition-all duration-200 cursor-pointer group"
              >
                <div className="p-5 space-y-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-serif font-bold text-warm-800 text-base truncate">
                        {property.name}
                      </h3>
                      <p className="text-xs text-warm-400 mt-0.5 truncate">{property.address}</p>
                    </div>
                    <span
                      className={cn(
                        'shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium border',
                        statusCfg.className
                      )}
                    >
                      {statusCfg.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs text-warm-500">
                    <div className="flex items-center gap-1.5">
                      <DoorOpen className="w-3.5 h-3.5 text-warm-300" />
                      <span>{property.rooms} 间</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <BedDouble className="w-3.5 h-3.5 text-warm-300" />
                      <span>{property.beds} 床</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-warm-300" />
                      <span>{getCleanerName(property.cleanerId)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-warm-300" />
                      <span>{property.checkInTime}</span>
                    </div>
                  </div>

                  {property.complaintCount > 0 && (
                    <div className="flex items-center gap-1.5 text-xs text-coral-500">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>{property.complaintCount} 条投诉</span>
                    </div>
                  )}
                </div>

                <div className="flex border-t border-warm-100 divide-x divide-warm-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleEdit(property)
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs text-warm-500 hover:bg-warm-50 hover:text-warm-700 transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    编辑
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(property.id)
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs text-coral-400 hover:bg-coral-50 hover:text-coral-600 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    删除
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <PropertyForm
        open={drawerOpen}
        property={editingProperty}
        onClose={handleClose}
      />
    </div>
  )
}
