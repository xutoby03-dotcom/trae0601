import { useState, useRef } from 'react'
import { X, Camera } from 'lucide-react'
import type { Clothing, Category, ClothingColor, Season, Occasion, WashStatus } from '@/types'
import { CATEGORY_LABELS, COLOR_LABELS, COLOR_HEX, SEASON_LABELS, OCCASION_LABELS, WASH_STATUS_LABELS } from '@/types'
import { generateId } from '@/store/wardrobeStore'

const ALL_COLORS = Object.keys(COLOR_LABELS) as ClothingColor[]
const ALL_SEASONS = Object.keys(SEASON_LABELS) as Season[]
const ALL_OCCASIONS = Object.keys(OCCASION_LABELS) as Occasion[]
const CATEGORIES: Category[] = ['top', 'bottom', 'outerwear', 'shoes', 'accessory']
const WASH_STATUSES: WashStatus[] = ['clean', 'dirty', 'washing']

interface AddClothingModalProps {
  editingItem?: Clothing | null
  onClose: () => void
  onSave: (item: Clothing) => void
}

export default function AddClothingModal({ editingItem, onClose, onSave }: AddClothingModalProps) {
  const [name, setName] = useState(editingItem?.name ?? '')
  const [category, setCategory] = useState<Category>(editingItem?.category ?? 'top')
  const [color, setColor] = useState<ClothingColor>(editingItem?.color ?? 'black')
  const [seasons, setSeasons] = useState<Season[]>(editingItem?.seasons ?? [])
  const [occasions, setOccasions] = useState<Occasion[]>(editingItem?.occasions ?? [])
  const [washStatus, setWashStatus] = useState<WashStatus>(editingItem?.washStatus ?? 'clean')
  const [photoUrl, setPhotoUrl] = useState(editingItem?.photoUrl ?? '')
  const fileRef = useRef<HTMLInputElement>(null)

  const toggleSeason = (s: Season) => {
    setSeasons((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s])
  }

  const toggleOccasion = (o: Occasion) => {
    setOccasions((prev) => prev.includes(o) ? prev.filter((x) => x !== o) : [...prev, o])
  }

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setPhotoUrl(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleSubmit = () => {
    if (!name.trim()) return
    onSave({
      id: editingItem?.id ?? generateId(),
      name: name.trim(),
      category,
      color,
      seasons,
      occasions,
      lastWornDate: editingItem?.lastWornDate ?? '',
      washStatus,
      photoUrl,
      createdAt: editingItem?.createdAt ?? new Date().toISOString().slice(0, 10),
    })
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-warm-200">
          <h2 className="font-display text-xl font-bold text-charcoal">
            {editingItem ? '编辑衣物' : '添加衣物'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-warm-100 rounded-full transition-colors">
            <X size={18} className="text-charcoal/50" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="text-xs font-medium text-charcoal/60 uppercase tracking-wider mb-2 block">照片</label>
            <div className="flex gap-3 items-start">
              <div
                className="w-20 h-24 rounded-xl border-2 border-dashed border-warm-300 flex items-center justify-center overflow-hidden cursor-pointer hover:border-warm-500 transition-colors"
                onClick={() => fileRef.current?.click()}
              >
                {photoUrl ? (
                  <img src={photoUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Camera size={20} className="text-warm-400" />
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="衣物名称"
                  className="w-full px-3 py-2 bg-warm-50 border border-warm-200 rounded-xl text-sm focus:outline-none focus:border-warm-500 focus:ring-1 focus:ring-warm-500/20"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-charcoal/60 uppercase tracking-wider mb-2 block">类别</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    category === c
                      ? 'bg-warm-500 text-white shadow-sm'
                      : 'bg-warm-100 text-charcoal/70 hover:bg-warm-200'
                  }`}
                >
                  {CATEGORY_LABELS[c]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-charcoal/60 uppercase tracking-wider mb-2 block">颜色</label>
            <div className="flex flex-wrap gap-2">
              {ALL_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`group relative w-8 h-8 rounded-full transition-all ${
                    color === c ? 'ring-2 ring-warm-500 ring-offset-2 scale-110' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: COLOR_HEX[c] }}
                  title={COLOR_LABELS[c]}
                >
                  {c === 'white' && (
                    <span className="absolute inset-0 rounded-full border border-gray-200" />
                  )}
                </button>
              ))}
            </div>
            <p className="text-xs text-warm-400 mt-1.5">{COLOR_LABELS[color]}</p>
          </div>

          <div>
            <label className="text-xs font-medium text-charcoal/60 uppercase tracking-wider mb-2 block">适合季节</label>
            <div className="flex flex-wrap gap-2">
              {ALL_SEASONS.map((s) => (
                <button
                  key={s}
                  onClick={() => toggleSeason(s)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    seasons.includes(s)
                      ? 'bg-mist text-white shadow-sm'
                      : 'bg-warm-100 text-charcoal/70 hover:bg-warm-200'
                  }`}
                >
                  {SEASON_LABELS[s]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-charcoal/60 uppercase tracking-wider mb-2 block">适合场合</label>
            <div className="flex flex-wrap gap-2">
              {ALL_OCCASIONS.map((o) => (
                <button
                  key={o}
                  onClick={() => toggleOccasion(o)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    occasions.includes(o)
                      ? 'bg-sand text-white shadow-sm'
                      : 'bg-warm-100 text-charcoal/70 hover:bg-warm-200'
                  }`}
                >
                  {OCCASION_LABELS[o]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-charcoal/60 uppercase tracking-wider mb-2 block">清洗状态</label>
            <div className="flex flex-wrap gap-2">
              {WASH_STATUSES.map((w) => (
                <button
                  key={w}
                  onClick={() => setWashStatus(w)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    washStatus === w
                      ? w === 'clean'
                        ? 'bg-emerald-500 text-white shadow-sm'
                        : w === 'dirty'
                          ? 'bg-red-500 text-white shadow-sm'
                          : 'bg-amber-500 text-white shadow-sm'
                      : 'bg-warm-100 text-charcoal/70 hover:bg-warm-200'
                  }`}
                >
                  {WASH_STATUS_LABELS[w]}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-warm-200 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-warm-100 text-charcoal/60 text-sm font-medium hover:bg-warm-200 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={!name.trim()}
            className="flex-1 py-2.5 rounded-xl bg-warm-500 text-white text-sm font-medium hover:bg-warm-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-warm-500/25"
          >
            {editingItem ? '保存修改' : '添加衣物'}
          </button>
        </div>
      </div>
    </div>
  )
}
