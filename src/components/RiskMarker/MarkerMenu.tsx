import { useState } from 'react';
import { useWindStore } from '../../store/useWindStore';
import { RiskType, RISK_TYPE_LABELS } from '../../types';
import { Button } from '../ui/Button';
import { X, ArrowDown, Palette, Move, Trash2 } from 'lucide-react';

interface MarkerMenuProps {
  poleId: string;
  position: { x: number; y: number };
  onClose: () => void;
}

export const MarkerMenu = ({ poleId, position, onClose }: MarkerMenuProps) => {
  const { addRiskMark, removeRiskMark, getPoleRiskMark, poles } = useWindStore();
  const [note, setNote] = useState('');
  const [selectedType, setSelectedType] = useState<RiskType | null>(null);

  const existingMark = getPoleRiskMark(poleId);
  const pole = poles.find(p => p.id === poleId);

  const handleAddMark = (type: RiskType) => {
    setSelectedType(type);
  };

  const handleConfirm = () => {
    if (selectedType) {
      addRiskMark(poleId, selectedType, note);
      onClose();
    }
  };

  const handleRemove = () => {
    removeRiskMark(poleId);
    onClose();
  };

  const menuItems: { type: RiskType; icon: React.ReactNode; label: string; color: string }[] = [
    {
      type: 'reduce_height',
      icon: <ArrowDown size={16} />,
      label: RISK_TYPE_LABELS.reduce_height,
      color: 'text-amber-400 hover:bg-amber-500/20',
    },
    {
      type: 'change_material',
      icon: <Palette size={16} />,
      label: RISK_TYPE_LABELS.change_material,
      color: 'text-purple-400 hover:bg-purple-500/20',
    },
    {
      type: 'relocate',
      icon: <Move size={16} />,
      label: RISK_TYPE_LABELS.relocate,
      color: 'text-red-400 hover:bg-red-500/20',
    },
  ];

  return (
    <div
      className="fixed z-50 w-64 bg-slate-800/95 backdrop-blur-md border border-slate-600/50 rounded-xl shadow-2xl overflow-hidden"
      style={{
        left: position.x,
        top: position.y,
        transform: 'translate(-50%, -110%)',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-700/50">
        <div className="text-sm font-medium text-slate-200">
          {pole?.id.replace('pole-', '旗杆 #')}
        </div>
        <Button
          size="icon"
          variant="ghost"
          onClick={onClose}
          className="h-6 w-6"
        >
          <X size={14} />
        </Button>
      </div>

      <div className="p-3">
        {existingMark && (
          <div className="mb-3 p-2 rounded-lg bg-amber-500/10 border border-amber-500/30">
            <div className="text-xs text-amber-400 mb-1">已标记</div>
            <div className="text-sm text-slate-300">
              {RISK_TYPE_LABELS[existingMark.type]}
            </div>
            {existingMark.note && (
              <div className="text-xs text-slate-400 mt-1">
                备注: {existingMark.note}
              </div>
            )}
          </div>
        )}

        <div className="text-xs text-slate-400 mb-2">选择风险类型:</div>
        <div className="space-y-1 mb-3">
          {menuItems.map((item) => (
            <button
              key={item.type}
              onClick={() => handleAddMark(item.type)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm transition-colors ${
                selectedType === item.type
                  ? 'bg-cyan-500/20 text-cyan-400'
                  : item.color
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>

        <div className="mb-3">
          <label className="text-xs text-slate-400 mb-1 block">备注 (可选):</label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="添加备注..."
            className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700/50 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
          />
        </div>

        <div className="flex gap-2">
          {existingMark && (
            <Button
              variant="danger"
              size="sm"
              onClick={handleRemove}
              className="flex-1"
            >
              <Trash2 size={14} className="mr-1" />
              移除
            </Button>
          )}
          <Button
            variant="default"
            size="sm"
            onClick={handleConfirm}
            disabled={!selectedType}
            className="flex-1"
          >
            确认标记
          </Button>
        </div>
      </div>
    </div>
  );
};
