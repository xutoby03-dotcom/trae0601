import { useApp } from '@/store/app'
import { cn } from '@/lib/utils'
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react'

function Alerts() {
  const { alerts, removeAlert } = useApp()
  return (
    <div className="fixed top-4 right-4 z-[999] flex flex-col gap-2 pointer-events-none">
      {alerts.map(a => {
        const map: Record<string, { cls: string; icon: any }> = {
          success: { cls: 'bg-forest-700 text-white', icon: CheckCircle2 },
          error: { cls: 'bg-red-500 text-white', icon: AlertCircle },
          info: { cls: 'bg-blue-600 text-white', icon: Info },
        }
        const cfg = map[a.type]
        const Icon = cfg.icon
        return (
          <div
            key={a.id}
            className={cn('pointer-events-auto min-w-[260px] max-w-sm shadow-lift rounded-xl px-4 py-3 flex items-start gap-3 animate-slide-up', cfg.cls)}
          >
            <Icon className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="flex-1 text-sm font-medium">{a.message}</div>
            <button onClick={() => removeAlert(a.id)} className="shrink-0 opacity-70 hover:opacity-100">
              <X className="w-4 h-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}

export default Alerts
