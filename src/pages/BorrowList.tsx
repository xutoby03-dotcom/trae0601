import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, Plus, Search, Filter, Clock, User, Package } from 'lucide-react';
import { api } from '../lib/api.js';
import { useAppStore } from '../store/index.js';
import { PageHeader } from '../components/PageHeader.js';
import { StatusBadge } from '../components/StatusBadge.js';
import { toast } from '../components/Layout.js';
import type { BorrowRecordWithDetails, BorrowStatus } from '../../shared/types.js';

const statusFilterOptions: { value: string; label: string }[] = [
  { value: '', label: '全部状态' },
  { value: 'borrowed', label: '借用中' },
  { value: 'overdue', label: '已逾期' },
  { value: 'returned', label: '已归还' },
];

export default function BorrowList() {
  const navigate = useNavigate();
  const { borrowRecords, fetchBorrows, masters, molds, fetchAllBasics } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [masterFilter, setMasterFilter] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchBorrows({ includeDetails: true }),
        fetchAllBasics(),
      ]);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = borrowRecords.filter((record: BorrowRecordWithDetails) => {
    const matchSearch = !searchText ||
      record.masterName.toLowerCase().includes(searchText.toLowerCase()) ||
      record.orderNo.toLowerCase().includes(searchText.toLowerCase()) ||
      record.moldName.toLowerCase().includes(searchText.toLowerCase());

    const matchStatus = !statusFilter || record.status === statusFilter;
    const matchMaster = !masterFilter || record.masterId === masterFilter;

    return matchSearch && matchStatus && matchMaster;
  });

  const getBorrowedCount = () => filteredRecords.filter(r => r.status === 'borrowed').length;
  const getOverdueCount = () => filteredRecords.filter(r => r.status === 'overdue').length;

  if (loading) {
    return (
      <div className="animate-fade-in">
        <div className="bg-white rounded-2xl shadow-lg p-8 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="h-24 bg-gray-200 rounded-2xl"></div>
            <div className="h-24 bg-gray-200 rounded-2xl"></div>
            <div className="h-24 bg-gray-200 rounded-2xl"></div>
          </div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="借用管理"
        subtitle="管理模具的借用与归还"
        icon={<ClipboardList className="w-6 h-6" />}
        actions={
          <button
            onClick={() => navigate('/borrow/new')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-caramel-500 to-caramel-600 text-white rounded-xl font-medium hover:from-caramel-600 hover:to-caramel-700 transition-all shadow-lg"
          >
            <Plus className="w-5 h-5" />
            新建借用
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-caramel-100 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-caramel-600" />
            </div>
            <div>
              <div className="text-3xl font-serif font-bold text-gray-800">{getBorrowedCount()}</div>
              <div className="text-sm text-gray-500">借用中</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-tomato-100 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-tomato-600" />
            </div>
            <div>
              <div className="text-3xl font-serif font-bold text-gray-800">{getOverdueCount()}</div>
              <div className="text-sm text-gray-500">已逾期</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-matcha-100 rounded-xl flex items-center justify-center">
              <User className="w-6 h-6 text-matcha-600" />
            </div>
            <div>
              <div className="text-3xl font-serif font-bold text-gray-800">{filteredRecords.length}</div>
              <div className="text-sm text-gray-500">总记录</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="搜索借用人、订单号、模具名称..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-caramel-500 focus:border-transparent transition-all"
            />
          </div>
          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-caramel-500 transition-all"
            >
              {statusFilterOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <select
              value={masterFilter}
              onChange={(e) => setMasterFilter(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-caramel-500 transition-all"
            >
              <option value="">全部师傅</option>
              {masters.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {filteredRecords.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">模具</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">借用人</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">订单号</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">借用日期</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">预计归还</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">脱模纸</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">状态</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record: BorrowRecordWithDetails) => (
                  <tr key={record.id} className="border-b border-gray-50 hover:bg-caramel-50/30 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-caramel-100 rounded-lg flex items-center justify-center overflow-hidden">
                          {record.photoUrl ? (
                            <img src={record.photoUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <Package className="w-5 h-5 text-caramel-600" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-800">{record.moldName}</div>
                          <div className="text-xs text-gray-500">{record.moldSize}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-medium text-gray-800">{record.masterName}</td>
                    <td className="py-4 px-6">
                      <span className="font-mono text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                        {record.orderNo}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-600">{record.borrowDate}</td>
                    <td className="py-4 px-6">
                      <div className={record.status === 'overdue' ? 'text-tomato-600 font-medium' : 'text-gray-600'}>
                        {record.expectedReturnDate}
                        {record.status === 'overdue' && <span className="ml-1 text-xs">（逾期）</span>}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-1 rounded text-xs ${
                        record.needReleasePaper
                          ? 'bg-matcha-100 text-matcha-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {record.needReleasePaper ? '需要' : '不需要'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <StatusBadge status={record.status as BorrowStatus} type="borrow" />
                    </td>
                    <td className="py-4 px-6">
                      {(record.status === 'borrowed' || record.status === 'overdue') && (
                        <button
                          onClick={() => navigate(`/return/${record.id}`)}
                          className="px-4 py-2 bg-matcha-500 text-white text-sm rounded-lg font-medium hover:bg-matcha-600 transition-colors"
                        >
                          归还检查
                        </button>
                      )}
                      {record.status === 'returned' && (
                        <button
                          onClick={() => navigate(`/return/${record.id}`)}
                          className="px-4 py-2 bg-gray-100 text-gray-600 text-sm rounded-lg font-medium hover:bg-gray-200 transition-colors"
                        >
                          查看详情
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 text-gray-400">
            <ClipboardList className="w-16 h-16 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">暂无借用记录</h3>
            <p className="mb-6">点击右上角按钮创建新的借用记录</p>
            <button
              onClick={() => navigate('/borrow/new')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-caramel-500 text-white rounded-xl font-medium hover:bg-caramel-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
              新建借用
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
