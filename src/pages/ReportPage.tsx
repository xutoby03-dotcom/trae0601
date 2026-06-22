import { useState, useMemo } from 'react';
import { Trophy, TrendingUp, AlertTriangle, Clock, User, BarChart3, Target, ChevronDown, ChevronUp, X, Pause, SkipForward, ArrowRight } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { analyzeConfusionPairs, getErrorTypeLabel, getErrorTypeColor } from '@/utils/analysis';
import { formatTime } from '@/utils/id';

export default function ReportPage() {
  const { trainingSessions, students, courses, userRole, currentStudent } = useAppStore();
  const [selectedStudentId, setSelectedStudentId] = useState<string>(currentStudent?.id || 'all');
  const [selectedCourseId, setSelectedCourseId] = useState<string>('all');
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);

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

  const errorBreakdown = useMemo(() => {
    const errorTypes: Array<{ type: 'miss' | 'reverse' | 'detour' | 'pause'; label: string }> = [
      { type: 'miss', label: '漏跳' },
      { type: 'reverse', label: '反向' },
      { type: 'detour', label: '绕行' },
      { type: 'pause', label: '停顿' },
    ];

    return errorTypes.map(({ type, label }) => {
      let totalCount = 0;
      filteredSessions.forEach((session) => {
        session.errors.forEach((err) => {
          if (err.type === type) totalCount++;
        });
      });
      return { type, label, totalCount };
    });
  }, [filteredSessions]);

  const topErrorElement = useMemo(() => {
    const countMap = new Map<number, number>();
    let totalErrors = 0;

    filteredSessions.forEach((session) => {
      session.errors.forEach((err) => {
        totalErrors++;
        countMap.set(err.elementOrder, (countMap.get(err.elementOrder) || 0) + 1);
      });
    });

    let topElement: number | null = null;
    let topCount = 0;
    countMap.forEach((count, order) => {
      if (count > topCount) {
        topCount = count;
        topElement = order;
      }
    });

    return { topElement, topCount, totalErrors };
  }, [filteredSessions]);

  const errorStyleMap: Record<string, { bg: string; iconBg: string; text: string; icon: React.ReactNode }> = {
    miss: {
      bg: 'bg-red-50 border-red-200',
      iconBg: 'bg-red-100 text-red-600',
      text: 'text-red-700',
      icon: <SkipForward className="w-5 h-5" />,
    },
    reverse: {
      bg: 'bg-orange-50 border-orange-200',
      iconBg: 'bg-orange-100 text-orange-600',
      text: 'text-orange-700',
      icon: <X className="w-5 h-5" />,
    },
    detour: {
      bg: 'bg-yellow-50 border-yellow-200',
      iconBg: 'bg-yellow-100 text-yellow-600',
      text: 'text-yellow-700',
      icon: <ArrowRight className="w-5 h-5" />,
    },
    pause: {
      bg: 'bg-blue-50 border-blue-200',
      iconBg: 'bg-blue-100 text-blue-600',
      text: 'text-blue-700',
      icon: <Pause className="w-5 h-5" />,
    },
  };

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
        <div className="flex items-start gap-6">
          <div className="flex-1">
            <h3 className="text-lg font-serif font-bold text-equestrian-brown-700 mb-4">四类错误汇总</h3>
            <div className="grid grid-cols-4 gap-3">
              {errorBreakdown.map((item) => {
                const style = errorStyleMap[item.type];
                return (
                  <div
                    key={item.type}
                    className={`rounded-xl p-4 border-2 ${style.bg} text-center`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-2 ${style.iconBg}`}>
                      {style.icon}
                    </div>
                    <p className={`font-bold text-sm ${style.text} mb-1`}>{item.label}</p>
                    <p className={`text-3xl font-bold ${style.text}`}>{item.totalCount}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="w-56 flex-shrink-0">
            <h3 className="text-lg font-serif font-bold text-equestrian-brown-700 mb-4">最高频出错障碍</h3>
            {topErrorElement.topElement ? (
              <div className="bg-gradient-to-br from-equestrian-gold-100 to-equestrian-gold-200 border-2 border-equestrian-gold-400 rounded-xl p-5 text-center relative overflow-hidden">
                <div className="absolute top-2 right-2">
                  <Trophy className="w-5 h-5 text-equestrian-gold-600" />
                </div>
                <div className="w-16 h-16 bg-equestrian-gold-400 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <span className="text-3xl font-bold text-equestrian-brown-800">
                    {topErrorElement.topElement}
                  </span>
                </div>
                <p className="text-sm text-equestrian-brown-600 mb-1">第 {topErrorElement.topElement} 号障碍</p>
                <p className="text-2xl font-bold text-equestrian-brown-800">
                  {topErrorElement.topCount} 次
                </p>
                <p className="text-xs text-equestrian-brown-500 mt-2">
                  占总错误 {topErrorElement.totalErrors > 0
                    ? ((topErrorElement.topCount / topErrorElement.totalErrors) * 100).toFixed(1)
                    : 0}%
                </p>
              </div>
            ) : (
              <div className="bg-equestrian-sand-50 border-2 border-equestrian-brown-100 rounded-xl p-5 text-center h-full flex items-center justify-center">
                <p className="text-equestrian-brown-400 text-sm">暂无错误记录</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-elegant p-6">
        <h3 className="text-lg font-serif font-bold text-equestrian-brown-700 mb-4">训练历史记录</h3>
        {filteredSessions.length > 0 ? (
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {[...filteredSessions].reverse().map((session) => {
              const isExpanded = expandedSessionId === session.id;
              const toggleExpand = () => {
                setExpandedSessionId(isExpanded ? null : session.id);
              };

              const errorIconMap: Record<string, React.ReactNode> = {
                miss: <SkipForward className="w-4 h-4" />,
                reverse: <X className="w-4 h-4" />,
                detour: <ArrowRight className="w-4 h-4" />,
                pause: <Pause className="w-4 h-4" />,
              };

              const errorBgMap: Record<string, string> = {
                miss: 'bg-red-50 border-red-200 text-red-700',
                reverse: 'bg-orange-50 border-orange-200 text-orange-700',
                detour: 'bg-yellow-50 border-yellow-200 text-yellow-700',
                pause: 'bg-blue-50 border-blue-200 text-blue-700',
              };

              return (
                <div
                  key={session.id}
                  className={`rounded-lg transition-all border-2 ${
                    isExpanded ? 'border-equestrian-gold-300 bg-white' : 'border-transparent bg-equestrian-sand-50 hover:bg-equestrian-sand-100'
                  }`}
                >
                  <div
                    onClick={toggleExpand}
                    className="flex items-center justify-between p-4 cursor-pointer"
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
                      <div className="text-right text-xs text-equestrian-brown-400 min-w-[80px]">
                        {new Date(session.startTime).toLocaleDateString()}
                      </div>
                      <button className={`p-1.5 rounded-lg transition-colors ${
                        isExpanded ? 'bg-equestrian-gold-100 text-equestrian-gold-700' : 'text-equestrian-brown-400 hover:bg-equestrian-brown-100'
                      }`}>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-4 pb-4 pt-2 border-t border-equestrian-brown-100 mx-4">
                      <div className="flex items-center justify-between mb-3 mt-2">
                        <h4 className="text-sm font-medium text-equestrian-brown-600">错误明细</h4>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedSessionId(null);
                          }}
                          className="text-xs text-equestrian-brown-400 hover:text-equestrian-brown-600 flex items-center gap-1"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                          收起
                        </button>
                      </div>
                      {session.errors.length > 0 ? (
                        <div className="space-y-2">
                          {session.errors.map((error, idx) => (
                            <div
                              key={idx}
                              className={`flex items-start gap-3 p-3 rounded-lg border ${errorBgMap[error.type]}`}
                            >
                              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/60 flex items-center justify-center">
                                {errorIconMap[error.type]}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <span className="font-medium text-sm">{getErrorTypeLabel(error.type)}</span>
                                  <span className="text-xs opacity-70">· 第 {error.elementOrder} 号障碍</span>
                                </div>
                                <p className="text-xs opacity-80">{error.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6 text-equestrian-brown-400 text-sm">
                          🎉 本次训练零错误，表现优秀！
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
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
