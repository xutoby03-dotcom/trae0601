import React, { useState } from 'react';
import { AlertTriangle, Plus, Search, Filter, MapPin, Clock, User, Camera, Check, X, Trash2, Wrench, TrendingUp } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { StatusBadge } from '../../components/StatusBadge';
import { CapacityProgress } from '../../components/CapacityProgress';
import { ExceptionForm } from './Form';
import { useExceptionsStore } from '../../store/exceptions';
import { useRecoveryPointsStore } from '../../store/recoveryPoints';
import { useCollectionRecordsStore } from '../../store/collectionRecords';
import { formatDate, getExceptionTypeText, getSeverityText, getSeverityColor } from '../../utils/formatters';
import { calculateCapacityRatio } from '../../utils/calculations';
import type { Exception, ExceptionType } from '../../types';
import { Modal } from '../../components/Modal';

type TabType = 'pending' | 'full' | 'history';

export const ExceptionsList: React.FC = () => {
  const { exceptions, handleException, resolveException, deleteException } = useExceptionsStore();
  const { recoveryPoints, collectPoint } = useRecoveryPointsStore();
  const { addCollectionRecord } = useCollectionRecordsStore();

  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedException, setSelectedException] = useState<Exception | null>(null);
  const [handler, setHandler] = useState('');
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');

  const getRecoveryPointName = (id: string) => {
    return recoveryPoints.find(p => p.id === id)?.name || '未知回收点';
  };

  const fullPoints = recoveryPoints.filter(p => p.status === 'full' || p.status === 'warning');
  const pendingExceptions = exceptions.filter(e => e.status !== 'resolved');
  const resolvedExceptions = exceptions.filter(e => e.status === 'resolved');

  const filterExceptions = (list: Exception[]) => {
    return list.filter(e => {
      const pointName = getRecoveryPointName(e.recoveryPointId);
      const matchesSearch = pointName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.handler && e.handler.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesType = typeFilter === 'all' || e.type === typeFilter;
      const matchesSeverity = severityFilter === 'all' || e.severity === severityFilter;
      return matchesSearch && matchesType && matchesSeverity;
    });
  };

  const filteredPending = filterExceptions(pendingExceptions);
  const filteredResolved = filterExceptions(resolvedExceptions);

  const sortedPending = [...filteredPending].sort((a, b) => {
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
    if (severityDiff !== 0) return severityDiff;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const sortedResolved = [...filteredResolved].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const sortedFullPoints = [...fullPoints].sort((a, b) => {
    const ratioA = calculateCapacityRatio(a);
    const ratioB = calculateCapacityRatio(b);
    return ratioB - ratioA;
  });

  const handleViewDetail = (exception: Exception) => {
    setSelectedException(exception);
    setIsDetailOpen(true);
  };

  const handleStartHandling = (exception: Exception) => {
    const handlerName = prompt('请输入处理人员姓名：');
    if (handlerName && handlerName.trim()) {
      handleException(exception.id, handlerName.trim());
    }
  };

  const openResolveModal = (exception: Exception) => {
    setSelectedException(exception);
    setHandler(exception.handler || '');
    setIsResolveModalOpen(true);
  };

  const handleResolve = () => {
    if (!selectedException) return;
    if (!handler.trim()) {
      alert('请输入处理人员姓名');
      return;
    }
    resolveException(selectedException.id, handler.trim());
    setIsResolveModalOpen(false);
    setSelectedException(null);
    setHandler('');
  };

  const handleCollection = (pointId: string) => {
    if (confirm('确定要标记该回收点已清运吗？清运后回收箱重量将清零。')) {
      const result = collectPoint(pointId);
      if (result) {
        addCollectionRecord({
          recoveryPointId: pointId,
          weightKg: result.weightKg,
          collector: '系统清运',
          status: 'completed',
          collectionTime: new Date().toISOString(),
        });
      }
    }
  };

  const handleQuickReport = (type: ExceptionType, recoveryPointId?: string) => {
    setIsFormOpen(true);
  };

  const tabs = [
    { value: 'pending' as TabType, label: '待处理异常', count: pendingExceptions.length },
    { value: 'full' as TabType, label: '满箱提醒', count: fullPoints.length },
    { value: 'history' as TabType, label: '历史记录', count: resolvedExceptions.length },
  ];

  const typeFilters = [
    { value: 'all', label: '全部类型' },
    { value: 'full', label: '满箱' },
    { value: 'moisture', label: '潮湿' },
    { value: 'odor', label: '异味' },
    { value: 'damage', label: '损坏' },
  ];

  const severityFilters = [
    { value: 'all', label: '全部级别' },
    { value: 'critical', label: '紧急' },
    { value: 'high', label: '高' },
    { value: 'medium', label: '中' },
    { value: 'low', label: '低' },
  ];

  const typeIcons: Record<string, React.ReactNode> = {
    full: <TrendingUp className="w-4 h-4" />,
    moisture: <Wrench className="w-4 h-4" />,
    odor: <AlertTriangle className="w-4 h-4" />,
    damage: <Wrench className="w-4 h-4" />,
  };

  return (
    <div>
      <PageHeader
        title="异常管理"
        description="处理满箱提醒和异常情况"
        icon={AlertTriangle}
        actions={
          <button
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-medium rounded-xl hover:from-orange-600 hover:to-red-600 transition-all shadow-lg shadow-orange-200"
          >
            <Plus className="w-4 h-4" />
            上报异常
          </button>
        }
      />

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">待处理异常</p>
          <p className="text-2xl font-bold text-red-600">{pendingExceptions.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">需清运回收点</p>
          <p className="text-2xl font-bold text-orange-600">{fullPoints.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">紧急异常</p>
          <p className="text-2xl font-bold text-red-600">
            {pendingExceptions.filter(e => e.severity === 'critical').length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">已处理异常</p>
          <p className="text-2xl font-bold text-green-600">{resolvedExceptions.length}</p>
        </div>
      </div>

      {/* 筛选和搜索 */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6 flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="搜索回收点、描述、处理人员..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
          />
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {typeFilters.map(f => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </div>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {severityFilters.map(f => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 标签页 */}
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-xl p-1 w-fit">
        {tabs.map(tab => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.value
                ? 'bg-white text-orange-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === tab.value ? 'bg-orange-100 text-orange-600' : 'bg-gray-200 text-gray-600'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* 待处理异常 */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          {sortedPending.map((exception, index) => (
            <div
              key={exception.id}
              className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all animate-fade-in-up"
              style={{ animationDelay: `${index * 30}ms` }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className={`p-3 rounded-xl ${
                    exception.severity === 'critical' ? 'bg-red-100 animate-pulse' :
                    exception.severity === 'high' ? 'bg-orange-100' :
                    exception.severity === 'medium' ? 'bg-yellow-100' : 'bg-gray-100'
                  }`}>
                    <AlertTriangle className={`w-6 h-6 ${
                      exception.severity === 'critical' ? 'text-red-600' :
                      exception.severity === 'high' ? 'text-orange-600' :
                      exception.severity === 'medium' ? 'text-yellow-600' : 'text-gray-600'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full ${getSeverityColor(exception.severity)}`}>
                        {getSeverityText(exception.severity)}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full">
                        {typeIcons[exception.type]}
                        {getExceptionTypeText(exception.type)}
                      </span>
                      <StatusBadge status={exception.status} />
                    </div>
                    <h4 className="font-medium text-gray-900 mb-1">
                      {getRecoveryPointName(exception.recoveryPointId)}
                    </h4>
                    <p className="text-sm text-gray-600 mb-3">{exception.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {recoveryPoints.find(p => p.id === exception.recoveryPointId)?.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(exception.createdAt)}
                      </div>
                      {exception.handler && (
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          处理人：{exception.handler}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handleViewDetail(exception)}
                    className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                    title="查看详情"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                  {exception.status === 'pending' && (
                    <button
                      onClick={() => handleStartHandling(exception)}
                      className="px-3 py-1.5 bg-blue-100 text-blue-700 text-sm rounded-lg hover:bg-blue-200 transition-colors font-medium"
                    >
                      开始处理
                    </button>
                  )}
                  {exception.status === 'handling' && (
                    <button
                      onClick={() => openResolveModal(exception)}
                      className="px-3 py-1.5 bg-green-100 text-green-700 text-sm rounded-lg hover:bg-green-200 transition-colors font-medium"
                    >
                      标记解决
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (confirm('确定要删除这条异常记录吗？')) {
                        deleteException(exception.id);
                      }
                    }}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {sortedPending.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <Check className="w-16 h-16 text-green-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">暂无待处理异常</p>
              <p className="text-gray-400 text-sm mt-2">所有异常已处理完毕</p>
            </div>
          )}
        </div>
      )}

      {/* 满箱提醒 */}
      {activeTab === 'full' && (
        <div className="space-y-4">
          {sortedFullPoints.map((point, index) => {
            const ratio = calculateCapacityRatio(point);
            return (
              <div
                key={point.id}
                className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all animate-fade-in-up"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`p-3 rounded-xl ${
                      ratio >= 0.9 ? 'bg-red-100 animate-breathe' : 'bg-orange-100'
                    }`}>
                      <TrendingUp className={`w-6 h-6 ${
                        ratio >= 0.9 ? 'text-red-600' : 'text-orange-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 text-xs rounded-full ${
                          ratio >= 0.9 ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                        }`}>
                          {ratio >= 0.9 ? '已满' : '即将满'}
                        </span>
                        <StatusBadge status={point.status} />
                      </div>
                      <h4 className="font-medium text-gray-900 mb-1">{point.name}</h4>
                      <p className="text-sm text-gray-600 mb-3">{point.location}</p>
                      
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-500">容量</span>
                          <span className="font-medium text-gray-900">
                            {point.currentKg.toFixed(1)} / {point.capacityKg} kg
                          </span>
                        </div>
                        <CapacityProgress ratio={ratio} />
                      </div>

                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {point.manager} · {point.phone}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          清运时间：{point.collectionSchedule}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 ml-4">
                    <button
                      onClick={() => handleCollection(point.id)}
                      className="px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all font-medium shadow-md shadow-primary-200"
                    >
                      标记已清运
                    </button>
                    <button
                      onClick={() => handleQuickReport('full', point.id)}
                      className="px-4 py-2 bg-orange-100 text-orange-700 text-sm rounded-lg hover:bg-orange-200 transition-colors font-medium"
                    >
                      上报异常
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {sortedFullPoints.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <Check className="w-16 h-16 text-green-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">所有回收点容量正常</p>
              <p className="text-gray-400 text-sm mt-2">暂无需要清运的回收点</p>
            </div>
          )}
        </div>
      )}

      {/* 历史记录 */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    回收点
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    异常类型
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    严重程度
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    描述
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    处理人
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    处理时间
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sortedResolved.map((exception, index) => (
                  <tr
                    key={exception.id}
                    className="hover:bg-gray-50 transition-colors animate-fade-in-up"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-900">
                          {getRecoveryPointName(exception.recoveryPointId)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full">
                        {getExceptionTypeText(exception.type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 text-xs rounded-full ${getSeverityColor(exception.severity)}`}>
                        {getSeverityText(exception.severity)}
                      </span>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <p className="text-sm text-gray-600 truncate">{exception.description}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900">{exception.handler || '-'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-500 text-sm">
                          {exception.handledAt ? formatDate(exception.handledAt) : '-'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewDetail(exception)}
                          className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <Camera className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('确定要删除这条异常记录吗？')) {
                              deleteException(exception.id);
                            }
                          }}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {sortedResolved.length === 0 && (
            <div className="text-center py-16">
              <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">暂无历史记录</p>
              <p className="text-gray-400 text-sm mt-2">已处理的异常将显示在这里</p>
            </div>
          )}
        </div>
      )}

      {/* 异常表单弹窗 */}
      <ExceptionForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
      />

      {/* 异常详情弹窗 */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedException(null);
        }}
        size="md"
      >
        {selectedException && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">异常详情</h3>
              <button
                onClick={() => {
                  setIsDetailOpen(false);
                  setSelectedException(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 text-xs rounded-full ${getSeverityColor(selectedException.severity)}`}>
                  {getSeverityText(selectedException.severity)}
                </span>
                <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full">
                  {getExceptionTypeText(selectedException.type)}
                </span>
                <StatusBadge status={selectedException.status} />
              </div>

              <div>
                <label className="text-sm text-gray-500">回收点</label>
                <p className="font-medium text-gray-900">{getRecoveryPointName(selectedException.recoveryPointId)}</p>
              </div>

              <div>
                <label className="text-sm text-gray-500">位置</label>
                <p className="text-gray-900">
                  {recoveryPoints.find(p => p.id === selectedException.recoveryPointId)?.location}
                </p>
              </div>

              <div>
                <label className="text-sm text-gray-500">异常描述</label>
                <p className="text-gray-900 bg-gray-50 rounded-lg p-3">{selectedException.description}</p>
              </div>

              {selectedException.photoUrl && (
                <div>
                  <label className="text-sm text-gray-500 mb-2 block">异常照片</label>
                  <img
                    src={selectedException.photoUrl}
                    alt="异常照片"
                    className="w-full h-48 object-cover rounded-xl border border-gray-200"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500">上报时间</label>
                  <p className="text-gray-900">{formatDate(selectedException.createdAt)}</p>
                </div>
                {selectedException.handler && (
                  <div>
                    <label className="text-sm text-gray-500">处理人员</label>
                    <p className="text-gray-900">{selectedException.handler}</p>
                  </div>
                )}
                {selectedException.handledAt && (
                  <div>
                    <label className="text-sm text-gray-500">处理时间</label>
                    <p className="text-gray-900">{formatDate(selectedException.handledAt)}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* 解决异常弹窗 */}
      <Modal
        isOpen={isResolveModalOpen}
        onClose={() => {
          setIsResolveModalOpen(false);
          setSelectedException(null);
          setHandler('');
        }}
        size="sm"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">标记已解决</h3>
          <button
            onClick={() => {
              setIsResolveModalOpen(false);
              setSelectedException(null);
              setHandler('');
            }}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">处理人员</label>
            <input
              type="text"
              value={handler}
              onChange={(e) => setHandler(e.target.value)}
              placeholder="请输入处理人员姓名"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setIsResolveModalOpen(false);
                setSelectedException(null);
                setHandler('');
              }}
              className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleResolve}
              className="flex-1 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-medium hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg shadow-green-200"
            >
              确认解决
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
