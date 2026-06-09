import { useParkingStore, formatDaySlots, SPOT_STATUS_LABELS } from '@/store/useParkingStore'
import ApplicationCard from '@/components/ApplicationCard'
import { MapPin, Car, Inbox } from 'lucide-react'

export default function MySpots() {
  const { getSpotsByOwner, getApplicationsBySpotId, approveApplication, rejectApplication, completeParking, currentUserId } = useParkingStore()

  const mySpots = getSpotsByOwner(currentUserId)
  const allApplications = mySpots.flatMap((spot) =>
    getApplicationsBySpotId(spot.id).map((app) => ({ ...app, spotLabel: `${spot.building} ${spot.spotNumber}` }))
  )

  const pendingApps = allApplications.filter((a) => a.status === 'pending')
  const activeApps = allApplications.filter((a) => a.status === 'active')
  const otherApps = allApplications.filter((a) => a.status !== 'pending' && a.status !== 'active')

  const statusColor: Record<string, string> = {
    available: 'bg-emerald-100 text-emerald-700',
    in_use: 'bg-amber-100 text-amber-700',
    pending: 'bg-blue-100 text-blue-700',
  }

  return (
    <div className="min-h-screen pb-24">
      <div className="px-4 pt-5 pb-3">
        <h1 className="text-2xl font-bold text-slate-800">我的车位</h1>
        <p className="text-sm text-slate-400 mt-1">管理已登记的车位和申请</p>
      </div>

      <div className="px-4 mb-5">
        <h2 className="text-sm font-semibold text-slate-700 mb-3">已登记车位</h2>
        {mySpots.length > 0 ? (
          <div className="space-y-3">
            {mySpots.map((spot) => (
              <div key={spot.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 text-sm">{spot.building} {spot.spotNumber}</h3>
                      <p className="text-xs text-slate-400">{formatDaySlots(spot.availableSlots)}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[spot.status]}`}>
                    {SPOT_STATUS_LABELS[spot.status]}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Car className="w-3 h-3" />
                    {spot.isWallAdjacent ? '靠墙' : '非靠墙'}
                  </span>
                  <span>{spot.contactPhone}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
            <Inbox className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-400">暂未登记车位</p>
          </div>
        )}
      </div>

      {pendingApps.length > 0 && (
        <div className="px-4 mb-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            待审批
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{pendingApps.length}</span>
          </h2>
          <div className="space-y-3">
            {pendingApps.map((app) => (
              <ApplicationCard
                key={app.id}
                application={app}
                spotLabel={app.spotLabel}
                showActions
                onApprove={approveApplication}
                onReject={rejectApplication}
              />
            ))}
          </div>
        </div>
      )}

      {activeApps.length > 0 && (
        <div className="px-4 mb-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            使用中
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">{activeApps.length}</span>
          </h2>
          <div className="space-y-3">
            {activeApps.map((app) => (
              <ApplicationCard
                key={app.id}
                application={app}
                spotLabel={app.spotLabel}
                showActions
                onComplete={(id) => completeParking(id, false, false)}
              />
            ))}
          </div>
        </div>
      )}

      {otherApps.length > 0 && (
        <div className="px-4 mb-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-3">历史记录</h2>
          <div className="space-y-3">
            {otherApps.map((app) => (
              <ApplicationCard
                key={app.id}
                application={app}
                spotLabel={app.spotLabel}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
