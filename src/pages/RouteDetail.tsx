import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Clock,
  Users,
  Baby,
  Luggage,
  Car,
  ArrowLeft,
  Phone,
  UserPlus,
  XCircle,
  CheckCircle2,
  AlertTriangle,
  X
} from 'lucide-react';
import { Modal } from '@/components/Modal';
import { BookingCard } from '@/components/BookingCard';
import { StatusBadge } from '@/components/StatusBadge';
import { useCarpoolStore } from '@/store/useCarpoolStore';
import type { BookingFormData } from '@/types';
import { formatDateTime, getLuggageSpaceLabel } from '@/utils/helpers';

export const RouteDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const store = useCarpoolStore();

  const [route, setRoute] = useState(store.getRouteById(id || ''));
  const [bookings, setBookings] = useState(store.getBookingsByRouteId(id || ''));
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentUser = store.currentUser;
  const isOwner = route?.ownerId === currentUser.id;

  const [bookingForm, setBookingForm] = useState<BookingFormData>({
    passengerCount: 1,
    pickupPoint: '',
    contactPhone: currentUser.phone,
    hasElderlyOrChild: false,
    remarks: ''
  });

  const [formErrors, setFormErrors] = useState<Partial<Record<keyof BookingFormData, string>>>({});

  useEffect(() => {
    if (id) {
      setRoute(store.getRouteById(id));
      setBookings(store.getBookingsByRouteId(id));
    }
  }, [id, store.routes, store.bookings]);

  const validateBookingForm = () => {
    const errors: Partial<Record<keyof BookingFormData, string>> = {};
    if (bookingForm.passengerCount < 1) errors.passengerCount = '至少1人';
    if (bookingForm.passengerCount > (route?.availableSeats || 1)) {
      errors.passengerCount = `最多${route?.availableSeats}人`;
    }
    if (!bookingForm.pickupPoint.trim()) errors.pickupPoint = '请输入上车点';
    if (!bookingForm.contactPhone.trim()) errors.contactPhone = '请输入联系方式';
    if (bookingForm.contactPhone.length < 11) errors.contactPhone = '请输入正确的手机号';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitBooking = async () => {
    if (!validateBookingForm() || !route) return;

    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      store.addBooking(route.id, bookingForm);
      setShowBookingModal(false);
      setBookingForm({
        passengerCount: 1,
        pickupPoint: '',
        contactPhone: currentUser.phone,
        hasElderlyOrChild: false,
        remarks: ''
      });
    } catch (error) {
      console.error('申请失败:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmBooking = (bookingId: string) => {
    store.updateBookingStatus(bookingId, 'confirmed');
  };

  const handleRejectBooking = (bookingId: string) => {
    store.updateBookingStatus(bookingId, 'rejected');
  };

  const handleMarkNoShow = (bookingId: string) => {
    store.markNoShow(bookingId);
  };

  const handleConfirmAll = () => {
    if (!route) return;
    store.confirmAllPassengers(route.id);
  };

  const handleCancelRoute = () => {
    if (!route) return;
    store.cancelRoute(route.id);
    setShowCancelConfirm(false);
  };

  const handleCancelBooking = (bookingId: string) => {
    store.cancelBooking(bookingId);
  };

  const updateBookingForm = (field: keyof BookingFormData, value: unknown) => {
    setBookingForm((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const pendingBookings = bookings.filter((b) => b.status === 'pending');
  const confirmedBookings = bookings.filter((b) => b.status === 'confirmed');
  const myBooking = bookings.find((b) => b.passengerId === currentUser.id);

  if (!route) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">路线不存在</h2>
          <button
            onClick={() => navigate('/routes')}
            className="text-orange-600 hover:text-orange-700 font-medium"
          >
            返回路线列表
          </button>
        </div>
      </div>
    );
  }

  const occupiedSeats = route.totalSeats - route.availableSeats;
  const occupancyRate = (occupiedSeats / route.totalSeats) * 100;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">路线详情</h1>
          <p className="text-sm text-gray-500 mt-1">
            {route.departure} → {route.destination}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <img
              src={store.users.find((u) => u.id === route.ownerId)?.avatar}
              alt={route.ownerName}
              className="w-14 h-14 rounded-full border-2 border-orange-200"
            />
            <div>
              <h2 className="text-xl font-bold text-gray-900">{route.ownerName}</h2>
              <p className="text-sm text-gray-500">车主 · 尾号 {route.plateNumber.slice(-4)}</p>
            </div>
          </div>
          <StatusBadge type="route" status={route.status} />
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-4 p-4 bg-teal-50 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <p className="text-xs text-teal-600 font-medium">出发地</p>
              <p className="font-semibold text-gray-900">{route.departure}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-orange-50 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-xs text-orange-600 font-medium">目的地</p>
              <p className="font-semibold text-gray-900">{route.destination}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-blue-600 font-medium">出发时间</p>
              <p className="font-semibold text-gray-900">{formatDateTime(route.departureTime)}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-gray-50 rounded-xl text-center">
            <Users className="w-5 h-5 text-gray-400 mx-auto mb-1" />
            <p className="text-2xl font-bold text-gray-900">
              {route.availableSeats} / {route.totalSeats}
            </p>
            <p className="text-xs text-gray-500">空座</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl text-center">
            <Baby className={`w-5 h-5 mx-auto mb-1 ${route.hasChildSeat ? 'text-teal-500' : 'text-gray-300'}`} />
            <p className={`text-lg font-bold ${route.hasChildSeat ? 'text-teal-600' : 'text-gray-400'}`}>
              {route.hasChildSeat ? '有' : '无'}
            </p>
            <p className="text-xs text-gray-500">儿童座椅</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl text-center">
            <Luggage className="w-5 h-5 text-gray-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-gray-900">{getLuggageSpaceLabel(route.luggageSpace)}</p>
            <p className="text-xs text-gray-500">行李空间</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl text-center">
            <Car className="w-5 h-5 text-gray-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-gray-900">{route.plateNumber}</p>
            <p className="text-xs text-gray-500">车牌号</p>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>座位使用情况</span>
            <span>{occupiedSeats} / {route.totalSeats} 座已占 ({Math.round(occupancyRate)}%)</span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full transition-all duration-500"
              style={{ width: `${occupancyRate}%` }}
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {isOwner ? (
            <>
              {route.status === 'open' && confirmedBookings.length > 0 && (
                <button
                  onClick={handleConfirmAll}
                  className="flex-1 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl font-medium hover:from-teal-600 hover:to-teal-700 transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  确认所有乘客到齐
                </button>
              )}
              {route.status === 'open' && (
                <button
                  onClick={() => setShowCancelConfirm(true)}
                  className="flex-1 py-3 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 transition-all flex items-center justify-center gap-2"
                >
                  <XCircle className="w-5 h-5" />
                  取消路线
                </button>
              )}
            </>
          ) : (
            <>
              {myBooking ? (
                <div className="flex-1">
                  <div className={`p-4 rounded-xl ${
                    myBooking.status === 'confirmed' ? 'bg-teal-50 border border-teal-200' :
                    myBooking.status === 'pending' ? 'bg-amber-50 border border-amber-200' :
                    'bg-gray-50 border border-gray-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">
                          {myBooking.status === 'confirmed' ? '您的申请已确认' :
                           myBooking.status === 'pending' ? '您的申请待确认' :
                           myBooking.status === 'rejected' ? '您的申请已被拒绝' :
                           myBooking.status === 'cancelled' ? '您已取消申请' : '申请状态'}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {myBooking.passengerCount}人 · {myBooking.pickupPoint}
                        </p>
                      </div>
                      <StatusBadge type="booking" status={myBooking.status} />
                    </div>
                    {(myBooking.status === 'pending' || myBooking.status === 'confirmed') && (
                      <button
                        onClick={() => handleCancelBooking(myBooking.id)}
                        className="mt-3 text-sm text-red-600 hover:text-red-700 font-medium"
                      >
                        取消申请
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  {route.status === 'open' && route.availableSeats > 0 ? (
                    <button
                      onClick={() => setShowBookingModal(true)}
                      className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-medium hover:from-orange-600 hover:to-orange-700 transition-all flex items-center justify-center gap-2 shadow-md shadow-orange-200"
                    >
                      <UserPlus className="w-5 h-5" />
                      申请拼车
                    </button>
                  ) : (
                    <div className="flex-1 py-3 bg-gray-100 text-gray-500 rounded-xl font-medium text-center">
                      {route.status === 'full' ? '该路线已满座' :
                       route.status === 'closed' ? '该路线已关闭' :
                       route.status === 'cancelled' ? '该路线已取消' :
                       route.status === 'completed' ? '该路线已完成' : '暂不可申请'}
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>

      {isOwner && (
        <div className="space-y-6">
          {pendingBookings.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                待确认申请 ({pendingBookings.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingBookings.map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    showActions
                    onConfirm={() => handleConfirmBooking(booking.id)}
                    onReject={() => handleRejectBooking(booking.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {confirmedBookings.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-teal-500" />
                已确认乘客 ({confirmedBookings.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {confirmedBookings.map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    showActions={route.status === 'open'}
                    onMarkNoShow={() => handleMarkNoShow(booking.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {bookings.length === 0 && (
            <div className="bg-white rounded-xl p-8 text-center">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">暂无乘客申请</p>
            </div>
          )}
        </div>
      )}

      {!isOwner && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Phone className="w-5 h-5 text-teal-500" />
            联系方式
          </h3>
          {confirmedBookings.length > 0 || route.status !== 'open' ? (
            <div className="flex items-center gap-4 p-4 bg-teal-50 rounded-xl">
              <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center">
                <Phone className="w-6 h-6 text-teal-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{route.ownerName}</p>
                <p className="text-lg font-bold text-teal-600">
                  {store.users.find((u) => u.id === route.ownerId)?.phone}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">申请确认后可查看车主联系方式</p>
          )}
        </div>
      )}

      <Modal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        title="申请拼车"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              乘车人数
            </label>
            <div className="flex items-center gap-4">
              <button
                onClick={() => updateBookingForm('passengerCount', Math.max(1, bookingForm.passengerCount - 1))}
                className="w-10 h-10 rounded-lg bg-gray-100 text-gray-600 font-bold text-lg hover:bg-gray-200 transition-colors"
              >
                -
              </button>
              <span className="text-2xl font-bold text-gray-900 w-12 text-center">
                {bookingForm.passengerCount}
              </span>
              <button
                onClick={() => updateBookingForm('passengerCount', Math.min(route?.availableSeats || 1, bookingForm.passengerCount + 1))}
                className="w-10 h-10 rounded-lg bg-gray-100 text-gray-600 font-bold text-lg hover:bg-gray-200 transition-colors"
              >
                +
              </button>
              <span className="text-sm text-gray-500">/ {route?.availableSeats} 座可乘</span>
            </div>
            {formErrors.passengerCount && (
              <p className="text-red-500 text-sm mt-1">{formErrors.passengerCount}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              上车点
            </label>
            <input
              type="text"
              value={bookingForm.pickupPoint}
              onChange={(e) => updateBookingForm('pickupPoint', e.target.value)}
              placeholder="请输入上车点，如：小区北门"
              className={`w-full px-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                formErrors.pickupPoint ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'
              }`}
            />
            {formErrors.pickupPoint && (
              <p className="text-red-500 text-sm mt-1">{formErrors.pickupPoint}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              联系方式
            </label>
            <input
              type="tel"
              value={bookingForm.contactPhone}
              onChange={(e) => updateBookingForm('contactPhone', e.target.value)}
              placeholder="请输入手机号"
              maxLength={11}
              className={`w-full px-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                formErrors.contactPhone ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'
              }`}
            />
            {formErrors.contactPhone && (
              <p className="text-red-500 text-sm mt-1">{formErrors.contactPhone}</p>
            )}
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Baby className="w-4 h-4 text-teal-500" />
              是否有老人或小孩
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => updateBookingForm('hasElderlyOrChild', true)}
                className={`flex-1 py-2.5 rounded-xl font-medium transition-all ${
                  bookingForm.hasElderlyOrChild
                    ? 'bg-teal-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                是
              </button>
              <button
                onClick={() => updateBookingForm('hasElderlyOrChild', false)}
                className={`flex-1 py-2.5 rounded-xl font-medium transition-all ${
                  !bookingForm.hasElderlyOrChild
                    ? 'bg-gray-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                否
              </button>
            </div>
            {bookingForm.hasElderlyOrChild && !route?.hasChildSeat && (
              <div className="mt-3 flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800">该路线未配备儿童座椅</p>
                  <p className="text-xs text-amber-700 mt-0.5">如需儿童座椅请选择其他路线，或在备注中与车主协商</p>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              备注（选填）
            </label>
            <textarea
              value={bookingForm.remarks}
              onChange={(e) => updateBookingForm('remarks', e.target.value)}
              placeholder="如有特殊需求请在此说明..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setShowBookingModal(false)}
              className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSubmitBooking}
              disabled={isSubmitting}
              className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-medium hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? '提交中...' : '提交申请'}
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        title="确认取消路线"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl">
            <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0" />
            <div>
              <p className="font-medium text-gray-900">取消路线将影响已申请的乘客</p>
              <p className="text-sm text-gray-500">所有待确认和已确认的申请将被取消</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowCancelConfirm(false)}
              className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
            >
              再想想
            </button>
            <button
              onClick={handleCancelRoute}
              className="flex-1 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors"
            >
              确认取消
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
