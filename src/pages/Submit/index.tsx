import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReimbursementStore } from '../../store/useReimbursementStore';
import { mockRoommates } from '../../data/mockData';

const Submit = () => {
  const navigate = useNavigate();
  const { addItem } = useReimbursementStore();

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    description: '',
    applicant: mockRoommates[0].name,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.date) newErrors.date = '请选择日期';
    if (!formData.amount || parseFloat(formData.amount) <= 0) newErrors.amount = '请输入有效金额';
    if (!formData.description.trim()) newErrors.description = '请输入说明';
    if (!formData.applicant) newErrors.applicant = '请选择申请人';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    addItem({
      date: formData.date,
      amount: parseFloat(formData.amount),
      description: formData.description.trim(),
      applicant: formData.applicant,
      status: 'pending',
    });

    navigate('/review');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">提交报销</h2>
        <p className="text-gray-500">填写加班餐费报销信息</p>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-5">
        <div>
          <label className="label">日期</label>
          <input
            type="date"
            className={`input ${errors.date ? 'border-danger-500 focus:ring-danger-500' : ''}`}
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          />
          {errors.date && <p className="mt-1 text-sm text-danger-600">{errors.date}</p>}
        </div>

        <div>
          <label className="label">金额 (元)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            className={`input ${errors.amount ? 'border-danger-500 focus:ring-danger-500' : ''}`}
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          />
          {errors.amount && <p className="mt-1 text-sm text-danger-600">{errors.amount}</p>}
        </div>

        <div>
          <label className="label">说明</label>
          <input
            type="text"
            placeholder="例如：加班晚餐 - 外卖"
            className={`input ${errors.description ? 'border-danger-500 focus:ring-danger-500' : ''}`}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          {errors.description && <p className="mt-1 text-sm text-danger-600">{errors.description}</p>}
        </div>

        <div>
          <label className="label">申请人</label>
          <select
            className={`input ${errors.applicant ? 'border-danger-500 focus:ring-danger-500' : ''}`}
            value={formData.applicant}
            onChange={(e) => setFormData({ ...formData, applicant: e.target.value })}
          >
            {mockRoommates.map((r: { id: string; name: string }) => (
              <option key={r.id} value={r.name}>
                {r.name}
              </option>
            ))}
          </select>
          {errors.applicant && <p className="mt-1 text-sm text-danger-600">{errors.applicant}</p>}
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            className="btn btn-secondary flex-1"
            onClick={() => navigate(-1)}
          >
            取消
          </button>
          <button type="submit" className="btn btn-primary flex-1">
            提交申请
          </button>
        </div>
      </form>
    </div>
  );
};

export default Submit;
