import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Search,
  Eye,
  Package,
  User,
  Clock,
  CheckCircle,
  Wrench,
} from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import StatusBadge from '../components/common/StatusBadge';
import { useAppStore } from '../store/useAppStore';
import { formatDate, getExceptionTypeLabel } from '../utils';
import type { ExceptionStatus, ExceptionSeverity, ExceptionType } from '../types';

export default function ExceptionList() {
  const navigate = useNavigate();
  const { exceptions, loans, devices, customers, resolveException } = useAppStore();
  const [statusFilter, setStatusFilter] = useState<ExceptionStatus | 'all'>('all');
  const [severityFilter, setSeverityFilter] = useState<ExceptionSeverity | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<ExceptionType | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showResolveModal, setShowResolveModal] = useState<string | null>(null);
  const [solution, setSolution] = useState('');

  const exceptionsWithDetails = exceptions.map((exc) => {
    const loan = loans.find((l) => l.id === exc.loanId);
    const device = devices.find((d) => d.id === loan?.deviceId);
    const customer = customers.find((c) => c.id === loan?.customerId);
    return { ...exc, loan, device, customer };
  });

  const filteredExceptions = exceptionsWithDetails.filter((exc) => {
    const matchesStatus = statusFilter === 'all' || exc.status === statusFilter;
    const matchesSeverity = severityFilter === 'all' || exc.severity === severityFilter;
    const matchesType = typeFilter === 'all' || exc.type === typeFilter;
    const matchesSearch =
      exc.device?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exc.customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exc.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSeverity && matchesType && matchesSearch;
  });

  const statusCounts = {
    all: exceptions.length,
    open: exceptions.filter(e => e.status === 'open').length,
    processing: exceptions.filter(e => e.status === 'processing').length,
    resolved: exceptions.filter(e => e.status === 'resolved').length,
  };

  const handleResolve = (id: string) => {
    if (!solution.trim()) {
      alert('请填写解决方案');
      return;
    }
    resolveException(id, solution);
    setShowResolveModal(null);
    setSolution('');
  };

  const getTypeIcon = (type: ExceptionType) => {
    switch (type) {
      case 'accessory_missing':
        return Package;
      case 'damage':
        return AlertTriangle;
      case 'malfunction':
        return Wrench;
      default:
        return AlertTriangle;
    }
  };

  return (
    <PageContainer title="异常管理" subtitle="管理样机异常问题与处理">
      {/* 统计卡片 */}
      <div className="grid grid-cols-5 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">全部异常</p>
              <p className="text-2xl font-bold text-gray-800 font-serif mt-1">{statusCounts.all}</p>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-gray-500" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">待处理</p>
              <p className="text-2xl font-bold text-danger-600 font-serif mt-1">{statusCounts.open}</p>
            </div>
            <div className="w-12 h-12 bg-danger-50 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-danger-500" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">处理中</p>
              <p className="text-2xl font-bold text-warning-600 font-serif mt-1">{statusCounts.processing}</p>
            </div>
            <div className="w-12 h-12 bg-warning-50 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-warning-500" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">已解决</p>
              <p className="text-2xl font-bold text-success-600 font-serif mt-1">{statusCounts.resolved}</p>
            </div>
            <div className="w-12 h-12 bg-success-50 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-success-500" />
            </div>
          </div>
        </div>
        <button
          onClick={() => {
            if (typeFilter === 'accessory_missing') {
              setTypeFilter('all');
            } else {
              setTypeFilter('accessory_missing');
              setStatusFilter('all');
              setSeverityFilter('all');
              setSearchTerm('');
            }
          }}
          className={`rounded-xl shadow-card p-5 transition-all text-left ${
            typeFilter === 'accessory_missing'
              ? 'bg-primary-900 ring-2 ring-primary-400'
              : 'bg-white hover:shadow-card-hover'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${typeFilter === 'accessory_missing' ? 'text-primary-200' : 'text-gray-500'}`}>
                配件缺失
              </p>
              <p className={`text-2xl font-bold font-serif mt-1 ${typeFilter === 'accessory_missing' ? 'text-white' : 'text-primary-700'}`}>
                {exceptions.filter(e => e.type === 'accessory_missing').length}
              </p>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              typeFilter === 'accessory_missing' ? 'bg-primary-700' : 'bg-primary-50'
            }`}>
              <Package className={`w-6 h-6 ${typeFilter === 'accessory_missing' ? 'text-white' : 'text-primary-500'}`} />
            </div>
          </div>
        </button>
      </div>

      {/* 操作栏 */}
      <div className="bg-white rounded-xl shadow-card p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="搜索异常..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-72 pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ExceptionStatus | 'all')}
              className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            >
              <option value="all">全部状态</option>
              <option value="open">待处理</option>
              <option value="processing">处理中</option>
              <option value="resolved">已解决</option>
            </select>

            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value as ExceptionSeverity | 'all')}
              className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            >
              <option value="all">全部严重程度</option>
              <option value="low">轻微</option>
              <option value="medium">一般</option>
              <option value="high">严重</option>
            </select>
          </div>
        </div>
      </div>

      {/* 异常列表 */}
      <div className="space-y-4">
        {filteredExceptions.length === 0 ? (
          <div className="bg-white rounded-xl shadow-card py-16 text-center text-gray-400">
            <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>没有找到匹配的异常记录</p>
          </div>
        ) : (
          filteredExceptions.map((exc) => {
            const TypeIcon = getTypeIcon(exc.type);
            return (
              <div
                key={exc.id}
                className={`bg-white rounded-xl shadow-card p-6 transition-all hover:shadow-card-hover ${
                  exc.status === 'open' ? 'border-l-4 border-danger-500' :
                  exc.status === 'processing' ? 'border-l-4 border-warning-500' :
                  'border-l-4 border-success-500'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        exc.severity === 'high'
                          ? 'bg-danger-50'
                          : exc.severity === 'medium'
                          ? 'bg-orange-50'
                          : 'bg-warning-50'
                      }`}
                    >
                      <TypeIcon
                        className={`w-6 h-6 ${
                          exc.severity === 'high'
                            ? 'text-danger-500'
                            : exc.severity === 'medium'
                            ? 'text-orange-500'
                            : 'text-warning-500'
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-gray-800">
                          {getExceptionTypeLabel(exc.type)}
                        </h4>
                        <StatusBadge status={exc.status} type="exception" />
                        <StatusBadge status={exc.severity} type="severity" />
                      </div>
                      <p className="text-gray-600 text-sm mb-3">{exc.description}</p>
                      <div className="flex items-center gap-6 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Package className="w-3.5 h-3.5" />
                          {exc.device?.name}
                          {exc.device?.deviceNo && (
                            <span className="text-gray-400 ml-0.5">{exc.device.deviceNo}</span>
                          )}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5" />
                          {exc.customer?.name}
                          {exc.customer?.company && (
                            <span className="text-gray-400 ml-0.5">{exc.customer.company}</span>
                          )}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {formatDate(exc.createDate)}
                        </span>
                      </div>
                      {exc.solution && (
                        <div className="mt-3 p-3 bg-success-50 rounded-lg">
                          <p className="text-xs text-success-600 font-medium mb-1">解决方案</p>
                          <p className="text-sm text-success-700">{exc.solution}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/loans/${exc.loanId}`)}
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium inline-flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-primary-50"
                    >
                      <Eye className="w-4 h-4" />
                      查看
                    </button>
                    {exc.status !== 'resolved' && (
                      <button
                        onClick={() => setShowResolveModal(exc.id)}
                        className="text-success-600 hover:text-success-700 text-sm font-medium inline-flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-success-50"
                      >
                        <CheckCircle className="w-4 h-4" />
                        解决
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 解决弹窗 */}
      {showResolveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md animate-fadeIn">
            <h3 className="text-xl font-bold text-gray-800 mb-4">标记已解决</h3>
            <div>
              <label className="label-base">解决方案 <span className="text-danger-500">*</span></label>
              <textarea
                value={solution}
                onChange={(e) => setSolution(e.target.value)}
                placeholder="请描述解决方案..."
                rows={4}
                className="input-base resize-none"
              />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowResolveModal(null)}
                className="btn-secondary"
              >
                取消
              </button>
              <button
                onClick={() => handleResolve(showResolveModal)}
                className="btn-primary flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                确认解决
              </button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
