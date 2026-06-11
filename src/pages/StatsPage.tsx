import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import {
  BarChart3,
  Users,
  Clock,
  Flame,
  Trophy,
  Film,
  Activity,
  TrendingUp,
} from 'lucide-react';
import { useMovieStore } from '../store/useMovieStore';

const GENRE_COLORS = [
  '#ec4899', '#f59e0b', '#10b981', '#6366f1',
  '#8b5cf6', '#ef4444', '#06b6d4', '#84cc16',
  '#f97316', '#14b8a6',
];

const HEATMAP_DAYS = ['日', '一', '二', '三', '四', '五', '六'];

export default function StatsPage() {
  const { getStats, users } = useMovieStore();
  const stats = getStats();

  const abstainChartData = stats.abstainRates.map((r) => ({
    name: r.userName,
    弃票率: r.rate,
    已投票: r.votedCount,
    应投票: r.totalCount,
  }));

  const genrePieData = stats.genreStats.map((g) => ({
    name: g.genre,
    value: g.wantCount,
    rate: g.wantRate,
  }));

  const decisionLineData = stats.decisionTimes.map((d) => ({
    name: d.eventName.replace('周末电影夜 ', '#').replace('五一特别场', '五一'),
    用时: d.hours,
  }));

  const StatCard = ({
    icon: Icon,
    label,
    value,
    sub,
    gradient,
  }: {
    icon: typeof BarChart3;
    label: string;
    value: string | number;
    sub?: string;
    gradient: string;
  }) => (
    <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-5 hover:bg-white/[0.05] transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center ${gradient}`}
        >
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      <p className="text-xs text-white/40 mb-1">{label}</p>
      <p className="text-2xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
        {value}
      </p>
      {sub && <p className="text-xs text-white/40 mt-1">{sub}</p>}
    </div>
  );

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <div className="rounded-3xl bg-gradient-to-br from-pink-500/10 via-purple-500/5 to-amber-400/10 border border-white/10 p-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-amber-400 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1
                className="text-2xl font-bold text-white"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                数据统计中心
              </h1>
              <p className="text-xs text-white/40">看看大家的投票习惯吧~</p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={Film}
            label="总活动数"
            value={stats.totalEvents}
            sub="次成功举办"
            gradient="bg-gradient-to-br from-pink-500 to-rose-600"
          />
          <StatCard
            icon={Activity}
            label="总投票数"
            value={stats.totalVotes}
            sub="人次参与投票"
            gradient="bg-gradient-to-br from-sky-500 to-indigo-600"
          />
          <StatCard
            icon={Clock}
            label="平均决定用时"
            value={stats.avgDecisionHours ? `${stats.avgDecisionHours}h` : '-'}
            sub={stats.avgDecisionHours > 10 ? '下次要快点哦' : '决策效率不错'}
            gradient="bg-gradient-to-br from-amber-400 to-orange-600"
          />
          <StatCard
            icon={Trophy}
            label="最活跃用户"
            value={stats.mostActiveUser.name}
            sub={`投票 ${stats.mostActiveUser.count} 次`}
            gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-xl bg-rose-500/20 flex items-center justify-center">
                <Users className="w-4 h-4 text-rose-300" />
              </div>
              <div>
                <h3 className="font-bold text-white flex items-center gap-2">
                  谁是"划水王"？
                  <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold">
                    弃票率排行
                  </span>
                </h3>
                <p className="text-xs text-white/40">投票率低的朋友下次要注意啦</p>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={abstainChartData} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis type="number" stroke="rgba(255,255,255,0.3)" fontSize={11} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    stroke="rgba(255,255,255,0.5)"
                    fontSize={12}
                    width={60}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1A0B2E',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                    formatter={(value: number) => [`${value}%`, '弃票率']}
                  />
                  <Bar dataKey="弃票率" radius={[0, 8, 8, 0]} barSize={20}>
                    {abstainChartData.map((entry, index) => (
                      <Cell
                        key={index}
                        fill={index === 0 ? '#f43f5e' : index === 1 ? '#fb923c' : index === 2 ? '#fbbf24' : '#6366f1'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {stats.abstainRates.slice(0, 3).map((r, i) => (
                <div
                  key={r.userId}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02]"
                >
                  <span className="text-lg">
                    {users.find((u) => u.id === r.userId)?.avatar}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-white">
                        {r.userName}
                        {i === 0 && <span className="ml-2">🏆 划水王</span>}
                        {i === 1 && <span className="ml-2">🥈</span>}
                        {i === 2 && <span className="ml-2">🥉</span>}
                      </span>
                      <span className="text-xs text-white/50">
                        弃票 {r.rate}% · 投了 {r.votedCount}/{r.totalCount}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-xl bg-pink-500/20 flex items-center justify-center">
                <Flame className="w-4 h-4 text-pink-300" />
              </div>
              <div>
                <h3 className="font-bold text-white flex items-center gap-2">
                  最受欢迎类型
                </h3>
                <p className="text-xs text-white/40">大家想看什么类型的电影？</p>
              </div>
            </div>
            <div className="h-64 flex items-center justify-center">
              {genrePieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={genrePieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {genrePieData.map((_, index) => (
                        <Cell key={index} fill={GENRE_COLORS[index % GENRE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1A0B2E',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                      formatter={(_: any, name: string, props: any) => [
                        `${props.payload.rate}% 想看率`,
                        name,
                      ]}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      wrapperStyle={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-white/30 text-sm">暂无数据</p>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-xl bg-sky-500/20 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-sky-300" />
              </div>
              <div>
                <h3 className="font-bold text-white flex items-center gap-2">
                  决策效率趋势
                </h3>
                <p className="text-xs text-white/40">每次定片花了多久？</p>
              </div>
            </div>
            <div className="h-64">
              {decisionLineData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={decisionLineData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis
                      dataKey="name"
                      stroke="rgba(255,255,255,0.3)"
                      fontSize={11}
                    />
                    <YAxis stroke="rgba(255,255,255,0.3)" fontSize={11} unit="h" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1A0B2E',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                      formatter={(value: number) => [`${value} 小时`, '决定用时']}
                    />
                    <Line
                      type="monotone"
                      dataKey="用时"
                      stroke="url(#colorGradient)"
                      strokeWidth={3}
                      dot={{
                        fill: '#ec4899',
                        strokeWidth: 2,
                        r: 5,
                        stroke: '#1A0B2E',
                      }}
                      activeDot={{ r: 7, fill: '#f59e0b' }}
                    />
                    <defs>
                      <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#ec4899" />
                        <stop offset="100%" stopColor="#f59e0b" />
                      </linearGradient>
                    </defs>
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-white/30 text-sm">
                  还需更多活动数据
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <Clock className="w-4 h-4 text-purple-300" />
              </div>
              <div>
                <h3 className="font-bold text-white flex items-center gap-2">
                  投票热力图
                </h3>
                <p className="text-xs text-white/40">大家最爱什么时候投票？</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <div className="min-w-[600px]">
                <div className="flex items-end gap-1 mb-2 ml-8">
                  {Array.from({ length: 24 }, (_, h) => (
                    <div
                      key={h}
                      className="flex-1 text-[9px] text-white/30 text-center"
                    >
                      {h}
                    </div>
                  ))}
                </div>
                {HEATMAP_DAYS.map((day, d) => (
                  <div key={day} className="flex items-center gap-1 mb-1">
                    <div className="w-7 text-xs text-white/40 text-right pr-1">{day}</div>
                    {Array.from({ length: 24 }, (_, h) => {
                      const data = stats.voteHeatmap.find(
                        (x) => x.dayOfWeek === d && x.hour === h
                      );
                      const count = data?.count || 0;
                      const intensity = Math.min(count / 3, 1);
                      const bg =
                        count === 0
                          ? 'rgba(255,255,255,0.03)'
                          : `rgba(236, 72, 153, ${0.15 + intensity * 0.85})`;
                      return (
                        <div
                          key={h}
                          className="flex-1 aspect-square rounded-md transition-all hover:scale-110"
                          style={{ backgroundColor: bg }}
                          title={`周${day} ${h}:00 · ${count}票`}
                        />
                      );
                    })}
                  </div>
                ))}
                <div className="flex items-center justify-end gap-2 mt-4 text-xs text-white/40">
                  <span>少</span>
                  <div className="flex gap-0.5">
                    {[0.03, 0.2, 0.4, 0.6, 0.8, 1].map((v, i) => (
                      <div
                        key={i}
                        className="w-5 h-4 rounded"
                        style={{
                          backgroundColor:
                            v === 0.03
                              ? 'rgba(255,255,255,0.03)'
                              : `rgba(236, 72, 153, ${0.15 + (v - 0.2) * 1.06})`,
                        }}
                      />
                    ))}
                  </div>
                  <span>多</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-gradient-to-r from-pink-500/10 via-purple-500/5 to-amber-400/10 border border-white/10 p-6">
          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <p className="text-xs text-white/40 mb-2">🎬 历史举办</p>
              <p className="text-3xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                {stats.totalEvents}
                <span className="text-sm text-white/50 ml-2 font-normal"> 场</span>
              </p>
            </div>
            <div>
              <p className="text-xs text-white/40 mb-2">👥 累计参与</p>
              <p className="text-3xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                {users.length * stats.totalEvents}
                <span className="text-sm text-white/50 ml-2 font-normal"> 人次</span>
              </p>
            </div>
            <div>
              <p className="text-xs text-white/40 mb-2">🍿 看过电影</p>
              <p className="text-3xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                {stats.totalEvents}
                <span className="text-sm text-white/50 ml-2 font-normal"> 部</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
