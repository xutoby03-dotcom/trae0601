import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, Camera, Plus, X } from 'lucide-react'
import { api } from '@/utils/api'
import { PROBLEM_TYPES } from '@/types'
import type { Point } from '@/types'

export default function NewInspection() {
  const navigate = useNavigate()
  const [points, setPoints] = useState<Point[]>([])
  const [formData, setFormData] = useState({
    point_id: '',
    inspector: '张督导',
    inspection_time: new Date().toISOString().slice(0, 16),
    problem_types: [] as string[],
    notes: '',
    is_serious: false,
  })
  const [photos, setPhotos] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadPoints()
  }, [])

  const loadPoints = async () => {
    try {
      const data = await api.get<Point[]>('/points')
      setPoints(data)
    } catch (error) {
      console.error('加载点位失败:', error)
    }
  }

  const toggleProblemType = (type: string) => {
    setFormData((prev) => ({
      ...prev,
      problem_types: prev.problem_types.includes(type)
        ? prev.problem_types.filter((t) => t !== type)
        : [...prev.problem_types, type],
    }))
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    Array.from(files).forEach((file) => {
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          setPhotos((prev) => [...prev, event.target!.result as string])
        }
      }
      reader.readAsDataURL(file)
    })
    e.target.value = ''
  }

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.point_id) {
      alert('请选择点位')
      return
    }
    if (formData.problem_types.length === 0) {
      alert('请至少选择一个问题类型')
      return
    }

    try {
      setSaving(true)
      const isSerious = formData.problem_types.includes('满溢') || formData.problem_types.length >= 2
      await api.post('/inspections', {
        ...formData,
        point_id: Number(formData.point_id),
        photos,
        is_serious: isSerious,
      })
      navigate('/inspections')
    } catch (error) {
      console.error('提交失败:', error)
      alert('提交失败')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        返回
      </button>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">新增巡查记录</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              选择点位 <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.point_id}
              onChange={(e) => setFormData({ ...formData, point_id: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
            >
              <option value="">请选择点位</option>
              {points.map((point) => (
                <option key={point.id} value={point.id}>
                  {point.building} - {point.location}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">巡查人</label>
            <input
              type="text"
              value={formData.inspector}
              onChange={(e) => setFormData({ ...formData, inspector: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">巡查时间</label>
            <input
              type="datetime-local"
              value={formData.inspection_time}
              onChange={(e) => setFormData({ ...formData, inspection_time: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              问题类型 <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {PROBLEM_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => toggleProblemType(type)}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-all text-left ${
                    formData.problem_types.includes(type)
                      ? 'bg-emerald-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">现场照片</label>
            <div className="grid grid-cols-4 gap-3">
              {photos.map((photo, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <img src={photo} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute top-1 right-1 w-6 h-6 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <label className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition-all">
                <Camera className="w-8 h-8 text-gray-400 mb-1" />
                <span className="text-xs text-gray-500">添加照片</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">备注说明</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              placeholder="补充说明问题详情..."
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors font-medium"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors font-medium disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? '提交中...' : '提交'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
