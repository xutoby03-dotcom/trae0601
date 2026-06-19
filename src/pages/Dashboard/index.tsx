import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Clock, AlertTriangle, Stamp, ArrowRight, FileText } from 'lucide-react';
import { useStore } from '@/store';
import StatusBadge from '@/components/StatusBadge';
import { scenarioStats, departmentStats } from '@/data/mockData';
import { formatDateShort, getOverdueHours } from '@/utils/helpers';

const Dashboard = () => {
  const navigate = useNavigate();
  const { seals, applications, records, getSealById, getApplicationById } = useStore();

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayCount = records.filter(
    (r) => r.status === 'checked_out' && new Date(r.checkoutTime) >= todayStart
  ).length;

  const pendingCount = applications.filter((a) => a.status === 'pending').length;

  const overdueAppCount = applications.filter((a) => a.status === 'overdue').length;
  const overdueRecCount = records.filter((r) => r.status === 'overdue').length;
  const overdueCount = overdueAppCount + overdueRecCount;

  const sealTotal = seals.length;

  const getTime = (item: typeof applications[number] | typeof records[number]): string =>
    'createdAt' in item ? item.createdAt : item.checkoutTime;

  const recentItems = [...applications, ...records]
    .sort((a, b) => new Date(getTime(b)).getTime() - new Date(getTime(a)).getTime())
    .slice(0, 6);

  const scenarioOption: EChartsOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: scenarioStats.map((s) => s.scenario),
      axisLine: { lineStyle: { color: '#dde7f2' } },
      axisLabel: { color: '#1a365d', fontFamily: 'Noto Sans SC' },
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: '#f0f4f9' } },
      axisLabel: { color: '#5081b7' },
    },
    series: [
      {
        type: 'bar',
        barWidth: '40%',
        data: scenarioStats.map((s) => s.count),
        itemStyle: {
          borderRadius: [6, 6, 0, 0],
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: '#d4a017' },
              { offset: 1, color: '#1a365d' },
            ],
          },
        },
      },
    ],
  };

  const deptOption: EChartsOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: '3%', right: '8%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: '#f0f4f9' } },
      axisLabel: { color: '#5081b7' },
    },
    yAxis: {
      type: 'category',
      data: departmentStats.map((d) => d.department).reverse(),
      axisLine: { lineStyle: { color: '#dde7f2' } },
      axisLabel: { color: '#1a365d', fontFamily: 'Noto Sans SC' },
    },
    series: [
      {
        type: 'bar',
        barWidth: '50%',
        data: departmentStats.map((d) => d.count).reverse(),
        itemStyle: {
          borderRadius: [0, 6, 6, 0],
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 1, y2: 0,
            colorStops: [
              { offset: 0, color: '#83a8d0' },
              { offset: 1, color: '#1a365d' },
            ],
          },
        },
      },
    ],
  };

  const StatCard = ({
    icon: Icon, title, value, gradient, isDanger,
  }: {
    icon: typeof Briefcase; title: string; value: number; gradient: string; isDanger?: boolean;
  }) => (
    <div
      className={`relative rounded-2xl p-5 shadow-seal overflow-hidden ${gradient} ${isDanger ? 'animate-pulse-red' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className={`text-sm font-medium ${isDanger ? 'text-white/80' : 'text-primary-800'}`}>{title}</p>
          <p className={`mt-2 text-4xl font-bold font-serif ${isDanger ? 'text-white' : 'text-primary-700'}`}>
            {value}
          </p>
        </div>
        <div className={`p-3 rounded-xl ${isDanger ? 'bg-white/20' : 'bg-white/50'}`}>
          <Icon className={`w-7 h-7 ${isDanger ? 'text-white' : 'text-primary-700/70'}`} />
        </div>
      </div>
      <div className={`absolute -right-6 -bottom-6 opacity-10 ${isDanger ? 'text-white' : 'text-primary-700'}`}>
        <Icon className="w-24 h-24" />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          icon={Briefcase}
          title="今日外带数量"
          value={todayCount}
          gradient="bg-gradient-to-br from-primary-500 to-primary-700 text-white"
        />
        <StatCard
          icon={Clock}
          title="待审批数量"
          value={pendingCount}
          gradient="bg-gradient-to-br from-gold-400 to-gold-600 text-white"
        />
        <StatCard
          icon={AlertTriangle}
          title="逾期未还数量"
          value={overdueCount}
          gradient="bg-gradient-to-br from-red-500 to-red-700"
          isDanger
        />
        <StatCard
          icon={Stamp}
          title="印章总数"
          value={sealTotal}
          gradient="bg-gradient-to-br from-primary-600 via-primary-500 to-gold-400 text-white"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl p-5 shadow-seal">
          <h3 className="text-lg font-serif font-semibold text-primary-700 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-gold-500" />
            常用场景 TOP5
          </h3>
          <ReactECharts option={scenarioOption} style={{ height: 280 }} />
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-seal">
          <h3 className="text-lg font-serif font-semibold text-primary-700 mb-4 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-gold-500" />
            各部门月度用印次数
          </h3>
          <ReactECharts option={deptOption} style={{ height: 280 }} />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-seal overflow-hidden">
        <div className="px-5 py-4 border-b border-primary-100 flex items-center justify-between">
          <h3 className="text-lg font-serif font-semibold text-primary-700 flex items-center gap-2">
            <Clock className="w-5 h-5 text-gold-500" />
            近期外带记录
          </h3>
          <button
            onClick={() => navigate('/applications')}
            className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1 transition-colors"
          >
            查看全部 <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-primary-50/60">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-medium text-primary-700 uppercase tracking-wider">印章</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-primary-700 uppercase tracking-wider">申请人/部门</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-primary-700 uppercase tracking-wider">用途</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-primary-700 uppercase tracking-wider">外带时间</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-primary-700 uppercase tracking-wider">状态</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-primary-700 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary-100">
              {recentItems.map((item) => {
                const app = 'applicant' in item ? item : getApplicationById(item.applicationId);
                const seal = app ? getSealById(app.sealId) : undefined;
                const isOverdue = item.status === 'overdue';
                const time = 'checkoutTime' in item ? item.checkoutTime : item.createdAt;

                return (
                  <tr key={item.id} className={isOverdue ? 'bg-red-50/50' : 'hover:bg-primary-50/30 transition-colors'}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gold-100 flex items-center justify-center">
                          <Stamp className="w-4 h-4 text-gold-600" />
                        </div>
                        <span className="text-sm font-medium text-primary-800">{seal?.type || '-'}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div>
                        <p className="text-sm font-medium text-primary-800">{app?.applicant || '-'}</p>
                        <p className="text-xs text-primary-500">{app?.department || '-'}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm text-primary-700 max-w-xs truncate">{app?.purpose || '-'}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm text-primary-700">{formatDateShort(time)}</p>
                      {isOverdue && app && (
                        <p className="text-xs text-red-600 mt-0.5">
                          逾期 {getOverdueHours(app.expectedReturn)} 小时
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {'applicant' in item ? (
                        <StatusBadge type="application" status={item.status} />
                      ) : (
                        <StatusBadge type="record" status={item.status} />
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => navigate(`/applications/${app?.id}`)}
                          className="text-sm text-primary-600 hover:text-primary-700"
                        >
                          详情
                        </button>
                        {('checkoutTime' in item && item.status !== 'returned') && (
                          <button
                            onClick={() => navigate(`/return/${item.id}`)}
                            className="text-sm text-gold-600 hover:text-gold-700"
                          >
                            归还登记
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
