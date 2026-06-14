import { useState, useMemo } from 'react'
import { RotateCcw, Trash2, AlertTriangle, CheckCircle } from 'lucide-react'
import { useStore } from '@/store'
import type { ReturnRecord } from '@/types'
import { DISPOSE_REASONS, DISPOSAL_METHODS } from '@/types'
import { cn } from '@/lib/utils'

const nowLocal = () => {
  const d = new Date()
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 16)
}

type TabKey = 'return' | 'dispose'

const tabConfig: { key: TabKey; label: string; icon: typeof RotateCcw }[] = [
  { key: 'return', label: '归还登记', icon: RotateCcw },
  { key: 'dispose', label: '废弃登记', icon: Trash2 },
]

export default function Return() {
  const { checkouts, samples, addReturn } = useStore()

  const confirmedCheckouts = useMemo(
    () => checkouts.filter((c) => c.status === 'confirmed'),
    [checkouts],
  )

  const getSample = (sampleId: string) => samples.find((s) => s.id === sampleId)

  const [activeTab, setActiveTab] = useState<TabKey>('return')
  const [successMsg, setSuccessMsg] = useState('')

  const [selectedCheckoutId, setSelectedCheckoutId] = useState('')
  const [remainingQuantity, setRemainingQuantity] = useState(0)
  const [contaminated, setContaminated] = useState(false)
  const [contaminationDesc, setContaminationDesc] = useState('')
  const [returnPerson, setReturnPerson] = useState('')
  const [returnTime, setReturnTime] = useState(nowLocal)
  const [disposeReason, setDisposeReason] = useState<string>(DISPOSE_REASONS[0])
  const [disposalMethod, setDisposalMethod] = useState<string>(DISPOSAL_METHODS[0].value)

  const selectedCheckout = confirmedCheckouts.find((c) => c.id === selectedCheckoutId)

  const resetForm = () => {
    setSelectedCheckoutId('')
    setRemainingQuantity(0)
    setContaminated(false)
    setContaminationDesc('')
    setReturnPerson('')
    setReturnTime(nowLocal())
    setDisposeReason(DISPOSE_REASONS[0])
    setDisposalMethod(DISPOSAL_METHODS[0].value)
  }

  const handleSubmit = () => {
    if (!selectedCheckout) return
    if (!returnPerson.trim()) return

    const sample = getSample(selectedCheckout.sampleId)
    if (!sample) return

    addReturn({
      checkoutId: selectedCheckout.id,
      sampleId: selectedCheckout.sampleId,
      type: activeTab,
      remainingQuantity,
      contaminated,
      contaminationDesc,
      disposalMethod: disposalMethod as ReturnRecord['disposalMethod'],
      returnPerson: returnPerson.trim(),
      returnTime: new Date(returnTime).toISOString(),
      reason: activeTab === 'dispose' ? disposeReason : '',
    })

    setSuccessMsg(activeTab === 'return' ? '归还登记成功' : '废弃登记成功')
    setTimeout(() => setSuccessMsg(''), 3000)
    resetForm()
  }

  const isSubmitDisabled =
    !selectedCheckoutId || !returnPerson.trim() || (contaminated && !contaminationDesc.trim())

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">归还 / 废弃登记</h1>

      <div className="mb-6 flex gap-1 rounded-lg bg-gray-100 p-1">
        {tabConfig.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => {
              setActiveTab(key)
              resetForm()
              setSuccessMsg('')
            }}
            className={cn(
              'flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-all',
              activeTab === key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700',
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {successMsg && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-green-50 p-3 text-green-700">
          <CheckCircle className="h-5 w-5" />
          <span className="text-sm font-medium">{successMsg}</span>
        </div>
      )}

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="mb-5">
          <label className="mb-1.5 block text-sm font-medium text-gray-700">选择领用记录</label>
          <select
            value={selectedCheckoutId}
            onChange={(e) => {
              setSelectedCheckoutId(e.target.value)
              const co = confirmedCheckouts.find((c) => c.id === e.target.value)
              if (co) setRemainingQuantity(co.quantity)
            }}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">-- 请选择 --</option>
            {confirmedCheckouts.map((co) => {
              const s = getSample(co.sampleId)
              return (
                <option key={co.id} value={co.id}>
                  {s?.code ?? '未知'} - {co.studentName} - 领用{co.quantity}份
                </option>
              )
            })}
          </select>
        </div>

        {selectedCheckout && (
          <div className="mb-5 rounded-md bg-gray-50 p-4">
            <h3 className="mb-2 text-sm font-medium text-gray-700">领用信息</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-500">样本编号：</span>
                <span className="font-medium">{getSample(selectedCheckout.sampleId)?.code ?? '未知'}</span>
              </div>
              <div>
                <span className="text-gray-500">领用人：</span>
                <span className="font-medium">{selectedCheckout.studentName}</span>
              </div>
              <div>
                <span className="text-gray-500">领用数量：</span>
                <span className="font-medium">{selectedCheckout.quantity}</span>
              </div>
              <div>
                <span className="text-gray-500">领用时间：</span>
                <span className="font-medium">
                  {new Date(selectedCheckout.checkoutTime).toLocaleString('zh-CN')}
                </span>
              </div>
            </div>
          </div>
        )}

        {selectedCheckout && (
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">剩余量</label>
              <input
                type="number"
                min={0}
                max={selectedCheckout.quantity}
                value={remainingQuantity}
                onChange={(e) => setRemainingQuantity(Number(e.target.value))}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                id="contaminated"
                type="checkbox"
                checked={contaminated}
                onChange={(e) => setContaminated(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="contaminated" className="flex items-center gap-1 text-sm font-medium text-gray-700">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                是否污染
              </label>
            </div>

            {contaminated && (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">污染情况描述</label>
                <textarea
                  value={contaminationDesc}
                  onChange={(e) => setContaminationDesc(e.target.value)}
                  rows={3}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            )}

            {activeTab === 'dispose' && (
              <>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">废弃原因</label>
                  <select
                    value={disposeReason}
                    onChange={(e) => setDisposeReason(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {DISPOSE_REASONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">处理方式</label>
                  <select
                    value={disposalMethod}
                    onChange={(e) => setDisposalMethod(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {DISPOSAL_METHODS.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                {activeTab === 'return' ? '归还人' : '回收人'}
              </label>
              <input
                type="text"
                value={returnPerson}
                onChange={(e) => setReturnPerson(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                {activeTab === 'return' ? '归还时间' : '回收时间'}
              </label>
              <input
                type="datetime-local"
                value={returnTime}
                onChange={(e) => setReturnTime(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={isSubmitDisabled}
              className={cn(
                'mt-2 w-full rounded-md px-4 py-2.5 text-sm font-medium text-white transition-colors',
                activeTab === 'return'
                  ? 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300'
                  : 'bg-red-600 hover:bg-red-700 disabled:bg-red-300',
              )}
            >
              {activeTab === 'return' ? '确认归还' : '确认废弃'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
