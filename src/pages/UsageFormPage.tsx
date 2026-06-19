import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Box,
  User,
  UserCheck,
  Droplets,
  Activity,
  Save,
  MapPin,
  Clock,
  Camera,
} from 'lucide-react';
import { Device, DeviceStatus, MaskType, MaskTypeLabel } from '@shared/types';
import { api } from '@/lib/api';
import { useAppStore } from '@/store';

const DOCTORS = ['张医生', '李医生', '王医生', '刘医生', '陈医生'];
const MEDICINE_OPTIONS = [
  '布地奈德混悬液',
  '硫酸特布他林',
  '异丙托溴铵溶液',
  '乙酰半胱氨酸',
  '布地奈德+特布他林',
];

interface FormData {
  deviceId: string;
  patientName: string;
  patientAge: number;
  doctor: string;
  medicine: string;
  medicineDose: number;
  maskType: MaskType;
  durationMinutes: number;
}

const STEPS = [
  { title: '选择设备', icon: Box },
  { title: '患者信息', icon: User },
  { title: '治疗信息', icon: Droplets },
  { title: '确认提交', icon: CheckCircle2 },
];

function UsageFormPage() {
  const navigate = useNavigate();
  const { devices, fetchDevices } = useAppStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    deviceId: '',
    patientName: '',
    patientAge: 0,
    doctor: '',
    medicine: '',
    medicineDose: 2,
    maskType: MaskType.ADULT,
    durationMinutes: 15,
  });

  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  const availableDevices = devices.filter(
    (d) => d.status === DeviceStatus.AVAILABLE
  );

  const updateForm = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return !!formData.deviceId;
      case 1: return !!formData.patientName && formData.patientAge > 0 && !!formData.doctor;
      case 2: return !!formData.medicine && formData.medicineDose > 0 && formData.durationMinutes > 0;
      default: return true;
    }
  };

  const handleNext = () => {
    if (!canProceed()) {
      alert('请填写当前步骤的必填项');
      return;
    }
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await api.createUsage(formData);
      navigate('/usage');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const selectedDevice = availableDevices.find((d) => d.id === formData.deviceId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/usage" className="btn-ghost !p-2">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="p-2 rounded-lg bg-indigo-100">
            <Plus className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">新建使用记录</h1>
            <p className="text-sm text-slate-500">按步骤完成使用记录的创建</p>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-8">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isActive = idx === currentStep;
            const isCompleted = idx < currentStep;
            return (
              <div key={idx} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                      isCompleted
                        ? 'bg-green-500 text-white'
                        : isActive
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  <span
                    className={`mt-2 text-sm font-medium ${
                      isActive ? 'text-indigo-600' : isCompleted ? 'text-green-600' : 'text-slate-400'
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 mb-5 transition-colors ${
                      isCompleted ? 'bg-green-400' : 'bg-slate-200'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {currentStep === 0 && (
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Box className="w-5 h-5 text-slate-600" />
              选择可用设备
            </h3>
            {availableDevices.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableDevices.map((device: Device) => {
                  const selected = formData.deviceId === device.id;
                  return (
                    <div
                      key={device.id}
                      onClick={() => updateForm('deviceId', device.id)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        selected
                          ? 'border-indigo-500 bg-indigo-50 shadow-md'
                          : 'border-slate-200 hover:border-indigo-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex gap-4">
                        <div className="w-20 h-20 rounded-lg overflow-hidden border border-slate-200 bg-slate-50 flex-shrink-0">
                          {device.photo ? (
                            <img src={device.photo} alt={device.code} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Camera className="w-8 h-8 text-slate-300" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-900 truncate">{device.code}</p>
                          <p className="text-sm text-slate-600 mt-0.5">
                            {device.brand} {device.model}
                          </p>
                          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {device.clinicRoom}
                          </p>
                          {selected && (
                            <span className="mt-2 inline-flex items-center text-xs font-medium text-indigo-600">
                              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                              已选择
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                <Box className="w-16 h-16 mb-4 text-slate-300" />
                <p className="font-medium text-lg">暂无可用设备</p>
                <p className="text-sm">请等待设备结束使用或完成消毒后再创建记录</p>
              </div>
            )}
          </div>
        )}

        {currentStep === 1 && (
          <div className="max-w-2xl mx-auto space-y-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-slate-600" />
              填写患者与医生信息
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="label">患者姓名 <span className="text-red-500">*</span></label>
                <input
                  type="text" className="input" placeholder="请输入患者姓名"
                  value={formData.patientName}
                  onChange={(e) => updateForm('patientName', e.target.value)} />
              </div>
              <div>
                <label className="label">患者年龄 <span className="text-red-500">*</span></label>
                <input
                  type="number" className="input" min="0" max="120" placeholder="请输入年龄"
                  value={formData.patientAge || ''}
                  onChange={(e) => updateForm('patientAge', Number(e.target.value))} />
              </div>
              <div className="md:col-span-2">
                <label className="label"><UserCheck className="w-3.5 h-3.5 inline mr-1" />主治医生 <span className="text-red-500">*</span></label>
                <select
                  className="select" value={formData.doctor}
                  onChange={(e) => updateForm('doctor', e.target.value)} >
                  <option value="">请选择主治医生</option>
                  {DOCTORS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="max-w-2xl mx-auto space-y-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Droplets className="w-5 h-5 text-slate-600" />
              填写治疗信息
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="label">药液名称 <span className="text-red-500">*</span></label>
                <select
                  className="select" value={formData.medicine}
                  onChange={(e) => updateForm('medicine', e.target.value)} >
                  <option value="">请选择药液</option>
                  {MEDICINE_OPTIONS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">药液剂量 (ml) <span className="text-red-500">*</span></label>
                <input
                  type="number" className="input" min="0.5" step="0.5"
                  value={formData.medicineDose}
                  onChange={(e) => updateForm('medicineDose', Number(e.target.value))} />
              </div>
              <div>
                <label className="label">面罩类型</label>
                <select
                  className="select" value={formData.maskType}
                  onChange={(e) => updateForm('maskType', e.target.value as MaskType)} >
                  {Object.entries(MaskTypeLabel).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="label"><Clock className="w-3.5 h-3.5 inline mr-1" />预计时长 (分钟) <span className="text-red-500">*</span></label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {[10, 15, 20, 25, 30].map((mins) => (
                    <button
                      key={mins} type="button"
                      onClick={() => updateForm('durationMinutes', mins)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        formData.durationMinutes === mins
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {mins}分钟
                    </button>
                  ))}
                </div>
                <input
                  type="number" className="input" min="5" max="120"
                  value={formData.durationMinutes}
                  onChange={(e) => updateForm('durationMinutes', Number(e.target.value))} />
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-slate-600" />
              确认使用信息
            </h3>
            <div className="space-y-4">
              {[
                { label: '设备编号', value: selectedDevice?.code || '-' },
                { label: '设备型号', value: selectedDevice ? `${selectedDevice.brand} ${selectedDevice.model}` : '-' },
                { label: '所在诊室', value: selectedDevice?.clinicRoom || '-' },
                { label: '患者姓名', value: formData.patientName },
                { label: '患者年龄', value: `${formData.patientAge}岁` },
                { label: '主治医生', value: formData.doctor },
                { label: '药液名称', value: formData.medicine },
                { label: '药液剂量', value: `${formData.medicineDose}ml` },
                { label: '面罩类型', value: MaskTypeLabel[formData.maskType] },
                { label: '预计时长', value: `${formData.durationMinutes}分钟` },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                  <span className="text-sm text-slate-500">{item.label}</span>
                  <span className="text-sm font-medium text-slate-800">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={handlePrev} disabled={currentStep === 0}
          className="btn-secondary disabled:opacity-40"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          上一步
        </button>
        {currentStep < STEPS.length - 1 ? (
          <button onClick={handleNext} disabled={!canProceed()} className="btn-primary">
            下一步
            <ChevronRight className="w-4 h-4 ml-2" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting || !canProceed()}
            className="btn-success"
          >
            <Save className="w-4 h-4 mr-2" />
            {submitting ? '提交中...' : '确认创建'}
          </button>
        )}
      </div>
    </div>
  );
}

export default UsageFormPage;
