import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { useStore } from '@/store/useStore';
import type { Headset, ConnectionType } from '@/types';
import { connectionTypeLabels, cabinetOptions, meetingSoftwareOptions } from '@/types';

interface HeadsetFormProps {
  mode: 'create' | 'edit';
}

export default function HeadsetForm({ mode }: HeadsetFormProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { headsets, addHeadset, updateHeadset } = useStore();
  
  const existingHeadset = id ? headsets.find(h => h.id === id) : null;
  
  const [formData, setFormData] = useState<Omit<Headset, 'id' | 'createdAt'>>({
    brand: '',
    model: '',
    connectionType: 'bluetooth',
    serialNumber: '',
    cabinet: cabinetOptions[0],
    compatibleSoftware: [],
    batteryLevel: 100,
    photo: '',
    status: 'available',
    receiverLost: false,
    microphoneIssue: false,
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (mode === 'edit' && existingHeadset) {
      setFormData({
        brand: existingHeadset.brand,
        model: existingHeadset.model,
        connectionType: existingHeadset.connectionType,
        serialNumber: existingHeadset.serialNumber,
        cabinet: existingHeadset.cabinet,
        compatibleSoftware: existingHeadset.compatibleSoftware,
        batteryLevel: existingHeadset.batteryLevel,
        photo: existingHeadset.photo,
        status: existingHeadset.status,
        receiverLost: existingHeadset.receiverLost,
        microphoneIssue: existingHeadset.microphoneIssue,
      });
    }
  }, [mode, existingHeadset]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.brand.trim()) newErrors.brand = '请输入品牌';
    if (!formData.model.trim()) newErrors.model = '请输入型号';
    if (!formData.serialNumber.trim()) newErrors.serialNumber = '请输入编号';
    if (!formData.photo.trim()) newErrors.photo = '请输入照片URL';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    if (mode === 'create') {
      addHeadset(formData);
    } else if (existingHeadset) {
      updateHeadset(existingHeadset.id, formData);
    }
    
    navigate('/headsets');
  };

  const handleSoftwareToggle = (software: string) => {
    setFormData(prev => ({
      ...prev,
      compatibleSoftware: prev.compatibleSoftware.includes(software)
        ? prev.compatibleSoftware.filter(s => s !== software)
        : [...prev.compatibleSoftware, software]
    }));
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/headsets')}
          className="btn btn-secondary flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          返回
        </button>
        <h1 className="text-2xl font-bold text-slate-900">
          {mode === 'create' ? '新增耳麦档案' : '编辑耳麦档案'}
        </h1>
      </div>
      
      <form onSubmit={handleSubmit} className="card space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">品牌 *</label>
            <input
              type="text"
              className={`input ${errors.brand ? 'border-red-500' : ''}`}
              value={formData.brand}
              onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
              placeholder="如：Jabra"
            />
            {errors.brand && <p className="text-red-500 text-sm mt-1">{errors.brand}</p>}
          </div>
          
          <div>
            <label className="label">型号 *</label>
            <input
              type="text"
              className={`input ${errors.model ? 'border-red-500' : ''}`}
              value={formData.model}
              onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
              placeholder="如：Evolve2 65"
            />
            {errors.model && <p className="text-red-500 text-sm mt-1">{errors.model}</p>}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">连接方式</label>
            <select
              className="input"
              value={formData.connectionType}
              onChange={(e) => setFormData(prev => ({ ...prev, connectionType: e.target.value as ConnectionType }))}
            >
              {Object.entries(connectionTypeLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="label">编号 *</label>
            <input
              type="text"
              className={`input ${errors.serialNumber ? 'border-red-500' : ''}`}
              value={formData.serialNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, serialNumber: e.target.value }))}
              placeholder="如：JBR-2024-001"
            />
            {errors.serialNumber && <p className="text-red-500 text-sm mt-1">{errors.serialNumber}</p>}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">所在柜子</label>
            <select
              className="input"
              value={formData.cabinet}
              onChange={(e) => setFormData(prev => ({ ...prev, cabinet: e.target.value }))}
            >
              {cabinetOptions.map((cabinet) => (
                <option key={cabinet} value={cabinet}>{cabinet}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="label">电池电量 (%)</label>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              className="w-full"
              value={formData.batteryLevel}
              onChange={(e) => setFormData(prev => ({ ...prev, batteryLevel: Number(e.target.value) }))}
            />
            <div className="text-center text-sm text-slate-600 mt-1">
              {formData.batteryLevel === 0 ? '有线设备' : `${formData.batteryLevel}%`}
            </div>
          </div>
        </div>
        
        <div>
          <label className="label">照片URL *</label>
          <input
            type="url"
            className={`input ${errors.photo ? 'border-red-500' : ''}`}
            value={formData.photo}
            onChange={(e) => setFormData(prev => ({ ...prev, photo: e.target.value }))}
            placeholder="https://..."
          />
          {errors.photo && <p className="text-red-500 text-sm mt-1">{errors.photo}</p>}
          {formData.photo && (
            <div className="mt-2 w-32 h-32 rounded-lg overflow-hidden border border-slate-200">
              <img 
                src={formData.photo} 
                alt="预览" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}
        </div>
        
        <div>
          <label className="label">适配会议软件</label>
          <div className="flex flex-wrap gap-2">
            {meetingSoftwareOptions.map((software) => (
              <button
                key={software}
                type="button"
                onClick={() => handleSoftwareToggle(software)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  formData.compatibleSoftware.includes(software)
                    ? 'bg-primary-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {software}
              </button>
            ))}
          </div>
        </div>
        
        <div>
          <label className="label">状态</label>
          <select
            className="input"
            value={formData.status}
            onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as Headset['status'] }))}
          >
            <option value="available">可借用</option>
            <option value="borrowed">已借出</option>
            <option value="faulty">故障</option>
            <option value="maintenance">维修中</option>
          </select>
        </div>
        
        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
              checked={formData.receiverLost}
              onChange={(e) => setFormData(prev => ({ ...prev, receiverLost: e.target.checked }))}
            />
            <span className="text-sm text-slate-700">接收器丢失</span>
          </label>
          
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
              checked={formData.microphoneIssue}
              onChange={(e) => setFormData(prev => ({ ...prev, microphoneIssue: e.target.checked }))}
            />
            <span className="text-sm text-slate-700">麦克风异常</span>
          </label>
        </div>
        
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={() => navigate('/headsets')}
            className="btn btn-secondary"
          >
            取消
          </button>
          <button
            type="submit"
            className="btn btn-primary flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {mode === 'create' ? '创建' : '保存'}
          </button>
        </div>
      </form>
    </div>
  );
}
