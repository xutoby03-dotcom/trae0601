import React, { useEffect, useState } from 'react';
import {
  Search,
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  X,
  Check,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { CourseCard } from '../components/CourseCard';
import { Modal } from '../components/Modal';
import { ApplicationForm } from '../components/ApplicationForm';
import type { CourseWithQuota, Application } from '../types';
import { statusLabels, statusColors } from '../types';
import { formatDateTime } from '../utils/helpers';

type TabKey = 'apply' | 'status';

export const ApplyPage: React.FC = () => {
  const {
    courses,
    applications,
    loading,
    error,
    fetchCourses,
    fetchApplications,
    submitApplication,
    cancelApplication,
    setError,
  } = useStore();

  const [activeTab, setActiveTab] = useState<TabKey>('apply');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<CourseWithQuota | null>(null);
  const [showSuccess, setShowSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchCourses();
    fetchApplications();
  }, [fetchCourses, fetchApplications]);

  const today = new Date().toISOString().split('T')[0];

  const availableCourses = courses.filter((course) => {
    const matchesSearch =
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.teacher.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = !dateFilter || course.date === dateFilter;
    const isUpcoming = course.date >= today;
    return matchesSearch && matchesDate && isUpcoming;
  });

  const handleApply = (course: CourseWithQuota) => {
    setSelectedCourse(course);
    setShowApplyModal(true);
  };

  const handleSubmit = async (data: any) => {
    try {
      const app = await submitApplication(data);
      setShowApplyModal(false);
      setSelectedCourse(null);
      if (app.status === 'waitlist') {
        setShowSuccess('已加入候补队列！');
      } else if (app.status === 'pending_approval') {
        setShowSuccess('申请已提交，等待老师审批！');
      } else {
        setShowSuccess('申请成功！座位已预订。');
      }
      setTimeout(() => setShowSuccess(null), 3000);
    } catch (e) {
      console.error('Submit failed:', e);
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await cancelApplication(id);
    } catch (e) {
      console.error('Cancel failed:', e);
    }
  };

  const getStatusIcon = (status: Application['status']) => {
    switch (status) {
      case 'approved':
      case 'checked_in':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
      case 'cancelled':
      case 'no_show':
        return <XCircle className="w-4 h-4" />;
      case 'pending_approval':
      case 'waitlist':
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('apply')}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors -mb-px ${
            activeTab === 'apply'
              ? 'border-slate-700 text-slate-800'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          申请旁听
        </button>
        <button
          onClick={() => setActiveTab('status')}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors -mb-px ${
            activeTab === 'status'
              ? 'border-slate-700 text-slate-800'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          申请状态 ({applications.length})
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
            关闭
          </button>
        </div>
      )}

      {showSuccess && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5" />
            {showSuccess}
          </div>
          <button onClick={() => setShowSuccess(null)} className="text-green-500 hover:text-green-700">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {activeTab === 'apply' ? (
        <>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="搜索课程名称、老师..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-slate-400" />
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-72 bg-white rounded-xl border border-slate-100 animate-pulse"
                />
              ))}
            </div>
          ) : availableCourses.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-slate-100">
              <p className="text-slate-500">暂无可申请的课程</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableCourses.map((course) => (
                <div key={course.id} className="relative">
                  <CourseCard course={course} onClick={() => handleApply(course)} />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleApply(course);
                    }}
                    className="absolute bottom-20 right-5 px-4 py-2 bg-slate-700 text-white text-sm rounded-lg hover:bg-slate-800 transition-colors shadow-lg"
                  >
                    {course.usedQuota >= course.auditorQuota ? '加入候补' : '申请旁听'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
          {applications.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-slate-500">暂无申请记录</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {applications.map((app) => {
                const course = courses.find((c) => c.id === app.courseId);
                return (
                  <div key={app.id} className="p-5 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-medium text-slate-800">
                            {course?.name || '未知课程'}
                          </h4>
                          <span
                            className={`px-2 py-0.5 text-xs rounded-full flex items-center gap-1 ${statusColors[app.status]}`}
                          >
                            {getStatusIcon(app.status)}
                            {statusLabels[app.status]}
                            {app.waitlistPosition && ` #${app.waitlistPosition}`}
                          </span>
                        </div>
                        <div className="text-sm text-slate-600 space-y-1">
                          <p>👤 {app.studentName} · {app.className}</p>
                          <p className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            提交时间: {formatDateTime(app.createdAt)}
                          </p>
                          {app.seatId && (
                            <p>💺 座位: {app.seatId.replace('seat-', '').replace(/-(\d+)$/, '排$1座')}</p>
                          )}
                        </div>
                      </div>
                      {(app.status === 'approved' ||
                        app.status === 'pending_approval' ||
                        app.status === 'waitlist') && (
                        <button
                          onClick={() => handleCancel(app.id)}
                          className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          撤销申请
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {selectedCourse && (
        <Modal
          isOpen={showApplyModal}
          onClose={() => {
            setShowApplyModal(false);
            setSelectedCourse(null);
          }}
          title="旁听申请"
          size="lg"
        >
          <ApplicationForm
            course={selectedCourse}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowApplyModal(false);
              setSelectedCourse(null);
            }}
            isLoading={loading}
          />
        </Modal>
      )}
    </div>
  );
};
