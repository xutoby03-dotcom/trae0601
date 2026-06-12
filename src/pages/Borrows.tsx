import { useEffect, useState } from 'react';
import { Plus, Clock, User, Phone, Calendar, DollarSign, CheckCircle, X, Search, Home } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useAppStore } from '../store/appStore.js';
import { borrowsApi, roomsApi } from '../services/api.js';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import type { Borrow, BorrowForm, ReturnForm } from '../../shared/types.js';

type FilterTab = 'all' | 'borrowed' | 'returned' | 'overdue';

const tabs: { key: FilterTab; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'borrowed', label: '借出中' },
  { key: 'returned', label: '已归还' },
  { key: 'overdue', label: '逾期' },
];

export default function BorrowsPage() {
  const { borrows, fetchBorrows, rooms, fetchRooms, loading } = useAppStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlRoomId = searchParams.get('roomId');
  const urlRoomName = searchParams.get('roomName');
  const urlStatus = searchParams.get('status') as FilterTab | null;
  const [activeTab, setActiveTab] = useState<FilterTab>(urlStatus && ['all', 'borrowed', 'returned', 'overdue'].includes(urlStatus) ? urlStatus : 'all');
  const [searchText, setSearchText] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedBorrow, setSelectedBorrow] = useState<Borrow | null>(null);
  const [formData, setFormData] = useState<BorrowForm>({
    roomId: 0,
    activityName: '',
    borrowerName: '',
    phone: '',
    startTime: '',
    endTime: '',
    depositStatus: 'unpaid',
  });
  const [returnChecks, setReturnChecks] = useState({
    door: false,
    window: false,
    light: false,
    aircon: false,
  });

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  useEffect(() => {
    if (urlStatus && ['all', 'borrowed', 'returned', 'overdue'].includes(urlStatus) && urlStatus !== activeTab) {
      setActiveTab(urlStatus);
    }
  }, [urlStatus]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (activeTab === 'all') {
      fetchBorrows();
    } else {
      fetchBorrows(activeTab);
    }
  }, [activeTab, fetchBorrows]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await borrowsApi.create(formData);
      setShowCreateModal(false);
      fetchBorrows(activeTab === 'all' ? undefined : activeTab);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const openReturnModal = (borrow: Borrow) => {
    setSelectedBorrow(borrow);
    setReturnChecks({ door: false, window: false, light: false, aircon: false });
    setShowReturnModal(true);
  };

  const confirmReturn = async () => {
    if (!selectedBorrow) return;
    try {
      const returnForm: ReturnForm = {
        doorChecked: returnChecks.door,
        windowChecked: returnChecks.window,
        lightChecked: returnChecks.light,
        airconChecked: returnChecks.aircon,
      };
      await borrowsApi.returnBorrow(selectedBorrow.id, returnForm);
      setShowReturnModal(false);
      fetchBorrows(activeTab === 'all' ? undefined : activeTab);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const allChecked = returnChecks.door && returnChecks.window && returnChecks.light && returnChecks.aircon;

  const filteredBorrows = borrows
    .filter((b) => !urlRoomId || b.roomId === Number(urlRoomId))
    .filter(
      (b) =>
        b.borrowerName.includes(searchText) ||
        b.activityName.includes(searchText) ||
        b.roomName.includes(searchText),
    );

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'borrowed':
        return 'bg-amber-100 text-amber-700';
      case 'returned':
        return 'bg-emerald-100 text-emerald-700';
      case 'overdue':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'borrowed':
        return '借出中';
      case 'returned':
        return '已归还';
      case 'overdue':
        return '已逾期';
      default:
        return status;
    }
  };

  const getDepositLabel = (status: string) => {
    switch (status) {
      case 'paid':
        return '已收取';
      case 'unpaid':
        return '未收取';
      case 'refunded':
        return '已退还';
      default:
        return status;
    }
  };

  const getDepositStyle = (status: string) => {
    switch (status) {
      case 'paid':
        return 'text-emerald-600 bg-emerald-50';
      case 'unpaid':
        return 'text-slate-600 bg-slate-50';
      case 'refunded':
        return 'text-slate-500 bg-slate-50';
      default:
        return 'text-slate-600 bg-slate-50';
    }
  };

  const clearRoomFilter = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('roomId');
    newParams.delete('roomName');
    setSearchParams(newParams);
  };

  return (
    <div className="space-y-5">
      {urlRoomName && (
        <div className="flex items-center gap-3 p-4 bg-teal-50 rounded-2xl border border-teal-100">
          <div className="p-2 bg-teal-100 rounded-xl">
            <Home className="w-5 h-5 text-teal-600" />
          </div>
          <div className="flex-1">
            <div className="text-sm text-teal-600 font-medium">当前筛选</div>
            <div className="text-base font-bold text-slate-800">{decodeURIComponent(urlRoomName)}</div>
          </div>
          <button
            onClick={clearRoomFilter}
            className="px-3 py-1.5 text-sm text-slate-600 hover:text-slate-800 hover:bg-white rounded-lg transition-colors"
          >
            清除筛选
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="搜索借用人、活动或房间..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
          />
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 transition-colors shadow-sm shadow-teal-600/20"
        >
          <Plus className="w-5 h-5" />
          新建借用
        </button>
      </div>

      <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveTab(tab.key);
              const newParams = new URLSearchParams(searchParams);
              newParams.set('status', tab.key);
              setSearchParams(newParams);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full" />
        </div>
      ) : filteredBorrows.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-100">
          <Calendar className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500">暂无借用记录</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBorrows.map((borrow) => (
            <div
              key={borrow.id}
              className={`bg-white rounded-2xl p-5 shadow-sm border transition-all hover:shadow-md ${
                borrow.status === 'overdue' ? 'border-red-200' : 'border-slate-100'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-slate-800">{borrow.activityName}</h3>
                  <p className="text-sm text-teal-600 font-medium">{borrow.roomName}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle(borrow.status)}`}
                >
                  {getStatusLabel(borrow.status)}
                </span>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-slate-600">
                  <User className="w-4 h-4 text-slate-400" />
                  <span>{borrow.borrowerName}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span>{borrow.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>
                    {format(new Date(borrow.startTime), 'MM/dd HH:mm', { locale: zhCN })} -{' '}
                    {format(new Date(borrow.endTime), 'MM/dd HH:mm', { locale: zhCN })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-slate-400" />
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${getDepositStyle(borrow.depositStatus)}`}>
                    押金{getDepositLabel(borrow.depositStatus)}
                  </span>
                </div>
              </div>

              {borrow.status === 'borrowed' || borrow.status === 'overdue' ? (
                <button
                  onClick={() => openReturnModal(borrow)}
                  className="w-full mt-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl font-medium hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  归还登记
                </button>
              ) : (
                borrow.returnChecklist && (
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <p className="text-xs text-slate-500 mb-2">归还检查：</p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { key: 'door', label: '门' },
                        { key: 'window', label: '窗' },
                        { key: 'light', label: '灯' },
                        { key: 'aircon', label: '空调' },
                      ].map((item) => (
                        <span
                          key={item.key}
                          className={`text-xs px-2 py-0.5 rounded ${
                            (borrow.returnChecklist as any)[item.key]
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {(borrow.returnChecklist as any)[item.key] ? '✓ ' : '✗ '}
                          {item.label}
                        </span>
                      ))}
                    </div>
                  </div>
                )
              )}
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-slate-800">新建借用登记</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">选择房间</label>
                <select
                  required
                  value={formData.roomId}
                  onChange={(e) => setFormData({ ...formData, roomId: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all bg-white"
                >
                  <option value={0}>请选择房间</option>
                  {rooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.name} ({room.keyNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">活动名称</label>
                <input
                  type="text"
                  required
                  value={formData.activityName}
                  onChange={(e) => setFormData({ ...formData, activityName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
                  placeholder="如：合唱排练"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">借用人</label>
                  <input
                    type="text"
                    required
                    value={formData.borrowerName}
                    onChange={(e) => setFormData({ ...formData, borrowerName: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
                    placeholder="姓名"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">联系电话</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
                    placeholder="手机号"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">开始时间</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">结束时间</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">押金状态</label>
                <div className="flex gap-3">
                  {[
                    { value: 'unpaid', label: '未收取' },
                    { value: 'paid', label: '已收取' },
                  ].map((opt) => (
                    <label
                      key={opt.value}
                      className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition-colors ${
                        formData.depositStatus === opt.value
                          ? 'border-teal-500 bg-teal-50 text-teal-700'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="deposit"
                        value={opt.value}
                        checked={formData.depositStatus === opt.value}
                        onChange={(e) =>
                          setFormData({ ...formData, depositStatus: e.target.value as 'paid' | 'unpaid' })
                        }
                        className="sr-only"
                      />
                      <span className="font-medium">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 transition-colors"
                >
                  确认登记
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showReturnModal && selectedBorrow && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
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
                    onChange={(e) =>
                      setReturnChecks({ ...returnChecks, [item.key]: e.target.checked })
                    }
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
