import { useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { TrendingUp, AlertTriangle, Wallet, Package } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { formatCurrency } from '@/utils/helpers';

export function Statistics() {
  const { bags, records } = useAppStore();
  
  const stats = useMemo(() => {
    const totalBags = bags.length;
    const totalTurnovers = records.filter(r => r.status === 'returned').length;
    const damagedRecords = records.filter(r => r.status === 'returned' && (r.hasDamage || !r.zipperOk || !r.hasPad));
    const damageRate = totalTurnovers > 0 ? (damagedRecords.length / totalTurnovers * 100).toFixed(1) : '0';
    
    const activeRecords = records.filter(r => r.status === 'active' || r.status === 'overdue');
    const totalDeposit = activeRecords.reduce((sum, r) => {
      const bag = bags.find(b => b.id === r.bagId);
      return sum + (bag?.deposit || 0);
    }, 0);
    
    const unreturnedDeposit = activeRecords.filter(r => !r.depositRefunded).reduce((sum, r) => {
      const bag = bags.find(b => b.id === r.bagId);
      return sum + (bag?.deposit || 0);
    }, 0);
    
    return { totalBags, totalTurnovers, damageRate, totalDeposit, unreturnedDeposit };
  }, [bags, records]);
  
  const turnoverData = useMemo(() => {
    return [...bags]
      .sort((a, b) => b.turnoverCount - a.turnoverCount)
      .slice(0, 10)
      .map(bag => ({
        name: bag.code,
        周转次数: bag.turnoverCount,
        损坏次数: bag.damageCount,
      }));
  }, [bags]);
  
  const statusData = useMemo(() => {
    const available = bags.filter(b => b.status === 'available').length;
    const borrowed = bags.filter(b => b.status === 'borrowed').length;
    const damaged = bags.filter(b => b.status === 'damaged').length;
    const lost = bags.filter(b => b.status === 'lost').length;
    
    return [
      { name: '可借', value: available, color: '#2ECC71' },
      { name: '借出中', value: borrowed, color: '#3498DB' },
      { name: '损坏', value: damaged, color: '#F39C12' },
      { name: '丢失', value: lost, color: '#E74C3C' },
    ];
  }, [bags]);
  
  const platformData = useMemo(() => {
    const platforms: Record<string, number> = {};
    records.forEach(r => {
      const label = r.platform === 'meituan' ? '美团' : 
                    r.platform === 'eleme' ? '饿了么' :
                    r.platform === 'douyin' ? '抖音' : '其他';
      platforms[label] = (platforms[label] || 0) + 1;
    });
    
    return Object.entries(platforms).map(([name, value]) => ({ name, value }));
  }, [records]);
  
  const COLORS = ['#FF7A45', '#3498DB', '#9B59B6', '#2ECC71'];
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">数据统计</h2>
          <p className="text-sm text-gray-500 mt-1">保温袋周转数据分析</p>
        </div>
      </div>
      
      <div className="grid grid-cols-4 gap-5">
        <StatCard
          icon={Package}
          label="保温袋总数"
          value={stats.totalBags.toString()}
          unit="个"
          color="from-blue-500 to-blue-600"
        />
        <StatCard
          icon={TrendingUp}
          label="累计周转"
          value={stats.totalTurnovers.toString()}
          unit="次"
          color="from-primary-500 to-primary-600"
        />
        <StatCard
          icon={AlertTriangle}
          label="损坏率"
          value={stats.damageRate}
          unit="%"
          color="from-amber-500 to-amber-600"
        />
        <StatCard
          icon={Wallet}
          label="在押金额"
          value={formatCurrency(stats.totalDeposit)}
          unit=""
          color="from-emerald-500 to-emerald-600"
        />
      </div>
      
      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-50">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">周转次数排行</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={turnoverData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={70} tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 4px 16px rgba(0,0,0,0.1)' 
                  }} 
                />
                <Bar dataKey="周转次数" fill="#FF7A45" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-50">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">袋子状态分布</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 4px 16px rgba(0,0,0,0.1)' 
                  }} 
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-50">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">平台借出分布</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={platformData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {platformData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 4px 16px rgba(0,0,0,0.1)' 
                  }} 
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-50">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">押金概览</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-orange-50 rounded-xl">
              <div>
                <p className="text-sm text-gray-500">在押总额</p>
                <p className="text-2xl font-bold text-primary-600">{formatCurrency(stats.totalDeposit)}</p>
              </div>
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                <Wallet className="w-6 h-6 text-primary-500" />
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-amber-50 rounded-xl">
              <div>
                <p className="text-sm text-gray-500">未退还押金</p>
                <p className="text-2xl font-bold text-amber-600">{formatCurrency(stats.unreturnedDeposit)}</p>
              </div>
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                <AlertTriangle className="w-6 h-6 text-amber-500" />
              </div>
            </div>
            
            <div className="pt-2">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-500">已退还占比</span>
                <span className="font-medium text-gray-700">
                  {stats.totalDeposit > 0 
                    ? Math.round((1 - stats.unreturnedDeposit / stats.totalDeposit) * 100) 
                    : 0}%
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${stats.totalDeposit > 0 
                      ? (1 - stats.unreturnedDeposit / stats.totalDeposit) * 100 
                      : 0}%` 
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-50">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">损坏详情统计</h3>
        <div className="grid grid-cols-4 gap-4">
          <DamageStatItem 
            label="污渍问题"
            count={records.filter(r => r.hasStain).length}
            total={records.filter(r => r.status === 'returned').length}
            color="text-amber-600"
            bgColor="bg-amber-50"
          />
          <DamageStatItem 
            label="破损问题"
            count={records.filter(r => r.hasDamage).length}
            total={records.filter(r => r.status === 'returned').length}
            color="text-red-600"
            bgColor="bg-red-50"
          />
          <DamageStatItem 
            label="拉链故障"
            count={records.filter(r => r.zipperOk === false).length}
            total={records.filter(r => r.status === 'returned').length}
            color="text-blue-600"
            bgColor="bg-blue-50"
          />
          <DamageStatItem 
            label="缺少垫板"
            count={records.filter(r => r.hasPad === false).length}
            total={records.filter(r => r.status === 'returned').length}
            color="text-purple-600"
            bgColor="bg-purple-50"
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  unit,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  unit: string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-50 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{label}</p>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-gray-800">{value}</span>
            <span className="text-sm text-gray-400">{unit}</span>
          </div>
        </div>
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-md`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
}

function DamageStatItem({
  label,
  count,
  total,
  color,
  bgColor,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
  bgColor: string;
}) {
  const percentage = total > 0 ? (count / total * 100).toFixed(1) : '0';
  
  return (
    <div className={`${bgColor} rounded-xl p-4`}>
      <p className="text-sm text-gray-500 mb-2">{label}</p>
      <div className="flex items-baseline gap-2">
        <span className={`text-2xl font-bold ${color}`}>{count}</span>
        <span className="text-sm text-gray-400">次 ({percentage}%)</span>
      </div>
    </div>
  );
}
