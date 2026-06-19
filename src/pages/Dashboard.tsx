import { useNavigate } from 'react-router-dom';
import { ClipboardList, AlertTriangle, Package, Calendar, Plus, Cat, Box, Sparkles } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { calculateDashboardStats } from '@/utils/calculation';
import { formatDateTime } from '@/utils/calculation';
import StatCard from '@/components/StatCard';
import { OPERATION_LABELS, ABNORMAL_LABELS } from '@/types';

export default function Dashboard() {
  const navigate = useNavigate();
  const { litterBoxes, cleaningRecords, cats } = useAppStore();
  
  const stats = calculateDashboardStats(litterBoxes, cleaningRecords);
  const recentRecords = cleaningRecords.slice(0, 5);

  const quickActions = [
    {
      label: '记录清理',
      icon: ClipboardList,
      color: 'bg-sand-100 text-sand-400',
      onClick: () => navigate('/cleaning-records'),
    },
    {
      label: '添加猫咪',
      icon: Cat,
      color: 'bg-forest-100 text-forest-400',
      onClick: () => navigate('/cats'),
    },
    {
      label: '添加猫砂盆',
      icon: Box,
      color: 'bg-cream-200 text-warm-400',
      onClick: () => navigate('/litter-boxes'),
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display">🐱 猫砂盆管家</h1>
          <p className="text-warm-300 mt-1">猫咪健康从如厕开始</p>
        </div>
        <button
          onClick={() => navigate('/cleaning-records')}
          className="btn-primary hidden md:flex items-center gap-2"
        >
          <Plus size={20} />
          记录清理
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="今日待清理"
          value={stats.todayPending}
          subtitle={stats.todayPending > 0 ? '需要铲屎啦' : '今日已完成'}
          icon={ClipboardList}
          variant={stats.todayPending > 0 ? 'warning' : 'success'}
          delay={0}
        />
        <StatCard
          title="异常排泄"
          value={stats.abnormalCount}
          subtitle={stats.abnormalCount > 0 ? '需要关注' : '一切正常'}
          icon={AlertTriangle}
          variant={stats.abnormalCount > 0 ? 'danger' : 'success'}
          delay={100}
        />
        <StatCard
          title="猫砂库存"
          value={`${stats.litterStock}kg`}
          subtitle={stats.litterStock < 5 ? '库存不足' : '库存充足'}
          icon={Package}
          variant={stats.litterStock < 5 ? 'warning' : 'default'}
          delay={200}
        />
        <StatCard
          title="除臭珠余量"
          value={stats.deodorizerStock === -1 ? '待设置' : `${stats.deodorizerStock}颗`}
          subtitle={stats.deodorizerStock === -1 ? '去猫砂盆档案设置' : (stats.deodorizerLow ? '快用完啦' : '库存充足')}
          icon={Sparkles}
          variant={stats.deodorizerStock === -1 ? 'default' : (stats.deodorizerLow ? 'danger' : 'default')}
          delay={300}
        />
        <StatCard
          title="下次整盆换砂"
          value={stats.nextFullChangeDays === 0 ? '今天' : `${stats.nextFullChangeDays}天`}
          subtitle={stats.nextFullChangeBoxName}
          icon={Calendar}
          variant={stats.nextFullChangeDays <= 2 ? 'warning' : 'default'}
          delay={400}
        />
      </div>

      <div>
        <h2 className="text-xl font-display mb-4">快捷操作</h2>
        <div className="grid grid-cols-3 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                onClick={action.onClick}
                className="card flex flex-col items-center gap-3 hover:scale-105 transition-transform"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`p-4 rounded-2xl ${action.color}`}>
                  <Icon size={28} />
                </div>
                <span className="font-medium text-warm-400">{action.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-display">最近记录</h2>
          <button
            onClick={() => navigate('/cleaning-records')}
            className="text-sand-300 hover:text-sand-400 text-sm font-medium"
          >
            查看全部 →
          </button>
        </div>
        
        {recentRecords.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-warm-300">暂无清理记录</p>
            <button
              onClick={() => navigate('/cleaning-records')}
              className="btn-primary mt-4"
            >
              添加第一条记录
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {recentRecords.map((record, index) => {
              const box = litterBoxes.find(b => b.id === record.litterBoxId);
              const cat = cats.find(c => c.id === record.catId);
              
              return (
                <div
                  key={record.id}
                  className={`${record.isAbnormal ? 'card-abnormal' : 'card'} opacity-0 animate-fade-in-up`}
                  style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-cream-200 flex items-center justify-center overflow-hidden">
                        {cat ? (
                          <img src={cat.photoUrl} alt={cat.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-lg">🐱</span>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          {record.isAbnormal && (
                            <span className="px-2 py-0.5 bg-coral-200 text-white text-xs rounded-full">
                              异常
                            </span>
                          )}
                          <span className="text-sm text-warm-300">
                            {formatDateTime(record.date, record.time)}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {record.operationTypes.map(type => (
                            <span
                              key={type}
                              className="px-2 py-0.5 bg-sand-100 text-sand-400 text-xs rounded-full"
                            >
                              {OPERATION_LABELS[type]}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-warm-400">{box?.location || '-'}</p>
                      {record.isAbnormal && (
                        <p className="text-xs text-coral-400 mt-1">
                          {record.abnormalTypes.map(t => ABNORMAL_LABELS[t]).join('、')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
