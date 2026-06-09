import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUmbrellaStore } from '@/store'
import { UMBRELLA_COLORS, LOCATIONS, SIZE_LABELS } from '@/types'
import type { UmbrellaSize } from '@/types'
import { generateUmbrellaCode } from '@/utils/helpers'
import { Camera, Check, Shuffle } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Register() {
  const navigate = useNavigate()
  const addUmbrella = useUmbrellaStore((s) => s.addUmbrella)

  const [code, setCode] = useState(generateUmbrellaCode())
  const [color, setColor] = useState(UMBRELLA_COLORS[0].value)
  const [size, setSize] = useState<UmbrellaSize>('M')
  const [location, setLocation] = useState(LOCATIONS[0].name)
  const [deposit, setDeposit] = useState(0)
  const [contributorName, setContributorName] = useState('')
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setPhotoPreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!contributorName.trim()) return

    addUmbrella({
      code,
      color,
      size,
      location,
      deposit,
      photoUrl: photoPreview || '',
      status: 'available',
      contributorId: `c_${Date.now()}`,
      contributorName: contributorName.trim(),
    })
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center py-16"
        >
          <div className="w-20 h-20 rounded-3xl bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <Check className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2 font-display">登记成功！</h2>
          <p className="text-sm text-slate-500 mb-6">
            雨伞 {code} 已添加到共享架
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate('/')}
              className="px-5 py-2 rounded-full bg-[#1B3A5C] text-white text-sm font-semibold hover:bg-[#2D5F8B] transition-colors"
            >
              返回首页
            </button>
            <button
              onClick={() => {
                setCode(generateUmbrellaCode())
                setPhotoPreview(null)
                setSubmitted(false)
              }}
              className="px-5 py-2 rounded-full border-2 border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors"
            >
              继续登记
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#1B3A5C] font-display">登记共享雨伞</h2>
        <p className="text-sm text-slate-400 mt-1">分享一把伞，温暖整个社区</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-white rounded-2xl border border-slate-200/60 p-5 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">伞编号</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A5C]/20 focus:border-[#1B3A5C] transition-all"
                placeholder="输入编号"
              />
              <button
                type="button"
                onClick={() => setCode(generateUmbrellaCode())}
                className="px-3 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
                title="随机生成"
              >
                <Shuffle className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">颜色</label>
            <div className="flex flex-wrap gap-2">
              {UMBRELLA_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  className={`w-9 h-9 rounded-xl border-2 transition-all duration-200 flex items-center justify-center ${
                    color === c.value
                      ? 'border-[#1B3A5C] scale-110 shadow-md'
                      : 'border-transparent hover:border-slate-300'
                  }`}
                  style={{ backgroundColor: c.value }}
                  title={c.name}
                >
                  {color === c.value && (
                    <Check className="w-4 h-4 text-white drop-shadow-md" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">大小</label>
            <div className="flex gap-2">
              {(['S', 'M', 'L'] as UmbrellaSize[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSize(s)}
                  className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    size === s
                      ? 'bg-[#1B3A5C] text-white shadow-md'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {SIZE_LABELS[s]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">放置点</label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A5C]/20 focus:border-[#1B3A5C] transition-all bg-white"
            >
              {LOCATIONS.map((loc) => (
                <option key={loc.id} value={loc.name}>{loc.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">押金规则</label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={deposit}
                onChange={(e) => setDeposit(Math.max(0, parseInt(e.target.value) || 0))}
                min={0}
                className="w-28 px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A5C]/20 focus:border-[#1B3A5C] transition-all"
              />
              <span className="text-sm text-slate-500">元（0为免押金）</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">你的名字</label>
            <input
              type="text"
              value={contributorName}
              onChange={(e) => setContributorName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A5C]/20 focus:border-[#1B3A5C] transition-all"
              placeholder="贡献者姓名"
              required
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/60 p-5">
          <label className="block text-sm font-semibold text-slate-700 mb-2">雨伞照片</label>
          {photoPreview ? (
            <div className="relative">
              <img
                src={photoPreview}
                alt="雨伞照片"
                className="w-full h-48 object-cover rounded-xl"
              />
              <button
                type="button"
                onClick={() => setPhotoPreview(null)}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center text-sm hover:bg-black/70"
              >
                ✕
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center h-36 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-[#1B3A5C]/40 hover:bg-slate-50 transition-all">
              <Camera className="w-8 h-8 text-slate-300 mb-2" />
              <span className="text-sm text-slate-400">点击上传照片</span>
              <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
            </label>
          )}
        </div>

        <button
          type="submit"
          disabled={!contributorName.trim()}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#1B3A5C] to-[#2D5F8B] text-white font-bold text-sm shadow-lg shadow-blue-900/20 hover:shadow-xl hover:shadow-blue-900/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          确认登记
        </button>
      </form>
    </div>
  )
}
