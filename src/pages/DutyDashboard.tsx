import { useState, useEffect } from 'react';
import { TowerControl, Clock, RotateCcw, Moon, Sun, Compass } from 'lucide-react';
import SummaryCards from '../components/SummaryCards';
import DutyForm from '../components/DutyForm';
import AlertPanel from '../components/AlertPanel';
import AlertTimeline from '../components/AlertTimeline';
import RecordList from '../components/RecordList';
import { useDutyStore } from '../store/useDutyStore';
import { formatDate } from '../utils/helpers';

export default function DutyDashboard() {
  const resetShift = useDutyStore((s) => s.resetShift);
  const shiftStartTime = useDutyStore((s) => s.shiftStartTime);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [newAlertFlash, setNewAlertFlash] = useState(false);

  // 实时时钟
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 初始化加载Mock数据
  useEffect(() => {
    const store = useDutyStore.getState();
    if (store.records.length === 0) {
      store.loadMockData();
    }
  }, []);

  const handleRecordAdded = (alertCount: number) => {
    if (alertCount > 0) {
      setNewAlertFlash(true);
      setTimeout(() => setNewAlertFlash(false), 3000);
    }
  };

  const handleResetShift = () => {
    resetShift();
    setShowResetConfirm(false);
  };

  const hours = currentTime.getHours();
  const isNight = hours < 6 || hours >= 18;

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* 背景装饰 - 灯塔光束动画 */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 w-[800px] h-[800px] -translate-x-1/2 -translate-y-1/2 opacity-5">
          <div className="absolute inset-0 rounded-full bg-gradient-to-b from-alert-caution via-transparent to-transparent animate-pulse-slow" />
        </div>
        {/* 网格纹理 */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(90,147,177,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(90,147,177,0.5) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
      </div>

      <div className="relative z-10 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* 顶部标题栏 */}
        <header className="mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-alert-caution/30 via-ocean-400/30 to-ocean-600/40 flex items-center justify-center border border-alert-caution/30 shadow-glow-caution">
                  <TowerControl size={28} className="text-alert-caution" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-alert-safe border-2 border-ocean-900 flex items-center justify-center animate-pulse">
                  <div className="w-2 h-2 rounded-full bg-alert-safe" />
                </div>
              </div>
              <div>
                <h1 className="font-display text-3xl lg:text-4xl font-bold bg-gradient-to-r from-ocean-100 via-alert-caution to-ocean-200 bg-clip-text text-transparent">
                  灯塔值守记录系统
                </h1>
                <div className="flex items-center gap-3 mt-1 text-sm text-ocean-300">
                  <span className="flex items-center gap-1">
                    <Compass size={14} />
                    海事助航设备监测中心
                  </span>
                  <span className="w-1 h-1 rounded-full bg-ocean-500" />
                  <span>值班日期: {formatDate(shiftStartTime)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {/* 时钟卡片 */}
              <div className="glass-card px-4 py-2.5 flex items-center gap-3">
                {isNight ? (
                  <Moon size={18} className="text-ocean-300" />
                ) : (
                  <Sun size={18} className="text-alert-caution" />
                )}
                <div>
                  <div className="font-display text-xl font-bold text-ocean-100 tabular-nums leading-tight">
                    {currentTime.toLocaleTimeString('zh-CN', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                      hour12: false,
                    })}
                  </div>
                  <div className="text-[10px] text-ocean-400 leading-tight">
                    {isNight ? '夜间值守' : '日间值守'}
                  </div>
                </div>
              </div>

              <div className="glass-card px-4 py-2.5 flex items-center gap-2">
                <Clock size={16} className="text-ocean-300" />
                <div className="text-sm">
                  <span className="text-ocean-400">班次时长</span>
                  <span className="ml-2 font-semibold text-ocean-100 tabular-nums">
                    {Math.floor((Date.now() - shiftStartTime) / 3600000)}h{' '}
                    {Math.floor(((Date.now() - shiftStartTime) % 3600000) / 60000)}m
                  </span>
                </div>
              </div>

              {/* 重置班次按钮 */}
              <button
                onClick={() => setShowResetConfirm(true)}
                className="btn-outline flex items-center gap-2"
              >
                <RotateCcw size={16} />
                重置班次
              </button>
            </div>
          </div>
        </header>

        {/* 新告警闪烁提示 */}
        {newAlertFlash && (
          <div className="mb-4 glass-card border-alert-warning/50 border px-4 py-3 flex items-center gap-3 animate-pulse bg-alert-warning/10">
            <div className="w-3 h-3 rounded-full bg-alert-warning animate-blink" />
            <span className="text-sm text-ocean-100">
              检测到新告警，已自动添加至异常面板与时间线
            </span>
          </div>
        )}

        {/* 汇总统计卡 */}
        <section className="mb-6">
          <SummaryCards />
        </section>

        {/* 主要内容区域 - 桌面端三栏布局 */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* 左栏 - 值守表单 */}
          <div className="xl:col-span-5 space-y-6">
            <DutyForm onRecordAdded={handleRecordAdded} />
            <RecordList />
          </div>

          {/* 中栏 - 异常提示面板 */}
          <div className="xl:col-span-3">
            <div className="sticky top-6">
              <AlertPanel />
            </div>
          </div>

          {/* 右栏 - 告警时间线 */}
          <div className="xl:col-span-4">
            <div className="sticky top-6 h-[calc(100vh-120px)] min-h-[800px]">
              <AlertTimeline />
            </div>
          </div>
        </div>

        {/* 页脚 */}
        <footer className="mt-10 pt-6 border-t border-ocean-700/30 text-center text-xs text-ocean-500">
          <p>
            灯塔值守记录系统 © {currentTime.getFullYear()} · 用于助航设备运行数据记录与异常告警
          </p>
          <p className="mt-1 opacity-70">
            请严格按照规程记录，保障海上航行安全。
          </p>
        </footer>
      </div>

      {/* 重置确认弹窗 */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ocean-950/80 backdrop-blur-sm">
          <div className="glass-card w-full max-w-md p-6">
            <h3 className="font-display text-xl text-ocean-100 mb-2">确认重置班次？</h3>
            <p className="text-sm text-ocean-300 mb-6">
              将清空当前班次的所有值守记录、告警事件和维护工单，此操作不可撤销。
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 btn-outline"
              >
                取消
              </button>
              <button
                onClick={handleResetShift}
                className="flex-1 py-2.5 rounded-full bg-alert-warning/20 text-alert-warning border border-alert-warning/40 hover:bg-alert-warning/30 font-semibold transition-colors"
              >
                确认重置
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
