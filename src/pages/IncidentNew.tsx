import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';
import { Card, CardContent, Select, Button, Textarea, useToast, Loading } from '@/components/ui';
import { PhotoUploader } from '@/components/incidents';
import { useIncidentStore } from '@/stores/useIncidentStore';
import { useFurnitureStore } from '@/stores/useFurnitureStore';
import { useUserStore } from '@/stores/useUserStore';
import type { IncidentType, IncidentSeverity } from '@/types';
import type { SelectOption } from '@/components/ui';

const typeOptions: SelectOption[] = [
  { value: 'damage', label: '损坏' },
  { value: 'loss', label: '丢失' },
];

const severityOptions: SelectOption[] = [
  { value: 'minor', label: '轻微' },
  { value: 'moderate', label: '中等' },
  { value: 'severe', label: '严重' },
];

export default function IncidentNew() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();
  const { reportIncident, loading } = useIncidentStore();
  const { furniture, fetchFurniture } = useFurnitureStore();
  const { currentUser } = useUserStore();

  const [furnitureId, setFurnitureId] = useState('');
  const [type, setType] = useState<IncidentType>('damage');
  const [severity, setSeverity] = useState<IncidentSeverity>('moderate');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dailyRecordId, setDailyRecordId] = useState<string | undefined>(undefined);

  useEffect(() => {
    fetchFurniture();
  }, [fetchFurniture]);

  useEffect(() => {
    const recordId = searchParams.get('recordId');
    const furnId = searchParams.get('furnitureId');
    if (recordId) {
      setDailyRecordId(recordId);
    }
    if (furnId) {
      setFurnitureId(furnId);
    }
  }, [searchParams]);

  const furnitureOptions: SelectOption[] = furniture
    .filter(f => f.status !== 'lost')
    .map(f => ({
      value: f.id,
      label: `${f.code} - ${f.type === 'chair' ? '椅子' : f.type === 'table' ? '桌子' : '遮阳伞'}`,
    }));

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!furnitureId) newErrors.furnitureId = '请选择桌椅';
    if (!description.trim()) newErrors.description = '请填写事件描述';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (!currentUser) {
      showToast.error('请先登录');
      return;
    }

    try {
      await reportIncident({
        furnitureId,
        type,
        severity,
        description: description.trim(),
        photos,
        reporterId: currentUser.id,
        reportTime: new Date().toISOString(),
        dailyRecordId,
      });
      showToast.success('事件上报成功');
      navigate('/incidents');
    } catch (error) {
      showToast.error(error instanceof Error ? error.message : '上报失败');
    }
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
      <div className="flex items-center gap-3 border-b border-gray-100 p-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-semibold text-gray-900">上报事件</h1>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
        <div className="space-y-4 p-4">
          <Card>
            <CardContent className="space-y-4 p-4">
              <Select
                label="选择桌椅"
                value={furnitureId}
                onChange={(e) => {
                  setFurnitureId(e.target.value);
                  if (errors.furnitureId) {
                    setErrors(prev => ({ ...prev, furnitureId: '' }));
                  }
                }}
                options={furnitureOptions}
                placeholder="请选择桌椅"
                error={errors.furnitureId}
              />

              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="事件类型"
                  value={type}
                  onChange={(e) => setType(e.target.value as IncidentType)}
                  options={typeOptions}
                />
                <Select
                  label="严重程度"
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as IncidentSeverity)}
                  options={severityOptions}
                />
              </div>

              <Textarea
                label="事件描述"
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (errors.description) {
                    setErrors(prev => ({ ...prev, description: '' }));
                  }
                }}
                placeholder="请详细描述事件情况..."
                rows={4}
                error={errors.description}
              />

              <PhotoUploader photos={photos} onChange={setPhotos} maxPhotos={9} />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-gray-500">
                <p className="font-medium text-gray-700">上报人</p>
                <p className="mt-1">{currentUser?.username || '未知用户'}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>

      <div className="border-t border-gray-100 p-4">
        <Button type="submit" onClick={handleSubmit} className="w-full" disabled={loading}>
          <Send className="mr-2 h-4 w-4" />
          {loading ? '提交中...' : '提交上报'}
        </Button>
      </div>
    </div>
  );
}
