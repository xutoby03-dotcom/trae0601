import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, RefreshCw, Check, X, Calendar, Clock, Users, MapPin, User, Phone } from 'lucide-react';
import { useStore } from '../store';
import { STATUS_COLORS, TIME_SLOTS, COSTUME_SIZES } from '../../shared/types';

export default function Reservations() {
  const navigate = useNavigate();
  const { reservations, fetchReservations, approveReservation, rejectReservation, cancelReservation, loading } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  const filteredReservations = reservations.filter(r => {
    const matchSearch = searchTerm === '' || 
      r.className.includes(searchTerm) ||
      r.classContact.includes(searchTerm);
    const matchStatus = filterStatus === '' || r.status === filterStatus;
    const matchDate = filterDate === '' || r.shootDate === filterDate;
    return matchSearch && matchStatus && matchDate;
  });

  const handleApprove = async (id: string) => {
    if (confirm('确定要通过此预约吗？')) {
      await approveReservation(id);
    }
  };

  const handleReject = async () => {
    if (selectedReservation && rejectReason) {
      await rejectReservation(selectedReservation.id, rejectReason);
      setShowRejectModal(false);
      setRejectReason('');
      setSelectedReservation(null);
    }
  };

  const handleCancel = async (id: string) => {
    if (confirm('确定要取消此预约吗？')) {
      await cancelReservation(id);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-gray-800">预约管理</h1>
          <p className="text-gray-500 mt-1">管理班级预约申请，审核通过或驳回</p>
        </div>
        <button
          onClick={() => navigate('/reservations/new')}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          新建预约
        </button>
      </div>

      <div className="card">
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="搜索班级名称、联系人..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="input min-w-[160px]"
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input min-w-[120px]"
            >
              <option value="">全部状态</option>
              <option value="待审核">待审核</option>
              <option value="已通过">已通过</option>
              <option value="已驳回">已驳回</option>
              <option value="已取消">已取消</option>
              <option value="已完成">已完成</option>
            </select>
            <button
              onClick={() => fetchReservations()}
              className="btn-secondary flex items-center gap-2"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              刷新
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 text-primary-500 animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReservations.map((reservation, index) => (
              <div
                key={reservation.id}
                className="p-4 border border-gray-200 rounded-xl hover:shadow-md transition-all animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <h3 className="font-serif text-lg font-semibold text-gray-800">
                        {reservation.className}
                      </h3>
                      <span className={`status-badge ${STATUS_COLORS[reservation.status]}`}>
                        {reservation.status}
                      </span>
                      {reservation.isOverdue && (
                        <span className="status-badge bg-red-100 text-red-800">
                          逾期
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>{reservation.shootDate}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>{reservation.timeSlot}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Users className="w-4 h-4" />
                        <span>{reservation.headCount} 人</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>{reservation.pickupLocation}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span className="text-sm text-gray-500">尺码分布：</span>
                      {COSTUME_SIZES.map(size => (
                        reservation.sizeBreakdown[size] > 0 && (
                          <span
                            key={size}
                            className="text-xs px-2 py-0.5 bg-primary-100 text-primary-700 rounded"
                          >
                            {size}: {reservation.sizeBreakdown[size]}套
                          </span>
                        )
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>联系人：{reservation.classContact}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        <span>{reservation.contactPhone}</span>
                      </div>
                      <div>
                        <span>负责老师：{reservation.teacherInCharge}</span>
                      </div>
                    </div>

                    {reservation.rejectReason && (
                      <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                        驳回原因：{reservation.rejectReason}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {reservation.status === '待审核' && (
                      <>
                        <button
                          onClick={() => handleApprove(reservation.id)}
                          className="btn-primary flex items-center gap-1 text-sm py-1.5 px-3"
                        >
                          <Check className="w-4 h-4" />
                          通过
                        </button>
                        <button
                          onClick={() => {
                            setSelectedReservation(reservation);
                            setShowRejectModal(true);
                          }}
                          className="btn-danger flex items-center gap-1 text-sm py-1.5 px-3"
                        >
                          <X className="w-4 h-4" />
                          驳回
                        </button>
                      </>
                    )}
                    {(reservation.status === '待审核' || reservation.status === '已通过') && (
                      <button
                        onClick={() => handleCancel(reservation.id)}
                        className="btn-secondary flex items-center gap-1 text-sm py-1.5 px-3"
                      >
                        取消
                      </button>
                    )}
                    {reservation.status === '已通过' && (
                      <button
                        onClick={() => navigate('/lendings')}
                        className="btn-gold flex items-center gap-1 text-sm py-1.5 px-3"
                      >
                        借出
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {filteredReservations.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                暂无预约数据
              </div>
            )}
          </div>
        )}
      </div>

      {showRejectModal && selectedReservation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-slide-up">
            <div className="p-6">
              <h3 className="font-serif text-xl font-semibold text-gray-800 mb-4">驳回预约</h3>
              <p className="text-gray-600 mb-4">
                请填写驳回原因（{selectedReservation.className}）
              </p>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="input min-h-[100px] mb-4"
                placeholder="请输入驳回原因..."
              />
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectReason('');
                    setSelectedReservation(null);
                  }}
                  className="btn-secondary"
                >
                  取消
                </button>
                <button
                  onClick={handleReject}
                  disabled={!rejectReason}
                  className="btn-danger"
                >
                  确认驳回
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
