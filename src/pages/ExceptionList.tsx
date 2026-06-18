import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Search, Filter, Clock, User, Package, CheckCircle, XCircle, Wrench } from 'lucide-react';
import { api } from '../lib/api.js';
import { useAppStore } from '../store/index.js';
import { PageHeader } from '../components/PageHeader.js';
import { StatusBadge } from '../components/StatusBadge.js';
import { toast } from '../components/Layout.js';
import type { ExceptionRecordWithDetails, ExceptionStatus, ExceptionType } from '../../shared/types.js';

const statusFilterOptions: { value: string; label: string }[] = [
  { value: '', label: '全部状态' },
  { value: 'pending', label: '待处理' },
  { value: 'processing', label: '处理中' },
  { value: 'resolved', label: '已解决' },
  { value: 'scrapped', label: '已报废' },
];

const typeFilterOptions: { value: string; label: string }[] = [
  { value: '', label: '全部类型' },
  { value: 'overdue', label: '逾期未还' },
  { value: 'damage', label: '归还损坏' },
  { value: 'high_temp', label: '高温损坏' },
];

export default function ExceptionList() {
  const navigate = useNavigate();
  const { exceptionRecords, fetchExceptions } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      await fetchExceptions({ includeDetails: true });
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = exceptionRecords.filter((record: ExceptionRecordWithDetails) => {
    const matchSearch = !searchText ||
      record.moldName.toLowerCase().includes(searchText.toLowerCase()) ||
      record.masterName.toLowerCase().includes(searchText.toLowerCase()) ||
      record.description.toLowerCase().includes(searchText.toLowerCase());

    const matchStatus = !statusFilter || record.status === statusFilter;
    const matchType = !typeFilter || record.type === typeFilter;

    return matchSearch && matchStatus && matchType;
  });

  const getPendingCount = () => filteredRecords.filter(r => r.status === 'pending').length;
  const getProcessingCount = () => filteredRecords.filter(r => r.status === 'processing').length;

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
        title="异常管理"
        subtitle="处理模具损坏和逾期异常"
        icon={<AlertTriangle className="w-6 h-6" />}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-tomato-100 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-tomato-600" />
            </div>
            <div>
              <div className="text-3xl font-serif font-bold text-gray-800">{getPendingCount()}</div>
              <div className="text-sm text-gray-500">待处理</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <Wrench className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <div className="text-3xl font-serif font-bold text-gray-800">{getProcessingCount()}</div>
              <div className="text-sm text-gray-500">处理中</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-caramel-100 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-caramel-600" />
            </div>
            <div>
              <div className="text-3xl font-serif font-bold text-gray-800">{filteredRecords.length}</div>
              <div className="text-sm text-gray-500">总异常</div>
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
              placeholder="搜索模具、师傅、异常描述..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-caramel-500 focus:border-transparent transition-all"
            />
          </div>
          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-caramel-500 transition-all"
            >
              {typeFilterOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-caramel-500 transition-all"
            >
              {statusFilterOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
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
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">异常类型</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">责任人</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">发现日期</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">描述</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">状态</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record: ExceptionRecordWithDetails) => (
                  <tr key={record.id} className="border-b border-gray-50 hover:bg-tomato-50/30 transition-colors">
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
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        record.type === 'overdue'
                          ? 'bg-amber-100 text-amber-700'
                          : record.type === 'high_temp'
                          ? 'bg-tomato-100 text-tomato-700'
                          : 'bg-purple-100 text-purple-700'
                      }`}>
                        {record.type === 'overdue' ? '逾期未还' :
                         record.type === 'high_temp' ? '高温损坏' : '归还损坏'}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-medium text-gray-800">{record.masterName || '-'}</td>
                    <td className="py-4 px-6 text-gray-600">{record.foundDate}</td>
                    <td className="py-4 px-6 max-w-xs truncate text-gray-600">{record.description}</td>
                    <td className="py-4 px-6">
                      <StatusBadge status={record.status as ExceptionStatus} type="exception" />
                    </td>
                    <td className="py-4 px-6">
                      {(record.status === 'pending' || record.status === 'processing') && (
                        <button
                          onClick={() => navigate(`/exception/${record.id}`)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-tomato-500 text-white text-sm rounded-lg font-medium hover:bg-tomato-600 transition-colors"
                        >
                          <Wrench className="w-4 h-4" />
                          处理
                        </button>
                      )}
                      {(record.status === 'resolved' || record.status === 'scrapped') && (
                        <button
                          onClick={() => navigate(`/exception/${record.id}`)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-100 text-gray-600 text-sm rounded-lg font-medium hover:bg-gray-200 transition-colors"
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
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-matcha-400" />
            <h3 className="text-lg font-medium mb-2">暂无异常记录</h3>
            <p>所有模具状态正常，继续保持</p>
          </div>
        )}
      </div>
    </div>
  );
}
