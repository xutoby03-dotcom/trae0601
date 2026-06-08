import { useKitchenStore } from '@/store/kitchenStore'
import { Trophy, AlertTriangle, Activity, TrendingUp, ClipboardList } from 'lucide-react'

const FREQUENCY_LABEL: Record<string, string> = {
  daily: '每天',
  weekly: '每周',
  biweekly: '每两周',
  monthly: '每月',
}

export default function Stats() {
  const { getMemberStats, getDelayedTasks, getKitchenHealthScore, getMemberById, tasks, completionRecords, members } = useKitchenStore()

  const memberStats = getMemberStats()
  const delayedTasks = getDelayedTasks()
  const healthScore = getKitchenHealthScore()
  const totalCompleted = completionRecords.length
  const totalActive = tasks.filter((t) => !t.isCompleted).length
  const overdueCount = tasks.filter((t) => {
    const due = new Date(t.nextDueDate)
    return !t.isCompleted && due < new Date()
  }).length

  const recentRecords = [...completionRecords]
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
    .slice(0, 5)

  const maxCompleted = Math.max(...memberStats.map((m) => m.completedCount), 1)

  const healthColor = healthScore >= 80 ? '#10B981' : healthScore >= 50 ? '#F59E0B' : '#EF4444'
  const healthLabel = healthScore >= 80 ? '干净整洁' : healthScore >= 50 ? '需要关注' : '急需打扫'

  const circumference = 2 * Math.PI * 45
  const strokeDashoffset = circumference - (healthScore / 100) * circumference

  return (
    <div className="min-h-screen pb-20">
      <header className="metal-bar sticky top-0 z-40">
        <div className="max-w-[1200px] mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📊</span>
            <h1 className="font-handwritten text-2xl font-bold text-white drop-shadow-sm">
              厨房清洁统计
            </h1>
          </div>
        </div>
      </header>

      <div className="chalkboard-bg min-h-[calc(100vh-56px)]">
        <div className="max-w-[1200px] mx-auto px-4 py-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white/5 rounded-xl p-5 border border-white/10">
              <div className="flex items-center gap-2 mb-4">
                <Activity size={18} className="chalk-text" />
                <h2 className="font-handwritten text-xl chalk-text font-bold">厨房健康度</h2>
              </div>

              <div className="flex items-center justify-center py-4">
                <div className="relative">
                  <svg width="120" height="120" className="-rotate-90">
                    <circle
                      cx="60"
                      cy="60"
                      r="45"
                      fill="none"
                      stroke="rgba(255,255,255,0.1)"
                      strokeWidth="10"
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r="45"
                      fill="none"
                      stroke={healthColor}
                      strokeWidth="10"
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      style={{ transition: 'stroke-dashoffset 1.5s ease-out' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold chalk-text font-handwritten">{healthScore}</span>
                    <span className="text-xs chalk-text opacity-70">{healthLabel}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-2">
                <div className="text-center">
                  <div className="text-lg font-bold chalk-text font-handwritten">{totalActive}</div>
                  <div className="text-xs chalk-text opacity-60">待完成</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold chalk-text font-handwritten">{totalCompleted}</div>
                  <div className="text-xs chalk-text opacity-60">已完成</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-red-400 font-handwritten">{overdueCount}</div>
                  <div className="text-xs chalk-text opacity-60">逾期</div>
                </div>
              </div>
            </div>

            <div className="bg-white/5 rounded-xl p-5 border border-white/10">
              <div className="flex items-center gap-2 mb-4">
                <Trophy size={18} className="text-amber-400" />
                <h2 className="font-handwritten text-xl chalk-text font-bold">劳动英雄榜</h2>
              </div>

              {memberStats.length === 0 ? (
                <p className="chalk-text opacity-50 text-center py-8 font-handwritten text-lg">暂无数据</p>
              ) : (
                <div className="space-y-3">
                  {memberStats.map((m, i) => (
                    <div key={m.memberId} className="flex items-center gap-3">
                      <span className="font-handwritten text-lg chalk-text w-6 text-center">
                        {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
                      </span>
                      <span
                        className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0"
                        style={{ backgroundColor: m.color + '40', border: `2px solid ${m.color}` }}
                      >
                        {m.avatar}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="chalk-text text-sm font-medium truncate">{m.name}</span>
                          <span className="chalk-text text-xs opacity-70">{m.completedCount}次</span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                              width: `${(m.completedCount / maxCompleted) * 100}%`,
                              backgroundColor: m.color,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white/5 rounded-xl p-5 border border-white/10">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle size={18} className="text-red-400" />
                <h2 className="font-handwritten text-xl chalk-text font-bold">拖延黑名单</h2>
              </div>

              {delayedTasks.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-3xl mb-2">🎉</div>
                  <p className="chalk-text opacity-50 font-handwritten text-lg">没人拖延！</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {delayedTasks.slice(0, 5).map(({ task, delayDays }) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2"
                    >
                      <span className="chalk-text text-sm truncate flex-1">{task.name}</span>
                      <span className="text-red-400 text-xs font-bold ml-2 flex-shrink-0">
                        拖延{delayDays}次
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-5 border border-white/10">
            <div className="flex items-center gap-2 mb-4">
              <ClipboardList size={18} className="text-sky-400" />
              <h2 className="font-handwritten text-xl chalk-text font-bold">当前派工</h2>
            </div>

            {tasks.length === 0 ? (
              <p className="chalk-text opacity-50 text-center py-8 font-handwritten text-lg">暂无任务</p>
            ) : (
              <div className="space-y-2">
                {tasks.map((task) => {
                  const member = task.assignedMemberId ? getMemberById(task.assignedMemberId) : undefined
                  return (
                    <div
                      key={task.id}
                      className="flex items-center gap-3 bg-white/5 rounded-lg px-3 py-2.5"
                    >
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${task.isCompleted ? 'bg-green-400' : 'bg-amber-400'}`} />
                      <span className={`chalk-text text-sm truncate flex-1 ${task.isCompleted ? 'line-through opacity-50' : ''}`}>
                        {task.name}
                      </span>
                      <span className="chalk-text opacity-40 text-xs flex-shrink-0">
                        {FREQUENCY_LABEL[task.frequency]}
                      </span>
                      {task.rotationType === 'auto-assign' && (
                        <span className="text-sky-400/80 text-[10px] bg-sky-400/10 px-1.5 py-0.5 rounded flex-shrink-0">自动</span>
                      )}
                      {member ? (
                        <span className="flex items-center gap-1.5 flex-shrink-0">
                          <span
                            className="w-5 h-5 rounded-full flex items-center justify-center text-[10px]"
                            style={{ backgroundColor: member.color + '40', border: `2px solid ${member.color}` }}
                          >
                            {member.avatar}
                          </span>
                          <span className="chalk-text text-xs">{member.name}</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 flex-shrink-0">
                          <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] bg-gray-500/30 border-2 border-gray-500">🤖</span>
                          <span className="chalk-text text-xs opacity-50">待分配</span>
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="bg-white/5 rounded-xl p-5 border border-white/10">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={18} className="text-green-400" />
              <h2 className="font-handwritten text-xl chalk-text font-bold">最近完成记录</h2>
            </div>

            {recentRecords.length === 0 ? (
              <p className="chalk-text opacity-50 text-center py-8 font-handwritten text-lg">还没有完成记录</p>
            ) : (
              <div className="space-y-2">
                {recentRecords.map((r) => {
                  const task = tasks.find((t) => t.id === r.taskId)
                  const member = useKitchenStore.getState().members.find((m) => m.id === r.memberId)
                  return (
                    <div
                      key={r.id}
                      className="flex items-center gap-3 bg-white/5 rounded-lg px-3 py-2"
                    >
                      <span className="chalk-text opacity-60 text-xs flex-shrink-0">
                        {new Date(r.completedAt).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {member && (
                        <span
                          className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] flex-shrink-0"
                          style={{ backgroundColor: member.color + '40', border: `2px solid ${member.color}` }}
                        >
                          {member.avatar}
                        </span>
                      )}
                      <span className="chalk-text text-sm truncate flex-1">{task?.name || '未知任务'}</span>
                      {r.note && (
                        <span className="chalk-text opacity-50 text-xs truncate max-w-[120px]">{r.note}</span>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
