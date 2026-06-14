import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowRightLeft, ArrowUpRight, ArrowDownLeft, CheckCircle, XCircle, Battery, Package, Clock, User, Building, Search } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { StatusBadge } from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import { DEPARTMENTS, CONFERENCE_ROOMS, BORROW_STATUS_LABELS } from '../data/types';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

type TabType = 'borrow' | 'return' | 'records';

export default function BorrowReturn() {
  const location = useLocation();
  const navigate = useNavigate();
  const { remotes, borrowRecords, borrowRemote, returnRemote } = useAppStore();
  
  const initialMode = (location.state as { mode?: string })?.mode || 'borrow';
  const initialRecordId = (location.state as { recordId?: string })?.recordId;
  
  const [activeTab, setActiveTab] = useState<TabType>(initialMode as TabType);
  const [showBorrowModal, setShowBorrowModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedRemote, setSelectedRemote] = useState<string | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<string | null>(initialRecordId || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [overdueOnly, setOverdueOnly] = useState<boolean>(false);
  
  const [borrowForm, setBorrowForm] = useState({
    borrower: '',
    department: DEPARTMENTS[0],
    conferenceRoom: CONFERENCE_ROOMS[0],
    purpose: '',
    borrowTime: '',
    expectedReturn: '',
  });
  
  const [returnForm, setReturnForm] = useState({
    batteryLevel: 80,
    hasDamage: false,
    inOriginalBox: true,
    notes: '',
  });

  useEffect(() => {
    if (initialMode === 'return') {
      setActiveTab('return');
      if (initialRecordId) {
        setSelectedRecord(initialRecordId);
        setShowReturnModal(true);
      }
    }
  }, [initialMode, initialRecordId]);

  const availableRemotes = remotes.filter(r => r.status === 'available');
  const borrowingRecords = borrowRecords.filter(r => r.status === 'borrowing' || r.status === 'overdue');
  
  const filteredRecords = borrowRecords
    .filter(record => {
      const remote = remotes.find(r => r.id === record.remoteId);
      const matchesSearch = 
        record.borrower.includes(searchQuery) ||
        remote?.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.conferenceRoom.includes(searchQuery);
      const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
      const matchesDepartment = departmentFilter === 'all' || record.department === departmentFilter;
      const matchesOverdue = !overdueOnly || record.status === 'overdue';
      return matchesSearch && matchesStatus && matchesDepartment && matchesOverdue;
    })
    .sort((a, b) => new Date(b.borrowTime).getTime() - new Date(a.borrowTime).getTime());

  const overdueCountInFilter = filteredRecords.filter(r => r.status === 'overdue').length;
  const hasActiveFilter = departmentFilter !== 'all' || statusFilter !== 'all' || overdueOnly || searchQuery.trim() !== '';

  const handleBorrow = () => {
    if (!selectedRemote) return;
    if (!borrowForm.borrower.trim()) {
      alert('请输入借用人姓名');
      return;
    }
    if (!borrowForm.purpose.trim()) {
      alert('请输入使用用途');
      return;
    }
    if (!borrowForm.expectedReturn) {
      alert('请选择预计归还时间');
      return;
    }

    borrowRemote(
      selectedRemote,
      borrowForm.borrower,
      borrowForm.department,
      borrowForm.conferenceRoom,
      borrowForm.borrowTime || new Date().toISOString(),
      borrowForm.expectedReturn,
      borrowForm.purpose
    );

    setShowBorrowModal(false);
    setSelectedRemote(null);
    setBorrowForm({
      borrower: '',
      department: DEPARTMENTS[0],
      conferenceRoom: CONFERENCE_ROOMS[0],
      purpose: '',
      borrowTime: '',
      expectedReturn: '',
    });
  };

  const handleReturn = () => {
    if (!selectedRecord) return;

    returnRemote(
      selectedRecord,
      returnForm.batteryLevel,
      returnForm.hasDamage,
      returnForm.inOriginalBox,
      returnForm.notes
    );

    setShowReturnModal(false);
    setSelectedRecord(null);
    setReturnForm({
      batteryLevel: 80,
      hasDamage: false,
      inOriginalBox: true,
      notes: '',
    });
  };

  const openBorrowModal = (remoteId: string) => {
    const remote = remotes.find(r => r.id === remoteId);
    if (remote) {
      setBorrowForm(prev => ({ ...prev, conferenceRoom: remote.conferenceRoom }));
    }
    setSelectedRemote(remoteId);
    setShowBorrowModal(true);
  };

  const openReturnModal = (recordId: string) => {
    setSelectedRecord(recordId);
    setShowReturnModal(true);
  };

  const getBorrowStatusColor = (status: string) => {
    switch (status) {
      case 'borrowing': return 'bg-blue-100 text-blue-800';
      case 'returned': return 'bg-green-100 text-green-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'lost': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getBatteryColor = (level: number) => {
    if (level >= 50) return 'text-green-600';
    if (level >= 20) return 'text-yellow-600';
    return 'text-red-600';
  };

  const minDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  return (
    <div className="space-y-6">
      <div className="animate-fade-in-up">
        <h1 className="text-2xl font-bold text-gray-800 font-display">借还管理</h1>
        <p className="text-gray-500 mt-1">管理遥控器的借用和归还登记</p>
      </div>

      <div className="flex gap-2 p-1 bg-gray-100 rounded-xl p-1 w-fit animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        <button
          onClick={() => setActiveTab('borrow')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all ${
            activeTab === 'borrow'
              ? 'bg-white text-primary-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <ArrowUpRight className="w-4 h-4" />
          我要借用
        </button>
        <button
          onClick={() => setActiveTab('return')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all ${
            activeTab === 'return'
              ? 'bg-white text-primary-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <ArrowDownLeft className="w-4 h-4" />
          我要归还
        </button>
        <button
          onClick={() => setActiveTab('records')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all ${
            activeTab === 'records'
              ? 'bg-white text-primary-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          借用记录
        </button>
      </div>

      {activeTab === 'borrow' && (
        <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <div className="card-base p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">可用遥控器</h2>
                <p className="text-sm text-gray-500">共有 {availableRemotes.length} 个遥控器可借用</p>
              </div>
            </div>

            {availableRemotes.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <CheckCircle className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p>暂无可用遥控器</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableRemotes.map((remote, index) => (
                  <div
                    key={remote.id}
                    className="border border-gray-100 rounded-xl p-4 hover:border-primary-200 hover:bg-primary-50 transition-all"
                    style={{ animationDelay: `${(index + 3) * 50}ms` }}
                  >
                    <div className="flex items-start gap-4">
                      <img
                        src={remote.photoUrl}
                        alt={remote.code}
                        className="w-20 h-20 rounded-xl object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-800">{remote.code}</h3>
                          <StatusBadge status={remote.status} />
                        </div>
                        <p className="text-sm text-gray-600">{remote.conferenceRoom}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          存放: {remote.storageLocation}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Battery className={`w-4 h-4 ${getBatteryColor(remote.batteryLevel)}`} />
                          <span className={`text-sm font-medium ${getBatteryColor(remote.batteryLevel)}`}>
                            {remote.batteryLevel}%
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => openBorrowModal(remote.id)}
                      className="w-full mt-4 btn-primary flex items-center justify-center gap-2"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                      立即借用
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'return' && (
        <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <div className="card-base p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">待归还遥控器</h2>
                <p className="text-sm text-gray-500">共有 {borrowingRecords.length} 个遥控器待归还</p>
              </div>
            </div>

            {borrowingRecords.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <CheckCircle className="w-16 h-16 mx-auto text-green-400 mb-4" />
                <p>所有遥控器均已归还</p>
              </div>
            ) : (
              <div className="space-y-3">
                {borrowingRecords.map((record, index) => {
                  const remote = remotes.find(r => r.id === record.remoteId);
                  const isOverdue = record.status === 'overdue';
                  return (
                    <div
                      key={record.id}
                      className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                        isOverdue
                          ? 'bg-red-50 border border-red-100'
                          : 'bg-gray-50 border border-gray-100'
                      }`}
                      style={{ animationDelay: `${(index + 3) * 50}ms` }}
                    >
                      <img
                        src={remote?.photoUrl}
                        alt={remote?.code}
                        className="w-16 h-16 rounded-xl object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-800">{remote?.code}</h3>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getBorrowStatusColor(record.status)}`}>
                            {BORROW_STATUS_LABELS[record.status as keyof typeof BORROW_STATUS_LABELS]}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-sm">
                          <div className="flex items-center gap-1 text-gray-600">
                            <User className="w-3 h-3" />
                            {record.borrower} ({record.department})
                          </div>
                          <div className="flex items-center gap-1 text-gray-600">
                            <Building className="w-3 h-3" />
                            {record.conferenceRoom}
                          </div>
                          <div className="flex items-center gap-1 text-gray-600">
                            <Clock className="w-3 h-3" />
                            借出: {format(new Date(record.borrowTime), 'M月d日 HH:mm', { locale: zhCN })}
                          </div>
                          <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-600' : 'text-gray-600'}`}>
                            <Clock className="w-3 h-3" />
                            预计: {format(new Date(record.expectedReturn), 'M月d日 HH:mm', { locale: zhCN })}
                          </div>
                        </div>
                        {isOverdue && (
                          <p className="text-xs text-red-600 mt-1">⚠️ 已逾期，请尽快归还</p>
                        )}
                      </div>
                      <button
                        onClick={() => openReturnModal(record.id)}
                        className="btn-primary flex items-center gap-2"
                      >
                        <ArrowDownLeft className="w-4 h-4" />
                        立即归还
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'records' && (
        <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <div className="card-base p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="flex items-center gap-3 flex-wrap">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">全部借用记录</h2>
                  <p className="text-sm text-gray-500">共 {filteredRecords.length} 条记录</p>
                </div>
                {overdueCountInFilter > 0 && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-50 text-red-700 border border-red-200 rounded-full text-xs font-medium">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                    逾期 {overdueCountInFilter} 条
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="搜索借用人、遥控器编号..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">全部部门</option>
                  {DEPARTMENTS.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">全部状态</option>
                  <option value="borrowing">借用中</option>
                  <option value="returned">已归还</option>
                  <option value="overdue">已逾期</option>
                  <option value="lost">已丢失</option>
                </select>
                <label className="inline-flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm cursor-pointer select-none hover:bg-gray-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={overdueOnly}
                    onChange={(e) => setOverdueOnly(e.target.checked)}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-gray-700">只看逾期</span>
                </label>
                {hasActiveFilter && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setStatusFilter('all');
                      setDepartmentFilter('all');
                      setOverdueOnly(false);
                    }}
                    className="px-3 py-2 text-sm text-gray-600 hover:text-primary-700 hover:bg-primary-50 border border-gray-200 rounded-lg transition-colors"
                  >
                    清空筛选
                  </button>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">遥控器</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">借用人</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">会议室</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">借出时间</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">预计归还</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">实际归还</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">状态</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map((record, index) => {
                    const remote = remotes.find(r => r.id === record.remoteId);
                    return (
                      <tr key={record.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img src={remote?.photoUrl} alt="" className="w-10 h-10 rounded-lg object-cover" />
                            <span className="font-medium text-gray-800">{remote?.code}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{record.borrower}</td>
                        <td className="py-3 px-4 text-gray-600">{record.conferenceRoom}</td>
                        <td className="py-3 px-4 text-gray-600 text-sm">
                          {format(new Date(record.borrowTime), 'M月d日 HH:mm', { locale: zhCN })}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {format(new Date(record.expectedReturn), 'M月d日 HH:mm', { locale: zhCN })}
                        </td>
                        <td className="py-3 px-4 text-gray-600 text-sm">
                          {record.actualReturn
                            ? format(new Date(record.actualReturn), 'M月d日 HH:mm', { locale: zhCN })
                            : '-'
                          }
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getBorrowStatusColor(record.status)}`}>
                            {BORROW_STATUS_LABELS[record.status as keyof typeof BORROW_STATUS_LABELS]}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {(record.status === 'borrowing' || record.status === 'overdue') && (
                            <button
                              onClick={() => openReturnModal(record.id)}
                              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                            >
                              归还
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <Modal
        isOpen={showBorrowModal}
        onClose={() => { setShowBorrowModal(false); setSelectedRemote(null); }}
        title="借用登记"
        size="md"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-primary-50 rounded-xl">
            <img
              src={remotes.find(r => r.id === selectedRemote)?.photoUrl}
              alt=""
              className="w-16 h-16 rounded-xl object-cover"
            />
            <div>
              <h3 className="font-semibold text-gray-800">
                {remotes.find(r => r.id === selectedRemote)?.code}
              </h3>
              <p className="text-sm text-gray-600">
                {remotes.find(r => r.id === selectedRemote)?.conferenceRoom}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">借用人姓名 *</label>
              <input
                type="text"
                value={borrowForm.borrower}
                onChange={(e) => setBorrowForm({ ...borrowForm, borrower: e.target.value })}
                placeholder="请输入姓名"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">所属部门</label>
              <select
                value={borrowForm.department}
                onChange={(e) => setBorrowForm({ ...borrowForm, department: e.target.value })}
                className="input-field"
              >
                {DEPARTMENTS.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">使用会议室</label>
              <select
                value={borrowForm.conferenceRoom}
                onChange={(e) => setBorrowForm({ ...borrowForm, conferenceRoom: e.target.value })}
                className="input-field"
              >
                {CONFERENCE_ROOMS.map(room => (
                  <option key={room} value={room}>{room}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">借出时间</label>
              <input
                type="datetime-local"
                value={borrowForm.borrowTime}
                onChange={(e) => setBorrowForm({ ...borrowForm, borrowTime: e.target.value })}
                className="input-field"
              />
              <p className="text-xs text-gray-400 mt-1">留空则默认为当前时间</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">预计归还时间 *</label>
              <input
                type="datetime-local"
                value={borrowForm.expectedReturn}
                onChange={(e) => setBorrowForm({ ...borrowForm, expectedReturn: e.target.value })}
                min={minDateTime()}
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">使用用途 *</label>
            <input
              type="text"
              value={borrowForm.purpose}
              onChange={(e) => setBorrowForm({ ...borrowForm, purpose: e.target.value })}
              placeholder="如: 项目周会、客户演示等"
              className="input-field"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-100">
          <button
            onClick={() => { setShowBorrowModal(false); setSelectedRemote(null); }}
            className="btn-secondary"
          >
            取消
          </button>
          <button
            onClick={handleBorrow}
            className="btn-primary"
          >
            确认借用
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={showReturnModal}
        onClose={() => { setShowReturnModal(false); setSelectedRecord(null); }}
        title="归还检查"
        size="md"
      >
        {(() => {
          const record = borrowRecords.find(r => r.id === selectedRecord);
          const remote = remotes.find(r => r.id === record?.remoteId);
          return (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-accent-50 rounded-xl">
                <img
                  src={remote?.photoUrl}
                  alt=""
                  className="w-16 h-16 rounded-xl object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">{remote?.code}</h3>
                  <p className="text-sm text-gray-600">借用人: {record?.borrower} ({record?.department})</p>
                  <p className="text-xs text-gray-500 mt-1">
                    借出: {record && format(new Date(record.borrowTime), 'M月d日 HH:mm', { locale: zhCN })}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  电池电量检查: {returnForm.batteryLevel}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={returnForm.batteryLevel}
                  onChange={(e) => setReturnForm({ ...returnForm, batteryLevel: parseInt(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0%</span>
                  <span className="text-red-500">需更换电池 {'<'} 20%</span>
                  <span>100%</span>
                </div>
              </div>

              <div className="space-y-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={returnForm.hasDamage}
                    onChange={(e) => setReturnForm({ ...returnForm, hasDamage: e.target.checked })}
                    className="mt-1 w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-700">外壳破损检查</p>
                    <p className="text-xs text-gray-500">勾选表示遥控器外壳有破损或刮痕</p>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={returnForm.inOriginalBox}
                    onChange={(e) => setReturnForm({ ...returnForm, inOriginalBox: e.target.checked })}
                    className="mt-1 w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-700">放回原盒</p>
                    <p className="text-xs text-gray-500">勾选表示已放回原装遥控器收纳盒</p>
                  </div>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">备注说明</label>
                <textarea
                value={returnForm.notes}
                onChange={(e) => setReturnForm({ ...returnForm, notes: e.target.value })}
                placeholder="如有其他情况请备注..."
                rows={2}
                className="input-field resize-none"
              />
              </div>
            </div>
          );
        })()}

        <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-100">
          <button
            onClick={() => { setShowReturnModal(false); setSelectedRecord(null); }}
            className="btn-secondary"
          >
            取消
          </button>
          <button
            onClick={handleReturn}
            className="btn-primary"
          >
            确认归还
          </button>
        </div>
      </Modal>
    </div>
  );
}
