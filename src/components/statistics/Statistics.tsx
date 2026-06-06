import { useState, useEffect, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  Legend,
} from 'recharts';
import {
  Clock,
  Target,
  Music,
  Headphones,
  Piano,
  TrendingUp,
  Calendar,
  Download,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  getLastNDaysStats,
  loadDailyStats,
  loadRhythmResults,
  loadEarResults,
  loadChordResults,
} from '@/utils/storage';
import type { DailyStats } from '@/types';
import { cn } from '@/lib/utils';

type TimeRange = '7' | '30' | 'all';

const TIME_RANGES: { value: TimeRange; label: string }[] = [
  { value: '7', label: '近7天' },
  { value: '30', label: '近30天' },
  { value: 'all', label: '全部' },
];

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}/${date.getDate()}`;
};

const formatFullDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  return `${date.getMonth() + 1}月${date.getDate()}日 ${weekdays[date.getDay()]}`;
};

const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins > 0) {
    return `${mins}分${secs}秒`;
  }
  return `${secs}秒`;
};

const formatDurationShort = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  return `${mins}分钟`;
};

export const Statistics = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>('7');
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);

  const loadData = () => {
    let stats: DailyStats[] = [];
    if (timeRange === 'all') {
      stats = loadDailyStats().sort((a, b) => (a.date < b.date ? -1 : 1));
    } else {
      stats = getLastNDaysStats(parseInt(timeRange, 10));
    }
    setDailyStats(stats);
  };

  useEffect(() => {
    loadData();
  }, [timeRange]);

  const aggregated = useMemo(() => {
    const rhythmResults = loadRhythmResults();
    const earResults = loadEarResults();
    const chordResults = loadChordResults();

    let totalTime = 0;
    let totalQuestions = 0;
    let correctAnswers = 0;
    let rhythmCount = 0;
    let rhythmCorrect = 0;
    let earCount = 0;
    let earCorrect = 0;
    let chordCount = 0;
    let chordCorrect = 0;

    const startDate = dailyStats.length > 0 ? dailyStats[0].date : null;
    const endDate = dailyStats.length > 0 ? dailyStats[dailyStats.length - 1].date : null;

    dailyStats.forEach((s) => {
      totalTime += s.practiceDuration;
    });

    const inRange = (timestamp: number) => {
      if (!startDate || !endDate) return true;
      const dateStr = new Date(timestamp).toISOString().split('T')[0];
      return dateStr >= startDate && dateStr <= endDate;
    };

    rhythmResults.forEach((r) => {
      if (inRange(r.timestamp)) {
        rhythmCount += 1;
        totalQuestions += 1;
        if (r.accuracy >= 60) {
          rhythmCorrect += 1;
          correctAnswers += 1;
        }
      }
    });

    earResults.forEach((r) => {
      if (inRange(r.timestamp)) {
        earCount += 1;
        totalQuestions += 1;
        if (r.isCorrect) {
          earCorrect += 1;
          correctAnswers += 1;
        }
      }
    });

    chordResults.forEach((r) => {
      if (inRange(r.timestamp)) {
        chordCount += 1;
        totalQuestions += 1;
        if (r.isCorrect) {
          chordCorrect += 1;
          correctAnswers += 1;
        }
      }
    });

    const activeDays = dailyStats.filter((s) => s.totalQuestions > 0).length;

    return {
      totalTime,
      totalQuestions,
      correctAnswers,
      accuracy: totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0,
      activeDays,
      rhythmCount,
      rhythmCorrect,
      earCount,
      earCorrect,
      chordCount,
      chordCorrect,
      rhythmAccuracy:
        rhythmCount > 0 ? Math.round((rhythmCorrect / rhythmCount) * 100) : 0,
      earAccuracy: earCount > 0 ? Math.round((earCorrect / earCount) * 100) : 0,
      chordAccuracy:
        chordCount > 0 ? Math.round((chordCorrect / chordCount) * 100) : 0,
    };
  }, [dailyStats]);

  const chartData = useMemo(
    () =>
      dailyStats.map((stat) => ({
        date: formatDate(stat.date),
        accuracy: Math.round(stat.accuracy),
        rhythmAccuracy: Math.round(stat.rhythmAccuracy),
        earAccuracy: Math.round(stat.earAccuracy),
        chordAccuracy: Math.round(stat.chordAccuracy),
        duration: Math.round(stat.practiceDuration / 60),
      })),
    [dailyStats]
  );

  const exportCSV = () => {
    const headers = [
      '日期',
      '练习时长(秒)',
      '练习题目数',
      '正确数',
      '综合准确率(%)',
      '节奏训练次数',
      '节奏准确率(%)',
      '听音训练次数',
      '听音准确率(%)',
      '和弦识别次数',
      '和弦准确率(%)',
    ];

    const rhythmResults = loadRhythmResults();
    const earResults = loadEarResults();
    const chordResults = loadChordResults();

    const countForDate = (arr: { timestamp: number }[], date: string) =>
      arr.filter((r) => new Date(r.timestamp).toISOString().split('T')[0] === date).length;

    const rows = dailyStats.map((s) => {
      const rhythmCount = countForDate(rhythmResults, s.date);
      const earCount = countForDate(earResults, s.date);
      const chordCount = countForDate(chordResults, s.date);
      return [
        s.date,
        s.practiceDuration,
        s.totalQuestions,
        s.correctAnswers,
        Math.round(s.accuracy),
        rhythmCount,
        Math.round(s.rhythmAccuracy),
        earCount,
        Math.round(s.earAccuracy),
        chordCount,
        Math.round(s.chordAccuracy),
      ];
    });

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `音乐训练统计_${timeRange === '7' ? '近7天' : timeRange === '30' ? '近30天' : '全部'}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const toggleDay = (date: string) => {
    setExpandedDay(expandedDay === date ? null : date);
  };

  const rhythmResults = loadRhythmResults();
  const earResults = loadEarResults();
  const chordResults = loadChordResults();

  const countForDate = (arr: { timestamp: number }[], date: string) =>
    arr.filter((r) => new Date(r.timestamp).toISOString().split('T')[0] === date).length;

  const daysWithData = dailyStats.slice().reverse();

  return (
    <div className="flex flex-col min-h-[calc(100vh-120px)] px-4 py-8">
      <div className="max-w-4xl mx-auto w-full">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">学习统计</h1>
            <p className="text-slate-400">追踪你的进步，见证成长</p>
          </div>
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-all text-sm"
          >
            <Download className="w-4 h-4" />
            导出 CSV
          </button>
        </div>

        <div className="flex gap-2 mb-6 bg-slate-800/50 p-1 rounded-xl w-fit">
          {TIME_RANGES.map((range) => (
            <button
              key={range.value}
              onClick={() => setTimeRange(range.value)}
              className={cn(
                'px-5 py-2 rounded-lg text-sm font-medium transition-all',
                timeRange === range.value
                  ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/25'
                  : 'text-slate-400 hover:text-slate-200'
              )}
            >
              {range.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-violet-500/20 to-indigo-500/10 rounded-2xl p-5 border border-violet-500/20">
            <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center mb-3">
              <Clock className="w-5 h-5 text-violet-400" />
            </div>
            <p className="text-2xl font-bold text-white">{formatDuration(aggregated.totalTime)}</p>
            <p className="text-slate-400 text-sm">累计练习时长</p>
          </div>

          <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/10 rounded-2xl p-5 border border-emerald-500/20">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-3">
              <Target className="w-5 h-5 text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-white">{aggregated.accuracy}%</p>
            <p className="text-slate-400 text-sm">综合准确率</p>
          </div>

          <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/10 rounded-2xl p-5 border border-amber-500/20">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center mb-3">
              <TrendingUp className="w-5 h-5 text-amber-400" />
            </div>
            <p className="text-2xl font-bold text-white">{aggregated.totalQuestions}</p>
            <p className="text-slate-400 text-sm">总练习题目</p>
          </div>

          <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/10 rounded-2xl p-5 border border-blue-500/20">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center mb-3">
              <Calendar className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-white">{aggregated.activeDays}</p>
            <p className="text-slate-400 text-sm">练习天数</p>
          </div>
        </div>

        <div className="bg-slate-800/30 rounded-2xl p-6 border border-slate-700/50 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-violet-400" />
            准确率趋势
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAccuracy" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#f1f5f9',
                  }}
                  formatter={(value: number) => [`${value}%`, '准确率']}
                />
                <Area
                  type="monotone"
                  dataKey="accuracy"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorAccuracy)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-800/30 rounded-2xl p-6 border border-slate-700/50 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">各模块准确率对比</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#f1f5f9',
                  }}
                  formatter={(value: number, name: string) => {
                    const labels: Record<string, string> = {
                      rhythmAccuracy: '节奏训练',
                      earAccuracy: '听音训练',
                      chordAccuracy: '和弦识别',
                    };
                    return [`${value}%`, labels[name] || name];
                  }}
                />
                <Legend
                  formatter={(value: string) => {
                    const labels: Record<string, string> = {
                      rhythmAccuracy: '节奏训练',
                      earAccuracy: '听音训练',
                      chordAccuracy: '和弦识别',
                    };
                    return labels[value] || value;
                  }}
                  wrapperStyle={{ color: '#94a3b8' }}
                />
                <Line
                  type="monotone"
                  dataKey="rhythmAccuracy"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="earAccuracy"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="chordAccuracy"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-slate-800/30 rounded-2xl p-5 border border-slate-700/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <Music className="w-5 h-5 text-amber-400" />
              </div>
              <span className="text-slate-300 font-medium">节奏训练</span>
            </div>
            <p className="text-3xl font-bold text-amber-400">{aggregated.rhythmAccuracy}%</p>
            <p className="text-slate-500 text-sm mt-1">
              共 {aggregated.rhythmCount} 次，正确 {aggregated.rhythmCorrect} 次
            </p>
          </div>

          <div className="bg-slate-800/30 rounded-2xl p-5 border border-slate-700/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <Headphones className="w-5 h-5 text-emerald-400" />
              </div>
              <span className="text-slate-300 font-medium">听音训练</span>
            </div>
            <p className="text-3xl font-bold text-emerald-400">{aggregated.earAccuracy}%</p>
            <p className="text-slate-500 text-sm mt-1">
              共 {aggregated.earCount} 次，正确 {aggregated.earCorrect} 次
            </p>
          </div>

          <div className="bg-slate-800/30 rounded-2xl p-5 border border-slate-700/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Piano className="w-5 h-5 text-blue-400" />
              </div>
              <span className="text-slate-300 font-medium">和弦识别</span>
            </div>
            <p className="text-3xl font-bold text-blue-400">{aggregated.chordAccuracy}%</p>
            <p className="text-slate-500 text-sm mt-1">
              共 {aggregated.chordCount} 次，正确 {aggregated.chordCorrect} 次
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-white mb-4">每日详情</h2>
          {daysWithData.length === 0 ? (
            <div className="text-center py-12 text-slate-500">暂无练习记录</div>
          ) : (
            daysWithData.map((day) => {
              const isExpanded = expandedDay === day.date;
              const rhythmCount = countForDate(rhythmResults, day.date);
              const earCount = countForDate(earResults, day.date);
              const chordCount = countForDate(chordResults, day.date);
              const hasActivity = day.totalQuestions > 0;

              return (
                <div
                  key={day.date}
                  className={cn(
                    'bg-slate-800/30 rounded-xl border border-slate-700/50 overflow-hidden transition-all',
                    hasActivity ? '' : 'opacity-60'
                  )}
                >
                  <div
                    className={cn(
                      'flex items-center justify-between p-4',
                      hasActivity ? 'cursor-pointer hover:bg-slate-800/50' : ''
                    )}
                    onClick={() => hasActivity && toggleDay(day.date)}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          'w-12 h-12 rounded-xl flex items-center justify-center',
                          hasActivity
                            ? 'bg-violet-500/20 text-violet-400'
                            : 'bg-slate-700/50 text-slate-500'
                        )}
                      >
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-white font-medium">{formatFullDate(day.date)}</p>
                        <p className="text-slate-400 text-sm">
                          {hasActivity
                            ? `练习 ${formatDurationShort(day.practiceDuration)} · ${day.totalQuestions} 题`
                            : '无练习记录'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {hasActivity && (
                        <span
                          className={cn(
                            'px-3 py-1 rounded-full text-sm font-medium',
                            day.accuracy >= 80
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : day.accuracy >= 60
                              ? 'bg-amber-500/20 text-amber-400'
                              : 'bg-red-500/20 text-red-400'
                          )}
                        >
                          {Math.round(day.accuracy)}%
                        </span>
                      )}
                      {hasActivity &&
                        (isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-slate-400" />
                        ))}
                    </div>
                  </div>

                  {isExpanded && hasActivity && (
                    <div
                      className="border-t border-slate-700/50 p-4 bg-slate-800/50"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-3 bg-amber-500/10 rounded-xl">
                          <Music className="w-5 h-5 text-amber-400 mx-auto mb-2" />
                          <p className="text-xl font-bold text-amber-400">{rhythmCount}</p>
                          <p className="text-slate-400 text-xs">节奏训练</p>
                          <p className="text-amber-300 text-sm font-medium mt-1">
                            {Math.round(day.rhythmAccuracy)}%
                          </p>
                        </div>
                        <div className="text-center p-3 bg-emerald-500/10 rounded-xl">
                          <Headphones className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
                          <p className="text-xl font-bold text-emerald-400">{earCount}</p>
                          <p className="text-slate-400 text-xs">听音训练</p>
                          <p className="text-emerald-300 text-sm font-medium mt-1">
                            {Math.round(day.earAccuracy)}%
                          </p>
                        </div>
                        <div className="text-center p-3 bg-blue-500/10 rounded-xl">
                          <Piano className="w-5 h-5 text-blue-400 mx-auto mb-2" />
                          <p className="text-xl font-bold text-blue-400">{chordCount}</p>
                          <p className="text-slate-400 text-xs">和弦识别</p>
                          <p className="text-blue-300 text-sm font-medium mt-1">
                            {Math.round(day.chordAccuracy)}%
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-slate-700/50 text-center">
                        <p className="text-slate-400 text-sm">
                          总练习时长：
                          <span className="text-white font-medium ml-1">
                            {formatDuration(day.practiceDuration)}
                          </span>
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
