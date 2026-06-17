import { Link } from 'react-router-dom';
import { 
  BarChart3, 
  ArrowLeft, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Car,
  Baby,
  Calendar,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { useVehicleStore } from '@/store/useVehicleStore';
import { useSeatStore } from '@/store/useSeatStore';
import { useInstallationStore } from '@/store/useInstallationStore';
import { useInspectionStore } from '@/store/useInspectionStore';
import { 
  getAllVehicleRecheckInfo, 
  getAllSeatExpiryInfo, 
  getInspectionStats,
  formatStatusText,
  formatStatusBgColor
} from '@/utils/statistics';
import { formatDate } from '@/utils/date';
import { ORIENTATION_LABELS } from '@/types';

export default function StatisticsPage() {
  const { vehicles } = useVehicleStore();
  const { seats } = useSeatStore();
  const { installations } = useInstallationStore();
  const { inspections } = useInspectionStore();

  const vehicleRecheckInfo = getAllVehicleRecheckInfo(vehicles, installations, inspections, seats);
  const seatExpiryInfo = getAllSeatExpiryInfo(seats);
  const inspectionStats = getInspectionStats(inspections);

  const longestUnrechecked = vehicleRecheckInfo[0];
  const mostUrgentExpiry = seatExpiryInfo[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/" className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-secondary-500">统计分析</h1>
          <p className="text-gray-500 mt-1">查看安全座椅使用情况和安全预警</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-4 animate-fade-in-up" style={{ animationDelay: '0ms' }}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
              <Car className="w-6 h-6 text-primary-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">登记车辆</p>
              <p className="text-2xl font-bold text-gray-900">{vehicles.length}</p>
            </div>
          </div>
        </div>

        <div className="card p-4 animate-fade-in-up" style={{ animationDelay: '50ms' }}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <Baby className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">安全座椅</p>
              <p className="text-2xl font-bold text-gray-900">{seats.length}</p>
            </div>
          </div>
        </div>

        <div className="card p-4 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">检查通过率</p>
              <p className="text-2xl font-bold text-gray-900">{inspectionStats.passRate.toFixed(1)}%</p>
            </div>
          </div>
        </div>

        <div className="card p-4 animate-fade-in-up" style={{ animationDelay: '150ms' }}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">总检查次数</p>
              <p className="text-2xl font-bold text-gray-900">{inspectionStats.total}</p>
            </div>
          </div>
        </div>
      </div>

      {longestUnrechecked && longestUnrechecked.status !== 'normal' && (
        <div className={`card p-4 border-l-4 ${
          longestUnrechecked.status === 'danger' ? 'border-red-500' : 'border-amber-500'
        } animate-fade-in-up`} style={{ animationDelay: '200ms' }}>
          <div className="flex items-start gap-3">
            <AlertTriangle className={`w-6 h-6 flex-shrink-0 ${
              longestUnrechecked.status === 'danger' ? 'text-red-500' : 'text-amber-500'
            }`} />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">最久未复查车辆预警</h3>
              <p className="text-gray-600 mb-2">
                <span className="font-medium">{longestUnrechecked.vehicle.brand} {longestUnrechecked.vehicle.model}</span>
                {' '}({longestUnrechecked.vehicle.plateNumber})
                {' '}已 {longestUnrechecked.daysSinceLastInspection} 天未复查
              </p>
              {longestUnrechecked.lastInspection ? (
                <p className="text-sm text-gray-500">
                  上次检查: {formatDate(longestUnrechecked.lastInspection.date)}
                </p>
              ) : (
                <p className="text-sm text-gray-500">尚未进行过安装检查</p>
              )}
            </div>
            <Link 
              to="/inspection" 
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                longestUnrechecked.status === 'danger' 
                  ? 'bg-red-500 text-white hover:bg-red-600' 
                  : 'bg-amber-500 text-white hover:bg-amber-600'
              } transition-colors`}
            >
              立即复查
            </Link>
          </div>
        </div>
      )}

      {mostUrgentExpiry && mostUrgentExpiry.status !== 'normal' && (
        <div className={`card p-4 border-l-4 ${
          mostUrgentExpiry.status === 'danger' ? 'border-red-500' : 'border-amber-500'
        } animate-fade-in-up`} style={{ animationDelay: '250ms' }}>
          <div className="flex items-start gap-3">
            <AlertCircle className={`w-6 h-6 flex-shrink-0 ${
              mostUrgentExpiry.status === 'danger' ? 'text-red-500' : 'text-amber-500'
            }`} />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">座椅即将过期预警</h3>
              <p className="text-gray-600 mb-2">
                <span className="font-medium">{mostUrgentExpiry.seat.brand} {mostUrgentExpiry.seat.model}</span>
                {' '}将在 {mostUrgentExpiry.daysUntilExpiry} 天后过期
              </p>
              <p className="text-sm text-gray-500">
                过期日期: {formatDate(mostUrgentExpiry.seat.expiryDate)}
              </p>
            </div>
            <Link 
              to="/seats" 
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                mostUrgentExpiry.status === 'danger' 
                  ? 'bg-red-500 text-white hover:bg-red-600' 
                  : 'bg-amber-500 text-white hover:bg-amber-600'
              } transition-colors`}
            >
              查看详情
            </Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary-500" />
              车辆复查状态
            </h2>
            <span className="text-sm text-gray-500">按未复查天数排序</span>
          </div>

          {vehicleRecheckInfo.length === 0 ? (
            <div className="text-center py-8">
              <Car className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">暂无车辆数据</p>
            </div>
          ) : (
            <div className="space-y-3">
              {vehicleRecheckInfo.map((info, index) => (
                <div 
                  key={info.vehicle.id}
                  className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-sm font-semibold text-gray-500 shadow-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900 truncate">
                        {info.vehicle.brand} {info.vehicle.model}
                      </span>
                      <span className={`badge ${formatStatusBgColor(info.status)}`}>
                        {formatStatusText(info.status)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>{info.vehicle.plateNumber}</span>
                      {info.seat && (
                        <span className="flex items-center gap-1">
                          <Baby className="w-3 h-3" />
                          {info.seat.brand}
                        </span>
                      )}
                      {info.installation && (
                        <span>{ORIENTATION_LABELS[info.installation.orientation]}</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${
                      info.status === 'danger' ? 'text-red-600' :
                      info.status === 'warning' ? 'text-amber-600' : 'text-emerald-600'
                    }`}>
                      {info.daysSinceLastInspection >= 999 ? '未检查' : `${info.daysSinceLastInspection}天`}
                    </p>
                    <p className="text-xs text-gray-500">
                      {info.daysSinceLastInspection >= 999 ? '请尽快检查' : '未复查'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-6 animate-fade-in-up" style={{ animationDelay: '350ms' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary-500" />
              座椅有效期状态
            </h2>
            <span className="text-sm text-gray-500">按过期天数排序</span>
          </div>

          {seatExpiryInfo.length === 0 ? (
            <div className="text-center py-8">
              <Baby className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">暂无座椅数据</p>
            </div>
          ) : (
            <div className="space-y-3">
              {seatExpiryInfo.map((info, index) => (
                <div 
                  key={info.seat.id}
                  className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-sm font-semibold text-gray-500 shadow-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900 truncate">
                        {info.seat.brand} {info.seat.model}
                      </span>
                      <span className={`badge ${formatStatusBgColor(info.status)}`}>
                        {formatStatusText(info.status)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>适用: {info.seat.weightRange}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${
                      info.status === 'danger' ? 'text-red-600' :
                      info.status === 'warning' ? 'text-amber-600' : 'text-emerald-600'
                    }`}>
                      {info.daysUntilExpiry <= 0 
                        ? `已过期${Math.abs(info.daysUntilExpiry)}天` 
                        : `${info.daysUntilExpiry}天`}
                    </p>
                    <p className="text-xs text-gray-500">
                      {info.daysUntilExpiry <= 0 ? '请立即更换' : '后过期'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card p-6 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-6">
          <TrendingUp className="w-5 h-5 text-primary-500" />
          检查统计概览
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 rounded-xl bg-gray-50">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-2">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{inspectionStats.total}</p>
            <p className="text-sm text-gray-500">总检查次数</p>
          </div>

          <div className="text-center p-4 rounded-xl bg-gray-50">
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-2">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            </div>
            <p className="text-2xl font-bold text-emerald-600">{inspectionStats.passed}</p>
            <p className="text-sm text-gray-500">通过次数</p>
          </div>

          <div className="text-center p-4 rounded-xl bg-gray-50">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-2">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <p className="text-2xl font-bold text-red-600">{inspectionStats.failed}</p>
            <p className="text-sm text-gray-500">未通过次数</p>
          </div>

          <div className="text-center p-4 rounded-xl bg-gray-50">
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-2">
              <TrendingUp className="w-6 h-6 text-amber-600" />
            </div>
            <p className="text-2xl font-bold text-amber-600">{inspectionStats.last30Days.passRate.toFixed(1)}%</p>
            <p className="text-sm text-gray-500">近30天通过率</p>
          </div>
        </div>

        {inspectionStats.last30Days.total > 0 && (
          <div className="mt-6 p-4 rounded-xl bg-amber-50 border border-amber-100">
            <p className="text-sm text-amber-700">
              <span className="font-medium">近30天检查情况：</span>
              共检查 {inspectionStats.last30Days.total} 次，通过 {inspectionStats.last30Days.passed} 次，
              通过率 {inspectionStats.last30Days.passRate.toFixed(1)}%
              {inspectionStats.last30Days.passRate < 80 && (
                <span className="text-amber-600 ml-2">⚠️ 通过率较低，建议加强安装规范学习</span>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
