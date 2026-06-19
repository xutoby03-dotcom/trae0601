import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  SprayCan,
  ShieldCheck,
  Droplets,
  Sun,
  PackageOpen,
  UserCheck,
  FileText,
  Clock,
  Box,
  ChevronRight,
  Info,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { DisinfectionTask, DisinfectionStepIndex, DisinfectionStepInfo, DisinfectionTaskStatus } from '@shared/types';
import { DisinfectionBadge } from '@/components/StatusBadge';
import { api } from '@/lib/api';
import { formatDateTime, formatDuration, getWaitMinutes } from '@/lib/format';

const NURSES = ['李护士', '王护士', '张护士', '刘护士'];

const STEP_ICONS = {
  [DisinfectionStepIndex.CLEANING]: Droplets,
  [DisinfectionStepIndex.SOAKING]: SprayCan,
  [DisinfectionStepIndex.RINSING]: Droplets,
  [DisinfectionStepIndex.DRYING]: Sun,
  [DisinfectionStepIndex.STORING]: PackageOpen,
};

const STEP_ORDER = [
  DisinfectionStepIndex.CLEANING,
  DisinfectionStepIndex.SOAKING,
  DisinfectionStepIndex.RINSING,
  DisinfectionStepIndex.DRYING,
  DisinfectionStepIndex.STORING,
];

function DisinfectionProcessPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [task, setTask] = useState<DisinfectionTask | null>(null);
  const [operator, setOperator] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (id) {
      loadTask();
    }
  }, [id]);

  const loadTask = async () => {
    setLoading(true);
    try {
      const data = await api.getDisinfection(id!);
      setTask(data);
      if (data.status === DisinfectionTaskStatus.COMPLETED) {
        setCompleted(true);
      }
    } catch (err: any) {
      alert(err.message);
      navigate('/disinfection');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentStepIndex = (): number => {
    if (!task) return 0;
    return task.currentStep;
  };

  const getCurrentStepInfo = () => {
    const currentIdx = getCurrentStepIndex();
    if (currentIdx >= STEP_ORDER.length) return null;
    const stepEnum = STEP_ORDER[currentIdx];
    return {
      index: stepEnum,
      order: currentIdx,
      info: DisinfectionStepInfo[stepEnum],
      stepData: task?.steps.find((s) => s.stepIndex === stepEnum),
    };
  };

  const handleStepSubmit = async () => {
    if (!task) return;
    const currentInfo = getCurrentStepInfo();
    if (!currentInfo) return;
    if (!operator) {
      alert('请选择负责人');
      return;
    }

    setSubmitting(true);
    try {
      const updated = await api.updateDisinfectionStep(
        task.id,
        currentInfo.index,
        operator,
        note
      );
      setTask(updated);
      setNote('');

      if (currentInfo.index === DisinfectionStepIndex.STORING) {
        await api.completeDisinfection(task.id);
        setCompleted(true);
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-3 border-teal-500 border-t-transparent rounded-full mr-3" />
        <span className="text-slate-600">加载中...</span>
      </div>
    );
  }

  if (!task) return null;

  const currentStepIdx = getCurrentStepIndex();
  const currentInfo = getCurrentStepInfo();
  const waitMinutes = getWaitMinutes(task.createdAt);

  if (completed) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card text-center py-16">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-100 mb-6">
            <ShieldCheck className="w-14 h-14 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">消毒完成</h2>
          <p className="text-lg text-green-600 font-medium mb-1">设备已恢复可用状态</p>
          <p className="text-sm text-slate-500 mb-8">
            {task.deviceCode} · {formatDateTime(new Date().toISOString())}
          </p>
          <div className="grid grid-cols-5 gap-2 max-w-md mx-auto mb-8">
            {STEP_ORDER.map((step) => (
              <div key={step} className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center mb-1">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <span className="text-xs text-slate-500">
                  {DisinfectionStepInfo[step].name}
                </span>
              </div>
            ))}
          </div>
          <Link to="/disinfection" className="btn-primary">
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回消毒队列
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/disinfection" className="btn-ghost !p-2">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="p-2 rounded-lg bg-teal-100">
            <SprayCan className="w-6 h-6 text-teal-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">消毒流程</h1>
            <p className="text-sm text-slate-500">按照步骤完成设备消毒</p>
          </div>
        </div>
        <DisinfectionBadge status={task.status} className="!text-sm !py-1 !px-3" />
      </div>

      <div className="card">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-teal-50 border border-teal-100">
            <Box className="w-8 h-8 text-teal-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-xl font-bold text-slate-900">{task.deviceCode}</h2>
              <DisinfectionBadge status={task.status} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <span className="text-slate-500">创建时间：</span>
                <span className="font-medium text-slate-700">{formatDateTime(task.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-slate-400" />
                <span className="text-slate-500">已等待：</span>
                <span className={`font-medium ${waitMinutes >= 120 ? 'text-red-600' : 'text-slate-700'}`}>
                  {formatDuration(waitMinutes)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-slate-400" />
                <span className="text-slate-500">完成进度：</span>
                <span className="font-medium text-slate-700">
                  {Math.min(task.currentStep, 5)} / 5 步骤
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-8">
          {STEP_ORDER.map((stepEnum, idx) => {
            const Icon = STEP_ICONS[stepEnum];
            const info = DisinfectionStepInfo[stepEnum];
            const stepData = task.steps.find((s) => s.stepIndex === stepEnum);
            const isCompleted = !!stepData?.finishedAt;
            const isCurrent = idx === currentStepIdx;

            return (
              <div key={stepEnum} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                      isCompleted
                        ? 'bg-green-500 text-white shadow-lg shadow-green-200'
                        : isCurrent
                        ? 'bg-teal-600 text-white shadow-lg shadow-teal-200 scale-110'
                        : 'bg-slate-100 text-slate-400 border-2 border-slate-200'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-7 h-7" />
                    ) : (
                      <Icon className="w-6 h-6" />
                    )}
                  </div>
                  <span
                    className={`mt-2 text-sm font-semibold ${
                      isCompleted ? 'text-green-600' : isCurrent ? 'text-teal-600' : 'text-slate-400'
                    }`}
                  >
                    {info.name}
                  </span>
                  {stepData?.finishedAt && (
                    <span className="text-xs text-slate-400 mt-0.5">
                      {formatDateTime(stepData.finishedAt).split(' ')[1]}
                    </span>
                  )}
                </div>
                {idx < STEP_ORDER.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-3 mb-7 rounded-full transition-colors ${
                      isCompleted ? 'bg-green-400' : 'bg-slate-200'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {currentInfo && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="card lg:col-span-2 bg-gradient-to-br from-teal-50 to-blue-50 border-teal-100">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-teal-100">
                <Info className="w-4 h-4 text-teal-600" />
              </div>
              <span className="text-xs font-medium text-teal-700 uppercase tracking-wider">
                步骤 {currentInfo.order + 1} / 5
              </span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              {(() => {
                const Icon = STEP_ICONS[currentInfo.index];
                return <Icon className="w-6 h-6 text-teal-600" />;
              })()}
              {currentInfo.info.name}
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1.5">操作说明</p>
                <p className="text-slate-700 leading-relaxed text-sm">
                  {currentInfo.info.desc}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1.5">建议时长</p>
                <p className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-teal-700 text-sm font-medium border border-teal-200">
                  <Clock className="w-3.5 h-3.5" />
                  {currentInfo.info.duration}
                </p>
              </div>
              {currentInfo.stepData?.note && (
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1.5">上一步备注</p>
                  <p className="text-sm text-slate-600 bg-white/60 p-3 rounded-lg border border-slate-200">
                    {currentInfo.stepData.note}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="card lg:col-span-3">
            <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2 pb-3 border-b border-slate-100">
              <UserCheck className="w-5 h-5 text-slate-600" />
              执行操作
            </h3>

            <div className="space-y-5">
              <div>
                <label className="label">负责人 <span className="text-red-500">*</span></label>
                <select
                  className="select"
                  value={operator}
                  onChange={(e) => setOperator(e.target.value)}
                >
                  <option value="">请选择执行本步骤的负责人</option>
                  {NURSES.map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  备注信息
                </label>
                <textarea
                  className="textarea h-28"
                  placeholder="记录消毒过程中的特殊情况、异常问题、设备状态等..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>

              <div className="pt-2">
                <button
                  onClick={handleStepSubmit}
                  disabled={submitting || !operator}
                  className="btn-success w-full !py-3 text-base disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2" />
                      提交中...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5 mr-2" />
                      确认完成「{currentInfo.info.name}」
                      <ChevronRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-4">步骤完成情况</h3>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {STEP_ORDER.map((stepEnum) => {
            const info = DisinfectionStepInfo[stepEnum];
            const stepData = task.steps.find((s) => s.stepIndex === stepEnum);
            const isDone = !!stepData?.finishedAt;
            return (
              <div
                key={stepEnum}
                className={`p-4 rounded-xl border ${
                  isDone
                    ? 'bg-green-50 border-green-200'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`font-semibold text-sm ${isDone ? 'text-green-700' : 'text-slate-500'}`}>
                    {info.name}
                  </span>
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-slate-300" />
                  )}
                </div>
                {isDone && (
                  <div className="space-y-1">
                    <p className="text-xs text-slate-600">
                      <UserCheck className="w-3 h-3 inline mr-1" />
                      {stepData?.operator}
                    </p>
                    <p className="text-xs text-slate-400">
                      {stepData?.finishedAt && formatDateTime(stepData.finishedAt)}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default DisinfectionProcessPage;
