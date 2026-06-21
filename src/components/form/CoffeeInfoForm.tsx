import { useState } from 'react';
import { Coffee, MapPin, Leaf, Flame, Calendar } from 'lucide-react';
import { Input, Select, Textarea } from '@/components/common/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { ROAST_LEVELS, type RoastLevel } from '@/types';
import { useBlindTestStore } from '@/store/useBlindTestStore';
import { useNavigate } from 'react-router-dom';

export function CoffeeInfoForm() {
  const navigate = useNavigate();
  const createBlindTest = useBlindTestStore((state) => state.createBlindTest);
  const setCurrentBlindTest = useBlindTestStore((state) => state.setCurrentBlindTest);

  const [formData, setFormData] = useState({
    coffeeName: '',
    origin: '',
    processMethod: '',
    roastLevel: 'medium' as RoastLevel,
    roastDate: new Date().toISOString().split('T')[0],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.coffeeName.trim()) {
      newErrors.coffeeName = '请输入咖啡豆名称';
    }
    if (!formData.origin.trim()) {
    }
    if (!formData.processMethod.trim()) {
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const id = createBlindTest({
      coffeeName: formData.coffeeName.trim(),
      origin: formData.origin.trim(),
      processMethod: formData.processMethod.trim(),
      roastLevel: formData.roastLevel,
      roastDate: formData.roastDate,
    });

    setCurrentBlindTest(id);
    navigate(`/create?id=${id}`, { state: { step: 'water' } });
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-coffee-100 rounded-xl flex items-center justify-center">
            <Coffee className="w-6 h-6 text-coffee-700" />
          </div>
          <div>
            <CardTitle>咖啡豆信息</CardTitle>
            <CardDescription>填写本次盲测使用的咖啡豆基本信息</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            id="coffeeName"
            label="咖啡豆名称"
            placeholder="如：埃塞俄比亚 耶加雪菲"
            value={formData.coffeeName}
            onChange={(e) => setFormData({ ...formData, coffeeName: e.target.value })}
            error={errors.coffeeName}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Input
                id="origin"
                label="产地"
                placeholder="如：埃塞俄比亚"
                value={formData.origin}
                onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
              />
              <MapPin className="absolute right-4 top-9 w-4 h-4 text-coffee-400" />
            </div>
            <div className="relative">
              <Input
                id="processMethod"
                label="处理法"
                placeholder="如：水洗/日晒/蜜处理"
                value={formData.processMethod}
                onChange={(e) => setFormData({ ...formData, processMethod: e.target.value })}
              />
              <Leaf className="absolute right-4 top-9 w-4 h-4 text-coffee-400" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Select
                id="roastLevel"
                label="烘焙度"
                value={formData.roastLevel}
                onChange={(e) => setFormData({ ...formData, roastLevel: e.target.value as RoastLevel })}
                options={ROAST_LEVELS}
              />
              <Flame className="absolute right-10 top-9 w-4 h-4 text-coffee-400 pointer-events-none" />
            </div>
            <div className="relative">
              <Input
                id="roastDate"
                label="烘焙日期"
                type="date"
                value={formData.roastDate}
                onChange={(e) => setFormData({ ...formData, roastDate: e.target.value })}
              />
              <Calendar className="absolute right-4 top-9 w-4 h-4 text-coffee-400 pointer-events-none" />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" size="lg">
              下一步：添加水样
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
