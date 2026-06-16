import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Filter, AlertTriangle, Clock, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, Select, Button, Badge, Empty, Loading } from '@/components/ui';
import { useIncidentStore } from '@/stores/useIncidentStore';
import { useFurnitureStore } from '@/stores/useFurnitureStore';
import { formatDateTime } from '@/utils/date';
import type { IncidentType, IncidentStatus, IncidentSeverity } from '@/types';

const typeOptions = [
  { value: '', label: '全部类型' },
  { value: 'damage', label: '损坏' },
  { value: 'loss', label: '丢失' },
];

const statusOptions = [
  { value: '', label: '全部状态' },
  { value: 'pending', label: '待处理' },
  { value: 'processing', label: '处理中' },
  { value: 'resolved', label: '已解决' },
];

const severityOptions = [
  { value: '', label: '全部严重程度' },
  { value: 'minor', label: '轻微' },
  { value: 'moderate', label: '中等' },
  { value: 'severe', label: '严重' },
];

const typeLabels: Record<IncidentType, string> = {
  damage: '损坏',
  loss: '丢失',
};

const statusLabels: Record<IncidentStatus, string> = {
  pending: '待处理',
  processing: '处理中',
  resolved: '已解决',
};

const statusVariants: Record<IncidentStatus, 'warning' | 'info' | 'success'> = {
  pending: 'warning',
  processing: 'info',
  resolved: 'success',
};

const severityLabels: Record<IncidentSeverity, string> = {
  minor: '轻微',
  moderate: '中等',
  severe: '严重',
};

const severityColors: Record<IncidentSeverity, string> = {
  minor: 'text-green-600',
  moderate: 'text-yellow-600',
  severe: 'text-red-600',
};

export default function Incidents() {
  const navigate = useNavigate();
  const { incidents, filteredIncidents, filters, loading, fetchIncidents, setFilters, clearFilters } = useIncidentStore();
  const { furniture, fetchFurniture } = useFurnitureStore();

  useEffect(() => {
    fetchIncidents();
    fetchFurniture();
  }, [fetchIncidents, fetchFurniture]);

  const furnitureMap = useMemo(() => {
    const map = new Map<string, string>();
    furniture.forEach(f => map.set(f.id, f.code));
    return map;
  }, [furniture]);

  const stats = useMemo(() => {
    const total = incidents.length;
    const pending = incidents.filter(i => i.status === 'pending').length;
    const processing = incidents.filter(i => i.status === 'processing').length;
    const resolved = incidents.filter(i => i.status === 'resolved').length;
    return { total, pending, processing, resolved };
  }, [incidents]);

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters({ type: e.target.value as IncidentType | undefined });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters({ status: e.target.value as IncidentStatus | undefined });
  };

  const handleSeverityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters({ severity: e.target.value as IncidentSeverity | undefined });
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between p-4">
        <h1 className="text-xl font-bold text-gray-900">事件管理</h1>
        <Button onClick={() => navigate('/incidents/new')}>
          <Plus className="mr-1 h-4 w-4" />
          新增事件
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-3 px-4">
        <Card className="bg-gray-50">
          <CardContent className="p-3">
            <div className="text-xs text-gray-500">全部</div>
            <div className="mt-1 text-2xl font-bold text-gray-900">{stats.total}</div>
          </CardContent>
        </Card>
        <Card className="bg-yellow-50">
          <CardContent className="p-3">
            <div className="text-xs text-yellow-600">待处理</div>
            <div className="mt-1 text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card className="bg-blue-50">
          <CardContent className="p-3">
            <div className="text-xs text-blue-600">处理中</div>
            <div className="mt-1 text-2xl font-bold text-blue-600">{stats.processing}</div>
          </CardContent>
        </Card>
        <Card className="bg-green-50">
          <CardContent className="p-3">
            <div className="text-xs text-green-600">已解决</div>
            <div className="mt-1 text-2xl font-bold text-green-600">{stats.resolved}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-3 px-4 py-3">
        <Filter className="h-4 w-4 text-gray-400" />
        <Select
          value={filters.type || ''}
          onChange={handleTypeChange}
          options={typeOptions}
          wrapperClassName="w-28"
        />
        <Select
          value={filters.status || ''}
          onChange={handleStatusChange}
          options={statusOptions}
          wrapperClassName="w-28"
        />
        <Select
          value={filters.severity || ''}
          onChange={handleSeverityChange}
          options={severityOptions}
          wrapperClassName="w-32"
        />
        {(filters.type || filters.status || filters.severity) && (
          <Button variant="outline" size="sm" onClick={clearFilters}>
            清除筛选
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {filteredIncidents.length === 0 ? (
          <Empty description="暂无事件记录" />
        ) : (
          <div className="space-y-3">
            {filteredIncidents.map(incident => (
              <Card
                key={incident.id}
                className="cursor-pointer transition-all hover:shadow-md"
                onClick={() => navigate(`/incidents/${incident.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">
                          {furnitureMap.get(incident.furnitureId) || '未知桌椅'}
                        </span>
                        <Badge variant={statusVariants[incident.status]} showIcon>
                          {statusLabels[incident.status]}
                        </Badge>
                      </div>
                      <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          {incident.type === 'damage' ? (
                            <AlertTriangle className="h-3.5 w-3.5 text-orange-500" />
                          ) : (
                            <Clock className="h-3.5 w-3.5 text-red-500" />
                          )}
                          {typeLabels[incident.type]}
                        </span>
                        <span className={`flex items-center gap-1 ${severityColors[incident.severity]}`}>
                          {severityLabels[incident.severity]}
                        </span>
                        <span className="flex items-center gap-1 text-gray-400">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          {formatDateTime(incident.reportTime)}
                        </span>
                      </div>
                      {incident.description && (
                        <p className="mt-2 line-clamp-1 text-sm text-gray-500">
                          {incident.description}
                        </p>
                      )}
                    </div>
                    {incident.photos.length > 0 && (
                      <div className="ml-3 flex h-12 w-12 overflow-hidden rounded-lg">
                        <img
                          src={incident.photos[0]}
                          alt="事件照片"
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
