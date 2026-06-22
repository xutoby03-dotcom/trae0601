import { useRowingStore, type WaterDirection, type WindSpeed, type WindDirection } from "@/store/rowingStore"
import { useNavigate } from "react-router-dom"
import StepIndicator from "@/components/StepIndicator"
import { Ship, Users, Gauge, Route, Waves, Wind, Plus, Trash2, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

const waterOptions: WaterDirection[] = ["顺流", "逆流", "侧流"]
const windSpeedOptions: WindSpeed[] = ["无风", "微风", "中风", "强风"]
const windDirOptions: WindDirection[] = ["顺风", "逆风", "侧风", "无风"]

export default function TrainingConfigPage() {
  const { config, setConfig, addSegment, removeSegment, updateSegment, startSession, resetConfig } = useRowingStore()
  const navigate = useNavigate()

  const canProceed = config.boatId.trim() && config.seat1Name.trim() && config.seat2Name.trim() && config.segments.length > 0

  const handleProceed = () => {
    startSession()
    navigate("/record")
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="text-center mb-10 animate-slide-up">
          <h1 className="text-3xl font-extrabold tracking-tight mb-2" style={{ fontFamily: "Outfit" }}>
            桨频同步训练
          </h1>
          <p className="text-[var(--color-muted)] text-sm">双人艇专项训练记录与分析</p>
        </div>

        <StepIndicator />

        <div className="space-y-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <Card icon={<Ship className="w-4 h-4" />} title="艇号">
            <input
              type="text"
              value={config.boatId}
              onChange={(e) => setConfig({ boatId: e.target.value })}
              placeholder="例如 B-01"
              className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-4 py-2.5 text-[var(--color-text)] placeholder:text-[var(--color-text-dim)] focus:outline-none focus:border-[var(--color-accent)] transition-colors"
            />
          </Card>

          <Card icon={<Users className="w-4 h-4" />} title="队员座位">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-[var(--color-muted)] mb-1.5 block">1号位（领桨）</label>
                <input
                  type="text"
                  value={config.seat1Name}
                  onChange={(e) => setConfig({ seat1Name: e.target.value })}
                  placeholder="姓名"
                  className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-4 py-2.5 text-[var(--color-text)] placeholder:text-[var(--color-text-dim)] focus:outline-none focus:border-[var(--color-accent)] transition-colors"
                />
              </div>
              <div>
                <label className="text-xs text-[var(--color-muted)] mb-1.5 block">2号位（跟桨）</label>
                <input
                  type="text"
                  value={config.seat2Name}
                  onChange={(e) => setConfig({ seat2Name: e.target.value })}
                  placeholder="姓名"
                  className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-4 py-2.5 text-[var(--color-text)] placeholder:text-[var(--color-text-dim)] focus:outline-none focus:border-[var(--color-accent)] transition-colors"
                />
              </div>
            </div>
          </Card>

          <Card icon={<Gauge className="w-4 h-4" />} title="目标桨频">
            <div className="flex items-center gap-4">
              <input
                type="range"
                min={18}
                max={42}
                step={1}
                value={config.targetStrokeRate}
                onChange={(e) => setConfig({ targetStrokeRate: Number(e.target.value) })}
                className="flex-1 accent-[var(--color-accent)]"
              />
              <div className="flex items-baseline gap-1 min-w-[80px] justify-end">
                <span className="text-2xl font-bold text-[var(--color-accent)]" style={{ fontFamily: "Outfit" }}>
                  {config.targetStrokeRate}
                </span>
                <span className="text-xs text-[var(--color-muted)]">次/分</span>
              </div>
            </div>
          </Card>

          <Card icon={<Route className="w-4 h-4" />} title="分段距离">
            <div className="space-y-2">
              {config.segments.map((dist, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <span className="text-xs text-[var(--color-text-dim)] w-8 text-right">第{idx + 1}段</span>
                  <input
                    type="number"
                    value={dist}
                    onChange={(e) => updateSegment(idx, Math.max(0, Number(e.target.value)))}
                    className="flex-1 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-4 py-2 text-[var(--color-text)] focus:outline-none focus:border-[var(--color-accent)] transition-colors"
                  />
                  <span className="text-xs text-[var(--color-muted)]">米</span>
                  {config.segments.length > 1 && (
                    <button
                      onClick={() => removeSegment(idx)}
                      className="p-1.5 text-[var(--color-text-dim)] hover:text-[var(--color-warn)] transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={addSegment}
                className="flex items-center gap-2 text-sm text-[var(--color-accent)] hover:text-[var(--color-text)] transition-colors mt-2"
              >
                <Plus className="w-4 h-4" />
                添加分段
              </button>
            </div>
          </Card>

          <Card icon={<Waves className="w-4 h-4" />} title="水流方向">
            <div className="flex gap-2">
              {waterOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setConfig({ waterDirection: opt })}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm border transition-all duration-200",
                    config.waterDirection === opt
                      ? "bg-[var(--color-accent-dim)] border-[var(--color-accent)] text-[var(--color-accent)]"
                      : "bg-[var(--color-bg)] border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-accent)]"
                  )}
                >
                  {opt}
                </button>
              ))}
            </div>
          </Card>

          <Card icon={<Wind className="w-4 h-4" />} title="风况">
            <div className="space-y-3">
              <div>
                <label className="text-xs text-[var(--color-muted)] mb-1.5 block">风速</label>
                <div className="flex gap-2">
                  {windSpeedOptions.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setConfig({ windSpeed: opt })}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-sm border transition-all duration-200",
                        config.windSpeed === opt
                          ? "bg-[var(--color-accent-dim)] border-[var(--color-accent)] text-[var(--color-accent)]"
                          : "bg-[var(--color-bg)] border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-accent)]"
                      )}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-[var(--color-muted)] mb-1.5 block">风向</label>
                <div className="flex gap-2">
                  {windDirOptions.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setConfig({ windDirection: opt })}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-sm border transition-all duration-200",
                        config.windDirection === opt
                          ? "bg-[var(--color-accent-dim)] border-[var(--color-accent)] text-[var(--color-accent)]"
                          : "bg-[var(--color-bg)] border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-accent)]"
                      )}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <div className="flex gap-3 pt-4">
            <button
              onClick={resetConfig}
              className="px-6 py-3 rounded-lg border border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-warn)] hover:text-[var(--color-warn)] transition-all text-sm"
            >
              重置
            </button>
            <button
              onClick={handleProceed}
              disabled={!canProceed}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-300",
                canProceed
                  ? "bg-[var(--color-accent)] text-[var(--color-bg)] hover:shadow-[0_0_20px_rgba(0,212,170,0.4)]"
                  : "bg-[var(--color-surface-alt)] text-[var(--color-text-dim)] border border-[var(--color-border)] cursor-not-allowed"
              )}
            >
              开始记录
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Card({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5 hover:border-[var(--color-accent)]/30 transition-all duration-300">
      <div className="flex items-center gap-2 mb-3 text-[var(--color-accent)]">
        {icon}
        <span className="text-sm font-semibold">{title}</span>
      </div>
      {children}
    </div>
  )
}
