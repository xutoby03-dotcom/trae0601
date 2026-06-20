import { useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Clock,
  Star,
  ChevronRight,
  AlertTriangle,
  X,
} from 'lucide-react';
import Header from '@/components/layout/Header';
import CountdownDisplay from '@/components/guide/CountdownDisplay';
import RouteTimeline from '@/components/guide/RouteTimeline';
import { useGuideStore } from '@/store/useGuideStore';
import { useTimer } from '@/hooks/useTimer';
import { formatDuration, formatDurationChinese } from '@/utils/time';
import { cn } from '@/lib/utils';

export default function GuideMode() {
  const { id: routeId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const hasAlertedRef = useRef(false);

  const {
    activeSession,
    getRouteById,
    startSession,
    pauseSession,
    resumeSession,
    addTimeToCurrent,
    nextPoint,
    prevPoint,
    endSession,
  } = useGuideStore();

  const { seconds, isRunning, start, pause, reset, setSeconds } = useTimer(0);

  const currentRoute = useMemo(() => {
    if (activeSession) {
      return getRouteById(activeSession.routeId);
    }
    return routeId ? getRouteById(routeId) : undefined;
  }, [activeSession, routeId, getRouteById]);

  useEffect(() => {
    if (!activeSession && routeId) {
      const session = startSession(routeId);
      if (session) {
        reset();
        start();
      }
    }
  }, [activeSession, routeId, startSession, reset, start]);

  const currentPointSession = activeSession?.pointSessions[activeSession.currentPointIndex];
  const currentPoint = currentRoute?.points.find(
    (p) => p.id === currentPointSession?.pointId
  );

  const adjustedDuration = currentPointSession?.adjustedDuration || 0;
  const remainingSeconds = Math.max(0, adjustedDuration - seconds);
  const elapsedRatio = adjustedDuration > 0 ? Math.min(1, seconds / adjustedDuration) : 0;

  useEffect(() => {
    if (!activeSession) return;

    if (activeSession.status === 'running' && !isRunning) {
      start();
    } else if (activeSession.status === 'paused' && isRunning) {
      pause();
    }
  }, [activeSession, isRunning, start, pause]);

  useEffect(() => {
    if (remainingSeconds === 0 && !hasAlertedRef.current && adjustedDuration > 0) {
      hasAlertedRef.current = true;
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('时间到', {
          body: `点位「${currentPoint?.name || ''}」讲解时间已到`,
        });
      }
    }
    if (remainingSeconds > 0) {
      hasAlertedRef.current = false;
    }
  }, [remainingSeconds, adjustedDuration, currentPoint]);

  const handlePauseResume = () => {
    if (activeSession?.status === 'running') {
      pauseSession();
    } else if (activeSession?.status === 'paused') {
      resumeSession();
    }
  };

  const handleAddTime = (secondsToAdd: number) => {
    addTimeToCurrent(secondsToAdd);
  };

  const handlePrevPoint = () => {
    prevPoint();
    reset();
    if (activeSession?.status === 'running') {
      start();
    }
    hasAlertedRef.current = false;
  };

  const handleNextPoint = () => {
    nextPoint(seconds);
    reset();
    if (activeSession && activeSession.currentPointIndex < activeSession.pointSessions.length - 1) {
      if (activeSession.status === 'running') {
        start();
      }
    }
    hasAlertedRef.current = false;
  };

  const handleEndSession = () => {
    const sessionId = activeSession?.id;
    endSession(seconds);
    if (sessionId) {
      navigate(`/report/${sessionId}`);
    } else {
      navigate('/');
    }
  };

  const totalElapsedSeconds = useMemo(() => {
    if (!activeSession) return 0;
    const completed = activeSession.pointSessions
      .slice(0, activeSession.currentPointIndex)
      .reduce((sum, ps) => sum + (ps.actualDuration > 0 ? ps.actualDuration : ps.adjustedDuration), 0);
    return completed + seconds;
  }, [activeSession, seconds]);

  const totalAdjustedDuration = useMemo(() => {
    if (!activeSession) return 0;
    return activeSession.pointSessions.reduce((sum, ps) => sum + ps.adjustedDuration, 0);
  }, [activeSession]);

  const overallProgress = totalAdjustedDuration > 0
    ? Math.min(100, Math.round((totalElapsedSeconds / totalAdjustedDuration) * 100))
    : 0;

  const nextIndex = activeSession ? activeSession.currentPointIndex + 1 : -1;
  const nextPointData = activeSession && nextIndex < activeSession.pointSessions.length
    ? {
        session: activeSession.pointSessions[nextIndex],
        point: currentRoute?.points.find((p) => p.id === activeSession.pointSessions[nextIndex].pointId),
      }
    : null;

  if (!activeSession || !currentRoute) {
    return (
      <div className="min-h-screen bg-museum-50">
        <Header title="加载中..." />
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="text-deep-500">正在初始化讲解...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-museum-50 flex flex-col">
      <Header title={activeSession.routeName} />

      <div className="flex-1 container mx-auto px-4 py-4 md:py-6 max-w-4xl">
        <div className="space-y-4 md:space-y-6">
          <div className="glass-card p-6 md:p-8">
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-2xl md:text-3xl font-serif font-bold text-deep-900 text-center">
                  {currentPoint?.name}
                </h2>
                {currentPoint?.isKeyPoint && (
                  <Star className="w-7 h-7 text-museum-500 fill-museum-500" />
                )}
              </div>

              <CountdownDisplay
                remainingSeconds={remainingSeconds}
                totalSeconds={adjustedDuration}
              />

              <div className="mt-6 w-full max-w-sm space-y-2">
                <div className="flex justify-between text-sm text-deep-500">
                  <span>已用时间</span>
                  <span className="font-mono">{formatDuration(seconds)}</span>
                </div>
                <div className="w-full h-2 bg-museum-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-deep-700 rounded-full transition-all duration-1000"
                    style={{ width: `${elapsedRatio * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-sm text-deep-400">
                  <span>总进度</span>
                  <span>{formatDuration(totalElapsedSeconds)} / {formatDuration(totalAdjustedDuration)} ({overallProgress}%)</span>
                </div>
              </div>

              {remainingSeconds === 0 && adjustedDuration > 0 && (
                <div className="mt-4 flex items-center gap-2 px-4 py-2 bg-coral-500/10 border border-coral-500/30 rounded-lg text-coral-600">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="font-medium">讲解时间已到</span>
                </div>
              )}
            </div>
          </div>

          <div className="glass-card p-4 md:p-6">
            <div className="space-y-4">
              <div className="flex justify-center">
                <button
                  onClick={handlePauseResume}
                  className={cn(
                    'w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-95',
                    activeSession.status === 'running'
                      ? 'bg-museum-500 hover:bg-museum-600'
                      : 'bg-jade-500 hover:bg-jade-600'
                  )}
                >
                  {activeSession.status === 'running' ? (
                    <Pause className="w-10 h-10 text-white" />
                  ) : (
                    <Play className="w-10 h-10 text-white ml-1" />
                  )}
                </button>
              </div>

              <div className="flex justify-center gap-2 md:gap-3">
                <button
                  onClick={() => handleAddTime(30)}
                  className="px-3 md:px-4 py-2 bg-deep-100 hover:bg-deep-200 text-deep-800 rounded-lg font-medium transition-all active:scale-95 text-sm md:text-base"
                >
                  +30秒
                </button>
                <button
                  onClick={() => handleAddTime(60)}
                  className="px-3 md:px-4 py-2 bg-deep-100 hover:bg-deep-200 text-deep-800 rounded-lg font-medium transition-all active:scale-95 text-sm md:text-base"
                >
                  +1分钟
                </button>
                <button
                  onClick={() => handleAddTime(120)}
                  className="px-3 md:px-4 py-2 bg-deep-100 hover:bg-deep-200 text-deep-800 rounded-lg font-medium transition-all active:scale-95 text-sm md:text-base"
                >
                  +2分钟
                </button>
              </div>

              <div className="flex justify-center items-center gap-3">
                <button
                  onClick={handlePrevPoint}
                  disabled={activeSession.currentPointIndex === 0}
                  className={cn(
                    'w-14 h-14 rounded-full flex items-center justify-center transition-all active:scale-95',
                    activeSession.currentPointIndex === 0
                      ? 'bg-museum-100 text-museum-300 cursor-not-allowed'
                      : 'bg-museum-200 hover:bg-museum-300 text-deep-800'
                  )}
                >
                  <SkipBack className="w-6 h-6" />
                </button>

                <button
                  onClick={handleNextPoint}
                  className={cn(
                    'w-14 h-14 rounded-full flex items-center justify-center transition-all active:scale-95',
                    activeSession.currentPointIndex >= activeSession.pointSessions.length - 1
                      ? 'bg-jade-500 hover:bg-jade-600 text-white'
                      : 'bg-deep-800 hover:bg-deep-700 text-white'
                  )}
                >
                  {activeSession.currentPointIndex >= activeSession.pointSessions.length - 1 ? (
                    <ChevronRight className="w-6 h-6" />
                  ) : (
                    <SkipForward className="w-6 h-6" />
                  )}
                </button>
              </div>

              <div className="flex justify-center pt-2">
                <button
                  onClick={handleEndSession}
                  className="btn-danger flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  结束讲解
                </button>
              </div>
            </div>
          </div>

          {nextPointData && nextPointData.point && (
            <div className="glass-card p-4">
              <div className="flex items-center gap-2 text-sm text-deep-500 mb-2">
                <ChevronRight className="w-4 h-4" />
                <span>下一站</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-medium text-deep-900">
                    {nextPointData.point.name}
                  </span>
                  {nextPointData.point.isKeyPoint && (
                    <Star className="w-5 h-5 text-museum-500 fill-museum-500" />
                  )}
                </div>
                <div className="flex items-center gap-1 text-deep-600">
                  <Clock className="w-4 h-4" />
                  <span>{formatDurationChinese(nextPointData.session.adjustedDuration)}</span>
                </div>
              </div>
            </div>
          )}

          <div className="glass-card p-4 md:p-6">
            <h3 className="text-sm font-medium text-deep-500 mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              讲解路线
            </h3>
            <div className="max-h-80 overflow-y-auto scrollbar-hide">
              <RouteTimeline
                points={currentRoute.points}
                pointSessions={activeSession.pointSessions}
                currentIndex={activeSession.currentPointIndex}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
