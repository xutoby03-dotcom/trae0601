import { useState } from "react"
import { usePassengerStore } from "@/store/passengerStore"
import type { Passenger, Language, PassengerStatus } from "@/types"
import { WELCOME_MAP, LANGUAGE_LABELS } from "@/types"
import {
  Plus,
  Trash2,
  AlertTriangle,
  UserCheck,
  Edit3,
  X,
  Check,
  Clock,
  Plane,
  LogOut,
} from "lucide-react"

interface FormState {
  name: string
  flightNumber: string
  arrivalGate: string
  language: Language
  landingTime: string
  phone: string
  parkingNote: string
}

const emptyForm: FormState = {
  name: "",
  flightNumber: "",
  arrivalGate: "",
  language: "zh",
  landingTime: "",
  phone: "",
  parkingNote: "",
}

const STATUS_CONFIG: Record<
  PassengerStatus,
  { label: string; color: string; bg: string }
> = {
  waiting: { label: "等待中", color: "text-blue-400", bg: "bg-blue-500/20" },
  delayed: { label: "延误", color: "text-yellow-400", bg: "bg-yellow-500/20" },
  picked_up: { label: "已接", color: "text-[#00C48C]", bg: "bg-[#00C48C]/20" },
}

export default function PassengerManager() {
  const { passengers, addPassenger, updatePassenger, removePassenger, setStatus } =
    usePassengerStore()

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [errors, setErrors] = useState<{ landingTime?: string }>({})

  const sortedPassengers = [...passengers].sort((a, b) => {
    if (a.status === "picked_up" && b.status !== "picked_up") return 1
    if (a.status !== "picked_up" && b.status === "picked_up") return -1
    if (a.status === "delayed" && b.status !== "delayed") return 1
    if (a.status !== "delayed" && b.status === "delayed") return -1
    return new Date(a.landingTime).getTime() - new Date(b.landingTime).getTime()
  })

  const handleSubmit = () => {
    const newErrors: { landingTime?: string } = {}
    if (!form.landingTime) {
      newErrors.landingTime = "请选择航班落地时间"
    } else if (isNaN(new Date(form.landingTime).getTime())) {
      newErrors.landingTime = "落地时间格式无效"
    }
    if (!form.name || !form.flightNumber) {
      setErrors(newErrors)
      return
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    setErrors({})
    if (editingId) {
      updatePassenger(editingId, form)
      setEditingId(null)
    } else {
      addPassenger({ ...form, status: "waiting", delayMinutes: 0 })
    }
    setForm(emptyForm)
    setShowForm(false)
  }

  const startEdit = (p: Passenger) => {
    setEditingId(p.id)
    setForm({
      name: p.name,
      flightNumber: p.flightNumber,
      arrivalGate: p.arrivalGate,
      language: p.language,
      landingTime: p.landingTime,
      phone: p.phone,
      parkingNote: p.parkingNote,
    })
    setShowForm(true)
  }

  const cancelForm = () => {
    setShowForm(false)
    setEditingId(null)
    setForm(emptyForm)
    setErrors({})
  }

  const formatTime = (iso: string) => {
    if (!iso) return "--:--"
    return new Date(iso).toLocaleTimeString("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatDate = (iso: string) => {
    if (!iso) return ""
    return new Date(iso).toLocaleDateString("zh-CN", {
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="min-h-screen bg-[#0A1628] text-white">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">乘客管理</h1>
            <p className="text-[#8B9CB6] text-sm mt-1">
              共 {passengers.length} 位乘客，{passengers.filter((p) => p.status !== "picked_up").length} 位待接
            </p>
          </div>
          <div className="flex gap-3">
            <a
              href="/"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 transition-colors text-sm"
            >
              <LogOut className="w-4 h-4" />
              返回大屏
            </a>
            <button
              onClick={() => {
                setForm(emptyForm)
                setEditingId(null)
                setShowForm(true)
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FF6B2B] hover:bg-[#e55d22] transition-colors text-sm font-semibold"
            >
              <Plus className="w-4 h-4" />
              添加乘客
            </button>
          </div>
        </div>

        {sortedPassengers.length === 0 ? (
          <div className="text-center py-20">
            <Plane className="w-16 h-16 text-[#8B9CB6]/30 mx-auto mb-4" />
            <p className="text-[#8B9CB6] text-lg">暂无乘客信息</p>
            <p className="text-[#8B9CB6]/60 text-sm mt-1">点击上方按钮添加第一位乘客</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedPassengers.map((p) => {
              const statusCfg = STATUS_CONFIG[p.status]
              return (
                <div
                  key={p.id}
                  className={`rounded-2xl p-5 border transition-all duration-300 ${
                    p.status === "picked_up"
                      ? "bg-white/[0.02] border-white/5 opacity-50"
                      : "bg-[#0F2035] border-white/10"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xl font-bold">{p.name}</span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusCfg.bg} ${statusCfg.color}`}
                        >
                          {statusCfg.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-[#8B9CB6] text-sm">
                        <span className="flex items-center gap-1">
                          <Plane className="w-3.5 h-3.5" />
                          {p.flightNumber}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {formatDate(p.landingTime)} {formatTime(p.landingTime)}
                        </span>
                        <span>到达口 {p.arrivalGate}</span>
                      </div>
                      {(p.phone || p.parkingNote) && (
                        <div className="flex items-center gap-4 mt-2 text-[#8B9CB6]/70 text-xs">
                          {p.phone && <span>📞 {p.phone}</span>}
                          {p.parkingNote && <span>🅿️ {p.parkingNote}</span>}
                        </div>
                      )}
                      <div className="mt-2 text-[#8B9CB6]/50 text-xs">
                        {WELCOME_MAP[p.language]} · {LANGUAGE_LABELS[p.language]}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {p.status !== "picked_up" && (
                        <>
                          {p.status !== "delayed" && (
                            <button
                              onClick={() => setStatus(p.id, "delayed")}
                              className="p-2 rounded-lg bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 transition-colors"
                              title="标记延误"
                            >
                              <AlertTriangle className="w-4 h-4" />
                            </button>
                          )}
                          {p.status === "delayed" && (
                            <button
                              onClick={() => setStatus(p.id, "waiting")}
                              className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors"
                              title="取消延误"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => setStatus(p.id, "picked_up")}
                            className="p-2 rounded-lg bg-[#00C48C]/10 text-[#00C48C] hover:bg-[#00C48C]/20 transition-colors"
                            title="已接到"
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      {p.status === "picked_up" && (
                        <button
                          onClick={() => setStatus(p.id, "waiting")}
                          className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors"
                          title="恢复等待"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => startEdit(p)}
                        className="p-2 rounded-lg bg-white/5 text-white hover:bg-white/10 transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removePassenger(p.id)}
                        className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={cancelForm}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative bg-[#0F2035] border-t border-white/10 rounded-t-3xl p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto animate-[slideUp_0.3s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">
                {editingId ? "编辑乘客" : "添加乘客"}
              </h2>
              <button
                onClick={cancelForm}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#8B9CB6] text-sm mb-1.5">乘客姓名 *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/20 focus:border-[#FF6B2B] focus:outline-none transition-colors"
                    placeholder="输入姓名"
                  />
                </div>
                <div>
                  <label className="block text-[#8B9CB6] text-sm mb-1.5">航班号 *</label>
                  <input
                    type="text"
                    value={form.flightNumber}
                    onChange={(e) => setForm({ ...form, flightNumber: e.target.value.toUpperCase() })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/20 focus:border-[#FF6B2B] focus:outline-none transition-colors"
                    placeholder="如 CA1234"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#8B9CB6] text-sm mb-1.5">到达口</label>
                  <input
                    type="text"
                    value={form.arrivalGate}
                    onChange={(e) => setForm({ ...form, arrivalGate: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/20 focus:border-[#FF6B2B] focus:outline-none transition-colors"
                    placeholder="如 T3-B12"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[#8B9CB6] text-sm">落地时间 *</label>
                    {errors.landingTime && (
                      <span className="flex items-center gap-1 text-red-400 text-xs font-medium animate-[fadeInScale_0.2s_ease-out]">
                        {errors.landingTime}
                      </span>
                    )}
                  </div>
                  <input
                    type="datetime-local"
                    value={form.landingTime}
                    onChange={(e) => {
                      setForm({ ...form, landingTime: e.target.value })
                      if (errors.landingTime) setErrors({})
                    }}
                    className={`w-full px-4 py-3 rounded-xl text-white focus:outline-none transition-colors [color-scheme:dark] ${
                      errors.landingTime
                        ? "bg-red-500/10 border-2 border-red-500/60 focus:border-red-400"
                        : "bg-white/5 border border-white/10 focus:border-[#FF6B2B]"
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#8B9CB6] text-sm mb-1.5">欢迎语言</label>
                <div className="flex gap-2 flex-wrap">
                  {(Object.keys(LANGUAGE_LABELS) as Language[]).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setForm({ ...form, language: lang })}
                      className={`px-4 py-2 rounded-xl text-sm transition-colors ${
                        form.language === lang
                          ? "bg-[#FF6B2B] text-white"
                          : "bg-white/5 text-[#8B9CB6] hover:bg-white/10"
                      }`}
                    >
                      {LANGUAGE_LABELS[lang]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[#8B9CB6] text-sm mb-1.5">联系电话</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/20 focus:border-[#FF6B2B] focus:outline-none transition-colors"
                  placeholder="乘客手机号码"
                />
              </div>

              <div>
                <label className="block text-[#8B9CB6] text-sm mb-1.5">停车位置备注</label>
                <input
                  type="text"
                  value={form.parkingNote}
                  onChange={(e) => setForm({ ...form, parkingNote: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/20 focus:border-[#FF6B2B] focus:outline-none transition-colors"
                  placeholder="如 B2-156号车位"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={cancelForm}
                className="flex-1 py-3.5 rounded-xl bg-white/10 text-white font-semibold hover:bg-white/15 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSubmit}
                disabled={!form.name || !form.flightNumber}
                className="flex-1 py-3.5 rounded-xl bg-[#FF6B2B] text-white font-semibold hover:bg-[#e55d22] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {editingId ? "保存修改" : "添加乘客"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
