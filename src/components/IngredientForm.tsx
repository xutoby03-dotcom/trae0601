import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useIngredientStore, UNITS, SIZE_TAGS } from '@/store/useIngredientStore'
import type { SizeTag } from '@/types'

export default function IngredientForm() {
  const addIngredient = useIngredientStore((s) => s.addIngredient)
  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [unit, setUnit] = useState('个')
  const [expiryDate, setExpiryDate] = useState('')
  const [sizeTag, setSizeTag] = useState<SizeTag>('medium')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    addIngredient({
      name: name.trim(),
      quantity,
      unit,
      expiryDate: expiryDate || new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
      sizeTag,
    })
    setName('')
    setQuantity(1)
    setUnit('个')
    setExpiryDate('')
    setSizeTag('medium')
  }

  return (
    <form onSubmit={handleSubmit} className="bg-stone-900 rounded-2xl p-5 border border-stone-800">
      <h3 className="text-lg font-serif text-stone-100 mb-4">添加冰箱食材</h3>
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="食材名称，如：洋葱、鸡蛋"
            className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-2.5 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-orange-500 transition-colors"
          />
        </div>
        <div>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            min={0.1}
            step={0.1}
            className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-2.5 text-stone-100 focus:outline-none focus:border-orange-500 transition-colors"
          />
        </div>
        <div>
          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-2.5 text-stone-100 focus:outline-none focus:border-orange-500 transition-colors appearance-none"
          >
            {UNITS.map((u) => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </div>
        <div className="col-span-2">
          <input
            type="date"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-2.5 text-stone-100 focus:outline-none focus:border-orange-500 transition-colors"
          />
        </div>
        <div className="col-span-2">
          <div className="flex gap-2">
            {SIZE_TAGS.map((st) => (
              <button
                key={st.value}
                type="button"
                onClick={() => setSizeTag(st.value)}
                className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
                  sizeTag === st.value
                    ? 'bg-orange-500 text-white'
                    : 'bg-stone-800 text-stone-400 border border-stone-700 hover:border-stone-600'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      <button
        type="submit"
        className="mt-4 w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-medium py-2.5 rounded-xl transition-colors"
      >
        <Plus size={18} />
        添加食材
      </button>
    </form>
  )
}
