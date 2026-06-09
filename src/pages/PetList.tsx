import { useGroomingStore } from '@/store/useGroomingStore'
import { useNavigate } from 'react-router-dom'
import { Plus, PawPrint, Edit3, Trash2 } from 'lucide-react'
import { COAT_LENGTH_LABELS, TEMPERAMENT_LABELS } from '@/types'

const AVATAR_OPTIONS = ['🐶', '🐱', '🐰', '🐹', '🦊', '🐻', '🐼', '🐨', '🦁', '🐯']

export default function PetList() {
  const navigate = useNavigate()
  const pets = useGroomingStore((s) => s.pets)
  const deletePet = useGroomingStore((s) => s.deletePet)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl text-[#3D2B1F]">我的毛孩们</h2>
        <button
          onClick={() => navigate('/pets/new')}
          className="flex items-center gap-1.5 bg-[#E8A87C] text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-[#d4956a] transition-colors shadow-md"
        >
          <Plus size={16} />
          添加宠物
        </button>
      </div>

      {pets.length === 0 && (
        <div className="text-center py-16">
          <div className="text-5xl mb-3">🐾</div>
          <p className="text-[#8B7E74] mb-4">还没有添加任何宠物</p>
          <button
            onClick={() => navigate('/pets/new')}
            className="bg-[#E8A87C] text-white px-6 py-2.5 rounded-full font-medium hover:bg-[#d4956a] transition-colors shadow-md"
          >
            添加第一只毛孩
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {pets.map((pet) => (
          <div
            key={pet.id}
            className="bg-white rounded-2xl border border-[#E8A87C]/20 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
          >
            <div className="bg-gradient-to-br from-[#E8A87C]/20 to-[#A8D5BA]/20 p-6 flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-3xl shadow-md">
                {pet.avatar || '🐾'}
              </div>
              <div className="flex-1">
                <h3 className="font-display text-xl text-[#3D2B1F]">{pet.name}</h3>
                <p className="text-sm text-[#8B7E74]">{pet.breed || '未设品种'}</p>
              </div>
            </div>
            <div className="p-4 space-y-2">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-[#FFF8F0] rounded-lg px-2.5 py-1.5">
                  <span className="text-[#8B7E74]">体重</span>
                  <span className="ml-1 font-medium text-[#3D2B1F]">{pet.weight ? `${pet.weight}kg` : '-'}</span>
                </div>
                <div className="bg-[#FFF8F0] rounded-lg px-2.5 py-1.5">
                  <span className="text-[#8B7E74]">毛发</span>
                  <span className="ml-1 font-medium text-[#3D2B1F]">{COAT_LENGTH_LABELS[pet.coatLength]}</span>
                </div>
                <div className="bg-[#FFF8F0] rounded-lg px-2.5 py-1.5">
                  <span className="text-[#8B7E74]">脾气</span>
                  <span className="ml-1 font-medium text-[#3D2B1F]">{TEMPERAMENT_LABELS[pet.temperament]}</span>
                </div>
                <div className="bg-[#FFF8F0] rounded-lg px-2.5 py-1.5">
                  <span className="text-[#8B7E74]">常去</span>
                  <span className="ml-1 font-medium text-[#3D2B1F] truncate">{pet.preferredShop || '-'}</span>
                </div>
              </div>
              {pet.allergies && (
                <div className="bg-red-50 border border-red-100 rounded-lg px-2.5 py-1.5 text-xs">
                  <span className="text-red-400">⚠ 过敏：</span>
                  <span className="text-red-600">{pet.allergies}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5 flex-wrap">
                {pet.defaultServices.map((svc) => (
                  <span key={svc} className="text-[10px] bg-[#A8D5BA]/30 text-[#3D2B1F] px-2 py-0.5 rounded-full">
                    {svc === 'bath' ? '洗澡' : svc === 'haircut' ? '剪毛' : svc === 'nail_trim' ? '剪指甲' : svc === 'ear_clean' ? '清耳朵' : svc}
                  </span>
                ))}
              </div>
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  onClick={() => navigate(`/pets/${pet.id}`)}
                  className="flex items-center gap-1 text-xs text-[#8B7E74] hover:text-[#E8A87C] transition-colors"
                >
                  <Edit3 size={12} /> 编辑
                </button>
                <button
                  onClick={() => {
                    if (confirm(`确定删除 ${pet.name} 吗？`)) deletePet(pet.id)
                  }}
                  className="flex items-center gap-1 text-xs text-[#8B7E74] hover:text-red-400 transition-colors"
                >
                  <Trash2 size={12} /> 删除
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
