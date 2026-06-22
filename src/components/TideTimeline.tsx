import { SamplingSite, UrgencyLevel } from '@/types';
import { calculateTideWindow, getUrgencyLevel } from '@/utils/tideCalculations';
import { formatTime, formatDuration } from '@/utils/formatters';
import { useNow, formatCountdown } from '@/hooks/useCountdown';
import { ArrowRight, Clock, AlertTriangle, CheckCircle, XCircle, Waves } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TideTimelineProps {
  site: SamplingSite;
}

const urgencyConfig: Record<UrgencyLevel, { label: string; color: string; bgColor: string; icon: typeof Clock }> = {
  safe: {
    label: '时间充足',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100',
    icon: CheckCircle,
  },
  warning: {
    label: '即将开始',
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
    icon: AlertTriangle,
  },
  critical: {
    label: '正在低潮',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    icon: AlertTriangle,
  },
  expired: {
    label: '窗口已过',
    color: 'text-slate-500',
    bgColor: 'bg-slate-100',
    icon: XCircle,
  },
};

export default function TideTimeline({ site }: TideTimelineProps) {
  const now = useNow(20000);
  const tideWindow = calculateTideWindow(site);
  const urgency = getUrgencyLevel(tideWindow);
  const config = urgencyConfig[urgency];

  const nowMs = now.getTime();
  const depMs = tideWindow.latestDeparture.getTime();
  const evMs = tideWindow.mustEvacuate.getTime();
  const endMs = tideWindow.tideEnd.getTime();

  let warnLevel: 'none' | 'departure30' | 'departure10' | 'departureMissed' | 'evacuate30' | 'evacuate10' | 'evacuateMissed' | 'windowEnding';
  if (endMs < nowMs) {
    warnLevel = 'evacuateMissed';
  } else if (endMs - nowMs <= 20 * 60000 && evMs <= nowMs) {
    warnLevel = 'windowEnding';
  } else if (evMs < nowMs) {
    warnLevel = 'evacuateMissed';
  } else if (evMs - nowMs <= 10 * 60000) {
    warnLevel = 'evacuate10';
  } else if (evMs - nowMs <= 30 * 60000) {
    warnLevel = 'evacuate30';
  } else if (depMs < nowMs) {
    warnLevel = 'departureMissed';
  } else if (depMs - nowMs <= 10 * 60000) {
    warnLevel = 'departure10';
  } else if (depMs - nowMs <= 30 * 60000) {
    warnLevel = 'departure30';
  } else {
    warnLevel = 'none';
  }

  const warnBanner = (() => {
    switch (warnLevel) {
      case 'evacuateMissed':
        return {
          bg: 'bg-gradient-to-r from-red-500 to-rose-500',
          text: 'text-white',
          icon: XCircle,
          title: '必须立即撤离！',
          sub: '潮水已回涨到警戒线以上，' + formatCountdown(tideWindow.mustEvacuate, now).text + '到达撤离时间',
          pulse: 'animate-pulse',
        };
      case 'windowEnding':
        return {
          bg: 'bg-gradient-to-r from-red-500 to-orange-500',
          text: 'text-white',
          icon: Waves,
          title: '窗口即将关闭！',
          sub: '距离潮水回涨结束还有 ' + formatCountdown(tideWindow.tideEnd, now).text,
          pulse: 'animate-pulse',
        };
      case 'evacuate10':
        return {
          bg: 'bg-gradient-to-r from-red-500 to-orange-500',
          text: 'text-white',
          icon: AlertTriangle,
          title: '紧急：10分钟内必须撤离',
          sub: '还剩 ' + formatCountdown(tideWindow.mustEvacuate, now).text + '，请立即收拾准备回程',
          pulse: 'animate-pulse',
        };
      case 'evacuate30':
        return {
          bg: 'bg-gradient-to-r from-orange-400 to-amber-400',
          text: 'text-white',
          icon: AlertTriangle,
          title: '半小时内需撤离',
          sub: '距必须撤离还有 ' + formatCountdown(tideWindow.mustEvacuate, now).text + '，请留意时间',
          pulse: '',
        };
      case 'departureMissed':
        return {
          bg: 'bg-gradient-to-r from-slate-500 to-slate-600',
          text: 'text-white',
          icon: XCircle,
          title: '已错过最晚出发时间',
          sub: formatCountdown(tideWindow.latestDeparture, now).text + '。若已出发请加快速度，否则考虑改期',
          pulse: '',
        };
      case 'departure10':
        return {
          bg: 'bg-gradient-to-r from-red-500 to-pink-500',
          text: 'text-white',
          icon: AlertTriangle,
          title: '10分钟内必须出发！',
          sub: '距最晚出发还有 ' + formatCountdown(tideWindow.latestDeparture, now).text + '，立即行动！',
          pulse: 'animate-pulse',
        };
      case 'departure30':
        return {
          bg: 'bg-gradient-to-r from-amber-400 to-yellow-400',
          text: 'text-white',
          icon: AlertTriangle,
          title: '半小时内需出发',
          sub: '距最晚出发还有 ' + formatCountdown(tideWindow.latestDeparture, now).text + '，请完成最后的准备',
          pulse: '',
        };
      default:
        return null;
    }
  })();

  const totalDuration = tideWindow.tideEnd.getTime() - tideWindow.tideStart.getTime();
  const progress = Math.min(100, Math.max(0,
    ((now.getTime() - tideWindow.tideStart.getTime()) / totalDuration) * 100
  ));

  const lowTidePosition =
    ((tideWindow.lowTide.getTime() - tideWindow.tideStart.getTime()) / totalDuration) * 100;

  const Icon = config.icon;
  const BannerIcon = warnBanner?.icon;

  const depLevel = depMs < nowMs ? 'missed' : (depMs - nowMs <= 10 * 60000 ? 'critical' : depMs - nowMs <= 30 * 60000 ? 'urgent' : 'safe');
  const evLevel = evMs < nowMs ? 'missed' : (evMs - nowMs <= 10 * 60000 ? 'critical' : evMs - nowMs <= 30 * 60000 ? 'urgent' : 'safe');

  const depBoxStyle = depLevel === 'safe'
    ? 'bg-amber-50 border-amber-100'
    : depLevel === 'urgent'
      ? 'bg-amber-100 border-amber-300 ring-2 ring-amber-200 animate-pulse'
      : depLevel === 'critical'
        ? 'bg-red-100 border-red-300 ring-2 ring-red-200 animate-pulse'
        : 'bg-slate-100 border-slate-200 opacity-70';
  const depTextColor = depLevel === 'safe'
    ? 'text-amber-800'
    : depLevel === 'urgent'
      ? 'text-amber-900'
      : depLevel === 'critical'
        ? 'text-red-900'
        : 'text-slate-600';
  const depSubColor = depLevel === 'safe'
    ? 'text-amber-600'
    : depLevel === 'urgent'
      ? 'text-amber-700'
      : depLevel === 'critical'
        ? 'text-red-700'
        : 'text-slate-500';

  const evBoxStyle = evLevel === 'safe'
    ? 'bg-rose-50 border-rose-100'
    : evLevel === 'urgent'
      ? 'bg-orange-100 border-orange-300 ring-2 ring-orange-200 animate-pulse'
      : evLevel === 'critical'
        ? 'bg-red-100 border-red-300 ring-2 ring-red-200 animate-pulse'
        : 'bg-slate-100 border-slate-200 opacity-70';
  const evTextColor = evLevel === 'safe'
    ? 'text-rose-800'
    : evLevel === 'urgent'
      ? 'text-orange-900'
      : evLevel === 'critical'
        ? 'text-red-900'
        : 'text-slate-600';
  const evSubColor = evLevel === 'safe'
    ? 'text-rose-600'
    : evLevel === 'urgent'
      ? 'text-orange-700'
      : evLevel === 'critical'
        ? 'text-red-700'
        : 'text-slate-500';

  return (
    <div className="space-y-4">
      {warnBanner && (
        <div className={cn(
          'p-3 rounded-xl shadow-md',
          warnBanner.bg,
          warnBanner.text,
          warnBanner.pulse
        )}>
          <div className="flex items-start gap-2.5">
            <BannerIcon size={20} className="flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm">{warnBanner.title}</div>
              <div className="text-xs opacity-90 mt-0.5">{warnBanner.sub}</div>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={cn('p-1.5 rounded-lg', config.bgColor)}>
            <Icon size={16} className={config.color} />
          </div>
          <span className={cn('text-sm font-medium', config.color)}>
            {config.label}
          </span>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500">可作业时长</p>
          <p className="text-sm font-semibold text-slate-700 font-mono">
            {formatDuration(tideWindow.workDuration)}
          </p>
        </div>
      </div>

      <div className="relative">
        <div className="relative h-12 rounded-lg overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-sky-200 via-cyan-400 to-sky-200">
            <div
              className="absolute inset-0 bg-gradient-to-r from-cyan-600/20 via-cyan-600/10 to-cyan-600/20 animate-pulse"
              style={{ animationDuration: '3s' }}
            />
          </div>

          <div
            className="absolute top-0 bottom-0 w-0.5 bg-white/60 z-10"
            style={{ left: `${lowTidePosition}%` }}
          >
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rounded-full shadow-sm" />
          </div>

          <div
            className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-20 transition-all duration-300"
            style={{ left: `${progress}%` }}
          >
            <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-red-500 rounded-full shadow-md animate-pulse" />
          </div>
        </div>

        <div className="flex justify-between mt-2 text-xs text-slate-500">
          <div className="text-center">
            <p className="font-mono font-medium text-slate-700">
              {formatTime(tideWindow.tideStart)}
            </p>
            <p>退潮开始</p>
          </div>
          <div className="text-center">
            <p className="font-mono font-medium text-cyan-700">
              {formatTime(tideWindow.lowTide)}
            </p>
            <p>最低潮</p>
          </div>
          <div className="text-center">
            <p className="font-mono font-medium text-slate-700">
              {formatTime(tideWindow.tideEnd)}
            </p>
            <p>回涨结束</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className={cn(
          'p-3 rounded-lg border transition-all duration-300',
          depBoxStyle
        )}>
          <div className="flex items-center justify-between mb-1">
            <div className={cn(
              'flex items-center gap-1.5',
              depLevel === 'critical' || depLevel === 'missed' ? 'text-red-700' : 'text-amber-700'
            )}>
              <ArrowRight size={14} />
              <span className="text-xs font-medium">最晚出发</span>
            </div>
            {depLevel !== 'safe' && depLevel !== 'missed' && (
              <span className={cn(
                'px-1.5 py-0.5 rounded-full text-[9px] font-medium',
                depLevel === 'critical' ? 'bg-red-500 text-white' : 'bg-amber-500 text-white'
              )}>
                {depLevel === 'critical' ? '紧急' : '临近'}
              </span>
            )}
            {depLevel === 'missed' && (
              <span className="px-1.5 py-0.5 rounded-full text-[9px] font-medium bg-slate-600 text-white">
                已过
              </span>
            )}
          </div>
          <p className={cn('text-lg font-bold font-mono', depTextColor)}>
            {formatTime(tideWindow.latestDeparture)}
          </p>
          <p className={cn('text-xs', depSubColor)}>
            {depLevel === 'missed'
              ? `已错过 ${formatCountdown(tideWindow.latestDeparture, now).text.replace('已错过', '') || '一段时间'}`
              : `还有 ${formatCountdown(tideWindow.latestDeparture, now).text}`}
          </p>
        </div>

        <div className={cn(
          'p-3 rounded-lg border transition-all duration-300',
          evBoxStyle
        )}>
          <div className="flex items-center justify-between mb-1">
            <div className={cn(
              'flex items-center gap-1.5',
              evLevel === 'critical' || evLevel === 'missed' ? 'text-red-700' : 'text-rose-700'
            )}>
              <ArrowRight size={14} className="rotate-180" />
              <span className="text-xs font-medium">必须撤离</span>
            </div>
            {evLevel !== 'safe' && evLevel !== 'missed' && (
              <span className={cn(
                'px-1.5 py-0.5 rounded-full text-[9px] font-medium',
                evLevel === 'critical' ? 'bg-red-500 text-white animate-pulse' : 'bg-orange-500 text-white animate-pulse'
              )}>
                {evLevel === 'critical' ? '紧急' : '临近'}
              </span>
            )}
            {evLevel === 'missed' && (
              <span className="px-1.5 py-0.5 rounded-full text-[9px] font-medium bg-red-600 text-white animate-pulse">
                危险
              </span>
            )}
          </div>
          <p className={cn('text-lg font-bold font-mono', evTextColor)}>
            {formatTime(tideWindow.mustEvacuate)}
          </p>
          <p className={cn('text-xs', evSubColor)}>
            {evLevel === 'missed'
              ? '⚠ 已过撤离时间'
              : `还有 ${formatCountdown(tideWindow.mustEvacuate, now).text}`}
          </p>
        </div>
      </div>
    </div>
  );
}
