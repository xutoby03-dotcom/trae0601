import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  AlertTriangle,
  Clock,
  User,
  Building2,
  ArrowRight,
  Phone,
  Crown,
  CheckCircle,
  Loader2,
  BellOff,
  X,
  MessageSquare,
  StickyNote,
} from 'lucide-react';
import { borrowApi } from '../services/borrowService';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

interface OverdueRecord {
  id: number;
  costume_id: string;
  costume_name?: string;
  costume_size?: string;
  costume_photo?: string;
  student_name: string;
  club_name: string;
  activity_name?: string;
  expected_return_date: string;
  overdue_days: number;
  deposit?: number;
  club_leader_name?: string;
  club_leader_contact?: string;
  reminder_sent?: boolean;
  reminder_at?: string;
  reminder_note?: string;
}

type TabType = 'unreminded' | 'reminded';

const DEFAULT_BATCH_NOTE = '已电话提醒社长催收';

export default function Notifications() {
  const [overdueList, setOverdueList] = useState<OverdueRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [remindingIds, setRemindingIds] = useState<number[]>([]);
  const [markAllLoading, setMarkAllLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('unreminded');

  const [modalOpen, setModalOpen] = useState(false);
  const [targetRecord, setTargetRecord] = useState<OverdueRecord | null>(null);
  const [noteText, setNoteText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadOverdue();
  }, []);

  const loadOverdue = async () => {
    setLoading(true);
    try {
      const data = await borrowApi.getOverdue();
      setOverdueList(data as unknown as OverdueRecord[]);
    } catch (error) {
      console.error('Failed to load overdue list:', error);
    } finally {
      setLoading(false);
    }
  };

  const unremindedList = useMemo(
    () => overdueList.filter((r) => !r.reminder_sent),
    [overdueList]
  );
  const remindedList = useMemo(
    () => overdueList.filter((r) => r.reminder_sent),
    [overdueList]
  );

  const displayList = activeTab === 'unreminded' ? unremindedList : remindedList;

  const openReminderModal = (record: OverdueRecord) => {
    setTargetRecord(record);
    setNoteText('');
    setModalOpen(true);
  };

  const closeModal = () => {
    if (submitting) return;
    setModalOpen(false);
    setTargetRecord(null);
    setNoteText('');
  };

  const submitReminder = async () => {
    if (!targetRecord || submitting) return;
    const id = targetRecord.id;
    setSubmitting(true);
    setRemindingIds((prev) => [...prev, id]);
    try {
      await borrowApi.markReminder(id, noteText.trim() || undefined);
      const nowStr = new Date().toISOString().replace('T', ' ').split('.')[0];
      setOverdueList((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                reminder_sent: true,
                reminder_at: nowStr,
                reminder_note: noteText.trim() || undefined,
              }
            : r
        )
      );
      closeModal();
    } catch (error) {
      alert((error as Error).message);
    } finally {
      setSubmitting(false);
      setRemindingIds((prev) => prev.filter((rid) => rid !== id));
    }
  };

  const handleMarkAll = async () => {
    if (markAllLoading || unremindedList.length === 0) return;
    setMarkAllLoading(true);
    try {
      await borrowApi.markAllReminder();
      const nowStr = new Date().toISOString().replace('T', ' ').split('.')[0];
      setOverdueList((prev) =>
        prev.map((r) =>
          r.reminder_sent
            ? r
            : {
                ...r,
                reminder_sent: true,
                reminder_at: nowStr,
                reminder_note: DEFAULT_BATCH_NOTE,
              }
        )
      );
    } catch (error) {
      alert((error as Error).message);
    } finally {
      setMarkAllLoading(false);
    }
  };

  const renderCard = (record: OverdueRecord) => (
    <div key={record.id} className="p-5 hover:bg-gray-50 transition-colors">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
          {record.costume_photo ? (
            <img
              src={record.costume_photo}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl">
              👗
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-semibold text-gray-800">
                {record.costume_name}
              </h3>
              <p className="text-sm text-gray-500 mt-0.5">
                编号：{record.costume_id} · 尺码：{record.costume_size || '-'}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                <Clock className="w-3 h-3" />
                逾期 {record.overdue_days} 天
              </span>
              {record.reminder_sent ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                  <CheckCircle className="w-3 h-3" />
                  已提醒
                </span>
              ) : (
                <StatusBadge status="overdue" type="borrow" />
              )}
            </div>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
            <div className="flex items-center gap-1.5 text-gray-500">
              <User className="w-4 h-4" />
              <span className="truncate">{record.student_name}</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-500">
              <Building2 className="w-4 h-4" />
              <span className="truncate">{record.club_name}</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-500">
              <Bell className="w-4 h-4" />
              <span className="truncate">{record.activity_name || '-'}</span>
            </div>
          </div>

          {(record.club_leader_name || record.club_leader_contact) && (
            <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
              <div className="flex items-center gap-1.5 mb-2">
                <Crown className="w-3.5 h-3.5 text-amber-600" />
                <span className="text-xs font-medium text-amber-700">
                  社团负责人
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-1.5 text-gray-700">
                  <User className="w-3.5 h-3.5 text-gray-400" />
                  <span>{record.club_leader_name || '-'}</span>
                </div>
                {record.club_leader_contact && (
                  <a
                    href={`tel:${record.club_leader_contact}`}
                    className="flex items-center gap-1.5 text-primary-600 hover:text-primary-700 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{record.club_leader_contact}</span>
                  </a>
                )}
              </div>
            </div>
          )}

          {record.reminder_sent && (
            <div className="mt-3 p-3 bg-emerald-50 rounded-lg border border-emerald-100">
              <div className="flex items-start gap-2">
                <StickyNote className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm flex-1 min-w-0">
                  <p className="text-emerald-700">
                    提醒时间：{record.reminder_at}
                  </p>
                  {record.reminder_note && (
                    <p className="mt-1 text-gray-700 break-words">
                      <span className="text-gray-500">社长反馈：</span>
                      {record.reminder_note}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="mt-4 flex items-center justify-between gap-3">
            <div className="text-sm">
              <p className="text-gray-500">
                应还日期：{record.expected_return_date?.split('T')[0]}
              </p>
              {typeof record.deposit === 'number' && record.deposit > 0 && (
                <p className="text-gray-500 mt-0.5">
                  押金：
                  <span className="font-medium text-gray-700">
                    ¥{record.deposit}
                  </span>
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {!record.reminder_sent && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => openReminderModal(record)}
                  disabled={remindingIds.includes(record.id)}
                >
                  {remindingIds.includes(record.id) ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <MessageSquare className="w-4 h-4 mr-1" />
                  )}
                  标记已提醒
                </Button>
              )}
              <Link to="/return">
                <Button size="sm" variant="outline">
                  去归还
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">消息通知</h1>
            <p className="text-gray-500 mt-1">查看逾期提醒和系统通知</p>
          </div>
          {unremindedList.length > 0 && (
            <span className="inline-flex items-center justify-center h-7 min-w-[28px] px-2 rounded-full bg-red-500 text-white text-sm font-semibold">
              {unremindedList.length}
            </span>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-800">逾期提醒</h2>
                <p className="text-sm text-gray-500">
                  共 {overdueList.length} 套服装逾期，其中{' '}
                  {unremindedList.length} 套未提醒
                </p>
              </div>
            </div>
            {activeTab === 'unreminded' && unremindedList.length > 0 && (
              <Button
                size="sm"
                variant="primary"
                onClick={handleMarkAll}
                disabled={markAllLoading}
              >
                {markAllLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-1" />
                ) : (
                  <BellOff className="w-4 h-4 mr-1" />
                )}
                一键全标记
              </Button>
            )}
          </div>
        </div>

        <div className="flex border-b border-gray-100">
          <button
            onClick={() => setActiveTab('unreminded')}
            className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
              activeTab === 'unreminded'
                ? 'text-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            未提醒
            {unremindedList.length > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full bg-red-100 text-red-600 text-xs font-semibold">
                {unremindedList.length}
              </span>
            )}
            {activeTab === 'unreminded' && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-primary-600 rounded-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('reminded')}
            className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
              activeTab === 'reminded'
                ? 'text-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            已提醒
            {remindedList.length > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full bg-emerald-100 text-emerald-600 text-xs font-semibold">
                {remindedList.length}
              </span>
            )}
            {activeTab === 'reminded' && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-primary-600 rounded-full" />
            )}
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full mx-auto" />
            <p className="text-gray-500 mt-3">加载中...</p>
          </div>
        ) : displayList.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {displayList.map(renderCard)}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              {activeTab === 'unreminded' ? (
                <Bell className="w-10 h-10 text-green-500" />
              ) : (
                <CheckCircle className="w-10 h-10 text-emerald-500" />
              )}
            </div>
            <h3 className="text-lg font-semibold text-gray-800">
              {activeTab === 'unreminded' ? '暂无待提醒' : '暂无已提醒记录'}
            </h3>
            <p className="text-gray-500 mt-1">
              {activeTab === 'unreminded'
                ? '所有逾期都已通知社长，继续跟进归还吧！'
                : '还没有已提醒的逾期记录'}
            </p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-800 mb-4">系统通知</h2>
        <div className="space-y-3">
          <div className="p-4 bg-gray-50 rounded-lg flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Bell className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-800 font-medium">
                欢迎使用社团服装借还系统
              </p>
              <p className="text-xs text-gray-500 mt-1">
                系统已初始化，您可以开始管理服装档案了。
              </p>
              <p className="text-xs text-gray-400 mt-2">刚刚</p>
            </div>
          </div>
        </div>
      </div>

      {modalOpen && targetRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={closeModal}
          />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary-600" />
                <h3 className="font-semibold text-gray-800">标记已提醒</h3>
              </div>
              <button
                onClick={closeModal}
                disabled={submitting}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="p-3 bg-gray-50 rounded-lg text-sm">
                <p className="font-medium text-gray-800">
                  {targetRecord.costume_name}
                </p>
                <p className="text-gray-500 mt-1">
                  编号：{targetRecord.costume_id} · 尺码：
                  {targetRecord.costume_size || '-'} · 逾期{' '}
                  {targetRecord.overdue_days} 天
                </p>
                {targetRecord.club_leader_name && (
                  <p className="text-amber-600 mt-1.5 flex items-center gap-1">
                    <Crown className="w-3.5 h-3.5" />
                    社长：{targetRecord.club_leader_name}
                    {targetRecord.club_leader_contact && (
                      <>
                        <span className="text-gray-300 mx-1">·</span>
                        <a
                          href={`tel:${targetRecord.club_leader_contact}`}
                          className="underline hover:text-amber-700"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {targetRecord.club_leader_contact}
                        </a>
                      </>
                    )}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  催还备注（社长反馈）
                </label>
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  rows={4}
                  placeholder="例：社长说今晚联系学生明早送回；或已沟通明天下午社团室归还..."
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-sm resize-none placeholder:text-gray-400"
                  autoFocus
                  disabled={submitting}
                />
                <p className="text-xs text-gray-400 mt-1.5">
                  可不填，留空仅记录提醒时间
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-gray-100 bg-gray-50">
              <Button
                variant="secondary"
                size="sm"
                onClick={closeModal}
                disabled={submitting}
              >
                取消
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={submitReminder}
                disabled={submitting}
              >
                {submitting && (
                  <Loader2 className="w-4 h-4 animate-spin mr-1" />
                )}
                确认标记
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
