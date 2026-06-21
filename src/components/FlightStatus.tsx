import { Plane, ShieldAlert, ShieldCheck, Loader2 } from 'lucide-react';
import { useFlightStore } from '@/store/useFlightStore';

const statusConfig: Record<string, { bg: string; border: string; text: string; glow: string; label: string; sub: string; Icon: typeof ShieldCheck }> = {
  idle: {
    bg: 'bg-white/[0.03]',
    border: 'border-white/10',
    text: 'text-white/40',
    glow: '',
    label: '等待检查',
    sub: '请输入拍摄地点',
    Icon: Loader2,
  },
  checking: {
    bg: 'bg-[#00E5A0]/[0.04]',
    border: 'border-[#00E5A0]/20',
    text: 'text-[#00E5A0]',
    glow: 'shadow-[0_0_30px_rgba(0,229,160,0.1)]',
    label: '检查中...',
    sub: '正在评估飞行条件',
    Icon: Loader2,
  },
  ready: {
    bg: 'bg-[#00E5A0]/[0.06]',
    border: 'border-[#00E5A0]/30',
    text: 'text-[#00E5A0]',
    glow: 'shadow-[0_0_40px_rgba(0,229,160,0.15)]',
    label: '可以起飞',
    sub: '所有检查项均已通过',
    Icon: ShieldCheck,
  },
  risk: {
    bg: 'bg-[#FF4757]/[0.04]',
    border: 'border-[#FF4757]/20',
    text: 'text-[#FF4757]',
    glow: 'shadow-[0_0_40px_rgba(255,71,87,0.12)]',
    label: '风险待确认',
    sub: '存在不合规项，请查看详情',
    Icon: ShieldAlert,
  },
};

export default function FlightStatus() {
  const { flightStatus } = useFlightStore();
  const cfg = statusConfig[flightStatus];
  const { Icon } = cfg;

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-50 border-t ${cfg.border} ${cfg.bg} backdrop-blur-xl ${cfg.glow} transition-all duration-500`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <div className="flex items-center gap-3">
          <div className={`flex h-8 w-8 items-center justify-center rounded-full ${cfg.bg}`}>
            <Icon size={18} className={`${cfg.text} ${flightStatus === 'checking' ? 'animate-spin' : ''}`} />
          </div>
          <div>
            <div className={`text-sm font-bold ${cfg.text}`}>{cfg.label}</div>
            <div className="text-[10px] text-white/30">{cfg.sub}</div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {flightStatus === 'risk' && (
            <div className="flex items-center gap-1 text-xs text-[#FF4757]/70">
              <span className="h-1.5 w-1.5 rounded-full bg-[#FF4757] animate-pulse" />
              <span>请检查标红镜头</span>
            </div>
          )}
          {flightStatus === 'ready' && (
            <div className="flex items-center gap-1 text-xs text-[#00E5A0]/70">
              <span className="h-1.5 w-1.5 rounded-full bg-[#00E5A0] animate-pulse" />
              <span>条件满足，确认起飞</span>
            </div>
          )}
          <button
            disabled={flightStatus !== 'ready'}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all ${
              flightStatus === 'ready'
                ? 'bg-[#00E5A0] text-[#0F1419] hover:bg-[#00E5A0]/90 shadow-[0_0_20px_rgba(0,229,160,0.3)]'
                : 'bg-white/5 text-white/20 cursor-not-allowed'
            }`}
          >
            <Plane size={14} />
            确认起飞
          </button>
        </div>
      </div>
    </div>
  );
}
