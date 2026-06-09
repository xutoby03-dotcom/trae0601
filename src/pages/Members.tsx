import { useState } from 'react'
import { Plus, Clock, JapaneseYen, Pencil, Trash2, X } from 'lucide-react'
import { useStore } from '@/store'
import { PREFERENCE_OPTIONS, ALLERGY_OPTIONS, AVATARS } from '@/utils'
import { cn } from '@/lib/utils'
import type { FamilyMember } from '@/types'

const PREF_COLORS: Record<string, string> = {
  '咸口': 'bg-orange-100 text-orange-700',
  '甜口': 'bg-pink-100 text-pink-700',
  '辣': 'bg-red-100 text-red-700',
  '清淡': 'bg-green-100 text-green-700',
  '快节奏': 'bg-blue-100 text-blue-700',
  '养胃': 'bg-teal-100 text-teal-700',
}

const defaultForm = {
  name: '',
  avatar: AVATARS[0],
  preferences: [] as string[],
  allergies: [] as string[],
  scheduleTime: '08:00',
  budget: 10,
}

export default function Members() {
  const { members, addMember, updateMember, deleteMember } = useStore()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(defaultForm)

  const openAdd = () => {
    setEditingId(null)
    setForm(defaultForm)
    setDrawerOpen(true)
  }

  const openEdit = (m: FamilyMember) => {
    setEditingId(m.id)
    setForm({
      name: m.name,
      avatar: m.avatar,
      preferences: [...m.preferences],
      allergies: [...m.allergies],
      scheduleTime: m.scheduleTime,
      budget: m.budget,
    })
    setDrawerOpen(true)
  }

  const handleSave = () => {
    if (!form.name.trim()) return
    if (editingId) {
      updateMember(editingId, form)
    } else {
      addMember(form)
    }
    setDrawerOpen(false)
  }

  const togglePref = (p: string) => {
    setForm((f) => ({
      ...f,
      preferences: f.preferences.includes(p) ? f.preferences.filter((x) => x !== p) : [...f.preferences, p],
    }))
  }

  const toggleAllergy = (a: string) => {
    setForm((f) => ({
      ...f,
      allergies: f.allergies.includes(a) ? f.allergies.filter((x) => x !== a) : [...f.allergies, a],
    }))
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#78350F]">家庭成员</h1>
        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 bg-[#F97316] text-white px-4 py-2 rounded-xl text-sm font-medium shadow-md active:scale-95 transition-transform"
        >
          <Plus size={16} /> 添加成员
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {members.map((m) => (
          <div key={m.id} className="bg-white rounded-2xl p-4 shadow-sm relative">
            <div className="absolute top-3 right-3 flex gap-1.5">
              <button onClick={() => openEdit(m)} className="text-[#78350F]/40 hover:text-[#F97316] transition-colors">
                <Pencil size={15} />
              </button>
              <button onClick={() => deleteMember(m.id)} className="text-[#78350F]/40 hover:text-red-500 transition-colors">
                <Trash2 size={15} />
              </button>
            </div>

            <div className="flex flex-col items-center mb-3">
              <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center text-3xl">
                {m.avatar}
              </div>
              <span className="mt-1.5 font-bold text-[#78350F]">{m.name}</span>
            </div>

            <div className="flex flex-wrap gap-1 mb-2">
              {m.preferences.map((p) => (
                <span key={p} className={cn('text-xs px-2 py-0.5 rounded-full', PREF_COLORS[p] || 'bg-gray-100 text-gray-600')}>
                  {p}
                </span>
              ))}
            </div>

            {m.allergies.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {m.allergies.map((a) => (
                  <span key={a} className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-600">
                    ⚠️{a}
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-[#78350F]/60 mt-1">
              <span className="flex items-center gap-1"><Clock size={12} />{m.scheduleTime}</span>
              <span className="flex items-center gap-1"><JapaneseYen size={12} />{m.budget}</span>
            </div>
          </div>
        ))}
      </div>

      {drawerOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/30" onClick={() => setDrawerOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-white shadow-2xl transition-transform duration-300 overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-orange-100">
              <h2 className="font-bold text-[#78350F]">{editingId ? '编辑成员' : '添加成员'}</h2>
              <button onClick={() => setDrawerOpen(false)} className="text-[#78350F]/40 hover:text-[#78350F]">
                <X size={20} />
              </button>
            </div>

            <div className="p-4 space-y-5">
              <div>
                <label className="text-sm font-medium text-[#78350F] mb-1.5 block">姓名</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full border border-orange-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F97316]/30"
                  placeholder="输入姓名"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-[#78350F] mb-1.5 block">头像</label>
                <div className="grid grid-cols-4 gap-2">
                  {AVATARS.map((a) => (
                    <button
                      key={a}
                      onClick={() => setForm((f) => ({ ...f, avatar: a }))}
                      className={cn(
                        'w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-all',
                        form.avatar === a ? 'bg-[#F97316] ring-2 ring-[#F97316]/30 scale-110' : 'bg-orange-50'
                      )}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-[#78350F] mb-1.5 block">口味偏好</label>
                <div className="flex flex-wrap gap-2">
                  {PREFERENCE_OPTIONS.map((p) => (
                    <button
                      key={p}
                      onClick={() => togglePref(p)}
                      className={cn(
                        'text-xs px-3 py-1.5 rounded-full transition-all',
                        form.preferences.includes(p)
                          ? PREF_COLORS[p]
                          : 'bg-gray-100 text-gray-400'
                      )}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-[#78350F] mb-1.5 block">过敏忌口</label>
                <div className="flex flex-wrap gap-2">
                  {ALLERGY_OPTIONS.map((a) => (
                    <button
                      key={a}
                      onClick={() => toggleAllergy(a)}
                      className={cn(
                        'text-xs px-3 py-1.5 rounded-full transition-all',
                        form.allergies.includes(a)
                          ? 'bg-red-50 text-red-600'
                          : 'bg-gray-100 text-gray-400'
                      )}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-[#78350F] mb-1.5 block">起床时间</label>
                <input
                  type="time"
                  value={form.scheduleTime}
                  onChange={(e) => setForm((f) => ({ ...f, scheduleTime: e.target.value }))}
                  className="w-full border border-orange-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F97316]/30"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-[#78350F] mb-1.5 block">每日预算</label>
                <div className="flex items-center gap-2">
                  <JapaneseYen size={16} className="text-[#78350F]/40" />
                  <input
                    type="number"
                    value={form.budget}
                    onChange={(e) => setForm((f) => ({ ...f, budget: Number(e.target.value) }))}
                    className="flex-1 border border-orange-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F97316]/30"
                    min={0}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-orange-200 text-[#78350F]/60 text-sm font-medium"
                >
                  取消
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 py-2.5 rounded-xl bg-[#F97316] text-white text-sm font-medium shadow-md active:scale-95 transition-transform"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
