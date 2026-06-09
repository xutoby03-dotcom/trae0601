import { useState } from 'react'
import { Link } from 'react-router-dom'
import { User, Package, CalendarCheck, ArrowRightLeft, ChevronRight } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { STATUS_LABELS, RESERVATION_STATUS_LABELS, SIZE_LABELS } from '@/types'

type TabKey = 'published' | 'reserved' | 'handover'

const tabs: { key: TabKey; label: string; icon: typeof Package }[] = [
  { key: 'published', label: '我发布的', icon: Package },
  { key: 'reserved', label: '我预约的', icon: CalendarCheck },
  { key: 'handover', label: '交接记录', icon: ArrowRightLeft },
]

const statusColorMap: Record<string, string> = {
  available: 'bg-green-100 text-green-700',
  reserved: 'bg-blue-100 text-blue-700',
  pending_handover: 'bg-yellow-100 text-yellow-700',
  completed: 'bg-gray-100 text-gray-600',
}

const reservationStatusColorMap: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  rejected: 'bg-red-100 text-red-700',
  completed: 'bg-gray-100 text-gray-600',
  no_show: 'bg-red-100 text-red-700',
}

export default function Profile() {
  const [activeTab, setActiveTab] = useState<TabKey>('published')
  const { currentUser, getPublishedUniforms, getReservationsByUser, handovers, uniforms } = useStore()

  const publishedUniforms = getPublishedUniforms(currentUser.id)
  const myReservations = getReservationsByUser(currentUser.id)

  const relatedHandovers = handovers.filter((h) =>
    myReservations.some((r) => r.id === h.reservationId)
  )

  return (
    <div className="max-w-2xl mx-auto px-4 pt-6">
      <div className="bg-gradient-to-br from-orange-400 to-orange-500 rounded-2xl p-5 text-white shadow-lg shadow-orange-200">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-white/25 backdrop-blur flex items-center justify-center text-2xl font-bold shrink-0">
            {currentUser.name[0]}
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-bold truncate">{currentUser.name}</h2>
            <p className="text-white/80 text-sm">{currentUser.phone}</p>
            <p className="text-white/70 text-xs mt-0.5">{currentUser.school}</p>
          </div>
          <User className="ml-auto opacity-40" size={40} />
        </div>
      </div>

      <div className="flex gap-1 mt-5 bg-gray-100 rounded-xl p-1">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === key
                ? 'bg-white text-orange-500 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-3 pb-4">
        {activeTab === 'published' && (
          publishedUniforms.length === 0 ? (
            <div className="text-center py-12 text-gray-400">暂无发布的校服</div>
          ) : (
            publishedUniforms.map((u) => (
              <Link
                key={u.id}
                to={`/uniform/${u.id}`}
                className="flex items-center gap-3 bg-white rounded-xl p-3 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                  {u.photos[0] ? (
                    <img src={u.photos[0]} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <Package size={24} />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded">
                      {SIZE_LABELS[u.size] || u.size}
                    </span>
                    <span className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">
                      {u.season}
                    </span>
                    <span className="text-xs bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded">
                      {u.gender}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1 truncate">
                    {u.condition} · {u.isFree ? '免费赠送' : `¥${u.price}`}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColorMap[u.status] || 'bg-gray-100 text-gray-600'}`}>
                    {STATUS_LABELS[u.status]}
                  </span>
                  <ChevronRight size={16} className="text-gray-300" />
                </div>
              </Link>
            ))
          )
        )}

        {activeTab === 'reserved' && (
          myReservations.length === 0 ? (
            <div className="text-center py-12 text-gray-400">暂无预约记录</div>
          ) : (
            myReservations.map((r) => {
              const uniform = uniforms.find((u) => u.id === r.uniformId)
              return (
                <Link
                  key={r.id}
                  to={`/uniform/${r.uniformId}`}
                  className="flex items-center gap-3 bg-white rounded-xl p-3 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                    {uniform?.photos[0] ? (
                      <img src={uniform.photos[0]} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <Package size={24} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {uniform && (
                        <>
                          <span className="text-xs bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded">
                            {SIZE_LABELS[uniform.size] || uniform.size}
                          </span>
                          <span className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">
                            {uniform.season}
                          </span>
                        </>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1 truncate">{r.message}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${reservationStatusColorMap[r.status] || 'bg-gray-100 text-gray-600'}`}>
                      {RESERVATION_STATUS_LABELS[r.status]}
                    </span>
                    <ChevronRight size={16} className="text-gray-300" />
                  </div>
                </Link>
              )
            })
          )
        )}

        {activeTab === 'handover' && (
          relatedHandovers.length === 0 ? (
            <div className="text-center py-12 text-gray-400">暂无交接记录</div>
          ) : (
            relatedHandovers.map((h) => {
              const reservation = myReservations.find((r) => r.id === h.reservationId)
              const uniform = reservation
                ? uniforms.find((u) => u.id === reservation.uniformId)
                : undefined
              return (
                <div
                  key={h.id}
                  className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <ArrowRightLeft size={16} className="text-orange-500 shrink-0" />
                      {uniform && (
                        <span className="text-sm font-medium truncate">
                          {SIZE_LABELS[uniform.size] || uniform.size} {uniform.season} {uniform.gender}
                        </span>
                      )}
                    </div>
                    {h.noShow ? (
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-red-100 text-red-600">
                        爽约
                      </span>
                    ) : h.completed ? (
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-green-100 text-green-700">
                        已完成
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-yellow-100 text-yellow-700">
                        待交接
                      </span>
                    )}
                  </div>
                  <div className="mt-2 text-xs text-gray-500 space-y-1">
                    <p>地点：{h.location}</p>
                    <p>时间：{new Date(h.datetime).toLocaleString('zh-CN')}</p>
                  </div>
                </div>
              )
            })
          )
        )}
      </div>
    </div>
  )
}
