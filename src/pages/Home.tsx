import { useState, useEffect } from 'react';
import { Clock, Check, XCircle, AlertTriangle, PawPrint, ChevronRight } from 'lucide-react';
import useAppStore from '@/store/useAppStore';
import FeedingModal from '@/components/FeedingModal';
import type { FeedingTask } from '@/types';
import { getMealTimingLabel, formatDateDisplay, getTodayStr } from '@/utils/date';
import { cn } from '@/lib/utils';

export default function Home() {
  const [selectedTask, setSelectedTask] = useState<FeedingTask | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [, forceUpdate] = useState(0);
  
  const getTodayTasks = useAppStore(state => state.getTodayTasks);
  const getRunningOutMedicines = useAppStore(state => state.getRunningOutMedicines);
  const getPetById = useAppStore(state => state.getPetById);
  const refreshTodayStatus = useAppStore(state => state.refreshTodayStatus);
  const generateDailyRecords = useAppStore(state => state.generateDailyRecords);
  
  useEffect(() => {
    const today = getTodayStr();
    generateDailyRecords(today);
    refreshTodayStatus();
    
    const interval = setInterval(() => {
      refreshTodayStatus();
      forceUpdate(n => n + 1);
    }, 30000);
    
    return () => clearInterval(interval);
  }, [refreshTodayStatus, generateDailyRecords]);
  
  const tasks = getTodayTasks();
  const runningOutMeds = getRunningOutMedicines();
  
  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const fedTasks = tasks.filter(t => t.status === 'fed');
  const missedTasks = tasks.filter(t => t.status === 'missed');
  const skippedTasks = tasks.filter(t => t.status === 'skipped');

  const handleTaskClick = (task: FeedingTask) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const statsCards = [
    {
      label: '待喂',
      count: pendingTasks.length,
      icon: Clock,
      bgClass: 'from-orange-400 to-amber-400',
      iconBg: 'bg-white/20',
    },
    {
      label: '已喂',
      count: fedTasks.length,
      icon: Check,
      bgClass: 'from-emerald-400 to-teal-400',
      iconBg: 'bg-white/20',
    },
    {
      label: '漏喂',
      count: missedTasks.length,
      icon: XCircle,
      bgClass: 'from-rose-400 to-pink-400',
      iconBg: 'bg-white/20',
    },
    {
      label: '快停药',
      count: runningOutMeds.length,
      icon: AlertTriangle,
      bgClass: 'from-amber-400 to-orange-400',
      iconBg: 'bg-white/20',
    },
  ];

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            今天喂药了吗？🐾
          </h1>
          <p className="text-gray-500 mt-1">
            {formatDateDisplay(getTodayStr())}
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-rose-400 flex items-center justify-center">
          <PawPrint className="w-6 h-6 text-white" />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {statsCards.map((stat) => (
          <div
            key={stat.label}
            className={cn(
              'p-4 md:p-5 rounded-2xl text-white bg-gradient-to-br shadow-lg',
              stat.bgClass
            )}
          >
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-3', stat.iconBg)}>
              <stat.icon className="w-5 h-5 text-white" />
            </div>
            <div className="text-2xl md:text-3xl font-bold">{stat.count}</div>
            <div className="text-sm text-white/80 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {runningOutMeds.length > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <span className="font-medium text-amber-800">快停药提醒</span>
          </div>
          <div className="space-y-2">
            {runningOutMeds.slice(0, 3).map(med => {
              const pet = getPetById(med.petId);
              const dailyUsage = med.frequency;
              const daysLeft = Math.floor(med.remainingQuantity / dailyUsage);
              return (
                <div key={med.id} className="flex items-center justify-between text-sm">
                  <span className="text-amber-700">
                    {pet?.name} · {med.name}
                  </span>
                  <span className="text-amber-600 font-medium">
                    还剩 {daysLeft} 天
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-lg font-bold text-gray-800">今日喂药计划</h2>
        
        {tasks.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-orange-100">
            <PawPrint className="w-16 h-16 mx-auto text-orange-200 mb-4" />
            <p className="text-gray-500">今天没有喂药计划</p>
            <p className="text-sm text-gray-400 mt-1">去添加药品吧~</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                onClick={() => handleTaskClick(task)}
                className={cn(
                  'p-4 bg-white rounded-2xl border-2 cursor-pointer transition-all duration-300',
                  'hover:shadow-lg hover:-translate-y-0.5',
                  task.status === 'fed' && 'border-emerald-200 bg-emerald-50/50',
                  task.status === 'missed' && 'border-rose-200 bg-rose-50/50',
                  task.status === 'skipped' && 'border-gray-200 bg-gray-50/50 opacity-60',
                  task.status === 'pending' && 'border-orange-100 hover:border-orange-300'
                )}
              >
                <div className="flex items-center gap-4">
                  <div className="text-center min-w-[60px]">
                    <div className="text-xl font-bold text-gray-800">
                      {task.timeSlot}
                    </div>
                    <div className={cn(
                      'text-xs font-medium mt-1 px-2 py-0.5 rounded-full inline-block',
                      task.status === 'fed' && 'bg-emerald-100 text-emerald-600',
                      task.status === 'missed' && 'bg-rose-100 text-rose-600',
                      task.status === 'skipped' && 'bg-gray-100 text-gray-500',
                      task.status === 'pending' && 'bg-orange-100 text-orange-600'
                    )}>
                      {task.status === 'fed' && '已喂'}
                      {task.status === 'missed' && '漏喂'}
                      {task.status === 'skipped' && '已跳过'}
                      {task.status === 'pending' && '待喂'}
                    </div>
                  </div>
                  
                  <img
                    src={task.pet.photo}
                    alt={task.pet.name}
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 truncate">
                      {task.medicine.name}
                    </h3>
                    <p className="text-sm text-gray-500 truncate">
                      {task.pet.name} · {task.medicine.dosage} · {getMealTimingLabel(task.medicine.mealTiming)}
                    </p>
                    {task.status === 'fed' && task.reaction !== 'normal' && (
                      <p className="text-xs text-gray-400 mt-1">
                        反应：{task.reaction === 'vomiting' ? '呕吐' : task.reaction === 'low-spirit' ? '精神差' : task.reaction === 'good-appetite' ? '食欲好' : '其他'}
                      </p>
                    )}
                  </div>
                  
                  <div className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center transition-all',
                    task.status === 'fed' && 'bg-emerald-400 text-white',
                    task.status === 'missed' && 'bg-rose-400 text-white',
                    task.status === 'skipped' && 'bg-gray-300 text-white',
                    task.status === 'pending' && 'bg-orange-100 text-orange-500'
                  )}>
                    {task.status === 'fed' && <Check className="w-5 h-5" />}
                    {task.status === 'missed' && <XCircle className="w-5 h-5" />}
                    {task.status === 'skipped' && <XCircle className="w-5 h-5" />}
                    {task.status === 'pending' && <ChevronRight className="w-5 h-5" />}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <FeedingModal
        task={selectedTask}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
