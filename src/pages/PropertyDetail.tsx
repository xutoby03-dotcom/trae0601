import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Star,
  Droplets,
  Sun,
  Volume2,
  BrickWall,
  AirVent,
  Refrigerator,
  Lock,
  Waves,
  Wifi,
  AlertTriangle,
  Calendar,
  Ruler,
  Building2,
  Compass,
  Clock,
  Banknote,
} from 'lucide-react'
import { usePropertyStore } from '@/lib/store'
import {
  calculateTotalScore,
  calculateAnnualCost,
  calculateDepositAmount,
  INSPECTION_CATEGORIES,
  RISK_TAG_OPTIONS,
  RISK_TAG_LABELS,
  type RiskTag,
  type InspectionCategory,
} from '@/lib/types'

const CATEGORY_ICONS: Record<InspectionCategory, React.ReactNode> = {
  water_pressure: <Droplets size={18} />,
  lighting: <Sun size={18} />,
  noise: <Volume2 size={18} />,
  wall: <BrickWall size={18} />,
  ac: <AirVent size={18} />,
  fridge: <Refrigerator size={18} />,
  door_lock: <Lock size={18} />,
  drain: <Waves size={18} />,
  network: <Wifi size={18} />,
}

export default function PropertyDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const property = usePropertyStore((s) => s.properties.find((p) => p.id === id))
  const updateInspection = usePropertyStore((s) => s.updateInspection)
  const toggleRiskTag = usePropertyStore((s) => s.toggleRiskTag)
  const deleteProperty = usePropertyStore((s) => s.deleteProperty)

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null)

  if (!property) {
    return (
      <div className="min-h-screen bg-[#1C1917] flex items-center justify-center">
        <p className="text-[#A8A29E] text-lg">未找到房源信息</p>
      </div>
    )
  }

  const totalScore = calculateTotalScore(property.inspections)
  const annualCost = calculateAnnualCost(property)
  const depositAmount = calculateDepositAmount(property.depositType, property.rent)

  const handleDelete = () => {
    deleteProperty(property.id)
    navigate('/')
  }

  const handleStarClick = (category: InspectionCategory, score: number) => {
    const existing = property.inspections.find((i) => i.category === category)
    updateInspection(property.id, category, score, existing?.note ?? '')
  }

  const handleNoteChange = (category: InspectionCategory, note: string) => {
    const existing = property.inspections.find((i) => i.category === category)
    updateInspection(property.id, category, existing?.score ?? 0, note)
  }

  const getInspection = (category: InspectionCategory) => {
    return property.inspections.find((i) => i.category === category)
  }

  const infoItems = [
    { label: '月租金', value: `¥${property.rent}`, icon: <Banknote size={16} /> },
    { label: '押付方式', value: property.depositType, icon: <Building2 size={16} /> },
    { label: '面积', value: `${property.area}㎡`, icon: <Ruler size={16} /> },
    { label: '楼层', value: property.floor, icon: <Building2 size={16} /> },
    { label: '朝向', value: property.orientation, icon: <Compass size={16} /> },
    { label: '通勤时间', value: `${property.commuteMinutes}分钟`, icon: <Clock size={16} /> },
    { label: '中介费', value: `¥${property.agencyFee}`, icon: <Banknote size={16} /> },
    { label: '可入住日期', value: property.moveInDate, icon: <Calendar size={16} /> },
  ]

  return (
    <div className="min-h-screen bg-[#1C1917] pb-24">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-[#1C1917] border-b border-[#292524] px-4 py-3 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="text-[#A8A29E] hover:text-white transition-colors">
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-[#F5F5F4] font-semibold text-lg truncate mx-4">{property.community}</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/property/${property.id}/edit`)}
            className="text-[#A8A29E] hover:text-[#F97316] transition-colors"
          >
            <Pencil size={20} />
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="text-[#A8A29E] hover:text-red-500 transition-colors"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      {/* Delete Confirm Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-6">
          <div className="bg-[#292524] rounded-xl p-6 w-full max-w-sm">
            <h3 className="text-[#F5F5F4] text-lg font-semibold mb-2">确认删除</h3>
            <p className="text-[#A8A29E] text-sm mb-6">
              确定要删除「{property.community}」吗？此操作不可撤销。
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 rounded-lg text-[#A8A29E] bg-[#1C1917] hover:bg-[#44403C] transition-colors text-sm"
              >
                取消
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-lg text-white bg-red-600 hover:bg-red-700 transition-colors text-sm"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightboxUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={() => setLightboxUrl(null)}>
          <img src={lightboxUrl} alt="" className="max-w-[90vw] max-h-[80vh] rounded-xl object-contain" />
        </div>
      )}

      <div className="px-4 pt-4 space-y-4">
        {/* Info Grid */}
        <div className="bg-[#F5F5F4] rounded-xl p-4">
          <div className="grid grid-cols-2 gap-3">
            {infoItems.map((item) => (
              <div key={item.label} className="bg-white rounded-lg px-3 py-2.5">
                <div className="flex items-center gap-1.5 text-[#78716C] text-xs mb-1">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                <p className="text-[#1C1917] font-semibold text-sm">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Photo Gallery */}
        {property.photos.length > 0 && (
          <div className="bg-[#F5F5F4] rounded-xl p-4">
            <h3 className="text-[#1C1917] font-semibold text-sm mb-3">照片</h3>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
              {property.photos.map((url, idx) => (
                <img
                  key={idx}
                  src={url}
                  alt={`照片 ${idx + 1}`}
                  className="w-28 h-20 rounded-lg object-cover flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => setLightboxUrl(url)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Risk Tags */}
        <div className="bg-[#F5F5F4] rounded-xl p-4">
          <h3 className="text-[#1C1917] font-semibold text-sm mb-3 flex items-center gap-1.5">
            <AlertTriangle size={16} className="text-red-500" />
            风险标签
          </h3>
          <div className="flex flex-wrap gap-2">
            {RISK_TAG_OPTIONS.map((tag) => {
              const active = property.riskTags.includes(tag.value)
              return (
                <button
                  key={tag.value}
                  onClick={() => toggleRiskTag(property.id, tag.value as RiskTag)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    active
                      ? 'bg-red-500 text-white'
                      : 'bg-white text-[#78716C] border border-[#E7E5E4]'
                  }`}
                >
                  {tag.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Inspection Checklist */}
        <div className="bg-[#F5F5F4] rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[#1C1917] font-semibold text-sm">看房检查清单</h3>
            <span className="bg-[#F97316] text-white text-xs font-bold px-2.5 py-1 rounded-full">
              {totalScore} 分
            </span>
          </div>
          <div className="space-y-4">
            {INSPECTION_CATEGORIES.map((cat) => {
              const inspection = getInspection(cat.value)
              const score = inspection?.score ?? 0
              const note = inspection?.note ?? ''
              return (
                <div key={cat.value} className="bg-white rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-[#1C1917] font-medium text-sm">
                      <span className="text-[#F97316]">{CATEGORY_ICONS[cat.value]}</span>
                      {cat.label}
                    </div>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => handleStarClick(cat.value, star)}
                          className="p-0.5"
                        >
                          <Star
                            size={18}
                            className={
                              star <= score
                                ? 'fill-[#F97316] text-[#F97316]'
                                : 'fill-none text-[#D6D3D1]'
                            }
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => handleNoteChange(cat.value, e.target.value)}
                    placeholder="添加备注..."
                    className="w-full bg-[#292524] text-[#F5F5F4] text-xs rounded-lg px-3 py-2 placeholder-[#78716C] outline-none focus:ring-1 focus:ring-[#F97316]"
                  />
                </div>
              )
            })}
          </div>
        </div>

        {/* Annual Cost Summary */}
        <div className="bg-[#F97316] rounded-xl p-4">
          <h3 className="text-white/90 font-semibold text-sm mb-2">年总成本</h3>
          <p className="text-white text-2xl font-bold mb-3">¥{annualCost.toLocaleString()}</p>
          <div className="space-y-1.5 text-white/80 text-xs">
            <div className="flex justify-between">
              <span>月租 × 12</span>
              <span>¥{(property.rent * 12).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>押金 ({property.depositType})</span>
              <span>¥{depositAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>中介费</span>
              <span>¥{property.agencyFee.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
