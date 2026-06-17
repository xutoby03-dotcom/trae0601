import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useStarterStore } from '@/store/useStarterStore';
import { StatusBadge, AnomalyBadge } from '@/components/StatusBadge';
import Modal from '@/components/Modal';
import { 
  ArrowLeft, Save, AlertTriangle, CheckCircle,
  Droplets, Cookie, Thermometer, Clock, TrendingUp, Activity
} from 'lucide-react';
import { AnomalyType, OdorDescription, StarterStatus } from '@/types';
import { getOdorLabel, getAnomalyLabel, getStorageLabel, formatDateTime } from '@/utils/format';
import { calculateActivityScore, getActivityScoreColor, getActivityScoreLabel } from '@/utils/calculations';

const odorOptions: { value: OdorDescription; label: string; color: string }[] = [
  { value: 'fruity', label: '果香', color: '#52C41A' },
  { value: 'bready', label: '面包香', color: '#8B5A2B' },
  { value: 'vinegar', label: '醋酸', color: '#FA8C16' },
  { value: 'cheesy', label: '奶酪', color: '#DAA520' },
  { value: 'alcohol', label: '酒精', color: '#722ED1' },
  { value: 'putrid', label: '腐臭', color: '#F5222D' },
];

const anomalyOptions: { value: AnomalyType; label: string; description: string }[] = [
  { value: AnomalyType.COLLAPSE, label: '塌陷', description: '酸种顶部塌陷，未达到正常膨胀高度' },
  { value: AnomalyType.ODOR, label: '异味', description: '出现腐臭或其他不正常气味' },
  { value: AnomalyType.MOLD, label: '发霉', description: '表面出现霉斑或菌丝' },
];

const schema = z.object({
  discardAmount: z.coerce.number().min(0, '丢弃量不能为负数'),
  flourAdded: z.coerce.number().min(1, '请输入加粉量'),
  waterAdded: z.coerce.number().min(1, '请输入加水量'),
  temperature: z.coerce.number().min(0, '温度不能低于0℃').max(50, '温度不能高于50℃'),
  odor: z.enum(['fruity', 'vinegar', 'alcohol', 'bready', 'putrid', 'cheesy'] as const),
  riseMultiplier: z.coerce.number().min(0.5, '膨胀倍数不低于0.5').max(5, '膨胀倍数不高于5'),
  peakTime: z.coerce.number().min(1, '峰值时间至少1小时').max(48, '峰值时间不超过48小时'),
  anomalies: z.array(z.nativeEnum(AnomalyType)),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function FeedingPage() {
  const navigate = useNavigate();
  const { starterId } = useParams<{ starterId: string }>();
  const { starters, addFeedingRecord, lockStarter } = useStarterStore();
  const [selectedStarterId, setSelectedStarterId] = useState(starterId || '');
  const [showLockModal, setShowLockModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [liveScore, setLiveScore] = useState<number | null>(null);

  const availableStarters = useMemo(() => 
    starters.filter(s => s.status !== StarterStatus.ARCHIVED && s.status !== StarterStatus.LOCKED),
    [starters]
  );

  const selectedStarter = useMemo(() => 
    starters.find(s => s.id === selectedStarterId),
    [starters, selectedStarterId]
  );

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      discardAmount: 150,
      flourAdded: 150,
      waterAdded: 150,
      temperature: 25,
      odor: 'fruity',
      riseMultiplier: 2.5,
      peakTime: 5,
      anomalies: [],
    }
  });

  const watchAll = watch();

  useEffect(() => {
    const score = calculateActivityScore(
      watchAll.riseMultiplier,
      watchAll.peakTime,
      watchAll.odor,
      watchAll.temperature
    );
    setLiveScore(score);
  }, [watchAll.riseMultiplier, watchAll.peakTime, watchAll.odor, watchAll.temperature]);

  useEffect(() => {
    if (starterId) {
      setSelectedStarterId(starterId);
    }
  }, [starterId]);

  const onSubmit = async (data: FormData) => {
    if (!selectedStarterId) return;

    const hasAnomaly = data.anomalies.length > 0;

    addFeedingRecord({
      starterId: selectedStarterId,
      fedAt: new Date().toISOString(),
      discardAmount: data.discardAmount,
      flourAdded: data.flourAdded,
      waterAdded: data.waterAdded,
      temperature: data.temperature,
      odor: data.odor,
      riseMultiplier: data.riseMultiplier,
      peakTime: data.peakTime,
      anomalies: data.anomalies,
      notes: data.notes,
    });

    if (hasAnomaly) {
      const anomalyType = data.anomalies[0];
      const anomalyDesc = anomalyOptions.find(a => a.value === anomalyType)?.description || '';
      lockStarter(selectedStarterId, anomalyType, anomalyDesc, '后厨师傅');
      setShowLockModal(true);
    } else {
      setShowSuccessModal(true);
    }
  };

  const handleLockClose = () => {
    setShowLockModal(false);
    navigate('/anomalies');
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    navigate('/');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/')}
          className="p-2 hover:bg-bread-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-bread-600" />
        </button>
        <div>
          <h1 className="text-3xl font-display font-bold text-bread-800">记录喂养</h1>
          <p className="text-bread-500 mt-1">记录酸种喂养参数，系统自动计算活性评分</p>
        </div>
      </div>

      <div className="card p-6 animate-fade-in-up" style={{ animationDelay: '0ms', opacity: 0 }}>
        <h2 className="text-xl font-display font-bold text-bread-800 mb-6">选择酸种</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableStarters.map(starter => (
            <div
              key={starter.id}
              onClick={() => starter.status !== StarterStatus.LOCKED && setSelectedStarterId(starter.id)}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                selectedStarterId === starter.id
                  ? 'border-bread-500 bg-bread-50'
                  : starter.status === StarterStatus.LOCKED
                    ? 'border-red-200 bg-red-50 opacity-60 cursor-not-allowed'
                    : 'border-bread-100 bg-white hover:border-bread-300'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <img 
                  src={starter.photoUrl} 
                  alt={starter.name}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div>
                  <p className="font-medium text-bread-800">{starter.name}</p>
                  <p className="text-xs text-bread-500">{starter.flourType}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <StatusBadge status={starter.status} size="sm" />
                <span className="text-sm text-bread-500">{starter.currentWeight}g</span>
              </div>
              {starter.status === StarterStatus.LOCKED && (
                <p className="text-xs text-red-500 mt-2">🔒 已锁定，无法喂养</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {selectedStarter && selectedStarter.status !== StarterStatus.LOCKED && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card p-6 animate-fade-in-up" style={{ animationDelay: '100ms', opacity: 0 }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-wheat/20 flex items-center justify-center">
                  <Droplets className="w-5 h-5 text-wheat" />
                </div>
                <h2 className="text-xl font-display font-bold text-bread-800">重量管理</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="label">丢弃量（g）*</label>
                  <input
                    type="number"
                    {...register('discardAmount')}
                    className="input text-lg"
                  />
                  {errors.discardAmount && <p className="text-red-500 text-sm mt-1">{errors.discardAmount.message}</p>}
                </div>
                <div>
                  <label className="label">加粉量（g）*</label>
                  <input
                    type="number"
                    {...register('flourAdded')}
                    className="input text-lg"
                  />
                  {errors.flourAdded && <p className="text-red-500 text-sm mt-1">{errors.flourAdded.message}</p>}
                </div>
                <div>
                  <label className="label">加水量（g）*</label>
                  <input
                    type="number"
                    {...register('waterAdded')}
                    className="input text-lg"
                  />
                  {errors.waterAdded && <p className="text-red-500 text-sm mt-1">{errors.waterAdded.message}</p>}
                </div>

                <div className="p-4 bg-bread-50 rounded-xl mt-4">
                  <p className="text-sm text-bread-500">预计喂养后重量</p>
                  <p className="text-2xl font-bold text-bread-800 font-display">
                    {selectedStarter.currentWeight - watchAll.discardAmount + watchAll.flourAdded + watchAll.waterAdded}g
                  </p>
                  <p className="text-xs text-bread-400 mt-1">
                    = {selectedStarter.currentWeight}g - {watchAll.discardAmount}g + {watchAll.flourAdded}g + {watchAll.waterAdded}g
                  </p>
                </div>
              </div>
            </div>

            <div className="card p-6 animate-fade-in-up" style={{ animationDelay: '200ms', opacity: 0 }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-wheat/20 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-wheat" />
                </div>
                <h2 className="text-xl font-display font-bold text-bread-800">活性指标</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="label">环境温度（℃）*</label>
                  <input
                    type="number"
                    step="0.5"
                    {...register('temperature')}
                    className="input text-lg"
                  />
                  {errors.temperature && <p className="text-red-500 text-sm mt-1">{errors.temperature.message}</p>}
                </div>

                <div>
                  <label className="label">膨胀倍数 *</label>
                  <div className="relative">
                    <input
                      type="range"
                      min="0.5"
                      max="5"
                      step="0.1"
                      {...register('riseMultiplier', { valueAsNumber: true })}
                      className="w-full h-2 bg-bread-100 rounded-lg appearance-none cursor-pointer accent-bread-500"
                    />
                    <div className="text-center text-2xl font-bold text-bread-800 font-display mt-2">
                      {watchAll.riseMultiplier}x
                    </div>
                    <div className="flex justify-between text-xs text-bread-400 mt-1">
                      <span>0.5x</span>
                      <span className="text-green-500 font-medium">理想 2-3x</span>
                      <span>5x</span>
                    </div>
                  </div>
                  {errors.riseMultiplier && <p className="text-red-500 text-sm mt-1">{errors.riseMultiplier.message}</p>}
                </div>

                <div>
                  <label className="label">峰值时间（小时）*</label>
                  <div className="relative">
                    <input
                      type="range"
                      min="1"
                      max="48"
                      step="0.5"
                      {...register('peakTime', { valueAsNumber: true })}
                      className="w-full h-2 bg-bread-100 rounded-lg appearance-none cursor-pointer accent-bread-500"
                    />
                    <div className="text-center text-2xl font-bold text-bread-800 font-display mt-2">
                      {watchAll.peakTime}h
                    </div>
                    <div className="flex justify-between text-xs text-bread-400 mt-1">
                      <span>1h</span>
                      <span className="text-green-500 font-medium">理想 4-6h</span>
                      <span>48h</span>
                    </div>
                  </div>
                  {errors.peakTime && <p className="text-red-500 text-sm mt-1">{errors.peakTime.message}</p>}
                </div>
              </div>
            </div>
          </div>

          <div className="card p-6 animate-fade-in-up" style={{ animationDelay: '300ms', opacity: 0 }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-wheat/20 flex items-center justify-center">
                <Activity className="w-5 h-5 text-wheat" />
              </div>
              <h2 className="text-xl font-display font-bold text-bread-800">气味评估</h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {odorOptions.map(option => (
                <label
                  key={option.value}
                  className={`p-3 rounded-xl border-2 cursor-pointer text-center transition-all ${
                    watchAll.odor === option.value
                      ? 'border-bread-500 bg-bread-50'
                      : 'border-bread-100 bg-white hover:border-bread-300'
                  }`}
                >
                  <input
                    type="radio"
                    {...register('odor')}
                    value={option.value}
                    className="sr-only"
                  />
                  <div 
                    className="w-8 h-8 rounded-full mx-auto mb-2"
                    style={{ backgroundColor: option.color + '20', color: option.color }}
                  >
                    <span className="flex items-center justify-center h-full text-lg">👃</span>
                  </div>
                  <p className="text-sm font-medium" style={{ color: option.color }}>
                    {option.label}
                  </p>
                </label>
              ))}
            </div>
          </div>

          {liveScore !== null && (
            <div className="card p-6 animate-fade-in-up" style={{ animationDelay: '400ms', opacity: 0 }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-wheat/20 flex items-center justify-center">
                    <Activity className="w-5 h-5 text-wheat" />
                  </div>
                  <div>
                    <h2 className="text-xl font-display font-bold text-bread-800">实时活性评分</h2>
                    <p className="text-sm text-bread-500">根据当前参数自动计算</p>
                  </div>
                </div>
                <div className="text-right">
                  <div 
                    className="text-4xl font-bold font-display"
                    style={{ color: getActivityScoreColor(liveScore) }}
                  >
                    {liveScore}
                  </div>
                  <div 
                    className="text-sm font-medium"
                    style={{ color: getActivityScoreColor(liveScore) }}
                  >
                    {getActivityScoreLabel(liveScore)}
                  </div>
                </div>
              </div>
              <div className="mt-4 h-3 bg-bread-100 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-500"
                  style={{ 
                    width: `${liveScore}%`,
                    backgroundColor: getActivityScoreColor(liveScore)
                  }}
                />
              </div>
            </div>
          )}

          <div className="card p-6 border-2 border-red-200 animate-fade-in-up" style={{ animationDelay: '500ms', opacity: 0 }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h2 className="text-xl font-display font-bold text-bread-800">异常标记</h2>
                <p className="text-sm text-red-500">如发现以下异常，请标记，系统将自动锁定该酸种</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {anomalyOptions.map(option => {
                const isChecked = watchAll.anomalies.includes(option.value);
                return (
                  <label
                    key={option.value}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      isChecked
                        ? 'border-red-500 bg-red-50'
                        : 'border-bread-100 bg-white hover:border-red-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        value={option.value}
                        {...register('anomalies')}
                        className="mt-1 w-4 h-4 text-red-500 rounded focus:ring-red-500"
                      />
                      <div>
                        <p className="font-medium text-bread-800">{option.label}</p>
                        <p className="text-xs text-bread-500 mt-1">{option.description}</p>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="card p-6 animate-fade-in-up" style={{ animationDelay: '600ms', opacity: 0 }}>
            <h2 className="text-lg font-display font-bold text-bread-800 mb-4">备注</h2>
            <textarea
              {...register('notes')}
              rows={3}
              placeholder="记录本次喂养的特殊情况、观察到的现象等..."
              className="input resize-none"
            />
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="btn-secondary"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedStarterId}
              className="btn-primary flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              保存喂养记录
            </button>
          </div>
        </form>
      )}

      <Modal
        isOpen={showLockModal}
        onClose={handleLockClose}
        title="酸种已锁定"
        width="sm"
      >
        <div className="text-center py-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-shake">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-bread-800 font-medium mb-2">该酸种已被自动锁定</p>
          <p className="text-bread-500 text-sm mb-6">
            由于标记了异常，系统已自动锁定该酸种，禁止用于生产。请前往异常管理页面处理。
          </p>
          {watchAll.anomalies.map(type => (
            <div key={type} className="mb-2">
              <AnomalyBadge type={type} />
            </div>
          ))}
          <button
            onClick={handleLockClose}
            className="w-full btn-primary mt-6"
          >
            前往异常管理
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={showSuccessModal}
        onClose={handleSuccessClose}
        title="喂养记录已保存"
        width="sm"
      >
        <div className="text-center py-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <p className="text-bread-800 font-medium mb-2">喂养记录已成功保存</p>
          {selectedStarter && (
            <p className="text-bread-500 text-sm mb-4">{selectedStarter.name}</p>
          )}
          {liveScore !== null && (
            <div 
              className="inline-block px-6 py-2 rounded-full"
              style={{ 
                backgroundColor: `${getActivityScoreColor(liveScore)}15`,
                color: getActivityScoreColor(liveScore)
              }}
            >
              <span className="text-2xl font-bold">{liveScore}</span>
              <span className="ml-2">{getActivityScoreLabel(liveScore)}</span>
            </div>
          )}
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => {
                setShowSuccessModal(false);
                navigate(`/feeding/${selectedStarterId}`);
              }}
              className="flex-1 btn-secondary"
            >
              继续记录
            </button>
            <button
              onClick={handleSuccessClose}
              className="flex-1 btn-primary"
            >
              返回看板
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
