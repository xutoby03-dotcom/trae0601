import { Users, Clock, Baby, TrendingUp, Film, CheckCircle } from 'lucide-react'
import { useCinemaStore } from '@/store'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

export default function Dashboard() {
  const screenings = useCinemaStore((s) => s.screenings)
  const registrations = useCinemaStore((s) => s.registrations)
  const getConfirmedCount = useCinemaStore((s) => s.getConfirmedCount)
  const getWaitlisted = useCinemaStore((s) => s.getWaitlisted)
  const getChildrenCount = useCinemaStore((s) => s.getChildrenCount)
  const getAttendanceRate = useCinemaStore((s) => s.getAttendanceRate)

  const totalRegistered = registrations
    .filter((r) => r.status === 'confirmed')
    .reduce((sum, r) => sum + r.peopleCount, 0)

  const totalWaitlisted = registrations
    .filter((r) => r.status === 'waitlisted')
    .length

  const totalChildren = screenings.reduce((sum, s) => sum + getChildrenCount(s.id), 0)

  const chartData = screenings.map((s) => ({
    name: s.movieName.length > 4 ? s.movieName.substring(0, 4) + '…' : s.movieName,
    rate: getAttendanceRate(s.id),
    fullName: s.movieName,
  }))

  const overallAttendance = registrations.filter((r) => r.status === 'confirmed').length > 0
    ? Math.round(
        (registrations.filter((r) => r.status === 'confirmed' && r.checkedIn).reduce((s, r) => s + r.peopleCount, 0) /
          registrations.filter((r) => r.status === 'confirmed').reduce((s, r) => s + r.peopleCount, 0)) * 100
      ) || 0
    : 0

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-night">管理看板</h1>
        <p className="text-night-lighter text-sm mt-1">实时掌握每场电影活动的报名、候补和到场情况</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-orange" />
            </div>
            <div>
              <p className="text-xs text-night-lighter">已报名人数</p>
              <p className="text-2xl font-bold text-night">{totalRegistered}</p>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-gold" />
            </div>
            <div>
              <p className="text-xs text-night-lighter">候补人数</p>
              <p className="text-2xl font-bold text-night">{totalWaitlisted}</p>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <Baby className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-night-lighter">需儿童座椅</p>
              <p className="text-2xl font-bold text-night">{totalChildren}</p>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-night-lighter">总到场率</p>
              <p className="text-2xl font-bold text-night">{overallAttendance}%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="card p-6">
          <h2 className="font-bold text-night mb-6 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-orange" />
            各场次到场率
          </h2>
          {chartData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} barCategoryGap="20%">
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12, fill: '#2D4052' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: '#2D4052' }}
                    axisLine={false}
                    tickLine={false}
                    domain={[0, 100]}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip
                    formatter={(value: number) => [`${value}%`, '到场率']}
                    labelFormatter={(label: string) => {
                      const item = chartData.find((d) => d.name === label)
                      return item?.fullName || label
                    }}
                    contentStyle={{
                      borderRadius: '12px',
                      border: 'none',
                      boxShadow: '0 4px 20px rgba(27,40,56,0.12)',
                      fontSize: '13px',
                    }}
                  />
                  <Bar dataKey="rate" radius={[6, 6, 0, 0]} maxBarSize={48}>
                    {chartData.map((entry, index) => (
                      <Cell
                        key={index}
                        fill={entry.rate >= 70 ? '#22c55e' : entry.rate >= 40 ? '#E8773A' : '#ef4444'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-night-lighter/40">
              暂无数据
            </div>
          )}
        </div>

        <div className="card p-6">
          <h2 className="font-bold text-night mb-6 flex items-center gap-2">
            <Film className="w-4 h-4 text-orange" />
            场次概览
          </h2>
          <div className="space-y-3">
            {screenings.map((screening) => {
              const confirmed = getConfirmedCount(screening.id)
              const waitlist = getWaitlisted(screening.id).length
              const children = getChildrenCount(screening.id)
              const attendance = getAttendanceRate(screening.id)

              return (
                <div key={screening.id} className="p-4 rounded-xl bg-cream/80 hover:bg-cream transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-night text-sm">{screening.movieName}</p>
                      <p className="text-xs text-night-lighter">{screening.date} · {screening.location}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                      screening.status === 'upcoming' ? 'bg-green-100 text-green-700' :
                      screening.status === 'ongoing' ? 'bg-orange/10 text-orange' :
                      screening.status === 'completed' ? 'bg-night-lighter/10 text-night-lighter' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {screening.status === 'upcoming' ? '即将放映' :
                       screening.status === 'ongoing' ? '放映中' :
                       screening.status === 'completed' ? '已结束' : '因雨改期'}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 mt-3">
                    <div className="text-center">
                      <p className="text-xs text-night-lighter">已报名</p>
                      <p className="text-sm font-bold text-night">{confirmed}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-night-lighter">候补</p>
                      <p className="text-sm font-bold text-gold">{waitlist}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-night-lighter">儿童椅</p>
                      <p className="text-sm font-bold text-blue-500">{children}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-night-lighter">到场率</p>
                      <p className={`text-sm font-bold ${
                        attendance >= 70 ? 'text-green-600' :
                        attendance >= 40 ? 'text-orange' : 'text-red-500'
                      }`}>{attendance}%</p>
                    </div>
                  </div>
                  <div className="mt-2 h-1.5 bg-night-lighter/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        attendance >= 70 ? 'bg-green-500' :
                        attendance >= 40 ? 'bg-orange' : 'bg-red-400'
                      }`}
                      style={{ width: `${Math.min(100, (confirmed / screening.seatLimit) * 100)}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="font-bold text-night mb-4 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-orange" />
          最近报名记录
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-night-lighter/10">
                <th className="text-left py-2.5 px-3 text-night-lighter font-medium">姓名</th>
                <th className="text-left py-2.5 px-3 text-night-lighter font-medium">电影</th>
                <th className="text-left py-2.5 px-3 text-night-lighter font-medium">人数</th>
                <th className="text-left py-2.5 px-3 text-night-lighter font-medium">楼栋</th>
                <th className="text-left py-2.5 px-3 text-night-lighter font-medium">状态</th>
                <th className="text-left py-2.5 px-3 text-night-lighter font-medium">签到</th>
              </tr>
            </thead>
            <tbody>
              {registrations
                .filter((r) => r.status !== 'cancelled')
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .slice(0, 10)
                .map((reg) => {
                  const screening = screenings.find((s) => s.id === reg.screeningId)
                  return (
                    <tr key={reg.id} className="border-b border-night-lighter/5 hover:bg-cream/50 transition-colors">
                      <td className="py-2.5 px-3 font-medium text-night">{reg.name}</td>
                      <td className="py-2.5 px-3 text-night-lighter">{screening?.movieName || '-'}</td>
                      <td className="py-2.5 px-3 text-night">{reg.peopleCount}</td>
                      <td className="py-2.5 px-3 text-night-lighter">{reg.building}</td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          reg.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-gold/10 text-gold'
                        }`}>
                          {reg.status === 'confirmed' ? '已确认' : '候补中'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        {reg.checkedIn ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <span className="text-night-lighter/40">—</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
