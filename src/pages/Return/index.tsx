import { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Hash,
  Package,
  FileCheck,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { useStore } from '@/store';
import { formatDate, isOverdue } from '@/utils/helpers';
import StatusBadge from '@/components/StatusBadge';

export default function Return() {
  const navigate = useNavigate();
  const { recordId } = useParams<{ recordId: string }>();

  const record = useStore((s) => s.getRecordById(recordId || ''));
  const application = useStore((s) => s.getApplicationById(record?.applicationId || ''));
  const seal = useStore((s) => s.getSealById(record?.sealId || ''));
  const returnRecord = useStore((s) => s.returnRecord);

  const formatLocalDateTime = (date: Date): string => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  const parseLocalDateTime = (str: string): Date => {
    return new Date(str);
  };

  const [actualReturnTime, setActualReturnTime] = useState(
    formatLocalDateTime(new Date())
  );
  const [stampedDocumentCount, setStampedDocumentCount] = useState<number>(0);
  const [hasAnomaly, setHasAnomaly] = useState(false);
  const [anomalyRemark, setAnomalyRemark] = useState('');
  const [purposeMatch, setPurposeMatch] = useState(true);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [errors, setErrors] = useState<{ stampedDocumentCount?: string }>({});

  const overdue = useMemo(() => {
    if (!application) return false;
    return isOverdue(application.expectedReturn, parseLocalDateTime(actualReturnTime).toISOString());
  }, [application, actualReturnTime]);

  const hasAnomalyOrMismatchOrOverdue =
    hasAnomaly || !purposeMatch || overdue;

  const validate = (): boolean => {
    const newErrors: { stampedDocumentCount?: string } = {};
    if (stampedDocumentCount < 0 || !Number.isFinite(stampedDocumentCount)) {
      newErrors.stampedDocumentCount = '请输入有效的盖章文件数量';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate() || !record) return;

    returnRecord(record.id, {
      actualReturnTime: parseLocalDateTime(actualReturnTime).toISOString(),
      stampedDocumentCount,
      hasAnomaly,
      anomalyRemark: hasAnomaly ? anomalyRemark.trim() : undefined,
      purposeMismatch: !purposeMatch,
    });

    setShowSuccessAlert(true);
  };

  if (!record || !application || !seal) {
    return (
      <div className="card-seal p-8 text-center text-primary-500">
        未找到对应的外带记录信息
      </div>
    );
  }

  if (showSuccessAlert) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/applications')}
            className="btn-ghost flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            返回申请列表
          </button>
          <h2 className="font-serif text-2xl font-semibold text-primary-800">
            归还登记完成
          </h2>
        </div>

        {hasAnomalyOrMismatchOrOverdue ? (
          <div className="card-seal p-8 border-seal-red bg-red-50/30">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-seal-red" />
              </div>
              <div className="space-y-3 flex-1">
                <h3 className="font-serif text-xl font-semibold text-seal-red">
                  归还已登记，但存在异常情况
                </h3>
                <p className="text-primary-600">
                  请相关管理人员关注以下问题，并按规定进行处理：
                </p>
                <ul className="space-y-2">
                  {overdue && (
                    <li className="flex items-center gap-2 text-seal-red">
                      <XCircle className="w-4 h-4" />
                      <span>超时归还：实际归还时间超过预计归还时间</span>
                    </li>
                  )}
                  {!purposeMatch && (
                    <li className="flex items-center gap-2 text-seal-red">
                      <XCircle className="w-4 h-4" />
                      <span>用途不匹配：实际用途与申请用途不符</span>
                    </li>
                  )}
                  {hasAnomaly && (
                    <li className="flex items-center gap-2 text-seal-red">
                      <XCircle className="w-4 h-4" />
                      <span>
                        其他异常：
                        {anomalyRemark || '未填写备注'}
                      </span>
                    </li>
                  )}
                </ul>
                <button
                  onClick={() => navigate('/applications')}
                  className="btn-primary mt-4 flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  返回申请列表
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="card-seal p-8 border-green-200 bg-green-50/30">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="space-y-3 flex-1">
                <h3 className="font-serif text-xl font-semibold text-green-700">
                  归还登记成功
                </h3>
                <p className="text-primary-600">
                  印章已正常归还，状态已更新为可用。
                </p>
                <button
                  onClick={() => navigate('/applications')}
                  className="btn-primary mt-4 flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  返回申请列表
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="btn-ghost flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          返回
        </button>
        <h2 className="font-serif text-2xl font-semibold text-primary-800">
          归还登记
        </h2>
      </div>

      {overdue && (
        <div className="card-seal p-4 border-seal-red bg-red-50/30">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-seal-red flex-shrink-0" />
            <div>
              <p className="font-medium text-seal-red">超时警告</p>
              <p className="text-sm text-red-600">
                实际归还时间已超过申请的预计归还时间（
                {formatDate(application.expectedReturn)}），请在备注中说明原因。
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="card-seal p-6 space-y-4">
        <h3 className="section-title flex items-center gap-2">
          <Package className="w-5 h-5 text-gold-500" />
          外带记录信息
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-primary-500">封套编号</p>
                <p className="font-medium text-primary-800 flex items-center gap-1">
                  <Hash className="w-4 h-4 text-primary-400" />
                  {record.envelopeNumber}
                </p>
              </div>
              <StatusBadge type="record" status={record.status} />
            </div>
            <div>
              <p className="text-sm text-primary-500">申请人</p>
              <p className="font-medium text-primary-800">{application.applicant}</p>
            </div>
            <div>
              <p className="text-sm text-primary-500">所属部门</p>
              <p className="font-medium text-primary-800">{application.department}</p>
            </div>
            <div>
              <p className="text-sm text-primary-500">申请用途</p>
              <p className="font-medium text-primary-800">{application.purpose}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-primary-500">印章类型</p>
                <p className="font-medium text-primary-800">{seal.type}</p>
              </div>
              <StatusBadge type="risk" status={seal.riskLevel} />
            </div>
            <div>
              <p className="text-sm text-primary-500">印章编号</p>
              <p className="font-medium text-primary-800">{seal.sealNumber}</p>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary-400" />
              <p className="text-sm text-primary-500">外带时间：</p>
              <p className="font-medium text-primary-800">
                {formatDate(record.checkoutTime)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary-400" />
              <p className="text-sm text-primary-500">预计归还：</p>
              <p
                className={`font-medium ${
                  overdue ? 'text-seal-red' : 'text-primary-800'
                }`}
              >
                {formatDate(application.expectedReturn)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="card-seal p-6 space-y-5">
        <h3 className="section-title flex items-center gap-2">
          <FileCheck className="w-5 h-5 text-gold-500" />
          归还登记
        </h3>

        <div>
          <label className="label-seal">
            实际归还时间 <span className="text-seal-red">*</span>
          </label>
          <input
            type="datetime-local"
            value={actualReturnTime}
            onChange={(e) => setActualReturnTime(e.target.value)}
            className={`input-seal ${
              overdue ? 'border-seal-red focus:ring-red-100' : ''
            }`}
          />
          {overdue && (
            <p className="mt-1 text-sm text-seal-red flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              已超时，请确认时间是否正确
            </p>
          )}
        </div>

        <div>
          <label className="label-seal">
            盖章文件数量 <span className="text-seal-red">*</span>
          </label>
          <input
            type="number"
            min="0"
            value={stampedDocumentCount}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              setStampedDocumentCount(Number.isNaN(val) ? 0 : val);
              if (errors.stampedDocumentCount) {
                setErrors((prev) => ({ ...prev, stampedDocumentCount: undefined }));
              }
            }}
            placeholder="请输入盖章文件数量"
            className={`input-seal max-w-xs ${
              errors.stampedDocumentCount ? 'border-seal-red focus:ring-red-100' : ''
            }`}
          />
          {errors.stampedDocumentCount && (
            <p className="mt-1 text-sm text-seal-red">
              {errors.stampedDocumentCount}
            </p>
          )}
        </div>

        <div className={`p-4 rounded-lg border transition-colors ${
          !purposeMatch
            ? 'border-seal-red bg-red-50/30'
            : 'border-primary-100 bg-seal-paper'
        }`}>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={purposeMatch}
              onChange={(e) => setPurposeMatch(e.target.checked)}
              className="mt-1 w-5 h-5 rounded border-primary-300 text-primary-700 focus:ring-primary-500"
            />
            <div className="flex-1">
              <span
                className={`font-medium ${
                  !purposeMatch ? 'text-seal-red' : 'text-primary-700'
                }`}
              >
                用途与申请匹配
              </span>
              {!purposeMatch && (
                <p className="mt-1 text-sm text-seal-red flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  已标记为用途不匹配，系统将记录异常
                </p>
              )}
            </div>
          </label>
        </div>

        <div className={`p-4 rounded-lg border transition-colors ${
          hasAnomaly
            ? 'border-seal-red bg-red-50/30'
            : 'border-primary-100 bg-seal-paper'
        }`}>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={hasAnomaly}
              onChange={(e) => setHasAnomaly(e.target.checked)}
              className="mt-1 w-5 h-5 rounded border-primary-300 text-primary-700 focus:ring-primary-500"
            />
            <div className="flex-1">
              <span
                className={`font-medium ${
                  hasAnomaly ? 'text-seal-red' : 'text-primary-700'
                }`}
              >
                是否异常
              </span>
              <p className="text-sm text-primary-400 mt-0.5">
                如印章损坏、文件遗失、封套破损等，请勾选并填写备注
              </p>
            </div>
          </label>

          {hasAnomaly && (
            <div className="mt-4 ml-8">
              <label className="label-seal">
                异常备注 <span className="text-seal-red">*</span>
              </label>
              <textarea
                value={anomalyRemark}
                onChange={(e) => setAnomalyRemark(e.target.value)}
                rows={3}
                placeholder="请详细描述异常情况..."
                className="input-seal border-seal-red focus:ring-red-100 resize-none"
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3 pb-8">
        <button onClick={() => navigate(-1)} className="btn-secondary">
          取消
        </button>
        <button
          onClick={handleSubmit}
          className={`${
            hasAnomalyOrMismatchOrOverdue ? 'btn-danger' : 'btn-primary'
          } flex items-center gap-2`}
        >
          {hasAnomalyOrMismatchOrOverdue ? (
            <AlertTriangle className="w-4 h-4" />
          ) : (
            <CheckCircle className="w-4 h-4" />
          )}
          确认归还
        </button>
      </div>
    </div>
  );
}
