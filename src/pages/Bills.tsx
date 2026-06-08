import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Edit2, Trash2, Calendar } from "lucide-react"
import { useStore } from "@/store/useStore"
import type { Bill } from "@/types"

const SLOT_META = [
  { key: "peak" as const, label: "峰电", color: "text-red-400", bg: "slot-peak", priceKey: "peakPrice" as const, kwhKey: "peakKwh" as const },
  { key: "valley" as const, label: "谷电", color: "text-green-400", bg: "slot-valley", priceKey: "valleyPrice" as const, kwhKey: "valleyKwh" as const },
  { key: "flat" as const, label: "平电", color: "text-blue-400", bg: "slot-flat", priceKey: "flatPrice" as const, kwhKey: "flatKwh" as const },
]

function formatMonth(month: string) {
  const [y, m] = month.split("-")
  return `${y}年${parseInt(m)}月`
}

function calcSubtotal(price: number, kwh: number) {
  return price * kwh
}

interface FormData {
  month: string
  peakPrice: number
  valleyPrice: number
  flatPrice: number
  peakKwh: number
  valleyKwh: number
  flatKwh: number
}

const defaultForm: FormData = {
  month: "",
  peakPrice: 0,
  valleyPrice: 0,
  flatPrice: 0,
  peakKwh: 0,
  valleyKwh: 0,
  flatKwh: 0,
}

export default function Bills() {
  const bills = useStore((s) => s.bills)
  const addBill = useStore((s) => s.addBill)
  const updateBill = useStore((s) => s.updateBill)
  const removeBill = useStore((s) => s.removeBill)

  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormData>(defaultForm)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const sortedBills = [...bills].sort((a, b) => b.month.localeCompare(a.month))

  function openAdd() {
    setEditingId(null)
    const now = new Date()
    const mm = String(now.getMonth() + 1).padStart(2, "0")
    setForm({ ...defaultForm, month: `${now.getFullYear()}-${mm}` })
    setModalOpen(true)
  }

  function openEdit(bill: Bill) {
    setEditingId(bill.id)
    setForm({
      month: bill.month,
      peakPrice: bill.peakPrice,
      valleyPrice: bill.valleyPrice,
      flatPrice: bill.flatPrice,
      peakKwh: bill.peakKwh,
      valleyKwh: bill.valleyKwh,
      flatKwh: bill.flatKwh,
    })
    setModalOpen(true)
  }

  function handleSave() {
    if (!form.month) return
    if (editingId) {
      updateBill(editingId, form)
    } else {
      addBill(form)
    }
    setModalOpen(false)
  }

  function handleDelete() {
    if (deleteId) {
      removeBill(deleteId)
      setDeleteId(null)
    }
  }

  function updateField<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-slate-100">电费录入</h1>
        <button className="btn-primary flex items-center gap-2" onClick={openAdd}>
          <Plus size={16} />
          录入电费
        </button>
      </div>

      {sortedBills.length === 0 ? (
        <div className="glass-card p-12 flex flex-col items-center justify-center text-center">
          <Calendar size={48} className="text-slate-500 mb-4" />
          <p className="text-slate-400 text-lg mb-4">还没有录入电费单</p>
          <button className="btn-primary flex items-center gap-2" onClick={openAdd}>
            <Plus size={16} />
            录入第一笔
          </button>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-[23px] top-4 bottom-4 w-px bg-slate-700/60" />

          <div className="space-y-6">
            {sortedBills.map((bill) => {
              const total =
                calcSubtotal(bill.peakPrice, bill.peakKwh) +
                calcSubtotal(bill.valleyPrice, bill.valleyKwh) +
                calcSubtotal(bill.flatPrice, bill.flatKwh)

              return (
                <div key={bill.id} className="relative pl-14">
                  <div className="absolute left-4 top-6 w-4 h-4 rounded-full bg-amber-500 border-2 border-amber-300 shadow-lg shadow-amber-500/30 -translate-x-1/2 z-10" />

                  <div className="glass-card p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-slate-100">
                        {formatMonth(bill.month)}
                      </h3>
                      <div className="flex items-center gap-2">
                        <button
                          className="p-2 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-700/50 transition-colors"
                          onClick={() => openEdit(bill)}
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-700/50 transition-colors"
                          onClick={() => setDeleteId(bill.id)}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-4">
                      {SLOT_META.map((slot) => {
                        const price = bill[slot.priceKey]
                        const kwh = bill[slot.kwhKey]
                        const sub = calcSubtotal(price, kwh)
                        return (
                          <div key={slot.key} className={`${slot.bg} rounded-xl p-3`}>
                            <div className={`text-xs font-medium ${slot.color} mb-2`}>
                              {slot.label}
                            </div>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span className="text-slate-400">单价</span>
                                <span className={slot.color}>{price.toFixed(2)} 元</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">用量</span>
                                <span className="text-slate-200">{kwh} kWh</span>
                              </div>
                              <div className="flex justify-between pt-1 border-t border-slate-600/30">
                                <span className="text-slate-400">小计</span>
                                <span className="text-slate-100 font-medium">{sub.toFixed(2)} 元</span>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    <div className="flex justify-end pt-3 border-t border-slate-700/50">
                      <span className="text-slate-400 text-sm mr-2">月度总计</span>
                      <span className="text-amber-400 font-bold text-lg">
                        ¥{total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <AnimatePresence>
        {modalOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
            <motion.div
              className="glass-card p-6 w-full max-w-lg relative z-10"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              <h2 className="text-xl font-semibold text-slate-100 mb-5">
                {editingId ? "编辑电费单" : "录入电费单"}
              </h2>

              <div className="mb-5">
                <label className="block text-sm text-slate-400 mb-1.5">月份</label>
                <input
                  type="month"
                  value={form.month}
                  onChange={(e) => updateField("month", e.target.value)}
                  className="w-full bg-slate-800/80 border border-slate-600/50 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 transition-colors"
                />
              </div>

              <div className="grid grid-cols-3 gap-3 mb-6">
                {SLOT_META.map((slot) => (
                  <div key={slot.key} className={`${slot.bg} rounded-xl p-3`}>
                    <div className={`text-sm font-medium ${slot.color} mb-3`}>{slot.label}</div>
                    <div className="space-y-2">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">单价 (元/kWh)</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={form[slot.priceKey] || ""}
                          onChange={(e) => updateField(slot.priceKey, parseFloat(e.target.value) || 0)}
                          className="w-full bg-slate-900/60 border border-slate-600/40 rounded-lg px-3 py-1.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500/50 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">用量 (kWh)</label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          value={form[slot.kwhKey] || ""}
                          onChange={(e) => updateField(slot.kwhKey, parseFloat(e.target.value) || 0)}
                          className="w-full bg-slate-900/60 border border-slate-600/40 rounded-lg px-3 py-1.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500/50 transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3">
                <button className="btn-ghost" onClick={() => setModalOpen(false)}>
                  取消
                </button>
                <button className="btn-primary" onClick={handleSave}>
                  保存
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteId && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteId(null)} />
            <motion.div
              className="glass-card p-6 w-full max-w-sm relative z-10 text-center"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              <Trash2 size={32} className="text-red-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-slate-100 mb-2">确认删除</h3>
              <p className="text-slate-400 text-sm mb-5">删除后将无法恢复，确定要删除这条电费记录吗？</p>
              <div className="flex justify-center gap-3">
                <button className="btn-ghost" onClick={() => setDeleteId(null)}>
                  取消
                </button>
                <button
                  className="px-5 py-2.5 rounded-full font-medium text-sm bg-red-500/80 text-white hover:bg-red-500 transition-colors"
                  onClick={handleDelete}
                >
                  删除
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
