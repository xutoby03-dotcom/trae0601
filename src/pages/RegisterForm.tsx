import { useEffect, useState } from 'react';
import { ArrowLeft, Save, User, Upload } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppStore } from '@/store';
import type { ShiftType } from '../../shared/types';

export default function RegisterForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const { registers, fetchRegisters, createRegister, updateRegister } = useAppStore();

  const [form, setForm] = useState({
    code: '',
    shift: 'morning' as ShiftType,
    defaultAmount: 500,
    threshold: 30,
    managerName: '',
    managerPhoto: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isEdit) {
      fetchRegisters();
    }
  }, [isEdit, fetchRegisters]);

  useEffect(() => {
    if (isEdit && registers.length > 0) {
      const r = registers.find((x) => x.id === id);
      if (r) {
        setForm({
          code: r.code,
          shift: r.shift,
          defaultAmount: r.defaultAmount,
          threshold: r.threshold,
          managerName: r.managerName,
          managerPhoto: r.managerPhoto,
        });
      }
    }
  }, [isEdit, id, registers]);

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setForm({ ...form, managerPhoto: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.code.trim()) e.code = '请输入收银台编号';
    if (!form.managerName.trim()) e.managerName = '请输入负责人姓名';
    if (form.defaultAmount <= 0) e.defaultAmount = '默认备用金必须大于0';
    if (form.threshold < 0) e.threshold = '阈值不能为负数';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      if (isEdit) {
        await updateRegister(id!, form);
      } else {
        await createRegister(form);
      }
      navigate('/registers');
    } catch (err) {
      alert((err as Error).message);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/registers')}
          className="p-2 rounded-lg text-gray-500 hover:bg-warm-100 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-serif font-bold text-gray-900">
            {isEdit ? '编辑收银台' : '新建收银台'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">填写收银台的基础档案信息</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-warm-200 p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              收银台编号 <span className="text-red-500">*</span>
            </label>
            <input
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              placeholder="如 A01"
              className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-primary-100 ${
                errors.code ? 'border-red-400 focus:border-red-400' : 'border-warm-200 focus:border-primary-400'
              }`}
            />
            {errors.code && <p className="text-xs text-red-500 mt-1">{errors.code}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              适用班次 <span className="text-red-500">*</span>
            </label>
            <select
              value={form.shift}
              onChange={(e) => setForm({ ...form, shift: e.target.value as ShiftType })}
              className="w-full px-3 py-2 rounded-lg border border-warm-200 text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 bg-white"
            >
              <option value="morning">早班</option>
              <option value="evening">晚班</option>
              <option value="all">全天</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              默认备用金额（元） <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={form.defaultAmount}
              onChange={(e) => setForm({ ...form, defaultAmount: Number(e.target.value) })}
              className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-primary-100 ${
                errors.defaultAmount
                  ? 'border-red-400 focus:border-red-400'
                  : 'border-warm-200 focus:border-primary-400'
              }`}
            />
            {errors.defaultAmount && (
              <p className="text-xs text-red-500 mt-1">{errors.defaultAmount}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              差额阈值（元）
            </label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={form.threshold}
              onChange={(e) => setForm({ ...form, threshold: Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-lg border border-warm-200 text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
            />
            <p className="text-xs text-gray-400 mt-1">超过此金额的差额将标红警示</p>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              负责人姓名 <span className="text-red-500">*</span>
            </label>
            <input
              value={form.managerName}
              onChange={(e) => setForm({ ...form, managerName: e.target.value })}
              placeholder="请输入负责人姓名"
              className={`w-full md:w-1/2 px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-primary-100 ${
                errors.managerName
                  ? 'border-red-400 focus:border-red-400'
                  : 'border-warm-200 focus:border-primary-400'
              }`}
            />
            {errors.managerName && (
              <p className="text-xs text-red-500 mt-1">{errors.managerName}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              负责人照片
            </label>
            <div className="flex items-center gap-4">
              {form.managerPhoto ? (
                <img
                  src={form.managerPhoto}
                  alt="preview"
                  className="w-20 h-20 rounded-xl object-cover border border-warm-200"
                />
              ) : (
                <div className="w-20 h-20 rounded-xl bg-warm-100 border border-dashed border-warm-200 flex items-center justify-center text-gray-400">
                  <User size={28} />
                </div>
              )}
              <label className="cursor-pointer px-4 py-2 rounded-lg border border-warm-200 hover:bg-warm-50 text-sm text-gray-600 flex items-center gap-2">
                <Upload size={16} />
                上传照片
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhoto}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-warm-100">
          <button
            type="button"
            onClick={() => navigate('/registers')}
            className="px-5 py-2 rounded-lg border border-warm-200 text-gray-600 hover:bg-warm-50 transition-colors"
          >
            取消
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Save size={16} />
            {isEdit ? '保存修改' : '创建档案'}
          </button>
        </div>
      </form>
    </div>
  );
}
