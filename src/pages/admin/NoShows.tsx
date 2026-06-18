import { useEffect, useMemo } from 'react';
import { Users, CalendarX } from 'lucide-react';
import { useAppStore } from '../../store';
import { getNoShowRecords } from '../../utils/bookingUtils';
import { formatDateChinese } from '../../utils/timeUtils';

export default function NoShows() {
  const { bookings, refreshData } = useAppStore();

  useEffect(() => {
    refreshData();
  }, []);

  const noShowRecords = useMemo(() => getNoShowRecords(), [bookings]);

  const getNoShowBookings = (phone: string) => {
    return bookings
      .filter((b) => b.phone === phone && b.status === 'no-show')
      .sort((a, b) => b.date.localeCompare(a.date));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-gray-800">爽约名单</h2>
        <p className="text-gray-500">统计所有爽约记录，超过3次将限制预约</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="bg-red-100 w-10 h-10 rounded-xl flex items-center justify-center">
              <Users size={20} className="text-red-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800">{noShowRecords.length}</div>
              <div className="text-xs text-gray-500">爽约人数</div>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="bg-orange-100 w-10 h-10 rounded-xl flex items-center justify-center">
              <CalendarX size={20} className="text-orange-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800">
                {noShowRecords.reduce((sum, r) => sum + r.count, 0)}
              </div>
              <div className="text-xs text-gray-500">总爽约次数</div>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-100 w-10 h-10 rounded-xl flex items-center justify-center">
              <Users size={20} className="text-yellow-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800">
                {noShowRecords.filter((r) => r.count >= 3).length}
              </div>
              <div className="text-xs text-gray-500">需关注(≥3次)</div>
            </div>
          </div>
        </div>
      </div>

      <div className="card p-6">
        {noShowRecords.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <CalendarX size={48} className="mx-auto mb-4 text-gray-300" />
            <p>暂无爽约记录</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">手机号</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">爽约次数</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">最近爽约</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">状态</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">记录详情</th>
                </tr>
              </thead>
              <tbody>
                {noShowRecords.map((record) => {
                  const userBookings = getNoShowBookings(record.phone);
                  const isHighRisk = record.count >= 3;

                  return (
                    <tr key={record.phone} className="border-b hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <span className="font-medium">
                          {record.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`font-bold text-lg ${
                            isHighRisk ? 'text-red-500' : record.count >= 2 ? 'text-orange-500' : 'text-gray-700'
                          }`}
                        >
                          {record.count}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-gray-600">
                        {formatDateChinese(record.lastDate)}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`badge ${
                            isHighRisk
                              ? 'bg-red-100 text-red-700'
                              : record.count >= 2
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {isHighRisk ? '高风险' : record.count >= 2 ? '需关注' : '正常'}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <details className="cursor-pointer">
                          <summary className="text-primary-500 hover:text-primary-600 text-sm">
                            查看 {userBookings.length} 条记录
                          </summary>
                          <div className="mt-2 space-y-1 text-xs text-gray-500">
                            {userBookings.map((b) => (
                              <div key={b.id} className="py-1">
                                {formatDateChinese(b.date)} {b.startTime}-{b.endTime}
                              </div>
                            ))}
                          </div>
                        </details>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
