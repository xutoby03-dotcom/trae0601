import { useState } from 'react'
import {
  FileText,
  User,
  Calendar,
  ChevronRight,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Check,
  Clock,
  DollarSign,
} from 'lucide-react'
import { cn, formatDate, daysBetween } from '@/lib/utils'
import type { Candidate, PipelineStatus } from '@/types'
import {
  PIPELINE_STATUS_LABELS,
  PIPELINE_STATUS_COLORS,
  PIPELINE_STATUS_DOT,
  PIPELINE_STATUS_ORDER,
  BONUS_STATUS_LABELS,
  BONUS_STATUS_COLORS,
} from '@/types'
import { useReferralStore, getNextStatusLabel } from '@/store/referralStore'
import StatusModal from './StatusModal'

interface CandidateCardProps {
  candidate: Candidate
}

export default function CandidateCard({ candidate }: CandidateCardProps) {
  const [showModal, setShowModal] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const markOnboarded = useReferralStore((s) => s.markOnboarded)
  const markConfirmedPermanent = useReferralStore((s) => s.markConfirmedPermanent)

  const nextLabel = getNextStatusLabel(candidate.status)
  const days = daysBetween(candidate.sourceDate)
  const canAdvance = candidate.status !== 'hired' && candidate.status !== 'rejected'

  const pipelineIndex = PIPELINE_STATUS_ORDER.indexOf(candidate.status)
  const isRejected = candidate.status === 'rejected'

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-warm-200 overflow-hidden hover:shadow-md transition-shadow animate-fade-in">
      <div className="p-5">
        <div className="flex gap-4">
          <img
            src={candidate.avatar}
            alt={candidate.name}
            className="w-14 h-14 rounded-xl object-cover flex-shrink-0 ring-2 ring-warm-100"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-lg font-semibold text-charcoal">
                  {candidate.name}
                </h3>
                <div className="flex items-center gap-1.5 text-sm text-warm-600 mt-0.5">
                  <User size={14} />
                  <span>推荐人：{candidate.referrer}</span>
                </div>
              </div>
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border',
                  PIPELINE_STATUS_COLORS[candidate.status]
                )}
              >
                <span
                  className={cn('w-1.5 h-1.5 rounded-full', PIPELINE_STATUS_DOT[candidate.status])}
                />
                {PIPELINE_STATUS_LABELS[candidate.status]}
              </span>
            </div>

            <div className="flex items-center gap-4 mt-3 text-sm text-warm-600">
              <div className="flex items-center gap-1">
                <FileText size={14} />
                <span>{candidate.targetPosition}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar size={14} />
                <span>
                  {formatDate(candidate.sourceDate)}
                  <span className="text-warm-400 ml-1">({days}天前)</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-warm-100 flex items-center justify-between gap-3">
          <a
            href={candidate.resumeUrl}
            className="inline-flex items-center gap-1.5 text-sm text-terra hover:text-terra-dark font-medium transition-colors"
          >
            <FileText size={15} />
            {candidate.resumeName}
          </a>

          <div
            className={cn(
              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border',
              BONUS_STATUS_COLORS[candidate.bonusStatus]
            )}
          >
            <DollarSign size={12} />
            ¥{candidate.bonusAmount.toLocaleString()} · {BONUS_STATUS_LABELS[candidate.bonusStatus]}
          </div>
        </div>

        <div className="mt-4">
          <div className="relative">
            <div className="h-1.5 bg-warm-100 rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-500',
                  isRejected ? 'bg-red-400' : 'bg-gradient-to-r from-sand to-terra'
                )}
                style={{
                  width: isRejected
                    ? '100%'
                    : `${((pipelineIndex + 1) / (PIPELINE_STATUS_ORDER.length - 1)) * 100}%`,
                }}
              />
            </div>
            <div className="flex justify-between mt-2">
              {PIPELINE_STATUS_ORDER.filter((s) => s !== 'rejected').map((s, i) => {
                const active = i <= pipelineIndex && !isRejected
                return (
                  <div key={s} className="flex flex-col items-center gap-1">
                    <div
                      className={cn(
                        'w-2 h-2 rounded-full transition-colors',
                        active ? 'bg-terra' : 'bg-warm-200'
                      )}
                    />
                    <span
                      className={cn(
                        'text-[10px] transition-colors',
                        active ? 'text-charcoal font-medium' : 'text-warm-400'
                      )}
                    >
                      {PIPELINE_STATUS_LABELS[s]}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {candidate.status === 'hired' && (
          <div className="mt-4 pt-4 border-t border-warm-100 flex gap-2">
            {!candidate.onboarded && (
              <button
                onClick={() => markOnboarded(candidate.id)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 text-sm font-medium transition-colors"
              >
                <Clock size={14} />
                标记已入职
              </button>
            )}
            {candidate.onboarded && !candidate.confirmedPermanent && (
              <button
                onClick={() => markConfirmedPermanent(candidate.id)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 text-sm font-medium transition-colors"
              >
                <Check size={14} />
                标记已转正
              </button>
            )}
            {candidate.confirmedPermanent && (
              <div className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-gray-50 text-gray-500 border border-gray-200 text-sm font-medium">
                <Check size={14} />
                已完成入职转正
              </div>
            )}
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-warm-100 flex gap-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-warm-50 text-warm-700 hover:bg-warm-100 border border-warm-200 text-sm font-medium transition-colors"
          >
            <MessageSquare size={14} />
            查看反馈 ({candidate.feedbacks.length})
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          {canAdvance && (
            <button
              onClick={() => setShowModal(true)}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-terra text-white hover:bg-terra-dark text-sm font-medium transition-colors"
            >
              推进状态
              <ChevronRight size={14} />
            </button>
          )}
        </div>
      </div>

      {expanded && candidate.feedbacks.length > 0 && (
        <div className="px-5 pb-5 bg-warm-50/50 border-t border-warm-100 animate-slide-up">
          <div className="pt-4 space-y-3">
            {[...candidate.feedbacks].reverse().map((fb) => (
              <div
                key={fb.id}
                className="bg-white rounded-xl p-3 border border-warm-100"
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border',
                      PIPELINE_STATUS_COLORS[fb.status as PipelineStatus]
                    )}
                  >
                    {PIPELINE_STATUS_LABELS[fb.status as PipelineStatus]}
                  </span>
                  <span className="text-xs text-warm-500">
                    {fb.interviewer && `${fb.interviewer} · `}
                    {formatDate(fb.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-warm-700 leading-relaxed">
                  {fb.feedback}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {expanded && candidate.feedbacks.length === 0 && (
        <div className="px-5 pb-5 bg-warm-50/50 border-t border-warm-100 animate-slide-up">
          <div className="pt-4 text-center py-6 text-warm-500 text-sm">
            暂无面试反馈
          </div>
        </div>
      )}

      {showModal && (
        <StatusModal
          candidateId={candidate.id}
          candidateName={candidate.name}
          currentStatus={candidate.status}
          nextLabel={nextLabel}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}
