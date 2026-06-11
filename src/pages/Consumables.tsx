import { useState } from 'react'
import { useStore } from '@/store'
import type { Consumable } from '@/types'
import {
  Search,
  Plus,
  Package,
  Flame,
  TrendingDown,
  Filter,
  X,
  Upload,
  ArrowUpDown,
  Edit2,
  Trash2,
  RefreshCw,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type FilterTab = 'all' | 'low' | 'hazardous'

function ConsumableForm({
  consumable,
  onClose,
}: {
  consumable?: Consumable
  onClose: () => void
}) {
  const { addConsumable, updateConsumable } = useStore()
  const [form, setForm] = useState({
    name: consumable?.name ?? '',
    specification: consumable?.specification ?? '',
    unit: consumable?.unit ?? '盒',
    stock: consumable?.stock ?? 0,
    minAlert: consumable?.minAlert ?? 5,
    cabinet: consumable?.cabinet ?? '',
    isHazardous: consumable?.isHazardous ?? false,
    imageUrl: consumable?.imageUrl ?? '',
  })
  const [confirmHazardous, setConfirmHazardous] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (form.isHazardous && !confirmHazardous) return
    if (consumable) {
      updateConsumable(consumable.id, form)
    } else {
      addConsumable(form)
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-[480px] bg-white h-full shadow-2xl animate-slide-in overflow-y-auto">
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between z-10">
          <h2 className="font-serif text-lg font-bold text-lab-900">
            {consumable ? '编辑耗材' : '新增耗材'}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="label-field">耗材名称 *</label>
            <input
              className="input-field"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="如：丁腈手套"
              required
            />
          </div>
          <div>
            <label className="label-field">规格型号 *</label>
            <input
              className="input-field"
              value={form.specification}
              onChange={(e) => setForm({ ...form, specification: e.target.value })}
              placeholder="如：M码 / 无粉 / 100只装"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-field">单位 *</label>
              <input
                className="input-field"
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                placeholder="盒/瓶/包"
                required
              />
            </div>
            <div>
              <label className="label-field">存放柜位置 *</label>
              <input
                className="input-field"
                value={form.cabinet}
                onChange={(e) => setForm({ ...form, cabinet: e.target.value })}
                placeholder="如：A-01"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-field">当前库存 *</label>
              <input
                type="number"
                className="input-field"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
                min={0}
                required
              />
            </div>
            <div>
              <label className="label-field">最低警戒线 *</label>
              <input
                type="number"
                className="input-field"
                value={form.minAlert}
                onChange={(e) => setForm({ ...form, minAlert: Number(e.target.value) })}
                min={0}
                required
              />
            </div>
          </div>
          <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">是否危化品</p>
                <p className="text-xs text-gray-500">危化品领用需二次审批</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (form.isHazardous) {
                    setForm({ ...form, isHazardous: false })
                    setConfirmHazardous(false)
                  } else {
                    setForm({ ...form, isHazardous: true })
                  }
                }}
                className={cn(
                  'w-12 h-6 rounded-full transition-all duration-200 relative',
                  form.isHazardous ? 'bg-danger-500' : 'bg-gray-300'
                )}
              >
                <span
                  className={cn(
                    'absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200',
                    form.isHazardous ? 'translate-x-6' : 'translate-x-0.5'
                  )}
                />
              </button>
            </div>
            {form.isHazardous && (
              <div className="mt-3 flex items-start gap-2">
                <input
                  type="checkbox"
                  checked={confirmHazardous}
                  onChange={(e) => setConfirmHazardous(e.target.checked)}
                  className="mt-0.5 rounded border-gray-300 text-danger-500 focus:ring-danger-500"
                  required
                />
                <label className="text-xs text-danger-500">
                  我确认此耗材属于危险化学品，领用时需执行二次审批流程
                </label>
              </div>
            )}
          </div>
          <div>
            <label className="label-field">耗材图片</label>
            <div className="mt-1">
              {form.imageUrl ? (
                <div className="relative w-full h-40 rounded-lg overflow-hidden border border-gray-200 group">
                  <img
                    src={form.imageUrl}
                    alt="耗材预览"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <label className="cursor-pointer px-3 py-1.5 bg-white text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-100">
                      更换图片
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (!file) return
                          const reader = new FileReader()
                          reader.onload = () => {
                            setForm({ ...form, imageUrl: reader.result as string })
                          }
                          reader.readAsDataURL(file)
                        }}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, imageUrl: '' })}
                      className="px-3 py-1.5 bg-danger-500 text-white rounded-lg text-xs font-medium hover:bg-danger-600"
                    >
                      移除
                    </button>
                  </div>
                </div>
              ) : (
                <label className="block border-2 border-dashed border-gray-200 rounded-lg p-6 text-center hover:border-lab-400 hover:bg-lab-50/30 transition-all cursor-pointer">
                  <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-xs text-gray-400">点击或拖拽上传图片</p>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      const reader = new FileReader()
                      reader.onload = () => {
                        setForm({ ...form, imageUrl: reader.result as string })
                      }
                      reader.readAsDataURL(file)
                    }}
                  />
                </label>
              )}
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="btn-outline flex-1">
              取消
            </button>
            <button
              type="submit"
              className="btn-primary flex-1"
              disabled={form.isHazardous && !confirmHazardous}
            >
              {consumable ? '保存修改' : '添加耗材'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function RestockModal({
  consumable,
  onClose,
}: {
  consumable: Consumable
  onClose: () => void
}) {
  const { restockConsumable } = useStore()
  const [quantity, setQuantity] = useState(1)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    restockConsumable(consumable.id, quantity, '李老师')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white rounded-2xl p-6 w-[400px] shadow-2xl animate-fade-in">
        <h2 className="font-serif text-lg font-bold text-lab-900 mb-1">补货操作</h2>
        <p className="text-sm text-gray-500 mb-4">
          {consumable.name}（当前库存：{consumable.stock} {consumable.unit}）
        </p>
        <form onSubmit={handleSubmit}>
          <label className="label-field">补货数量</label>
          <input
            type="number"
            className="input-field mb-4"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
            min={1}
            required
          />
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="btn-outline flex-1">
              取消
            </button>
            <button type="submit" className="btn-primary flex-1">
              确认补货
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Consumables() {
  const { consumables, deleteConsumable, currentRole } = useStore()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterTab>('all')
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState<Consumable | undefined>()
  const [restockItem, setRestockItem] = useState<Consumable | null>(null)
  const [sortField, setSortField] = useState<'stock' | 'name'>('stock')
  const [sortAsc, setSortAsc] = useState(true)

  const filtered = consumables
    .filter((c) => {
      if (search && !c.name.includes(search) && !c.specification.includes(search) && !c.cabinet.includes(search))
        return false
      if (filter === 'low') return c.stock < c.minAlert
      if (filter === 'hazardous') return c.isHazardous
      return true
    })
    .sort((a, b) => {
      const cmp = sortField === 'stock' ? a.stock - b.stock : a.name.localeCompare(b.name)
      return sortAsc ? cmp : -cmp
    })

  const toggleSort = (field: 'stock' | 'name') => {
    if (sortField === field) setSortAsc(!sortAsc)
    else { setSortField(field); setSortAsc(true) }
  }

  const lowCount = consumables.filter((c) => c.stock < c.minAlert).length
  const hazardousCount = consumables.filter((c) => c.isHazardous).length

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-lab-900">耗材管理</h1>
          <p className="text-sm text-gray-500 mt-1">管理实验室耗材库存、规格和补货</p>
        </div>
        {currentRole === 'admin' && (
          <button
            onClick={() => { setEditingItem(undefined); setShowForm(true) }}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            新增耗材
          </button>
        )}
      </div>

      <div className="card p-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              className="input-field pl-9"
              placeholder="搜索耗材名称、规格或存放柜..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-1">
            {(
              [
                { key: 'all', label: '全部', icon: Filter, count: consumables.length },
                { key: 'low', label: '低库存', icon: TrendingDown, count: lowCount },
                { key: 'hazardous', label: '危化品', icon: Flame, count: hazardousCount },
              ] as const
            ).map(({ key, label, icon: Icon, count }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                  filter === key
                    ? 'bg-lab-900 text-white'
                    : 'text-gray-500 hover:text-gray-700'
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
                <span className={cn('px-1.5 py-0.5 rounded-full text-[10px] font-bold',
                  filter === key ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-500'
                )}>
                  {count}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  耗材信息
                </th>
                <th
                  className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-lab-700"
                  onClick={() => toggleSort('name')}
                >
                  <span className="flex items-center gap-1">
                    名称 <ArrowUpDown className="w-3 h-3" />
                  </span>
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  存放柜
                </th>
                <th
                  className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-lab-700"
                  onClick={() => toggleSort('stock')}
                >
                  <span className="flex items-center justify-end gap-1">
                    库存 <ArrowUpDown className="w-3 h-3" />
                  </span>
                </th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  状态
                </th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr
                  key={c.id}
                  className={cn(
                    'border-b border-gray-50 hover:bg-gray-50/50 transition-colors',
                    c.isHazardous && 'border-l-4 border-l-danger-500'
                  )}
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      {c.imageUrl ? (
                        <img
                          src={c.imageUrl}
                          alt={c.name}
                          className="w-9 h-9 rounded-lg object-cover border border-gray-100"
                        />
                      ) : (
                        <div className={cn(
                          'w-9 h-9 rounded-lg flex items-center justify-center',
                          c.isHazardous ? 'bg-red-50' : 'bg-lab-50'
                        )}>
                          {c.isHazardous ? (
                            <Flame className="w-4 h-4 text-danger-500" />
                          ) : (
                            <Package className="w-4 h-4 text-lab-600" />
                          )}
                        </div>
                      )}
                      <div>
                        <p className="text-xs text-gray-500">{c.specification}</p>
                        <p className="text-xs text-gray-400">{c.unit}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{c.name}</span>
                      {c.isHazardous && <span className="badge-danger">危化</span>}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{c.cabinet}</td>
                  <td className="py-3 px-4 text-right">
                    <span className={cn(
                      'font-bold',
                      c.stock < c.minAlert ? 'text-danger-500' : 'text-gray-900'
                    )}>
                      {c.stock}
                    </span>
                    <span className="text-gray-400 text-xs ml-1">{c.unit}</span>
                    {c.stock < c.minAlert && (
                      <p className="text-[10px] text-warn-600 mt-0.5">
                        警戒线 {c.minAlert}
                      </p>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {c.stock < c.minAlert ? (
                      <span className="badge-warn">低库存</span>
                    ) : (
                      <span className="badge-safe">正常</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-1">
                      {c.stock < c.minAlert && currentRole === 'admin' && (
                        <button
                          onClick={() => setRestockItem(c)}
                          className="p-1.5 rounded-lg hover:bg-amber-50 text-warn-600 transition-colors"
                          title="补货"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      )}
                      {currentRole === 'admin' && (
                        <>
                          <button
                            onClick={() => { setEditingItem(c); setShowForm(true) }}
                            className="p-1.5 rounded-lg hover:bg-lab-50 text-lab-600 transition-colors"
                            title="编辑"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteConsumable(c.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-danger-500 transition-colors"
                            title="删除"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-12 text-center text-gray-400 text-sm">
              未找到匹配的耗材
            </div>
          )}
        </div>
      </div>

      {showForm && (
        <ConsumableForm
          consumable={editingItem}
          onClose={() => { setShowForm(false); setEditingItem(undefined) }}
        />
      )}
      {restockItem && (
        <RestockModal consumable={restockItem} onClose={() => setRestockItem(null)} />
      )}
    </div>
  )
}
