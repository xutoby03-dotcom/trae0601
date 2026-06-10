import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Check, Clock, CloudRain, Edit2, Trash2 } from 'lucide-react';
import { useCleaningStore } from '@/store/cleaningStore';
import { STEP_LABELS, STATUS_LABELS, type StepType } from '@/types';
import { formatDateChinese, isPast, isToday } from '@/utils/dateUtils';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const PlanDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getPlanById, getItemById, completeStep, updateStepDate, deletePlan, simulateRainyDay } =
    useCleaningStore();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingStep, setEditingStep] = useState<string | null>(null);
  const [editDate, setEditDate] = useState('');

  const plan = id ? getPlanById(id) : undefined;
  const item = plan ? getItemById(plan.itemId) : undefined;

  if (!plan || !item) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">计划不存在</p>
          <Link to="/" className="text-blue-600 text-sm mt-2 inline-block">
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  const handleCompleteStep = (stepId: string) => {
    if (id) {
      completeStep(id, stepId);
    }
  };

  const startEditDate = (stepId: string, currentDate: string) => {
    setEditingStep(stepId);
    setEditDate(currentDate);
  };

  const saveEditDate = () => {
    if (id && editingStep) {
      updateStepDate(id, editingStep, editDate);
      setEditingStep(null);
    }
  };

  const handleDelete = () => {
    if (id) {
      deletePlan(id);
      navigate('/');
    }
  };

  const stepIcons: Record<StepType, string> = {
    disassemble: '🔧',
    sendWash: '🧺',
    pickup: '📦',
    dry: '☀️',
    install: '🏠',
  };

  const hasRainyWarning = plan.steps.some(
    (s) => s.type === 'dry' && !s.isCompleted && simulateRainyDay
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => navigate(-1)} className="p-1 -ml-1">
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">清洗计划</h1>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-1 -mr-1 text-red-500"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {hasRainyWarning && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-3">
          <div className="flex items-start gap-2">
            <CloudRain className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-800">阴雨天提醒</p>
              <p className="text-xs text-yellow-700 mt-1">
                晾晒步骤安排在雨天，建议调整时间
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="p-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{item.name}</h2>
              <p className="text-sm text-gray-500 mt-1">{item.room}</p>
            </div>
            <span
              className={cn(
                'px-3 py-1 rounded-full text-sm font-medium',
                plan.status === 'completed'
                  ? 'bg-green-100 text-green-700'
                  : plan.status === 'drying'
                  ? 'bg-yellow-100 text-yellow-700'
                  : plan.status === 'inProgress'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-700'
              )}
            >
              {STATUS_LABELS[plan.status]}
            </span>
          </div>

          {plan.notes && (
            <div className="pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-600">{plan.notes}</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm mt-4">
          <h3 className="font-semibold text-gray-900 mb-4">步骤进度</h3>
          <div className="relative">
            <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-gray-200" />

            <div className="space-y-4">
              {plan.steps.map((step) => {
                const isEditing = editingStep === step.id;
                const isOverdue = !step.isCompleted && isPast(step.scheduledDate) && !isToday(step.scheduledDate);

                return (
                  <div key={step.id} className="relative flex gap-4">
                    <div
                      className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center z-10 flex-shrink-0',
                        step.isCompleted
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-100 text-gray-400'
                      )}
                    >
                      {step.isCompleted ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <span className="text-lg">{stepIcons[step.type]}</span>
                      )}
                    </div>

                    <div className="flex-1 pb-4">
                      <div className="flex items-center justify-between">
                        <span
                          className={cn(
                            'font-medium',
                            step.isCompleted
                              ? 'text-gray-500 line-through'
                              : 'text-gray-900'
                          )}
                        >
                          {STEP_LABELS[step.type]}
                        </span>
                        {!step.isCompleted && (
                          <button
                            onClick={() => handleCompleteStep(step.id)}
                            className="text-sm text-blue-600 font-medium"
                          >
                            完成
                          </button>
                        )}
                        {step.isCompleted && step.completedDate && (
                          <span className="text-xs text-green-600">
                            {formatDateChinese(step.completedDate)}完成
                          </span>
                        )}
                      </div>

                      {isEditing ? (
                        <div className="flex items-center gap-2 mt-2">
                          <input
                            type="date"
                            value={editDate}
                            onChange={(e) => setEditDate(e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            autoFocus
                          />
                          <button
                            onClick={saveEditDate}
                            className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg"
                          >
                            确定
                          </button>
                          <button
                            onClick={() => setEditingStep(null)}
                            className="px-3 py-2 text-gray-500 text-sm"
                          >
                            取消
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className={cn(
                            'w-4 h-4',
                            isOverdue ? 'text-red-500' : 'text-gray-400'
                          )} />
                          <span
                            className={cn(
                              'text-sm',
                              isOverdue ? 'text-red-500' : 'text-gray-500',
                              step.isCompleted && 'text-gray-400'
                            )}
                          >
                            {step.completedDate
                              ? `原计划 ${formatDateChinese(step.scheduledDate)}`
                              : isToday(step.scheduledDate)
                              ? '今天'
                              : formatDateChinese(step.scheduledDate)}
                          </span>
                          {!step.isCompleted && (
                            <button
                              onClick={() => startEditDate(step.id, step.scheduledDate)}
                              className="ml-auto text-gray-400 hover:text-gray-600"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}
                          {step.type === 'dry' && simulateRainyDay && !step.isCompleted && (
                            <span className="text-xs text-yellow-600 flex items-center gap-1">
                              <CloudRain className="w-3 h-3" />
                              有雨
                            </span>
                          )}
                        </div>
                      )}

                      {isOverdue && !step.isCompleted && (
                        <p className="text-xs text-red-500 mt-1">已逾期</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {plan.cost > 0 && (
          <div className="bg-white rounded-2xl p-5 shadow-sm mt-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">本次花费</span>
              <span className="text-2xl font-bold text-gray-900">
                ¥{plan.cost.toFixed(2)}
              </span>
            </div>
          </div>
        )}
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">确认删除</h3>
            <p className="text-gray-600 mb-6">删除后无法恢复，确定要删除这个清洗计划吗？</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium"
              >
                取消
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2.5 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanDetail;
