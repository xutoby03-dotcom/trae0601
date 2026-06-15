import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save, Camera, X } from 'lucide-react'
import { api } from '@/utils/api'
import { BIN_TYPES } from '@/types'
import type { Point } from '@/types'

export default function PointForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id

  const [formData, setFormData] = useState({
    building: '',
    location: '',
    bin_types: [] as string[],
    open_hours: '',
    supervisor: '',
    camera_position: '',
    description: '',
  })
  const [photos, setPhotos] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isEdit) {
      loadPoint()
    }
  }, [id])

  const loadPoint = async () => {
    try {
      setLoading(true)
      const data = await api.get<Point>(`/points/${id}`)
      setFormData({
        building: data.building,
        location: data.location,
        bin_types: data.bin_types,
        open_hours: data.open_hours,
        supervisor: data.supervisor,
        camera_position: data.camera_position,
        description: data.description,
      })
      setPhotos(data.photos || [])
    } catch (error) {
      console.error('加载点位失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.building) {
      alert('请填写楼栋名称')
      return
    }

    try {
      setSaving(true)
      if (isEdit) {
        await api.put(`/points/${id}`, { ...formData, photos })
      } else {
        await api.post('/points', { ...formData, photos })
      }
      navigate('/points')
    } catch (error) {
      console.error('保存失败:', error)
      alert('保存失败')
    } finally {
      setSaving(false)
    }
  }

  const toggleBinType = (type: string) => {
    setFormData((prev) => ({
      ...prev,
      bin_types: prev.bin_types.includes(type)
        ? prev.bin_types.filter((t) => t !== type)
        : [...prev.bin_types, type],
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

  if (loading) {
    return <div className="animate-pulse bg-white rounded-xl h-96" />
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
        <h2 className="text-xl font-semibold text-gray-800 mb-6">
          {isEdit ? '编辑点位' : '新增点位'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              楼栋名称 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.building}
              onChange={(e) => setFormData({ ...formData, building: e.target.value })}
              placeholder="例如：1号楼"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">具体位置</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="例如：单元门左侧"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">桶类型</label>
            <div className="flex flex-wrap gap-2">
              {BIN_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => toggleBinType(type)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    formData.bin_types.includes(type)
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">开放时段</label>
            <input
              type="text"
              value={formData.open_hours}
              onChange={(e) => setFormData({ ...formData, open_hours: e.target.value })}
              placeholder="例如：07:00-09:00, 18:00-20:00"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">督导员</label>
            <input
              type="text"
              value={formData.supervisor}
              onChange={(e) => setFormData({ ...formData, supervisor: e.target.value })}
              placeholder="负责该点位的督导员"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">摄像头位置</label>
            <input
              type="text"
              value={formData.camera_position}
              onChange={(e) => setFormData({ ...formData, camera_position: e.target.value })}
              placeholder="例如：1号摄像头"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">点位照片</label>
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
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              placeholder="点位相关的备注信息"
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
              {saving ? '保存中...' : '保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
