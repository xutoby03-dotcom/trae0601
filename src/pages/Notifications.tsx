import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, AlertTriangle, Clock, User, Building2, ArrowRight, Phone, Crown, CheckCircle, Loader2 } from 'lucide-react';
import { borrowApi } from '../services/borrowService';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Button } from '../components/ui/Button';

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
}

export default function Notifications() {
  const [overdueList, setOverdueList] = useState<OverdueRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [remindingIds, setRemindingIds] = useState<number[]>([]);

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

  const handleMarkReminder = async (id: number) => {
    if (remindingIds.includes(id)) return;
    setRemindingIds((prev) => [...prev, id]);
    try {
      await borrowApi.markReminder(id);
      setOverdueList((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                reminder_sent: true,
                reminder_at: new Date().toISOString().replace('T', ' ').split('.')[0],
              }
            : r
        )
      );
    } catch (error) {
      alert((error as Error).message);
    } finally {
      setRemindingIds((prev) => prev.filter((rid) => rid !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">消息通知</h1>
        <p className="text-gray-500 mt-1">查看逾期提醒和系统通知</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-800">逾期提醒</h2>
              <p className="text-sm text-gray-500">
                共 {overdueList.length} 套服装逾期未归还
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full mx-auto" />
            <p className="text-gray-500 mt-3">加载中...</p>
          </div>
        ) : overdueList.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {overdueList.map((record) => (
              <div
                key={record.id}
                className="p-5 hover:bg-gray-50 transition-colors"
              >
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
                          <span className="text-xs font-medium text-amber-700">社团负责人</span>
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

                    {record.reminder_sent && record.reminder_at && (
                      <p className="mt-2 text-xs text-emerald-600">
                        提醒时间：{record.reminder_at}
                      </p>
                    )}

                    <div className="mt-4 flex items-center justify-between gap-3">
                      <div className="text-sm">
                        <p className="text-gray-500">
                          应还日期：{record.expected_return_date?.split('T')[0]}
                        </p>
                        {typeof record.deposit === 'number' && record.deposit > 0 && (
                          <p className="text-gray-500 mt-0.5">
                            押金：<span className="font-medium text-gray-700">¥{record.deposit}</span>
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {!record.reminder_sent && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleMarkReminder(record.id)}
                            disabled={remindingIds.includes(record.id)}
                          >
                            {remindingIds.includes(record.id) ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Bell className="w-4 h-4 mr-1" />
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
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-10 h-10 text-green-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">暂无逾期提醒</h3>
            <p className="text-gray-500 mt-1">所有服装都按时归还，干得漂亮！</p>
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
              <p className="text-sm text-gray-800 font-medium">欢迎使用社团服装借还系统</p>
              <p className="text-xs text-gray-500 mt-1">系统已初始化，您可以开始管理服装档案了。</p>
              <p className="text-xs text-gray-400 mt-2">刚刚</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
