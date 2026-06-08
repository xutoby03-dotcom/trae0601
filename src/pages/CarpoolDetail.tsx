import { useParams, useNavigate } from 'react-router-dom'
import { useCarpoolStore } from '@/store/useCarpoolStore'
import StatusBadge from '@/components/StatusBadge'
import SeatIndicator from '@/components/SeatIndicator'
import MessageList from '@/components/MessageList'
import CostCalculator from '@/components/CostCalculator'
import { formatFullDate } from '@/utils/time'
import { formatCurrency, calculateCostPerPerson } from '@/utils/cost'
import { ArrowLeft, MapPin, Clock, Users, Luggage, Phone, UserCheck, UserMinus, Play, XCircle, Car } from 'lucide-react'

export default function CarpoolDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const carpools = useCarpoolStore((s) => s.carpools)
  const joinCarpool = useCarpoolStore((s) => s.joinCarpool)
  const leaveCarpool = useCarpoolStore((s) => s.leaveCarpool)
  const updateStatus = useCarpoolStore((s) => s.updateStatus)
  const addMessage = useCarpoolStore((s) => s.addMessage)
  const currentUserId = useCarpoolStore((s) => s.currentUserId)

  const carpool = carpools.find((c) => c.id === id)

  if (!carpool) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-orange-50 flex items-center justify-center">
          <Car className="w-8 h-8 text-orange-300" />
        </div>
        <p className="text-slate-400">拼车不存在或已删除</p>
        <button
          onClick={() => navigate('/')}
          className="mt-3 text-sm text-orange-600 hover:text-orange-700 font-medium"
        >
          返回首页
        </button>
      </div>
    )
  }

  const isJoined = carpool.passengers.some((p) => p.id === currentUserId)
  const isPublisher = carpool.publisherId === currentUserId
  const remaining = carpool.totalSeats - carpool.passengers.length
  const canJoin = (carpool.status === 'recruiting' || carpool.status === 'full') && !isJoined && remaining > 0
  const canLeave = (carpool.status === 'recruiting' || carpool.status === 'full') && isJoined && !isPublisher
  const perPerson = calculateCostPerPerson(carpool.totalCost, Math.max(carpool.passengers.length, 1))

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center hover:border-orange-300 transition"
        >
          <ArrowLeft className="w-4 h-4 text-slate-500" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-slate-800">拼车详情</h1>
        </div>
        <StatusBadge status={carpool.status} size="md" />
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className={`h-2 ${
          carpool.status === 'recruiting' ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' :
          carpool.status === 'full' ? 'bg-gradient-to-r from-amber-400 to-amber-500' :
          carpool.status === 'departed' ? 'bg-gradient-to-r from-slate-300 to-slate-400' :
          'bg-gradient-to-r from-red-400 to-red-500'
        }`} />
        <div className="p-5 space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-1">{carpool.destination}</h2>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <MapPin className="w-4 h-4 text-orange-400" />
              <span>{carpool.departure}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-orange-50 rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                <Clock className="w-3.5 h-3.5" />
                出发时间
              </div>
              <p className="font-bold text-slate-800 text-sm">{formatFullDate(carpool.departureTime)}</p>
            </div>
            <div className="bg-orange-50 rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                <Users className="w-3.5 h-3.5" />
                发布者
              </div>
              <p className="font-bold text-slate-800 text-sm">{carpool.publisherName}</p>
            </div>
            <div className="bg-orange-50 rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                <Luggage className="w-3.5 h-3.5" />
                行李
              </div>
              <p className="font-bold text-slate-800 text-sm">{carpool.allowLuggage ? '可带行李' : '不便携带'}</p>
            </div>
            <div className="bg-orange-50 rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                <Phone className="w-3.5 h-3.5" />
                联系方式
              </div>
              <p className="font-bold text-slate-800 text-sm">{carpool.contact || '未提供'}</p>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-600">费用分摊</span>
              <span className="text-lg font-bold text-orange-600">{formatCurrency(perPerson)}/人</span>
            </div>
            <p className="text-xs text-slate-400">
              总费用 {formatCurrency(carpool.totalCost)} ÷ {carpool.passengers.length}人 = {formatCurrency(perPerson)}/人
            </p>
          </div>

          <SeatIndicator total={carpool.totalSeats} taken={carpool.passengers.length} />

          <div>
            <h4 className="text-sm font-medium text-slate-600 mb-2">乘客 ({carpool.passengers.length})</h4>
            <div className="flex flex-wrap gap-2">
              {carpool.passengers.map((p, i) => (
                <div
                  key={p.id}
                  className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-1.5"
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                    i === 0 ? 'bg-orange-500' : 'bg-slate-400'
                  }`}>
                    {p.name.charAt(0)}
                  </div>
                  <span className="text-sm text-slate-700">{p.name}</span>
                  {i === 0 && <span className="text-[10px] text-orange-500 font-medium">车主</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        {canJoin && (
          <button
            onClick={() => joinCarpool(carpool.id)}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold shadow-md shadow-emerald-200 hover:shadow-lg active:scale-[0.98] transition-all"
          >
            <UserCheck className="w-5 h-5" />
            申请加入
          </button>
        )}
        {canLeave && (
          <button
            onClick={() => leaveCarpool(carpool.id)}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 active:scale-[0.98] transition-all"
          >
            <UserMinus className="w-5 h-5" />
            取消加入
          </button>
        )}
        {isJoined && !canLeave && (
          <div className="flex-1 py-3 rounded-xl bg-orange-50 text-orange-600 font-bold text-center">
            ✓ 你已加入
          </div>
        )}
      </div>

      {isPublisher && (carpool.status === 'recruiting' || carpool.status === 'full') && (
        <div className="flex gap-3">
          <button
            onClick={() => { updateStatus(carpool.id, 'departed'); }}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-500 text-white font-medium text-sm hover:bg-emerald-600 active:scale-[0.98] transition-all"
          >
            <Play className="w-4 h-4" />
            标记已出发
          </button>
          <button
            onClick={() => { updateStatus(carpool.id, 'cancelled'); }}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-50 text-red-600 font-medium text-sm hover:bg-red-100 active:scale-[0.98] transition-all"
          >
            <XCircle className="w-4 h-4" />
            取消拼车
          </button>
        </div>
      )}

      <CostCalculator defaultCost={carpool.totalCost} defaultPeople={Math.max(carpool.passengers.length, 1)} />

      <div className="bg-white rounded-2xl border border-slate-100 p-5">
        <MessageList
          messages={carpool.messages}
          currentUserId={currentUserId}
          onSend={(content) => addMessage(carpool.id, content)}
        />
      </div>
    </div>
  )
}
