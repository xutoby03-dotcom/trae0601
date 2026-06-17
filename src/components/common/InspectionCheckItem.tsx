import { Check, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { InspectionItem, InspectionItemConfig } from '@/types';

interface InspectionCheckItemProps {
  config: InspectionItemConfig;
  item: InspectionItem;
  onChange: (checked: boolean, notes?: string) => void;
  disabled?: boolean;
  manualPage?: string;
}

export default function InspectionCheckItem({ config, item, onChange, disabled, manualPage }: InspectionCheckItemProps) {
  const [expanded, setExpanded] = useState(false);
  const [notes, setNotes] = useState(item.notes || '');

  const handleCheckedChange = (checked: boolean) => {
    onChange(checked, notes || undefined);
  };

  const handleNotesChange = (value: string) => {
    setNotes(value);
    onChange(item.checked, value || undefined);
  };

  return (
    <div className={`card p-4 transition-all duration-200 ${
      item.checked ? 'border-emerald-200 bg-emerald-50/30' : 'border-gray-100'
    } ${disabled ? 'opacity-60' : ''}`}>
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={() => !disabled && handleCheckedChange(!item.checked)}
          disabled={disabled}
          className={`w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-200 ${
            item.checked
              ? 'bg-emerald-500 border-emerald-500 text-white scale-110'
              : 'border-gray-300 hover:border-primary-400'
          }`}
        >
          {item.checked && <Check className="w-4 h-4" />}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className={`font-medium ${item.checked ? 'text-emerald-700' : 'text-gray-900'}`}>
                {config.label}
              </h4>
              <p className="text-sm text-gray-500 mt-0.5">{config.description}</p>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              {item.checked ? (
                <span className="badge-success flex items-center gap-1">
                  <Check className="w-3 h-3" /> 通过
                </span>
              ) : (
                <span className="badge-danger flex items-center gap-1">
                  <X className="w-3 h-3" /> 未检查
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-primary-600 mt-2 transition-colors"
          >
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {expanded ? '收起详情' : '查看操作指引'}
          </button>

          {expanded && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg animate-fade-in-up">
              <p className="text-sm text-gray-600">
                {config.instruction.replace('{page}', manualPage || '?')}
              </p>
            </div>
          )}

          {expanded && (
            <div className="mt-3">
              <label className="label text-xs">备注</label>
              <textarea
                value={notes}
                onChange={(e) => handleNotesChange(e.target.value)}
                disabled={disabled}
                placeholder="输入备注信息..."
                className="input text-sm resize-none"
                rows={2}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
