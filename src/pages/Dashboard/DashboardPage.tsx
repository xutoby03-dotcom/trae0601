import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from 'recharts';
import {
  Users,
  Calendar,
  CheckCircle,
  Star,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  Crown,
  MessageSquare,
  ArrowRight,
  Image as ImageIcon,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import Avatar from '../../components/Avatar';
import StatusBadge from '../../components/StatusBadge';
import { POSITIVE_TAGS, NEGATIVE_TAGS } from '../../../shared/constants';
import type { Guest, Feedback } from '../../../shared/types';

export default function DashboardPage() {
  const { overviewStats, sessions, loading, fetchOverviewStats, fetchSessions } = useAppStore();
  const [selectedSessionId, setSelectedSessionId] = useState<string>('');

  useEffect(() => {
    fetchSessions();
    fetchOverviewStats();
  }, [fetchSessions, fetchOverviewStats]);

  useEffect(() => {
    if (sessions.length > 0 && !selectedSessionId) {
      setSelectedSessionId(sessions[0].id);
    }
  }, [sessions, selectedSessionId]);

  const getTagColor = (tag: string, type: 'positive' | 'negative') => {
    if (type === 'positive') {
      const colors = [
        'bg-green-100 text-green-700',
        'bg-emerald-100 text-emerald-700',
        'bg-teal-100 text-teal-700',
        'bg-cyan-100 text-cyan-700',
        'bg-sky-100 text-sky-700',
      ];
      const index = POSITIVE_TAGS.indexOf(tag) % colors.length;
      return colors[index] || colors[0];
    } else {
      const colors = [
        'bg-red-100 text-red-700',
        'bg-orange-100 text-orange-700',
        'bg-amber-100 text-amber-700',
        'bg-yellow-100 text-yellow-700',
        'bg-rose-100 text-rose-700',
      ];
      const index = NEGATIVE_TAGS.indexOf(tag) % colors.length;
      return colors[index] || colors[0];
    }
  };

  const getSecondInviteGuests = (): Guest[] => {
    if (!overviewStats) return [];
    return overviewStats.vipGuests.filter((g) => g.status !== 'checked_in' && g.status !== 'left');
  };

  const getHighScoreFeedback = (): Feedback[] => {
    if (!overviewStats) return [];
    return overviewStats.needFollowUp
      .filter((f) => {
        const avg = (f.tasteScore + f.serviceScore + f.flowScore + f.priceAcceptance) / 4;
        return avg >= 4;
      })
      .slice(0, 5);
  };

  const getRadarData = () => {
    if (!overviewStats) return [];
    const sessionStat = overviewStats.sessionStats.find((s) => s.sessionId === selectedSessionId);
    if (!sessionStat) return [];
    return [
      { subject: '口味', score: sessionStat.avgTasteScore, fullMark: 5 },
      { subject: '服务', score: sessionStat.avgServiceScore, fullMark: 5 },
      { subject: '动线', score: sessionStat.avgFlowScore, fullMark: 5 },
      { subject: '价格', score: sessionStat.avgPriceAcceptance, fullMark: 5 },
    ];
  };

  const barChartData = overviewStats?.sessionStats.map((s) => ({
    name: s.sessionName,
    邀约: s.totalInvited,
    确认: s.totalConfirmed,
    到店: s.totalCheckedIn,
    爽约: s.totalNoShow,
  }));

  const checkInRateData = overviewStats?.sessionStats.map((s) => ({
    name: s.sessionName,
    到店率: s.checkInRate,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <select
            value={selectedSessionId}
            onChange={(e) => setSelectedSessionId(e.target.value)}
            className="input-field w-48"
          >
            <option value="">全部场次</option>
            {sessions.map((session) => (
              <option key={session.id} value={session.id}>
                {session.name}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={() => fetchOverviewStats()}
          className="btn-secondary flex items-center gap-2"
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          刷新数据
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-brown-500 mb-1">总场次</p>
              <p className="text-3xl font-bold text-brown-800 font-display">
                {overviewStats?.totalSessions || 0}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-primary-600" />
            </div>
          </div>
          <div className="mt-3 flex items-center text-sm">
            <span className="text-green-600 flex items-center">
              <TrendingUp className="w-4 h-4 mr-1" />
              进行中
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-brown-500 mb-1">总邀约人数</p>
              <p className="text-3xl font-bold text-brown-800 font-display">
                {overviewStats?.totalGuests || 0}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-3 flex items-center text-sm">
            <span className="text-brown-500">累计邀约人次</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-brown-500 mb-1">总到店率</p>
              <p className="text-3xl font-bold text-brown-800 font-display">
                {overviewStats?.overallCheckInRate || 0}%
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-3 flex items-center text-sm">
            <span className="text-brown-500">
              已到店 {overviewStats?.totalCheckedIn || 0} 人
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-brown-500 mb-1">综合评分</p>
              <p className="text-3xl font-bold text-brown-800 font-display flex items-center">
                {overviewStats?.avgOverallScore || 0}
                <span className="text-lg ml-1">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500 inline" />
                </span>
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <div className="mt-3 flex items-center text-sm">
            <span className="text-brown-500">满分 5 分</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-brown-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary-500" />
            场次到店率对比
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={checkInRateData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0e6dd" />
                <XAxis dataKey="name" tick={{ fill: '#7A6658', fontSize: 12 }} />
                <YAxis tick={{ fill: '#7A6658', fontSize: 12 }} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #f0e6dd',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                  formatter={(value) => [`${value}%`, '到店率']}
                />
                <Bar dataKey="到店率" fill="#FF7A45" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-brown-800 mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            场次评分雷达图
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={getRadarData()}>
                <PolarGrid stroke="#e8dccf" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#7A6658', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fill: '#9a8a7a', fontSize: 10 }} />
                <Radar
                  name="评分"
                  dataKey="score"
                  stroke="#FF7A45"
                  fill="#FF7A45"
                  fillOpacity={0.3}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #f0e6dd',
                    borderRadius: '12px',
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-brown-800 mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-green-500" />
            满意点高频词
          </h3>
          <div className="flex flex-wrap gap-2">
            {overviewStats?.positiveKeywords.slice(0, 10).map((item) => (
              <div
                key={item.keyword}
                className={`px-4 py-2 rounded-full text-sm font-medium ${getTagColor(item.keyword, 'positive')}`}
              >
                {item.keyword}
                <span className="ml-1 opacity-70">({item.count})</span>
              </div>
            ))}
            {(!overviewStats?.positiveKeywords || overviewStats.positiveKeywords.length === 0) && (
              <p className="text-brown-400 text-sm">暂无满意点数据</p>
            )}
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-brown-800 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            问题高频词
          </h3>
          <div className="flex flex-wrap gap-2">
            {overviewStats?.negativeKeywords.slice(0, 10).map((item) => (
              <div
                key={item.keyword}
                className={`px-4 py-2 rounded-full text-sm font-medium ${getTagColor(item.keyword, 'negative')}`}
              >
                {item.keyword}
                <span className="ml-1 opacity-70">({item.count})</span>
              </div>
            ))}
            {(!overviewStats?.negativeKeywords || overviewStats.negativeKeywords.length === 0) && (
              <p className="text-brown-400 text-sm">暂无问题点数据</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-brown-800 mb-4 flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-500" />
            需二次邀请的重点客户
          </h3>
          <div className="space-y-3 max-h-72 overflow-y-auto">
            {getSecondInviteGuests().slice(0, 5).map((guest) => (
              <div
                key={guest.id}
                className="flex items-center justify-between p-3 bg-warm-50 rounded-xl hover:bg-warm-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Avatar name={guest.name} size="md" />
                  <div>
                    <p className="font-medium text-brown-800 flex items-center gap-1">
                      {guest.name}
                      {guest.isVIP && <Crown className="w-4 h-4 text-yellow-500" />}
                    </p>
                    <p className="text-xs text-brown-500">{guest.source} · {guest.relationship}</p>
                  </div>
                </div>
                <StatusBadge status={guest.status} />
              </div>
            ))}
            {getSecondInviteGuests().length === 0 && (
              <p className="text-brown-400 text-sm text-center py-8">暂无需要二次邀请的客户</p>
            )}
          </div>
          {getSecondInviteGuests().length > 5 && (
            <button className="w-full mt-4 text-primary-600 text-sm font-medium hover:text-primary-700 flex items-center justify-center gap-1">
              查看全部 <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-brown-800 mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary-500" />
            高评价客户反馈
          </h3>
          <div className="space-y-3 max-h-72 overflow-y-auto">
            {getHighScoreFeedback().map((feedback) => {
              const guest = overviewStats?.vipGuests.find((g) => g.id === feedback.guestId);
              const avgScore = (feedback.tasteScore + feedback.serviceScore + feedback.flowScore + feedback.priceAcceptance) / 4;
              return (
                <div
                  key={feedback.id}
                  className="p-3 bg-warm-50 rounded-xl hover:bg-warm-100 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Avatar name={guest?.name || '匿名'} size="sm" />
                      <span className="font-medium text-brown-800 text-sm">{guest?.name || '匿名'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-medium text-brown-700">{avgScore.toFixed(1)}</span>
                    </div>
                  </div>
                  <p className="text-sm text-brown-600 line-clamp-2">{feedback.comment || '无文字反馈'}</p>
                  {feedback.photos && feedback.photos.length > 0 && (
                    <div className="flex gap-1 mt-2">
                      {feedback.photos.slice(0, 3).map((photo, idx) => (
                        <div key={idx} className="w-10 h-10 rounded-md overflow-hidden bg-warm-200 flex-shrink-0">
                          <img src={photo} alt="" className="w-full h-full object-cover" />
                        </div>
                      ))}
                      {feedback.photos.length > 3 && (
                        <div className="w-10 h-10 rounded-md bg-warm-200 flex items-center justify-center text-xs text-brown-500 flex-shrink-0">
                          +{feedback.photos.length - 3}
                        </div>
                      )}
                    </div>
                  )}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {feedback.positiveTags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
            {getHighScoreFeedback().length === 0 && (
              <p className="text-brown-400 text-sm text-center py-8">暂无高评价反馈</p>
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-brown-800 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-primary-500" />
          场次人数统计
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0e6dd" />
              <XAxis dataKey="name" tick={{ fill: '#7A6658', fontSize: 12 }} />
              <YAxis tick={{ fill: '#7A6658', fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #f0e6dd',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                }}
              />
              <Legend wrapperStyle={{ paddingTop: '10px' }} />
              <Bar dataKey="邀约" fill="#9CA3AF" radius={[4, 4, 0, 0]} />
              <Bar dataKey="确认" fill="#60A5FA" radius={[4, 4, 0, 0]} />
              <Bar dataKey="到店" fill="#FF7A45" radius={[4, 4, 0, 0]} />
              <Bar dataKey="爽约" fill="#F87171" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
