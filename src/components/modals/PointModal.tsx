import { useState, useEffect } from 'react';
import { X, Camera } from 'lucide-react';
import type { RiskLevel, PatrolPoint } from '@/types/patrol';
import { getRiskLevelText } from '@/utils/helpers';

interface PointModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    riskLevel: RiskLevel;
    suggestedTime: string;
    photoUrl: string;
  }) => void;
  editPoint?: PatrolPoint | null;
}

export default function PointModal({ open, onClose, onSubmit, editPoint }: PointModalProps) {
  const [name, setName] = useState('');
  const [riskLevel, setRiskLevel] = useState<RiskLevel>('medium');
  const [suggestedTime, setSuggestedTime] = useState('22:00');
  const [photoUrl, setPhotoUrl] = useState('');

  useEffect(() => {
    if (editPoint) {
      setName(editPoint.name);
      setRiskLevel(editPoint.riskLevel);
      setSuggestedTime(editPoint.suggestedTime);
      setPhotoUrl(editPoint.photoUrl);
    } else {
      setName('');
      setRiskLevel('medium');
      setSuggestedTime('22:00');
      setPhotoUrl('');
    }
  }, [editPoint, open]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({ name, riskLevel, suggestedTime, photoUrl });
    onClose();
  };

  const riskLevels: RiskLevel[] = ['low', 'medium', 'high', 'critical'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md card animate-fade-in-up">
        <div className="flex items-center justify-between p-5 border-b border-slate-700/50">
          <h3 className="text-lg font-semibold text-white">
            {editPoint ? '编辑点位' : '新增点位'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="label-text">点位名称</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              placeholder="例如：1号楼东侧消防通道"
              required
            />
          </div>
          <div>
            <label className="label-text">风险等级</label>
            <div className="grid grid-cols-4 gap-2">
              {riskLevels.map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setRiskLevel(level)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 border ${
                    riskLevel === level
                      ? 'bg-primary-700 text-white border-primary-600 shadow-lg shadow-primary-700/30'
                      : 'bg-slate-900/60 text-slate-300 border-slate-600 hover:border-slate-500'
                  }`}
                >
                  {getRiskLevelText(level)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label-text">建议到达时间</label>
            <input
              type="time"
              value={suggestedTime}
              onChange={(e) => setSuggestedTime(e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="label-text">现场照片</label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-600 text-slate-300 hover:border-slate-500 transition-colors text-sm"
              >
                <Camera className="w-4 h-4" />
                拍照上传
              </button>
              <input
                type="text"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                className="input-field flex-1"
                placeholder="或填写图片URL（可选）"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-3">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              取消
            </button>
            <button type="submit" className="btn-primary flex-1">
              {editPoint ? '保存修改' : '确认添加'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
