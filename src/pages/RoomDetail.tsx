import { useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Users,
  Clock,
  Music,
  CalendarPlus,
  Volume2,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { StatusBadge } from '@/components';
import type { SoundproofLevel } from '@/types';
import { generateRoomImageUrl } from '@/utils/businessRules';
import { cn } from '@/lib/utils';

const soundproofLabels: Record<SoundproofLevel, string> = {
  basic: '基础隔音',
  standard: '标准隔音',
  high: '高级隔音',
  professional: '专业级隔音',
};

const soundproofDescriptions: Record<SoundproofLevel, string> = {
  basic: '基础隔音处理，适合轻柔乐器练习，如钢琴、小提琴、长笛等低噪音乐器。',
  standard: '标准隔音处理，适合人声和中等音量乐器，如中提琴、古典吉他等。',
  high: '高级隔音处理，可承受萨克斯、电贝司等高噪音乐器，不会影响隔壁房间。',
  professional: '专业级录音棚隔音，完全隔音，适合架子鼓、电吉他等极高音量乐器及乐队排练。',
};

const soundproofColors: Record<SoundproofLevel, string> = {
  basic: 'bg-text-muted/30 text-text-secondary',
  standard: 'bg-state-info/30 text-state-info-light',
  high: 'bg-state-success/30 text-state-success-light',
  professional: 'bg-accent-copper/30 text-accent-copper',
};

const equipmentList = [
  '空调系统',
  '舒适座椅',
  '专业灯光',
  '乐谱架',
  '镜子',
  '电源插座',
];

export default function RoomDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const rooms = useStore((s) => s.rooms);
  const instruments = useStore((s) => s.instruments);
  const bookings = useStore((s) => s.bookings);

  const room = useMemo(() => rooms.find((r) => r.id === id), [rooms, id]);

  const todayBookings = useMemo(() => {
    if (!room) return [];
    const today = new Date();
    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    const endOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1,
    );

    return bookings
      .filter(
        (b) =>
          b.roomId === room.id &&
          new Date(b.startTime) >= startOfDay &&
          new Date(b.startTime) < endOfDay &&
          b.status !== 'cancelled' &&
          b.status !== 'rejected' &&
          b.status !== 'no_show',
      )
      .sort(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
      );
  }, [bookings, room]);

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!room) {
    return (
      <div className="py-20 text-center text-text-secondary animate-fade-in">
        <p className="text-lg">房间不存在</p>
        <Link
          to="/rooms"
          className="inline-flex items-center gap-2 mt-4 text-accent-copper hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          返回房间列表
        </Link>
      </div>
    );
  }

  const roomInstruments = instruments.filter((i) =>
    room.availableInstruments.includes(i.id),
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        返回
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div
            className={cn(
              'bg-bg-secondary rounded-2xl border border-border-subtle overflow-hidden',
              'hover:shadow-glow transition-all duration-300',
            )}
          >
            <div className="relative h-72 sm:h-96">
              <img
                src={generateRoomImageUrl(room.id)}
                alt={room.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h1 className="text-2xl sm:text-3xl font-display font-semibold text-text-primary mb-2">
                  {room.name}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-text-secondary">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-text-muted" />
                    <span>{room.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-text-muted" />
                    <span>容纳 {room.capacity} 人</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-text-muted" />
                    <span>
                      {room.openTimeStart} - {room.openTimeEnd}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            className={cn(
              'bg-bg-secondary rounded-2xl p-6 border border-border-subtle',
              'hover:shadow-glow transition-all duration-300',
            )}
          >
            <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-accent-copper" />
              隔音等级
            </h2>
            <div className="flex flex-wrap items-start gap-3 mb-3">
              <span
                className={cn(
                  'px-3 py-1.5 rounded-full text-sm font-medium',
                  soundproofColors[room.soundproofLevel],
                )}
              >
                {soundproofLabels[room.soundproofLevel]}
              </span>
            </div>
            <p className="text-text-secondary leading-relaxed">
              {soundproofDescriptions[room.soundproofLevel]}
            </p>
          </div>

          <div
            className={cn(
              'bg-bg-secondary rounded-2xl p-6 border border-border-subtle',
              'hover:shadow-glow transition-all duration-300',
            )}
          >
            <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
              <Music className="w-5 h-5 text-accent-copper" />
              可用乐器
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {roomInstruments.map((inst) => (
                <div
                  key={inst.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-bg-tertiary hover:bg-bg-elevated transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-accent-copper/20 flex items-center justify-center flex-shrink-0">
                    <Music className="w-5 h-5 text-accent-copper" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-text-primary">
                      {inst.name}
                    </div>
                    <div className="text-xs text-text-muted">
                      噪音等级：
                      {inst.noiseLevel === 'low' && '轻柔'}
                      {inst.noiseLevel === 'medium' && '中等'}
                      {inst.noiseLevel === 'high' && '响亮'}
                      {inst.noiseLevel === 'extreme' && '非常响'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            className={cn(
              'bg-bg-secondary rounded-2xl p-6 border border-border-subtle',
              'hover:shadow-glow transition-all duration-300',
            )}
          >
            <h2 className="text-lg font-semibold text-text-primary mb-4">
              房间设备
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {equipmentList.map((eq) => (
                <div
                  key={eq}
                  className="flex items-center gap-2 p-3 rounded-xl bg-bg-tertiary"
                >
                  <div className="w-2 h-2 rounded-full bg-state-success-light" />
                  <span className="text-sm text-text-secondary">{eq}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div
            className={cn(
              'bg-bg-secondary rounded-2xl p-6 border border-border-subtle',
              'hover:shadow-glow transition-all duration-300',
            )}
          >
            <h2 className="text-lg font-semibold text-text-primary mb-4">
              今日预约
            </h2>
            {todayBookings.length === 0 ? (
              <div className="py-8 text-center text-text-secondary">
                <Clock className="w-10 h-10 mx-auto mb-2 text-text-muted opacity-50" />
                <p className="text-sm">今日暂无预约</p>
              </div>
            ) : (
              <div className="relative">
                <div className="absolute left-3 top-2 bottom-2 w-px bg-border-subtle" />
                <div className="space-y-4">
                  {todayBookings.map((booking) => {
                    const instrument = instruments.find(
                      (i) => i.id === booking.instrumentId,
                    );
                    return (
                      <div
                        key={booking.id}
                        className="relative pl-8"
                      >
                        <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-bg-secondary border-2 border-accent-copper flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-accent-copper" />
                        </div>
                        <div className="p-3 rounded-xl bg-bg-tertiary">
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-sm font-medium text-text-primary">
                              {formatTime(booking.startTime)} -{' '}
                              {formatTime(booking.endTime)}
                            </div>
                            <StatusBadge
                              status={booking.status}
                              size="sm"
                            />
                          </div>
                          <div className="text-xs text-text-secondary">
                            {booking.piece}
                          </div>
                          {instrument && (
                            <div className="flex items-center gap-1 mt-1 text-xs text-text-muted">
                              <Music className="w-3 h-3" />
                              {instrument.name}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <Link
            to={`/booking/new?roomId=${room.id}`}
            className={cn(
              'w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl',
              'bg-accent-copper text-white font-semibold text-base',
              'hover:bg-accent-copper-dark transition-colors',
              'shadow-glow hover:shadow-glow-strong',
            )}
          >
            <CalendarPlus className="w-5 h-5" />
            预约此房间
          </Link>
        </div>
      </div>
    </div>
  );
}
