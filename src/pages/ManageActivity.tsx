import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  QrCode,
  ListChecks,
} from 'lucide-react';
import { useAppStore } from '../store/appStore.js';
import type { Registration } from '../../shared/types.js';

export default function ManageActivity() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { fetchActivity, fetchRegistrations, registrations, activities, cancelRegistration } = useAppStore();

  const [activeTab, setActiveTab] = useState<'registered' | 'waitlist' | 'cancelled'>('registered');
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchActivity(id);
      fetchRegistrations(id);
    }
  }, [id, fetchActivity, fetchRegistrations]);

  const activity = activities.find((a) => a.id === id);
  const activityRegs = id ? registrations.get(id) || [] : [];

  const registeredList = activityRegs.filter((r) => r.status === 'registered');
  const waitlistList = activityRegs.filter((r) => r.status === 'waitlist');
  const cancelledList = activityRegs.filter((r) => r.status === 'cancelled');

  const handleCancel = async (regId: string) => {
    if (!id || !confirm('确定要取消该同学的报名吗？')) return;
    setLoading(regId);
    try {
      await cancelRegistration(regId, id);
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setLoading(null);
    }
  };

  const getCheckInBadge = (status: Registration['checkInStatus']) => {
    switch (status) {
      case 'checked':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-600 rounded-full text-xs font-medium">
            <CheckCircle className="w-3 h-3" />
            已签到
          </span>
        );
      case 'absent':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-600 rounded-full text-xs font-medium">
            <XCircle className="w-3 h-3" />
            缺席
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-500 rounded-full text-xs font-medium">
            <Clock className="w-3 h-3" />
            待签到
          </span>
        );
    }
  };

  const tabs = [
    { id: 'registered' as const, label: '已报名', count: registeredList.length, color: 'text-green-600 bg-green-50' },
    { id: 'waitlist' as const, label: '候补', count: waitlistList.length, color: 'text-orange-600 bg-orange-50' },
    { id: 'cancelled' as const, label: '已取消', count: cancelledList.length, color: 'text-gray-500 bg-gray-50' },
  ];

  const getCurrentList = (): Registration[] => {
    switch (activeTab) {
      case 'registered':
        return registeredList;
      case 'waitlist':
        return waitlistList;
      case 'cancelled':
        return cancelledList;
      default:
        return [];
    }
  };

  if (!activity) {
    return (
      <div className="min-h-screen bg-cream-100 flex items-center justify-center">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-100 pb-12">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-gray-800 truncate">{activity.title}</h1>
              <p className="text-sm text-gray-500">活动管理</p>
            </div>
            <Link
              to={`/admin/checkin/${id}`}
              className="flex items-center gap-2 px-4 py-2 bg-secondary-500 text-white rounded-xl font-medium hover:bg-secondary-600 transition-colors"
            >
              <QrCode className="w-4 h-4" />
              签到管理
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-2xl p-4 shadow-md">
            <div className="text-3xl font-bold text-gray-800">{registeredList.length}</div>
            <div className="text-sm text-gray-500">已报名</div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-md">
            <div className="text-3xl font-bold text-orange-500">{waitlistList.length}</div>
            <div className="text-sm text-gray-500">候补</div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-md">
            <div className="text-3xl font-bold text-gray-400">{cancelledList.length}</div>
            <div className="text-sm text-gray-500">已取消</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="flex border-b border-gray-100">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-4 font-medium text-sm transition-colors relative ${
                  activeTab === tab.id ? tab.color : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                {tab.label}
                <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                  activeTab === tab.id ? 'bg-white/50' : 'bg-gray-100'
                }`}>
                  {tab.count}
                </span>
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-current" />
                )}
              </button>
            ))}
          </div>

          {/* List */}
          <div className="divide-y divide-gray-50 max-h-[60vh] overflow-y-auto">
            {getCurrentList().length === 0 ? (
              <div className="py-12 text-center text-gray-400">
                <ListChecks className="w-12 h-12 mx-auto mb-3 opacity-50" />
                暂无数据
              </div>
            ) : (
              getCurrentList().map((reg, index) => (
                <div
                  key={reg.id}
                  className="p-4 hover:bg-gray-50 transition-colors"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                      {reg.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-800">{reg.name}</span>
                        {activeTab === 'registered' && getCheckInBadge(reg.checkInStatus)}
                        {activeTab === 'waitlist' && (
                          <span className="px-2 py-0.5 bg-orange-100 text-orange-600 rounded-full text-xs font-medium">
                            第 {reg.waitlistPosition} 位
                          </span>
                        )}
                        {reg.promotedFromWaitlist && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-600 rounded-full text-xs font-medium">
                            候补转正
                          </span>
                        )}
                        {reg.isFirstTime && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full text-xs">
                            首次参加
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {reg.college} · {reg.phone}
                      </div>
                      {reg.remark && (
                        <div className="text-sm text-gray-400 mt-1">备注：{reg.remark}</div>
                      )}
                    </div>
                    {activeTab !== 'cancelled' && (
                      <button
                        onClick={() => handleCancel(reg.id)}
                        disabled={loading === reg.id}
                        className="text-sm text-red-500 hover:text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {loading === reg.id ? '处理中...' : '取消'}
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
