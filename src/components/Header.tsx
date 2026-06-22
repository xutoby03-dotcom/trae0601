import { BookOpen, Save, Download, RefreshCcw } from 'lucide-react';
import { usePracticeStore } from '@/store/practiceStore';
import { downloadTextFile } from '@/utils';
import { DIMENSION_LABELS, ERROR_TYPE_LABELS } from '@/types';

export default function Header() {
  const {
    courses,
    students,
    currentCourseId,
    currentStudentId,
    currentSignWordId,
    signWords,
    practiceRecords,
    setCurrentCourse,
    setCurrentStudent,
    saveCurrentRecord,
    resetCurrentSession,
  } = usePracticeStore();

  const currentWord = signWords.find((w) => w.id === currentSignWordId);
  const currentRecords = practiceRecords.filter(
    (r) => r.courseId === currentCourseId && r.studentId === currentStudentId
  );

  const handleExportReviewList = () => {
    const reviewRecords = practiceRecords.filter(
      (r) => r.needsReview && r.courseId === currentCourseId
    );

    const courseName = courses.find((c) => c.id === currentCourseId)?.name || '未命名课程';
    const date = new Date().toISOString().split('T')[0];

    const lines = [
      `手语练习复练名单 - ${courseName}`,
      `生成日期：${date}`,
      '='.repeat(50),
      '',
    ];

    if (reviewRecords.length === 0) {
      lines.push('暂无需要复练的词条，同学们表现都很棒！');
    } else {
      reviewRecords.forEach((record, idx) => {
        const word = signWords.find((w) => w.id === record.signWordId);
        const student = students.find((s) => s.id === record.studentId);

        lines.push(`${idx + 1}. 【${word?.name || '未知词条'}】- ${student?.name || '未知学生'}`);
        lines.push(`   综合评分：${record.overallScore}分`);
        lines.push(`   主要问题：`);

        const dims = ['handShape', 'orientation', 'trajectory', 'expression'] as const;
        dims.forEach((dim) => {
          const score = record.scores[dim];
          if (score < 70) {
            const label = (DIMENSION_LABELS as Record<string, string>)[dim];
            const comment = record.scores.comments[dim];
            lines.push(`     - ${label}：${score}分 ${comment ? `(${comment})` : ''}`);
          }
        });

        const errorTypes = new Set(
          record.annotations
            .map((a) => a.errorType)
            .filter((t): t is keyof typeof ERROR_TYPE_LABELS => !!t)
        );
        if (errorTypes.size > 0) {
          lines.push(`   标注错误：${Array.from(errorTypes).map((t) => ERROR_TYPE_LABELS[t]).join('、')}`);
        }

        lines.push('');
      });
    }

    downloadTextFile(`复练名单_${courseName}_${date}.txt`, lines.join('\n'));
  };

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200/60">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-primary-400 flex items-center justify-center shadow-soft">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-primary-800 leading-tight">手语动作回放练习</h1>
                <p className="text-xs text-gray-500">Sign Language Practice Review System</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-gray-100/80 rounded-xl px-3 py-2">
              <span className="text-sm text-gray-500">课程：</span>
              <select
                value={currentCourseId}
                onChange={(e) => setCurrentCourse(e.target.value)}
                className="bg-transparent text-sm font-medium text-primary-700 focus:outline-none cursor-pointer"
              >
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 bg-gray-100/80 rounded-xl px-3 py-2">
              <span className="text-sm text-gray-500">学生：</span>
              <select
                value={currentStudentId}
                onChange={(e) => setCurrentStudent(e.target.value)}
                className="bg-transparent text-sm font-medium text-primary-700 focus:outline-none cursor-pointer"
              >
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name}
                  </option>
                ))}
              </select>
            </div>

            {currentWord && (
              <div className="hidden md:flex items-center gap-2 bg-primary-50 rounded-xl px-3 py-2 border border-primary-100">
                <span className="text-sm text-primary-500">当前词条：</span>
                <span className="text-sm font-bold text-primary-700">{currentWord.name}</span>
              </div>
            )}

            <div className="h-8 w-px bg-gray-200 mx-1" />

            <button
              onClick={resetCurrentSession}
              className="btn-ghost flex items-center gap-1.5 text-sm"
              title="重置当前会话"
            >
              <RefreshCcw className="w-4 h-4" />
              <span className="hidden sm:inline">重置</span>
            </button>

            <button
              onClick={saveCurrentRecord}
              disabled={!currentSignWordId}
              className="btn-secondary flex items-center gap-1.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              <span className="hidden sm:inline">保存评分</span>
            </button>

            <button
              onClick={handleExportReviewList}
              disabled={currentRecords.length === 0}
              className="btn-primary flex items-center gap-1.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">导出复练名单</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
