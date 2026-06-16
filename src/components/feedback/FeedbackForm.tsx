import { useState } from 'react';
import { Save, X, User, Ruler, Activity, AlertCircle } from 'lucide-react';
import { Button, PhotoUploader } from '@/components/common';
import { FeelSlider, ProblemTypePicker } from '@/components/feedback';
import { SizeCode, FeelLevel, ProblemType, Feedback } from '@/types';
import { cn } from '@/lib/utils';

type FeedbackFormData = Omit<Feedback, 'id' | 'createdAt'>;

interface FeedbackFormProps {
  sampleId: string;
  onSubmit: (data: FeedbackFormData) => void;
  onCancel: () => void;
}

const actionOptions = ['抬臂', '下蹲', '转身', '弯腰', '抬手', '久坐'];
const sizeOptions: SizeCode[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

export default function FeedbackFormInner({
  sampleId,
  onSubmit,
  onCancel,
}: FeedbackFormProps) {
  const [wearerName, setWearerName] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [usualSize, setUsualSize] = useState<SizeCode>('M');
  const [trySize, setTrySize] = useState<SizeCode>('M');
  const [shoulderFeel, setShoulderFeel] = useState<FeelLevel>(2);
  const [chestFeel, setChestFeel] = useState<FeelLevel>(2);
  const [waistFeel, setWaistFeel] = useState<FeelLevel>(2);
  const [shoulderNote, setShoulderNote] = useState('');
  const [chestNote, setChestNote] = useState('');
  const [waistNote, setWaistNote] = useState('');
  const [limitedActions, setLimitedActions] = useState<string[]>([]);
  const [problemTypes, setProblemTypes] = useState<ProblemType[]>([]);
  const [problemDescription, setProblemDescription] = useState('');
  const [suggestions, setSuggestions] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);

  const toggleAction = (action: string) => {
    if (limitedActions.includes(action)) {
      setLimitedActions(limitedActions.filter((a) => a !== action));
    } else {
      setLimitedActions([...limitedActions, action]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wearerName.trim()) return;

    onSubmit({
      sampleId,
      wearerName: wearerName.trim(),
      height: Number(height) || 0,
      weight: Number(weight) || 0,
      usualSize,
      trySize,
      shoulderFeel,
      chestFeel,
      waistFeel,
      shoulderNote: shoulderNote.trim() || undefined,
      chestNote: chestNote.trim() || undefined,
      waistNote: waistNote.trim() || undefined,
      limitedActions,
      problemTypes,
      problemDescription: problemDescription.trim() || undefined,
      suggestions: suggestions
        .split(/[,，]/)
        .map((s) => s.trim())
        .filter(Boolean),
      photos,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-charcoal-700 border-b border-cream-200 pb-2">
          <User className="h-4 w-4" />
          试穿人信息
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-charcoal-600 mb-1">姓名 *</label>
            <input
              type="text"
              value={wearerName}
              onChange={(e) => setWearerName(e.target.value)}
              placeholder="请输入姓名"
              className="w-full px-3 py-2 border border-cream-200 rounded-md focus:outline-none focus:ring-2 focus:ring-charcoal-300 bg-cream-50"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-charcoal-600 mb-1">身高 (cm)</label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="170"
                className="w-full px-3 py-2 border border-cream-200 rounded-md focus:outline-none focus:ring-2 focus:ring-charcoal-300 bg-cream-50"
              />
            </div>
            <div>
              <label className="block text-sm text-charcoal-600 mb-1">体重 (kg)</label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="60"
                className="w-full px-3 py-2 border border-cream-200 rounded-md focus:outline-none focus:ring-2 focus:ring-charcoal-300 bg-cream-50"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-charcoal-600 mb-1">常穿尺码</label>
            <div className="flex gap-2">
              {sizeOptions.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setUsualSize(size)}
                  className={cn(
                    'flex-1 py-1.5 text-sm rounded-md border transition-colors',
                    usualSize === size
                      ? 'bg-moss-100 border-moss-400 text-moss-700 font-medium'
                      : 'bg-white border-cream-200 text-charcoal-500 hover:border-charcoal-300'
                  )}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm text-charcoal-600 mb-1">试穿尺码</label>
            <div className="flex gap-2">
              {sizeOptions.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setTrySize(size)}
                  className={cn(
                    'flex-1 py-1.5 text-sm rounded-md border transition-colors',
                    trySize === size
                      ? 'bg-moss-100 border-moss-400 text-moss-700 font-medium'
                      : 'bg-white border-cream-200 text-charcoal-500 hover:border-charcoal-300'
                  )}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-charcoal-700 border-b border-cream-200 pb-2">
          <Ruler className="h-4 w-4" />
          身体部位感受
        </div>
        <FeelSlider
          label="肩宽"
          value={shoulderFeel}
          onChange={setShoulderFeel}
          note={shoulderNote}
          onNoteChange={setShoulderNote}
        />
        <FeelSlider
          label="胸围"
          value={chestFeel}
          onChange={setChestFeel}
          note={chestNote}
          onNoteChange={setChestNote}
        />
        <FeelSlider
          label="腰围"
          value={waistFeel}
          onChange={setWaistFeel}
          note={waistNote}
          onNoteChange={setWaistNote}
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-charcoal-700 border-b border-cream-200 pb-2">
          <Activity className="h-4 w-4" />
          活动受限动作
        </div>
        <div className="flex flex-wrap gap-2">
          {actionOptions.map((action) => (
            <button
              key={action}
              type="button"
              onClick={() => toggleAction(action)}
              className={cn(
                'px-4 py-1.5 text-sm rounded-full border transition-all',
                limitedActions.includes(action)
                  ? 'bg-terracotta-100 border-terracotta-400 text-terracotta-700 font-medium'
                  : 'bg-white border-cream-200 text-charcoal-500 hover:border-charcoal-300'
              )}
            >
              {action}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-charcoal-700 border-b border-cream-200 pb-2">
          <AlertCircle className="h-4 w-4" />
          问题类型
        </div>
        <ProblemTypePicker selected={problemTypes} onChange={setProblemTypes} />
      </div>

      <div>
        <label className="block text-sm text-charcoal-600 mb-1">问题描述</label>
        <textarea
          value={problemDescription}
          onChange={(e) => setProblemDescription(e.target.value)}
          placeholder="请详细描述遇到的问题..."
          rows={3}
          className="w-full px-3 py-2 border border-cream-200 rounded-md focus:outline-none focus:ring-2 focus:ring-charcoal-300 bg-cream-50 resize-none"
        />
      </div>

      <div>
        <label className="block text-sm text-charcoal-600 mb-1">修改建议</label>
        <textarea
          value={suggestions}
          onChange={(e) => setSuggestions(e.target.value)}
          placeholder="多条建议用逗号分隔，例如：收腰2cm, 肩宽加宽1cm"
          rows={2}
          className="w-full px-3 py-2 border border-cream-200 rounded-md focus:outline-none focus:ring-2 focus:ring-charcoal-300 bg-cream-50 resize-none"
        />
      </div>

      <div>
        <label className="block text-sm text-charcoal-600 mb-2">试穿照片</label>
        <PhotoUploader photos={photos} onChange={setPhotos} />
      </div>

      <div className="flex justify-end gap-3 pt-3 border-t border-cream-200">
        <Button variant="ghost" onClick={onCancel} icon={<X className="h-4 w-4" />}>
          取消
        </Button>
        <Button variant="primary" type="submit" icon={<Save className="h-4 w-4" />}>
          保存反馈
        </Button>
      </div>
    </form>
  );
}
