import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { usePlansStore } from '@/store/plansStore'
import { ArrowLeft, Package, Truck, FileText, Heart, Plus, Trash2, Check, Clipboard, Gift } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getPackagingStatusLabel } from '@/utils/format'

const packagingSteps: { key: 'none' | 'packing' | 'packed'; label: string }[] = [
  { key: 'none', label: '未包装' },
  { key: 'packing', label: '包装中' },
  { key: 'packed', label: '已包装' },
]

export default function OrderTracking() {
  const { id } = useParams<{ id: string }>()
  const plan = usePlansStore((s) => s.plans.find((p) => p.id === id))
  const updateOrderInfo = usePlansStore((s) => s.updateOrderInfo)
  const updatePackagingStatus = usePlansStore((s) => s.updatePackagingStatus)
  const addBlessingAssignment = usePlansStore((s) => s.addBlessingAssignment)
  const updateBlessingAssignment = usePlansStore((s) => s.updateBlessingAssignment)
  const removeBlessingAssignment = usePlansStore((s) => s.removeBlessingAssignment)

  const orderInfo = plan?.orderInfo ?? { orderNumber: '', courier: '', estimatedArrival: '', packagingStatus: 'none' as const, actualArrival: '' }

  const [orderNumber, setOrderNumber] = useState(orderInfo.orderNumber)
  const [courier, setCourier] = useState(orderInfo.courier)
  const [estimatedArrival, setEstimatedArrival] = useState(orderInfo.estimatedArrival)
  const [actualArrival, setActualArrival] = useState(orderInfo.actualArrival)

  const [newParticipantName, setNewParticipantName] = useState('')
  const [newBlessingContent, setNewBlessingContent] = useState('')

  if (!plan || !id) return null

  const currentPackagingStatus = plan.orderInfo?.packagingStatus ?? 'none'
  const currentStepIndex = packagingSteps.findIndex((s) => s.key === currentPackagingStatus)

  const handleSaveOrderInfo = () => {
    updateOrderInfo(id, { orderNumber, courier, estimatedArrival, actualArrival })
  }

  const handleAdvancePackaging = () => {
    if (currentStepIndex < packagingSteps.length - 1) {
      updatePackagingStatus(id, packagingSteps[currentStepIndex + 1].key)
    }
  }

  const handleAddBlessing = () => {
    if (!newParticipantName.trim() || !newBlessingContent.trim()) return
    addBlessingAssignment(id, {
      participantName: newParticipantName.trim(),
      blessingContent: newBlessingContent.trim(),
      isCompleted: false,
    })
    setNewParticipantName('')
    setNewBlessingContent('')
  }

  const handleToggleComplete = (assignmentId: string, current: boolean) => {
    updateBlessingAssignment(id, assignmentId, { isCompleted: !current })
  }

  const handleDeleteBlessing = (assignmentId: string) => {
    removeBlessingAssignment(id, assignmentId)
  }

  return (
    <div className="min-h-screen pb-8">
      <nav className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3 bg-cream/80 backdrop-blur-md">
        <Link to={`/plan/${id}`} className="p-1 rounded-lg hover:bg-warm-100 transition-colors">
          <ArrowLeft className="w-5 h-5 text-bark-700" />
        </Link>
        <h1 className="text-lg font-bold text-bark-900 font-body">订单追踪</h1>
      </nav>

      <div className="container space-y-5 mt-4 px-4">
        <section className="bg-white/60 backdrop-blur-sm rounded-2xl p-5 shadow-sm border border-warm-100/50">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-warm-500" />
            <h2 className="text-base font-bold text-bark-900">订单信息</h2>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 bg-cream/60 rounded-xl px-3 py-2">
              <Clipboard className="w-4 h-4 text-bark-400 shrink-0" />
              <input
                type="text"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="订单号"
                className="flex-1 bg-transparent text-sm text-bark-800 placeholder:text-bark-300 outline-none"
              />
            </div>

            <div className="flex items-center gap-2 bg-cream/60 rounded-xl px-3 py-2">
              <Truck className="w-4 h-4 text-bark-400 shrink-0" />
              <input
                type="text"
                value={courier}
                onChange={(e) => setCourier(e.target.value)}
                placeholder="快递公司"
                className="flex-1 bg-transparent text-sm text-bark-800 placeholder:text-bark-300 outline-none"
              />
            </div>

            <div className="flex items-center gap-2 bg-cream/60 rounded-xl px-3 py-2">
              <FileText className="w-4 h-4 text-bark-400 shrink-0" />
              <input
                type="date"
                value={estimatedArrival}
                onChange={(e) => setEstimatedArrival(e.target.value)}
                placeholder="预计到达日期"
                className="flex-1 bg-transparent text-sm text-bark-800 placeholder:text-bark-300 outline-none"
              />
            </div>

            <div className="flex items-center gap-2 bg-cream/60 rounded-xl px-3 py-2">
              <FileText className="w-4 h-4 text-bark-400 shrink-0" />
              <input
                type="date"
                value={actualArrival}
                onChange={(e) => setActualArrival(e.target.value)}
                placeholder="实际到达日期"
                className="flex-1 bg-transparent text-sm text-bark-800 placeholder:text-bark-300 outline-none"
              />
            </div>

            <button
              onClick={handleSaveOrderInfo}
              className="w-full py-2.5 rounded-xl bg-warm-500 text-white text-sm font-semibold hover:bg-warm-600 transition-colors"
            >
              保存订单信息
            </button>
          </div>
        </section>

        <section className="bg-white/60 backdrop-blur-sm rounded-2xl p-5 shadow-sm border border-warm-100/50">
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-5 h-5 text-warm-500" />
            <h2 className="text-base font-bold text-bark-900">包装状态</h2>
          </div>

          <div className="flex items-center justify-between px-2 mb-4">
            {packagingSteps.map((step, index) => (
              <div key={step.key} className="flex items-center">
                <button
                  onClick={handleAdvancePackaging}
                  disabled={index > currentStepIndex + 1 || index <= currentStepIndex}
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center transition-all',
                    index <= currentStepIndex
                      ? 'bg-warm-500 text-white shadow-md'
                      : 'bg-bark-100 text-bark-400'
                  )}
                >
                  <Package className="w-5 h-5" />
                </button>
                {index < packagingSteps.length - 1 && (
                  <div
                    className={cn(
                      'w-12 h-1 mx-1 rounded-full transition-all',
                      index < currentStepIndex ? 'bg-warm-500' : 'bg-bark-100'
                    )}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-between px-1 mb-3">
            {packagingSteps.map((step) => (
              <span
                key={step.key}
                className={cn(
                  'text-xs',
                  step.key === currentPackagingStatus ? 'text-warm-600 font-semibold' : 'text-bark-400'
                )}
              >
                {step.label}
              </span>
            ))}
          </div>

          <p className="text-center text-sm text-bark-600">
            当前状态：<span className="font-semibold text-warm-500">{getPackagingStatusLabel(currentPackagingStatus)}</span>
          </p>

          {currentStepIndex < packagingSteps.length - 1 && (
            <button
              onClick={handleAdvancePackaging}
              className="mt-3 w-full py-2 rounded-xl bg-warm-50 text-warm-600 text-sm font-semibold hover:bg-warm-100 transition-colors border border-warm-200"
            >
              推进到下一步
            </button>
          )}
        </section>

        <section className="bg-white/60 backdrop-blur-sm rounded-2xl p-5 shadow-sm border border-warm-100/50">
          <div className="flex items-center gap-2 mb-4">
            <Heart className="w-5 h-5 text-warm-500" />
            <h2 className="text-base font-bold text-bark-900">祝福语分工</h2>
          </div>

          <div className="space-y-2 mb-4">
            {plan.blessingAssignments.map((assignment) => (
              <div
                key={assignment.id}
                className={cn(
                  'flex items-start gap-3 p-3 rounded-xl transition-all',
                  assignment.isCompleted ? 'bg-mint-100/60' : 'bg-cream/60'
                )}
              >
                <button
                  onClick={() => handleToggleComplete(assignment.id, assignment.isCompleted)}
                  className={cn(
                    'mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all',
                    assignment.isCompleted
                      ? 'bg-mint-400 border-mint-400 text-white'
                      : 'border-bark-300 bg-white'
                  )}
                >
                  {assignment.isCompleted && <Check className="w-3 h-3" />}
                </button>

                <div className="flex-1 min-w-0">
                  <p className={cn(
                    'text-sm font-semibold',
                    assignment.isCompleted ? 'text-bark-400 line-through' : 'text-bark-800'
                  )}>
                    {assignment.participantName}
                  </p>
                  <p className={cn(
                    'text-sm mt-0.5',
                    assignment.isCompleted ? 'text-bark-400 line-through' : 'text-bark-600'
                  )}>
                    {assignment.blessingContent}
                  </p>
                </div>

                <button
                  onClick={() => handleDeleteBlessing(assignment.id)}
                  className="p-1 rounded-lg hover:bg-rose-50 transition-colors shrink-0"
                >
                  <Trash2 className="w-4 h-4 text-rose-400" />
                </button>
              </div>
            ))}

            {plan.blessingAssignments.length === 0 && (
              <p className="text-center text-sm text-bark-400 py-4">暂无祝福语分工</p>
            )}
          </div>

          <div className="space-y-2 border-t border-warm-100 pt-3">
            <div className="flex items-center gap-2 bg-cream/60 rounded-xl px-3 py-2">
              <Gift className="w-4 h-4 text-bark-400 shrink-0" />
              <input
                type="text"
                value={newParticipantName}
                onChange={(e) => setNewParticipantName(e.target.value)}
                placeholder="参与者姓名"
                list="participant-names"
                className="flex-1 bg-transparent text-sm text-bark-800 placeholder:text-bark-300 outline-none"
              />
              <datalist id="participant-names">
                {plan.participants.map((p) => (
                  <option key={p.id} value={p.name} />
                ))}
              </datalist>
            </div>

            <textarea
              value={newBlessingContent}
              onChange={(e) => setNewBlessingContent(e.target.value)}
              placeholder="祝福语内容"
              rows={2}
              className="w-full bg-cream/60 rounded-xl px-3 py-2 text-sm text-bark-800 placeholder:text-bark-300 outline-none resize-none"
            />

            <button
              onClick={handleAddBlessing}
              disabled={!newParticipantName.trim() || !newBlessingContent.trim()}
              className={cn(
                'w-full py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-1.5',
                newParticipantName.trim() && newBlessingContent.trim()
                  ? 'bg-warm-500 text-white hover:bg-warm-600'
                  : 'bg-bark-100 text-bark-400 cursor-not-allowed'
              )}
            >
              <Plus className="w-4 h-4" />
              添加祝福语
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
