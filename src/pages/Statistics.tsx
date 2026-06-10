import { useMemo } from 'react';
import { BookOpenCheck, BookCopy, RotateCcw, AlertTriangle, BarChart3, Users } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { calcOverview, calcCategoryStats, calcOverdueRank } from '@/utils/statsUtils';
import { StatCard, BarChart, RankingTable, type StatCardData, type BarChartData, type RankingRow } from '@/components/stats/StatsComponents';
import { CATEGORY_COLORS } from '@/types';
import type { BookCategory } from '@/types';

export const Statistics = () => {
  const books = useAppStore((s) => s.books);
  const users = useAppStore((s) => s.users);
  const records = useAppStore((s) => s.borrowRecords);

  const overview = useMemo(() => calcOverview(books, records), [books, records]);
  const categoryStats = useMemo(() => calcCategoryStats(books), [books]);
  const overdueRank = useMemo(() => calcOverdueRank(users, records), [users, records]);

  const statCards: StatCardData[] = [
    {
      label: '累计登记图书',
      value: overview.totalRegistered,
      icon: BookOpenCheck,
      gradient: 'from-wood-600 via-wood-700 to-wood-800',
      iconBg: 'bg-white/20',
      trend: '书柜总藏量',
    },
    {
      label: '正在漂流中',
      value: overview.inCirculation,
      icon: BookCopy,
      gradient: 'from-sky-500 via-sky-600 to-sky-700',
      iconBg: 'bg-white/20',
      trend: `${overview.inCirculation > 0 ? '🔥' : '📭'}`,
    },
    {
      label: '顺利归还',
      value: overview.totalReturned,
      icon: RotateCcw,
      gradient: 'from-emerald-500 via-emerald-600 to-emerald-700',
      iconBg: 'bg-white/20',
      trend: `${overview.totalRegistered > 0 ? Math.round((overview.totalReturned / (overview.totalReturned + overview.inCirculation || 1)) * 100) : 0}% 归还率`,
    },
    {
      label: '逾期提醒中',
      value: overview.overdueCount,
      icon: AlertTriangle,
      gradient: 'from-accent-brick via-rose-600 to-rose-700',
      iconBg: 'bg-white/20',
      trend: overview.overdueCount === 0 ? '完美 ✨' : '温和提醒中',
    },
  ];

  const barData: BarChartData[] = categoryStats.map((cs) => {
    const conf = CATEGORY_COLORS[cs.category as BookCategory] || CATEGORY_COLORS['其他'];
    const bgMap: Record<string, string> = {
      'bg-rose-600': 'bg-gradient-to-r from-rose-500 to-rose-600',
      'bg-sky-600': 'bg-gradient-to-r from-sky-500 to-sky-600',
      'bg-amber-700': 'bg-gradient-to-r from-amber-500 to-amber-700',
      'bg-emerald-600': 'bg-gradient-to-r from-emerald-500 to-emerald-600',
      'bg-purple-600': 'bg-gradient-to-r from-purple-500 to-purple-600',
      'bg-slate-600': 'bg-gradient-to-r from-slate-500 to-slate-600',
      'bg-teal-600': 'bg-gradient-to-r from-teal-500 to-teal-600',
      'bg-pink-500': 'bg-gradient-to-r from-pink-400 to-pink-500',
      'bg-wood-600': 'bg-gradient-to-r from-wood-500 to-wood-600',
    };
    return {
      label: cs.category,
      value: cs.count,
      percentage: cs.percentage,
      color: bgMap[conf.spine] || 'bg-gradient-to-r from-wood-400 to-wood-600',
    };
  });

  const rankingRows: RankingRow[] = overdueRank.map((o, i) => ({
    rank: i + 1,
    name: o.user.nickname,
    primary: `${o.overdueCount} 次`,
    secondary: `累计 ${o.totalOverdueDays} 天`,
    avatar: o.user.nickname.charAt(0),
  }));

  const activeUsersRank: RankingRow[] = useMemo(() => {
    const scores = users.map((u) => {
      const registered = books.filter((b) => b.lenderId === u.id).length;
      const borrowed = records.filter((r) => r.userId === u.id && r.action === 'borrow').length;
      const reviewed = records.filter((r) => r.userId === u.id && r.action === 'register').length;
      return {
        user: u,
        score: registered * 3 + borrowed * 2 + reviewed,
        registered,
        borrowed,
      };
    });
    return scores
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .filter((s) => s.score > 0)
      .map((s, i) => ({
        rank: i + 1,
        name: s.user.nickname,
        primary: `${s.score} 分`,
        secondary: `登${s.registered} · 借${s.borrowed}`,
        avatar: s.user.nickname.charAt(0),
      }));
  }, [users, books, records]);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="text-center md:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-olive/10 text-emerald-700 text-xs font-semibold mb-3">
          <BarChart3 className="w-3.5 h-3.5" />
          数据驱动 · 清晰透明
        </div>
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-wood-800 mb-2">
          书柜流转统计
        </h1>
        <p className="text-wood-500">看看漂流柜的生命力，哪些书最受欢迎，谁最爱分享</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {statCards.map((card, i) => (
          <StatCard key={i} data={card} />
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <BarChart data={barData} title="📚 类别分布 TOP" />
        <RankingTable
          title="🏆 漂流达人"
          rows={activeUsersRank}
          primaryLabel="活跃度"
          secondaryLabel="明细"
        />
      </div>

      <div>
        <RankingTable
          title="⏰ 逾期排行榜（温柔提醒~）"
          rows={rankingRows}
          primaryLabel="逾期次数"
          secondaryLabel="累计逾期天数"
        />
        {rankingRows.length === 0 && (
          <div className="card-paper p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mb-4">
              <Users className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="font-serif text-xl font-bold text-wood-800 mb-2">完美纪录！</h3>
            <p className="text-wood-500 text-sm">所有图书都按时归还，大家都是靠谱的读书人 🎉</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Statistics;
