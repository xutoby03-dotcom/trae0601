import { Clock, ExternalLink, ChevronDown, ChevronUp, Check, Trash2, Edit2 } from 'lucide-react';
import { useState } from 'react';
import type { Assignment } from '@/types';
import { useAssignmentStore, isUrgent, formatDeadline, getUrgencyScore } from '@/store/useAssignmentStore';

interface TaskCardProps {
  assignment: Assignment;
  onEdit?: (assignment: Assignment) => void;
}

export default function TaskCard({ assignment, onEdit }: TaskCardProps) {
  const [expanded, setExpanded] = useState(false);
  const { courses, toggleStep, deleteAssignment } = useAssignmentStore();
  const course = courses.find((c) => c.id === assignment.courseId);
  const urgent = isUrgent(assignment.deadline, assignment.progress);
  const deadlineStr = formatDeadline(assignment.deadline);
  const urgency = getUrgencyScore(assignment.deadline, assignment.progress);

  return (
    <div
      className={`glass rounded-xl overflow-hidden animate-fade-in transition-all duration-300 hover:scale-[1.01] ${
        urgent ? 'animate-blink border-radar-red/50' : ''
      }`}
    >
      <div className="flex items-stretch">
        <div
          className="w-1.5 shrink-0"
          style={{ backgroundColor: course?.color || '#00f5d4' }}
        />

        <div className="flex-1 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-sm font-bold text-slate-100 truncate">
                  {assignment.title}
                </h3>
                {urgent && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-radar-red/20 text-radar-red font-bold shrink-0">
                    紧急
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span
                  className="px-1.5 py-0.5 rounded text-[10px] font-medium"
                  style={{
                    backgroundColor: `${course?.color || '#00f5d4'}20`,
                    color: course?.color || '#00f5d4',
                  }}
                >
                  {course?.name || '未知课程'}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {deadlineStr}
                </span>
                {assignment.submitMethod && (
                  <span>{assignment.submitMethod}</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {onEdit && (
                <button
                  onClick={() => onEdit(assignment)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-radar-cyan hover:bg-radar-cyan/10 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={() => deleteAssignment(assignment.id)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-radar-red hover:bg-radar-red/10 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-3">
            <div className="flex-1 h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${assignment.progress}%`,
                  backgroundColor: urgent
                    ? '#ff4757'
                    : assignment.progress >= 80
                    ? '#00f5d4'
                    : '#fca311',
                }}
              />
            </div>
            <span className="text-xs text-slate-400 w-10 text-right">
              {assignment.progress}%
            </span>
          </div>

          {assignment.attachmentUrl && (
            <a
              href={assignment.attachmentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-[11px] text-radar-cyan/70 hover:text-radar-cyan transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              附件链接
            </a>
          )}

          {assignment.steps.length > 0 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-2 flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 transition-colors"
            >
              {expanded ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
              {assignment.steps.length}个步骤
              ({assignment.steps.filter((s) => s.completed).length}/
              {assignment.steps.length})
            </button>
          )}

          {expanded && assignment.steps.length > 0 && (
            <div className="mt-2 space-y-1.5 animate-fade-in">
              {assignment.steps.map((step) => (
                <div
                  key={step.id}
                  className="flex items-center gap-2 group"
                >
                  <button
                    onClick={() => toggleStep(assignment.id, step.id)}
                    className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all ${
                      step.completed
                        ? 'bg-radar-cyan border-radar-cyan'
                        : 'border-slate-600 hover:border-radar-cyan/50'
                    }`}
                  >
                    {step.completed && (
                      <Check className="w-2.5 h-2.5 text-radar-bg" />
                    )}
                  </button>
                  <span
                    className={`text-xs transition-all ${
                      step.completed
                        ? 'text-slate-500 line-through'
                        : 'text-slate-300'
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
