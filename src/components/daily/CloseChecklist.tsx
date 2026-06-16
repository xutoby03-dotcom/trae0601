import { useState } from 'react';
import ChecklistItem from './ChecklistItem';
import type { CloseChecklist as CloseChecklistType } from '@/types';
import { Droplets, Layers, Lock, Umbrella, Home } from 'lucide-react';

interface CloseChecklistProps {
  value: CloseChecklistType;
  onChange: (checklist: CloseChecklistType) => void;
  disabled?: boolean;
}

const checklistItems = [
  {
    key: 'wiped' as const,
    label: '擦拭干净',
    description: '确保桌椅表面无污渍、水渍',
    icon: <Droplets className="h-4 w-4" />,
  },
  {
    key: 'folded' as const,
    label: '折叠整齐',
    description: '可折叠桌椅需折叠好，摆放整齐',
    icon: <Layers className="h-4 w-4" />,
  },
  {
    key: 'locked' as const,
    label: '锁链固定',
    description: '桌椅用锁链串联并上锁固定',
    icon: <Lock className="h-4 w-4" />,
  },
  {
    key: 'covered' as const,
    label: '遮盖防水',
    description: '遮盖遮雨布，做好防水措施',
    icon: <Umbrella className="h-4 w-4" />,
  },
  {
    key: 'returned' as const,
    label: '归位存放',
    description: '桌椅放回指定收纳点',
    icon: <Home className="h-4 w-4" />,
  },
];

export default function CloseChecklist({
  value,
  onChange,
  disabled = false,
}: CloseChecklistProps) {
  const [animatingKey, setAnimatingKey] = useState<string | null>(null);

  const handleChange = (key: keyof CloseChecklistType, checked: boolean) => {
    if (checked) {
      setAnimatingKey(key);
      setTimeout(() => setAnimatingKey(null), 300);
    }
    onChange({ ...value, [key]: checked });
  };

  const completedCount = Object.values(value).filter(Boolean).length;
  const progress = (completedCount / checklistItems.length) * 100;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium text-gray-900">收摊检查清单</h4>
          <p className="mt-1 text-sm text-gray-500">
            请逐项检查并确认完成
          </p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold text-primary-500">
            {completedCount}
          </span>
          <span className="text-gray-500">/{checklistItems.length}</span>
        </div>
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary-400 to-primary-500 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="space-y-3">
        {checklistItems.map((item, index) => (
          <div
            key={item.key}
            className="animate-slide-up"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <ChecklistItem
              label={item.label}
              description={item.description}
              icon={item.icon}
              checked={value[item.key]}
              onChange={(checked) => handleChange(item.key, checked)}
              disabled={disabled}
            />
          </div>
        ))}
      </div>

      {completedCount === checklistItems.length && (
        <div className="rounded-xl border border-success/30 bg-success/5 p-4 text-center">
          <p className="text-sm font-medium text-success">
            所有检查项已完成，可以提交收摊
          </p>
        </div>
      )}
    </div>
  );
}
