import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Plus, User, Pill, FileText, AlertCircle, ShieldAlert, AlertTriangle, Heart } from 'lucide-react';
import { useMedicineStore } from '@/store/medicineStore';
import { getMedicineStatus } from '@/utils/medicine';
import type { Medicine, ContraindicatedMedicine, ContraindicationReason } from '@/types';

export default function RecordForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addRecord, medicines, familyMembers, getContraindicatedMedicines } = useMedicineStore();
  
  const medicineId = searchParams.get('medicineId');
  const preselectedMedicine = medicineId ? medicines.find(m => m.id === medicineId) : undefined;

  const [formData, setFormData] = useState({
    medicineId: preselectedMedicine?.id || '',
    medicineName: preselectedMedicine?.name || '',
    familyMemberId: '',
    userName: '',
    dosage: '',
    symptoms: '',
    needFollowUp: false,
    followUpDate: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleMemberChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    const member = familyMembers.find(m => m.id === selectedId);
    if (member) {
      setFormData(prev => ({
        ...prev,
        familyMemberId: member.id,
        userName: member.name,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        familyMemberId: '',
        userName: '',
      }));
    }
  };

  const contraindicationWarning = useMemo(() => {
    if (!formData.familyMemberId || !formData.medicineId) return null;
    
    const contraindicatedList = getContraindicatedMedicines(formData.familyMemberId) as ContraindicatedMedicine[];
    const matched = contraindicatedList.find(
      (m) => m.id === formData.medicineId
    );
    
    if (!matched) return null;
    
    const member = familyMembers.find(m => m.id === formData.familyMemberId);
    return {
      memberName: member?.name || formData.userName,
      medicineName: matched.name,
      reasons: matched.reasons,
    };
  }, [formData.familyMemberId, formData.medicineId, formData.userName, getContraindicatedMedicines, familyMembers]);

  const availableMedicines = medicines.filter(m => {
    const status = getMedicineStatus(m);
    return status.color !== 'red' && m.quantity > 0;
  });

  const handleMedicineChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    const medicine = medicines.find(m => m.id === selectedId);
    if (medicine) {
      setFormData(prev => ({
        ...prev,
        medicineId: medicine.id,
        medicineName: medicine.name,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        medicineId: '',
        medicineName: '',
      }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.userName.trim()) newErrors.userName = '请输入使用者姓名';
    if (!formData.medicineName.trim()) newErrors.medicineName = '请输入或选择药品';
    if (!formData.dosage.trim()) newErrors.dosage = '请输入用量';
    
    if (formData.needFollowUp && !formData.followUpDate) {
      newErrors.followUpDate = '请选择复诊日期';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    addRecord({
      medicineId: formData.medicineId || undefined,
      medicineName: formData.medicineName,
      userName: formData.userName,
      dosage: formData.dosage,
      symptoms: formData.symptoms,
      needFollowUp: formData.needFollowUp,
      followUpDate: formData.followUpDate || undefined,
      notes: formData.notes || undefined,
    });

    navigate('/records');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-xl font-bold text-gray-800">记录用药</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-primary-600" />
                使用者 <span className="text-danger-500">*</span>
              </div>
            </label>
            {familyMembers.length > 0 ? (
              <div className="space-y-2">
                <select
                  value={formData.familyMemberId}
                  onChange={handleMemberChange}
                  className={`w-full px-4 py-2.5 rounded-xl border ${errors.userName ? 'border-danger-300 focus:ring-danger-200' : 'border-gray-200 focus:ring-primary-200'} focus:outline-none focus:ring-2 transition-colors bg-white`}
                >
                  <option value="">-- 选择家庭成员 --</option>
                  {familyMembers.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name}（{member.relation}）
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 text-center">或手动输入</p>
              </div>
            ) : null}
            <input
              type="text"
              value={formData.userName}
              onChange={(e) => setFormData(prev => ({ ...prev, userName: e.target.value, familyMemberId: '' }))}
              className={`w-full px-4 py-2.5 rounded-xl border ${errors.userName ? 'border-danger-300 focus:ring-danger-200' : 'border-gray-200 focus:ring-primary-200'} focus:outline-none focus:ring-2 transition-colors`}
              placeholder="手动输入使用者姓名，如：爸爸、妈妈、小明"
            />
            {errors.userName && <p className="text-xs text-danger-500 mt-1">{errors.userName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              <div className="flex items-center gap-2">
                <Pill className="w-4 h-4 text-primary-600" />
                药品 <span className="text-danger-500">*</span>
              </div>
            </label>
            {availableMedicines.length > 0 ? (
              <div className="space-y-2">
                <select
                  value={formData.medicineId}
                  onChange={handleMedicineChange}
                  className={`w-full px-4 py-2.5 rounded-xl border ${errors.medicineName ? 'border-danger-300 focus:ring-danger-200' : 'border-gray-200 focus:ring-primary-200'} focus:outline-none focus:ring-2 transition-colors bg-white`}
                >
                  <option value="">-- 选择已有药品 --</option>
                  {availableMedicines.map((medicine) => (
                    <option key={medicine.id} value={medicine.id}>
                      {medicine.name} ({medicine.specification}) - 剩余{medicine.quantity}份
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 text-center">或手动输入</p>
              </div>
            ) : null}
            <input
              type="text"
              value={formData.medicineName}
              onChange={(e) => setFormData(prev => ({ ...prev, medicineName: e.target.value, medicineId: '' }))}
              className={`w-full px-4 py-2.5 rounded-xl border ${errors.medicineName ? 'border-danger-300 focus:ring-danger-200' : 'border-gray-200 focus:ring-primary-200'} focus:outline-none focus:ring-2 transition-colors`}
              placeholder="手动输入药品名称"
            />
            {errors.medicineName && <p className="text-xs text-danger-500 mt-1">{errors.medicineName}</p>}
          </div>

          {contraindicationWarning && (
            <div className="bg-danger-50 border border-danger-200 rounded-xl p-4 animate-pulse-slow">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-danger-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <ShieldAlert className="w-5 h-5 text-danger-600" />
                </div>
                <div className="flex-1 space-y-2">
                  <p className="font-semibold text-danger-800 text-sm">
                    ⚠️ 禁忌提醒：{contraindicationWarning.memberName} 不宜使用 {contraindicationWarning.medicineName}
                  </p>
                  <div className="space-y-1.5">
                    {contraindicationWarning.reasons.map((reason: ContraindicationReason, idx: number) => (
                      <div key={idx} className="flex items-start gap-1.5 bg-white/60 rounded-lg px-3 py-2">
                        {reason.type === 'allergy' || reason.type === 'allergy_constitution' ? (
                          <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                        ) : (
                          <Heart className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                        )}
                        <div className="text-xs">
                          <span className={`font-semibold ${
                            reason.type === 'allergy' || reason.type === 'allergy_constitution'
                              ? 'text-red-600'
                              : 'text-orange-600'
                          }`}>
                            {reason.label}
                          </span>
                          <span className="text-gray-600 ml-1">· {reason.detail}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-danger-600 font-medium">
                    请斟酌后再决定是否保存记录，或咨询医生意见
                  </p>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              <div className="flex items-center gap-2">
                <Pill className="w-4 h-4 text-primary-600" />
                用量 <span className="text-danger-500">*</span>
              </div>
            </label>
            <input
              type="text"
              value={formData.dosage}
              onChange={(e) => setFormData(prev => ({ ...prev, dosage: e.target.value }))}
              className={`w-full px-4 py-2.5 rounded-xl border ${errors.dosage ? 'border-danger-300 focus:ring-danger-200' : 'border-gray-200 focus:ring-primary-200'} focus:outline-none focus:ring-2 transition-colors`}
              placeholder="如：1粒、5ml、1袋"
            />
            {errors.dosage && <p className="text-xs text-danger-500 mt-1">{errors.dosage}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary-600" />
                症状
              </div>
            </label>
            <textarea
              value={formData.symptoms}
              onChange={(e) => setFormData(prev => ({ ...prev, symptoms: e.target.value }))}
              rows={2}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-200 transition-colors resize-none"
              placeholder="描述当时的症状，如：发烧38.5度、头痛、咳嗽"
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-warning-600" />
              <h2 className="font-semibold text-gray-800">需要复诊？</h2>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.needFollowUp}
                onChange={(e) => setFormData(prev => ({ ...prev, needFollowUp: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-warning-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-warning-500"></div>
            </label>
          </div>

          {formData.needFollowUp && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                复诊日期 <span className="text-danger-500">*</span>
              </label>
              <input
                type="date"
                value={formData.followUpDate}
                onChange={(e) => setFormData(prev => ({ ...prev, followUpDate: e.target.value }))}
                min={new Date().toISOString().split('T')[0]}
                className={`w-full px-4 py-2.5 rounded-xl border ${errors.followUpDate ? 'border-danger-300 focus:ring-danger-200' : 'border-gray-200 focus:ring-primary-200'} focus:outline-none focus:ring-2 transition-colors`}
              />
              {errors.followUpDate && <p className="text-xs text-danger-500 mt-1">{errors.followUpDate}</p>}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              备注
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={2}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-200 transition-colors resize-none"
              placeholder="其他需要记录的信息，如：用药后反应、医生叮嘱等"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button
            type="submit"
            className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-medium shadow-lg shadow-primary-200 hover:shadow-xl hover:shadow-primary-300 transition-all"
          >
            保存记录
          </button>
        </div>
      </form>
    </div>
  );
}
