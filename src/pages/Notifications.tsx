import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, AlertTriangle, Clock, User, Building2, ArrowRight } from 'lucide-react';
import { borrowApi } from '../services/borrowService';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Button } from '../components/ui/Button';

interface OverdueRecord {
  id: number;
  costume_id: string;
  costume_name?: string;
  costume_photo?: string;
  student_name: string;
  club_name: string;
  activity_name?: string;
  expected_return_date: string;
  overdue_days: number;
}

export default function Notifications() {
  const [overdueList, setOverdueList] = useState<OverdueRecord[]>([]);
  const [loading, setLoading] = useState(true);

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
                          编号：{record.costume_id}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                          <Clock className="w-3 h-3" />
                          逾期 {record.overdue_days} 天
                        </span>
                        <StatusBadge status="overdue" type="borrow" />
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
                    <div className="mt-3 flex items-center justify-between">
                      <p className="text-sm text-gray-500">
                        应还日期：{record.expected_return_date?.split('T')[0]}
                      </p>
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
