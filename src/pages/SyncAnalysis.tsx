import { useMemo } from "react"
import { useRowingStore, getDesyncLevel, getDesyncReason, formatDesyncBadge, formatDesyncReasonLine, type SegmentRecord } from "@/store/rowingStore"
import { useNavigate } from "react-router-dom"
import StepIndicator from "@/components/StepIndicator"
import { AlertTriangle, CheckCircle2, Clock, RotateCcw, Trash2, ChevronRight, Waves, Wind } from "lucide-react"
import { cn } from "@/lib/utils"

export default function SyncAnalysisPage() {
  const { config, records, sessions, currentSessionId, toggleReviewSegment, deleteSession, resetConfig, loadSession } = useRowingStore()
  const navigate = useNavigate()

  const currentSession = sessions.find((s) => s.id === currentSessionId)

  const activeData = useMemo(() => {
    if (currentSession && currentSession.records.length > 0) {
      return {
        config: currentSession.config,
        records: currentSession.records,
        reviewSegments: currentSession.reviewSegments,
        createdAt: currentSession.createdAt,
        sessionId: currentSession.id,
      }
    }
    if (records.length > 0 && config.boatId) {
      const sorted = [...records].sort((a, b) => b.desyncIndex - a.desyncIndex)
      const worstIdx = sorted.length > 0 ? sorted[0].segmentIndex : -1
      const reviewSegments = Array.from(
        new Set([
          ...records.filter((r) => r.desyncIndex >= 0.7).map((r) => r.segmentIndex),
          ...(worstIdx >= 0 ? [worstIdx] : []),
        ])
      )
      return {
        config,
        records,
        reviewSegments,
        createdAt: new Date().toISOString(),
        sessionId: currentSessionId,
      }
    }
    return null
  }, [currentSession, records, config, currentSessionId])

  const analysisData = useMemo(() => {
    if (!activeData || activeData.records.length === 0) return null

    const recs = [...activeData.records].sort((a, b) => a.segmentIndex - b.segmentIndex)
    const maxDesync = Math.max(...recs.map((r) => r.desyncIndex))
    const minDesync = Math.min(...recs.map((r) => r.desyncIndex))
    const avgDesync = recs.reduce((sum, r) => sum + r.desyncIndex, 0) / recs.length

    const worstSegments = recs.filter((r) => r.desyncIndex >= 0.7)
    const cautionSegments = recs.filter((r) => r.desyncIndex >= 0.4 && r.desyncIndex < 0.7)

    const suggestions: string[] = []

    const avgEntry = recs.reduce((s, r) => s + r.entryTimeDiff, 0) / recs.length
    if (avgEntry > 60) suggestions.push(`入水时间差平均 ${avgEntry.toFixed(0)}ms，建议加强领桨口令节奏练习，重点统一入水时机`)
    if (avgEntry > 30 && avgEntry <= 60) suggestions.push(`入水时间差尚可（${avgEntry.toFixed(0)}ms），可通过跟桨模仿训练进一步缩短`)

    const avgYaw = recs.reduce((s, r) => s + r.yawAngle, 0) / recs.length
    if (avgYaw > 3) suggestions.push(`偏航角平均 ${avgYaw.toFixed(1)}°，建议做直线行进专项练习，注意两侧发力均衡`)
    const leftCount = recs.filter((r) => r.yawDirection === "左").length
    if (leftCount > recs.length * 0.7) suggestions.push("偏航偏向左侧，建议检查2号位桨入水角度和1号位发力对称性")

    const avgDrop = recs.reduce((s, r) => s + r.sprintSpeedDrop, 0) / recs.length
    if (avgDrop > 5) suggestions.push(`冲刺掉速平均 ${avgDrop.toFixed(1)} 次/分，建议加强冲刺段体能和桨频维持训练`)

    const avgResponse = recs.reduce((s, r) => s + r.commandResponseTime, 0) / recs.length
    if (avgResponse > 250) suggestions.push(`口令响应平均 ${avgResponse.toFixed(0)}ms，建议增加口令预判训练，缩短反应延迟`)

    if (worstSegments.length > 0) {
      const worstIdx = worstSegments.map((s) => `第${s.segmentIndex + 1}段`).join("、")
      suggestions.push(`⚠️ 重点复练区间：${worstIdx}，这些分段不同步指数超过0.7阈值`)
    }

    if (suggestions.length === 0) {
      suggestions.push("整体同步表现良好！可适当提高目标桨频进行更高强度训练")
    }

    return { recs, maxDesync, minDesync, avgDesync, worstSegments, cautionSegments, suggestions }
  }, [activeData])

  const handleNewTraining = () => {
    resetConfig()
    navigate("/")
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <StepIndicator />

        {!activeData ? (
          <div className="text-center py-20 animate-slide-up">
            <p className="text-[var(--color-muted)] mb-4">暂无训练数据</p>
            <button
              onClick={handleNewTraining}
              className="px-6 py-2.5 rounded-lg bg-[var(--color-accent)] text-[var(--color-bg)] font-semibold text-sm"
            >
              开始训练
            </button>
          </div>
        ) : (
          <div className="animate-slide-up">
            {activeData && (
              <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h2 className="text-xl font-bold" style={{ fontFamily: "Outfit" }}>
                      {activeData.config.boatId}
                    </h2>
                    <p className="text-xs text-[var(--color-muted)]">
                      {activeData.config.seat1Name} & {activeData.config.seat2Name} · 目标桨频 {activeData.config.targetStrokeRate} 次/分
                    </p>
                  </div>
                  <span className="text-xs text-[var(--color-text-dim)]">
                    {new Date(activeData.createdAt).toLocaleString("zh-CN")}
                  </span>
                </div>
                <div className="flex gap-3 text-xs text-[var(--color-muted)]">
                  <span className="flex items-center gap-1"><Waves className="w-3 h-3" />{activeData.config.waterDirection}</span>
                  <span className="flex items-center gap-1"><Wind className="w-3 h-3" />{activeData.config.windSpeed} · {activeData.config.windDirection}</span>
                  <span>{activeData.config.segments.length} 段</span>
                </div>
              </div>
            )}

            {analysisData && (
              <>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <StatCard label="最高不同步指数" value={analysisData.maxDesync.toFixed(2)} level={getDesyncLevel(analysisData.maxDesync)} />
                  <StatCard label="平均不同步指数" value={analysisData.avgDesync.toFixed(2)} level={getDesyncLevel(analysisData.avgDesync)} />
                  <StatCard label="最佳不同步指数" value={analysisData.minDesync.toFixed(2)} level={getDesyncLevel(analysisData.minDesync)} />
                </div>

                <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5 mb-6">
                  <h3 className="text-sm font-semibold mb-4 text-[var(--color-muted)]">各段不同步指数</h3>
                  <div className="space-y-3">
                    {analysisData.recs.map((rec) => {
                      const level = getDesyncLevel(rec.desyncIndex)
                      const barWidth = Math.min((rec.desyncIndex / 1.5) * 100, 100)
                      const isReview = activeData.reviewSegments.includes(rec.segmentIndex)
                      const reason = getDesyncReason(rec)
                      const badgeText = formatDesyncBadge(reason)
                      return (
                        <div key={rec.segmentIndex} className={cn(
                          "rounded-lg p-3 border transition-all",
                          level === "danger" && !isReview && "border-[var(--color-danger)]/40 bg-[var(--color-warn-dim)]",
                          level === "caution" && "border-[var(--color-caution)]/30 bg-[var(--color-surface-alt)]",
                          level === "good" && "border-[var(--color-good)]/20",
                          isReview && "border-[var(--color-danger)] bg-[var(--color-warn-dim)] warn-glow-border"
                        )}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <button
                                onClick={() => toggleReviewSegment(rec.segmentIndex)}
                                className={cn(
                                  "w-5 h-5 rounded border flex items-center justify-center text-xs transition-all",
                                  isReview
                                    ? "bg-[var(--color-danger)] border-[var(--color-danger)] text-white"
                                    : "border-[var(--color-border)] hover:border-[var(--color-accent)]"
                                )}
                              >
                                {isReview && "✓"}
                              </button>
                              <span className="text-sm font-semibold">第 {rec.segmentIndex + 1} 段</span>
                              <span className="text-xs text-[var(--color-text-dim)]">{activeData.config.segments[rec.segmentIndex]}m</span>
                              {reason.hasValidData && (
                                <span className={cn(
                                  "text-[10px] px-1.5 py-0.5 rounded font-medium",
                                  isReview
                                    ? "bg-[var(--color-danger)]/15 text-[var(--color-danger)]"
                                    : "bg-[var(--color-accent-dim)] text-[var(--color-accent)]"
                                )}>
                                  {badgeText}
                                </span>
                              )}
                              {level === "danger" && <AlertTriangle className="w-3.5 h-3.5 text-[var(--color-danger)]" />}
                              {level === "good" && <CheckCircle2 className="w-3.5 h-3.5 text-[var(--color-good)]" />}
                            </div>
                            <span className={cn(
                              "text-sm font-bold",
                              level === "good" && "text-[var(--color-good)]",
                              level === "caution" && "text-[var(--color-caution)]",
                              level === "danger" && "text-[var(--color-danger)]"
                            )} style={{ fontFamily: "Outfit" }}>
                              {rec.desyncIndex.toFixed(2)}
                            </span>
                          </div>
                          <div className="h-2 bg-[var(--color-bg)] rounded-full overflow-hidden mb-2">
                            <div
                              className={cn(
                                "h-full rounded-full transition-all duration-700",
                                level === "good" && "bg-[var(--color-good)]",
                                level === "caution" && "bg-[var(--color-caution)]",
                                level === "danger" && "bg-[var(--color-danger)]"
                              )}
                              style={{ width: `${barWidth}%` }}
                            />
                          </div>
                          <div className="grid grid-cols-4 gap-2 text-xs text-[var(--color-text-dim)]">
                            <span className={reason.hasValidData && reason.metric.key === "entryTimeDiff" && rec.entryTimeDiff > 0 ? "text-[var(--color-warn)] font-semibold" : ""}>
                              时间差 {rec.entryTimeDiff}ms
                            </span>
                            <span className={reason.hasValidData && reason.metric.key === "yawAngle" && rec.yawAngle > 0 ? "text-[var(--color-warn)] font-semibold" : ""}>
                              偏航 {rec.yawAngle}°{rec.yawDirection}
                            </span>
                            <span className={reason.hasValidData && reason.metric.key === "sprintSpeedDrop" && rec.sprintSpeedDrop > 0 ? "text-[var(--color-warn)] font-semibold" : ""}>
                              掉速 {rec.sprintSpeedDrop}
                            </span>
                            <span className={reason.hasValidData && reason.metric.key === "commandResponseTime" && rec.commandResponseTime > 0 ? "text-[var(--color-warn)] font-semibold" : ""}>
                              响应 {rec.commandResponseTime}ms
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="bg-[var(--color-surface)] border border-[var(--color-accent)]/20 rounded-xl p-5 mb-6 glow-border">
                  <h3 className="text-sm font-semibold mb-3 text-[var(--color-accent)] flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    复练建议
                  </h3>
                  <div className="space-y-2">
                    {analysisData.suggestions.map((s, i) => (
                      <p key={i} className="text-sm text-[var(--color-text)] leading-relaxed pl-4 border-l-2 border-[var(--color-accent)]/30">
                        {s}
                      </p>
                    ))}
                  </div>
                </div>

                {activeData.reviewSegments.length > 0 && (
                  <div className="bg-[var(--color-surface)] border border-[var(--color-danger)]/30 rounded-xl p-5 mb-6">
                    <h3 className="text-sm font-semibold mb-3 text-[var(--color-danger)] flex items-center gap-2">
                      <RotateCcw className="w-4 h-4" />
                      下次复练区间
                    </h3>
                    <div className="space-y-2">
                      {activeData.reviewSegments.map((idx) => {
                        const rec = activeData.records.find((r) => r.segmentIndex === idx) as SegmentRecord | undefined
                        const reason = rec ? getDesyncReason(rec) : null
                        const reasonText = reason ? formatDesyncReasonLine(reason) : null
                        return (
                          <div
                            key={idx}
                            className="flex items-center gap-3 flex-wrap px-4 py-2.5 rounded-lg bg-[var(--color-warn-dim)] border border-[var(--color-danger)]/30"
                          >
                            <span className="text-sm font-bold text-[var(--color-danger)]">
                              第 {idx + 1} 段
                            </span>
                            <span className="text-xs text-[var(--color-muted)]">
                              {activeData.config.segments[idx]}m
                            </span>
                            {reason && reasonText && reason.hasValidData ? (
                              <>
                                <span className="w-px h-4 bg-[var(--color-border)]" />
                                <span className="text-xs text-[var(--color-muted)]">主要原因</span>
                                <span className="text-sm font-semibold text-[var(--color-text)]">
                                  {reasonText.title}
                                </span>
                                <span className="text-xs font-bold text-[var(--color-danger)] px-2 py-0.5 rounded bg-[var(--color-danger)]/10">
                                  {reasonText.valueText}
                                </span>
                                {reasonText.pctText && (
                                  <span className="text-[10px] text-[var(--color-text-dim)] ml-auto">
                                    {reasonText.pctText}
                                  </span>
                                )}
                              </>
                            ) : (
                              <>
                                <span className="w-px h-4 bg-[var(--color-border)]" />
                                <span className="text-xs text-[var(--color-text-dim)]">数据未完整录入</span>
                              </>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </>
            )}

            {sessions.length > 0 && (
              <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5 mb-6">
                <h3 className="text-sm font-semibold mb-3 text-[var(--color-muted)]">历史训练记录</h3>
                <div className="space-y-2">
                  {sessions.map((session) => {
                    const isActive = session.id === currentSessionId
                    return (
                      <div
                        key={session.id}
                        className={cn(
                          "flex items-center justify-between p-3 rounded-lg border transition-all",
                          isActive ? "border-[var(--color-accent)] bg-[var(--color-accent-dim)]" : "border-[var(--color-border)] hover:border-[var(--color-accent)]/30"
                        )}
                      >
                        <button
                          onClick={() => loadSession(session.id)}
                          className="flex items-center gap-3 flex-1 text-left"
                        >
                          <div>
                            <p className="text-sm font-semibold">{session.config.boatId}</p>
                            <p className="text-xs text-[var(--color-text-dim)]">
                              {session.config.seat1Name} & {session.config.seat2Name} · {session.records.length} 段
                              {session.reviewSegments.length > 0 && ` · ${session.reviewSegments.length} 个复练区间`}
                            </p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-[var(--color-text-dim)]" />
                        </button>
                        <button
                          onClick={() => deleteSession(session.id)}
                          className="p-1.5 text-[var(--color-text-dim)] hover:text-[var(--color-danger)] transition-colors ml-2"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => navigate("/record")}
                className="px-4 py-3 rounded-lg border border-[var(--color-border)] text-[var(--color-muted)] text-sm hover:border-[var(--color-accent)] transition-all flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                返回记录
              </button>
              <button
                onClick={handleNewTraining}
                className="flex-1 px-4 py-3 rounded-lg bg-[var(--color-accent)] text-[var(--color-bg)] font-semibold text-sm hover:shadow-[0_0_20px_rgba(0,212,170,0.4)] transition-all"
              >
                开始新训练
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, level }: { label: string; value: string; level: "good" | "caution" | "danger" }) {
  return (
    <div className={cn(
      "bg-[var(--color-surface)] border rounded-xl p-4 text-center",
      level === "good" && "border-[var(--color-good)]/20",
      level === "caution" && "border-[var(--color-caution)]/30",
      level === "danger" && "border-[var(--color-danger)]/40"
    )}>
      <p className="text-xs text-[var(--color-muted)] mb-1">{label}</p>
      <p className={cn(
        "text-2xl font-extrabold",
        level === "good" && "text-[var(--color-good)]",
        level === "caution" && "text-[var(--color-caution)]",
        level === "danger" && "text-[var(--color-danger)]"
      )} style={{ fontFamily: "Outfit" }}>
        {value}
      </p>
    </div>
  )
}
