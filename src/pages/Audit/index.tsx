import { useState, useMemo } from 'react';
import {
  Check,
  X,
  Eye,
  Clock,
  User,
  Phone,
  MapPin,
  Hash,
  Star,
  FileText,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Search,
} from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import Empty from '../../components/Empty';
import { useApplicationStore } from '../../store/useApplicationStore';
import { usePosterStore } from '../../store/usePosterStore';
import { useBulletinBoardStore } from '../../store/useBulletinBoardStore';
import { usePostingStore } from '../../store/usePostingStore';
import { formatDate } from '../../utils/date';
import type { Application } from '../../types';

type TabType = 'pending' | 'history';

export default function Audit() {
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const applications = useApplicationStore((state) => state.applications);
  const approveApplication = useApplicationStore((state) => state.approveApplication);
  const rejectApplication = useApplicationStore((state) => state.rejectApplication);

  const posters = usePosterStore((state) => state.posters);
  const updatePosterStatus = usePosterStore((state) => state.updateStatus);

  const bulletinBoards = useBulletinBoardStore((state) => state.bulletinBoards);
  const updateOccupiedSlots = useBulletinBoardStore((state) => state.updateOccupiedSlots);

  const addPostingItem = usePostingStore((state) => state.addPostingItem);

  const pendingApplications = useMemo(
    () => applications.filter((a) => a.status === 'pending'),
    [applications]
  );

  const auditedApplications = useMemo(
    () => applications.filter((a) => a.status === 'approved' || a.status === 'rejected'),
    [applications]
  );

  const displayApplications = useMemo(() => {
    const list = activeTab === 'pending' ? pendingApplications : auditedApplications;
    if (!searchTerm) return list;

    const searchLower = searchTerm.toLowerCase();
    return list.filter((app) => {
      const poster = posters.find((p) => p.id === app.posterId);
      const board = bulletinBoards.find((b) => b.id === app.bulletinBoardId);
      return (
        app.applicant.toLowerCase().includes(searchLower) ||
        app.contact.includes(searchTerm) ||
        poster?.activityName.toLowerCase().includes(searchLower) ||
        poster?.club.toLowerCase().includes(searchLower) ||
        board?.name.toLowerCase().includes(searchLower)
      );
    });
  }, [activeTab, pendingApplications, auditedApplications, searchTerm, posters, bulletinBoards]);

  const getPosterById = (id: string) => posters.find((p) => p.id === id);
  const getBoardById = (id: string) => bulletinBoards.find((b) => b.id === id);

  const handleViewDetail = (application: Application) => {
    setSelectedApplication(application);
    setShowDetailModal(true);
  };

  const handleApprove = async (application: Application) => {
    if (!confirm('确定要通过这个申请吗？')) return;

    setIsProcessing(true);
    try {
      approveApplication(application.id);
      updatePosterStatus(application.posterId, 'posting');
      addPostingItem({
        applicationId: application.id,
        bulletinBoardId: application.bulletinBoardId,
        quantity: application.quantity,
        needTop: application.needTop,
      });
      updateOccupiedSlots(application.bulletinBoardId, application.quantity);
      setShowDetailModal(false);
      setSelectedApplication(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectClick = (application: Application) => {
    setSelectedApplication(application);
    setRejectReason('');
    setShowRejectModal(true);
  };

  const handleRejectConfirm = async () => {
    if (!selectedApplication || !rejectReason.trim()) {
      alert('请填写驳回原因');
      return;
    }

    setIsProcessing(true);
    try {
      rejectApplication(selectedApplication.id, rejectReason.trim());
      updatePosterStatus(selectedApplication.posterId, 'rejected');
      setShowRejectModal(false);
      setShowDetailModal(false);
      setSelectedApplication(null);
      setRejectReason('');
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const renderApplicationCard = (application: Application, index: number) => {
    const poster = getPosterById(application.posterId);
    const board = getBoardById(application.bulletinBoardId);
    const isExpanded = expandedId === application.id;

    if (!poster || !board) return null;

    return (
      <div
        key={application.id}
        className="bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden animate-scale-in"
        style={{ animationDelay: `${index * 0.05}s` }}
      >
        <div className="p-5">
          <div className="flex items-start gap-4">
            <div className="relative w-20 h-28 flex-shrink-0 rounded-lg overflow-hidden shadow-md">
              <img
                src={poster.imageUrl}
                alt={poster.activityName}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-bold text-gray-900 truncate">{poster.activityName}</h3>
                <StatusBadge status={application.status} type="application" />
              </div>
              <p className="text-sm text-gray-500 mb-3">{poster.club}</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-1.5 text-gray-600">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="truncate">{application.applicant}</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-600">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="truncate">{application.contact}</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-600">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="truncate">{board.name}</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-600">
                  <Hash className="w-4 h-4 text-gray-400" />
                  <span>{application.quantity} 张</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Clock className="w-3.5 h-3.5" />
              <span>{formatDate(application.createdAt)}</span>
            </div>
            <div className="flex items-center gap-2">
              {application.status === 'pending' && (
                <>
                  <button
                    onClick={() => handleRejectClick(application)}
                    disabled={isProcessing}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <X className="w-4 h-4" />
                    驳回
                  </button>
                  <button
                    onClick={() => handleApprove(application)}
                    disabled={isProcessing}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" />
                    通过
                  </button>
                </>
              )}
              <button
                onClick={() => handleViewDetail(application)}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors"
              >
                <Eye className="w-4 h-4" />
                详情
              </button>
              <button
                onClick={() => toggleExpand(application.id)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {isExpanded && (
            <div className="mt-4 pt-4 border-t border-gray-100 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400 mb-1">审批编号</p>
                  <p className="text-gray-700 font-mono">{poster.approvalNumber}</p>
                </div>
                <div>
                  <p className="text-gray-400 mb-1">海报尺寸</p>
                  <p className="text-gray-700">{poster.size}</p>
                </div>
                <div>
                  <p className="text-gray-400 mb-1">张贴区域</p>
                  <p className="text-gray-700">{poster.area}</p>
                </div>
                <div>
                  <p className="text-gray-400 mb-1">是否置顶</p>
                  <p className="text-gray-700 flex items-center gap-1">
                    {application.needTop ? (
                      <>
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        是
                      </>
                    ) : (
                      '否'
                    )}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-gray-400 mb-1">有效期</p>
                  <p className="text-gray-700">
                    {formatDate(poster.startDate)} 至 {formatDate(poster.endDate)}
                  </p>
                </div>
                {application.rejectReason && (
                  <div className="md:col-span-2">
                    <p className="text-gray-400 mb-1">驳回原因</p>
                    <p className="text-gray-700 bg-red-50 p-3 rounded-lg">
                      {application.rejectReason}
                    </p>
                  </div>
                )}
                {application.auditedAt && (
                  <div className="md:col-span-2">
                    <p className="text-gray-400 mb-1">审核时间</p>
                    <p className="text-gray-700">{formatDate(application.auditedAt)}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div>
      <PageHeader
        title="审核管理"
        description="管理海报张贴申请的审核流程"
      />

      <div className="bg-white rounded-2xl shadow-card p-2 mb-6 animate-fade-in">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
              activeTab === 'pending'
                ? 'bg-primary-500 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Clock className="w-5 h-5" />
            待审核
            {pendingApplications.length > 0 && (
              <span className="px-2 py-0.5 text-xs bg-white/20 rounded-full">
                {pendingApplications.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
              activeTab === 'history'
                ? 'bg-primary-500 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <FileText className="w-5 h-5" />
            历史记录
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-card p-4 mb-6 animate-fade-in">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="搜索申请人、联系方式、活动名称、社团、公告栏..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {displayApplications.length > 0 ? (
        <div className="space-y-4">
          {displayApplications.map((app, index) => renderApplicationCard(app, index))}
        </div>
      ) : (
        <Empty
          icon={activeTab === 'pending' ? <Check className="w-16 h-16 text-emerald-400" /> : <FileText className="w-16 h-16 text-gray-300" />}
          title={activeTab === 'pending' ? '暂无待审核申请' : '暂无审核记录'}
          description={
            activeTab === 'pending'
              ? '所有申请都已审核完成'
              : searchTerm
              ? '没有找到匹配的审核记录'
              : '还没有任何审核记录'
          }
        />
      )}

      {showDetailModal && selectedApplication && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">申请详情</h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {(() => {
                const poster = getPosterById(selectedApplication.posterId);
                const board = getBoardById(selectedApplication.bulletinBoardId);
                if (!poster || !board) return null;

                return (
                  <div className="space-y-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="w-full md:w-48 flex-shrink-0">
                        <div className="aspect-[3/4] rounded-xl overflow-hidden shadow-lg">
                          <img
                            src={poster.imageUrl}
                            alt={poster.activityName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                      <div className="flex-1 space-y-4">
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-2">
                            {poster.activityName}
                          </h3>
                          <div className="flex items-center gap-3">
                            <StatusBadge status={selectedApplication.status} type="application" />
                            <StatusBadge status={poster.status} type="poster" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-400 mb-1">申请社团</p>
                            <p className="text-gray-700 font-medium">{poster.club}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-400 mb-1">审批编号</p>
                            <p className="text-gray-700 font-mono">{poster.approvalNumber}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-400 mb-1">申请人</p>
                            <p className="text-gray-700">{selectedApplication.applicant}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-400 mb-1">联系方式</p>
                            <p className="text-gray-700">{selectedApplication.contact}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-5 space-y-4">
                      <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-primary-500" />
                        张贴信息
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-gray-400 mb-1">公告栏</p>
                          <p className="text-gray-700">{board.name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400 mb-1">位置</p>
                          <p className="text-gray-700">{board.location}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400 mb-1">数量</p>
                          <p className="text-gray-700">{selectedApplication.quantity} 张</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400 mb-1">置顶</p>
                          <p className="text-gray-700 flex items-center gap-1">
                            {selectedApplication.needTop ? (
                              <>
                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                是
                              </>
                            ) : (
                              '否'
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-5 space-y-4">
                      <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-primary-500" />
                        海报信息
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-gray-400 mb-1">尺寸</p>
                          <p className="text-gray-700">{poster.size}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400 mb-1">区域</p>
                          <p className="text-gray-700">{poster.area}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400 mb-1">开始日期</p>
                          <p className="text-gray-700">{formatDate(poster.startDate)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400 mb-1">结束日期</p>
                          <p className="text-gray-700">{formatDate(poster.endDate)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-5 space-y-4">
                      <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-primary-500" />
                        申请时间
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-400 mb-1">提交时间</p>
                          <p className="text-gray-700">{formatDate(selectedApplication.createdAt)}</p>
                        </div>
                        {selectedApplication.auditedAt && (
                          <div>
                            <p className="text-sm text-gray-400 mb-1">审核时间</p>
                            <p className="text-gray-700">{formatDate(selectedApplication.auditedAt)}</p>
                          </div>
                        )}
                      </div>
                      {selectedApplication.rejectReason && (
                        <div className="mt-4">
                          <p className="text-sm text-gray-400 mb-1">驳回原因</p>
                          <p className="text-gray-700 bg-red-50 p-3 rounded-lg">
                            {selectedApplication.rejectReason}
                          </p>
                        </div>
                      )}
                    </div>

                    {selectedApplication.status === 'pending' && (
                      <div className="flex flex-col sm:flex-row gap-3 pt-4">
                        <button
                          onClick={() => handleRejectClick(selectedApplication)}
                          disabled={isProcessing}
                          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 text-lg font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors disabled:opacity-50"
                        >
                          <X className="w-5 h-5" />
                          驳回申请
                        </button>
                        <button
                          onClick={() => handleApprove(selectedApplication)}
                          disabled={isProcessing}
                          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 text-lg font-medium text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl transition-colors disabled:opacity-50"
                        >
                          <Check className="w-5 h-5" />
                          通过申请
                        </button>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {showRejectModal && selectedApplication && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-scale-in">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">驳回申请</h2>
                  <p className="text-gray-500 text-sm">请填写驳回原因</p>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  驳回原因 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="请详细说明驳回原因..."
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectReason('');
                  }}
                  disabled={isProcessing}
                  className="flex-1 px-6 py-3 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors disabled:opacity-50"
                >
                  取消
                </button>
                <button
                  onClick={handleRejectConfirm}
                  disabled={isProcessing || !rejectReason.trim()}
                  className="flex-1 px-6 py-3 text-white bg-red-500 hover:bg-red-600 rounded-xl font-medium transition-colors disabled:opacity-50"
                >
                  确认驳回
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
