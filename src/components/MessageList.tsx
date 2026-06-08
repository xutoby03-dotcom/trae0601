import type { Message } from '@/types'
import { formatMessageTime } from '@/utils/time'
import { MessageSquare } from 'lucide-react'

interface MessageListProps {
  messages: Message[]
  currentUserId: string
  onSend: (content: string) => void
}

export default function MessageList({ messages, currentUserId, onSend }: MessageListProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const input = form.elements.namedItem('message') as HTMLInputElement
    const val = input.value.trim()
    if (val) {
      onSend(val)
      input.value = ''
    }
  }

  return (
    <div className="space-y-3">
      <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-700">
        <MessageSquare className="w-4 h-4 text-orange-500" />
        留言板 ({messages.length})
      </h4>

      {messages.length === 0 && (
        <p className="text-xs text-slate-400 py-4 text-center">暂无留言，说点什么吧~</p>
      )}

      <div className="space-y-2 max-h-60 overflow-y-auto">
        {messages.map((msg) => {
          const isMine = msg.authorId === currentUserId
          return (
            <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-3.5 py-2 ${
                isMine
                  ? 'bg-orange-500 text-white rounded-br-md'
                  : 'bg-slate-100 text-slate-700 rounded-bl-md'
              }`}>
                {!isMine && (
                  <p className="text-xs font-medium text-orange-600 mb-0.5">{msg.authorName}</p>
                )}
                <p className="text-sm leading-relaxed">{msg.content}</p>
                <p className={`text-[10px] mt-1 ${isMine ? 'text-orange-200' : 'text-slate-400'}`}>
                  {formatMessageTime(msg.createdAt)}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          name="message"
          type="text"
          placeholder="输入留言..."
          className="flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition"
        />
        <button
          type="submit"
          className="px-4 py-2 rounded-xl bg-orange-500 text-white text-sm font-medium hover:bg-orange-600 active:scale-95 transition-all shadow-sm shadow-orange-200"
        >
          发送
        </button>
      </form>
    </div>
  )
}
