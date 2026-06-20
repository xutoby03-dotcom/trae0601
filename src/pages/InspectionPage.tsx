import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  CheckCircle, AlertCircle, XCircle, MinusCircle, Info,
  ChevronRight, ChevronLeft, Image as ImageIcon, AlertTriangle, Tag, FileText
} from 'lucide-react';
import { useInspectionStore } from '@/store/useInspectionStore';
import { CHECKLIST_GROUPS, APERTURES } from '@/data/checklistItems';
import { CheckStatus, SampleType, RiskLevel } from '@/types';
import { statusLabel, formatPrice } from '@/utils/evaluation';
import StepIndicator from '@/components/StepIndicator';

const STATUS_ICONS: Record<CheckStatus, typeof CheckCircle> = {
  pass: CheckCircle,
  warning: AlertCircle,
  fail: XCircle,
  untested: MinusCircle,
};

const STATUS_BUTTONS: { status: CheckStatus; label: string; className: string; classNameExtra?: string; icon: typeof CheckCircle }[] = [
  { status: 'pass', label: '正常', className: 'btn-success', icon: CheckCircle },
  { status: 'warning', label: '注意', className: 'btn', classNameExtra: 'bg-amber-soft/20 text-amber-soft border border-amber-soft/30 hover:bg-amber-soft/30', icon: AlertCircle },
  { status: 'fail', label: '异常', className: 'btn-danger', icon: XCircle },
  { status: 'untested', label: '未测', className: 'btn-secondary', icon: MinusCircle },
];

const SAMPLE_TYPES: { type: SampleType; label: string }[] = [
  { type: 'center', label: '中心' },
  { type: 'corner_tl', label: '左上角' },
  { type: 'corner_tr', label: '右上角' },
  { type: 'corner_bl', label: '左下角' },
  { type: 'corner_br', label: '右下角' },
  { type: 'vignetting', label: '暗角' },
];

const PRESET_RISKS: { name: string; level: RiskLevel; priceImpact: number; description: string }[] = [
  { name: '镜片霉斑', level: 'high', priceImpact: 1500, description: '镜片内部存在蛛网状霉斑，可能继续扩散且难以清除' },
  { name: '对焦漂移', level: 'high', priceImpact: 1200, description: 'AF对焦不稳定，存在前后漂移或跑焦问题' },
  { name: '镜片脱膜', level: 'high', priceImpact: 1000, description: '镜片镀膜脱落或老化，影响成像画质' },
  { name: '光圈漏油', level: 'high', priceImpact: 800, description: '光圈叶片有润滑油渗出，会影响曝光精度' },
  { name: '无限远不合焦', level: 'high', priceImpact: 1000, description: '无法准确对焦到无限远距离' },
  { name: '镜身严重掉漆', level: 'medium', priceImpact: 400, description: '外观有明显掉漆或磕碰痕迹' },
  { name: '镜片划痕', level: 'medium', priceImpact: 500, description: '镜片表面有可见划痕' },
  { name: '卡口磨损', level: 'medium', priceImpact: 300, description: '金属卡口有明显磨损' },
  { name: '少量灰尘', level: 'low', priceImpact: 100, description: '镜片内部有少量灰尘，属正常使用痕迹' },
  { name: '轻微掉漆', level: 'low', priceImpact: 150, description: '外观有轻微使用痕迹' },
];

export default function InspectionPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getInspection, updateCheckItem, setCurrentStep, addSamplePhoto, removeSamplePhoto, addRiskTag, removeRiskTag } = useInspectionStore();

  const inspection = getInspection(id || '');
  const [currentStep, setStep] = useState(inspection?.currentStep ?? 0);
  const [riskForm, setRiskForm] = useState({ name: '', level: 'medium' as RiskLevel, priceImpact: 0, description: '' });

  if (!inspection) {
    return (
      <div className="container py-20 text-center">
        <p className="text-gray-400">检测记录不存在</p>
        <button onClick={() => navigate('/')} className="btn-primary mt-4">返回首页</button>
      </div>
    );
  }

  const currentGroup = CHECKLIST_GROUPS[currentStep];
  const currentItems = inspection.checkItems.filter(i => i.category === currentGroup?.category);

  const completedSteps = useMemo(() => {
    return CHECKLIST_GROUPS.map(group => {
      const items = inspection.checkItems.filter(i => i.category === group.category);
      return items.length > 0 && items.every(i => i.status !== 'untested');
    });
  }, [inspection]);

  const handleStepChange = (step: number) => {
    setStep(step);
    setCurrentStep(inspection.id, step);
  };

  const handleNext = () => {
    if (currentStep < CHECKLIST_GROUPS.length - 1) {
      handleStepChange(currentStep + 1);
    } else {
      navigate(`/inspection/${inspection.id}/samples`);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      handleStepChange(currentStep - 1);
    } else {
      navigate('/');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, aperture: string, type: SampleType, orderIndex: number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      addSamplePhoto(inspection.id, {
        aperture,
        type,
        imageData: reader.result as string,
        orderIndex,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleAddRisk = () => {
    if (!riskForm.name.trim()) return;
    addRiskTag(inspection.id, riskForm);
    setRiskForm({ name: '', level: 'medium', priceImpact: 0, description: '' });
  };

  const handleQuickAddRisk = (preset: typeof PRESET_RISKS[0]) => {
    addRiskTag(inspection.id, preset);
  };

  const riskLevelClass = (level: RiskLevel) => {
    switch (level) {
      case 'high': return 'badge-high';
      case 'medium': return 'badge-medium';
      case 'low': return 'badge-low';
    }
  };

  return (
    <div className="min-h-screen pb-32">
      <div className="container pt-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display text-2xl font-semibold text-white">
              {inspection.lensInfo.brand} {inspection.lensInfo.model}
            </h1>
            <div className="flex items-center gap-3 mt-1 text-sm text-gray-400">
              <span>{inspection.lensInfo.mount}</span>
              <span>卖家报价 <span className="text-copper-400 font-semibold">{formatPrice(inspection.lensInfo.sellerPrice)}</span></span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(`/inspection/${inspection.id}/samples`)}
              className="btn-secondary"
            >
              <ImageIcon className="w-4 h-4" />
              样张对比
            </button>
            <button
              onClick={() => navigate(`/inspection/${inspection.id}/report`)}
              className="btn-primary"
            >
              <FileText className="w-4 h-4" />
              查看报告
            </button>
          </div>
        </div>

        <StepIndicator
          currentStep={currentStep}
          onStepClick={handleStepChange}
          completedSteps={completedSteps}
        />
      </div>

      <div className="container mt-8">
        {currentStep < CHECKLIST_GROUPS.length ? (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="card p-6">
                <div className="flex items-center gap-3 mb-5">
                  <h2 className="font-display text-xl font-semibold text-white">{currentGroup.title}</h2>
                  <span className="text-sm text-gray-500">{currentGroup.subtitle}</span>
                </div>
                <div className="space-y-3">
                  {currentItems.map((item) => (
                    <div key={item.id} className="p-4 rounded-xl bg-ink-800/50 border border-ink-700/50">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-white">{item.itemName}</h3>
                            <span className={`badge-${item.status}`}>
                              {statusLabel(item.status)}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {STATUS_BUTTONS.map((btn) => {
                          const Icon = btn.icon;
                          const isActive = item.status === btn.status;
                          return (
                            <button
                              key={btn.status}
                              onClick={() => updateCheckItem(inspection.id, item.id, btn.status)}
                              className={`${btn.className} ${btn.classNameExtra || ''} !px-3 !py-1.5 !text-sm
                                ${isActive ? 'ring-2 ring-copper-500/60' : 'opacity-60 hover:opacity-100'}`}
                            >
                              <Icon className="w-3.5 h-3.5" />
                              {btn.label}
                            </button>
                          );
                        })}
                      </div>
                      <input
                        type="text"
                        className="input !py-2 !text-sm"
                        placeholder="添加备注..."
                        value={item.notes}
                        onChange={(e) => updateCheckItem(inspection.id, item.id, item.status, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div className="card p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Info className="w-4 h-4 text-copper-400" />
                  <h3 className="font-semibold text-white text-sm">操作提示</h3>
                </div>
                <ul className="space-y-2 text-xs text-gray-400 leading-relaxed">
                  <li>• <span className="text-jade-400">正常</span>：状态良好，无可见问题</li>
                  <li>• <span className="text-amber-soft">注意</span>：存在轻微瑕疵，不影响使用</li>
                  <li>• <span className="text-rust-400">异常</span>：存在明显问题，需重点考虑</li>
                  <li>• 每个检查项完成后自动保存</li>
                  <li>• 可随时跳转至任意步骤</li>
                </ul>
              </div>

              <div className="card p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-copper-400" />
                    <h3 className="font-semibold text-white text-sm">风险标签</h3>
                  </div>
                  <span className="text-xs text-gray-500">{inspection.riskTags.length} 项</span>
                </div>

                {inspection.riskTags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {inspection.riskTags.map(tag => (
                      <div key={tag.id} className="group relative">
                        <span className={`${riskLevelClass(tag.level)} cursor-default`}>
                          {tag.name}
                          <span className="opacity-60 ml-1">-¥{tag.priceImpact}</span>
                        </span>
                        <button
                          onClick={() => removeRiskTag(inspection.id, tag.id)}
                          className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rust-500 text-white text-[10px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="space-y-2 mb-3">
                  <p className="text-xs text-gray-500">快速添加：</p>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_RISKS.slice(0, 6).map((preset, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleQuickAddRisk(preset)}
                        className={`${riskLevelClass(preset.level)} hover:scale-105 transition-transform cursor-pointer`}
                      >
                        + {preset.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-ink-700/50 space-y-2">
                  <input
                    type="text"
                    className="input !py-2 !text-sm"
                    placeholder="自定义风险名称"
                    value={riskForm.name}
                    onChange={(e) => setRiskForm({ ...riskForm, name: e.target.value })}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      className="input !py-2 !text-sm"
                      value={riskForm.level}
                      onChange={(e) => setRiskForm({ ...riskForm, level: e.target.value as RiskLevel })}
                    >
                      <option value="high">高风险</option>
                      <option value="medium">中风险</option>
                      <option value="low">低风险</option>
                    </select>
                    <input
                      type="number"
                      className="input !py-2 !text-sm"
                      placeholder="砍价金额"
                      value={riskForm.priceImpact || ''}
                      onChange={(e) => setRiskForm({ ...riskForm, priceImpact: Number(e.target.value) })}
                    />
                  </div>
                  <input
                    type="text"
                    className="input !py-2 !text-sm"
                    placeholder="风险描述"
                    value={riskForm.description}
                    onChange={(e) => setRiskForm({ ...riskForm, description: e.target.value })}
                  />
                  <button
                    onClick={handleAddRisk}
                    disabled={!riskForm.name.trim()}
                    className="btn-secondary w-full !py-2 !text-sm"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    添加风险标签
                  </button>
                </div>
              </div>

              {currentGroup?.category === 'samples' && (
                <div className="card p-5">
                  <h3 className="font-semibold text-white text-sm mb-4">快速上传样张</h3>
                  <div className="space-y-3 max-h-[400px] overflow-y-auto scrollbar-thin pr-1">
                    {APERTURES.slice(0, 5).map((ap, apIdx) => (
                      <div key={ap} className="space-y-2">
                        <p className="text-xs font-medium text-copper-400">{ap}</p>
                        <div className="grid grid-cols-3 gap-1.5">
                          {SAMPLE_TYPES.slice(0, 3).map((st, stIdx) => {
                            const existing = inspection.samplePhotos.find(
                              p => p.aperture === ap && p.type === st.type
                            );
                            return (
                              <label key={st.type} className="relative aspect-square rounded-lg bg-ink-800 border border-dashed border-ink-600 hover:border-copper-500/40 cursor-pointer overflow-hidden group">
                                {existing ? (
                                  <>
                                    <img src={existing.imageData} alt="" className="w-full h-full object-cover" />
                                    <button
                                      onClick={(e) => { e.preventDefault(); removeSamplePhoto(inspection.id, existing.id); }}
                                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-rust-500/90 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100"
                                    >×</button>
                                  </>
                                ) : (
                                  <div className="flex flex-col items-center justify-center h-full text-gray-600 group-hover:text-copper-400">
                                    <ImageIcon className="w-4 h-4 mb-0.5" />
                                    <span className="text-[9px]">{st.label}</span>
                                  </div>
                                )}
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => handleImageUpload(e, ap, st.type, apIdx * 3 + stIdx)}
                                />
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-30 backdrop-blur-md bg-ink-950/80 border-t border-ink-700/50">
        <div className="container flex items-center justify-between h-16">
          <button onClick={handlePrev} className="btn-secondary">
            <ChevronLeft className="w-4 h-4" />
            {currentStep === 0 ? '返回首页' : '上一步'}
          </button>
          <div className="text-sm text-gray-400">
            步骤 {currentStep + 1} / {CHECKLIST_GROUPS.length}
          </div>
          <button onClick={handleNext} className="btn-primary">
            {currentStep === CHECKLIST_GROUPS.length - 1 ? '进入样张对比' : '下一步'}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
