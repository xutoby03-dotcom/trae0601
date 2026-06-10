import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useFamilyStore } from '@/stores/familyStore'
import { MEMBER_COLORS, MEMBER_AVATARS } from '@/types'
import type { Member } from '@/types'
import { ArrowLeft, Check } from 'lucide-react'

const TIME_PERIODS = [
  '早起 6-8点', '上午 8-10点', '上午 10-12点',
  '下午 12-14点', '下午 14-16点', '下午 16-18点',
  '傍晚 18-20点', '晚间 20-22点',
]

export default function MemberForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const members = useFamilyStore((s) => s.members)
  const addMember = useFamilyStore((s) => s.addMember)
  const updateMember = useFamilyStore((s) => s.updateMember)

  const isEdit = Boolean(id)
  const existingMember = isEdit ? members.find((m) => m.id === id) : null

  const [name, setName] = useState(existingMember?.name ?? '')
  const [age, setAge] = useState(existingMember?.age ?? 30)
  const [dailyGoal, setDailyGoal] = useState(existingMember?.dailyGoal ?? 2000)
  const [cupCapacity, setCupCapacity] = useState(existingMember?.cupCapacity ?? 250)
  const [limitWater, setLimitWater] = useState(existingMember?.limitWater ?? false)
  const [reminderPeriods, setReminderPeriods] = useState<string[]>(existingMember?.reminderPeriods ?? ['上午 8-10点', '下午 14-16点'])
  const [avatar, setAvatar] = useState(existingMember?.avatar ?? MEMBER_AVATARS[0])
  const [color, setColor] = useState(existingMember?.color ?? MEMBER_COLORS[0])

  useEffect(() => {
    if (isEdit && !existingMember) {
      navigate('/members')
    }
  }, [isEdit, existingMember, navigate])

  const togglePeriod = (period: string) => {
    setReminderPeriods((prev) =>
      prev.includes(period) ? prev.filter((p) => p !== period) : [...prev, period]
    )
  }

  const getRecommendedGoal = () => {
    if (age < 6) return 1000
    if (age < 18) return 1500
    if (age < 65) return 2000
    return 1600
  }

  const handleSubmit = () => {
    if (!name.trim()) return

    if (isEdit && existingMember) {
      updateMember(id!, { name, age, dailyGoal, cupCapacity, limitWater, reminderPeriods, avatar, color })
    } else {
      addMember({ name, age, dailyGoal, cupCapacity, limitWater, reminderPeriods, avatar, color })
    }
    navigate('/members')
  }

  return (
    <div className="min-h-screen pb-24">
      <div className="max-w-2xl mx-auto px-4 pt-6">
        <div className="flex items-center gap-3 mb-6">
          <button
            className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/60 hover:bg-white transition-all"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <h1 className="text-xl font-bold font-display text-gradient">
            {isEdit ? '编辑成员' : '添加成员'}
          </h1>
        </div>

        <div className="space-y-5">
          <div className="glass-card rounded-2xl p-5">
            <label className="text-sm font-display font-semibold text-gray-600 mb-3 block">头像</label>
            <div className="flex gap-2 flex-wrap">
              {MEMBER_AVATARS.map((a) => (
                <button
                  key={a}
                  className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${
                    avatar === a ? 'bg-ocean-100 ring-2 ring-ocean-300 scale-110' : 'bg-white/60 hover:bg-white/90'
                  }`}
                  onClick={() => setAvatar(a)}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          <div className="glass-card rounded-2xl p-5">
            <label className="text-sm font-display font-semibold text-gray-600 mb-2 block">姓名</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="输入姓名"
              className="w-full px-4 py-2.5 rounded-xl bg-white/60 border border-gray-100 focus:border-ocean-300 focus:ring-2 focus:ring-ocean-100 outline-none font-body text-gray-700 transition-all"
            />
          </div>

          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-display font-semibold text-gray-600">年龄</label>
              <span className="text-sm font-display font-bold text-ocean-400">{age}岁</span>
            </div>
            <input
              type="range"
              min="1"
              max="100"
              value={age}
              onChange={(e) => setAge(Number(e.target.value))}
              className="w-full accent-ocean-300"
            />
            <div className="flex justify-between text-xs text-gray-300 mt-1">
              <span>1岁</span>
              <span>100岁</span>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-display font-semibold text-gray-600">每日目标饮水量</label>
              <span className="text-sm font-display font-bold text-ocean-400">{dailyGoal}ml</span>
            </div>
            <input
              type="range"
              min="500"
              max="4000"
              step="100"
              value={dailyGoal}
              onChange={(e) => setDailyGoal(Number(e.target.value))}
              className="w-full accent-ocean-300"
            />
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-gray-300">500ml</span>
              <button
                className="text-xs text-ocean-400 hover:text-ocean-600 font-display"
                onClick={() => setDailyGoal(getRecommendedGoal())}
              >
                推荐 {getRecommendedGoal()}ml
              </button>
              <span className="text-xs text-gray-300">4000ml</span>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-display font-semibold text-gray-600">常用杯容量</label>
              <span className="text-sm font-display font-bold text-ocean-400">{cupCapacity}ml</span>
            </div>
            <div className="flex gap-2 mb-2">
              {[150, 200, 250, 300, 350, 500].map((cap) => (
                <button
                  key={cap}
                  className={`px-3 py-1.5 rounded-lg text-xs font-display font-medium transition-all ${
                    cupCapacity === cap
                      ? 'bg-ocean-300 text-white shadow-sm'
                      : 'bg-white/60 text-gray-500 hover:bg-white/90'
                  }`}
                  onClick={() => setCupCapacity(cap)}
                >
                  {cap}ml
                </button>
              ))}
            </div>
            <input
              type="range"
              min="50"
              max="800"
              step="10"
              value={cupCapacity}
              onChange={(e) => setCupCapacity(Number(e.target.value))}
              className="w-full accent-ocean-300"
            />
          </div>

          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-display font-semibold text-gray-600">需要限制饮水量</label>
                <p className="text-xs text-gray-400 mt-0.5">适用于需要控制饮水量的成员</p>
              </div>
              <button
                className={`w-12 h-7 rounded-full transition-all duration-300 relative ${
                  limitWater ? 'bg-coral-400' : 'bg-gray-200'
                }`}
                onClick={() => setLimitWater(!limitWater)}
              >
                <div
                  className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-all duration-300 ${
                    limitWater ? 'left-5.5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-5">
            <label className="text-sm font-display font-semibold text-gray-600 mb-3 block">提醒时段</label>
            <div className="flex gap-2 flex-wrap">
              {TIME_PERIODS.map((period) => (
                <button
                  key={period}
                  className={`px-3 py-1.5 rounded-lg text-xs font-display font-medium transition-all ${
                    reminderPeriods.includes(period)
                      ? 'bg-ocean-300 text-white shadow-sm'
                      : 'bg-white/60 text-gray-400 hover:bg-white/90'
                  }`}
                  onClick={() => togglePeriod(period)}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>

          <div className="glass-card rounded-2xl p-5">
            <label className="text-sm font-display font-semibold text-gray-600 mb-3 block">代表颜色</label>
            <div className="flex gap-2">
              {MEMBER_COLORS.map((c) => (
                <button
                  key={c}
                  className={`w-8 h-8 rounded-full transition-all ${
                    color === c ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : 'hover:scale-105'
                  }`}
                  style={{ background: c }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
          </div>

          <button
            className="btn-ripple w-full flex items-center justify-center gap-2 bg-ocean-300 text-white py-3.5 rounded-2xl font-display font-bold text-base shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
            onClick={handleSubmit}
            disabled={!name.trim()}
          >
            <Check size={20} />
            {isEdit ? '保存修改' : '添加成员'}
          </button>
        </div>
      </div>
    </div>
  )
}
