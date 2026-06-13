import { useNavigate } from 'react-router-dom';
import { useComplaintStore } from '@/store/useComplaintStore';
import { useStatistics } from '@/hooks/useStatistics';
import StatCard from '@/components/StatCard';
import StatusBadge from '@/components/StatusBadge';
import { formatDateTime, formatDuration, getDuration } from '@/utils/dateUtils';
import {
  BarChart3,
  Users,
  Clock,
  AlertTriangle,
  PlusCircle,
  FileText,
  Download,
  ChevronRight,
  Building2,
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const complaints = useComplaintStore((state) => state.complaints);
  const statistics = useStatistics();

  const pendingComplaints = complaints.filter(
    (c) => c.status === 'pending' || c.status === 'processing' || c.status === 'overdue'
  ).sort((a, b) => {
    if (a.status === 'overdue' && b.status !== 'overdue') return -1;
    if (a.status !== 'overdue' && b.status === 'overdue') return 1;
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  }).slice(0, 5);

  const handleExport = () => {
    const data = JSON.stringify(complaints, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `complaints-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            数据概览
          </h1>
          <p className="text-slate-400 text-sm">欢迎回来，这是今日噪音投诉处理情况</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-700 rounded-xl text-sm text-slate-300 transition-colors"
          >
            <Download className="w-4 h-4" />
            导出报表
          </button>
          <button
            onClick={() => navigate('/complaints/new')}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-xl text-sm font-medium text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-blue-500/40"
          >
            <PlusCircle className="w-4 h-4" />
            新建投诉
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="本周投诉量"
          value={statistics.weeklyCount}
          icon={<BarChart3 className="w-6 h-6" />}
          color="blue"
          trend={{ value: 12, isUp: true, label: '较上周' }}
        />
        <StatCard
          title="重复投诉住户"
          value={statistics.repeatComplainants}
          icon={<Users className="w-6 h-6" />}
          color="yellow"
          suffix="户"
        />
        <StatCard
          title="平均处理时长"
          value={formatDuration(statistics.avgProcessingTime)}
          icon={<Clock className="w-6 h-6" />}
          color="green"
        />
        <StatCard
          title="超期未回访"
          value={statistics.overdueCount}
          icon={<AlertTriangle className="w-6 h-6" />}
          color="red"
          suffix="件"
          trend={{ value: statistics.overdueCount > 0 ? 0 : 100, isUp: false, label: '需处理' }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                待处理投诉
              </h2>
              <p className="text-sm text-slate-400">共 {pendingComplaints.length} 条待处理记录</p>
            </div>
            <button
              onClick={() => navigate('/complaints')}
              className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              查看全部
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {pendingComplaints.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>暂无待处理投诉</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingComplaints.map((complaint) => {
                const processingTime = getDuration(complaint.createdAt, new Date().toISOString());
                return (
                  <div
                    key={complaint.id}
                    onClick={() => navigate(`/complaints/${complaint.id}`)}
                    className={`flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer ${
                      complaint.status === 'overdue'
                        ? 'bg-red-500/10 border-red-500/30 hover:border-red-500/50 animate-pulse'
                        : 'bg-slate-700/30 border-slate-700/50 hover:border-slate-600'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      complaint.status === 'overdue' ? 'bg-red-500/20' : 'bg-blue-500/20'
                    }`}>
                      <Building2 className={`w-5 h-5 ${complaint.status === 'overdue' ? 'text-red-400' : 'text-blue-400'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-white truncate">
                          {complaint.building} {complaint.unit}
                        </span>
                        <StatusBadge status={complaint.status} size="sm" pulse={complaint.status === 'overdue'} />
                      </div>
                      <p className="text-sm text-slate-400 truncate">{complaint.description}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm text-slate-400">{formatDateTime(complaint.createdAt)}</p>
                      <p className={`text-xs ${complaint.status === 'overdue' ? 'text-red-400' : 'text-slate-500'}`}>
                        已处理 {formatDuration(processingTime)}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-500 flex-shrink-0" />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6">
          <h2 className="text-lg font-semibold text-white mb-6" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            快捷操作
          </h2>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/complaints/new')}
              className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 hover:from-blue-600/30 hover:to-indigo-600/30 border border-blue-500/30 rounded-xl transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <PlusCircle className="w-5 h-5 text-blue-400" />
              </div>
              <div className="text-left">
                <p className="font-medium text-white">新建投诉</p>
                <p className="text-sm text-slate-400">快速登记居民投诉</p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-500 ml-auto group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => navigate('/complaints')}
              className="w-full flex items-center gap-3 p-4 bg-slate-700/30 hover:bg-slate-700/50 border border-slate-700/50 rounded-xl transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-600/50 flex items-center justify-center">
                <FileText className="w-5 h-5 text-slate-300" />
              </div>
              <div className="text-left">
                <p className="font-medium text-white">投诉列表</p>
                <p className="text-sm text-slate-400">查看全部投诉记录</p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-500 ml-auto group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => navigate('/heatmap')}
              className="w-full flex items-center gap-3 p-4 bg-slate-700/30 hover:bg-slate-700/50 border border-slate-700/50 rounded-xl transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="text-left">
                <p className="font-medium text-white">楼栋热力图</p>
                <p className="text-sm text-slate-400">查看高频投诉点分布</p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-500 ml-auto group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-700/50">
            <h3 className="text-sm font-medium text-slate-400 mb-4">投诉类型分布</h3>
            <div className="space-y-3">
              {statistics.noiseTypeStats.slice(0, 4).map((item, index) => {
                const colors = ['bg-blue-500', 'bg-purple-500', 'bg-yellow-500', 'bg-emerald-500'];
                const total = statistics.noiseTypeStats.reduce((sum, i) => sum + i.count, 0);
                const percentage = total > 0 ? (item.count / total) * 100 : 0;
                return (
                  <div key={item.type}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-slate-300">{item.label}</span>
                      <span className="text-slate-400">{item.count} 件</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${colors[index]} rounded-full transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
