import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { ArrowLeft, Save } from 'lucide-react';
import type { Child, Gender } from '@/types';
import PhotoUpload from '@/components/ui/PhotoUpload';

export default function ChildEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = id && id !== 'new';

  const initialize = useAppStore((s) => s.initialize);
  const getChildById = useAppStore((s) => s.getChildById);
  const addChild = useAppStore((s) => s.addChild);
  const updateChild = useAppStore((s) => s.updateChild);

  const [name, setName] = useState('');
  const [birthday, setBirthday] = useState('');
  const [gender, setGender] = useState<Gender>('男');
  const [allergyHistory, setAllergyHistory] = useState('');
  const [vaccinationSite, setVaccinationSite] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [avatar, setAvatar] = useState('');
  const [vaccineBookPhoto, setVaccineBookPhoto] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (isEdit && id) {
      const c = getChildById(id);
      if (c) {
        setName(c.name);
        setBirthday(c.birthday);
        setGender(c.gender);
        setAllergyHistory(c.allergyHistory);
        setVaccinationSite(c.vaccinationSite);
        setGuardianPhone(c.guardianPhone);
        setAvatar(c.avatar);
        setVaccineBookPhoto(c.vaccineBookPhoto);
      }
    }
  }, [isEdit, id, getChildById, initialize]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = '请输入姓名';
    if (!birthday) e.birthday = '请选择出生日期';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const data: Omit<Child, 'id' | 'createdAt'> = {
      name: name.trim(),
      birthday,
      gender,
      allergyHistory: allergyHistory.trim(),
      vaccinationSite: vaccinationSite.trim(),
      guardianPhone: guardianPhone.trim(),
      avatar:
        avatar ||
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}&backgroundColor=${
          gender === '男' ? 'b6e3f4' : 'ffd5dc'
        }`,
      vaccineBookPhoto,
    };

    if (isEdit && id) {
      updateChild(id, data);
    } else {
      addChild(data);
    }
    navigate('/children');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-8">
      <button
        onClick={() => navigate(isEdit && id ? `/children/${id}` : '/children')}
        className="flex items-center gap-2 text-slate-600 hover:text-primary-600 transition-colors text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        {isEdit ? '返回档案详情' : '返回孩子列表'}
      </button>

      <div className="card p-8 animate-fade-in-up">
        <div className="mb-6">
          <h1 className="font-display text-2xl text-slate-800 mb-1">
            {isEdit ? '编辑孩子档案' : '新增孩子档案'}
          </h1>
          <p className="text-sm text-slate-500">
            完善孩子的基本信息，便于管理疫苗计划
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="label">
                姓名 <span className="text-danger-500">*</span>
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`input ${errors.name ? 'border-danger-400 focus:border-danger-400 focus:ring-danger-500/20' : ''}`}
                placeholder="请输入孩子姓名"
              />
              {errors.name && (
                <p className="text-xs text-danger-500 mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="label">性别</label>
              <div className="flex gap-3">
                {(['男', '女'] as Gender[]).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGender(g)}
                    className={`flex-1 py-3 rounded-xl border-2 transition-all font-medium ${
                      gender === g
                        ? 'border-primary-400 bg-primary-50 text-primary-700'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {g === '男' ? '👦 男孩' : '👧 女孩'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label">
                出生日期 <span className="text-danger-500">*</span>
              </label>
              <input
                type="date"
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
                className={`input ${errors.birthday ? 'border-danger-400 focus:border-danger-400 focus:ring-danger-500/20' : ''}`}
              />
              {errors.birthday && (
                <p className="text-xs text-danger-500 mt-1">{errors.birthday}</p>
              )}
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

            <div className="md:col-span-2">
              <label className="label">常规接种点</label>
              <input
                value={vaccinationSite}
                onChange={(e) => setVaccinationSite(e.target.value)}
                className="input"
                placeholder="如：朝阳区社区卫生服务中心"
              />
            </div>

            <div className="md:col-span-2">
              <label className="label">过敏史</label>
              <input
                value={allergyHistory}
                onChange={(e) => setAllergyHistory(e.target.value)}
                className="input"
                placeholder="如：青霉素过敏、鸡蛋过敏，无则留空"
              />
              <p className="text-xs text-slate-400 mt-1">
                有过敏史的疫苗会在提醒中标注，接种前请务必告知医生
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-sm font-medium text-slate-700 mb-4">照片资料</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <PhotoUpload
                value={avatar}
                onChange={setAvatar}
                label="孩子头像"
                placeholder="上传或自动生成头像"
              />
              <PhotoUpload
                value={vaccineBookPhoto}
                onChange={setVaccineBookPhoto}
                label="疫苗本照片"
                placeholder="上传疫苗本封面/内页照片"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate(isEdit && id ? `/children/${id}` : '/children')}
              className="btn-secondary"
            >
              取消
            </button>
            <button type="submit" className="btn-primary">
              <Save className="w-4 h-4" />
              {isEdit ? '保存修改' : '创建档案'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
