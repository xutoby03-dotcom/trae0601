import { useState, useMemo } from 'react';
import { Trophy, TrendingUp, AlertTriangle, Clock, User, BarChart3, Target } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { analyzeConfusionPairs, getErrorTypeLabel, getErrorTypeColor } from '@/utils/analysis';
import { formatTime } from '@/utils/id';

export default function ReportPage() {
  const { trainingSessions, students, courses, userRole, currentStudent } = useAppStore();
  const [selectedStudentId, setSelectedStudentId] = useState<string>(currentStudent?.id || 'all');
  const [selectedCourseId, setSelectedCourseId] = useState<string>('all');

  const filteredSessions = useMemo(() => {
    return trainingSessions.filter((s) => {
      const studentMatch = selectedStudentId === 'all' || s.studentId === selectedStudentId;
      const courseMatch = selectedCourseId === 'all' || s.courseId === selectedCourseId;
      return studentMatch && courseMatch;
    });
  }, [trainingSessions, selectedStudentId, selectedCourseId]);

  const errorStats = useMemo(() => {
    const stats: Record<string, number> = {
      miss: 0,
      reverse: 0,
      detour: 0,
      pause: 0,
    };
    filteredSessions.forEach((session) => {
      session.errors.forEach((err) => {
        stats[err.type] = (stats[err.type] || 0) + 1;
      });
    });
    return stats;
  }, [filteredSessions]);

  const confusionPairs = useMemo(() => {
    const course = courses.find((c) => c.id === selectedCourseId);
    if (!course) return [];
    return analyzeConfusionPairs(filteredSessions, course.elements);
  }, [filteredSessions, selectedCourseId, courses]);

  const avgTime = useMemo(() => {
    if (filteredSessions.length === 0) return 0;
    const total = filteredSessions.reduce((sum, s) => sum + s.totalTime, 0);
    return Math.floor(total / filteredSessions.length);
  }, [filteredSessions]);

  const totalErrors = Object.values(errorStats).reduce((a, b) => a + b, 0);

  const studentStats = useMemo(() => {
    if (userRole !== 'coach') return [];
    return students.map((student) => {
      const studentSessions = trainingSessions.filter((s) => s.studentId === student.id);
      const totalErrors = studentSessions.reduce((sum, s) => sum + s.errors.length, 0);
      const avgTime = studentSessions.length > 0
        ? Math.floor(studentSessions.reduce((sum, s) => sum + s.totalTime, 0) / studentSessions.length)
        : 0;
      return {
        student,
        sessionCount: studentSessions.length,
        totalErrors,
        avgTime,
      };
    }).sort((a, b) => b.sessionCount - a.sessionCount);
  }, [students, trainingSessions, userRole]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-serif font-bold text-equestrian-brown-800">训练报告</h2>
        <p className="text-equestrian-brown-500 text-sm mt-1">查看训练记录和混淆障碍分析</p>
      </div>

      <div className="flex gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-equestrian-brown-500" />
          <select
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="px-3 py-2 border border-equestrian-brown-200 rounded-lg bg-white text-equestrian-brown-700 focus:outline-none focus:ring-2 focus:ring-equestrian-gold-400"
          >
            <option value="all">全部学员</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-equestrian-brown-500" />
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="px-3 py-2 border border-equestrian-brown-200 rounded-lg bg-white text-equestrian-brown-700 focus:outline-none focus:ring-2 focus:ring-equestrian-gold-400"
          >
            <option value="all">全部路线</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-elegant p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-equestrian-gold-100 rounded-xl flex items-center justify-center">
              <Trophy className="w-6 h-6 text-equestrian-gold-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-equestrian-brown-800">{filteredSessions.length}</p>
              <p className="text-sm text-equestrian-brown-500">训练次数</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-elegant p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-equestrian-brown-800">{formatTime(avgTime)}</p>
              <p className="text-sm text-equestrian-brown-500">平均用时</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-elegant p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-equestrian-brown-800">{totalErrors}</p>
              <p className="text-sm text-equestrian-brown-500">错误总数</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-elegant p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-equestrian-brown-800">
                {filteredSessions.length > 0
                  ? ((totalErrors / filteredSessions.length)).toFixed(1)
                  : 0}
              </p>
              <p className="text-sm text-equestrian-brown-500">场均错误</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-elegant p-6">
          <h3 className="text-lg font-serif font-bold text-equestrian-brown-700 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-equestrian-gold-600" />
            错误类型统计
          </h3>
          <div className="space-y-3">
            {Object.entries(errorStats).map(([type, count]) => (
              <div key={type}>
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-sm font-medium ${getErrorTypeColor(type)}`}>
                    {getErrorTypeLabel(type)}
                  </span>
                  <span className="text-sm text-equestrian-brown-500">{count} 次</span>
                </div>
                <div className="h-2 bg-equestrian-sand-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      type === 'miss' ? 'bg-red-500' :
                      type === 'reverse' ? 'bg-orange-500' :
                      type === 'detour' ? 'bg-yellow-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${totalErrors > 0 ? (count / totalErrors) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-elegant p-6">
          <h3 className="text-lg font-serif font-bold text-equestrian-brown-700 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            最易混淆障碍组合
          </h3>
          {confusionPairs.length > 0 && selectedCourseId !== 'all' ? (
            <div className="space-y-3">
              {confusionPairs.slice(0, 5).map((pair, idx) => (
                <div
                  key={`${pair.elementA}-${pair.elementB}`}
                  className="flex items-center justify-between p-3 bg-equestrian-sand-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 bg-equestrian-gold-400 text-equestrian-brown-800 rounded-full flex items-center justify-center text-xs font-bold">
                      {idx + 1}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 bg-equestrian-brown-600 text-white rounded-lg flex items-center justify-center font-bold text-sm">
                        {pair.elementA}
                      </span>
                      <span className="text-equestrian-brown-400">↔</span>
                      <span className="w-8 h-8 bg-equestrian-brown-600 text-white rounded-lg flex items-center justify-center font-bold text-sm">
                        {pair.elementB}
                      </span>
                    </div>
                  </div>
                  <span className="text-sm text-equestrian-brown-600 font-medium">
                    混淆 {pair.count} 次
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-equestrian-brown-400">
              {selectedCourseId === 'all'
                ? '请选择具体路线查看混淆分析'
                : '暂无足够数据进行混淆分析'}
            </div>
          )}
        </div>
      </div>

      {userRole === 'coach' && (
        <div className="bg-white rounded-xl shadow-elegant p-6">
          <h3 className="text-lg font-serif font-bold text-equestrian-brown-700 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-equestrian-gold-600" />
            学员训练排行
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-equestrian-brown-500 text-sm border-b border-equestrian-brown-100">
                  <th className="pb-3 font-medium">排名</th>
                  <th className="pb-3 font-medium">学员</th>
                  <th className="pb-3 font-medium">训练次数</th>
                  <th className="pb-3 font-medium">总错误数</th>
                  <th className="pb-3 font-medium">平均用时</th>
                  <th className="pb-3 font-medium">准确率</th>
                </tr>
              </thead>
              <tbody>
                {studentStats.map((stat, idx) => {
                  const course = courses.find((c) => c.id === selectedCourseId);
                  const jumpsCount = course?.elements.filter((e) => e.type === 'jump').length || 8;
                  const totalJumps = stat.sessionCount * jumpsCount;
                  const accuracy = totalJumps > 0
                    ? (((totalJumps - stat.totalErrors) / totalJumps) * 100).toFixed(1)
                    : 0;
                  return (
                    <tr key={stat.student.id} className="border-b border-equestrian-brown-50">
                      <td className="py-3">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          idx === 0 ? 'bg-yellow-200 text-yellow-800' :
                          idx === 1 ? 'bg-gray-200 text-gray-700' :
                          idx === 2 ? 'bg-orange-200 text-orange-800' :
                          'bg-equestrian-sand-100 text-equestrian-brown-600'
                        }`}>
                          {idx + 1}
                        </span>
                      </td>
                      <td className="py-3 font-medium text-equestrian-brown-700">{stat.student.name}</td>
                      <td className="py-3 text-equestrian-brown-600">{stat.sessionCount} 次</td>
                      <td className="py-3 text-red-600">{stat.totalErrors} 次</td>
                      <td className="py-3 text-equestrian-brown-600">{formatTime(stat.avgTime)}</td>
                      <td className="py-3">
                        <span className="text-green-600 font-medium">{accuracy}%</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-elegant p-6">
        <h3 className="text-lg font-serif font-bold text-equestrian-brown-700 mb-4">训练历史记录</h3>
        {filteredSessions.length > 0 ? (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {[...filteredSessions].reverse().map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between p-4 bg-equestrian-sand-50 rounded-lg hover:bg-equestrian-sand-100 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-equestrian-brown-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-equestrian-brown-600" />
                  </div>
                  <div>
                    <p className="font-medium text-equestrian-brown-700">{session.studentName}</p>
                    <p className="text-sm text-equestrian-brown-500">{session.courseName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm text-equestrian-brown-500">用时</p>
                    <p className="font-mono font-medium text-equestrian-brown-700">{formatTime(session.totalTime)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-equestrian-brown-500">错误</p>
                    <p className={`font-medium ${session.errors.length > 3 ? 'text-red-600' : 'text-green-600'}`}>
                      {session.errors.length} 次
                    </p>
                  </div>
                  <div className="text-right text-xs text-equestrian-brown-400">
                    {new Date(session.startTime).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-equestrian-brown-400">
            <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>暂无训练记录</p>
            <p className="text-sm mt-1">完成练习后记录将显示在这里</p>
          </div>
        )}
      </div>
    </div>
  );
}
