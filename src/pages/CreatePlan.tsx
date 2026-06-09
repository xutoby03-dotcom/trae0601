import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { usePlansStore } from '@/store/plansStore'
import { ArrowLeft, ArrowRight, Check, Plus, Trash2, Gift, MapPin, Users, Calendar, DollarSign, User } from 'lucide-react'

const STEPS = ['基本信息', '礼物候选', '物流与人员']

export default function CreatePlan() {
  const navigate = useNavigate()
  const addPlan = usePlansStore((s) => s.addPlan)

  const [currentStep, setCurrentStep] = useState(0)
  const [birthdayPerson, setBirthdayPerson] = useState('')
  const [birthdayDate, setBirthdayDate] = useState('')
  const [totalBudget, setTotalBudget] = useState(0)
  const [organizerName, setOrganizerName] = useState('')
  const [giftCandidates, setGiftCandidates] = useState<{ name: string; price: number; imageUrl: string; purchaseLink: string }[]>([])
  const [shippingAddress, setShippingAddress] = useState('')
  const [responsiblePerson, setResponsiblePerson] = useState('')
  const [participants, setParticipants] = useState<{ name: string }[]>([])

  const nextStep = () => setCurrentStep((s) => Math.min(s + 1, STEPS.length - 1))
  const prevStep = () => setCurrentStep((s) => Math.max(s - 1, 0))

  const addGift = () => setGiftCandidates((prev) => [...prev, { name: '', price: 0, imageUrl: '', purchaseLink: '' }])
  const removeGift = (index: number) => setGiftCandidates((prev) => prev.filter((_, i) => i !== index))
  const updateGift = (index: number, field: string, value: string | number) =>
    setGiftCandidates((prev) => prev.map((g, i) => (i === index ? { ...g, [field]: value } : g)))

  const addParticipant = () => setParticipants((prev) => [...prev, { name: '' }])
  const removeParticipant = (index: number) => setParticipants((prev) => prev.filter((_, i) => i !== index))
  const updateParticipant = (index: number, name: string) =>
    setParticipants((prev) => prev.map((p, i) => (i === index ? { name } : p)))

  const handleSubmit = () => {
    const newId = addPlan({
      birthdayPerson,
      birthdayDate,
      totalBudget,
      shippingAddress,
      organizerName,
      responsiblePerson,
      status: 'voting',
      giftCandidates: giftCandidates.map((g) => ({ id: '', name: g.name, price: g.price, imageUrl: g.imageUrl, purchaseLink: g.purchaseLink, votes: [] })),
      participants: participants.map((p) => ({ id: '', name: p.name, pledgedAmount: 0, hasPaid: false, advancedAmount: 0 })),
    })
    navigate(`/plan/${newId}`)
  }

  return (
    <div className="min-h-screen bg-cream font-body">
      <nav className="sticky top-0 z-10 bg-cream/80 backdrop-blur-md border-b border-bark-100">
        <div className="container flex items-center h-14 gap-3">
          <Link to="/" className="p-2 -ml-2 rounded-full hover:bg-bark-50 transition-colors">
            <ArrowLeft className="w-5 h-5 text-bark-600" />
          </Link>
          <h1 className="text-lg font-semibold text-bark-800">创建计划</h1>
        </div>
      </nav>

      <div className="container py-6">
        <div className="flex items-center justify-center gap-0 mb-8">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    i <= currentStep ? 'bg-warm-500 text-white' : 'bg-bark-100 text-bark-400'
                  }`}
                >
                  {i < currentStep ? <Check className="w-4 h-4" /> : i + 1}
                </div>
                <span className={`text-xs mt-1 ${i <= currentStep ? 'text-warm-600 font-medium' : 'text-bark-400'}`}>
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`w-12 h-0.5 mx-2 mb-5 ${i < currentStep ? 'bg-warm-500' : 'bg-bark-200'}`} />
              )}
            </div>
          ))}
        </div>

        {currentStep === 0 && (
          <div className="space-y-5">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-bark-700 mb-2">
                <User className="w-4 h-4 text-warm-500" />
                寿星姓名
              </label>
              <input
                type="text"
                value={birthdayPerson}
                onChange={(e) => setBirthdayPerson(e.target.value)}
                placeholder="输入寿星姓名"
                className="w-full rounded-xl border border-bark-200 focus:border-warm-500 focus:outline-none px-4 py-3 bg-white transition-colors"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-bark-700 mb-2">
                <Calendar className="w-4 h-4 text-warm-500" />
                生日日期
              </label>
              <input
                type="date"
                value={birthdayDate}
                onChange={(e) => setBirthdayDate(e.target.value)}
                className="w-full rounded-xl border border-bark-200 focus:border-warm-500 focus:outline-none px-4 py-3 bg-white transition-colors"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-bark-700 mb-2">
                <DollarSign className="w-4 h-4 text-warm-500" />
                总预算（元）
              </label>
              <input
                type="number"
                value={totalBudget || ''}
                onChange={(e) => setTotalBudget(Number(e.target.value))}
                placeholder="输入总预算"
                className="w-full rounded-xl border border-bark-200 focus:border-warm-500 focus:outline-none px-4 py-3 bg-white transition-colors"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-bark-700 mb-2">
                <User className="w-4 h-4 text-warm-500" />
                组织者姓名
              </label>
              <input
                type="text"
                value={organizerName}
                onChange={(e) => setOrganizerName(e.target.value)}
                placeholder="输入组织者姓名"
                className="w-full rounded-xl border border-bark-200 focus:border-warm-500 focus:outline-none px-4 py-3 bg-white transition-colors"
              />
            </div>
          </div>
        )}

        {currentStep === 1 && (
          <div className="space-y-4">
            {giftCandidates.map((gift, i) => (
              <div key={i} className="bg-white/60 backdrop-blur-sm rounded-xl border border-bark-100 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-medium text-bark-700">
                    <Gift className="w-4 h-4 text-warm-500" />
                    礼物 {i + 1}
                  </div>
                  <button onClick={() => removeGift(i)} className="p-1.5 rounded-lg hover:bg-rose-50 text-bark-400 hover:text-rose-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <input
                  type="text"
                  value={gift.name}
                  onChange={(e) => updateGift(i, 'name', e.target.value)}
                  placeholder="礼物名称"
                  className="w-full rounded-xl border border-bark-200 focus:border-warm-500 focus:outline-none px-4 py-3 bg-white transition-colors"
                />
                <input
                  type="number"
                  value={gift.price || ''}
                  onChange={(e) => updateGift(i, 'price', Number(e.target.value))}
                  placeholder="价格（元）"
                  className="w-full rounded-xl border border-bark-200 focus:border-warm-500 focus:outline-none px-4 py-3 bg-white transition-colors"
                />
                <input
                  type="text"
                  value={gift.imageUrl}
                  onChange={(e) => updateGift(i, 'imageUrl', e.target.value)}
                  placeholder="图片链接"
                  className="w-full rounded-xl border border-bark-200 focus:border-warm-500 focus:outline-none px-4 py-3 bg-white transition-colors"
                />
                <input
                  type="text"
                  value={gift.purchaseLink}
                  onChange={(e) => updateGift(i, 'purchaseLink', e.target.value)}
                  placeholder="购买链接"
                  className="w-full rounded-xl border border-bark-200 focus:border-warm-500 focus:outline-none px-4 py-3 bg-white transition-colors"
                />
              </div>
            ))}
            <button
              onClick={addGift}
              className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-bark-200 rounded-xl py-4 text-bark-400 hover:border-warm-400 hover:text-warm-500 transition-colors"
            >
              <Plus className="w-5 h-5" />
              添加礼物
            </button>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-5">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-bark-700 mb-2">
                <MapPin className="w-4 h-4 text-warm-500" />
                收货地址
              </label>
              <textarea
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                placeholder="输入收货地址"
                rows={3}
                className="w-full rounded-xl border border-bark-200 focus:border-warm-500 focus:outline-none px-4 py-3 bg-white transition-colors resize-none"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-bark-700 mb-2">
                <User className="w-4 h-4 text-warm-500" />
                负责人姓名
              </label>
              <input
                type="text"
                value={responsiblePerson}
                onChange={(e) => setResponsiblePerson(e.target.value)}
                placeholder="输入负责人姓名"
                className="w-full rounded-xl border border-bark-200 focus:border-warm-500 focus:outline-none px-4 py-3 bg-white transition-colors"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-bark-700 mb-2">
                <Users className="w-4 h-4 text-warm-500" />
                参与人员
              </label>
              <div className="space-y-2">
                {participants.map((p, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={p.name}
                      onChange={(e) => updateParticipant(i, e.target.value)}
                      placeholder="参与人姓名"
                      className="flex-1 rounded-xl border border-bark-200 focus:border-warm-500 focus:outline-none px-4 py-3 bg-white transition-colors"
                    />
                    <button
                      onClick={() => removeParticipant(i)}
                      className="p-2 rounded-lg hover:bg-rose-50 text-bark-400 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={addParticipant}
                  className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-bark-200 rounded-xl py-3 text-bark-400 hover:border-warm-400 hover:text-warm-500 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  添加参与人
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-8 pb-6">
          {currentStep > 0 ? (
            <button
              onClick={prevStep}
              className="flex items-center gap-2 px-6 py-3 rounded-full border border-bark-200 text-bark-600 hover:bg-bark-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              上一步
            </button>
          ) : (
            <div />
          )}
          {currentStep < STEPS.length - 1 ? (
            <button
              onClick={nextStep}
              className="flex items-center gap-2 px-8 py-3 rounded-full bg-gradient-to-r from-warm-400 to-warm-600 text-white hover:from-warm-500 hover:to-warm-700 transition-all"
            >
              下一步
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="flex items-center gap-2 px-8 py-3 rounded-full bg-gradient-to-r from-warm-400 to-warm-600 text-white hover:from-warm-500 hover:to-warm-700 transition-all"
            >
              <Check className="w-4 h-4" />
              创建
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
