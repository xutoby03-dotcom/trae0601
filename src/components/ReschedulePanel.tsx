import { useState } from 'react'
import { CloudRain, Calendar, X, AlertTriangle } from 'lucide-react'
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
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center animate-slide-up">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
            <CloudRain className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-night mb-2">改期成功</h3>
          <p className="text-night-lighter text-sm mb-4">
            「{movieName}」已从 {currentDate} 改至 {newDate}
          </p>
          <div className="bg-cream rounded-xl p-4 text-left text-sm space-y-2">
            <p className="font-medium text-night">已保留以下报名记录：</p>
            <p className="text-night-lighter">✓ 已确认报名：{confirmedRegs.length} 人</p>
            <p className="text-night-lighter">✓ 候补队列：{waitlistedRegs.length} 人</p>
            <p className="text-orange mt-2">请及时通知已报名居民改期信息</p>
          </div>
          <button onClick={onClose} className="btn-primary mt-6">
            完成
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
         style={{ backgroundColor: 'rgba(27, 40, 56, 0.6)', backdropFilter: 'blur(4px)' }}
         onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-slide-up">
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
              <p className="font-medium">改期将保留所有原报名记录</p>
              <p className="text-amber-700 mt-1">
                已确认 {confirmedRegs.length} 人、候补 {waitlistedRegs.length} 人的报名将自动迁移至新日期
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

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleReschedule}
              disabled={!newDate}
              className="btn-primary flex-1 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              确认改期
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
