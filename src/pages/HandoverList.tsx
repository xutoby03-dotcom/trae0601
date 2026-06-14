import { useEffect, useState } from 'react';
import { Plus, Search, Filter, Eye, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store';
import {
  formatCurrency,
  formatDateTime,
  getShiftLabel,
  getShiftColor,
  getStatusLabel,
  getStatusColor,
} from '@/utils/format';

export default function HandoverList() {
  const navigate = useNavigate();
  const { handovers, fetchHandovers, registers, fetchRegisters } = useAppStore();
  const [search, setSearch] = useState('');
  const [filterShift, setFilterShift] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchHandovers();
    fetchRegisters();
  }, [fetchHandovers, fetchRegisters]);

  const filtered = handovers.filter((h) => {
    if (search && !h.registerCode.toLowerCase().includes(search.toLowerCase()) &&
        !h.handoverPerson.includes(search) && !h.successorPerson.includes(search)) {
      return false;
    }
    if (filterShift && h.shift !== filterShift) return false;
    if (filterStatus && h.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-gray-900">交接记录</h1>
          <p className="text-sm text-gray-500 mt-1">查看和管理所有备用金交接记录</p>
        </div>
        <button
          onClick={() => navigate('/handovers/new')}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus size={18} />
          <span className="font-medium">新建交接</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-warm-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-warm-100 flex items-center justify-between flex-wrap gap-3">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索收银台编号、交接人..."
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-warm-200 text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${
              showFilters ? 'bg-primary-50 border-primary-300 text-primary-700' : 'border-warm-200 text-gray-600 hover:bg-warm-50'
            }`}
          >
            <Filter size={16} />
            筛选
          </button>
        </div>

        {showFilters && (
          <div className="px-5 py-4 bg-warm-50 border-b border-warm-100 flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">班次：</span>
              <select
                value={filterShift}
                onChange={(e) => setFilterShift(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-warm-200 text-sm bg-white focus:outline-none"
              >
                <option value="">全部</option>
                <option value="morning">早班</option>
                <option value="evening">晚班</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">状态：</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-warm-200 text-sm bg-white focus:outline-none"
              >
                <option value="">全部</option>
                <option value="normal">正常</option>
                <option value="warning">小额差额</option>
                <option value="danger">大额差额</option>
              </select>
            </div>
            {(filterShift || filterStatus) && (
              <button
                onClick={() => {
                  setFilterShift('');
                  setFilterStatus('');
                }}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                清除筛选
              </button>
            )}
          </div>
        )}

        <div className="overflow-x-auto">
          {filtered.length === 0 ? (
            <div className="p-12 text-center text-gray-400">暂无交接记录</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-warm-50 text-left text-sm text-gray-600">
                  <th className="px-5 py-3 font-medium">收银台</th>
                  <th className="px-5 py-3 font-medium">班次</th>
                  <th className="px-5 py-3 font-medium">日期</th>
                  <th className="px-5 py-3 font-medium">交接人</th>
                  <th className="px-5 py-3 font-medium">接班人</th>
                  <th className="px-5 py-3 font-medium text-right">实点金额</th>
                  <th className="px-5 py-3 font-medium text-right">差额</th>
                  <th className="px-5 py-3 font-medium">准时</th>
                  <th className="px-5 py-3 font-medium">状态</th>
                  <th className="px-5 py-3 font-medium text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warm-100">
                {filtered.map((h) => {
                  const isDanger = h.status === 'danger';
                  return (
                    <tr
                      key={h.id}
                      className={`transition-colors ${
                        isDanger ? 'animate-pulse-danger' : 'hover:bg-warm-50'
                      }`}
                    >
                      <td className="px-5 py-4">
                        <span className="font-semibold text-gray-900">{h.registerCode}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getShiftColor(h.shift)}`}>
                          {getShiftLabel(h.shift)}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-gray-600 text-sm">
                        {formatDateTime(h.handoverTime)}
                      </td>
                      <td className="px-5 py-4 text-gray-700">{h.handoverPerson}</td>
                      <td className="px-5 py-4 text-gray-700">{h.successorPerson}</td>
                      <td className="px-5 py-4 text-right font-medium text-gray-900">
                        {formatCurrency(h.actualAmount)}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span
                          className={`font-semibold ${
                            h.difference > 0
                              ? 'text-emerald-600'
                              : h.difference < 0
                              ? 'text-red-600'
                              : 'text-gray-500'
                          }`}
                        >
                          {h.difference > 0 ? '+' : ''}
                          {formatCurrency(h.difference)}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {h.isOnTime ? (
                          <CheckCircle2 size={18} className="text-green-500" />
                        ) : (
                          <XCircle size={18} className="text-red-500" />
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(h.status)}`}>
                          {getStatusLabel(h.status)}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end">
                          <button
                            onClick={() => navigate(`/handovers/${h.id}`)}
                            className="p-2 rounded-lg text-gray-500 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                          >
                            <Eye size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
