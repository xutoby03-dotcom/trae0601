import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Download, AlertTriangle, Clock, Trash2, FileText, Copy, Check } from 'lucide-react'
import { useMedicineStore } from '@/store/medicineStore'
import { getExpiryStatus, getDaysUntilExpiry, getExpiryStatusColor } from '@/utils/expiry'
import { exportMedicineList } from '@/utils/export'
import { useMemberStore } from '@/store/memberStore'
import { cn } from '@/lib/utils'

export default function ExportPage() {
  const { medicines, usageRecords, deleteMedicine } = useMedicineStore()
  const { members } = useMemberStore()
  const [copied, setCopied] = useState(false)

  const expiredMedicines = useMemo(
    () => medicines.filter(m => getExpiryStatus(m.expiryDate) === 'expired'),
    [medicines]
  )

  const expiringSoonMedicines = useMemo(
    () => medicines.filter(m => getExpiryStatus(m.expiryDate) === 'expiring_soon'),
    [medicines]
  )

  const exportedText = useMemo(
    () => exportMedicineList(medicines, members, usageRecords),
    [medicines, members, usageRecords]
  )

  const handleCopy = async () => {
    await navigator.clipboard.writeText(exportedText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const blob = new Blob([exportedText], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `家庭药箱清单_${new Date().toISOString().split('T')[0]}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleDispose = (id: string) => {
    deleteMedicine(id)
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-1">
          <Download className="w-5 h-5 text-emerald-500" />
          <h1 className="text-xl font-bold text-amber-900">导出与提醒</h1>
        </div>
        <p className="text-sm text-gray-400">
          导出药箱清单，处理过期药品
        </p>
      </div>

      <div className="bg-white rounded-2xl p-5 border border-amber-100/50 shadow-sm mb-4">
        <h3 className="text-sm font-semibold text-amber-800 mb-3 flex items-center gap-1.5">
          <FileText className="w-4 h-4" />
          导出药箱清单
        </h3>
        <div className="bg-amber-50/50 rounded-xl p-4 mb-3 max-h-48 overflow-y-auto">
          <pre className="text-xs text-gray-600 whitespace-pre-wrap font-mono leading-relaxed">
            {exportedText}
          </pre>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            {copied ? '已复制' : '复制清单'}
          </button>
          <button
            onClick={handleDownload}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium bg-emerald-500 text-white hover:bg-emerald-600 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            下载文件
          </button>
        </div>
      </div>

      {expiredMedicines.length > 0 && (
        <div className="bg-white rounded-2xl p-5 border border-red-100/60 shadow-sm mb-4">
          <h3 className="text-sm font-semibold text-red-700 mb-3 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4" />
            已过期药品 · {expiredMedicines.length}种
          </h3>
          <div className="space-y-2">
            {expiredMedicines.map(m => {
              const days = getDaysUntilExpiry(m.expiryDate)
              return (
                <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl bg-red-50/50 border border-red-100/60">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-red-800 truncate">{m.name}</p>
                    <p className="text-xs text-red-500">
                      已过期{Math.abs(days)}天 · {m.purpose}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDispose(m.id)}
                    className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-red-500 text-white hover:bg-red-600 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    已处理
                  </button>
                </div>
              )
            })}
          </div>
          <div className="mt-3 p-3 rounded-lg bg-amber-50 border border-amber-100">
            <p className="text-xs text-amber-700">
              💡 过期药品处理建议：片剂/胶囊用塑料袋密封后丢弃；液体药品倒入下水道；外用药膏挤入垃圾袋后密封丢弃。请勿直接冲入马桶。
            </p>
          </div>
        </div>
      )}

      {expiringSoonMedicines.length > 0 && (
        <div className="bg-white rounded-2xl p-5 border border-amber-100/60 shadow-sm mb-4">
          <h3 className="text-sm font-semibold text-amber-700 mb-3 flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            即将过期 · {expiringSoonMedicines.length}种
          </h3>
          <div className="space-y-2">
            {expiringSoonMedicines.map(m => {
              const days = getDaysUntilExpiry(m.expiryDate)
              return (
                <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl bg-amber-50/50 border border-amber-100/60">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-amber-800 truncate">{m.name}</p>
                    <p className="text-xs text-amber-500">
                      还有{days}天过期 · 剩余{m.quantity}{m.unit}
                    </p>
                  </div>
                  <span className={cn(
                    'shrink-0 px-2 py-0.5 text-[10px] font-medium rounded-full border',
                    getExpiryStatusColor('expiring_soon')
                  )}>
                    {days}天后过期
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {expiredMedicines.length === 0 && expiringSoonMedicines.length === 0 && (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">✨</p>
          <p className="text-gray-500 text-sm font-medium">一切正常</p>
          <p className="text-gray-400 text-xs mt-1">没有过期或即将过期的药品</p>
        </div>
      )}
    </motion.div>
  )
}
