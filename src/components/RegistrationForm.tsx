import { useState } from 'react'
import { X, Users } from 'lucide-react'
import type { RegisterPayload } from '@/utils/api'

interface RegistrationFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: RegisterPayload) => Promise<void>
  activityTitle: string
  maxParticipants: number
  currentConfirmed: number
}

export default function RegistrationForm({
  open,
  onClose,
  onSubmit,
  activityTitle,
  maxParticipants,
  currentConfirmed,
}: RegistrationFormProps) {
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [note, setNote] = useState('')
  const [bringFriends, setBringFriends] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  const isFull = currentConfirmed >= maxParticipants
  const remaining = maxParticipants - currentConfirmed

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !contact.trim()) return
    setSubmitting(true)
    try {
      await onSubmit({ name: name.trim(), contact: contact.trim(), note: note.trim(), bringFriends })
      setName('')
      setContact('')
      setNote('')
      setBringFriends(0)
      onClose()
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl border border-dark-border bg-dark-surface p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-zinc-400 transition-colors hover:bg-dark-hover hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="font-heading text-lg font-bold text-white">报名活动</h2>
        <p className="mt-1 text-sm text-zinc-400 line-clamp-1">{activityTitle}</p>

        <div className="mt-3 flex items-center gap-1.5 text-xs">
          <Users className="h-3.5 w-3.5 text-status" />
          <span className="text-zinc-400">
            已报名 <span className="text-status font-medium">{currentConfirmed}</span> / {maxParticipants}
          </span>
          {isFull && (
            <span className="ml-2 rounded-full bg-urgent/20 px-2 py-0.5 text-urgent">将加入候补</span>
          )}
          {!isFull && remaining <= 3 && (
            <span className="ml-2 rounded-full bg-urgent/20 px-2 py-0.5 text-urgent">仅剩 {remaining} 位</span>
          )}
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-300">姓名 *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-lg border border-dark-border bg-dark-bg px-3 py-2.5 text-sm text-white placeholder-zinc-600 outline-none transition-colors focus:border-accent"
              placeholder="请输入姓名"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-300">联系方式 *</label>
            <input
              type="text"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              required
              className="w-full rounded-lg border border-dark-border bg-dark-bg px-3 py-2.5 text-sm text-white placeholder-zinc-600 outline-none transition-colors focus:border-accent"
              placeholder="手机号或微信"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-300">带朋友数量</label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setBringFriends(Math.max(0, bringFriends - 1))}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-dark-border bg-dark-bg text-zinc-400 transition-colors hover:bg-dark-hover hover:text-white"
              >
                -
              </button>
              <span className="w-8 text-center text-sm font-medium text-white">{bringFriends}</span>
              <button
                type="button"
                onClick={() => setBringFriends(bringFriends + 1)}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-dark-border bg-dark-bg text-zinc-400 transition-colors hover:bg-dark-hover hover:text-white"
              >
                +
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-300">备注</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-dark-border bg-dark-bg px-3 py-2.5 text-sm text-white placeholder-zinc-600 outline-none transition-colors focus:border-accent resize-none"
              placeholder="有什么要说的..."
            />
          </div>

          <button
            type="submit"
            disabled={submitting || !name.trim() || !contact.trim()}
            className="w-full rounded-lg bg-accent py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? '提交中...' : isFull ? '加入候补' : '立即报名'}
          </button>
        </form>
      </div>
    </div>
  )
}
