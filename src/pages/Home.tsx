import { useRef, useMemo, useState } from "react"
import { DndContext, DragEndEvent, DragStartEvent, useDraggable, DragOverlay } from "@dnd-kit/core"
import { motion, AnimatePresence } from "framer-motion"
import { AlertTriangle, X, Zap, TrendingDown, Clock } from "lucide-react"
import { useStore } from "@/store/useStore"
import { getTimeSlotForHour, getSlotLabel, getSlotColor, APPLIANCE_ICONS, type TimeSlotType } from "@/types"
import { calcDailyCost, calcOptimalCost, calcSavings, generateAlerts } from "@/utils/calc"
import type { Appliance, ApplianceSchedule, Bill } from "@/types"

const HOURS = Array.from({ length: 24 }, (_, i) => i)

const SLOT_CARD: Record<TimeSlotType, string> = {
  peak: "bg-red-500/25 border-red-400/40 text-red-300",
  valley: "bg-green-500/25 border-green-400/40 text-green-300",
  flat: "bg-blue-500/25 border-blue-400/40 text-blue-300",
}

const SLOT_DOT: Record<TimeSlotType, string> = {
  peak: "bg-red-400",
  valley: "bg-green-400",
  flat: "bg-blue-400",
}

const ALERT_STYLES = {
  danger: "bg-red-500/15 border-red-500/30 text-red-300",
  warning: "bg-amber-500/15 border-amber-500/30 text-amber-300",
  info: "bg-blue-500/15 border-blue-500/30 text-blue-300",
}

function ApplianceCard({ app, schedule, bill }: { app: Appliance; schedule: ApplianceSchedule; bill: Bill | null }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: `app-${app.id}` })
  const slot = getTimeSlotForHour(schedule.startHour)
  const emoji = APPLIANCE_ICONS.find(i => i.value === app.icon)?.emoji ?? "⚙️"
  const cost = calcDailyCost(app, schedule, bill)
  const span = Math.min(app.dailyHours, 24 - schedule.startHour)

  return (
    <motion.div
      ref={setNodeRef}
      style={{ gridColumn: `${schedule.startHour + 1} / span ${span}` }}
      {...listeners}
      {...attributes}
      className={`${SLOT_CARD[slot]} border rounded-lg px-2 py-1.5 flex items-center gap-1.5 cursor-grab active:cursor-grabbing select-none ${isDragging ? "opacity-30" : "z-10"}`}
      layout
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <span className="text-sm">{emoji}</span>
      <span className="text-[11px] font-medium truncate">{app.name}</span>
      <span className="text-[10px] opacity-70 ml-auto whitespace-nowrap">¥{cost.toFixed(2)}</span>
    </motion.div>
  )
}

function AlertBanner({ alert, onDismiss }: { alert: { id: string; type: "danger" | "warning" | "info"; message: string }; onDismiss: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`${ALERT_STYLES[alert.type]} border rounded-xl px-4 py-3 flex items-center gap-3`}
    >
      <AlertTriangle size={16} className="shrink-0" />
      <span className="text-sm flex-1">{alert.message}</span>
      <button onClick={onDismiss} className="opacity-60 hover:opacity-100 transition-opacity">
        <X size={14} />
      </button>
    </motion.div>
  )
}

export default function Home() {
  const { appliances, schedules, bills, dismissedAlerts, moveSchedule, dismissAlert } = useStore()
  const gridRef = useRef<HTMLDivElement>(null)
  const [activeId, setActiveId] = useState<string | null>(null)
  const latestBill = bills.length > 0 ? bills[bills.length - 1] : null

  const alerts = useMemo(
    () => generateAlerts(appliances, schedules, latestBill).filter(a => !dismissedAlerts.includes(a.id)),
    [appliances, schedules, latestBill, dismissedAlerts]
  )

  const { totalDailyCost, totalOptimalCost } = useMemo(() => {
    const daily = appliances.reduce((sum, app) => {
      const s = schedules.find(sc => sc.applianceId === app.id)
      return sum + (s ? calcDailyCost(app, s, latestBill) : 0)
    }, 0)
    const optimal = appliances.reduce((sum, app) => sum + calcOptimalCost(app, latestBill).cost, 0)
    return { totalDailyCost: daily, totalOptimalCost: optimal }
  }, [appliances, schedules, latestBill])

  const monthlySavings = Math.max(0, (totalDailyCost - totalOptimalCost) * 30)

  const handleDragStart = (event: DragStartEvent) => setActiveId(String(event.active.id))

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event
    setActiveId(null)
    const applianceId = String(active.id).replace("app-", "")
    const schedule = schedules.find(s => s.applianceId === applianceId)
    if (!schedule || !gridRef.current) return
    const hourWidth = gridRef.current.scrollWidth / 24
    const hoursMoved = Math.round(delta.x / hourWidth)
    const newHour = Math.max(0, Math.min(23, schedule.startHour + hoursMoved))
    if (newHour !== schedule.startHour) moveSchedule(applianceId, newHour)
  }

  const activeApp = activeId ? appliances.find(a => `app-${a.id}` === activeId) : null
  const activeSchedule = activeApp ? schedules.find(s => s.applianceId === activeApp.id) : null

  return (
    <div className="p-6 space-y-5 h-full flex flex-col overflow-hidden">
      <AnimatePresence>
        {alerts.map(a => (
          <AlertBanner key={a.id} alert={a} onDismiss={() => dismissAlert(a.id)} />
        ))}
      </AnimatePresence>

      <div className="flex gap-6 flex-1 min-h-0">
        <div className="flex-1 glass-card p-5 overflow-x-auto flex flex-col">
          <div className="flex items-center gap-2 mb-4 shrink-0">
            <Clock size={18} className="text-amber-400" />
            <h2 className="text-lg font-bold text-white">24小时时间轴</h2>
            <div className="ml-auto flex gap-4 text-xs">
              {(["peak", "valley", "flat"] as const).map(s => (
                <span key={s} className={`${getSlotColor(s)} flex items-center gap-1.5`}>
                  <span className={`w-2 h-2 rounded-full ${SLOT_DOT[s]}`} />
                  {getSlotLabel(s)}
                </span>
              ))}
            </div>
          </div>

          {appliances.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-slate-500">
              <div className="text-center">
                <Zap size={32} className="mx-auto mb-2 opacity-40" />
                <p className="text-sm">暂无电器，请先添加电器</p>
              </div>
            </div>
          ) : (
            <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
              <div ref={gridRef}>
                <div className="grid mb-1" style={{ gridTemplateColumns: "repeat(24, minmax(48px, 1fr))" }}>
                  {HOURS.map(h => (
                    <div key={h} className={`text-center text-[10px] ${getSlotColor(getTimeSlotForHour(h))} pb-1 font-medium`}>
                      {h}
                    </div>
                  ))}
                </div>
                <div className="space-y-1.5">
                  {appliances.map(app => {
                    const schedule = schedules.find(s => s.applianceId === app.id)
                    if (!schedule) return null
                    return (
                      <div key={app.id} className="grid relative" style={{ gridTemplateColumns: "repeat(24, minmax(48px, 1fr))" }}>
                        {HOURS.map(h => (
                          <div key={h} className={`slot-${getTimeSlotForHour(h)} h-10`} />
                        ))}
                        <ApplianceCard app={app} schedule={schedule} bill={latestBill} />
                      </div>
                    )
                  })}
                </div>
              </div>
              <DragOverlay dropAnimation={{ duration: 200 }}>
                {activeApp && activeSchedule ? (
                  <div className={`${SLOT_CARD[getTimeSlotForHour(activeSchedule.startHour)]} border rounded-lg px-3 py-2 shadow-2xl flex items-center gap-2 whitespace-nowrap`}>
                    <span>{APPLIANCE_ICONS.find(i => i.value === activeApp.icon)?.emoji ?? "⚙️"}</span>
                    <span className="text-sm font-medium">{activeApp.name}</span>
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          )}
        </div>

        <div className="w-72 shrink-0 space-y-4 overflow-y-auto">
          <div className="glass-card p-5 glow-amber">
            <div className="flex items-center gap-2 mb-4">
              <TrendingDown size={18} className="text-amber-400" />
              <h3 className="font-bold text-white">节省估算</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">当前日费用</span>
                <span className="text-lg font-bold text-white">¥{totalDailyCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">最优日费用</span>
                <span className="text-lg font-bold text-green-400">¥{totalOptimalCost.toFixed(2)}</span>
              </div>
              <div className="h-px bg-slate-700/50" />
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">月节省潜力</span>
                <span className="text-2xl font-bold text-amber-400">¥{monthlySavings.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="glass-card p-5">
            <h3 className="font-bold text-white mb-3">电器明细</h3>
            <div className="space-y-2">
              {appliances.map(app => {
                const schedule = schedules.find(s => s.applianceId === app.id)
                if (!schedule) return null
                const cost = calcDailyCost(app, schedule, latestBill)
                const saving = calcSavings(app, schedule, latestBill)
                const optimal = calcOptimalCost(app, latestBill)
                const emoji = APPLIANCE_ICONS.find(i => i.value === app.icon)?.emoji ?? "⚙️"
                return (
                  <motion.div key={app.id} className="glass-card-sm p-3 flex items-center gap-2" layout>
                    <span className="text-base">{emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-200 truncate">{app.name}</p>
                      <p className="text-[10px] text-slate-500">¥{cost.toFixed(2)}/天 · 最优{getSlotLabel(optimal.slot)}</p>
                    </div>
                    {saving > 0 && (
                      <span className="text-xs font-bold text-green-400 whitespace-nowrap">-¥{(saving * 30).toFixed(0)}/月</span>
                    )}
                  </motion.div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
