import { useNavigate } from 'react-router-dom'
import { Plus, Cat, Dog, Syringe, Stethoscope, AlertTriangle, Clock, ChevronRight, PawPrint } from 'lucide-react'
import { usePetStore } from '@/store'
import { RECORD_TYPE_CONFIG } from '@/types'
import type { HealthRecordType } from '@/types'

const TYPE_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  vaccine: Syringe,
  deworming: AlertTriangle,
  checkup: Stethoscope,
}

export default function Home() {
  const navigate = useNavigate()
  const pets = usePetStore((s) => s.pets)
  const records = usePetStore((s) => s.records)
  const getUpcomingReminders = usePetStore((s) => s.getUpcomingReminders)

  const reminders = getUpcomingReminders()

  const quickActions = [
    { label: '添加宠物', icon: PawPrint, onClick: () => navigate('/add-pet'), color: 'bg-warm-400' },
    { label: '添加疫苗', icon: Syringe, onClick: () => navigateToRecord('vaccine'), color: 'bg-pet-green' },
    { label: '添加体检', icon: Stethoscope, onClick: () => navigateToRecord('checkup'), color: 'bg-pet-purple' },
  ]

  function navigateToRecord(type: HealthRecordType) {
    if (pets.length === 1) {
      navigate(`/pet/${pets[0].id}/add-record?type=${type}`)
    } else if (pets.length > 1) {
      navigate(`/add-pet`)
    } else {
      navigate('/add-pet')
    }
  }

  function getLastVaccineRecord(petId: string) {
    return records
      .filter((r) => r.petId === petId && r.type === 'vaccine')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0] ?? null
  }

  function formatDaysLeft(days: number) {
    if (days <= 0) return '已过期'
    if (days === 1) return '明天到期'
    return `${days}天后到期`
  }

  if (pets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] animate-fade-in">
        <div className="w-28 h-28 bg-warm-100 rounded-full flex items-center justify-center mb-6">
          <PawPrint className="w-14 h-14 text-warm-300" />
        </div>
        <h2 className="font-serif text-2xl font-semibold text-warm-800 mb-2">还没有宠物</h2>
        <p className="text-warm-400 mb-8 text-center">添加你的第一只毛孩子，开始记录健康档案</p>
        <button className="btn-primary flex items-center gap-2" onClick={() => navigate('/add-pet')}>
          <Plus className="w-4 h-4" />
          添加第一只宠物
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="font-serif text-3xl font-bold text-warm-800">宠物档案本</h1>
          <div className="w-10 h-10 bg-warm-100 rounded-full flex items-center justify-center">
            <PawPrint className="w-5 h-5 text-warm-400" />
          </div>
        </div>

        <div className="flex gap-3">
          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={action.onClick}
              className="flex-1 flex items-center justify-center gap-2 bg-white rounded-2xl py-3 shadow-sm border border-warm-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 active:scale-95"
            >
              <div className={`w-8 h-8 ${action.color} rounded-lg flex items-center justify-center`}>
                <action.icon className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-medium text-warm-700">{action.label}</span>
            </button>
          ))}
        </div>
      </header>

      {reminders.length > 0 && (
        <section className="animate-fade-in" style={{ animationDelay: '100ms' }}>
          <h2 className="section-title flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-pet-orange" />
            到期提醒
          </h2>
          <div className="space-y-2">
            {reminders.map((item) => {
              const typeConfig = RECORD_TYPE_CONFIG[item.record.type]
              const IconComponent = TYPE_ICON_MAP[item.record.type]
              const isUrgent = item.urgency === 'urgent'
              const gradientBg = isUrgent
                ? 'bg-gradient-to-r from-red-50 to-pet-red/5 border-pet-red/20'
                : 'bg-gradient-to-r from-orange-50 to-pet-orange/5 border-pet-orange/20'

              return (
                <div
                  key={item.record.id}
                  className={`${gradientBg} border rounded-xl p-4 flex items-center gap-3 transition-all duration-200 hover:shadow-sm ${isUrgent ? 'animate-pulse-slow' : ''}`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isUrgent ? 'bg-pet-red/10' : 'bg-pet-orange/10'}`}
                  >
                    {IconComponent ? (
                      <IconComponent className={`w-5 h-5 ${isUrgent ? 'text-pet-red' : 'text-pet-orange'}`} />
                    ) : (
                      <AlertTriangle className={`w-5 h-5 ${isUrgent ? 'text-pet-red' : 'text-pet-orange'}`} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-warm-800 text-sm">{item.pet.name}</span>
                      <span
                        className="badge text-[10px]"
                        style={{ color: typeConfig.color, backgroundColor: typeConfig.bgColor }}
                      >
                        {typeConfig.label}
                      </span>
                    </div>
                    <p className="text-sm text-warm-600 truncate">{item.record.title}</p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Clock className={`w-3.5 h-3.5 ${isUrgent ? 'text-pet-red' : 'text-pet-orange'}`} />
                    <span className={`text-xs font-semibold ${isUrgent ? 'text-pet-red' : 'text-pet-orange'}`}>
                      {formatDaysLeft(item.daysLeft)}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      <section className="animate-fade-in" style={{ animationDelay: '200ms' }}>
        <h2 className="section-title flex items-center gap-2 mb-3">
          <PawPrint className="w-5 h-5 text-warm-400" />
          我的宠物
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {pets.map((pet, index) => {
            const lastVaccine = getLastVaccineRecord(pet.id)
            const isCat = pet.species === 'cat'
            const speciesColor = isCat ? 'bg-pet-orange/10 text-pet-orange' : 'bg-pet-blue/10 text-pet-blue'
            const placeholderColor = isCat ? 'bg-pet-orange/20' : 'bg-pet-blue/20'
            const iconColor = isCat ? 'text-pet-orange' : 'text-pet-blue'

            return (
              <div
                key={pet.id}
                className="card-hover p-4 animate-slide-up"
                style={{ animationDelay: `${(index + 1) * 80}ms`, animationFillMode: 'both' }}
                onClick={() => navigate(`/pet/${pet.id}`)}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    {pet.photo ? (
                      <img
                        src={pet.photo}
                        alt={pet.name}
                        className="w-14 h-14 rounded-xl object-cover"
                      />
                    ) : (
                      <div className={`w-14 h-14 rounded-xl ${placeholderColor} flex items-center justify-center`}>
                        {isCat ? (
                          <Cat className={`w-7 h-7 ${iconColor}`} />
                        ) : (
                          <Dog className={`w-7 h-7 ${iconColor}`} />
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-semibold text-warm-800 truncate">{pet.name}</span>
                      <span className={`badge text-[10px] ${speciesColor}`}>
                        {isCat ? '猫' : '狗'}
                      </span>
                    </div>
                    <p className="text-xs text-warm-400 truncate">{pet.breed}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-warm-300 flex-shrink-0 mt-1" />
                </div>

                <div className="mt-3 pt-3 border-t border-warm-50">
                  {lastVaccine ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-pet-green/10 rounded flex items-center justify-center">
                        <Syringe className="w-3 h-3 text-pet-green" />
                      </div>
                      <span className="text-xs text-warm-500">
                        最近疫苗：{lastVaccine.title}
                      </span>
                      <span className="text-xs text-warm-300 ml-auto">
                        {lastVaccine.date}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-warm-100 rounded flex items-center justify-center">
                        <Syringe className="w-3 h-3 text-warm-300" />
                      </div>
                      <span className="text-xs text-warm-300">暂无疫苗记录</span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
