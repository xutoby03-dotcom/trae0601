import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Play, RotateCcw, Clock, Flag, ChevronLeft, Trophy } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import type { ErrorRecord, ErrorType, TrainingSession } from '@/types';
import CourseCanvas from '@/components/designer/CourseCanvas';
import FeedbackToast from '@/components/practice/FeedbackToast';
import { formatTime, generateId } from '@/utils/id';

export default function PracticePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { courses, currentStudent, addTrainingSession, students, setCurrentStudent } = useAppStore();

  const courseId = (location.state as { courseId?: string })?.courseId || courses[0]?.id;
  const course = courses.find((c) => c.id === courseId);
  const jumpElements = course?.elements.filter((e) => e.type === 'jump').sort((a, b) => a.order - b.order) || [];
  const totalJumps = jumpElements.length;

  const [phase, setPhase] = useState<'select' | 'memorize' | 'practice' | 'result'>('select');
  const [clickedOrders, setClickedOrders] = useState<number[]>([]);
  const [errors, setErrors] = useState<ErrorRecord[]>([]);
  const [startTime, setStartTime] = useState<number>(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [lastClickTime, setLastClickTime] = useState<number>(0);
  const timerRef = useRef<number | null>(null);

  const [feedback, setFeedback] = useState<{
    visible: boolean;
    type: 'correct' | 'error';
    errorType?: ErrorType;
    message: string;
  }>({ visible: false, type: 'correct', message: '' });

  const [memorizeCountdown, setMemorizeCountdown] = useState(30);
  const memorizeTimerRef = useRef<number | null>(null);

  const [selectedStudentId, setSelectedStudentId] = useState(currentStudent?.id || '');

  useEffect(() => {
    if (phase === 'practice' && startTime > 0) {
      timerRef.current = window.setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase, startTime]);

  useEffect(() => {
    if (phase === 'memorize') {
      memorizeTimerRef.current = window.setInterval(() => {
        setMemorizeCountdown((prev) => {
          if (prev <= 1) {
            if (memorizeTimerRef.current) clearInterval(memorizeTimerRef.current);
            startPractice();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (memorizeTimerRef.current) clearInterval(memorizeTimerRef.current);
    };
  }, [phase]);

  const showFeedback = (type: 'correct' | 'error', message: string, errorType?: ErrorType) => {
    setFeedback({ visible: true, type, message, errorType });
    setTimeout(() => setFeedback((prev) => ({ ...prev, visible: false })), 1200);
  };

  const startMemorize = () => {
    if (!selectedStudentId) {
      alert('请先选择学员');
      return;
    }
    const student = students.find((s) => s.id === selectedStudentId);
    if (student) setCurrentStudent(student);
    setMemorizeCountdown(30);
    setPhase('memorize');
  };

  const startPractice = () => {
    setPhase('practice');
    setClickedOrders([]);
    setErrors([]);
    setStartTime(Date.now());
    setLastClickTime(Date.now());
  };

  const handleElementClick = (order: number) => {
    if (phase !== 'practice') return;

    const now = Date.now();
    const timeSinceLastClick = (now - lastClickTime) / 1000;
    const nextExpectedOrder = clickedOrders.length + 1;

    if (timeSinceLastClick > 8) {
      const pauseError: ErrorRecord = {
        type: 'pause',
        elementOrder: nextExpectedOrder,
        description: `在第 ${nextExpectedOrder} 号障碍前停顿超过8秒`,
        timestamp: now,
      };
      setErrors((prev) => [...prev, pauseError]);
      showFeedback('error', '停顿时间过长', 'pause');
    }

    if (order === nextExpectedOrder) {
      setClickedOrders((prev) => [...prev, order]);
      showFeedback('correct', `正确！第 ${order} 号障碍`);

      if (order === totalJumps) {
        finishPractice();
      }
    } else if (clickedOrders.includes(order)) {
      const reverseError: ErrorRecord = {
        type: 'reverse',
        elementOrder: order,
        description: `重复点击第 ${order} 号障碍`,
        timestamp: now,
      };
      setErrors((prev) => [...prev, reverseError]);
      showFeedback('error', `已经跳过第 ${order} 号障碍了`, 'reverse');
    } else if (order > nextExpectedOrder) {
      const missError: ErrorRecord = {
        type: 'miss',
        elementOrder: nextExpectedOrder,
        description: `跳过了第 ${nextExpectedOrder} 号障碍，直接到第 ${order} 号`,
        timestamp: now,
      };
      setErrors((prev) => [...prev, missError]);
      showFeedback('error', `漏掉了第 ${nextExpectedOrder} 号障碍`, 'miss');
      setClickedOrders((prev) => [...prev, order]);
      if (order === totalJumps) {
        setTimeout(finishPractice, 1000);
      }
    } else {
      const detourError: ErrorRecord = {
        type: 'detour',
        elementOrder: order,
        description: `绕行到第 ${order} 号障碍`,
        timestamp: now,
      };
      setErrors((prev) => [...prev, detourError]);
      showFeedback('error', '顺序不对，请按路线行进', 'detour');
    }

    setLastClickTime(now);
  };

  const finishPractice = () => {
    if (timerRef.current) clearInterval(timerRef.current);

    const session: TrainingSession = {
      id: generateId(),
      studentId: selectedStudentId,
      studentName: students.find((s) => s.id === selectedStudentId)?.name || '',
      courseId: courseId,
      courseName: course?.name || '',
      startTime: new Date(startTime).toISOString(),
      endTime: new Date().toISOString(),
      errors: errors,
      totalTime: Math.floor((Date.now() - startTime) / 1000),
      userSequence: clickedOrders,
    };

    addTrainingSession(session);
    setPhase('result');
  };

  const resetPractice = () => {
    setPhase('select');
    setClickedOrders([]);
    setErrors([]);
    setElapsedTime(0);
  };

  const goToReport = () => {
    navigate('/report');
  };

  if (!course) {
    return (
      <div className="text-center py-12">
        <p className="text-equestrian-brown-500">没有找到路线</p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 text-equestrian-gold-600 hover:underline"
        >
          返回首页
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <FeedbackToast
        type={feedback.type}
        errorType={feedback.errorType}
        message={feedback.message}
        visible={feedback.visible}
      />

      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-equestrian-brown-600 hover:text-equestrian-brown-800"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>返回</span>
        </button>
        <div className="text-center">
          <h2 className="text-2xl font-serif font-bold text-equestrian-brown-800">{course.name}</h2>
          <p className="text-equestrian-brown-500 text-sm mt-1">
            共 {totalJumps} 个障碍
          </p>
        </div>
        <div className="w-20" />
      </div>

      {phase === 'select' && (
        <div className="max-w-md mx-auto space-y-6">
          <div className="bg-white rounded-xl shadow-elegant p-6">
            <h3 className="text-lg font-serif font-bold text-equestrian-brown-700 mb-4">选择学员</h3>
            <div className="space-y-2">
              {students.map((student) => (
                <button
                  key={student.id}
                  onClick={() => setSelectedStudentId(student.id)}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                    selectedStudentId === student.id
                      ? 'border-equestrian-gold-500 bg-equestrian-gold-50'
                      : 'border-equestrian-brown-100 hover:border-equestrian-brown-200'
                  }`}
                >
                  <span className="text-equestrian-brown-700 font-medium">{student.name}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={startMemorize}
            disabled={!selectedStudentId}
            className="w-full flex items-center justify-center gap-2 py-4 bg-equestrian-gold-500 text-equestrian-brown-800 rounded-xl font-bold text-lg hover:bg-equestrian-gold-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-elegant"
          >
            <Play className="w-5 h-5" />
            开始记忆练习
          </button>
        </div>
      )}

      {(phase === 'memorize' || phase === 'practice') && (
        <>
          <div className="flex items-center justify-between bg-white rounded-xl shadow-elegant px-6 py-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Flag className="w-5 h-5 text-equestrian-gold-600" />
                <span className="text-equestrian-brown-600">进度:</span>
                <span className="font-bold text-equestrian-brown-800">
                  {clickedOrders.length} / {totalJumps}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-equestrian-brown-500" />
              <span className="font-mono text-xl font-bold text-equestrian-brown-700">
                {phase === 'memorize' ? `记忆: ${memorizeCountdown}s` : formatTime(elapsedTime)}
              </span>
            </div>

            {phase === 'memorize' && (
              <button
                onClick={startPractice}
                className="px-4 py-2 bg-equestrian-brown-600 text-white rounded-lg hover:bg-equestrian-brown-700 transition-colors text-sm"
              >
                开始复述
              </button>
            )}
            {phase === 'practice' && (
              <button
                onClick={resetPractice}
                className="flex items-center gap-2 px-4 py-2 text-equestrian-brown-600 hover:bg-equestrian-brown-100 rounded-lg transition-colors text-sm"
              >
                <RotateCcw className="w-4 h-4" />
                重新开始
              </button>
            )}
          </div>

          <div className="progress-bar h-2 bg-equestrian-brown-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-equestrian-gold-400 to-equestrian-gold-600 transition-all duration-300"
              style={{ width: `${(clickedOrders.length / totalJumps) * 100}%` }}
            />
          </div>

          <CourseCanvas
            courseId={courseId}
            elements={course.elements}
            selectedId={null}
            onSelectElement={() => {}}
            onUpdateElement={() => {}}
            mode="practice"
            clickedOrders={clickedOrders}
            onElementClick={phase === 'practice' ? handleElementClick : undefined}
          />

          {phase === 'practice' && (
            <p className="text-center text-equestrian-brown-500 text-sm">
              按记忆顺序依次点击障碍，绿色虚线圆圈指示下一个目标
            </p>
          )}
          {phase === 'memorize' && (
            <p className="text-center text-equestrian-gold-600 font-medium">
              🧠 请仔细记忆路线顺序，记忆时间结束后开始复述
            </p>
          )}
        </>
      )}

      {phase === 'result' && (
        <div className="max-w-lg mx-auto">
          <div className="bg-white rounded-2xl shadow-elegant-lg p-8 text-center">
            <div className="w-20 h-20 bg-equestrian-gold-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-10 h-10 text-equestrian-gold-600" />
            </div>
            <h3 className="text-2xl font-serif font-bold text-equestrian-brown-800 mb-2">训练完成！</h3>
            <p className="text-equestrian-brown-500 mb-6">{course.name}</p>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-equestrian-sand-50 rounded-xl p-4">
                <div className="text-2xl font-bold text-equestrian-brown-800">{formatTime(elapsedTime)}</div>
                <div className="text-xs text-equestrian-brown-500 mt-1">用时</div>
              </div>
              <div className="bg-green-50 rounded-xl p-4">
                <div className="text-2xl font-bold text-green-600">
                  {totalJumps - errors.filter((e) => e.type === 'miss').length}/{totalJumps}
                </div>
                <div className="text-xs text-green-600 mt-1">正确障碍</div>
              </div>
              <div className="bg-red-50 rounded-xl p-4">
                <div className="text-2xl font-bold text-red-600">{errors.length}</div>
                <div className="text-xs text-red-600 mt-1">错误总数</div>
              </div>
            </div>

            {errors.length > 0 && (
              <div className="text-left bg-equestrian-sand-50 rounded-xl p-4 mb-6">
                <h4 className="font-medium text-equestrian-brown-700 mb-2">错误记录:</h4>
                <ul className="space-y-1 text-sm">
                  {errors.slice(0, 5).map((err, idx) => (
                    <li key={idx} className="text-equestrian-brown-600">
                      • {err.description}
                    </li>
                  ))}
                  {errors.length > 5 && (
                    <li className="text-equestrian-brown-400">...还有 {errors.length - 5} 条错误</li>
                  )}
                </ul>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={resetPractice}
                className="flex-1 py-3 border-2 border-equestrian-brown-200 text-equestrian-brown-600 rounded-xl font-medium hover:bg-equestrian-brown-50 transition-colors"
              >
                再练一次
              </button>
              <button
                onClick={goToReport}
                className="flex-1 py-3 bg-equestrian-gold-500 text-equestrian-brown-800 rounded-xl font-bold hover:bg-equestrian-gold-600 transition-colors"
              >
                查看报告
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
