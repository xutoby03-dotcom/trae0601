import { Target, ChevronRight } from 'lucide-react';
import type { Section, Tag, Member } from '@/types';
import { SECTION_TYPE_LABELS } from '@/types';
import { formatTimeShort } from '@/utils';

interface PracticeAreaProps {
  sections: Section[];
  tags: Tag[];
  members: Member[];
  onJumpToTime: (time: number) => void;
}

interface SectionSummary {
  section: Section;
  unresolvedTags: Tag[];
  earliestTime: number;
}

function findSectionForTag(tag: Tag, sections: Section[]): Section | null {
  for (const section of sections) {
    if (tag.time >= section.startTime && tag.time <= section.endTime) {
      return section;
    }
  }
  return null;
}

export function PracticeArea({ sections, tags, members, onJumpToTime }: PracticeAreaProps) {
  const unresolvedTags = tags.filter((t) => t.status !== 'resolved');
  const sortedSections = [...sections].sort((a, b) => a.startTime - b.startTime);

  const sectionSummaries: SectionSummary[] = sortedSections
    .map((section) => {
      const sectionTags = unresolvedTags.filter((t) => {
        const s = findSectionForTag(t, sortedSections);
        return s?.id === section.id;
      });
      if (sectionTags.length === 0) return null;
      const earliest = sectionTags.reduce((min, t) => (t.time < min ? t.time : min), Infinity);
      return {
        section,
        unresolvedTags: sectionTags,
        earliestTime: earliest,
      };
    })
    .filter((s): s is SectionSummary => s !== null)
    .sort((a, b) => a.earliestTime - b.earliestTime);

  const orphanTags = unresolvedTags.filter((t) => !findSectionForTag(t, sortedSections));

  if (unresolvedTags.length === 0) {
    return (
      <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
        <div className="flex items-center gap-2 mb-1">
          <Target size={16} className="text-green-400" />
          <span className="text-sm font-medium text-green-400">全部搞定</span>
        </div>
        <p className="text-xs text-green-400/70">本轮排练没有未解决的问题</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-slate-800/40 border border-red-500/20 overflow-hidden">
      <div className="px-4 py-3 bg-red-500/10 border-b border-red-500/15">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target size={15} className="text-red-400" />
            <span className="text-sm font-medium text-red-300">待练区域</span>
          </div>
          <span className="text-xs text-red-400/80 font-medium">
            {unresolvedTags.length} 项待解决
          </span>
        </div>
      </div>

      <div className="p-2 space-y-1 max-h-[280px] overflow-y-auto">
        {sectionSummaries.map(({ section, unresolvedTags: sectionTags, earliestTime }) => {
          const memberIds = [...new Set(sectionTags.map((t) => t.assignee).filter((a) => a !== 'all'))];
          const memberDots = memberIds
            .map((mid) => members.find((m) => m.id === mid))
            .filter(Boolean);

          return (
            <button
              key={section.id}
              onClick={() => onJumpToTime(earliestTime)}
              className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-700/50 transition-colors text-left group"
            >
              <div
                className="w-1.5 h-8 rounded-full flex-shrink-0"
                style={{ backgroundColor: section.color }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-200 font-medium truncate">
                    {section.name || SECTION_TYPE_LABELS[section.type]}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {formatTimeShort(earliestTime)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-xs text-red-400 font-medium">
                    {sectionTags.length} 个问题
                  </span>
                  {memberDots.length > 0 && (
                    <div className="flex items-center gap-0.5 ml-1">
                      {memberDots.map((m) => (
                        <span
                          key={m!.id}
                          className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-white"
                          style={{ backgroundColor: m!.color }}
                          title={m!.name}
                        >
                          {m!.name.charAt(0)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <ChevronRight
                size={14}
                className="text-slate-600 group-hover:text-slate-400 flex-shrink-0 transition-colors"
              />
            </button>
          );
        })}

        {orphanTags.length > 0 && (
          <button
            onClick={() => {
              const earliest = orphanTags.reduce(
                (min, t) => (t.time < min ? t.time : min),
                Infinity
              );
              onJumpToTime(earliest);
            }}
            className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-700/50 transition-colors text-left group"
          >
            <div className="w-1.5 h-8 rounded-full flex-shrink-0 bg-slate-500" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-300 font-medium">未分配段落</span>
              </div>
              <span className="text-xs text-red-400 font-medium">
                {orphanTags.length} 个问题
              </span>
            </div>
            <ChevronRight
              size={14}
              className="text-slate-600 group-hover:text-slate-400 flex-shrink-0 transition-colors"
            />
          </button>
        )}
      </div>
    </div>
  );
}
