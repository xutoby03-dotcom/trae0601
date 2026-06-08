import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Edit2, Trash2 } from "lucide-react"
import { useStore } from "@/store/useStore"
import { APPLIANCE_ICONS } from "@/types"
import type { Appliance } from "@/types"

const EMPTY_FORM = {
  name: "",
  icon: "other",
  powerW: 1000,
  dailyHours: 1,
  canSchedule: false,
  mustDaytime: false,
}

type FormData = typeof EMPTY_FORM

export default function Appliances() {
  const appliances = useStore((s) => s.appliances)
  const addAppliance = useStore((s) => s.addAppliance)
  const updateAppliance = useStore((s) => s.updateAppliance)
  const removeAppliance = useStore((s) => s.removeAppliance)

  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormData>(EMPTY_FORM)
  const [deleteTarget, setDeleteTarget] = useState<Appliance | null>(null)

  function openAdd() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setModalOpen(true)
  }

  function openEdit(app: Appliance) {
    setEditingId(app.id)
    setForm({
      name: app.name,
      icon: app.icon,
      powerW: app.powerW,
      dailyHours: app.dailyHours,
      canSchedule: app.canSchedule,
      mustDaytime: app.mustDaytime,
    })
    setModalOpen(true)
  }

  function handleSave() {
    if (!form.name.trim()) return
    if (editingId) {
      updateAppliance(editingId, form)
    } else {
      addAppliance(form)
    }
    setModalOpen(false)
  }

  function confirmDelete() {
    if (deleteTarget) {
      removeAppliance(deleteTarget.id)
      setDeleteTarget(null)
    }
  }

  function getEmoji(iconValue: string) {
    return APPLIANCE_ICONS.find((i) => i.value === iconValue)?.emoji ?? "⚙️"
  }

  return (
    <div className="min-h-screen px-4 py-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">电器管理</h1>
          <p className="text-sm text-slate-400 mt-1">管理您的家用电器和用电信息</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          添加电器
        </button>
      </div>

      {appliances.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-24"
        >
          <div className="text-7xl mb-6">🏠</div>
          <p className="text-lg text-slate-400 mb-6">还没有添加电器</p>
          <button onClick={openAdd} className="btn-primary flex items-center gap-2">
            <Plus size={18} />
            添加第一个电器
          </button>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
        >
          <AnimatePresence>
            {appliances.map((app) => (
              <motion.div
                key={app.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="glass-card p-4 flex flex-col relative group"
              >
                <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEdit(app)}
                    className="p-1.5 rounded-lg bg-slate-700/60 hover:bg-slate-600/80 text-slate-300 hover:text-white transition-colors"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(app)}
                    className="p-1.5 rounded-lg bg-slate-700/60 hover:bg-red-500/40 text-slate-300 hover:text-red-300 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="text-4xl mb-3">{getEmoji(app.icon)}</div>

                <h3 className="text-sm font-medium text-white truncate mb-2">
                  {app.name}
                </h3>

                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-2xl font-bold text-amber-400">
                    {app.powerW}
                  </span>
                  <span className="text-xs text-slate-400">W</span>
                </div>

                <div className="text-xs text-slate-400 mb-3">
                  每日 {app.dailyHours} 小时
                </div>

                <div className="flex flex-wrap gap-1.5 mt-auto">
                  {app.canSchedule && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                      可预约
                    </span>
                  )}
                  {app.mustDaytime && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      需白天
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Add / Edit Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="glass-card w-full max-w-md p-6 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-lg font-bold text-white mb-5">
                {editingId ? "编辑电器" : "添加电器"}
              </h2>

              <div className="space-y-5">
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">名称</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="如：客厅空调"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800/80 border border-slate-600/40 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/30 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">图标</label>
                  <div className="grid grid-cols-6 gap-2">
                    {APPLIANCE_ICONS.map((ic) => (
                      <button
                        key={ic.value}
                        onClick={() => setForm((f) => ({ ...f, icon: ic.value }))}
                        className={`flex flex-col items-center gap-0.5 p-2 rounded-xl transition-all ${
                          form.icon === ic.value
                            ? "bg-amber-500/20 border border-amber-500/50 ring-1 ring-amber-500/30"
                            : "bg-slate-800/50 border border-slate-700/40 hover:bg-slate-700/50"
                        }`}
                      >
                        <span className="text-xl">{ic.emoji}</span>
                        <span className="text-[9px] text-slate-400 truncate w-full text-center">
                          {ic.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">
                    功率 <span className="text-amber-400 font-medium">{form.powerW}W</span>
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={10000}
                    step={50}
                    value={form.powerW}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, powerW: Number(e.target.value) }))
                    }
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-slate-700 accent-amber-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>0W</span>
                    <span>10000W</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">功率精确值 (W)</label>
                  <input
                    type="number"
                    min={0}
                    max={50000}
                    value={form.powerW}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, powerW: Number(e.target.value) || 0 }))
                    }
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800/80 border border-slate-600/40 text-white text-sm focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/30 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">每日使用时长</label>
                  <input
                    type="number"
                    min={0}
                    max={24}
                    step={0.5}
                    value={form.dailyHours}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, dailyHours: Number(e.target.value) || 0 }))
                    }
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800/80 border border-slate-600/40 text-white text-sm focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/30 transition-colors"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm text-white">可预约</span>
                    <p className="text-[10px] text-slate-500">该电器可以错峰运行</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, canSchedule: !f.canSchedule }))}
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      form.canSchedule ? "bg-green-500" : "bg-slate-600"
                    }`}
                  >
                    <motion.div
                      layout
                      className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow"
                      style={{ left: form.canSchedule ? 22 : 2 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm text-white">需白天</span>
                    <p className="text-[10px] text-slate-500">该电器必须在白天时段运行</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, mustDaytime: !f.mustDaytime }))}
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      form.mustDaytime ? "bg-amber-500" : "bg-slate-600"
                    }`}
                  >
                    <motion.div
                      layout
                      className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow"
                      style={{ left: form.mustDaytime ? 22 : 2 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  </button>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setModalOpen(false)} className="btn-ghost flex-1">
                  取消
                </button>
                <button onClick={handleSave} className="btn-primary flex-1">
                  保存
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setDeleteTarget(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              className="glass-card p-6 w-full max-w-sm text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-5xl mb-4">🗑️</div>
              <h3 className="text-lg font-bold text-white mb-2">确认删除</h3>
              <p className="text-sm text-slate-400 mb-6">
                确定要删除「{deleteTarget.name}」吗？此操作不可撤销。
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="btn-ghost flex-1"
                >
                  取消
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-5 py-2.5 rounded-full font-medium text-sm bg-red-500/80 hover:bg-red-500 text-white transition-colors"
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
