import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, ImagePlus } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { useAppStore } from '../store/useAppStore';
import { DEPARTMENTS, SECURITY_LEVELS, YEARS } from '../data/mockData';
import type { SecurityLevel } from '../types';

export function ArchiveNew() {
  const navigate = useNavigate();
  const addArchiveBox = useAppStore((s) => s.addArchiveBox);

  const [form, setForm] = useState({
    boxNumber: '',
    contractNumber: '',
    clientName: '',
    cabinetLocation: '',
    year: YEARS[0],
    department: DEPARTMENTS[0],
    securityLevel: '普通' as SecurityLevel,
    custodian: '张管理',
    sealNumber: '',
    pageCount: 0,
    auditDate: '',
  });

  const update = <K extends keyof typeof form>(key: K, value: typeof form[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.boxNumber.trim() || !form.cabinetLocation.trim() || !form.sealNumber.trim()) return;
    addArchiveBox({
      boxNumber: form.boxNumber.trim(),
      contractNumber: form.contractNumber.trim() || undefined,
      clientName: form.clientName.trim() || undefined,
      cabinetLocation: form.cabinetLocation.trim(),
      year: Number(form.year),
      department: form.department,
      securityLevel: form.securityLevel,
      custodian: form.custodian.trim(),
      sealNumber: form.sealNumber.trim(),
      pageCount: Number(form.pageCount) || 0,
      auditDate: form.auditDate || undefined,
    });
    navigate('/archives');
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="新增档案箱"
        subtitle="请填写档案箱的完整信息，带 * 为必填项"
        actions={
          <button onClick={() => navigate('/archives')} className="btn-secondary">
            <ArrowLeft size={16} />
            返回列表
          </button>
        }
      />

      <form onSubmit={handleSubmit} className="card p-6 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="label-base">档案箱编号 <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={form.boxNumber}
              onChange={(e) => update('boxNumber', e.target.value)}
              placeholder="如 DA-2024-001"
              className="input-base"
              required
            />
          </div>
          <div>
            <label className="label-base">柜位位置 <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={form.cabinetLocation}
              onChange={(e) => update('cabinetLocation', e.target.value)}
              placeholder="如 A区-03排-05柜"
              className="input-base"
              required
            />
          </div>
          <div>
            <label className="label-base">合同号</label>
            <input
              type="text"
              value={form.contractNumber}
              onChange={(e) => update('contractNumber', e.target.value)}
              placeholder="如 HT-2024-0015"
              className="input-base"
            />
          </div>
          <div>
            <label className="label-base">客户名称</label>
            <input
              type="text"
              value={form.clientName}
              onChange={(e) => update('clientName', e.target.value)}
              placeholder="客户公司名称"
              className="input-base"
            />
          </div>
          <div>
            <label className="label-base">归档年份 <span className="text-red-500">*</span></label>
            <select
              value={form.year}
              onChange={(e) => update('year', Number(e.target.value))}
              className="input-base"
            >
              {YEARS.map((y) => (
                <option key={y} value={y}>{y} 年</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label-base">所属部门 <span className="text-red-500">*</span></label>
            <select
              value={form.department}
              onChange={(e) => update('department', e.target.value)}
              className="input-base"
            >
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label-base">密级等级 <span className="text-red-500">*</span></label>
            <select
              value={form.securityLevel}
              onChange={(e) => update('securityLevel', e.target.value as SecurityLevel)}
              className="input-base"
            >
              {SECURITY_LEVELS.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label-base">保管人 <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={form.custodian}
              onChange={(e) => update('custodian', e.target.value)}
              className="input-base"
              required
            />
          </div>
          <div>
            <label className="label-base">封条号 <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={form.sealNumber}
              onChange={(e) => update('sealNumber', e.target.value)}
              placeholder="如 FT20240001"
              className="input-base"
              required
            />
          </div>
          <div>
            <label className="label-base">文件页数</label>
            <input
              type="number"
              min={0}
              value={form.pageCount}
              onChange={(e) => update('pageCount', Number(e.target.value))}
              className="input-base"
            />
          </div>
          <div>
            <label className="label-base">审计日期（可选）</label>
            <input
              type="date"
              value={form.auditDate}
              onChange={(e) => update('auditDate', e.target.value)}
              className="input-base"
            />
          </div>
        </div>

        <div className="mt-6">
          <label className="label-base">档案箱照片</label>
          <div className="grid grid-cols-3 gap-3">
            <div className="aspect-[4/3] rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 hover:border-navy-300 hover:text-navy-500 cursor-pointer transition-colors">
              <ImagePlus size={24} className="mb-1" />
              <span className="text-xs">上传外观照片</span>
            </div>
            <div className="aspect-[4/3] rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 hover:border-navy-300 hover:text-navy-500 cursor-pointer transition-colors">
              <ImagePlus size={24} className="mb-1" />
              <span className="text-xs">上传封条照片</span>
            </div>
            <div className="aspect-[4/3] rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 hover:border-navy-300 hover:text-navy-500 cursor-pointer transition-colors">
              <ImagePlus size={24} className="mb-1" />
              <span className="text-xs">上传文件照片</span>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end gap-3">
          <button type="button" onClick={() => navigate('/archives')} className="btn-secondary">
            取消
          </button>
          <button type="submit" className="btn-primary">
            <Save size={16} />
            保存档案箱
          </button>
        </div>
      </form>
    </div>
  );
}
