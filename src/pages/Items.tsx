import { useState } from 'react'
import { useStore } from '@/store'
import { formatDateTime } from '@/utils/helpers'
import type { ItemType, ItemDirection } from '@/types'

const itemTypeLabels: Record<ItemType, string> = {
  parcel: '快递',
  equipment: '设备',
  other: '其他',
}

const directionLabels: Record<ItemDirection, string> = {
  in: '携入',
  out: '携出',
}

const itemTypeBadgeClass: Record<ItemType, string> = {
  parcel: 'bg-blue-100 text-blue-700',
  equipment: 'bg-purple-100 text-purple-700',
  other: 'bg-gray-100 text-gray-700',
}

const directionBadgeClass: Record<ItemDirection, string> = {
  in: 'bg-green-100 text-green-700',
  out: 'bg-orange-100 text-orange-700',
}

type FilterTab = 'all' | 'in' | 'out'

export default function Items() {
  const { itemRecords, visitors, addItemRecord } = useStore()

  const [visitorId, setVisitorId] = useState('')
  const [itemType, setItemType] = useState<ItemType>('parcel')
  const [description, setDescription] = useState('')
  const [direction, setDirection] = useState<ItemDirection>('in')
  const [operator, setOperator] = useState('前台')
  const [filter, setFilter] = useState<FilterTab>('all')

  const eligibleVisitors = visitors.filter(
    (v) =>
      (v.status === 'checked-in' || v.status === 'expected')
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!visitorId || !description.trim()) return

    const visitor = visitors.find((v) => v.id === visitorId)
    if (!visitor) return

    addItemRecord({
      visitorId,
      appointmentId: visitor.appointmentId,
      itemType,
      description: description.trim(),
      direction,
      operator: operator.trim() || '前台',
    })

    setDescription('')
    setVisitorId('')
    setItemType('parcel')
    setDirection('in')
    setOperator('前台')
  }

  const filteredRecords = itemRecords
    .filter((r) => filter === 'all' || r.direction === filter)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  const getVisitorName = (id: string) => {
    const v = visitors.find((v) => v.id === id)
    return v?.name ?? '未知'
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">物品登记</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-sm">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">关联访客</label>
            <select
              value={visitorId}
              onChange={(e) => setVisitorId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            >
              <option value="">请选择访客</option>
              {eligibleVisitors.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}（{v.company}）
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">物品类型</label>
            <select
              value={itemType}
              onChange={(e) => setItemType(e.target.value as ItemType)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="parcel">快递</option>
              <option value="equipment">设备</option>
              <option value="other">其他</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">物品描述</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="请描述物品名称和数量"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">出入方向</label>
            <select
              value={direction}
              onChange={(e) => setDirection(e.target.value as ItemDirection)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="in">携入</option>
              <option value="out">携出</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">经办人</label>
            <input
              type="text"
              value={operator}
              onChange={(e) => setOperator(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full bg-teal-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-teal-700 transition-colors"
            >
              登记
            </button>
          </div>
        </div>
      </form>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">物品记录</h2>
          <div className="flex gap-1">
            {([
              { key: 'all' as FilterTab, label: '全部' },
              { key: 'in' as FilterTab, label: '携入' },
              { key: 'out' as FilterTab, label: '携出' },
            ]).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  filter === tab.key
                    ? 'bg-teal-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-500">
                <th className="text-left px-4 py-3 font-medium">时间</th>
                <th className="text-left px-4 py-3 font-medium">访客姓名</th>
                <th className="text-left px-4 py-3 font-medium">物品类型</th>
                <th className="text-left px-4 py-3 font-medium">描述</th>
                <th className="text-left px-4 py-3 font-medium">方向</th>
                <th className="text-left px-4 py-3 font-medium">经办人</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-400">
                    暂无记录
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-600">
                      {formatDateTime(record.timestamp)}
                    </td>
                    <td className="px-4 py-3 text-gray-900">
                      {getVisitorName(record.visitorId)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${itemTypeBadgeClass[record.itemType]}`}
                      >
                        {itemTypeLabels[record.itemType]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{record.description}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${directionBadgeClass[record.direction]}`}
                      >
                        {directionLabels[record.direction]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{record.operator}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
