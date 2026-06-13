import { useState, useEffect } from 'react'
import { Save, X, ImagePlus, Upload, Snowflake } from 'lucide-react'
import type { Locker, LockerSize } from '@/types'
import { LOCKER_SIZE_OPTIONS } from '@/utils/constants'
import { fileToBase64 } from '@/utils/helpers'

interface LockerFormProps {
  locker?: Locker
  onSubmit: (data: { code: string; size: LockerSize; location: string; isRefrigerated: boolean; photo: string }) => void
  onCancel: () => void
  existingCodes?: string[]
}

export default function LockerForm({ locker, onSubmit, onCancel, existingCodes = [] }: LockerFormProps) {
  const [code, setCode] = useState(locker?.code || '')
  const [size, setSize] = useState<LockerSize>(locker?.size || 'medium')
  const [location, setLocation] = useState(locker?.location || '')
  const [isRefrigerated, setIsRefrigerated] = useState(locker?.isRefrigerated || false)
  const [photo, setPhoto] = useState(locker?.photo || '')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const isEdit = !!locker

  useEffect(() => {
    if (code && existingCodes.filter(c => c !== locker?.code).includes(code)) {
      setErrors(e => ({ ...e, code: '该编号已存在，请使用其他编号' }))
    } else {
      setErrors(e => {
        const ne = { ...e }
        delete ne.code
        return ne
      })
    }
  }, [code, existingCodes, locker])

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const base64 = await fileToBase64(file)
      setPhoto(base64)
    } catch (err) {
      console.error('上传失败', err)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}
    if (!code.trim()) newErrors.code = '请输入柜格编号'
    if (!location.trim()) newErrors.location = '请输入所在位置'
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    onSubmit({ code: code.trim(), size, location: location.trim(), isRefrigerated, photo })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            柜格编号 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="如 A-01"
            className={`w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 transition-all ${
              errors.code
                ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                : 'border-slate-200 focus:border-primary-400 focus:ring-primary-100'
            }`}
          />
          {errors.code && <p className="mt-1 text-xs text-red-500">{errors.code}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            柜格大小 <span className="text-red-500">*</span>
          </label>
          <select
            value={size}
            onChange={(e) => setSize(e.target.value as LockerSize)}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 bg-white"
          >
            {LOCKER_SIZE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label} · {opt.volume}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          所在位置 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="如：前台左侧-第1排"
          className={`w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 transition-all ${
            errors.location
              ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
              : 'border-slate-200 focus:border-primary-400 focus:ring-primary-100'
          }`}
        />
        {errors.location && <p className="mt-1 text-xs text-red-500">{errors.location}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">柜格照片</label>
        <div className="flex items-start gap-4">
          <div className={`shrink-0 w-32 h-32 rounded-xl border-2 border-dashed overflow-hidden flex items-center justify-center transition-all ${
            photo ? 'border-slate-200' : 'border-slate-300 hover:border-primary-400'
          }`}>
            {photo ? (
              <div className="relative w-full h-full">
                <img src={photo} alt="柜格照片" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setPhoto('')}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-white/90 flex items-center justify-center text-slate-500 hover:text-red-500 shadow-sm"
                >
                  <X size={12} />
                </button>
              </div>
            ) : (
              <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center gap-1.5 text-slate-400 hover:text-primary-500 transition-colors">
                <ImagePlus size={24} />
                <span className="text-xs">点击上传</span>
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
              </label>
            )}
          </div>
          <div className="flex-1 pt-1">
            <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 hover:border-primary-400 hover:bg-primary-50 text-sm text-slate-600 cursor-pointer transition-all">
              <Upload size={14} />
              {photo ? '更换照片' : '选择图片文件'}
              <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
            </label>
            <p className="mt-2 text-xs text-slate-400">支持 JPG、PNG 格式，建议清晰展示柜格外观</p>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">特殊属性</label>
        <label className={`inline-flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all ${
          isRefrigerated
            ? 'border-blue-400 bg-blue-50'
            : 'border-slate-200 hover:border-slate-300'
        }`}>
          <div className={`relative w-11 h-6 rounded-full transition-colors ${
            isRefrigerated ? 'bg-blue-500' : 'bg-slate-300'
          }`}>
            <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
              isRefrigerated ? 'translate-x-5' : ''
            }`} />
            <input
              type="checkbox"
              checked={isRefrigerated}
              onChange={(e) => setIsRefrigerated(e.target.checked)}
              className="sr-only"
            />
          </div>
          <Snowflake size={18} className={isRefrigerated ? 'text-blue-500' : 'text-slate-400'} />
          <div>
            <p className={`text-sm font-medium ${isRefrigerated ? 'text-blue-700' : 'text-slate-700'}`}>冷藏柜</p>
            <p className="text-xs text-slate-500">用于存放需低温保存的包裹</p>
          </div>
        </label>
      </div>

      <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
        >
          取消
        </button>
        <button
          type="submit"
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-colors shadow-sm"
        >
          <Save size={15} />
          {isEdit ? '保存修改' : '创建柜格'}
        </button>
      </div>
    </form>
  )
}
