import { Layers, ChevronRight } from 'lucide-react';
import type { Section, Tag } from '@/types';
import { SECTION_TYPE_LABELS, SECTION_TYPE_COLORS } from '@/types';
import { formatTimeShort } from '@/utils';

interface SectionListProps {
  sections: Section[];
  tags: Tag[];
  onSectionClick: (startTime: number) => void;
}

export function SectionList({ sections, tags, onSectionClick }: SectionListProps) {
  const getSectionTagCount = (sectionId: string) => {
    return tags.filter((t) => t.sectionId === sectionId).length;
  };

  const getSectionUnresolvedCount = (sectionId: string) => {
    return tags.filter((t) => t.sectionId === sectionId && t.status !== 'resolved').length;
  };

  return (
    <div className="p-3 bg-slate-800/30 rounded-lg border border-slate-700/50">
      <div className="flex items-center gap-2 text-sm text-slate-400 mb-3">
        <Layers size={14} />
        <span>歌曲段落</span>
      </div>

      <div className="space-y-1">
        {sections.length === 0 ? (
          <p className="text-xs text-slate-500 py-2 text-center">暂无段落划分</p>
        ) : (
          sections.map((section) => {
            const tagCount = getSectionTagCount(section.id);
            const unresolvedCount = getSectionUnresolvedCount(section.id);

            return (
              <button
                key={section.id}
                onClick={() => onSectionClick(section.startTime)}
                className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-slate-700/40 transition-colors text-left group"
              >
                <div
                  className="w-1 h-8 rounded-full"
                  style={{ backgroundColor: section.color }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-200 font-medium">
                      {section.name || SECTION_TYPE_LABELS[section.type]}
                    </span>
                    <span className="text-xs text-slate-500">
                      {SECTION_TYPE_LABELS[section.type]}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 font-mono mt-0.5">
                    {formatTimeShort(section.startTime)} - {formatTimeShort(section.endTime)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {tagCount > 0 && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-slate-700/50 text-slate-400">
                      {tagCount}个标签
                    </span>
                  )}
                  {unresolvedCount > 0 && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 font-medium">
                      {unresolvedCount}待解决
                    </span>
                  )}
                  <ChevronRight
                    size={14}
                    className="text-slate-600 group-hover:text-slate-400 transition-colors"
                  />
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
