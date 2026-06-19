import { useState, useEffect } from 'react';
import type { Box, BoxCategory } from '@/types';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';

interface BoxFormProps {
  box?: Box;
  onSubmit: (data: Omit<Box, 'id' | 'createdAt' | 'updatedAt' | 'usageCount' | 'status'>) => void;
  onCancel: () => void;
}

const categoryOptions = [
  { value: 'large', label: '大件箱' },
  { value: 'wardrobe', label: '衣柜箱' },
  { value: 'book', label: '书箱' },
];

export default function BoxForm({ box, onSubmit, onCancel }: BoxFormProps) {
  const [formData, setFormData] = useState({
    category: 'large' as BoxCategory,
    length: 60,
    width: 40,
    height: 50,
    loadCapacity: 20,
    source: '',
    photo: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (box) {
      setFormData({
        category: box.category,
        length: box.length,
        width: box.width,
        height: box.height,
        loadCapacity: box.loadCapacity,
        source: box.source,
        photo: box.photo,
        notes: box.notes,
      });
    }
  }, [box]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.source.trim()) {
      newErrors.source = '请输入来源';
    }
    if (formData.length <= 0) {
      newErrors.length = '长度必须大于0';
    }
    if (formData.width <= 0) {
      newErrors.width = '宽度必须大于0';
    }
    if (formData.height <= 0) {
      newErrors.height = '高度必须大于0';
    }
    if (formData.loadCapacity <= 0) {
      newErrors.loadCapacity = '承重必须大于0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const handleNumberChange = (field: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setFormData((prev) => ({ ...prev, [field]: numValue }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="分类"
          options={categoryOptions}
          value={formData.category}
          onChange={(value) => setFormData((prev) => ({ ...prev, category: value as BoxCategory }))}
        />
        <Input
          label="来源"
          placeholder="如：京东购买、上次搬家留下"
          value={formData.source}
          onChange={(e) => setFormData((prev) => ({ ...prev, source: e.target.value }))}
          error={errors.source}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Input
          label="长度 (cm)"
          type="number"
          value={formData.length}
          onChange={(e) => handleNumberChange('length', e.target.value)}
          error={errors.length}
        />
        <Input
          label="宽度 (cm)"
          type="number"
          value={formData.width}
          onChange={(e) => handleNumberChange('width', e.target.value)}
          error={errors.width}
        />
        <Input
          label="高度 (cm)"
          type="number"
          value={formData.height}
          onChange={(e) => handleNumberChange('height', e.target.value)}
          error={errors.height}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="承重 (kg)"
          type="number"
          value={formData.loadCapacity}
          onChange={(e) => handleNumberChange('loadCapacity', e.target.value)}
          error={errors.loadCapacity}
        />
        <Input
          label="照片URL (可选)"
          placeholder="输入图片链接"
          value={formData.photo}
          onChange={(e) => setFormData((prev) => ({ ...prev, photo: e.target.value }))}
        />
      </div>

      {formData.photo && (
        <div className="rounded-lg overflow-hidden border border-border">
          <img
            src={formData.photo}
            alt="预览"
            className="w-full h-48 object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      )}

      <Textarea
        label="备注"
        rows={3}
        placeholder="输入备注信息..."
        value={formData.notes}
        onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
      />

      <div className="flex gap-3 pt-2">
        <Button type="submit" className="flex-1">
          {box ? '保存修改' : '添加纸箱'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">
          取消
        </Button>
      </div>
    </form>
  );
}
