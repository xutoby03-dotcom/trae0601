import { useState, useEffect } from 'react';
import { Plus, Edit3, X, Battery, Clock, Map, Eye, Zap, Shield, ChevronDown } from 'lucide-react';
import { useCheckpointStore, initialFormState } from '@/store/useCheckpointStore';
import type { FormState } from '@/types';
import { HIDE_METHODS, TERRAIN_TYPES, DIFFICULTY_LABELS, DIFFICULTY_COLORS } from '@/types';
import { getBatteryStatus } from '@/utils/helpers';

export default function CheckpointForm() {
  const { checkpoints, editingId, addCheckpoint, updateCheckpoint, setEditingId } = useCheckpointStore();
  const [formData, setFormData] = useState<FormState>(initialFormState);
  const [showHideMethods, setShowHideMethods] = useState(false);

  const editingCheckpoint = editingId ? checkpoints.find(cp => cp.id === editingId) : null;

  useEffect(() => {
    if (editingCheckpoint) {
      setFormData({
        pointNumber: editingCheckpoint.pointNumber,
        terrainDescription: editingCheckpoint.terrainDescription,
        hideMethod: editingCheckpoint.hideMethod,
        estimatedArrival: editingCheckpoint.estimatedArrival,
        batteryLevel: editingCheckpoint.batteryLevel,
        hasBackup: editingCheckpoint.hasBackup,
        difficulty: editingCheckpoint.difficulty,
        distanceToNext: editingCheckpoint.distanceToNext,
        notes: editingCheckpoint.notes || '',
      });
    } else {
      setFormData(initialFormState);
    }
  }, [editingId, editingCheckpoint]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.pointNumber.trim()) return;

    if (editingId) {
      updateCheckpoint(editingId, formData);
    } else {
      addCheckpoint(formData);
    }
    
    setFormData(initialFormState);
    setEditingId(null);
  };

  const handleCancel = () => {
    setFormData(initialFormState);
    setEditingId(null);
  };

  const batteryStatus = getBatteryStatus(formData.batteryLevel);

  return (
    <div className="card p-6 animate-slide-up">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-forest-100 rounded-xl flex items-center justify-center">
            {editingId ? <Edit3 className="w-5 h-5 text-forest-600" /> : <Plus className="w-5 h-5 text-forest-600" />}
          </div>
          <div>
            <h2 className="text-xl font-display font-bold text-forest-800">
              {editingId ? '编辑检查点' : '新增检查点'}
            </h2>
            <p className="text-sm text-gray-500">
              {editingId ? '修改现有检查点信息' : '录入新的检查点详细信息'}
            </p>
          </div>
        </div>
        {editingId && (
          <button
            onClick={handleCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Map className="w-4 h-4 text-forest-600" />
              点位编号 <span className="text-alert-red">*</span>
            </label>
            <input
              type="text"
              value={formData.pointNumber}
              onChange={(e) => setFormData({ ...formData, pointNumber: e.target.value.toUpperCase() })}
              placeholder="如：CP01"
              className="input-field font-mono"
              maxLength={10}
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Clock className="w-4 h-4 text-forest-600" />
              预计到达时间
            </label>
            <input
              type="time"
              value={formData.estimatedArrival}
              onChange={(e) => setFormData({ ...formData, estimatedArrival: e.target.value })}
              className="input-field"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Zap className="w-4 h-4 text-forest-600" />
              地貌描述
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.terrainDescription}
                onChange={(e) => setFormData({ ...formData, terrainDescription: e.target.value })}
                placeholder="如：山地林区，坡度约15度"
                className="input-field"
                list="terrain-suggestions"
                autoComplete="off"
              />
              <datalist id="terrain-suggestions">
                {TERRAIN_TYPES.map(type => (
                  <option key={type} value={type} />
                ))}
              </datalist>
            </div>
          </div>

          <div className="relative">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Eye className="w-4 h-4 text-forest-600" />
              隐藏方式
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowHideMethods(!showHideMethods)}
                className="input-field text-left flex items-center justify-between"
              >
                <span className={formData.hideMethod ? 'text-gray-900' : 'text-gray-400'}>
                  {formData.hideMethod || '选择隐藏方式...'}
                </span>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showHideMethods ? 'rotate-180' : ''}`} />
              </button>
              {showHideMethods && (
                <div className="absolute z-20 w-full mt-1 bg-white rounded-xl shadow-xl border border-forest-100 py-2 max-h-60 overflow-y-auto animate-fade-in">
                  {HIDE_METHODS.map(method => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, hideMethod: method });
                        setShowHideMethods(false);
                      }}
                      className={`w-full text-left px-4 py-2 hover:bg-forest-50 transition-colors ${
                        formData.hideMethod === method ? 'bg-forest-50 text-forest-700 font-medium' : 'text-gray-700'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Battery className="w-4 h-4 text-forest-600" />
              打卡器电量: <span className={`font-mono font-bold ${batteryStatus.color}`}>{formData.batteryLevel}%</span>
              <span className={`text-xs badge ${formData.batteryLevel >= 80 ? 'bg-alert-green/10 text-alert-green' : formData.batteryLevel >= 50 ? 'bg-yellow-100 text-yellow-700' : formData.batteryLevel >= 20 ? 'bg-alert-orange/10 text-alert-orange' : 'bg-alert-red/10 text-alert-red'}`}>
                {batteryStatus.text}
              </span>
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={formData.batteryLevel}
              onChange={(e) => setFormData({ ...formData, batteryLevel: Number(e.target.value) })}
              className="w-full h-2 bg-forest-100 rounded-lg appearance-none cursor-pointer accent-forest-600"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              到下一检查点距离 (米)
            </label>
            <input
              type="number"
              min="0"
              step="50"
              value={formData.distanceToNext}
              onChange={(e) => setFormData({ ...formData, distanceToNext: Number(e.target.value) })}
              placeholder="0"
              className="input-field"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
              点位难度: <span className="font-bold">{DIFFICULTY_LABELS[formData.difficulty]}</span>
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map(level => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setFormData({ ...formData, difficulty: level })}
                  className={`flex-1 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                    formData.difficulty >= level
                      ? `${DIFFICULTY_COLORS[level]} text-white shadow-md`
                      : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-end">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className={`w-12 h-7 rounded-full transition-colors duration-300 relative ${
                formData.hasBackup ? 'bg-alert-green' : 'bg-gray-300'
              }`}>
                <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all duration-300 shadow-md ${
                  formData.hasBackup ? 'left-6' : 'left-1'
                }`} />
              </div>
              <div className="flex items-center gap-2">
                <Shield className={`w-5 h-5 ${formData.hasBackup ? 'text-alert-green' : 'text-gray-400'}`} />
                <span className={`text-sm font-medium ${formData.hasBackup ? 'text-gray-800' : 'text-gray-500'}`}>
                  {formData.hasBackup ? '已配置备用标识' : '无备用标识'}
                </span>
              </div>
              <input
                type="checkbox"
                checked={formData.hasBackup}
                onChange={(e) => setFormData({ ...formData, hasBackup: e.target.checked })}
                className="hidden"
              />
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            备注信息
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="记录该点位的特殊注意事项、安全提示等..."
            rows={2}
            className="input-field resize-none"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          {editingId && (
            <button
              type="button"
              onClick={handleCancel}
              className="btn-secondary"
            >
              取消编辑
            </button>
          )}
          <button
            type="submit"
            disabled={!formData.pointNumber.trim()}
            className="btn-primary flex items-center gap-2"
          >
            {editingId ? <Edit3 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {editingId ? '保存修改' : '添加检查点'}
          </button>
        </div>
      </form>
    </div>
  );
}
