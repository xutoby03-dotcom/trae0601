import { useState, useEffect } from 'react';
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
import { Clock, Target, Music, Headphones, Piano, TrendingUp, Calendar } from 'lucide-react';
import { getLast7DaysStats, loadRhythmResults, loadEarResults, loadChordResults } from '@/utils/storage';
import type { DailyStats } from '@/types';

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}/${date.getDate()}`;
};

const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins > 0) {
    return `${mins}分${secs}秒`;
  }
  return `${secs}秒`;
};

export const Statistics = () => {
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [totalTime, setTotalTime] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [overallAccuracy, setOverallAccuracy] = useState(0);

  useEffect(() => {
    const stats = getLast7DaysStats();
    setDailyStats(stats);

    const rhythmResults = loadRhythmResults();
    const earResults = loadEarResults();
    const chordResults = loadChordResults();

    const allResults = [...rhythmResults, ...earResults, ...chordResults];
    let totalTimeCalc = 0;
    let correctCount = 0;
    let totalCount = 0;

    stats.forEach((s) => {
      totalTimeCalc += s.practiceDuration;
    });

    rhythmResults.forEach((r) => {
      totalCount += 1;
      if (r.accuracy >= 60) correctCount += 1;
    });

    earResults.forEach((r) => {
      totalCount += 1;
      if (r.isCorrect) correctCount += 1;
    });

    chordResults.forEach((r) => {
      totalCount += 1;
      if (r.isCorrect) correctCount += 1;
    });

    setTotalTime(totalTimeCalc);
    setTotalQuestions(totalCount);
    setOverallAccuracy(totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0);
  }, []);

  const chartData = dailyStats.map((stat) => ({
    date: formatDate(stat.date),
    accuracy: Math.round(stat.accuracy),
    rhythmAccuracy: Math.round(stat.rhythmAccuracy),
    earAccuracy: Math.round(stat.earAccuracy),
    chordAccuracy: Math.round(stat.chordAccuracy),
    duration: Math.round(stat.practiceDuration / 60),
  }));

  return (
    <div className="flex flex-col min-h-[calc(100vh-120px)] px-4 py-8">
      <div className="max-w-4xl mx-auto w-full">
        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">学习统计</h1>
        <p className="text-slate-400 mb-8">追踪你的进步，见证成长</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-violet-500/20 to-indigo-500/10 rounded-2xl p-5 border border-violet-500/20">
            <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center mb-3">
              <Clock className="w-5 h-5 text-violet-400" />
            </div>
            <p className="text-2xl font-bold text-white">{formatDuration(totalTime)}</p>
            <p className="text-slate-400 text-sm">累计练习时长</p>
          </div>

          <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/10 rounded-2xl p-5 border border-emerald-500/20">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-3">
              <Target className="w-5 h-5 text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-white">{overallAccuracy}%</p>
            <p className="text-slate-400 text-sm">综合准确率</p>
          </div>

          <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/10 rounded-2xl p-5 border border-amber-500/20">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center mb-3">
              <TrendingUp className="w-5 h-5 text-amber-400" />
            </div>
            <p className="text-2xl font-bold text-white">{totalQuestions}</p>
            <p className="text-slate-400 text-sm">总练习题目</p>
          </div>

          <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/10 rounded-2xl p-5 border border-blue-500/20">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center mb-3">
              <Calendar className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-white">
              {dailyStats.filter((s) => s.totalQuestions > 0).length}
            </p>
            <p className="text-slate-400 text-sm">练习天数</p>
          </div>
        </div>

        <div className="bg-slate-800/30 rounded-2xl p-6 border border-slate-700/50 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-violet-400" />
            准确率趋势（近7天）
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-800/30 rounded-2xl p-5 border border-slate-700/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <Music className="w-5 h-5 text-amber-400" />
              </div>
              <span className="text-slate-300 font-medium">节奏训练</span>
            </div>
            <p className="text-3xl font-bold text-amber-400">
              {Math.round(
                dailyStats.reduce((sum, s) => sum + s.rhythmAccuracy, 0) /
                  (dailyStats.filter((s) => s.rhythmAccuracy > 0).length || 1)
              )}%
            </p>
            <p className="text-slate-500 text-sm mt-1">平均准确率</p>
          </div>

          <div className="bg-slate-800/30 rounded-2xl p-5 border border-slate-700/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <Headphones className="w-5 h-5 text-emerald-400" />
              </div>
              <span className="text-slate-300 font-medium">听音训练</span>
            </div>
            <p className="text-3xl font-bold text-emerald-400">
              {Math.round(
                dailyStats.reduce((sum, s) => sum + s.earAccuracy, 0) /
                  (dailyStats.filter((s) => s.earAccuracy > 0).length || 1)
              )}%
            </p>
            <p className="text-slate-500 text-sm mt-1">平均准确率</p>
          </div>

          <div className="bg-slate-800/30 rounded-2xl p-5 border border-slate-700/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Piano className="w-5 h-5 text-blue-400" />
              </div>
              <span className="text-slate-300 font-medium">和弦识别</span>
            </div>
            <p className="text-3xl font-bold text-blue-400">
              {Math.round(
                dailyStats.reduce((sum, s) => sum + s.chordAccuracy, 0) /
                  (dailyStats.filter((s) => s.chordAccuracy > 0).length || 1)
              )}%
            </p>
            <p className="text-slate-500 text-sm mt-1">平均准确率</p>
          </div>
        </div>
      </div>
    </div>
  );
};
