import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Eye, Clock } from 'lucide-react';
import { borrowApi, type BorrowQuery } from '../services/borrowService';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Input } from '../components/ui/Input';
import type { BorrowDetail } from '../services/borrowService';

export default function BorrowRecords() {
  const [records, setRecords] = useState<BorrowDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [activeTab, setActiveTab] = useState<'all' | 'borrowed' | 'returned' | 'overdue'>('all');
  const [query, setQuery] = useState<BorrowQuery>({
    page: 1,
    pageSize: 20,
    student_name: '',
    club_name: '',
  });

  useEffect(() => {
    loadRecords();
  }, [query, activeTab]);

  const loadRecords = async () => {
    setLoading(true);
    try {
      const statusMap: Record<string, string> = {
        all: '',
        borrowed: 'borrowed',
        returned: 'returned',
        overdue: 'overdue',
      };
      const result = await borrowApi.getList({
        ...query,
        status: statusMap[activeTab] || undefined,
      });
      setRecords(result.list);
      setTotal(result.total);
    } catch (error) {
      console.error('Failed to load borrow records:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { key: 'all', label: '全部' },
    { key: 'borrowed', label: '在借中' },
    { key: 'overdue', label: '已逾期' },
    { key: 'returned', label: '已归还' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">借出记录</h1>
          <p className="text-gray-500 mt-1">共 {total} 条记录</p>
        </div>
        <Link to="/borrow">
          <button className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2">
            <span>+</span> 新增借出
          </button>
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="border-b border-gray-100">
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'text-primary-600 border-primary-600'
                    : 'text-gray-500 border-transparent hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="flex-1 max-w-md">
              <Input
                placeholder="搜索借用人姓名..."
                value={query.student_name || ''}
                onChange={(e) =>
                  setQuery((prev) => ({ ...prev, student_name: e.target.value, page: 1 }))
                }
                leftIcon={<Search className="w-4 h-4" />}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <Input
                placeholder="社团名称"
                value={query.club_name || ''}
                onChange={(e) =>
                  setQuery((prev) => ({ ...prev, club_name: e.target.value, page: 1 }))
                }
                className="w-40"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full mx-auto" />
            <p className="text-gray-500 mt-3">加载中...</p>
          </div>
        ) : records.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    服装
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    借用人
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    社团/活动
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    借出日期
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    预计归还
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    押金
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    状态
                  </th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {records.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden">
                          {record.costume_photo ? (
                            <img
                              src={record.costume_photo}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-lg">
                              👗
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 text-sm">
                            {record.costume_name}
                          </p>
                          <p className="text-xs text-gray-500">{record.costume_id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-medium text-gray-800 text-sm">{record.student_name}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm text-gray-800">{record.club_name}</p>
                      <p className="text-xs text-gray-500">{record.activity_name || '-'}</p>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600">
                      {record.borrow_date?.split('T')[0]}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`text-sm ${
                          record.status === 'overdue' ? 'text-red-600 font-medium' : 'text-gray-600'
                        }`}
                      >
                        {record.expected_return_date?.split('T')[0]}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600">¥{record.deposit}</td>
                    <td className="px-5 py-4">
                      <StatusBadge status={record.status} type="borrow" />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16">
            <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">暂无借出记录</p>
          </div>
        )}
      </div>
    </div>
  );
}
