import { useEffect, useState, useMemo } from 'react';
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
  Search,
  XSquare,
  UserX,
} from 'lucide-react';
import { useAppStore } from '../store/appStore.js';
import type { Registration } from '../../shared/types.js';

export default function ManageActivity() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { fetchActivity, fetchRegistrations, registrations, activities, cancelRegistration, markAbsent } = useAppStore();

  const [activeTab, setActiveTab] = useState<'registered' | 'waitlist' | 'cancelled'>('registered');
  const [loading, setLoading] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchError, setBatchError] = useState<string | null>(null);

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

  const filteredForSelection = useMemo(() => {
    if (!searchQuery.trim()) return registeredList;
    const q = searchQuery.toLowerCase();
    return registeredList.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.college.toLowerCase().includes(q) ||
        r.phone.includes(q),
    );
  }, [searchQuery, registeredList]);

  useEffect(() => {
    setSelectedIds((prev) => {
      if (activeTab !== 'registered') {
        return new Set();
      }
      const visibleIds = new Set(filteredForSelection.map((r) => r.id));
      let changed = false;
      const next = new Set<string>();
      prev.forEach((rid) => {
        if (visibleIds.has(rid)) {
          next.add(rid);
        } else {
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [activeTab, filteredForSelection]);

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

  const handleBatchAbsent = async () => {
    if (!id) return;
    const visibleIds = new Set(filteredForSelection.map((r) => r.id));
    const targetIds: string[] = [];
    selectedIds.forEach((rid) => {
      if (visibleIds.has(rid)) targetIds.push(rid);
    });
    if (targetIds.length === 0) return;
    if (!confirm(`确定将 ${targetIds.length} 人标记为缺席吗？`)) return;
    setBatchLoading(true);
    setBatchError(null);
    let failed = 0;
    for (const regId of targetIds) {
      try {
        await markAbsent(regId, id);
      } catch {
        failed++;
      }
    }
    if (failed > 0) {
      setBatchError(`${failed} 人标记缺席失败`);
    }
    setSelectedIds(new Set());
    setBatchLoading(false);
  };

  const handleBatchCancel = async () => {
    if (!id) return;
    const visibleIds = new Set(filteredForSelection.map((r) => r.id));
    const targetIds: string[] = [];
    selectedIds.forEach((rid) => {
      if (visibleIds.has(rid)) targetIds.push(rid);
    });
    if (targetIds.length === 0) return;
    if (!confirm(`确定取消 ${targetIds.length} 人的报名吗？候补人员将自动转正。`)) return;
    setBatchLoading(true);
    setBatchError(null);
    let failed = 0;
    for (const regId of targetIds) {
      try {
        await cancelRegistration(regId, id);
      } catch {
        failed++;
      }
    }
    if (failed > 0) {
      setBatchError(`${failed} 人取消报名失败`);
    }
    setSelectedIds(new Set());
    setBatchLoading(false);
  };

  const toggleSelect = (regId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(regId)) {
        next.delete(regId);
      } else {
        next.add(regId);
      }
      return next;
    });
  };

  const toggleSelectAll = (list: Registration[]) => {
    const allChecked = list.length > 0 && list.every((r) => selectedIds.has(r.id));
    if (allChecked) {
      const listIds = new Set(list.map((r) => r.id));
      setSelectedIds((prev) => {
        const next = new Set(prev);
        listIds.forEach((rid) => next.delete(rid));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        list.forEach((r) => next.add(r.id));
        return next;
      });
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
    let list: Registration[];
    switch (activeTab) {
      case 'registered':
        list = registeredList;
        break;
      case 'waitlist':
        list = waitlistList;
        break;
      case 'cancelled':
        list = cancelledList;
        break;
      default:
        list = [];
    }
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.college.toLowerCase().includes(q) ||
        r.phone.includes(q),
    );
  };

  if (!activity) {
    return (
      <div className="min-h-screen bg-cream-100 flex items-center justify-center">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  const filteredList = getCurrentList();
  const allSelected = filteredList.length > 0 && filteredList.every((r) => selectedIds.has(r.id));

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

        {/* Tabs + Search + Batch */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-100">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSelectedIds(new Set());
                  setSearchQuery('');
                }}
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

          {/* Search */}
          <div className="p-4 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-primary-400 focus:ring-4 focus:ring-primary-100 outline-none transition-all text-sm"
                placeholder="搜索姓名、学院、手机号..."
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Batch Actions (only for registered tab) */}
          {activeTab === 'registered' && (() => {
            const visibleSelected = filteredForSelection.filter((r) => selectedIds.has(r.id)).length;
            return visibleSelected > 0 ? (
            <div className="px-4 py-3 bg-primary-50 border-b border-primary-100 flex items-center justify-between animate-fade-in">
              <span className="text-sm font-medium text-primary-700">
                已选 {visibleSelected} 人
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleBatchAbsent}
                  disabled={batchLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  <UserX className="w-4 h-4" />
                  {batchLoading ? '处理中...' : '批量缺席'}
                </button>
                <button
                  onClick={handleBatchCancel}
                  disabled={batchLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-700 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  <XSquare className="w-4 h-4" />
                  {batchLoading ? '处理中...' : '批量取消'}
                </button>
                <button
                  onClick={() => setSelectedIds(new Set())}
                  className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors"
                >
                  取消选择
                </button>
              </div>
            </div>
          ) : null})()}

          {/* Batch Error */}
          {batchError && (
            <div className="px-4 py-3 bg-red-50 border-b border-red-100 flex items-center justify-between">
              <span className="text-sm text-red-600 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                {batchError}
              </span>
              <button
                onClick={() => setBatchError(null)}
                className="text-red-400 hover:text-red-600"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Select All (only for registered tab) */}
          {activeTab === 'registered' && filteredList.length > 0 && (
            <div className="px-4 py-2.5 border-b border-gray-50 bg-gray-50/50 flex items-center gap-3">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={() => toggleSelectAll(filteredList)}
                className="w-4 h-4 text-primary-500 rounded border-gray-300 focus:ring-primary-400"
              />
              <span className="text-xs text-gray-500">
                {allSelected ? '取消全选' : '全选'}
              </span>
            </div>
          )}

          {/* List */}
          <div className="divide-y divide-gray-50 max-h-[50vh] overflow-y-auto">
            {filteredList.length === 0 ? (
              <div className="py-12 text-center text-gray-400">
                <ListChecks className="w-12 h-12 mx-auto mb-3 opacity-50" />
                {searchQuery ? '没有匹配的搜索结果' : '暂无数据'}
              </div>
            ) : (
              filteredList.map((reg) => (
                <div
                  key={reg.id}
                  className={`p-4 hover:bg-gray-50 transition-colors ${
                    selectedIds.has(reg.id) ? 'bg-primary-50/50' : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {activeTab === 'registered' && (
                      <input
                        type="checkbox"
                        checked={selectedIds.has(reg.id)}
                        onChange={() => toggleSelect(reg.id)}
                        className="w-4 h-4 text-primary-500 rounded border-gray-300 focus:ring-primary-400"
                      />
                    )}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      reg.checkInStatus === 'checked'
                        ? 'bg-green-100 text-green-600'
                        : reg.checkInStatus === 'absent'
                        ? 'bg-red-100 text-red-600'
                        : 'bg-gradient-to-br from-primary-400 to-primary-600 text-white'
                    }`}>
                      {reg.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
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
