import { useParams, useNavigate } from 'react-router-dom'
import { usePetStore } from '@/store'
import { RECORD_TYPE_CONFIG, type HealthRecordType } from '@/types'
import {
  ArrowLeft,
  Edit3,
  Download,
  Trash2,
  Syringe,
  Bug,
  Stethoscope,
  AlertTriangle,
  Scissors,
  Calendar,
  Hospital,
  User,
  DollarSign,
  Plus,
  FileText,
} from 'lucide-react'

const typeIconMap: Record<string, React.ElementType> = {
  syringe: Syringe,
  bug: Bug,
  stethoscope: Stethoscope,
  'alert-triangle': AlertTriangle,
  scissors: Scissors,
}

function calcAge(birthday: string): string {
  const birth = new Date(birthday)
  const now = new Date()
  let years = now.getFullYear() - birth.getFullYear()
  let months = now.getMonth() - birth.getMonth()
  if (months < 0) {
    years--
    months += 12
  }
  if (now.getDate() < birth.getDate()) {
    months--
    if (months < 0) {
      years--
      months += 12
    }
  }
  if (years > 0) return `${years}岁${months > 0 ? months + '个月' : ''}`
  return `${months}个月`
}

export default function PetDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { pets, getPetRecords, deletePet } = usePetStore()

  const pet = pets.find((p) => p.id === id)
  const records = id ? getPetRecords(id) : []

  if (!pet) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-warm-500 text-lg mb-4">宠物不存在</p>
        <button className="btn-primary" onClick={() => navigate('/')}>
          返回首页
        </button>
      </div>
    )
  }

  const handleDelete = () => {
    if (window.confirm(`确定要删除 ${pet.name} 的档案吗？所有相关健康记录也将被删除，此操作不可撤销。`)) {
      deletePet(pet.id)
      navigate('/')
    }
  }

  const speciesLabel = pet.species === 'cat' ? '🐱 猫咪' : '🐶 狗狗'
  const speciesEmoji = pet.species === 'cat' ? '🐱' : '🐶'

  return (
    <div className="animate-fade-in space-y-6">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="w-10 h-10 rounded-xl bg-warm-100 hover:bg-warm-200 flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-warm-700" />
          </button>
          <h1 className="section-title">{pet.name}</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/pet/${pet.id}/edit`)}
            className="w-10 h-10 rounded-xl bg-warm-100 hover:bg-warm-200 flex items-center justify-center transition-colors"
          >
            <Edit3 className="w-4 h-4 text-warm-600" />
          </button>
          <button
            onClick={() => navigate(`/export/${pet.id}`)}
            className="w-10 h-10 rounded-xl bg-warm-100 hover:bg-warm-200 flex items-center justify-center transition-colors"
          >
            <Download className="w-4 h-4 text-warm-600" />
          </button>
          <button
            onClick={handleDelete}
            className="w-10 h-10 rounded-xl bg-red-50 hover:bg-red-100 flex items-center justify-center transition-colors"
          >
            <Trash2 className="w-4 h-4 text-pet-red" />
          </button>
        </div>
      </header>

      <div className="card p-6">
        <div className="flex flex-col items-center mb-6">
          <div className="w-24 h-24 rounded-full bg-warm-100 border-3 border-warm-200 flex items-center justify-center overflow-hidden mb-3">
            {pet.photo ? (
              <img src={pet.photo} alt={pet.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-4xl">{speciesEmoji}</span>
            )}
          </div>
          <h2 className="font-serif text-2xl font-semibold text-warm-800">{pet.name}</h2>
          <span
            className="badge mt-1"
            style={{
              backgroundColor: pet.species === 'cat' ? '#FFF0F5' : '#F0F7FF',
              color: pet.species === 'cat' ? '#E85D5D' : '#6BA3D6',
            }}
          >
            {speciesLabel}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
          <div className="bg-warm-50 rounded-xl p-3 text-center">
            <p className="text-warm-400 text-xs mb-1">品种</p>
            <p className="text-warm-800 font-medium">{pet.breed || '未知'}</p>
          </div>
          <div className="bg-warm-50 rounded-xl p-3 text-center">
            <p className="text-warm-400 text-xs mb-1">生日</p>
            <p className="text-warm-800 font-medium">{pet.birthday || '未知'}</p>
            {pet.birthday && (
              <p className="text-warm-400 text-xs">({calcAge(pet.birthday)})</p>
            )}
          </div>
          <div className="bg-warm-50 rounded-xl p-3 text-center">
            <p className="text-warm-400 text-xs mb-1">体重</p>
            <p className="text-warm-800 font-medium">{pet.weight ? `${pet.weight} kg` : '未知'}</p>
          </div>
          <div className="bg-warm-50 rounded-xl p-3 text-center">
            <p className="text-warm-400 text-xs mb-1">芯片号</p>
            <p className="text-warm-800 font-medium">{pet.chipNumber || '无'}</p>
          </div>
          <div className="bg-warm-50 rounded-xl p-3 text-center col-span-2 sm:col-span-1">
            <p className="text-warm-400 text-xs mb-1">常去医院</p>
            <p className="text-warm-800 font-medium">{pet.hospital || '未知'}</p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="section-title mb-4">健康记录</h2>
        {records.length === 0 ? (
          <div className="card p-8 text-center">
            <FileText className="w-12 h-12 text-warm-200 mx-auto mb-3" />
            <p className="text-warm-400">暂无健康记录</p>
            <p className="text-warm-300 text-sm mt-1">点击右下角按钮添加第一条记录</p>
          </div>
        ) : (
          <div className="space-y-3">
            {records.map((record) => {
              const config = RECORD_TYPE_CONFIG[record.type as HealthRecordType]
              const IconComp = typeIconMap[config.icon]
              return (
                <div
                  key={record.id}
                  className="card p-4 flex gap-4"
                  style={{ borderLeftWidth: 4, borderLeftColor: config.color }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: config.bgColor }}
                  >
                    {IconComp && <IconComp className="w-5 h-5" style={{ color: config.color }} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-medium text-warm-800">{record.title}</h3>
                      <span
                        className="badge"
                        style={{ backgroundColor: config.bgColor, color: config.color }}
                      >
                        {config.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-warm-400 mb-2 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {record.date}
                      </span>
                      {record.hospital && (
                        <span className="flex items-center gap-1">
                          <Hospital className="w-3 h-3" />
                          {record.hospital}
                        </span>
                      )}
                      {record.doctor && (
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {record.doctor}
                        </span>
                      )}
                      {record.cost > 0 && (
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          ¥{record.cost}
                        </span>
                      )}
                    </div>
                    {record.nextDate && (
                      <div className="text-xs mb-1">
                        <span
                          className="badge"
                          style={{ backgroundColor: '#FFF7ED', color: '#F97316' }}
                        >
                          下次: {record.nextDate}
                        </span>
                      </div>
                    )}
                    {record.notes && (
                      <p className="text-xs text-warm-400 mt-1 line-clamp-2">{record.notes}</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <button
        onClick={() => navigate(`/pet/${pet.id}/add-record`)}
        className="fixed bottom-24 md:bottom-8 right-6 w-14 h-14 bg-warm-400 hover:bg-warm-500 text-white rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-200 active:scale-90 z-20"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  )
}
