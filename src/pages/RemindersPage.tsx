import { useMemo, useState } from 'react';
import {
  Check, CheckCircle, AlertTriangle, Truck, Lock, Eye, EyeOff,
  Trash2, XCircle, Bell, Clock, Filter, RefreshCw, Sparkles,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { formatDateCN, cn, getReminderTypeInfo, daysFromToday } from '../utils/helpers';
import type { Reminder, ReminderType } from '../types';

type TabType = 'all' | 'unresolved' | 'resolved';
type FilterType = ReminderType | 'all';

const typeBar: Record<ReminderType, string> = {
  long_unverified: 'bg-amber-400',
  trustee_moved: 'bg-coral-400',
  old_keys_unrecovered: 'bg-navy-400',
};
const typeBadge: Record<ReminderType, string> = {
  long_unverified: 'bg-amber-100 text-amber-700',
  trustee_moved: 'bg-coral-100 text-coral-700',
  old_keys_unrecovered: 'bg-navy-100 text-navy-700',
};

const MiniStat = ({ label, value, icon: Icon, color, delay }: {
  label: string; value: number; icon: typeof Bell; color: string; delay: string;
}) => (
  <div className={cn('card card-hover p-4 flex items-center gap-3 animate-fade-in-up', delay)}>
    <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center', color)}>
      <Icon className="w-5 h-5 text-white" strokeWidth={2.2} />
    </div>
    <div>
      <p className="text-xs text-navy-500 font-medium">{label}</p>
      <p className="font-mono text-2xl font-bold text-navy-800">{value}</p>
    </div>
  </div>
);

const ReminderCard = ({ r, i, onVerify, onUpdate, onRecover, onIgnore, onDelete, onRead }: {
  r: Reminder; i: number; onVerify: () => void; onUpdate: () => void; onRecover: () => void;
  onIgnore: () => void; onDelete: () => void; onRead: () => void;
}) => {
  const info = getReminderTypeInfo(r.type);
  const delay = `stagger-${(i % 6) + 1}`;
  const days = daysFromToday(r.relatedDate);
  const primaryBtn = {
    long_unverified: { label: '标记已核对', icon: CheckCircle, cls: 'btn-accent btn-sm', fn: onVerify },
    trustee_moved: { label: '更新托管人信息', icon: RefreshCw, cls: 'btn-danger btn-sm', fn: onUpdate },
    old_keys_unrecovered: { label: '确认回收', icon: Lock, cls: 'btn-primary btn-sm', fn: onRecover },
  }[r.type];
  const PI = primaryBtn.icon;

  const handlePrimary = () => { if (!r.isRead) onRead(); primaryBtn.fn(); };

  return (
    <div className={cn('card card-hover relative overflow-hidden animate-fade-in-up', delay, r.isResolved && 'opacity-70')}>
      <div className={cn('absolute left-0 top-0 bottom-0 w-1.5', typeBar[r.type])} />
      <div className="p-5 pl-6">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn('badge', typeBadge[r.type])}>
              <span className="text-sm mr-0.5">{info.icon}</span>{info.label}
            </span>
            {r.isResolved && <span className="badge bg-mint-100 text-mint-700"><Check className="w-3 h-3" /> 已解决</span>}
          </div>
          {!r.isRead && <span className="w-2.5 h-2.5 rounded-full bg-coral-400 shrink-0 mt-1.5 animate-pulse-soft" />}
        </div>
        <h3 className="font-serif text-lg font-bold text-navy-800 mb-2">{r.title}</h3>
        <p className="text-sm text-navy-500 leading-relaxed mb-4">{r.description}</p>
        <div className="flex items-center gap-4 text-xs text-navy-400 mb-4">
          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />关联日期：{formatDateCN(r.relatedDate)}</span>
          <span className="flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5 text-amber-500" />距今 {days} 天</span>
        </div>
        {!r.isResolved ? (
          <div className="flex items-center gap-2 flex-wrap">
            <button className={cn(primaryBtn.cls)} onClick={handlePrimary}><PI className="w-4 h-4" />{primaryBtn.label}</button>
            <button className="btn btn-ghost btn-sm" onClick={() => { if (!r.isRead) onRead(); onIgnore(); }}><EyeOff className="w-4 h-4" />忽略</button>
            <button className="btn btn-ghost btn-sm text-coral-600 hover:bg-coral-50" onClick={onDelete}><Trash2 className="w-4 h-4" />删除</button>
          </div>
        ) : (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="badge bg-mint-50 text-mint-600 text-xs">解决于 {r.resolvedDate && formatDateCN(r.resolvedDate)}</span>
            <button className="btn btn-ghost btn-sm text-coral-600 hover:bg-coral-50 ml-auto" onClick={onDelete}><Trash2 className="w-4 h-4" />删除</button>
          </div>
        )}
      </div>
    </div>
  );
};

const RemindersPage = () => {
  const s = useStore;
  const reminders = s(st => st.reminders);
  const keyArchives = s(st => st.keyArchives);
  const trustees = s(st => st.trustees);
  const resolveReminder = s(st => st.resolveReminder);
  const markReminderRead = s(st => st.markReminderRead);
  const deleteReminder = s(st => st.deleteReminder);
  const markKeyAsVerified = s(st => st.markKeyAsVerified);
  const updateTrustee = s(st => st.updateTrustee);
  const updateKeyArchive = s(st => st.updateKeyArchive);
  const [tab, setTab] = useState<TabType>('all');
  const [filter, setFilter] = useState<FilterType>('all');

  const stats = useMemo(() => {
    const unresolved = reminders.filter(r => !r.isResolved).length;
    const byType: Record<ReminderType, number> = { long_unverified: 0, trustee_moved: 0, old_keys_unrecovered: 0 };
    reminders.forEach(r => { if (!r.isResolved) byType[r.type]++; });
    return { unresolved, resolved: reminders.length - unresolved, byType };
  }, [reminders]);

  const filtered = useMemo(() => reminders
    .filter(r => tab === 'all' ? true : tab === 'unresolved' ? !r.isResolved : r.isResolved)
    .filter(r => filter === 'all' ? true : r.type === filter),
  [reminders, tab, filter]);

  const handleVerify = (r: Reminder) => markKeyAsVerified(r.keyArchiveId);
  const handleUpdate = (r: Reminder) => {
    const arc = keyArchives.find(a => a.id === r.keyArchiveId);
    if (arc) {
      const tr = trustees.find(t => t.id === arc.trusteeId);
      if (tr) updateTrustee(tr.id, { movedFlag: false, moveNote: '' });
    }
    resolveReminder(r.id);
  };
  const handleRecover = (r: Reminder) => { updateKeyArchive(r.keyArchiveId, { oldKeysRecovered: true }); resolveReminder(r.id); };
  const markAllRead = () => reminders.filter(r => !r.isRead).forEach(r => markReminderRead(r.id));

  const tabs: { key: TabType; label: string; count: number }[] = [
    { key: 'all', label: '全部', count: reminders.length },
    { key: 'unresolved', label: '未处理', count: stats.unresolved },
    { key: 'resolved', label: '已解决', count: stats.resolved },
  ];
  const filterTags: { key: FilterType; label: string; icon: string }[] = [
    { key: 'all', label: '全部类型', icon: '📋' },
    { key: 'long_unverified', label: '长期未核对', icon: '⏰' },
    { key: 'trustee_moved', label: '托管人搬家', icon: '🚚' },
    { key: 'old_keys_unrecovered', label: '旧钥匙未回收', icon: '🔒' },
  ];

  return (
    <div className="space-y-6">
      <div className="animate-fade-in-up flex items-center gap-3 mb-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-coral-400 to-coral-600 flex items-center justify-center shadow-lg">
          <Bell className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-navy-800">提醒中心</h1>
          <p className="text-sm text-navy-500">共 {reminders.length} 条提醒 · {stats.unresolved} 条待处理</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <MiniStat label="未处理" value={stats.unresolved} icon={XCircle} color="bg-gradient-to-br from-coral-400 to-coral-600" delay="stagger-1" />
        <MiniStat label="已解决" value={stats.resolved} icon={CheckCircle} color="bg-gradient-to-br from-mint-500 to-mint-700" delay="stagger-2" />
        <MiniStat label="长期未核对" value={stats.byType.long_unverified} icon={Clock} color="bg-gradient-to-br from-amber-400 to-amber-600" delay="stagger-3" />
        <MiniStat label="托管人搬家" value={stats.byType.trustee_moved} icon={Truck} color="bg-gradient-to-br from-coral-500 to-coral-700" delay="stagger-4" />
        <MiniStat label="旧钥匙未回收" value={stats.byType.old_keys_unrecovered} icon={Lock} color="bg-gradient-to-br from-navy-500 to-navy-700" delay="stagger-5" />
      </div>

      <div className="card p-4 animate-fade-in-up stagger-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-navy-600 flex items-center gap-1.5"><Filter className="w-4 h-4" />筛选类型：</span>
            {filterTags.map(f => (
              <button key={f.key} onClick={() => setFilter(f.key)}
                className={cn('badge border-2 transition-all cursor-pointer', filter === f.key ? 'bg-navy-600 text-white border-navy-600' : 'bg-white text-navy-600 border-cream-300 hover:border-navy-300')}>
                <span>{f.icon}</span> {f.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button className="btn btn-secondary btn-sm" onClick={markAllRead}><Eye className="w-4 h-4" />全选未读标记已读</button>
            <button className="btn btn-ghost btn-sm" onClick={markAllRead}><Check className="w-4 h-4" />全部标记已读</button>
          </div>
        </div>
        <div className="divider" />
        <div className="flex items-center gap-1 bg-cream-50 rounded-xl p-1.5 w-fit">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={cn('px-4 py-2 rounded-lg text-sm font-medium transition-all', tab === t.key ? 'bg-white text-navy-700 shadow-sm' : 'text-navy-500 hover:text-navy-700')}>
              {t.label}
              <span className="ml-1.5 text-xs px-1.5 py-0.5 rounded-full bg-cream-200 text-navy-600 font-mono">{t.count}</span>
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card p-12 text-center animate-fade-in-up stagger-2">
          <div className="w-28 h-28 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-mint-100 to-amber-100 flex items-center justify-center">
            <Sparkles className="w-14 h-14 text-amber-500" />
          </div>
          <h3 className="font-serif text-2xl font-bold text-navy-800 mb-2">暂无提醒，状态良好 ✨</h3>
          <p className="text-navy-500 max-w-md mx-auto">所有钥匙档案状态正常，托管人信息准确无误。继续保持定期核对的好习惯哦！</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((r, i) => (
            <ReminderCard key={r.id} r={r} i={i}
              onVerify={() => handleVerify(r)} onUpdate={() => handleUpdate(r)} onRecover={() => handleRecover(r)}
              onIgnore={() => resolveReminder(r.id)} onDelete={() => deleteReminder(r.id)} onRead={() => markReminderRead(r.id)} />
          ))}
        </div>
      )}
    </div>
  );
};

export default RemindersPage;
