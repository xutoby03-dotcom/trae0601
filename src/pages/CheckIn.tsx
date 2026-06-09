import { useState } from 'react'
import { useStore } from '@/store'
import { formatTime, formatDateTime } from '@/utils/helpers'
import type { Visitor } from '@/types'

type Tab = 'checkin' | 'checkout'

export default function CheckIn() {
  const [activeTab, setActiveTab] = useState<Tab>('checkin')
  const [searchIn, setSearchIn] = useState('')
  const [searchOut, setSearchOut] = useState('')
  const [badgeModal, setBadgeModal] = useState<Visitor | null>(null)
  const [toast, setToast] = useState('')
  const [badgeReturneds, setBadgeReturneds] = useState<Record<string, boolean>>({})

  const { visitors, getEmployee, getMeetingRoom, checkIn, checkOut } = useStore()

  const expected = visitors.filter((v) => v.status === 'expected')
  const checkedIn = visitors.filter((v) => v.status === 'checked-in')

  const filteredExpected = expected.filter(
    (v) =>
      v.name.includes(searchIn) || v.company.includes(searchIn)
  )
  const filteredCheckedIn = checkedIn.filter(
    (v) =>
      v.name.includes(searchOut) || v.company.includes(searchOut)
  )

  const handleCheckIn = (appointmentId: string) => {
    const visitor = checkIn(appointmentId)
    if (visitor) setBadgeModal(visitor)
  }

  const handleCheckOut = (visitorId: string) => {
    const badgeReturned = !!badgeReturneds[visitorId]
    checkOut(visitorId, badgeReturned)
    setToast('签退成功')
    setTimeout(() => setToast(''), 2000)
  }

  const getDuration = (actualArrival: string): string => {
    const diff = Date.now() - new Date(actualArrival).getTime()
    const hours = Math.floor(diff / 3600000)
    const minutes = Math.floor((diff % 3600000) / 60000)
    if (hours > 0) return `${hours}小时${minutes}分钟`
    return `${minutes}分钟`
  }

  const issuedToday = visitors.filter(
    (v) => v.badgeNumber && v.status !== 'expected'
  ).length
  const returnedToday = visitors.filter(
    (v) => v.status === 'departed' && v.badgeNumber
  ).length
  const outstanding = issuedToday - returnedToday

  return (
    <div className="p-6 space-y-6">
      <div className="flex border-b border-gray-200">
        {(['checkin', 'checkout'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'border-b-2 border-teal-600 text-teal-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab === 'checkin' ? '签到管理' : '签退管理'}
          </button>
        ))}
      </div>

      {activeTab === 'checkin' && (
        <div className="space-y-4">
          <input
            type="text"
            placeholder="搜索访客姓名或公司..."
            value={searchIn}
            onChange={(e) => setSearchIn(e.target.value)}
            className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          {filteredExpected.length === 0 ? (
            <div className="text-center text-gray-400 py-12">暂无待签到访客</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredExpected.map((v) => {
                const host = getEmployee(v.hostId)
                const room = getMeetingRoom(v.meetingRoomId)
                return (
                  <div key={v.id} className="bg-white rounded-lg shadow p-5 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">{v.name}</h3>
                        <p className="text-sm text-gray-500">{v.company}</p>
                      </div>
                      <button
                        onClick={() => handleCheckIn(v.appointmentId)}
                        className="px-4 py-1.5 bg-teal-600 text-white text-sm rounded-md hover:bg-teal-700 transition-colors"
                      >
                        签到
                      </button>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>预计到达：{formatTime(v.expectedArrival)}</p>
                      <p>接待人：{host?.name ?? '-'}</p>
                      <p>会议室：{room?.name ?? '-'}</p>
                      <p>来访目的：{v.purpose}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'checkout' && (
        <div className="space-y-4">
          <input
            type="text"
            placeholder="搜索访客姓名或公司..."
            value={searchOut}
            onChange={(e) => setSearchOut(e.target.value)}
            className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          {filteredCheckedIn.length === 0 ? (
            <div className="text-center text-gray-400 py-12">暂无已签到访客</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredCheckedIn.map((v) => {
                const host = getEmployee(v.hostId)
                return (
                  <div key={v.id} className="bg-white rounded-lg shadow p-5 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">{v.name}</h3>
                        <p className="text-sm text-gray-500">{v.company}</p>
                      </div>
                      <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-medium rounded">
                        {v.badgeNumber}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>到达时间：{v.actualArrival ? formatDateTime(v.actualArrival) : '-'}</p>
                      <p>接待人：{host?.name ?? '-'}</p>
                      {v.actualArrival && (
                        <p>已停留：{getDuration(v.actualArrival)}</p>
                      )}
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!badgeReturneds[v.id]}
                          onChange={(e) =>
                            setBadgeReturneds((prev) => ({
                              ...prev,
                              [v.id]: e.target.checked,
                            }))
                          }
                          className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                        />
                        访客牌已归还
                      </label>
                      <button
                        onClick={() => handleCheckOut(v.id)}
                        className="px-4 py-1.5 bg-orange-500 text-white text-sm rounded-md hover:bg-orange-600 transition-colors"
                      >
                        签退
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">访客牌统计</h3>
        <div className="flex gap-8 text-sm">
          <div>
            <span className="text-gray-500">今日发放：</span>
            <span className="font-medium text-gray-800">{issuedToday}</span>
          </div>
          <div>
            <span className="text-gray-500">已归还：</span>
            <span className="font-medium text-teal-600">{returnedToday}</span>
          </div>
          <div>
            <span className="text-gray-500">未归还：</span>
            <span className="font-medium text-orange-600">{outstanding}</span>
          </div>
        </div>
      </div>

      {badgeModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setBadgeModal(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl p-10 text-center animate-[scaleIn_0.3s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-gray-500 text-lg mb-2">访客牌号</p>
            <p className="text-5xl font-bold text-teal-700 mb-8 animate-[flipIn_0.4s_ease-out]">
              {badgeModal.badgeNumber}
            </p>
            <button
              onClick={() => setBadgeModal(null)}
              className="px-8 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              确认
            </button>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-6 py-3 rounded-lg shadow-lg animate-[fadeIn_0.2s_ease-out]">
          {toast}
        </div>
      )}

      <style>{`
        @keyframes scaleIn {
          from { transform: scale(0.8); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes flipIn {
          0% { transform: rotateX(90deg) scale(0.5); opacity: 0; }
          60% { transform: rotateX(-10deg) scale(1.05); }
          100% { transform: rotateX(0) scale(1); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translate(-50%, 10px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>
    </div>
  )
}
