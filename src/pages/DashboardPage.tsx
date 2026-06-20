import { Link } from 'react-router-dom';
import { 
  Headphones, 
  AlertTriangle, 
  XCircle, 
  Calendar, 
  ShoppingCart, 
  Clock, 
  User, 
  MapPin,
  ChevronRight,
  Battery,
  Wifi,
  Package
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { connectionTypeLabels, borrowStatusLabels, purchaseStatusLabels } from '@/types';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const { headsets, borrowRecords, meetingDemands, purchaseNeeds } = useStore();
  
  const now = new Date();
  
  const availableHeadsets = headsets.filter(h => 
    h.status === 'available' && !h.receiverLost && !h.microphoneIssue
  );
  
  const overdueBorrows = borrowRecords.filter(r => {
    if (r.status !== 'borrowed') return false;
    return new Date(r.expectedReturn) < now;
  });
  
  const faultyHeadsets = headsets.filter(h => 
    h.status === 'faulty' || h.status === 'maintenance' || h.receiverLost || h.microphoneIssue
  );
  
  const upcomingDemands = meetingDemands
    .filter(d => new Date(d.meetingTime) > now)
    .sort((a, b) => new Date(a.meetingTime).getTime() - new Date(b.meetingTime).getTime())
    .slice(0, 5);
  
  const pendingPurchases = purchaseNeeds
    .filter(p => p.status !== 'received')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const formatDateTime = (iso: string) => {
    const date = new Date(iso);
    return date.toLocaleString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTimeUntil = (iso: string) => {
    const date = new Date(iso);
    const diff = date.getTime() - now.getTime();
    
    if (diff < 0) {
      const absDiff = Math.abs(diff);
      const hours = Math.floor(absDiff / (1000 * 60 * 60));
      if (hours > 24) {
        const days = Math.floor(hours / 24);
        return `逾期 ${days} 天`;
      }
      return `逾期 ${hours} 小时`;
    }
    
    const minutes = Math.floor(diff / (1000 * 60));
    if (minutes < 60) {
      return `${minutes} 分钟后`;
    }
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
      return `${hours} 小时后`;
    }
    
    const days = Math.floor(hours / 24);
    return `${days} 天后`;
  };

  const stats = [
    {
      title: '可借耳麦',
      value: availableHeadsets.length,
      icon: Headphones,
      color: 'emerald',
      link: '/headsets?status=available',
    },
    {
      title: '逾期未还',
      value: overdueBorrows.length,
      icon: Clock,
      color: 'red',
      link: '/return',
    },
    {
      title: '故障设备',
      value: faultyHeadsets.length,
      icon: XCircle,
      color: 'amber',
      link: '/headsets?issues=1',
    },
    {
      title: '待采购',
      value: pendingPurchases.length,
      icon: ShoppingCart,
      color: 'blue',
      link: '#purchases',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">设备看板</h1>
          <p className="text-slate-500 mt-1">实时监控耳麦使用状态</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/borrow" className="btn btn-primary">
            借用登记
          </Link>
          <Link to="/return" className="btn btn-secondary">
            归还测试
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const colorClasses = {
            emerald: 'from-emerald-500 to-emerald-600',
            red: 'from-red-500 to-red-600',
            amber: 'from-amber-500 to-amber-600',
            blue: 'from-blue-500 to-blue-600',
          }[stat.color];
          
          const bgClasses = {
            emerald: 'bg-emerald-50 border-emerald-200',
            red: 'bg-red-50 border-red-200',
            amber: 'bg-amber-50 border-amber-200',
            blue: 'bg-blue-50 border-blue-200',
          }[stat.color];
          
          const textClasses = {
            emerald: 'text-emerald-600',
            red: 'text-red-600',
            amber: 'text-amber-600',
            blue: 'text-blue-600',
          }[stat.color];
          
          return (
            <Link
              key={stat.title}
              to={stat.link}
              className={cn(
                "card p-6 hover:shadow-lg transition-all duration-300 group",
                bgClasses
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-600">{stat.title}</p>
                  <p className={cn("text-3xl font-bold mt-2", textClasses)}>
                    {stat.value}
                  </p>
                </div>
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br text-white shadow-md",
                  colorClasses
                )}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200/50">
                <span className="text-sm text-slate-500">查看详情</span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Headphones className="w-5 h-5 text-emerald-600" />
                可借耳麦 ({availableHeadsets.length})
              </h2>
              <Link to="/headsets" className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
                全部 <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            
            {availableHeadsets.length === 0 ? (
              <p className="text-slate-500 text-center py-8">暂无可借耳麦</p>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto scrollbar-thin pr-2">
                {availableHeadsets.slice(0, 5).map(headset => {
                  const isLowBattery = headset.batteryLevel < 30 && headset.batteryLevel > 0;
                  
                  return (
                    <div
                      key={headset.id}
                      className={cn(
                        "flex items-center gap-4 p-3 rounded-lg border transition-all hover:bg-slate-50",
                        isLowBattery ? 'border-amber-300 bg-amber-50' : 'border-slate-200'
                      )}
                    >
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                        <img
                          src={headset.photo}
                          alt={headset.brand}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 truncate">
                          {headset.brand} {headset.model}
                        </p>
                        <div className="flex items-center gap-3 text-sm text-slate-500">
                          <span className="flex items-center gap-1">
                            <Wifi className="w-3 h-3" />
                            {connectionTypeLabels[headset.connectionType]}
                          </span>
                          <span className="flex items-center gap-1">
                            <Package className="w-3 h-3" />
                            {headset.cabinet}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <div className={cn(
                          "flex items-center gap-1 text-sm",
                          isLowBattery ? 'text-danger' : 'text-emerald-600'
                        )}>
                          <Battery className="w-4 h-4" />
                          {headset.batteryLevel === 0 ? '有线' : `${headset.batteryLevel}%`}
                        </div>
                        {isLowBattery && (
                          <span className="badge badge-warning text-xs">低电量</span>
                        )}
                      </div>
                      <Link
                        to={`/borrow?headsetId=${headset.id}`}
                        className="btn btn-primary text-sm py-1.5 px-3"
                      >
                        借用
                      </Link>
                    </div>
                  );
                })}
                {availableHeadsets.length > 5 && (
                  <p className="text-center text-sm text-slate-500 py-2">
                    还有 {availableHeadsets.length - 5} 个可借耳麦...
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                逾期未还 ({overdueBorrows.length})
              </h2>
            </div>
            
            {overdueBorrows.length === 0 ? (
              <p className="text-slate-500 text-center py-8">暂无逾期未还设备</p>
            ) : (
              <div className="space-y-3">
                {overdueBorrows.map(borrow => {
                  const headset = headsets.find(h => h.id === borrow.headsetId);
                  
                  return (
                    <div
                      key={borrow.id}
                      className="flex items-center gap-4 p-4 rounded-lg border-2 border-red-300 bg-red-50"
                    >
                      {headset && (
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                          <img
                            src={headset.photo}
                            alt={headset.brand}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900">
                          {headset?.brand} {headset?.model}
                        </p>
                        <div className="flex items-center gap-3 text-sm text-slate-600 mt-1">
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {borrow.borrower}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {borrow.meetingRoom}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          预计归还：{new Date(borrow.expectedReturn).toLocaleString('zh-CN')}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="badge badge-danger text-sm">
                          {formatTimeUntil(borrow.expectedReturn)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <XCircle className="w-5 h-5 text-amber-600" />
                故障设备 ({faultyHeadsets.length})
              </h2>
            </div>
            
            {faultyHeadsets.length === 0 ? (
              <p className="text-slate-500 text-center py-8">暂无故障设备</p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {faultyHeadsets.map(headset => (
                  <div
                    key={headset.id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-red-300 bg-red-50"
                  >
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                      <img
                        src={headset.photo}
                        alt={headset.brand}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-slate-900 truncate">
                        {headset.brand} {headset.model}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {headset.status === 'faulty' && (
                          <span className="badge badge-danger">故障</span>
                        )}
                        {headset.status === 'maintenance' && (
                          <span className="badge badge-warning">维修中</span>
                        )}
                        {headset.receiverLost && (
                          <span className="badge badge-danger">接收器丢失</span>
                        )}
                        {headset.microphoneIssue && (
                          <span className="badge badge-danger">麦克风异常</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary-600" />
                下场会议需求
              </h2>
            </div>
            
            {upcomingDemands.length === 0 ? (
              <p className="text-slate-500 text-center py-8">暂无会议需求</p>
            ) : (
              <div className="space-y-3">
                {upcomingDemands.map(demand => {
                  const isUrgent = new Date(demand.meetingTime).getTime() - now.getTime() < 60 * 60 * 1000;
                  
                  return (
                    <div
                      key={demand.id}
                      className={cn(
                        "p-4 rounded-lg border transition-all",
                        isUrgent 
                          ? 'border-red-300 bg-red-50' 
                          : 'border-slate-200 bg-slate-50'
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={cn(
                          "badge",
                          isUrgent ? 'badge-danger' : 'badge-info'
                        )}>
                          {formatTimeUntil(demand.meetingTime)}
                        </span>
                        <span className="text-sm font-medium text-slate-700">
                          {formatDateTime(demand.meetingTime)}
                        </span>
                      </div>
                      <p className="font-medium text-slate-900">{demand.meetingRoom}</p>
                      <p className="text-sm text-slate-600 mt-1">
                        需要 <span className="font-semibold text-primary-600">{demand.headsetCount}</span> 个耳麦
                      </p>
                      {demand.notes && (
                        <p className="text-xs text-slate-500 mt-2">{demand.notes}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="card" id="purchases">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-blue-600" />
                需要采购
              </h2>
            </div>
            
            {pendingPurchases.length === 0 ? (
              <p className="text-slate-500 text-center py-8">暂无采购需求</p>
            ) : (
              <div className="space-y-3">
                {pendingPurchases.map(need => (
                  <div
                    key={need.id}
                    className="p-4 rounded-lg border border-slate-200 bg-slate-50"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-slate-900">
                          {need.brand} {need.model}
                        </p>
                        <p className="text-sm text-slate-600">
                          数量：<span className="font-semibold text-primary-600">{need.quantity}</span>
                        </p>
                      </div>
                      <span className={cn(
                        "badge",
                        need.status === 'pending' ? 'badge-warning' : 'badge-info'
                      )}>
                        {purchaseStatusLabels[need.status]}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">{need.reason}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
