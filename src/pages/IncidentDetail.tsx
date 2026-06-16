import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, ChevronLeft, ChevronRight, Clock, User, Wrench,
  CheckCircle, AlertTriangle,
} from 'lucide-react';
import {
  Card, CardContent, Badge, Button, Input, Textarea,
  useToast, Loading, Empty,
} from '@/components/ui';
import { useIncidentStore } from '@/stores/useIncidentStore';
import { useFurnitureStore } from '@/stores/useFurnitureStore';
import { useUserStore } from '@/stores/useUserStore';
import { formatDateTime } from '@/utils/date';
import type { IncidentStatus, IncidentType, IncidentSeverity } from '@/types';

const typeLabels: Record<IncidentType, string> = { damage: '损坏', loss: '丢失' };
const statusLabels: Record<IncidentStatus, string> = { pending: '待处理', processing: '处理中', resolved: '已解决' };
const statusVariants: Record<IncidentStatus, 'warning' | 'info' | 'success'> = { pending: 'warning', processing: 'info', resolved: 'success' };
const severityLabels: Record<IncidentSeverity, string> = { minor: '轻微', moderate: '中等', severe: '严重' };
const severityColors: Record<IncidentSeverity, string> = { minor: 'text-green-600 bg-green-50', moderate: 'text-yellow-600 bg-yellow-50', severe: 'text-red-600 bg-red-50' };

export default function IncidentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { getIncidentById, updateIncidentStatus, loading, fetchIncidents } = useIncidentStore();
  const { furniture, fetchFurniture } = useFurnitureStore();
  const { users, fetchUsers, currentUser } = useUserStore();

  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [repairCost, setRepairCost] = useState('');
  const [resolution, setResolution] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchIncidents();
    fetchFurniture();
    fetchUsers();
  }, [fetchIncidents, fetchFurniture, fetchUsers]);

  const incident = useMemo(() => (id ? getIncidentById(id) : undefined), [id, getIncidentById]);
  const furnitureItem = useMemo(() => (incident ? furniture.find(f => f.id === incident.furnitureId) : undefined), [incident, furniture]);
  const reporter = useMemo(() => (incident ? users.find(u => u.id === incident.reporterId) : undefined), [incident, users]);
  const handler = useMemo(() => (incident?.handlerId ? users.find(u => u.id === incident.handlerId) : undefined), [incident, users]);

  const timeline = useMemo(() => {
    if (!incident) return [];
    const items = [{ time: incident.reportTime, title: '事件上报', description: `${reporter?.username || '未知用户'} 上报了此事件`, icon: AlertTriangle, color: 'text-orange-500', bgColor: 'bg-orange-100' }];
    if (incident.status !== 'pending') {
      items.push({ time: incident.updatedAt, title: '开始处理', description: `${handler?.username || '未知用户'} 开始处理此事件`, icon: Wrench, color: 'text-blue-500', bgColor: 'bg-blue-100' });
    }
    if (incident.status === 'resolved' && incident.resolutionTime) {
      items.push({ time: incident.resolutionTime, title: '处理完成', description: incident.resolution || '事件已解决', icon: CheckCircle, color: 'text-green-500', bgColor: 'bg-green-100' });
    }
    return items;
  }, [incident, reporter, handler]);

  useEffect(() => {
    if (incident) {
      setRepairCost(incident.repairCost?.toString() || '');
      setResolution(incident.resolution || '');
    }
  }, [incident]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (repairCost && isNaN(Number(repairCost))) newErrors.repairCost = '请输入有效的金额';
    if (incident?.status !== 'resolved' && !resolution.trim()) newErrors.resolution = '请填写处理结果';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStatusUpdate = async (newStatus: IncidentStatus) => {
    if (!incident || !currentUser || !validate()) return;
    try {
      await updateIncidentStatus(incident.id, newStatus, currentUser.id, resolution.trim(), repairCost ? Number(repairCost) : undefined);
      showToast.success(newStatus === 'resolved' ? '事件已解决' : '状态更新成功');
    } catch (error) {
      showToast.error(error instanceof Error ? error.message : '更新失败');
    }
  };

  const handlePrevPhoto = () => {
    if (!incident) return;
    setCurrentPhotoIndex(prev => prev === 0 ? incident.photos.length - 1 : prev - 1);
  };

  const handleNextPhoto = () => {
    if (!incident) return;
    setCurrentPhotoIndex(prev => prev === incident.photos.length - 1 ? 0 : prev + 1);
  };

  if (loading && !incident) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex items-center gap-3 border-b border-gray-100 p-4">
          <button type="button" onClick={() => navigate(-1)} className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">事件详情</h1>
        </div>
        <div className="flex-1"><Empty description="事件不存在" /></div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-gray-100 p-4">
        <button type="button" onClick={() => navigate(-1)} className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-semibold text-gray-900">事件详情</h1>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="space-y-4 p-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold text-gray-900">{furnitureItem?.code || '未知桌椅'}</span>
                    <Badge variant={statusVariants[incident.status]} showIcon>{statusLabels[incident.status]}</Badge>
                  </div>
                  <div className="mt-2 flex items-center gap-3 text-sm">
                    <span className="rounded-full px-2 py-0.5 text-xs font-medium text-gray-600 bg-gray-100">{typeLabels[incident.type]}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${severityColors[incident.severity]}`}>{severityLabels[incident.severity]}</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-gray-500"><User className="h-4 w-4" /><span>上报人：{reporter?.username || '未知'}</span></div>
                <div className="flex items-center gap-2 text-gray-500"><Clock className="h-4 w-4" /><span>{formatDateTime(incident.reportTime)}</span></div>
              </div>
              {incident.description && (
                <div className="mt-4 rounded-lg bg-gray-50 p-3">
                  <p className="text-sm font-medium text-gray-700">事件描述</p>
                  <p className="mt-1 text-sm text-gray-600">{incident.description}</p>
                </div>
              )}
              {handler && <div className="mt-4 flex items-center gap-2 text-sm text-gray-500"><Wrench className="h-4 w-4" /><span>处理人：{handler.username}</span></div>}
              {incident.repairCost !== undefined && <div className="mt-2 text-sm text-gray-500">维修费用：¥{incident.repairCost.toFixed(2)}</div>}
            </CardContent>
          </Card>

          {incident.photos.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <h3 className="text-sm font-medium text-gray-700">现场照片</h3>
                <div className="relative mt-3">
                  <div className="aspect-video overflow-hidden rounded-lg bg-gray-100">
                    <img src={incident.photos[currentPhotoIndex]} alt={`照片 ${currentPhotoIndex + 1}`} className="h-full w-full object-cover" />
                  </div>
                  {incident.photos.length > 1 && (
                    <>
                      <button type="button" onClick={handlePrevPhoto} className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white hover:bg-black/50">
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button type="button" onClick={handleNextPhoto} className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white hover:bg-black/50">
                        <ChevronRight className="h-5 w-5" />
                      </button>
                      <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
                        {incident.photos.map((_, index) => (
                          <button key={index} type="button" onClick={() => setCurrentPhotoIndex(index)} className={`h-1.5 rounded-full transition-all ${index === currentPhotoIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/50'}`} />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="p-4">
              <h3 className="text-sm font-medium text-gray-700">处理时间线</h3>
              <div className="mt-4 space-y-4">
                {timeline.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <div key={index} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-full ${item.bgColor}`}><Icon className={`h-4 w-4 ${item.color}`} /></div>
                        {index < timeline.length - 1 && <div className="w-px flex-1 bg-gray-200" />}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900">{item.title}</p>
                          <span className="text-xs text-gray-400">{formatDateTime(item.time)}</span>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">{item.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {incident.status !== 'resolved' && (
            <Card>
              <CardContent className="space-y-4 p-4">
                <h3 className="text-sm font-medium text-gray-700">处理事件</h3>
                <Input
                  label="维修费用（元）" type="number" value={repairCost}
                  onChange={(e) => { setRepairCost(e.target.value); if (errors.repairCost) setErrors(prev => ({ ...prev, repairCost: '' })); }}
                  placeholder="请输入维修费用" error={errors.repairCost}
                />
                <Textarea
                  label="处理结果描述" value={resolution} rows={3}
                  onChange={(e) => { setResolution(e.target.value); if (errors.resolution) setErrors(prev => ({ ...prev, resolution: '' })); }}
                  placeholder="请详细描述处理结果..." error={errors.resolution}
                />
                <div className="flex gap-3">
                  {incident.status === 'pending' && (
                    <Button variant="secondary" className="flex-1" onClick={() => handleStatusUpdate('processing')} disabled={loading}>
                      <Wrench className="mr-2 h-4 w-4" />开始处理
                    </Button>
                  )}
                  <Button className="flex-1" onClick={() => handleStatusUpdate('resolved')} disabled={loading}>
                    <CheckCircle className="mr-2 h-4 w-4" />标记已解决
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {incident.status === 'resolved' && incident.resolution && (
            <Card>
              <CardContent className="p-4">
                <h3 className="text-sm font-medium text-gray-700">处理结果</h3>
                <p className="mt-2 text-sm text-gray-600">{incident.resolution}</p>
                {incident.resolutionTime && <p className="mt-2 text-xs text-gray-400">解决时间：{formatDateTime(incident.resolutionTime)}</p>}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
