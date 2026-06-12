import { useState } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PipelineStatus } from '@/types'
import { PIPELINE_STATUS_LABELS } from '@/types'
import { useReferralStore } from '@/store/referralStore'

interface StatusModalProps {
  candidateId: string
  candidateName: string
  currentStatus: PipelineStatus
  nextLabel: string | null
  onClose: () => void
}

export default function StatusModal({
  candidateId,
  candidateName,
  currentStatus,
  nextLabel,
  onClose,
}: StatusModalProps) {
  const [feedback, setFeedback] = useState('')
  const [interviewer, setInterviewer] = useState('')
  const [action, setAction] = useState<'advance' | 'reject' | null>(null)
  const advanceStatus = useReferralStore((s) => s.advanceStatus)
  const markRejected = useReferralStore((s) => s.markRejected)

  const canAdvance = currentStatus !== 'hired' && currentStatus !== 'rejected'

  const handleSubmit = (type: 'advance' | 'reject') => {
    if (!feedback.trim()) return
    if (type === 'advance') {
      advanceStatus(candidateId, feedback.trim(), interviewer.trim() || undefined)
    } else {
      markRejected(candidateId, feedback.trim(), interviewer.trim() || undefined)
    }
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl animate-scale-in overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-warm-200">
          <div>
            <h3 className="text-lg font-semibold text-charcoal">
              更新状态 — {candidateName}
            </h3>
            <p className="text-sm text-warm-600 mt-0.5">
              当前状态：{PIPELINE_STATUS_LABELS[currentStatus]}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-warm-100 text-warm-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1.5">
              面试官 / 操作人
            </label>
            <input
              type="text"
              value={interviewer}
              onChange={(e) => setInterviewer(e.target.value)}
              placeholder="可选，例如 HR-王芳"
              className="w-full px-4 py-2.5 rounded-xl border border-warm-200 bg-warm-50 focus:outline-none focus:ring-2 focus:ring-terra/30 focus:border-terra transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1.5">
              反馈内容 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={4}
              placeholder="请填写面试反馈或备注..."
              className="w-full px-4 py-2.5 rounded-xl border border-warm-200 bg-warm-50 focus:outline-none focus:ring-2 focus:ring-terra/30 focus:border-terra transition-all resize-none"
            />
          </div>
        </div>

        <div className="px-6 py-4 bg-warm-50 border-t border-warm-200 flex gap-3">
          <button
            onClick={() => {
              setAction('reject')
              handleSubmit('reject')
            }}
            disabled={!feedback.trim() || action !== null}
            className={cn(
              'flex-1 px-4 py-2.5 rounded-xl font-medium transition-all',
              'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            标记未通过
          </button>
          {canAdvance && (
            <button
              onClick={() => {
                setAction('advance')
                handleSubmit('advance')
              }}
              disabled={!feedback.trim() || action !== null}
              className={cn(
                'flex-1 px-4 py-2.5 rounded-xl font-medium transition-all',
                'bg-terra text-white hover:bg-terra-dark',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              推进到「{nextLabel ?? '下一步'}」
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
