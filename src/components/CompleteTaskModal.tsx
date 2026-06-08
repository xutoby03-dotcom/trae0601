import { useState, useRef } from 'react'
import { X, Camera, Check, Image as ImageIcon } from 'lucide-react'
import { useKitchenStore, Task } from '@/store/kitchenStore'
import { clsx } from 'clsx'

interface CompleteTaskModalProps {
  task: Task
  onClose: () => void
}

export default function CompleteTaskModal({ task, onClose }: CompleteTaskModalProps) {
  const { completeTask, getMemberById } = useKitchenStore()
  const [beforePhoto, setBeforePhoto] = useState('')
  const [afterPhoto, setAfterPhoto] = useState('')
  const [note, setNote] = useState('')
  const beforeInputRef = useRef<HTMLInputElement>(null)
  const afterInputRef = useRef<HTMLInputElement>(null)

  const member = getMemberById(task.assignedMemberId)

  const handlePhotoUpload = (type: 'before' | 'after') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const result = ev.target?.result as string
      if (type === 'before') {
        setBeforePhoto(result)
      } else {
        setAfterPhoto(result)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleComplete = () => {
    completeTask({
      taskId: task.id,
      memberId: task.assignedMemberId,
      beforePhoto,
      afterPhoto,
      note,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/30 animate-fade-in" onClick={onClose}>
      <div
        className="bg-sticker-green w-full max-w-md rounded-sm sticker-shadow animate-sticky-pop"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticker-tape" />

        <div className="p-5 pt-7 sticker-lined">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-handwritten text-2xl font-bold text-gray-800">
              ✅ 完成任务
            </h2>
            <button onClick={onClose} className="p-1 hover:bg-black/5 rounded-full transition-colors">
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          <div className="mb-4 bg-white/40 rounded-lg p-3">
            <div className="font-handwritten text-xl font-bold text-gray-800 mb-1">{task.name}</div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              {member && (
                <>
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[10px]"
                    style={{ backgroundColor: member.color + '30', border: `2px solid ${member.color}` }}
                  >
                    {member.avatar}
                  </span>
                  <span>{member.name}</span>
                </>
              )}
              <span className="text-gray-400">·</span>
              <span>{task.estimatedMinutes}分钟</span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="font-handwritten text-lg text-gray-700 block mb-2">📸 前后对比</label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-500 mb-1 text-center">清洁前</p>
                  {beforePhoto ? (
                    <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-white/30">
                      <img src={beforePhoto} alt="清洁前" className="w-full h-full object-cover" />
                      <button
                        onClick={() => setBeforePhoto('')}
                        className="absolute top-1 right-1 w-5 h-5 bg-black/40 rounded-full flex items-center justify-center"
                      >
                        <X size={10} className="text-white" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => beforeInputRef.current?.click()}
                      className="w-full aspect-[4/3] rounded-lg bg-white/40 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1 hover:bg-white/60 transition-colors"
                    >
                      <Camera size={24} className="text-gray-400" />
                      <span className="text-xs text-gray-400">拍照/上传</span>
                    </button>
                  )}
                  <input
                    ref={beforeInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={handlePhotoUpload('before')}
                  />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1 text-center">清洁后</p>
                  {afterPhoto ? (
                    <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-white/30">
                      <img src={afterPhoto} alt="清洁后" className="w-full h-full object-cover" />
                      <button
                        onClick={() => setAfterPhoto('')}
                        className="absolute top-1 right-1 w-5 h-5 bg-black/40 rounded-full flex items-center justify-center"
                      >
                        <X size={10} className="text-white" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => afterInputRef.current?.click()}
                      className="w-full aspect-[4/3] rounded-lg bg-white/40 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1 hover:bg-white/60 transition-colors"
                    >
                      <Camera size={24} className="text-gray-400" />
                      <span className="text-xs text-gray-400">拍照/上传</span>
                    </button>
                  )}
                  <input
                    ref={afterInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={handlePhotoUpload('after')}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="font-handwritten text-lg text-gray-700 block mb-1">💬 一句话备注</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="灶台油渍好重...终于擦干净了！"
                rows={2}
                className="w-full px-3 py-2 bg-white/60 rounded border border-gray-300/50 font-body text-sm focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400/30 placeholder:text-gray-400 resize-none"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-5">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg bg-white/50 text-gray-600 font-medium text-sm hover:bg-white/70 transition-colors"
            >
              算了
            </button>
            <button
              onClick={handleComplete}
              className="flex-1 py-2.5 rounded-lg bg-green-500 text-white font-medium text-sm hover:bg-green-600 shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5"
            >
              <Check size={16} strokeWidth={3} />
              完成啦！
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
