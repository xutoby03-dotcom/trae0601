import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, X, User, FileText, ShieldAlert, Hash, Image, Stamp } from 'lucide-react';
import { useStore } from '@/store';
import type { RiskLevel, SealStatus } from '@/types';

interface FormData {
  type: string;
  sealNumber: string;
  custodian: string;
  scope: string;
  riskLevel: RiskLevel;
  photoUrl: string;
  status: SealStatus;
}

const defaultFormData: FormData = {
  type: '',
  sealNumber: '',
  custodian: '',
  scope: '',
  riskLevel: 'low',
  photoUrl: '',
  status: 'available',
};

export default function SealForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const getSealById = useStore((s) => s.getSealById);
  const addSeal = useStore((s) => s.addSeal);
  const updateSeal = useStore((s) => s.updateSeal);

  const isEdit = Boolean(id);
  const [formData, setFormData] = useState<FormData>(defaultFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  useEffect(() => {
    if (isEdit && id) {
      const seal = getSealById(id);
      if (seal) {
        setFormData({
          type: seal.type,
          sealNumber: seal.sealNumber,
          custodian: seal.custodian,
          scope: seal.scope,
          riskLevel: seal.riskLevel,
          photoUrl: seal.photoUrl,
          status: seal.status,
        });
      } else {
        navigate('/seals');
      }
    }
  }, [isEdit, id, getSealById, navigate]);

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value as never }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    if (!formData.type.trim()) newErrors.type = '请输入印章类型';
    if (!formData.sealNumber.trim()) newErrors.sealNumber = '请输入印章编号';
    if (!formData.custodian.trim()) newErrors.custodian = '请输入保管人';
    if (!formData.scope.trim()) newErrors.scope = '请输入适用范围';
    if (!formData.photoUrl.trim()) newErrors.photoUrl = '请输入照片URL';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (isEdit && id) {
      updateSeal(id, formData);
    } else {
      addSeal(formData);
    }
    navigate('/seals');
  };

  const handleCancel = () => {
    if (isEdit && id) {
      navigate(`/seals/${id}`);
    } else {
      navigate('/seals');
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3">
        <button className="btn-ghost p-2" onClick={handleCancel}>
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="font-serif text-2xl font-bold text-primary-800">
            {isEdit ? '编辑印章' : '新增印章'}
          </h1>
          <p className="text-sm text-primary-500 mt-1">
            {isEdit ? '修改印章的基本信息' : '登记新的印章档案'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card-seal p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="label-seal flex items-center gap-1.5">
              <Stamp className="w-4 h-4 text-gold-500" />
              印章类型 <span className="text-seal-red">*</span>
            </label>
            <input
              type="text"
              className={`input-seal ${errors.type ? 'border-seal-red focus:border-seal-red focus:ring-red-100' : ''}`}
              placeholder="如：公司公章、财务专用章"
              value={formData.type}
              onChange={(e) => handleChange('type', e.target.value)}
            />
            {errors.type && <p className="text-seal-red text-xs mt-1">{errors.type}</p>}
          </div>

          <div>
            <label className="label-seal flex items-center gap-1.5">
              <Hash className="w-4 h-4 text-gold-500" />
              印章编号 <span className="text-seal-red">*</span>
            </label>
            <input
              type="text"
              className={`input-seal ${errors.sealNumber ? 'border-seal-red focus:border-seal-red focus:ring-red-100' : ''}`}
              placeholder="如：GZ-2024-001"
              value={formData.sealNumber}
              onChange={(e) => handleChange('sealNumber', e.target.value)}
            />
            {errors.sealNumber && <p className="text-seal-red text-xs mt-1">{errors.sealNumber}</p>}
          </div>

          <div>
            <label className="label-seal flex items-center gap-1.5">
              <User className="w-4 h-4 text-gold-500" />
              保管人 <span className="text-seal-red">*</span>
            </label>
            <input
              type="text"
              className={`input-seal ${errors.custodian ? 'border-seal-red focus:border-seal-red focus:ring-red-100' : ''}`}
              placeholder="请输入保管人姓名"
              value={formData.custodian}
              onChange={(e) => handleChange('custodian', e.target.value)}
            />
            {errors.custodian && <p className="text-seal-red text-xs mt-1">{errors.custodian}</p>}
          </div>

          <div>
            <label className="label-seal flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-gold-500" />
              风险等级
            </label>
            <select
              className="input-seal"
              value={formData.riskLevel}
              onChange={(e) => handleChange('riskLevel', e.target.value)}
            >
              <option value="low">低风险</option>
              <option value="medium">中风险</option>
              <option value="high">高风险</option>
            </select>
          </div>

          <div>
            <label className="label-seal flex items-center gap-1.5">
              <Stamp className="w-4 h-4 text-gold-500" />
              状态
            </label>
            <select
              className="input-seal"
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
            >
              <option value="available">可用</option>
              <option value="in_use">使用中</option>
              <option value="maintenance">维护中</option>
            </select>
          </div>

          <div>
            <label className="label-seal flex items-center gap-1.5">
              <Image className="w-4 h-4 text-gold-500" />
              照片URL <span className="text-seal-red">*</span>
            </label>
            <input
              type="text"
              className={`input-seal ${errors.photoUrl ? 'border-seal-red focus:border-seal-red focus:ring-red-100' : ''}`}
              placeholder="请输入印章照片链接"
              value={formData.photoUrl}
              onChange={(e) => handleChange('photoUrl', e.target.value)}
            />
            {errors.photoUrl && <p className="text-seal-red text-xs mt-1">{errors.photoUrl}</p>}
          </div>

          <div className="md:col-span-2">
            <label className="label-seal flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-gold-500" />
              适用范围 <span className="text-seal-red">*</span>
            </label>
            <textarea
              className={`input-seal min-h-[100px] resize-y ${errors.scope ? 'border-seal-red focus:border-seal-red focus:ring-red-100' : ''}`}
              placeholder="请详细描述该印章的使用场景和范围"
              value={formData.scope}
              onChange={(e) => handleChange('scope', e.target.value)}
            />
            {errors.scope && <p className="text-seal-red text-xs mt-1">{errors.scope}</p>}
          </div>

          {formData.photoUrl && (
            <div className="md:col-span-2">
              <label className="label-seal">照片预览</label>
              <div className="w-32 h-32 rounded-lg overflow-hidden bg-seal-paper border border-primary-100">
                <img
                  src={formData.photoUrl}
                  alt="预览"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-primary-50">
          <button type="button" className="btn-secondary flex items-center gap-2" onClick={handleCancel}>
            <X className="w-4 h-4" />
            取消
          </button>
          <button type="submit" className="btn-primary flex items-center gap-2">
            <Save className="w-4 h-4" />
            {isEdit ? '保存修改' : '保存'}
          </button>
        </div>
      </form>
    </div>
  );
}
