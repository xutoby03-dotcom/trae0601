import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  AlertTriangle,
  Calendar,
  Package,
  TrendingUp,
  ArrowRight,
  PlusCircle,
  ListTodo,
  CheckCircle,
  Timer,
} from 'lucide-react';
import useAppStore from '@/store/useAppStore';
import { isThisWeek, isExpiringSoon, isLongPending, isOverdue } from '@/utils/dateUtils';
import ClothingCard from '@/components/ClothingCard';
import { MATERIAL_TYPE_LABELS } from '@/types';

const Dashboard = () => {
  const navigate = useNavigate();
  const { clothings, materials } = useAppStore();

  const stats = useMemo(() => {
    const pending = clothings.filter((c) => c.status !== 'completed');
    const thisWeek = pending.filter((c) => isThisWeek(c.deadline));
    const expiringSoon = pending.filter((c) => isExpiringSoon(c.deadline, 7));
    const longPending = pending.filter(
      (c) => c.status === 'pending' && isLongPending(c.createdAt, 14)
    );
    const completed = clothings.filter((c) => c.status === 'completed');
    const totalTime = completed.reduce((sum, c) => sum + (c.timeSpent || 0), 0);

    return {
      totalPending: pending.length,
      thisWeek: thisWeek.length,
      expiringSoon: expiringSoon.length,
      longPending: longPending.length,
      completed: completed.length,
      totalTime,
    };
  }, [clothings]);

  const lowStockMaterials = useMemo(() => {
    return materials.filter((m) => m.quantity < m.threshold);
  }, [materials]);

  const urgentTasks = useMemo(() => {
    const pending = clothings.filter((c) => c.status !== 'completed');
    return [...pending]
      .sort((a, b) => {
        const priorityOrder = { urgent: 0, normal: 1, low: 2 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      })
      .slice(0, 4);
  }, [clothings]);

  const statCards = [
    {
      label: '待处理总数',
      value: stats.totalPending,
      icon: ListTodo,
      gradient: 'from-primary-400 to-primary-600',
      delay: 'animate-delay-100',
    },
    {
      label: '本周待处理',
      value: stats.thisWeek,
      icon: Calendar,
      gradient: 'from-blue-400 to-blue-600',
      delay: 'animate-delay-200',
    },
    {
      label: '快到期',
      value: stats.expiringSoon,
      icon: AlertTriangle,
      gradient: 'from-warning-400 to-warning-600',
      delay: 'animate-delay-300',
    },
    {
      label: '长期搁置',
      value: stats.longPending,
      icon: Clock,
      gradient: 'from-brown-400 to-brown-600',
      delay: 'animate-delay-400',
    },
  ];

  return (
    <div className="space-y-8">
      <div className="stagger-item">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-brown-900">
              👋 欢迎回来
            </h1>
            <p className="text-brown-500 mt-1">
              今天有 {stats.thisWeek} 件衣物需要处理
            </p>
          </div>
          <button
            onClick={() => navigate('/register')}
            className="btn-primary flex items-center gap-2 self-start"
          >
            <PlusCircle className="w-5 h-5" />
            登记新衣物
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, index) => (
          <div
            key={card.label}
            className={`card p-5 stagger-item ${card.delay}`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-brown-500 mb-1">{card.label}</p>
                <p className="font-display text-3xl font-bold text-brown-900">
                  {card.value}
                </p>
              </div>
              <div
                className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-lg`}
              >
                <card.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card-no-hover p-6 stagger-item animate-delay-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-success-100 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-success-600" />
              </div>
              <div>
                <h3 className="font-semibold text-brown-900">完成统计</h3>
                <p className="text-sm text-brown-500">已完成 {stats.completed} 件</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 pt-4 border-t border-brown-100">
            <div className="flex items-center gap-2">
              <Timer className="w-4 h-4 text-primary-500" />
              <span className="text-sm text-brown-600">
                累计耗时 <span className="font-semibold text-brown-900">{stats.totalTime}</span> 分钟
              </span>
            </div>
            <button
              onClick={() => navigate('/records')}
              className="ml-auto text-sm text-primary-500 hover:text-primary-600 flex items-center gap-1"
            >
              查看记录 <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="card-no-hover p-6 stagger-item animate-delay-300">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-warning-100 flex items-center justify-center">
                <Package className="w-5 h-5 text-warning-600" />
              </div>
              <div>
                <h3 className="font-semibold text-brown-900">材料提醒</h3>
                <p className="text-sm text-brown-500">
                  {lowStockMaterials.length} 种材料库存不足
                </p>
              </div>
            </div>
          </div>
          {lowStockMaterials.length > 0 ? (
            <div className="space-y-2">
              {lowStockMaterials.slice(0, 3).map((mat) => (
                <div
                  key={mat.id}
                  className="flex items-center justify-between py-2 px-3 bg-warning-50 rounded-lg animate-pulse-soft"
                >
                  <span className="text-sm text-brown-700">
                    {MATERIAL_TYPE_LABELS[mat.type]} - {mat.name}
                  </span>
                  <span className="text-sm font-medium text-warning-600">
                    剩余 {mat.quantity} {mat.unit}
                  </span>
                </div>
              ))}
              <button
                onClick={() => navigate('/materials')}
                className="w-full mt-2 text-sm text-primary-500 hover:text-primary-600 flex items-center justify-center gap-1 py-2"
              >
                去采购 <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="text-center py-4 text-brown-400">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">材料库存充足</p>
            </div>
          )}
        </div>
      </div>

      <div className="stagger-item animate-delay-400">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-bold text-brown-900">
            📋 紧急任务
          </h2>
          <button
            onClick={() => navigate('/queue')}
            className="text-sm text-primary-500 hover:text-primary-600 flex items-center gap-1"
          >
            查看全部 <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {urgentTasks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {urgentTasks.map((clothing, index) => (
              <ClothingCard
                key={clothing.id}
                clothing={clothing}
                className={`stagger-item`}
                style={{ animationDelay: `${index * 100 + 400}ms` } as React.CSSProperties}
              />
            ))}
          </div>
        ) : (
          <div className="card-no-hover p-12 text-center">
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-success-400" />
            <h3 className="font-display text-xl font-semibold text-brown-700 mb-2">
              太棒了！
            </h3>
            <p className="text-brown-500">目前没有紧急任务，享受你的空闲时光吧 ☕</p>
          </div>
        )}
      </div>

      <div className="stagger-item animate-delay-500">
        <h2 className="font-display text-xl font-bold text-brown-900 mb-4">
          ⏰ 长期搁置的衣物
        </h2>
        {stats.longPending > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clothings
              .filter((c) => c.status === 'pending' && isLongPending(c.createdAt, 14))
              .slice(0, 3)
              .map((clothing) => (
                <ClothingCard key={clothing.id} clothing={clothing} />
              ))}
          </div>
        ) : (
          <div className="card-no-hover p-8 text-center text-brown-400">
            <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>没有长期搁置的衣物，继续保持！</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
