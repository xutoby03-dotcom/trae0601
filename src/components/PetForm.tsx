import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Info, Utensils, Heart, Sparkles, X } from 'lucide-react'
import { usePetStore } from '@/store/usePetStore'
import type { Pet, PetType } from '@/types'
import { generateId } from '@/types'

interface PetFormProps {
  open: boolean
  onClose: () => void
  editPet?: Pet | null
}

const EMPTY_FORM = {
  name: '',
  type: 'cat' as PetType,
  photo: '',
  feedPerDay: 2,
  feedAmountGrams: 80,
  restrictions: '',
  medications: '',
  specialHabits: '',
}

export default function PetForm({ open, onClose, editPet }: PetFormProps) {
  const addPet = usePetStore((s) => s.addPet)
  const updatePet = usePetStore((s) => s.updatePet)

  const [form, setForm] = useState(EMPTY_FORM)

  useEffect(() => {
    if (editPet) {
      setForm({
        name: editPet.name,
        type: editPet.type,
        photo: editPet.photo,
        feedPerDay: editPet.feedPerDay,
        feedAmountGrams: editPet.feedAmountGrams,
        restrictions: editPet.restrictions,
        medications: editPet.medications,
        specialHabits: editPet.specialHabits,
      })
    } else {
      setForm(EMPTY_FORM)
    }
  }, [editPet, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return

    if (editPet) {
      updatePet(editPet.id, form)
    } else {
      addPet(form)
    }
    onClose()
  }

  const set = (key: keyof typeof form, value: string | number) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className="fixed right-0 inset-y-0 w-full max-w-md bg-white shadow-xl z-50 flex flex-col"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-orange-100">
              <h2 className="font-display text-lg font-bold text-brand-orange">
                {editPet ? '编辑宠物' : '添加宠物'}
              </h2>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-orange-50 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Info className="w-4 h-4 text-brand-orange" />
                  <h3 className="text-sm font-semibold text-gray-700">基本信息</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">名字</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => set('name', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-orange-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange transition-colors"
                      placeholder="宠物的名字"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">类型</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => set('type', 'cat')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                          form.type === 'cat'
                            ? 'border-brand-orange bg-orange-50 text-brand-orange'
                            : 'border-gray-200 text-gray-500 hover:border-orange-200'
                        }`}
                      >
                        🐱 猫咪
                      </button>
                      <button
                        type="button"
                        onClick={() => set('type', 'dog')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                          form.type === 'dog'
                            ? 'border-brand-green bg-green-50 text-brand-green'
                            : 'border-gray-200 text-gray-500 hover:border-green-200'
                        }`}
                      >
                        🐶 狗狗
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">照片 URL</label>
                    <input
                      type="text"
                      value={form.photo}
                      onChange={(e) => set('photo', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-orange-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange transition-colors"
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Utensils className="w-4 h-4 text-brand-green" />
                  <h3 className="text-sm font-semibold text-gray-700">饮食</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">每日喂食次数</label>
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => set('feedPerDay', n)}
                          className={`w-10 h-10 rounded-lg border text-sm font-medium transition-colors ${
                            form.feedPerDay === n
                              ? 'border-brand-green bg-green-50 text-brand-green'
                              : 'border-gray-200 text-gray-500 hover:border-green-200'
                          }`}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">每次喂食量（克）</label>
                    <input
                      type="number"
                      value={form.feedAmountGrams}
                      onChange={(e) => set('feedAmountGrams', Number(e.target.value))}
                      min={1}
                      className="w-full px-3 py-2 rounded-lg border border-orange-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">饮食限制</label>
                    <textarea
                      value={form.restrictions}
                      onChange={(e) => set('restrictions', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 rounded-lg border border-orange-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange transition-colors resize-none"
                      placeholder="如：不能吃巧克力、洋葱..."
                    />
                  </div>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Heart className="w-4 h-4 text-red-400" />
                  <h3 className="text-sm font-semibold text-gray-700">医疗</h3>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">药物</label>
                  <textarea
                    value={form.medications}
                    onChange={(e) => set('medications', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 rounded-lg border border-orange-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange transition-colors resize-none"
                    placeholder="如：驱虫药每月一次..."
                  />
                </div>
              </section>

              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-semibold text-gray-700">习惯</h3>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">特殊习惯</label>
                  <textarea
                    value={form.specialHabits}
                    onChange={(e) => set('specialHabits', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 rounded-lg border border-orange-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange transition-colors resize-none"
                    placeholder="如：喜欢挠沙发、怕水..."
                  />
                </div>
              </section>
            </form>

            <div className="px-6 py-4 border-t border-orange-100">
              <button
                onClick={handleSubmit}
                className="w-full py-2.5 rounded-xl bg-brand-orange text-white text-sm font-semibold hover:bg-orange-600 transition-colors"
              >
                {editPet ? '保存修改' : '添加宠物'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
