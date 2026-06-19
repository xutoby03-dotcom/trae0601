import { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import type { CleaningRecord, OperationType, OdorLevel, ClumpCondition, LitterBox, Cat } from '@/types';
import { OPERATION_LABELS, ODOR_LABELS, CLUMP_LABELS } from '@/types';
import { detectAbnormalities } from '@/utils/detection';

interface RecordFormProps {
  litterBoxes: LitterBox[];
  cats: Cat[];
  onSubmit: (data: Omit<CleaningRecord, 'id' | 'isAbnormal' | 'abnormalTypes' | 'createdAt'>) => void;
  onCancel: () => void;
}

export default function RecordForm({ litterBoxes, cats, onSubmit, onCancel }: RecordFormProps) {
  const now = new Date();
  
  const [formData, setFormData] = useState({
    litterBoxId: litterBoxes[0]?.id || '',
    catId: '' as string,
    date: now.toISOString().split('T')[0],
    time: now.toTimeString().slice(0, 5),
    operator: '',
    operationTypes: ['scoop'] as OperationType[],
    litterAdded: 0,
    deodorizerUsed: 0,
    odorLevel: 'none' as OdorLevel,
    clumpCondition: 'normal' as ClumpCondition,
    hasBloodUrine: false,
    hasAbnormalStool: false,
    hasSmallClumps: false,
    noStoolForDays: false,
    notes: '',
  });
  
  const selectedBox = litterBoxes.find(b => b.id === formData.litterBoxId);

  const { isAbnormal, abnormalTypes } = detectAbnormalities(formData);

  const handleOperationToggle = (type: OperationType) => {
    setFormData(prev => ({
      ...prev,
      operationTypes: prev.operationTypes.includes(type)
        ? prev.operationTypes.filter(t => t !== type)
        : [...prev.operationTypes, type],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.operationTypes.length === 0) {
      alert('请至少选择一种操作类型');
      return;
    }
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-warm-100 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-display">记录清理</h2>
          <button
            onClick={onCancel}
            className="p-2 rounded-xl hover:bg-cream-200 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {isAbnormal && (
            <div className="bg-coral-50 border-2 border-coral-300 rounded-2xl p-4 flex items-start gap-3 animate-pulse-soft">
              <AlertTriangle className="text-coral-400 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="font-medium text-coral-400">检测到异常情况</p>
                <p className="text-sm text-coral-300 mt-1">
                  标记为：{abnormalTypes.map(t => t === 'blood_urine' ? '血尿' : t === 'abnormal_stool' ? '排便异常' : t === 'small_clumps' ? '尿团过小' : '多天未排便').join('、')}
                </p>
                <p className="text-xs text-coral-300 mt-1">
                  保存后将自动生成健康观察记录
                </p>
              </div>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-warm-400 mb-1">
              猫砂盆 *
            </label>
            <select
              required
              value={formData.litterBoxId}
              onChange={(e) => setFormData({ ...formData, litterBoxId: e.target.value })}
              className="input-field"
            >
              {litterBoxes.map(box => (
                <option key={box.id} value={box.id}>{box.location}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-warm-400 mb-1">
              关联猫咪（可选）
            </label>
            <select
              value={formData.catId}
              onChange={(e) => setFormData({ ...formData, catId: e.target.value })}
              className="input-field"
            >
              <option value="">不关联</option>
              {cats.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-warm-400 mb-1">
                日期 *
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-warm-400 mb-1">
                时间 *
              </label>
              <input
                type="time"
                required
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="input-field"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-warm-400 mb-1">
              操作人
            </label>
            <input
              type="text"
              value={formData.operator}
              onChange={(e) => setFormData({ ...formData, operator: e.target.value })}
              className="input-field"
              placeholder="例如：爸爸、妈妈"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-warm-400 mb-2">
              操作类型 *（可多选）
            </label>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(OPERATION_LABELS) as OperationType[]).map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleOperationToggle(type)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    formData.operationTypes.includes(type)
                      ? 'bg-sand-200 text-white'
                      : 'bg-cream-200 text-warm-400 hover:bg-cream-300'
                  }`}
                >
                  {OPERATION_LABELS[type]}
                </button>
              ))}
            </div>
          </div>
          
          {formData.operationTypes.includes('add_litter') && (
            <div>
              <label className="block text-sm font-medium text-warm-400 mb-1">
                补砂量（kg）
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={formData.litterAdded}
                onChange={(e) => setFormData({ ...formData, litterAdded: parseFloat(e.target.value) || 0 })}
                className="input-field"
              />
            </div>
          )}
          
          {formData.operationTypes.includes('disinfect') && (
            <div>
              <label className="block text-sm font-medium text-warm-400 mb-1">
                除臭珠用量（颗）
                {selectedBox && (
                  <span className="text-warm-300 ml-2">
                    （剩余：{selectedBox.deodorizerRemaining} 颗）
                  </span>
                )}
              </label>
              <input
                type="number"
                min="0"
                value={formData.deodorizerUsed}
                onChange={(e) => setFormData({ ...formData, deodorizerUsed: parseInt(e.target.value) || 0 })}
                className="input-field"
                placeholder="例如：5"
              />
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-warm-400 mb-1">
                异味等级
              </label>
              <select
                value={formData.odorLevel}
                onChange={(e) => setFormData({ ...formData, odorLevel: e.target.value as OdorLevel })}
                className="input-field"
              >
                {(Object.keys(ODOR_LABELS) as OdorLevel[]).map(level => (
                  <option key={level} value={level}>{ODOR_LABELS[level]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-warm-400 mb-1">
                结团情况
              </label>
              <select
                value={formData.clumpCondition}
                onChange={(e) => setFormData({ ...formData, clumpCondition: e.target.value as ClumpCondition })}
                className="input-field"
              >
                {(Object.keys(CLUMP_LABELS) as ClumpCondition[]).map(condition => (
                  <option key={condition} value={condition}>{CLUMP_LABELS[condition]}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="bg-cream-50 rounded-2xl p-4">
            <p className="text-sm font-medium text-warm-400 mb-3">异常情况标记</p>
            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.hasBloodUrine}
                  onChange={(e) => setFormData({ ...formData, hasBloodUrine: e.target.checked })}
                  className="w-5 h-5 rounded border-warm-200 text-sand-200 focus:ring-sand-200"
                />
                <span className="text-sm text-warm-400">血尿</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.hasAbnormalStool}
                  onChange={(e) => setFormData({ ...formData, hasAbnormalStool: e.target.checked })}
                  className="w-5 h-5 rounded border-warm-200 text-sand-200 focus:ring-sand-200"
                />
                <span className="text-sm text-warm-400">排便异常</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.hasSmallClumps}
                  onChange={(e) => setFormData({ ...formData, hasSmallClumps: e.target.checked })}
                  className="w-5 h-5 rounded border-warm-200 text-sand-200 focus:ring-sand-200"
                />
                <span className="text-sm text-warm-400">尿团过小</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.noStoolForDays}
                  onChange={(e) => setFormData({ ...formData, noStoolForDays: e.target.checked })}
                  className="w-5 h-5 rounded border-warm-200 text-sand-200 focus:ring-sand-200"
                />
                <span className="text-sm text-warm-400">多天未排便</span>
              </label>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-warm-400 mb-1">
              备注
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="input-field min-h-[80px]"
              placeholder="记录其他观察到的情况..."
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="btn-secondary flex-1"
            >
              取消
            </button>
            <button type="submit" className="btn-primary flex-1">
              保存记录
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
