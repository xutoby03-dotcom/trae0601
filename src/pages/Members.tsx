import { useNavigate } from 'react-router-dom'
import { useFamilyStore } from '@/stores/familyStore'
import { Pencil, Trash2, Plus } from 'lucide-react'

export default function Members() {
  const members = useFamilyStore((s) => s.members)
  const removeMember = useFamilyStore((s) => s.removeMember)
  const getDailyTotal = useFamilyStore((s) => s.getMemberDailyWaterTotal)
  const navigate = useNavigate()

  return (
    <div className="min-h-screen pb-24">
      <div className="max-w-2xl mx-auto px-4 pt-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold font-display text-gradient">家庭成员</h1>
            <p className="text-sm text-gray-400 mt-1 font-body">管理家庭成员和饮水目标</p>
          </div>
          <button
            className="btn-ripple flex items-center gap-1.5 bg-ocean-300 text-white px-4 py-2 rounded-full font-display font-semibold text-sm shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-95"
            onClick={() => navigate('/members/new')}
          >
            <Plus size={16} />
            添加
          </button>
        </div>

        {members.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="text-5xl mb-4">👨‍👩‍👧‍👦</div>
            <h2 className="text-lg font-bold font-display text-gray-500 mb-2">还没有家庭成员</h2>
            <p className="text-sm text-gray-400 mb-4">点击上方"添加"按钮开始</p>
          </div>
        ) : (
          <div className="space-y-3">
            {members.map((member) => {
              const dailyTotal = getDailyTotal(member.id)
              const progress = Math.min(dailyTotal / member.dailyGoal, 1)
              const percent = Math.round(progress * 100)

              return (
                <div
                  key={member.id}
                  className="glass-card rounded-2xl p-4 transition-all duration-300 hover:shadow-md"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-3xl">{member.avatar}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-display font-semibold text-gray-700">{member.name}</span>
                        <span className="text-xs text-gray-400">{member.age}岁</span>
                        {member.limitWater && (
                          <span className="text-[10px] bg-coral-400/15 text-coral-500 px-1.5 py-0.5 rounded-full font-display">
                            限量
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${percent}%`,
                              background: `linear-gradient(90deg, ${member.color}80, ${member.color})`,
                            }}
                          />
                        </div>
                        <span className="text-xs font-display font-semibold" style={{ color: member.color }}>
                          {percent}%
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
                        <span>目标 {member.dailyGoal}ml</span>
                        <span>·</span>
                        <span>杯量 {member.cupCapacity}ml</span>
                        <span>·</span>
                        <span>已喝 {dailyTotal}ml</span>
                      </div>
                      {member.reminderPeriods.length > 0 && (
                        <div className="flex gap-1 mt-1.5 flex-wrap">
                          {member.reminderPeriods.map((period) => (
                            <span key={period} className="text-[10px] bg-ocean-50 text-ocean-500 px-1.5 py-0.5 rounded-full font-display">
                              {period}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-ocean-400 hover:bg-ocean-50 transition-all"
                        onClick={() => navigate(`/members/${member.id}/edit`)}
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-coral-400 hover:bg-coral-50 transition-all"
                        onClick={() => {
                          if (confirm(`确定删除 ${member.name} 吗？`)) {
                            removeMember(member.id)
                          }
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
