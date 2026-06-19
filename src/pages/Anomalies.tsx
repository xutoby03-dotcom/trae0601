import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle,
  Droplets,
  Bug,
  Leaf,
  Clock,
  MapPin,
  User,
  Filter,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Search,
  Info,
} from 'lucide-react';
import { useStore } from '../store/useStore.js';
import {
  ANOMALY_TYPE_LABELS,
  ANOMALY_SEVERITY_LABELS,
  ANOMALY_STATUS_LABELS,
  CROP_EMOJIS,
} from '@shared/types.js';
import { formatDateTime, formatRelativeTime } from '../utils/dateUtils.js';
import type { Anomaly, AnomalyType, AnomalySeverity, AnomalyStatus } from '@shared/types.js';

const AnomaliesPage: React.FC = () => {
  const { anomalies, gardenBeds, volunteers, loading, fetchAnomalies, updateAnomaly } = useStore();

  const [filterType, setFilterType] = useState<AnomalyType | 'all'>('all');
  const [filterSeverity, setFilterSeverity] = useState<AnomalySeverity | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<AnomalyStatus | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchAnomalies();
  }, [fetchAnomalies]);

  const anomalyTypes: (AnomalyType | 'all')[] = ['all', 'duplicate_watering', 'missed_watering', 'pest_infestation', 'excessive_weeds', 'low_soil_moisture', 'other'];
  const severityLevels: (AnomalySeverity | 'all')[] = ['all', 'low', 'medium', 'high', 'critical'];
  const statuses: (AnomalyStatus | 'all')[] = ['all', 'pending', 'resolved', 'dismissed'];

  const filteredAnomalies = anomalies
    .filter((anomaly) => {
      const bed = gardenBeds.find((b) => b.id === anomaly.gardenBedId);
      const volunteer = volunteers.find((v) => v.id === anomaly.detectedByVolunteerId);
      const matchesType = filterType === 'all' || anomaly.type === filterType;
      const matchesSeverity = filterSeverity === 'all' || anomaly.severity === filterSeverity;
      const matchesStatus = filterStatus === 'all' || anomaly.status === filterStatus;
      const matchesSearch =
        !searchTerm ||
        (bed && bed.bedNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (volunteer && volunteer.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        anomaly.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesType && matchesSeverity && matchesStatus && matchesSearch;
    })
    .sort((a, b) => {
      if (a.status !== b.status) {
        const order = { pending: 0, dismissed: 1, resolved: 2 };
        return order[a.status] - order[b.status];
      }
      if (a.severity !== b.severity) {
        const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        return severityOrder[a.severity] - severityOrder[b.severity];
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const getTypeIcon = (type: AnomalyType) => {
    switch (type) {
      case 'duplicate_watering':
        return <Droplets size={18} />;
      case 'missed_watering':
        return <Clock size={18} />;
      case 'pest_infestation':
        return <Bug size={18} />;
      case 'excessive_weeds':
        return <Leaf size={18} />;
      case 'low_soil_moisture':
        return <AlertTriangle size={18} />;
      default:
        return <Info size={18} />;
    }
  };

  const getSeverityColor = (severity: AnomalySeverity) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600 bg-red-100 border-red-200';
      case 'high':
        return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'medium':
        return 'text-sun-600 bg-sun-100 border-sun-200';
      case 'low':
        return 'text-primary-600 bg-primary-100 border-primary-200';
    }
  };

  const getStatusBadgeClass = (status: AnomalyStatus) => {
    switch (status) {
      case 'pending':
        return 'badge status-unclaimed';
      case 'resolved':
        return 'badge status-completed';
      case 'dismissed':
        return 'badge status-claimed';
    }
  };

  const handleResolve = async (id: string) => {
    if (window.confirm('确定要标记此异常为已处理吗？')) {
      await updateAnomaly(id, { status: 'resolved' });
    }
  };

  const handleDismiss = async (id: string) => {
    if (window.confirm('确定要忽略此异常吗？')) {
      await updateAnomaly(id, { status: 'dismissed' });
    }
  };

  const getStats = () => {
    const stats = {
      total: anomalies.length,
      pending: anomalies.filter((a) => a.status === 'pending').length,
      resolved: anomalies.filter((a) => a.status === 'resolved').length,
      critical: anomalies.filter((a) => a.severity === 'critical' && a.status === 'pending').length,
    };
    return stats;
  };

  const stats = getStats();

  const getGardenBed = (id: string) => gardenBeds.find((b) => b.id === id);
  const getVolunteer = (id: string) => volunteers.find((v) => v.id === id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-forest-800">异常中心</h1>
        <p className="text-forest-600 mt-1">
          共 {stats.total} 条异常 · {stats.pending} 条待处理
        </p>
      </div>

      {stats.critical > 0 && (
        <div className="card bg-gradient-to-r from-red-50 to-sun-50 border-2 border-red-300 animate-pulse-soft">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 rounded-xl">
              <AlertTriangle size={28} className="text-red-600" />
            </div>
            <div>
              <h3 className="font-bold text-red-800">⚠️ 有 {stats.critical} 条严重异常待处理</h3>
              <p className="text-red-600 text-sm">请尽快处理，避免影响作物生长</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-forest-500 text-sm">待处理</p>
          <p className="text-2xl font-bold text-sun-600">{stats.pending}</p>
        </div>
        <div className="card">
          <p className="text-forest-500 text-sm">严重</p>
          <p className="text-2xl font-bold text-red-600">{stats.critical}</p>
        </div>
        <div className="card">
          <p className="text-forest-500 text-sm">已处理</p>
          <p className="text-2xl font-bold text-primary-600">{stats.resolved}</p>
        </div>
        <div className="card">
          <p className="text-forest-500 text-sm">总数</p>
          <p className="text-2xl font-bold text-forest-800">{stats.total}</p>
        </div>
      </div>

      <div className="card">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-forest-400" />
            <input
              type="text"
              placeholder="搜索菜畦、志愿者、异常描述..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10 w-full"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as AnomalyType | 'all')}
              className="input min-w-[130px]"
            >
              <option value="all">全部类型</option>
              {anomalyTypes.slice(1).map((type) => (
                <option key={type} value={type}>
                  {ANOMALY_TYPE_LABELS[type as AnomalyType]}
                </option>
              ))}
            </select>
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value as AnomalySeverity | 'all')}
              className="input min-w-[110px]"
            >
              <option value="all">全部严重</option>
              {severityLevels.slice(1).map((level) => (
                <option key={level} value={level}>
                  {ANOMALY_SEVERITY_LABELS[level as AnomalySeverity]}
                </option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as AnomalyStatus | 'all')}
              className="input min-w-[110px]"
            >
              <option value="all">全部状态</option>
              {statuses.slice(1).map((status) => (
                <option key={status} value={status}>
                  {ANOMALY_STATUS_LABELS[status as AnomalyStatus]}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {filteredAnomalies.length === 0 ? (
        <div className="card text-center py-12">
          <CheckCircle size={48} className="mx-auto mb-3 text-primary-300" />
          <p className="text-forest-500">
            {searchTerm || filterType !== 'all' || filterSeverity !== 'all' || filterStatus !== 'all'
              ? '没有找到匹配的异常'
              : '暂无异常记录，一切正常 🌱'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAnomalies.map((anomaly) => {
            const bed = getGardenBed(anomaly.gardenBedId);
            const volunteer = getVolunteer(anomaly.detectedByVolunteerId || '');
            const isExpanded = expandedId === anomaly.id;

            return (
              <div
                key={anomaly.id}
                className={`card transition-all ${
                  anomaly.status === 'pending' ? 'border-l-4 border-l-sun-500' : ''
                } ${anomaly.severity === 'critical' ? 'border-l-4 border-l-red-500' : ''}`}
              >
                <div
                  className="flex items-start justify-between cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : anomaly.id)}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`p-2 rounded-xl border ${getSeverityColor(anomaly.severity)}`}
                    >
                      {getTypeIcon(anomaly.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-forest-800">
                          {ANOMALY_TYPE_LABELS[anomaly.type]}
                        </p>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${getSeverityColor(
                            anomaly.severity
                          )}`}
                        >
                          {ANOMALY_SEVERITY_LABELS[anomaly.severity]}
                        </span>
                        <span className={getStatusBadgeClass(anomaly.status)}>
                          {ANOMALY_STATUS_LABELS[anomaly.status]}
                        </span>
                      </div>
                      <p className="text-forest-600 mt-1">{anomaly.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-forest-500">
                        {bed && (
                          <span className="flex items-center gap-1">
                            <MapPin size={12} />
                            {CROP_EMOJIS[bed.crop] || '🌱'} {bed.bedNumber} - {bed.crop}
                          </span>
                        )}
                        {volunteer && (
                          <span className="flex items-center gap-1">
                            <User size={12} />
                            {volunteer.name}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {formatRelativeTime(new Date(anomaly.createdAt))}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button className="p-2 text-forest-400 hover:text-forest-600 transition-colors">
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                </div>

                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-cream-200 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="bg-cream-50 rounded-lg p-3">
                        <span className="text-forest-500">检测时间</span>
                        <p className="font-medium text-forest-800">
                          {formatDateTime(new Date(anomaly.createdAt))}
                        </p>
                      </div>
                      <div className="bg-cream-50 rounded-lg p-3">
                        <span className="text-forest-500">异常ID</span>
                        <p className="font-medium text-forest-800 font-mono text-xs">
                          {anomaly.id}
                        </p>
                      </div>
                      {anomaly.checkInId && (
                        <div className="bg-cream-50 rounded-lg p-3">
                          <span className="text-forest-500">关联打卡</span>
                          <p className="font-medium text-forest-800 font-mono text-xs">
                            {anomaly.checkInId}
                          </p>
                        </div>
                      )}
                      {anomaly.resolvedAt && (
                        <div className="bg-cream-50 rounded-lg p-3">
                          <span className="text-forest-500">处理时间</span>
                          <p className="font-medium text-forest-800">
                            {formatDateTime(new Date(anomaly.resolvedAt))}
                          </p>
                        </div>
                      )}
                    </div>

                    {anomaly.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleResolve(anomaly.id);
                          }}
                          className="btn btn-primary flex-1 justify-center"
                        >
                          <Check size={16} />
                          标记为已处理
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDismiss(anomaly.id);
                          }}
                          className="btn btn-outline flex-1 justify-center"
                        >
                          <X size={16} />
                          忽略
                        </button>
                      </div>
                    )}

                    {anomaly.status !== 'pending' && (
                      <div className="text-center text-sm text-forest-500">
                        {anomaly.status === 'resolved' ? (
                          <span className="text-primary-600">✓ 此异常已处理</span>
                        ) : (
                          <span className="text-forest-400">此异常已被忽略</span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AnomaliesPage;
