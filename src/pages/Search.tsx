import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Filter, Cat, Dog, Calendar, Hospital, ChevronRight } from 'lucide-react'
import { usePetStore } from '@/store'
import { RECORD_TYPE_CONFIG } from '@/types'
import type { HealthRecordType } from '@/types'

const ALL = '全部'

export default function SearchPage() {
  const navigate = useNavigate()
  const pets = usePetStore((s) => s.pets)
  const records = usePetStore((s) => s.records)
  const getAllHospitals = usePetStore((s) => s.getAllHospitals)

  const hospitals = getAllHospitals()

  const [selectedPet, setSelectedPet] = useState(ALL)
  const [selectedHospital, setSelectedHospital] = useState(ALL)
  const [selectedType, setSelectedType] = useState<HealthRecordType | typeof ALL>(ALL)
  const [searchText, setSearchText] = useState('')

  const filteredRecords = useMemo(() => {
    return records
      .filter((r) => {
        if (selectedPet !== ALL && r.petId !== selectedPet) return false
        if (selectedHospital !== ALL && r.hospital !== selectedHospital) return false
        if (selectedType !== ALL && r.type !== selectedType) return false
        if (searchText.trim()) {
          const q = searchText.trim().toLowerCase()
          const pet = pets.find((p) => p.id === r.petId)
          const haystack = [r.title, r.hospital, r.doctor, pet?.name].filter(Boolean).join(' ').toLowerCase()
          if (!haystack.includes(q)) return false
        }
        return true
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [records, selectedPet, selectedHospital, selectedType, searchText, pets])

  const petColorMap = useMemo(() => {
    const colors = ['#F97316', '#8B5CF6', '#3B82F6', '#22C55E', '#EF4444', '#EC4899', '#14B8A6', '#EAB308']
    const map: Record<string, string> = {}
    pets.forEach((p, i) => {
      map[p.id] = colors[i % colors.length]
    })
    return map
  }, [pets])

  const typeKeys = Object.keys(RECORD_TYPE_CONFIG) as HealthRecordType[]

  return (
    <div className="space-y-5 animate-fade-in">
      <header>
        <h1 className="font-serif text-3xl font-bold text-warm-800 mb-4">筛选查询</h1>
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-warm-300" />
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="搜索记录、宠物、医院..."
            className="input-field pl-10"
          />
        </div>
      </header>

      <section className="space-y-4">
        <div className="flex items-center gap-2 text-warm-600">
          <Filter className="w-4 h-4" />
          <span className="text-sm font-medium">筛选条件</span>
        </div>

        <div>
          <p className="text-xs text-warm-400 mb-2">宠物</p>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedPet(ALL)}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                selectedPet === ALL
                  ? 'bg-warm-400 text-white shadow-sm'
                  : 'bg-warm-100 text-warm-600 hover:bg-warm-200'
              }`}
            >
              {ALL}
            </button>
            {pets.map((pet) => (
              <button
                key={pet.id}
                onClick={() => setSelectedPet(pet.id)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedPet === pet.id
                    ? 'bg-warm-400 text-white shadow-sm'
                    : 'bg-warm-100 text-warm-600 hover:bg-warm-200'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: selectedPet === pet.id ? '#fff' : petColorMap[pet.id] }}
                />
                {pet.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs text-warm-400 mb-2">医院</p>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedHospital(ALL)}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                selectedHospital === ALL
                  ? 'bg-warm-400 text-white shadow-sm'
                  : 'bg-warm-100 text-warm-600 hover:bg-warm-200'
              }`}
            >
              {ALL}
            </button>
            {hospitals.map((h) => (
              <button
                key={h}
                onClick={() => setSelectedHospital(h)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedHospital === h
                    ? 'bg-warm-400 text-white shadow-sm'
                    : 'bg-warm-100 text-warm-600 hover:bg-warm-200'
                }`}
              >
                <Hospital className="w-3 h-3" />
                {h}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs text-warm-400 mb-2">记录类型</p>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedType(ALL)}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                selectedType === ALL
                  ? 'bg-warm-400 text-white shadow-sm'
                  : 'bg-warm-100 text-warm-600 hover:bg-warm-200'
              }`}
            >
              {ALL}
            </button>
            {typeKeys.map((type) => {
              const config = RECORD_TYPE_CONFIG[type]
              const isActive = selectedType === type
              return (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className="flex-shrink-0 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-200"
                  style={{
                    backgroundColor: isActive ? config.color : config.bgColor,
                    color: isActive ? '#fff' : config.color,
                    boxShadow: isActive ? `0 2px 8px ${config.color}40` : 'none',
                  }}
                >
                  {config.label}
                </button>
              )
            })}
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="section-title text-lg">查询结果</h2>
          <span className="text-xs text-warm-400">共 {filteredRecords.length} 条</span>
        </div>

        {filteredRecords.length === 0 ? (
          <div className="card p-10 text-center">
            <Search className="w-12 h-12 text-warm-200 mx-auto mb-3" />
            <p className="text-warm-500 font-medium mb-1">未找到匹配的记录</p>
            <p className="text-warm-300 text-sm">尝试调整筛选条件或搜索关键词</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRecords.map((record) => {
              const pet = pets.find((p) => p.id === record.petId)
              const config = RECORD_TYPE_CONFIG[record.type]
              const isCat = pet?.species === 'cat'

              return (
                <div
                  key={record.id}
                  className="card-hover p-4 flex items-center gap-3"
                  onClick={() => navigate(`/pet/${record.petId}`)}
                >
                  <div className="flex-shrink-0">
                    {pet?.photo ? (
                      <img src={pet.photo} alt={pet.name} className="w-11 h-11 rounded-xl object-cover" />
                    ) : (
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                          isCat ? 'bg-pet-orange/15' : 'bg-pet-blue/15'
                        }`}
                      >
                        {isCat ? (
                          <Cat className="w-5 h-5 text-pet-orange" />
                        ) : (
                          <Dog className="w-5 h-5 text-pet-blue" />
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-semibold text-warm-800 truncate">{record.title}</span>
                      <span
                        className="badge text-[10px] flex-shrink-0"
                        style={{ color: config.color, backgroundColor: config.bgColor }}
                      >
                        {config.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-warm-400">
                      <Calendar className="w-3 h-3 flex-shrink-0" />
                      <span>{record.date}</span>
                    </div>
                  </div>

                  <div className="flex-shrink-0 text-right">
                    {record.hospital && (
                      <p className="text-xs text-warm-500 flex items-center justify-end gap-1">
                        <Hospital className="w-3 h-3" />
                        <span className="max-w-[80px] truncate">{record.hospital}</span>
                      </p>
                    )}
                    {record.doctor && (
                      <p className="text-xs text-warm-400 mt-0.5">{record.doctor}</p>
                    )}
                    {record.cost > 0 && (
                      <p className="text-xs font-medium text-warm-600 mt-0.5">¥{record.cost}</p>
                    )}
                  </div>

                  <ChevronRight className="w-4 h-4 text-warm-300 flex-shrink-0" />
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
