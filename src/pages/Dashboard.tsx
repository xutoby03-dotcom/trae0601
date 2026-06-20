import { useNavigate } from 'react-router-dom';
import { Clock, Gem, AlertTriangle, Sun, User, Package } from 'lucide-react';
import { useStore } from '@/store/useStore';
import StatCard from '@/components/StatCard';
import StatusBadge from '@/components/StatusBadge';

const colorMap: Record<string, string> = {
  '蓝色': '#3b82f6',
  '橙色': '#f97316',
  '黑色': '#1f2937',
  '绿色': '#22c55e',
  '红色': '#ef4444',
  '紫色': '#a855f7',
  '黄色': '#eab308',
  '灰色': '#6b7280',
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { 
    getUnconfirmedItems, 
    getValuablesLocation, 
    getDamagedBags, 
    getDryingList,
    members,
    bags
  } = useStore();
  
  const unconfirmed = getUnconfirmedItems();
  const valuables = getValuablesLocation();
  const damaged = getDamagedBags();
  const drying = getDryingList();

  const getOwnerName = (ownerId: string) => {
    return members.find(m => m.id === ownerId)?.name || '未知';
  };

  const stats = [
    { title: '未确认物品', value: unconfirmed.length, icon: Clock, color: 'amber' as const, path: '/checklist' },
    { title: '贵重物品位置', value: valuables.length, icon: Gem, color: 'sky' as const, path: '/bags' },
    { title: '损坏包数量', value: damaged.length, icon: AlertTriangle, color: 'rose' as const, path: '/post-check' },
    { title: '待晾晒清单', value: drying.length, icon: Sun, color: 'emerald' as const, path: '/post-check' },
  ];

  return (
    <div className="animate-fade-in-up">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
            delay={index * 100}
            onClick={() => navigate(stat.path)}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card rounded-2xl p-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">未确认物品</h2>
              <p className="text-sm text-gray-500">待完成出发前清点的防水包</p>
            </div>
          </div>
          
          {unconfirmed.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Check className="w-12 h-12 mx-auto mb-3 text-green-400" />
              <p>所有防水包已完成清点</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {unconfirmed.map((bag, index) => (
                <div 
                  key={bag.id}
                  className="flex items-center gap-4 p-4 bg-white/60 rounded-xl hover:bg-white/80 transition-colors cursor-pointer"
                  onClick={() => navigate('/checklist')}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: colorMap[bag.color] || '#6b7280' }}
                  >
                    #{bag.number}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-800">{bag.color} {bag.capacity}</span>
                      <StatusBadge status={bag.sealStatus} size="sm" />
                    </div>
                    <p className="text-sm text-gray-500">
                      <User className="w-3 h-3 inline mr-1" />
                      {getOwnerName(bag.ownerId)}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
                    待清点
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass-card rounded-2xl p-6 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-cyan-500 flex items-center justify-center">
              <Gem className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">贵重物品位置</h2>
              <p className="text-sm text-gray-500">贵重物品存放位置一览</p>
            </div>
          </div>
          
          {valuables.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>暂无贵重物品记录</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {valuables.map((item, index) => (
                <div 
                  key={item.bag.id}
                  className="p-4 bg-white/60 rounded-xl hover:bg-white/80 transition-colors"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center gap-4 mb-2">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: colorMap[item.bag.color] || '#6b7280' }}
                    >
                      #{item.bag.number}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-800">{item.member.name}</span>
                        <span className="text-sm text-gray-500">的贵重物品</span>
                      </div>
                      <p className="text-sm text-sky-600">
                        存放于 #{item.bag.number} {item.bag.color} 包
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 ml-14">
                    {item.items.map((itm, i) => (
                      <span 
                        key={i}
                        className="px-2 py-1 bg-amber-50 text-amber-700 rounded text-xs font-medium"
                      >
                        <Gem className="w-3 h-3 inline mr-1" />
                        {itm}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass-card rounded-2xl p-6 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">损坏包列表</h2>
              <p className="text-sm text-gray-500">需要维修或更换的防水包</p>
            </div>
          </div>
          
          {damaged.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Check className="w-12 h-12 mx-auto mb-3 text-green-400" />
              <p>所有防水包状态良好</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {damaged.map((item, index) => (
                <div 
                  key={item.bag.id}
                  className="p-4 bg-red-50/80 border border-red-200 rounded-xl"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center gap-4 mb-2">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: colorMap[item.bag.color] || '#6b7280' }}
                    >
                      #{item.bag.number}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-800">{item.bag.color} {item.bag.capacity}</span>
                        <StatusBadge status="damaged" size="sm" />
                      </div>
                      <p className="text-sm text-gray-500">
                        拥有者：{getOwnerName(item.bag.ownerId)}
                      </p>
                    </div>
                  </div>
                  <p className="ml-14 text-sm text-red-700 bg-white/50 p-2 rounded">
                    <AlertTriangle className="w-4 h-4 inline mr-1" />
                    {item.issue}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass-card rounded-2xl p-6 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center">
              <Sun className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">待晾晒清单</h2>
              <p className="text-sm text-gray-500">需要晾干的防水包</p>
            </div>
          </div>
          
          {drying.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Check className="w-12 h-12 mx-auto mb-3 text-green-400" />
              <p>所有防水包已分配晾干责任人</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {drying.map((item, index) => (
                <div 
                  key={item.bag.id}
                  className="flex items-center gap-4 p-4 bg-white/60 rounded-xl hover:bg-white/80 transition-colors cursor-pointer"
                  onClick={() => navigate('/post-check')}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: colorMap[item.bag.color] || '#6b7280' }}
                  >
                    #{item.bag.number}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">
                      {item.bag.color} {item.bag.capacity}
                    </div>
                    <p className="text-sm text-gray-500">
                      拥有者：{getOwnerName(item.bag.ownerId)}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium flex items-center gap-1">
                    <Sun className="w-4 h-4" />
                    待分配
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 glass-card rounded-2xl p-6 animate-fade-in-up" style={{ animationDelay: '500ms' }}>
        <h2 className="text-lg font-bold text-gray-800 mb-6">活动流程进度</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { step: 1, title: '创建档案', desc: '成员和防水包', count: members.length + bags.length, total: members.length + bags.length, color: 'from-emerald-400 to-green-500' },
            { step: 2, title: '出发前清点', desc: '物品确认', count: bags.length - unconfirmed.length, total: bags.length, color: 'from-amber-400 to-orange-500' },
            { step: 3, title: '入水前确认', desc: '密封检查', count: bags.filter(b => b.sealStatus === 'confirmed' || b.sealStatus === 'damaged').length, total: bags.length, color: 'from-cyan-400 to-sky-500' },
            { step: 4, title: '返程后检查', desc: '问题登记', count: bags.filter(b => {
              const pc = useStore.getState().postChecks.find(p => p.bagId === b.id);
              return !!pc?.checkedAt;
            }).length, total: bags.length, color: 'from-rose-400 to-pink-500' },
          ].map((step, index) => {
            const progress = step.total > 0 ? (step.count / step.total) * 100 : 0;
            return (
              <div key={step.step} className="relative">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center text-white font-bold shadow-lg`}>
                    {step.step}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{step.title}</h3>
                    <p className="text-xs text-gray-500">{step.desc}</p>
                  </div>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden ml-[52px]">
                  <div 
                    className={`h-full bg-gradient-to-r ${step.color} rounded-full transition-all duration-500`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-right text-sm text-gray-600 mt-1 mr-0">
                  {step.count}/{step.total}
                </p>
                {index < 3 && (
                  <div className="hidden md:block absolute top-5 left-full -translate-x-1/2 w-full h-0.5 bg-gradient-to-r from-gray-300 to-transparent" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Check(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
}
