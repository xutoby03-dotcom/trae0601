import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Music,
  Users,
  Music2,
  Clock,
  CalendarDays,
  ChevronRight,
  ChevronLeft,
  Check,
  AlertTriangle,
  Sparkles,
  MapPin,
  Volume2,
  CheckCircle2,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import type { Instrument, NoiseLevel, SoundproofLevel } from '@/types';
import {
  checkNoiseMatch,
  checkTimeConflict,
  needsApproval,
  generateRoomImageUrl,
} from '@/utils/businessRules';
import { cn } from '@/lib/utils';

const noiseLevelLabels: Record<NoiseLevel, string> = {
  low: '轻柔',
  medium: '中等',
  high: '响亮',
  extreme: '非常响',
};

const noiseLevelColors: Record<NoiseLevel, string> = {
  low: 'bg-state-success/30 text-state-success-light',
  medium: 'bg-state-info/30 text-state-info-light',
  high: 'bg-state-warning/30 text-state-warning-light',
  extreme: 'bg-state-danger/30 text-state-danger-light',
};

const soundproofLabels: Record<SoundproofLevel, string> = {
  basic: '基础',
  standard: '标准',
  high: '高级',
  professional: '专业级',
};

const volumeOptions: NoiseLevel[] = ['low', 'medium', 'high', 'extreme'];

function generateTimeSlots(start: string, end: string, stepMinutes = 30): string[] {
  const slots: string[] = [];
  const [startH, startM] = start.split(':').map(Number);
  const [endH, endM] = end.split(':').map(Number);
  let minutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  while (minutes < endMinutes) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    slots.push(
      `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`,
    );
    minutes += stepMinutes;
  }
  return slots;
}

export default function BookingForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const presetRoomId = searchParams.get('roomId');

  const currentUser = useStore((s) => s.currentUser);
  const rooms = useStore((s) => s.rooms);
  const instruments = useStore((s) => s.instruments);
  const bookings = useStore((s) => s.bookings);
  const createBooking = useStore((s) => s.createBooking);

  const [step, setStep] = useState(1);

  const [instrumentId, setInstrumentId] = useState<string>('');
  const [peopleCount, setPeopleCount] = useState(1);
  const [piece, setPiece] = useState('');
  const [needMusicStand, setNeedMusicStand] = useState(false);
  const [expectedVolume, setExpectedVolume] = useState<NoiseLevel>('medium');

  const today = new Date();
  const [selectedDate, setSelectedDate] = useState<string>(
    today.toISOString().split('T')[0],
  );
  const [startTime, setStartTime] = useState<string>('10:00');
  const [endTime, setEndTime] = useState<string>('11:00');

  const [selectedRoomId, setSelectedRoomId] = useState<string>(
    presetRoomId || '',
  );

  const selectedInstrument = useMemo(
    () => instruments.find((i) => i.id === instrumentId),
    [instruments, instrumentId],
  );

  const durationHours = useMemo(() => {
    if (!startTime || !endTime) return 0;
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    const startMinutes = sh * 60 + sm;
    const endMinutes = eh * 60 + em;
    return (endMinutes - startMinutes) / 60;
  }, [startTime, endTime]);

  const startDateTime = useMemo(() => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const [h, min] = startTime.split(':').map(Number);
    return new Date(y, m - 1, d, h, min, 0, 0);
  }, [selectedDate, startTime]);

  const endDateTime = useMemo(() => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const [h, min] = endTime.split(':').map(Number);
    return new Date(y, m - 1, d, h, min, 0, 0);
  }, [selectedDate, endTime]);

  const availableRooms = useMemo(() => {
    if (step < 3 || !selectedInstrument || durationHours <= 0) return [];

    const effectiveNoiseLevel = expectedVolume;

    return rooms
      .filter((room) => {
        if (room.capacity < peopleCount) return false;

        const noiseMatches = checkNoiseMatch(
          effectiveNoiseLevel,
          room.soundproofLevel,
        );

        const conflicts = checkTimeConflict(
          bookings,
          room.id,
          startDateTime,
          endDateTime,
        );

        return noiseMatches && conflicts.length === 0;
      })
      .sort((a, b) => {
        const aNoiseMatch =
          a.soundproofLevel === selectedInstrument.noiseLevel ? 0 : 1;
        const bNoiseMatch =
          b.soundproofLevel === selectedInstrument.noiseLevel ? 0 : 1;
        return aNoiseMatch - bNoiseMatch;
      });
  }, [
    step,
    selectedInstrument,
    expectedVolume,
    durationHours,
    rooms,
    peopleCount,
    bookings,
    startDateTime,
    endDateTime,
  ]);

  const recommendedRoomId = useMemo(() => {
    if (availableRooms.length === 0) return null;
    if (presetRoomId && availableRooms.some((r) => r.id === presetRoomId)) {
      return presetRoomId;
    }
    return availableRooms[0].id;
  }, [availableRooms, presetRoomId]);

  const noiseWarning = useMemo(() => {
    if (!selectedInstrument) return null;
    const effectiveNoise = expectedVolume;
    if (presetRoomId) {
      const presetRoom = rooms.find((r) => r.id === presetRoomId);
      if (
        presetRoom &&
        !checkNoiseMatch(effectiveNoise, presetRoom.soundproofLevel)
      ) {
        return `所选乐器需要隔音等级为${soundproofLabels[
          (['basic', 'standard', 'high', 'professional'] as SoundproofLevel[]).find(
            (lvl) => checkNoiseMatch(effectiveNoise, lvl),
          ) || 'professional'
        ]}以上的房间`;
      }
    }
    return null;
  }, [selectedInstrument, expectedVolume, presetRoomId, rooms]);

  const timeConflictWarning = useMemo(() => {
    if (!presetRoomId || durationHours <= 0) return null;
    const conflicts = checkTimeConflict(
      bookings,
      presetRoomId,
      startDateTime,
      endDateTime,
    );
    if (conflicts.length > 0) {
      return '所选时间段与已有预约冲突';
    }
    return null;
  }, [presetRoomId, durationHours, bookings, startDateTime, endDateTime]);

  const canGoNext = () => {
    if (step === 1) {
      return instrumentId && peopleCount >= 1 && piece.trim().length > 0;
    }
    if (step === 2) {
      return (
        selectedDate &&
        startTime &&
        endTime &&
        startTime < endTime &&
        durationHours > 0
      );
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && !canGoNext()) return;
    if (step === 2 && !canGoNext()) return;
    if (step === 2 && recommendedRoomId) {
      setSelectedRoomId(recommendedRoomId);
    }
    if (step < 3) setStep(step + 1);
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = () => {
    if (!currentUser || !selectedRoomId || !instrumentId) return;
    if (!canGoNext()) return;

    if (needsApproval(startDateTime, endDateTime)) {
      if (
        !window.confirm('预约时长超过4小时，需老师审批，是否继续提交？')
      ) {
        return;
      }
    }

    createBooking({
      roomId: selectedRoomId,
      userId: currentUser.id,
      instrumentId,
      piece: piece.trim(),
      peopleCount,
      needMusicStand,
      expectedVolume,
      startTime: startDateTime,
      endTime: endDateTime,
    });

    navigate('/calendar');
  };

  const renderStepIndicator = () => (
    <div className="flex items-center gap-3 mb-8">
      {[1, 2, 3].map((s) => (
        <div key={s} className="flex items-center gap-3">
          <div
            className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300',
              step === s && 'bg-accent-copper text-white shadow-glow',
              step > s &&
                'bg-state-success text-white',
              step < s && 'bg-bg-tertiary text-text-muted border border-border-subtle',
            )}
          >
            {step > s ? <Check className="w-5 h-5" /> : s}
          </div>
          {s < 3 && (
            <div
              className={cn(
                'w-12 h-0.5 rounded transition-colors duration-300',
                step > s ? 'bg-state-success' : 'bg-border-subtle',
              )}
            />
          )}
        </div>
      ))}
      <div className="flex-1 flex items-center gap-4 ml-4 text-sm">
        <span
          className={cn(
            step >= 1 ? 'text-text-primary' : 'text-text-muted',
          )}
        >
          基础信息
        </span>
        <span
          className={cn(
            step >= 2 ? 'text-text-primary' : 'text-text-muted',
          )}
        >
          时间选择
        </span>
        <span
          className={cn(
            step >= 3 ? 'text-text-primary' : 'text-text-muted',
          )}
        >
          房间匹配
        </span>
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6 animate-fade-in">
      <div>
        <label className="block text-sm text-text-secondary mb-3">
          选择乐器 <span className="text-state-danger-light">*</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {instruments.map((inst: Instrument) => {
            const isSelected = instrumentId === inst.id;
            return (
              <button
                key={inst.id}
                onClick={() => setInstrumentId(inst.id)}
                className={cn(
                  'p-4 rounded-xl border-2 text-left transition-all duration-200',
                  isSelected
                    ? 'border-accent-copper bg-accent-copper/10 shadow-glow'
                    : 'border-border-subtle bg-bg-tertiary hover:border-accent-copper/50',
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center',
                      isSelected
                        ? 'bg-accent-copper/30'
                        : 'bg-bg-secondary',
                    )}
                  >
                    <Music
                      className={cn(
                        'w-5 h-5',
                        isSelected
                          ? 'text-accent-copper'
                          : 'text-text-muted',
                      )}
                    />
                  </div>
                  {isSelected && (
                    <CheckCircle2 className="w-5 h-5 text-accent-copper" />
                  )}
                </div>
                <div
                  className={cn(
                    'text-sm font-medium mb-1',
                    isSelected ? 'text-text-primary' : 'text-text-secondary',
                  )}
                >
                  {inst.name}
                </div>
                <span
                  className={cn(
                    'inline-block px-2 py-0.5 rounded-full text-xs',
                    noiseLevelColors[inst.noiseLevel],
                  )}
                >
                  {noiseLevelLabels[inst.noiseLevel]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm text-text-secondary mb-2">
            人数 <span className="text-state-danger-light">*</span>
          </label>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPeopleCount(Math.max(1, peopleCount - 1))}
              className="w-10 h-10 rounded-xl bg-bg-tertiary border border-border-subtle text-text-secondary hover:border-accent-copper/50 hover:text-text-primary transition-colors flex items-center justify-center"
            >
              -
            </button>
            <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-bg-tertiary border border-border-subtle">
              <Users className="w-4 h-4 text-text-muted" />
              <span className="text-text-primary font-medium">
                {peopleCount} 人
              </span>
            </div>
            <button
              onClick={() => setPeopleCount(Math.min(10, peopleCount + 1))}
              className="w-10 h-10 rounded-xl bg-bg-tertiary border border-border-subtle text-text-secondary hover:border-accent-copper/50 hover:text-text-primary transition-colors flex items-center justify-center"
            >
              +
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm text-text-secondary mb-2">
            是否需要谱架
          </label>
          <button
            onClick={() => setNeedMusicStand(!needMusicStand)}
            className={cn(
              'w-full px-4 py-2.5 rounded-xl border-2 transition-all duration-200 text-left flex items-center gap-3',
              needMusicStand
                ? 'border-accent-copper bg-accent-copper/10'
                : 'border-border-subtle bg-bg-tertiary hover:border-accent-copper/50',
            )}
          >
            <Music2
              className={cn(
                'w-5 h-5',
                needMusicStand ? 'text-accent-copper' : 'text-text-muted',
              )}
            />
            <span
              className={cn(
                'font-medium',
                needMusicStand ? 'text-text-primary' : 'text-text-secondary',
              )}
            >
              {needMusicStand ? '需要谱架' : '不需要谱架'}
            </span>
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm text-text-secondary mb-2">
          曲目名称 <span className="text-state-danger-light">*</span>
        </label>
        <input
          type="text"
          value={piece}
          onChange={(e) => setPiece(e.target.value)}
          placeholder="请输入曲目名称，如：贝多芬月光奏鸣曲"
          className={cn(
            'w-full px-4 py-3 rounded-xl text-text-primary placeholder-text-muted',
            'bg-bg-tertiary border border-border-subtle',
            'focus:outline-none focus:border-accent-copper transition-colors',
          )}
        />
      </div>

      <div>
        <label className="block text-sm text-text-secondary mb-3">
          预计音量
        </label>
        <div className="grid grid-cols-4 gap-3">
          {volumeOptions.map((vol) => {
            const isSelected = expectedVolume === vol;
            return (
              <button
                key={vol}
                onClick={() => setExpectedVolume(vol)}
                className={cn(
                  'px-3 py-3 rounded-xl border-2 transition-all duration-200 text-center',
                  isSelected
                    ? 'border-accent-copper bg-accent-copper/10'
                    : 'border-border-subtle bg-bg-tertiary hover:border-accent-copper/50',
                )}
              >
                <Volume2
                  className={cn(
                    'w-5 h-5 mx-auto mb-1',
                    isSelected ? 'text-accent-copper' : 'text-text-muted',
                  )}
                />
                <div
                  className={cn(
                    'text-sm font-medium',
                    isSelected ? 'text-text-primary' : 'text-text-secondary',
                  )}
                >
                  {noiseLevelLabels[vol]}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => {
    const timeSlots = generateTimeSlots('08:00', '23:00');
    const minDate = today.toISOString().split('T')[0];

    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <label className="block text-sm text-text-secondary mb-2">
            预约日期 <span className="text-state-danger-light">*</span>
          </label>
          <div className="relative max-w-xs">
            <CalendarDays className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
            <input
              type="date"
              value={selectedDate}
              min={minDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className={cn(
                'w-full pl-12 pr-4 py-3 rounded-xl text-text-primary',
                'bg-bg-tertiary border border-border-subtle',
                'focus:outline-none focus:border-accent-copper transition-colors',
              )}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm text-text-secondary mb-2">
              开始时间 <span className="text-state-danger-light">*</span>
            </label>
            <div className="relative">
              <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
              <select
                value={startTime}
                onChange={(e) => {
                  setStartTime(e.target.value);
                  if (e.target.value >= endTime) {
                    const slots = generateTimeSlots(e.target.value, '23:00');
                    if (slots.length > 1) setEndTime(slots[1]);
                  }
                }}
                className={cn(
                  'w-full pl-12 pr-10 py-3 rounded-xl text-text-primary appearance-none cursor-pointer',
                  'bg-bg-tertiary border border-border-subtle',
                  'focus:outline-none focus:border-accent-copper transition-colors',
                )}
              >
                {timeSlots.slice(0, -1).map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm text-text-secondary mb-2">
              结束时间 <span className="text-state-danger-light">*</span>
            </label>
            <div className="relative">
              <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
              <select
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className={cn(
                  'w-full pl-12 pr-10 py-3 rounded-xl text-text-primary appearance-none cursor-pointer',
                  'bg-bg-tertiary border border-border-subtle',
                  'focus:outline-none focus:border-accent-copper transition-colors',
                )}
              >
                {timeSlots
                  .filter((t) => t > startTime)
                  .map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
              </select>
            </div>
          </div>
        </div>

        {durationHours > 0 && (
          <div
            className={cn(
              'p-4 rounded-xl',
              durationHours > 4
                ? 'bg-state-warning/20 border border-state-warning'
                : 'bg-bg-tertiary border border-border-subtle',
            )}
          >
            <div className="flex items-center gap-2">
              {durationHours > 4 ? (
                <AlertTriangle className="w-5 h-5 text-state-warning-light" />
              ) : (
                <Clock className="w-5 h-5 text-text-muted" />
              )}
              <span
                className={cn(
                  'text-sm font-medium',
                  durationHours > 4
                    ? 'text-state-warning-light'
                    : 'text-text-secondary',
                )}
              >
                预约时长：{durationHours} 小时
              </span>
            </div>
            {durationHours > 4 && (
              <p className="mt-1 text-sm text-text-secondary pl-7">
                超过4小时的预约需老师审批
              </p>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderStep3 = () => (
    <div className="space-y-6 animate-fade-in">
      {noiseWarning && (
        <div className="p-4 rounded-xl bg-state-danger/20 border border-state-danger flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-state-danger-light flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-state-danger-light">
              噪音匹配不通过
            </p>
            <p className="text-sm text-text-secondary mt-0.5">{noiseWarning}</p>
          </div>
        </div>
      )}

      {timeConflictWarning && (
        <div className="p-4 rounded-xl bg-state-danger/20 border border-state-danger flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-state-danger-light flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-state-danger-light">
              时间冲突
            </p>
            <p className="text-sm text-text-secondary mt-0.5">
              {timeConflictWarning}
            </p>
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm text-text-secondary mb-3">
          选择房间 <span className="text-state-danger-light">*</span>
        </label>
        {availableRooms.length === 0 ? (
          <div className="p-8 rounded-xl bg-bg-tertiary border border-border-subtle text-center">
            <MapPin className="w-12 h-12 mx-auto mb-3 text-text-muted opacity-50" />
            <p className="text-text-secondary">没有符合条件的房间</p>
            <p className="text-sm text-text-muted mt-1">
              请调整乐器、人数或时间段
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableRooms.map((room, idx) => {
              const isSelected = selectedRoomId === room.id;
              const isRecommended = recommendedRoomId === room.id;
              return (
                <button
                  key={room.id}
                  onClick={() => setSelectedRoomId(room.id)}
                  className={cn(
                    'text-left rounded-2xl overflow-hidden border-2 transition-all duration-200',
                    isSelected
                      ? 'border-accent-copper shadow-glow'
                      : 'border-border-subtle hover:border-accent-copper/50',
                  )}
                >
                  <div className="relative h-36">
                    <img
                      src={generateRoomImageUrl(room.id)}
                      alt={room.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-bg-primary to-transparent" />
                    {isRecommended && (
                      <div className="absolute top-3 right-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent-copper text-white text-xs font-medium">
                        <Sparkles className="w-3 h-3" />
                        智能推荐
                      </div>
                    )}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                      <h3 className="text-base font-semibold text-text-primary">
                        {room.name}
                      </h3>
                      {isSelected && (
                        <CheckCircle2 className="w-5 h-5 text-accent-copper" />
                      )}
                    </div>
                  </div>
                  <div className="p-4 bg-bg-secondary">
                    <div className="flex items-center gap-4 text-sm text-text-secondary mb-2">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-text-muted" />
                        <span>{room.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-text-muted" />
                        <span>{room.capacity}人</span>
                      </div>
                    </div>
                    <span
                      className={cn(
                        'inline-block px-2 py-0.5 rounded-full text-xs',
                        noiseLevelColors[
                          ([
                            'low',
                            'medium',
                            'high',
                            'extreme',
                          ] as NoiseLevel[])[idx % 4]
                        ],
                      )}
                    >
                      {soundproofLabels[room.soundproofLevel]}隔音
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <h1 className="text-2xl font-display font-semibold text-text-primary mb-2">
        发起预约
      </h1>
      <p className="text-text-secondary mb-8">
        填写以下信息完成练习房预约
      </p>

      <div
        className={cn(
          'bg-bg-secondary rounded-2xl p-6 sm:p-8 border border-border-subtle',
          'hover:shadow-glow transition-all duration-300',
        )}
      >
        {renderStepIndicator()}

        <div className="min-h-[400px]">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </div>

        <div className="flex items-center justify-between mt-8 pt-6 border-t border-border-subtle">
          <button
            onClick={handlePrev}
            disabled={step === 1}
            className={cn(
              'flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-colors',
              step === 1
                ? 'text-text-muted cursor-not-allowed'
                : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary',
            )}
          >
            <ChevronLeft className="w-5 h-5" />
            上一步
          </button>

          {step < 3 ? (
            <button
              onClick={handleNext}
              disabled={!canGoNext()}
              className={cn(
                'flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all',
                canGoNext()
                  ? 'bg-accent-copper text-white hover:bg-accent-copper-dark shadow-glow'
                  : 'bg-bg-tertiary text-text-muted cursor-not-allowed',
              )}
            >
              下一步
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!selectedRoomId}
              className={cn(
                'flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all',
                selectedRoomId
                  ? 'bg-accent-copper text-white hover:bg-accent-copper-dark shadow-glow'
                  : 'bg-bg-tertiary text-text-muted cursor-not-allowed',
              )}
            >
              <Check className="w-5 h-5" />
              提交预约
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
