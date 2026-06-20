import { useEffect, useRef, useState } from "react"
import { usePassengerStore } from "@/store/passengerStore"
import { WELCOME_MAP } from "@/types"
import type { Passenger } from "@/types"
import {
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Moon,
  Sun,
  Lock,
  Unlock,
  UserCheck,
  AlertTriangle,
  X,
  Phone,
  Car,
  Settings,
} from "lucide-react"
import QuickDetail from "@/components/QuickDetail"

export default function CarouselScreen() {
  const {
    isPlaying,
    isNightMode,
    isLocked,
    currentIndex,
    carouselInterval,
    getSortedActivePassengers,
    nextCard,
    prevCard,
    setIsPlaying,
    toggleNightMode,
    toggleLock,
    markPickedUp,
    setStatus,
    setCurrentIndex,
  } = usePassengerStore()

  const activePassengers = getSortedActivePassengers()
  const current = activePassengers[currentIndex] as Passenger | undefined

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const progressRef = useRef<number>(0)
  const [progress, setProgress] = useState(0)
  const [showDetail, setShowDetail] = useState(false)
  const [fadeKey, setFadeKey] = useState(0)
  const [longPressTimer, setLongPressTimer] = useState<ReturnType<typeof setTimeout> | null>(null)
  const prevIndexRef = useRef(currentIndex)

  useEffect(() => {
    if (isPlaying && activePassengers.length > 1) {
      progressRef.current = 0
      setProgress(0)
      const step = 50
      timerRef.current = setInterval(() => {
        progressRef.current += step
        setProgress((progressRef.current / carouselInterval) * 100)
        if (progressRef.current >= carouselInterval) {
          progressRef.current = 0
          setProgress(0)
          nextCard()
        }
      }, step)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isPlaying, carouselInterval, currentIndex, activePassengers.length, nextCard])

  useEffect(() => {
    if (currentIndex !== prevIndexRef.current) {
      setFadeKey((k) => k + 1)
      prevIndexRef.current = currentIndex
    }
  }, [currentIndex])

  useEffect(() => {
    if (activePassengers.length > 0 && currentIndex >= activePassengers.length) {
      setCurrentIndex(Math.max(0, activePassengers.length - 1))
    }
  }, [activePassengers.length, currentIndex, setCurrentIndex])

  const handleLockPressStart = () => {
    const timer = setTimeout(() => {
      toggleLock()
      setLongPressTimer(null)
    }, 3000)
    setLongPressTimer(timer)
  }

  const handleLockPressEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer)
      setLongPressTimer(null)
    }
  }

  const handleAction = (action: () => void) => {
    if (isLocked) return
    action()
  }

  if (activePassengers.length === 0) {
    return (
      <div
        className={`min-h-screen flex flex-col items-center justify-center transition-colors duration-500 ${
          isNightMode ? "bg-[#050D1A] text-white" : "bg-[#0A1628] text-white"
        }`}
      >
        <div className="text-center space-y-6">
          <div className="text-8xl mb-4 opacity-30">✈️</div>
          <h1 className="text-3xl font-light text-[#8B9CB6]">暂无待接乘客</h1>
          <p className="text-[#8B9CB6] text-lg">请前往管理页面添加乘客信息</p>
          <button
            onClick={() => (window.location.href = "/manage")}
            className="mt-8 px-8 py-4 bg-[#FF6B2B] text-white rounded-xl text-lg font-semibold hover:bg-[#e55d22] transition-colors"
          >
            <Settings className="inline-block w-5 h-5 mr-2" />
            添加乘客
          </button>
        </div>
        <div className="absolute top-6 right-6 flex gap-3">
          <button
            onClick={toggleNightMode}
            className="p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
          >
            {isNightMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-500 relative overflow-hidden ${
        isNightMode ? "bg-[#050D1A]" : "bg-[#0A1628]"
      }`}
    >
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 25% 25%, rgba(255,107,43,0.3) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(0,196,140,0.2) 0%, transparent 50%)",
        }}
      />

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-6 relative z-10">
        <div
          key={fadeKey}
          className="animate-[fadeInScale_0.5s_ease-out] w-full max-w-5xl"
        >
          {current && (
            <div
              className={`relative rounded-3xl p-8 md:p-12 lg:p-16 border-4 transition-all duration-500 ${
                isNightMode
                  ? "border-[#FF6B2B] shadow-[0_0_40px_rgba(255,107,43,0.4),0_0_80px_rgba(255,107,43,0.2)]"
                  : "border-[#FF6B2B]/80 shadow-[0_0_30px_rgba(255,107,43,0.25),0_0_60px_rgba(255,107,43,0.1)]"
              } ${isNightMode ? "bg-[#0A1628]" : "bg-[#0F2035]"} ${
                current.status === "delayed"
                  ? isNightMode
                    ? "!border-yellow-500 shadow-[0_0_40px_rgba(234,179,8,0.4)]"
                    : "!border-yellow-500/80 shadow-[0_0_30px_rgba(234,179,8,0.3)]"
                  : ""
              }`}
            >
              {current.status === "delayed" && (
                <div className="absolute top-4 right-4 flex items-center gap-2 bg-yellow-500/20 text-yellow-400 px-4 py-2 rounded-full text-sm font-semibold">
                  <AlertTriangle className="w-4 h-4" />
                  延误 {current.delayMinutes}分钟
                </div>
              )}

              <div className="text-center space-y-4 md:space-y-6">
                <div
                  className="text-[#8B9CB6] text-lg md:text-xl tracking-[0.3em] font-light uppercase"
                >
                  {WELCOME_MAP[current.language]}
                </div>

                <h1
                  className="text-white font-black leading-none tracking-tight"
                  style={{ fontSize: "clamp(48px, 12vw, 140px)" }}
                >
                  {current.name}
                </h1>

                <div className="flex items-center justify-center gap-6 md:gap-10 flex-wrap">
                  <div className="text-center">
                    <div className="text-[#8B9CB6] text-xs md:text-sm mb-1 tracking-wider">航班号</div>
                    <div
                      className="text-white font-bold tracking-wider"
                      style={{ fontSize: "clamp(24px, 5vw, 52px)" }}
                    >
                      {current.flightNumber}
                    </div>
                  </div>
                  <div className="w-px h-12 md:h-16 bg-white/10" />
                  <div className="text-center">
                    <div className="text-[#8B9CB6] text-xs md:text-sm mb-1 tracking-wider">到达口</div>
                    <div
                      className="text-[#FF6B2B] font-bold"
                      style={{ fontSize: "clamp(24px, 5vw, 52px)" }}
                    >
                      {current.arrivalGate}
                    </div>
                  </div>
                  <div className="w-px h-12 md:h-16 bg-white/10" />
                  <div className="text-center">
                    <div className="text-[#8B9CB6] text-xs md:text-sm mb-1 tracking-wider">落地时间</div>
                    <div
                      className="text-white font-bold"
                      style={{ fontSize: "clamp(20px, 4vw, 44px)" }}
                    >
                      {new Date(current.landingTime).toLocaleTimeString("zh-CN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>

                {current.parkingNote && (
                  <div className="mt-2 text-[#8B9CB6] text-base md:text-lg">
                    🅿️ {current.parkingNote}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center gap-2 text-[#8B9CB6] text-sm">
          <span>{currentIndex + 1}</span>
          <span>/</span>
          <span>{activePassengers.length}</span>
          {activePassengers.length > 1 && (
            <div className="flex gap-1 ml-2">
              {activePassengers.map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    i === currentIndex ? "bg-[#FF6B2B] w-6" : "bg-white/20"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="w-full h-1 bg-white/5 relative z-10">
        <div
          className="h-full bg-gradient-to-r from-[#FF6B2B] to-[#FF8F5E] transition-all duration-100 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div
        className={`flex items-center justify-center gap-2 md:gap-4 px-4 py-3 relative z-10 ${
          isNightMode ? "bg-[#030810]" : "bg-[#081220]"
        }`}
      >
        <button
          onClick={() => handleAction(toggleNightMode)}
          className={`p-3 md:p-4 rounded-xl transition-colors ${
            isNightMode ? "bg-white/10 hover:bg-white/20 text-yellow-400" : "bg-white/5 hover:bg-white/10 text-white"
          }`}
          title={isNightMode ? "日间模式" : "夜间模式"}
        >
          {isNightMode ? <Sun className="w-5 h-5 md:w-6 md:h-6" /> : <Moon className="w-5 h-5 md:w-6 md:h-6" />}
        </button>

        <button
          onClick={() => handleAction(prevCard)}
          className={`p-3 md:p-4 rounded-xl transition-colors ${
            isLocked ? "opacity-30 cursor-not-allowed" : "bg-white/5 hover:bg-white/10 text-white"
          }`}
        >
          <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
        </button>

        <button
          onClick={() => handleAction(() => setIsPlaying(!isPlaying))}
          className={`p-4 md:p-5 rounded-2xl transition-colors ${
            isLocked
              ? "opacity-30 cursor-not-allowed bg-white/5 text-white"
              : "bg-[#FF6B2B] hover:bg-[#e55d22] text-white"
          }`}
        >
          {isPlaying ? <Pause className="w-6 h-6 md:w-7 md:h-7" /> : <Play className="w-6 h-6 md:w-7 md:h-7" />}
        </button>

        <button
          onClick={() => handleAction(nextCard)}
          className={`p-3 md:p-4 rounded-xl transition-colors ${
            isLocked ? "opacity-30 cursor-not-allowed" : "bg-white/5 hover:bg-white/10 text-white"
          }`}
        >
          <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
        </button>

        {current && (
          <>
            <button
              onClick={() => handleAction(() => setStatus(current.id, "delayed"))}
              className={`p-3 md:p-4 rounded-xl transition-colors ${
                isLocked
                  ? "opacity-30 cursor-not-allowed"
                  : current.status === "delayed"
                  ? "bg-yellow-500/30 text-yellow-400"
                  : "bg-white/5 hover:bg-white/10 text-yellow-400"
              }`}
              title="标记延误"
            >
              <AlertTriangle className="w-5 h-5 md:w-6 md:h-6" />
            </button>

            <button
              onClick={() => handleAction(() => markPickedUp(current.id))}
              className={`p-3 md:p-4 rounded-xl transition-colors ${
                isLocked ? "opacity-30 cursor-not-allowed" : "bg-white/5 hover:bg-[#00C48C]/20 text-[#00C48C]"
              }`}
              title="已接到"
            >
              <UserCheck className="w-5 h-5 md:w-6 md:h-6" />
            </button>

            <button
              onClick={() => !isLocked && setShowDetail(true)}
              className={`p-3 md:p-4 rounded-xl transition-colors ${
                isLocked ? "opacity-30 cursor-not-allowed" : "bg-white/5 hover:bg-white/10 text-white"
              }`}
              title="查看详情"
            >
              <Phone className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </>
        )}

        <button
          onTouchStart={handleLockPressStart}
          onTouchEnd={handleLockPressEnd}
          onMouseDown={handleLockPressStart}
          onMouseUp={handleLockPressEnd}
          className={`p-3 md:p-4 rounded-xl transition-colors ${
            isLocked
              ? "bg-red-500/30 text-red-400"
              : "bg-white/5 hover:bg-white/10 text-white"
          }`}
          title={isLocked ? "长按3秒解锁" : "点击锁定"}
        >
          {isLocked ? <Lock className="w-5 h-5 md:w-6 md:h-6" /> : <Unlock className="w-5 h-5 md:w-6 md:h-6" />}
        </button>

        <a
          href="/manage"
          onClick={(e) => isLocked && e.preventDefault()}
          className={`p-3 md:p-4 rounded-xl transition-colors ${
            isLocked ? "opacity-30 cursor-not-allowed" : "bg-white/5 hover:bg-white/10 text-white"
          }`}
        >
          <Settings className="w-5 h-5 md:w-6 md:h-6" />
        </a>
      </div>

      {isLocked && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20">
          <div className="flex items-center gap-3 bg-red-500/20 text-red-400 px-6 py-3 rounded-2xl backdrop-blur-sm animate-pulse">
            <Lock className="w-6 h-6" />
            <span className="text-lg font-semibold">屏幕已锁定 · 长按解锁</span>
          </div>
        </div>
      )}

      {showDetail && current && (
        <QuickDetail passenger={current} onClose={() => setShowDetail(false)} />
      )}
    </div>
  )
}
