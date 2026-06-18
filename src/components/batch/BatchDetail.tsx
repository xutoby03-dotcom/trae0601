import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, User, Calendar, Flame, Droplets, Target, Camera, CheckCircle, AlertTriangle } from 'lucide-react';
import { useBatchStore } from '@/store/useBatchStore';
import StatusBadge from '@/components/common/StatusBadge';
import CookingMonitor from './CookingMonitor';
import { SOUP_TYPE_LABEL, FIRE_LEVEL_LABEL, SALE_WINDOWS } from '@/utils/soupConfig';
import { formatDateTime, formatDuration, getDurationMinutes } from '@/utils/helpers';

export default function BatchDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const getBatchById = useBatchStore((s) => s.getBatchById);
  const finishBatch = useBatchStore((s) => s.finishBatch);
  const setBatchStatus = useBatchStore((s) => s.setBatchStatus);
  const getFeedbacksByBatch = useBatchStore((s) => s.getFeedbacksByBatch);

  const batch = getBatchById(id || '');
  const [showFinish, setShowFinish] = useState(false);
  const [windowName, setWindowName] = useState(SALE_WINDOWS[0]);
  const [remainingL, setRemainingL] = useState(batch?.targetYieldL || 30);

  if (!batch) {
    return (
      <div className="card text-center py-20">
        <p className="text-broth-500">批次不存在</p>
        <button onClick={() => navigate('/batches')} className="btn-secondary mt-4">返回列表</button>
      </div>
    );
  }

  const feedbacks = getFeedbacksByBatch(batch.id);
  const hasAbnormal = feedbacks.filter((f) => f.feedbackType !== 'other').length;

  const handleFinish = () => {
    finishBatch(batch.id, windowName, remainingL);
    setShowFinish(false);
  };

  const handleStartCooking = () => {
    setBatchStatus(batch.id, 'cooking');
  };

  const handleFinishCooking = () => {
    setBatchStatus(batch.id, 'finished');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="btn-ghost !p-2">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h1 className="font-display text-2xl font-bold text-broth-800">{SOUP_TYPE_LABEL[batch.soupType]}</h1>
              <StatusBadge type="batch" value={batch.status} />
              <StatusBadge type="soup" value={batch.soupType} />
            </div>
            <p className="text-sm text-broth-500">{batch.potNumber} · {formatDateTime(batch.startTime)}</p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {batch.status === 'preparing' && (
            <button onClick={handleStartCooking} className="btn-primary flex items-center gap-1.5">
              <Flame className="w-4 h-4" />
              开始熬制
            </button>
          )}
          {batch.status === 'cooking' && (
            <button onClick={() => setShowFinish(true)} className="btn-primary flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4" />
              出锅绑定售卖
            </button>
          )}
          {batch.status === 'finished' && (
            <button onClick={() => setShowFinish(true)} className="btn-primary flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4" />
              绑定售卖窗口
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="card space-y-4">
            <h3 className="font-display text-lg font-bold text-broth-800">批次参数</h3>
            <div className="space-y-3 text-sm">
              <InfoRow icon={<User className="w-4 h-4" />} label="操作师傅" value={batch.operator} />
              <InfoRow icon={<Calendar className="w-4 h-4" />} label="开始时间" value={formatDateTime(batch.startTime)} />
              {batch.finishTime && (
                <InfoRow icon={<Calendar className="w-4 h-4" />} label="出锅时间" value={formatDateTime(batch.finishTime)} />
              )}
              <InfoRow icon={<Flame className="w-4 h-4" />} label="火力档位" value={FIRE_LEVEL_LABEL[batch.fireLevel]} />
              <InfoRow icon={<Package className="w-4 h-4" />} label="骨料重量" value={`${batch.boneWeightKg} kg`} />
              <InfoRow icon={<Droplets className="w-4 h-4" />} label="加水量" value={`${batch.waterVolumeL} L`} />
              <InfoRow icon={<Target className="w-4 h-4" />} label="目标出汤量" value={`${batch.targetYieldL} L`} />
              <InfoRow icon={<Package className="w-4 h-4" />} label="香料包" value={batch.spicePack} />
              {batch.saleWindow && (
                <>
                  <div className="pt-3 border-t border-broth-50" />
                  <InfoRow icon={<Package className="w-4 h-4" />} label="售卖窗口" value={batch.saleWindow.windowName} />
                  <InfoRow icon={<Droplets className="w-4 h-4" />} label="当前剩余" value={`${batch.saleWindow.remainingL} L`} />
                </>
              )}
              {batch.finishTime && (
                <InfoRow icon={<Calendar className="w-4 h-4" />} label="总耗时" value={formatDuration(getDurationMinutes(batch.startTime, batch.finishTime))} />
              )}
            </div>
          </div>

          {batch.potPhoto && (
            <div className="card">
              <h3 className="font-display text-lg font-bold text-broth-800 mb-3 flex items-center gap-2">
                <Camera className="w-5 h-5 text-fire-500" />
                锅号照片
              </h3>
              <div className="rounded-xl overflow-hidden aspect-video bg-broth-50">
                <img src={batch.potPhoto} alt="锅号照片" className="w-full h-full object-cover" />
              </div>
            </div>
          )}

          {hasAbnormal > 0 && (
            <div className="card bg-red-50/50 border-red-100">
              <h3 className="font-display text-lg font-bold text-red-700 mb-2 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                异常反馈 ({hasAbnormal})
              </h3>
              <p className="text-sm text-red-600">
                本批次收到 {hasAbnormal} 条顾客异常反馈，请关注品质问题
              </p>
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          <CookingMonitor batch={batch} />
        </div>
      </div>

      {showFinish && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-warmer">
            <h3 className="font-display text-xl font-bold text-broth-800 mb-4">出锅绑定售卖窗口</h3>
            <div className="space-y-4">
              <div>
                <label className="label">选择售卖窗口</label>
                <select className="input-field" value={windowName} onChange={(e) => setWindowName(e.target.value)}>
                  {SALE_WINDOWS.map((w) => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">实际出汤量 (L)</label>
                <input
                  type="number"
                  className="input-field"
                  value={remainingL}
                  onChange={(e) => setRemainingL(Number(e.target.value))}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowFinish(false)} className="btn-secondary flex-1">取消</button>
              <button onClick={handleFinish} className="btn-primary flex-1">确认出锅</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-8 h-8 rounded-lg bg-broth-50 flex items-center justify-center text-broth-500 shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
      <p className="text-xs text-broth-500">{label}</p>
      <p className="font-medium text-broth-800 truncate">{value}</p>
      </div>
    </div>
  );
}
