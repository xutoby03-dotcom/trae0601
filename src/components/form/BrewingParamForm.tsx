import { useState } from 'react';
import { Thermometer, Timer, Coffee, Droplets, ArrowRight, ArrowLeft } from 'lucide-react';
import { Input, Select } from '@/components/common/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { useBlindTestStore } from '@/store/useBlindTestStore';
import { useNavigate, useParams } from 'react-router-dom';
import { POUR_METHODS } from '@/types';
import type { BrewingParam } from '@/types';
import { getBlindCodeColor } from '@/utils/helpers';

export function BrewingParamForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const currentTest = useBlindTestStore((state) => state.currentBlindTest);
  const setBrewingParam = useBlindTestStore((state) => state.setBrewingParam);

  const samples = currentTest?.waterSamples || [];
  const params = currentTest?.brewingParams || [];

  const [formData, setFormData] = useState<Record<string, Omit<BrewingParam, 'id'>>>(() => {
    const initial: Record<string, Omit<BrewingParam, 'id'>> = {};
    samples.forEach((sample) => {
      const existing = params.find((p) => p.waterSampleId === sample.id);
      initial[sample.id] = existing || {
        waterSampleId: sample.id,
        grindSize: 3.5,
        waterTemp: 92,
        coffeeDose: 15,
        waterAmount: 240,
        brewTime: 150,
        pourMethod: '三段式注水',
      };
    });
    return initial;
  });

  const handleChange = (sampleId: string, field: keyof Omit<BrewingParam, 'id'>, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [sampleId]: {
        ...prev[sampleId],
        [field]: value,
      },
    }));
  };

  const handleSave = () => {
    if (!id) return;
    Object.values(formData).forEach((param) => {
      setBrewingParam(id, param);
    });
    navigate(`/tasting/${id}`);
  };

  return (
    <div className="space-y-6">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
              <Coffee className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <CardTitle>冲煮参数</CardTitle>
              <CardDescription>记录每个水样的冲煮参数，建议保持其他条件一致</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {samples.map((sample, index) => (
          <Card
            key={sample.id}
            className="animate-slide-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-lg"
                  style={{ backgroundColor: getBlindCodeColor(sample.blindCode) }}
                >
                  {sample.blindCode}
                </div>
                <div>
                  <CardTitle className="text-lg">水样 {sample.blindCode}</CardTitle>
                  <CardDescription>
                    盲编号 · 冲煮参数
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <Input
                    label="研磨度"
                    type="number"
                    step="0.1"
                    value={formData[sample.id]?.grindSize || 3.5}
                    onChange={(e) => handleChange(sample.id, 'grindSize', Number(e.target.value))}
                  />
                </div>
                <div className="relative">
                  <Input
                    label="水温"
                    type="number"
                    value={formData[sample.id]?.waterTemp || 92}
                    unit="°C"
                    onChange={(e) => handleChange(sample.id, 'waterTemp', Number(e.target.value))}
                  />
                  <Thermometer className="absolute right-10 top-9 w-4 h-4 text-coffee-400 pointer-events-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="咖啡粉量"
                  type="number"
                  step="0.1"
                  value={formData[sample.id]?.coffeeDose || 15}
                  unit="g"
                  onChange={(e) => handleChange(sample.id, 'coffeeDose', Number(e.target.value))}
                />
                <Input
                  label="注水量"
                  type="number"
                  value={formData[sample.id]?.waterAmount || 240}
                  unit="ml"
                  onChange={(e) => handleChange(sample.id, 'waterAmount', Number(e.target.value))}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <Input
                    label="萃取时间"
                    type="number"
                    value={formData[sample.id]?.brewTime || 150}
                    unit="秒"
                    onChange={(e) => handleChange(sample.id, 'brewTime', Number(e.target.value))}
                  />
                  <Timer className="absolute right-10 top-9 w-4 h-4 text-coffee-400 pointer-events-none" />
                </div>
                <Select
                  label="粉水比"
                  value={`1:${Math.round((formData[sample.id]?.waterAmount || 240) / (formData[sample.id]?.coffeeDose || 15))}`}
                  disabled
                  options={[{ value: '1', label: `1:${Math.round((formData[sample.id]?.waterAmount || 240) / (formData[sample.id]?.coffeeDose || 15))}` }]}
                  className="opacity-70"
                />
              </div>

              <Select
                label="注水手法"
                value={formData[sample.id]?.pourMethod || '三段式注水'}
                onChange={(e) => handleChange(sample.id, 'pourMethod', e.target.value)}
                options={POUR_METHODS.map((m) => ({ value: m, label: m }))}
              />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="max-w-4xl mx-auto flex justify-between pt-4">
        <Button
          variant="ghost"
          onClick={() => navigate(`/create`)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          上一步
        </Button>
        <Button
          onClick={handleSave}
          className="flex items-center gap-2"
        >
          下一步：杯测评分
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
