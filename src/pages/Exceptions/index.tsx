import { useEffect, useState } from 'react';
import { AlertTriangle, Clock, CheckCircle, ArrowUpRight, X, Save, Phone, Home, Users, Heart, TrendingUp } from 'lucide-react';
import { useElderlyStore } from '@/store/elderlyStore';
import { useExceptionStore } from '@/store/exceptionStore';
import { ExceptionRecord, ExceptionStatus } from '@/types';
import { formatDateTime } from '@/utils/date';
import StatusBadge from '@/components/StatusBadge';
import { mockGrids } from '@/data/grids';

export default function ExceptionsPage() {
  const { elderlyList, initElderly } = useElderlyStore();
  const { exceptions, initExceptions, updateException, escalateException, resolveException, createException } = useExceptionStore();
  const [statusFilter, setStatusFilter] = useState<ExceptionStatus | 'all'>('all');
  const [gridFilter, setGridFilter] = useState('all');
  const [selectedException, setSelectedException] = useState<ExceptionRecord | null>(null);
  const [showHandleModal, setShowHandleModal] = useState(false);
  const [formData, setFormData] = useState({
    knockResult: '',
    contactedFamily: false,
    needMedical: false,
    handlingNotes: '',
  });
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    initElderly();
    initExceptions();
  }, [initElderly, initExceptions]);

  const getElderlyById = (id: string) => elderlyList.find(e => e.id === id);

  const filteredExceptions = exceptions.filter(e => {
    const matchesStatus = statusFilter === 'all' || e.status === statusFilter;
    const elderly = getElderlyById(e.elderlyId);
    const matchesGrid = gridFilter === 'all' || elderly?.gridId === gridFilter;
    return matchesStatus && matchesGrid;
  }).sort((a, b) => {
    const statusOrder = { escalated: 0, processing: 1, pending: 2, resolved: 3 };
    return statusOrder[a.status] - statusOrder[b.status];
  });

  const stats = {
    total: exceptions.length,
    pending: exceptions.filter(e => e.status === 'pending').length,
    processing: exceptions.filter(e => e.status === 'processing').length,
    escalated: exceptions.filter(e => e.status === 'escalated' && e.type === 'timeout').length,
    resolved: exceptions.filter(e => e.status === 'resolved').length,
  };

  const handleOpenHandle = (exception: ExceptionRecord) => {
    setSelectedException(exception);
    setFormData({
      knockResult: exception.knockResult || '',
      contactedFamily: exception.contactedFamily || false,
      needMedical: exception.needMedical || false,
      handlingNotes: exception.handlingNotes || '',
    });
    setShowHandleModal(true);
    
    if (exception.status === 'pending') {
      updateException(exception.id, {
        status: 'processing',
        firstReminderTime: formatDateTime(new Date()),
      });
      setRefreshKey(prev => prev + 1);
    }
  };

  const handleEscalate = (exception: ExceptionRecord) => {
    if (confirm('确定要将此异常升级给社区负责人吗？')) {
      escalateException(exception.id);
      setRefreshKey(prev => prev + 1);
    }
  };

  const handleResolve = () => {
    if (!selectedException) return;
    if (!formData.knockResult) {
      alert('请填写敲门结果');
      return;
    }
    
    resolveException(selectedException.id, {
      knockResult: formData.knockResult,
      contactedFamily: formData.contactedFamily,
      needMedical: formData.needMedical,
      handlingNotes: formData.handlingNotes,
    });
    setShowHandleModal(false);
    setRefreshKey(prev => prev + 1);
  };

  const handleSaveProgress = () => {
    if (!selectedException) return;
    updateException(selectedException.id, {
      knockResult: formData.knockResult || null,
      contactedFamily: formData.contactedFamily,
      needMedical: formData.needMedical,
      handlingNotes: formData.handlingNotes,
    });
    setRefreshKey(prev => prev + 1);
    alert('处理进度已保存');
  };

  const getTimeline = (exception: ExceptionRecord) => {
    const items = [
      { time: exception.exceptionDate, label: '异常创建', status: 'done' },
    ];
    if (exception.firstReminderTime) {
      items.push({ time: exception.firstReminderTime, label: '已提醒网格员', status: 'done' });
    }
    if (exception.status !== 'pending') {
      items.push({ time: exception.firstReminderTime || formatDateTime(new Date()), label: '处理中', status: exception.status === 'processing' || exception.status === 'escalated' || exception.status === 'resolved' ? 'done' : 'current' });
    }
    if (exception.escalationTime) {
      items.push({ time: exception.escalationTime, label: '已升级给社区负责人', status: 'done' });
    }
    if (exception.resolvedTime) {
      items.push({ time: exception.resolvedTime, label: '已解决', status: 'done' });
    }
    return items;
  };

  return (
    <div className="space-y-6" key={refreshKey}>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200">
          <p className="text-sm text-slate-500 mb-1">异常总数</p>
          <p className="text-3xl font-bold text-slate-700">{stats.total}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-200">
          <p className="text-sm text-slate-500 mb-1">待处理</p>
          <p className="text-3xl font-bold text-orange-600">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-200">
          <p className="text-sm text-slate-500 mb-1">处理中</p>
          <p className="text-3xl font-bold text-blue-600">{stats.processing}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-200">
          <p className="text-sm text-slate-500 mb-1">已升级</p>
          <p className="text-3xl font-bold text-red-600">{stats.escalated}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-200">
          <p className="text-sm text-slate-500 mb-1">已解决</p>
          <p className="text-3xl font-bold text-green-600">{stats.resolved}</p>
        </div>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-white border border-slate-300 rounded-xl p-1">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                statusFilter === 'all' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              全部
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                statusFilter === 'pending' ? 'bg-orange-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              待处理
            </button>
            <button
              onClick={() => setStatusFilter('processing')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                statusFilter === 'processing' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              处理中
            </button>
            <button
              onClick={() => setStatusFilter('escalated')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                statusFilter === 'escalated' ? 'bg-red-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              已升级
            </button>
            <button
              onClick={() => setStatusFilter('resolved')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                statusFilter === 'resolved' ? 'bg-green-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              已解决
            </button>
          </div>
          <select
            value={gridFilter}
            onChange={(e) => setGridFilter(e.target.value)}
            className="px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
          >
            <option value="all">全部网格</option>
            {mockGrids.map(grid => (
              <option key={grid.id} value={grid.id}>{grid.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {filteredExceptions.map((exception, index) => {
          const elderly = getElderlyById(exception.elderlyId);
          if (!elderly) return null;
          const timeline = getTimeline(exception);
          
          return (
            <div
              key={exception.id}
              className={`bg-white rounded-2xl p-6 border transition-all duration-300 ${
                exception.status === 'escalated' 
                  ? 'border-red-300 ring-2 ring-red-100' 
                  : 'border-slate-200 hover:shadow-md'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className={`p-3 rounded-xl ${
                    exception.status === 'escalated' ? 'bg-red-100' :
                    exception.status === 'resolved' ? 'bg-green-100' :
                    exception.status === 'processing' ? 'bg-blue-100' : 'bg-orange-100'
                  }`}>
                    <AlertTriangle size={28} className={
                      exception.status === 'escalated' ? 'text-red-600' :
                      exception.status === 'resolved' ? 'text-green-600' :
                      exception.status === 'processing' ? 'text-blue-600' : 'text-orange-600'
                    } />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-3xl">{elderly.avatar}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-slate-800 text-lg">{elderly.name}</h4>
                          <StatusBadge status={exception.status} />
                        </div>
                        <p className="text-sm text-slate-500">
                          {elderly.building} {elderly.unit} {elderly.roomNumber} · {elderly.age}岁
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      <div className="bg-slate-50 rounded-xl p-3">
                        <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                          <Heart size={14} />
                          慢病备注
                        </div>
                        <p className="text-sm text-slate-700">{elderly.chronicDiseases || '无'}</p>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-3">
                        <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                          <Phone size={14} />
                          紧急联系人
                        </div>
                        <p className="text-sm text-slate-700">{elderly.emergencyContactName}</p>
                        <p className="text-xs text-slate-500 font-mono">{elderly.emergencyContactPhone}</p>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-3">
                        <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                          <Clock size={14} />
                          异常时间
                        </div>
                        <p className="text-sm text-slate-700">{exception.exceptionDate}</p>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-3">
                        <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                          <Home size={14} />
                          所属网格
                        </div>
                        <p className="text-sm text-slate-700">{mockGrids.find(g => g.id === elderly.gridId)?.name}</p>
                      </div>
                    </div>

                    {exception.handlingNotes && (
                      <div className="mt-4 bg-blue-50 rounded-xl p-4">
                        <p className="text-sm text-blue-800">
                          <span className="font-medium">处理备注：</span>{exception.handlingNotes}
                        </p>
                      </div>
                    )}

                    <div className="mt-4">
                      <p className="text-sm text-slate-500 mb-2">处理进度</p>
                      <div className="flex items-start gap-4">
                        {timeline.map((item, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${
                              item.status === 'done' ? 'bg-green-500' : 'bg-blue-500 animate-pulse'
                            }`} />
                            <div>
                              <p className="text-sm font-medium text-slate-700">{item.label}</p>
                              <p className="text-xs text-slate-400">{item.time}</p>
                            </div>
                            {i < timeline.length - 1 && (
                              <div className="w-8 h-0.5 bg-slate-200 mx-2" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  {exception.status !== 'resolved' && (
                    <button
                      onClick={() => handleOpenHandle(exception)}
                      className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      处理异常
                    </button>
                  )}
                  {exception.status === 'processing' && !exception.escalationTime && (
                    <button
                      onClick={() => handleEscalate(exception)}
                      className="px-5 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors flex items-center gap-2"
                    >
                      <ArrowUpRight size={16} />
                      升级告警
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filteredExceptions.length === 0 && (
          <div className="bg-white rounded-2xl p-16 text-center border border-slate-200">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={40} className="text-green-500" />
            </div>
            <h4 className="text-xl font-semibold text-slate-800 mb-2">暂无异常记录</h4>
            <p className="text-slate-500">当前筛选条件下没有异常记录</p>
          </div>
        )}
      </div>

      {showHandleModal && selectedException && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div 
            className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-slate-200 sticky top-0 bg-white z-10">
              <div>
                <h3 className="text-xl font-semibold text-slate-800">异常处置</h3>
                <p className="text-sm text-slate-500">
                  {getElderlyById(selectedException.elderlyId)?.name} · 
                  {getElderlyById(selectedException.elderlyId)?.building} 
                  {getElderlyById(selectedException.elderlyId)?.unit} 
                  {getElderlyById(selectedException.elderlyId)?.roomNumber}
                </p>
              </div>
              <button
                onClick={() => setShowHandleModal(false)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={22} className="text-slate-500" />
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                <div className="flex items-center gap-2 text-orange-700">
                  <AlertTriangle size={20} />
                  <span className="font-medium">处置须知</span>
                </div>
                <ul className="mt-2 text-sm text-orange-600 space-y-1">
                  <li>• 请先尝试电话联系老人</li>
                  <li>• 如无人接听，请上门查看</li>
                  <li>• 记录敲门结果和现场情况</li>
                  <li>• 必要时联系家属或呼叫120</li>
                </ul>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <Home size={16} className="inline mr-1" />
                  敲门结果 *
                </label>
                <select
                  value={formData.knockResult}
                  onChange={(e) => setFormData({ ...formData, knockResult: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                >
                  <option value="">请选择敲门结果</option>
                  <option value="开门，老人状态良好">开门，老人状态良好</option>
                  <option value="开门，老人身体不适">开门，老人身体不适</option>
                  <option value="开门，老人需送医">开门，老人需送医</option>
                  <option value="无人应答，已联系邻居">无人应答，已联系邻居</option>
                  <option value="无人应答，已联系家属">无人应答，已联系家属</option>
                  <option value="电话联系上，手机静音">电话联系上，手机静音</option>
                  <option value="电话联系上，外出未归">电话联系上，外出未归</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <Users size={16} className="inline mr-1" />
                    是否联系家属
                  </label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setFormData({ ...formData, contactedFamily: true })}
                      className={`flex-1 px-4 py-2.5 rounded-xl border-2 font-medium transition-all ${
                        formData.contactedFamily
                          ? 'bg-green-50 border-green-500 text-green-700'
                          : 'bg-white border-slate-300 text-slate-600 hover:border-slate-400'
                      }`}
                    >
                      已联系
                    </button>
                    <button
                      onClick={() => setFormData({ ...formData, contactedFamily: false })}
                      className={`flex-1 px-4 py-2.5 rounded-xl border-2 font-medium transition-all ${
                        !formData.contactedFamily
                          ? 'bg-slate-100 border-slate-500 text-slate-700'
                          : 'bg-white border-slate-300 text-slate-600 hover:border-slate-400'
                      }`}
                    >
                      未联系
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <TrendingUp size={16} className="inline mr-1" />
                    是否需要送医
                  </label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setFormData({ ...formData, needMedical: true })}
                      className={`flex-1 px-4 py-2.5 rounded-xl border-2 font-medium transition-all ${
                        formData.needMedical
                          ? 'bg-red-50 border-red-500 text-red-700'
                          : 'bg-white border-slate-300 text-slate-600 hover:border-slate-400'
                      }`}
                    >
                      需要
                    </button>
                    <button
                      onClick={() => setFormData({ ...formData, needMedical: false })}
                      className={`flex-1 px-4 py-2.5 rounded-xl border-2 font-medium transition-all ${
                        !formData.needMedical
                          ? 'bg-green-50 border-green-500 text-green-700'
                          : 'bg-white border-slate-300 text-slate-600 hover:border-slate-400'
                      }`}
                    >
                      不需要
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  处置详情
                </label>
                <textarea
                  value={formData.handlingNotes}
                  onChange={(e) => setFormData({ ...formData, handlingNotes: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  rows={4}
                  placeholder="请详细记录处置过程、老人状态、家属反馈等信息..."
                />
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t border-slate-200 sticky bottom-0 bg-white">
              <button
                onClick={handleSaveProgress}
                className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
              >
                保存进度
              </button>
              <button
                onClick={handleResolve}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <Save size={18} />
                完成处置
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
