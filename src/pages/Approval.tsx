import { useState } from 'react'
import { useStore } from '@/store'
import {
  CheckSquare,
  Flame,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ShieldAlert,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

export default function Approval() {
  const { requisitions, consumables, approveRequisition, rejectRequisition, approveHazardousRequisition, currentRole } = useStore()
  const [activeTab, setActiveTab] = useState<'pending' | 'all'>('pending')
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [confirmHazardousId, setConfirmHazardousId] = useState<string | null>(null)

  const pendingReqs = requisitions
    .filter((r) => r.status === 'pending' || r.status === 'hazardous_pending')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const allReqs = requisitions
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const displayReqs = activeTab === 'pending' ? pendingReqs : allReqs

  const handleApprove = (id: string, isHazardous: boolean) => {
    if (isHazardous) {
      setConfirmHazardousId(id)
    } else {
      approveRequisition(id, '李老师')
    }
  }

  const handleHazardousConfirm = (id: string) => {
    approveHazardousRequisition(id, '李老师')
    setConfirmHazardousId(null)
  }

  const handleReject = (id: string) => {
    if (rejectingId === id) {
      rejectRequisition(id, rejectReason || '不符合领用条件')
      setRejectingId(null)
      setRejectReason('')
    } else {
      setRejectingId(id)
      setRejectReason('')
    }
  }

  const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType; bg: string }> = {
    pending: { label: '待审批', color: 'text-lab-700', icon: Clock, bg: 'bg-lab-50' },
    hazardous_pending: { label: '待二次审批', color: 'text-danger-500', icon: ShieldAlert, bg: 'bg-red-50' },
    approved: { label: '已通过', color: 'text-safe-600', icon: CheckCircle, bg: 'bg-emerald-50' },
    rejected: { label: '已驳回', color: 'text-danger-500', icon: XCircle, bg: 'bg-red-50' },
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-lab-900">审批管理</h1>
        <p className="text-sm text-gray-500 mt-1">审批领用申请，危化品类需二次确认</p>
      </div>

      <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1 w-fit">
        <button
          onClick={() => setActiveTab('pending')}
          className={cn(
            'px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2',
            activeTab === 'pending' ? 'bg-white shadow text-lab-900' : 'text-gray-500 hover:text-gray-700'
          )}
        >
          待审批
          {pendingReqs.length > 0 && (
            <span className="bg-danger-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {pendingReqs.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('all')}
          className={cn(
            'px-4 py-2 rounded-md text-sm font-medium transition-all',
            activeTab === 'all' ? 'bg-white shadow text-lab-900' : 'text-gray-500 hover:text-gray-700'
          )}
        >
          全部记录
        </button>
      </div>

      <div className="space-y-3">
        {displayReqs.map((r) => {
          const c = consumables.find((item) => item.id === r.consumableId)
          const sc = statusConfig[r.status]
          const StatusIcon = sc.icon
          const isPending = r.status === 'pending' || r.status === 'hazardous_pending'

          return (
            <div
              key={r.id}
              className={cn(
                'card p-5 transition-all',
                r.isHazardous && isPending && 'animate-pulse-border border-l-4 border-l-danger-500',
                r.isHazardous && !isPending && 'border-l-4 border-l-danger-500'
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center', sc.bg)}>
                    <StatusIcon className={cn('w-5 h-5', sc.color)} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900">{r.applicant}</span>
                      <span className={cn('text-xs', sc.color, 'font-medium')}>
                        {sc.label}
                      </span>
                      {r.isHazardous && (
                        <span className="badge-danger">
                          <Flame className="w-3 h-3 mr-0.5" />危化品
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-700">
                      申请 <span className="font-medium">{c?.name}</span>
                      <span className="text-gray-400"> × {r.quantity}{c?.unit}</span>
                    </p>
                    <div className="mt-1 space-y-0.5">
                      <p className="text-xs text-gray-500">
                        项目：{r.projectName} · 导师：{r.advisor}
                      </p>
                      <p className="text-xs text-gray-400">用途：{r.purpose}</p>
                      {r.returnNote && (
                        <p className="text-xs text-gray-400">归还/消耗说明：{r.returnNote}</p>
                      )}
                      <p className="text-xs text-gray-400">
                        提交时间：{format(new Date(r.createdAt), 'yyyy-MM-dd HH:mm')}
                      </p>
                      {r.approvedAt && r.approvedBy && (
                        <p className="text-xs text-safe-600">
                          审批时间：{format(new Date(r.approvedAt), 'yyyy-MM-dd HH:mm')} · 审批人：{r.approvedBy}
                        </p>
                      )}
                      {r.status === 'rejected' && r.rejectReason && (
                        <p className="text-xs text-danger-500">
                          驳回原因：{r.rejectReason}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {isPending && currentRole === 'admin' && (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleApprove(r.id, r.isHazardous)}
                      className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      通过
                    </button>
                    <button
                      onClick={() => handleReject(r.id)}
                      className="btn-outline text-xs px-3 py-1.5 flex items-center gap-1 border-danger-500 text-danger-500 hover:bg-red-50"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      驳回
                    </button>
                  </div>
                )}
              </div>

              {rejectingId === r.id && (
                <div className="mt-3 pt-3 border-t border-gray-100 animate-fade-in">
                  <label className="label-field">驳回原因</label>
                  <textarea
                    className="input-field min-h-[60px] mb-2"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="请输入驳回原因..."
                  />
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setRejectingId(null)} className="btn-ghost text-xs">取消</button>
                    <button onClick={() => handleReject(r.id)} className="btn-danger text-xs">确认驳回</button>
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {displayReqs.length === 0 && (
          <div className="card py-16 text-center">
            <CheckSquare className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">
              {activeTab === 'pending' ? '暂无待审批申请' : '暂无审批记录'}
            </p>
          </div>
        )}
      </div>

      {confirmHazardousId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setConfirmHazardousId(null)} />
          <div className="relative bg-white rounded-2xl p-6 w-[440px] shadow-2xl animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-danger-500" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-lab-900">危化品二次确认</h3>
                <p className="text-sm text-gray-500">此领用涉及危化品，需二次确认审批</p>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-red-50 border border-red-100 mb-4">
              <p className="text-sm text-danger-500 font-medium">
                ⚠️ 请确认已核实领用人资质、存储条件和安全措施
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmHazardousId(null)}
                className="btn-outline flex-1"
              >
                取消
              </button>
              <button
                onClick={() => handleHazardousConfirm(confirmHazardousId)}
                className="btn-danger flex-1 flex items-center justify-center gap-2"
              >
                <ShieldAlert className="w-4 h-4" />
                确认审批通过
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
