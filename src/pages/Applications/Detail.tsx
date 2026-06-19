import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  FileSignature,
  Check,
  X,
  ClipboardCheck,
  ArrowRight,
  Stamp,
  User,
  Users,
  UserCheck,
  Calendar,
  MapPin,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { useStore } from '@/store';
import StatusBadge from '@/components/StatusBadge';
import { formatDate, getOverdueHours } from '@/utils/helpers';

export default function ApplicationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    getApplicationById,
    getSealById,
    getRecordByApplicationId,
    updateApplicationStatus,
  } = useStore();

  const application = id ? getApplicationById(id) : undefined;
  const seal = application ? getSealById(application.sealId) : undefined;
  const record = application ? getRecordByApplicationId(application.id) : undefined;

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectError, setRejectError] = useState('');

  if (!application) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="btn-secondary flex items-center gap-2 py-2 px-3"
          >
            <ArrowLeft className="w-4 h-4" />
            返回
          </button>
          <h1 className="text-2xl font-serif font-bold text-primary-800">申请详情</h1>
        </div>
        <div className="card-seal p-12 text-center">
          <AlertCircle className="w-16 h-16 text-primary-200 mx-auto mb-4" />
          <p className="text-primary-500">未找到该申请记录</p>
          <button
            onClick={() => navigate('/applications')}
            className="btn-primary mt-4"
          >
            返回列表
          </button>
        </div>
      </div>
    );
  }

  const handleApprove = () => {
    if (id) {
      updateApplicationStatus(id, 'approved');
    }
  };

  const handleReject = () => {
    if (!rejectReason.trim()) {
      setRejectError('请输入驳回原因');
      return;
    }
    if (id) {
      updateApplicationStatus(id, 'rejected', rejectReason.trim());
      setShowRejectModal(false);
      setRejectReason('');
      setRejectError('');
    }
  };

  const isOverdue = application.status === 'overdue';

  const InfoRow = ({
    icon: Icon,
    label,
    value,
    isDanger,
  }: {
    icon: typeof Stamp;
    label: string;
    value: React.ReactNode;
    isDanger?: boolean;
  }) => (
    <div className="flex items-start gap-3 py-3 border-b border-primary-50 last:border-b-0">
      <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon className={`w-4.5 h-4.5 ${isDanger ? 'text-seal-red' : 'text-primary-500'}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-primary-400 mb-0.5">{label}</p>
        <p className={`text-sm ${isDanger ? 'text-seal-red font-medium' : 'text-primary-800'}`}>
          {value}
        </p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="btn-secondary flex items-center gap-2 py-2 px-3"
          >
            <ArrowLeft className="w-4 h-4" />
            返回
          </button>
          <div>
            <h1 className="text-2xl font-serif font-bold text-primary-800 flex items-center gap-3">
              <FileSignature className="w-7 h-7 text-gold-500" />
              申请详情
            </h1>
            <p className="text-sm text-primary-500 mt-1">
              申请编号：{application.id} · 提交时间：{formatDate(application.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {application.status === 'pending' && (
            <>
              <button
                onClick={handleApprove}
                className="btn-primary flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                通过申请
              </button>
              <button
                onClick={() => setShowRejectModal(true)}
                className="btn-danger flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                驳回申请
              </button>
            </>
          )}
          {application.status === 'approved' && !record && (
            <button
              onClick={() => navigate(`/checkout/${application.id}`)}
              className="btn-primary flex items-center gap-2"
            >
              <ClipboardCheck className="w-4 h-4" />
              前往外带登记
            </button>
          )}
          {(application.status === 'checked_out' || record?.status === 'checked_out') && record && (
            <button
              onClick={() => navigate(`/return/${record.id}`)}
              className="btn-primary flex items-center gap-2"
            >
              <ArrowRight className="w-4 h-4" />
              前往归还登记
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className={`card-seal p-6 ${isOverdue ? 'border-seal-red animate-pulse-red' : ''}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title mb-0">申请状态</h2>
              <StatusBadge type="application" status={application.status} />
            </div>
            {application.status === 'rejected' && application.rejectReason && (
              <div className="p-4 bg-red-50 rounded-lg border border-red-100 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-seal-red flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-seal-red">驳回原因</p>
                  <p className="text-sm text-red-700 mt-1">{application.rejectReason}</p>
                </div>
              </div>
            )}
            {isOverdue && (
              <div className="p-4 bg-red-50 rounded-lg border border-red-100 flex items-start gap-3 mt-4">
                <AlertCircle className="w-5 h-5 text-seal-red flex-shrink-0 mt-0.5 animate-pulse" />
                <div>
                  <p className="text-sm font-medium text-seal-red">逾期提醒</p>
                  <p className="text-sm text-red-700 mt-1">
                    已逾期 {getOverdueHours(application.expectedReturn)} 小时，请尽快归还印章
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="card-seal p-6">
            <h2 className="section-title flex items-center gap-2">
              <FileText className="w-5 h-5 text-gold-500" />
              申请内容
            </h2>
            <div className="space-y-0">
              <InfoRow icon={FileText} label="用途说明" value={application.purpose} />
              <InfoRow icon={FileText} label="文件类型" value={application.documentType} />
              <InfoRow icon={MapPin} label="目的地" value={application.destination} />
              <InfoRow
                icon={Calendar}
                label="预计归还时间"
                value={
                  <div>
                    {formatDate(application.expectedReturn)}
                    {isOverdue && (
                      <span className="ml-2 text-seal-red font-medium">
                        （已逾期 {getOverdueHours(application.expectedReturn)} 小时）
                      </span>
                    )}
                  </div>
                }
                isDanger={isOverdue}
              />
            </div>
          </div>

          <div className="card-seal p-6">
            <h2 className="section-title flex items-center gap-2">
              <Users className="w-5 h-5 text-gold-500" />
              人员信息
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 space-y-0">
              <InfoRow icon={User} label="申请人" value={application.applicant} />
              <InfoRow icon={Users} label="部门" value={application.department} />
              <InfoRow icon={UserCheck} label="陪同人" value={application.companion || '无'} />
              <InfoRow icon={UserCheck} label="审批人" value={application.approver} />
            </div>
          </div>

          {record && (
            <div className="card-seal p-6">
              <h2 className="section-title flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5 text-gold-500" />
                外带登记记录
              </h2>
              <div className="space-y-0">
                <InfoRow icon={FileText} label="信封编号" value={record.envelopeNumber} />
                <InfoRow
                  icon={Calendar}
                  label="外带时间"
                  value={formatDate(record.checkoutTime)}
                />
                {record.actualReturnTime && (
                  <InfoRow
                    icon={Calendar}
                    label="实际归还时间"
                    value={formatDate(record.actualReturnTime)}
                  />
                )}
                {record.stampedDocumentCount !== undefined && (
                  <InfoRow
                    icon={FileText}
                    label="盖章文件数量"
                    value={`${record.stampedDocumentCount} 份`}
                  />
                )}
                <InfoRow
                  icon={ClipboardCheck}
                  label="登记状态"
                  value={<StatusBadge type="record" status={record.status} />}
                />
                {record.hasAnomaly && (
                  <InfoRow
                    icon={AlertCircle}
                    label="异常说明"
                    value={record.anomalyRemark || '存在异常'}
                    isDanger
                  />
                )}
                {record.purposeMismatch && (
                  <InfoRow
                    icon={AlertCircle}
                    label="用途不符"
                    value="盖章用途与申请内容不一致"
                    isDanger
                  />
                )}
              </div>
              <div className="mt-4">
                <p className="text-xs text-primary-400 mb-2">外带封存照片</p>
                <img
                  src={record.checkoutPhoto}
                  alt="外带封存"
                  className="w-40 h-40 rounded-lg object-cover border border-primary-100"
                />
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="card-seal p-6 sticky top-6">
            <h2 className="section-title flex items-center gap-2">
              <Stamp className="w-5 h-5 text-gold-500" />
              关联印章
            </h2>
            {seal ? (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <img
                    src={seal.photoUrl}
                    alt={seal.type}
                    className="w-32 h-32 rounded-xl object-cover border-2 border-gold-200 shadow-md"
                  />
                </div>
                <div className="text-center space-y-1">
                  <h3 className="font-serif font-semibold text-primary-800 text-lg">
                    {seal.type}
                  </h3>
                  <p className="text-sm text-primary-500">{seal.sealNumber}</p>
                </div>
                <div className="flex justify-center gap-2">
                  <StatusBadge type="seal" status={seal.status} />
                  <StatusBadge type="risk" status={seal.riskLevel} />
                </div>
                <div className="space-y-0 pt-2">
                  <InfoRow icon={User} label="保管人" value={seal.custodian} />
                </div>
                <div className="pt-2 border-t border-primary-50">
                  <p className="text-xs text-primary-400 mb-1">适用范围</p>
                  <p className="text-sm text-primary-600 leading-relaxed">{seal.scope}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-primary-400">
                <Stamp className="w-12 h-12 mx-auto mb-2 text-primary-200" />
                <p className="text-sm">印章信息不存在</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <X className="w-5 h-5 text-seal-red" />
              </div>
              <div>
                <h3 className="font-serif font-semibold text-primary-800 text-lg">驳回申请</h3>
                <p className="text-sm text-primary-500">请填写驳回原因</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="label-seal">
                  驳回原因 <span className="text-seal-red">*</span>
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => {
                    setRejectReason(e.target.value);
                    if (rejectError) setRejectError('');
                  }}
                  placeholder="请说明驳回该申请的原因..."
                  rows={4}
                  className={`input-seal resize-none ${rejectError ? 'border-seal-red focus:ring-red-100' : ''}`}
                  autoFocus
                />
                {rejectError && (
                  <p className="text-xs text-seal-red mt-1">{rejectError}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                  setRejectError('');
                }}
                className="btn-secondary flex-1"
              >
                取消
              </button>
              <button onClick={handleReject} className="btn-danger flex-1">
                确认驳回
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
