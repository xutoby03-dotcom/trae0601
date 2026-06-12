import { Users, Clock, Baby, Bell, BellOff } from 'lucide-react'
import type { Registration } from '@/types'

interface WaitlistPanelProps {
  waitlisted: Registration[]
  childrenCount: number
  isRescheduled?: boolean
}

export default function WaitlistPanel({ waitlisted, childrenCount, isRescheduled }: WaitlistPanelProps) {
  const waitlistPeople = waitlisted.reduce((s, r) => s + r.peopleCount, 0)
  const shouldShow = waitlisted.length > 0 || childrenCount > 0 || isRescheduled

  if (!shouldShow) return null

  return (
    <div className="space-y-4">
      {(waitlisted.length > 0 || isRescheduled) && (
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-orange" />
            <h3 className="font-medium text-night">候补队列</h3>
            <span className="ml-auto text-sm text-night-lighter">{waitlistPeople} 人</span>
          </div>

          {waitlisted.length > 0 ? (
            <div className="space-y-2">
              {waitlisted.map((reg, index) => (
                <div
                  key={reg.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-cream animate-slide-up"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <span className="w-7 h-7 rounded-full bg-orange/10 text-orange flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-night">{reg.name}</p>
                      {isRescheduled && (
                        reg.rescheduleNotified ? (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-100 text-blue-600 flex items-center gap-0.5">
                            <Bell className="w-3 h-3" />
                            已通知改期
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-100 text-amber-600 flex items-center gap-0.5">
                            <BellOff className="w-3 h-3" />
                            未通知
                          </span>
                        )
                      )}
                    </div>
                    <p className="text-xs text-night-lighter">{reg.building} · {reg.peopleCount}人</p>
                  </div>
                  {reg.hasChildren && (
                    <span className="px-2 py-0.5 rounded-full bg-gold/10 text-gold text-xs flex items-center gap-1">
                      <Baby className="w-3 h-3" />
                      儿童椅
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="py-5 text-center">
              <p className="text-sm text-night-lighter/60">暂无候补人员</p>
            </div>
          )}
        </div>
      )}

      {childrenCount > 0 && (
        <div className="card p-5">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center">
              <Baby className="w-5 h-5 text-gold" />
            </div>
            <div>
              <p className="font-medium text-night">需要儿童座椅</p>
              <p className="text-sm text-night-lighter">
                预计需要 <span className="text-gold font-bold">{childrenCount}</span> 把儿童座椅
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
