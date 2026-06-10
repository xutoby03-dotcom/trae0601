import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CloudRain, Info } from 'lucide-react';
import { useCleaningStore } from '@/store/cleaningStore';
import { STEP_LABELS, type StepType, type CleaningStep } from '@/types';
import { addDays, formatDate } from '@/utils/dateUtils';
import { generateId } from '@/lib/utils';
import { cn } from '@/lib/utils';

const PlanCreate = () => {
  const { itemId } = useParams<{ itemId: string }>();
  const navigate = useNavigate();
  const { getItemById, addPlan, simulateRainyDay } = useCleaningStore();

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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

  const visibleSteps = steps.filter((step) => enabledSteps[step.type]);

  const hasRainyDayWarning = visibleSteps.some(
    (step) => step.type === 'dry' && simulateRainyDay
  );

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

      {hasRainyDayWarning && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-3">
          <div className="flex items-start gap-2">
            <CloudRain className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-800">阴雨天提醒</p>
              <p className="text-xs text-yellow-700 mt-1">
                今天有雨，晾晒步骤可能受影响，建议调整时间或选择室内晾干
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
            {steps.map((step) => (
              <div
                key={step.id}
                className={cn(
                  'p-4 transition-opacity',
                  !enabledSteps[step.type] && 'opacity-50'
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
                    <span className="font-medium text-gray-900">
                      {STEP_LABELS[step.type]}
                    </span>
                  </label>
                </div>
                {enabledSteps[step.type] && (
                  <div className="ml-8">
                    <div className="flex items-center gap-2">
                      <input
                        type="date"
                        value={step.scheduledDate}
                        onChange={(e) => handleDateChange(step.id, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    {step.type === 'dry' && simulateRainyDay && (
                      <p className="text-xs text-yellow-600 mt-2 flex items-center gap-1">
                        <Info className="w-3 h-3" />
                        当天可能有雨，注意安排
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
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
          className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-medium hover:bg-blue-700 transition-colors"
        >
          创建计划
        </button>
      </form>
    </div>
  );
};

export default PlanCreate;
