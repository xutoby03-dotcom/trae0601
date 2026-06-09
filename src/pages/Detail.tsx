import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, AlertTriangle, User, Ruler, Clock, MapPin, Check, X } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { STATUS_LABELS, RESERVATION_STATUS_LABELS } from '@/types'
import type { Reservation, Handover } from '@/types'

export default function Detail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const {
    currentUser,
    uniforms,
    addReservation,
    updateReservation,
    updateUniform,
    addHandover,
    updateHandover,
    getReservationsByUniform,
    getHandoverByReservation,
    getUserById,
  } = useStore()

  const uniform = uniforms.find((u) => u.id === id)
  const isPublisher = uniform?.publisherId === currentUser.id
  const reservations = uniform ? getReservationsByUniform(uniform.id) : []

  const [childHeight, setChildHeight] = useState('')
  const [childWeight, setChildWeight] = useState('')
  const [message, setMessage] = useState('')

  const [confirmingId, setConfirmingId] = useState<string | null>(null)
  const [handoverLocation, setHandoverLocation] = useState('')
  const [handoverDatetime, setHandoverDatetime] = useState('')

  if (!uniform) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-gray-400 text-lg">未找到该校服</p>
        <button onClick={() => navigate(-1)} className="btn-outline text-sm">
          返回
        </button>
      </div>
    )
  }

  const publisher = getUserById(uniform.publisherId)

  const handleReserve = () => {
    if (!childHeight || !childWeight) return
    const reservation: Reservation = {
      id: `r${Date.now()}`,
      uniformId: uniform.id,
      userId: currentUser.id,
      childHeight,
      childWeight,
      message,
      status: 'pending',
      createdAt: new Date().toISOString(),
    }
    addReservation(reservation)
    updateUniform(uniform.id, { status: 'reserved' })
    setChildHeight('')
    setChildWeight('')
    setMessage('')
  }

  const handleConfirm = (reservationId: string) => {
    if (!handoverLocation || !handoverDatetime) return
    updateReservation(reservationId, { status: 'confirmed' })
    const handover: Handover = {
      id: `h${Date.now()}`,
      reservationId,
      location: handoverLocation,
      datetime: new Date(handoverDatetime).toISOString(),
      completed: false,
      noShow: false,
      completedAt: '',
    }
    addHandover(handover)
    updateUniform(uniform.id, { status: 'pending_handover' })
    setConfirmingId(null)
    setHandoverLocation('')
    setHandoverDatetime('')
  }

  const handleReject = (reservationId: string) => {
    updateReservation(reservationId, { status: 'rejected' })
  }

  const handleComplete = (reservationId: string) => {
    const handover = getHandoverByReservation(reservationId)
    if (handover) {
      updateHandover(handover.id, { completed: true, completedAt: new Date().toISOString() })
    }
    updateReservation(reservationId, { status: 'completed' })
    updateUniform(uniform.id, { status: 'completed' })
  }

  const handleNoShow = (reservationId: string) => {
    const handover = getHandoverByReservation(reservationId)
    if (handover) {
      updateHandover(handover.id, { noShow: true })
    }
    updateReservation(reservationId, { status: 'no_show' })
    updateUniform(uniform.id, { status: 'available' })
  }

  const statusColorMap: Record<string, string> = {
    available: 'bg-emerald-100 text-emerald-600',
    reserved: 'bg-sky-100 text-sky-600',
    pending_handover: 'bg-amber-100 text-amber-600',
    completed: 'bg-gray-100 text-gray-500',
  }

  const reservationStatusColorMap: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-600',
    confirmed: 'bg-sky-100 text-sky-600',
    rejected: 'bg-red-100 text-red-600',
    completed: 'bg-emerald-100 text-emerald-600',
    no_show: 'bg-gray-100 text-gray-500',
  }

  return (
    <div className="max-w-2xl mx-auto px-4 pt-4 pb-24 animate-slide-up">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-orange-500 font-semibold mb-4 hover:text-orange-600 transition-colors"
      >
        <ArrowLeft size={20} />
        <span>返回</span>
      </button>

      {uniform.photos.length > 0 && (
        <img
          src={uniform.photos[0]}
          alt={uniform.school}
          className="w-full h-72 object-cover rounded-2xl shadow-md mb-5"
        />
      )}

      <div className="card p-5 mb-4">
        <div className="flex flex-wrap gap-2 mb-3">
          <span className="tag-orange">{uniform.size}cm</span>
          <span className="tag-blue">{uniform.season}</span>
          <span className="tag-purple">{uniform.gender}</span>
        </div>

        <h1 className="text-xl font-bold text-gray-800 mb-1">{uniform.school}</h1>
        <p className="text-gray-500 text-sm mb-3">{uniform.grade}</p>

        <div className="flex items-center gap-2 mb-2">
          <span className="text-gray-600 text-sm font-medium">成色：{uniform.condition}</span>
          {uniform.hasStain && (
            <span className="flex items-center gap-1 text-orange-500 text-sm">
              <AlertTriangle size={14} />
              {uniform.stainDesc}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between mb-3">
          <span className={`text-2xl font-bold ${uniform.isFree ? 'text-emerald-500' : 'text-orange-500'}`}>
            {uniform.isFree ? '免费赠送' : `¥${uniform.price}`}
          </span>
          <span className={`tag ${statusColorMap[uniform.status] ?? 'bg-gray-100 text-gray-500'}`}>
            {STATUS_LABELS[uniform.status]}
          </span>
        </div>

        {publisher && (
          <div className="flex items-center gap-2 text-sm text-gray-500 border-t border-orange-50 pt-3">
            <User size={16} className="text-orange-400" />
            <span>发布者：{publisher.name}</span>
          </div>
        )}
      </div>

      {isPublisher && reservations.length > 0 && (
        <div className="card p-5 mb-4">
          <h2 className="text-lg font-bold text-gray-800 mb-3">预约列表</h2>
          <div className="space-y-3">
            {reservations.map((res) => {
              const resUser = getUserById(res.userId)
              const handover = getHandoverByReservation(res.id)
              const isConfirming = confirmingId === res.id

              return (
                <div key={res.id} className="p-3 rounded-xl bg-orange-50/60 border border-orange-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-700">{resUser?.name ?? '未知用户'}</span>
                    <span className={`tag ${reservationStatusColorMap[res.status] ?? ''}`}>
                      {RESERVATION_STATUS_LABELS[res.status]}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-500 mb-1">
                    <span className="flex items-center gap-1">
                      <Ruler size={13} /> {res.childHeight}
                    </span>
                    <span>{res.childWeight}</span>
                  </div>
                  {res.message && (
                    <p className="text-sm text-gray-500 mb-2">留言：{res.message}</p>
                  )}

                  {res.status === 'pending' && !isConfirming && (
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => setConfirmingId(res.id)}
                        className="btn-primary text-xs py-1.5 px-4"
                      >
                        确认
                      </button>
                      <button
                        onClick={() => handleReject(res.id)}
                        className="btn-outline text-xs py-1.5 px-4"
                      >
                        拒绝
                      </button>
                    </div>
                  )}

                  {res.status === 'pending' && isConfirming && (
                    <div className="mt-3 space-y-2 p-3 bg-white rounded-xl border border-orange-200">
                      <input
                        type="text"
                        placeholder="交接地点"
                        value={handoverLocation}
                        onChange={(e) => setHandoverLocation(e.target.value)}
                        className="input-field text-sm"
                      />
                      <input
                        type="datetime-local"
                        value={handoverDatetime}
                        onChange={(e) => setHandoverDatetime(e.target.value)}
                        className="input-field text-sm"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleConfirm(res.id)}
                          className="btn-primary text-xs py-1.5 px-4"
                        >
                          确认交接
                        </button>
                        <button
                          onClick={() => setConfirmingId(null)}
                          className="btn-outline text-xs py-1.5 px-4"
                        >
                          取消
                        </button>
                      </div>
                    </div>
                  )}

                  {res.status === 'confirmed' && (
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleComplete(res.id)}
                        className="btn-secondary text-xs py-1.5 px-4 flex items-center gap-1"
                      >
                        <Check size={13} /> 完成交接
                      </button>
                      <button
                        onClick={() => handleNoShow(res.id)}
                        className="btn-outline text-xs py-1.5 px-4 text-red-500 border-red-300 hover:bg-red-50 flex items-center gap-1"
                      >
                        <X size={13} /> 标记爽约
                      </button>
                    </div>
                  )}

                  {handover && res.status === 'confirmed' && (
                    <div className="mt-2 text-xs text-gray-500 flex flex-col gap-1">
                      <span className="flex items-center gap-1">
                        <MapPin size={12} className="text-orange-400" /> {handover.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} className="text-orange-400" />{' '}
                        {new Date(handover.datetime).toLocaleString('zh-CN')}
                      </span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {!isPublisher && uniform.status === 'available' && (
        <div className="card p-5 mb-4">
          <h2 className="text-lg font-bold text-gray-800 mb-3">预约领取</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-600 mb-1 block">孩子身高</label>
              <input
                type="text"
                placeholder="例如：130cm"
                value={childHeight}
                onChange={(e) => setChildHeight(e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">孩子体重</label>
              <input
                type="text"
                placeholder="例如：25kg"
                value={childWeight}
                onChange={(e) => setChildWeight(e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">留言</label>
              <textarea
                placeholder="给发布者留言..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="input-field min-h-[80px] resize-none"
              />
            </div>
            <button
              onClick={handleReserve}
              disabled={!childHeight || !childWeight}
              className="btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed"
            >
              预约领取
            </button>
          </div>
        </div>
      )}

      {uniform.status === 'pending_handover' && !isPublisher && (
        <div className="card p-5 mb-4">
          <h2 className="text-lg font-bold text-gray-800 mb-3">交接信息</h2>
          {(() => {
            const myReservation = reservations.find((r) => r.userId === currentUser.id)
            if (!myReservation) return <p className="text-gray-400 text-sm">暂无交接信息</p>
            const handover = getHandoverByReservation(myReservation.id)
            if (!handover) return <p className="text-gray-400 text-sm">暂无交接信息</p>
            return (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-700">
                  <MapPin size={16} className="text-orange-500" />
                  <span>{handover.location}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Clock size={16} className="text-orange-500" />
                  <span>{new Date(handover.datetime).toLocaleString('zh-CN')}</span>
                </div>
              </div>
            )
          })()}
        </div>
      )}

      {uniform.status === 'pending_handover' && isPublisher && (
        <div className="card p-5 mb-4">
          <h2 className="text-lg font-bold text-gray-800 mb-3">待交接预约</h2>
          {reservations
            .filter((r) => r.status === 'confirmed')
            .map((res) => {
              const resUser = getUserById(res.userId)
              const handover = getHandoverByReservation(res.id)
              return (
                <div key={res.id} className="p-3 rounded-xl bg-amber-50/60 border border-amber-200 mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-700">{resUser?.name ?? '未知用户'}</span>
                    <span className="tag bg-amber-100 text-amber-600">待交接</span>
                  </div>
                  {handover && (
                    <div className="text-sm text-gray-500 mb-2 space-y-1">
                      <span className="flex items-center gap-1">
                        <MapPin size={13} className="text-orange-400" /> {handover.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={13} className="text-orange-400" />{' '}
                        {new Date(handover.datetime).toLocaleString('zh-CN')}
                      </span>
                    </div>
                  )}
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleComplete(res.id)}
                      className="btn-secondary text-xs py-1.5 px-4 flex items-center gap-1"
                    >
                      <Check size={13} /> 确认完成
                    </button>
                    <button
                      onClick={() => handleNoShow(res.id)}
                      className="btn-outline text-xs py-1.5 px-4 text-red-500 border-red-300 hover:bg-red-50 flex items-center gap-1"
                    >
                      <X size={13} /> 标记爽约
                    </button>
                  </div>
                </div>
              )
            })}
        </div>
      )}
    </div>
  )
}
