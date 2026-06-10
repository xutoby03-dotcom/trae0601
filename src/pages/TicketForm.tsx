import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  User,
  Phone,
  Users,
  FileText,
  AlertTriangle,
  Ticket as TicketIcon,
  ChevronRight,
  ChevronLeft,
  Pause,
  ArrowLeft,
} from 'lucide-react';
import NavHeader from '@/components/NavHeader';
import { useQueueStore } from '@/store/queueStore';
import { TicketFormData } from '@/types';
import {
  formatTicketNumber,
  getWaitingList,
  formatWaitTime,
  calculateWaitTime,
} from '@/utils/helpers';

export default function TicketForm() {
  const navigate = useNavigate();
  const { queue, tickets, createTicket } = useQueueStore();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<TicketFormData>({
    nickname: '',
    phoneLast4: '',
    peopleCount: 1,
    note: '',
    allowSkip: false,
  });
  const [createdTicket, setCreatedTicket] = useState<{
    number: number;
    position: number;
    waitTime: string;
  } | null>(null);

  const waitingList = getWaitingList(tickets);
  const currentWait = queue
    ? formatWaitTime(calculateWaitTime(waitingList.length, queue.estimatedTimePerPerson))
    : '无需等待';

  const handleInputChange = (field: keyof TicketFormData, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePhoneInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
    handleInputChange('phoneLast4', value);
  };

  const canProceed = () => {
    if (step === 1) {
      return formData.nickname.trim().length >= 1;
    }
    if (step === 2) {
      return formData.phoneLast4.length === 4;
    }
    return true;
  };

  const handleSubmit = () => {
    try {
      const ticket = createTicket(formData);
      const position = waitingList.length;
      const waitTime = queue
        ? formatWaitTime(calculateWaitTime(position, queue.estimatedTimePerPerson))
        : '无需等待';
      setCreatedTicket({
        number: ticket.number,
        position,
        waitTime,
      });
      setStep(4);
    } catch (error) {
      alert(error instanceof Error ? error.message : '取号失败');
    }
  };

  const handleNewTicket = () => {
    setFormData({
      nickname: '',
      phoneLast4: '',
      peopleCount: 1,
      note: '',
      allowSkip: false,
    });
    setCreatedTicket(null);
    setStep(1);
  };

  if (!queue) return null;

  if (queue.isPaused) {
    return (
      <div className="min-h-screen">
        <NavHeader />
        <main className="max-w-lg mx-auto px-4 py-8">
          <div className="glass rounded-3xl p-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-500/20 mb-4">
              <Pause className="w-10 h-10 text-amber-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">暂不接单</h2>
            <p className="text-white/60 mb-6">
              店铺暂时停止接单，请稍后再来
            </p>
            <Link to="/" className="btn-primary inline-flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              返回首页
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <NavHeader />

      <main className="max-w-lg mx-auto px-4 py-8">
        {step < 4 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex-1">
                  <div className="flex items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                        step > s
                          ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white'
                          : step === s
                          ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white animate-pulse'
                          : 'bg-white/10 text-white/40'
                      }`}
                    >
                      {step > s ? '✓' : s}
                    </div>
                    {s < 3 && (
                      <div
                        className={`flex-1 h-1 mx-2 rounded transition-all duration-300 ${
                          step > s ? 'bg-emerald-500' : 'bg-white/10'
                        }`}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-white/50">
              <span>基本信息</span>
              <span>联系方式</span>
              <span>补充信息</span>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="glass rounded-3xl p-8 animate-scale-in">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-primary-500/20 flex items-center justify-center">
                <User className="w-6 h-6 text-primary-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold">您的称呼</h2>
                <p className="text-white/50 text-sm">让我们知道怎么称呼您</p>
              </div>
            </div>

            <div className="mb-6">
              <input
                type="text"
                value={formData.nickname}
                onChange={(e) => handleInputChange('nickname', e.target.value)}
                placeholder="请输入昵称或姓名"
                className="input-field text-xl py-4"
                autoFocus
                maxLength={20}
              />
            </div>

            <div className="glass-orange rounded-2xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <TicketIcon className="w-5 h-5 text-primary-400 mt-0.5" />
                <div>
                  <div className="font-medium text-white mb-1">当前排队情况</div>
                  <div className="text-white/60 text-sm">
                    等待中 {waitingList.length} 位 · 预计 {currentWait}
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!canProceed()}
              className={`w-full py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 transition-all duration-300 ${
                canProceed()
                  ? 'btn-primary'
                  : 'bg-white/10 text-white/30 cursor-not-allowed'
              }`}
            >
              下一步
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="glass rounded-3xl p-8 animate-scale-in">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-primary-500/20 flex items-center justify-center">
                <Phone className="w-6 h-6 text-primary-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold">手机号后四位</h2>
                <p className="text-white/50 text-sm">用于核对叫号信息</p>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl text-white/40">**** **** </span>
                <input
                  type="tel"
                  value={formData.phoneLast4}
                  onChange={handlePhoneInput}
                  placeholder="后四位"
                  className="input-field text-2xl text-center tracking-[0.5em] py-4 max-w-[200px]"
                  maxLength={4}
                  autoFocus
                />
              </div>
              <p className="text-white/40 text-sm text-center">
                我们只会使用手机号后四位进行叫号核对
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="btn-secondary flex items-center gap-2 px-6"
              >
                <ChevronLeft className="w-5 h-5" />
                上一步
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!canProceed()}
                className={`flex-1 py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 transition-all duration-300 ${
                  canProceed()
                    ? 'btn-primary'
                    : 'bg-white/10 text-white/30 cursor-not-allowed'
                }`}
              >
                下一步
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="glass rounded-3xl p-8 animate-scale-in">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-primary-500/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold">补充信息</h2>
                <p className="text-white/50 text-sm">帮助我们更好地为您服务</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-3">
                  用餐/服务人数
                </label>
                <div className="flex gap-3">
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handleInputChange('peopleCount', num)}
                      className={`flex-1 py-3 rounded-xl font-medium transition-all duration-300 ${
                        formData.peopleCount === num
                          ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25'
                          : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:border-white/20'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-3">
                  <span className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    备注（可选）
                  </span>
                </label>
                <textarea
                  value={formData.note}
                  onChange={(e) => handleInputChange('note', e.target.value)}
                  placeholder="例如：不要辣、需要靠窗座位等"
                  className="input-field resize-none h-24"
                  maxLength={50}
                />
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => handleInputChange('allowSkip', !formData.allowSkip)}
                  className={`w-full p-4 rounded-2xl border-2 transition-all duration-300 text-left ${
                    formData.allowSkip
                      ? 'border-amber-500/50 bg-amber-500/10'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <AlertTriangle
                      className={`w-5 h-5 mt-0.5 ${
                        formData.allowSkip ? 'text-amber-400' : 'text-white/40'
                      }`}
                    />
                    <div>
                      <div
                        className={`font-medium ${
                          formData.allowSkip ? 'text-amber-400' : 'text-white'
                        }`}
                      >
                        我愿意过号
                      </div>
                      <div className="text-white/50 text-sm mt-1">
                        如果您不在附近，可以选择此项。过号后将自动排到队尾，不会影响其他顾客。
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setStep(2)}
                className="btn-secondary flex items-center gap-2 px-6"
              >
                <ChevronLeft className="w-5 h-5" />
                上一步
              </button>
              <button
                onClick={handleSubmit}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                <TicketIcon className="w-5 h-5" />
                取号
              </button>
            </div>
          </div>
        )}

        {step === 4 && createdTicket && (
          <div className="text-center animate-scale-in">
            <div className="glass rounded-3xl p-8 mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 mb-4">
                <TicketIcon className="w-10 h-10 text-emerald-400" />
              </div>
              <div className="text-white/60 mb-2">您的号码</div>
              <div className="font-display font-bold text-8xl text-gradient-green mb-4">
                {formatTicketNumber(createdTicket.number)}
              </div>
              <div className="text-xl text-white mb-6">
                {formData.nickname} · {formData.peopleCount} 人
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="glass rounded-2xl p-4">
                  <div className="text-white/50 text-sm mb-1">前方等待</div>
                  <div className="text-2xl font-bold text-white">
                    {createdTicket.position} 位
                  </div>
                </div>
                <div className="glass rounded-2xl p-4">
                  <div className="text-white/50 text-sm mb-1">预计等待</div>
                  <div className="text-2xl font-bold text-primary-400">
                    {createdTicket.waitTime}
                  </div>
                </div>
              </div>

              {createdTicket.position <= 2 && (
                <div className="glass-yellow rounded-2xl p-4 mb-6">
                  <div className="flex items-center justify-center gap-2 text-amber-400">
                    <AlertTriangle className="w-5 h-5 animate-pulse" />
                    <span className="font-medium">快轮到你了，请做好准备！</span>
                  </div>
                </div>
              )}

              {formData.allowSkip && (
                <div className="glass-yellow rounded-2xl p-4">
                  <div className="flex items-center justify-center gap-2 text-amber-400 text-sm">
                    <AlertTriangle className="w-4 h-4" />
                    <span>您已选择愿意过号，过号后将自动排到队尾</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <Link to="/" className="btn-secondary flex-1">
                查看大屏
              </Link>
              <button
                onClick={() => navigate(`/ticket/${tickets[tickets.length - 1]?.id}`)}
                className="btn-primary flex-1"
              >
                查看详情
              </button>
            </div>

            <button
              onClick={handleNewTicket}
              className="mt-4 text-white/50 hover:text-white/70 text-sm transition-colors"
            >
              帮其他人取号
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
