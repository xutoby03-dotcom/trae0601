import {
  ClipboardList,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Eye,
  Calendar,
  TrendingDown,
} from 'lucide-react';
import { usePracticeStore } from '@/store/practiceStore';
import type { ScoreDimension, ErrorType } from '@/types';
import { DIMENSION_LABELS, ERROR_TYPE_LABELS } from '@/types';
import { getScoreLevel, getLowestDimensions } from '@/utils';

export default function ReviewList() {
  const {
    practiceRecords,
    courses,
    signWords,
    students,
    currentCourseId,
    currentStudentId,
    toggleRecordReview,
    deleteRecord,
    loadRecord,
  } = usePracticeStore();

  const reviewRecords = practiceRecords.filter(
    (r) => r.needsReview && r.courseId === currentCourseId
  );

  const courseReviewRecords = practiceRecords.filter(
    (r) => r.courseId === currentCourseId
  );

  const stats = {
    total: courseReviewRecords.length,
    needReview: reviewRecords.length,
    avgScore:
      courseReviewRecords.length > 0
        ? (
            courseReviewRecords.reduce((sum, r) => sum + r.overallScore, 0) /
            courseReviewRecords.length
          ).toFixed(1)
        : '0',
  };

  const priorityLabel = (score: number) => {
    if (score < 55) return { text: '高优先级', color: 'text-accent-red', bg: 'bg-accent-red/10' };
    if (score < 65) return { text: '中优先级', color: 'text-accent-amber', bg: 'bg-accent-amber/10' };
    return { text: '低优先级', color: 'text-primary-500', bg: 'bg-primary-100' };
  };

  return (
    <div className="card p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="section-title mb-0">
          <ClipboardList className="w-5 h-5 text-primary-600" />
          下节课复练名单
        </h2>
        <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
          reviewRecords.length > 0 ? 'bg-accent-red/10 text-accent-red' : 'bg-accent-mint/10 text-accent-mint'
        }`}>
          <AlertTriangle className="w-3 h-3" />
          {reviewRecords.length} 个待复练
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-gray-50 rounded-xl p-3 text-center">
          <div className="text-xl font-bold text-primary-700 font-mono">{stats.total}</div>
          <div className="text-[10px] text-gray-500">本课程练习总数</div>
        </div>
        <div className="bg-accent-red/5 rounded-xl p-3 text-center">
          <div className="text-xl font-bold text-accent-red font-mono">{stats.needReview}</div>
          <div className="text-[10px] text-gray-500">需复练词条</div>
        </div>
        <div className="bg-primary-50 rounded-xl p-3 text-center">
          <div className="text-xl font-bold text-primary-600 font-mono">{stats.avgScore}</div>
          <div className="text-[10px] text-gray-500">平均分数</div>
        </div>
      </div>

      {reviewRecords.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 py-6">
          <CheckCircle2 className="w-12 h-12 mb-2 text-accent-mint/60" />
          <p className="text-sm">没有需要复练的词条</p>
          <p className="text-xs mt-1 text-center">
            同学们表现都很棒！<br />
            继续保持加油
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto scrollbar-thin space-y-2.5 pr-1">
          {reviewRecords
            .sort((a, b) => a.overallScore - b.overallScore)
            .map((record, idx) => {
              const word = signWords.find((w) => w.id === record.signWordId);
              const student = students.find((s) => s.id === record.studentId);
              const course = courses.find((c) => c.id === record.courseId);
              const level = getScoreLevel(record.overallScore);
              const lowestDims = getLowestDimensions(record.scores);
              const priority = priorityLabel(record.overallScore);

              const errorTypes = new Set(
                record.annotations
                  .map((a) => a.errorType)
                  .filter((t): t is ErrorType => !!t)
              );

              return (
                <div
                  key={record.id}
                  className="bg-white rounded-xl border border-gray-100 p-3 hover:border-primary-200 hover:shadow-card transition-all animate-slide-up"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-start gap-2.5">
                      <div className={`w-10 h-10 rounded-xl ${level.bgColor} flex items-center justify-center flex-shrink-0`}>
                        <span className={`text-lg font-bold ${level.color}`}>
                          {idx + 1}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-primary-800">
                            {word?.name || '未知词条'}
                          </span>
                          <span className={`tag ${priority.bg} ${priority.color} text-[10px]`}>
                            <TrendingDown className="w-2.5 h-2.5 mr-0.5" />
                            {priority.text}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                          <span>{student?.name}</span>
                          <span className="text-gray-300">·</span>
                          <span className="flex items-center gap-0.5">
                            <Calendar className="w-3 h-3" />
                            {record.practiceDate}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold font-mono ${level.color}`}>
                        {record.overallScore}
                      </div>
                      <div className={`text-[10px] ${level.color} font-medium`}>
                        {level.label}
                      </div>
                    </div>
                  </div>

                  {lowestDims.length > 0 && (
                    <div className="mb-2">
                      <div className="text-[10px] text-gray-400 mb-1">薄弱维度：</div>
                      <div className="flex flex-wrap gap-1">
                        {lowestDims.map((dim) => {
                          const score = record.scores[dim];
                          return (
                            <span
                              key={dim}
                              className="tag bg-rose-50 text-rose-600 text-[10px]"
                            >
                              {(DIMENSION_LABELS as Record<ScoreDimension, string>)[dim]}
                              <span className="ml-1 font-mono font-bold">{score}</span>
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {errorTypes.size > 0 && (
                    <div className="mb-2">
                      <div className="text-[10px] text-gray-400 mb-1">标注问题：</div>
                      <div className="flex flex-wrap gap-1">
                        {Array.from(errorTypes).map((type) => (
                          <span
                            key={type}
                            className="tag bg-amber-50 text-amber-700 text-[10px]"
                          >
                            {ERROR_TYPE_LABELS[type]}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {course && (
                    <div className="text-[10px] text-gray-400 mb-2">
                      所属课程：{course.name}
                    </div>
                  )}

                  <div className="flex items-center gap-1.5 pt-2 border-t border-gray-100">
                    <button
                      onClick={() => loadRecord(record.id)}
                      className="flex-1 flex items-center justify-center gap-1 text-xs py-1.5 rounded-lg bg-primary-50 text-primary-600 font-medium hover:bg-primary-100 transition-colors"
                    >
                      <Eye className="w-3 h-3" />
                      查看详情
                    </button>
                    <button
                      onClick={() => toggleRecordReview(record.id)}
                      className="flex-1 flex items-center justify-center gap-1 text-xs py-1.5 rounded-lg bg-accent-mint/10 text-accent-mint font-medium hover:bg-accent-mint/20 transition-colors"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      标记完成
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('确定删除此记录？')) {
                          deleteRecord(record.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-accent-red hover:bg-accent-red/10 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
