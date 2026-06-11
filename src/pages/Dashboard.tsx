import { useNavigate } from 'react-router-dom';
import {
  Package,
  Clock,
  AlertTriangle,
  CheckCircle,
  Plus,
  ArrowRight,
  Calendar,
  User,
} from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import StatusBadge from '../components/common/StatusBadge';
import { useAppStore } from '../store/useAppStore';
import { formatDate, getDaysUntilReturn, formatMoney } from '../utils';

export default function Dashboard() {
  const navigate = useNavigate();
  const { devices, getOverdueLoans, getDueSoonLoans, getStatistics } = useAppStore();

  const stats = getStatistics();
  const overdueLoans = getOverdueLoans();
  const dueSoonLoans = getDueSoonLoans().filter(
    (l) => !overdueLoans.find((o) => o.id === l.id)
  );

  const statCards = [
    {
      label: '样机总数',
      value: stats.totalDevices,
      icon: Package,
      color: 'text-primary-600',
      bgColor: 'bg-primary-50',
      trend: '台',
    },
    {
      label: '借出中',
      value: stats.activeLoans,
      icon: Clock,
      color: 'text-primary-600',
      bgColor: 'bg-primary-50',
      trend: '台',
    },
    {
      label: '已逾期',
      value: stats.overdueLoans,
      icon: AlertTriangle,
      color: 'text-danger-600',
      bgColor: 'bg-danger-50',
      trend: '台',
      highlight: true,
    },
    {
      label: '本月归还',
      value: stats.returnedThisMonth,
      icon: CheckCircle,
      color: 'text-success-600',
      bgColor: 'bg-success-50',
      trend: '台',
    },
  ];

  const quickActions = [
    { label: '新建借出', icon: Plus, path: '/loans/new', color: 'bg-primary-900 hover:bg-primary-800' },
    { label: '新增样机', icon: Package, path: '/devices/new', color: 'bg-success-600 hover:bg-success-700' },
    { label: '登记归还', icon: CheckCircle, path: '/loans', color: 'bg-warning-600 hover:bg-warning-700' },
  ];

  const allAlertLoans = [...overdueLoans, ...dueSoonLoans].slice(0, 6);

  return (
    <PageContainer title="仪表盘" subtitle="样机管理概览与提醒">
      {/* 统计卡片 */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className={`bg-white rounded-xl p-6 shadow-card transition-all duration-300 hover:shadow-card-hover ${
                card.highlight ? 'ring-2 ring-danger-200' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 ${card.bgColor} rounded-xl flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${card.color}`} />
                </div>
                {card.highlight && (
                  <span className="text-xs text-danger-500 font-medium bg-danger-50 px-2 py-1 rounded-full animate-pulse">
                    需关注
                  </span>
                )}
              </div>
              <div>
                <p className="text-gray-500 text-sm mb-1">{card.label}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-gray-800 font-serif">{card.value}</span>
                  <span className="text-gray-400 text-sm">{card.trend}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* 到期提醒 */}
        <div className="col-span-2">
          <div className="bg-white rounded-xl shadow-card overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-warning-50 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-warning-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">到期与逾期提醒</h3>
                  <p className="text-sm text-gray-500">共 {allAlertLoans.length} 台需要关注</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/loans')}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
              >
                查看全部 <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="divide-y divide-gray-50">
              {allAlertLoans.length === 0 ? (
                <div className="p-8 text-center text-gray-400">暂无到期或逾期样机</div>
              ) : (
                allAlertLoans.map((loan) => {
                  const device = devices.find((d) => d.id === loan.deviceId);
                  const customer = useAppStore.getState().customers.find((c) => c.id === loan.customerId);
                  const daysLeft = getDaysUntilReturn(loan.expectedReturnDate);
                  const isOverdue = daysLeft < 0;

                  return (
                    <div
                      key={loan.id}
                      className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                        isOverdue ? 'bg-danger-50/50' : ''
                      }`}
                      onClick={() => navigate(`/loans/${loan.id}`)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-11 h-11 rounded-lg flex items-center justify-center ${
                              isOverdue ? 'bg-danger-100' : 'bg-warning-100'
                            }`}
                          >
                            <Package
                              className={`w-5 h-5 ${isOverdue ? 'text-danger-600' : 'text-warning-600'}`}
                            />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-800">{device?.name}</span>
                              <span className="text-xs text-gray-400">{device?.deviceNo}</span>
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {customer?.name}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDate(loan.expectedReturnDate)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          {isOverdue ? (
                            <div className="text-danger-600 font-semibold">
                              已逾期 {Math.abs(daysLeft)} 天
                            </div>
                          ) : (
                            <div className="text-warning-600 font-semibold">
                              还剩 {daysLeft} 天
                            </div>
                          )}
                          <div className="mt-1">
                            <StatusBadge
                              status={isOverdue ? 'overdue' : 'active'}
                              type="loan"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* 快捷操作 */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-card p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">快捷操作</h3>
            <div className="space-y-3">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <button
                    key={index}
                    onClick={() => navigate(action.path)}
                    className={`w-full ${action.color} text-white p-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg`}
                  >
                    <Icon className="w-5 h-5" />
                    {action.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 押金概览 */}
          <div className="bg-white rounded-xl shadow-card p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">押金概览</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">在押总额</span>
                <span className="text-xl font-bold text-primary-900 font-serif">
                  {formatMoney(
                    useAppStore
                      .getState()
                      .loans.filter((l) => l.status === 'active' || l.status === 'overdue')
                      .reduce((sum, l) => sum + l.deposit, 0)
                  )}
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary-500 to-primary-700 rounded-full"
                  style={{
                    width: `${Math.min(
                      (useAppStore
                        .getState()
                        .loans.filter((l) => l.status === 'active' || l.status === 'overdue')
                        .reduce((sum, l) => sum + l.deposit, 0) /
                        50000) *
                        100,
                      100
                    )}%`,
                  }}
                ></div>
              </div>
              <p className="text-xs text-gray-400">总计 {stats.activeLoans} 笔借出押金</p>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
