import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CloudRain, AlertTriangle, X } from 'lucide-react';
import { useCleaningStore } from '@/store/cleaningStore';
import { STEP_LABELS, type StepType, type CleaningStep } from '@/types';
import { addDays, formatDate, formatDateChinese } from '@/utils/dateUtils';
import { generateId } from '@/lib/utils';
import { cn } from '@/lib/utils';

const PlanCreate = () => {
  const { itemId } = useParams<{ itemId: string }>();
  const navigate = useNavigate();
  const { getItemById, addPlan, isRainyDate } = useCleaningStore();

  const item = itemId ? getItemById(itemId) : undefined;

  const stepTypes: StepType[] = ['disassemble', 'sendWash', 'pickup', 'dry', 'install'];

  const today = formatDate(new Date());
  const defaultSteps: CleaningStep[] = stepTypes.map((type, index) => ({
    id: generateId(),
    type,
    scheduledDate: addDays(today, index + 1),
    isCompleted: false,
  }));

  const [steps, setSteps] = useState<CleaningStep[]>(defaultSteps);
  const [cost, setCost] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [enabledSteps, setEnabledSteps] = useState<Record<StepType, boolean>>({
    disassemble: true,
    sendWash: true,
    pickup: true,
    dry: true,
    install: true,
  });
  const [showRainConfirm, setShowRainConfirm] = useState(false);

  if (!item) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">物品不存在</p>
          <Link to="/items" className="text-blue-600 text-sm mt-2 inline-block">
            返回列表
          </Link>
        </div>
      </div>
    );
  }

  const handleDateChange = (stepId: string, date: string) => {
    setSteps((prev) =>
      prev.map((step) => (step.id === stepId ? { ...step, scheduledDate: date } : step))
    );
  };

  const toggleStep = (type: StepType) => {
    setEnabledSteps((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  const dryStep = steps.find((s) => s.type === 'dry');
  const dryStepEnabled = enabledSteps.dry;
  const dryDateIsRainy = dryStep && dryStepEnabled && isRainyDate(dryStep.scheduledDate);

  const visibleSteps = steps.filter((step) => enabledSteps[step.type]);
  const rainyStepDates: { step: CleaningStep; date: string }[] = [];
  visibleSteps.forEach((step) => {
    if (isRainyDate(step.scheduledDate) && step.type === 'dry') {
      rainyStepDates.push({ step, date: step.scheduledDate });
    }
  });

  const doSubmit = () => {
    if (!itemId) return;
    const filteredSteps = steps.filter((step) => enabledSteps[step.type]);
    if (filteredSteps.length === 0) {
      alert('请至少选择一个步骤');
      return;
    }
    addPlan({
      itemId,
      status: 'pending',
      steps: filteredSteps,
      cost,
      startDate: filteredSteps[0]?.scheduledDate || today,
      notes,
    });
    navigate(-1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemId) return;

    const filteredSteps = steps.filter((step) => enabledSteps[step.type]);
    if (filteredSteps.length === 0) {
      alert('请至少选择一个步骤');
      return;
    }

    const hasRainyDry = filteredSteps.some(
      (s) => s.type === 'dry' && isRainyDate(s.scheduledDate)
    );

    if (hasRainyDry) {
      setShowRainConfirm(true);
      return;
    }

    doSubmit();
  };

  const confirmRainSubmit = () => {
    setShowRainConfirm(false);
    doSubmit();
  };

  const cancelRainSubmit = () => {
    setShowRainConfirm(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => navigate(-1)} className="p-1 -ml-1">
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">创建清洗计划</h1>
          <div className="w-6" />
        </div>
      </div>

      {dryDateIsRainy && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">⚠️ 晾晒日期遇到阴雨天</p>
              <p className="text-xs text-red-700 mt-1">
                您选择的晾晒日期（{dryStep && formatDateChinese(dryStep.scheduledDate)}）预报有雨，
                强烈建议调整晾晒日期，或选择室内晾干方式
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-4 pb-8">
        <div className="bg-white rounded-xl p-4 mb-4">
          <p className="text-sm text-gray-500 mb-1">清洗物品</p>
          <p className="text-lg font-medium text-gray-900">{item.name}</p>
          <p className="text-sm text-gray-500">{item.room} · {item.material}</p>
        </div>

        <div className="bg-white rounded-xl overflow-hidden mb-4">
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">清洗步骤</h2>
            <p className="text-sm text-gray-500 mt-1">选择需要的步骤并安排时间</p>
          </div>

          <div className="divide-y divide-gray-100">
            {steps.map((step) => {
              const isRainy =
                step.type === 'dry' && isRainyDate(step.scheduledDate);

              return (
                <div
                  key={step.id}
                  className={cn(
                    'p-4 transition-opacity',
                    !enabledSteps[step.type] && 'opacity-50',
                    isRainy && enabledSteps[step.type] && 'bg-red-50/50'
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={enabledSteps[step.type]}
                        onChange={() => toggleStep(step.type)}
                        className="w-5 h-5 text-blue-600 rounded"
                      />
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">
                          {STEP_LABELS[step.type]}
                        </span>
                        {isRainy && enabledSteps[step.type] && (
                          <span className="flex items-center gap-1 text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full">
                            <CloudRain className="w-3 h-3" />
                            阴雨天
                          </span>
                        )}
                      </div>
                    </label>
                  </div>
                  {enabledSteps[step.type] && (
                    <div className="ml-8">
                      <div className="flex items-center gap-2">
                        <input
                          type="date"
                          value={step.scheduledDate}
                          onChange={(e) => handleDateChange(step.id, e.target.value)}
                          className={cn(
                            'flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                            isRainy
                              ? 'border-red-400 bg-red-50 focus:ring-red-500'
                              : 'border-gray-300'
                          )}
                        />
                      </div>
                      {isRainy && (
                        <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          {formatDateChinese(step.scheduledDate)}预报有雨，建议改期
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            预计花费（元）
          </label>
          <input
            type="number"
            value={cost}
            onChange={(e) => setCost(parseFloat(e.target.value) || 0)}
            min="0"
            step="0.01"
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="0"
          />
        </div>

        <div className="bg-white rounded-xl p-4 mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            备注
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="记录本次清洗的注意事项..."
            rows={3}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>

        <button
          type="submit"
          className={cn(
            'w-full py-3.5 rounded-xl font-medium transition-colors',
            dryDateIsRainy
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          )}
        >
          {dryDateIsRainy
            ? '仍要创建（晾晒遇阴雨天）'
            : '创建计划'}
        </button>
      </form>

      {showRainConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">晾晒日期有雨</h3>
                <p className="text-sm text-gray-600 mt-1">
                  您选择的晾晒日期预报有雨，可能会影响晾晒效果。是否调整晾晒日期？
                </p>
              </div>
              <button
                onClick={cancelRainSubmit}
                className="text-gray-400 hover:text-gray-600 -m-1 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-red-50 border border-red-100 rounded-xl p-3 mb-5">
              <div className="flex items-center gap-2 text-sm text-red-700">
                <CloudRain className="w-4 h-4" />
                {dryStep && (
                  <span>
                    晾晒日期：{formatDateChinese(dryStep.scheduledDate)}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={cancelRainSubmit}
                className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
              >
                返回修改日期
              </button>
              <button
                onClick={confirmRainSubmit}
                className="w-full py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
              >
                坚持原计划，室内晾干
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanCreate;
