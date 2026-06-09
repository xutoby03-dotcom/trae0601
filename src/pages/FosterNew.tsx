import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ClipboardList, ChevronLeft, ChevronRight, Plus, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useStore } from '@/store'
import { generateId } from '@/utils/helpers'
import { categoryLabels } from '@/utils/helpers'
import type { Medication, Taboo, Supply } from '@/types'

const STEPS = ['基本信息', '喂食计划', '清洁计划', '外出计划', '健康观察']

export default function FosterNew() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { pets, addFoster } = useStore()

  const preselectedPetId = searchParams.get('petId') || ''
  const [step, setStep] = useState(0)

  const [petId, setPetId] = useState(preselectedPetId)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [pickupMethod, setPickupMethod] = useState('')
  const [feederName, setFeederName] = useState('')
  const [feederPhone, setFeederPhone] = useState('')

  const [dailyAmount, setDailyAmount] = useState('')
  const [schedule, setSchedule] = useState('')
  const [feedingNotes, setFeedingNotes] = useState('')

  const [bathFrequency, setBathFrequency] = useState('')
  const [litterFrequency, setLitterFrequency] = useState('')
  const [supplyLocations, setSupplyLocations] = useState('')

  const [walkTime, setWalkTime] = useState('')
  const [route, setRoute] = useState('')
  const [leashLocation, setLeashLocation] = useState('')

  const [medications, setMedications] = useState<Medication[]>([])
  const [taboos, setTaboos] = useState<Taboo[]>([])
  const [supplies, setSupplies] = useState<Supply[]>([])

  const selectedPet = pets.find((p) => p.id === petId)
  const isDog = selectedPet?.type === 'dog'
  const effectiveStep = !isDog && step === 3 ? 4 : step
  const totalSteps = isDog ? 5 : 4

  const addMedication = () =>
    setMedications([...medications, { id: generateId(), name: '', dosage: '', frequency: '' }])
  const removeMedication = (id: string) => setMedications(medications.filter((m) => m.id !== id))
  const updateMedication = (id: string, field: keyof Medication, value: string) =>
    setMedications(medications.map((m) => (m.id === id ? { ...m, [field]: value } : m)))

  const addTaboo = () =>
    setTaboos([...taboos, { id: generateId(), content: '', category: 'feeding' }])
  const removeTaboo = (id: string) => setTaboos(taboos.filter((t) => t.id !== id))
  const updateTaboo = (id: string, field: keyof Taboo, value: string) =>
    setTaboos(taboos.map((t) => (t.id === id ? { ...t, [field]: value } : t)))

  const addSupply = () =>
    setSupplies([...supplies, { id: generateId(), name: '', remainingDays: 0, totalDays: 0 }])
  const removeSupply = (id: string) => setSupplies(supplies.filter((s) => s.id !== id))
  const updateSupply = (id: string, field: keyof Supply, value: string | number) =>
    setSupplies(supplies.map((s) => (s.id === id ? { ...s, [field]: value } : s)))

  const handleSubmit = () => {
    const id = generateId()
    const foster = {
      id,
      petId,
      startDate,
      endDate,
      pickupMethod,
      feederName,
      feederPhone,
      feedingPlan: { dailyAmount, schedule, notes: feedingNotes },
      walkPlan: isDog ? { walkTime, route, leashLocation } : null,
      cleanPlan: { bathFrequency, litterFrequency, supplyLocations },
      medications,
      taboos,
      supplies,
    }
    addFoster(foster)
    navigate(`/foster/${id}`)
  }

  const canNext = () => {
    if (step === 0) return petId && startDate && endDate && feederName && feederPhone
    if (step === 1) return dailyAmount && schedule
    if (step === 2) return bathFrequency && litterFrequency
    return true
  }

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-6">
      {Array.from({ length: totalSteps }).map((_, i) => {
        const isActive = i <= effectiveStep
        return (
          <div key={i} className="flex items-center gap-2">
            <div
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all',
                isActive ? 'bg-warm-500 text-white' : 'bg-warm-100 text-warm-400'
              )}
            >
              {i + 1}
            </div>
            {i < totalSteps - 1 && (
              <div className={cn('w-8 h-0.5', i < effectiveStep ? 'bg-warm-500' : 'bg-warm-200')} />
            )}
          </div>
        )
      })}
    </div>
  )

  const renderBasicInfo = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-warm-700 mb-1">选择宠物</label>
        <select className={cn('input-field')} value={petId} onChange={(e) => setPetId(e.target.value)}>
          <option value="">请选择宠物</option>
          {pets.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.breed})
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-warm-700 mb-1">开始日期</label>
          <input type="date" className="input-field" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-warm-700 mb-1">结束日期</label>
          <input type="date" className="input-field" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-warm-700 mb-1">接送方式</label>
        <input className="input-field" placeholder="如：自行送达到店" value={pickupMethod} onChange={(e) => setPickupMethod(e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-warm-700 mb-1">寄养人姓名</label>
          <input className="input-field" placeholder="姓名" value={feederName} onChange={(e) => setFeederName(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-warm-700 mb-1">联系电话</label>
          <input className="input-field" placeholder="手机号" value={feederPhone} onChange={(e) => setFeederPhone(e.target.value)} />
        </div>
      </div>
    </div>
  )

  const renderFeedingPlan = () => (
    <div className="bg-leaf-50 rounded-xl p-5 space-y-4">
      <div>
        <label className="block text-sm font-medium text-leaf-500 mb-1">每日喂食量</label>
        <input className="input-field" placeholder="如：80g/天" value={dailyAmount} onChange={(e) => setDailyAmount(e.target.value)} />
      </div>
      <div>
        <label className="block text-sm font-medium text-leaf-500 mb-1">喂食时间表</label>
        <input className="input-field" placeholder="如：早8点、晚6点" value={schedule} onChange={(e) => setSchedule(e.target.value)} />
      </div>
      <div>
        <label className="block text-sm font-medium text-leaf-500 mb-1">备注</label>
        <textarea className="input-field min-h-[80px]" placeholder="其他喂食注意事项" value={feedingNotes} onChange={(e) => setFeedingNotes(e.target.value)} />
      </div>
    </div>
  )

  const renderCleanPlan = () => (
    <div className="bg-sky-50 rounded-xl p-5 space-y-4">
      <div>
        <label className="block text-sm font-medium text-sky-500 mb-1">洗澡频率</label>
        <input className="input-field" placeholder="如：每周一次" value={bathFrequency} onChange={(e) => setBathFrequency(e.target.value)} />
      </div>
      <div>
        <label className="block text-sm font-medium text-sky-500 mb-1">猫砂/清洁频率</label>
        <input className="input-field" placeholder="如：每天铲一次" value={litterFrequency} onChange={(e) => setLitterFrequency(e.target.value)} />
      </div>
      <div>
        <label className="block text-sm font-medium text-sky-500 mb-1">用品位置</label>
        <input className="input-field" placeholder="如：猫砂盆在阳台" value={supplyLocations} onChange={(e) => setSupplyLocations(e.target.value)} />
      </div>
    </div>
  )

  const renderWalkPlan = () => (
    <div className="bg-coral-50 rounded-xl p-5 space-y-4">
      <div>
        <label className="block text-sm font-medium text-coral-400 mb-1">遛狗时间</label>
        <input className="input-field" placeholder="如：早7点、晚6点各30分钟" value={walkTime} onChange={(e) => setWalkTime(e.target.value)} />
      </div>
      <div>
        <label className="block text-sm font-medium text-coral-400 mb-1">遛狗路线</label>
        <input className="input-field" placeholder="如：小区花园环线" value={route} onChange={(e) => setRoute(e.target.value)} />
      </div>
      <div>
        <label className="block text-sm font-medium text-coral-400 mb-1">牵引绳位置</label>
        <input className="input-field" placeholder="如：门口挂钩" value={leashLocation} onChange={(e) => setLeashLocation(e.target.value)} />
      </div>
    </div>
  )

  const renderHealthPlan = () => (
    <div className="bg-red-50 rounded-xl p-5 space-y-5">
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-red-500">用药记录</label>
          <button onClick={addMedication} className="flex items-center gap-1 text-sm text-warm-500 hover:text-warm-700">
            <Plus size={14} /> 添加
          </button>
        </div>
        {medications.map((m) => (
          <div key={m.id} className="flex gap-2 mb-2">
            <input className={cn('input-field', 'flex-1')} placeholder="药品名" value={m.name} onChange={(e) => updateMedication(m.id, 'name', e.target.value)} />
            <input className={cn('input-field', 'w-24')} placeholder="剂量" value={m.dosage} onChange={(e) => updateMedication(m.id, 'dosage', e.target.value)} />
            <input className={cn('input-field', 'w-24')} placeholder="频率" value={m.frequency} onChange={(e) => updateMedication(m.id, 'frequency', e.target.value)} />
            <button onClick={() => removeMedication(m.id)} className="text-red-400 hover:text-red-600">
              <X size={16} />
            </button>
          </div>
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-red-500">禁忌事项</label>
          <button onClick={addTaboo} className="flex items-center gap-1 text-sm text-warm-500 hover:text-warm-700">
            <Plus size={14} /> 添加
          </button>
        </div>
        {taboos.map((t) => (
          <div key={t.id} className="flex gap-2 mb-2">
            <select className={cn('input-field', 'w-28')} value={t.category} onChange={(e) => updateTaboo(t.id, 'category', e.target.value)}>
              {Object.entries(categoryLabels).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
            <input className={cn('input-field', 'flex-1')} placeholder="禁忌内容" value={t.content} onChange={(e) => updateTaboo(t.id, 'content', e.target.value)} />
            <button onClick={() => removeTaboo(t.id)} className="text-red-400 hover:text-red-600">
              <X size={16} />
            </button>
          </div>
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-red-500">物资清单</label>
          <button onClick={addSupply} className="flex items-center gap-1 text-sm text-warm-500 hover:text-warm-700">
            <Plus size={14} /> 添加
          </button>
        </div>
        {supplies.map((s) => (
          <div key={s.id} className="flex gap-2 mb-2">
            <input className={cn('input-field', 'flex-1')} placeholder="物品名" value={s.name} onChange={(e) => updateSupply(s.id, 'name', e.target.value)} />
            <input className={cn('input-field', 'w-24')} type="number" placeholder="剩余天数" value={s.remainingDays || ''} onChange={(e) => updateSupply(s.id, 'remainingDays', Number(e.target.value))} />
            <input className={cn('input-field', 'w-24')} type="number" placeholder="总天数" value={s.totalDays || ''} onChange={(e) => updateSupply(s.id, 'totalDays', Number(e.target.value))} />
            <button onClick={() => removeSupply(s.id)} className="text-red-400 hover:text-red-600">
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )

  const stepComponents = [renderBasicInfo, renderFeedingPlan, renderCleanPlan, ...(isDog ? [renderWalkPlan] : []), renderHealthPlan]

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <ClipboardList size={28} className="text-warm-500" />
          <h1 className="font-display text-2xl text-warm-800">创建寄养交接单</h1>
        </div>

        {renderStepIndicator()}

        <div className="section-card bg-white mb-6">
          <h2 className="font-display text-lg text-warm-700 mb-4">{STEPS[effectiveStep]}</h2>
          {stepComponents[effectiveStep]()}
        </div>

        <div className="flex justify-between">
          <button
            onClick={() => setStep(Math.max(0, effectiveStep - 1))}
            disabled={effectiveStep === 0}
            className={cn('btn-secondary flex items-center gap-1', effectiveStep === 0 && 'opacity-40 cursor-not-allowed')}
          >
            <ChevronLeft size={16} /> 上一步
          </button>

          {effectiveStep < totalSteps - 1 ? (
            <button
              onClick={() => setStep(effectiveStep + 1)}
              disabled={!canNext()}
              className={cn('btn-primary flex items-center gap-1', !canNext() && 'opacity-40 cursor-not-allowed')}
            >
              下一步 <ChevronRight size={16} />
            </button>
          ) : (
            <button onClick={handleSubmit} className="btn-primary flex items-center gap-1">
              提交交接单
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
