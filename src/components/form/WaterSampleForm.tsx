import { useState } from 'react';
import { Droplets, Plus, Trash2, ArrowRight, Info } from 'lucide-react';
import { Input, Textarea } from '@/components/common/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { useBlindTestStore } from '@/store/useBlindTestStore';
import { useNavigate } from 'react-router-dom';
import type { BlindCode, WaterSample } from '@/types';
import { getBlindCodeColor } from '@/utils/helpers';
import { cn } from '@/lib/utils';
import { Label } from '@/components/common/Input';

export function WaterSampleForm() {
  const navigate = useNavigate();
  const currentTest = useBlindTestStore((state) => state.currentBlindTest);
  const id = currentTest?.id;
  const addWaterSample = useBlindTestStore((state) => state.addWaterSample);
  const removeWaterSample = useBlindTestStore((state) => state.removeWaterSample);
  const updateWaterSample = useBlindTestStore((state) => state.updateWaterSample);

  const [newSample, setNewSample] = useState({
    realName: '',
    tds: 100,
    hardness: 80,
    ph: 7.0,
    mineralNotes: '',
  });

  const samples = currentTest?.waterSamples || [];
  const canAddMore = samples.length < 3;

  const handleAddSample = () => {
    if (!id || !newSample.realName.trim()) return;
    if (samples.length >= 3) return;

    addWaterSample(id, {
      realName: newSample.realName.trim(),
      tds: newSample.tds,
      hardness: newSample.hardness,
      ph: newSample.ph,
      mineralNotes: newSample.mineralNotes.trim(),
    });

    setNewSample({
      realName: '',
      tds: 100,
      hardness: 80,
      ph: 7.0,
      mineralNotes: '',
    });
  };

  const handleRemoveSample = (sampleId: string) => {
    if (!id) return;
    removeWaterSample(id, sampleId);
  };

  const handleUpdateSample = (sampleId: string, field: keyof Omit<WaterSample, 'id' | 'blindCode'>, value: string | number) => {
    if (!id) return;
    updateWaterSample(id, sampleId, { [field]: value } as Partial<WaterSample>);
  };

  const handleNext = () => {
    if (!id || samples.length < 2) return;
    navigate(`/brewing/${id}`);
  };

  const getBadgeClass = (code: BlindCode) => {
    const color = getBlindCodeColor(code);
    return `badge badge-${code}`;
  };

  return (
    <div className="space-y-6">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <Droplets className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <CardTitle>水样信息</CardTitle>
              <CardDescription>
                添加要对比的水样（{samples.length}/3）。系统会自动分配盲测编号
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {samples.length > 0 && (
            <div className="space-y-4">
              <Label className="text-base">已添加的水样</Label>
              {samples.map((sample) => (
                <Card key={sample.id} className="relative animate-fade-in">
                  <div className="absolute top-4 right-4">
                  <span className={cn('badge', `badge-${sample.blindCode}`)}>
                    盲编号 {sample.blindCode}
                  </span>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white"
                      style={{ backgroundColor: getBlindCodeColor(sample.blindCode) }}
                    >
                      {sample.blindCode}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-coffee-900">
                        {sample.realName}
                      </h4>
                      <p className="text-sm text-coffee-500">
                        TDS {sample.tds} · 硬度 {sample.hardness} · pH {sample.ph}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveSample(sample.id)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <Input
                      size="sm"
                      label="TDS"
                      type="number"
                      value={sample.tds}
                      unit="mg/L"
                      onChange={(e) => handleUpdateSample(sample.id, 'tds', Number(e.target.value))}
                    />
                    <Input
                      size="sm"
                      label="硬度"
                      type="number"
                      value={sample.hardness}
                      unit="mg/L"
                      onChange={(e) => handleUpdateSample(sample.id, 'hardness', Number(e.target.value))}
                    />
                    <Input
                      size="sm"
                      label="pH"
                      type="number"
                      step="0.1"
                      value={sample.ph}
                      onChange={(e) => handleUpdateSample(sample.id, 'ph', Number(e.target.value))}
                    />
                  </div>

                  <Textarea
                    label="矿物质备注"
                    value={sample.mineralNotes}
                    onChange={(e) => handleUpdateSample(sample.id, 'mineralNotes', e.target.value)}
                    placeholder="如：低矿物质，口感清爽"
                    rows={2}
                  />
                </div>
                </Card>
              ))}
            </div>
          )}

          {canAddMore && (
            <Card className="border-2 border-dashed border-coffee-200 bg-coffee-50/50">
              <CardContent className="pt-4">
                <h4 className="font-semibold text-coffee-900 mb-4">添加新水样</h4>
                <div className="space-y-4">
                  <Input
                    label="水样真实名称"
                    placeholder="如：矿泉水、自来水（过滤）、蒸馏水"
                    value={newSample.realName}
                    onChange={(e) => setNewSample({ ...newSample, realName: e.target.value })}
                  />

                  <div className="grid grid-cols-3 gap-3">
                    <Input
                      label="TDS"
                      type="number"
                      value={newSample.tds}
                      unit="mg/L"
                      onChange={(e) => setNewSample({ ...newSample, tds: Number(e.target.value) })}
                    />
                    <Input
                      label="硬度"
                      type="number"
                      value={newSample.hardness}
                      unit="mg/L"
                      onChange={(e) => setNewSample({ ...newSample, hardness: Number(e.target.value) })}
                    />
                    <Input
                      label="pH"
                      type="number"
                      step="0.1"
                      value={newSample.ph}
                      onChange={(e) => setNewSample({ ...newSample, ph: Number(e.target.value) })}
                    />
                  </div>

                  <Textarea
                    label="矿物质备注"
                    value={newSample.mineralNotes}
                    onChange={(e) => setNewSample({ ...newSample, mineralNotes: e.target.value })}
                    placeholder="描述水质特点"
                    rows={2}
                  />

                  <Button
                    variant="secondary"
                    fullWidth
                    onClick={handleAddSample}
                    disabled={!newSample.realName.trim()}
                    className="flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    添加水样
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {samples.length >= 3 && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg text-blue-700 text-sm">
              <Info className="w-4 h-4 flex-shrink-0" />
              <span>最多支持 3 个水样对比</span>
            </div>
          )}

          <div className="flex justify-between items-center pt-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/create')}
            >
              上一步
            </Button>
            <Button
              onClick={handleNext}
              disabled={samples.length < 2}
              className="flex items-center gap-2"
            >
              下一步：冲煮记录
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
