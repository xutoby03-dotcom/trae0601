import { useNavigate } from 'react-router-dom'
import { MapPin, LayoutGrid, Clock } from 'lucide-react'
import { useStore } from '@/store'

const today = new Date().toISOString().slice(0, 10)

function isTodayInRange(startDate: string, endDate: string) {
  return startDate <= today && endDate >= today
}

export default function Boards() {
  const navigate = useNavigate()
  const { boards, applications } = useStore()

  const approvedApps = applications.filter(a => a.status === 'approved')

  const occupiedBoardIds = new Set(
    approvedApps.filter(a => isTodayInRange(a.startDate, a.endDate)).map(a => a.boardId)
  )

  const totalBoards = boards.length
  const occupiedCount = occupiedBoardIds.size
  const availableCount = totalBoards - occupiedCount

  const getApprovedForBoard = (boardId: string) =>
    approvedApps.filter(a => a.boardId === boardId)

  const boardApprovedMap = new Map(boards.map(b => [b.id, getApprovedForBoard(b.id)]))

  const approvedByBoard = boards
    .map(b => ({ board: b, apps: boardApprovedMap.get(b.id) ?? [] }))
    .filter(g => g.apps.length > 0)

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFF8F0' }}>
      <div className="max-w-3xl mx-auto px-4 pt-6 pb-20">
        <h1 className="text-2xl font-bold mb-6" style={{ color: '#1A1A2E' }}>公告栏地图</h1>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <StatCard icon={<LayoutGrid size={18} />} label="总公告栏" value={totalBoards} color="#1A1A2E" />
          <StatCard icon={<MapPin size={18} />} label="使用中" value={occupiedCount} color="#E8652E" />
          <StatCard icon={<Clock size={18} />} label="可用" value={availableCount} color="#2D936C" />
        </div>

        <div className="relative rounded-2xl p-4 mb-8 border" style={{ backgroundColor: '#F5F0EB', borderColor: '#1A1A2E15' }}>
          <div className="text-center text-xs font-medium mb-2" style={{ color: '#1A1A2E66' }}>食堂正门</div>
          <div className="relative" style={{ height: '320px' }}>
            {boards.map(board => {
              const apps = boardApprovedMap.get(board.id) ?? []
              const hasOccupied = apps.some(a => isTodayInRange(a.startDate, a.endDate))
              const dotColor = hasOccupied ? '#E8652E' : '#2D936C'

              return (
                <div
                  key={board.id}
                  className="absolute cursor-pointer rounded-xl px-3 py-2 shadow-sm transition-transform hover:scale-105"
                  style={{ left: `${board.positionX}%`, top: `${board.positionY}%`, backgroundColor: '#fff', minWidth: '100px' }}
                  onClick={() => navigate(`/boards/${board.id}`)}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: dotColor }} />
                    <span className="font-semibold text-sm" style={{ color: '#1A1A2E' }}>{board.name}</span>
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: '#1A1A2E66' }}>{board.location}</div>
                  {apps.length > 0 && (
                    <span
                      className="absolute -top-2 -right-2 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                      style={{ backgroundColor: '#E8652E' }}
                    >
                      {apps.length}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
          <div className="text-center text-xs font-medium mt-2" style={{ color: '#1A1A2E66' }}>食堂侧门</div>
        </div>

        <h2 className="text-lg font-bold mb-4" style={{ color: '#1A1A2E' }}>已批准申请</h2>
        <div className="space-y-4">
          {approvedByBoard.map(({ board, apps }) => (
            <div key={board.id} className="rounded-xl p-4 shadow-sm" style={{ backgroundColor: '#fff' }}>
              <div className="font-semibold text-sm mb-2" style={{ color: '#1A1A2E' }}>{board.name} · {board.location}</div>
              <div className="space-y-2">
                {apps.map(app => (
                  <div key={app.id} className="flex items-center justify-between rounded-lg px-3 py-2" style={{ backgroundColor: '#F5F0EB' }}>
                    <div>
                      <div className="text-sm font-medium" style={{ color: '#1A1A2E' }}>{app.activityName}</div>
                      <div className="text-xs" style={{ color: '#1A1A2E66' }}>{app.clubName} · {app.startDate} ~ {app.endDate}</div>
                    </div>
                    <span
                      className="text-xs font-medium px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: '#2D936C20', color: '#2D936C' }}
                    >
                      已批准
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {approvedByBoard.length === 0 && (
            <div className="text-center py-12" style={{ color: '#1A1A2E44' }}>
              <div className="text-4xl mb-2">📋</div>
              <div className="text-sm">暂无已批准申请</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  return (
    <div className="rounded-xl p-3 shadow-sm" style={{ backgroundColor: '#fff' }}>
      <div className="flex items-center gap-1.5 mb-1">
        <span style={{ color }}>{icon}</span>
        <span className="text-xs" style={{ color: '#1A1A2E66' }}>{label}</span>
      </div>
      <div className="text-2xl font-bold" style={{ color }}>{value}</div>
    </div>
  )
}
