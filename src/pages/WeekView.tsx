import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAssignmentStore } from '@/store/useAssignmentStore';

const DAY_NAMES = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

function getWeekDates(referenceDate: Date): Date[] {
  const d = new Date(referenceDate);
  const day = d.getDay();
  const diff = day === 0 ? 6 : day - 1;
  const monday = new Date(d);
  monday.setDate(d.getDate() - diff);
  monday.setHours(0, 0, 0, 0);

  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    return date;
  });
}

function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

export default function WeekView() {
  const { assignments, courses } = useAssignmentStore();
  const [weekOffset, setWeekOffset] = useState(0);

  const today = new Date();
  const referenceDate = new Date(today);
  referenceDate.setDate(referenceDate.getDate() + weekOffset * 7);

  const weekDates = useMemo(() => getWeekDates(referenceDate), [referenceDate]);

  const assignmentsByDay = useMemo(() => {
    const map: Map<string, typeof assignments> = new Map();
    weekDates.forEach((d) => {
      map.set(d.toISOString(), []);
    });

    assignments.forEach((a) => {
      const dl = new Date(a.deadline);
      for (const [key, _] of map) {
        const d = new Date(key);
        if (isSameDay(d, dl)) {
          map.get(key)!.push(a);
          break;
        }
      }
    });

    return map;
  }, [assignments, weekDates]);

  const weekLabel = useMemo(() => {
    const start = weekDates[0];
    const end = weekDates[6];
    const fmt = (d: Date) =>
      `${d.getMonth() + 1}月${d.getDate()}日`;
    return `${fmt(start)} - ${fmt(end)}`;
  }, [weekDates]);

  const getCourseColor = (courseId: string) => {
    const course = courses.find((c) => c.id === courseId);
    return course?.color || '#00f5d4';
  };

  const getCourseName = (courseId: string) => {
    const course = courses.find((c) => c.id === courseId);
    return course?.name || '未知';
  };

  return (
    <div className="p-4 md:p-8 pb-20 md:pb-8 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-orbitron text-xl text-slate-100 tracking-wider">WEEK VIEW</h1>
          <p className="text-xs text-slate-500 mt-1">{weekLabel}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWeekOffset(weekOffset - 1)}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setWeekOffset(0)}
            className="px-3 py-1.5 rounded-lg text-xs text-radar-cyan hover:bg-radar-cyan/10 transition-colors"
          >
            本周
          </button>
          <button
            onClick={() => setWeekOffset(weekOffset + 1)}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-7 gap-2 md:gap-3">
        {weekDates.map((date, i) => {
          const key = date.toISOString();
          const dayAssignments = assignmentsByDay.get(key) || [];
          const isToday = isSameDay(date, today);
          const isWeekend = i >= 5;

          return (
            <div
              key={key}
              className={`flex flex-col rounded-xl overflow-hidden ${
                isToday ? 'ring-1 ring-radar-cyan/30' : ''
              } ${isWeekend ? 'bg-radar-surface/50' : 'bg-radar-surface/30'}`}
            >
              <div
                className={`text-center py-2 border-b border-radar-border/50 ${
                  isToday ? 'bg-radar-cyan/10' : ''
                }`}
              >
                <div
                  className={`text-[11px] ${
                    isToday ? 'text-radar-cyan font-bold' : 'text-slate-500'
                  }`}
                >
                  {DAY_NAMES[i]}
                </div>
                <div
                  className={`text-sm font-bold mt-0.5 ${
                    isToday ? 'text-radar-cyan' : 'text-slate-300'
                  }`}
                >
                  {date.getDate()}
                </div>
              </div>

              <div className="flex-1 p-1.5 space-y-1.5 overflow-y-auto">
                {dayAssignments.map((a) => (
                  <div
                    key={a.id}
                    className={`rounded-lg p-2 text-[11px] ${
                      a.status === 'completed'
                        ? 'bg-slate-700/30 line-through text-slate-500'
                        : a.status === 'overdue'
                        ? 'bg-radar-red/10 border border-radar-red/30 text-radar-red'
                        : 'bg-slate-700/50'
                    }`}
                    style={
                      a.status !== 'completed' && a.status !== 'overdue'
                        ? { borderLeft: `2px solid ${getCourseColor(a.courseId)}` }
                        : {}
                    }
                  >
                    <div className={`font-medium truncate ${a.status === 'completed' ? '' : 'text-slate-200'}`}>
                      {a.title}
                    </div>
                    <div className={`mt-0.5 ${a.status === 'completed' ? '' : 'text-slate-400'}`}>
                      {getCourseName(a.courseId)}
                    </div>
                    {a.status !== 'completed' && (
                      <div className="mt-1 h-1 bg-slate-600/50 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${a.progress}%`,
                            backgroundColor: getCourseColor(a.courseId),
                          }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {dayAssignments.length > 0 && (
                <div className="text-center py-1 border-t border-radar-border/30">
                  <span className="text-[10px] text-slate-500">
                    {dayAssignments.length} 项
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
