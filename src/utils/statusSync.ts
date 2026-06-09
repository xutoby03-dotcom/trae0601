import { usePrinterStore } from '@/stores/printerStore'
import { useReportStore } from '@/stores/reportStore'
import { useConsumableStore } from '@/stores/consumableStore'
import { useProcurementStore } from '@/stores/procurementStore'
import type { PrinterStatus } from '@/types'

const STATUS_PRIORITY: Record<PrinterStatus, number> = {
  fault: 3,
  procurement: 2,
  low_supply: 1,
  normal: 0,
}

export function setPrinterStatusIfHigher(printerId: string, newStatus: PrinterStatus) {
  const { printers, updatePrinterStatus } = usePrinterStore.getState()
  const printer = printers.find((p) => p.id === printerId)
  if (printer && STATUS_PRIORITY[newStatus] > STATUS_PRIORITY[printer.status]) {
    updatePrinterStatus(printerId, newStatus)
  }
}

export function findPrintersByConsumableName(consumableName: string): string[] {
  const { printers } = usePrinterStore.getState()
  return printers
    .filter((p) => p.consumableModels.includes(consumableName))
    .map((p) => p.id)
}

export function recalculatePrinterStatus(printerId: string) {
  const { printers, updatePrinterStatus } = usePrinterStore.getState()
  const { reports } = useReportStore.getState()
  const { consumables } = useConsumableStore.getState()
  const { procurements } = useProcurementStore.getState()

  const printer = printers.find((p) => p.id === printerId)
  if (!printer) return

  const hasOpenReports = reports.some(
    (r) => r.printerId === printerId && r.status !== 'closed'
  )
  if (hasOpenReports) {
    updatePrinterStatus(printerId, 'fault')
    return
  }

  const hasLowSupply = consumables.some(
    (c) => c.quantity <= c.threshold && printer.consumableModels.includes(c.name)
  )
  if (hasLowSupply) {
    updatePrinterStatus(printerId, 'low_supply')
    return
  }

  const hasActiveProcurement = procurements.some((pr) => {
    if (pr.status === 'installed') return false
    const consumable = consumables.find((c) => c.id === pr.consumableId)
    return consumable && printer.consumableModels.includes(consumable.name)
  })
  if (hasActiveProcurement) {
    updatePrinterStatus(printerId, 'procurement')
    return
  }

  updatePrinterStatus(printerId, 'normal')
}
