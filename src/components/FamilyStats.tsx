import { useMemo } from 'react';
import {
  Users,
  Clock,
  AlertTriangle,
  Trophy,
  TrendingUp,
  AlertCircle,
  Sparkles,
  Filter,
} from 'lucide-react';
import { useStore } from '@/store';
import { cn } from '@/lib/utils';

interface FamilyStatsProps {
  onArrangeForElder?: (elderId: string) => void;
  onFilterDelayedByMember?: (memberId: string) => void;
}

export function FamilyStats({ onArrangeForElder, onFilterDelayedByMember }: FamilyStatsProps) {
  const { elders, tasks, records, members } = useStore();

  const intervalWarnings = useMemo(() => {
    const today = new Date();
    return elders
      .map((e) => {
        if (!e.lastBathDate) return { elder: e, days: -1 };
        const last = new Date(e.lastBathDate);
        const days = Math.floor((today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
        return { elder: e, days };
      })
      .filter((x) => x.days >= 4 || x.days === -1)
      .sort((a, b) => b.days - a.days);
  }, [elders]);

  const delayStats = useMemo(() => {
    const delayedTasks = tasks.filter((t) => t.status === 'delayed');
    const byMember = new Map<string, number>();
    delayedTasks.forEach((t) => {
      byMember.set(t.assignedTo, (byMember.get(t.assignedTo) || 0) + 1);
    });
    return {
      total: delayedTasks.length,
      byMember: Array.from(byMember.entries())
        .map(([id, count]) => ({
          member: members.find((m) => m.id === id),
          count,
        }))
        .filter((x) => x.member)
        .sort((a, b) => b.count - a.count),
    };
  }, [tasks, members]);

  const contributionRanking = useMemo(() => {
    const totalRecords = records.length;
    const byMember = new Map<string, number>();
    records.forEach((r) => {
      byMember.set(r.completedBy, (byMember.get(r.completedBy) || 0) + 1);
    });
    return members
      .map((m) => {
        const count = byMember.get(m.id) || 0;
        return {
          member: m,
          count,
          percent: totalRecords > 0 ? Math.round((count / totalRecords) * 100) : 0,
        };
      })
      .sort((a, b) => b.count - a.count);
  }, [records, members]);

  const totalRecords = records.length;
  const thisWeekRecords = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return records.filter((r) => {
      const d = new Date(r.completedAt.replace(' ', 'T'));
      return d >= weekAgo;
    }).length;
  }, [records]);

  return (
    <section className="max-w-7xl mx-auto px-6 pt-10 pb-10">
      <div
        className="relative rounded-3xl overflow-hidden p-7 shadow-card"
        style={{
          animation: 'fadeInUp 0.6s ease-out 400ms both',
          background:
            'linear-gradient(135deg, #E6EFEF 0%, #FAF6F0 40%, #FBEAE5 100%)',
        }}
      >
        <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-white/40 blur-3xl" />
        <div className="absolute left-10 bottom-0 w-56 h-56 rounded-full bg-teal/5 blur-3xl" />

        <div className="relative">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-semibold text-teal-700 font-serif flex items-center gap-2">
                <Users className="w-5 h-5" /> 家庭分担视图
              </h2>
              <p className="text-sm text-teal-300 mt-1">
                看看间隔有没有太久、延期卡在哪、谁做得最多
              </p>
            </div>
            <div className="flex items-center gap-3">
              <StatPill
                icon={<TrendingUp className="w-4 h-4" />}
                label="本周完成"
                value={thisWeekRecords + ' 次'}
                color="sage"
              />
              <StatPill
                icon={<Trophy className="w-4 h-4" />}
                label="累计记录"
                value={totalRecords + ' 次'}
                color="teal"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="rounded-2xl bg-white/80 backdrop-blur-sm border border-white shadow-soft p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 rounded-xl bg-coral-100 text-coral flex items-center justify-center">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-teal-700 text-sm">间隔预警</h3>
                  <p className="text-[11px] text-teal-300 mt-0.5">超过4天需重点关注</p>
                </div>
              </div>

              {intervalWarnings.length === 0 ? (
                <div className="text-center py-8 text-sage-600">
                  <div className="text-3xl mb-2">🌿</div>
                  <p className="text-sm font-medium">所有老人助浴节奏正常</p>
                  <p className="text-xs text-teal-300 mt-1">继续保持 ✨</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {intervalWarnings.map(({ elder, days }, i) => {
                    const urgent = days >= 6 || days === -1;
                    const clickable = !!onArrangeForElder;
                    return (
                      <div
                        key={elder.id}
                        onClick={() => onArrangeForElder?.(elder.id)}
                        className={cn(
                          'flex items-center gap-3 p-3 rounded-xl border transition-all',
                          urgent
                            ? 'bg-coral-50/80 border-coral/30'
                            : 'bg-amber2-50/60 border-amber2-600/30',
                          clickable && 'cursor-pointer hover:shadow-card hover:-translate-y-0.5 group/row'
                        )}
                        style={{ animation: `fadeInUp 0.4s ease-out ${i * 80}ms both` }}
                      >
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-xl shadow-inner shrink-0">
                          {elder.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-teal-700 text-sm truncate">
                            {elder.name}
                          </p>
                          <p className="text-[11px] text-teal-300 mt-0.5 flex items-center gap-1">
                            {urgent ? (
                              <>
                                <AlertTriangle className="w-3 h-3 text-coral" />
                                <span className="text-coral font-medium">
                                  {days === -1 ? '从未有助浴记录' : `已 ${days} 天未助浴`}
                                </span>
                              </>
                            ) : (
                              <>
                                <Clock className="w-3 h-3 text-amber2-600" />
                                <span className="text-amber2-600 font-medium">
                                  {days} 天前完成
                                </span>
                              </>
                            )}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {clickable && (
                            <span className="text-[11px] text-teal-300 opacity-0 group-hover/row:opacity-100 transition-opacity flex items-center gap-0.5 whitespace-nowrap">
                              <Sparkles className="w-3 h-3" /> 安排
                            </span>
                          )}
                          <div
                            className={cn(
                              'text-xs font-bold px-2.5 py-1 rounded-lg tabular-nums',
                              urgent
                                ? 'bg-coral text-white'
                                : 'bg-amber2-600 text-white'
                            )}
                          >
                            {days === -1 ? '!' : days + '天'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="rounded-2xl bg-white/80 backdrop-blur-sm border border-white shadow-soft p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 rounded-xl bg-amber2-100 text-amber2-600 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-teal-700 text-sm">延期卡点</h3>
                  <p className="text-[11px] text-teal-300 mt-0.5">谁的任务延期最多</p>
                </div>
                <span
                  className={cn(
                    'text-xs font-bold px-2.5 py-1 rounded-lg tabular-nums',
                    delayStats.total > 0
                      ? 'bg-coral text-white'
                      : 'bg-sage-100 text-sage-600'
                  )}
                >
                  {delayStats.total} 条
                </span>
              </div>

              {delayStats.total === 0 ? (
                <div className="text-center py-8 text-sage-600">
                  <div className="text-3xl mb-2">🎯</div>
                  <p className="text-sm font-medium">无延期任务</p>
                  <p className="text-xs text-teal-300 mt-1">全员按时完成，真棒</p>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {delayStats.byMember.map(({ member, count }, i) => {
                    const pct = Math.round((count / delayStats.total) * 100);
                    const clickable = !!onFilterDelayedByMember;
                    return (
                      <div
                        key={member!.id}
                        onClick={() => onFilterDelayedByMember?.(member!.id)}
                        className={cn(clickable && 'cursor-pointer group/delay')}
                        style={{ animation: `fadeInUp 0.4s ease-out ${i * 80}ms both` }}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-7 h-7 rounded-lg text-sm flex items-center justify-center text-white"
                              style={{ backgroundColor: member!.color }}
                            >
                              {member!.avatar}
                            </span>
                            <span className="text-sm font-medium text-teal-700">
                              {member!.name}
                            </span>
                            <span className="text-[11px] text-teal-300">
                              {member!.role}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {clickable && (
                              <span className="text-[11px] text-coral opacity-0 group-hover/delay:opacity-100 transition-opacity flex items-center gap-0.5">
                                <Filter className="w-3 h-3" /> 查看延期
                              </span>
                            )}
                            <span className="text-xs font-bold text-coral tabular-nums">
                              {count} 条 · {pct}%
                            </span>
                          </div>
                        </div>
                        <div
                          className={cn(
                            'h-2.5 rounded-full bg-cream-200 overflow-hidden transition-all',
                            clickable && 'group-hover/delay:bg-cream-300'
                          )}
                        >
                          <div
                            className="h-full bg-gradient-to-r from-coral-300 to-coral rounded-full transition-all duration-700 ease-out"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="mt-5 pt-4 border-t border-cream-200">
                <p className="text-[11px] text-teal-300 leading-relaxed">
                  💡 建议与延期任务负责人沟通协调时间，必要时轮换分担
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-white/80 backdrop-blur-sm border border-white shadow-soft p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal flex items-center justify-center">
                  <Trophy className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-teal-700 text-sm">成员贡献排行</h3>
                  <p className="text-[11px] text-teal-300 mt-0.5">谁负责得最多</p>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-teal-100 text-teal tabular-nums">
                  {totalRecords} 次
                </span>
              </div>

              <div className="space-y-3">
                {contributionRanking.map(({ member, count, percent }, i) => {
                  const rankIcon = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'][i] || `${i + 1}`;
                  return (
                    <div
                      key={member.id}
                      style={{ animation: `fadeInUp 0.4s ease-out ${i * 80}ms both` }}
                    >
                      <div className="flex items-center gap-2.5 mb-1.5">
                        <span className="text-lg w-7 text-center shrink-0">
                          {rankIcon}
                        </span>
                        <span
                          className="w-8 h-8 rounded-lg text-base flex items-center justify-center text-white shrink-0 shadow-soft"
                          style={{ backgroundColor: member.color }}
                        >
                          {member.avatar}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-semibold text-teal-700 truncate">
                              {member.name}
                            </span>
                            <span className="text-[10px] text-teal-300 truncate">
                              · {member.role}
                            </span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-sm font-bold text-teal-700 tabular-nums">
                            {count}
                          </span>
                          <span className="text-[11px] text-teal-300 ml-1">次</span>
                          <span className="text-[10px] text-teal-300 ml-1.5 tabular-nums">
                            ({percent}%)
                          </span>
                        </div>
                      </div>
                      <div className="h-2 rounded-full bg-cream-200 overflow-hidden ml-9">
                        <div
                          className="h-full rounded-full transition-all duration-700 ease-out"
                          style={{
                            width: `${percent}%`,
                            background: `linear-gradient(90deg, ${member.color}dd, ${member.color})`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 pt-4 border-t border-cream-200">
                {contributionRanking[0] && contributionRanking[0].count > 0 && (
                  <p className="text-[11px] text-teal-300 leading-relaxed">
                    🌟 {contributionRanking[0].member.name} 承担得最多（
                    {contributionRanking[0].percent}%），感谢默默付出
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatPill({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: 'sage' | 'teal' | 'coral';
}) {
  const colorMap = {
    sage: 'bg-sage-50 text-sage-600 border-sage-200',
    teal: 'bg-teal-50 text-teal border-teal-200',
    coral: 'bg-coral-50 text-coral border-coral-200',
  };
  return (
    <div
      className={cn(
        'flex items-center gap-2 px-4 py-2 rounded-xl border bg-white/70 backdrop-blur-sm',
        colorMap[color]
      )}
    >
      {icon}
      <div className="leading-tight">
        <p className="text-[10px] opacity-70">{label}</p>
        <p className="text-sm font-bold tabular-nums">{value}</p>
      </div>
    </div>
  );
}
