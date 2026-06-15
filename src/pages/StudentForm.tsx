import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, UserCheck, Upload, Camera, X } from 'lucide-react';
import { useStudentStore } from '@/stores/studentStore';
import AllergyBadge from '@/components/allergy/AllergyBadge';
import { ALLERGY_META } from '@/types';
import type { AllergyType, AllergySeverity, AllergyTag } from '@/types';
import { CLASSES } from '@/utils/mockData';
import { useEffect } from 'react';

export default function StudentForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { students, addStudent, updateStudent } = useStudentStore();
  const isEditing = !!id;
  const existingStudent = id ? students.find((s) => s.id === id) : null;

  const [form, setForm] = useState({
    name: existingStudent?.name || '',
    className: existingStudent?.className || '',
    grade: existingStudent?.grade || '',
    studentNo: existingStudent?.studentNo || '',
    photo: existingStudent?.photo || '',
    allergies: existingStudent?.allergies || [],
    guardianName: existingStudent?.guardianName || '',
    guardianPhone: existingStudent?.guardianPhone || '',
    guardianConfirmed: existingStudent?.guardianConfirmed || false,
    medicalCertificateUrl: existingStudent?.medicalCertificateUrl || '',
    notes: existingStudent?.notes || '',
  });

  const [showAllergyPicker, setShowAllergyPicker] = useState(false);
  const [selectedSeverity, setSelectedSeverity] = useState<AllergySeverity>('severe');

  useEffect(() => {
    if (existingStudent) {
      setForm({
        name: existingStudent.name,
        className: existingStudent.className,
        grade: existingStudent.grade,
        studentNo: existingStudent.studentNo,
        photo: existingStudent.photo,
        allergies: existingStudent.allergies,
        guardianName: existingStudent.guardianName,
        guardianPhone: existingStudent.guardianPhone,
        guardianConfirmed: existingStudent.guardianConfirmed,
        medicalCertificateUrl: existingStudent.medicalCertificateUrl,
        notes: existingStudent.notes,
      });
    }
  }, [id]);

  const handleChange = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleAllergy = (type: AllergyType) => {
    const exists = form.allergies.find((a) => a.type === type);
    if (exists) {
      handleChange(
        'allergies',
        form.allergies.filter((a) => a.type !== type)
      );
    } else {
      const meta = ALLERGY_META[type];
      const newTag: AllergyTag = {
        id: `allergy-${type}-${Date.now()}`,
        type,
        name: meta.name,
        severity: selectedSeverity,
        icon: meta.icon,
      };
      handleChange('allergies', [...form.allergies, newTag]);
    }
  };

  const updateAllergySeverity = (type: AllergyType, severity: AllergySeverity) => {
    handleChange(
      'allergies',
      form.allergies.map((a) => (a.type === type ? { ...a, severity } : a))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.className || !form.studentNo || form.allergies.length === 0) {
      alert('请填写必填项（姓名、班级、学号、至少一项过敏源）');
      return;
    }

    const gradeMatch = form.className.match(/^(.+?)年级/);
    const grade = gradeMatch ? gradeMatch[1] + '年级' : form.grade;

    if (isEditing && id) {
      updateStudent(id, { ...form, grade });
    } else {
      addStudent({ ...form, grade });
    }
    navigate('/students');
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link to="/students" className="p-2 rounded-lg hover:bg-slate-100 text-slate-500">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-bold text-slate-800">
          {isEditing ? '编辑学生档案' : '新增学生档案'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="card lg:col-span-1">
            <div className="card-header">
              <h3 className="font-semibold text-slate-800">学生照片</h3>
            </div>
            <div className="card-body flex flex-col items-center">
              <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center mb-4 overflow-hidden">
                {form.photo ? (
                  <img src={form.photo} alt="学生照片" className="w-full h-full object-cover" />
                ) : (
                  <Camera size={36} className="text-slate-400" />
                )}
              </div>
              <button type="button" className="btn-secondary w-full">
                <Upload size={14} />
                <span>上传照片</span>
              </button>
            </div>
          </div>

          <div className="card lg:col-span-2">
            <div className="card-header">
              <h3 className="font-semibold text-slate-800">基本信息</h3>
            </div>
            <div className="card-body grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="label">学生姓名 <span className="text-danger-500">*</span></label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="input"
                  placeholder="请输入学生姓名"
                />
              </div>
              <div>
                <label className="label">学号 <span className="text-danger-500">*</span></label>
                <input
                  type="text"
                  value={form.studentNo}
                  onChange={(e) => handleChange('studentNo', e.target.value)}
                  className="input"
                  placeholder="请输入学号"
                />
              </div>
              <div>
                <label className="label">班级 <span className="text-danger-500">*</span></label>
                <select
                  value={form.className}
                  onChange={(e) => handleChange('className', e.target.value)}
                  className="input"
                >
                  <option value="">请选择班级</option>
                  {CLASSES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">年级</label>
                <input
                  type="text"
                  value={form.grade}
                  onChange={(e) => handleChange('grade', e.target.value)}
                  className="input"
                  placeholder="选择班级后自动填充"
                  readOnly
                />
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-slate-800">过敏源信息</h3>
                <span className="text-danger-500 text-xs">* 至少选择一项</span>
              </div>
              <button
                type="button"
                onClick={() => setShowAllergyPicker(!showAllergyPicker)}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                {showAllergyPicker ? '收起' : '添加过敏源'}
              </button>
            </div>
          </div>
          <div className="card-body">
            {form.allergies.length > 0 && (
              <div className="mb-4 p-4 bg-slate-50 rounded-xl">
                <p className="text-xs text-slate-500 mb-3">已选过敏源（点击设置严重程度）：</p>
                <div className="flex flex-wrap gap-3">
                  {form.allergies.map((allergy) => (
                    <div key={allergy.id} className="relative group">
                      <AllergyBadge type={allergy.type} severity={allergy.severity} />
                      <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-white border border-slate-200 flex items-center justify-center cursor-pointer hover:bg-danger-50 shadow-sm">
                        <X
                          size={12}
                          className="text-slate-400 hover:text-danger-500"
                          onClick={() =>
                            handleChange(
                              'allergies',
                              form.allergies.filter((a) => a.id !== allergy.id)
                            )
                          }
                        />
                      </div>
                      <div className="absolute top-full left-0 mt-1 hidden group-hover:flex gap-1 z-10">
                        {(['mild', 'moderate', 'severe'] as AllergySeverity[]).map((sev) => (
                          <button
                            key={sev}
                            type="button"
                            onClick={() => updateAllergySeverity(allergy.type, sev)}
                            className={`text-[10px] px-2 py-0.5 rounded ${
                              allergy.severity === sev
                                ? 'bg-primary-500 text-white'
                                : 'bg-white border border-slate-200 text-slate-600'
                            }`}
                          >
                            {sev === 'mild' ? '轻度' : sev === 'moderate' ? '中度' : '严重'}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {showAllergyPicker && (
              <div className="border border-slate-200 rounded-xl p-4">
                <div className="mb-4">
                  <p className="text-xs text-slate-500 mb-2">选择严重程度作为默认值：</p>
                  <div className="flex gap-2">
                    {(['mild', 'moderate', 'severe'] as AllergySeverity[]).map((sev) => (
                      <button
                        key={sev}
                        type="button"
                        onClick={() => setSelectedSeverity(sev)}
                        className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                          selectedSeverity === sev
                            ? sev === 'severe'
                              ? 'bg-danger-500 text-white'
                              : sev === 'moderate'
                              ? 'bg-warning-500 text-white'
                              : 'bg-info-500 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {sev === 'mild' ? '轻度' : sev === 'moderate' ? '中度' : '严重'}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.entries(ALLERGY_META).map(([type, meta]) => {
                    const selected = form.allergies.some((a) => a.type === type);
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => toggleAllergy(type as AllergyType)}
                        className={`p-4 rounded-xl border-2 transition-all text-left ${
                          selected
                            ? meta.highRisk
                              ? 'border-danger-400 bg-danger-50'
                              : 'border-primary-400 bg-primary-50'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="text-2xl mb-1">{meta.icon}</div>
                        <p className="font-medium text-sm text-slate-700">{meta.name}</p>
                        {meta.highRisk && (
                          <p className="text-[10px] text-danger-500 mt-0.5">高风险</p>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold text-slate-800">监护人信息</h3>
          </div>
          <div className="card-body grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="label">监护人姓名</label>
              <input
                type="text"
                value={form.guardianName}
                onChange={(e) => handleChange('guardianName', e.target.value)}
                className="input"
                placeholder="请输入监护人姓名"
              />
            </div>
            <div>
              <label className="label">监护人联系电话</label>
              <input
                type="tel"
                value={form.guardianPhone}
                onChange={(e) => handleChange('guardianPhone', e.target.value)}
                className="input"
                placeholder="请输入联系电话"
              />
            </div>
            <div className="md:col-span-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.guardianConfirmed}
                  onChange={(e) => handleChange('guardianConfirmed', e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                />
                <div className="flex items-center gap-2">
                  <UserCheck size={16} className={form.guardianConfirmed ? 'text-primary-500' : 'text-slate-400'} />
                  <span className="text-sm text-slate-700">监护人已确认过敏信息</span>
                </div>
              </label>
            </div>
            <div className="md:col-span-2">
              <label className="label">医生证明</label>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-24 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:border-primary-300 transition-colors cursor-pointer">
                  <div className="text-center">
                    <Upload size={24} className="mx-auto mb-1" />
                    <p className="text-xs">点击上传医生诊断证明</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="label">备注说明</label>
              <textarea
                value={form.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                rows={3}
                className="input resize-none"
                placeholder="其他需要注意的事项..."
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Link to="/students" className="btn-secondary">
            取消
          </Link>
          <button type="submit" className="btn-primary">
            <Save size={16} />
            <span>{isEditing ? '保存修改' : '创建档案'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
