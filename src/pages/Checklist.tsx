import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useStore,
  getEarLabel,
  getFeedbackTypeEmoji,
  getFeedbackTypeLabel,
} from '@/store/useStore';
import {
  Plus,
  CheckCircle2,
  Circle,
  AlertTriangle,
  Check,
  Calendar,
  ChevronDown,
  ChevronUp,
  Volume2,
  VolumeX,
  MessageCircleWarning,
} from 'lucide-react';
import Modal from '@/components/Modal';
import { FeedbackForm } from '@/components/RecordForms';
import type { Feedback, FeedbackType } from '@/types';
import { format, parseISO, isBefore } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export default function Checklist() {
  const navigate = useNavigate();
  const devices = useStore((s) => s.devices);
  const feedbacks = useStore((s) => s.feedbacks);
  const checklistItems = useStore((s) => s.checklistItems);
  const getDeviceById = useStore((s) => s.getDeviceById);
  const addFeedback = useStore((s) => s.addFeedback);
  const toggleChecklistItem = useStore((s) => s.toggleChecklistItem);
  const resolveFeedback = useStore((s) => s.resolveFeedback);

  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [expandedFeedback, setExpandedFeedback] = useState<string | null>(null);

  const today = new Date().toISOString().split('T')[0];

  const stats = useMemo(() => {
    const counts = { whistling: 0, sound_low: 0, pain: 0 } as Record<FeedbackType, number>;
    const pending = feedbacks.filter((f) => f.status === 'pending');
    pending.forEach((f) => {
      counts[f.type]++;
    });
    return counts;
  }, [feedbacks]);

  const totalPending = feedbacks.filter((f) => f.status === 'pending').length;
  const totalChecklist = checklistItems.length;
  const completedChecklist = checklistItems.filter((c) => c.completed).length;

  const sortedFeedbacks = useMemo(() => {
    return [...feedbacks].sort((a, b) => {
      if (a.status !== b.status) return a.status === 'pending' ? -1 : 1;
      return b.date.localeCompare(a.date);
    });
  }, [feedbacks]);

  const getFeedbackIcon = (type: FeedbackType) => {
    switch (type) {
      case 'whistling':
        return Volume2;
      case 'sound_low':
        return VolumeX;
      case 'pain':
        return MessageCircleWarning;
    }
  };

  const getFeedbackColor = (type: FeedbackType) => {
    switch (type) {
      case 'whistling':
        return {
          bg: 'from-purple-500 to-purple-700',
          light: 'bg-purple-50 border-purple-200',
          text: 'text-purple-700',
          badge: 'bg-purple-100 text-purple-700',
        };
      case 'sound_low':
        return {
          bg: 'from-blue-500 to-blue-700',
          light: 'bg-blue-50 border-blue-200',
          text: 'text-blue-700',
          badge: 'bg-blue-100 text-blue-700',
        };
      case 'pain':
        return {
          bg: 'from-rose-500 to-rose-700',
          light: 'bg-rose-50 border-rose-200',
          text: 'text-rose-700',
          badge: 'bg-rose-100 text-rose-700',
        };
    }
  };

  const handleResolve = (fb: Feedback) => {
    const items = checklistItems.filter((c) => c.feedbackId === fb.id);
    const allDone = items.length > 0 && items.every((c) => c.completed);
    if (!allDone) {
      if (!confirm('还有未完成的复查项，确定要标记为已解决吗？')) return;
    }
    resolveFeedback(fb.id);
  };

  return (
    <div className="container py-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-fade-in-up">
        <div>
          <h2 className="text-3xl font-bold text-accent-blue">✅ 复查清单</h2>
          <p className="text-warm-400 mt-2">
            异常反馈自动生成检查项，一步步排查和解决问题
          </p>
        </div>
        <button
          onClick={() => {
            if (devices.length === 0) {
              alert('请先添加设备');
              navigate('/devices');
              return;
            }
            setShowFeedbackModal(true);
          }}
          className="btn-danger"
        >
          <Plus size={18} />
          报异常
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {([
          { key: 'whistling', label: '啸叫', emoji: '📢' },
          { key: 'sound_low', label: '声音小', emoji: '🔇' },
          { key: 'pain', label: '佩戴疼', emoji: '😣' },
        ] as { key: FeedbackType; label: string; emoji: string }[]).map((t, idx) => {
          const Icon = getFeedbackIcon(t.key);
          const colors = getFeedbackColor(t.key);
          return (
            <div
              key={t.key}
              className="card animate-fade-in-up p-5"
              style={{ animationDelay: `${idx * 0.05}s` }}
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${colors.bg} flex items-center justify-center shadow-soft`}
                >
                  <Icon size={20} className="text-white" />
                </div>
                <span className="text-2xl">{t.emoji}</span>
              </div>
              <p className="text-sm text-warm-400">{t.label}待处理</p>
              <p
                className={`text-3xl font-bold mt-1 ${
                  stats[t.key] > 0 ? colors.text : 'text-warm-300'
                }`}
              >
                {stats[t.key]}
              </p>
            </div>
          );
        })}
        <div
          className="card animate-fade-in-up p-5 bg-gradient-to-br from-brand-500 to-brand-700 text-white"
          style={{ animationDelay: '0.15s' }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center">
              <Check size={20} />
            </div>
            <span className="text-2xl">📊</span>
          </div>
          <p className="text-sm text-white/70">清单完成率</p>
          <p className="text-3xl font-bold mt-1">
            {totalChecklist > 0 ? Math.round((completedChecklist / totalChecklist) * 100) : 0}%
          </p>
          <div className="mt-2 w-full h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-500"
              style={{
                width: `${totalChecklist > 0 ? (completedChecklist / totalChecklist) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
      </div>

      {totalPending > 0 && (
        <div
          className="card p-5 bg-accent-red/5 border-2 border-accent-red/20 animate-fade-in-up"
          style={{ animationDelay: '0.18s' }}
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-accent-red/10 flex items-center justify-center flex-shrink-0 animate-pulse-soft">
              <AlertTriangle size={24} className="text-accent-red" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-accent-red mb-1">
                有 {totalPending} 条异常等待处理
              </h3>
              <p className="text-warm-500">
                请按照下方复查清单逐项检查处理，完成后可标记为已解决
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-xl font-bold text-accent-blue flex items-center gap-2 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          📋 异常记录与复查清单
          <span className="tag bg-warm-100 text-warm-500 text-sm font-normal">
            {feedbacks.length} 条记录
          </span>
        </h3>

        {feedbacks.length === 0 ? (
          <div className="card text-center py-20 animate-fade-in-up">
            <div className="text-7xl mb-6">🎊</div>
            <h3 className="text-2xl font-bold text-accent-blue mb-3">太棒了！</h3>
            <p className="text-warm-400 mb-8 max-w-md mx-auto">
              目前没有任何异常反馈，助听器工作状态良好。如果发现任何问题，点击上方按钮提交反馈。
            </p>
            <button
              onClick={() => {
                if (devices.length === 0) {
                  navigate('/devices');
                  return;
                }
                setShowFeedbackModal(true);
              }}
              className="btn-danger px-8 py-4 text-lg"
            >
              <AlertTriangle size={20} />
              提交第一条异常
            </button>
          </div>
        ) : (
          sortedFeedbacks.map((fb, idx) => {
            const device = getDeviceById(fb.deviceId);
            const items = checklistItems.filter((c) => c.feedbackId === fb.id);
            const doneCount = items.filter((i) => i.completed).length;
            const colors = getFeedbackColor(fb.type);
            const Icon = getFeedbackIcon(fb.type);
            const isExpanded = expandedFeedback === fb.id || fb.status === 'pending';
            const allDone = items.length > 0 && doneCount === items.length;

            return (
              <div
                key={fb.id}
                className={`card overflow-hidden p-0 animate-fade-in-up ${
                  fb.status === 'resolved' ? 'opacity-70' : ''
                }`}
                style={{ animationDelay: `${0.25 + idx * 0.05}s` }}
              >
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${colors.bg} flex items-center justify-center shadow-card flex-shrink-0`}
                    >
                      <Icon size={26} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h4 className="text-xl font-bold text-accent-blue flex items-center gap-2">
                          <span>{getFeedbackTypeEmoji(fb.type)}</span>
                          {getFeedbackTypeLabel(fb.type)}
                        </h4>
                        {fb.status === 'pending' ? (
                          allDone ? (
                            <span className="tag bg-green-100 text-green-700 gap-1">
                              <CheckCircle2 size={14} />
                              待确认解决
                            </span>
                          ) : (
                            <span className="tag bg-accent-red/10 text-accent-red gap-1 animate-pulse-soft">
                              <AlertTriangle size={14} />
                              待处理
                            </span>
                          )
                        ) : (
                          <span className="tag bg-gray-100 text-gray-500 gap-1">
                            <CheckCircle2 size={14} />
                            已解决
                          </span>
                        )}
                        <span className={`tag ${colors.badge}`}>
                          {getEarLabel(device?.ear ?? 'both')}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-warm-400">
                        {device && (
                          <span className="flex items-center gap-1">
                            👂 {device.name}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {format(parseISO(fb.date), 'yyyy年M月d日', { locale: zhCN })}
                        </span>
                        {items.length > 0 && (
                          <span className="flex items-center gap-1">
                            <CheckCircle2 size={14} />
                            {doneCount}/{items.length} 已完成
                          </span>
                        )}
                      </div>
                      <div className="mt-4 p-4 rounded-2xl bg-warm-50 border-l-4 border-brand-300">
                        <p className="text-accent-blue leading-relaxed">{fb.description}</p>
                      </div>
                    </div>
                  </div>

                  {fb.status === 'pending' && items.length > 0 && (
                    <div className="mt-5 w-full h-3 bg-warm-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          allDone
                            ? 'bg-gradient-to-r from-green-400 to-green-600'
                            : 'bg-gradient-to-r from-brand-400 to-brand-600'
                        }`}
                        style={{ width: `${(doneCount / items.length) * 100}%` }}
                      />
                    </div>
                  )}
                </div>

                {items.length > 0 && (
                  <div className="border-t border-warm-100">
                    <button
                      onClick={() =>
                        setExpandedFeedback(isExpanded ? null : fb.id)
                      }
                      className="w-full flex items-center justify-between px-6 py-4 hover:bg-warm-50 transition-all text-left"
                    >
                      <span className="font-medium text-accent-blue flex items-center gap-2">
                        📝 复查清单
                        <span className="text-sm text-warm-400 font-normal">
                          ({doneCount}/{items.length})
                        </span>
                      </span>
                      {isExpanded ? (
                        <ChevronUp size={20} className="text-warm-400" />
                      ) : (
                        <ChevronDown size={20} className="text-warm-400" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="px-6 pb-6 space-y-2 animate-slide-in">
                        {items.map((item, iIdx) => {
                          const isOverdue =
                            !item.completed &&
                            isBefore(parseISO(item.dueDate), parseISO(today));
                          return (
                            <div
                              key={item.id}
                              className={`group flex items-start gap-3 p-4 rounded-2xl transition-all border-2 ${
                                item.completed
                                  ? 'bg-green-50 border-green-100'
                                  : isOverdue
                                  ? 'bg-accent-red/5 border-accent-red/20'
                                  : 'bg-white border-warm-100 hover:border-brand-200 hover:shadow-soft'
                              }`}
                            >
                              <button
                                onClick={() => toggleChecklistItem(item.id)}
                                disabled={fb.status === 'resolved'}
                                className="mt-0.5 flex-shrink-0 transition-transform hover:scale-110 disabled:cursor-not-allowed"
                              >
                                {item.completed ? (
                                  <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center shadow-soft">
                                    <Check size={14} className="text-white" />
                                  </div>
                                ) : (
                                  <Circle
                                    size={24}
                                    className={`${
                                      isOverdue ? 'text-accent-red' : 'text-warm-300 group-hover:text-brand-500'
                                    }`}
                                  />
                                )}
                              </button>
                              <div className="flex-1 min-w-0">
                                <p
                                  className={`font-medium leading-relaxed ${
                                    item.completed
                                      ? 'text-warm-400 line-through'
                                      : 'text-accent-blue'
                                  }`}
                                >
                                  <span className="mr-2 text-sm text-warm-300">
                                    {iIdx + 1}.
                                  </span>
                                  {item.title}
                                </p>
                                <div className="flex items-center gap-3 mt-1.5 text-xs">
                                  <span
                                    className={`inline-flex items-center gap-1 ${
                                      item.completed
                                        ? 'text-green-600'
                                        : isOverdue
                                        ? 'text-accent-red'
                                        : 'text-warm-400'
                                    }`}
                                  >
                                    <Calendar size={12} />
                                    {item.completed && item.completedAt
                                      ? `完成于 ${format(parseISO(item.completedAt), 'M月d日', { locale: zhCN })}`
                                      : `建议 ${format(parseISO(item.dueDate), 'M月d日', { locale: zhCN })} 前完成`}
                                  </span>
                                  {isOverdue && !item.completed && (
                                    <span className="tag bg-accent-red/10 text-accent-red py-0.5">
                                      ⚠️ 已逾期
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {fb.status === 'pending' && (
                  <div className="px-6 pb-6 pt-2 flex flex-wrap gap-3">
                    {device && (
                      <button
                        onClick={() => navigate(`/devices/${device.id}`)}
                        className="btn-secondary"
                      >
                        查看设备详情
                      </button>
                    )}
                    <button
                      onClick={() => handleResolve(fb)}
                      className={`${
                        allDone ? 'btn-primary' : 'btn-secondary'
                      } ml-auto`}
                    >
                      <CheckCircle2 size={18} />
                      {allDone ? '全部完成，标记解决' : '提前标记为已解决'}
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <Modal
        open={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        title="⚠️ 提交异常反馈"
        subtitle="选择问题类型并详细描述，系统将自动生成复查清单"
        size="lg"
      >
        <FeedbackForm
          onSubmit={(data) => {
            addFeedback(data);
            setShowFeedbackModal(false);
          }}
          onCancel={() => setShowFeedbackModal(false)}
        />
      </Modal>
    </div>
  );
}
