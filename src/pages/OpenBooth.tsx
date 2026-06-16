import { useState, useEffect } from 'react';
import { WeatherAlert } from '@/components/reminders';
import { FurnitureSelector } from '@/components/daily';
import { Button, Card, CardContent, useToast } from '@/components/ui';
import { useDailyRecordStore } from '@/stores/useDailyRecordStore';
import { useWeatherStore } from '@/stores/useWeatherStore';
import { useUserStore } from '@/stores/useUserStore';
import { formatTime } from '@/utils/date';
import { Store, Clock, CheckCircle } from 'lucide-react';

export default function OpenBooth() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const { currentRecord, loading, openBooth, fetchRecords } = useDailyRecordStore();
  const { currentWeather } = useWeatherStore();
  const { currentUser } = useUserStore();
  const { showToast } = useToast();
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const handleOpenBooth = async () => {
    if (!currentUser) {
      showToast.error('请先登录');
      return;
    }
    try {
      await openBooth(currentUser.id, selectedIds, currentWeather);
      setIsSuccess(true);
      showToast.success('开摊成功！');
    } catch (error) {
      showToast.error(error instanceof Error ? error.message : '开摊失败');
    }
  };

  if (isSuccess || currentRecord?.status === 'in-progress') {
    const record = currentRecord!;
    return (
      <div className="mx-auto max-w-2xl space-y-6 p-4">
        <Card className="border-success/30 bg-success/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/20">
                <CheckCircle className="h-6 w-6 text-success" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-success">开摊成功</h3>
                <p className="text-sm text-gray-600">今日外摆已开始</p>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-white p-4">
                <div className="flex items-center gap-2 text-gray-500">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">开摊时间</span>
                </div>
                <p className="mt-1 text-xl font-semibold text-gray-900">
                  {formatTime(record.openTime)}
                </p>
              </div>
              <div className="rounded-xl bg-white p-4">
                <div className="flex items-center gap-2 text-gray-500">
                  <Store className="h-4 w-4" />
                  <span className="text-sm">外摆数量</span>
                </div>
                <p className="mt-1 text-xl font-semibold text-gray-900">
                  {record.furnitureCount} 件
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">开摊</h1>
        <p className="mt-1 text-gray-500">选择今日外摆桌椅并确认开摊</p>
      </div>

      <WeatherAlert />

      <Card>
        <CardContent className="p-6">
          <FurnitureSelector
            selectedIds={selectedIds}
            onChange={setSelectedIds}
            disabled={loading}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex items-center justify-between p-4">
          <div>
            <span className="text-sm text-gray-500">已选数量</span>
            <p className="text-2xl font-bold text-gray-900">
              {selectedIds.length} <span className="text-base font-normal text-gray-500">件</span>
            </p>
          </div>
          <Button
            size="lg"
            onClick={handleOpenBooth}
            loading={loading}
            disabled={loading}
          >
            确认开摊
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
