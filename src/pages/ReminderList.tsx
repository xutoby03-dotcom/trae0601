import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  Check,
  Trash2,
  AlertCircle,
  AlertTriangle,
  Info,
  Clock,
  PackageMinus,
  Flame,
  MapPin,
  User,
  ChevronRight,
} from 'lucide-react';
import { useAppStore } from '@/store';
import { ReminderLevel, ReminderType, REMINDER_TYPE_LABEL } from '@/types';
import { formatDateTime } from '@/utils';
import Button from '@/components/Button';

const typeIcon: Record<ReminderType, typeof AlertCircle> = {
  expiry: Flame,
  damage: AlertCircle,
  'low-stock': PackageMinus,
  'overdue-return': Clock,
};

const levelBadge: Record<ReminderLevel, string> = {
  info: 'badge-neutral',
  warning: 'badge-warning',
  danger: 'badge-danger',
};

const levelIcon: Record<ReminderLevel, typeof Info> = {
  info: Info,
  warning: AlertTriangle,
  danger: AlertCircle,
};

const levelLabel: Record<ReminderLevel, string> = {
  info: '提示',
  warning: '警告',
  danger: '严重',
};

const typeFilterOptions: { value: ReminderType | 'all'; label: string }[] = [
  { value: 'all', label: '全部类型' },
  { value: 'expiry', label: '过期提醒' },
  { value: 'damage', label: '破损提醒' },
  { value: 'low-stock', label: '低库存提醒' },
  { value: 'overdue-return', label: '逾期归还' },
];

const ITEM_RELATED_TYPES: ReminderType[] = ['expiry', 'damage', 'low-stock'];

export default function ReminderList() {
  const { boxes, items, reminders, markReminderRead, clearReadReminders, refreshReminders } = useAppStore();
  const [typeFilter, setTypeFilter] = useState<ReminderType | 'all'>('all');
  const [onlyUnread, setOnlyUnread] = useState(false);

  const filtered = reminders
    .filter(r => {
      if (typeFilter !== 'all' && r.type !== typeFilter) return false;
      if (onlyUnread && r.isRead) return false;
      return true;
    })
    .sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));

  const unreadCount = reminders.filter(r => !r.isRead).length;

  const buildInventoryLink = (relatedId: string, type: ReminderType) => {
    const item = items.find(i => i.id === relatedId);
    const params = new URLSearchParams();
    if (item) {
      if (item.storageCell) params.set('search', item.storageCell);
      else if (item.name) params.set('search', item.name);
      params.set('boxId', item.boxId);
      if (type === 'damage') params.set('status', 'damaged');
      else if (type === 'expiry') params.set('status', items.find(i => i.id === relatedId)?.status ?? 'expired');
      else if (type === 'low-stock') params.set('status', 'low-stock');
    }
    return '/inventory?' + params.toString();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
            <Bell className="w-6 h-6 text-primary-600" />
            提醒中心
            {unreadCount > 0 && (
              <span className="badge-danger text-xs px-2 py-0.5">
                {unreadCount} 条未读
              </span>
            )}
          </h1>
          <p className="text-sm text-zinc-500 mt-1">过期、破损、低库存、逾期归还提醒</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="secondary" onClick={() => refreshReminders()}>
            刷新提醒
          </Button>
          <Button variant="ghost" onClick={() => {
            if (confirm('确定清除所有已读提醒？')) clearReadReminders();
          }}>
            <Trash2 className="w-4 h-4" />
            清除已读
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-zinc-100 p-4 shadow-card flex flex-wrap gap-3 items-center">
        <select
          className="input max-w-[180px]"
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value as ReminderType | 'all')}
        >
          {typeFilterOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <label className="inline-flex items-center gap-2 text-sm text-zinc-700 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={onlyUnread}
            onChange={e => setOnlyUnread(e.target.checked)}
            className="w-4 h-4 rounded border-zinc-300 text-primary-600 focus:ring-primary-500"
          />
          只看未读
        </label>
      </div>

      {filtered.length === 0 ? (
        <div className="card p-16 text-center">
          <Bell className="w-12 h-12 text-zinc-200 mx-auto mb-3" />
          <p className="text-zinc-400">暂无提醒</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(r => {
            const TypeIcon = typeIcon[r.type];
            const LevelIcon = levelIcon[r.level];
            const isItemRelated = ITEM_RELATED_TYPES.includes(r.type);
            const item = isItemRelated ? items.find(i => i.id === r.relatedId) : null;
            const box = item ? boxes.find(b => b.id === item.boxId) : null;
            const inventoryLink = isItemRelated ? buildInventoryLink(r.relatedId, r.type) : null;
            return (
              <div
                key={r.id}
                className={
                  'card p-5 transition-all ' +
                  (r.isRead ? 'opacity-70' : '')
                }
              >
                <div className="flex items-start gap-4">
                  <div className={
                    'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ' +
                    (r.level === 'danger'
                      ? 'bg-danger-50 text-danger-600'
                      : r.level === 'warning'
                      ? 'bg-warning-50 text-warning-600'
                      : 'bg-zinc-100 text-zinc-600')
                  }>
                    <TypeIcon className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-zinc-900">{r.title}</h3>
                          <span className={levelBadge[r.level]}>
                            <LevelIcon className="w-3 h-3" />
                            {levelLabel[r.level]}
                          </span>
                          <span className="badge-neutral">
                            {REMINDER_TYPE_LABEL[r.type]}
                          </span>
                        </div>
                        <p className="text-sm text-zinc-600 mt-1">{r.description}</p>
                        {isItemRelated && box && (
                          <p className="text-xs text-zinc-500 mt-1.5 flex items-center gap-3 flex-wrap">
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {box.location}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {box.manager}
                            </span>
                            {item && <span>存放格: {item.storageCell}</span>}
                          </p>
                        )}
                        <p className="text-xs text-zinc-400 mt-2 font-mono">
                          {formatDateTime(r.createdAt)}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {inventoryLink && (
                          <Link
                            to={inventoryLink}
                            className="btn btn-secondary !py-1.5 !px-3 !text-xs"
                          >
                            去库存查看
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        )}
                        {!r.isRead && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => markReminderRead(r.id)}
                          >
                            <Check className="w-4 h-4" />
                            标记已读
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
