import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Phone,
  Calendar,
  FileText,
  Tag,
  User,
  Building,
  Clock,
  FileCheck,
  AlertCircle,
  CheckCircle2,
  XCircle,
  FileWarning,
  Camera,
  Bell,
  RefreshCw,
  Pencil,
  Save,
  X,
} from 'lucide-react';
import { useVendorStore } from '@/stores/useVendorStore';
import { getLicenseStatus, getDaysUntilExpiry, formatDate, formatDateTime } from '@/utils/date';
import { stallTypeLabels, followUpStatusLabels } from '@/types';
import type { AuditAction, FollowUpStatus, AuditRecord } from '@/types';
import StatusBadge from '@/components/StatusBadge';
import Modal from '@/components/Modal';

const VendorDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    getVendor,
    getVendorAuditRecords,
    performAudit,
    deleteVendor,
    initData,
    isLoaded,
    updateAuditFollowUp,
  } = useVendorStore();

  const [showAuditModal, setShowAuditModal] = useState(false);
  const [selectedAction, setSelectedAction] = useState<AuditAction | null>(null);
  const [auditReason, setAuditReason] = useState('');
  const [followUpStatus, setFollowUpStatus] = useState<FollowUpStatus>('pending');
  const [nextReminderDate, setNextReminderDate] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingFollowUpRecord, setEditingFollowUpRecord] = useState<AuditRecord | null>(null);
  const [editFollowUpStatus, setEditFollowUpStatus] = useState<FollowUpStatus>('pending');
  const [editNextReminderDate, setEditNextReminderDate] = useState('');

  useEffect(() => {
    initData();
  }, [initData]);

  const vendor = id ? getVendor(id) : undefined;
  const auditRecords = id ? getVendorAuditRecords(id) : [];

  if (!isLoaded) {
    return <div className="text-center py-20">加载中...</div>;
  }

  if (!vendor) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500 mb-4">摊主不存在</p>
        <button
          onClick={() => navigate('/vendors')}
          className="text-blue-600 hover:text-blue-700"
        >
          返回列表
        </button>
      </div>
    );
  }

  const licenseStatus = getLicenseStatus(vendor.validUntil);
  const daysLeft = getDaysUntilExpiry(vendor.validUntil);

  const resetAuditForm = () => {
    setShowAuditModal(false);
    setSelectedAction(null);
    setAuditReason('');
    setFollowUpStatus('pending');
    setNextReminderDate('');
  };

  const handleAuditSubmit = () => {
    if (!selectedAction || !auditReason.trim()) return;
    if (selectedAction === 'material_request') {
      performAudit(
        vendor.id,
        selectedAction,
        auditReason.trim(),
        '管理员',
        followUpStatus,
        nextReminderDate || undefined
      );
    } else {
      performAudit(vendor.id, selectedAction, auditReason.trim(), '管理员');
    }
    resetAuditForm();
  };

  const handleDelete = () => {
    deleteVendor(vendor.id);
    navigate('/vendors');
  };

  const openAuditModal = (action: AuditAction) => {
    setSelectedAction(action);
    setShowAuditModal(true);
  };

  const openFollowUpEdit = (record: AuditRecord) => {
    setEditingFollowUpRecord(record);
    setEditFollowUpStatus(record.followUpStatus || 'pending');
    setEditNextReminderDate(record.nextReminderDate || '');
  };

  const resetFollowUpEdit = () => {
    setEditingFollowUpRecord(null);
    setEditFollowUpStatus('pending');
    setEditNextReminderDate('');
  };

  const handleFollowUpEditSubmit = () => {
    if (!editingFollowUpRecord) return;
    updateAuditFollowUp(
      editingFollowUpRecord.id,
      editFollowUpStatus,
      editNextReminderDate || undefined
    );
    resetFollowUpEdit();
  };

  const actionConfig = {
    approve: { label: '通过', color: 'green', icon: CheckCircle2 },
    reject: { label: '驳回', color: 'red', icon: XCircle },
    material_request: { label: '补材料', color: 'amber', icon: FileWarning },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/vendors')}
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">摊主详情</h1>
            <p className="text-slate-500 mt-0.5">{vendor.name} 的档案信息</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium"
          >
            <Trash2 className="w-4 h-4" />
            删除
          </button>
          <button
            onClick={() => navigate(`/vendors/${vendor.id}/edit`)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl transition-colors font-medium"
          >
            <Edit className="w-4 h-4" />
            编辑
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className={`h-32 ${
              licenseStatus === 'expired'
                ? 'bg-gradient-to-r from-red-500 to-rose-500'
                : licenseStatus === 'expiring'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                : 'bg-gradient-to-r from-blue-500 to-indigo-500'
            }`}>
              <div className="h-full flex items-end p-6">
                <div className="flex items-end gap-4">
                  <div className="w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center text-3xl font-bold text-slate-700 -mb-10">
                    {vendor.name.charAt(0)}
                  </div>
                  <div className="text-white pb-2">
                    <h2 className="text-2xl font-bold">{vendor.name}</h2>
                    <p className="text-white/80 text-sm">{stallTypeLabels[vendor.stallType]} · {vendor.businessCategory}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="pt-12 px-6 pb-6">
              <div className="flex items-center gap-3 mb-6">
                <StatusBadge type="license" status={licenseStatus} />
                <StatusBadge type="audit" status={vendor.auditStatus} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">基本信息</h3>

                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-slate-500" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">姓名</p>
                      <p className="text-slate-800 font-medium">{vendor.name}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <Phone className="w-4 h-4 text-slate-500" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">联系电话</p>
                      <p className="text-slate-800 font-medium">{vendor.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <Building className="w-4 h-4 text-slate-500" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">摊位类型</p>
                      <p className="text-slate-800 font-medium">{stallTypeLabels[vendor.stallType]}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <Tag className="w-4 h-4 text-slate-500" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">经营品类</p>
                      <p className="text-slate-800 font-medium">{vendor.businessCategory}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">证照信息</h3>

                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4 h-4 text-slate-500" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">证照编号</p>
                      <p className="text-slate-800 font-medium font-mono">{vendor.licenseNumber}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      licenseStatus === 'expired' ? 'bg-red-100' : licenseStatus === 'expiring' ? 'bg-amber-100' : 'bg-green-100'
                    }`}>
                      <Calendar className={`w-4 h-4 ${
                        licenseStatus === 'expired' ? 'text-red-500' : licenseStatus === 'expiring' ? 'text-amber-500' : 'text-green-500'
                      }`} />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">有效期至</p>
                      <p className={`font-medium ${
                        licenseStatus === 'expired' ? 'text-red-600' : licenseStatus === 'expiring' ? 'text-amber-600' : 'text-slate-800'
                      }`}>
                        {formatDate(vendor.validUntil)}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {licenseStatus === 'expired'
                          ? `已过期 ${Math.abs(daysLeft)} 天`
                          : `还剩 ${daysLeft} 天`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-4 h-4 text-slate-500" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">档案创建时间</p>
                      <p className="text-slate-800 font-medium">{formatDateTime(vendor.createdAt)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">证照照片</h3>
            <div className="relative group">
              <img
                src={vendor.licensePhoto}
                alt="证照照片"
                className="w-full max-w-lg rounded-xl border border-slate-200"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-xl transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <button className="p-3 bg-white rounded-full shadow-lg">
                  <Camera className="w-5 h-5 text-slate-600" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">审核操作</h3>
            <div className="space-y-3">
              <button
                onClick={() => openAuditModal('approve')}
                className="w-full flex items-center gap-3 p-4 rounded-xl bg-green-50 hover:bg-green-100 text-green-700 transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium">审核通过</p>
                  <p className="text-sm text-green-600">确认证照齐全有效</p>
                </div>
              </button>

              <button
                onClick={() => openAuditModal('material_request')}
                className="w-full flex items-center gap-3 p-4 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-lg bg-amber-500 flex items-center justify-center">
                  <FileWarning className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium">要求补材料</p>
                  <p className="text-sm text-amber-600">材料不全需补充</p>
                </div>
              </button>

              <button
                onClick={() => openAuditModal('reject')}
                className="w-full flex items-center gap-3 p-4 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-lg bg-red-500 flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium">审核驳回</p>
                  <p className="text-sm text-red-600">不符合要求，不予通过</p>
                </div>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">审核记录</h3>
            {auditRecords.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <FileCheck className="w-10 h-10 mx-auto mb-2" />
                <p className="text-sm">暂无审核记录</p>
              </div>
            ) : (
              <div className="space-y-4">
                {auditRecords.map((record, index) => (
                  <div key={record.id} className="relative pl-6 pb-4">
                    {index < auditRecords.length - 1 && (
                      <div className="absolute left-2.5 top-6 bottom-0 w-px bg-slate-200" />
                    )}
                    <div className={`absolute left-0 top-1 w-5 h-5 rounded-full border-2 border-white ${
                      record.action === 'approve' ? 'bg-green-500' : record.action === 'reject' ? 'bg-red-500' : 'bg-amber-500'
                    }`} />
                    <div className="ml-2">
                      <div className="flex items-center gap-2 flex-wrap justify-between">
                        <div className="flex items-center gap-2 flex-wrap">
                          <StatusBadge type="action" status={record.action} size="sm" />
                          <span className="text-xs text-slate-400">{record.operator}</span>
                          {record.followUpStatus && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-indigo-100 text-indigo-700">
                              <RefreshCw className="w-3 h-3" />
                              {followUpStatusLabels[record.followUpStatus]}
                            </span>
                          )}
                        </div>
                        {record.action === 'material_request' && (
                          <button
                            onClick={() => openFollowUpEdit(record)}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="编辑跟进信息"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            编辑跟进
                          </button>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 mt-2">{record.reason}</p>
                      {record.nextReminderDate && (
                        <div className="flex items-center gap-1.5 mt-2 text-xs text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg w-fit">
                          <Bell className="w-3.5 h-3.5" />
                          下次提醒：{formatDate(record.nextReminderDate)}
                        </div>
                      )}
                      <p className="text-xs text-slate-400 mt-1.5">{formatDateTime(record.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal
        isOpen={showAuditModal}
        onClose={resetAuditForm}
        title={selectedAction ? `${actionConfig[selectedAction].label}审核` : '审核操作'}
        size="md"
      >
        {selectedAction && (
          <div className="space-y-5">
            <div className={`p-4 rounded-xl ${
              selectedAction === 'approve' ? 'bg-green-50' : selectedAction === 'reject' ? 'bg-red-50' : 'bg-amber-50'
            }`}>
              <div className="flex items-center gap-3">
                {selectedAction === 'approve' && <CheckCircle2 className="w-6 h-6 text-green-500" />}
                {selectedAction === 'reject' && <XCircle className="w-6 h-6 text-red-500" />}
                {selectedAction === 'material_request' && <FileWarning className="w-6 h-6 text-amber-500" />}
                <div>
                  <p className={`font-medium ${
                    selectedAction === 'approve' ? 'text-green-700' : selectedAction === 'reject' ? 'text-red-700' : 'text-amber-700'
                  }`}>
                    确认{actionConfig[selectedAction].label}
                  </p>
                  <p className="text-sm text-slate-500 mt-0.5">摊主：{vendor.name}</p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {selectedAction === 'material_request' ? '需要补充的材料' : selectedAction === 'reject' ? '驳回原因' : '审核意见'}
                <span className="text-red-500 ml-1">*</span>
              </label>
              <textarea
                value={auditReason}
                onChange={e => setAuditReason(e.target.value)}
                placeholder={selectedAction === 'material_request' ? '请说明需要补充哪些材料...' : selectedAction === 'reject' ? '请说明驳回原因...' : '请输入审核意见...'}
                rows={4}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
              />
            </div>

            {selectedAction === 'material_request' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    跟进状态
                  </label>
                  <select
                    value={followUpStatus}
                    onChange={e => setFollowUpStatus(e.target.value as FollowUpStatus)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-white"
                  >
                    {(Object.keys(followUpStatusLabels) as FollowUpStatus[]).map(status => (
                      <option key={status} value={status}>
                        {followUpStatusLabels[status]}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    下次提醒日期
                  </label>
                  <input
                    type="date"
                    value={nextReminderDate}
                    onChange={e => setNextReminderDate(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={resetAuditForm}
                className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors font-medium"
              >
                取消
              </button>
              <button
                onClick={handleAuditSubmit}
                disabled={!auditReason.trim()}
                className={`flex-1 px-4 py-2.5 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  selectedAction === 'approve' ? 'bg-green-600 hover:bg-green-700' :
                  selectedAction === 'reject' ? 'bg-red-600 hover:bg-red-700' :
                  'bg-amber-600 hover:bg-amber-700'
                }`}
              >
                确认{actionConfig[selectedAction].label}
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={!!editingFollowUpRecord}
        onClose={resetFollowUpEdit}
        title="编辑跟进信息"
        size="md"
      >
        {editingFollowUpRecord && (
          <div className="space-y-5">
            <div className="p-4 rounded-xl bg-indigo-50">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-500 flex items-center justify-center flex-shrink-0">
                  <RefreshCw className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-indigo-700">补材料跟进信息</p>
                  <p className="text-sm text-slate-600 mt-1">{editingFollowUpRecord.reason}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    操作人：{editingFollowUpRecord.operator} · {formatDateTime(editingFollowUpRecord.createdAt)}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  跟进状态
                </label>
                <select
                  value={editFollowUpStatus}
                  onChange={e => setEditFollowUpStatus(e.target.value as FollowUpStatus)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                >
                  {(Object.keys(followUpStatusLabels) as FollowUpStatus[]).map(status => (
                    <option key={status} value={status}>
                      {followUpStatusLabels[status]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  下次提醒日期
                </label>
                <input
                  type="date"
                  value={editNextReminderDate}
                  onChange={e => setEditNextReminderDate(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={resetFollowUpEdit}
                className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <X className="w-4 h-4" />
                取消
              </button>
              <button
                onClick={handleFollowUpEditSubmit}
                className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                保存修改
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="确认删除"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl">
            <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
            <div>
              <p className="text-red-700 font-medium">确定要删除这位摊主吗？</p>
              <p className="text-sm text-red-600 mt-0.5">删除后将无法恢复，所有审核记录也会被清除</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors font-medium"
            >
              取消
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium"
            >
              确认删除
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default VendorDetail;
