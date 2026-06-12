import { useState, useEffect } from 'react';
import { AfterSale, AfterSaleType, AfterSaleSeverity, AfterSaleStatus } from '@/types';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import { getAfterSaleTypeText, getAfterSaleSeverityText, getAfterSaleStatusText } from '@/utils/helpers';

interface AfterSaleFormProps {
  afterSale?: AfterSale | null;
  materialId?: string;
  materials?: { id: string; name: string }[];
  onSubmit: (data: Partial<AfterSale>) => void;
  onCancel: () => void;
}

const AfterSaleForm = ({ afterSale, materialId, materials, onSubmit, onCancel }: AfterSaleFormProps) => {
  const [formData, setFormData] = useState({
    materialId: materialId || '',
    type: 'damaged' as AfterSaleType,
    severity: 'medium' as AfterSaleSeverity,
    status: 'pending' as AfterSaleStatus,
    description: '',
    solution: '',
    handler: '',
    resolvedAt: null as string | null,
  });

  useEffect(() => {
    if (afterSale) {
      setFormData({
        materialId: afterSale.materialId,
        type: afterSale.type,
        severity: afterSale.severity,
        status: afterSale.status,
        description: afterSale.description,
        solution: afterSale.solution,
        handler: afterSale.handler,
        resolvedAt: afterSale.resolvedAt,
      });
    } else if (materialId) {
      setFormData((prev) => ({ ...prev, materialId }));
    }
  }, [afterSale, materialId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = { ...formData };
    if (submitData.status === 'resolved' && !submitData.resolvedAt) {
      submitData.resolvedAt = new Date().toISOString();
    }
    if (submitData.status !== 'resolved') {
      submitData.resolvedAt = null;
    }
    onSubmit(submitData);
  };

  const typeOptions: { value: AfterSaleType; label: string }[] = [
    { value: 'missing', label: '缺件' },
    { value: 'wrong', label: '错发' },
    { value: 'damaged', label: '破损' },
  ];

  const severityOptions: { value: AfterSaleSeverity; label: string }[] = [
    { value: 'low', label: '轻微' },
    { value: 'medium', label: '中等' },
    { value: 'high', label: '严重' },
  ];

  const statusOptions: { value: AfterSaleStatus; label: string }[] = [
    { value: 'pending', label: '待处理' },
    { value: 'processing', label: '处理中' },
    { value: 'resolved', label: '已解决' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {materials && (
          <Select
            label="关联材料"
            name="materialId"
            value={formData.materialId}
            onChange={handleChange}
            className="col-span-2"
            required
          >
            <option value="">请选择材料</option>
            {materials.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </Select>
        )}

        <Select
          label="问题类型"
          name="type"
          value={formData.type}
          onChange={handleChange}
        >
          {typeOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>

        <Select
          label="严重程度"
          name="severity"
          value={formData.severity}
          onChange={handleChange}
        >
          {severityOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>

        {afterSale && (
          <Select
            label="处理状态"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="col-span-2"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
        )}

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            问题描述
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            placeholder="详细描述遇到的问题..."
            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 placeholder-gray-400 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
            required
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            解决方案
          </label>
          <textarea
            name="solution"
            value={formData.solution}
            onChange={handleChange}
            rows={2}
            placeholder="记录解决方案或处理进展..."
            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 placeholder-gray-400 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
          />
        </div>

        <Input
          label="处理人"
          name="handler"
          value={formData.handler}
          onChange={handleChange}
          placeholder="负责处理的人"
          className="col-span-2"
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
        <Button type="button" variant="outline" onClick={onCancel}>
          取消
        </Button>
        <Button type="submit">
          {afterSale ? '保存修改' : '创建售后'}
        </Button>
      </div>
    </form>
  );
};

export default AfterSaleForm;
