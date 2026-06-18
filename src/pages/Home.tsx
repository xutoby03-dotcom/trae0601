import { Link } from 'react-router-dom';
import {
  Plus,
  Calendar,
  AlertTriangle,
  Wrench,
  Stethoscope,
  Activity,
  TrendingUp,
  Download,
  ChevronRight,
  CheckCircle,
  XCircle,
  Clock,
  Battery,
  Scale,
  Heart,
} from 'lucide-react';
import { useAppStore } from '../store';
import { checkIfMeasuredToday, getAbnormalCount, getDaysUntilVisit } from '../services/alertService';
import { getSummaryStats } from '../services/exportService';
import { cn, getRecentMeasurements } from '../lib/utils';
import AlertBanner from '../components/AlertBanner';

export default function Home() {
  const { device, measurements, alerts, settings } = useAppStore();
  
  const measuredToday = checkIfMeasuredToday(measurements);
  const abnormalLast7Days = getAbnormalCount(measurements, 7);
  const daysUntilVisit = getDaysUntilVisit(settings.nextVisitDate);
  const summaryStats = getSummaryStats(measurements, settings.nextVisitDate);
  
  const deviceAlerts = alerts.filter((a) => a.type === 'calibration' || a.type === 'battery' || a.type === 'cuff');
  const hasDeviceIssues = deviceAlerts.length > 0;
  
  const visitIssues = [];
  if (daysUntilVisit !== null && daysUntilVisit <= 7 && daysUntilVisit > 0) {
    visitIssues.push('距离下次复诊还有 ' + daysUntilVisit + ' 天，请准备好记录');
  }
  if (daysUntilVisit !== null && daysUntilVisit <= 0) {
    visitIssues.push('已到复诊日期，请及时就诊');
  }
  if (abnormalLast7Days > 3) {
    visitIssues.push('近7天有 ' + abnormalLast7Days + ' 次异常读数，复诊时请告知医生');
  }
  if (hasDeviceIssues) {
    visitIssues.push('设备有维护提醒，复诊时可咨询医生');
  }

  const quickActions = [
    {
      icon: Plus,
      label: '新增测量',
      description: '记录今天的血压',
      to: '/records',
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600',
    },
    {
      icon: TrendingUp,
      label: '查看趋势',
      description: '分析血压变化',
      to: '/trends',
      color: 'bg-emerald-500',
      hoverColor: 'hover:bg-emerald-600',
    },
    {
      icon: Wrench,
      label: '设备维护',
      description: '校准和电量提醒',
      to: '/device',
      color: 'bg-amber-500',
      hoverColor: 'hover:bg-amber-600',
    },
    {
      icon: Download,
      label: '导出报告',
      description: '准备复诊资料',
      to: '/export',
      color: 'bg-purple-500',
      hoverColor: 'hover:bg-purple-600',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">血压管理</h1>
        <p className="text-gray-500">关心您的健康，从每天测量开始</p>
      </div>

      <AlertBanner />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className={cn(
          'bg-white rounded-2xl p-6 shadow-sm border transition-all duration-300',
          measuredToday ? 'border-emerald-200' : 'border-amber-200'
        )}>
          <div className="flex items-start justify-between mb-4">
            <div className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center',
              measuredToday ? 'bg-emerald-100' : 'bg-amber-100'
            )}>
              {measuredToday ? (
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              ) : (
                <XCircle className="w-6 h-6 text-amber-600" />
              )}
            </div>
            <span className={cn(
              'px-3 py-1 rounded-full text-sm font-medium',
              measuredToday
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-amber-100 text-amber-700'
            )}>
              今日
            </span>
          </div>
          <h3 className="text-sm text-gray-500 mb-1">今日测量</h3>
          <p className={cn(
            'text-2xl font-bold',
            measuredToday ? 'text-emerald-600' : 'text-amber-600'
          )}>
            {measuredToday ? '已完成' : '未测量'}
          </p>
          {!measuredToday && (
            <Link
              to="/records"
              className="inline-flex items-center gap-1 mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              立即测量 <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between mb-4">
            <div className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center',
              abnormalLast7Days > 0 ? 'bg-red-100' : 'bg-emerald-100'
            )}>
              <AlertTriangle className={cn(
                'w-6 h-6',
                abnormalLast7Days > 0 ? 'text-red-600' : 'text-emerald-600'
              )} />
            </div>
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-600">
              近7天
            </span>
          </div>
          <h3 className="text-sm text-gray-500 mb-1">异常读数</h3>
          <p className={cn(
            'text-2xl font-bold',
            abnormalLast7Days > 0 ? 'text-red-600' : 'text-emerald-600'
          )}>
            {abnormalLast7Days} 次
          </p>
          {abnormalLast7Days > 0 && (
            <p className="text-xs text-red-500 mt-2">
              请留意血压变化，必要时咨询医生
            </p>
          )}
        </div>

        <div className={cn(
          'bg-white rounded-2xl p-6 shadow-sm border transition-all duration-300',
          hasDeviceIssues ? 'border-red-200' : 'border-gray-100'
        )}>
          <div className="flex items-start justify-between mb-4">
            <div className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center',
              hasDeviceIssues ? 'bg-red-100' : 'bg-blue-100'
            )}>
              <Wrench className={cn(
                'w-6 h-6',
                hasDeviceIssues ? 'text-red-600' : 'text-blue-600'
              )} />
            </div>
            <span className={cn(
              'px-3 py-1 rounded-full text-sm font-medium',
              hasDeviceIssues ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
            )}>
              {hasDeviceIssues ? '需注意' : '正常'}
            </span>
          </div>
          <h3 className="text-sm text-gray-500 mb-1">设备状态</h3>
          <div className="space-y-2">
            {device && (
              <>
                <div className="flex items-center gap-2">
                  <Battery className={cn(
                    'w-4 h-4',
                    device.batteryLevel < 20 ? 'text-red-500' : 'text-emerald-500'
                  )} />
                  <span className="text-sm text-gray-700">
                    电量 {device.batteryLevel}%
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Scale className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-gray-700">
                    袖带：{device.cuffSize}
                  </span>
                </div>
              </>
            )}
          </div>
          {hasDeviceIssues && (
            <Link
              to="/device"
              className="inline-flex items-center gap-1 mt-3 text-sm text-red-600 hover:text-red-700 font-medium"
            >
              查看详情 <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
              <Stethoscope className="w-6 h-6 text-purple-600" />
            </div>
            {daysUntilVisit !== null && (
              <span className={cn(
                'px-3 py-1 rounded-full text-sm font-medium',
                daysUntilVisit <= 7 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
              )}>
                {daysUntilVisit > 0 ? `${daysUntilVisit}天后` : '已到'}
              </span>
            )}
          </div>
          <h3 className="text-sm text-gray-500 mb-1">下次复诊</h3>
          <p className="text-xl font-bold text-gray-900">
            {settings.nextVisitDate || '未设置'}
          </p>
          {settings.nextVisitDate && (
            <Link
              to="/trends"
              className="inline-flex items-center gap-1 mt-3 text-sm text-purple-600 hover:text-purple-700 font-medium"
            >
              准备报告 <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>

      {visitIssues.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-amber-900 mb-3">复诊前请注意</h3>
              <ul className="space-y-2">
                {visitIssues.map((issue, index) => (
                  <li key={index} className="flex items-center gap-2 text-amber-800">
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full flex-shrink-0" />
                    {issue}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {quickActions.map((action) => (
          <Link
            key={action.label}
            to={action.to}
            className={cn(
              'group p-6 rounded-2xl text-white transition-all duration-300 transform hover:scale-105 hover:shadow-xl',
              action.color,
              action.hoverColor
            )}
          >
            <action.icon className="w-8 h-8 mb-3 opacity-90" />
            <h3 className="font-semibold text-lg mb-1">{action.label}</h3>
            <p className="text-sm opacity-80">{action.description}</p>
            <ChevronRight className="w-5 h-5 mt-3 opacity-70 group-hover:translate-x-1 transition-transform" />
          </Link>
        ))}
      </div>

      {summaryStats && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">近期数据概览</h3>
            <Link
              to="/trends"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              查看详情 <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-gradient-to-br from-red-50 to-rose-50 rounded-xl">
              <Activity className="w-6 h-6 text-red-500 mx-auto mb-2" />
              <p className="text-sm text-gray-500 mb-1">平均收缩压</p>
              <p className="text-2xl font-bold text-gray-900">{summaryStats.avgSystolic}</p>
              <p className="text-xs text-gray-400">mmHg</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
              <Activity className="w-6 h-6 text-blue-500 mx-auto mb-2" />
              <p className="text-sm text-gray-500 mb-1">平均舒张压</p>
              <p className="text-2xl font-bold text-gray-900">{summaryStats.avgDiastolic}</p>
              <p className="text-xs text-gray-400">mmHg</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
              <Heart className="w-6 h-6 text-purple-500 mx-auto mb-2" />
              <p className="text-sm text-gray-500 mb-1">平均心率</p>
              <p className="text-2xl font-bold text-gray-900">{summaryStats.avgHeartRate}</p>
              <p className="text-xs text-gray-400">次/分</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl">
              <Clock className="w-6 h-6 text-gray-500 mx-auto mb-2" />
              <p className="text-sm text-gray-500 mb-1">测量次数</p>
              <p className="text-2xl font-bold text-gray-900">{summaryStats.totalMeasurements}</p>
              <p className="text-xs text-gray-400">次</p>
            </div>
          </div>
        </div>
      )}

      {measurements.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">最近测量</h3>
            <Link
              to="/records"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              全部记录 <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {getRecentMeasurements(measurements, 5).map((measurement) => {
              const pulsePressure = measurement.systolic - measurement.diastolic;
              return (
                <div
                  key={measurement.id}
                  className={cn(
                    'flex items-center justify-between p-4 rounded-xl transition-colors',
                    measurement.isAbnormal
                      ? 'bg-red-50 hover:bg-red-100'
                      : 'bg-gray-50 hover:bg-gray-100'
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center',
                      measurement.isAbnormal ? 'bg-red-100' : 'bg-emerald-100'
                    )}>
                      <Activity className={cn(
                        'w-5 h-5',
                        measurement.isAbnormal ? 'text-red-500' : 'text-emerald-500'
                      )} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {measurement.systolic} / {measurement.diastolic} mmHg
                      </p>
                      <p className="text-sm text-gray-500">
                        {measurement.date} {measurement.time} · 心率 {measurement.heartRate} bpm
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={cn(
                      'px-2 py-0.5 rounded-full text-xs font-medium',
                      measurement.isAbnormal
                        ? 'bg-red-100 text-red-700'
                        : 'bg-emerald-100 text-emerald-700'
                    )}>
                      {measurement.isAbnormal ? '异常' : '正常'}
                    </span>
                    <div className="text-right hidden sm:block">
                      <p className="text-sm text-gray-500">脉压差 {pulsePressure}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
