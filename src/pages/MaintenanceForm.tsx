import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import { useBoxStore } from '../store/useBoxStore';
import { useRiderStore } from '../store/useRiderStore';
import { useMaintenanceStore } from '../store/useMaintenanceStore';
import type { MaintenanceRecord, IssueType, MaintenanceStatus } from '../types';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Textarea } from '../components/ui/Textarea';
import { getTodayString } from '../utils/helpers';

export function MaintenanceForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id && id !== 'new';

  const { boxes, fetchBoxes } = useBoxStore();
  const { riders, fetchRiders } = useRiderStore();
  const { maintenanceRecords, fetchMaintenanceRecords, addMaintenanceRecord, updateMaintenanceRecord } = useMaintenanceStore();

  const [formData, setFormData] = useState<Partial<MaintenanceRecord>>({
    boxId: '',
    issueType: 'damage' as IssueType,
    description: '',
    status: 'pending' as MaintenanceStatus,
    resolution: '',
    reportedDate: getTodayString(),
    resolvedDate: '',
    reportedBy: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchBoxes();
    fetchRiders();
    fetchMaintenanceRecords();
  }, [fetchBoxes, fetchRiders, fetchMaintenanceRecords]);

  useEffect(() => {
    if (isEdit) {
      const record = maintenanceRecords.find(r => r.id === id);
      if (record) {
        setFormData(record);
      }
    }
  }, [isEdit, id, maintenanceRecords]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.boxId) {
      newErrors.boxId = '请选择箱子';
    }
    if (!formData.description?.trim()) {
      newErrors.description = '请填写异常描述';
    }
    if (!formData.reportedBy?.trim()) {
      newErrors.reportedBy = '请填写上报人';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (isEdit) {
      updateMaintenanceRecord(id!, formData as MaintenanceRecord);
    } else {
      addMaintenanceRecord(formData as Omit<MaintenanceRecord, 'id'>);
      useBoxStore.getState().updateBox(formData.boxId!, { status: 'maintenance' });
    }

    navigate('/maintenance');
  };

  const handleChange = (field: keyof MaintenanceRecord, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const { [field]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  const availableBoxes = boxes.filter(b => b.status !== 'scrapped');

  const boxOptions = [
    { value: '', label: '请选择箱子' },
    ...availableBoxes.map(b => {
      const rider = riders.find(r => r.id === b.riderId);
      return { value: b.id, label: `${b.boxNumber} - ${rider?.name || '未分配'}` };
    }),
  ];

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <Link to="/maintenance">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4" />
            返回列表
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEdit ? '编辑异常记录' : '上报异常'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="space-y-4">
          <Select
            label="选择箱子"
            name="boxId"
            value={formData.boxId}
            onChange={(e) => handleChange('boxId', e.target.value)}
            options={boxOptions}
            error={errors.boxId}
            disabled={isEdit}
          />

          <Select
            label="异常类型"
            name="issueType"
            value={formData.issueType}
            onChange={(e) => handleChange('issueType', e.target.value)}
            options={[
              { value: 'damage', label: '破损' },
              { value: 'odor', label: '异味' },
              { value: 'insulation', label: '保温差' },
              { value: 'leakage', label: '汤汁渗漏' },
            ]}
          />

          {isEdit && (
            <Select
              label="处理状态"
              name="status"
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
              options={[
                { value: 'pending', label: '待处理' },
                { value: 'in_progress', label: '处理中' },
                { value: 'repaired', label: '已维修' },
                { value: 'scrapped', label: '已报废' },
              ]}
            />
          )}

          <Textarea
            label="异常描述"
            name="description"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            error={errors.description}
            placeholder="请详细描述异常情况..."
          />

          {isEdit && (
            <Textarea
              label="处理结果"
              name="resolution"
              value={formData.resolution}
              onChange={(e) => handleChange('resolution', e.target.value)}
              placeholder="请填写处理方式和结果..."
            />
          )}

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="上报人"
              name="reportedBy"
              value={formData.reportedBy}
              onChange={(e) => handleChange('reportedBy', e.target.value)}
              error={errors.reportedBy}
              placeholder="请输入上报人姓名"
            />

            <Input
              label="上报日期"
              name="reportedDate"
              type="date"
              value={formData.reportedDate}
              onChange={(e) => handleChange('reportedDate', e.target.value)}
            />
          </div>

          {isEdit && (
            <Input
              label="解决日期"
              name="resolvedDate"
              type="date"
              value={formData.resolvedDate}
              onChange={(e) => handleChange('resolvedDate', e.target.value)}
            />
          )}
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-100">
          <Link to="/maintenance">
            <Button type="button" variant="secondary">取消</Button>
          </Link>
          <Button type="submit">
            <Plus className="w-4 h-4" />
            {isEdit ? '保存修改' : '提交异常'}
          </Button>
        </div>
      </form>
    </div>
  );
}
