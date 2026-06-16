import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Shield,
  History,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Calendar,
  LogOut,
} from 'lucide-react';
import { useAuthStore } from '../store/auth';
import { bookingApi } from '../lib/api';
import { useToast } from '../components/Toast';
import { Booking } from '../../shared/types';
import {
  formatDate,
  formatTimeRange,
  getStatusText,
  getStatusColor,
} from '../utils/time';

export default function Profile() {
  const { user, logout } = useAuthStore();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const result = await bookingApi.getMy();
      if (result.success && result.data) {
        setBookings(result.data);
      }
    } catch {
      showToast('error', '加载记录失败');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (confirm('确定要退出登录吗？')) {
      logout();
      navigate('/login');
    }
  };

  if (!user) return null;

  const stats = {
    total: bookings.length,
    completed: bookings.filter((b) => b.status === 'completed').length,
    noShows: bookings.filter((b) => b.status === 'no_show').length,
    cleanupPending: bookings.filter((b) => b.status === 'completed' && !b.cleanupConfirmed).length,
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-50 border-emerald-200';
    if (score >= 60) return 'bg-amber-50 border-amber-200';
    return 'bg-red-50 border-red-200';
  };

  const recentBookings = bookings.slice(0, 5);
  const noShowRecords = bookings.filter((b) => b.status === 'no_show');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
              <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold text-teal-700">
                  {user.name.charAt(0)}
                </span>
              </div>
              <h1 className="text-xl font-bold text-gray-900 mb-1">{user.name}</h1>
              <p className="text-gray-500 mb-1">工号：{user.employeeId}</p>
              <span className={`inline-block text-xs px-2 py-1 rounded-full ${
                user.role === 'admin'
                  ? 'bg-orange-100 text-orange-700'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {user.role === 'admin' ? '行政管理员' : '员工'}
              </span>
            </div>

            <div className={`bg-white rounded-2xl shadow-sm p-6 border-2 ${getScoreBgColor(user.creditScore)}`}>
              <div className="flex items-center gap-2 mb-4">
                <Shield className={`w-5 h-5 ${getScoreColor(user.creditScore)}`} />
                <h2 className="text-lg font-semibold text-gray-900">信用分</h2>
              </div>
              <div className="text-center">
                <div className={`text-5xl font-bold mb-2 ${getScoreColor(user.creditScore)}`}>
                  {user.creditScore}
                </div>
                <p className="text-sm text-gray-500">
                  {user.creditScore >= 80
                    ? '信用优秀'
                    : user.creditScore >= 60
                    ? '信用良好'
                    : '信用较低'}
                </p>
                {user.creditScore < 60 && (
                  <p className="text-xs text-red-600 mt-2">
                    低于60分将无法预约，请减少爽约行为
                  </p>
                )}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      user.creditScore >= 80
                        ? 'bg-emerald-500'
                        : user.creditScore >= 60
                        ? 'bg-amber-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${user.creditScore}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>0</span>
                  <span>60</span>
                  <span>100</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-2xl shadow-sm p-4 text-center">
                <Calendar className="w-6 h-6 text-teal-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                <div className="text-xs text-gray-500">总预约</div>
              </div>
              <div className="bg-white rounded-2xl shadow-sm p-4 text-center">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{stats.completed}</div>
                <div className="text-xs text-gray-500">已完成</div>
              </div>
              <div className="bg-white rounded-2xl shadow-sm p-4 text-center">
                <XCircle className="w-6 h-6 text-red-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{stats.noShows}</div>
                <div className="text-xs text-gray-500">爽约</div>
              </div>
              <div className="bg-white rounded-2xl shadow-sm p-4 text-center">
                <AlertTriangle className="w-6 h-6 text-amber-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{stats.cleanupPending}</div>
                <div className="text-xs text-gray-500">待清洁</div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              退出登录
            </button>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <History className="w-5 h-5 text-teal-600" />
                最近预约
              </h2>
              {loading ? (
                <div className="text-center py-8 text-gray-400">
                  <div className="animate-spin w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full mx-auto mb-2" />
                  <p className="text-sm">加载中...</p>
                </div>
              ) : recentBookings.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>暂无预约记录</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
                          <span className="text-sm font-bold text-teal-700">
                            {booking.chairNumber.slice(-3)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {booking.chairNumber}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatDate(booking.date)} {formatTimeRange(booking.startTime, booking.endTime)}
                          </p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                        {getStatusText(booking.status)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              {bookings.length > 5 && (
                <button
                  onClick={() => navigate('/my-bookings')}
                  className="w-full mt-4 text-center text-sm text-teal-600 hover:text-teal-700 font-medium"
                >
                  查看全部 →
                </button>
              )}
            </div>

            {noShowRecords.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-red-100">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  爽约记录
                </h2>
                <div className="space-y-2">
                  {noShowRecords.map((booking) => (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between p-3 bg-red-50 rounded-lg"
                    >
                      <div className="text-sm">
                        <span className="font-medium text-gray-900">
                          {booking.chairNumber}
                        </span>
                        <span className="text-gray-500 ml-2">
                          {formatDate(booking.date)} {booking.startTime}
                        </span>
                      </div>
                      <span className="text-xs text-red-600 font-medium">-10分</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
