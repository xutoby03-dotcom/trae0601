import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, MapPin, Users, ChefHat, DollarSign, Save, ArrowLeft } from 'lucide-react'
import { useGatheringStore } from '@/store/useGatheringStore'

export default function CreateGathering() {
  const navigate = useNavigate()
  const addGathering = useGatheringStore((s) => s.addGathering)
  const addParticipant = useGatheringStore((s) => s.addParticipant)

  const [name, setName] = useState('')
  const [date, setDate] = useState('')
  const [location, setLocation] = useState('')
  const [headCount, setHeadCount] = useState('')
  const [budget, setBudget] = useState('')
  const [chefName, setChefName] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !date || !location || !headCount || !budget || !chefName) return

    const gatheringId = addGathering({
      name,
      date,
      location,
      budget: Number(budget),
      headCount: Number(headCount),
      chefId: '',
      status: 'preparing',
    })

    const participantId = addParticipant({
      gatheringId,
      name: chefName,
      spiceLevel: 1,
      isVegetarian: false,
      allergies: '',
    })

    useGatheringStore.getState().updateGathering(gatheringId, { chefId: participantId })

    navigate(`/gathering/${gatheringId}`)
  }

  const isFormValid = name && date && location && headCount && budget && chefName

  return (
    <div className="min-h-screen bg-[#FFF8F0] px-4 py-8" style={{ color: '#3D2C2E' }}>
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 mb-8 text-[#3D2C2E]/70 hover:text-[#E85D3A] transition-colors text-sm font-medium"
        >
          <ArrowLeft size={18} />
          返回首页
        </button>

        <h1 className="text-3xl font-bold mb-2">创建聚会</h1>
        <p className="text-[#3D2C2E]/60 mb-10">填写以下信息，开启一场美味之旅</p>

        <div className="flex flex-col lg:flex-row gap-8">
          <form onSubmit={handleSubmit} className="flex-1 bg-white rounded-2xl shadow-lg shadow-[#E85D3A]/5 p-8 space-y-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-[#3D2C2E]">
                <ChefHat size={16} className="text-[#E85D3A]" />
                聚会名称
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="给聚会起个名字吧"
                className="w-full px-4 py-3 rounded-xl border border-[#E85D3A]/20 bg-[#FFF8F0]/50 focus:outline-none focus:ring-2 focus:ring-[#E85D3A]/30 focus:border-[#E85D3A] placeholder:text-[#3D2C2E]/30 transition-all text-sm"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-[#3D2C2E]">
                <Calendar size={16} className="text-[#E85D3A]" />
                聚会日期
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[#E85D3A]/20 bg-[#FFF8F0]/50 focus:outline-none focus:ring-2 focus:ring-[#E85D3A]/30 focus:border-[#E85D3A] transition-all text-sm"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-[#3D2C2E]">
                <MapPin size={16} className="text-[#E85D3A]" />
                聚会地点
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="聚会将在哪里举行"
                className="w-full px-4 py-3 rounded-xl border border-[#E85D3A]/20 bg-[#FFF8F0]/50 focus:outline-none focus:ring-2 focus:ring-[#E85D3A]/30 focus:border-[#E85D3A] placeholder:text-[#3D2C2E]/30 transition-all text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-[#3D2C2E]">
                  <Users size={16} className="text-[#E85D3A]" />
                  预计人数
                </label>
                <input
                  type="number"
                  value={headCount}
                  onChange={(e) => setHeadCount(e.target.value)}
                  placeholder="人数"
                  min="1"
                  className="w-full px-4 py-3 rounded-xl border border-[#E85D3A]/20 bg-[#FFF8F0]/50 focus:outline-none focus:ring-2 focus:ring-[#E85D3A]/30 focus:border-[#E85D3A] placeholder:text-[#3D2C2E]/30 transition-all text-sm"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-[#3D2C2E]">
                  <DollarSign size={16} className="text-[#E85D3A]" />
                  预算
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#E85D3A] font-semibold text-sm">¥</span>
                  <input
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder="预算金额"
                    min="0"
                    className="w-full pl-8 pr-4 py-3 rounded-xl border border-[#E85D3A]/20 bg-[#FFF8F0]/50 focus:outline-none focus:ring-2 focus:ring-[#E85D3A]/30 focus:border-[#E85D3A] placeholder:text-[#3D2C2E]/30 transition-all text-sm"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-[#3D2C2E]">
                <ChefHat size={16} className="text-[#E85D3A]" />
                主厨
              </label>
              <input
                type="text"
                value={chefName}
                onChange={(e) => setChefName(e.target.value)}
                placeholder="主厨的大名"
                className="w-full px-4 py-3 rounded-xl border border-[#E85D3A]/20 bg-[#FFF8F0]/50 focus:outline-none focus:ring-2 focus:ring-[#E85D3A]/30 focus:border-[#E85D3A] placeholder:text-[#3D2C2E]/30 transition-all text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={!isFormValid}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-white transition-all text-sm
                bg-[#E85D3A] hover:bg-[#d04e2d] active:scale-[0.98] shadow-lg shadow-[#E85D3A]/25
                disabled:bg-[#3D2C2E]/15 disabled:shadow-none disabled:cursor-not-allowed"
            >
              <Save size={18} />
              创建聚会
            </button>
          </form>

          <div className="lg:w-96">
            <div className="sticky top-8 bg-white rounded-2xl shadow-lg shadow-[#E85D3A]/5 p-8 overflow-hidden relative">
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#E85D3A] to-[#F5C542]" />
              <h2 className="text-lg font-bold mb-6 text-[#3D2C2E]">聚会预览</h2>

              {name ? (
                <h3 className="text-2xl font-bold text-[#E85D3A] mb-5">{name}</h3>
              ) : (
                <div className="h-8 rounded-lg bg-[#FFF8F0] mb-5 flex items-center px-3">
                  <span className="text-[#3D2C2E]/30 text-sm">聚会名称</span>
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#FFF8F0] flex items-center justify-center">
                    <Calendar size={16} className="text-[#E85D3A]" />
                  </div>
                  <div>
                    <p className="text-xs text-[#3D2C2E]/50">日期</p>
                    <p className="text-sm font-medium">{date || '待定'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#FFF8F0] flex items-center justify-center">
                    <MapPin size={16} className="text-[#E85D3A]" />
                  </div>
                  <div>
                    <p className="text-xs text-[#3D2C2E]/50">地点</p>
                    <p className="text-sm font-medium">{location || '待定'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#FFF8F0] flex items-center justify-center">
                    <Users size={16} className="text-[#E85D3A]" />
                  </div>
                  <div>
                    <p className="text-xs text-[#3D2C2E]/50">人数</p>
                    <p className="text-sm font-medium">{headCount ? `${headCount} 人` : '待定'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#FFF8F0] flex items-center justify-center">
                    <DollarSign size={16} className="text-[#E85D3A]" />
                  </div>
                  <div>
                    <p className="text-xs text-[#3D2C2E]/50">预算</p>
                    <p className="text-sm font-medium">{budget ? `¥${budget}` : '待定'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#FFF8F0] flex items-center justify-center">
                    <ChefHat size={16} className="text-[#E85D3A]" />
                  </div>
                  <div>
                    <p className="text-xs text-[#3D2C2E]/50">主厨</p>
                    <p className="text-sm font-medium">{chefName || '待定'}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#E85D3A]/10">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#E85D3A]/10 text-[#E85D3A]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E85D3A] animate-pulse" />
                  准备中
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
