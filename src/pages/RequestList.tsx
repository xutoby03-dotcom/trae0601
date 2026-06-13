import { useMemo, useState } from 'react'
import {
  Plus,
  Check,
  X,
  AlertTriangle,
  CalendarClock,
  Clock,
  KeyRound,
  XCircle,
  MapPin,
  Users,
  Search,
} from 'lucide-react'
import { useStore } from '@/store'
import Modal from '@/components/Modal'
import { RequestStatusBadge, StatusBadge } from '@/components/StatusBadges'
import FuelBar from '@/components/FuelBar'
import { formatDateTime, formatTime } from '@/utils/date'
import type { DEPARTMENTS as D } from '@/types'
import { DEPARTMENTS } from '@/types'
import type { Request } from '@/types'

interface RequestForm {
  vehicleId: string
  department: string
  purpose: string
  startTime: string
  endTime: string
  driver: string
  destination: string
  estimatedMileage: number
  applicantName: string
}

function nowLocalInput(): string {
  const d = new Date()
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function plusHours(h: number): string {
  const d = new Date(Date.now() + h * 60 * 60 * 1000)
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function RequestList() {
  const requests = useStore((s) => s.requests)
  const vehicles = useStore((s) => s.vehicles)
  const addRequest = useStore((s) => s.addRequest)
  const updateRequestStatus = useStore((s) => s.updateRequestStatus)
  const checkConflict = useStore((s) => s.checkConflict)
  const currentUser = useStore((s) => s.currentUser)

  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState<RequestForm>({
    vehicleId: vehicles[0]?.id ?? '',
    department: DEPARTMENTS[0],
    purpose: '',
    startTime: nowLocalInput(),
    endTime: plusHours(4),
    driver: currentUser.name,
    destination: '',
    estimatedMileage: 50,
    applicantName: currentUser.name,
  })
  const [errors, setErrors] = useState<Partial<Record<keyof RequestForm, string>>>({})
  const [rejectOpen, setRejectOpen] = useState(false)
  const [rejectTarget, setRejectTarget] = useState<Request | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  const [blockOpen, setBlockOpen] = useState(false)
  const [blockInfo, setBlockInfo] = useState<{
    title: string
    action: string
    conflict: { department: string; driver: string; startTime: string; endTime: string; status: string }[]
  } | null>(null)

  const [searchText, setSearchText] = useState('')
  const [conflictPeekOpen, setConflictPeekOpen] = useState(false)
  const [conflictPeekData, setConflictPeekData] = useState<{
    plateNumber: string
    rows: { department: string; driver: string; startTime: string; endTime: string; status: string }[]
  } | null>(null)

  const conflictInfo = useMemo(() => {
    if (!form.vehicleId || !form.startTime || !form.endTime) return null
    return checkConflict(form.vehicleId, new Date(form.startTime).toISOString(), new Date(form.endTime).toISOString())
  }, [form.vehicleId, form.startTime, form.endTime, checkConflict])

  const availableVehicles = vehicles.filter((v) => v.status === 'available')

  function openCreate() {
    setForm((f) => ({
      ...f,
      vehicleId: availableVehicles[0]?.id ?? vehicles[0]?.id ?? '',
      startTime: nowLocalInput(),
      endTime: plusHours(4),
      applicantName: currentUser.name,
    }))
    setErrors({})
    setModalOpen(true)
  }

  function validate() {
    const e: Partial<Record<keyof RequestForm, string>> = {}
    if (!form.vehicleId) e.vehicleId = '请选择车辆'
    if (!form.department) e.department = '请选择部门'
    if (!form.purpose.trim()) e.purpose = '请填写用途'
    if (!form.startTime) e.startTime = '请选择开始时间'
    if (!form.endTime) e.endTime = '请选择结束时间'
    if (form.startTime && form.endTime && new Date(form.endTime) <= new Date(form.startTime)) {
      e.endTime = '结束时间必须晚于开始时间'
    }
    if (!form.driver.trim()) e.driver = '请填写驾驶人'
    if (!form.destination.trim()) e.destination = '请填写目的地'
    if (form.estimatedMileage <= 0) e.estimatedMileage = '请填写预计里程'
    if (!form.applicantName.trim()) e.applicantName = '请填写申请人'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSubmit() {
    if (!validate()) return
    const result = addRequest({
      vehicleId: form.vehicleId,
      department: form.department,
      purpose: form.purpose,
      startTime: new Date(form.startTime).toISOString(),
      endTime: new Date(form.endTime).toISOString(),
      driver: form.driver,
      destination: form.destination,
      estimatedMileage: form.estimatedMileage,
      applicantName: form.applicantName,
    })
    if (!result) {
      alert('该车辆在所选时段已被预约，请选择其他时间或车辆')
      return
    }
    setModalOpen(false)
  }

  const REQUEST_STATUS_TEXT: Record<Request['status'], string> = {
    pending: '待审批',
    approved: '已批准',
    rejected: '已驳回',
    in_use: '使用中',
    returned: '已归还',
  }

  function buildConflictPayload(conflict: ReturnType<typeof checkConflict>) {
    if (!conflict.hasConflict || !conflict.conflictingRequests) return []
    return conflict.conflictingRequests.map((r) => ({
      department: r.department,
      driver: r.driver,
      startTime: r.startTime,
      endTime: r.endTime,
      status: REQUEST_STATUS_TEXT[r.status],
    }))
  }

  function handleApprove(id: string) {
    const req = requests.find((r) => r.id === id)
    if (!req) return
    const conflict = checkConflict(req.vehicleId, req.startTime, req.endTime, id)
    if (conflict.hasConflict) {
      setBlockInfo({
        title: '批准被拦截：时间冲突',
        action: '批准',
        conflict: buildConflictPayload(conflict),
      })
      setBlockOpen(true)
      return
    }
    if (confirm('确认批准该用车申请？')) updateRequestStatus(id, 'approved')
  }

  function openReject(r: Request) {
    setRejectTarget(r)
    setRejectReason('')
    setRejectOpen(true)
  }

  function handleReject() {
    if (!rejectTarget) return
    if (!rejectReason.trim()) {
      alert('请填写驳回原因')
      return
    }
    updateRequestStatus(rejectTarget.id, 'rejected', rejectReason)
    setRejectOpen(false)
    setRejectTarget(null)
  }

  function handlePickup(id: string) {
    const req = requests.find((r) => r.id === id)
    if (!req) return
    const conflict = checkConflict(req.vehicleId, req.startTime, req.endTime, id)
    if (conflict.hasConflict) {
      setBlockInfo({
        title: '取车被拦截：时间冲突',
        action: '取车登记',
        conflict: buildConflictPayload(conflict),
      })
      setBlockOpen(true)
      return
    }
    if (confirm('确认领取钥匙，车辆进入使用中状态？')) updateRequestStatus(id, 'in_use')
  }

  const [filter, setFilter] = useState<string>('all')

  const lowerSearch = searchText.toLowerCase().trim()

  function isTodayRequest(r: Request): boolean {
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)
    const rStart = new Date(r.startTime)
    const rEnd = new Date(r.endTime)
    return rStart.getTime() < todayEnd.getTime() && rEnd.getTime() > todayStart.getTime()
  }

  function matchSearch(r: Request): boolean {
    if (!lowerSearch) return true
    const v = vehicles.find((x) => x.id === r.vehicleId)
    const plate = v?.plateNumber ?? ''
    const fields = [plate, r.driver, r.department, r.destination, r.purpose].join(' ').toLowerCase()
    return fields.includes(lowerSearch)
  }

  const filteredRequests = useMemo(() => {
    let list = requests
    if (filter === 'today') {
      list = list.filter(isTodayRequest)
    } else if (filter !== 'all') {
      list = list.filter((r) => r.status === filter)
    }
    if (lowerSearch) {
      list = list.filter(matchSearch)
    }
    return list
  }, [requests, filter, lowerSearch])

  function getConflictPeek(r: Request) {
    const conflict = checkConflict(r.vehicleId, r.startTime, r.endTime, r.id)
    if (!conflict.hasConflict || !conflict.conflictingRequests) return null
    const v = vehicles.find((x) => x.id === r.vehicleId)
    return {
      plateNumber: v?.plateNumber ?? '',
      rows: conflict.conflictingRequests.map((cr) => ({
        department: cr.department,
        driver: cr.driver,
        startTime: cr.startTime,
        endTime: cr.endTime,
        status: REQUEST_STATUS_TEXT[cr.status],
      })),
    }
  }

  function openConflictPeek(r: Request) {
    const data = getConflictPeek(r)
    if (!data) return
    setConflictPeekData(data)
    setConflictPeekOpen(true)
  }

  const tabs: { key: string; label: string; count: number }[] = [
    { key: 'all', label: '全部', count: requests.length },
    { key: 'today', label: '今日用车', count: requests.filter(isTodayRequest).length },
    { key: 'pending', label: '待审批', count: requests.filter((r) => r.status === 'pending').length },
    { key: 'approved', label: '已批准', count: requests.filter((r) => r.status === 'approved').length },
    { key: 'in_use', label: '使用中', count: requests.filter((r) => r.status === 'in_use').length },
    { key: 'returned', label: '已归还', count: requests.filter((r) => r.status === 'returned').length },
    { key: 'rejected', label: '已驳回', count: requests.filter((r) => r.status === 'rejected').length },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">用车申请</h1>
          <p className="text-sm text-slate-500 mt-1">
            提交用车申请，系统自动检测时间冲突，管理员审批后生效
          </p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus size={18} />
          提交申请
        </button>
      </div>

      <div className="card !p-3 space-y-3">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="搜索车牌号、驾驶人、部门、目的地..."
            className="form-input pl-10 py-2 bg-slate-50 border-transparent focus:bg-white"
          />
          {searchText && (
            <button
              onClick={() => setSearchText('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={16} />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setFilter(t.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                filter === t.key
                  ? 'text-white'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
              }`}
              style={
                filter === t.key
                  ? { background: 'linear-gradient(135deg, #2A548A 0%, #1E3A5F 100%)' }
                  : undefined
              }
            >
              {t.label}
              <span
                className={`ml-2 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs ${
                  filter === t.key
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                {t.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="card !p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>申请信息</th>
                <th>车辆/驾驶人</th>
                <th>使用时段</th>
                <th>目的地/里程</th>
                <th>状态</th>
                <th className="text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((r) => {
                const v = vehicles.find((x) => x.id === r.vehicleId)
                return (
                  <tr key={r.id}>
                    <td>
                      <div className="flex items-start gap-3">
                        <div
                          className="flex items-center justify-center w-9 h-9 rounded-xl text-white shrink-0 mt-0.5"
                          style={{ background: 'linear-gradient(135deg, #4C75AB 0%, #2A548A 100%)' }}
                        >
                          <CalendarClock size={16} />
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-slate-800">{r.department}</div>
                          <div className="text-xs text-slate-500 mt-0.5 line-clamp-2">{r.purpose}</div>
                          <div className="text-xs text-slate-400 mt-1">
                            申请人 {r.applicantName} · {formatDateTime(r.createdAt)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="font-mono font-semibold text-slate-800">
                        {v?.plateNumber ?? '-'}
                      </div>
                      <div className="text-xs text-slate-500">{v?.model ?? ''}</div>
                      <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                        <KeyRound size={11} /> {r.driver}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <Clock size={13} className="text-slate-400" />
                        <div className="text-sm">
                          <div className="text-slate-700">{formatDateTime(r.startTime)}</div>
                          <div className="text-slate-500 flex items-center gap-1 mt-0.5">
                            <span className="text-slate-300">→</span>
                            {formatDateTime(r.endTime)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5 text-sm text-slate-700">
                        <MapPin size={13} className="text-slate-400 shrink-0" />
                        <span>{r.destination}</span>
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        预计 {r.estimatedMileage.toLocaleString()} km
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2 flex-wrap">
                        <RequestStatusBadge status={r.status} />
                        {r.status !== 'rejected' && r.status !== 'returned' && (() => {
                          const peek = getConflictPeek(r)
                          if (!peek) return null
                          return (
                            <button
                              onClick={() => openConflictPeek(r)}
                              className="badge bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 cursor-pointer transition-colors"
                              title="同车时间冲突，点击查看详情"
                            >
                              <AlertTriangle size={11} />
                              冲突 {peek.rows.length}
                            </button>
                          )
                        })()}
                      </div>
                      {r.status === 'rejected' && r.rejectReason && (
                        <div className="text-xs text-red-500 mt-1 max-w-[180px] line-clamp-2">
                          原因：{r.rejectReason}
                        </div>
                      )}
                    </td>
                    <td className="text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        {r.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(r.id)}
                              className="btn-primary !py-1.5 !px-3 text-xs"
                            >
                              <Check size={13} />
                              批准
                            </button>
                            <button
                              onClick={() => openReject(r)}
                              className="btn-danger !py-1.5 !px-3 text-xs"
                            >
                              <XCircle size={13} />
                              驳回
                            </button>
                          </>
                        )}
                        {r.status === 'approved' && (
                          <button
                            onClick={() => handlePickup(r.id)}
                            className="btn-accent !py-1.5 !px-3 text-xs"
                          >
                            <KeyRound size={13} />
                            取车登记
                          </button>
                        )}
                        {r.status === 'in_use' && (
                          <StatusBadge tone="info">请前往归还登记</StatusBadge>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
              {filteredRequests.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-slate-400">
                    暂无申请记录
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="提交用车申请"
        width="max-w-3xl"
        footer={
          <div className="flex items-center justify-between gap-2">
            {conflictInfo?.hasConflict && (
              <StatusBadge tone="danger">
                <AlertTriangle size={12} /> 该时段已被占用，无法提交
              </StatusBadge>
            )}
            <div className="flex items-center justify-end gap-2 ml-auto">
              <button onClick={() => setModalOpen(false)} className="btn-secondary">
                取消
              </button>
              <button
                onClick={handleSubmit}
                className="btn-primary"
                disabled={conflictInfo?.hasConflict}
              >
                提交申请
              </button>
            </div>
          </div>
        }
      >
        {conflictInfo?.hasConflict && conflictInfo.conflictingRequests && (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 flex gap-3 animate-fade-in">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-red-100 text-red-600 shrink-0">
              <AlertTriangle size={20} />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-red-700">时间冲突</div>
              <div className="text-sm text-red-600 mt-1">
                所选车辆在该时段已被以下申请占用，请调整时间或更换车辆
              </div>
              <div className="mt-4">
                <ConflictDetailList
                  rows={conflictInfo.conflictingRequests.map((cr) => ({
                    department: cr.department,
                    driver: cr.driver,
                    startTime: cr.startTime,
                    endTime: cr.endTime,
                    status: REQUEST_STATUS_TEXT[cr.status],
                  }))}
                />
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="选择车辆 *" error={errors.vehicleId}>
            <select
              className="form-input"
              value={form.vehicleId}
              onChange={(e) => setForm({ ...form, vehicleId: e.target.value })}
            >
              {vehicles.map((v) => (
                <option key={v.id} value={v.id} disabled={v.status !== 'available'}>
                  {v.plateNumber} - {v.model}
                  {v.status !== 'available' ? `（${v.status === 'maintenance' ? '维修中' : '已停用'}）` : ''}
                </option>
              ))}
            </select>
            {form.vehicleId && (
              <div className="mt-2 p-3 rounded-xl bg-slate-50 border border-slate-100">
                {(() => {
                  const v = vehicles.find((x) => x.id === form.vehicleId)
                  if (!v) return null
                  return (
                    <div className="flex items-center gap-3">
                      <img
                        src={v.photo}
                        alt=""
                        className="w-16 h-12 rounded-lg object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-slate-500">当前油量</div>
                        <FuelBar value={v.currentFuel} size="sm" />
                      </div>
                    </div>
                  )
                })()}
              </div>
            )}
          </Field>
          <Field label="申请部门 *" error={errors.department}>
            <select
              className="form-input"
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
            >
              {(DEPARTMENTS as readonly string[]).map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </Field>

          <Field label="开始时间 *" error={errors.startTime}>
            <input
              type="datetime-local"
              className="form-input"
              value={form.startTime}
              onChange={(e) => setForm({ ...form, startTime: e.target.value })}
            />
          </Field>
          <Field label="结束时间 *" error={errors.endTime}>
            <input
              type="datetime-local"
              className="form-input"
              value={form.endTime}
              onChange={(e) => setForm({ ...form, endTime: e.target.value })}
            />
          </Field>

          <Field label="驾驶人 *" error={errors.driver}>
            <input
              className="form-input"
              value={form.driver}
              onChange={(e) => setForm({ ...form, driver: e.target.value })}
            />
          </Field>
          <Field label="申请人 *" error={errors.applicantName}>
            <input
              className="form-input"
              value={form.applicantName}
              onChange={(e) => setForm({ ...form, applicantName: e.target.value })}
            />
          </Field>

          <Field label="目的地 *" error={errors.destination}>
            <input
              className="form-input"
              placeholder="如：北京首都国际机场"
              value={form.destination}
              onChange={(e) => setForm({ ...form, destination: e.target.value })}
            />
          </Field>
          <Field label="预计里程 (km) *" error={errors.estimatedMileage}>
            <input
              type="number"
              min={1}
              className="form-input"
              value={form.estimatedMileage}
              onChange={(e) =>
                setForm({ ...form, estimatedMileage: Number(e.target.value) || 0 })
              }
            />
          </Field>

          <div className="md:col-span-2">
            <Field label="用车用途 *" error={errors.purpose}>
              <textarea
                rows={3}
                className="form-input resize-none"
                placeholder="请简要说明本次用车目的，如客户拜访、会议、机场接送等"
                value={form.purpose}
                onChange={(e) => setForm({ ...form, purpose: e.target.value })}
              />
            </Field>
          </div>
        </div>
      </Modal>

      <Modal
        open={rejectOpen}
        onClose={() => setRejectOpen(false)}
        title="驳回申请"
        width="max-w-md"
        footer={
          <div className="flex items-center justify-end gap-2">
            <button onClick={() => setRejectOpen(false)} className="btn-secondary">
              取消
            </button>
            <button onClick={handleReject} className="btn-danger">
              确认驳回
            </button>
          </div>
        }
      >
        {rejectTarget && (
          <div className="space-y-4">
            <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 text-sm">
              <div className="font-medium text-slate-800">
                {rejectTarget.department} · {rejectTarget.driver}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {(() => {
                  const rv = vehicles.find((x) => x.id === rejectTarget.vehicleId)
                  return rv?.plateNumber
                })()}{' '}
                {formatTime(rejectTarget.startTime)} ~{' '}
                {formatTime(rejectTarget.endTime)}
              </div>
              <div className="text-xs text-slate-600 mt-2">{rejectTarget.purpose}</div>
            </div>
            <div className="form-group">
              <label className="form-label">驳回原因 *</label>
              <textarea
                rows={3}
                className="form-input resize-none"
                placeholder="请填写驳回原因，告知申请人..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={blockOpen}
        onClose={() => setBlockOpen(false)}
        title={blockInfo?.title ?? '时间冲突'}
        width="max-w-lg"
        footer={
          <div className="flex items-center justify-end">
            <button onClick={() => setBlockOpen(false)} className="btn-primary">
              我知道了
            </button>
          </div>
        }
      >
        {blockInfo && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 flex gap-3 animate-fade-in">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-red-100 text-red-600 shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-red-700">无法{blockInfo.action}</div>
                <div className="text-sm text-red-600 mt-1">
                  该车辆在对应时段已被其他申请占用，无法执行本次操作
                </div>
              </div>
            </div>
            <ConflictDetailList rows={blockInfo.conflict} />
          </div>
        )}
      </Modal>

      <Modal
        open={conflictPeekOpen}
        onClose={() => setConflictPeekOpen(false)}
        title={conflictPeekData ? `${conflictPeekData.plateNumber} 同车冲突` : '同车冲突'}
        width="max-w-lg"
        footer={
          <div className="flex items-center justify-end">
            <button onClick={() => setConflictPeekOpen(false)} className="btn-primary">
              关闭
            </button>
          </div>
        }
      >
        {conflictPeekData && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 flex gap-3 animate-fade-in">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-amber-100 text-amber-600 shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-amber-700">
                  {conflictPeekData.plateNumber} 存在 {conflictPeekData.rows.length} 条同车冲突
                </div>
                <div className="text-sm text-amber-600 mt-1">
                  以下申请与当前单子的用车时段存在重叠
                </div>
              </div>
            </div>
            <ConflictDetailList rows={conflictPeekData.rows} />
          </div>
        )}
      </Modal>
    </div>
  )
}

type Err = Partial<Record<keyof RequestForm, string>>

function ConflictDetailList({
  rows,
}: {
  rows: { department: string; driver: string; startTime: string; endTime: string; status: string }[]
}) {
  return (
    <div className="space-y-2">
      <div className="text-xs font-semibold text-slate-600 flex items-center gap-1">
        <Users size={12} /> 已占用详情
      </div>
      {rows.map((row, idx) => (
        <div
          key={idx}
          className="rounded-xl bg-white border border-slate-200 p-3.5 text-sm shadow-sm"
        >
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary-50 text-primary-700 text-xs font-semibold">
                <Users size={11} /> {row.department}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium">
                <KeyRound size={11} /> 驾驶人 {row.driver}
              </span>
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-medium text-slate-600">
              <Clock size={11} /> {row.status}
            </span>
          </div>
          <div className="mt-2.5 flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
            <CalendarClock size={12} className="text-slate-400 shrink-0" />
            <span className="font-mono">
              {formatDateTime(row.startTime)}
            </span>
            <span className="text-slate-300">—</span>
            <span className="font-mono">
              {formatDateTime(row.endTime)}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

function Field({
  label, error, children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      {children}
      {error && <div className="text-xs text-red-500 mt-1">{error}</div>}
    </div>
  )
}
