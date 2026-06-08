import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, Plus, ChevronDown, ChevronRight, AlertTriangle, Box, Grid3X3, ShoppingBag, Database } from 'lucide-react'
import { useStore } from '@/store/useStore'
import type { Category, StorageType } from '@/types'
import { CATEGORIES, STORAGE_TYPES } from '@/types'
import { formatPrice } from '@/utils/helpers'
import { DEMO_MATERIALS, DEMO_PROJECTS, DEMO_PROJECT_MATERIALS, DEMO_USAGE_RECORDS } from '@/utils/demoData'

export default function Home() {
  const navigate = useNavigate()
  const materials = useStore((s) => s.materials)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<Category | ''>('')
  const [colorFilter, setColorFilter] = useState('')
  const [storageFilter, setStorageFilter] = useState<StorageType | ''>('')
  const [expandedSections, setExpandedSections] = useState<Record<StorageType, boolean>>({
    '盒子': true,
    '格子': true,
    '袋子': true,
  })

  const lowStockMaterials = useMemo(
    () => materials.filter((m) => m.quantity <= m.lowStockThreshold),
    [materials]
  )

  const filteredMaterials = useMemo(() => {
    return materials.filter((m) => {
      if (searchQuery && !m.name.toLowerCase().includes(searchQuery.toLowerCase()) && !m.colorName.includes(searchQuery)) return false
      if (categoryFilter && m.category !== categoryFilter) return false
      if (colorFilter && m.colorHex !== colorFilter) return false
      if (storageFilter && m.storageType !== storageFilter) return false
      return true
    })
  }, [materials, searchQuery, categoryFilter, colorFilter, storageFilter])

  const groupedByStorage = useMemo(() => {
    const groups: Record<StorageType, typeof filteredMaterials> = { '盒子': [], '格子': [], '袋子': [] }
    filteredMaterials.forEach((m) => groups[m.storageType].push(m))
    return groups
  }, [filteredMaterials])

  const storageIcons = {
    '盒子': Box,
    '格子': Grid3X3,
    '袋子': ShoppingBag,
  }

  const storageColors = {
    '盒子': 'bg-caramel',
    '格子': 'bg-mint',
    '袋子': 'bg-sand',
  }

  const loadDemoData = () => {
    const state = useStore.getState()
    if (state.materials.length > 0) return
    useStore.setState({
      materials: DEMO_MATERIALS,
      projects: DEMO_PROJECTS,
      projectMaterials: DEMO_PROJECT_MATERIALS,
      usageRecords: DEMO_USAGE_RECORDS,
    })
  }

  const toggleSection = (type: StorageType) => {
    setExpandedSections((prev) => ({ ...prev, [type]: !prev[type] }))
  }

  return (
    <div className="space-y-6">
      {lowStockMaterials.length > 0 && (
        <div className="bg-clay-light rounded-2xl p-4 border border-clay/30">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-clay" />
            <span className="font-serif font-semibold text-caramel-dark">低库存预警</span>
            <span className="badge-clay">{lowStockMaterials.length} 项</span>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {lowStockMaterials.map((m) => (
              <Link
                key={m.id}
                to={`/material/${m.id}`}
                className="flex-shrink-0 bg-white rounded-xl px-4 py-2 shadow-craft hover:shadow-craft-hover transition-all duration-200 flex items-center gap-2"
              >
                <span
                  className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                  style={{ backgroundColor: m.colorHex }}
                />
                <span className="text-sm font-medium text-bark">{m.name}</span>
                <span className="text-xs text-clay font-medium">
                  仅剩 {m.quantity}{m.unit}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="card p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sand" />
            <input
              type="text"
              placeholder="搜索材料名称或颜色..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as Category | '')}
            className="select-field w-auto min-w-[120px]"
          >
            <option value="">全部类别</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={colorFilter || '#000000'}
              onChange={(e) => setColorFilter(e.target.value)}
              className="w-8 h-8 rounded-lg cursor-pointer border-2 border-sand-light"
            />
            {colorFilter && (
              <button
                onClick={() => setColorFilter('')}
                className="text-xs text-caramel hover:underline"
              >
                清除
              </button>
            )}
          </div>
          <select
            value={storageFilter}
            onChange={(e) => setStorageFilter(e.target.value as StorageType | '')}
            className="select-field w-auto min-w-[120px]"
          >
            <option value="">全部位置</option>
            {STORAGE_TYPES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {filteredMaterials.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-parchment rounded-full flex items-center justify-center mx-auto mb-4">
            <Box className="w-10 h-10 text-sand" />
          </div>
          <p className="text-bark font-serif text-lg mb-2">材料抽屉还是空的</p>
          <p className="text-sand text-sm mb-6">点击下方按钮添加你的第一件材料吧</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => navigate('/material/new')} className="btn-primary">
              <Plus className="w-4 h-4 inline mr-1" />新增材料
            </button>
            <button onClick={loadDemoData} className="btn-secondary flex items-center gap-1">
              <Database className="w-4 h-4" />加载示例数据
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {STORAGE_TYPES.map((type) => {
            const items = groupedByStorage[type]
            if (storageFilter && storageFilter !== type) return null
            if (items.length === 0 && !storageFilter) return null
            const Icon = storageIcons[type]
            const isExpanded = expandedSections[type]
            return (
              <div key={type} className="card overflow-hidden">
                <button
                  onClick={() => toggleSection(type)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-parchment/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 ${storageColors[type]} rounded-lg flex items-center justify-center`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-serif font-semibold text-bark">{type}</span>
                    <span className="badge-caramel">{items.length}</span>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-sand" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-sand" />
                  )}
                </button>
                {isExpanded && items.length > 0 && (
                  <div className="px-4 pb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {items.map((m) => {
                      const isLow = m.quantity <= m.lowStockThreshold
                      return (
                        <Link
                          key={m.id}
                          to={`/material/${m.id}`}
                          className={`block bg-parchment rounded-xl p-3 transition-all duration-200 hover:shadow-craft-hover hover:-translate-y-0.5 border-2 ${isLow ? 'border-clay/40' : 'border-transparent'}`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className="w-8 h-8 rounded-lg flex-shrink-0 shadow-sm border border-white/50"
                              style={{ backgroundColor: m.colorHex }}
                            />
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-bark text-sm truncate">{m.name}</h3>
                              <p className="text-xs text-sand mt-0.5">
                                {m.category} · {m.specification || '无规格'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-sand-light/50">
                            <span className={`text-xs font-medium ${isLow ? 'text-clay' : 'text-caramel'}`}>
                              {m.quantity} {m.unit}
                              {isLow && ' ⚠️'}
                            </span>
                            <span className="text-xs text-sand">{formatPrice(m.price)}</span>
                          </div>
                          <div className="text-xs text-sand/70 mt-1 truncate">
                            {m.storageType === '盒子' && m.storageBox && `📦 ${m.storageBox}`}
                            {m.storageType === '格子' && m.storageCompartment && `🗂 ${m.storageCompartment}`}
                            {m.storageType === '袋子' && m.storageBag && `🛍 ${m.storageBag}`}
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                )}
                {isExpanded && items.length === 0 && (
                  <div className="px-4 pb-4 text-center text-sm text-sand py-4">
                    暂无材料
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <button
        onClick={() => navigate('/material/new')}
        className="fixed bottom-8 right-8 w-14 h-14 bg-caramel rounded-full shadow-craft-lg
        hover:shadow-craft-hover hover:-translate-y-1 transition-all duration-200
        flex items-center justify-center z-20"
      >
        <Plus className="w-6 h-6 text-white" />
      </button>
    </div>
  )
}
