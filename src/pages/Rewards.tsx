import { useState, useEffect, useCallback } from 'react'
import { Gift, Trophy, Flame, Plus, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'
import { useReadingStore } from '@/store'

function CircularProgress({
  current,
  total,
  size = 64,
  strokeWidth = 5,
}: {
  current: number
  total: number
  size?: number
  strokeWidth?: number
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progress = Math.min(current / total, 1)
  const offset = circumference - progress * circumference
  const color = progress >= 1 ? '#F59E0B' : '#FB923C'

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#FED7AA"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-500"
      />
    </svg>
  )
}

function ConfettiOverlay({ onDone }: { onDone: () => void }) {
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.3,
    color: ['#F59E0B', '#FB923C', '#FDBA74', '#F43F5E', '#10B981', '#3B82F6'][i % 6],
    size: 6 + Math.random() * 6,
  }))

  useEffect(() => {
    const timer = setTimeout(onDone, 1200)
    return () => clearTimeout(timer)
  }, [onDone])

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute animate-confetti"
          style={{
            left: `${p.left}%`,
            top: '30%',
            width: p.size,
            height: p.size,
            borderRadius: p.id % 3 === 0 ? '50%' : '2px',
            backgroundColor: p.color,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  )
}

export default function Rewards() {
  const {
    rewardRules,
    rewardAchievements,
    addRewardRule,
    updateRewardRule,
    deleteRewardRule,
    getOverallConsecutiveDays,
  } = useReadingStore()

  const consecutiveDays = getOverallConsecutiveDays()
  const [showForm, setShowForm] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [prevAchievementCount, setPrevAchievementCount] = useState(rewardAchievements.length)

  const [formName, setFormName] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formDays, setFormDays] = useState(7)
  const [formReward, setFormReward] = useState('')

  useEffect(() => {
    if (rewardAchievements.length > prevAchievementCount) {
      setShowConfetti(true)
    }
    setPrevAchievementCount(rewardAchievements.length)
  }, [rewardAchievements.length, prevAchievementCount])

  const handleSubmit = useCallback(() => {
    if (!formName.trim() || !formReward.trim() || formDays < 1) return
    addRewardRule({
      name: formName.trim(),
      description: formDescription.trim(),
      conditionType: 'consecutive_days',
      conditionDays: formDays,
      reward: formReward.trim(),
      enabled: true,
    })
    setFormName('')
    setFormDescription('')
    setFormDays(7)
    setFormReward('')
    setShowForm(false)
  }, [formName, formDescription, formDays, formReward, addRewardRule])

  const getRuleName = (ruleId: string) => {
    const rule = rewardRules.find((r) => r.id === ruleId)
    return rule?.name ?? '已删除的规则'
  }

  const getRuleReward = (ruleId: string) => {
    const rule = rewardRules.find((r) => r.id === ruleId)
    return rule?.reward ?? ''
  }

  return (
    <div className="min-h-screen bg-warm-50 pb-24">
      {showConfetti && <ConfettiOverlay onDone={() => setShowConfetti(false)} />}

      <div className="px-4 pt-6 max-w-lg mx-auto space-y-6">
        <h1 className="text-2xl font-bold font-display text-stone-800 text-center">
          奖励中心
        </h1>

        <div className="card text-center py-6 bg-gradient-to-br from-orange-50 to-amber-50 border-warm-200">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Flame className="w-8 h-8 text-orange-500" />
            <span className="text-4xl font-bold font-display text-warm-700">
              {consecutiveDays}
            </span>
          </div>
          <p className="text-stone-500 text-sm">当前连续阅读天数</p>
          {consecutiveDays >= 7 && (
            <span className="badge bg-orange-100 text-orange-600 mt-2">
              太棒了！坚持了 {consecutiveDays} 天
            </span>
          )}
        </div>

        <div>
          <h2 className="section-title flex items-center gap-2 mb-3">
            <Gift className="w-5 h-5 text-warm-500" />
            奖励规则
          </h2>

          {rewardRules.length === 0 ? (
            <div className="card text-center py-8 text-stone-400">
              <Gift className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p>还没有奖励规则</p>
              <p className="text-sm">点击下方按钮添加</p>
            </div>
          ) : (
            <div className="space-y-3">
              {rewardRules.map((rule) => {
                const progress = Math.min(consecutiveDays / rule.conditionDays, 1)
                const isComplete = progress >= 1

                return (
                  <div
                    key={rule.id}
                    className={`card ${!rule.enabled ? 'opacity-60' : ''} ${
                      isComplete ? 'border-orange-300 bg-orange-50/30' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative flex-shrink-0">
                        <CircularProgress
                          current={consecutiveDays}
                          total={rule.conditionDays}
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xs font-bold text-warm-700">
                            {Math.min(consecutiveDays, rule.conditionDays)}/{rule.conditionDays}
                          </span>
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-stone-800 truncate">
                            {rule.name}
                          </h3>
                          {isComplete && (
                            <span className="badge bg-amber-100 text-amber-700">
                              已达成
                            </span>
                          )}
                        </div>
                        {rule.description && (
                          <p className="text-xs text-stone-500 mb-1 line-clamp-1">
                            {rule.description}
                          </p>
                        )}
                        <p className="text-sm text-warm-600 flex items-center gap-1">
                          <Gift className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="truncate">{rule.reward}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          onClick={() => updateRewardRule(rule.id, { enabled: !rule.enabled })}
                          className="p-1 text-stone-400 hover:text-warm-500 transition-colors"
                        >
                          {rule.enabled ? (
                            <ToggleRight className="w-6 h-6 text-warm-500" />
                          ) : (
                            <ToggleLeft className="w-6 h-6" />
                          )}
                        </button>
                        <button
                          onClick={() => deleteRewardRule(rule.id)}
                          className="p-1 text-stone-300 hover:text-red-400 transition-colors"
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

        <div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-secondary w-full flex items-center justify-center gap-2"
          >
            <Plus className={`w-4 h-4 transition-transform ${showForm ? 'rotate-45' : ''}`} />
            {showForm ? '取消添加' : '添加奖励规则'}
          </button>

          {showForm && (
            <div className="card mt-3 space-y-3 animate-slide-up">
              <div>
                <label className="text-sm text-stone-600 mb-1 block">规则名称</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="例如：7天连续阅读"
                  className="input-field"
                />
              </div>
              <div>
                <label className="text-sm text-stone-600 mb-1 block">描述</label>
                <input
                  type="text"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="例如：连续阅读7天即可获得奖励"
                  className="input-field"
                />
              </div>
              <div>
                <label className="text-sm text-stone-600 mb-1 block">连续天数</label>
                <input
                  type="number"
                  min={1}
                  value={formDays}
                  onChange={(e) => setFormDays(Math.max(1, parseInt(e.target.value) || 1))}
                  className="input-field"
                />
              </div>
              <div>
                <label className="text-sm text-stone-600 mb-1 block">奖励内容</label>
                <input
                  type="text"
                  value={formReward}
                  onChange={(e) => setFormReward(e.target.value)}
                  placeholder="例如：周末去游乐场"
                  className="input-field"
                />
              </div>
              <button
                onClick={handleSubmit}
                disabled={!formName.trim() || !formReward.trim()}
                className="btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed"
              >
                确认添加
              </button>
            </div>
          )}
        </div>

        <div>
          <h2 className="section-title flex items-center gap-2 mb-3">
            <Trophy className="w-5 h-5 text-amber-500" />
            成就记录
          </h2>

          {rewardAchievements.length === 0 ? (
            <div className="card text-center py-8 text-stone-400">
              <Trophy className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p>还没有达成奖励</p>
              <p className="text-sm">坚持阅读，赢取奖励吧！</p>
            </div>
          ) : (
            <div className="space-y-2">
              {[...rewardAchievements]
                .sort((a, b) => b.achievedAt.localeCompare(a.achievedAt))
                .map((achievement) => (
                  <div key={achievement.id} className="card flex items-center gap-3 py-3">
                    <Trophy className="w-5 h-5 text-amber-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-stone-800 truncate">
                        {getRuleName(achievement.ruleId)}
                      </p>
                      {getRuleReward(achievement.ruleId) && (
                        <p className="text-xs text-warm-600 truncate">
                          {getRuleReward(achievement.ruleId)}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-stone-400 flex-shrink-0">
                      {new Date(achievement.achievedAt).toLocaleDateString('zh-CN', {
                        month: 'numeric',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
