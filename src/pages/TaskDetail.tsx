import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Play,
  CheckCircle,
  Clock,
  User,
  Tag,
  Calendar,
  Droplets,
  Package,
  AlertTriangle,
  Edit3,
  Trash2,
  Timer,
  Camera,
  X,
} from 'lucide-react';
import useAppStore from '@/store/useAppStore';
import StatusBadge from '@/components/StatusBadge';
import PriorityBadge from '@/components/PriorityBadge';
import ProcessIcon from '@/components/ProcessIcon';
import PhotoUpload from '@/components/PhotoUpload';
import {
  CATEGORY_LABELS,
  PROBLEM_LABELS,
  PROCESS_LABELS,
  MATERIAL_TYPE_LABELS,
} from '@/types';
import { formatDateReadable, daysUntilDeadline, isOverdue } from '@/utils/dateUtils';

const TaskDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { clothings, materials, startClothing, completeClothing, deleteClothing } = useAppStore();

  const clothing = clothings.find((c) => c.id === id);

  const [showCompleteForm, setShowCompleteForm] = useState(false);
  const [photoAfter, setPhotoAfter] = useState<string | undefined>(undefined);
  const [timeSpent, setTimeSpent] = useState('');
  const [completionNotes, setCompletionNotes] = useState('');
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (timerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning]);

  useEffect(() => {
    if (clothing?.status === 'in_progress' && clothing.startedAt) {
      const elapsed = Math.floor(
        (new Date().getTime() - new Date(clothing.startedAt).getTime()) / 1000
      );
      setTimerSeconds(elapsed);
    }
  }, [clothing]);

  if (!clothing) {
    return (
      <div className="text-center py-16">
        <p className="text-brown-500 mb-4">找不到该衣物记录</p>
        <button onClick={() => navigate('/queue')} className="btn-primary">
          返回队列
        </button>
      </div>
    );
  }

  const materialsNeeded = clothing.materialsNeeded
    .map((id) => materials.find((m) => m.id === id))
    .filter(Boolean);

  const hasMaterialShortage = materialsNeeded.some(
    (m) => m && m.quantity <= 0
  );

  const daysLeft = daysUntilDeadline(clothing.deadline);
  const isOverdueTask = isOverdue(clothing.deadline) && clothing.status !== 'completed';

  const handleStart = () => {
    if (hasMaterialShortage && !confirm('部分材料库存不足，确定要开始处理吗？')) {
      return;
    }
    startClothing(clothing.id);
    setTimerRunning(true);
  };

  const handleComplete = () => {
    if (!photoAfter) {
      alert('请上传修复后照片，便于留档对比');
      return;
    }
    const totalMinutes = Math.floor(timerSeconds / 60) + (parseInt(timeSpent) || 0);
    if (totalMinutes === 0 && !timeSpent) {
      alert('请输入或计时记录耗时');
      return;
    }
    completeClothing(clothing.id, {
      photoAfter,
      timeSpent: totalMinutes,
      notes: completionNotes || clothing.notes,
    });
    setShowCompleteForm(false);
    setTimerRunning(false);
  };

  const handleDelete = () => {
    if (confirm('确定要删除这条衣物记录吗？此操作不可撤销。')) {
      deleteClothing(clothing.id);
      navigate('/queue');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4 stagger-item">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-brown-100 flex items-center justify-center hover:bg-brown-200 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-brown-700" />
        </button>
        <div className="flex-1">
          <h1 className="font-display text-2xl font-bold text-brown-900">
            {CATEGORY_LABELS[clothing.category]}
          </h1>
          <p className="text-brown-500 text-sm flex items-center gap-1">
            <User className="w-4 h-4" />
            {clothing.owner}
          </p>
        </div>
        <StatusBadge status={clothing.status} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger-item animate-delay-100">
        <div className="card-no-hover p-5">
          <div className="flex items-center gap-3 mb-4">
            <ProcessIcon type={clothing.processType} size="lg" showLabel />
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Tag className="w-4 h-4 text-brown-400" />
              <span className="text-brown-500">问题：</span>
              <span className="text-brown-700">{PROBLEM_LABELS[clothing.problemType]}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Tag className="w-4 h-4 text-brown-400" />
              <span className="text-brown-500">工序：</span>
              <span className="text-brown-700">{PROCESS_LABELS[clothing.processType]}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-brown-400" />
              <span className="text-brown-500">截止：</span>
              <span
                className={`${
                  isOverdueTask
                    ? 'text-warning-600 font-medium'
                    : daysLeft <= 3
                    ? 'text-warning-500'
                    : 'text-brown-700'
                }`}
              >
                {formatDateReadable(clothing.deadline)}
                {isOverdueTask ? ' (已过期)' : ` (还剩 ${daysLeft} 天)`}
              </span>
            </div>
            {clothing.washBefore && (
              <div className="flex items-center gap-2 text-sm">
                <Droplets className="w-4 h-4 text-blue-500" />
                <span className="text-blue-600">需要洗后再改</span>
              </div>
            )}
          </div>
        </div>

        <div className="card-no-hover p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-brown-800">标签</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            <PriorityBadge priority={clothing.priority} />
            {clothing.washBefore && (
              <span className="inline-flex items-center gap-1 px-3 py-1 text-sm rounded-full bg-blue-50 text-blue-600">
                <Droplets className="w-3.5 h-3.5" />
                洗后再改
              </span>
            )}
            {hasMaterialShortage && (
              <span className="inline-flex items-center gap-1 px-3 py-1 text-sm rounded-full bg-warning-50 text-warning-600 animate-pulse-soft">
                <AlertTriangle className="w-3.5 h-3.5" />
                缺材料
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="card-no-hover p-6 stagger-item animate-delay-200">
        <h3 className="font-semibold text-brown-800 mb-4 flex items-center gap-2">
          <Package className="w-5 h-5 text-primary-500" />
          所需材料
        </h3>
        {materialsNeeded.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {materialsNeeded.map((material) =>
              material ? (
                <div
                  key={material.id}
                  className={`p-3 rounded-xl border-2 ${
                    material.quantity <= 0
                      ? 'border-warning-300 bg-warning-50'
                      : material.quantity < material.threshold
                      ? 'border-warning-200 bg-warning-50/50'
                      : 'border-brown-200 bg-brown-50'
                  }`}
                >
                  <p className="font-medium text-brown-800 text-sm">
                    {MATERIAL_TYPE_LABELS[material.type]}
                  </p>
                  <p className="text-sm text-brown-600">{material.name}</p>
                  <p
                    className={`text-xs mt-1 ${
                      material.quantity <= 0
                        ? 'text-warning-600 font-medium'
                        : material.quantity < material.threshold
                        ? 'text-warning-500'
                        : 'text-brown-500'
                    }`}
                  >
                    库存 {material.quantity} {material.unit}
                    {material.quantity <= 0 && ' ⚠️ 缺货'}
                    {material.quantity > 0 && material.quantity < material.threshold &&
                      ' ⚠️ 不足'}
                  </p>
                </div>
              ) : null
            )}
          </div>
        ) : (
          <p className="text-brown-500 text-sm">无需材料</p>
        )}
      </div>

      {clothing.notes && (
        <div className="card-no-hover p-6 stagger-item animate-delay-200">
          <h3 className="font-semibold text-brown-800 mb-3 flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-primary-500" />
            备注
          </h3>
          <p className="text-brown-600">{clothing.notes}</p>
        </div>
      )}

      {clothing.photoBefore && (
        <div className="card-no-hover p-6 stagger-item animate-delay-300">
          <h3 className="font-semibold text-brown-800 mb-4 flex items-center gap-2">
            <Camera className="w-5 h-5 text-primary-500" />
            修复前照片
          </h3>
          <img
            src={clothing.photoBefore}
            alt="修复前"
            className="w-full max-w-md rounded-xl border-2 border-brown-200"
          />
        </div>
      )}

      {clothing.status === 'completed' && (
        <div className="space-y-6 stagger-item animate-delay-300">
          {clothing.photoAfter && (
            <div className="card-no-hover p-6">
              <h3 className="font-semibold text-brown-800 mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-success-500" />
                修复后照片
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {clothing.photoBefore && (
                  <div>
                    <p className="text-sm text-brown-500 mb-2">修复前</p>
                    <img
                      src={clothing.photoBefore}
                      alt="修复前"
                      className="w-full rounded-xl border-2 border-brown-200"
                    />
                  </div>
                )}
                <div>
                  <p className="text-sm text-brown-500 mb-2">修复后</p>
                  <img
                    src={clothing.photoAfter}
                    alt="修复后"
                    className="w-full rounded-xl border-2 border-success-300"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="card-no-hover p-6">
            <h3 className="font-semibold text-brown-800 mb-4 flex items-center gap-2">
              <Timer className="w-5 h-5 text-success-500" />
              完成信息
            </h3>
            <div className="space-y-2 text-brown-600">
              <p>
                耗时：<span className="font-semibold text-brown-800">{clothing.timeSpent} 分钟</span>
              </p>
              <p>
                完成时间：
                <span className="font-semibold text-brown-800">
                  {clothing.completedAt && formatDateReadable(clothing.completedAt)}
                </span>
              </p>
            </div>
          </div>
        </div>
      )}

      {clothing.status !== 'completed' && (
        <div className="sticky bottom-20 md:bottom-0 bg-cream/80 backdrop-blur-md py-4 -mx-4 px-4 stagger-item animate-delay-400">
          <div className="max-w-3xl mx-auto">
            {clothing.status === 'pending' && (
              <div className="flex gap-3">
                <button onClick={handleDelete} className="btn-danger flex-1">
                  <Trash2 className="w-5 h-5" />
                </button>
                <button
                  onClick={handleStart}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  <Play className="w-5 h-5" />
                  开始处理
                </button>
              </div>
            )}

            {clothing.status === 'in_progress' && !showCompleteForm && (
              <div className="card-no-hover p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
                      <Clock className="w-8 h-8 text-primary-500 animate-pulse" />
                    </div>
                    <div>
                      <p className="text-sm text-brown-500">处理中...</p>
                      <p className="font-display text-3xl font-bold text-brown-900">
                        {formatTime(timerSeconds)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setTimerRunning(!timerRunning)}
                    className={`px-4 py-2 rounded-xl font-medium ${
                      timerRunning
                        ? 'bg-warning-100 text-warning-600'
                        : 'bg-success-100 text-success-600'
                    }`}
                  >
                    {timerRunning ? '暂停' : '继续'}
                  </button>
                </div>
                <div className="flex gap-3">
                  <button onClick={handleDelete} className="btn-danger flex-1">
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setShowCompleteForm(true)}
                    className="btn-success flex-1 flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    完成修补
                  </button>
                </div>
              </div>
            )}

            {showCompleteForm && (
              <div className="card-no-hover p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-brown-800">完成修补</h3>
                  <button
                    onClick={() => setShowCompleteForm(false)}
                    className="w-8 h-8 rounded-full bg-brown-100 flex items-center justify-center"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <p className="form-label">累计耗时</p>
                  <div className="flex items-center gap-4">
                    <p className="font-display text-2xl font-bold text-brown-900">
                      {formatTime(timerSeconds)}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-brown-500">额外耗时：</span>
                      <input
                        type="number"
                        value={timeSpent}
                        onChange={(e) => setTimeSpent(e.target.value)}
                        placeholder="分钟"
                        className="input-field w-24 py-2"
                      />
                      <span className="text-sm text-brown-500">分钟</span>
                    </div>
                  </div>
                </div>

                <PhotoUpload
                  value={photoAfter}
                  onChange={setPhotoAfter}
                  label="修复后照片（必填）"
                  required
                />

                <div>
                  <p className="form-label">备注</p>
                  <textarea
                    value={completionNotes}
                    onChange={(e) => setCompletionNotes(e.target.value)}
                    placeholder="填写修复说明..."
                    rows={3}
                    className="input-field resize-none"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowCompleteForm(false)}
                    className="btn-secondary flex-1"
                  >
                    取消
                  </button>
                  <button onClick={handleComplete} className="btn-success flex-1">
                    确认完成
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskDetail;
