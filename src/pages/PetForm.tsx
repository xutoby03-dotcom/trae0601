import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useGroomingStore } from '@/store/useGroomingStore'
import type { Pet, CoatLength, Temperament, ServiceType, ReminderType } from '@/types'
import { COAT_LENGTH_LABELS, TEMPERAMENT_LABELS, SERVICE_LABELS, REMINDER_TYPE_LABELS } from '@/types'
import { ArrowLeft, Save, BellPlus } from 'lucide-react'

const AVATAR_OPTIONS = ['🐶', '🐱', '🐰', '🐹', '🦊', '🐻', '🐼', '🐨', '🦁', '🐯', '🐸', '🐧']

const ALL_SERVICES: ServiceType[] = ['bath', 'haircut', 'nail_trim', 'ear_clean', 'teeth_clean', 'gland_expression', 'flea_treatment']

const emptyPet: Omit<Pet, 'id' | 'createdAt'> = {
  name: '',
  breed: '',
  weight: 0,
  coatLength: 'medium',
  temperament: 'gentle',
  allergies: '',
  preferredShop: '',
  avatar: '🐶',
  defaultServices: ['bath', 'haircut', 'nail_trim', 'ear_clean'],
}

export default function PetForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const pets = useGroomingStore((s) => s.pets)
  const addPet = useGroomingStore((s) => s.addPet)
  const updatePet = useGroomingStore((s) => s.updatePet)
  const addReminder = useGroomingStore((s) => s.addReminder)

  const isEdit = Boolean(id) && id !== 'new'
  const existingPet = isEdit ? pets.find((p) => p.id === id) : null

  const [form, setForm] = useState(emptyPet)
  const [reminderType, setReminderType] = useState<ReminderType>('bath')
  const [reminderDate, setReminderDate] = useState('')

  useEffect(() => {
    if (existingPet) {
      setForm({
        name: existingPet.name,
        breed: existingPet.breed,
        weight: existingPet.weight,
        coatLength: existingPet.coatLength,
        temperament: existingPet.temperament,
        allergies: existingPet.allergies,
        preferredShop: existingPet.preferredShop,
        avatar: existingPet.avatar,
        defaultServices: existingPet.defaultServices,
      })
    }
  }, [existingPet])

  const handleSave = () => {
    if (!form.name.trim()) return
    if (isEdit && id) {
      updatePet(id, form)
    } else {
      addPet({
        ...form,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      })
    }
    navigate('/pets')
  }

  const toggleService = (svc: ServiceType) => {
    setForm((prev) => ({
      ...prev,
      defaultServices: prev.defaultServices.includes(svc)
        ? prev.defaultServices.filter((s) => s !== svc)
        : [...prev.defaultServices, svc],
    }))
  }

  const handleAddReminder = () => {
    if (!isEdit || !id || !reminderDate) return
    addReminder({
      id: crypto.randomUUID(),
      petId: id,
      type: reminderType,
      dueDate: reminderDate,
      isCompleted: false,
      createdAt: new Date().toISOString(),
    })
    setReminderDate('')
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/pets')} className="text-[#8B7E74] hover:text-[#3D2B1F] transition-colors">
          <ArrowLeft size={22} />
        </button>
        <h2 className="font-display text-2xl text-[#3D2B1F]">{isEdit ? '编辑宠物' : '添加宠物'}</h2>
      </div>

      <div className="bg-white rounded-2xl border border-[#E8A87C]/20 shadow-sm p-6 space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-[#3D2B1F]">头像</label>
          <div className="flex flex-wrap gap-2">
            {AVATAR_OPTIONS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => setForm((p) => ({ ...p, avatar: emoji }))}
                className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all duration-200 ${
                  form.avatar === emoji
                    ? 'bg-[#E8A87C]/20 border-2 border-[#E8A87C] scale-110'
                    : 'bg-[#FFF8F0] border border-transparent hover:border-[#E8A87C]/40'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-[#3D2B1F]">名字 *</label>
          <input
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            placeholder="你家毛孩叫什么？"
            className="w-full px-4 py-2.5 rounded-xl border border-[#E8A87C]/30 bg-[#FFF8F0] focus:border-[#E8A87C] focus:ring-2 focus:ring-[#E8A87C]/20 outline-none transition-all text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#3D2B1F]">品种</label>
            <input
              value={form.breed}
              onChange={(e) => setForm((p) => ({ ...p, breed: e.target.value }))}
              placeholder="如：金毛、英短"
              className="w-full px-4 py-2.5 rounded-xl border border-[#E8A87C]/30 bg-[#FFF8F0] focus:border-[#E8A87C] focus:ring-2 focus:ring-[#E8A87C]/20 outline-none transition-all text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#3D2B1F]">体重 (kg)</label>
            <input
              type="number"
              value={form.weight || ''}
              onChange={(e) => setForm((p) => ({ ...p, weight: parseFloat(e.target.value) || 0 }))}
              placeholder="0"
              className="w-full px-4 py-2.5 rounded-xl border border-[#E8A87C]/30 bg-[#FFF8F0] focus:border-[#E8A87C] focus:ring-2 focus:ring-[#E8A87C]/20 outline-none transition-all text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#3D2B1F]">毛发长度</label>
            <div className="flex gap-2">
              {(Object.entries(COAT_LENGTH_LABELS) as [CoatLength, string][]).map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => setForm((p) => ({ ...p, coatLength: val }))}
                  className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all duration-200 ${
                    form.coatLength === val
                      ? 'bg-[#E8A87C] text-white shadow-md'
                      : 'bg-[#FFF8F0] text-[#8B7E74] border border-[#E8A87C]/30'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#3D2B1F]">脾气</label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.entries(TEMPERAMENT_LABELS) as [Temperament, string][]).map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => setForm((p) => ({ ...p, temperament: val }))}
                  className={`py-2 rounded-xl text-xs font-medium transition-all duration-200 ${
                    form.temperament === val
                      ? 'bg-[#A8D5BA] text-[#3D2B1F] shadow-md'
                      : 'bg-[#FFF8F0] text-[#8B7E74] border border-[#A8D5BA]/30'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-[#3D2B1F]">常去美容店</label>
          <input
            value={form.preferredShop}
            onChange={(e) => setForm((p) => ({ ...p, preferredShop: e.target.value }))}
            placeholder="如：宠爱有家宠物店"
            className="w-full px-4 py-2.5 rounded-xl border border-[#E8A87C]/30 bg-[#FFF8F0] focus:border-[#E8A87C] focus:ring-2 focus:ring-[#E8A87C]/20 outline-none transition-all text-sm"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-[#3D2B1F]">⚠ 过敏/注意事项</label>
          <textarea
            value={form.allergies}
            onChange={(e) => setForm((p) => ({ ...p, allergies: e.target.value }))}
            placeholder="如：对鸡肉过敏、皮肤敏感..."
            rows={2}
            className="w-full px-4 py-2.5 rounded-xl border border-[#E8A87C]/30 bg-[#FFF8F0] focus:border-[#E8A87C] focus:ring-2 focus:ring-[#E8A87C]/20 outline-none transition-all text-sm resize-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-[#3D2B1F]">常做项目（预约时自动带入）</label>
          <div className="flex flex-wrap gap-2">
            {ALL_SERVICES.map((svc) => (
              <button
                key={svc}
                onClick={() => toggleService(svc)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                  form.defaultServices.includes(svc)
                    ? 'bg-[#E8A87C] text-white shadow-md'
                    : 'bg-[#FFF8F0] text-[#8B7E74] border border-[#E8A87C]/30'
                }`}
              >
                {SERVICE_LABELS[svc]}
              </button>
            ))}
          </div>
        </div>

        {isEdit && id && (
          <div className="space-y-2 border-t border-[#E8A87C]/20 pt-5">
            <div className="flex items-center gap-2">
              <BellPlus size={16} className="text-[#E8A87C]" />
              <label className="text-sm font-medium text-[#3D2B1F]">手动添加提醒</label>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex gap-2">
                {(Object.entries(REMINDER_TYPE_LABELS) as [ReminderType, string][]).map(([val, label]) => (
                  <button
                    key={val}
                    onClick={() => setReminderType(val)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                      reminderType === val
                        ? 'bg-[#A8D5BA] text-[#3D2B1F] shadow-md'
                        : 'bg-[#FFF8F0] text-[#8B7E74] border border-[#A8D5BA]/30'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <input
                type="date"
                value={reminderDate}
                onChange={(e) => setReminderDate(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-xl border border-[#E8A87C]/30 bg-[#FFF8F0] focus:border-[#E8A87C] focus:ring-2 focus:ring-[#E8A87C]/20 outline-none transition-all text-sm"
              />
              <button
                onClick={handleAddReminder}
                disabled={!reminderDate}
                className="px-4 py-1.5 rounded-xl bg-[#A8D5BA] text-[#3D2B1F] text-xs font-medium hover:bg-[#96c9a8] transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
              >
                添加
              </button>
            </div>
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={!form.name.trim()}
          className="w-full flex items-center justify-center gap-2 bg-[#E8A87C] text-white py-3 rounded-xl font-medium hover:bg-[#d4956a] transition-colors shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Save size={18} />
          {isEdit ? '保存修改' : '添加宠物'}
        </button>
      </div>
    </div>
  )
}
