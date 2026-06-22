import { useState, useMemo } from "react"
import { useRowingStore, calcDesyncIndex, getDesyncLevel } from "@/store/rowingStore"
import { useNavigate } from "react-router-dom"
import StepIndicator from "@/components/StepIndicator"
import { Timer, Compass, TrendingDown, Megaphone, ChevronLeft, ChevronRight, BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils"

export default function SegmentRecordPage() {
  const { config, currentSegment, setCurrentSegment, records, saveRecord, finishSession } = useRowingStore()
  const navigate = useNavigate()

  const existing = records.find((r) => r.segmentIndex === currentSegment)

  const [entryTimeDiff, setEntryTimeDiff] = useState(existing?.entryTimeDiff ?? 0)
  const [yawAngle, setYawAngle] = useState(existing?.yawAngle ?? 0)
  const [yawDirection, setYawDirection] = useState<"左" | "右">(existing?.yawDirection ?? "左")
  const [sprintSpeedDrop, setSprintSpeedDrop] = useState(existing?.sprintSpeedDrop ?? 0)
  const [commandResponseTime, setCommandResponseTime] = useState(existing?.commandResponseTime ?? 0)

  const totalSegments = config.segments.length

  const desyncPreview = useMemo(
    () => calcDesyncIndex({ segmentIndex: currentSegment, entryTimeDiff, yawAngle, yawDirection, sprintSpeedDrop, commandResponseTime }),
    [currentSegment, entryTimeDiff, yawAngle, yawDirection, sprintSpeedDrop, commandResponseTime]
  )

  const desyncLevel = getDesyncLevel(desyncPreview)

  const handleSave = () => {
    saveRecord({ segmentIndex: currentSegment, entryTimeDiff, yawAngle, yawDirection, sprintSpeedDrop, commandResponseTime })
  }

  const goToSegment = (idx: number) => {
    handleSave()
    setCurrentSegment(idx)
    const rec = records.find((r) => r.segmentIndex === idx)
    setEntryTimeDiff(rec?.entryTimeDiff ?? 0)
    setYawAngle(rec?.yawAngle ?? 0)
    setYawDirection(rec?.yawDirection ?? "左")
    setSprintSpeedDrop(rec?.sprintSpeedDrop ?? 0)
    setCommandResponseTime(rec?.commandResponseTime ?? 0)
  }

  const handleFinish = () => {
    handleSave()
    finishSession()
    navigate("/analysis")
  }

  if (!config.boatId) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[var(--color-muted)] mb-4">请先完成训练配置</p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-2 rounded-lg bg-[var(--color-accent)] text-[var(--color-bg)] font-semibold text-sm"
          >
            返回配置
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <StepIndicator />

        <div className="animate-slide-up">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <span className="text-xs text-[var(--color-text-dim)] bg-[var(--color-surface)] px-3 py-1 rounded-full border border-[var(--color-border)]">
                {config.boatId}
              </span>
              <span className="text-xs text-[var(--color-muted)]">
                {config.seat1Name} & {config.seat2Name}
              </span>
            </div>
            <span className="text-xs text-[var(--color-text-dim)]">
              目标桨频 {config.targetStrokeRate} 次/分
            </span>
          </div>

          <div className="relative mb-6">
            <div className="h-2 bg-[var(--color-surface)] rounded-full overflow-hidden border border-[var(--color-border)]">
              <div
                className="h-full bg-[var(--color-accent)] rounded-full transition-all duration-500"
                style={{ width: `${((currentSegment + 1) / totalSegments) * 100}%` }}
              />
            </div>
            <div className="flex justify-between mt-2">
              {config.segments.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => goToSegment(idx)}
                  className={cn(
                    "w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center transition-all duration-200",
                    idx === currentSegment && "bg-[var(--color-accent)] text-[var(--color-bg)] scale-110",
                    idx !== currentSegment && records.some((r) => r.segmentIndex === idx) && "bg-[var(--color-accent-dim)] text-[var(--color-accent)] border border-[var(--color-accent)]",
                    idx !== currentSegment && !records.some((r) => r.segmentIndex === idx) && "bg-[var(--color-surface)] text-[var(--color-text-dim)] border border-[var(--color-border)]"
                  )}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>

          <div className="text-center mb-6">
            <h2 className="text-4xl font-extrabold mb-1" style={{ fontFamily: "Outfit" }}>
              第 <span className="text-[var(--color-accent)]">{currentSegment + 1}</span> 段
            </h2>
            <p className="text-sm text-[var(--color-muted)]">{config.segments[currentSegment]}米</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <MetricCard
              icon={<Timer className="w-4 h-4" />}
              label="入水时间差"
              unit="ms"
              value={entryTimeDiff}
              onChange={setEntryTimeDiff}
              highlight={desyncLevel === "danger" && entryTimeDiff > 50}
            />
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 hover:border-[var(--color-accent)]/30 transition-all">
              <div className="flex items-center gap-2 mb-3 text-[var(--color-accent)]">
                <Compass className="w-4 h-4" />
                <span className="text-sm font-semibold">左右偏航</span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="number"
                  value={yawAngle}
                  onChange={(e) => setYawAngle(Math.max(0, Number(e.target.value)))}
                  className="flex-1 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-[var(--color-text)] focus:outline-none focus:border-[var(--color-accent)] transition-colors text-sm"
                />
                <span className="text-xs text-[var(--color-muted)]">度</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setYawDirection("左")}
                  className={cn(
                    "flex-1 py-1.5 rounded-lg text-sm border transition-all",
                    yawDirection === "左"
                      ? "bg-[var(--color-accent-dim)] border-[var(--color-accent)] text-[var(--color-accent)]"
                      : "bg-[var(--color-bg)] border-[var(--color-border)] text-[var(--color-muted)]"
                  )}
                >
                  ← 左偏
                </button>
                <button
                  onClick={() => setYawDirection("右")}
                  className={cn(
                    "flex-1 py-1.5 rounded-lg text-sm border transition-all",
                    yawDirection === "右"
                      ? "bg-[var(--color-accent-dim)] border-[var(--color-accent)] text-[var(--color-accent)]"
                      : "bg-[var(--color-bg)] border-[var(--color-border)] text-[var(--color-muted)]"
                  )}
                >
                  右偏 →
                </button>
              </div>
              {yawAngle > 0 && (
                <div className="mt-3 flex justify-center">
                  <YawIndicator angle={yawAngle} direction={yawDirection} />
                </div>
              )}
            </div>
            <MetricCard
              icon={<TrendingDown className="w-4 h-4" />}
              label="冲刺掉速"
              unit="次/分"
              value={sprintSpeedDrop}
              onChange={setSprintSpeedDrop}
              highlight={desyncLevel === "danger" && sprintSpeedDrop > 5}
            />
            <MetricCard
              icon={<Megaphone className="w-4 h-4" />}
              label="口令响应"
              unit="ms"
              value={commandResponseTime}
              onChange={setCommandResponseTime}
              highlight={desyncLevel === "danger" && commandResponseTime > 300}
            />
          </div>

          <div className={cn(
            "bg-[var(--color-surface)] border rounded-xl p-5 mb-6 transition-all duration-300",
            desyncLevel === "good" && "border-[var(--color-good)]/40",
            desyncLevel === "caution" && "border-[var(--color-caution)]/40",
            desyncLevel === "danger" && "border-[var(--color-danger)]/40 warn-glow-border"
          )}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[var(--color-muted)] mb-1">实时不同步指数</p>
                <p className={cn(
                  "text-3xl font-extrabold",
                  desyncLevel === "good" && "text-[var(--color-good)]",
                  desyncLevel === "caution" && "text-[var(--color-caution)]",
                  desyncLevel === "danger" && "text-[var(--color-danger)]"
                )} style={{ fontFamily: "Outfit" }}>
                  {desyncPreview.toFixed(2)}
                </p>
              </div>
              <div className="text-right">
                <p className={cn(
                  "text-sm font-semibold",
                  desyncLevel === "good" && "text-[var(--color-good)]",
                  desyncLevel === "caution" && "text-[var(--color-caution)]",
                  desyncLevel === "danger" && "text-[var(--color-danger)]"
                )}>
                  {desyncLevel === "good" ? "同步良好" : desyncLevel === "caution" ? "需注意" : "严重不同步"}
                </p>
                <SyncRing value={desyncPreview} level={desyncLevel} />
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => goToSegment(currentSegment - 1)}
              disabled={currentSegment === 0}
              className={cn(
                "flex items-center gap-1 px-4 py-3 rounded-lg text-sm border transition-all",
                currentSegment === 0
                  ? "border-[var(--color-border)] text-[var(--color-text-dim)] cursor-not-allowed"
                  : "border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-accent)]"
              )}
            >
              <ChevronLeft className="w-4 h-4" />
              上一段
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-3 rounded-lg border border-[var(--color-accent)] text-[var(--color-accent)] font-semibold text-sm hover:bg-[var(--color-accent-dim)] transition-all"
            >
              保存当前段
            </button>
            {currentSegment < totalSegments - 1 ? (
              <button
                onClick={() => goToSegment(currentSegment + 1)}
                className="flex items-center gap-1 px-4 py-3 rounded-lg text-sm border border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-accent)] transition-all"
              >
                下一段
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleFinish}
                className="flex items-center gap-1 px-4 py-3 rounded-lg bg-[var(--color-accent)] text-[var(--color-bg)] font-semibold text-sm hover:shadow-[0_0_20px_rgba(0,212,170,0.4)] transition-all"
              >
                <BarChart3 className="w-4 h-4" />
                完成分析
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function MetricCard({
  icon, label, unit, value, onChange, highlight,
}: {
  icon: React.ReactNode
  label: string
  unit: string
  value: number
  onChange: (v: number) => void
  highlight: boolean
}) {
  return (
    <div className={cn(
      "bg-[var(--color-surface)] border rounded-xl p-4 transition-all hover:border-[var(--color-accent)]/30",
      highlight ? "border-[var(--color-warn)]/50" : "border-[var(--color-border)]"
    )}>
      <div className="flex items-center gap-2 mb-3 text-[var(--color-accent)]">
        {icon}
        <span className="text-sm font-semibold">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Math.max(0, Number(e.target.value)))}
          className="flex-1 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-[var(--color-text)] focus:outline-none focus:border-[var(--color-accent)] transition-colors text-sm"
        />
        <span className="text-xs text-[var(--color-muted)] min-w-[40px]">{unit}</span>
      </div>
    </div>
  )
}

function SyncRing({ value, level }: { value: number; level: "good" | "caution" | "danger" }) {
  const size = 52
  const stroke = 4
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const clampedVal = Math.min(value, 1.5)
  const offset = circumference - (clampedVal / 1.5) * circumference
  const color = level === "good" ? "var(--color-good)" : level === "caution" ? "var(--color-caution)" : "var(--color-danger)"

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--color-border)" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={radius} fill="none"
        stroke={color} strokeWidth={stroke}
        strokeDasharray={circumference} strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-500"
      />
    </svg>
  )
}

function YawIndicator({ angle, direction }: { angle: number; direction: "左" | "右" }) {
  const maxAngle = 15
  const clampedAngle = Math.min(angle, maxAngle)
  const rotation = direction === "左" ? -clampedAngle * 2 : clampedAngle * 2

  return (
    <svg width="80" height="40" viewBox="0 0 80 40">
      <line x1="10" y1="20" x2="70" y2="20" stroke="var(--color-border)" strokeWidth="1" strokeDasharray="4 2" />
      <line
        x1="40" y1="20" x2="40" y2="5"
        stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round"
        transform={`rotate(${rotation}, 40, 20)`}
      />
      <circle cx="40" cy="20" r="3" fill="var(--color-accent)" />
      <text x="40" y="36" textAnchor="middle" fill="var(--color-muted)" fontSize="8">
        {angle}°{direction}
      </text>
    </svg>
  )
}
