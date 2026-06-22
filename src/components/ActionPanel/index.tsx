import { useState } from 'react';
import { RefreshCw, Bug, Scroll, Palette, Tag, CheckCircle2, Trash2 } from 'lucide-react';
import { useSpecimenStore } from '@/store/useSpecimenStore';
import { needsPaperChange } from '@/utils/dryness';
import type { Specimen } from '@/types/specimen';

interface ActionPanelProps {
  specimen: Specimen;
}

export default function ActionPanel({ specimen }: ActionPanelProps) {
  const recordPaperChange = useSpecimenStore((s) => s.recordPaperChange);
  const toggleAlert = useSpecimenStore((s) => s.toggleAlert);
  const markCompleted = useSpecimenStore((s) => s.markCompleted);
  const deleteSpecimen = useSpecimenStore((s) => s.deleteSpecimen);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const needChange = needsPaperChange(specimen);

  const alertButtons = [
    { key: 'hasMold' as const, label: '发霉', icon: Bug, activeColor: 'bg-red-500' },
    { key: 'hasEdgeRoll' as const, label: '卷边', icon: Scroll, activeColor: 'bg-warning-orange' },
    { key: 'hasColorFade' as const, label: '褪色', icon: Palette, activeColor: 'bg-amber-500' },
    { key: 'hasMissingLabel' as const, label: '标签', icon: Tag, activeColor: 'bg-warning-orange' },
  ];

  const handleDelete = () => {
    if (showDeleteConfirm) {
      deleteSpecimen(specimen.id);
    } else {
      setShowDeleteConfirm(true);
      setTimeout(() => setShowDeleteConfirm(false), 3000);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {alertButtons.map((btn) => {
          const Icon = btn.icon;
          const isActive = specimen[btn.key];
          return (
            <button
              key={btn.key}
              onClick={() => toggleAlert(specimen.id, btn.key)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 border ${
                isActive
                  ? `${btn.activeColor} text-white border-transparent shadow-md`
                  : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {btn.label}
            </button>
          );
        })}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => recordPaperChange(specimen.id)}
          disabled={specimen.isCompleted}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
            specimen.isCompleted
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : needChange
              ? 'bg-forest-500 text-white hover:bg-forest-600 shadow-md animate-pulse-slow'
              : 'bg-forest-100 text-forest-700 hover:bg-forest-200'
          }`}
        >
          <RefreshCw className="w-4 h-4" />
          记录换纸
        </button>

        {!specimen.isCompleted && specimen.currentDryness >= 85 && (
          <button
            onClick={() => markCompleted(specimen.id)}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold bg-warning-gold text-white hover:bg-amber-600 transition-all duration-200 shadow-md"
          >
            <CheckCircle2 className="w-4 h-4" />
            完成干燥
          </button>
        )}

        <button
          onClick={handleDelete}
          className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
            showDeleteConfirm
              ? 'bg-warning-danger text-white'
              : 'bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-warning-danger border border-gray-200'
          }`}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
