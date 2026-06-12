import Modal from '../ui/Modal';
import { useState, useEffect } from 'react';
import type { Gender, Child } from '@/types';
import PhotoUpload from '../ui/PhotoUpload';

interface ChildFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Child, 'id' | 'createdAt'>) => void;
  initialData?: Child | null;
}

export default function ChildFormModal({
  open,
  onClose,
  onSubmit,
  initialData,
}: ChildFormModalProps) {
  const [name, setName] = useState('');
  const [birthday, setBirthday] = useState('');
  const [gender, setGender] = useState<Gender>('男');
  const [allergyHistory, setAllergyHistory] = useState('');
  const [vaccinationSite, setVaccinationSite] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [avatar, setAvatar] = useState('');
  const [vaccineBookPhoto, setVaccineBookPhoto] = useState('');

  useEffect(() => {
    if (open) {
      if (initialData) {
        setName(initialData.name);
        setBirthday(initialData.birthday);
        setGender(initialData.gender);
        setAllergyHistory(initialData.allergyHistory);
        setVaccinationSite(initialData.vaccinationSite);
        setGuardianPhone(initialData.guardianPhone);
        setAvatar(initialData.avatar);
        setVaccineBookPhoto(initialData.vaccineBookPhoto);
      } else {
        setName('');
        setBirthday('');
        setGender('男');
        setAllergyHistory('');
        setVaccinationSite('');
        setGuardianPhone('');
        setAvatar('');
        setVaccineBookPhoto('');
      }
    }
  }, [open, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !birthday.trim()) {
      alert('请填写姓名和生日');
      return;
    }
    onSubmit({
      name: name.trim(),
      birthday,
      gender,
      allergyHistory: allergyHistory.trim(),
      vaccinationSite: vaccinationSite.trim(),
      guardianPhone: guardianPhone.trim(),
      avatar: avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}&backgroundColor=${gender === '男' ? 'b6e3f4' : 'ffd5dc'}`,
      vaccineBookPhoto,
    });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initialData ? '编辑孩子档案' : '新增孩子档案'}
      size="lg"
      footer={
        <>
          <button type="button" onClick={onClose} className="btn-secondary btn-sm">
            取消
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="btn-primary btn-sm"
          >
            {initialData ? '保存修改' : '创建档案'}
          </button>
        </>
      }
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">姓名 *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
              placeholder="请输入孩子姓名"
            />
          </div>
          <div>
            <label className="label">性别</label>
            <div className="flex gap-3">
              {(['男', '女'] as Gender[]).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGender(g)}
                  className={`flex-1 py-2.5 rounded-xl border transition-all ${
                    gender === g
                      ? 'border-primary-400 bg-primary-50 text-primary-700 font-medium'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">出生日期 *</label>
            <input
              type="date"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label className="label">监护人电话</label>
            <input
              value={guardianPhone}
              onChange={(e) => setGuardianPhone(e.target.value)}
              className="input"
              placeholder="请输入联系电话"
            />
          </div>
          <div>
            <label className="label">常规接种点</label>
            <input
              value={vaccinationSite}
              onChange={(e) => setVaccinationSite(e.target.value)}
              className="input"
              placeholder="如：XX社区卫生服务中心"
            />
          </div>
          <div>
            <label className="label">过敏史</label>
            <input
              value={allergyHistory}
              onChange={(e) => setAllergyHistory(e.target.value)}
              className="input"
              placeholder="如：青霉素过敏、鸡蛋过敏，无则留空"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <PhotoUpload
            value={avatar}
            onChange={setAvatar}
            label="孩子头像"
            placeholder="上传或选择孩子头像"
          />
          <PhotoUpload
            value={vaccineBookPhoto}
            onChange={setVaccineBookPhoto}
            label="疫苗本照片"
            placeholder="上传疫苗本封面/内页照片"
          />
        </div>
      </form>
    </Modal>
  );
}
