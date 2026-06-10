import { useMemo } from 'react';
import { useTeamStore } from '@/store/teamStore';
import {
  Trophy,
  Users,
  CheckCircle2,
  Star,
  TrendingUp,
  DollarSign,
  Clock,
  Award,
} from 'lucide-react';
import type { ThemeType } from '@/types';
import { THEME_TYPE_LABELS } from '@/types';

export default function Stats() {
  const { teams } = useTeamStore();

  const stats = useMemo(() => {
    const totalTeams = teams.length;
    const lockedTeams = teams.filter((t) => t.status === 'locked' || t.status === 'completed');
    const completedTeams = teams.filter((t) => t.status === 'completed');
    const formationRate = totalTeams > 0 ? Math.round((lockedTeams.length / totalTeams) * 100) : 0;

    const totalMembers = teams.reduce((sum, t) => sum + t.members.length, 0);
    const avgMembersPerTeam = totalTeams > 0 ? (totalMembers / totalTeams).toFixed(1) : '0';

    const reviewedTeams = teams.filter((t) => t.review);
    const avgRating =
      reviewedTeams.length > 0
        ? (reviewedTeams.reduce((sum, t) => sum + (t.review?.rating || 0), 0) / reviewedTeams.length).toFixed(1)
        : '0';

    const totalPrice = teams.reduce((sum, t) => sum + t.price * t.members.length, 0);

    const themeCount: Record<string, number> = {};
    teams.forEach((t) => {
      const key = t.themeName;
      themeCount[key] = (themeCount[key] || 0) + 1;
    });

    const topThemes = Object.entries(themeCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const maxThemeCount = Math.max(...topThemes.map(([, c]) => c), 1);

    const themeTypeCount: Record<ThemeType, number> = {
      horror: 0,
      mystery: 0,
      mechanism: 0,
    };
    teams.forEach((t) => {
      themeTypeCount[t.themeType]++;
    });

    const mvpCount: Record<string, number> = {};
    teams.forEach((t) => {
      if (t.review?.bestPuzzleSolver) {
        const name = t.review.bestPuzzleSolver;
        mvpCount[name] = (mvpCount[name] || 0) + 1;
      }
    });

    const topMVPs = Object.entries(mvpCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    const avgDuration =
      totalTeams > 0
        ? Math.round(teams.reduce((sum, t) => sum + t.duration, 0) / totalTeams)
        : 0;

    return {
      totalTeams,
      lockedTeams: lockedTeams.length,
      completedTeams: completedTeams.length,
      formationRate,
      avgMembersPerTeam,
      avgRating,
      totalPrice,
      topThemes,
      maxThemeCount,
      themeTypeCount,
      topMVPs,
      avgDuration,
    };
  }, [teams]);

  const StatCard = ({
    icon: Icon,
    label,
    value,
    suffix,
    delay = 0,
  }: {
    icon: typeof Trophy;
    label: string;
    value: string | number;
    suffix?: string;
    delay?: number;
  }) => (
    <div
      className="card-dark p-5 animate-fade-in-up"
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-midnight-400 font-serif text-sm mb-1">{label}</p>
          <p className="font-display text-3xl text-gold-300">
            {value}
            {suffix && <span className="text-lg text-midnight-500 ml-1">{suffix}</span>}
          </p>
        </div>
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-wine-700/60 to-wine-900/60 flex items-center justify-center border border-gold-600/20">
          <Icon className="w-5 h-5 text-gold-400" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl animate-fade-in">
      <div className="text-center mb-10">
        <h1 className="font-display text-4xl text-gold-400 mb-3 flex items-center justify-center gap-3">
          <Trophy className="w-9 h-9" />
          数据统计
        </h1>
        <p className="text-midnight-400 font-serif">记录我们每一次密室冒险</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <StatCard icon={Users} label="组队总数" value={stats.totalTeams} delay={0} />
        <StatCard
          icon={CheckCircle2}
          label="成团率"
          value={stats.formationRate}
          suffix="%"
          delay={0.05}
        />
        <StatCard icon={Star} label="平均评分" value={stats.avgRating} delay={0.1} />
        <StatCard icon={TrendingUp} label="场均人数" value={stats.avgMembersPerTeam} delay={0.15} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        <div className="card-dark p-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <h2 className="font-display text-xl text-gold-400 mb-5 flex items-center gap-2">
            <Award className="w-5 h-5" />
            最喜欢的主题 TOP 5
          </h2>
          {stats.topThemes.length === 0 ? (
            <p className="text-midnight-500 font-serif text-center py-8">暂无数据</p>
          ) : (
            <div className="space-y-4">
              {stats.topThemes.map(([theme, count], idx) => {
                const percentage = (count / stats.maxThemeCount) * 100;
                const medals = ['🥇', '🥈', '🥉'];
                return (
                  <div key={theme}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-serif text-gold-200 text-sm flex items-center gap-2">
                        {medals[idx] && <span>{medals[idx]}</span>}
                        {theme}
                      </span>
                      <span className="font-serif text-midnight-400 text-sm">{count} 次</span>
                    </div>
                    <div className="h-2.5 bg-midnight-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-wine-600 via-gold-600 to-gold-400 transition-all duration-1000"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="card-dark p-6 animate-fade-in-up" style={{ animationDelay: '0.25s' }}>
          <h2 className="font-display text-xl text-gold-400 mb-5 flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            主题类型分布
          </h2>
          {stats.totalTeams === 0 ? (
            <p className="text-midnight-500 font-serif text-center py-8">暂无数据</p>
          ) : (
            <div className="space-y-4">
              {(Object.entries(stats.themeTypeCount) as [ThemeType, number][]).map(
                ([type, count], idx) => {
                  const percentage = stats.totalTeams > 0 ? (count / stats.totalTeams) * 100 : 0;
                  const colors = [
                    'from-wine-700 to-wine-500',
                    'from-midnight-600 to-midnight-400',
                    'from-gold-700 to-gold-500',
                  ];
                  return (
                    <div key={type}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-serif text-gold-200 text-sm">
                          {THEME_TYPE_LABELS[type]}
                        </span>
                        <span className="font-serif text-midnight-400 text-sm">
                          {count} 场 ({Math.round(percentage)}%)
                        </span>
                      </div>
                      <div className="h-3 bg-midnight-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${colors[idx]} transition-all duration-1000`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-dark p-6 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <h3 className="font-display text-lg text-gold-400 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            平均时长
          </h3>
          <div className="text-center py-4">
            <span className="font-display text-5xl text-gold-300">{stats.avgDuration}</span>
            <span className="text-midnight-500 font-serif ml-2">分钟</span>
          </div>
        </div>

        <div className="card-dark p-6 animate-fade-in-up" style={{ animationDelay: '0.35s' }}>
          <h3 className="font-display text-lg text-gold-400 mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            累计消费
          </h3>
          <div className="text-center py-4">
            <span className="font-display text-5xl text-gold-300">¥{stats.totalPrice}</span>
          </div>
        </div>

        <div className="card-dark p-6 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <h3 className="font-display text-lg text-gold-400 mb-4 flex items-center gap-2">
            <Award className="w-5 h-5" />
            解谜 MVP 榜
          </h3>
          {stats.topMVPs.length === 0 ? (
            <p className="text-midnight-500 font-serif text-center py-4 text-sm">暂无记录</p>
          ) : (
            <div className="space-y-2">
              {stats.topMVPs.map(([name, count], idx) => {
                const medals = ['🥇', '🥈', '🥉'];
                return (
                  <div
                    key={name}
                    className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-midnight-800/50"
                  >
                    <span className="font-serif text-gold-200 text-sm flex items-center gap-2">
                      {medals[idx]} {name}
                    </span>
                    <span className="font-serif text-midnight-400 text-sm">{count} 次</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
