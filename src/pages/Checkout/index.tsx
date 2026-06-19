import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Camera,
  Package,
  Calendar,
  Hash,
  Image as ImageIcon,
  ArrowLeft,
  CheckCircle,
} from 'lucide-react';
import { useStore } from '@/store';
import { formatDate } from '@/utils/helpers';
import StatusBadge from '@/components/StatusBadge';

const SAMPLE_PHOTO_URL =
  'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=sealed%20brown%20envelope%20with%20official%20seal%20inside%20registered%20package%20security%20tape&image_size=square';

export default function Checkout() {
  const navigate = useNavigate();
  const { applicationId } = useParams<{ applicationId: string }>();

  const application = useStore((s) => s.getApplicationById(applicationId || ''));
  const seal = useStore((s) => s.getSealById(application?.sealId || ''));
  const addRecord = useStore((s) => s.addRecord);
  const updateApplicationStatus = useStore((s) => s.updateApplicationStatus);

  const [envelopeNumber, setEnvelopeNumber] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [errors, setErrors] = useState<{ envelopeNumber?: string; photoUrl?: string }>({});
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSimulatePhoto = () => {
    setPhotoUrl(SAMPLE_PHOTO_URL);
    if (errors.photoUrl) {
      setErrors((prev) => ({ ...prev, photoUrl: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: { envelopeNumber?: string; photoUrl?: string } = {};
    if (!envelopeNumber.trim()) {
      newErrors.envelopeNumber = '请输入封套编号';
    }
    if (!photoUrl.trim()) {
      newErrors.photoUrl = '请上传外带照片';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate() || !application || !seal) return;

    addRecord({
      applicationId: application.id,
      sealId: seal.id,
      envelopeNumber: envelopeNumber.trim(),
      checkoutPhoto: photoUrl.trim(),
      checkoutTime: new Date().toISOString(),
      status: 'checked_out',
    });

    updateApplicationStatus(application.id, 'checked_out');

    setShowSuccess(true);
    setTimeout(() => {
      navigate(`/applications/${application.id}`, { state: { checkoutSuccess: true } });
    }, 1200);
  };

  if (!application || !seal) {
    return (
      <div className="card-seal p-8 text-center text-primary-500">
        未找到对应的申请或印章信息
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
          外带登记
        </h2>
      </div>

      <div className="card-seal p-6 space-y-4">
        <h3 className="section-title flex items-center gap-2">
          <Package className="w-5 h-5 text-gold-500" />
          申请与印章信息
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-primary-500">申请人</p>
                <p className="font-medium text-primary-800">{application.applicant}</p>
              </div>
              <StatusBadge type="application" status={application.status} />
            </div>
            <div>
              <p className="text-sm text-primary-500">所属部门</p>
              <p className="font-medium text-primary-800">{application.department}</p>
            </div>
            <div>
              <p className="text-sm text-primary-500">用印用途</p>
              <p className="font-medium text-primary-800">{application.purpose}</p>
            </div>
            <div>
              <p className="text-sm text-primary-500">文件类型</p>
              <p className="font-medium text-primary-800">{application.documentType}</p>
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
            <div>
              <p className="text-sm text-primary-500">印章保管人</p>
              <p className="font-medium text-primary-800">{seal.custodian}</p>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary-400" />
              <p className="text-sm text-primary-500">预计归还：</p>
              <p className="font-medium text-primary-800">
                {formatDate(application.expectedReturn)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="card-seal p-6 space-y-5">
        <h3 className="section-title flex items-center gap-2">
          <Hash className="w-5 h-5 text-gold-500" />
          登记信息
        </h3>

        <div>
          <label className="label-seal">
            封套编号 <span className="text-seal-red">*</span>
          </label>
          <input
            type="text"
            value={envelopeNumber}
            onChange={(e) => {
              setEnvelopeNumber(e.target.value);
              if (errors.envelopeNumber) {
                setErrors((prev) => ({ ...prev, envelopeNumber: undefined }));
              }
            }}
            placeholder="例如：FT-2024-XXXX-XXX"
            className={`input-seal ${
              errors.envelopeNumber ? 'border-seal-red focus:ring-red-100' : ''
            }`}
          />
          {errors.envelopeNumber && (
            <p className="mt-1 text-sm text-seal-red">{errors.envelopeNumber}</p>
          )}
        </div>

        <div>
          <label className="label-seal">
            外带照片 <span className="text-seal-red">*</span>
          </label>

          {!photoUrl ? (
            <div
              className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-4 bg-seal-paper transition-colors ${
                errors.photoUrl
                  ? 'border-seal-red bg-red-50/30'
                  : 'border-primary-200 hover:border-primary-400'
              }`}
            >
              <div className="w-16 h-16 rounded-full bg-primary-50 flex items-center justify-center">
                <Camera className="w-8 h-8 text-primary-400" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-primary-700 font-medium">点击下方按钮模拟拍照</p>
                <p className="text-sm text-primary-400">
                  系统将自动填充示例图片URL
                </p>
              </div>
              <input
                type="text"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="或在此粘贴图片URL"
                className="input-seal max-w-md text-center"
              />
              <button
                type="button"
                onClick={handleSimulatePhoto}
                className="btn-secondary flex items-center gap-2"
              >
                <Camera className="w-4 h-4" />
                模拟拍照
              </button>
              {errors.photoUrl && (
                <p className="text-sm text-seal-red">{errors.photoUrl}</p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative max-w-sm mx-auto">
                <img
                  src={photoUrl}
                  alt="外带照片预览"
                  className="w-full h-64 object-cover rounded-xl border border-primary-200 shadow-seal"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.opacity = '0.5';
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="bg-primary-800/70 text-white px-3 py-1.5 rounded-lg flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    <span className="text-sm">外带照片预览</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 max-w-sm mx-auto">
                <input
                  type="text"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="图片URL"
                  className="input-seal flex-1 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setPhotoUrl('')}
                  className="btn-ghost text-sm"
                >
                  重拍
                </button>
              </div>
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
          className="btn-primary flex items-center gap-2"
        >
          <CheckCircle className="w-4 h-4" />
          确认外带
        </button>
      </div>

      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-2xl shadow-xl px-8 py-6 flex items-center gap-4 animate-in fade-in zoom-in duration-300">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-7 h-7 text-green-600" />
            </div>
            <div>
              <p className="font-serif text-lg font-semibold text-primary-800">外带登记成功</p>
              <p className="text-sm text-primary-500 mt-0.5">正在跳转到申请详情...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
