import { useState } from 'react';
import { X, User, GraduationCap, Phone, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { validatePhone, formatDisplayDate, getSlotStatus } from '@/utils/bookingUtils';
import { PIANO_TYPE_LABELS } from '@/types';

export default function BookingModal() {
  const {
    showBookingModal,
    closeBookingModal,
    modalRoomId,
    modalDate,
    modalTimeSlot,
    rooms,
    createBooking,
  } = useAppStore();

  const [formData, setFormData] = useState({
    studentName: '',
    major: '',
    practicePurpose: '',
    phone: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [successMessage, setSuccessMessage] = useState('');

  if (!showBookingModal || !modalRoomId || !modalDate || !modalTimeSlot) return null;

  const room = rooms.find(r => r.id === modalRoomId);
  if (!room) return null;

  const slotStatus = getSlotStatus(modalRoomId, modalDate, modalTimeSlot, useAppStore.getState().bookings, room.status);
  const isWaitlist = slotStatus === 'waitlist_only';

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.studentName.trim()) {
      newErrors.studentName = '请输入姓名';
    }

    if (!formData.major.trim()) {
      newErrors.major = '请输入专业';
    }

    if (!formData.practicePurpose.trim()) {
      newErrors.practicePurpose = '请输入练习目的';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = '请输入手机号';
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = '请输入正确的手机号';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const result = createBooking({
      roomId: modalRoomId,
      studentName: formData.studentName.trim(),
      major: formData.major.trim(),
      practicePurpose: formData.practicePurpose.trim(),
      phone: formData.phone.trim(),
      date: modalDate,
      timeSlot: modalTimeSlot,
    }, isWaitlist);

    if (result.success) {
      setSubmitStatus('success');
      setSuccessMessage(
        isWaitlist 
          ? `候补成功！您当前排在第 ${result.booking?.waitlistPosition} 位`
          : '预约成功！请按时到达琴房'
      );
      
      setTimeout(() => {
        closeBookingModal();
        setSubmitStatus('idle');
        setFormData({ studentName: '', major: '', practicePurpose: '', phone: '' });
      }, 2000);
    } else {
      setSubmitStatus('error');
      setErrors({ submit: result.message || '预约失败，请重试' });
    }
  };

  const handleClose = () => {
    closeBookingModal();
    setSubmitStatus('idle');
    setErrors({});
    setFormData({ studentName: '', major: '', practicePurpose: '', phone: '' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-cream-200">
          <div>
            <h2 className="font-serif text-xl font-bold text-wood-900">
              {isWaitlist ? '加入候补队列' : '预约琴房'}
            </h2>
            <p className="text-sm text-wood-500 mt-1">
              {room.roomNumber} · {PIANO_TYPE_LABELS[room.pianoType]}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-cream-100 transition-colors text-wood-500 hover:text-wood-900"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
            isWaitlist ? 'bg-yellow-50 border border-yellow-200' : 'bg-green-50 border border-green-200'
          }`}>
            <AlertCircle className={`w-4 h-4 ${isWaitlist ? 'text-yellow-600' : 'text-green-600'}`} />
            <p className={`text-sm ${isWaitlist ? 'text-yellow-700' : 'text-green-700'}`}>
              {formatDisplayDate(modalDate)} {modalTimeSlot}
              {isWaitlist ? ' · 该时段已满，可加入候补' : ' · 时段可预约'}
            </p>
          </div>

          {submitStatus === 'success' ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-serif text-lg font-semibold text-wood-900 mb-2">
                {isWaitlist ? '候补成功' : '预约成功'}
              </h3>
              <p className="text-wood-600">{successMessage}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-wood-700 mb-1.5">
                  <User className="w-4 h-4 inline mr-1" />
                  姓名
                </label>
                <input
                  type="text"
                  value={formData.studentName}
                  onChange={(e) => handleChange('studentName', e.target.value)}
                  className={`input-field ${errors.studentName ? 'border-red-300' : ''}`}
                  placeholder="请输入您的姓名"
                />
                {errors.studentName && (
                  <p className="text-red-500 text-xs mt-1">{errors.studentName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-wood-700 mb-1.5">
                  <GraduationCap className="w-4 h-4 inline mr-1" />
                  专业
                </label>
                <input
                  type="text"
                  value={formData.major}
                  onChange={(e) => handleChange('major', e.target.value)}
                  className={`input-field ${errors.major ? 'border-red-300' : ''}`}
                  placeholder="如：钢琴表演"
                />
                {errors.major && (
                  <p className="text-red-500 text-xs mt-1">{errors.major}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-wood-700 mb-1.5">
                  <FileText className="w-4 h-4 inline mr-1" />
                  练习目的
                </label>
                <input
                  type="text"
                  value={formData.practicePurpose}
                  onChange={(e) => handleChange('practicePurpose', e.target.value)}
                  className={`input-field ${errors.practicePurpose ? 'border-red-300' : ''}`}
                  placeholder="如：日常练习、考级准备"
                />
                {errors.practicePurpose && (
                  <p className="text-red-500 text-xs mt-1">{errors.practicePurpose}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-wood-700 mb-1.5">
                  <Phone className="w-4 h-4 inline mr-1" />
                  手机号
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className={`input-field ${errors.phone ? 'border-red-300' : ''}`}
                  placeholder="请输入手机号"
                  maxLength={11}
                />
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                )}
              </div>

              {errors.submit && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{errors.submit}</p>
                </div>
              )}

              <div className="pt-2">
                <p className="text-xs text-wood-500 mb-3">
                  提示：同一学生同一天最多预约3个时段，且不能连续预约超过2个时段
                </p>
                <button
                  type="submit"
                  className={isWaitlist ? 'btn-gold w-full' : 'btn-primary w-full'}
                >
                  {isWaitlist ? '确认候补' : '确认预约'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
