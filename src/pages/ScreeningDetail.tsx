import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Calendar, MapPin, Users, Shield, CloudRain,
  UserPlus, CheckCircle, XCircle, Clock, Baby, Trash2,
} from 'lucide-react'
import { useCinemaStore } from '@/store'
import RegistrationForm from '@/components/RegistrationForm'
import WaitlistPanel from '@/components/WaitlistPanel'
import ReschedulePanel from '@/components/ReschedulePanel'

export default function ScreeningDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [showRegForm, setShowRegForm] = useState(false)
  const [showReschedule, setShowReschedule] = useState(false)

  const screening = useCinemaStore((s) => s.screenings.find((sc) => sc.id === id))
  const getScreeningRegistrations = useCinemaStore((s) => s.getScreeningRegistrations)
  const getConfirmedCount = useCinemaStore((s) => s.getConfirmedCount)
  const getWaitlisted = useCinemaStore((s) => s.getWaitlisted)
  const getChildrenCount = useCinemaStore((s) => s.getChildrenCount)
  const cancelRegistration = useCinemaStore((s) => s.cancelRegistration)
  const checkIn = useCinemaStore((s) => s.checkIn)
  const deleteScreening = useCinemaStore((s) => s.deleteScreening)

  if (!screening) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-night-lighter text-lg">场次不存在</p>
        <button onClick={() => navigate('/')} className="btn-primary mt-4">
          返回首页
        </button>
      </div>
    )
  }

  const registrations = getScreeningRegistrations(screening.id)
  const confirmedCount = getConfirmedCount(screening.id)
  const waitlisted = getWaitlisted(screening.id)
  const childrenCount = getChildrenCount(screening.id)
  const confirmedRegs = registrations.filter((r) => r.status === 'confirmed')
  const remainingSeats = screening.seatLimit - confirmedCount

  const statusMap: Record<string, { label: string; color: string }> = {
    upcoming: { label: '即将放映', color: 'bg-green-100 text-green-700' },
    ongoing: { label: '放映中', color: 'bg-orange/10 text-orange' },
    completed: { label: '已结束', color: 'bg-night-lighter/10 text-night-lighter' },
    rained_out: { label: '因雨改期', color: 'bg-blue-100 text-blue-700' },
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-1.5 text-sm text-night-lighter hover:text-night mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        返回场次列表
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card overflow-hidden">
            <div className="relative aspect-video">
              <img
                src={screening.posterUrl}
                alt={screening.movieName}
                className="w-full h-full object-cover"
              />
              <div className="poster-overlay absolute inset-0" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusMap[screening.status].color}`}>
                    {statusMap[screening.status].label}
                  </span>
                  {screening.isRescheduled && (
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/90 text-white flex items-center gap-1">
                      <Clock className="w-3 h-3" />已改期
                    </span>
                  )}
                </div>
                <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">
                  {screening.movieName}
                </h1>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-orange" />
                  <div>
                    <p className="text-xs text-night-lighter">日期</p>
                    <p className="text-sm font-medium text-night">{screening.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-orange" />
                  <div>
                    <p className="text-xs text-night-lighter">地点</p>
                    <p className="text-sm font-medium text-night">{screening.location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-orange" />
                  <div>
                    <p className="text-xs text-night-lighter">座位</p>
                    <p className="text-sm font-medium text-night">{confirmedCount}/{screening.seatLimit}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-orange" />
                  <div>
                    <p className="text-xs text-night-lighter">年龄</p>
                    <p className="text-sm font-medium text-night">{screening.ageRating}</p>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-night-lighter/10">
                <div className="flex items-start gap-2">
                  <CloudRain className="w-4 h-4 text-blue-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-night-lighter">天气预案</p>
                    <p className="text-sm text-night">{screening.weatherPlan}</p>
                  </div>
                </div>
                {screening.isRescheduled && screening.originalDate && (
                  <p className="text-xs text-blue-500 mt-2 ml-6">
                    原定日期：{screening.originalDate}，已改至 {screening.date}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-night flex items-center gap-2">
                <Users className="w-4 h-4 text-orange" />
                报名列表
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-sm text-night-lighter">
                  已报名 {confirmedRegs.length} 人
                </span>
              </div>
            </div>

            {confirmedRegs.length > 0 ? (
              <div className="space-y-2">
                {confirmedRegs.map((reg) => (
                  <div key={reg.id} className="flex items-center gap-3 p-3 rounded-xl bg-cream/80 hover:bg-cream transition-colors">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      reg.checkedIn ? 'bg-green-100' : 'bg-night-lighter/10'
                    }`}>
                      {reg.checkedIn ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <span className="text-xs font-bold text-night-lighter">
                          {reg.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-night">{reg.name}</p>
                        {reg.checkedIn && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-green-100 text-green-600">已签到</span>
                        )}
                      </div>
                      <p className="text-xs text-night-lighter">
                        {reg.building} · {reg.peopleCount}人 · {reg.phone}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {reg.hasChildren && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-gold/10 text-gold flex items-center gap-0.5">
                          <Baby className="w-3 h-3" />
                        </span>
                      )}
                      <button
                        onClick={() => checkIn(reg.id)}
                        className={`p-1.5 rounded-lg text-xs transition-colors ${
                          reg.checkedIn
                            ? 'bg-green-100 text-green-600 hover:bg-green-200'
                            : 'bg-night-lighter/5 text-night-lighter hover:bg-night-lighter/10'
                        }`}
                        title={reg.checkedIn ? '取消签到' : '签到'}
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => cancelRegistration(reg.id)}
                        className="p-1.5 rounded-lg text-xs bg-red-50 text-red-400 hover:bg-red-100 transition-colors"
                        title="取消报名"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-night-lighter/60 text-center py-6">暂无报名</p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="card p-5">
            <div className="space-y-3">
              <div className="text-center">
                <p className="text-sm text-night-lighter">剩余座位</p>
                <p className={`text-3xl font-bold ${remainingSeats > 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {remainingSeats > 0 ? remainingSeats : 0}
                </p>
                <p className="text-xs text-night-lighter">共 {screening.seatLimit} 个</p>
              </div>
              <div className="h-3 bg-night-lighter/10 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    remainingSeats <= 0 ? 'bg-red-400' : 'bg-gradient-to-r from-orange to-gold'
                  }`}
                  style={{ width: `${Math.min(100, (confirmedCount / screening.seatLimit) * 100)}%` }}
                />
              </div>
              <button
                onClick={() => setShowRegForm(true)}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                我要报名
              </button>
            </div>
          </div>

          <div className="card p-5 space-y-3">
            <h3 className="font-medium text-night text-sm">管理操作</h3>
            <button
              onClick={() => setShowReschedule(true)}
              className="btn-secondary w-full flex items-center justify-center gap-2 text-sm"
            >
              <CloudRain className="w-4 h-4" />
              雨天改期
            </button>
            <button
              onClick={() => {
                if (confirm('确定要删除该场次吗？所有报名记录将一并删除。')) {
                  deleteScreening(screening.id)
                  navigate('/')
                }
              }}
              className="btn-danger w-full flex items-center justify-center gap-2 text-sm"
            >
              <Trash2 className="w-4 h-4" />
              删除场次
            </button>
          </div>

          <WaitlistPanel waitlisted={waitlisted} childrenCount={childrenCount} />
        </div>
      </div>

      {showRegForm && (
        <RegistrationForm
          screeningId={screening.id}
          seatLimit={screening.seatLimit}
          confirmedCount={confirmedCount}
          onClose={() => setShowRegForm(false)}
        />
      )}

      {showReschedule && (
        <ReschedulePanel
          screeningId={screening.id}
          movieName={screening.movieName}
          currentDate={screening.date}
          onClose={() => setShowReschedule(false)}
        />
      )}
    </div>
  )
}
