import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Printer, MapPin, User, AlertTriangle, Package, ShoppingCart, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { usePrinterStore } from '@/stores/printerStore'
import { useReportStore } from '@/stores/reportStore'
import { useConsumableStore } from '@/stores/consumableStore'

type PrinterStatus = 'normal' | 'low_supply' | 'fault' | 'procurement'

const statusConfig: Record<PrinterStatus, { label: string; color: string; border: string; bg: string }> = {
  normal: { label: '正常', color: 'text-green-400', border: 'border-green-500', bg: 'bg-green-500/10' },
  low_supply: { label: '耗材快没', color: 'text-yellow-400', border: 'border-yellow-500', bg: 'bg-yellow-500/10' },
  fault: { label: '故障中', color: 'text-red-400', border: 'border-red-500', bg: 'bg-red-500/10' },
  procurement: { label: '待采购', color: 'text-blue-400', border: 'border-blue-500', bg: 'bg-blue-500/10' },
}

const statusOrder: PrinterStatus[] = ['normal', 'low_supply', 'fault', 'procurement']

export default function Dashboard() {
  const [showActions, setShowActions] = useState(false)
  const { printers } = usePrinterStore()
  const { reports } = useReportStore()
  const { consumables } = useConsumableStore()

  const lowStockItems = useMemo(
    () => consumables.filter((c) => c.quantity < c.threshold),
    [consumables]
  )

  const openReportCount = (printerId: string) =>
    reports.filter((r) => r.printerId === printerId && r.status !== 'closed').length

  const groupedPrinters = useMemo(() => {
    const groups: Record<PrinterStatus, typeof printers> = {
      normal: [],
      low_supply: [],
      fault: [],
      procurement: [],
    }
    printers.forEach((p) => groups[p.status].push(p))
    return groups
  }, [printers])

  return (
    <div className="min-h-screen bg-[#0f0f23] p-6 pb-24">
      {lowStockItems.length > 0 && (
        <div className="mb-6 overflow-hidden rounded-lg border border-amber-500/20 bg-amber-500/10">
          <div className="flex items-center gap-2 px-4 py-2">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400 animate-pulse" />
            <div className="flex gap-6 overflow-x-auto scrollbar-hide">
              {lowStockItems.map((item) => (
                <span key={item.id} className="shrink-0 text-sm text-amber-300 animate-pulse">
                  {item.name}：{item.quantity}{item.unit}（阈值 {item.threshold}{item.unit}）
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        {statusOrder.map((status) => {
          const config = statusConfig[status]
          const group = groupedPrinters[status]
          return (
            <div key={status}>
              <div className={cn('mb-3 flex items-center gap-2 rounded-md px-3 py-1.5', config.bg)}>
                <span className={cn('text-sm font-semibold', config.color)}>{config.label}</span>
                <span className="text-xs text-white/40">{group.length}</span>
              </div>
              <div className="flex flex-col gap-3">
                {group.map((printer) => {
                  const count = openReportCount(printer.id)
                  return (
                    <div
                      key={printer.id}
                      className={cn(
                        'rounded-lg border bg-[#1a1a35] p-4 transition-all',
                        config.border,
                        'border-opacity-30 hover:border-opacity-80'
                      )}
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Printer className={cn('h-4 w-4', config.color)} />
                          <span className="text-sm font-semibold text-white">{printer.name}</span>
                        </div>
                        {count > 0 && (
                          <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-xs text-red-400">
                            {count} 报修
                          </span>
                        )}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-white/70">
                          <MapPin className="h-3 w-3 text-white/40" />
                          {printer.location}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-white/70">
                          <Package className="h-3 w-3 text-white/40" />
                          {printer.model}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-white/70">
                          <User className="h-3 w-3 text-white/40" />
                          {printer.responsiblePerson}
                        </div>
                      </div>
                    </div>
                  )
                })}
                {group.length === 0 && (
                  <div className="rounded-lg border border-dashed border-white/10 p-4 text-center text-xs text-white/30">
                    暂无打印机
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="fixed bottom-8 right-8 flex flex-col items-end gap-3">
        {showActions && (
          <>
            <Link
              to="/reports"
              className="flex items-center gap-2 rounded-lg bg-red-500/90 px-4 py-2 text-sm text-white shadow-lg transition hover:bg-red-500"
            >
              <AlertTriangle className="h-4 w-4" />
              报修
            </Link>
            <Link
              to="/procurement"
              className="flex items-center gap-2 rounded-lg bg-blue-500/90 px-4 py-2 text-sm text-white shadow-lg transition hover:bg-blue-500"
            >
              <ShoppingCart className="h-4 w-4" />
              采购
            </Link>
            <Link
              to="/inventory"
              className="flex items-center gap-2 rounded-lg bg-amber-500/90 px-4 py-2 text-sm text-white shadow-lg transition hover:bg-amber-500"
            >
              <Package className="h-4 w-4" />
              入库
            </Link>
          </>
        )}
        <button
          onClick={() => setShowActions(!showActions)}
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-all',
            showActions ? 'rotate-45 bg-amber-600' : 'bg-amber-500 hover:bg-amber-400'
          )}
        >
          <Plus className="h-5 w-5 text-white" />
        </button>
      </div>
    </div>
  )
}
