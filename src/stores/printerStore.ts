import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Printer, PrinterStatus } from '@/types'
import { mockPrinters } from '@/data/mockData'

interface PrinterStore {
  printers: Printer[]
  addPrinter: (printer: Printer) => void
  updatePrinter: (id: string, data: Partial<Printer>) => void
  updatePrinterStatus: (id: string, status: PrinterStatus) => void
  deletePrinter: (id: string) => void
}

export const usePrinterStore = create<PrinterStore>()(
  persist(
    (set) => ({
      printers: mockPrinters,
      addPrinter: (printer) =>
        set((state) => ({ printers: [...state.printers, printer] })),
      updatePrinter: (id, data) =>
        set((state) => ({
          printers: state.printers.map((p) =>
            p.id === id ? { ...p, ...data } : p
          ),
        })),
      updatePrinterStatus: (id, status) =>
        set((state) => ({
          printers: state.printers.map((p) =>
            p.id === id ? { ...p, status } : p
          ),
        })),
      deletePrinter: (id) =>
        set((state) => ({
          printers: state.printers.filter((p) => p.id !== id),
        })),
    }),
    { name: 'printer-store' }
  )
)
