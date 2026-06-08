import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Pencil, Trash2, Minus, AlertTriangle, Clock, MapPin, Users, FileText, ShieldAlert } from 'lucide-react'
import { useMedicineStore } from '@/store/medicineStore'
import { useMemberStore } from '@/store/memberStore'
import UsageTimeline from '@/components/UsageTimeline'
import { getExpiryStatus, getDaysUntilExpiry, getExpiryStatusColor, isLowStock } from '@/utils/expiry'
import { CATEGORY_CONFIG } from '@/types'
import { cn } from '@/lib/utils'

export default function MedicineDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { medicines, usageRecords, useMedicine, deleteMedicine } = useMedicineStore()
  const { members } = useMemberStore()
  const [useAmount, setUseAmount] = useState(1)
  const [useNote, setUseNote] = useState('')
  const [showUseForm, setShowUseForm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const medicine = medicines.find(m => m.id === id)
  if (!medicine) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400">药品不存在</p>
        <Link to="/" className="text-emerald-600 text-sm mt-2 inline-block">返回首页</Link>
      </div>
    )
  }

  const status = getExpiryStatus(medicine.expiryDate)
  const daysLeft = getDaysUntilExpiry(medicine.expiryDate)
  const low = isLowStock(medicine)
  const categoryConfig = CATEGORY_CONFIG[medicine.category]
  const records = usageRecords.filter(r => r.medicineId === medicine.id)
  const quantityPercent = Math.min(100, (medicine.quantity / (medicine.lowStockThreshold * 3)) * 100)

  const handleUse = () => {
    if (useAmount <= 0 || useAmount > medicine.quantity) return
    useMedicine(medicine.id, useAmount, useNote)
    setUseAmount(1)
    setUseNote('')
    setShowUseForm(false)
  }

  const handleDelete = () => {
    deleteMedicine(medicine.id)
    navigate('/')
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="flex items-center justify-between mb-4">
        <Link to="/" className="flex items-center gap-1 text-gray-500 hover:text-gray-700 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">返回</span>
        </Link>
        <div className="flex gap-2">
          <Link
            to={`/edit/${medicine.id}`}
            className="p-2 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors"
          >
            <Pencil className="w-4 h-4" />
          </Link>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 border border-amber-100/50 shadow-sm mb-4">
        <div className="flex items-start gap-4">
          <div className={cn(
            'w-16 h-16 rounded-xl flex items-center justify-center text-3xl shrink-0',
            categoryConfig.bgColor
          )}>
            {medicine.photoUrl ? (
              <img src={medicine.photoUrl} alt={medicine.name} className="w-full h-full object-cover rounded-xl" />
            ) : (
              categoryConfig.icon
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-amber-900">{medicine.name}</h1>
            <p className="text-sm text-gray-500 mt-0.5">{medicine.purpose}</p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className={cn(
                'inline-flex items-center gap-0.5 px-2 py-0.5 text-xs font-medium rounded-full border',
                getExpiryStatusColor(status)
              )}>
                {status === 'expired' ? (
                  <><AlertTriangle className="w-3 h-3" /> 已过期</>
                ) : status === 'expiring_soon' ? (
                  <><Clock className="w-3 h-3" /> {daysLeft}天后过期</>
                ) : (
                  '✅ 正常'
                )}
              </span>
              {low && (
                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 text-xs font-medium rounded-full bg-sky-50 text-sky-600 border border-sky-200">
                  库存不足
                </span>
              )}
              <span className={cn(
                'px-2 py-0.5 text-xs font-medium rounded-full',
                categoryConfig.bgColor,
                categoryConfig.color
              )}>
                {categoryConfig.label}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 border border-amber-100/50 shadow-sm mb-4">
        <h3 className="text-sm font-semibold text-amber-800 mb-3">数量与效期</h3>
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-500">剩余数量</span>
              <span className={cn(
                'text-sm font-bold',
                low ? 'text-red-500' : 'text-emerald-600'
              )}>
                {medicine.quantity} {medicine.unit}
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-500',
                  quantityPercent <= 30 ? 'bg-red-400' : quantityPercent <= 60 ? 'bg-amber-400' : 'bg-emerald-400'
                )}
                style={{ width: `${quantityPercent}%` }}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-amber-50/50">
              <p className="text-xs text-gray-400">买入日期</p>
              <p className="text-sm font-medium text-amber-900 mt-0.5">{medicine.purchaseDate}</p>
            </div>
            <div className="p-3 rounded-lg bg-amber-50/50">
              <p className="text-xs text-gray-400">有效期至</p>
              <p className={cn(
                'text-sm font-medium mt-0.5',
                status === 'expired' ? 'text-red-600' : status === 'expiring_soon' ? 'text-amber-600' : 'text-amber-900'
              )}>
                {medicine.expiryDate}
              </p>
            </div>
          </div>
          {medicine.storageLocation && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4 text-gray-400" />
              {medicine.storageLocation}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 border border-amber-100/50 shadow-sm mb-4">
        <h3 className="text-sm font-semibold text-amber-800 mb-3">服用说明</h3>
        <div className="space-y-3">
          {medicine.dosage && (
            <div className="flex items-start gap-2">
              <FileText className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-gray-400">用法用量</p>
                <p className="text-sm text-gray-700">{medicine.dosage}</p>
              </div>
            </div>
          )}
          {medicine.suitableFor.length > 0 && (
            <div className="flex items-start gap-2">
              <Users className="w-4 h-4 text-sky-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-gray-400">适用人群</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {medicine.suitableFor.map(tag => {
                    const member = members.find(m => m.tag === tag)
                    return (
                      <span key={tag} className="px-2 py-0.5 text-xs rounded-full bg-sky-50 text-sky-600">
                        {member ? `${member.avatar} ${member.name}` : tag}
                      </span>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
          {medicine.contraindications && (
            <div className="flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-gray-400">禁忌提醒</p>
                <p className="text-sm text-red-600">{medicine.contraindications}</p>
              </div>
            </div>
          )}
          {medicine.notes && (
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-gray-400">注意事项</p>
                <p className="text-sm text-amber-700">{medicine.notes}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 border border-amber-100/50 shadow-sm mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-amber-800">使用记录</h3>
          <button
            onClick={() => setShowUseForm(!showUseForm)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
          >
            <Minus className="w-3.5 h-3.5" />
            记录使用
          </button>
        </div>

        {showUseForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-4 p-3 rounded-lg bg-emerald-50/50 border border-emerald-100"
          >
            <div className="flex items-center gap-3 mb-2">
              <label className="text-xs text-gray-500 shrink-0">使用数量</label>
              <input
                type="number"
                min={1}
                max={medicine.quantity}
                value={useAmount}
                onChange={e => setUseAmount(Number(e.target.value))}
                className="w-20 px-2 py-1 rounded-lg border border-gray-200 text-sm text-center focus:outline-none focus:border-emerald-400"
              />
              <span className="text-xs text-gray-400">{medicine.unit}</span>
            </div>
            <div className="flex items-center gap-3 mb-3">
              <label className="text-xs text-gray-500 shrink-0">备注</label>
              <input
                type="text"
                value={useNote}
                onChange={e => setUseNote(e.target.value)}
                placeholder="为什么要用药..."
                className="flex-1 px-2 py-1 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-emerald-400"
              />
            </div>
            <button
              onClick={handleUse}
              disabled={useAmount <= 0 || useAmount > medicine.quantity}
              className="w-full py-2 rounded-lg text-sm font-medium bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              确认使用
            </button>
          </motion.div>
        )}

        <UsageTimeline records={records} medicineName={medicine.name} />
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 mx-4 max-w-sm w-full shadow-xl"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-2">确认删除</h3>
            <p className="text-sm text-gray-500 mb-4">
              确定要删除「{medicine.name}」吗？此操作不可撤销。
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-colors"
              >
                删除
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}
