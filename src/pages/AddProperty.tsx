import { useState, useEffect, useRef, type ChangeEvent, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Camera, X, Save } from 'lucide-react'
import { usePropertyStore } from '@/lib/store'
import { DEPOSIT_TYPES, ORIENTATIONS, RISK_TAG_OPTIONS, type RiskTag } from '@/lib/types'

export default function AddProperty() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const { addProperty, updateProperty, getProperty } = usePropertyStore()

  const [community, setCommunity] = useState('')
  const [rent, setRent] = useState('')
  const [depositType, setDepositType] = useState(DEPOSIT_TYPES[0])
  const [area, setArea] = useState('')
  const [floor, setFloor] = useState('')
  const [orientation, setOrientation] = useState(ORIENTATIONS[0])
  const [commuteMinutes, setCommuteMinutes] = useState('')
  const [agencyFee, setAgencyFee] = useState('0')
  const [moveInDate, setMoveInDate] = useState('')
  const [photos, setPhotos] = useState<string[]>([])
  const [riskTags, setRiskTags] = useState<RiskTag[]>([])

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (id) {
      const property = getProperty(id)
      if (property) {
        setCommunity(property.community)
        setRent(String(property.rent))
        setDepositType(property.depositType)
        setArea(String(property.area))
        setFloor(property.floor)
        setOrientation(property.orientation)
        setCommuteMinutes(String(property.commuteMinutes))
        setAgencyFee(String(property.agencyFee))
        setMoveInDate(property.moveInDate)
        setPhotos(property.photos)
        setRiskTags(property.riskTags)
      }
    }
  }, [id, getProperty])

  const handlePhotoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    Array.from(files).forEach((file) => {
      const reader = new FileReader()
      reader.onload = () => {
        const dataUrl = reader.result as string
        setPhotos((prev) => [...prev, dataUrl])
      }
      reader.readAsDataURL(file)
    })
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index))
  }

  const handleRiskTagToggle = (tag: RiskTag) => {
    setRiskTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!community.trim() || !rent) return

    const data = {
      community: community.trim(),
      rent: Number(rent),
      depositType,
      area: area ? Number(area) : 0,
      floor,
      orientation,
      commuteMinutes: commuteMinutes ? Number(commuteMinutes) : 0,
      agencyFee: agencyFee ? Number(agencyFee) : 0,
      moveInDate,
      photos,
      riskTags,
    }

    if (isEdit && id) {
      updateProperty(id, data)
      navigate(`/property/${id}`)
    } else {
      const newId = addProperty(data)
      navigate(`/property/${newId}`)
    }
  }

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100">
      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold">
            {isEdit ? '编辑房源' : '添加房源'}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-stone-900 rounded-xl p-4 space-y-4">
            <div>
              <label className="block text-sm text-stone-400 mb-1">
                小区名称 <span className="text-orange-500">*</span>
              </label>
              <input
                type="text"
                value={community}
                onChange={(e) => setCommunity(e.target.value)}
                required
                placeholder="请输入小区名称"
                className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm text-stone-400 mb-1">
                月租金 (¥) <span className="text-orange-500">*</span>
              </label>
              <input
                type="number"
                value={rent}
                onChange={(e) => setRent(e.target.value)}
                required
                min="0"
                placeholder="请输入月租金"
                className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm text-stone-400 mb-1">
                押付方式
              </label>
              <select
                value={depositType}
                onChange={(e) => setDepositType(e.target.value)}
                className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-stone-100 focus:outline-none focus:border-orange-500 transition-colors"
              >
                {DEPOSIT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-stone-400 mb-1">
                  面积 (㎡)
                </label>
                <input
                  type="number"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  min="0"
                  placeholder="面积"
                  className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm text-stone-400 mb-1">
                  楼层
                </label>
                <input
                  type="text"
                  value={floor}
                  onChange={(e) => setFloor(e.target.value)}
                  placeholder="如 12/18"
                  className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-stone-400 mb-1">
                  朝向
                </label>
                <select
                  value={orientation}
                  onChange={(e) => setOrientation(e.target.value)}
                  className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-stone-100 focus:outline-none focus:border-orange-500 transition-colors"
                >
                  {ORIENTATIONS.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-stone-400 mb-1">
                  通勤时间 (分钟)
                </label>
                <input
                  type="number"
                  value={commuteMinutes}
                  onChange={(e) => setCommuteMinutes(e.target.value)}
                  min="0"
                  placeholder="分钟"
                  className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-stone-400 mb-1">
                  中介费 (¥)
                </label>
                <input
                  type="number"
                  value={agencyFee}
                  onChange={(e) => setAgencyFee(e.target.value)}
                  min="0"
                  placeholder="0"
                  className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm text-stone-400 mb-1">
                  可入住日期
                </label>
                <input
                  type="date"
                  value={moveInDate}
                  onChange={(e) => setMoveInDate(e.target.value)}
                  className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-stone-100 focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="bg-stone-900 rounded-xl p-4">
            <label className="block text-sm text-stone-400 mb-2">照片</label>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {photos.map((photo, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                  <img
                    src={photo}
                    alt={`照片 ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(index)}
                    className="absolute top-1 right-1 p-1 bg-stone-900/80 rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square rounded-lg border-2 border-dashed border-stone-700 flex flex-col items-center justify-center gap-1 hover:border-orange-500 transition-colors"
              >
                <Camera size={24} className="text-stone-500" />
                <span className="text-xs text-stone-500">添加照片</span>
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoUpload}
              className="hidden"
            />
          </div>

          <div className="bg-stone-900 rounded-xl p-4">
            <label className="block text-sm text-stone-400 mb-2">风险标签</label>
            <div className="flex flex-wrap gap-2">
              {RISK_TAG_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer transition-colors text-sm ${
                    riskTags.includes(option.value)
                      ? 'bg-orange-500/20 border border-orange-500 text-orange-400'
                      : 'bg-stone-800 border border-stone-700 text-stone-400 hover:border-stone-600'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={riskTags.includes(option.value)}
                    onChange={() => handleRiskTagToggle(option.value)}
                    className="hidden"
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            <Save size={18} />
            {isEdit ? '保存修改' : '添加房源'}
          </button>
        </form>
      </div>
    </div>
  )
}
