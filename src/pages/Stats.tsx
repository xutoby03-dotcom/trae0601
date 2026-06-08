import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { UtensilsCrossed, AlertCircle, Pill, X, Handshake, Clock, UserCheck, Copy, Check } from 'lucide-react'
import { format, subDays } from 'date-fns'
import { usePetStore } from '@/store/usePetStore'

export default function Stats() {
  const { pets, getWeekStats, getActiveFoster, createFosterSession, setFosterMode, deactivateFoster } = usePetStore()

  const today = format(new Date(), 'yyyy-MM-dd')
  const weekStart = format(subDays(new Date(), 6), 'M月d日')
  const weekEnd = format(new Date(), 'M月d日')

  const stats = useMemo(() => getWeekStats(today), [today, getWeekStats])

  const activeFoster = getActiveFoster()

  const [showFosterForm, setShowFosterForm] = useState(false)
  const [fosterName, setFosterName] = useState('')
  const [fosterDays, setFosterDays] = useState(3)
  const [selectedPetIds, setSelectedPetIds] = useState<string[]>([])
  const [createdSession, setCreatedSession] = useState<{ token: string; fosterPersonName: string; endDate: string } | null>(null)
  const [copied, setCopied] = useState(false)

  const togglePet = (id: string) => {
    setSelectedPetIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    )
  }

  const handleFosterSubmit = () => {
    if (!fosterName.trim() || fosterDays < 1 || fosterDays > 14 || selectedPetIds.length === 0) return

    const startDate = format(new Date(), 'yyyy-MM-dd')
    const endDate = format(subDays(new Date(), -fosterDays), 'yyyy-MM-dd')

    const session = createFosterSession({
      fosterPersonName: fosterName.trim(),
      startDate,
      endDate,
      assignedPetIds: selectedPetIds,
      active: true,
    })

    setFosterMode(true, session.token)
    setCreatedSession({ token: session.token, fosterPersonName: session.fosterPersonName, endDate: session.endDate })
    setFosterName('')
    setFosterDays(3)
    setSelectedPetIds([])
  }

  const handleDeactivate = (token: string) => {
    deactivateFoster(token)
  }

  const handleCopyToken = () => {
    if (!createdSession) return
    navigator.clipboard.writeText(createdSession.token)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const barColor = (completed: number, total: number) => {
    if (total === 0) return 'bg-gray-300'
    const rate = completed / total
    if (rate >= 1) return 'bg-green-500'
    if (rate >= 0.5) return 'bg-orange-400'
    return 'bg-red-400'
  }

  const fosterCountdown = (endDate: string) => {
    const end = new Date(endDate)
    const now = new Date()
    const diff = end.getTime() - now.getTime()
    if (diff <= 0) return '已过期'
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
    return `剩余 ${days} 天`
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-800">一周统计</h1>
        <p className="text-sm text-gray-500 mt-1">{weekStart} — {weekEnd}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
          className="rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 p-5 text-white"
        >
          <div className="flex items-center gap-2 mb-3">
            <UtensilsCrossed size={20} />
            <span className="text-sm font-medium opacity-90">漏喂次数</span>
          </div>
          <p className="text-4xl font-bold font-display">{stats.missedFeedings}</p>
          <p className="text-xs mt-2 opacity-75">最近7天</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl bg-gradient-to-br from-rose-400 to-rose-600 p-5 text-white"
        >
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle size={20} />
            <span className="text-sm font-medium opacity-90">异常天数</span>
          </div>
          <p className="text-4xl font-bold font-display">{stats.abnormalDays}</p>
          <p className="text-xs mt-2 opacity-75">排便异常/有备注</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl bg-gradient-to-br from-green-400 to-green-600 p-5 text-white"
        >
          <div className="flex items-center gap-2 mb-3">
            <Pill size={20} />
            <span className="text-sm font-medium opacity-90">药物按时率</span>
          </div>
          <p className="text-4xl font-bold font-display">{Math.round(stats.medicineOnTimeRate * 100)}%</p>
          <p className="text-xs mt-2 opacity-75">按时服药比例</p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl p-5 shadow-sm border border-orange-100"
      >
        <h2 className="font-display text-lg font-bold text-gray-800 mb-4">每日完成率</h2>
        <div className="flex items-end justify-between gap-2 h-44">
          {stats.completionByDay.map((day) => {
            const rate = day.total > 0 ? day.completed / day.total : 0
            const heightPct = day.total > 0 ? Math.max(rate * 100, 4) : 4
            return (
              <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full relative bg-stone-100 rounded-lg overflow-hidden" style={{ height: '120px' }}>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${heightPct}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className={`absolute bottom-0 w-full rounded-lg ${barColor(day.completed, day.total)}`}
                  />
                </div>
                <span className="text-xs text-gray-500">
                  {format(new Date(day.date), 'M/d')}
                </span>
                <span className="text-xs font-medium text-gray-700">
                  {day.completed}/{day.total}
                </span>
              </div>
            )
          })}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl p-5 shadow-sm border border-orange-100"
      >
        <div className="flex items-center gap-2 mb-4">
          <Handshake size={20} className="text-brand-orange" />
          <h2 className="font-display text-lg font-bold text-gray-800">临时托管</h2>
        </div>

        {activeFoster && (
          <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-800">托管人: {activeFoster.fosterPersonName}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Clock size={14} className="text-orange-500" />
                  <span className="text-xs text-orange-600">{fosterCountdown(activeFoster.endDate)}</span>
                </div>
              </div>
              <button
                onClick={() => handleDeactivate(activeFoster.token)}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors"
              >
                结束托管
              </button>
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {activeFoster.assignedPetIds.map((pid) => {
                const pet = pets.find((p) => p.id === pid)
                return pet ? (
                  <span key={pid} className="px-2 py-0.5 bg-white rounded-md text-xs text-gray-600 border border-orange-200">
                    {pet.name}
                  </span>
                ) : null
              })}
            </div>
          </div>
        )}

        <button
          onClick={() => setShowFosterForm(true)}
          className="w-full py-2.5 rounded-xl bg-brand-orange text-white text-sm font-semibold hover:bg-orange-600 transition-colors"
        >
          开启托管模式
        </button>
      </motion.div>

      <AnimatePresence>
        {showFosterForm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40"
              onClick={() => {
                setShowFosterForm(false)
                setCreatedSession(null)
              }}
            />
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 z-50 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-display text-lg font-bold text-gray-800">开启托管模式</h3>
                <button
                  onClick={() => {
                    setShowFosterForm(false)
                    setCreatedSession(null)
                  }}
                  className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>

              {createdSession ? (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-center">
                    <Check size={32} className="mx-auto text-green-500 mb-2" />
                    <p className="text-sm font-semibold text-green-700">托管已开启</p>
                    <p className="text-xs text-green-600 mt-1">托管人: {createdSession.fosterPersonName}</p>
                  </div>
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                    <p className="text-xs text-gray-500 mb-1">分享令牌</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-sm font-mono text-gray-800 break-all">{createdSession.token}</code>
                      <button
                        onClick={handleCopyToken}
                        className="p-2 rounded-lg hover:bg-gray-200 transition-colors shrink-0"
                      >
                        {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} className="text-gray-500" />}
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowFosterForm(false)
                      setCreatedSession(null)
                    }}
                    className="w-full py-2.5 rounded-xl bg-brand-orange text-white text-sm font-semibold hover:bg-orange-600 transition-colors"
                  >
                    完成
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">托管人姓名</label>
                    <div className="relative">
                      <UserCheck size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={fosterName}
                        onChange={(e) => setFosterName(e.target.value)}
                        placeholder="输入托管人姓名"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">托管天数</label>
                    <input
                      type="number"
                      min={1}
                      max={14}
                      value={fosterDays}
                      onChange={(e) => setFosterDays(Math.min(14, Math.max(1, Number(e.target.value))))}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400"
                    />
                    <p className="text-xs text-gray-400 mt-1">1-14 天</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">选择宠物</label>
                    {pets.length === 0 ? (
                      <p className="text-sm text-gray-400">暂无宠物，请先添加宠物</p>
                    ) : (
                      <div className="space-y-2">
                        {pets.map((pet) => (
                          <label
                            key={pet.id}
                            className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                              selectedPetIds.includes(pet.id)
                                ? 'border-orange-400 bg-orange-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={selectedPetIds.includes(pet.id)}
                              onChange={() => togglePet(pet.id)}
                              className="w-4 h-4 rounded accent-orange-500"
                            />
                            <span className="text-sm text-gray-700">{pet.type === 'cat' ? '🐱' : '🐶'} {pet.name}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleFosterSubmit}
                    disabled={!fosterName.trim() || fosterDays < 1 || selectedPetIds.length === 0}
                    className="w-full py-2.5 rounded-xl bg-brand-orange text-white text-sm font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    确认托管
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
