import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Home,
  KeyRound,
  Clock,
  AlertCircle,
  TrendingUp,
  ChevronRight,
  Phone,
} from 'lucide-react';
import { useAppStore } from '../store/appStore.js';
import { borrowsApi } from '../services/api.js';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import type { Borrow } from '../../shared/types.js';

export default function Dashboard() {
  const { dashboardStats, fetchDashboard, loading, error } = useAppStore();
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedBorrow, setSelectedBorrow] = useState<Borrow | null>(null);
  const [returnChecks, setReturnChecks] = useState({
    door: false,
    window: false,
    light: false,
    aircon: false,
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboard();
    const timer = setInterval(fetchDashboard, 60000);
    return () => clearInterval(timer);
  }, [fetchDashboard]);

  const handleReturn = (borrow: Borrow) => {
    setSelectedBorrow(borrow);
    setReturnChecks({ door: false, window: false, light: false, aircon: false });
    setShowReturnModal(true);
  };

  const confirmReturn = async () => {
    if (!selectedBorrow) return;
    try {
      await borrowsApi.returnBorrow(selectedBorrow.id, {
        doorChecked: returnChecks.door,
        windowChecked: returnChecks.window,
        lightChecked: returnChecks.light,
        airconChecked: returnChecks.aircon,
      });
      setShowReturnModal(false);
      fetchDashboard();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const allChecked = returnChecks.door && returnChecks.window && returnChecks.light && returnChecks.aircon;

  if (!dashboardStats || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700">
        {error}
      </div>
    );
  }

  const stats = dashboardStats;

  const statCards = [
    {
      label: '总房间数',
      value: stats.totalRooms,
      icon: Home,
      color: 'bg-teal-500',
      bgColor: 'bg-teal-50',
      textColor: 'text-teal-600',
    },
    {
      label: '借出中',
      value: stats.totalBorrowed,
      icon: KeyRound,
      color: 'bg-amber-500',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-600',
    },
    {
      label: '逾期未还',
      value: stats.totalOverdue,
      icon: AlertCircle,
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600',
    },
    {
      label: '本周使用次数',
      value: stats.weeklyUsage,
      icon: TrendingUp,
      color: 'bg-indigo-500',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-600',
    },
  ];

  return (
    <div className="space-y-6">
      {stats.overdueRecords.length > 0 && (
        <div className="bg-gradient-to-r from-red-500 to-rose-500 rounded-2xl p-5 text-white shadow-lg shadow-red-500/20 animate-pulse">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg">逾期提醒</h3>
              <p className="text-red-100 text-sm">共 {stats.overdueRecords.length} 条逾期记录，请及时处理</p>
            </div>
          </div>
          <div className="space-y-2">
            {stats.overdueRecords.slice(0, 3).map((record) => (
              <div
                key={record.id}
                className="bg-white/10 rounded-xl p-3 flex items-center justify-between backdrop-blur-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-medium">{record.roomName} — {record.activityName}</div>
                    <div className="text-sm text-red-100">
                      {record.borrowerName} · 应还 {format(new Date(record.endTime), 'MM月dd日 HH:mm', { locale: zhCN })}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleReturn(record)}
                  className="px-4 py-1.5 bg-white text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
                >
                  快速归还
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-slate-500 text-sm">{card.label}</p>
                  <p className="text-3xl font-bold text-slate-800 mt-2">{card.value}</p>
                </div>
                <div className={`w-12 h-12 ${card.bgColor} rounded-xl flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${card.textColor}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-800">房间状态</h2>
          <button
            onClick={() => navigate('/borrows/new')}
            className="flex items-center gap-1 text-sm text-teal-600 hover:text-teal-700 font-medium"
          >
            新建借用 <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.roomStats.map((room) => (
            <div
              key={room.roomId}
              className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer"
              onClick={() => navigate('/rooms')}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-slate-800">{room.roomName}</h3>
                  <p className="text-sm text-slate-400 mt-0.5">{room.keyNumber}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    room.overdue > 0
                      ? 'bg-red-100 text-red-700'
                      : room.borrowed > 0
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  {room.overdue > 0 ? '有逾期' : room.borrowed > 0 ? '使用中' : '空闲'}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-2 bg-slate-50 rounded-xl">
                  <div className="text-xl font-bold text-amber-600">{room.borrowed}</div>
                  <div className="text-xs text-slate-500 mt-0.5">借出中</div>
                </div>
                <div className="text-center p-2 bg-slate-50 rounded-xl">
                  <div className="text-xl font-bold text-red-600">{room.overdue}</div>
                  <div className="text-xs text-slate-500 mt-0.5">逾期</div>
                </div>
                <div className="text-center p-2 bg-slate-50 rounded-xl">
                  <div className="text-xl font-bold text-teal-600">{room.weeklyUsage}</div>
                  <div className="text-xs text-slate-500 mt-0.5">本周使用</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showReturnModal && selectedBorrow && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-slate-800 mb-4">归还钥匙</h3>
            <div className="bg-slate-50 rounded-xl p-4 mb-5">
              <div className="font-medium text-slate-800">{selectedBorrow.roomName}</div>
              <div className="text-sm text-slate-500 mt-1">{selectedBorrow.activityName}</div>
              <div className="text-sm text-slate-500">借用人：{selectedBorrow.borrowerName}</div>
            </div>

            <div className="space-y-3 mb-6">
              <h4 className="text-sm font-medium text-slate-700">归还检查清单</h4>
              {[
                { key: 'door' as const, label: '门是否关好', icon: '🚪' },
                { key: 'window' as const, label: '窗户是否关好', icon: '🪟' },
                { key: 'light' as const, label: '灯是否关闭', icon: '💡' },
                { key: 'aircon' as const, label: '空调是否关闭', icon: '❄️' },
              ].map((item) => (
                <label
                  key={item.key}
                  className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={returnChecks[item.key]}
                    onChange={(e) => setReturnChecks({ ...returnChecks, [item.key]: e.target.checked })}
                    className="w-5 h-5 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                  />
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-slate-700">{item.label}</span>
                </label>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowReturnModal(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={confirmReturn}
                disabled={!allChecked}
                className={`flex-1 px-4 py-2.5 rounded-xl font-medium transition-colors ${
                  allChecked
                    ? 'bg-teal-600 text-white hover:bg-teal-700'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                确认归还
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
