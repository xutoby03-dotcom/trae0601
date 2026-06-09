import { AlertTriangle } from 'lucide-react'
import { formatPace } from '@/utils/helpers'

interface PaceAlertProps {
  paceDiff: number
  onConfirm: () => void
  onCancel: () => void
}

export default function PaceAlert({ paceDiff, onConfirm, onCancel }: PaceAlertProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div className="relative z-10 w-[85%] max-w-sm animate-in zoom-in-95 fade-in duration-200 rounded-2xl border border-orange-500/30 bg-gray-900/95 p-6 shadow-2xl shadow-orange-500/10">
        <div className="mb-4 flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-500/15">
            <AlertTriangle className="h-6 w-6 text-orange-400" />
          </div>
          <h3 className="text-lg font-semibold text-orange-300">
            配速差异 {formatPace(paceDiff)}/km
          </h3>
        </div>
        <p className="mb-6 text-center text-sm leading-relaxed text-gray-300">
          配速差距较大，可能跟不上大部队，建议选择配速更接近的活动
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 rounded-xl bg-gray-700/60 px-4 py-2.5 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-600/60 active:scale-[0.98]"
          >
            再看看
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-green-600/80 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-500/80 active:scale-[0.98]"
          >
            仍然报名
          </button>
        </div>
      </div>
    </div>
  )
}
