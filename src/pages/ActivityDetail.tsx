import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Clock,
  Users,
  DollarSign,
  Backpack,
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Settings,
  QrCode,
} from 'lucide-react';
import { useAppStore } from '../store/appStore.js';
import type { RegisterDto } from '../../shared/types.js';

export default function ActivityDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    fetchActivity,
    fetchRegistrations,
    registrations,
    register,
    cancelRegistration,
  } = useAppStore();

  const [activity, setActivity] = useState<Awaited<ReturnType<typeof fetchActivity>>>(undefined);
  const [showForm, setShowForm] = useState(false);
  const [userRegistration, setUserRegistration] = useState<
    ReturnType<typeof registrations.get> extends infer T ? T extends (infer U)[] | undefined ? U | undefined : never : never
  >(undefined);
  const [formData, setFormData] = useState<RegisterDto>({
    name: '',
    college: '',
    phone: '',
    isFirstTime: false,
    remark: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'waitlist'; text: string } | null>(null);

  useEffect(() => {
    if (id) {
      fetchActivity(id).then(setActivity);
      fetchRegistrations(id);
    }
  }, [id, fetchActivity, fetchRegistrations]);

  const activityRegs = id ? registrations.get(id) || [] : [];
  const registeredCount = activityRegs.filter((r) => r.status === 'registered').length;
  const waitlistCount = activityRegs.filter((r) => r.status === 'waitlist').length;
  const isFull = activity ? registeredCount >= activity.maxParticipants : false;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    if (!formData.name || !formData.college || !formData.phone) {
      setMessage({ type: 'error', text: '请填写必填项' });
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      const result = await register(id, formData);
      setUserRegistration(result.registration);
      if (result.isWaitlist) {
        setMessage({ type: 'waitlist', text: `已加入候补，当前排第 ${result.registration.waitlistPosition} 位` });
      } else {
        setMessage({ type: 'success', text: '报名成功！' });
      }
      setShowForm(false);
      fetchRegistrations(id);
      setFormData({ name: '', college: '', phone: '', isFirstTime: false, remark: '' });
    } catch (err) {
      setMessage({ type: 'error', text: (err as Error).message });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!userRegistration || !id) return;
    if (!confirm('确定要取消报名吗？')) return;

    setLoading(true);
    try {
      await cancelRegistration(userRegistration.id, id);
      setUserRegistration(undefined);
      setMessage({ type: 'success', text: '已取消报名' });
      fetchRegistrations(id);
    } catch (err) {
      setMessage({ type: 'error', text: (err as Error).message });
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
      {/* Cover */}
      <div className="relative h-72 md:h-96 overflow-hidden">
        <img
          src={activity.coverImage}
          alt={activity.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute top-4 left-4">
          <Link
            to="/"
            className="flex items-center gap-2 text-white/90 hover:text-white bg-black/30 backdrop-blur-sm px-4 py-2 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            返回
          </Link>
        </div>
        <div className="absolute top-4 right-4 flex gap-2">
          <Link
            to={`/admin/manage/${id}`}
            className="flex items-center gap-2 text-white/90 hover:text-white bg-black/30 backdrop-blur-sm px-4 py-2 rounded-xl transition-colors"
          >
            <Settings className="w-4 h-4" />
            管理
          </Link>
          <Link
            to={`/admin/checkin/${id}`}
            className="flex items-center gap-2 text-white/90 hover:text-white bg-black/30 backdrop-blur-sm px-4 py-2 rounded-xl transition-colors"
          >
            <QrCode className="w-4 h-4" />
            签到
          </Link>
        </div>
        <div className="absolute bottom-6 left-4 right-4">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{activity.title}</h1>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-white/20 backdrop-blur-sm text-white">
              {activity.type === 'lecture' && '讲座'}
              {activity.type === 'boardgame' && '桌游夜'}
              {activity.type === 'photoshoot' && '外拍'}
              {activity.type === 'volunteer' && '志愿服务'}
            </span>
            {activity.requiresApproval && (
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-orange-500/80 backdrop-blur-sm text-white">
                需审核
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-8">
        {/* Info Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <div className="bg-white rounded-2xl p-4 shadow-lg">
            <Clock className="w-6 h-6 text-primary-500 mb-2" />
            <div className="text-sm text-gray-500">时间</div>
            <div className="font-medium text-gray-800 text-sm">
              {new Date(activity.startTime).toLocaleDateString('zh-CN', {
                month: 'short',
                day: 'numeric',
              })}
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-lg">
            <MapPin className="w-6 h-6 text-primary-500 mb-2" />
            <div className="text-sm text-gray-500">地点</div>
            <div className="font-medium text-gray-800 text-sm truncate">{activity.location}</div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-lg">
            <Users className="w-6 h-6 text-primary-500 mb-2" />
            <div className="text-sm text-gray-500">报名</div>
            <div className="font-medium text-gray-800">
              {registeredCount}/{activity.maxParticipants}
              {waitlistCount > 0 && <span className="text-xs text-orange-500"> +{waitlistCount}候</span>}
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-lg">
            <DollarSign className="w-6 h-6 text-primary-500 mb-2" />
            <div className="text-sm text-gray-500">费用</div>
            <div className={`font-medium ${activity.fee === 0 ? 'text-green-500' : 'text-gray-800'}`}>
              {activity.fee === 0 ? '免费' : `¥${activity.fee}`}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Description */}
            <div className="bg-white rounded-2xl p-6 shadow-md">
              <h2 className="text-xl font-bold text-gray-800 mb-4">活动介绍</h2>
              <p className="text-gray-600 leading-relaxed">{activity.description}</p>
            </div>

            {/* Bring Items */}
            {activity.bringItems && (
              <div className="bg-white rounded-2xl p-6 shadow-md">
                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <Backpack className="w-5 h-5 text-primary-500" />
                  需要携带
                </h3>
                <p className="text-gray-600">{activity.bringItems}</p>
              </div>
            )}

            {/* Time Detail */}
            <div className="bg-white rounded-2xl p-6 shadow-md">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary-500" />
                活动时间
              </h3>
              <div className="space-y-2 text-gray-600">
                <div>开始：{formatDateTime(activity.startTime)}</div>
                <div>结束：{formatDateTime(activity.endTime)}</div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Registration Status */}
            <div className="bg-white rounded-2xl p-6 shadow-md sticky top-20">
              {message && (
                <div
                  className={`mb-4 p-3 rounded-xl text-sm flex items-center gap-2 ${
                    message.type === 'success'
                      ? 'bg-green-50 text-green-600'
                      : message.type === 'waitlist'
                      ? 'bg-orange-50 text-orange-600'
                      : 'bg-red-50 text-red-600'
                  }`}
                >
                  {message.type === 'success' && <CheckCircle className="w-4 h-4" />}
                  {message.type === 'waitlist' && <AlertTriangle className="w-4 h-4" />}
                  {message.type === 'error' && <XCircle className="w-4 h-4" />}
                  {message.text}
                </div>
              )}

              {userRegistration ? (
                <div>
                  <div
                    className={`p-4 rounded-xl mb-4 ${
                      userRegistration.status === 'registered'
                        ? 'bg-green-50 border-2 border-green-200'
                        : userRegistration.status === 'waitlist'
                        ? 'bg-orange-50 border-2 border-orange-200'
                        : 'bg-gray-50 border-2 border-gray-200'
                    }`}
                  >
                    <div className="font-medium text-gray-800 mb-1">
                      {userRegistration.status === 'registered' && '✓ 报名成功'}
                      {userRegistration.status === 'waitlist' && '⏳ 候补中'}
                      {userRegistration.status === 'cancelled' && '✗ 已取消'}
                    </div>
                    {userRegistration.status === 'waitlist' && (
                      <div className="text-sm text-orange-600">
                        候补第 {userRegistration.waitlistPosition} 位
                      </div>
                    )}
                    {userRegistration.promotedFromWaitlist && (
                      <div className="text-xs text-green-600 mt-1">由候补转正</div>
                    )}
                  </div>
                  {userRegistration.status !== 'cancelled' && (
                    <button
                      onClick={handleCancel}
                      disabled={loading}
                      className="w-full py-3 rounded-xl border-2 border-red-300 text-red-500 font-medium hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      {loading ? '处理中...' : '取消报名'}
                    </button>
                  )}
                </div>
              ) : showForm ? (
                <form onSubmit={handleRegister} className="space-y-4">
                  <h3 className="font-bold text-gray-800">报名信息</h3>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">姓名 *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="input-field"
                      placeholder="请输入姓名"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">学院 *</label>
                    <input
                      type="text"
                      value={formData.college}
                      onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                      className="input-field"
                      placeholder="请输入学院"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">手机号 *</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="input-field"
                      placeholder="请输入手机号"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isFirstTime"
                      checked={formData.isFirstTime}
                      onChange={(e) => setFormData({ ...formData, isFirstTime: e.target.checked })}
                      className="w-4 h-4 text-primary-500 rounded"
                    />
                    <label htmlFor="isFirstTime" className="text-sm text-gray-600">
                      第一次参加
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">备注</label>
                    <textarea
                      value={formData.remark}
                      onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
                      className="input-field resize-none"
                      rows={3}
                      placeholder="有什么想告诉组织者的..."
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                    >
                      取消
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 btn-primary disabled:opacity-50"
                    >
                      {loading ? '提交中...' : isFull ? '加入候补' : '立即报名'}
                    </button>
                  </div>
                </form>
              ) : (
                <div>
                  {isFull && (
                    <div className="bg-orange-50 text-orange-600 p-3 rounded-xl text-sm mb-4 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      活动已满员，可加入候补
                    </div>
                  )}
                  <button
                    onClick={() => setShowForm(true)}
                    className="w-full btn-primary"
                  >
                    {isFull ? '加入候补' : '我要报名'}
                  </button>
                  <p className="text-xs text-gray-400 text-center mt-3">
                    报名后可在此页面查看状态和取消
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
