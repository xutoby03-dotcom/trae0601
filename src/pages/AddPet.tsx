import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Cat, Dog, ArrowLeft, Camera, Save } from 'lucide-react'
import { usePetStore } from '@/store'
import type { Pet } from '@/types'

type PetFormData = Omit<Pet, 'id' | 'createdAt'>

export default function AddPet() {
  const navigate = useNavigate()
  const addPet = usePetStore((s) => s.addPet)

  const [form, setForm] = useState<PetFormData>({
    name: '',
    species: 'cat',
    breed: '',
    birthday: '',
    weight: 0,
    chipNumber: '',
    photo: '',
    hospital: '',
  })

  const update = <K extends keyof PetFormData>(key: K, value: PetFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      update('photo', reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    addPet(form)
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-warm-50 pb-8">
      <header className="sticky top-0 z-10 bg-warm-50/80 backdrop-blur-md border-b border-warm-100">
        <div className="max-w-lg mx-auto flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-full hover:bg-warm-100 transition-colors text-warm-600"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-semibold text-warm-800">添加宠物</h1>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="max-w-lg mx-auto px-4 mt-6 space-y-5">
        <div className="card p-6 space-y-5">
          <div className="flex justify-center">
            <label className="relative cursor-pointer group">
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-warm-200 bg-warm-50 flex items-center justify-center">
                {form.photo ? (
                  <img src={form.photo} alt="预览" className="w-full h-full object-cover" />
                ) : (
                  <Camera size={28} className="text-warm-300" />
                )}
              </div>
              <div className="absolute inset-0 rounded-full bg-warm-900/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera size={20} className="text-white" />
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
            </label>
          </div>

          <div>
            <label className="label-field">宠物名字 <span className="text-pet-red">*</span></label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              placeholder="请输入宠物名字"
              className="input-field"
            />
          </div>

          <div>
            <label className="label-field">宠物类型</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => update('species', 'cat')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all duration-200 ${
                  form.species === 'cat'
                    ? 'bg-warm-400 text-white shadow-sm'
                    : 'bg-warm-100 text-warm-600 hover:bg-warm-200'
                }`}
              >
                <Cat size={20} />
                猫咪
              </button>
              <button
                type="button"
                onClick={() => update('species', 'dog')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all duration-200 ${
                  form.species === 'dog'
                    ? 'bg-warm-400 text-white shadow-sm'
                    : 'bg-warm-100 text-warm-600 hover:bg-warm-200'
                }`}
              >
                <Dog size={20} />
                狗狗
              </button>
            </div>
          </div>

          <div>
            <label className="label-field">品种</label>
            <input
              type="text"
              value={form.breed}
              onChange={(e) => update('breed', e.target.value)}
              placeholder="如：英短、柯基"
              className="input-field"
            />
          </div>

          <div>
            <label className="label-field">生日</label>
            <input
              type="date"
              value={form.birthday}
              onChange={(e) => update('birthday', e.target.value)}
              className="input-field"
            />
          </div>

          <div>
            <label className="label-field">体重/公斤</label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={form.weight || ''}
              onChange={(e) => update('weight', parseFloat(e.target.value) || 0)}
              placeholder="0.0"
              className="input-field"
            />
          </div>

          <div>
            <label className="label-field">芯片号</label>
            <input
              type="text"
              value={form.chipNumber}
              onChange={(e) => update('chipNumber', e.target.value)}
              placeholder="请输入芯片号"
              className="input-field"
            />
          </div>

          <div>
            <label className="label-field">常去医院</label>
            <input
              type="text"
              value={form.hospital}
              onChange={(e) => update('hospital', e.target.value)}
              placeholder="请输入常去的宠物医院"
              className="input-field"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={() => navigate('/')} className="btn-secondary flex-1">
            取消
          </button>
          <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2">
            <Save size={18} />
            保存
          </button>
        </div>
      </form>
    </div>
  )
}
