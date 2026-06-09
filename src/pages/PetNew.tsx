import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Cat, Dog, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useStore } from '@/store'
import { generateId, getPetAvatar } from '@/utils/helpers'
import type { Pet } from '@/types'

const vaccineOptions = ['已完全接种', '部分接种', '未接种']

export default function PetNew() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const pets = useStore((s) => s.pets)
  const addPet = useStore((s) => s.addPet)
  const updatePet = useStore((s) => s.updatePet)

  const isEditing = Boolean(id)
  const existingPet = isEditing ? pets.find((p) => p.id === id) : null

  const [form, setForm] = useState({
    name: '',
    breed: '',
    age: '',
    type: 'cat' as 'cat' | 'dog',
    vaccineStatus: '未接种',
    allergies: '',
    temperament: '',
    foodBrand: '',
    emergencyContact: '',
  })

  useEffect(() => {
    if (existingPet) {
      setForm({
        name: existingPet.name,
        breed: existingPet.breed,
        age: String(existingPet.age),
        type: existingPet.type,
        vaccineStatus: existingPet.vaccineStatus,
        allergies: existingPet.allergies,
        temperament: existingPet.temperament,
        foodBrand: existingPet.foodBrand,
        emergencyContact: existingPet.emergencyContact,
      })
    }
  }, [existingPet])

  function handleChange(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return

    if (isEditing && existingPet) {
      updatePet(existingPet.id, {
        name: form.name.trim(),
        breed: form.breed.trim(),
        age: Number(form.age) || 0,
        type: form.type,
        vaccineStatus: form.vaccineStatus,
        allergies: form.allergies.trim(),
        temperament: form.temperament.trim(),
        foodBrand: form.foodBrand.trim(),
        emergencyContact: form.emergencyContact.trim(),
      })
      navigate(`/pet/${existingPet.id}`)
    } else {
      const newPet: Pet = {
        id: generateId(),
        name: form.name.trim(),
        breed: form.breed.trim(),
        age: Number(form.age) || 0,
        type: form.type,
        vaccineStatus: form.vaccineStatus,
        allergies: form.allergies.trim(),
        temperament: form.temperament.trim(),
        foodBrand: form.foodBrand.trim(),
        emergencyContact: form.emergencyContact.trim(),
        avatarUrl: getPetAvatar({ type: form.type, name: form.name.trim() }),
      }
      addPet(newPet)
      navigate(`/pet/${newPet.id}`)
    }
  }

  return (
    <div className="animate-fade-in">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 inline-flex items-center gap-2 text-sm text-warm-500 transition-colors hover:text-warm-700"
      >
        <ArrowLeft className="h-4 w-4" />
        返回
      </button>

      <h1 className="font-display text-2xl font-bold text-warm-800">
        {isEditing ? '编辑宠物' : '添加宠物'}
      </h1>

      <form onSubmit={handleSubmit} className="mt-6 max-w-lg space-y-5">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-warm-600">宠物类型</label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => handleChange('type', 'cat')}
              className={cn(
                'flex flex-1 items-center justify-center gap-2 rounded-xl border-2 py-3 text-sm font-medium transition-all',
                form.type === 'cat'
                  ? 'border-coral-300 bg-coral-50 text-coral-400'
                  : 'border-warm-200 bg-white text-warm-400 hover:border-warm-300'
              )}
            >
              <Cat className="h-5 w-5" />
              猫咪
            </button>
            <button
              type="button"
              onClick={() => handleChange('type', 'dog')}
              className={cn(
                'flex flex-1 items-center justify-center gap-2 rounded-xl border-2 py-3 text-sm font-medium transition-all',
                form.type === 'dog'
                  ? 'border-leaf-300 bg-leaf-50 text-leaf-500'
                  : 'border-warm-200 bg-white text-warm-400 hover:border-warm-300'
              )}
            >
              <Dog className="h-5 w-5" />
              狗狗
            </button>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-warm-600">名字 *</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="宠物的名字"
            className="input-field"
            required
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-warm-600">品种</label>
          <input
            type="text"
            value={form.breed}
            onChange={(e) => handleChange('breed', e.target.value)}
            placeholder="如：英短、金毛"
            className="input-field"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-warm-600">年龄（岁）</label>
          <input
            type="number"
            min="0"
            max="30"
            value={form.age}
            onChange={(e) => handleChange('age', e.target.value)}
            placeholder="0"
            className="input-field"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-warm-600">疫苗状态</label>
          <select
            value={form.vaccineStatus}
            onChange={(e) => handleChange('vaccineStatus', e.target.value)}
            className="input-field"
          >
            {vaccineOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-warm-600">过敏情况</label>
          <input
            type="text"
            value={form.allergies}
            onChange={(e) => handleChange('allergies', e.target.value)}
            placeholder="如有过敏请填写"
            className="input-field"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-warm-600">性格特点</label>
          <input
            type="text"
            value={form.temperament}
            onChange={(e) => handleChange('temperament', e.target.value)}
            placeholder="如：温顺、活泼"
            className="input-field"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-warm-600">食物品牌</label>
          <input
            type="text"
            value={form.foodBrand}
            onChange={(e) => handleChange('foodBrand', e.target.value)}
            placeholder="常吃的猫粮/狗粮品牌"
            className="input-field"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-warm-600">紧急联系人</label>
          <input
            type="text"
            value={form.emergencyContact}
            onChange={(e) => handleChange('emergencyContact', e.target.value)}
            placeholder="姓名和电话"
            className="input-field"
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button type="submit" className="btn-primary">
            {isEditing ? '保存修改' : '添加宠物'}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn-secondary"
          >
            取消
          </button>
        </div>
      </form>
    </div>
  )
}
