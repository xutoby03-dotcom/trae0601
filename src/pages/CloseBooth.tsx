import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CloseChecklist } from '@/components/daily';
import { Button, Card, CardContent, Checkbox, useToast } from '@/components/ui';
import { useDailyRecordStore } from '@/stores/useDailyRecordStore';
import { useFurnitureStore } from '@/stores/useFurnitureStore';
import { useUserStore } from '@/stores/useUserStore';
import type { CloseChecklist as CloseChecklistType, Furniture } from '@/types';
import { formatTime } from '@/utils/date';
import { AlertTriangle, CheckSquare, Square, Package, CheckCircle } from 'lucide-react';

const defaultChecklist: CloseChecklistType = {
  wiped: false,
  folded: false,
  locked: false,
  covered: false,
  returned: false,
};

export default function CloseBooth() {
  const navigate = useNavigate();
  const [checklist, setChecklist] = useState<CloseChecklistType>(defaultChecklist);
  const [checkedFurnitureIds, setCheckedFurnitureIds] = useState<string[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const { currentRecord, loading, closeBooth, fetchRecords } = useDailyRecordStore();
  const { furniture, fetchFurniture } = useFurnitureStore();
  const { currentUser } = useUserStore();
  const { showToast } = useToast();

  useEffect(() => {
    fetchRecords();
    fetchFurniture();
  }, [fetchRecords, fetchFurniture]);

  const todayFurniture = currentRecord?.furnitureIds
    .map(id => furniture.find(f => f.id === id))
    .filter((f): f is Furniture => f !== undefined) || [];

  const allFurnitureChecked = todayFurniture.length > 0 &&
    todayFurniture.every(f => checkedFurnitureIds.includes(f.id));

  const allChecklistDone = Object.values(checklist).every(v => v === true);

  const handleToggleFurniture = (id: string) => {
    if (checkedFurnitureIds.includes(id)) {
      setCheckedFurnitureIds(checkedFurnitureIds.filter(i => i !== id));
    } else {
      setCheckedFurnitureIds([...checkedFurnitureIds, id]);
    }
  };

  const handleToggleAll = () => {
    if (allFurnitureChecked) {
      setCheckedFurnitureIds([]);
    } else {
      setCheckedFurnitureIds(todayFurniture.map(f => f.id));
    }
  };

  const handleReportIncident = () => {
    const params = new URLSearchParams();
    if (currentRecord?.id) {
      params.set('recordId', currentRecord.id);
    }
    if (checkedFurnitureIds.length > 0) {
      params.set('furnitureId', checkedFurnitureIds[0]);
    }
    navigate(`/incidents/new?${params.toString()}`);
  };

  const handleCloseBooth = async () => {
    if (!currentUser) {
      showToast.error('请先登录');
      return;
    }
    if (!currentRecord) {
      showToast.error('今日未开摊');
      return;
    }
    if (!allFurnitureChecked) {
      const unchecked = todayFurniture.filter(f => !checkedFurnitureIds.includes(f.id));
      const codes = unchecked.map(f => f.code).join('、');
      showToast.error(`还有 ${unchecked.length} 件桌椅未核对：${codes}`);
      return;
    }
    if (!allChecklistDone) {
      showToast.error('请完成所有收摊检查项');
      return;
    }
    try {
      await closeBooth(currentRecord.id, currentUser.id, checklist);
      setIsSuccess(true);
      showToast.success('收摊成功！');
    } catch (error) {
      showToast.error(error instanceof Error ? error.message : '收摊失败');
    }
  };

  if (!currentRecord || currentRecord.status !== 'in-progress') {
    return (
      <div className="mx-auto max-w-2xl space-y-6 p-4">
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">今日未开摊</h3>
            <p className="mt-2 text-sm text-gray-500">请先完成开摊操作</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="mx-auto max-w-2xl space-y-6 p-4">
        <Card className="border-success/30 bg-success/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/20">
                <CheckCircle className="h-6 w-6 text-success" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-success">收摊成功</h3>
                <p className="text-sm text-gray-600">今日外摆已结束</p>
              </div>
            </div>
            {currentRecord.closeTime && (
              <div className="mt-6 rounded-xl bg-white p-4">
                <div className="flex items-center gap-2 text-gray-500">
                  <Package className="h-4 w-4" />
                  <span className="text-sm">收摊时间</span>
                </div>
                <p className="mt-1 text-xl font-semibold text-gray-900">
                  {formatTime(currentRecord.closeTime)}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">收摊</h1>
        <p className="mt-1 text-gray-500">核对桌椅数量并完成收摊检查</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">今日外摆桌椅</h4>
              <p className="mt-1 text-sm text-gray-500">
                已核对 <span className="font-semibold text-primary-500">{checkedFurnitureIds.length}</span> / {todayFurniture.length} 件
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleToggleAll}
                icon={allFurnitureChecked ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
              >
                {allFurnitureChecked ? '取消全选' : '全部核对'}
              </Button>
            </div>
          </div>

          {todayFurniture.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              今日暂无外摆桌椅
            </div>
          ) : (
            <div className="space-y-2">
              {todayFurniture.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg border border-gray-200 p-3"
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={checkedFurnitureIds.includes(item.id)}
                      onChange={() => handleToggleFurniture(item.id)}
                      disabled={loading}
                    />
                    <div>
                      <p className="font-medium text-gray-900">{item.code}</p>
                      <p className="text-xs text-gray-500">
                        {item.type === 'chair' ? '椅子' : item.type === 'table' ? '桌子' : '遮阳伞'} · {item.area}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 flex items-center justify-between rounded-lg border border-warning/30 bg-warning/5 p-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              <span className="text-sm text-warning">发现缺失或损坏？</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleReportIncident}>
              异常登记
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <CloseChecklist
            value={checklist}
            onChange={setChecklist}
            disabled={loading}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex items-center justify-between p-4">
          <div>
            <span className="text-sm text-gray-500">收摊检查</span>
            <p className="text-2xl font-bold text-gray-900">
              {Object.values(checklist).filter(Boolean).length} <span className="text-base font-normal text-gray-500">/ 5 项已完成</span>
            </p>
          </div>
          <Button
            size="lg"
            onClick={handleCloseBooth}
            loading={loading}
            disabled={!allFurnitureChecked || !allChecklistDone}
          >
            确认收摊
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
