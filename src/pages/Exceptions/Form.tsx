import React, { useState } from 'react';
import { X, Camera } from 'lucide-react';
import { Modal } from '../../components/Modal';
import type { ExceptionType, ExceptionSeverity } from '../../types';
import { useExceptionsStore } from '../../store/exceptions';
import { useRecoveryPointsStore } from '../../store/recoveryPoints';
import { getExceptionTypeText, getSeverityText } from '../../utils/formatters';

interface ExceptionFormProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedType?: ExceptionType;
  preselectedRecoveryPointId?: string;
}

const typeConfigs = [
  { value: 'full' as ExceptionType, label: '满箱', description: '回收箱已满，需要清运' },
  { value: 'moisture' as ExceptionType, label: '潮湿', description: '衣物潮湿，可能发霉' },
  { value: 'odor' as ExceptionType, label: '异味', description: '有异味，需要处理' },
  { value: 'damage' as ExceptionType, label: '损坏', description: '回收箱损坏' },
];

const severityConfigs = [
  { value: 'low' as ExceptionSeverity, label: '低' },
  { value: 'medium' as ExceptionSeverity, label: '中' },
  { value: 'high' as ExceptionSeverity, label: '高' },
  { value: 'critical' as ExceptionSeverity, label: '紧急' },
];

export const ExceptionForm: React.FC<ExceptionFormProps> = ({
  isOpen,
  onClose,
  preselectedType,
  preselectedRecoveryPointId,
}) => {
  const { addException } = useExceptionsStore();
  const { recoveryPoints } = useRecoveryPointsStore();

  const [recoveryPointId, setRecoveryPointId] = useState(preselectedRecoveryPointId || '');
  const [type, setType] = useState<ExceptionType>(preselectedType || 'full');
  const [severity, setSeverity] = useState<ExceptionSeverity>('medium');
  const [description, setDescription] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');

  const resetForm = () => {
    setRecoveryPointId('');
    setType('full');
    setSeverity('medium');
    setDescription('');
    setPhotoUrl('');
  };

  const handleSubmit = () => {
    if (!recoveryPointId) {
      alert('请选择回收点');
      return;
    }
    if (!description.trim()) {
      alert('请输入异常描述');
      return;
    }

    addException({
      recoveryPointId,
      type,
      severity,
      description: description.trim(),
      photoUrl: photoUrl || undefined,
    });

    resetForm();
    onClose();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">上报异常</h3>
        <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">回收点</label>
          <select
            value={recoveryPointId}
            onChange={(e) => setRecoveryPointId(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">请选择回收点</option>
            {recoveryPoints.map(point => (
              <option key={point.id} value={point.id}>{point.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">异常类型</label>
          <div className="grid grid-cols-2 gap-3">
            {typeConfigs.map(config => (
              <button
                key={config.value}
                onClick={() => setType(config.value)}
                className={`p-3 rounded-xl border-2 text-left transition-all ${
                  type === config.value
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="font-medium text-gray-900">{config.label}</div>
                <div className="text-xs text-gray-500 mt-1">{config.description}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">严重程度</label>
          <div className="flex gap-2">
            {severityConfigs.map(config => (
              <button
                key={config.value}
                onClick={() => setSeverity(config.value)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  severity === config.value
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {config.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">异常描述</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="请详细描述异常情况..."
            rows={3}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">照片链接（可选）</label>
          <div className="relative">
            <Camera className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              placeholder="输入照片URL"
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={handleClose}
            className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-medium hover:from-orange-600 hover:to-red-600 transition-all shadow-lg shadow-orange-200"
          >
            提交异常
          </button>
        </div>
      </div>
    </Modal>
  );
};
