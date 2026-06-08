import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AlertTriangle, Clock } from 'lucide-react'
import type { Medicine } from '@/types'
import { CATEGORY_CONFIG } from '@/types'
import { getExpiryStatus, getDaysUntilExpiry, getExpiryStatusColor, isLowStock } from '@/utils/expiry'
import { cn } from '@/lib/utils'

interface MedicineCardProps {
  medicine: Medicine
}

export default function MedicineCard({ medicine }: MedicineCardProps) {
  const status = getExpiryStatus(medicine.expiryDate)
  const daysLeft = getDaysUntilExpiry(medicine.expiryDate)
  const low = isLowStock(medicine)
  const categoryConfig = CATEGORY_CONFIG[medicine.category]

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, boxShadow: '0 8px 25px rgba(0,0,0,0.08)' }}
      transition={{ duration: 0.2 }}
    >
      <Link
        to={`/medicine/${medicine.id}`}
        className={cn(
          'block p-3 rounded-xl border transition-colors',
          status === 'expired'
            ? 'bg-red-50/70 border-red-200/60'
            : 'bg-white border-amber-100/50 hover:border-amber-200'
        )}
      >
        <div className="flex items-start gap-3">
          <div className={cn(
            'w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0',
            categoryConfig.bgColor
          )}>
            {medicine.photoUrl ? (
              <img src={medicine.photoUrl} alt={medicine.name} className="w-full h-full object-cover rounded-lg" />
            ) : (
              categoryConfig.icon
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-amber-900 text-sm truncate">{medicine.name}</h4>
              {low && (
                <span className="shrink-0 px-1.5 py-0.5 text-[10px] font-medium rounded-full bg-sky-50 text-sky-600 border border-sky-200">
                  库存低
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5 truncate">{medicine.purpose}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className={cn(
                'inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium rounded-full border',
                getExpiryStatusColor(status)
              )}>
                {status === 'expired' ? (
                  <AlertTriangle className="w-3 h-3" />
                ) : status === 'expiring_soon' ? (
                  <Clock className="w-3 h-3" />
                ) : null}
                {status === 'expired' ? '已过期' : status === 'expiring_soon' ? `${daysLeft}天后过期` : '正常'}
              </span>
              <span className="text-[11px] text-gray-400">
                {medicine.quantity}{medicine.unit}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
