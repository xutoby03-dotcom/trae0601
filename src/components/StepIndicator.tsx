import { cn } from "@/lib/utils"
import { useLocation, useNavigate } from "react-router-dom"

const steps = [
  { path: "/", label: "训练配置" },
  { path: "/record", label: "分段记录" },
  { path: "/analysis", label: "同步分析" },
]

export default function StepIndicator() {
  const location = useLocation()
  const navigate = useNavigate()
  const currentIdx = steps.findIndex((s) => s.path === location.pathname)

  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {steps.map((step, idx) => {
        const isActive = idx === currentIdx
        const isDone = idx < currentIdx
        return (
          <div key={step.path} className="flex items-center">
            <button
              onClick={() => isDone && navigate(step.path)}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300",
                isActive && "bg-[var(--color-accent-dim)] text-[var(--color-accent)] border border-[var(--color-accent)] shadow-[0_0_12px_rgba(0,212,170,0.25)]",
                isDone && "bg-[var(--color-surface-alt)] text-[var(--color-muted)] border border-[var(--color-border)] hover:border-[var(--color-accent)] cursor-pointer",
                !isActive && !isDone && "bg-[var(--color-surface)] text-[var(--color-text-dim)] border border-[var(--color-border)]"
              )}
            >
              <span
                className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                  isActive && "bg-[var(--color-accent)] text-[var(--color-bg)]",
                  isDone && "bg-[var(--color-border)] text-[var(--color-muted)]",
                  !isActive && !isDone && "bg-[var(--color-border)] text-[var(--color-text-dim)]"
                )}
              >
                {isDone ? "✓" : idx + 1}
              </span>
              {step.label}
            </button>
            {idx < steps.length - 1 && (
              <div
                className={cn(
                  "w-12 h-px mx-2",
                  idx < currentIdx ? "bg-[var(--color-accent)]" : "bg-[var(--color-border)]"
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
