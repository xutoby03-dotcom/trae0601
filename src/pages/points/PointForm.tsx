import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
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
        await api.put(`/points/${id}`, formData)
      } else {
        await api.post('/points', formData)
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
