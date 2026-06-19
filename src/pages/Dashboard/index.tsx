import { useNavigate } from 'react-router-dom';
import {
  ClipboardCheck,
  MapPin,
  Clock,
  AlertTriangle,
  ChevronRight,
} from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import AreaOccupancy from '../../components/AreaOccupancy';
import StatusBadge from '../../components/StatusBadge';
import { useApplicationStore } from '../../store/useApplicationStore';
import { usePostingStore } from '../../store/usePostingStore';
import { usePosterStore } from '../../store/usePosterStore';
import { useExceptionStore } from '../../store/useExceptionStore';
import { useBulletinBoardStore } from '../../store/useBulletinBoardStore';
import { formatDate, getDaysRemaining } from '../../utils/date';

export default function Dashboard() {
  const navigate = useNavigate();
  const applications = useApplicationStore((state) => state.applications);
  const postingItems = usePostingStore((state) => state.postingItems);
  const exceptions = useExceptionStore((state) => state.exceptions);
  const posters = usePosterStore((state) => state.posters);
  const bulletinBoards = useBulletinBoardStore((state) => state.bulletinBoards);

  const pendingApplications = applications.filter(a => a.status === 'pending').length;
  const pendingPosting = postingItems.filter(p => p.status === 'pending').length;
  const pendingExceptions = exceptions.filter(e => e.status !== 'resolved').length;
  
  const today = new Date();
  const threeDaysLater = new Date();
  threeDaysLater.setDate(today.getDate() + 3);
  const expiringSoon = posters.filter((p) => {
    if (p.status !== 'posted' && p.status !== 'posting') return false;
    const endDate = new Date(p.endDate);
    return endDate >= today && endDate <= threeDaysLater;
  });

  const pendingAuditList = applications.filter(a => a.status === 'pending');
  const pendingPostingList = postingItems.filter(p => p.status === 'pending');
  const exceptionList = exceptions.filter(e => e.status === 'pending');

  const getPosterById = (id: string) => posters.find(p => p.id === id);
  const getApplicationById = (id: string) => applications.find(a => a.id === id);
  const getBulletinBoardById = (id: string) => bulletinBoards.find(b => b.id === id);

  return (
    <div>
      <PageHeader
        title="系统看板"
        description="查看海报管理系统的整体运行情况"
      />

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="待审核申请"
          value={pendingApplications}
          icon={ClipboardCheck}
          color="warning"
          onClick={() => navigate('/audit')}
        />
        <StatCard
          title="待张贴海报"
          value={pendingPosting}
          icon={MapPin}
          color="info"
          onClick={() => navigate('/execution')}
        />
        <StatCard
          title="即将到期"
          value={expiringSoon.length}
          icon={Clock}
          color="primary"
          onClick={() => navigate('/reminders')}
        />
        <StatCard
          title="违规/异常"
          value={pendingExceptions}
          icon={AlertTriangle}
          color="danger"
          onClick={() => navigate('/exceptions')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧列表区域 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 待审核列表 */}
          <div className="bg-white rounded-2xl shadow-card p-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">待审核申请</h3>
              <button
                onClick={() => navigate('/audit')}
                className="flex items-center gap-1 text-sm text-primary-500 hover:text-primary-600 font-medium"
              >
                查看全部 <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              {pendingAuditList.slice(0, 5).map((app, index) => {
                const poster = getPosterById(app.posterId);
                return (
                  <div
                    key={app.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                    style={{ animationDelay: `${0.2 + index * 0.1}s` }}
                    onClick={() => navigate('/audit')}
                  >
                    <div className="flex items-center gap-4">
                      {poster && (
                        <img
                          src={poster.imageUrl}
                          alt={poster.activityName}
                          className="w-12 h-16 object-cover rounded-lg shadow"
                        />
                      )}
                      <div>
                        <p className="font-medium text-gray-900">{poster?.activityName || '未知活动'}</p>
                        <p className="text-sm text-gray-500">申请人: {app.applicant}</p>
                      </div>
                    </div>
                    <StatusBadge status={app.status} type="application" />
                  </div>
                );
              })}
              {pendingAuditList.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  暂无待审核申请
                </div>
              )}
            </div>
          </div>

          {/* 待张贴列表 */}
          <div className="bg-white rounded-2xl shadow-card p-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">待张贴海报</h3>
              <button
                onClick={() => navigate('/execution')}
                className="flex items-center gap-1 text-sm text-primary-500 hover:text-primary-600 font-medium"
              >
                查看全部 <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              {pendingPostingList.slice(0, 5).map((item, index) => {
                const app = getApplicationById(item.applicationId);
                const poster = app ? getPosterById(app.posterId) : null;
                const board = getBulletinBoardById(item.bulletinBoardId);
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                    style={{ animationDelay: `${0.4 + index * 0.1}s` }}
                    onClick={() => navigate('/execution')}
                  >
                    <div className="flex items-center gap-4">
                      {poster && (
                        <img
                          src={poster.imageUrl}
                          alt={poster.activityName}
                          className="w-12 h-16 object-cover rounded-lg shadow"
                        />
                      )}
                      <div>
                        <p className="font-medium text-gray-900">{poster?.activityName || '未知活动'}</p>
                        <p className="text-sm text-gray-500">
                          {board?.name || '未知位置'} · {item.quantity}张
                          {item.needTop && ' · 置顶'}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={item.status} type="posting" />
                  </div>
                );
              })}
              {pendingPostingList.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  暂无待张贴海报
                </div>
              )}
            </div>
          </div>

          {/* 即将到期列表 */}
          <div className="bg-white rounded-2xl shadow-card p-6 animate-slide-up" style={{ animationDelay: '0.5s' }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">即将到期</h3>
              <button
                onClick={() => navigate('/reminders')}
                className="flex items-center gap-1 text-sm text-primary-500 hover:text-primary-600 font-medium"
              >
                查看全部 <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              {expiringSoon.slice(0, 5).map((poster, index) => {
                const daysRemaining = getDaysRemaining(poster.endDate);
                return (
                  <div
                    key={poster.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                    style={{ animationDelay: `${0.6 + index * 0.1}s` }}
                    onClick={() => navigate('/reminders')}
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={poster.imageUrl}
                        alt={poster.activityName}
                        className="w-12 h-16 object-cover rounded-lg shadow"
                      />
                      <div>
                        <p className="font-medium text-gray-900">{poster.activityName}</p>
                        <p className="text-sm text-gray-500">
                          截止: {formatDate(poster.endDate)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`text-sm font-bold ${
                          daysRemaining <= 1 ? 'text-danger' : 'text-warning'
                        }`}
                      >
                        剩余 {daysRemaining} 天
                      </span>
                    </div>
                  </div>
                );
              })}
              {expiringSoon.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  暂无即将到期的海报
                </div>
              )}
            </div>
          </div>

          {/* 违规/异常列表 */}
          <div className="bg-white rounded-2xl shadow-card p-6 animate-slide-up" style={{ animationDelay: '0.7s' }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">违规/异常</h3>
              <button
                onClick={() => navigate('/exceptions')}
                className="flex items-center gap-1 text-sm text-primary-500 hover:text-primary-600 font-medium"
              >
                查看全部 <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              {exceptionList.slice(0, 5).map((exception, index) => {
                const poster = exception.relatedPosterId
                  ? getPosterById(exception.relatedPosterId)
                  : null;
                return (
                  <div
                    key={exception.id}
                    className="flex items-center justify-between p-4 bg-red-50 rounded-xl hover:bg-red-100 transition-colors cursor-pointer"
                    style={{ animationDelay: `${0.8 + index * 0.1}s` }}
                    onClick={() => navigate('/exceptions')}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-danger rounded-full flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          <StatusBadge status={exception.type} type="exceptionType" />
                        </p>
                        <p className="text-sm text-gray-500">{exception.location}</p>
                      </div>
                    </div>
                    <StatusBadge status={exception.status} type="exception" />
                  </div>
                );
              })}
              {exceptionList.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  暂无违规/异常记录
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 右侧区域占用率 */}
        <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <AreaOccupancy />
        </div>
      </div>
    </div>
  );
}
