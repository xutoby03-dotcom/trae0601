import { useState } from 'react'
import { X, Plus, Trash2, UserPlus } from 'lucide-react'
import { useKitchenStore } from '@/store/kitchenStore'

interface MemberManagerProps {
  onClose: () => void
}

export default function MemberManager({ onClose }: MemberManagerProps) {
  const { members, addMember, removeMember } = useKitchenStore()
  const [newName, setNewName] = useState('')

  const handleAdd = () => {
    if (!newName.trim()) return
    addMember(newName.trim())
    setNewName('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAdd()
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/30 animate-fade-in" onClick={onClose}>
      <div
        className="bg-sticker-blue w-full max-w-sm rounded-sm sticker-shadow animate-sticky-pop"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticker-tape" />

        <div className="p-5 pt-7 sticker-lined">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-handwritten text-2xl font-bold text-gray-800">
              👥 家庭成员
            </h2>
            <button onClick={onClose} className="p-1 hover:bg-black/5 rounded-full transition-colors">
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          <div className="space-y-2 mb-4">
            {members.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between bg-white/50 rounded-lg px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
                    style={{ backgroundColor: m.color + '30', border: `2px solid ${m.color}` }}
                  >
                    {m.avatar}
                  </span>
                  <span className="font-medium text-sm text-gray-800">{m.name}</span>
                </div>
                {members.length > 1 && (
                  <button
                    onClick={() => removeMember(m.id)}
                    className="p-1 hover:bg-red-100 rounded-full transition-colors"
                  >
                    <Trash2 size={14} className="text-red-400" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入成员名字"
              className="flex-1 px-3 py-2 bg-white/60 rounded border border-gray-300/50 font-body text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/30 placeholder:text-gray-400"
            />
            <button
              onClick={handleAdd}
              disabled={!newName.trim()}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
            >
              <Plus size={14} />
              添加
            </button>
          </div>

          <p className="text-xs text-gray-400 mt-3 text-center">
            添加的成员可以参与轮班分配
          </p>
        </div>
      </div>
    </div>
  )
}
