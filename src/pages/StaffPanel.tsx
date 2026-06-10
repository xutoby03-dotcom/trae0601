import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Play,
  Pause,
  SkipForward,
  Check,
  X,
  RotateCcw,
  Settings,
  Volume2,
  Clock,
  Users,
  Scissors,
  Coffee,
  Wrench,
  Store,
  AlertTriangle,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import NavHeader from '@/components/NavHeader';
import TicketCard from '@/components/TicketCard';
import { useQueueStore } from '@/store/queueStore';
import {
  formatTicketNumber,
  getCallingTicket,
  getWaitingList,
  getPassedList,
  formatWaitTime,
  calculateWaitTime,
} from '@/utils/helpers';
import { BusinessType, BUSINESS_TYPE_LABELS } from '@/types';

const businessIcons: Record<BusinessType, React.ReactNode> = {
  haircut: <Scissors className="w-5 h-5" />,
  milktea: <Coffee className="w-5 h-5" />,
  repair: <Wrench className="w-5 h-5" />,
  other: <Store className="w-5 h-5" />,
};

const timeOptions = [10, 15, 20, 30, 45, 60];

export default function StaffPanel() {
  const navigate = useNavigate();
  const {
    queue,
    tickets,
    togglePause,
    callNext,
    completeCurrent,
    passCurrent,
    callSpecificTicket,
    moveTicketUp,
    moveTicketDown,
    updateQueueSettings,
    resetQueue,
  } = useQueueStore();

  const [showSettings, setShowSettings] = useState(false);
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [businessName, setBusinessName] = useState(queue?.businessName || '');
  const [estimatedTime, setEstimatedTime] = useState(queue?.estimatedTimePerPerson || 30);

  const callingTicket = getCallingTicket(tickets);
  const waitingList = getWaitingList(tickets);
  const passedList = getPassedList(tickets);

  const handleCallNext = () => {
    if (!callingTicket) {
      callNext();
    }
  };

  const handleComplete = () => {
    completeCurrent();
    setTimeout(() => callNext(), 300);
  };

  const handlePass = () => {
    passCurrent();
    setTimeout(() => callNext(), 300);
  };

  const handleCallSpecific = (ticketId: string) => {
    callSpecificTicket(ticketId);
  };

  const handleSaveSettings = () => {
    updateQueueSettings({
      businessName: businessName.trim() || queue?.businessName,
      estimatedTimePerPerson: estimatedTime,
    });
    setShowSettings(false);
  };

  const handleReset = () => {
    resetQueue();
    setShowConfirmReset(false);
  };

  if (!queue) return null;

  const estimatedWaitAll = waitingList.length > 0
    ? formatWaitTime(calculateWaitTime(waitingList.length, queue.estimatedTimePerPerson))
    : '无需等待';

  return (
    <div className="min-h-screen">
      <NavHeader />

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold font-display mb-1">
              店员控制面板
            </h1>
            <p className="text-white/60 text-sm">
              {businessIcons[queue.businessType]} {queue.businessName}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSettings(true)}
              className="btn-secondary flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              设置
            </button>
            <button
              onClick={togglePause}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
                queue.isPaused
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white'
                  : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white'
              }`}
            >
              {queue.isPaused ? (
                <><Play className="w-4 h-4" /> 恢复接单</>
              ) : (
                <><Pause className="w-4 h-4" /> 暂停接单</>
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="glass rounded-2xl p-4">
            <div className="text-white/50 text-sm mb-1">当前叫号</div>
            <div className="text-2xl font-bold font-display text-emerald-400">
              {callingTicket ? formatTicketNumber(callingTicket.number) : '--'}
            </div>
          </div>
          <div className="glass rounded-2xl p-4">
            <div className="text-white/50 text-sm mb-1">等待中</div>
            <div className="text-2xl font-bold font-display text-white">
              {waitingList.length} 位
            </div>
          </div>
          <div className="glass rounded-2xl p-4">
            <div className="text-white/50 text-sm mb-1">已过号</div>
            <div className="text-2xl font-bold font-display text-amber-400">
              {passedList.length} 位
            </div>
          </div>
          <div className="glass rounded-2xl p-4">
            <div className="text-white/50 text-sm mb-1">预计等待</div>
            <div className="text-2xl font-bold font-display text-primary-400">
              {estimatedWaitAll}
            </div>
          </div>
        </div>

        {callingTicket && (
          <div className="glass-green rounded-3xl p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/20">
                  <Volume2 className="w-8 h-8 text-emerald-400 animate-pulse" />
                </div>
                <div>
                  <div className="text-emerald-400 text-sm font-medium mb-1">正在叫号</div>
                  <div className="text-4xl font-bold font-display text-gradient-green">
                    {formatTicketNumber(callingTicket.number)}
                  </div>
                  <div className="text-white/60 text-sm mt-1">
                    {callingTicket.nickname} · {callingTicket.peopleCount}人 · 尾号 {callingTicket.phoneLast4}
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handlePass}
                  className="btn-warning flex items-center gap-2 min-w-[120px] justify-center"
                >
                  <X className="w-5 h-5" />
                  过号
                </button>
                <button
                  onClick={handleComplete}
                  className="btn-success flex items-center gap-2 min-w-[120px] justify-center"
                >
                  <Check className="w-5 h-5" />
                  完成并叫下一位
                </button>
              </div>
            </div>
            {callingTicket.note && (
              <div className="mt-4 pt-4 border-t border-emerald-500/20 text-white/60">
                <span className="text-emerald-400 font-medium">备注：</span>
                {callingTicket.note}
              </div>
            )}
          </div>
        )}

        {!callingTicket && (
          <div className="glass rounded-3xl p-8 mb-6 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary-500/20 mb-4">
              <Play className="w-10 h-10 text-primary-400" />
            </div>
            <div className="text-2xl font-bold text-white mb-2">
              {waitingList.length > 0 ? '准备叫号' : '暂无等待顾客'}
            </div>
            <div className="text-white/50 mb-4">
              {waitingList.length > 0
                ? `还有 ${waitingList.length} 位顾客在等待`
                : '点击取号或等待新顾客取号'}
            </div>
            {waitingList.length > 0 && (
              <button
                onClick={handleCallNext}
                className="btn-primary flex items-center gap-2 mx-auto"
              >
                <SkipForward className="w-5 h-5" />
                叫下一位
              </button>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-white/60" />
              <h2 className="text-lg font-semibold">等待队列 ({waitingList.length})</h2>
            </div>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {waitingList.map((ticket, idx) => (
                <div key={ticket.id} className="flex gap-2">
                  <div className="flex-1">
                    <TicketCard ticket={ticket} showDetails />
                  </div>
                  <div className="flex flex-col gap-1 self-start">
                    <button
                      onClick={() => moveTicketUp(ticket.id)}
                      className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 text-white/70 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
                      disabled={idx === 0}
                      title="上移"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => moveTicketDown(ticket.id)}
                      className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 text-white/70 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
                      disabled={idx === waitingList.length - 1}
                      title="下移"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleCallSpecific(ticket.id)}
                      className="w-9 h-9 rounded-lg bg-gradient-to-r from-primary-500 to-primary-600 text-white flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed"
                      disabled={!!callingTicket}
                      title="叫号"
                    >
                      <SkipForward className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {waitingList.length === 0 && (
                <div className="glass rounded-2xl p-8 text-center text-white/50">
                  暂无等待顾客
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-semibold">过号列表 ({passedList.length})</h2>
            </div>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {passedList.map((ticket) => (
                <div key={ticket.id} className="flex gap-3">
                  <div className="flex-1">
                    <TicketCard ticket={ticket} showDetails />
                  </div>
                  <button
                    onClick={() => handleCallSpecific(ticket.id)}
                    className="btn-secondary px-4 self-start"
                    disabled={!!callingTicket}
                  >
                    重叫
                  </button>
                </div>
              ))}
              {passedList.length === 0 && (
                <div className="glass rounded-2xl p-8 text-center text-white/50">
                  暂无过号
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/5">
          <button
            onClick={() => setShowConfirmReset(true)}
            className="text-red-400 hover:text-red-300 text-sm flex items-center gap-2 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            重置今日排队数据
          </button>
        </div>
      </main>

      {showSettings && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass rounded-3xl p-8 w-full max-w-md animate-scale-in">
            <h3 className="text-xl font-bold mb-6">队列设置</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-3">
                  店铺名称
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder={BUSINESS_TYPE_LABELS[queue.businessType]}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-3">
                  预计单人服务时长
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {timeOptions.map((time) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setEstimatedTime(time)}
                      className={`py-2 px-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                        estimatedTime === time
                          ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white'
                          : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10'
                      }`}
                    >
                      {time} 分钟
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setShowSettings(false)}
                className="btn-secondary flex-1"
              >
                取消
              </button>
              <button
                onClick={handleSaveSettings}
                className="btn-primary flex-1"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {showConfirmReset && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass rounded-3xl p-8 w-full max-w-md animate-scale-in">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/20 mb-4">
                <AlertTriangle className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">确认重置？</h3>
              <p className="text-white/60 text-sm">
                此操作将清空今日所有排队数据，包括已完成、等待中和过号的记录。此操作不可撤销。
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmReset(false)}
                className="btn-secondary flex-1"
              >
                取消
              </button>
              <button
                onClick={handleReset}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 flex-1"
              >
                确认重置
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
