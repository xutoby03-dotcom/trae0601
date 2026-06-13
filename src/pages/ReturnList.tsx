import { useMemo, useState } from 'react'
import {
  Undo2,
  KeyRound,
  MapPin,
  AlertTriangle,
  Camera,
  Fuel,
  Clock,
  AlertOctagon,
} from 'lucide-react'
import { useStore } from '@/store'
import Modal from '@/components/Modal'
import FuelBar from '@/components/FuelBar'
import { StatusBadge } from '@/components/StatusBadges'
import { formatDateTime, isOverdue, overdueDuration } from '@/utils/date'
import type { Request } from '@/types'

interface ReturnForm {
  actualMileage: number
  fuelLevel: number
  violations: string
  parkingPhoto: string
}

export default function ReturnList() {
  const requests = useStore((s) => s.requests)
  const vehicles = useStore((s) => s.vehicles)
  const returns = useStore((s) => s.returns)
  const addReturn = useStore((s) => s.addReturn)
  const getVehicleById = useStore((s) => s.getVehicleById)
  const currentUser = useStore((s) => s.currentUser)

  const [modalOpen, setModalOpen] = useState(false)
  const [target, setTarget] = useState<Request | null>(null)
  const [form, setForm] = useState<ReturnForm>({
    actualMileage: 0,
    fuelLevel: 80,
    violations: '无异常',
    parkingPhoto: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=car%20parked%20in%20designated%20underground%20parking%20spot%20rear%20view%20clean%20daylight&image_size=landscape_4_3',
  })
  const [errors, setErrors] = useState<Partial<Record<keyof ReturnForm, string>>>({})

  const inUseRequests = useMemo(
    () => requests.filter((r) => r.status === 'in_use'),
    [requests],
  )

  const overdueList = useMemo(
    () => inUseRequests.filter((r) => isOverdue(r)),
    [inUseRequests],
  )

  function openReturn(r: Request) {
    const v = getVehicleById(r.vehicleId)
    setTarget(r)
    setForm({
      actualMileage: v ? v.currentMileage + r.estimatedMileage : 0,
      fuelLevel: v?.currentFuel ?? 80,
      violations: '无异常',
      parkingPhoto: form.parkingPhoto,
    })
    setErrors({})
    setModalOpen(true)
  }

  function validate() {
    const e: Partial<Record<keyof ReturnForm, string>> = {}
    if (form.actualMileage <= 0) e.actualMileage = '请填写实际里程'
    if (target) {
      const v = getVehicleById(target.vehicleId)
      if (v && form.actualMileage < v.currentMileage) {
        e.actualMileage = `实际里程不能低于当前里程（${v.currentMileage}km）`
      }
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSubmit() {
    if (!target) return
    if (!validate()) return
    addReturn({
      requestId: target.id,
      actualMileage: form.actualMileage,
      fuelLevel: form.fuelLevel,
      violations: form.violations,
      parkingPhoto: form.parkingPhoto,
      returnedBy: currentUser.name,
    })
    setModalOpen(false)
    setTarget(null)
  }

  const recentlyReturned = useMemo(() => {
    return returns.slice(0, 5).map((ret) => {
      const req = requests.find((r) => r.id === ret.requestId)
      const v = req ? vehicles.find((x) => x.id === req.vehicleId) : undefined
      return { ret, req, v }
    })
  }, [returns, requests, vehicles])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">归还登记</h1>
          <p className="text-sm text-slate-500 mt-1">
            登记车辆归还信息，核实里程、油量与异常情况，附停车照片留档
          </p>
        </div>
        <div className="flex items-center gap-3">
          {overdueList.length > 0 && (
            <StatusBadge tone="danger">
              <AlertOctagon size={12} />
              {overdueList.length} 辆车逾期未还
            </StatusBadge>
          )}
        </div>
      </div>

      {overdueList.length > 0 && (
        <div className="rounded-2xl overflow-hidden border border-red-200 animate-slide-up">
          <div className="bg-gradient-to-r from-red-500 to-accent-500 px-5 py-3 text-white">
            <div className="flex items-center gap-2 font-semibold">
              <AlertTriangle size={18} />
              以下车辆已超过预计归还时间，请尽快联系驾驶人确认归还
            </div>
          </div>
          <div className="bg-red-50 p-4 space-y-2">
            {overdueList.map((r) => {
              const v = vehicles.find((x) => x.id === r.vehicleId)
              return (
                <div
                  key={r.id}
                  className="flex items-center justify-between gap-4 bg-white rounded-xl p-4 border border-red-100"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={v?.photo}
                      alt=""
                      className="w-20 h-14 rounded-lg object-cover shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="font-mono font-semibold text-slate-800">
                          {v?.plateNumber}
                        </div>
                        <StatusBadge tone="danger">
                          已逾期 {overdueDuration(r)}
                        </StatusBadge>
                      </div>
                      <div className="text-sm text-slate-600 mt-1">
                        驾驶人 {r.driver} · 目的地 {r.destination}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        预计归还 {formatDateTime(r.endTime)}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => openReturn(r)}
                    className="btn-accent shrink-0"
                  >
                    <Undo2 size={16} />
                    立即归还
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <div className="xl:col-span-3 space-y-4">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">待归还车辆</h2>
                <p className="text-xs text-slate-500 mt-1">
                  共 {inUseRequests.length} 辆使用中
                </p>
              </div>
            </div>
            <div className="space-y-3">
              {inUseRequests.map((r) => {
                const v = vehicles.find((x) => x.id === r.vehicleId)
                const overdue = isOverdue(r)
                return (
                  <div
                    key={r.id}
                    className={`rounded-2xl p-4 border transition-colors ${
                      overdue
                        ? 'bg-red-50 border-red-200'
                        : 'bg-slate-50/50 border-slate-100 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="relative shrink-0">
                        <img
                          src={v?.photo}
                          alt=""
                          className="w-28 h-20 rounded-xl object-cover"
                        />
                        {overdue && (
                          <div className="absolute -top-1.5 -right-1.5">
                            <div className="w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg">
                              <AlertTriangle size={11} />
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                          <div>
                            <div className="flex items-center gap-2">
                              <div className="font-mono font-semibold text-slate-900 text-lg">
                                {v?.plateNumber}
                              </div>
                              <div className="text-xs text-slate-500">{v?.model}</div>
                            </div>
                            <div className="text-sm text-slate-700 mt-0.5">
                              驾驶人：{r.driver} · {r.department}
                            </div>
                          </div>
                          <button
                            onClick={() => openReturn(r)}
                            className="btn-primary"
                          >
                            <Undo2 size={16} />
                            登记归还
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Clock size={14} className="text-slate-400 shrink-0" />
                            <div className="min-w-0">
                              <div className="text-xs text-slate-500">使用时段</div>
                              <div className="text-slate-700 truncate">
                                {formatDateTime(r.startTime)}
                              </div>
                              <div className="text-slate-500 text-xs">
                                ~ {formatDateTime(r.endTime)}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin size={14} className="text-slate-400 shrink-0" />
                            <div className="min-w-0">
                              <div className="text-xs text-slate-500">目的地</div>
                              <div className="text-slate-700 truncate">{r.destination}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <KeyRound size={14} className="text-slate-400 shrink-0" />
                            <div className="min-w-0">
                              <div className="text-xs text-slate-500">预计里程</div>
                              <div className="text-slate-700 font-mono">
                                {r.estimatedMileage.toLocaleString()} km
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
              {inUseRequests.length === 0 && (
                <div className="text-center py-16 text-slate-400">
                  <KeyRound size={40} className="mx-auto mb-3 opacity-40" />
                  当前无使用中的车辆
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="xl:col-span-2 space-y-4">
          <div className="card">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">最近归还记录</h2>
            <div className="space-y-3">
              {recentlyReturned.map(({ ret, req, v }) => (
                <div
                  key={ret.id}
                  className="rounded-xl p-3 border border-slate-100 bg-slate-50/50"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={v?.photo}
                      alt=""
                      className="w-14 h-10 rounded-lg object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="font-mono font-semibold text-slate-800 text-sm">
                          {v?.plateNumber}
                        </div>
                        <StatusBadge tone="success">已归还</StatusBadge>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5 truncate">
                        {req?.driver} · {formatDateTime(ret.returnedAt)}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs">
                        <span className="font-mono text-slate-600">
                          {ret.actualMileage.toLocaleString()}km
                        </span>
                        <FuelBar value={ret.fuelLevel} showLabel={false} size="sm" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {recentlyReturned.length === 0 && (
                <div className="text-center py-8 text-slate-400 text-sm">
                  暂无归还记录
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="登记车辆归还"
        width="max-w-3xl"
        footer={
          <div className="flex items-center justify-end gap-2">
            <button onClick={() => setModalOpen(false)} className="btn-secondary">
              取消
            </button>
            <button onClick={handleSubmit} className="btn-primary">
              确认归还
            </button>
          </div>
        }
      >
        {target && (
          <div className="space-y-5">
            <div className="rounded-2xl p-4 bg-gradient-to-br from-primary-50 to-white border border-primary-100">
              <div className="flex items-center gap-4">
                {(() => {
                  const v = getVehicleById(target.vehicleId)
                  return (
                    <>
                      <img
                        src={v?.photo}
                        alt=""
                        className="w-28 h-20 rounded-xl object-cover shrink-0 border border-white shadow-sm"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="font-mono font-bold text-lg text-slate-900">
                            {v?.plateNumber}
                          </div>
                          <div className="text-xs text-slate-500">{v?.model}</div>
                        </div>
                        <div className="text-sm text-slate-700 mt-1">
                          驾驶人：{target.driver} · {target.department}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          目的：{target.destination}
                        </div>
                      </div>
                    </>
                  )
                })()}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="实际里程 (km) *" error={errors.actualMileage}>
                <input
                  type="number"
                  min={1}
                  className="form-input"
                  value={form.actualMileage}
                  onChange={(e) =>
                    setForm({ ...form, actualMileage: Number(e.target.value) || 0 })
                  }
                />
                {target && (() => {
                  const v = getVehicleById(target.vehicleId)
                  if (!v) return null
                  const diff = form.actualMileage - v.currentMileage
                  return (
                    <div className="text-xs text-slate-500 mt-1">
                      车辆登记里程 {v.currentMileage.toLocaleString()} km · 本次行驶{' '}
                      <span className="font-semibold text-primary-600">
                        {diff > 0 ? diff.toLocaleString() : 0} km
                      </span>
                      {target.estimatedMileage > 0 && (
                        <span className="text-slate-400">
                          {' '}
                          （预计 {target.estimatedMileage.toLocaleString()} km）
                        </span>
                      )}
                    </div>
                  )
                })()}
              </Field>
              <div className="form-group">
                <label className="form-label">
                  <Fuel size={14} className="inline mr-1" /> 归还油量：{form.fuelLevel}%
                </label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={form.fuelLevel}
                  onChange={(e) =>
                    setForm({ ...form, fuelLevel: Number(e.target.value) })
                  }
                  className="w-full accent-primary-600"
                />
                <FuelBar value={form.fuelLevel} showLabel={false} />
                {target && (() => {
                  const v = getVehicleById(target.vehicleId)
                  if (!v) return null
                  const diff = form.fuelLevel - v.currentFuel
                  return (
                    <div className="text-xs text-slate-500 mt-1">
                      出车时 {v.currentFuel}% · 变化{' '}
                      <span
                        className={`font-semibold ${diff >= 0 ? 'text-emerald-600' : 'text-accent-600'}`}
                      >
                        {diff >= 0 ? '+' : ''}
                        {diff}%
                      </span>
                      {diff < -10 && <span className="text-red-500 ml-1">（偏低，请提醒加油）</span>}
                    </div>
                  )
                })()}
              </div>
              <div className="md:col-span-2">
                <Field label="违章 / 异常情况">
                  <textarea
                    rows={3}
                    className="form-input resize-none"
                    placeholder="如有违章、刮擦、故障等情况请在此说明，填写'无异常'表示车况正常"
                    value={form.violations}
                    onChange={(e) => setForm({ ...form, violations: e.target.value })}
                  />
                </Field>
              </div>
              <div className="md:col-span-2">
                <Field label="停车照片 URL" error={errors.parkingPhoto}>
                  <input
                    className="form-input"
                    value={form.parkingPhoto}
                    onChange={(e) => setForm({ ...form, parkingPhoto: e.target.value })}
                  />
                </Field>
              </div>
              <div className="md:col-span-2">
                <div className="rounded-2xl overflow-hidden border border-slate-200 h-56 bg-slate-50 relative">
                  <img
                    src={form.parkingPhoto}
                    alt="停车照片预览"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-xl text-xs text-slate-600 shadow-sm">
                    <Camera size={13} /> 停车位置照片
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
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
