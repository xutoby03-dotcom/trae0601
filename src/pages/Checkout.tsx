import { useState, useMemo, useCallback } from 'react'
import { useStore } from '@/store'
import { cn } from '@/lib/utils'
import { ClipboardList, Search, AlertTriangle, Check, X, Calendar, User, Clock, ShieldAlert, CheckSquare, Square, ListChecks } from 'lucide-react'
import type { Sample, CheckoutRecord } from '@/types'

type TabKey = 'register' | 'records'

const STATUS_BADGES: Record<CheckoutRecord['status'], { label: string; className: string }> = {
  pending: { label: '待教师审批', className: 'bg-amber-100 text-amber-800' },
  confirmed: { label: '已出库', className: 'bg-green-100 text-green-800' },
  rejected: { label: '已驳回', className: 'bg-red-100 text-red-800' },
  returned: { label: '已归还', className: 'bg-blue-100 text-blue-800' },
  disposed: { label: '已废弃', className: 'bg-gray-100 text-gray-600' },
}

function formatDateTime(iso: string) {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function toLocalDatetimeString(date: Date) {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export default function Checkout() {
  const { samples, checkouts, addCheckout, confirmCheckout, rejectCheckout } = useStore()
  const [activeTab, setActiveTab] = useState<TabKey>('register')

  if (activeTab === 'register') {
    return <RegisterTab samples={samples} addCheckout={addCheckout} onSwitchToRecords={() => setActiveTab('records')} />
  }

  return (
    <RecordsTab
      samples={samples}
      checkouts={checkouts}
      confirmCheckout={confirmCheckout}
      rejectCheckout={rejectCheckout}
      onSwitchToRegister={() => setActiveTab('register')}
    />
  )
}

function TabBar({ active, onChange }: { active: TabKey; onChange: (t: TabKey) => void }) {
  return (
    <div className="flex border-b border-gray-200 mb-6">
      {([
        ['register', '领用登记', ClipboardList],
        ['records', '领用记录', ClipboardList],
      ] as const).map(([key, label, Icon]) => (
        <button
          key={key}
          onClick={() => onChange(key as TabKey)}
          className={cn(
            'flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors',
            active === key
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          )}
        >
          <Icon className="w-4 h-4" />
          {label}
        </button>
      ))}
    </div>
  )
}

interface RegisterTabProps {
  samples: Sample[]
  addCheckout: (checkout: Omit<CheckoutRecord, 'id'>) => CheckoutRecord | null
  onSwitchToRecords: () => void
}

function RegisterTab({ samples, addCheckout, onSwitchToRecords }: RegisterTabProps) {
  const [selectedSampleId, setSelectedSampleId] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [className, setClassName] = useState('')
  const [labBench, setLabBench] = useState('')
  const [studentName, setStudentName] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [checkoutTime, setCheckoutTime] = useState(toLocalDatetimeString(new Date()))
  const [successMsg, setSuccessMsg] = useState('')
  const [successType, setSuccessType] = useState<'direct' | 'pending'>('direct')

  const eligibleSamples = useMemo(
    () => samples.filter((s) => s.status !== 'expired' && s.remainingQuantity > 0),
    [samples]
  )

  const filteredSamples = useMemo(
    () =>
      eligibleSamples.filter(
        (s) =>
          s.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.type.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [eligibleSamples, searchTerm]
  )

  const selectedSample = samples.find((s) => s.id === selectedSampleId) ?? null

  const isExpired = selectedSample?.status === 'expired'
  const isHighHazard = (selectedSample?.hazardLevel ?? 0) >= 4
  const quantityExceeded = selectedSample ? quantity > selectedSample.remainingQuantity : false
  const canSubmit =
    selectedSampleId &&
    className.trim() &&
    labBench.trim() &&
    studentName.trim() &&
    quantity > 0 &&
    !isExpired &&
    !quantityExceeded

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSample || !canSubmit) return

    const result = addCheckout({
      sampleId: selectedSample.id,
      className: className.trim(),
      labBench: labBench.trim(),
      studentName: studentName.trim(),
      quantity,
      checkoutTime: new Date(checkoutTime).toISOString(),
      teacherConfirmed: false,
      teacherName: '',
      status: isHighHazard ? 'pending' : 'confirmed',
    })

    if (result) {
      setSuccessType(isHighHazard ? 'pending' : 'direct')
      setSuccessMsg(
        isHighHazard
          ? '领用申请已提交，等待教师审批后方可出库'
          : '领用登记成功，样本已出库'
      )
      setSelectedSampleId('')
      setSearchTerm('')
      setClassName('')
      setLabBench('')
      setStudentName('')
      setQuantity(1)
      setCheckoutTime(toLocalDatetimeString(new Date()))
      setTimeout(() => setSuccessMsg(''), 4000)
    }
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <TabBar active="register" onChange={(t) => t === 'records' && onSwitchToRecords()} />

      {successMsg && (
        <div
          className={cn(
            'mb-4 p-3 rounded-lg flex items-center gap-2 border',
            successType === 'direct'
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-amber-50 border-amber-200 text-amber-800'
          )}
        >
          {successType === 'direct' ? <Check className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
          {successMsg}
        </div>
      )}

      {isExpired && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          该样本已过期，禁止发放！
        </div>
      )}

      {isHighHazard && !isExpired && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0" />
          <div className="text-sm">
            <p className="font-medium">该样本为高危险等级（{selectedSample?.hazardLevel}级）</p>
            <p className="mt-0.5 text-amber-700">提交后需教师审批通过方可出库，库存将在审批通过后扣减</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">选择样本</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索样本编号或类型..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>
          <select
            value={selectedSampleId}
            onChange={(e) => {
              setSelectedSampleId(e.target.value)
              setQuantity(1)
            }}
            className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          >
            <option value="">请选择样本</option>
            {filteredSamples.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code} - {s.type}（库存: {s.remainingQuantity}）
              </option>
            ))}
          </select>
          {selectedSample && (
            <div className="mt-2 flex items-center flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
              <span>危险等级: {selectedSample.hazardLevel}级</span>
              <span>库存: {selectedSample.remainingQuantity}</span>
              <span>状态: {STATUS_BADGES[selectedSample.status as keyof typeof STATUS_BADGES]?.label || selectedSample.status}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">班级</label>
            <input
              type="text"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              placeholder="请输入班级"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">实验台号</label>
            <input
              type="text"
              value={labBench}
              onChange={(e) => setLabBench(e.target.value)}
              placeholder="请输入实验台号"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <User className="inline w-4 h-4 mr-1 -mt-0.5" />
              领用学生
            </label>
            <input
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="请输入学生姓名"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">领用数量</label>
            <input
              type="number"
              min={1}
              max={selectedSample?.remainingQuantity ?? undefined}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className={cn(
                'w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500',
                quantityExceeded ? 'border-red-500' : 'border-gray-300'
              )}
            />
            {quantityExceeded && (
              <p className="mt-1 text-xs text-red-600">领用数量不能超过库存量</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Calendar className="inline w-4 h-4 mr-1 -mt-0.5" />
            领取时间
          </label>
          <input
            type="datetime-local"
            value={checkoutTime}
            onChange={(e) => setCheckoutTime(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
        </div>

        <button
          type="submit"
          disabled={!canSubmit}
          className={cn(
            'w-full py-2.5 px-4 rounded-lg text-sm font-medium transition-colors',
            canSubmit
              ? isHighHazard
                ? 'bg-amber-600 text-white hover:bg-amber-500'
                : 'bg-teal-600 text-white hover:bg-teal-500'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          )}
        >
          {isHighHazard ? '提交审批申请' : '确认领用出库'}
        </button>
      </form>
    </div>
  )
}

interface RecordsTabProps {
  samples: Sample[]
  checkouts: CheckoutRecord[]
  confirmCheckout: (id: string, teacherName: string) => boolean
  rejectCheckout: (id: string) => void
  onSwitchToRegister: () => void
}

function RecordsTab({ samples, checkouts, confirmCheckout, rejectCheckout, onSwitchToRegister }: RecordsTabProps) {
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [onlyPendingHighHazard, setOnlyPendingHighHazard] = useState(false)
  const [confirmTeacherName, setConfirmTeacherName] = useState<Record<string, string>>({})
  const [stockErrors, setStockErrors] = useState<Record<string, boolean>>({})
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [batchTeacherName, setBatchTeacherName] = useState('')
  const [batchResult, setBatchResult] = useState<{ approved: number; failed: number } | null>(null)

  const sampleMap = useMemo(() => {
    const m = new Map<string, Sample>()
    for (const s of samples) m.set(s.id, s)
    return m
  }, [samples])

  const pendingHighHazardIds = useMemo(() => {
    const ids = new Set<string>()
    for (const c of checkouts) {
      const s = sampleMap.get(c.sampleId)
      if (c.status === 'pending' && (s?.hazardLevel ?? 0) >= 4) {
        ids.add(c.id)
      }
    }
    return ids
  }, [checkouts, sampleMap])

  const filteredCheckouts = useMemo(() => {
    let list = checkouts
    if (statusFilter !== 'all') {
      list = list.filter((c) => c.status === statusFilter)
    }
    if (onlyPendingHighHazard) {
      list = list.filter((c) => pendingHighHazardIds.has(c.id))
    }
    if (searchTerm.trim()) {
      const kw = searchTerm.trim().toLowerCase()
      list = list.filter((c) => {
        const s = sampleMap.get(c.sampleId)
        return (
          c.className.toLowerCase().includes(kw) ||
          c.studentName.toLowerCase().includes(kw) ||
          (s?.code.toLowerCase() ?? '').includes(kw) ||
          (s?.type.toLowerCase() ?? '').includes(kw)
        )
      })
    }
    return list
  }, [checkouts, statusFilter, searchTerm, onlyPendingHighHazard, sampleMap, pendingHighHazardIds])

  const sortedCheckouts = useMemo(() => {
    return [...filteredCheckouts].sort((a, b) => new Date(b.checkoutTime).getTime() - new Date(a.checkoutTime).getTime())
  }, [filteredCheckouts])

  const handleConfirm = (id: string) => {
    const name = confirmTeacherName[id]?.trim()
    if (!name) return
    const ok = confirmCheckout(id, name)
    if (!ok) {
      setStockErrors((prev) => ({ ...prev, [id]: true }))
      setTimeout(() => setStockErrors((prev) => {
        const next = { ...prev }
        delete next[id]
        return next
      }), 4000)
    }
    setConfirmTeacherName((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const selectAllPendingHighHazard = useCallback(() => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      const visibleIds = sortedCheckouts
        .filter((c) => pendingHighHazardIds.has(c.id))
        .map((c) => c.id)
      const allSelected = visibleIds.every((id) => next.has(id))
      for (const id of visibleIds) {
        if (allSelected) next.delete(id)
        else next.add(id)
      }
      return next
    })
  }, [sortedCheckouts, pendingHighHazardIds])

  const handleBatchApprove = () => {
    const name = batchTeacherName.trim()
    if (!name || selectedIds.size === 0) return
    let approved = 0
    let failed = 0
    for (const id of selectedIds) {
      const ok = confirmCheckout(id, name)
      if (ok) approved++
      else {
        failed++
        setStockErrors((prev) => ({ ...prev, [id]: true }))
      }
    }
    setBatchResult({ approved, failed })
    setBatchTeacherName('')
    setSelectedIds(new Set())
    setTimeout(() => {
      setBatchResult(null)
      setStockErrors({})
    }, 5000)
  }

  const handleBatchReject = () => {
    if (selectedIds.size === 0) return
    for (const id of selectedIds) {
      rejectCheckout(id)
    }
    setSelectedIds(new Set())
  }

  const hasVisibleSelected = useMemo(() => {
    return sortedCheckouts.some((c) => selectedIds.has(c.id))
  }, [sortedCheckouts, selectedIds])

  return (
    <div className="animate-fade-in">
      <TabBar active="records" onChange={(t) => t === 'register' && onSwitchToRegister()} />

      <div className="flex flex-col gap-3 mb-4">
        <div className="flex items-center gap-3 flex-wrap">
          <h3 className="text-sm font-medium text-gray-700 mr-auto">
            共 {filteredCheckouts.length} 条记录
          </h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索样本编号/类型、班级、学生..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-1.5 w-72 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          >
            <option value="all">全部状态</option>
            <option value="pending">待教师审批</option>
            <option value="confirmed">已出库</option>
            <option value="rejected">已驳回</option>
            <option value="returned">已归还</option>
            <option value="disposed">已废弃</option>
          </select>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <button
              type="button"
              role="switch"
              aria-checked={onlyPendingHighHazard}
              onClick={() => setOnlyPendingHighHazard((v) => !v)}
              className={cn(
                'relative w-10 h-5 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2',
                onlyPendingHighHazard ? 'bg-amber-600' : 'bg-gray-300'
              )}
            >
              <span
                className={cn(
                  'absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform shadow',
                  onlyPendingHighHazard && 'translate-x-5'
                )}
              />
            </button>
            <span className="text-sm text-gray-700">只看待审批高危样本</span>
          </label>
          {pendingHighHazardIds.size > 0 && (
            <button
              type="button"
              onClick={selectAllPendingHighHazard}
              className="flex items-center gap-1.5 text-xs text-amber-700 hover:text-amber-800 font-medium transition-colors"
            >
              <ListChecks className="w-3.5 h-3.5" />
              全选/取消高危待审批
            </button>
          )}
        </div>
      </div>

      {hasVisibleSelected && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg animate-fade-in">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm font-medium text-amber-800">
              已选 {selectedIds.size} 条待审批记录
            </span>
            <input
              type="text"
              placeholder="教师姓名（批量通过用）"
              value={batchTeacherName}
              onChange={(e) => setBatchTeacherName(e.target.value)}
              className="px-2.5 py-1.5 border border-amber-300 rounded text-sm w-40 focus:ring-1 focus:ring-amber-500 focus:border-amber-500 bg-white"
            />
            <button
              onClick={handleBatchApprove}
              disabled={!batchTeacherName.trim()}
              className={cn(
                'flex items-center gap-1 px-3 py-1.5 rounded text-sm font-medium transition-colors',
                batchTeacherName.trim()
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              )}
            >
              <Check className="w-4 h-4" />
              批量通过
            </button>
            <button
              onClick={handleBatchReject}
              className="flex items-center gap-1 px-3 py-1.5 rounded text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors"
            >
              <X className="w-4 h-4" />
              批量驳回
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="text-xs text-amber-700 hover:text-amber-900 ml-auto font-medium"
            >
              取消选择
            </button>
          </div>
          {batchResult && (
            <div className={cn(
              'mt-2 text-xs font-medium',
              batchResult.failed > 0 ? 'text-amber-800' : 'text-green-800'
            )}>
              批量处理完成：{batchResult.approved} 条已通过
              {batchResult.failed > 0 && `，${batchResult.failed} 条因库存不足保留待审批`}
            </div>
          )}
        </div>
      )}

      <div className="space-y-3">
        {sortedCheckouts.map((c) => {
          const sample = sampleMap.get(c.sampleId)
          const badge = STATUS_BADGES[c.status]
          const isPendingHighHazard = pendingHighHazardIds.has(c.id)
          const isStockInsufficient =
            isPendingHighHazard && sample && sample.remainingQuantity < c.quantity
          const isSelected = selectedIds.has(c.id)

          return (
            <div
              key={c.id}
              className={cn(
                'p-4 bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow',
                isPendingHighHazard ? 'border-amber-200 bg-amber-50/30' : 'border-gray-200',
                isSelected && 'ring-2 ring-amber-400 ring-offset-1'
              )}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {isPendingHighHazard && (
                      <button
                        type="button"
                        onClick={() => toggleSelect(c.id)}
                        className="shrink-0 text-amber-600 hover:text-amber-700 transition-colors"
                      >
                        {isSelected
                          ? <CheckSquare className="w-4.5 h-4.5" />
                          : <Square className="w-4.5 h-4.5" />
                        }
                      </button>
                    )}
                    <span className="font-mono text-sm font-semibold text-gray-900">
                      {sample?.code ?? '未知样本'}
                    </span>
                    <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', badge.className)}>
                      {badge.label}
                    </span>
                    {sample && sample.hazardLevel >= 4 && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                        {sample.hazardLevel}级高危
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 space-y-0.5">
                    <p>班级: {c.className} | 实验台号: {c.labBench}</p>
                    <p>领用学生: {c.studentName} | 数量: {c.quantity}</p>
                    <p>领取时间: {formatDateTime(c.checkoutTime)}</p>
                    {c.teacherConfirmed && c.teacherName && (
                      <p className="text-teal-700 font-medium">审批教师: {c.teacherName}</p>
                    )}
                    {c.status === 'rejected' && (
                      <p className="text-red-600 font-medium">教师已驳回出库申请</p>
                    )}
                    {isPendingHighHazard && sample && (
                      <p className={cn(
                        'text-xs font-medium',
                        isStockInsufficient ? 'text-red-600' : 'text-gray-500'
                      )}>
                        当前库存: {sample.remainingQuantity} | 需求: {c.quantity}
                        {isStockInsufficient && ' · 库存不足，无法通过'}
                      </p>
                    )}
                  </div>
                  {stockErrors[c.id] && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 border border-red-200 rounded-md text-xs text-red-700 font-medium">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      库存不足，无法通过审批。当前库存已被其他审批占用。
                    </div>
                  )}
                </div>

                {isPendingHighHazard && (
                  <div className="flex flex-col items-end gap-2 ml-4">
                    <p className="text-xs font-medium text-amber-700">单条审批</p>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="教师姓名"
                        value={confirmTeacherName[c.id] ?? ''}
                        onChange={(e) =>
                          setConfirmTeacherName((prev) => ({
                            ...prev,
                            [c.id]: e.target.value,
                          }))
                        }
                        className="px-2.5 py-1.5 border border-gray-300 rounded text-xs w-28 focus:ring-1 focus:ring-teal-500 bg-white"
                      />
                      <button
                        onClick={() => handleConfirm(c.id)}
                        disabled={!confirmTeacherName[c.id]?.trim() || isStockInsufficient}
                        className={cn(
                          'flex items-center gap-1 px-3 py-1.5 rounded text-xs font-medium transition-colors',
                          confirmTeacherName[c.id]?.trim() && !isStockInsufficient
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        )}
                      >
                        <Check className="w-3.5 h-3.5" />
                        通过
                      </button>
                      <button
                        onClick={() => rejectCheckout(c.id)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded text-xs font-medium bg-red-600 text-white hover:bg-red-700 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                        驳回
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })}

        {filteredCheckouts.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <ClipboardList className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">暂无领用记录</p>
          </div>
        )}
      </div>
    </div>
  )
}
