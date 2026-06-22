import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import Modal from './Modal';

interface LevelPickerProps {
  value: number;
  onChange: (v: number) => void;
  labels: string[];
  colors: string[];
}

export function LevelPicker({ value, onChange, labels, colors }: LevelPickerProps) {
  return (
    <div className="flex gap-2">
      {labels.map((label, i) => {
        const active = i <= value;
        return (
          <button
            key={i}
            type="button"
            onClick={() => onChange(i)}
            className={`flex-1 py-2 px-3 rounded-lg border-2 transition-all duration-200 text-sm font-medium ${
              active
                ? `${colors[i]} border-transparent text-white shadow-md`
                : 'border-oak-100 bg-white text-ink-400 hover:border-oak-200'
            }`}
          >
            <div className="text-lg font-bold">{i}</div>
            <div className="text-[10px] opacity-90 mt-0.5">{label}</div>
          </button>
        );
      })}
    </div>
  );
}

const jumpLabels = ['无', '偶发', '轻微', '明显', '频繁', '严重'];
const jumpColors = [
  'bg-forest-500',
  'bg-forest-400',
  'bg-lime-500',
  'bg-amber-500',
  'bg-orange-500',
  'bg-red-600',
];

const sibilanceLabels = ['无', '极微', '轻微', '明显', '突出', '刺耳'];
const sibilanceColors = [
  'bg-forest-500',
  'bg-forest-400',
  'bg-teal-500',
  'bg-sky-500',
  'bg-purple-500',
  'bg-red-600',
];

export const JumpLevelPicker = (p: Omit<LevelPickerProps, 'labels' | 'colors'>) => (
  <LevelPicker {...p} labels={jumpLabels} colors={jumpColors} />
);

export const SibilanceLevelPicker = (p: Omit<LevelPickerProps, 'labels' | 'colors'>) => (
  <LevelPicker {...p} labels={sibilanceLabels} colors={sibilanceColors} />
);

export function LevelBadge({ value, type }: { value: number; type: 'jump' | 'sibilance' }) {
  const labels = type === 'jump' ? jumpLabels : sibilanceLabels;
  const colors = type === 'jump' ? jumpColors : sibilanceColors;
  const badgeClass =
    value <= 1 ? 'badge-success' : value <= 3 ? 'badge-warning' : 'badge-danger';
  return (
    <span className={`badge ${badgeClass}`}>
      <span className={`w-2 h-2 rounded-full ${colors[value]}`} />
      {value}级 · {labels[value]}
    </span>
  );
}

interface ConfirmDeleteProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
}

export function ConfirmDelete({
  open,
  onClose,
  onConfirm,
  title = '确认删除',
  message = '此操作不可撤销，确定要删除吗？',
}: ConfirmDeleteProps) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <p className="text-ink-600 mb-6">{message}</p>
      <div className="flex justify-end gap-3">
        <button type="button" className="btn-secondary" onClick={onClose}>
          取消
        </button>
        <button
          type="button"
          className="btn-danger"
          onClick={() => {
            onConfirm();
            onClose();
          }}
        >
          确认删除
        </button>
      </div>
    </Modal>
  );
}

interface RowActionsProps {
  onEdit: () => void;
  onDelete: () => void;
}

export function RowActions({ onEdit, onDelete }: RowActionsProps) {
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={onEdit}
        className="p-2 rounded-lg text-oak-500 hover:bg-oak-100 hover:text-oak-700 transition-colors"
        title="编辑"
      >
        <Pencil className="w-4 h-4" />
      </button>
      <button
        onClick={onDelete}
        className="p-2 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
        title="删除"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-oak-100 flex items-center justify-center mb-4 text-oak-400">
        {icon}
      </div>
      <h4 className="font-serif text-lg font-semibold text-oak-700 mb-2">{title}</h4>
      {description && (
        <p className="text-sm text-ink-400 max-w-sm mb-4">{description}</p>
      )}
      {action}
    </div>
  );
}

export function useModalState() {
  const [open, setOpen] = useState(false);
  return { open, setOpen, openModal: () => setOpen(true), closeModal: () => setOpen(false) };
}
