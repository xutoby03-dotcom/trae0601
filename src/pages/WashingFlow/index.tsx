import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Plus,
  Trash2,
  Camera,
  Ruler,
  Palette,
  Clapperboard,
  CheckCircle,
  Package,
} from 'lucide-react';
import { useAppStore } from '@/store';
import PageContainer from '@/components/Layout/PageContainer';
import PageHeader from '@/components/Layout/PageHeader';
import StepProgress from '@/components/Progress/StepProgress';
import {
  getCurtainTypeLabel,
  getWashMethodLabel,
  getDryingMethodLabel,
} from '@/utils/statistics';
import { formatDateTime, formatDate, getTodayStr, getNowStr } from '@/utils/date';
import type {
  WashingStep,
  RemovalCheck,
  DryingMethod,
  WashingRecord,
  MissingPart,
} from '@/types';

const steps: { key: WashingStep; label: string }[] = [
  { key: 'removal', label: '拆下检查' },
  { key: 'wash', label: '清洗记录' },
  { key: 'dry', label: '晾干熨烫' },
  { key: 'install', label: '装回验收' },
];

export default function WashingFlow() {
  const { roomId, curtainId } = useParams<{ roomId: string; curtainId: string }>();
  const navigate = useNavigate();

  const {
    rooms,
    curtains,
    records,
    photos,
    addRecord,
    updateRecord,
    updateWashingStep,
    updateRemovalCheck,
    addMissingPart,
    removeMissingPart,
    completeWashing,
    addPhoto,
  } = useAppStore();

  const room = rooms.find((r) => r.id === roomId);
  const curtain = curtains.find((c) => c.id === curtainId);

  const existingRecord = records.find(
    (r) => r.curtainId === curtainId && !r.completed
  );

  const [record, setRecord] = useState<WashingRecord | null>(existingRecord || null);
  const [removalCheck, setRemovalCheck] = useState<RemovalCheck>({
    trackIntact: true,
    strapIntact: true,
    hookIntact: true,
    clothIntact: true,
    notes: '',
  });
  const [dryingMethod, setDryingMethod] = useState<DryingMethod>('natural');
  const [ironed, setIroned] = useState(false);
  const [missingPartName, setMissingPartName] = useState('');
  const [missingPartQty, setMissingPartQty] = useState(1);
  const [missingPartNotes, setMissingPartNotes] = useState('');

  useEffect(() => {
    if (existingRecord) {
      setRecord(existingRecord);
      setRemovalCheck(existingRecord.removalCheck);
      setDryingMethod(existingRecord.dryingMethod);
      setIroned(existingRecord.ironed);
    } else if (curtain) {
      const newRecord: WashingRecord = {
        id: '',
        curtainId: curtain.id,
        startDate: getTodayStr(),
        removalTime: null,
        washTime: null,
        dryTime: null,
        installTime: null,
        removalCheck: {
          trackIntact: true,
          strapIntact: true,
          hookIntact: true,
          clothIntact: true,
          notes: '',
        },
        dryingMethod: 'natural',
        ironed: false,
        missingParts: [],
        totalMinutes: 0,
        completed: false,
        currentStep: 'removal',
      };
      addRecord(newRecord);
    }
  }, [existingRecord, curtain, addRecord]);

  useEffect(() => {
    if (record) {
      const currentRecord = records.find((r) => r.id === record.id);
      if (currentRecord) {
        setRecord(currentRecord);
      }
    }
  }, [records, record?.id]);

  if (!room || !curtain || !record) {
    return (
      <PageContainer>
        <div className="text-center py-16">
          <p className="text-gray-500">未找到相关信息</p>
          <Link to="/rooms" className="btn-primary mt-4 inline-block">
            返回房间列表
          </Link>
        </div>
      </PageContainer>
    );
  }

  const currentStepIndex = steps.findIndex((s) => s.key === record.currentStep);

  const handleNextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      const nextStep = steps[currentStepIndex + 1].key;
      updateWashingStep(record.id, nextStep);
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      const prevStep = steps[currentStepIndex - 1].key;
      updateWashingStep(record.id, prevStep);
    }
  };

  const handleSaveRemovalCheck = () => {
    updateRemovalCheck(record.id, removalCheck);
    handleNextStep();
  };

  const handleAddMissingPart = () => {
    if (!missingPartName.trim()) return;
    addMissingPart(record.id, {
      name: missingPartName,
      quantity: missingPartQty,
      notes: missingPartNotes,
    });
    setMissingPartName('');
    setMissingPartQty(1);
    setMissingPartNotes('');
  };

  const handleComplete = () => {
    completeWashing(record.id);
    navigate(`/rooms`);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      addPhoto({
        curtainId: curtain.id,
        dataUrl,
        createdAt: getNowStr(),
        type: 'before',
      });
    };
    reader.readAsDataURL(file);
  };

  const curtainPhotos = photos.filter((p) => p.curtainId === curtain.id);

  const renderStepContent = () => {
    switch (record.currentStep) {
      case 'removal':
        return (
          <div className="space-y-6 opacity-0 animate-fade-in-up">
            <div className="card">
              <h3 className="text-lg mb-4 flex items-center gap-2">
                <Ruler size={20} className="text-primary-500" />
                拆下检查清单
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                请逐一检查以下项目是否完整
              </p>

              <div className="space-y-4">
                <label className="flex items-center gap-4 p-4 rounded-xl bg-warm-50 hover:bg-warm-100 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    className="checkbox-custom"
                    checked={removalCheck.trackIntact}
                    onChange={(e) =>
                      setRemovalCheck({ ...removalCheck, trackIntact: e.target.checked })
                    }
                  />
                  <div>
                    <p className="font-medium text-primary-800">轨道完整</p>
                    <p className="text-sm text-gray-500">检查轨道是否有变形、断裂</p>
                  </div>
                </label>

                <label className="flex items-center gap-4 p-4 rounded-xl bg-warm-50 hover:bg-warm-100 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    className="checkbox-custom"
                    checked={removalCheck.strapIntact}
                    onChange={(e) =>
                      setRemovalCheck({ ...removalCheck, strapIntact: e.target.checked })
                    }
                  />
                  <div>
                    <p className="font-medium text-primary-800">绑带完整</p>
                    <p className="text-sm text-gray-500">检查绑带是否有磨损、断裂</p>
                  </div>
                </label>

                <label className="flex items-center gap-4 p-4 rounded-xl bg-warm-50 hover:bg-warm-100 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    className="checkbox-custom"
                    checked={removalCheck.hookIntact}
                    onChange={(e) =>
                      setRemovalCheck({ ...removalCheck, hookIntact: e.target.checked })
                    }
                  />
                  <div>
                    <p className="font-medium text-primary-800">挂钩完整</p>
                    <p className="text-sm text-gray-500">
                      检查挂钩数量（应有 {curtain.hookCount} 个）
                    </p>
                  </div>
                </label>

                <label className="flex items-center gap-4 p-4 rounded-xl bg-warm-50 hover:bg-warm-100 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    className="checkbox-custom"
                    checked={removalCheck.clothIntact}
                    onChange={(e) =>
                      setRemovalCheck({ ...removalCheck, clothIntact: e.target.checked })
                    }
                  />
                  <div>
                    <p className="font-medium text-primary-800">布料完整</p>
                    <p className="text-sm text-gray-500">检查布料是否有破损、霉点</p>
                  </div>
                </label>
              </div>

              <div className="mt-4">
                <label className="input-label">检查备注</label>
                <textarea
                  className="input-field"
                  rows={3}
                  value={removalCheck.notes}
                  onChange={(e) =>
                    setRemovalCheck({ ...removalCheck, notes: e.target.value })
                  }
                  placeholder="记录发现的问题，如缺失配件、霉点等"
                />
              </div>
            </div>

            <div className="card">
              <h3 className="text-lg mb-4 flex items-center gap-2">
                <Camera size={20} className="text-primary-500" />
                拆前照片
              </h3>

              {curtainPhotos.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {curtainPhotos.map((photo) => (
                    <div key={photo.id} className="aspect-square rounded-xl overflow-hidden">
                      <img
                        src={photo.dataUrl}
                        alt="拆前照片"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}

              <label className="flex items-center justify-center gap-2 py-8 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 hover:border-primary-300 hover:text-primary-500 hover:bg-primary-50 transition-all cursor-pointer">
                <Camera size={24} />
                <span>点击上传拆前照片</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoUpload}
                />
              </label>
            </div>

            <div className="flex justify-end">
              <button onClick={handleSaveRemovalCheck} className="btn-primary flex items-center gap-2">
                下一步：开始清洗
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        );

      case 'wash':
        return (
          <div className="space-y-6 opacity-0 animate-fade-in-up">
            <div className="card">
              <h3 className="text-lg mb-4 flex items-center gap-2">
                <Palette size={20} className="text-primary-500" />
                清洗信息
              </h3>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="input-label">窗帘类型</label>
                  <div className="p-3 bg-warm-50 rounded-xl">
                    {getCurtainTypeLabel(curtain.type)}
                  </div>
                </div>
                <div>
                  <label className="input-label">推荐清洗方式</label>
                  <div className="p-3 bg-warm-50 rounded-xl">
                    {getWashMethodLabel(curtain.washMethod)}
                  </div>
                </div>
                <div>
                  <label className="input-label">尺寸</label>
                  <div className="p-3 bg-warm-50 rounded-xl">
                    {curtain.size.width} × {curtain.size.height} cm
                  </div>
                </div>
                <div>
                  <label className="input-label">挂钩数量</label>
                  <div className="p-3 bg-warm-50 rounded-xl">
                    {curtain.hookCount} 个
                  </div>
                </div>
              </div>

              {curtain.notes && (
                <div className="mt-4 p-4 bg-coral-50 rounded-xl border border-coral-200">
                  <p className="text-sm text-coral-700">
                    <strong>注意事项：</strong> {curtain.notes}
                  </p>
                </div>
              )}
            </div>

            <div className="card">
              <h3 className="text-lg mb-4">清洗时间记录</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="input-label">开始拆下时间</label>
                  <div className="p-3 bg-warm-50 rounded-xl">
                    {formatDateTime(record.removalTime)}
                  </div>
                </div>
                <div>
                  <label className="input-label">开始清洗时间</label>
                  <div className="p-3 bg-warm-50 rounded-xl">
                    {formatDateTime(record.washTime)}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <button onClick={handlePrevStep} className="btn-secondary flex items-center gap-2">
                <ArrowLeft size={18} />
                上一步
              </button>
              <button onClick={handleNextStep} className="btn-primary flex items-center gap-2">
                下一步：晾干熨烫
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        );

      case 'dry':
        return (
          <div className="space-y-6 opacity-0 animate-fade-in-up">
            <div className="card">
              <h3 className="text-lg mb-4 flex items-center gap-2">
                <Clapperboard size={20} className="text-primary-500" />
                晾干方式
              </h3>

              <div className="grid md:grid-cols-3 gap-4">
                {(['natural', 'machine', 'shade'] as DryingMethod[]).map((method) => (
                  <label
                    key={method}
                    className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
                      dryingMethod === method
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-primary-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="dryingMethod"
                      value={method}
                      checked={dryingMethod === method}
                      onChange={(e) => setDryingMethod(e.target.value as DryingMethod)}
                      className="sr-only"
                    />
                    <div className="text-center">
                      <div className="text-3xl mb-2">
                        {method === 'natural' && '☀️'}
                        {method === 'machine' && '🌀'}
                        {method === 'shade' && '🌥️'}
                      </div>
                      <p className="font-medium text-primary-800">
                        {getDryingMethodLabel(method)}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="card">
              <h3 className="text-lg mb-4">熨烫</h3>
              <label className="flex items-center gap-4 p-4 rounded-xl bg-warm-50 cursor-pointer hover:bg-warm-100 transition-colors">
                <input
                  type="checkbox"
                  className="checkbox-custom"
                  checked={ironed}
                  onChange={(e) => setIroned(e.target.checked)}
                />
                <div>
                  <p className="font-medium text-primary-800">已熨烫</p>
                  <p className="text-sm text-gray-500">窗帘清洗后是否经过熨烫处理</p>
                </div>
              </label>
            </div>

            <div className="card">
              <h3 className="text-lg mb-4">时间记录</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="input-label">开始清洗时间</label>
                  <div className="p-3 bg-warm-50 rounded-xl">
                    {formatDateTime(record.washTime)}
                  </div>
                </div>
                <div>
                  <label className="input-label">开始晾干时间</label>
                  <div className="p-3 bg-warm-50 rounded-xl">
                    {formatDateTime(record.dryTime)}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <button onClick={handlePrevStep} className="btn-secondary flex items-center gap-2">
                <ArrowLeft size={18} />
                上一步
              </button>
              <button
                onClick={() => {
                  updateRecord({ ...record, dryingMethod, ironed });
                  handleNextStep();
                }}
                className="btn-primary flex items-center gap-2"
              >
                下一步：装回验收
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        );

      case 'install':
        return (
          <div className="space-y-6 opacity-0 animate-fade-in-up">
            <div className="card">
              <h3 className="text-lg mb-4 flex items-center gap-2">
                <CheckCircle size={20} className="text-sage-500" />
                装回验收
              </h3>

              <div className="mb-6">
                <h4 className="font-medium text-primary-800 mb-3">检查事项</h4>
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="flex items-center gap-3 p-3 bg-sage-50 rounded-xl">
                    <Check size={20} className="text-sage-500" />
                    <span>轨道清洁完成</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-sage-50 rounded-xl">
                    <Check size={20} className="text-sage-500" />
                    <span>挂钩数量正确</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-sage-50 rounded-xl">
                    <Check size={20} className="text-sage-500" />
                    <span>窗帘挂放平整</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-sage-50 rounded-xl">
                    <Check size={20} className="text-sage-500" />
                    <span>拉动顺滑无卡顿</span>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="font-medium text-primary-800 mb-3">时间记录</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="input-label">开始晾干时间</label>
                    <div className="p-3 bg-warm-50 rounded-xl">
                      {formatDateTime(record.dryTime)}
                    </div>
                  </div>
                  <div>
                    <label className="input-label">开始装回时间</label>
                    <div className="p-3 bg-warm-50 rounded-xl">
                      {formatDateTime(record.installTime)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-primary-800 mb-3">拆下检查摘要</h4>
                  <div className="p-4 bg-gray-50 rounded-xl space-y-2 text-sm">
                    <p>
                      轨道：{removalCheck.trackIntact ? '✅ 完整' : '❌ 有问题'}
                    </p>
                    <p>
                      绑带：{removalCheck.strapIntact ? '✅ 完整' : '❌ 有问题'}
                    </p>
                    <p>
                      挂钩：{removalCheck.hookIntact ? '✅ 完整' : '❌ 有问题'}
                    </p>
                    <p>
                      布料：{removalCheck.clothIntact ? '✅ 完整' : '❌ 有问题'}
                    </p>
                    {removalCheck.notes && (
                      <p className="pt-2 border-t border-gray-200">
                        备注：{removalCheck.notes}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-primary-800 mb-3">晾干熨烫摘要</h4>
                  <div className="p-4 bg-gray-50 rounded-xl space-y-2 text-sm">
                    <p>晾干方式：{getDryingMethodLabel(dryingMethod)}</p>
                    <p>熨烫：{ironed ? '✅ 已熨烫' : '❌ 未熨烫'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="text-lg mb-4 flex items-center gap-2">
                <Package size={20} className="text-coral-500" />
                缺失配件记录
              </h3>

              {record.missingParts.length > 0 && (
                <div className="mb-4 space-y-2">
                  {record.missingParts.map((part) => (
                    <div
                      key={part.id}
                      className="flex items-center justify-between p-3 bg-coral-50 rounded-xl"
                    >
                      <div>
                        <p className="font-medium text-coral-700">
                          {part.name} × {part.quantity}
                        </p>
                        {part.notes && (
                          <p className="text-sm text-coral-600">{part.notes}</p>
                        )}
                      </div>
                      <button
                        onClick={() => removeMissingPart(record.id, part.id)}
                        className="p-2 hover:bg-coral-100 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} className="text-coral-500" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="grid md:grid-cols-4 gap-3">
                <input
                  type="text"
                  className="input-field md:col-span-2"
                  placeholder="配件名称（如：挂钩、绑带）"
                  value={missingPartName}
                  onChange={(e) => setMissingPartName(e.target.value)}
                />
                <input
                  type="number"
                  className="input-field"
                  placeholder="数量"
                  min={1}
                  value={missingPartQty}
                  onChange={(e) => setMissingPartQty(Number(e.target.value))}
                />
                <button
                  onClick={handleAddMissingPart}
                  className="btn-secondary flex items-center justify-center gap-2"
                  disabled={!missingPartName.trim()}
                >
                  <Plus size={18} />
                  添加
                </button>
              </div>
              <input
                type="text"
                className="input-field mt-3"
                placeholder="备注（可选）"
                value={missingPartNotes}
                onChange={(e) => setMissingPartNotes(e.target.value)}
              />
            </div>

            <div className="flex justify-between">
              <button onClick={handlePrevStep} className="btn-secondary flex items-center gap-2">
                <ArrowLeft size={18} />
                上一步
              </button>
              <button onClick={handleComplete} className="btn-primary flex items-center gap-2">
                <Check size={18} />
                完成清洗
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title={`${room.icon} ${room.name} - ${curtain.name}`}
        subtitle="清洗流程"
        actions={
          <Link to="/rooms" className="btn-ghost flex items-center gap-2">
            <ArrowLeft size={18} />
            返回
          </Link>
        }
      />

      <div className="card mb-6 opacity-0 animate-fade-in-down">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg mb-1">
              {getCurtainTypeLabel(curtain.type)} · {getWashMethodLabel(curtain.washMethod)}
            </h2>
            <p className="text-sm text-gray-500">
              尺寸：{curtain.size.width} × {curtain.size.height} cm · 挂钩：
              {curtain.hookCount} 个
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">开始日期</p>
            <p className="font-medium text-primary-700">{formatDate(record.startDate)}</p>
          </div>
        </div>
      </div>

      <StepProgress currentStep={record.currentStep} steps={steps} />

      {renderStepContent()}
    </PageContainer>
  );
}
