import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGroomingStore } from '@/store/useGroomingStore'
import type { Appointment, ServiceType, PickupMethod } from '@/types'
import { SERVICE_LABELS, PICKUP_METHOD_LABELS } from '@/types'
import { ArrowLeft, Save } from 'lucide-react'

const ALL_SERVICES: ServiceType[] = ['bath', 'haircut', 'nail_trim', 'ear_clean', 'teeth_clean', 'gland_expression', 'flea_treatment']
const PICKUP_OPTIONS: PickupMethod[] = ['self_drop', 'shop_pickup', 'delivery']

export default function NewAppointment() {
  const navigate = useNavigate()
  const pets = useGroomingStore((s) => s.pets)
  const addAppointment = useGroomingStore((s) => s.addAppointment)

  const [petId, setPetId] = useState('')
  const [services, setServices] = useState<ServiceType[]>([])
  const [datetime, setDatetime] = useState('')
  const [pickupMethod, setPickupMethod] = useState<PickupMethod>('self_drop')
  const [budget, setBudget] = useState(0)
  const [specialRequests, setSpecialRequests] = useState('')
  const [shopName, setShopName] = useState('')

  const selectedPet = pets.find((p) => p.id === petId)

  const handleSelectPet = (id: string) => {
    setPetId(id)
    const pet = pets.find((p) => p.id === id)
    if (pet) {
      setServices(pet.defaultServices)
      setShopName(pet.preferredShop)
    }
  }

  const toggleService = (svc: ServiceType) => {
    setServices((prev) =>
      prev.includes(svc) ? prev.filter((s) => s !== svc) : [...prev, svc]
    )
  }

  const handleSave = () => {
    if (!petId || services.length === 0 || !datetime) return
    const appointment: Appointment = {
      id: crypto.randomUUID(),
      petId,
      services,
      datetime,
      pickupMethod,
      budget,
      specialRequests,
      status: 'pending',
      shopName,
      createdAt: new Date().toISOString(),
    }
    addAppointment(appointment)
    navigate('/')
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-[#8B7E74] hover:text-[#3D2B1F] transition-colors">
          <ArrowLeft size={22} />
        </button>
        <h2 className="font-display text-2xl text-[#3D2B1F]">创建预约</h2>
      </div>

      <div className="bg-white rounded-2xl border border-[#E8A87C]/20 shadow-sm p-6 space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-[#3D2B1F]">选择宠物 *</label>
          {pets.length === 0 ? (
            <div className="text-sm text-[#8B7E74] py-3">
              还没有宠物，请先
              <button onClick={() => navigate('/pets/new')} className="text-[#E8A87C] underline ml-1">
                添加宠物
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {pets.map((pet) => (
                <button
                  key={pet.id}
                  onClick={() => handleSelectPet(pet.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    petId === pet.id
                      ? 'bg-[#E8A87C] text-white shadow-md'
                      : 'bg-[#FFF8F0] text-[#3D2B1F] border border-[#E8A87C]/30'
                  }`}
                >
                  <span className="text-lg">{pet.avatar || '🐾'}</span>
                  {pet.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {selectedPet && (
          <div className="bg-[#FFF3E0] rounded-xl p-3 text-xs text-[#3D2B1F]">
            <div className="font-medium mb-1">{selectedPet.name} 的信息</div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-[#8B7E74]">
              {selectedPet.breed && <span>品种：{selectedPet.breed}</span>}
              {selectedPet.weight > 0 && <span>体重：{selectedPet.weight}kg</span>}
              {selectedPet.temperament && <span>脾气：{selectedPet.temperament === 'gentle' ? '温顺' : selectedPet.temperament === 'nervous' ? '紧张' : selectedPet.temperament === 'aggressive' ? '攻击性' : '兴奋'}</span>}
              {selectedPet.allergies && <span className="text-red-500">⚠ 过敏：{selectedPet.allergies}</span>}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium text-[#3D2B1F]">美容项目 *</label>
          <div className="flex flex-wrap gap-2">
            {ALL_SERVICES.map((svc) => (
              <button
                key={svc}
                onClick={() => toggleService(svc)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                  services.includes(svc)
                    ? 'bg-[#E8A87C] text-white shadow-md'
                    : 'bg-[#FFF8F0] text-[#8B7E74] border border-[#E8A87C]/30'
                }`}
              >
                {SERVICE_LABELS[svc]}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-[#3D2B1F]">预约时间 *</label>
          <input
            type="datetime-local"
            value={datetime}
            onChange={(e) => setDatetime(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-[#E8A87C]/30 bg-[#FFF8F0] focus:border-[#E8A87C] focus:ring-2 focus:ring-[#E8A87C]/20 outline-none transition-all text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#3D2B1F]">美容店</label>
            <input
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              placeholder="店名"
              className="w-full px-4 py-2.5 rounded-xl border border-[#E8A87C]/30 bg-[#FFF8F0] focus:border-[#E8A87C] focus:ring-2 focus:ring-[#E8A87C]/20 outline-none transition-all text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#3D2B1F]">预算 (元)</label>
            <input
              type="number"
              value={budget || ''}
              onChange={(e) => setBudget(parseFloat(e.target.value) || 0)}
              placeholder="0"
              className="w-full px-4 py-2.5 rounded-xl border border-[#E8A87C]/30 bg-[#FFF8F0] focus:border-[#E8A87C] focus:ring-2 focus:ring-[#E8A87C]/20 outline-none transition-all text-sm"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-[#3D2B1F]">接送方式</label>
          <div className="flex gap-2">
            {PICKUP_OPTIONS.map((method) => (
              <button
                key={method}
                onClick={() => setPickupMethod(method)}
                className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all duration-200 ${
                  pickupMethod === method
                    ? 'bg-[#A8D5BA] text-[#3D2B1F] shadow-md'
                    : 'bg-[#FFF8F0] text-[#8B7E74] border border-[#A8D5BA]/30'
                }`}
              >
                {PICKUP_METHOD_LABELS[method]}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-[#3D2B1F]">特别要求</label>
          <textarea
            value={specialRequests}
            onChange={(e) => setSpecialRequests(e.target.value)}
            placeholder="如：别剃太短、耳朵别进水、脚底毛留一点..."
            rows={3}
            className="w-full px-4 py-2.5 rounded-xl border border-[#E8A87C]/30 bg-[#FFF8F0] focus:border-[#E8A87C] focus:ring-2 focus:ring-[#E8A87C]/20 outline-none transition-all text-sm resize-none"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={!petId || services.length === 0 || !datetime}
          className="w-full flex items-center justify-center gap-2 bg-[#E8A87C] text-white py-3 rounded-xl font-medium hover:bg-[#d4956a] transition-colors shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Save size={18} />
          创建预约
        </button>
      </div>
    </div>
  )
}
