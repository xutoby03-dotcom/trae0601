import { useMemo } from "react"
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { motion } from "framer-motion"
import { useStore } from "@/store/useStore"
import { APPLIANCE_ICONS, getSlotLabel } from "@/types"
import { calcDailyKwh, getOptimizationList } from "@/utils/calc"

const COLORS = { peak: "#ef4444", valley: "#22c55e", flat: "#3b82f6" }

const SLOT_BADGE: Record<string, string> = {
  peak: "bg-red-500/20 border border-red-500/30 text-red-400",
  valley: "bg-green-500/20 border border-green-500/30 text-green-400",
  flat: "bg-blue-500/20 border border-blue-500/30 text-blue-400",
}

function getEmoji(iconValue: string) {
  return APPLIANCE_ICONS.find(i => i.value === iconValue)?.emoji ?? "⚙️"
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.12, duration: 0.4 },
  }),
}

export default function Stats() {
  const appliances = useStore(s => s.appliances)
  const schedules = useStore(s => s.schedules)
  const bills = useStore(s => s.bills)

  const latestBill = bills.length > 0 ? bills[bills.length - 1] : null

  const pieData = useMemo(() => {
    if (!latestBill) return []
    return [
      { name: "峰电", value: latestBill.peakKwh, slot: "peak" as const },
      { name: "谷电", value: latestBill.valleyKwh, slot: "valley" as const },
      { name: "平电", value: latestBill.flatKwh, slot: "flat" as const },
    ].filter(d => d.value > 0)
  }, [latestBill])

  const totalKwh = useMemo(() => pieData.reduce((s, d) => s + d.value, 0), [pieData])

  const barData = useMemo(() => {
    return appliances
      .map(app => {
        const kwh = calcDailyKwh(app) * 30
        return { name: app.name, kwh: Math.round(kwh * 100) / 100, icon: app.icon }
      })
      .sort((a, b) => b.kwh - a.kwh)
  }, [appliances])

  const optList = useMemo(
    () => getOptimizationList(appliances, schedules, latestBill),
    [appliances, schedules, latestBill],
  )

  return (
    <div className="p-8 space-y-8">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-bold text-white"
      >
        📊 用电统计
      </motion.h1>

      {/* Peak/Valley Pie */}
      <motion.section custom={0} variants={fadeUp} initial="hidden" animate="visible">
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-amber-400 mb-4">峰谷平用电占比</h2>
          {pieData.length === 0 ? (
            <EmptyHint text="暂无电费单数据" />
          ) : (
            <div className="flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    dataKey="value"
                    stroke="none"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map(d => (
                      <Cell key={d.slot} fill={COLORS[d.slot]} />
                    ))}
                  </Pie>
                  <Legend
                    formatter={(value: string) => <span className="text-slate-300 text-sm">{value}</span>}
                  />
                  <Tooltip
                    contentStyle={{ background: "#1e293b", border: "1px solid rgba(148,163,184,0.15)", borderRadius: 10 }}
                    itemStyle={{ color: "#e2e8f0" }}
                    formatter={(v: number) => [`${v} kWh`, ""]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ top: -20 }}>
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-bold text-white">{totalKwh.toFixed(0)}</span>
                  <span className="text-xs text-slate-400">kWh</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.section>

      {/* Bar Chart */}
      <motion.section custom={1} variants={fadeUp} initial="hidden" animate="visible">
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-amber-400 mb-4">月度耗电排行</h2>
          {barData.length === 0 ? (
            <EmptyHint text="暂无电器数据" />
          ) : (
            <ResponsiveContainer width="100%" height={barData.length * 44 + 40}>
              <BarChart data={barData} layout="vertical" margin={{ left: 10 }}>
                <XAxis type="number" tick={{ fill: "#94a3b8", fontSize: 12 }} unit=" kWh" />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={80}
                  tick={{ fill: "#e2e8f0", fontSize: 13 }}
                />
                <Tooltip
                  contentStyle={{ background: "#1e293b", border: "1px solid rgba(148,163,184,0.15)", borderRadius: 10 }}
                  itemStyle={{ color: "#e2e8f0" }}
                  formatter={(v: number) => [`${v} kWh`, "月耗电"]}
                />
                <Bar dataKey="kwh" radius={[0, 6, 6, 0]} fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </motion.section>

      {/* Optimization Checklist */}
      <motion.section custom={2} variants={fadeUp} initial="hidden" animate="visible">
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-amber-400 mb-4">⚡ 优化建议</h2>
          {optList.length === 0 ? (
            <EmptyHint text={latestBill ? "当前时段已最优，无需调整" : "暂无电费单数据"} />
          ) : (
            <div className="space-y-3">
              {optList.map((item, idx) => (
                <motion.div
                  key={item.appliance.id}
                  custom={idx}
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  className="glass-card-sm p-4 flex items-center gap-4"
                >
                  <span className="text-2xl">{getEmoji(item.appliance.icon)}</span>
                  <span className="text-sm text-white font-medium min-w-[80px]">{item.appliance.name}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${SLOT_BADGE[item.currentSlot]}`}>
                    {getSlotLabel(item.currentSlot)} {item.currentStartHour}时
                  </span>
                  <span className="text-slate-500">→</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${SLOT_BADGE[item.suggestedSlot]}`}>
                    {getSlotLabel(item.suggestedSlot)} {item.suggestedStartHour}时
                  </span>
                  <span className="ml-auto text-green-400 font-semibold text-sm">
                    省 ¥{item.monthlySaving.toFixed(1)}/月
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.section>
    </div>
  )
}

function EmptyHint({ text }: { text: string }) {
  return (
    <div className="py-12 text-center text-slate-500 text-sm">{text}</div>
  )
}
