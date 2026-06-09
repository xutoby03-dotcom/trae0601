import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Save, Building2, Wrench, Phone, Calendar } from 'lucide-react'
import { useStore, FILTER_TYPE_LABELS } from '@/store/useStore'
import { cn } from '@/lib/utils'

type FilterType = 'normal' | 'hepa' | 'carbon'

export default function AddAC() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const editId = searchParams.get('edit')
  const acUnits = useStore((s) => s.acUnits)
  const addAC = useStore((s) => s.addAC)
  const updateAC = useStore((s) => s.updateAC)

  const [room, setRoom] = useState('')
  const [brand, setBrand] = useState('')
  const [lastCleanDate, setLastCleanDate] = useState('')
  const [filterType, setFilterType] = useState<FilterType>('normal')
  const [highAltitudeWork, setHighAltitudeWork] = useState(false)
  const [warrantyPhone, setWarrantyPhone] = useState('')

  useEffect(() => {
    if (editId) {
      const ac = acUnits.find((a) => a.id === editId)
      if (ac) {
        setRoom(ac.room)
        setBrand(ac.brand)
        setLastCleanDate(ac.lastCleanDate)
        setFilterType(ac.filterType)
        setHighAltitudeWork(ac.highAltitudeWork)
        setWarrantyPhone(ac.warrantyPhone)
      }
    }
  }, [editId, acUnits])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const data = { room, brand, lastCleanDate, filterType, highAltitudeWork, warrantyPhone }
    if (editId) {
      updateAC(editId, data)
    } else {
      addAC(data)
    }
    navigate(-1)
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto flex items-center h-14 px-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="ml-2 text-lg font-semibold text-gray-900">
            {editId ? '编辑空调信息' : '添加空调'}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto px-4 mt-4 space-y-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="w-4 h-4 text-sky-500" />
            <span className="text-sm font-medium text-gray-700">基本信息</span>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">房间名</label>
              <input
                type="text"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                required
                placeholder="如：主卧、客厅"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">品牌型号</label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                required
                placeholder="如：格力 KFR-35GW"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-4 h-4 text-sky-500" />
            <span className="text-sm font-medium text-gray-700">清洗与滤网</span>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">上次清洗日期</label>
              <input
                type="date"
                value={lastCleanDate}
                onChange={(e) => setLastCleanDate(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">滤网类型</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as FilterType)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none"
              >
                {(Object.entries(FILTER_TYPE_LABELS) as [FilterType, string][]).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <Wrench className="w-4 h-4 text-sky-500" />
            <span className="text-sm font-medium text-gray-700">作业信息</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">是否需要高空作业</span>
            <button
              type="button"
              onClick={() => setHighAltitudeWork(!highAltitudeWork)}
              className={cn(
                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                highAltitudeWork ? 'bg-sky-500' : 'bg-gray-300'
              )}
            >
              <span
                className={cn(
                  'inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform',
                  highAltitudeWork ? 'translate-x-6' : 'translate-x-1'
                )}
              />
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <Phone className="w-4 h-4 text-sky-500" />
            <span className="text-sm font-medium text-gray-700">保修信息</span>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">保修电话</label>
            <input
              type="tel"
              value={warrantyPhone}
              onChange={(e) => setWarrantyPhone(e.target.value)}
              placeholder="如：400-xxx-xxxx"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none"
            />
          </div>
        </div>
      </form>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={handleSubmit}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-sky-500 py-3 text-sm font-medium text-white active:bg-sky-600 transition-colors"
          >
            <Save className="w-4 h-4" />
            {editId ? '保存修改' : '添加空调'}
          </button>
        </div>
      </div>
    </div>
  )
}
