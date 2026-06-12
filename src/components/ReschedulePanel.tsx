import { useState } from 'react'
import { CloudRain, Calendar, X, AlertTriangle, Bell, Check, Phone } from 'lucide-react'
import { useCinemaStore } from '@/store'

interface ReschedulePanelProps {
  screeningId: string
  movieName: string
  currentDate: string
  onClose: () => void
}

export default function ReschedulePanel({ screeningId, movieName, currentDate, onClose }: ReschedulePanelProps) {
  const [newDate, setNewDate] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const rescheduleScreening = useCinemaStore((s) => s.rescheduleScreening)
  const getScreeningRegistrations = useCinemaStore((s) => s.getScreeningRegistrations)
  const registrations = getScreeningRegistrations(screeningId)
  const confirmedRegs = registrations.filter((r) => r.status === 'confirmed')
  const waitlistedRegs = registrations.filter((r) => r.status === 'waitlisted')
  const allActive = [...confirmedRegs, ...waitlistedRegs]

  const handleReschedule = () => {
    if (!newDate) return
    rescheduleScreening(screeningId, newDate)
    setConfirmed(true)
  }

  if (confirmed) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
           style={{ backgroundColor: 'rgba(27, 40, 56, 0.6)', backdropFilter: 'blur(4px)' }}
           onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden animate-slide-up">
          <div className="p-6 text-center">
            <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-green-100 flex items-center justify-center">
              <Check className="w-7 h-7 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-night mb-1">改期并通知完成</h3>
            <p className="text-night-lighter text-sm">
              「{movieName}」已从 {currentDate} 改至 {newDate}
            </p>
          </div>

          <div className="px-6 pb-2">
            <div className="bg-blue-50 rounded-xl p-3 flex items-center gap-2">
              <Bell className="w-4 h-4 text-blue-500 flex-shrink-0" />
              <p className="text-sm text-blue-800">
                已向 <span className="font-bold">{allActive.length}</span> 位报名居民发送改期通知（已确认 {confirmedRegs.length} 人 + 候补 {waitlistedRegs.length} 人）
              </p>
            </div>
          </div>

          <div className="px-6 py-4">
            <h4 className="text-sm font-medium text-night mb-3">通知记录</h4>
            <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
              {allActive.map((reg) => (
                <div key={reg.id} className="p-3 rounded-xl bg-cream border border-green-200/60">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-night">{reg.name}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                        reg.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-gold/10 text-gold'
                      }`}>
                        {reg.status === 'confirmed' ? '已确认' : '候补'}
                      </span>
                    </div>
                    <span className="flex items-center gap-1 text-xs text-green-600">
                      <Check className="w-3 h-3" />
                      已通知
                    </span>
                  </div>
                  <div className="text-xs text-night-lighter space-y-0.5">
                    <p>🎬 {movieName}：{currentDate} → {newDate}</p>
                    <p className="flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      联系电话：{reg.phone}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="px-6 pb-6">
            <button onClick={onClose} className="btn-primary w-full">
              完成
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
         style={{ backgroundColor: 'rgba(27, 40, 56, 0.6)', backdropFilter: 'blur(4px)' }}
         onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="flex items-center justify-between p-5 border-b border-night-lighter/10">
          <h2 className="text-lg font-bold text-night flex items-center gap-2">
            <CloudRain className="w-5 h-5 text-blue-500" />
            雨天改期
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-cream transition-colors">
            <X className="w-5 h-5 text-night-lighter" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="bg-blue-50 rounded-xl p-4">
            <p className="text-sm text-night font-medium mb-1">当前场次信息</p>
            <p className="text-night-lighter text-sm">电影：{movieName}</p>
            <p className="text-night-lighter text-sm">原定日期：{currentDate}</p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-medium">改期将保留所有原报名记录并自动发送通知</p>
              <p className="text-amber-700 mt-1">
                已确认 {confirmedRegs.length} 人、候补 {waitlistedRegs.length} 人的报名将自动迁移至新日期，
                并标记为已通知改期
              </p>
            </div>
          </div>

          <div>
            <label className="label-field">
              <Calendar className="w-3.5 h-3.5 inline mr-1" />选择新日期 *
            </label>
            <input
              type="date"
              required
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="input-field"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          {newDate && allActive.length > 0 && (
            <div className="bg-cream rounded-xl p-4">
              <p className="text-sm font-medium text-night mb-3 flex items-center gap-1.5">
                <Bell className="w-4 h-4 text-blue-500" />
                改期通知预览
              </p>
              <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                {allActive.map((reg) => (
                  <div key={reg.id} className="p-2.5 rounded-lg bg-white text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-night">{reg.name}</span>
                      <span className="flex items-center gap-1 text-night-lighter">
                        <Phone className="w-3 h-3" />{reg.phone}
                      </span>
                    </div>
                    <p className="text-night-lighter">
                      🎬 {movieName}：{currentDate} → {newDate}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleReschedule}
              disabled={!newDate}
              className="btn-primary flex-1 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              确认改期并通知
            </button>
            <button onClick={onClose} className="btn-secondary">
              取消
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
