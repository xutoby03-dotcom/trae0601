import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, Camera, User, DollarSign, AlertTriangle, Droplets, FileText } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { cn } from '@/lib/utils'

export default function AddRecord() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const addCleaningRecord = useStore((s) => s.addCleaningRecord)

  const [cleanerName, setCleanerName] = useState('')
  const [cost, setCost] = useState('')
  const [cleanDate, setCleanDate] = useState(new Date().toISOString().slice(0, 10))
  const [beforePhoto, setBeforePhoto] = useState('')
  const [afterPhoto, setAfterPhoto] = useState('')
  const [hasOdor, setHasOdor] = useState(false)
  const [hasLeakage, setHasLeakage] = useState(false)
  const [notes, setNotes] = useState('')

  const handleFileChange = (setter: (v: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setter(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!id) return
    addCleaningRecord({
      acId: id,
      cleanerName,
      cost: Number(cost) || 0,
      beforePhoto,
      afterPhoto,
      hasOdor,
      hasLeakage,
      notes,
      cleanDate,
    })
    navigate(`/ac/${id}`)
  }

  return (
    <div className="max-w-2xl mx-auto p-4 pb-24">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(`/ac/${id}`)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>返回</span>
        </button>
        <h1 className="text-xl font-bold text-gray-900">添加清洗记录</h1>
        <div className="w-16" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
            <User className="w-4 h-4" />
            清洗人员
          </label>
          <input
            type="text"
            value={cleanerName}
            onChange={(e) => setCleanerName(e.target.value)}
            required
            placeholder="请输入清洗人员姓名"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
            <DollarSign className="w-4 h-4" />
            清洗费用（元）
          </label>
          <input
            type="number"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            required
            min="0"
            step="0.01"
            placeholder="请输入费用"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
            <FileText className="w-4 h-4" />
            清洗日期
          </label>
          <input
            type="date"
            value={cleanDate}
            onChange={(e) => setCleanDate(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Camera className="w-4 h-4" />
            清洗前照片
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange(setBeforePhoto)}
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
          />
          {beforePhoto && (
            <div className="mt-2">
              <img src={beforePhoto} alt="清洗前" className="w-32 h-32 object-cover rounded-lg border border-gray-200" />
            </div>
          )}
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Camera className="w-4 h-4" />
            清洗后照片
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange(setAfterPhoto)}
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
          />
          {afterPhoto && (
            <div className="mt-2">
              <img src={afterPhoto} alt="清洗后" className="w-32 h-32 object-cover rounded-lg border border-gray-200" />
            </div>
          )}
        </div>

        <div className="flex gap-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={hasOdor}
              onChange={(e) => setHasOdor(e.target.checked)}
              className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-400"
            />
            <div className="flex items-center gap-1 text-sm text-gray-700">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              有异味
            </div>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={hasLeakage}
              onChange={(e) => setHasLeakage(e.target.checked)}
              className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-400"
            />
            <div className="flex items-center gap-1 text-sm text-gray-700">
              <Droplets className="w-4 h-4 text-blue-500" />
              有漏水
            </div>
          </label>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
            <FileText className="w-4 h-4" />
            备注
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="请输入备注信息"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent resize-none"
          />
        </div>

        <button
          type="submit"
          className={cn(
            'w-full flex items-center justify-center gap-2 py-3 rounded-lg text-white font-medium',
            'bg-orange-500 hover:bg-orange-600 active:bg-orange-700 transition-colors'
          )}
        >
          <Save className="w-5 h-5" />
          保存记录
        </button>
      </form>
    </div>
  )
}
