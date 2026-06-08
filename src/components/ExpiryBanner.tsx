import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AlertTriangle, Clock, ArrowRight } from 'lucide-react'

interface ExpiryBannerProps {
  expiringSoonCount: number
  expiredCount: number
}

export default function ExpiryBanner({ expiringSoonCount, expiredCount }: ExpiryBannerProps) {
  if (expiringSoonCount === 0 && expiredCount === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 space-y-2"
    >
      {expiredCount > 0 && (
        <Link
          to="/export"
          className="flex items-center gap-3 p-3.5 rounded-xl bg-gradient-to-r from-red-50 to-red-100/50 border border-red-200/60 group hover:shadow-md hover:shadow-red-100 transition-all"
        >
          <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-700">
              {expiredCount}种药品已过期
            </p>
            <p className="text-xs text-red-500/80">请及时处理，避免误用</p>
          </div>
          <ArrowRight className="w-4 h-4 text-red-400 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      )}
      {expiringSoonCount > 0 && (
        <Link
          to="/restock"
          className="flex items-center gap-3 p-3.5 rounded-xl bg-gradient-to-r from-amber-50 to-amber-100/50 border border-amber-200/60 group hover:shadow-md hover:shadow-amber-100 transition-all"
        >
          <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center shrink-0 animate-pulse">
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-700">
              {expiringSoonCount}种药品即将过期
            </p>
            <p className="text-xs text-amber-500/80">30天内到期，请注意使用</p>
          </div>
          <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      )}
    </motion.div>
  )
}
