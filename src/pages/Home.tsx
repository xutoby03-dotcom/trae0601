import { Link } from 'react-router-dom';
import {
  PawPrint,
  ClipboardList,
  Plus,
  AlertTriangle,
  ClipboardCheck,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useAppStore } from '@/store';
import PetCard from '@/components/PetCard';
import TaskCard from '@/components/TaskCard';
import { getTodayStr } from '@/utils';

export default function Home() {
  const { pets, tasks, getTaskStatus, getPetById, getMissedItems, getTodayCheckIn } = useAppStore();

  const today = getTodayStr();

  const tasksWithStatus = tasks
    .map((task) => ({
      task,
      status: getTaskStatus(task),
      pet: getPetById(task.petId),
      missedCount: getMissedItems(task.id, today).length,
      hasTodayCheckin: !!getTodayCheckIn(task.id),
    }))
    .sort((a, b) => {
      const statusOrder: Record<string, number> = { active: 0, pending: 1, completed: 2 };
      return statusOrder[a.status] - statusOrder[b.status];
    });

  const activeTasks = tasksWithStatus.filter((t) => t.status === 'active');
  const pendingTasks = tasksWithStatus.filter((t) => t.status === 'pending');
  const hasMissedItems = activeTasks.some((t) => t.missedCount > 0);
  const totalMissedCount = activeTasks.reduce((sum, t) => sum + t.missedCount, 0);

  const displayTasks = tasksWithStatus.slice(0, 4);
  const displayPets = pets.slice(0, 4);

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-500 via-brand-400 to-amber-300 p-8 md:p-10 text-white">
        <div className="absolute -right-10 -top-10 text-[180px] opacity-20 select-none">
          🐾
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={20} />
            <span className="text-white/90 font-medium">欢迎回来！</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            让每一次寄养都安心
          </h1>
          <p className="text-white/90 max-w-lg mb-6">
            系统化记录宠物的饭量、用药、禁忌，每日打卡追踪照料情况，交接结束自动生成完整回顾报告。
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/pets/new" className="btn bg-white text-brand-600 hover:bg-white/90 hover:-translate-y-0.5">
              <Plus size={18} />
              添加宠物
            </Link>
            <Link
              to="/tasks/new"
              className="btn bg-white/20 text-white border border-white/30 hover:bg-white/30"
            >
              <ClipboardList size={18} />
              新建寄养
            </Link>
          </div>
        </div>
      </section>

      {hasMissedItems && (
        <div className="alert-banner">
          <AlertTriangle className="text-red-500 flex-shrink-0 animate-bounce-soft" size={28} />
          <div className="flex-1">
            <h3 className="font-bold text-red-700 text-lg">
              ⚠️ 有 {totalMissedCount} 项待办需要处理
            </h3>
            <p className="text-red-600 mt-1">
              进行中的任务存在漏喂或漏药情况，请及时打卡处理
            </p>
          </div>
          {activeTasks.find((t) => t.missedCount > 0) && (
            <Link
              to={`/tasks/${activeTasks.find((t) => t.missedCount > 0)!.task.id}/checkin`}
              className="btn-danger text-sm"
            >
              立即打卡
            </Link>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <ClipboardList className="text-brand-500" size={24} />
                寄养任务
              </h2>
              <Link to="/tasks" className="text-brand-600 hover:text-brand-700 font-medium text-sm flex items-center gap-1">
                查看全部
                <ChevronRight size={16} />
              </Link>
            </div>

            {displayTasks.length === 0 ? (
              <div className="card text-center py-12">
                <div className="text-5xl mb-4">📋</div>
                <h3 className="text-lg font-semibold text-slate-700 mb-2">还没有寄养任务</h3>
                <p className="text-slate-500 mb-6">创建第一个寄养任务，开始系统化管理交接流程</p>
                <Link to="/tasks/new" className="btn-primary">
                  <Plus size={18} />
                  新建寄养
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayTasks.map(({ task, status, pet, missedCount }) => (
                  <TaskCard
                    key={task.id}
                    task={{ ...task, status }}
                    pet={pet}
                    showMissedAlert={status === 'active'}
                    missedItemsCount={missedCount}
                  />
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="space-y-6">
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <PawPrint className="text-brand-500" size={24} />
                我的宠物
              </h2>
              <Link to="/pets" className="text-brand-600 hover:text-brand-700 font-medium text-sm flex items-center gap-1">
                查看全部
                <ChevronRight size={16} />
              </Link>
            </div>

            {displayPets.length === 0 ? (
              <div className="card text-center py-10">
                <div className="text-4xl mb-3">🐾</div>
                <h3 className="text-base font-semibold text-slate-700 mb-1">还没有宠物资料</h3>
                <p className="text-slate-500 text-sm mb-4">添加宠物开始管理</p>
                <Link to="/pets/new" className="btn-secondary text-sm">
                  <Plus size={16} />
                  添加宠物
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {displayPets.map((pet) => (
                  <Link
                    key={pet.id}
                    to={`/pets/${pet.id}`}
                    className="flex items-center gap-3 p-3 bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 group"
                  >
                    {pet.avatarUrl ? (
                      <img
                        src={pet.avatarUrl}
                        alt={pet.name}
                        className="w-12 h-12 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-brand-100 flex items-center justify-center text-xl">
                        {pet.species === 'dog' ? '🐕' : pet.species === 'cat' ? '🐱' : '🐾'}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-800 group-hover:text-brand-600 transition-colors">
                        {pet.name}
                      </h3>
                      <p className="text-sm text-slate-500 truncate">
                        {pet.breed || '未填品种'} · {pet.age}岁
                      </p>
                    </div>
                    <ChevronRight size={18} className="text-slate-300 group-hover:text-brand-500 transition-colors" />
                  </Link>
                ))}
              </div>
            )}
          </section>

          {activeTasks.length > 0 && (
            <section className="card bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100">
              <div className="flex items-center gap-2 mb-3">
                <ClipboardCheck size={20} className="text-emerald-600" />
                <h3 className="font-bold text-emerald-800">今日待打卡</h3>
              </div>
              <div className="space-y-2">
                {activeTasks.map(({ task, pet, hasTodayCheckin, missedCount }) => (
                  <Link
                    key={task.id}
                    to={`/tasks/${task.id}/checkin`}
                    className="flex items-center justify-between p-3 bg-white rounded-xl hover:bg-emerald-50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      {pet?.avatarUrl ? (
                        <img
                          src={pet.avatarUrl}
                          alt={pet.name}
                          className="w-8 h-8 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center text-sm">
                          {pet?.species === 'dog' ? '🐕' : pet?.species === 'cat' ? '🐱' : '🐾'}
                        </div>
                      )}
                      <span className="font-medium text-slate-700">{pet?.name || '宠物'}</span>
                    </div>
                    {hasTodayCheckin ? (
                      missedCount > 0 ? (
                        <span className="tag bg-red-100 text-red-700 text-xs">
                          {missedCount} 项遗漏
                        </span>
                      ) : (
                        <span className="tag bg-emerald-100 text-emerald-700 text-xs">
                          已打卡
                        </span>
                      )
                    ) : (
                      <span className="tag bg-amber-100 text-amber-700 text-xs">
                        待打卡
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
