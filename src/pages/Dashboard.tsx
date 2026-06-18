import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Recycle,
  Heart,
  Truck,
  AlertTriangle,
  PackagePlus,
  SortAsc,
  ArrowRight,
  MapPin,
} from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { KpiCard } from '../components/KpiCard';
import { StatusBadge } from '../components/StatusBadge';
import { CapacityProgress } from '../components/CapacityProgress';
import { useRecoveryPointsStore } from '../store/recoveryPoints';
import { useExceptionsStore } from '../store/exceptions';
import { useStatisticsStore } from '../store/statistics';
import { formatDateShort } from '../utils/formatters';
import { getExceptionTypeText } from '../utils/formatters';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { recoveryPoints } = useRecoveryPointsStore();
  const { getPendingExceptions } = useExceptionsStore();
  const { getStatistics } = useStatisticsStore();

  const stats = getStatistics();
  const pendingExceptions = getPendingExceptions();
  const fullBoxPoints = recoveryPoints.filter(p => p.status === 'full');
  const warningPoints = recoveryPoints.filter(p => p.status === 'warning');
  const exceptionPoints = recoveryPoints.filter(p => p.status === 'exception');

  const quickActions = [
    {
      icon: PackagePlus,
      label: '投放登记',
      path: '/drop-register',
      color: 'from-blue-400 to-blue-600',
    },
    {
      icon: SortAsc,
      label: '分拣处理',
      path: '/sorting',
      color: 'from-emerald-400 to-emerald-600',
    },
    {
      icon: Truck,
      label: '清运管理',
      path: '/exceptions',
      color: 'from-orange-400 to-orange-600',
    },
    {
      icon: MapPin,
      label: '回收点管理',
      path: '/recovery-points',
      color: 'from-purple-400 to-purple-600',
    },
  ];

  return (
    <div>
      <PageHeader
        title="仪表盘"
        description="旧衣回收分拣管理总览"
        icon={Recycle}
      />

      {/* KPI 卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
        <KpiCard
          title="总回收量"
          value={stats.totalRecoveryKg}
          unit="kg"
          icon={Recycle}
          trend={12.5}
          color="green"
          delay={0}
        />
        <KpiCard
          title="可捐赠比例"
          value={stats.donatableRatio}
          unit="percentage"
          icon={Heart}
          trend={5.2}
          color="blue"
          delay={100}
        />
        <KpiCard
          title="清运及时率"
          value={stats.collectionCompletionRate}
          unit="percentage"
          icon={Truck}
          trend={-2.1}
          color="orange"
          delay={200}
        />
        <KpiCard
          title="待处理异常"
          value={stats.exceptionCount}
          unit="count"
          icon={AlertTriangle}
          color="red"
          delay={300}
        />
      </div>

      {/* 快捷操作 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {quickActions.map((action, index) => (
          <button
            key={action.path}
            onClick={() => navigate(action.path)}
            className="group bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-left animate-fade-in-up"
            style={{ animationDelay: `${400 + index * 50}ms` }}
          >
            <div
              className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}
            >
              <action.icon className="w-6 h-6 text-white" />
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-900">{action.label}</span>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
            </div>
          </button>
        ))}
      </div>

      {/* 满箱提醒和异常预警 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* 满箱提醒 */}
        <div
          className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in-up"
          style={{ animationDelay: '600ms' }}
        >
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                <Truck className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">满箱提醒</h3>
                <p className="text-xs text-gray-500">需要立即清运的回收点</p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-sm font-medium">
              {fullBoxPoints.length} 个
            </span>
          </div>
          <div className="p-5 space-y-4 max-h-80 overflow-y-auto">
            {fullBoxPoints.length === 0 ? (
              <p className="text-center text-gray-500 py-8">暂无满箱回收点</p>
            ) : (
              fullBoxPoints.map((point, index) => (
                <div
                  key={point.id}
                  className="flex items-start gap-4 p-4 rounded-xl bg-orange-50 hover:bg-orange-100 transition-colors cursor-pointer"
                  onClick={() => navigate('/recovery-points')}
                  style={{ animationDelay: `${650 + index * 50}ms` }}
                >
                  <img
                    src={point.photoUrl}
                    alt={point.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-gray-900 truncate">
                        {point.name}
                      </h4>
                      <StatusBadge status={point.status} />
                    </div>
                    <p className="text-sm text-gray-500 mb-2">{point.location}</p>
                    <CapacityProgress point={point} showLabel={false} />
                  </div>
                </div>
              ))
            )}
            {warningPoints.length > 0 && (
              <>
                <p className="text-sm font-medium text-gray-600 pt-2">
                  容量预警 ({warningPoints.length} 个)
                </p>
                {warningPoints.slice(0, 2).map((point, index) => (
                  <div
                    key={point.id}
                    className="flex items-center gap-4 p-3 rounded-xl bg-yellow-50 hover:bg-yellow-100 transition-colors cursor-pointer"
                    onClick={() => navigate('/recovery-points')}
                  >
                    <div className="w-10 h-10 rounded-lg bg-yellow-200 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-yellow-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 text-sm truncate">
                        {point.name}
                      </h4>
                      <CapacityProgress point={point} showLabel={false} />
                    </div>
                    <StatusBadge status={point.status} />
                  </div>
                ))}
              </>
            )}
          </div>
          <div className="p-4 border-t border-gray-100">
            <button
              onClick={() => navigate('/exceptions')}
              className="w-full py-2.5 text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              查看全部清运提醒
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 异常预警 */}
        <div
          className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in-up"
          style={{ animationDelay: '700ms' }}
        >
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">异常预警</h3>
                <p className="text-xs text-gray-500">需要处理的异常情况</p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm font-medium">
              {pendingExceptions.filter(e => e.type !== 'full').length} 个
            </span>
          </div>
          <div className="p-5 space-y-3 max-h-96 overflow-y-auto">
            {pendingExceptions.filter(e => e.type !== 'full').length === 0 ? (
              <p className="text-center text-gray-500 py-8">暂无待处理异常</p>
            ) : (
              pendingExceptions
                .filter(e => e.type !== 'full')
                .map((exception, index) => {
                  const point = recoveryPoints.find(
                    p => p.id === exception.recoveryPointId
                  );
                  return (
                    <div
                      key={exception.id}
                      className="p-4 rounded-xl border border-gray-100 hover:shadow-md transition-all cursor-pointer animate-fade-in-up"
                      onClick={() => navigate('/exceptions')}
                      style={{ animationDelay: `${750 + index * 50}ms` }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <StatusBadge status={exception.type} />
                          <StatusBadge status={exception.severity} type="severity" />
                        </div>
                        <span className="text-xs text-gray-500">
                          {formatDateShort(exception.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray-900 mb-1">
                        {point?.name || '未知回收点'}
                      </p>
                      <p className="text-sm text-gray-500 mb-2">
                        {getExceptionTypeText(exception.type)}：{exception.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">
                          处理人：{exception.handler || '未分配'}
                        </span>
                        <StatusBadge status={exception.status} />
                      </div>
                    </div>
                  );
                })
            )}
          </div>
          <div className="p-4 border-t border-gray-100">
            <button
              onClick={() => navigate('/exceptions')}
              className="w-full py-2.5 text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              查看全部异常
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 回收点状态概览 */}
      <div
        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in-up"
        style={{ animationDelay: '800ms' }}
      >
        <div className="p-5 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">回收点状态概览</h3>
          <p className="text-xs text-gray-500 mt-1">
            共 {recoveryPoints.length} 个回收点，正常 {recoveryPoints.filter(p => p.status === 'normal').length} 个，预警{' '}
            {warningPoints.length} 个，满箱 {fullBoxPoints.length} 个，异常{' '}
            {exceptionPoints.length} 个
          </p>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recoveryPoints.slice(0, 6).map((point, index) => (
              <div
                key={point.id}
                className="p-4 rounded-xl border border-gray-100 hover:shadow-md hover:border-primary-200 transition-all cursor-pointer group animate-fade-in-up"
                onClick={() => navigate('/recovery-points')}
                style={{ animationDelay: `${850 + index * 50}ms` }}
              >
                <div className="flex items-start gap-3 mb-3">
                  <img
                    src={point.photoUrl}
                    alt={point.name}
                    className="w-14 h-14 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors truncate">
                      {point.name}
                    </h4>
                    <p className="text-xs text-gray-500 truncate">{point.location}</p>
                  </div>
                  <StatusBadge status={point.status} />
                </div>
                <CapacityProgress point={point} />
                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                  <span className="text-gray-500">负责人：{point.manager}</span>
                  <span className="text-gray-500">{point.collectionSchedule}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
