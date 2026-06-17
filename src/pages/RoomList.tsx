import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Users,
  Music,
  ChevronDown,
  Eye,
  CalendarPlus,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import type { SoundproofLevel, Instrument } from '@/types';
import { generateRoomImageUrl } from '@/utils/businessRules';
import { cn } from '@/lib/utils';

const soundproofLabels: Record<SoundproofLevel, string> = {
  basic: '基础隔音',
  standard: '标准隔音',
  high: '高级隔音',
  professional: '专业级隔音',
};

const soundproofColors: Record<SoundproofLevel, string> = {
  basic: 'bg-text-muted/30 text-text-secondary',
  standard: 'bg-state-info/30 text-state-info-light',
  high: 'bg-state-success/30 text-state-success-light',
  professional: 'bg-accent-copper/30 text-accent-copper',
};

export default function RoomList() {
  const rooms = useStore((s) => s.rooms);
  const instruments = useStore((s) => s.instruments);
  const bookings = useStore((s) => s.bookings);

  const [instrumentFilter, setInstrumentFilter] = useState<string>('all');
  const [soundproofFilter, setSoundproofFilter] = useState<string>('all');
  const [capacityFilter, setCapacityFilter] = useState<string>('all');

  const [showInstrumentDropdown, setShowInstrumentDropdown] = useState(false);
  const [showSoundproofDropdown, setShowSoundproofDropdown] = useState(false);
  const [showCapacityDropdown, setShowCapacityDropdown] = useState(false);

  const isRoomAvailableNow = (roomId: string) => {
    const now = new Date();
    const activeBookings = bookings.filter(
      (b) =>
        b.roomId === roomId &&
        new Date(b.startTime) <= now &&
        new Date(b.endTime) > now &&
        b.status !== 'cancelled' &&
        b.status !== 'rejected' &&
        b.status !== 'no_show',
    );
    return activeBookings.length === 0;
  };

  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      if (
        instrumentFilter !== 'all' &&
        !room.availableInstruments.includes(instrumentFilter)
      ) {
        return false;
      }
      if (
        soundproofFilter !== 'all' &&
        room.soundproofLevel !== soundproofFilter
      ) {
        return false;
      }
      if (capacityFilter !== 'all') {
        const cap = parseInt(capacityFilter, 10);
        if (room.capacity < cap) return false;
      }
      return true;
    });
  }, [rooms, instrumentFilter, soundproofFilter, capacityFilter]);

  const selectedInstrument = instruments.find(
    (i) => i.id === instrumentFilter,
  );

  const capacityOptions = [
    { value: 'all', label: '全部容量' },
    { value: '2', label: '2人及以上' },
    { value: '4', label: '4人及以上' },
    { value: '6', label: '6人及以上' },
    { value: '8', label: '8人及以上' },
  ];

  const soundproofOptions = [
    { value: 'all', label: '全部等级' },
    { value: 'basic', label: '基础' },
    { value: 'standard', label: '标准' },
    { value: 'high', label: '高级' },
    { value: 'professional', label: '专业级' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-semibold text-text-primary">
            练习房列表
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            选择适合你的练习空间
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <button
            onClick={() => {
              setShowInstrumentDropdown(!showInstrumentDropdown);
              setShowSoundproofDropdown(false);
              setShowCapacityDropdown(false);
            }}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-xl',
              'bg-bg-secondary border border-border-subtle',
              'text-sm text-text-primary hover:border-accent-copper/50 transition-colors',
            )}
          >
            <Music className="w-4 h-4 text-text-muted" />
            <span>
              {selectedInstrument
                ? selectedInstrument.name
                : '全部乐器'}
            </span>
            <ChevronDown
              className={cn(
                'w-4 h-4 text-text-muted transition-transform',
                showInstrumentDropdown && 'rotate-180',
              )}
            />
          </button>
          {showInstrumentDropdown && (
            <div className="absolute top-full left-0 mt-2 w-48 bg-bg-secondary border border-border-subtle rounded-xl shadow-card overflow-hidden z-10">
              <button
                onClick={() => {
                  setInstrumentFilter('all');
                  setShowInstrumentDropdown(false);
                }}
                className={cn(
                  'w-full px-4 py-2.5 text-left text-sm hover:bg-bg-tertiary transition-colors',
                  instrumentFilter === 'all'
                    ? 'text-accent-copper bg-accent-copper/10'
                    : 'text-text-primary',
                )}
              >
                全部乐器
              </button>
              {instruments.map((inst: Instrument) => (
                <button
                  key={inst.id}
                  onClick={() => {
                    setInstrumentFilter(inst.id);
                    setShowInstrumentDropdown(false);
                  }}
                  className={cn(
                    'w-full px-4 py-2.5 text-left text-sm hover:bg-bg-tertiary transition-colors',
                    instrumentFilter === inst.id
                      ? 'text-accent-copper bg-accent-copper/10'
                      : 'text-text-primary',
                  )}
                >
                  {inst.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => {
              setShowSoundproofDropdown(!showSoundproofDropdown);
              setShowInstrumentDropdown(false);
              setShowCapacityDropdown(false);
            }}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-xl',
              'bg-bg-secondary border border-border-subtle',
              'text-sm text-text-primary hover:border-accent-copper/50 transition-colors',
            )}
          >
            <span>
              {soundproofOptions.find((o) => o.value === soundproofFilter)
                ?.label || '全部等级'}
            </span>
            <ChevronDown
              className={cn(
                'w-4 h-4 text-text-muted transition-transform',
                showSoundproofDropdown && 'rotate-180',
              )}
            />
          </button>
          {showSoundproofDropdown && (
            <div className="absolute top-full left-0 mt-2 w-40 bg-bg-secondary border border-border-subtle rounded-xl shadow-card overflow-hidden z-10">
              {soundproofOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    setSoundproofFilter(opt.value);
                    setShowSoundproofDropdown(false);
                  }}
                  className={cn(
                    'w-full px-4 py-2.5 text-left text-sm hover:bg-bg-tertiary transition-colors',
                    soundproofFilter === opt.value
                      ? 'text-accent-copper bg-accent-copper/10'
                      : 'text-text-primary',
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => {
              setShowCapacityDropdown(!showCapacityDropdown);
              setShowInstrumentDropdown(false);
              setShowSoundproofDropdown(false);
            }}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-xl',
              'bg-bg-secondary border border-border-subtle',
              'text-sm text-text-primary hover:border-accent-copper/50 transition-colors',
            )}
          >
            <Users className="w-4 h-4 text-text-muted" />
            <span>
              {capacityOptions.find((o) => o.value === capacityFilter)
                ?.label || '全部容量'}
            </span>
            <ChevronDown
              className={cn(
                'w-4 h-4 text-text-muted transition-transform',
                showCapacityDropdown && 'rotate-180',
              )}
            />
          </button>
          {showCapacityDropdown && (
            <div className="absolute top-full left-0 mt-2 w-40 bg-bg-secondary border border-border-subtle rounded-xl shadow-card overflow-hidden z-10">
              {capacityOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    setCapacityFilter(opt.value);
                    setShowCapacityDropdown(false);
                  }}
                  className={cn(
                    'w-full px-4 py-2.5 text-left text-sm hover:bg-bg-tertiary transition-colors',
                    capacityFilter === opt.value
                      ? 'text-accent-copper bg-accent-copper/10'
                      : 'text-text-primary',
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredRooms.map((room) => {
          const isAvailable = isRoomAvailableNow(room.id);
          const roomInstruments = instruments.filter((i) =>
            room.availableInstruments.includes(i.id),
          );

          return (
            <div
              key={room.id}
              className={cn(
                'bg-bg-secondary rounded-2xl border border-border-subtle overflow-hidden',
                'hover:shadow-glow transition-all duration-300',
              )}
            >
              <div className="relative h-48">
                <img
                  src={generateRoomImageUrl(room.id)}
                  alt={room.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/40 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4">
                  <h3 className="text-lg font-semibold text-text-primary">
                    {room.name}
                  </h3>
                </div>
                <div className="absolute top-3 right-3">
                  <span
                    className={cn(
                      'px-3 py-1 rounded-full text-xs font-medium',
                      isAvailable
                        ? 'bg-state-success text-white'
                        : 'bg-state-danger text-white',
                    )}
                  >
                    {isAvailable ? '可用' : '占用中'}
                  </span>
                </div>
              </div>

              <div className="p-5 space-y-4">
                <div className="flex items-center gap-4 text-sm text-text-secondary">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-text-muted" />
                    <span>{room.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-text-muted" />
                    <span>{room.capacity}人</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={cn(
                      'px-2.5 py-1 rounded-full text-xs font-medium',
                      soundproofColors[room.soundproofLevel],
                    )}
                  >
                    {soundproofLabels[room.soundproofLevel]}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {roomInstruments.slice(0, 4).map((inst) => (
                    <span
                      key={inst.id}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-bg-tertiary text-xs text-text-secondary"
                    >
                      <Music className="w-3 h-3 text-accent-copper" />
                      {inst.name}
                    </span>
                  ))}
                  {roomInstruments.length > 4 && (
                    <span className="px-2 py-1 text-xs text-text-muted">
                      +{roomInstruments.length - 4}
                    </span>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <Link
                    to={`/rooms/${room.id}`}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl',
                      'bg-bg-tertiary text-text-secondary text-sm font-medium',
                      'hover:bg-bg-elevated hover:text-text-primary transition-colors',
                    )}
                  >
                    <Eye className="w-4 h-4" />
                    查看详情
                  </Link>
                  <Link
                    to={`/booking/new?roomId=${room.id}`}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl',
                      'bg-accent-copper text-white text-sm font-medium',
                      'hover:bg-accent-copper-dark transition-colors',
                    )}
                  >
                    <CalendarPlus className="w-4 h-4" />
                    立即预约
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredRooms.length === 0 && (
        <div className="py-20 text-center text-text-secondary">
          <Music className="w-16 h-16 mx-auto mb-4 text-text-muted opacity-50" />
          <p className="text-lg">没有符合条件的练习房</p>
          <p className="text-sm text-text-muted mt-1">请尝试调整筛选条件</p>
        </div>
      )}
    </div>
  );
}
