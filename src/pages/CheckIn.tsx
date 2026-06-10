import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  QrCode,
  Search,
  Users,
  CheckSquare,
  XSquare,
} from 'lucide-react';
import { useAppStore } from '../store/appStore.js';
import type { Registration } from '../../shared/types.js';

export default function CheckInPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { fetchActivity, fetchRegistrations, registrations, activities, checkIn, markAbsent } = useAppStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'checked' | 'absent'>('all');
  const [loading, setLoading] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [scanInput, setScanInput] = useState('');

  useEffect(() => {
    if (id) {
      fetchActivity(id);
      fetchRegistrations(id);
    }
  }, [id, fetchActivity, fetchRegistrations]);

  const activity = activities.find((a) => a.id === id);
  const activityRegs = id ? registrations.get(id) || [] : [];
  const registeredList = activityRegs.filter((r) => r.status === 'registered');

  const filteredList = registeredList.filter((reg) => {
    const matchesSearch =
      reg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.phone.includes(searchQuery) ||
      reg.college.toLowerCase().includes(searchQuery.toLowerCase());

    if (filter === 'all') return matchesSearch;
    if (filter === 'pending') return matchesSearch && reg.checkInStatus === 'pending';
    if (filter === 'checked') return matchesSearch && reg.checkInStatus === 'checked';
    if (filter === 'absent') return matchesSearch && reg.checkInStatus === 'absent';
    return matchesSearch;
  });

  const handleCheckIn = async (regId: string) => {
    if (!id) return;
    setLoading(regId);
    try {
      await checkIn(regId, id);
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setLoading(null);
    }
  };

  const handleMarkAbsent = async (regId: string) => {
    if (!id) return;
    setLoading(regId);
    try {
      await markAbsent(regId, id);
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setLoading(null);
    }
  };

  const handleScan = () => {
    const found = registeredList.find(
      (r) => r.phone === scanInput || r.id === scanInput || r.name === scanInput,
    );
    if (found) {
      if (found.checkInStatus === 'pending') {
        handleCheckIn(found.id);
        setScanInput('');
        setShowScanner(false);
      } else {
        alert('该同学已签到过了');
      }
    } else {
      alert('未找到报名记录');
    }
  };

  const stats = {
    total: registeredList.length,
    checked: registeredList.filter((r) => r.checkInStatus === 'checked').length,
    absent: registeredList.filter((r) => r.checkInStatus === 'absent').length,
    pending: registeredList.filter((r) => r.checkInStatus === 'pending').length,
  };

  const filters = [
    { id: 'all' as const, label: '全部', count: stats.total },
    { id: 'pending' as const, label: '待签到', count: stats.pending },
    { id: 'checked' as const, label: '已签到', count: stats.checked },
    { id: 'absent' as const, label: '缺席', count: stats.absent },
  ];

  const getStatusIcon = (status: Registration['checkInStatus']) => {
    switch (status) {
      case 'checked':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'absent':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
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
      <div className="bg-gradient-to-r from-secondary-500 to-secondary-600 text-white">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold truncate">{activity.title}</h1>
              <p className="text-white/80 text-sm">签到管理</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          <div className="bg-white rounded-2xl p-4 shadow-md text-center">
            <Users className="w-6 h-6 text-gray-400 mx-auto mb-1" />
            <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
            <div className="text-xs text-gray-500">总报名</div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-md text-center">
            <CheckCircle className="w-6 h-6 text-green-500 mx-auto mb-1" />
            <div className="text-2xl font-bold text-green-600">{stats.checked}</div>
            <div className="text-xs text-gray-500">已签到</div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-md text-center">
            <Clock className="w-6 h-6 text-orange-500 mx-auto mb-1" />
            <div className="text-2xl font-bold text-orange-500">{stats.pending}</div>
            <div className="text-xs text-gray-500">待签到</div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-md text-center">
            <XCircle className="w-6 h-6 text-red-500 mx-auto mb-1" />
            <div className="text-2xl font-bold text-red-500">{stats.absent}</div>
            <div className="text-xs text-gray-500">缺席</div>
          </div>
        </div>

        {/* Scan Button */}
        <button
          onClick={() => setShowScanner(!showScanner)}
          className="w-full bg-white rounded-2xl p-4 shadow-md mb-6 flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors"
        >
          <QrCode className="w-6 h-6 text-secondary-500" />
          <span className="font-medium text-gray-700">扫码签到</span>
        </button>

        {/* Scanner Panel */}
        {showScanner && (
          <div className="bg-white rounded-2xl p-6 shadow-md mb-6 animate-fade-in">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <QrCode className="w-5 h-5 text-secondary-500" />
              扫码/搜索签到
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={scanInput}
                onChange={(e) => setScanInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleScan()}
                className="flex-1 input-field"
                placeholder="输入姓名或手机号后按回车签到"
                autoFocus
              />
              <button
                onClick={handleScan}
                className="px-6 py-3 bg-secondary-500 text-white rounded-xl font-medium hover:bg-secondary-600 transition-colors"
              >
                签到
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2">提示：可通过扫码枪扫描二维码，或手动输入姓名/手机号</p>
          </div>
        )}

        {/* Search & Filter */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-secondary-400 focus:ring-4 focus:ring-secondary-100 outline-none transition-all"
                placeholder="搜索姓名、学院、手机号..."
              />
            </div>
            <div className="flex gap-2">
              {filters.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-colors ${
                    filter === f.id
                      ? 'bg-secondary-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {f.label} ({f.count})
                </button>
              ))}
            </div>
          </div>

          {/* List */}
          <div className="divide-y divide-gray-50 max-h-[50vh] overflow-y-auto">
            {filteredList.length === 0 ? (
              <div className="py-12 text-center text-gray-400">
                <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                没有找到匹配的人员
              </div>
            ) : (
              filteredList.map((reg) => (
                <div
                  key={reg.id}
                  className={`p-4 flex items-center gap-4 transition-colors ${
                    reg.checkInStatus === 'checked' ? 'bg-green-50/50' : ''
                  } ${reg.checkInStatus === 'absent' ? 'bg-red-50/50' : ''}`}
                >
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
                    <div className="font-medium text-gray-800">{reg.name}</div>
                    <div className="text-sm text-gray-500">{reg.college} · {reg.phone}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(reg.checkInStatus)}
                    <span className={`text-sm font-medium ${
                      reg.checkInStatus === 'checked' ? 'text-green-600' :
                      reg.checkInStatus === 'absent' ? 'text-red-600' : 'text-gray-400'
                    }`}>
                      {reg.checkInStatus === 'checked' ? '已签到' :
                       reg.checkInStatus === 'absent' ? '缺席' : '待签到'}
                    </span>
                  </div>
                  {loading === reg.id ? (
                    <span className="text-sm text-gray-400">处理中...</span>
                  ) : (
                    <div className="flex gap-1">
                      {reg.checkInStatus !== 'checked' && (
                        <button
                          onClick={() => handleCheckIn(reg.id)}
                          className="p-2 text-green-500 hover:bg-green-100 rounded-lg transition-colors"
                          title="签到"
                        >
                          <CheckSquare className="w-5 h-5" />
                        </button>
                      )}
                      {reg.checkInStatus !== 'absent' && (
                        <button
                          onClick={() => handleMarkAbsent(reg.id)}
                          className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                          title="缺席"
                        >
                          <XSquare className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
