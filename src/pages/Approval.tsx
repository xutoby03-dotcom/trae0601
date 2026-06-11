import { useState } from 'react'
import { useStore } from '@/store'
import type { Requisition, Consumable } from '@/types'
import {
  CheckSquare,
  Flame,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ShieldAlert,
  X,
  Package,
  User,
  BookOpen,
  FileText,
  Calendar,
  Users,
  ArrowRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

function DetailDrawer({
  requisition,
  consumable,
  onClose,
  onApprove,
  onReject,
  rejecting,
  rejectReason,
  setRejectReason,
  setRejecting,
  currentRole,
}: {
  requisition: Requisition
  consumable?: Consumable
  onClose: () => void
  onApprove: () => void
  onReject: () => void
  rejecting: boolean
  rejectReason: string
  setRejectReason: (v: string) => void
  setRejecting: (v: boolean) => void
  currentRole: 'admin' | 'student'
}) {
  const isPending =
    requisition.status === 'pending' || requisition.status === 'hazardous_pending'

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-[480px] bg-white h-full shadow-2xl animate-slide-in overflow-y-auto">
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between z-10">
          <h2 className="font-serif text-lg font-bold text-lab-900">申请详情</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div
            className={cn(
              'p-4 rounded-xl border',
              requisition.isHazardous
                ? 'bg-red-50/50 border-red-200'
                : 'bg-lab-50/50 border-lab-200'
            )}
          >
            <div className="flex items-start gap-3">
              {consumable?.imageUrl ? (
                <img
                  src={consumable.imageUrl}
                  alt={consumable.name}
                  className="w-14 h-14 rounded-lg object-cover border border-white/50"
                />
              ) : (
                <div
                  className={cn(
                    'w-14 h-14 rounded-lg flex items-center justify-center',
                    requisition.isHazardous ? 'bg-red-100' : 'bg-lab-100'
                  )}
                >
                  {requisition.isHazardous ? (
                    <Flame className="w-6 h-6 text-danger-500" />
                  ) : (
                    <Package className="w-6 h-6 text-lab-600" />
                  )}
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-semibold text-gray-900">{consumable?.name}</span>
                  {requisition.isHazardous && (
                    <span className="badge-danger">
                      <Flame className="w-3 h-3 mr-0.5" />危化品
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500">{consumable?.specification}</p>
                <div className="flex items-center gap-3 mt-2">
                  <div>
                    <p className="text-[10px] text-gray-400">申请数量</p>
                    <p className="text-sm font-bold text-lab-900">
                      {requisition.quantity} {consumable?.unit}
                    </p>
                  </div>
                  <div className="w-px h-8 bg-gray-200" />
                  <div>
                    <p className="text-[10px] text-gray-400">当前库存</p>
                    <p
                      className={cn(
                        'text-sm font-bold',
                        (consumable?.stock ?? 0) < (consumable?.minAlert ?? 0)
                          ? 'text-danger-500'
                          : 'text-gray-900'
                      )}
                    >
                      {consumable?.stock} {consumable?.unit}
                    </p>
                  </div>
                  <div className="w-px h-8 bg-gray-200" />
                  <div>
                    <p className="text-[10px] text-gray-400">警戒线</p>
                    <p className="text-sm font-bold text-gray-500">
                      {consumable?.minAlert} {consumable?.unit}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-gray-500" />
              </div>
              <div>
                <p className="text-xs text-gray-400">申请人</p>
                <p className="text-sm font-medium text-gray-900">{requisition.applicant}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                <Users className="w-4 h-4 text-gray-500" />
              </div>
              <div>
                <p className="text-xs text-gray-400">导师</p>
                <p className="text-sm font-medium text-gray-900">{requisition.advisor}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-4 h-4 text-gray-500" />
              </div>
              <div>
                <p className="text-xs text-gray-400">项目名称</p>
                <p className="text-sm font-medium text-gray-900">{requisition.projectName}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                <FileText className="w-4 h-4 text-gray-500" />
              </div>
              <div>
                <p className="text-xs text-gray-400">用途说明</p>
                <p className="text-sm text-gray-700">{requisition.purpose}</p>
              </div>
            </div>

            {requisition.returnNote && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                  <ArrowRight className="w-4 h-4 text-gray-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">预计归还或消耗说明</p>
                  <p className="text-sm text-gray-700">{requisition.returnNote}</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-4 h-4 text-gray-500" />
              </div>
              <div>
                <p className="text-xs text-gray-400">提交时间</p>
                <p className="text-sm text-gray-700">
                  {format(new Date(requisition.createdAt), 'yyyy-MM-dd HH:mm')}
                </p>
              </div>
            </div>

            {requisition.approvedAt && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-4 h-4 text-safe-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">审批通过</p>
                  <p className="text-sm text-safe-600">
                    {format(new Date(requisition.approvedAt), 'yyyy-MM-dd HH:mm')} ·{' '}
                    {requisition.approvedBy}
                  </p>
                </div>
              </div>
            )}

            {requisition.status === 'rejected' && requisition.rejectReason && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                  <XCircle className="w-4 h-4 text-danger-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">驳回原因</p>
                  <p className="text-sm text-danger-500">{requisition.rejectReason}</p>
                </div>
              </div>
            )}
          </div>

          {isPending && currentRole === 'admin' && (
            <div className="pt-4 border-t border-gray-100 space-y-3">
              {!rejecting ? (
                <div className="flex gap-3">
                  <button
                    onClick={onApprove}
                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    通过
                  </button>
                  <button
                    onClick={() => setRejecting(true)}
                    className="btn-outline flex-1 flex items-center justify-center gap-2 border-danger-500 text-danger-500 hover:bg-red-50"
                  >
                    <XCircle className="w-4 h-4" />
                    驳回
                  </button>
                </div>
              ) : (
                <div className="space-y-2 animate-fade-in">
                  <label className="label-field">驳回原因</label>
                  <textarea
                    className="input-field min-h-[80px]"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="请输入驳回原因..."
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => setRejecting(false)}
                      className="btn-ghost flex-1 text-sm"
                    >
                      取消
                    </button>
                    <button onClick={onReject} className="btn-danger flex-1 text-sm">
                      确认驳回
                    </button>
                  </div>
                </div>
              )}

              {requisition.status === 'hazardous_pending' && (
                <p className="text-xs text-danger-500 bg-red-50 p-2 rounded-lg">
                  <ShieldAlert className="w-3.5 h-3.5 inline mr-1" />
                  此为危化品领用，点击「通过」将进行二次确认
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Approval() {
  const {
    requisitions,
    consumables,
    approveRequisition,
    rejectRequisition,
    approveHazardousRequisition,
    currentRole,
  } = useStore()
  const [activeTab, setActiveTab] = useState<'pending' | 'all'>('pending')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [confirmHazardousId, setConfirmHazardousId] = useState<string | null>(null)
  const [rejectingInDrawer, setRejectingInDrawer] = useState(false)
  const [rejectReason, setRejectReason] = useState('')

  const pendingReqs = requisitions
    .filter((r) => r.status === 'pending' || r.status === 'hazardous_pending')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const allReqs = requisitions
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const displayReqs = activeTab === 'pending' ? pendingReqs : allReqs
  const selectedReq = requisitions.find((r) => r.id === selectedId)
  const selectedConsumable = selectedReq
    ? consumables.find((c) => c.id === selectedReq.consumableId)
    : undefined

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
    setRejectingInDrawer(false)
    setRejectReason('')
  }

  const handleReject = (id: string, reason: string) => {
    rejectRequisition(id, reason || '不符合领用条件')
    setRejectingInDrawer(false)
    setRejectReason('')
  }

  const handleDrawerApprove = () => {
    if (!selectedReq) return
    handleApprove(selectedReq.id, selectedReq.isHazardous)
  }

  const handleDrawerReject = () => {
    if (!selectedReq) return
    handleReject(selectedReq.id, rejectReason)
  }

  const openDetail = (id: string) => {
    setSelectedId(id)
    setRejectingInDrawer(false)
    setRejectReason('')
  }

  const closeDetail = () => {
    setSelectedId(null)
    setRejectingInDrawer(false)
    setRejectReason('')
  }

  const statusConfig: Record<
    string,
    { label: string; color: string; icon: React.ElementType; bg: string }
  > = {
    pending: { label: '待审批', color: 'text-lab-700', icon: Clock, bg: 'bg-lab-50' },
    hazardous_pending: {
      label: '待二次审批',
      color: 'text-danger-500',
      icon: ShieldAlert,
      bg: 'bg-red-50',
    },
    approved: {
      label: '已通过',
      color: 'text-safe-600',
      icon: CheckCircle,
      bg: 'bg-emerald-50',
    },
    rejected: {
      label: '已驳回',
      color: 'text-danger-500',
      icon: XCircle,
      bg: 'bg-red-50',
    },
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
              onClick={() => openDetail(r.id)}
              className={cn(
                'card p-5 transition-all cursor-pointer hover:shadow-md',
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
                          <Flame className="w-3 h-3 mr-0.5" />
                          危化品
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
                  <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleApprove(r.id, r.isHazardous)}
                      className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      通过
                    </button>
                    <button
                      onClick={() => {
                        setSelectedId(r.id)
                        setRejectingInDrawer(true)
                        setRejectReason('')
                      }}
                      className="btn-outline text-xs px-3 py-1.5 flex items-center gap-1 border-danger-500 text-danger-500 hover:bg-red-50"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      驳回
                    </button>
                  </div>
                )}
              </div>
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

      {selectedReq && (
        <DetailDrawer
          requisition={selectedReq}
          consumable={selectedConsumable}
          onClose={closeDetail}
          onApprove={handleDrawerApprove}
          onReject={handleDrawerReject}
          rejecting={rejectingInDrawer}
          rejectReason={rejectReason}
          setRejectReason={setRejectReason}
          setRejecting={setRejectingInDrawer}
          currentRole={currentRole}
        />
      )}

      {confirmHazardousId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => {
            setConfirmHazardousId(null)
            setRejectingInDrawer(false)
            setRejectReason('')
          }} />
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
                onClick={() => {
                  setConfirmHazardousId(null)
                  setRejectingInDrawer(false)
                  setRejectReason('')
                }}
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
