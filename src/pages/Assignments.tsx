import { useState } from 'react';
import { Plus, ClipboardList, Filter } from 'lucide-react';
import { useAssignmentStore, getUrgencyScore } from '@/store/useAssignmentStore';
import AssignmentForm from '@/components/AssignmentForm';
import TaskCard from '@/components/TaskCard';
import type { Assignment } from '@/types';

type FilterKey = 'all' | 'active' | 'completed' | 'overdue';

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'active', label: '进行中' },
  { key: 'completed', label: '已完成' },
  { key: 'overdue', label: '已过期' },
];

export default function Assignments() {
  const { assignments, courses } = useAssignmentStore();
  const [showForm, setShowForm] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | undefined>();
  const [filter, setFilter] = useState<FilterKey>('all');
  const [courseFilter, setCourseFilter] = useState<string>('all');

  const filteredAssignments = assignments
    .filter((a) => {
      if (filter === 'active') return a.status === 'in_progress' || a.status === 'pending';
      if (filter === 'completed') return a.status === 'completed';
      if (filter === 'overdue') return a.status === 'overdue';
      return true;
    })
    .filter((a) => courseFilter === 'all' || a.courseId === courseFilter)
    .sort((a, b) => {
      if (a.status === 'completed' && b.status !== 'completed') return 1;
      if (a.status !== 'completed' && b.status === 'completed') return -1;
      return getUrgencyScore(b.deadline, b.progress) - getUrgencyScore(a.deadline, a.progress);
    });

  return (
    <div className="p-4 md:p-8 pb-20 md:pb-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-orbitron text-xl text-slate-100 tracking-wider">ASSIGNMENTS</h1>
          <p className="text-xs text-slate-500 mt-1">{assignments.length} 项作业</p>
        </div>
        <button
          onClick={() => {
            setEditingAssignment(undefined);
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-radar-cyan/20 text-radar-cyan hover:bg-radar-cyan/30 transition-colors glow-cyan"
        >
          <Plus className="w-4 h-4" />
          添加作业
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <Filter className="w-4 h-4 text-slate-500 mt-1" />
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
              filter === f.key
                ? 'bg-radar-cyan/20 text-radar-cyan'
                : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
            }`}
          >
            {f.label}
          </button>
        ))}
        {courses.length > 1 && (
          <>
            <span className="text-slate-700 mx-1">|</span>
            <button
              onClick={() => setCourseFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                courseFilter === 'all'
                  ? 'bg-radar-amber/20 text-radar-amber'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
              }`}
            >
              全部课程
            </button>
            {courses.map((c) => (
              <button
                key={c.id}
                onClick={() => setCourseFilter(c.id)}
                className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                  courseFilter === c.id
                    ? 'text-white'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                }`}
                style={
                  courseFilter === c.id
                    ? { backgroundColor: c.color + '30', color: c.color }
                    : {}
                }
              >
                {c.name}
              </button>
            ))}
          </>
        )}
      </div>

      {filteredAssignments.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <ClipboardList className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 mb-2">
            {assignments.length === 0 ? '还没有添加作业' : '没有匹配的作业'}
          </p>
          <p className="text-xs text-slate-500">
            {courses.length === 0
              ? '请先添加课程'
              : '点击上方按钮添加作业'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAssignments.map((a) => (
            <TaskCard key={a.id} assignment={a} />
          ))}
        </div>
      )}

      {showForm && (
        <AssignmentForm
          assignment={editingAssignment}
          onClose={() => {
            setShowForm(false);
            setEditingAssignment(undefined);
          }}
        />
      )}
    </div>
  );
}
