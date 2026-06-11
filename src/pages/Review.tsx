import { useState } from 'react'
import { ChevronDown, ChevronUp, AlertTriangle, Clock, Check, X, Bell, ArrowRight, X as CloseIcon } from 'lucide-react'
import { useStore } from '@/store'
import type { Application, Conflict } from '@/types'

const TABS = ['待处理', '冲突检测', '过期下架'] as const
type Tab = (typeof TABS)[number]

export default function Review() {
  const [activeTab, setActiveTab] = useState<Tab>('待处理')
  const [conflictModal, setConflictModal] = useState<{ appId: string } | null>(null)
  const { applications, boards, approveApplication, rejectApplication, getConflicts, getExpiredNotRemoved } = useStore()
  const getBoardName = (boardId: string) => boards.find(b => b.id === boardId)?.name ?? boardId
  const conflicts = getConflicts()
  const expired = getExpiredNotRemoved()

  const handleApproveWithConflictCheck = (appId: string) => {
    const hasConflict = conflicts.some(c => c.applicationA.id === appId || c.applicationB.id === appId)
    if (hasConflict) {
      setConflictModal({ appId })
    } else {
      approveApplication(appId)
    }
  }

  const relatedConflict = conflictModal
    ? conflicts.find(c => c.applicationA.id === conflictModal.appId || c.applicationB.id === conflictModal.appId)
    : null

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-brand-dark">审核管理</h1>

      <div className="flex gap-1 rounded-xl p-1 bg-brand-dark">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              backgroundColor: activeTab === tab ? '#E8652E' : 'transparent',
              color: activeTab === tab ? '#FFF8F0' : '#FFF8F0AA',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === '待处理' && (
        <PendingTab
          applications={applications}
          getBoardName={getBoardName}
          approveApplication={handleApproveWithConflictCheck}
          rejectApplication={rejectApplication}
          conflicts={conflicts}
        />
      )}

      {conflictModal && relatedConflict && (
        <ConflictModal
          conflict={relatedConflict}
          currentAppId={conflictModal.appId}
          getBoardName={getBoardName}
          onClose={() => setConflictModal(null)}
          onGoToConflictTab={() => {
            setConflictModal(null)
            setActiveTab('冲突检测')
          }}
        />
      )}
      {activeTab === '冲突检测' && (
        <ConflictTab
          conflicts={conflicts}
          getBoardName={getBoardName}
          approveApplication={approveApplication}
          rejectApplication={rejectApplication}
        />
      )}
      {activeTab === '过期下架' && (
        <ExpiredTab expired={expired} getBoardName={getBoardName} />
      )}
    </div>
  )
}

function PendingTab({ applications, getBoardName, approveApplication, rejectApplication, conflicts }: {
  applications: Application[]
  getBoardName: (id: string) => string
  approveApplication: (id: string) => void
  rejectApplication: (id: string) => void
  conflicts: Conflict[]
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const conflictAppIds = new Set(conflicts.flatMap(c => [c.applicationA.id, c.applicationB.id]))
  const pending = applications.filter(a => a.status === 'pending').sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  if (pending.length === 0) {
    return <EmptyState message="暂无待处理申请" />
  }

  return (
    <div className="space-y-3">
      {pending.map(app => (
        <div key={app.id} className="rounded-xl p-4 shadow-sm bg-white">
          <div className="flex items-start justify-between cursor-pointer" onClick={() => setExpandedId(expandedId === app.id ? null : app.id)}>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-brand-dark">{app.activityName}</span>
                {conflictAppIds.has(app.id) && (
                  <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-brand-red/10 text-brand-red">
                    <AlertTriangle size={12} />冲突
                  </span>
                )}
              </div>
              <div className="text-sm mt-1 text-brand-dark/60">
                {app.clubName} · {getBoardName(app.boardId)} · {app.size} · {app.contact}
              </div>
              <div className="text-xs mt-1 text-brand-dark/40">
                {app.startDate} ~ {app.endDate}
              </div>
            </div>
            {expandedId === app.id ? <ChevronUp size={18} className="text-brand-dark/40" /> : <ChevronDown size={18} className="text-brand-dark/40" />}
          </div>

          {expandedId === app.id && (
            <div className="mt-3 pt-3 border-t border-brand-dark/5">
              {app.imageUrl && <img src={app.imageUrl} alt={app.activityName} className="w-full h-40 object-cover rounded-lg mb-3" />}
              <div className="flex gap-2">
                <button onClick={() => approveApplication(app.id)} className="flex items-center gap-1 px-4 py-2 rounded-lg text-white text-sm font-medium bg-brand-green hover:opacity-90">
                  <Check size={16} />通过
                </button>
                <button onClick={() => rejectApplication(app.id)} className="flex items-center gap-1 px-4 py-2 rounded-lg text-white text-sm font-medium bg-brand-red hover:opacity-90">
                  <X size={16} />拒绝
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function ConflictTab({ conflicts, getBoardName, approveApplication, rejectApplication }: {
  conflicts: Conflict[]
  getBoardName: (id: string) => string
  approveApplication: (id: string) => void
  rejectApplication: (id: string) => void
}) {
  const [resolutionConflict, setResolutionConflict] = useState<Conflict | null>(null)

  if (conflicts.length === 0) {
    return <EmptyState message="暂无冲突" />
  }

  return (
    <>
      <div className="space-y-4">
        {conflicts.map((c, i) => (
          <div key={i} className="rounded-xl overflow-hidden shadow-sm bg-white">
            <div className="px-4 py-2 text-sm font-medium bg-brand-red/10 text-brand-red">
              <AlertTriangle size={14} className="inline mr-1" />
              {getBoardName(c.boardId)} — 冲突
            </div>
            <div className="grid grid-cols-2 divide-x divide-brand-dark/5">
              <div className="p-4">
                <div className="font-semibold text-sm text-brand-dark">{c.applicationA.activityName}</div>
                <div className="text-xs mt-1 text-brand-dark/60">{c.applicationA.clubName}</div>
                <div className="text-xs mt-1 text-brand-dark/40">{c.applicationA.startDate} ~ {c.applicationA.endDate}</div>
                <div className="flex gap-1 mt-2">
                  <button onClick={() => setResolutionConflict(c)} className="flex items-center gap-0.5 px-2 py-1 rounded text-xs text-white bg-brand-green hover:opacity-90">
                    <Check size={12} />通过
                  </button>
                  <button onClick={() => rejectApplication(c.applicationA.id)} className="flex items-center gap-0.5 px-2 py-1 rounded text-xs text-white bg-brand-red hover:opacity-90">
                    <X size={12} />拒绝
                  </button>
                </div>
              </div>
              <div className="p-4">
                <div className="font-semibold text-sm text-brand-dark">{c.applicationB.activityName}</div>
                <div className="text-xs mt-1 text-brand-dark/60">{c.applicationB.clubName}</div>
                <div className="text-xs mt-1 text-brand-dark/40">{c.applicationB.startDate} ~ {c.applicationB.endDate}</div>
                <div className="flex gap-1 mt-2">
                  <button onClick={() => setResolutionConflict(c)} className="flex items-center gap-0.5 px-2 py-1 rounded text-xs text-white bg-brand-green hover:opacity-90">
                    <Check size={12} />通过
                  </button>
                  <button onClick={() => rejectApplication(c.applicationB.id)} className="flex items-center gap-0.5 px-2 py-1 rounded text-xs text-white bg-brand-red hover:opacity-90">
                    <X size={12} />拒绝
                  </button>
                </div>
              </div>
            </div>
            <div className="px-4 py-2 text-center text-xs font-medium bg-brand-red/15 text-brand-red">
              重叠时段：{c.overlapStart} ~ {c.overlapEnd}
            </div>
          </div>
        ))}
      </div>

      {resolutionConflict && (
        <ConflictResolutionModal
          conflict={resolutionConflict}
          getBoardName={getBoardName}
          approveApplication={approveApplication}
          rejectApplication={rejectApplication}
          onClose={() => setResolutionConflict(null)}
        />
      )}
    </>
  )
}

function ConflictResolutionModal({ conflict, getBoardName, approveApplication, rejectApplication, onClose }: {
  conflict: Conflict
  getBoardName: (id: string) => string
  approveApplication: (id: string) => void
  rejectApplication: (id: string) => void
  onClose: () => void
}) {
  const [rejectedId, setRejectedId] = useState<string | null>(null)

  const handleReject = (id: string) => {
    rejectApplication(id)
    setRejectedId(id)
  }

  const handleApprove = (id: string) => {
    approveApplication(id)
    onClose()
  }

  const appARejected = rejectedId === conflict.applicationA.id || conflict.applicationA.status === 'rejected'
  const appBRejected = rejectedId === conflict.applicationB.id || conflict.applicationB.status === 'rejected'
  const canApproveA = appBRejected
  const canApproveB = appARejected

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="bg-brand-red/10 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-brand-red">
            <AlertTriangle size={20} />
            <span className="font-semibold">冲突处理 — {getBoardName(conflict.boardId)}</span>
          </div>
          <button onClick={onClose} className="text-brand-dark/40 hover:text-brand-dark">
            <CloseIcon size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="text-sm text-brand-dark/60">
            重叠时段：
            <span className="px-2 py-0.5 rounded bg-brand-red/10 text-brand-red font-medium">
              {conflict.overlapStart} ~ {conflict.overlapEnd}
            </span>
            <span className="ml-1">需先拒绝一方，才能通过另一方。</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className={`rounded-xl p-3 border-2 transition-colors ${appARejected ? 'border-gray-300 bg-gray-50 opacity-60' : 'border-brand-orange/30 bg-brand-orange/3'}`}>
              {appARejected && (
                <span className="inline-block text-xs font-medium text-gray-400 mb-1">已拒绝</span>
              )}
              <div className={`text-sm font-semibold ${appARejected ? 'text-gray-400 line-through' : 'text-brand-dark'}`}>
                {conflict.applicationA.activityName}
              </div>
              <div className={`text-xs mt-0.5 ${appARejected ? 'text-gray-400' : 'text-brand-dark/60'}`}>
                {conflict.applicationA.clubName}
              </div>
              <div className={`text-xs mt-1 ${appARejected ? 'text-gray-400' : 'text-brand-dark/40'}`}>
                {conflict.applicationA.startDate} ~ {conflict.applicationA.endDate}
              </div>
              <div className="flex gap-1 mt-3">
                <button
                  disabled={appARejected || canApproveA}
                  onClick={() => handleReject(conflict.applicationA.id)}
                  className={`flex items-center gap-0.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    appARejected
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : canApproveA
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-brand-red text-white hover:opacity-90'
                  }`}
                >
                  <X size={12} />{appARejected ? '已拒绝' : '拒绝'}
                </button>
                <button
                  disabled={!canApproveA}
                  onClick={() => handleApprove(conflict.applicationA.id)}
                  className={`flex items-center gap-0.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    canApproveA
                      ? 'bg-brand-green text-white hover:opacity-90'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Check size={12} />通过
                </button>
              </div>
            </div>

            <div className={`rounded-xl p-3 border-2 transition-colors ${appBRejected ? 'border-gray-300 bg-gray-50 opacity-60' : 'border-brand-orange/30 bg-brand-orange/3'}`}>
              {appBRejected && (
                <span className="inline-block text-xs font-medium text-gray-400 mb-1">已拒绝</span>
              )}
              <div className={`text-sm font-semibold ${appBRejected ? 'text-gray-400 line-through' : 'text-brand-dark'}`}>
                {conflict.applicationB.activityName}
              </div>
              <div className={`text-xs mt-0.5 ${appBRejected ? 'text-gray-400' : 'text-brand-dark/60'}`}>
                {conflict.applicationB.clubName}
              </div>
              <div className={`text-xs mt-1 ${appBRejected ? 'text-gray-400' : 'text-brand-dark/40'}`}>
                {conflict.applicationB.startDate} ~ {conflict.applicationB.endDate}
              </div>
              <div className="flex gap-1 mt-3">
                <button
                  disabled={appBRejected || canApproveB}
                  onClick={() => handleReject(conflict.applicationB.id)}
                  className={`flex items-center gap-0.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    appBRejected
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : canApproveB
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-brand-red text-white hover:opacity-90'
                  }`}
                >
                  <X size={12} />{appBRejected ? '已拒绝' : '拒绝'}
                </button>
                <button
                  disabled={!canApproveB}
                  onClick={() => handleApprove(conflict.applicationB.id)}
                  className={`flex items-center gap-0.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    canApproveB
                      ? 'bg-brand-green text-white hover:opacity-90'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Check size={12} />通过
                </button>
              </div>
            </div>
          </div>

          {!appARejected && !appBRejected && (
            <p className="text-xs text-brand-dark/50 leading-relaxed text-center">
              请先点击一方的「拒绝」按钮，另一方的「通过」按钮才会解锁。
            </p>
          )}
        </div>

        <div className="px-5 py-4 border-t border-brand-dark/5 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm text-brand-dark/60 hover:bg-brand-dark/5"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  )
}

function ExpiredTab({ expired, getBoardName }: {
  expired: Application[]
  getBoardName: (id: string) => string
}) {
  if (expired.length === 0) {
    return <EmptyState message="暂无过期未下架申请" />
  }

  return (
    <div className="space-y-3">
      {expired.map(app => {
        const daysOverdue = Math.floor((Date.now() - new Date(app.endDate).getTime()) / 86400000)
        return (
          <div key={app.id} className="rounded-xl p-4 shadow-sm bg-brand-gold/15 border-l-4 border-brand-gold">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-semibold text-brand-dark">{app.activityName}</div>
                <div className="text-sm mt-1 text-brand-dark/60">
                  {app.clubName} · {getBoardName(app.boardId)}
                </div>
                <div className="flex items-center gap-1 text-xs mt-1 text-brand-orange">
                  <Clock size={12} />
                  结束于 {app.endDate}，已过期 {daysOverdue} 天
                </div>
              </div>
              <button
                onClick={() => alert(`已向 ${app.clubName} 发送催促提醒！`)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium bg-brand-gold text-brand-dark hover:opacity-90"
              >
                <Bell size={14} />催促
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-16 text-brand-dark/25">
      <div className="text-4xl mb-2">📋</div>
      <div className="text-sm">{message}</div>
    </div>
  )
}

function ConflictModal({ conflict, currentAppId, getBoardName, onClose, onGoToConflictTab }: {
  conflict: Conflict
  currentAppId: string
  getBoardName: (id: string) => string
  onClose: () => void
  onGoToConflictTab: () => void
}) {
  const isA = conflict.applicationA.id === currentAppId
  const current = isA ? conflict.applicationA : conflict.applicationB
  const other = isA ? conflict.applicationB : conflict.applicationA

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="bg-brand-red/10 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-brand-red">
            <AlertTriangle size={20} />
            <span className="font-semibold">存在时间冲突，不能直接通过</span>
          </div>
          <button onClick={onClose} className="text-brand-dark/40 hover:text-brand-dark">
            <CloseIcon size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="text-sm text-brand-dark/60">
            展板 <span className="font-medium text-brand-dark">{getBoardName(conflict.boardId)}</span> 在
            <span className="mx-1 px-2 py-0.5 rounded bg-brand-red/10 text-brand-red font-medium">
              {conflict.overlapStart} ~ {conflict.overlapEnd}
            </span>
            存在重叠
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className={`rounded-xl p-3 border-2 ${current.id === currentAppId ? 'border-brand-orange bg-brand-orange/5' : 'border-transparent bg-brand-dark/3'}`}>
              <div className="flex items-center gap-1 text-xs mb-1">
                {current.id === currentAppId && <span className="text-brand-orange font-medium">当前申请</span>}
              </div>
              <div className="text-sm font-semibold text-brand-dark">{current.activityName}</div>
              <div className="text-xs text-brand-dark/60 mt-0.5">{current.clubName}</div>
              <div className="text-xs text-brand-dark/40 mt-1">{current.startDate} ~ {current.endDate}</div>
            </div>
            <div className={`rounded-xl p-3 border-2 ${other.id === currentAppId ? 'border-brand-orange bg-brand-orange/5' : 'border-transparent bg-brand-dark/3'}`}>
              <div className="flex items-center gap-1 text-xs mb-1">
                {other.id === currentAppId && <span className="text-brand-orange font-medium">当前申请</span>}
              </div>
              <div className="text-sm font-semibold text-brand-dark">{other.activityName}</div>
              <div className="text-xs text-brand-dark/60 mt-0.5">{other.clubName}</div>
              <div className="text-xs text-brand-dark/40 mt-1">{other.startDate} ~ {other.endDate}</div>
            </div>
          </div>

          <p className="text-xs text-brand-dark/50 leading-relaxed">
            冲突双方需要同时处理。请前往「冲突检测」页面并排对比后，再决定通过或拒绝哪一方。
          </p>
        </div>

        <div className="px-5 py-4 border-t border-brand-dark/5 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm text-brand-dark/60 hover:bg-brand-dark/5"
          >
            取消
          </button>
          <button
            onClick={onGoToConflictTab}
            className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium bg-brand-orange text-white hover:opacity-90"
          >
            去冲突检测处理
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}
