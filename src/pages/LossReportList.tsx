import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, FileText, User, Clock, ChevronRight } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import StatusBadge from '@/components/StatusBadge';
import { useFreezerStore } from '@/store/freezerStore';
import { useLossReportStore } from '@/store/lossReportStore';
import { formatDateTime, formatCurrency } from '@/utils/format';

export default function LossReportList() {
  const navigate = useNavigate();
  const { freezers } = useFreezerStore();
  const { lossReports } = useLossReportStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const getFreezerName = (freezerId: string) => {
    return freezers.find((f) => f.id === freezerId)?.name || '未知冷柜';
  };

  const filteredReports = lossReports.filter((r) => {
    const freezerName = getFreezerName(r.freezerId);
    const matchSearch =
      freezerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.submitter.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchType = typeFilter === 'all' || r.type === typeFilter;
    return matchSearch && matchStatus && matchType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'border-l-emerald-500';
      case 'pending':
        return 'border-l-amber-500';
      case 'rejected':
        return 'border-l-red-500';
      default:
        return 'border-l-slate-300';
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="报损管理"
        description="管理雪糕化冻报损和隔离单据，审核处理异常商品"
      />

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="搜索冷柜名称、提交人..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {['all', 'pending', 'approved', 'rejected'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  statusFilter === status
                    ? 'bg-sky-100 text-sky-700'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {status === 'all'
                  ? '全部状态'
                  : status === 'pending'
                  ? '待审核'
                  : status === 'approved'
                  ? '已通过'
                  : '已驳回'}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            {['all', 'loss', 'isolate'].map((type) => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  typeFilter === type
                    ? 'bg-sky-100 text-sky-700'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {type === 'all' ? '全部类型' : type === 'loss' ? '报损' : '隔离'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {filteredReports.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center">
            <div className="w-16 h-16 mx-auto bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-500">没有找到符合条件的报损单</p>
          </div>
        ) : (
          filteredReports.map((report) => (
            <div
              key={report.id}
              onClick={() => navigate(`/loss-reports/${report.id}`)}
              className={`bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-all cursor-pointer border-l-4 ${getStatusColor(
                report.status
              )}`}
            >
              <div className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <FileText className="w-6 h-6 text-sky-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-slate-900">
                          {getFreezerName(report.freezerId)}
                        </h3>
                        <StatusBadge type="lossType" status={report.type} />
                        <StatusBadge type="loss" status={report.status} />
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          提交人: {report.submitter}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {formatDateTime(report.createdAt)}
                        </span>
                        <span>共 {report.items.length} 种商品</span>
                      </div>
                      {report.reviewNotes && (
                        <p className="text-sm text-slate-500 mt-2 line-clamp-1">
                          审核意见: {report.reviewNotes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-slate-500">
                        {report.type === 'loss' ? '报损金额' : '隔离货值'}
                      </p>
                      <p
                        className={`text-2xl font-bold ${
                          report.status === 'approved' ? 'text-red-600' : 'text-slate-900'
                        }`}
                      >
                        {formatCurrency(report.totalAmount)}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
