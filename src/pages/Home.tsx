import { useState, useEffect } from 'react';
import { Clock, Check, XCircle, AlertTriangle, PawPrint, ChevronRight, Pill, FileText, Scale, Calendar } from 'lucide-react';
import useAppStore from '@/store/useAppStore';
import FeedingModal from '@/components/FeedingModal';
import Modal from '@/components/Modal';
import type { FeedingTask, FeedingStatus, Medicine } from '@/types';
import { getMealTimingLabel, formatDateDisplay, getTodayStr, addDays, diffDays } from '@/utils/date';
import { cn } from '@/lib/utils';

type FilterType = 'all' | FeedingStatus;

export default function Home() {
  const [selectedTask, setSelectedTask] = useState<FeedingTask | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [detailMedicine, setDetailMedicine] = useState<Medicine | null>(null);
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

  const filteredTasks = activeFilter === 'all'
    ? tasks
    : tasks.filter(t => t.status === activeFilter);

  const handleTaskClick = (task: FeedingTask) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const filterButtons: { key: FilterType; label: string; count: number; activeClass: string }[] = [
    { key: 'all', label: '全部', count: tasks.length, activeClass: 'bg-gray-800 text-white' },
    { key: 'pending', label: '待喂', count: pendingTasks.length, activeClass: 'bg-orange-500 text-white' },
    { key: 'fed', label: '已喂', count: fedTasks.length, activeClass: 'bg-emerald-500 text-white' },
    { key: 'missed', label: '漏喂', count: missedTasks.length, activeClass: 'bg-rose-500 text-white' },
  ];

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
                <div
                  key={med.id}
                  onClick={() => setDetailMedicine(med)}
                  className="flex items-center justify-between text-sm cursor-pointer hover:bg-amber-100/60 rounded-lg px-2 py-1 -mx-2 transition-colors"
                >
                  <span className="text-amber-700">
                    {pet?.name} · {med.name}
                  </span>
                  <div className="flex items-center gap-1 text-amber-600 font-medium">
                    <span>还剩 {daysLeft} 天</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">今日喂药计划</h2>
          <span className="text-sm text-gray-400">{filteredTasks.length} 项</span>
        </div>

        <div className="flex gap-2">
          {filterButtons.map(btn => (
            <button
              key={btn.key}
              onClick={() => setActiveFilter(btn.key)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200',
                activeFilter === btn.key
                  ? btn.activeClass + ' shadow-md'
                  : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300'
              )}
            >
              {btn.label}
              <span className={cn(
                'min-w-[20px] h-5 flex items-center justify-center rounded-full text-xs font-bold',
                activeFilter === btn.key ? 'bg-white/25' : 'bg-gray-100 text-gray-400'
              )}>
                {btn.count}
              </span>
            </button>
          ))}
        </div>
        
        {tasks.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-orange-100">
            <PawPrint className="w-16 h-16 mx-auto text-orange-200 mb-4" />
            <p className="text-gray-500">今天没有喂药计划</p>
            <p className="text-sm text-gray-400 mt-1">去添加药品吧~</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-3xl border border-orange-100">
            <p className="text-gray-400">
              {activeFilter === 'pending' && '没有待喂任务，太棒了！🎉'}
              {activeFilter === 'fed' && '还没有已喂记录'}
              {activeFilter === 'missed' && '没有漏喂，继续保持！💪'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTasks.map((task) => (
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

      <Modal
        isOpen={detailMedicine !== null}
        onClose={() => setDetailMedicine(null)}
        title="药品详情"
      >
        {detailMedicine && (() => {
          const pet = getPetById(detailMedicine.petId);
          const daysLeft = Math.floor(detailMedicine.remainingQuantity / detailMedicine.frequency);
          const totalDoses = detailMedicine.frequency * detailMedicine.durationDays;
          const progress = diffDays(detailMedicine.startDate, getTodayStr()) + 1;
          const progressPercent = Math.min(100, Math.max(0, (progress / detailMedicine.durationDays) * 100));

          return (
            <div className="space-y-5">
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center">
                  <Pill className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{detailMedicine.name}</h3>
                  <p className="text-sm text-gray-500">{pet?.name} · {pet?.species}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-orange-50 rounded-xl">
                  <div className="flex items-center gap-2 text-orange-500 mb-1">
                    <Scale className="w-4 h-4" />
                    <span className="text-xs font-medium">剂量</span>
                  </div>
                  <p className="font-bold text-gray-800">{detailMedicine.dosage}</p>
                </div>
                <div className="p-3 bg-teal-50 rounded-xl">
                  <div className="flex items-center gap-2 text-teal-500 mb-1">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs font-medium">频次</span>
                  </div>
                  <p className="font-bold text-gray-800">每日 {detailMedicine.frequency} 次</p>
                </div>
                <div className="p-3 bg-amber-50 rounded-xl">
                  <div className="flex items-center gap-2 text-amber-500 mb-1">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-xs font-medium">剩余数量</span>
                  </div>
                  <p className="font-bold text-gray-800">{detailMedicine.remainingQuantity} 份</p>
                  <p className="text-xs text-amber-600 mt-0.5">约 {daysLeft} 天用量</p>
                </div>
                <div className="p-3 bg-emerald-50 rounded-xl">
                  <div className="flex items-center gap-2 text-emerald-500 mb-1">
                    <Calendar className="w-4 h-4" />
                    <span className="text-xs font-medium">疗程</span>
                  </div>
                  <p className="font-bold text-gray-800">{detailMedicine.durationDays} 天</p>
                  <p className="text-xs text-emerald-600 mt-0.5">共 {totalDoses} 次</p>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500">疗程进度</span>
                  <span className="font-medium text-orange-500">{Math.round(progressPercent)}%</span>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-orange-400 to-rose-400 transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-500 w-20">喂药时间</span>
                  <div className="flex gap-1.5 flex-wrap">
                    {detailMedicine.timeSlots.map((slot, i) => (
                      <span key={i} className="px-2.5 py-0.5 bg-orange-50 text-orange-600 rounded-full text-xs font-medium">
                        {slot}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-500 w-20">饭前饭后</span>
                  <span className="text-gray-800 font-medium">{getMealTimingLabel(detailMedicine.mealTiming)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-500 w-20">开始日期</span>
                  <span className="text-gray-800 font-medium">{detailMedicine.startDate}</span>
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-2xl">
                <div className="flex items-start gap-2">
                  <FileText className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-700 mb-1">医生备注</p>
                    <p className={cn(
                      "text-sm",
                      detailMedicine.doctorNote ? "text-blue-600" : "text-blue-400 italic"
                    )}>
                      {detailMedicine.doctorNote || "暂无备注"}
                    </p>
                  </div>
                </div>
              </div>

              {pet && (
                <div className="p-4 bg-gradient-to-r from-orange-50 to-rose-50 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <img
                      src={pet.photo}
                      alt={pet.name}
                      className="w-12 h-12 rounded-xl object-cover"
                    />
                    <div>
                      <p className="font-semibold text-gray-800">{pet.name}</p>
                      <p className="text-xs text-gray-500">{pet.species} · {pet.weight}kg</p>
                      {pet.allergies && (
                        <p className="text-xs text-rose-500 mt-0.5">过敏：{pet.allergies}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}
