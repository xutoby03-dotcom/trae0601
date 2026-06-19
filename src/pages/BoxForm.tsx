import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Upload } from 'lucide-react';
import { useBoxStore } from '../store/useBoxStore';
import { useRiderStore } from '../store/useRiderStore';
import type { Box, UsageType, BoxStatus } from '../types';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Textarea } from '../components/ui/Textarea';

export function BoxForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id && id !== 'new';

  const { boxes, fetchBoxes, addBox, updateBox } = useBoxStore();
  const { riders, fetchRiders } = useRiderStore();

  const [formData, setFormData] = useState<Partial<Box>>({
    boxNumber: '',
    capacity: 30,
    usageType: 'hot_food' as UsageType,
    riderId: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    photoUrl: '',
    status: 'active' as BoxStatus,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchBoxes();
    fetchRiders();
  }, [fetchBoxes, fetchRiders]);

  useEffect(() => {
    if (isEdit) {
      const box = boxes.find(b => b.id === id);
      if (box) {
        setFormData(box);
      }
    }
  }, [isEdit, id, boxes]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.boxNumber?.trim()) {
      newErrors.boxNumber = '请输入箱子编号';
    }
    if (!formData.capacity === undefined || formData.capacity <= 0) {
      newErrors.capacity = '请输入有效容量';
    }
    if (!formData.riderId) {
      newErrors.riderId = '请选择所属骑手';
    }
    if (!formData.purchaseDate) {
      newErrors.purchaseDate = '请选择购买日期';
    }
    if (!formData.photoUrl) {
      newErrors.photoUrl = '请上传箱子照片';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (isEdit) {
      updateBox(id!, formData as Box);
    } else {
      addBox(formData as Omit<Box, 'id' | 'createdAt'>);
    }

    navigate('/boxes');
  };

  const handleChange = (field: keyof Box, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const { [field]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  const handlePhotoGenerate = () => {
    const prompts = [
      'orange%20food%20delivery%20insulated%20box%20front%20view%20white%20background',
      'blue%20cold%20drink%20delivery%20cooler%20box%20front%20view%20white%20background',
      'gray%20large%20food%20delivery%20box%20mixed%20use%20front%20view%20white%20background',
    ];
    const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
    const photoUrl = `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${randomPrompt}&image_size=square`;
    handleChange('photoUrl', photoUrl);
  };

  const riderOptions = [
    { value: '', label: '请选择骑手' },
    ...riders.map(r => ({ value: r.id, label: r.name })),
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/boxes">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4" />
            返回列表
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEdit ? '编辑箱子' : '新增箱子'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <Input
              label="箱子编号"
              name="boxNumber"
              value={formData.boxNumber}
              onChange={(e) => handleChange('boxNumber', e.target.value)}
              error={errors.boxNumber}
              placeholder="如: BX-001"
            />

            <Input
              label="容量 (L)"
              name="capacity"
              type="number"
              value={formData.capacity}
              onChange={(e) => handleChange('capacity', Number(e.target.value))}
              error={errors.capacity}
              placeholder="30"
            />

            <Select
              label="用途类型"
              name="usageType"
              value={formData.usageType}
              onChange={(e) => handleChange('usageType', e.target.value)}
              options={[
                { value: 'hot_food', label: '热食专用' },
                { value: 'cold_drink', label: '冷饮专用' },
                { value: 'mixed', label: '混合使用' },
              ]}
            />

            <Select
              label="所属骑手"
              name="riderId"
              value={formData.riderId}
              onChange={(e) => handleChange('riderId', e.target.value)}
              options={riderOptions}
              error={errors.riderId}
            />

            <Input
              label="购买日期"
              name="purchaseDate"
              type="date"
              value={formData.purchaseDate}
              onChange={(e) => handleChange('purchaseDate', e.target.value)}
              error={errors.purchaseDate}
            />

            <Select
              label="状态"
              name="status"
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
              options={[
                { value: 'active', label: '正常使用' },
                { value: 'pending_cleaning', label: '待清洁' },
                { value: 'maintenance', label: '维修中' },
                { value: 'scrapped', label: '已报废' },
              ]}
            />
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">箱子照片</label>
              {formData.photoUrl ? (
                <div className="relative w-48 h-48 rounded-lg overflow-hidden border-2 border-gray-200">
                  <img
                    src={formData.photoUrl}
                    alt="箱子照片"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                  <div className="w-48 h-48 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                    <p className="text-sm text-gray-500">暂无照片</p>
                  </div>
                )}
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="mt-2"
                onClick={handlePhotoGenerate}
              >
                <Upload className="w-4 h-4" />
                生成示例照片
              </Button>
              {errors.photoUrl && (
                <p className="text-sm text-red-500 mt-1">{errors.photoUrl}</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-100">
          <Link to="/boxes">
            <Button type="button" variant="secondary">取消</Button>
          </Link>
          <Button type="submit">
            {isEdit ? '保存修改' : '创建箱子'}
          </Button>
        </div>
      </form>
    </div>
  );
}
