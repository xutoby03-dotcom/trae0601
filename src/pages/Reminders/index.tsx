import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  AlertTriangle,
  CheckCircle,
  Eye,
  Trash2,
  Filter,
  Calendar,
  MapPin,
} from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import StatCard from '../../components/StatCard';
import Empty from '../../components/Empty';
import { usePosterStore } from '../../store/usePosterStore';
import { usePostingStore } from '../../store/usePostingStore';
import { useApplicationStore } from '../../store/useApplicationStore';
import { formatDate, getDaysRemaining } from '../../utils/date';
import { AREAS } from '../../types';
import type { Poster } from '../../types';

export default function Reminders() {
  const navigate = useNavigate();
  const posters = usePosterStore((state) => state.posters);
  const updateStatus = usePosterStore((state) => state.updateStatus);
  const { postingItems, confirmRemoval } = usePostingStore();
  const applications = useApplicationStore((state) => state.applications);

  const today = new Date();
  const threeDaysLater = new Date();
  threeDaysLater.setDate(today.getDate() + 3);
  
  const expiringSoon = useMemo(() => {
    return posters.filter((p) => {
      if (p.status !== 'posted' && p.status !== 'posting') return false;
      const endDate = new Date(p.endDate);
      return endDate >= today && endDate <= threeDaysLater;
    });
  }, [posters]);

  const expired = useMemo(() => {
    return posters.filter((p) => {
      const endDate = new Date(p.endDate);
      return endDate < today && p.status !== 'removed';
    });
  }, [posters]);

  const getApplicationsByPosterId = (posterId: string) => {
    return applications.filter(a => a.posterId === posterId);
  };
  const [selectedArea, setSelectedArea] = useState<string>('all');
  const [expandedSection, setExpandedSection] = useState<'expiring' | 'expired'>('expiring');

  const removedCount = useMemo(() => {
    return posters.filter((p) => p.status === 'removed').length;
  }, [posters]);

  const filteredExpiringSoon = useMemo(() => {
    if (selectedArea === 'all') return expiringSoon;
    return expiringSoon.filter((p) => p.area === selectedArea);
  }, [expiringSoon, selectedArea]);

  const filteredExpired = useMemo(() => {
    if (selectedArea === 'all') return expired;
    return expired.filter((p) => p.area === selectedArea);
  }, [expired, selectedArea]);

  const getDaysColorClass = (days: number): string => {
    if (days <= 1) return 'text-red-600 bg-red-50 border-red-200';
    if (days <= 3) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getDaysText = (days: number): string => {
    if (days < 0) return `已过期 ${Math.abs(days)} 天`;
    if (days === 0) return '今天到期';
    if (days === 1) return '剩余 1 天';
    return `剩余 ${days} 天`;
  };

  const handleConfirmRemoval = (poster: Poster) => {
    if (!confirm(`确定要撤下海报「${poster.activityName}」吗？`)) {
      return;
    }

    const relatedApplications = getApplicationsByPosterId(poster.id);
    const relatedApplicationIds = relatedApplications.map((app) => app.id);

    const relatedPostingItems = postingItems.filter((item) =>
      relatedApplicationIds.includes(item.applicationId)
    );

    relatedPostingItems.forEach((item) => {
      if (item.status !== 'removed') {
        confirmRemoval(item.id);
      }
    });

    updateStatus(poster.id, 'removed');
  };

  const handleViewDetail = (posterId: string) => {
    navigate(`/posters/${posterId}`);
  };

  const renderPosterCard = (poster: Poster, index: number, isExpired: boolean) => {
    const daysRemaining = getDaysRemaining(poster.endDate);
    const colorClass = isExpired
      ? 'text-red-600 bg-red-50 border-red-200'
      : getDaysColorClass(daysRemaining);
    const daysText = isExpired ? getDaysText(daysRemaining) : getDaysText(daysRemaining);

    return (
      <div
        key={poster.id}
        className={`bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden group animate-slide-up ${
          isExpired ? 'border-l-4 border-red-500' : 'border-l-4 border-orange-500'
        }`}
        style={{ animationDelay: `${index * 0.05}s` }}
      >
        <div className="flex flex-col sm:flex-row">
          <div className="sm:w-32 h-40 sm:h-auto flex-shrink-0 relative overflow-hidden">
            <img
              src={poster.imageUrl}
              alt={poster.activityName}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute top-2 left-2">
              <StatusBadge status={poster.status} type="poster" />
            </div>
          </div>

          <div className="flex-1 p-4 flex flex-col">
            <div className="flex items-start justify-between gap-4 mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 text-lg truncate">
                  {poster.activityName}
                </h3>
                <p className="text-sm text-gray-500 mb-2">{poster.club}</p>
              </div>
              <div
                className={`flex-shrink-0 px-3 py-1.5 rounded-full border text-sm font-bold ${colorClass}`}
              >
                {daysText}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm mb-4">
              <div className="flex items-center gap-1.5 text-gray-500">
                <Calendar className="w-4 h-4" />
                <span className="truncate">
                  {formatDate(poster.startDate)} - {formatDate(poster.endDate)}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-500">
                <MapPin className="w-4 h-4" />
                <span className="truncate">{poster.area}</span>
              </div>
            </div>

            <div className="mt-auto flex items-center justify-between pt-3 border-t border-gray-100">
              <span className="text-xs text-gray-400 font-mono">
                {poster.approvalNumber}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleViewDetail(poster.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  详情
                </button>
                <button
                  onClick={() => handleConfirmRemoval(poster)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  确认撤下
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <PageHeader
        title="到期提醒"
        description="管理即将到期和已过期的海报，及时进行撤下处理"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="即将到期"
          value={filteredExpiringSoon.length}
          icon={Clock}
          color="warning"
          onClick={() => setExpandedSection('expiring')}
        />
        <StatCard
          title="已过期"
          value={filteredExpired.length}
          icon={AlertTriangle}
          color="danger"
          onClick={() => setExpandedSection('expired')}
        />
        <StatCard
          title="已撤下"
          value={removedCount}
          icon={CheckCircle}
          color="success"
        />
      </div>

      <div className="bg-white rounded-2xl shadow-card p-6 mb-6 animate-fade-in">
        <div className="flex items-center gap-3">
          <Filter className="w-5 h-5 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">按区域筛选：</span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedArea('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                selectedArea === 'all'
                  ? 'bg-primary-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              全部区域
            </button>
            {AREAS.map((area) => (
              <button
                key={area}
                onClick={() => setSelectedArea(area)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedArea === area
                    ? 'bg-primary-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {area}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="animate-fade-in">
          <div
            className="flex items-center justify-between cursor-pointer mb-4"
            onClick={() => setExpandedSection(expandedSection === 'expiring' ? 'expired' : 'expiring')}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">即将到期</h2>
                <p className="text-sm text-gray-500">3天内到期的海报</p>
              </div>
              <span className="ml-2 px-2.5 py-0.5 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                {filteredExpiringSoon.length} 张
              </span>
            </div>
            <span
              className={`text-gray-400 transition-transform duration-200 ${
                expandedSection === 'expiring' ? 'rotate-180' : ''
              }`}
            >
              ▼
            </span>
          </div>

          {expandedSection === 'expiring' && (
            <div className="space-y-4">
              {filteredExpiringSoon.map((poster, index) =>
                renderPosterCard(poster, index, false)
              )}
              {filteredExpiringSoon.length === 0 && (
                <div className="bg-white rounded-2xl shadow-card p-8">
                  <Empty
                    icon={
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-8 h-8 text-green-500" />
                      </div>
                    }
                    title="暂无即将到期的海报"
                    description="所有海报都在有效期内"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div
            className="flex items-center justify-between cursor-pointer mb-4"
            onClick={() => setExpandedSection(expandedSection === 'expired' ? 'expiring' : 'expired')}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">已过期</h2>
                <p className="text-sm text-gray-500">超过有效期但尚未撤下的海报</p>
              </div>
              <span className="ml-2 px-2.5 py-0.5 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                {filteredExpired.length} 张
              </span>
            </div>
            <span
              className={`text-gray-400 transition-transform duration-200 ${
                expandedSection === 'expired' ? 'rotate-180' : ''
              }`}
            >
              ▼
            </span>
          </div>

          {expandedSection === 'expired' && (
            <div className="space-y-4">
              {filteredExpired.map((poster, index) =>
                renderPosterCard(poster, index, true)
              )}
              {filteredExpired.length === 0 && (
                <div className="bg-white rounded-2xl shadow-card p-8">
                  <Empty
                    icon={
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-8 h-8 text-green-500" />
                      </div>
                    }
                    title="暂无已过期的海报"
                    description="所有过期海报都已处理完毕"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
