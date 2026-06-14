import { useState, useMemo } from 'react'
import { useStore } from '@/store'
import { cn } from '@/lib/utils'
import { ClipboardList, Search, AlertTriangle, Check, X, Calendar, User } from 'lucide-react'
import type { Sample, CheckoutRecord } from '@/types'

type TabKey = 'register' | 'records'

const STATUS_BADGES: Record<CheckoutRecord['status'], { label: string; className: string }> = {
  pending: { label: '待确认', className: 'bg-amber-100 text-amber-800' },
  confirmed: { label: '已确认', className: 'bg-green-100 text-green-800' },
  rejected: { label: '已拒绝', className: 'bg-red-100 text-red-800' },
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
              ? 'border-blue-600 text-blue-600'
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
  const [teacherConfirmed, setTeacherConfirmed] = useState(false)
  const [teacherName, setTeacherName] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

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
    !quantityExceeded &&
    (!isHighHazard || teacherConfirmed)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSample || !canSubmit) return

    let status: CheckoutRecord['status'] = 'confirmed'
    if (isHighHazard && !teacherConfirmed) {
      status = 'pending'
    }

    const result = addCheckout({
      sampleId: selectedSample.id,
      className: className.trim(),
      labBench: labBench.trim(),
      studentName: studentName.trim(),
      quantity,
      checkoutTime: new Date(checkoutTime).toISOString(),
      teacherConfirmed: isHighHazard ? teacherConfirmed : false,
      teacherName: isHighHazard && teacherConfirmed ? teacherName.trim() : '',
      status,
    })

    if (result) {
      setSuccessMsg('领用登记成功！')
      setSelectedSampleId('')
      setSearchTerm('')
      setClassName('')
      setLabBench('')
      setStudentName('')
      setQuantity(1)
      setCheckoutTime(toLocalDatetimeString(new Date()))
      setTeacherConfirmed(false)
      setTeacherName('')
      setTimeout(() => setSuccessMsg(''), 3000)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <TabBar active="register" onChange={(t) => t === 'records' && onSwitchToRecords()} />

      {successMsg && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-800 rounded-lg flex items-center gap-2">
          <Check className="w-4 h-4" />
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
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          该样本为高危险等级，需教师确认方可出库
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
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <select
            value={selectedSampleId}
            onChange={(e) => {
              setSelectedSampleId(e.target.value)
              setQuantity(1)
              setTeacherConfirmed(false)
              setTeacherName('')
            }}
            className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">请选择样本</option>
            {filteredSamples.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code} - {s.type}（库存: {s.remainingQuantity}）
              </option>
            ))}
          </select>
          {selectedSample && (
            <p className="mt-1 text-xs text-gray-500">
              危险等级: {selectedSample.hazardLevel} | 库存: {selectedSample.remainingQuantity} | 状态:{' '}
              {selectedSample.status}
            </p>
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">实验台号</label>
            <input
              type="text"
              value={labBench}
              onChange={(e) => setLabBench(e.target.value)}
              placeholder="请输入实验台号"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                'w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {isHighHazard && !isExpired && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={teacherConfirmed}
                onChange={(e) => {
                  setTeacherConfirmed(e.target.checked)
                  if (!e.target.checked) setTeacherName('')
                }}
                className="w-4 h-4 text-amber-600 border-amber-300 rounded focus:ring-amber-500"
              />
              <span className="text-sm font-medium text-amber-900">教师确认</span>
            </label>
            {teacherConfirmed && (
              <div>
                <label className="block text-sm font-medium text-amber-800 mb-1">确认教师姓名</label>
                <input
                  type="text"
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  placeholder="请输入确认教师姓名"
                  className="w-full px-3 py-2 border border-amber-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white"
                />
              </div>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          className={cn(
            'w-full py-2.5 px-4 rounded-lg text-sm font-medium transition-colors',
            canSubmit
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          )}
        >
          提交领用
        </button>
      </form>
    </div>
  )
}

interface RecordsTabProps {
  samples: Sample[]
  checkouts: CheckoutRecord[]
  confirmCheckout: (id: string, teacherName: string) => void
  rejectCheckout: (id: string) => void
  onSwitchToRegister: () => void
}

function RecordsTab({ samples, checkouts, confirmCheckout, rejectCheckout, onSwitchToRegister }: RecordsTabProps) {
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [confirmTeacherName, setConfirmTeacherName] = useState<Record<string, string>>({})

  const sampleMap = useMemo(() => {
    const m = new Map<string, Sample>()
    for (const s of samples) m.set(s.id, s)
    return m
  }, [samples])

  const filteredCheckouts = useMemo(() => {
    if (statusFilter === 'all') return checkouts
    return checkouts.filter((c) => c.status === statusFilter)
  }, [checkouts, statusFilter])

  const handleConfirm = (id: string) => {
    const name = confirmTeacherName[id]?.trim()
    if (!name) return
    confirmCheckout(id, name)
    setConfirmTeacherName((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }

  return (
    <div>
      <TabBar active="records" onChange={(t) => t === 'register' && onSwitchToRegister()} />

      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-700">共 {filteredCheckouts.length} 条记录</h3>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">全部状态</option>
          <option value="pending">待确认</option>
          <option value="confirmed">已确认</option>
          <option value="rejected">已拒绝</option>
          <option value="returned">已归还</option>
          <option value="disposed">已废弃</option>
        </select>
      </div>

      <div className="space-y-3">
        {filteredCheckouts.map((c) => {
          const sample = sampleMap.get(c.sampleId)
          const badge = STATUS_BADGES[c.status]
          const isPendingHighHazard =
            c.status === 'pending' && (sample?.hazardLevel ?? 0) >= 4

          return (
            <div
              key={c.id}
              className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-semibold text-gray-900">
                      {sample?.code ?? '未知样本'}
                    </span>
                    <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', badge.className)}>
                      {badge.label}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-0.5">
                    <p>班级: {c.className} | 实验台号: {c.labBench}</p>
                    <p>领用学生: {c.studentName} | 数量: {c.quantity}</p>
                    <p>领取时间: {formatDateTime(c.checkoutTime)}</p>
                    {c.teacherConfirmed && c.teacherName && (
                      <p>确认教师: {c.teacherName}</p>
                    )}
                  </div>
                </div>

                {isPendingHighHazard && (
                  <div className="flex flex-col items-end gap-2 ml-4">
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
                        className="px-2 py-1 border border-gray-300 rounded text-xs w-24 focus:ring-1 focus:ring-blue-500"
                      />
                      <button
                        onClick={() => handleConfirm(c.id)}
                        disabled={!confirmTeacherName[c.id]?.trim()}
                        className={cn(
                          'flex items-center gap-1 px-3 py-1 rounded text-xs font-medium transition-colors',
                          confirmTeacherName[c.id]?.trim()
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        )}
                      >
                        <Check className="w-3 h-3" />
                        确认
                      </button>
                      <button
                        onClick={() => rejectCheckout(c.id)}
                        className="flex items-center gap-1 px-3 py-1 rounded text-xs font-medium bg-red-600 text-white hover:bg-red-700 transition-colors"
                      >
                        <X className="w-3 h-3" />
                        拒绝
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
