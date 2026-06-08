import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import { useCoffeeStore } from '@/store/coffeeStore'
import StarRating from '@/components/StarRating'
import { GRIND_SIZES, EQUIPMENT_OPTIONS } from '@/utils/constants'
import type { GrindSize } from '@/types'

export default function BrewForm() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const beanId = searchParams.get('beanId') || ''
  const beans = useCoffeeStore((s) => s.beans)
  const addBrew = useCoffeeStore((s) => s.addBrew)
  const bean = beans.find((b) => b.id === beanId)

  const [ratio, setRatio] = useState('1:15')
  const [waterTemp, setWaterTemp] = useState(92)
  const [grindSize, setGrindSize] = useState<GrindSize>('medium')
  const [extractionTime, setExtractionTime] = useState('3:00')
  const [equipment, setEquipment] = useState(EQUIPMENT_OPTIONS[0])
  const [brewedAt, setBrewedAt] = useState(new Date().toISOString().split('T')[0])
  const [rating, setRating] = useState(0)
  const [notes, setNotes] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    addBrew({
      beanId,
      ratio,
      waterTemp,
      grindSize,
      extractionTime,
      equipment,
      rating,
      notes,
      brewedAt,
    })
    navigate(`/beans/${beanId}`)
  }

  return (
    <div className="min-h-screen bg-[#FFFDF8]">
      <header className="sticky top-0 z-10 bg-[#FFFDF8] px-4 pt-4 pb-2">
        <button
          onClick={() => navigate(-1)}
          className="mb-2 flex items-center gap-1 text-[#6F4E37] hover:text-[#5C3A1E] transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-[#3E2412]">记录冲煮</h1>
        {bean && (
          <p className="mt-0.5 text-sm text-[#8B6914]">{bean.name}</p>
        )}
      </header>

      <form onSubmit={handleSubmit} className="px-4 pb-8 space-y-4">
        <section className="rounded-2xl bg-white/80 shadow-sm p-4 space-y-4">
          <h2 className="text-base font-semibold text-[#3E2412]">冲煮参数</h2>

          <div className="space-y-1">
            <label className="text-sm text-[#6F4E37]">水粉比</label>
            <input
              type="text"
              value={ratio}
              onChange={(e) => setRatio(e.target.value)}
              placeholder="1:15"
              className="w-full rounded-lg border border-[#E8D5BC] bg-[#FFFDF8] px-3 py-2 text-sm text-[#3E2412] placeholder:text-[#C4A882] focus:border-[#8B6914] focus:outline-none transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm text-[#6F4E37]">水温 (°C)</label>
            <input
              type="number"
              value={waterTemp}
              onChange={(e) => setWaterTemp(Number(e.target.value))}
              className="w-full rounded-lg border border-[#E8D5BC] bg-[#FFFDF8] px-3 py-2 text-sm text-[#3E2412] focus:border-[#8B6914] focus:outline-none transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm text-[#6F4E37]">研磨粗细</label>
            <select
              value={grindSize}
              onChange={(e) => setGrindSize(e.target.value as GrindSize)}
              className="w-full rounded-lg border border-[#E8D5BC] bg-[#FFFDF8] px-3 py-2 text-sm text-[#3E2412] focus:border-[#8B6914] focus:outline-none transition-colors"
            >
              {GRIND_SIZES.map((g) => (
                <option key={g.value} value={g.value}>{g.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-sm text-[#6F4E37]">萃取时间</label>
            <input
              type="text"
              value={extractionTime}
              onChange={(e) => setExtractionTime(e.target.value)}
              placeholder="3:30"
              className="w-full rounded-lg border border-[#E8D5BC] bg-[#FFFDF8] px-3 py-2 text-sm text-[#3E2412] placeholder:text-[#C4A882] focus:border-[#8B6914] focus:outline-none transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm text-[#6F4E37]">器具</label>
            <select
              value={equipment}
              onChange={(e) => setEquipment(e.target.value)}
              className="w-full rounded-lg border border-[#E8D5BC] bg-[#FFFDF8] px-3 py-2 text-sm text-[#3E2412] focus:border-[#8B6914] focus:outline-none transition-colors"
            >
              {EQUIPMENT_OPTIONS.map((eq) => (
                <option key={eq} value={eq}>{eq}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-sm text-[#6F4E37]">冲煮日期</label>
            <input
              type="date"
              value={brewedAt}
              onChange={(e) => setBrewedAt(e.target.value)}
              className="w-full rounded-lg border border-[#E8D5BC] bg-[#FFFDF8] px-3 py-2 text-sm text-[#3E2412] focus:border-[#8B6914] focus:outline-none transition-colors"
            />
          </div>
        </section>

        <section className="rounded-2xl bg-white/80 shadow-sm p-4 space-y-4">
          <h2 className="text-base font-semibold text-[#3E2412]">这次喝得怎样</h2>

          <div className="space-y-1">
            <label className="text-sm text-[#6F4E37]">评分</label>
            <StarRating value={rating} onChange={setRating} />
          </div>

          <div className="space-y-1">
            <label className="text-sm text-[#6F4E37]">品鉴备注</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="记录你的品鉴感受..."
              className="w-full rounded-lg border border-[#E8D5BC] bg-[#FFFDF8] px-3 py-2 text-sm text-[#3E2412] placeholder:text-[#C4A882] focus:border-[#8B6914] focus:outline-none transition-colors resize-none"
            />
          </div>
        </section>

        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#6F4E37] py-3 text-sm font-semibold text-white shadow-md hover:bg-[#5C3A1E] active:scale-[0.98] transition-all"
        >
          <Save size={18} />
          保存冲煮记录
        </button>
      </form>
    </div>
  )
}
