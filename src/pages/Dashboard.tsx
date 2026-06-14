import { useNavigate } from 'react-router-dom';
import { Tv2, ArrowRightLeft, Plus, AlertTriangle, BatteryLow, Clock, Users, Box, CheckCircle } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { StatusBadge } from '../components/ui/Badge';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export default function Dashboard() {
  const navigate = useNavigate();
  const { remotes, borrowRecords, purchaseOrders, notifications } = useAppStore();

  const totalRemotes = remotes.length;
  const availableRemotes = remotes.filter(r => r.status === 'available').length;
  const borrowedRemotes = remotes.filter(r => r.status === 'borrowed').length;
  const needPurchase = purchaseOrders.filter(p => p.status === 'pending' || p.status === 'approved').length;
  const lowBatteryRemotes = remotes.filter(r => r.batteryLevel < 20 && r.status !== 'lost').length;
  const overdueRecords = borrowRecords.filter(r => r.status === 'overdue').length;

  const statCards = [
    { label: '总遥控器数', value: totalRemotes, icon: Tv2, color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50' },
    { label: '当前可用', value: availableRemotes, icon: CheckCircle, color: 'from-green-500 to-green-600', bg: 'bg-green-50' },
    { label: '借用中', value: borrowedRemotes, icon: Users, color: 'from-purple-500 to-purple-600', bg: 'bg-purple-50' },
    { label: '待补购', value: needPurchase, icon: Box, color: 'from-orange-500 to-orange-600', bg: 'bg-orange-50' },
  ];

  const quickActions = [
    { label: '我要借用', icon: Plus, color: 'bg-primary-900 hover:bg-primary-800', action: () => navigate('/borrow-return', { state: { mode: 'borrow' } }) },
    { label: '我要归还', icon: ArrowRightLeft, color: 'bg-accent-500 hover:bg-accent-600', action: () => navigate('/borrow-return', { state: { mode: 'return' } }) },
    { label: '查看遥控器', icon: Tv2, color: 'bg-green-600 hover:bg-green-700', action: () => navigate('/remotes') },
  ];

  const overdueItems = borrowRecords
    .filter(r => r.status === 'overdue')
    .map(record => {
      const remote = remotes.find(r => r.id === record.remoteId);
      return { ...record, remote };
    })
    .filter(item => item.remote);

  const lowBatteryItems = remotes.filter(r => r.batteryLevel < 20 && r.status !== 'lost');

  const activeBorrows = borrowRecords
    .filter(r => r.status === 'borrowing')
    .slice(0, 5)
    .map(record => {
      const remote = remotes.find(r => r.id === record.remoteId);
      return { ...record, remote };
    })
    .filter(item => item.remote);

  return (
    <div className="space-y-6">
      <div className="animate-fade-in-up">
        <h1 className="text-2xl font-bold text-gray-800 font-display">首页仪表盘</h1>
        <p className="text-gray-500 mt-1">欢迎使用投影遥控器智能管理系统</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, index) => (
          <div
            key={card.label}
            className={`card-base p-6 animate-fade-in-up ${card.bg}`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">{card.label}</p>
                <p className="text-4xl font-bold text-gray-800 mt-2 font-display">{card.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {quickActions.map((action, index) => (
          <button
            key={action.label}
            onClick={action.action}
            className={`card-base p-8 text-center group animate-fade-in-up ${action.color} text-white`}
            style={{ animationDelay: `${(index + 4) * 100}ms` }}
          >
            <div className="w-16 h-16 mx-auto rounded-2xl bg-white/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <action.icon className="w-8 h-8" />
            </div>
            <p className="text-xl font-semibold font-display">{action.label}</p>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-base p-6 animate-fade-in-up" style={{ animationDelay: '700ms' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800 font-display">逾期未还提醒</h2>
              <p className="text-sm text-gray-500">共有 {overdueRecords} 个遥控器逾期未归还</p>
            </div>
          </div>
          
          {overdueItems.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="w-12 h-12 mx-auto text-green-400 mb-2" />
              <p>暂无逾期遥控器</p>
            </div>
          ) : (
            <div className="space-y-3">
              {overdueItems.map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-4 bg-red-50 border border-red-100 rounded-xl hover:bg-red-100 transition-colors"
                >
                  <img
                    src={item.remote?.photoUrl}
                    alt={item.remote?.code}
                    className="w-14 h-14 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-800">{item.remote?.code}</span>
                      <StatusBadge status="lost" />
                    </div>
                    <p className="text-sm text-gray-600">
                      借用人: {item.borrower} ({item.department})
                    </p>
                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      逾期 {formatDistanceToNow(new Date(item.expectedReturn), { locale: zhCN })}
                    </p>
                  </div>
                  <button
                    onClick={() => navigate('/borrow', { state: { mode: 'return', recordId: item.id } })}
                    className="px-3 py-1.5 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors"
                  >
                    催促归还
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card-base p-6 animate-fade-in-up" style={{ animationDelay: '800ms' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
              <BatteryLow className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800 font-display">低电量提醒</h2>
              <p className="text-sm text-gray-500">共有 {lowBatteryRemotes} 个遥控器需要更换电池</p>
            </div>
          </div>
          
          {lowBatteryItems.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="w-12 h-12 mx-auto text-green-400 mb-2" />
              <p>所有遥控器电量充足</p>
            </div>
          ) : (
            <div className="space-y-3">
              {lowBatteryItems.map((remote, index) => (
                <div
                  key={remote.id}
                  className="flex items-center gap-4 p-4 bg-orange-50 border border-orange-100 rounded-xl hover:bg-orange-100 transition-colors"
                >
                  <img
                    src={remote.photoUrl}
                    alt={remote.code}
                    className="w-14 h-14 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-800">{remote.code}</span>
                      <StatusBadge status={remote.status} />
                    </div>
                    <p className="text-sm text-gray-600">{remote.conferenceRoom}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-red-400 to-red-500 transition-all duration-500"
                          style={{ width: `${remote.batteryLevel}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-red-600">{remote.batteryLevel}%</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">电池型号</p>
                    <p className="text-sm font-medium text-gray-800">{remote.batteryModel}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card-base p-6 animate-fade-in-up" style={{ animationDelay: '900ms' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800 font-display">当前借用记录</h2>
          <button
            onClick={() => navigate('/borrow')}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            查看全部 →
          </button>
        </div>
        
        {activeBorrows.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Tv2 className="w-12 h-12 mx-auto text-gray-300 mb-2" />
            <p>暂无借用中的遥控器</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">遥控器</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">借用人</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">会议室</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">借出时间</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">预计归还</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">用途</th>
                </tr>
              </thead>
              <tbody>
                {activeBorrows.map((item, index) => (
                  <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img src={item.remote?.photoUrl} alt="" className="w-10 h-10 rounded-lg object-cover" />
                        <span className="font-medium text-gray-800">{item.remote?.code}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{item.borrower}</td>
                    <td className="py-3 px-4 text-gray-600">{item.conferenceRoom}</td>
                    <td className="py-3 px-4 text-gray-600 text-sm">
                      {new Date(item.borrowTime).toLocaleString('zh-CN')}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <span className={`font-medium ${new Date(item.expectedReturn) < new Date() ? 'text-red-600' : 'text-gray-600'}`}>
                        {new Date(item.expectedReturn).toLocaleString('zh-CN')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600 text-sm">{item.purpose}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
