import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { useStore } from '@/store'
import { SUPPLY_OPTIONS } from '@/types'
import type { Property } from '@/types'

interface PropertyFormProps {
  open: boolean
  property?: Property | null
  onClose: () => void
}

const STATUS_OPTIONS: { value: Property['status']; label: string }[] = [
  { value: 'vacant', label: '空闲' },
  { value: 'checkout_today', label: '今日退房' },
  { value: 'cleaning', label: '清洁中' },
  { value: 'reviewing', label: '审核中' },
  { value: 'ready', label: '已就绪' },
]

export default function PropertyForm({ open, property, onClose }: PropertyFormProps) {
  const addProperty = useStore((s) => s.addProperty)
  const updateProperty = useStore((s) => s.updateProperty)
  const getCleaners = useStore((s) => s.getCleaners)
  const cleaners = getCleaners()

  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [rooms, setRooms] = useState(1)
  const [beds, setBeds] = useState(1)
  const [supplyStandards, setSupplyStandards] = useState<string[]>([])
  const [cleanerId, setCleanerId] = useState('')
  const [checkInTime, setCheckInTime] = useState('14:00')
  const [status, setStatus] = useState<Property['status']>('vacant')

  useEffect(() => {
    if (property) {
      setName(property.name)
      setAddress(property.address)
      setRooms(property.rooms)
      setBeds(property.beds)
      setSupplyStandards(property.supplyStandards)
      setCleanerId(property.cleanerId)
      setCheckInTime(property.checkInTime)
      setStatus(property.status)
    } else {
      setName('')
      setAddress('')
      setRooms(1)
      setBeds(1)
      setSupplyStandards([])
      setCleanerId('')
      setCheckInTime('14:00')
      setStatus('vacant')
    }
  }, [property, open])

  const toggleSupply = (item: string) => {
    setSupplyStandards((prev) =>
      prev.includes(item) ? prev.filter((s) => s !== item) : [...prev, item]
    )
  }

  const handleSave = () => {
    if (!name.trim() || !address.trim() || !cleanerId) return

    if (property) {
      updateProperty(property.id, {
        name,
        address,
        rooms,
        beds,
        supplyStandards,
        cleanerId,
        checkInTime,
        status,
      })
    } else {
      addProperty({
        name,
        address,
        rooms,
        beds,
        supplyStandards,
        cleanerId,
        checkInTime,
        status,
      })
    }
    onClose()
  }

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/30 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed top-0 right-0 h-full w-[440px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-warm-200">
          <h2 className="font-serif font-bold text-lg text-warm-800">
            {property ? '编辑房源' : '添加房源'}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-warm-400 hover:bg-warm-100 hover:text-warm-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto h-[calc(100%-140px)] px-6 py-5 space-y-5">
          <div>
            <label className="block text-sm font-medium text-warm-700 mb-1.5">房源名称</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="请输入房源名称"
              className="w-full px-3.5 py-2.5 rounded-lg border border-warm-200 bg-warm-50/50 text-warm-800 text-sm placeholder:text-warm-300 focus:outline-none focus:ring-2 focus:ring-warm-400 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-warm-700 mb-1.5">地址</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="请输入房源地址"
              className="w-full px-3.5 py-2.5 rounded-lg border border-warm-200 bg-warm-50/50 text-warm-800 text-sm placeholder:text-warm-300 focus:outline-none focus:ring-2 focus:ring-warm-400 focus:border-transparent transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-warm-700 mb-1.5">房间数</label>
              <input
                type="number"
                min={1}
                value={rooms}
                onChange={(e) => setRooms(Math.max(1, Number(e.target.value)))}
                className="w-full px-3.5 py-2.5 rounded-lg border border-warm-200 bg-warm-50/50 text-warm-800 text-sm focus:outline-none focus:ring-2 focus:ring-warm-400 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-warm-700 mb-1.5">床位数</label>
              <input
                type="number"
                min={1}
                value={beds}
                onChange={(e) => setBeds(Math.max(1, Number(e.target.value)))}
                className="w-full px-3.5 py-2.5 rounded-lg border border-warm-200 bg-warm-50/50 text-warm-800 text-sm focus:outline-none focus:ring-2 focus:ring-warm-400 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-warm-700 mb-1.5">物资标准</label>
            <div className="flex flex-wrap gap-2">
              {SUPPLY_OPTIONS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => toggleSupply(item)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                    supplyStandards.includes(item)
                      ? 'bg-warm-500 text-white shadow-sm'
                      : 'bg-warm-100 text-warm-500 hover:bg-warm-200'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-warm-700 mb-1.5">保洁员</label>
            <select
              value={cleanerId}
              onChange={(e) => setCleanerId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-warm-200 bg-warm-50/50 text-warm-800 text-sm focus:outline-none focus:ring-2 focus:ring-warm-400 focus:border-transparent transition-all"
            >
              <option value="">请选择保洁员</option>
              {cleaners.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-warm-700 mb-1.5">入住时间</label>
            <input
              type="time"
              value={checkInTime}
              onChange={(e) => setCheckInTime(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-warm-200 bg-warm-50/50 text-warm-800 text-sm focus:outline-none focus:ring-2 focus:ring-warm-400 focus:border-transparent transition-all"
            />
          </div>

          {property && (
            <div>
              <label className="block text-sm font-medium text-warm-700 mb-1.5">状态</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Property['status'])}
                className="w-full px-3.5 py-2.5 rounded-lg border border-warm-200 bg-warm-50/50 text-warm-800 text-sm focus:outline-none focus:ring-2 focus:ring-warm-400 focus:border-transparent transition-all"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 px-6 py-4 border-t border-warm-200 bg-white flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-lg border border-warm-200 text-warm-600 text-sm font-medium hover:bg-warm-50 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2.5 rounded-lg bg-warm-500 text-white text-sm font-medium hover:bg-warm-600 shadow-md shadow-warm-500/25 transition-all"
          >
            保存
          </button>
        </div>
      </div>
    </>
  )
}
