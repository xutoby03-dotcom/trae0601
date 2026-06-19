import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  FileSignature,
  Stamp,
  Users,
  UserCheck,
  Calendar,
  MapPin,
  FileText,
  Send,
} from 'lucide-react';
import { useStore } from '@/store';
import StatusBadge from '@/components/StatusBadge';

export default function NewApplication() {
  const navigate = useNavigate();
  const { seals, addApplication } = useStore();

  const availableSeals = seals.filter((s) => s.status === 'available');

  const [formData, setFormData] = useState({
    sealId: '',
    applicant: '',
    department: '',
    purpose: '',
    documentType: '',
    destination: '',
    expectedReturn: '',
    companion: '',
    approver: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.sealId) newErrors.sealId = '请选择印章';
    if (!formData.applicant.trim()) newErrors.applicant = '请输入申请人';
    if (!formData.department.trim()) newErrors.department = '请输入部门';
    if (!formData.purpose.trim()) newErrors.purpose = '请输入用途';
    if (!formData.documentType.trim()) newErrors.documentType = '请输入文件类型';
    if (!formData.destination.trim()) newErrors.destination = '请输入目的地';
    if (!formData.expectedReturn) newErrors.expectedReturn = '请选择预计归还时间';
    if (!formData.approver.trim()) newErrors.approver = '请输入审批人';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    addApplication({
      sealId: formData.sealId,
      applicant: formData.applicant.trim(),
      department: formData.department.trim(),
      purpose: formData.purpose.trim(),
      documentType: formData.documentType.trim(),
      destination: formData.destination.trim(),
      expectedReturn: new Date(formData.expectedReturn).toISOString(),
      companion: formData.companion.trim() || '无',
      approver: formData.approver.trim(),
    });

    navigate('/applications');
  };

  const selectedSeal = seals.find((s) => s.id === formData.sealId);

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
        <div>
          <h1 className="text-2xl font-serif font-bold text-primary-800 flex items-center gap-3">
            <FileSignature className="w-7 h-7 text-gold-500" />
            发起外带申请
          </h1>
          <p className="text-sm text-primary-500 mt-1">填写印章外带申请信息，提交后等待审批</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="card-seal p-6">
              <h2 className="section-title flex items-center gap-2">
                <Stamp className="w-5 h-5 text-gold-500" />
                印章选择
              </h2>
              <div className="space-y-3">
                <label className="label-seal">
                  选择印章 <span className="text-seal-red">*</span>
                </label>
                <select
                  value={formData.sealId}
                  onChange={(e) => handleChange('sealId', e.target.value)}
                  className={`input-seal ${errors.sealId ? 'border-seal-red focus:ring-red-100' : ''}`}
                >
                  <option value="">请选择可用印章</option>
                  {availableSeals.map((seal) => (
                    <option key={seal.id} value={seal.id}>
                      {seal.type} - {seal.sealNumber}（保管人：{seal.custodian}）
                    </option>
                  ))}
                </select>
                {errors.sealId && (
                  <p className="text-xs text-seal-red mt-1">{errors.sealId}</p>
                )}

                {selectedSeal && (
                  <div className="mt-4 p-4 bg-primary-50/50 rounded-lg border border-primary-100">
                    <div className="flex items-start gap-4">
                      <img
                        src={selectedSeal.photoUrl}
                        alt={selectedSeal.type}
                        className="w-20 h-20 rounded-lg object-cover border border-primary-100"
                      />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-serif font-semibold text-primary-800 text-lg">
                            {selectedSeal.type}
                          </span>
                          <StatusBadge type="seal" status={selectedSeal.status} />
                          <StatusBadge type="risk" status={selectedSeal.riskLevel} />
                        </div>
                        <p className="text-sm text-primary-500">
                          编号：{selectedSeal.sealNumber} · 保管人：{selectedSeal.custodian}
                        </p>
                        <p className="text-sm text-primary-600">
                          适用范围：{selectedSeal.scope}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="card-seal p-6">
              <h2 className="section-title flex items-center gap-2">
                <Users className="w-5 h-5 text-gold-500" />
                申请人员信息
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label-seal">
                    申请人 <span className="text-seal-red">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.applicant}
                    onChange={(e) => handleChange('applicant', e.target.value)}
                    placeholder="请输入申请人姓名"
                    className={`input-seal ${errors.applicant ? 'border-seal-red focus:ring-red-100' : ''}`}
                  />
                  {errors.applicant && (
                    <p className="text-xs text-seal-red mt-1">{errors.applicant}</p>
                  )}
                </div>
                <div>
                  <label className="label-seal">
                    部门 <span className="text-seal-red">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => handleChange('department', e.target.value)}
                    placeholder="请输入所属部门"
                    className={`input-seal ${errors.department ? 'border-seal-red focus:ring-red-100' : ''}`}
                  />
                  {errors.department && (
                    <p className="text-xs text-seal-red mt-1">{errors.department}</p>
                  )}
                </div>
                <div>
                  <label className="label-seal">陪同人</label>
                  <input
                    type="text"
                    value={formData.companion}
                    onChange={(e) => handleChange('companion', e.target.value)}
                    placeholder="如单独前往请留空"
                    className="input-seal"
                  />
                </div>
                <div>
                  <label className="label-seal">
                    审批人 <span className="text-seal-red">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.approver}
                    onChange={(e) => handleChange('approver', e.target.value)}
                    placeholder="请输入审批人姓名"
                    className={`input-seal ${errors.approver ? 'border-seal-red focus:ring-red-100' : ''}`}
                  />
                  {errors.approver && (
                    <p className="text-xs text-seal-red mt-1">{errors.approver}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="card-seal p-6">
              <h2 className="section-title flex items-center gap-2">
                <FileText className="w-5 h-5 text-gold-500" />
                用印详情
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="label-seal">
                    用途说明 <span className="text-seal-red">*</span>
                  </label>
                  <textarea
                    value={formData.purpose}
                    onChange={(e) => handleChange('purpose', e.target.value)}
                    placeholder="请详细说明外带印章的用途..."
                    rows={4}
                    className={`input-seal resize-none ${errors.purpose ? 'border-seal-red focus:ring-red-100' : ''}`}
                  />
                  {errors.purpose && (
                    <p className="text-xs text-seal-red mt-1">{errors.purpose}</p>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label-seal">
                      文件类型 <span className="text-seal-red">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.documentType}
                      onChange={(e) => handleChange('documentType', e.target.value)}
                      placeholder="如：银行贷款合同、采购协议等"
                      className={`input-seal ${errors.documentType ? 'border-seal-red focus:ring-red-100' : ''}`}
                    />
                    {errors.documentType && (
                      <p className="text-xs text-seal-red mt-1">{errors.documentType}</p>
                    )}
                  </div>
                  <div>
                    <label className="label-seal">
                      <MapPin className="w-4 h-4 inline mr-1 -mt-0.5" />
                      目的地 <span className="text-seal-red">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.destination}
                      onChange={(e) => handleChange('destination', e.target.value)}
                      placeholder="请输入外带目的地"
                      className={`input-seal ${errors.destination ? 'border-seal-red focus:ring-red-100' : ''}`}
                    />
                    {errors.destination && (
                      <p className="text-xs text-seal-red mt-1">{errors.destination}</p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="label-seal">
                    <Calendar className="w-4 h-4 inline mr-1 -mt-0.5" />
                    预计归还时间 <span className="text-seal-red">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.expectedReturn}
                    onChange={(e) => handleChange('expectedReturn', e.target.value)}
                    className={`input-seal ${errors.expectedReturn ? 'border-seal-red focus:ring-red-100' : ''}`}
                  />
                  {errors.expectedReturn && (
                    <p className="text-xs text-seal-red mt-1">{errors.expectedReturn}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="card-seal p-6 sticky top-6">
              <h2 className="section-title flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-gold-500" />
                提交申请
              </h2>
              <p className="text-sm text-primary-500 mb-6">
                请仔细核对以上信息，提交后将进入审批流程。
              </p>
              <div className="space-y-3">
                <button
                  type="submit"
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  提交申请
                </button>
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="btn-secondary w-full"
                >
                  取消
                </button>
              </div>
              <div className="mt-6 p-4 bg-gold-50 rounded-lg border border-gold-200">
                <p className="text-xs text-gold-700 leading-relaxed">
                  <strong>温馨提示：</strong>印章外带需严格遵守公司印章管理规定，外带期间请妥善保管，确保印章安全。
                </p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
