import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Upload } from 'lucide-react'
import { useStore } from '@/store'
import { SAMPLE_TYPES } from '@/types'
import { cn } from '@/lib/utils'

const HAZARD_LEVELS = [
  { level: 1, color: 'bg-green-500', ring: 'ring-green-300', label: '1级 - 低风险' },
  { level: 2, color: 'bg-lime-500', ring: 'ring-lime-300', label: '2级 - 一般风险' },
  { level: 3, color: 'bg-yellow-500', ring: 'ring-yellow-300', label: '3级 - 中等风险' },
  { level: 4, color: 'bg-orange-500', ring: 'ring-orange-300', label: '4级 - 较高风险' },
  { level: 5, color: 'bg-red-500', ring: 'ring-red-300', label: '5级 - 高风险' },
]

export default function NewSample() {
  const navigate = useNavigate()
  const addSample = useStore((s) => s.addSample)

  const [code, setCode] = useState('')
  const [type, setType] = useState('')
  const [batch, setBatch] = useState('')
  const [tempMin, setTempMin] = useState(0)
  const [tempMax, setTempMax] = useState(0)
  const [currentTemp, setCurrentTemp] = useState(0)
  const [expiryDate, setExpiryDate] = useState('')
  const [hazardLevel, setHazardLevel] = useState(1)
  const [totalQuantity, setTotalQuantity] = useState(0)
  const [photo, setPhoto] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    addSample({
      code,
      type,
      batch,
      tempMin,
      tempMax,
      currentTemp,
      expiryDate,
      hazardLevel,
      photo,
      totalQuantity,
      remainingQuantity: totalQuantity,
    })
    navigate('/samples')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/samples" className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">新增样本</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">样本编号</label>
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="例如: BIO-2026-007"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">样本类型</label>
            <select
              required
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">请选择类型</option>
              {SAMPLE_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">批次号</label>
            <input
              type="text"
              required
              value={batch}
              onChange={(e) => setBatch(e.target.value)}
              placeholder="例如: B2026G"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">保存温度范围</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                required
                value={tempMin}
                onChange={(e) => setTempMin(Number(e.target.value))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <span className="text-sm text-gray-500">℃</span>
              <span className="text-gray-400">~</span>
              <input
                type="number"
                required
                value={tempMax}
                onChange={(e) => setTempMax(Number(e.target.value))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <span className="text-sm text-gray-500">℃</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">当前温度</label>
            <div className="flex items-center gap-2 w-1/2">
              <input
                type="number"
                required
                value={currentTemp}
                onChange={(e) => setCurrentTemp(Number(e.target.value))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <span className="text-sm text-gray-500">℃</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">有效期</label>
            <input
              type="date"
              required
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">危险等级</label>
            <div className="flex gap-2">
              {HAZARD_LEVELS.map(({ level, color, ring, label }) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setHazardLevel(level)}
                  className={cn(
                    'flex flex-col items-center gap-1.5 px-3 py-2 rounded-lg border-2 transition-all',
                    hazardLevel === level
                      ? `${ring} ring-2 border-transparent`
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <div className={cn('w-6 h-6 rounded-full', color)} />
                  <span className="text-xs text-gray-600">{label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">入库总量</label>
            <input
              type="number"
              required
              min={1}
              value={totalQuantity}
              onChange={(e) => setTotalQuantity(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">照片</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">点击或拖拽上传照片</p>
              <p className="text-xs text-gray-400 mt-1">支持 JPG、PNG 格式</p>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            提交
          </button>
        </form>
      </div>
    </div>
  )
}
