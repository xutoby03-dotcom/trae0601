import { useParams, useNavigate } from 'react-router-dom'
import { useUmbrellaStore } from '@/store'
import { STATUS_LABELS, SIZE_LABELS, DAMAGE_TYPE_LABELS } from '@/types'
import { formatDateTime } from '@/utils/helpers'
import { ArrowLeft, MapPin, Clock, Shield, Camera, User, AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'

export default function UmbrellaDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const store = useUmbrellaStore()

  const umbrella = store.umbrellas.find((u) => u.id === id)
  if (!umbrella) {
    return (
      <div className="text-center py-16">
        <p className="text-sm text-slate-400">未找到该雨伞</p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 px-4 py-2 rounded-full bg-[#1B3A5C] text-white text-sm font-semibold"
        >
          返回首页
        </button>
      </div>
    )
  }

  const records = store.borrowRecords
    .filter((r) => r.umbrellaId === umbrella.id)
    .sort((a, b) => new Date(b.borrowTime).getTime() - new Date(a.borrowTime).getTime())

  return (
    <div className="max-w-lg mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        返回
      </button>

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#1B3A5C] font-display">雨伞详情</h2>
        <p className="text-sm text-slate-400 mt-1">{umbrella.code} 的完整记录</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-slate-200/60 p-5 mb-5"
      >
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center border border-slate-200/60"
            style={{ backgroundColor: umbrella.color + '20' }}
          >
            <div className="w-7 h-7 rounded-full" style={{ backgroundColor: umbrella.color }} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800 font-display">{umbrella.code}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-slate-400">{SIZE_LABELS[umbrella.size]}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                umbrella.status === 'available' ? 'bg-emerald-100 text-emerald-700' :
                umbrella.status === 'borrowed' ? 'bg-blue-100 text-blue-700' :
                umbrella.status === 'damaged' ? 'bg-orange-100 text-orange-700' :
                'bg-red-100 text-red-700'
              }`}>
                {STATUS_LABELS[umbrella.status]}
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{umbrella.location}</span>
          <span className="flex items-center gap-1"><Shield className="w-3 h-3" />{umbrella.deposit > 0 ? `押金¥${umbrella.deposit}` : '免押金'}</span>
          <span className="flex items-center gap-1"><User className="w-3 h-3" />贡献者: {umbrella.contributorName}</span>
        </div>
      </motion.div>

      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-700">借用记录</h3>
        {records.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-slate-400">暂无借用记录</p>
          </div>
        ) : (
          records.map((record, index) => {
            const isReturned = record.status === 'returned'
            const isOverdue = record.status === 'overdue'
            return (
              <motion.div
                key={record.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-2xl border border-slate-200/60 p-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    {record.borrowerName}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                    isReturned ? 'bg-slate-100 text-slate-500' :
                    isOverdue ? 'bg-red-100 text-red-600' :
                    'bg-blue-100 text-blue-600'
                  }`}>
                    {isReturned ? '已归还' : isOverdue ? '逾期未还' : '借用中'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs text-slate-500 mb-3">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    借用: {formatDateTime(record.borrowTime)}
                  </span>
                  <span className="flex items-center gap-1">
                    应还: {formatDateTime(record.expectedReturnTime)}
                  </span>
                  {record.actualReturnTime && (
                    <span className="flex items-center gap-1">
                      实还: {formatDateTime(record.actualReturnTime)}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    归还至 {record.returnLocation}
                  </span>
                </div>

                {record.conditionOnReturn && record.conditionOnReturn !== 'good' && (
                  <div className="mb-3 p-3 rounded-xl bg-orange-50/60 border border-orange-200/40">
                    <div className="flex items-center gap-1.5 mb-2">
                      <AlertCircle className="w-3.5 h-3.5 text-orange-500" />
                      <span className="text-xs font-semibold text-orange-700">
                        {record.conditionOnReturn === 'damaged' ? '归还时损坏' : '已丢失'}
                      </span>
                    </div>
                    {record.damageTypes.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {record.damageTypes.map((dt) => (
                          <span
                            key={dt}
                            className="inline-flex items-center text-[10px] px-2 py-0.5 rounded-full bg-orange-100 text-orange-600 font-medium"
                          >
                            {DAMAGE_TYPE_LABELS[dt]}
                          </span>
                        ))}
                      </div>
                    )}
                    {record.damageNote && (
                      <p className="text-xs text-orange-700/70">{record.damageNote}</p>
                    )}
                  </div>
                )}

                {record.returnPhotoUrl && (
                  <div>
                    <span className="flex items-center gap-1 text-[11px] text-slate-400 mb-1.5">
                      <Camera className="w-3 h-3" />
                      归还照片
                    </span>
                    <img
                      src={record.returnPhotoUrl}
                      alt="归还照片"
                      className="w-full h-48 object-cover rounded-xl border border-slate-200/60"
                    />
                  </div>
                )}
              </motion.div>
            )
          })
        )}
      </div>
    </div>
  )
}
