import { useState } from 'react'
import { useTravelStore } from '@/store/useTravelStore'
import type { StoryStyle } from '@/types'
import { generateStoryText, getStyleEmoji, getStyleDescription } from '@/utils/helpers'
import type { StorySection } from '@/utils/helpers'
import { Link } from 'react-router-dom'
import { BookOpen, Sparkles, PenLine } from 'lucide-react'

const STYLES: StoryStyle[] = ['轻松', '纪念', '攻略']

export default function Story() {
  const { currentTripId, trips, selectedStyle, setSelectedStyle, getTripDays, getTripPhotos } = useTravelStore()
  const [sections, setSections] = useState<StorySection[]>([])
  const [editingIdx, setEditingIdx] = useState<number | null>(null)
  const [editDraft, setEditDraft] = useState('')

  const trip = trips.find((t) => t.id === currentTripId)

  const handleGenerate = () => {
    if (!trip) return
    const tripDays = getTripDays(trip.id)
    const tripPhotos = getTripPhotos(trip.id)
    const result = generateStoryText(trip, tripDays, tripPhotos, selectedStyle)
    setSections(result)
    setEditingIdx(null)
  }

  const handleStartEdit = (idx: number) => {
    if (sections[idx].type === 'photo') return
    setEditingIdx(idx)
    setEditDraft(sections[idx].content)
  }

  const handleFinishEdit = (idx: number) => {
    const updated = [...sections]
    updated[idx] = { ...updated[idx], content: editDraft }
    setSections(updated)
    setEditingIdx(null)
  }

  if (!trip) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4 px-6">
        <BookOpen className="w-12 h-12 text-warm-orange/40" />
        <p className="text-warm-brown/50 text-center">请先选择一段旅程</p>
        <Link
          to="/"
          className="px-5 py-2 bg-warm-orange text-white rounded-full text-sm hover:bg-warm-orange/90 transition-colors"
        >
          去选择
        </Link>
      </div>
    )
  }

  return (
    <div className="px-4 pt-4 pb-24">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/" className="text-warm-brown/60 hover:text-warm-orange transition-colors text-sm">
          ← 返回
        </Link>
        <h1 className="text-xl font-bold text-warm-brown">故事生成</h1>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        {STYLES.map((style) => (
          <button
            key={style}
            onClick={() => setSelectedStyle(style)}
            className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200 ${
              selectedStyle === style
                ? 'border-warm-orange bg-warm-orange/5 scale-[1.03] shadow-sm'
                : 'border-warm-brown/10 bg-white hover:border-warm-orange/30'
            }`}
          >
            <span className="text-3xl">{getStyleEmoji(style)}</span>
            <span className="text-sm font-semibold text-warm-brown">{style}</span>
            <span className="text-[10px] text-warm-brown/50 leading-tight text-center">
              {getStyleDescription(style)}
            </span>
          </button>
        ))}
      </div>

      <button
        onClick={handleGenerate}
        className="w-full flex items-center justify-center gap-2 py-3 bg-warm-orange text-white rounded-2xl font-semibold text-base hover:bg-warm-orange/90 active:scale-[0.98] transition-all mb-8"
      >
        <Sparkles className="w-5 h-5" />
        生成游记
      </button>

      {sections.length > 0 && (
        <div className="space-y-5">
          {sections.map((section, idx) => {
            switch (section.type) {
              case 'title':
                return (
                  <h2 key={idx} className="font-display text-3xl font-bold text-warm-brown text-center leading-snug">
                    {section.content}
                  </h2>
                )
              case 'intro':
                return (
                  <p key={idx} className="text-warm-brown/70 italic text-center text-sm leading-relaxed px-2">
                    {section.content}
                  </p>
                )
              case 'day-header':
                return (
                  <div key={idx} className="flex items-center gap-3 pt-2">
                    <div className="flex-1 h-px bg-warm-brown/10" />
                    <span className="text-sm font-semibold text-warm-orange whitespace-nowrap">
                      {section.content}
                    </span>
                    <div className="flex-1 h-px bg-warm-brown/10" />
                  </div>
                )
              case 'text':
                return (
                  <div key={idx} className="group relative">
                    {editingIdx === idx ? (
                      <div className="space-y-2">
                        <textarea
                          value={editDraft}
                          onChange={(e) => setEditDraft(e.target.value)}
                          className="w-full p-3 rounded-xl border border-warm-orange/30 bg-white text-warm-brown text-sm leading-relaxed resize-none focus:outline-none focus:border-warm-orange"
                          rows={3}
                          autoFocus
                        />
                        <button
                          onClick={() => handleFinishEdit(idx)}
                          className="text-xs text-warm-orange hover:underline"
                        >
                          完成
                        </button>
                      </div>
                    ) : (
                      <p
                        onClick={() => handleStartEdit(idx)}
                        className="text-warm-brown/80 text-sm leading-relaxed cursor-pointer hover:bg-warm-orange/5 rounded-lg p-2 -m-2 transition-colors"
                      >
                        {section.content}
                        <PenLine className="w-3 h-3 inline ml-1 text-warm-orange/0 group-hover:text-warm-orange/50 transition-colors" />
                      </p>
                    )}
                  </div>
                )
              case 'photo':
                return (
                  <div key={idx} className="rounded-xl overflow-hidden shadow-sm">
                    <img
                      src={section.content}
                      alt={section.caption || ''}
                      className="w-full h-48 object-cover"
                    />
                    {section.caption && (
                      <p className="text-xs text-warm-brown/50 px-3 py-2 bg-white text-center">
                        {section.caption}
                      </p>
                    )}
                  </div>
                )
              case 'cost':
                return (
                  <p key={idx} className="text-warm-brown/40 text-xs text-right">
                    {section.content}
                  </p>
                )
              case 'summary':
                return (
                  <div key={idx} className="bg-warm-orange/10 rounded-2xl p-5 mt-4">
                    <p className="text-warm-brown/80 text-sm leading-relaxed text-center">
                      {section.content}
                    </p>
                  </div>
                )
              default:
                return null
            }
          })}
        </div>
      )}
    </div>
  )
}
