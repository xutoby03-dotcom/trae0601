import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFamilyStore } from '@/stores/familyStore'
import CupCard from '@/components/CupCard'
import ReminderBanner from '@/components/ReminderBanner'
import { shouldShowReminder } from '@/utils/drinkUtils'
import { getEffectiveWater } from '@/types'
import { Plus, Droplets } from 'lucide-react'

export default function Home() {
  const members = useFamilyStore((s) => s.members)
  const records = useFamilyStore((s) => s.records)
  const quickRecord = useFamilyStore((s) => s.quickRecord)
  const navigate = useNavigate()
  const [reminders, setReminders] = useState<{ id: number; message: string; type: 'info' | 'warning' | 'success' }[]>([])
  const [reminderIdCounter, setReminderIdCounter] = useState(0)

  const todayRecords = useMemo(() => {
    const today = new Date()
    return records.filter((r) => {
      const rd = new Date(r.timestamp)
      return rd.getFullYear() === today.getFullYear() &&
        rd.getMonth() === today.getMonth() &&
        rd.getDate() === today.getDate()
    })
  }, [records])

  const familyReminders = useMemo(() => {
    const msgs: { message: string; type: 'info' | 'warning' | 'success' }[] = []
    members.forEach((member) => {
      const memberRecords = todayRecords.filter((r) => r.memberId === member.id)
      const lastRecordTime = memberRecords.length > 0
        ? Math.max(...memberRecords.map((r) => r.timestamp))
        : null
      const msg = shouldShowReminder(member, lastRecordTime)
      if (msg) msgs.push({ message: msg, type: member.limitWater ? 'warning' : 'info' })
    })
    return msgs
  }, [members, todayRecords])

  const totalFamilyIntake = useMemo(() => {
    return todayRecords.reduce((sum, r) => sum + getEffectiveWater(r.amount, r.drinkType), 0)
  }, [todayRecords])

  const totalFamilyGoal = useMemo(() => {
    return members.reduce((sum, m) => sum + m.dailyGoal, 0)
  }, [members])

  const showReminder = (message: string, type: 'info' | 'warning' | 'success' = 'success') => {
    const id = reminderIdCounter
    setReminderIdCounter((c) => c + 1)
    setReminders((prev) => [...prev, { id, message, type }])
  }

  const handleQuickRecord = (memberId: string) => {
    const member = members.find((m) => m.id === memberId)
    if (!member) return

    const before = todayRecords
      .filter((r) => r.memberId === memberId)
      .reduce((sum, r) => sum + getEffectiveWater(r.amount, r.drinkType), 0)

    quickRecord(memberId)

    const after = before + member.cupCapacity
    if (after >= member.dailyGoal && before < member.dailyGoal) {
      showReminder(`${member.name} 今日饮水达标！🎉`, 'success')
    } else if (member.limitWater && after >= member.dailyGoal * 0.9) {
      showReminder(`${member.name} 饮水接近上限，注意控制`, 'warning')
    } else {
      showReminder(`${member.name} +${member.cupCapacity}ml 💧`, 'info')
    }
  }

  const handleCupClick = (memberId: string) => {
    navigate(`/record/${memberId}`)
  }

  const now = new Date()
  const greeting = now.getHours() < 12 ? '早上好' : now.getHours() < 18 ? '下午好' : '晚上好'

  const sortedTodayRecords = useMemo(() => {
    return [...todayRecords].sort((a, b) => b.timestamp - a.timestamp)
  }, [todayRecords])

  return (
    <div className="min-h-screen pb-24">
      <div className="max-w-2xl mx-auto px-4 pt-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold font-display text-gradient">{greeting} 👋</h1>
          <p className="text-sm text-gray-400 mt-1 font-body">
            全家今日饮水 · {totalFamilyIntake}ml / {totalFamilyGoal}ml
          </p>
        </div>

        {reminders.length > 0 && (
          <div className="flex flex-col gap-2 mb-4">
            {reminders.map((r) => (
              <ReminderBanner
                key={r.id}
                message={r.message}
                type={r.type}
                onClose={() => setReminders((prev) => prev.filter((x) => x.id !== r.id))}
              />
            ))}
          </div>
        )}

        {familyReminders.length > 0 && (
          <div className="flex flex-col gap-2 mb-4">
            {familyReminders.slice(0, 2).map((r, i) => (
              <ReminderBanner
                key={`family-${i}`}
                message={r.message}
                type={r.type}
                duration={6000}
                onClose={() => {}}
              />
            ))}
          </div>
        )}

        {members.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-6xl mb-4 animate-float">🥤</div>
            <h2 className="text-xl font-bold font-display text-gray-600 mb-2">还没有家庭成员</h2>
            <p className="text-sm text-gray-400 mb-6">添加家庭成员，开始追踪饮水量</p>
            <button
              className="btn-ripple flex items-center gap-2 bg-ocean-300 text-white px-6 py-3 rounded-full font-display font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
              onClick={() => navigate('/members/new')}
            >
              <Plus size={20} />
              添加成员
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {members.map((member) => (
                <CupCard
                  key={member.id}
                  member={member}
                  onQuickRecord={handleQuickRecord}
                  onClick={handleCupClick}
                />
              ))}

              <div
                className="glass-card rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-2 border-dashed border-ocean-200 min-h-[200px]"
                onClick={() => navigate('/members/new')}
              >
                <Plus size={32} className="text-ocean-300 mb-2" />
                <span className="text-sm font-display text-ocean-400">添加成员</span>
              </div>
            </div>

            <div className="mt-6 glass-card rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Droplets size={16} className="text-ocean-400" />
                <span className="text-sm font-display font-semibold text-gray-600">今日饮水记录</span>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {sortedTodayRecords.slice(0, 8).map((record) => {
                  const member = members.find((m) => m.id === record.memberId)
                  if (!member) return null
                  return (
                    <div key={record.id} className="flex items-center gap-2 text-sm">
                      <span>{member.avatar}</span>
                      <span className="font-body text-gray-600">{member.name}</span>
                      <span className="font-display font-semibold" style={{ color: member.color }}>
                        +{record.amount}ml
                      </span>
                      <span className="text-gray-300 text-xs">
                        {new Date(record.timestamp).getHours()}:{String(new Date(record.timestamp).getMinutes()).padStart(2, '0')}
                      </span>
                    </div>
                  )
                })}
                {todayRecords.length === 0 && (
                  <p className="text-xs text-gray-300 text-center py-2">今天还没有记录</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
