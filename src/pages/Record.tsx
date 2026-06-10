import { useState, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useFamilyStore } from '@/stores/familyStore'
import DrinkTypeSelector from '@/components/DrinkTypeSelector'
import ScenarioSelector from '@/components/ScenarioSelector'
import ReminderBanner from '@/components/ReminderBanner'
import type { DrinkType, Scenario } from '@/types'
import { DRINK_TYPE_CONFIG, getEffectiveWater } from '@/types'
import { ArrowLeft, Check, Clock, Minus, Plus, History } from 'lucide-react'

export default function Record() {
  const { memberId } = useParams()
  const navigate = useNavigate()
  const members = useFamilyStore((s) => s.members)
  const addRecord = useFamilyStore((s) => s.addRecord)
  const getMemberDailyWaterTotal = useFamilyStore((s) => s.getMemberDailyWaterTotal)
  const getMemberRecords = useFamilyStore((s) => s.getMemberRecords)

  const [selectedMemberId, setSelectedMemberId] = useState(memberId ?? (members[0]?.id ?? ''))
  const [drinkType, setDrinkType] = useState<DrinkType>('water')
  const [amount, setAmount] = useState(250)
  const [scenarios, setScenarios] = useState<Scenario[]>(['normal'])
  const [showRetro, setShowRetro] = useState(false)
  const [retroDate, setRetroDate] = useState('')
  const [retroTime, setRetroTime] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const selectedMember = members.find((m) => m.id === selectedMemberId)

  useMemo(() => {
    if (selectedMember && !memberId) {
      setAmount(selectedMember.cupCapacity)
    }
  }, [selectedMember, memberId])

  useMemo(() => {
    if (memberId && members.length > 0 && !selectedMemberId) {
      setSelectedMemberId(memberId)
    }
  }, [memberId, members, selectedMemberId])

  const effectiveWater = useMemo(() => {
    return getEffectiveWater(amount, drinkType)
  }, [amount, drinkType])

  const currentTotal = useMemo(() => {
    if (!selectedMemberId) return 0
    return getMemberDailyWaterTotal(selectedMemberId)
  }, [selectedMemberId, getMemberDailyWaterTotal])

  const todayRecords = useMemo(() => {
    if (!selectedMemberId) return []
    return getMemberRecords(selectedMemberId)
  }, [selectedMemberId, getMemberRecords])

  const handleAmountChange = (delta: number) => {
    setAmount((prev) => Math.max(10, Math.min(2000, prev + delta)))
  }

  const handleSubmit = () => {
    if (!selectedMemberId) return

    let timestamp = Date.now()
    if (showRetro && retroDate && retroTime) {
      timestamp = new Date(`${retroDate}T${retroTime}`).getTime()
    }

    addRecord({
      memberId: selectedMemberId,
      amount,
      drinkType,
      scenarios,
      timestamp,
    })

    const config = DRINK_TYPE_CONFIG[drinkType]
    const member = members.find((m) => m.id === selectedMemberId)
    const name = member?.name ?? ''
    const water = getEffectiveWater(amount, drinkType)

    let msg = `${name} +${amount}ml ${config.label}（≈${water}ml 白水）`
    if (scenarios.includes('exercise')) msg += ' 🏃运动后补充'
    if (scenarios.includes('cold')) msg += ' 🤧感冒期间多喝水'
    if (showRetro) msg += ' 📝补记'

    setSuccessMsg(msg)
    setTimeout(() => setSuccessMsg(''), 3000)

    setAmount(selectedMember?.cupCapacity ?? 250)
    setDrinkType('water')
    setScenarios(['normal'])
    setShowRetro(false)
    setRetroDate('')
    setRetroTime('')
  }

  return (
    <div className="min-h-screen pb-24">
      <div className="max-w-2xl mx-auto px-4 pt-6">
        <div className="flex items-center gap-3 mb-6">
          <button
            className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/60 hover:bg-white transition-all"
            onClick={() => navigate('/')}
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <h1 className="text-xl font-bold font-display text-gradient">记录饮水</h1>
        </div>

        {successMsg && (
          <div className="mb-4">
            <ReminderBanner message={successMsg} type="success" onClose={() => setSuccessMsg('')} />
          </div>
        )}

        {scenarios.includes('exercise') && (
          <div className="mb-4">
            <ReminderBanner message="运动后建议额外补充 200-300ml 水分 💧" type="info" duration={5000} onClose={() => {}} />
          </div>
        )}

        {scenarios.includes('cold') && (
          <div className="mb-4">
            <ReminderBanner message="感冒期间请增加饮水频率，多记录 🤧💧" type="info" duration={5000} onClose={() => {}} />
          </div>
        )}

        {scenarios.includes('bedtime') && selectedMember?.limitWater && (
          <div className="mb-4">
            <ReminderBanner message="该成员需要限制饮水，睡前请注意控制量 🌙" type="warning" duration={5000} onClose={() => {}} />
          </div>
        )}

        {members.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="text-5xl mb-4">👥</div>
            <h2 className="text-lg font-bold font-display text-gray-500 mb-2">请先添加家庭成员</h2>
            <button
              className="btn-ripple flex items-center gap-2 bg-ocean-300 text-white px-4 py-2 rounded-full font-display font-semibold text-sm shadow-md mt-4"
              onClick={() => navigate('/members/new')}
            >
              去添加
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="glass-card rounded-2xl p-4">
              <label className="text-sm font-display font-semibold text-gray-600 mb-3 block">选择成员</label>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {members.map((member) => (
                  <button
                    key={member.id}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all whitespace-nowrap ${
                      selectedMemberId === member.id
                        ? 'shadow-md scale-105'
                        : 'bg-white/50 hover:bg-white/80'
                    }`}
                    style={{
                      borderColor: selectedMemberId === member.id ? member.color : 'transparent',
                      borderWidth: '2px',
                      background: selectedMemberId === member.id ? `${member.color}10` : undefined,
                    }}
                    onClick={() => {
                      setSelectedMemberId(member.id)
                      setAmount(member.cupCapacity)
                    }}
                  >
                    <span className="text-xl">{member.avatar}</span>
                    <span className="text-sm font-display font-medium" style={{ color: selectedMemberId === member.id ? member.color : '#666' }}>
                      {member.name}
                    </span>
                  </button>
                ))}
              </div>
              {selectedMember && (
                <div className="mt-2 text-xs text-gray-400">
                  今日已喝 {currentTotal}ml / 目标 {selectedMember.dailyGoal}ml
                </div>
              )}
            </div>

            <div className="glass-card rounded-2xl p-4">
              <label className="text-sm font-display font-semibold text-gray-600 mb-3 block">饮品类型</label>
              <DrinkTypeSelector value={drinkType} onChange={setDrinkType} />
              <div className="mt-2 text-xs text-gray-400 text-center">
                实际折算白水 ≈ {effectiveWater}ml（{Math.round(DRINK_TYPE_CONFIG[drinkType].ratio * 100)}%）
              </div>
            </div>

            <div className="glass-card rounded-2xl p-4">
              <label className="text-sm font-display font-semibold text-gray-600 mb-3 block">饮水量</label>
              <div className="flex items-center justify-center gap-4">
                <button
                  className="w-10 h-10 rounded-full bg-white/60 flex items-center justify-center hover:bg-white transition-all active:scale-90"
                  onClick={() => handleAmountChange(-50)}
                >
                  <Minus size={18} className="text-gray-500" />
                </button>
                <div className="text-center">
                  <div className="text-3xl font-display font-bold text-gradient">{amount}</div>
                  <div className="text-xs text-gray-400">ml</div>
                </div>
                <button
                  className="w-10 h-10 rounded-full bg-white/60 flex items-center justify-center hover:bg-white transition-all active:scale-90"
                  onClick={() => handleAmountChange(50)}
                >
                  <Plus size={18} className="text-gray-500" />
                </button>
              </div>
              <div className="flex gap-2 justify-center mt-3">
                {[100, 150, 200, 250, 300, 500].map((v) => (
                  <button
                    key={v}
                    className={`px-2.5 py-1 rounded-lg text-xs font-display font-medium transition-all ${
                      amount === v ? 'bg-ocean-300 text-white' : 'bg-white/60 text-gray-400 hover:bg-white/90'
                    }`}
                    onClick={() => setAmount(v)}
                  >
                    {v}ml
                  </button>
                ))}
              </div>
            </div>

            <div className="glass-card rounded-2xl p-4">
              <label className="text-sm font-display font-semibold text-gray-600 mb-3 block">场景标签</label>
              <ScenarioSelector value={scenarios} onChange={setScenarios} />
            </div>

            <div className="glass-card rounded-2xl p-4">
              <button
                className="flex items-center gap-2 text-sm font-display font-semibold text-gray-600"
                onClick={() => setShowRetro(!showRetro)}
              >
                <Clock size={16} className="text-lavender-400" />
                补记过去饮水
                <span className={`text-xs transition-transform ${showRetro ? 'rotate-180' : ''}`}>▼</span>
              </button>
              {showRetro && (
                <div className="mt-3 space-y-3 animate-slide-down">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">日期</label>
                    <input
                      type="date"
                      value={retroDate}
                      onChange={(e) => setRetroDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white/60 border border-gray-100 text-sm font-body focus:border-ocean-300 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">时间</label>
                    <input
                      type="time"
                      value={retroTime}
                      onChange={(e) => setRetroTime(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white/60 border border-gray-100 text-sm font-body focus:border-ocean-300 outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {todayRecords.length > 0 && (
              <div className="glass-card rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <History size={14} className="text-gray-400" />
                  <span className="text-sm font-display font-semibold text-gray-600">今日记录</span>
                </div>
                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                  {[...todayRecords].sort((a, b) => b.timestamp - a.timestamp).map((record) => (
                    <div key={record.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: `${DRINK_TYPE_CONFIG[record.drinkType].color}20`, color: DRINK_TYPE_CONFIG[record.drinkType].color }}>
                          {DRINK_TYPE_CONFIG[record.drinkType].label}
                        </span>
                        <span className="font-display font-semibold text-gray-600">{record.amount}ml</span>
                      </div>
                      <span className="text-xs text-gray-300">
                        {new Date(record.timestamp).getHours()}:{String(new Date(record.timestamp).getMinutes()).padStart(2, '0')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              className="btn-ripple w-full flex items-center justify-center gap-2 bg-ocean-300 text-white py-3.5 rounded-2xl font-display font-bold text-base shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              onClick={handleSubmit}
              disabled={!selectedMemberId}
            >
              <Check size={20} />
              记录饮水
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
