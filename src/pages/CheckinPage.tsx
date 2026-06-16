import React, { useEffect, useState } from 'react';
import {
  Search,
  Check,
  X,
  UserCheck,
  UserX,
  Clock,
  ListTodo,
  AlertTriangle,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { SeatMap } from '../components/SeatMap';
import { Modal } from '../components/Modal';
import type { CourseWithQuota, Application, Seat } from '../types';
import { statusLabels, statusColors } from '../types';
import { formatDate, getRiskLevel, calculateAisleRisk } from '../utils/helpers';

export const CheckinPage: React.FC = () => {
  const {
    courses,
    applications,
    loading,
    error,
    fetchCourses,
    fetchApplications,
    approveApplication,
    rejectApplication,
    checkInApplication,
    releaseApplication,
    fetchCourseStatistics,
    courseStatistics,
    setError,
  } = useStore();

  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [showSeatModal, setShowSeatModal] = useState(false);
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCourses();
    fetchApplications();
  }, [fetchCourses, fetchApplications]);

  useEffect(() => {
    if (selectedCourseId) {
      fetchCourseStatistics(selectedCourseId);
    }
  }, [selectedCourseId, fetchCourseStatistics]);

  const selectedCourse = courses.find((c) => c.id === selectedCourseId);
  const courseApps = applications.filter((a) => a.courseId === selectedCourseId);
  const pendingApproval = courseApps.filter((a) => a.status === 'pending_approval');
  const approved = courseApps
    .filter((a) => a.status === 'approved' || a.status === 'checked_in')
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  const waitlist = courseApps
    .filter((a) => a.status === 'waitlist')
    .sort(
      (a, b) =>
        (a.waitlistPosition || 0) - (b.waitlistPosition || 0)
    );
  const checkedIn = courseApps.filter((a) => a.status === 'checked_in');

  const stats = selectedCourseId
    ? courseStatistics.get(selectedCourseId)
    : null;

  const riskScore = selectedCourse ? calculateAisleRisk(selectedCourse) : 0;
  const risk = getRiskLevel(riskScore);

  const handleCourseSelect = (course: CourseWithQuota) => {
    setSelectedCourseId(course.id);
    setShowSeatModal(false);
  };

  const handleSeatClick = (seat: Seat) => {
    setSelectedSeat(seat);
    setShowSeatModal(true);
  };

  const handleApprove = async (id: string) => {
    try {
      await approveApplication(id);
    } catch (e) {
      console.error('Approve failed:', e);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await rejectApplication(id);
    } catch (e) {
      console.error('Reject failed:', e);
    }
  };

  const handleCheckIn = async (id: string) => {
    try {
      await checkInApplication(id);
      setShowSeatModal(false);
      setSelectedSeat(null);
    } catch (e) {
      console.error('Check-in failed:', e);
    }
  };

  const handleRelease = async (id: string) => {
    try {
      await releaseApplication(id);
      setShowSeatModal(false);
      setSelectedSeat(null);
    } catch (e) {
      console.error('Release failed:', e);
    }
  };

  const getSeatApplication = (seat: Seat) => {
    return applications.find(
      (a) => a.courseId === selectedCourseId && a.seatId === seat.id
    );
  };

  const filteredCourses = courses.filter((course) => {
    if (!searchTerm) return true;
    return (
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.teacher.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">签到管理</h1>
        <p className="text-sm text-slate-500 mt-1">
          管理课程签到、审批申请和处理候补座位
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
            关闭
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="搜索课程..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                onClick={() => handleCourseSelect(course)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedCourseId === course.id
                    ? 'bg-slate-700 text-white border-slate-700'
                    : 'bg-white border-slate-100 hover:border-slate-300'
                }`}
              >
                <h4
                  className={`font-medium ${
                    selectedCourseId === course.id ? 'text-white' : 'text-slate-800'
                  }`}
                >
                  {course.name}
                </h4>
                <p
                  className={`text-sm mt-1 ${
                    selectedCourseId === course.id
                      ? 'text-slate-300'
                      : 'text-slate-500'
                  }`}
                >
                  {course.classroom}
                </p>
                <p
                  className={`text-sm ${
                    selectedCourseId === course.id
                      ? 'text-slate-300'
                      : 'text-slate-500'
                  }`}
                >
                  {formatDate(course.date)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-3 space-y-6">
          {!selectedCourse ? (
            <div className="text-center py-16 bg-white rounded-xl border border-slate-100">
              <p className="text-slate-500">请从左侧选择课程</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-5 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <UserCheck className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-800">
                        {checkedIn.length}/{approved.length}
                      </p>
                      <p className="text-xs text-slate-500">已签到</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-5 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <ListTodo className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-800">
                        {approved.length - checkedIn.length}
                      </p>
                      <p className="text-xs text-slate-500">待签到</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-5 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 rounded-lg">
                      <Clock className="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-800">
                        {pendingApproval.length}
                      </p>
                      <p className="text-xs text-slate-500">待审批</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-5 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <AlertTriangle className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-800">
                        {waitlist.length}
                      </p>
                      <p className="text-xs text-slate-500">候补中</p>
                    </div>
                  </div>
                </div>
              </div>

              {pendingApproval.length > 0 && (
                <div className="bg-white rounded-xl p-5 border border-slate-100">
                  <h3 className="font-medium text-slate-800 mb-4">待审批申请</h3>
                  <div className="space-y-3">
                    {pendingApproval.map((app) => (
                      <div
                        key={app.id}
                        className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-slate-800">
                            {app.studentName}
                          </p>
                          <p className="text-sm text-slate-600">
                            {app.className} · {app.reason}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove(app.id)}
                            disabled={loading}
                            className="px-3 py-1.5 text-sm text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors flex items-center gap-1"
                          >
                            <Check className="w-4 h-4" />
                            通过
                          </button>
                          <button
                            onClick={() => handleReject(app.id)}
                            disabled={loading}
                            className="px-3 py-1.5 text-sm text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center gap-1"
                          >
                            <X className="w-4 h-4" />
                            拒绝
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-slate-800">座位图</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${risk.color} flex items-center gap-1`}>
                    <AlertTriangle className="w-3 h-3" />
                    过道风险: {risk.level} ({riskScore}%)
                  </span>
                </div>
                <SeatMap
                  course={selectedCourse}
                  interactive
                  onSeatClick={handleSeatClick}
                />
              </div>

              {stats && (
                <div className="bg-white rounded-xl p-5 border border-slate-100">
                  <h3 className="font-medium text-slate-800 mb-4">
                    申请列表
                  </h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {approved.map((app) => (
                      <div
                        key={app.id}
                        className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-sm font-medium text-slate-600">
                            {app.studentName[0]}
                          </div>
                          <div>
                            <p className="font-medium text-slate-800">
                              {app.studentName}
                            </p>
                            <p className="text-xs text-slate-500">
                              {app.className}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className={`px-2 py-0.5 text-xs rounded-full ${statusColors[app.status]}`}
                          >
                            {statusLabels[app.status]}
                          </span>
                          {app.status === 'approved' && (
                            <button
                              onClick={() => handleCheckIn(app.id)}
                              disabled={loading}
                              className="px-3 py-1 text-xs text-white bg-slate-700 hover:bg-slate-800 rounded-lg transition-colors"
                            >
                              签到
                            </button>
                          )}
                          {app.status === 'approved' && (
                            <button
                              onClick={() => handleRelease(app.id)}
                              disabled={loading}
                              className="px-3 py-1 text-xs text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <UserX className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {waitlist.length > 0 && (
                <div className="bg-white rounded-xl p-5 border border-slate-100">
                  <h3 className="font-medium text-slate-800 mb-4">
                    候补队列 ({waitlist.length})
                  </h3>
                  <div className="space-y-2">
                    {waitlist.map((app, index) => (
                      <div
                        key={app.id}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-sm font-bold text-orange-600">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-slate-800">
                              {app.studentName}
                            </p>
                            <p className="text-xs text-slate-500">
                              {app.className}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs text-slate-500">
                          预计到场: {app.arrivalTime}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {selectedSeat && (
        <Modal
          isOpen={showSeatModal}
          onClose={() => {
            setShowSeatModal(false);
            setSelectedSeat(null);
          }}
          title="座位详情"
          size="md"
        >
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-xl">
              <p className="font-medium text-slate-800">
                第{selectedSeat.row + 1}排 第{selectedSeat.col + 1}座
              </p>
              <p className="text-sm text-slate-600 mt-1">
                类型: {selectedSeat.type === 'auditor' ? '旁听座位' : selectedSeat.type === 'fixed' ? '固定座位' : '过道'}
              </p>
              {selectedSeat.hasOutlet && (
                <p className="text-sm text-slate-600">有电源插座</p>
              )}
            </div>

            {getSeatApplication(selectedSeat) ? (
              <>
                <div className="border-t border-slate-100 pt-4">
                  <h4 className="font-medium text-slate-800 mb-3">
                    申请信息
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="text-slate-500">学生姓名:</span>{' '}
                      {getSeatApplication(selectedSeat)?.studentName}
                    </p>
                    <p>
                      <span className="text-slate-500">班级:</span>{' '}
                      {getSeatApplication(selectedSeat)?.className}
                    </p>
                    <p>
                      <span className="text-slate-500">申请原因:</span>{' '}
                      {getSeatApplication(selectedSeat)?.reason}
                    </p>
                    <p>
                      <span className="text-slate-500">状态:</span>{' '}
                      <span
                        className={`px-2 py-0.5 text-xs rounded-full ${statusColors[getSeatApplication(selectedSeat)!.status]}`}
                      >
                        {statusLabels[getSeatApplication(selectedSeat)!.status]}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  {getSeatApplication(selectedSeat)?.status === 'approved' && (
                    <>
                      <button
                        onClick={() => handleCheckIn(getSeatApplication(selectedSeat)!.id)}
                        disabled={loading}
                        className="px-4 py-2 text-sm text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors flex items-center gap-2"
                      >
                        <UserCheck className="w-4 h-4" />
                        确认签到
                      </button>
                      <button
                        onClick={() => handleRelease(getSeatApplication(selectedSeat)!.id)}
                        disabled={loading}
                        className="px-4 py-2 text-sm text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center gap-2"
                      >
                        <UserX className="w-4 h-4" />
                        标记未到
                      </button>
                    </>
                  )}
                </div>
              </>
            ) : selectedSeat.type === 'auditor' && selectedSeat.status === 'available' ? (
              <p className="text-sm text-slate-500 text-center py-4">
                此座位当前空闲
              </p>
            ) : (
              <p className="text-sm text-slate-500 text-center py-4">
                此座位不可用
              </p>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
