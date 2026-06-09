import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, MessageSquare, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useStore } from '@/store'
import type { Message } from '@/types'
import { generateId, formatDateTime, priorityLabels } from '@/utils/helpers'

type Priority = Message['priority']

export default function Messages() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { fosters, pets, messages, addMessage, deleteMessage } = useStore()

  const foster = fosters.find((f) => f.id === id)
  const pet = foster ? pets.find((p) => p.id === foster.petId) : undefined
  const fosterMessages = messages
    .filter((m) => m.fosterId === id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const [content, setContent] = useState('')
  const [priority, setPriority] = useState<Priority>('normal')

  if (!foster || !pet) return null

  const handleSend = () => {
    if (!content.trim()) return
    addMessage({
      id: generateId(),
      fosterId: id!,
      content: content.trim(),
      priority,
      createdAt: new Date().toISOString(),
    })
    setContent('')
    setPriority('normal')
  }

  const handleDelete = (id: string) => {
    if (window.confirm('确定删除这条留言吗？')) {
      deleteMessage(id)
    }
  }

  return (
    <div className="p-4 pb-24">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft className="w-5 h-5 text-warm-500" />
        </button>
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-coral-400" />
          <h1 className="font-display text-xl text-warm-800">留言板</h1>
        </div>
      </div>

      <div className="section-card bg-white mb-6">
        <textarea
          className="input-field min-h-[80px] resize-none mb-3"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="写下给主人的留言..."
        />
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setPriority('normal')}
              className={cn(
                'px-3 py-1.5 rounded-full text-sm font-medium transition-all',
                priority === 'normal'
                  ? 'bg-warm-100 text-warm-700 border border-warm-300'
                  : 'bg-white text-warm-400 border border-warm-200'
              )}
            >
              {priorityLabels.normal}
            </button>
            <button
              onClick={() => setPriority('important')}
              className={cn(
                'px-3 py-1.5 rounded-full text-sm font-medium transition-all',
                priority === 'important'
                  ? 'bg-coral-100 text-coral-500 border border-coral-300'
                  : 'bg-white text-warm-400 border border-warm-200'
              )}
            >
              {priorityLabels.important}
            </button>
          </div>
          <button onClick={handleSend} className="btn-primary text-sm">
            发送留言
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {fosterMessages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              'note-card p-4 pl-5 group transition-all',
              msg.priority === 'important' ? 'border-l-4 border-coral-300' : 'border-l-4 border-warm-300'
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {msg.priority === 'important' && (
                    <span className="tag bg-coral-100 text-coral-400">重要</span>
                  )}
                </div>
                <p className="text-warm-800 text-sm leading-relaxed">{msg.content}</p>
                <p className="text-xs text-warm-300 mt-2">{formatDateTime(msg.createdAt)}</p>
              </div>
              <button
                onClick={() => handleDelete(msg.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-warm-300 hover:text-coral-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {fosterMessages.length === 0 && (
          <div className="text-center py-12 text-warm-300">
            <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">还没有留言</p>
          </div>
        )}
      </div>
    </div>
  )
}
