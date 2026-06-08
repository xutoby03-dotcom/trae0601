import { useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { usePetStore } from '@/store'
import { ArrowLeft, Upload } from 'lucide-react'

export default function EditPet() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { pets, updatePet } = usePetStore()

  const pet = pets.find((p) => p.id === id)

  const [name, setName] = useState(pet?.name ?? '')
  const [species, setSpecies] = useState<'cat' | 'dog'>(pet?.species ?? 'cat')
  const [breed, setBreed] = useState(pet?.breed ?? '')
  const [birthday, setBirthday] = useState(pet?.birthday ?? '')
  const [weight, setWeight] = useState(pet?.weight?.toString() ?? '')
  const [chipNumber, setChipNumber] = useState(pet?.chipNumber ?? '')
  const [hospital, setHospital] = useState(pet?.hospital ?? '')
  const [photo, setPhoto] = useState(pet?.photo ?? '')
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      setPhoto(ev.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    updatePet(pet.id, {
      name: name.trim(),
      species,
      breed: breed.trim(),
      birthday,
      weight: weight ? parseFloat(weight) : 0,
      chipNumber: chipNumber.trim(),
      hospital: hospital.trim(),
      photo,
    })

    navigate(`/pet/${pet.id}`)
  }

  return (
    <div className="animate-fade-in space-y-6 max-w-2xl">
      <header className="flex items-center gap-3">
        <button
          onClick={() => navigate(`/pet/${pet.id}`)}
          className="w-10 h-10 rounded-xl bg-warm-100 hover:bg-warm-200 flex items-center justify-center transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-warm-700" />
        </button>
        <h1 className="section-title">编辑宠物</h1>
      </header>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="card p-6 space-y-5">
          <div className="flex flex-col items-center mb-2">
            <div
              className="w-24 h-24 rounded-full bg-warm-100 border-2 border-dashed border-warm-300 flex items-center justify-center overflow-hidden cursor-pointer hover:border-warm-400 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              {photo ? (
                <img src={photo} alt="宠物照片" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center">
                  <Upload className="w-6 h-6 text-warm-300 mx-auto mb-1" />
                  <p className="text-xs text-warm-300">上传照片</p>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
            />
          </div>

          <div>
            <label className="label-field">名字 *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              placeholder="宠物的名字"
              required
            />
          </div>

          <div>
            <label className="label-field">物种</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setSpecies('cat')}
                className={`flex-1 py-3 rounded-xl font-medium transition-all duration-200 ${
                  species === 'cat'
                    ? 'bg-pink-50 text-pink-600 border-2 border-pink-300'
                    : 'bg-warm-50 text-warm-400 border-2 border-transparent hover:bg-warm-100'
                }`}
              >
                🐱 猫咪
              </button>
              <button
                type="button"
                onClick={() => setSpecies('dog')}
                className={`flex-1 py-3 rounded-xl font-medium transition-all duration-200 ${
                  species === 'dog'
                    ? 'bg-blue-50 text-blue-600 border-2 border-blue-300'
                    : 'bg-warm-50 text-warm-400 border-2 border-transparent hover:bg-warm-100'
                }`}
              >
                🐶 狗狗
              </button>
            </div>
          </div>

          <div>
            <label className="label-field">品种</label>
            <input
              type="text"
              value={breed}
              onChange={(e) => setBreed(e.target.value)}
              className="input-field"
              placeholder="如：英短、金毛"
            />
          </div>

          <div>
            <label className="label-field">生日</label>
            <input
              type="date"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              className="input-field"
            />
          </div>

          <div>
            <label className="label-field">体重 (kg)</label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="input-field"
              placeholder="0.0"
            />
          </div>

          <div>
            <label className="label-field">芯片号</label>
            <input
              type="text"
              value={chipNumber}
              onChange={(e) => setChipNumber(e.target.value)}
              className="input-field"
              placeholder="宠物芯片编号"
            />
          </div>

          <div>
            <label className="label-field">常去医院</label>
            <input
              type="text"
              value={hospital}
              onChange={(e) => setHospital(e.target.value)}
              className="input-field"
              placeholder="宠物医院名称"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate(`/pet/${pet.id}`)}
            className="btn-secondary flex-1"
          >
            取消
          </button>
          <button type="submit" className="btn-primary flex-1">
            保存修改
          </button>
        </div>
      </form>
    </div>
  )
}
