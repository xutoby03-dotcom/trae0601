import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useStore } from '@/store/useStore';
import {
  SURGERY_TYPE_LABELS,
  ANESTHESIA_TYPE_LABELS,
  SurgeryType,
  AnesthesiaType,
} from '@/types';
import { getTodayString } from '@/utils/date';
import PhotoUploader from '@/components/PhotoUploader';

export default function NewCase() {
  const navigate = useNavigate();
  const { addCase } = useStore();

  const [petName, setPetName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [surgeryType, setSurgeryType] = useState<SurgeryType>('sterilization');
  const [doctor, setDoctor] = useState('');
  const [anesthesiaType, setAnesthesiaType] = useState<AnesthesiaType>('general');
  const [dischargeDate, setDischargeDate] = useState(getTodayString());
  const [photos, setPhotos] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!petName || !ownerName || !ownerPhone || !doctor) {
      return;
    }
    addCase({
      petName,
      ownerName,
      ownerPhone,
      surgeryType,
      doctor,
      anesthesiaType,
      dischargeDate,
      photos,
    });
    navigate('/cases');
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <button
          onClick={() => navigate('/cases')}
          className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-700 text-sm mb-2 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          返回病例列表
        </button>
        <h1 className="text-2xl font-bold text-gray-800">新建病例</h1>
        <p className="text-sm text-gray-500 mt-1">填写宠物术后病例信息</p>
      </div>

      <div className="card p-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="label-field">宠物名 *</label>
              <input
                type="text"
                value={petName}
                onChange={(e) => setPetName(e.target.value)}
                className="input-field"
                placeholder="请输入宠物名"
                required
              />
            </div>
            <div>
              <label className="label-field">主人姓名 *</label>
              <input
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className="input-field"
                placeholder="请输入主人姓名"
                required
              />
            </div>
            <div>
              <label className="label-field">主人电话 *</label>
              <input
                type="tel"
                value={ownerPhone}
                onChange={(e) => setOwnerPhone(e.target.value)}
                className="input-field"
                placeholder="请输入联系电话"
                required
              />
            </div>
            <div>
              <label className="label-field">主治医生 *</label>
              <input
                type="text"
                value={doctor}
                onChange={(e) => setDoctor(e.target.value)}
                className="input-field"
                placeholder="请输入主治医生"
                required
              />
            </div>
            <div>
              <label className="label-field">手术类型</label>
              <select
                value={surgeryType}
                onChange={(e) => setSurgeryType(e.target.value as SurgeryType)}
                className="input-field"
              >
                {Object.entries(SURGERY_TYPE_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-field">麻醉方式</label>
              <select
                value={anesthesiaType}
                onChange={(e) => setAnesthesiaType(e.target.value as AnesthesiaType)}
                className="input-field"
              >
                {Object.entries(ANESTHESIA_TYPE_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-field">出院日期</label>
              <input
                type="date"
                value={dischargeDate}
                onChange={(e) => setDischargeDate(e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          <div className="pt-2">
            <PhotoUploader
              label="病例照片（出院时伤口/宠物照片）"
              value={photos}
              onChange={setPhotos}
              max={6}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => navigate('/cases')}
              className="btn-secondary"
            >
              取消
            </button>
            <button type="submit" className="btn-primary">
              提交
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
