import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Badge, Button, Modal, Empty, Loading } from '@/components/ui';
import { useFurnitureStore } from '@/stores/useFurnitureStore';
import { useIncidentStore } from '@/stores/useIncidentStore';
import type { FurnitureStatus, Incident } from '@/types';
import { format } from '@/utils/date';
import { ArrowLeft, Edit3, Trash2, Plus, AlertCircle, Clock, MapPin, Package, Umbrella, Tag } from 'lucide-react';

const statusMap: Record<FurnitureStatus, { label: string; variant: 'success' | 'warning' | 'danger' }> = {
  normal: { label: '正常', variant: 'success' },
  repairing: { label: '维修中', variant: 'warning' },
  lost: { label: '已丢失', variant: 'danger' },
};

const areaMap: Record<string, string> = {
  'outdoor-east': '东区',
  'outdoor-west': '西区',
  'outdoor-south': '南区',
  'outdoor-north': '北区',
};

const typeMap: Record<string, string> = {
  chair: '椅子',
  table: '桌子',
  umbrella: '遮阳伞',
};

const materialMap: Record<string, string> = {
  wood: '木质',
  metal: '金属',
  plastic: '塑料',
  rattan: '藤编',
};

const severityMap: Record<string, { label: string; color: string }> = {
  minor: { label: '轻微', color: 'text-green-600 bg-green-50' },
  moderate: { label: '中等', color: 'text-yellow-600 bg-yellow-50' },
  severe: { label: '严重', color: 'text-red-600 bg-red-50' },
};

export default function FurnitureDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getFurnitureById, fetchFurniture, deleteFurniture, loading } = useFurnitureStore();
  const { incidents, fetchIncidents, getIncidentsByFurniture } = useIncidentStore();
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const furniture = id ? getFurnitureById(id) : undefined;
  const furnitureIncidents: Incident[] = id ? getIncidentsByFurniture(id) : [];

  useEffect(() => {
    fetchFurniture();
    fetchIncidents();
  }, [fetchFurniture, fetchIncidents]);

  const handleDelete = async () => {
    if (!id) return;
    setDeleteLoading(true);
    try {
      await deleteFurniture(id);
      navigate('/furniture');
    } catch (error) {
      console.error('删除失败:', error);
    } finally {
      setDeleteLoading(false);
      setShowDeleteModal(false);
    }
  };

  if (loading && !furniture) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  if (!furniture) {
    return (
      <div className="flex h-screen flex-col items-center justify-center">
        <Empty description="桌椅不存在或已被删除" />
        <Button className="mt-4" onClick={() => navigate('/furniture')}>
          返回列表
        </Button>
      </div>
    );
  }

  const status = statusMap[furniture.status];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
        <button
          onClick={() => navigate(-1)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-50"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-semibold text-gray-900">桌椅详情</h1>
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/furniture/${furniture.id}/edit`)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-50"
          >
            <Edit3 className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="space-y-4 p-4">
        <div className="overflow-hidden rounded-xl bg-white shadow-sm">
          {furniture.photo ? (
            <img
              src={furniture.photo}
              alt={furniture.code}
              className="h-64 w-full object-cover"
            />
          ) : (
            <div className="flex h-64 w-full items-center justify-center bg-gray-100">
              <Package className="h-16 w-16 text-gray-300" />
            </div>
          )}
          <div className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{furniture.code}</h2>
                {furniture.name && (
                  <p className="mt-1 text-sm text-gray-500">{furniture.name}</p>
                )}
              </div>
              <Badge variant={status.variant} showIcon>
                {status.label}
              </Badge>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white p-4 shadow-sm">
          <h3 className="mb-4 font-semibold text-gray-900">基本信息</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-gray-400" />
              <div className="flex-1">
                <span className="text-sm text-gray-500">区域</span>
                <p className="text-gray-900">{areaMap[furniture.area]}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Tag className="h-5 w-5 text-gray-400" />
              <div className="flex-1">
                <span className="text-sm text-gray-500">类型</span>
                <p className="text-gray-900">{typeMap[furniture.type]}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Package className="h-5 w-5 text-gray-400" />
              <div className="flex-1">
                <span className="text-sm text-gray-500">材质</span>
                <p className="text-gray-900">{materialMap[furniture.material]}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Umbrella className="h-5 w-5 text-gray-400" />
              <div className="flex-1">
                <span className="text-sm text-gray-500">是否带伞</span>
                <p className="text-gray-900">{furniture.hasUmbrella ? '是' : '否'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-gray-400" />
              <div className="flex-1">
                <span className="text-sm text-gray-500">收纳点</span>
                <p className="text-gray-900">{furniture.storagePoint}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">历史记录</h3>
            <Button
              size="sm"
              icon={<Plus className="h-4 w-4" />}
              onClick={() => navigate(`/incidents/new?furnitureId=${furniture.id}`)}
            >
              登记事件
            </Button>
          </div>
          {furnitureIncidents.length === 0 ? (
            <Empty description="暂无历史事件" />
          ) : (
            <div className="space-y-3">
              {furnitureIncidents.map((incident) => {
                const severity = severityMap[incident.severity];
                return (
                  <div
                    key={incident.id}
                    className="rounded-lg border border-gray-100 p-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-gray-400" />
                        <span className="font-medium text-gray-900">
                          {incident.type === 'damage' ? '损坏' : '丢失'}
                        </span>
                        <span className={`rounded-full px-2 py-0.5 text-xs ${severity.color}`}>
                          {severity.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Clock className="h-3 w-3" />
                        {format(incident.reportTime, 'MM-dd HH:mm')}
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-gray-600">{incident.description}</p>
                    {incident.photos.length > 0 && (
                      <div className="mt-2 flex gap-2">
                        {incident.photos.slice(0, 3).map((photo, idx) => (
                          <img
                            key={idx}
                            src={photo}
                            alt=""
                            className="h-16 w-16 rounded-md object-cover"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="sticky bottom-0 gap-3 border-t border-gray-200 bg-white p-4">
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              icon={<Edit3 className="h-4 w-4" />}
              onClick={() => navigate(`/furniture/${furniture.id}/edit`)}
            >
              编辑
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              icon={<Plus className="h-4 w-4" />}
              onClick={() => navigate(`/incidents/new?furnitureId=${furniture.id}`)}
            >
              登记事件
            </Button>
            <Button
              variant="secondary"
              className="flex-1"
              icon={<Trash2 className="h-4 w-4" />}
              onClick={() => setShowDeleteModal(true)}
            >
              删除
            </Button>
          </div>
        </div>
      </div>

      <Modal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="确认删除"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              取消
            </Button>
            <Button variant="secondary" loading={deleteLoading} onClick={handleDelete}>
              删除
            </Button>
          </>
        }
      >
        <p className="text-sm text-gray-600">
          确定要删除桌椅 <span className="font-medium text-gray-900">{furniture.code}</span> 吗？此操作不可恢复。
        </p>
      </Modal>
    </div>
  );
}
