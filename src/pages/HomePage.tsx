import { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Phone,
  MapPin,
  KeyRound,
  AlertTriangle,
  ArrowRight,
  Plus,
  ChevronRight,
  Key,
  Shield,
  Users,
  Bell,
  CalendarClock,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import {
  formatDateCN,
  daysFromToday,
  cn,
  getStatusBadgeClass,
  getStatusText,
} from '../utils/helpers';
import type { KeyArchive, KeyTrustee, BorrowRecord } from '../types';

interface TrusteeWithKeys extends KeyTrustee {
  keys: (KeyArchive & { activeBorrow?: BorrowRecord; status: 'available' | 'borrowed' | 'inactive' })[];
  familyMemberName?: string;
  familyMemberColor?: string;
  familyMemberEmoji?: string;
}

const useAnimatedCount = (target: number, duration = 1000): number => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let startTime: number;
    let rafId: number;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) rafId = requestAnimationFrame(step);
    };
    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [target, duration]);
  return count;
};

const StatCard = ({
  label,
  value,
  icon: Icon,
  gradient,
  iconBg,
}: {
  label: string;
  value: number;
  icon: typeof Key;
  gradient: string;
  iconBg: string;
}) => {
  const count = useAnimatedCount(value);
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl p-5 text-white shadow-lg animate-fade-in-up',
        gradient
      )}
    >
      <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/10 blur-xl" />
      <div className="absolute -right-10 -bottom-10 w-32 h-32 rounded-full bg-white/5 blur-2xl" />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-sm text-white/80 font-medium">{label}</p>
          <p className="font-mono text-4xl font-bold mt-2 tracking-tight">{count}</p>
        </div>
        <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', iconBg)}>
          <Icon className="w-6 h-6" strokeWidth={2.2} />
        </div>
      </div>
    </div>
  );
};

const QuickAction = ({
  to,
  label,
  icon: Icon,
  color,
  delay,
}: {
  to: string;
  label: string;
  icon: typeof Plus;
  color: string;
  delay: string;
}) => (
  <Link
    to={to}
    className={cn(
      'card card-hover p-4 flex items-center gap-3 animate-fade-in-up',
      delay
    )}
  >
    <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center shrink-0', color)}>
      <Icon className="w-5 h-5 text-white" strokeWidth={2.2} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-semibold text-navy-800">{label}</p>
    </div>
    <ChevronRight className="w-4 h-4 text-navy-300 shrink-0" />
  </Link>
);

const TrusteeCard = ({
  trustee,
  index,
  familyGroup,
}: {
  trustee: TrusteeWithKeys;
  index: number;
  familyGroup?: { name: string; emoji: string; color: string };
}) => {
  const availableKeys = trustee.keys.filter((k) => k.status === 'available');
  const borrowedKeys = trustee.keys.filter((k) => k.status === 'borrowed');
  const delay = `stagger-${(index % 6) + 1}`;

  return (
    <div
      className={cn(
        'card card-hover relative overflow-hidden animate-fade-in-up',
        delay
      )}
    >
      {familyGroup && (
        <div
          className="px-4 py-2 flex items-center gap-2 text-xs font-semibold text-white"
          style={{ backgroundColor: familyGroup.color }}
        >
          <span className="text-base">{familyGroup.emoji}</span>
          <span>{familyGroup.name}的救急联系人</span>
        </div>
      )}

      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className="relative shrink-0">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-100 to-cream-200 flex items-center justify-center text-3xl shadow-inner border-2 border-white">
              {trustee.isFamily ? (
                <span>{trustee.relation === '父亲' ? '👨' : trustee.relation === '母亲' ? '👩' : '👤'}</span>
              ) : (
                <span>🤝</span>
              )}
            </div>
            {availableKeys.length > 0 && (
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-mint-400 border-2 border-white flex items-center justify-center">
                <span className="text-[10px] font-bold text-white">{availableKeys.length}</span>
              </div>
            )}
            {trustee.movedFlag && (
              <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-coral-400 border-2 border-white flex items-center justify-center animate-pulse-soft">
                <AlertTriangle className="w-3 h-3 text-white" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-serif text-lg font-bold text-navy-800">{trustee.name}</h3>
              <span className="badge bg-navy-50 text-navy-600">{trustee.relation}</span>
              {trustee.movedFlag && (
                <span className="badge bg-coral-50 text-coral-700">已搬家⚠️</span>
              )}
            </div>

            <div className="mt-2 space-y-1 text-sm text-navy-500">
              <a
                href={`tel:${trustee.phone}`}
                className="flex items-center gap-2 hover:text-navy-700 transition-colors group"
              >
                <Phone className="w-3.5 h-3.5 text-mint-600 group-hover:scale-110 transition-transform" />
                <span className="font-mono">{trustee.phone}</span>
                <span className="text-mint-600 text-xs opacity-0 group-hover:opacity-100 transition-opacity">点击拨打</span>
              </a>
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-navy-400 mt-0.5 shrink-0" />
                <span className="line-clamp-1">{trustee.address}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="divider" />

        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-navy-600 flex items-center gap-1.5">
              <KeyRound className="w-4 h-4 text-amber-500" />
              托管钥匙清单
            </p>
            {borrowedKeys.length > 0 && (
              <span className="text-xs text-coral-600 font-medium">
                {borrowedKeys.length} 组借用中
              </span>
            )}
          </div>

          <div className="space-y-2">
            {trustee.keys.map((key) => (
              <Link
                key={key.id}
                to={`/keys/${key.id}`}
                className="flex items-center gap-3 p-3 rounded-xl bg-cream-50 border border-cream-200 hover:border-amber-300 hover:bg-amber-50/50 transition-all duration-200 group"
              >
                <div className="w-9 h-9 rounded-lg bg-white border border-cream-200 flex items-center justify-center shrink-0 shadow-sm">
                  <Key className="w-4 h-4 text-amber-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-navy-800 truncate">{key.lockName}</p>
                    <span className={cn('badge !px-1.5 !py-0.5', getStatusBadgeClass(key.status))}>
                      {getStatusText(key.status)}
                    </span>
                  </div>
                  <p className="text-xs text-navy-400 truncate mt-0.5">
                    📍 {key.storageLocation} · {key.totalQuantity} 把
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-navy-300 group-hover:text-amber-500 group-hover:translate-x-0.5 transition-all shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const HomePage = () => {
  const familyMembers = useStore((s) => s.familyMembers);
  const trustees = useStore((s) => s.trustees);
  const keyArchives = useStore((s) => s.keyArchives);
  const borrowRecords = useStore((s) => s.borrowRecords);
  const reminders = useStore((s) => s.reminders);

  const stats = useMemo(() => {
    const totalKeys = keyArchives.reduce((sum, k) => sum + k.totalQuantity, 0);
    const borrowedCount = borrowRecords.filter((r) => !r.isReturned).length;
    const unresolvedReminders = reminders.filter((r) => !r.isResolved).length;
    return { totalKeys, borrowedCount, unresolvedReminders, trusteesCount: trustees.length };
  }, [keyArchives, borrowRecords, reminders, trustees]);

  const trusteesWithKeys = useMemo(() => {
    return trustees.map((t) => {
      const keys = keyArchives
        .filter((k) => k.trusteeId === t.id)
        .map((k) => {
          const activeBorrow = borrowRecords.find(
            (r) => r.keyArchiveId === k.id && !r.isReturned
          );
          const resolvedStatus: 'available' | 'borrowed' | 'inactive' = activeBorrow
            ? 'borrowed'
            : k.status === 'borrowed'
              ? 'available'
              : k.status;
          return {
            ...k,
            activeBorrow,
            status: resolvedStatus,
          };
        });
      return { ...t, keys } as TrusteeWithKeys;
    }).filter((t) => t.keys.length > 0 || !t.movedFlag);
  }, [trustees, keyArchives, borrowRecords]);

  const groupedByFamily = useMemo(() => {
    const groups: Map<string, TrusteeWithKeys[]> = new Map();
    const ungrouped: TrusteeWithKeys[] = [];

    for (const trustee of trusteesWithKeys) {
      if (trustee.familyMemberId) {
        const arr = groups.get(trustee.familyMemberId) || [];
        arr.push(trustee);
        groups.set(trustee.familyMemberId, arr);
      } else if (trustee.keys.length > 0) {
        ungrouped.push(trustee);
      }
    }
    return { groups, ungrouped };
  }, [trusteesWithKeys]);

  const urgentReminders = useMemo(
    () => reminders.filter((r) => !r.isResolved).slice(0, 3),
    [reminders]
  );

  return (
    <div className="space-y-8">
      <section className="animate-fade-in-up">
        <div className="card p-6 md:p-8 bg-gradient-to-br from-navy-600 via-navy-700 to-navy-800 text-white border-0 relative overflow-hidden">
          <div className="absolute inset-0 bg-texture opacity-30" />
          <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-amber-400/20 blur-3xl" />
          <div className="absolute -left-10 -bottom-10 w-48 h-48 rounded-full bg-mint-400/10 blur-2xl" />

          <div className="relative">
            <div className="flex items-center gap-2 text-amber-300 text-sm font-medium mb-2">
              <CalendarClock className="w-4 h-4" />
              <span>{formatDateCN(new Date())}</span>
            </div>
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-white mb-2 text-balance">
              忘带钥匙？别慌，先看看谁能帮你 🔑
            </h2>
            <p className="text-navy-200 max-w-2xl text-sm md:text-base">
              按家庭成员快速查找可求助的托管人，一键联系、快速定位存放位置。
              所有借用归还均有记录可追溯。
            </p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="托管钥匙总数"
          value={stats.totalKeys}
          icon={Key}
          gradient="bg-gradient-to-br from-navy-500 to-navy-700"
          iconBg="bg-white/20"
        />
        <StatCard
          label="借用中"
          value={stats.borrowedCount}
          icon={Shield}
          gradient="bg-gradient-to-br from-coral-400 to-coral-600"
          iconBg="bg-white/20"
        />
        <StatCard
          label="托管人"
          value={stats.trusteesCount}
          icon={Users}
          gradient="bg-gradient-to-br from-amber-400 to-amber-600"
          iconBg="bg-white/20"
        />
        <StatCard
          label="待处理提醒"
          value={stats.unresolvedReminders}
          icon={Bell}
          gradient="bg-gradient-to-br from-mint-500 to-mint-700"
          iconBg="bg-white/20"
        />
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <QuickAction
          to="/keys/new"
          label="新增钥匙档案"
          icon={Plus}
          color="bg-navy-600"
          delay="stagger-1"
        />
        <QuickAction
          to="/reminders"
          label="查看所有提醒"
          icon={Bell}
          color="bg-coral-500"
          delay="stagger-2"
        />
        <QuickAction
          to="/settings"
          label="管理家庭成员"
          icon={Users}
          color="bg-mint-500"
          delay="stagger-3"
        />
      </section>

      {urgentReminders.length > 0 && (
        <section className="animate-fade-in-up stagger-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif text-xl font-bold text-navy-800 flex items-center gap-2">
              <span className="w-1 h-6 bg-coral-400 rounded-full" />
              ⚠️ 需要留意
            </h3>
            <Link
              to="/reminders"
              className="text-sm text-navy-500 hover:text-navy-700 flex items-center gap-1"
            >
              全部 <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="card divide-y divide-cream-200 overflow-hidden">
            {urgentReminders.map((r) => (
              <Link
                key={r.id}
                to="/reminders"
                className="flex items-start gap-3 p-4 hover:bg-cream-50 transition-colors"
              >
                <div
                  className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0',
                    r.type === 'long_unverified' && 'bg-amber-100',
                    r.type === 'trustee_moved' && 'bg-coral-100',
                    r.type === 'old_keys_unrecovered' && 'bg-navy-100'
                  )}
                >
                  {r.type === 'long_unverified' && '⏰'}
                  {r.type === 'trustee_moved' && '🚚'}
                  {r.type === 'old_keys_unrecovered' && '🔒'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-navy-800 text-sm">{r.title}</p>
                  <p className="text-xs text-navy-400 mt-1 line-clamp-1">{r.description}</p>
                </div>
                {!r.isRead && (
                  <span className="w-2 h-2 rounded-full bg-coral-400 shrink-0 mt-1.5 animate-pulse-soft" />
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section>
        <h3 className="font-serif text-xl font-bold text-navy-800 mb-4 flex items-center gap-2">
          <span className="w-1 h-6 bg-amber-400 rounded-full" />
          👨‍👩‍👧 按家庭成员查看救急联系人
        </h3>

        <div className="space-y-6">
          {familyMembers.map((fm) => {
            const trusteeGroup = groupedByFamily.groups.get(fm.id) || [];
            const allTrustees = [...trusteeGroup];
            if (allTrustees.length === 0) return null;
            return (
              <div key={fm.id} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {allTrustees.map((t, i) => (
                  <TrusteeCard
                    key={t.id}
                    trustee={t}
                    index={i}
                    familyGroup={{
                      name: fm.name,
                      emoji: fm.avatarEmoji,
                      color: fm.colorTag,
                    }}
                  />
                ))}
              </div>
            );
          })}

          {groupedByFamily.ungrouped.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-navy-500 mb-3 flex items-center gap-2">
                <span>🤝</span> 其他可求助的托管人
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {groupedByFamily.ungrouped.map((t, i) => (
                  <TrusteeCard key={t.id} trustee={t} index={i} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
