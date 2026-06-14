import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';
import { useJarStore } from '@/store/jarStore';
import { useBatchStore } from '@/store/batchStore';
import { SealRingStatus } from '@/types';
import { formatDate } from '@/utils/date';

export default function JarNewForm() {
  const navigate = useNavigate();
  const { batches } = useBatchStore();
  const { addJar, jars } = useJarStore();

  const nextJarNo = () => {
    const year = new Date().getFullYear();
    const count = jars.filter((j) => j.sealedAt.startsWith(year.toString())).length + 1;
    return `LJ-${year}-${String(count).padStart(3, '0')}`;
  };

  const [form, setForm] = useState({
    jarNo: nextJarNo(),
    batchId: batches[0]?.id || '',
    sealedWeight: 500,
    operator: '张店长',
    sealStatus: 'good' as SealRingStatus,
    desiccantBatch: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedBatch = batches.find((b) => b.id === form.batchId);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.jarNo.trim()) newErrors.jarNo = '请输入罐号';
    if (!form.batchId) newErrors.batchId = '请选择批次';
    if (form.sealedWeight <= 0) newErrors.sealedWeight = '封罐重量必须大于0';
    if (selectedBatch && form.sealedWeight > selectedBatch.remainingWeight) {
      newErrors.sealedWeight = `超过批次剩余重量（${selectedBatch.remainingWeight}g）`;
    }
    if (!form.operator.trim()) newErrors.operator = '请输入操作人';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    addJar(form);
    navigate('/jars');
  };

  return (
    <div className="max-w-3xl">
      <button
        onClick={() => navigate('/jars')}
        className="flex items-center gap-2 text-gray-500 hover:text-teaGreen-600 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        返回封罐列表
      </button>

      <form onSubmit={handleSubmit} className="card space-y-5">
        <h3 className="font-serif text-lg font-bold text-gray-800 border-b border-tea-100 pb-3">
          新增封罐记录
        </h3>

        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="label-field">罐号</label>
            <input
              type="text"
              value={form.jarNo}
              onChange={(e) => setForm({ ...form, jarNo: e.target.value })}
              className={`input-field font-mono ${errors.jarNo ? 'border-red-300' : ''}`}
            />
            {errors.jarNo && <p className="text-xs text-dangerRed mt-1">{errors.jarNo}</p>}
          </div>

          <div>
            <label className="label-field">选择茶叶批次 *</label>
            <select
              value={form.batchId}
              onChange={(e) => setForm({ ...form, batchId: e.target.value })}
              className={`input-field ${errors.batchId ? 'border-red-300' : ''}`}
            >
              <option value="">请选择批次</option>
              {batches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} - {b.origin} ({b.harvestSeason}) 剩余 {b.remainingWeight}g
                </option>
              ))}
            </select>
            {errors.batchId && <p className="text-xs text-dangerRed mt-1">{errors.batchId}</p>}
          </div>

          <div>
            <label className="label-field">封罐重量（克）*</label>
            <input
              type="number"
              min="1"
              value={form.sealedWeight}
              onChange={(e) => setForm({ ...form, sealedWeight: parseInt(e.target.value) || 0 })}
              className={`input-field ${errors.sealedWeight ? 'border-red-300' : ''}`}
            />
            {errors.sealedWeight && (
              <p className="text-xs text-dangerRed mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.sealedWeight}
              </p>
            )}
            {selectedBatch && !errors.sealedWeight && (
              <p className="text-xs text-gray-400 mt-1">
                批次剩余: {selectedBatch.remainingWeight}g
              </p>
            )}
          </div>

          <div>
            <label className="label-field">操作人 *</label>
            <input
              type="text"
              value={form.operator}
              onChange={(e) => setForm({ ...form, operator: e.target.value })}
              className={`input-field ${errors.operator ? 'border-red-300' : ''}`}
            />
            {errors.operator && <p className="text-xs text-dangerRed mt-1">{errors.operator}</p>}
          </div>

          <div>
            <label className="label-field">密封圈状态</label>
            <select
              value={form.sealStatus}
              onChange={(e) => setForm({ ...form, sealStatus: e.target.value as SealRingStatus })}
              className="input-field"
            >
              <option value="good">良好</option>
              <option value="normal">一般</option>
              <option value="poor">需更换</option>
            </select>
          </div>

          <div>
            <label className="label-field">干燥剂批次</label>
            <input
              type="text"
              value={form.desiccantBatch}
              onChange={(e) => setForm({ ...form, desiccantBatch: e.target.value })}
              className="input-field"
              placeholder="如：GSZ-A001"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-tea-100">
          <p className="text-sm text-gray-400">封罐时间：{formatDate(new Date())}</p>
          <div className="flex gap-3">
            <button type="button" onClick={() => navigate('/jars')} className="btn-secondary">
              取消
            </button>
            <button type="submit" className="btn-primary flex items-center gap-2">
              <Save className="w-4 h-4" />
              确认封罐
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
