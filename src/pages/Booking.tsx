import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, User, Phone, Calendar, Clock, AlertCircle, CheckCircle, Clock as ClockIcon } from 'lucide-react';
import { useEventStore } from '@/store/eventStore';
import { useAppointmentStore } from '@/store/appointmentStore';
import { getWeekday } from '@/utils/time';

export default function Booking() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getEvent, getTimeSlots } = useEventStore();
  const { createAppointment, getAppointmentsByEvent } = useAppointmentStore();

  const event = id ? getEvent(id) : undefined;
  const timeSlots = id ? getTimeSlots(id) : [];
  const eventAppointments = id ? getAppointmentsByEvent(id) : [];

  const [formData, setFormData] = useState({
    elderName: '',
    age: '',
    phone: '',
    mobilityIssue: false,
    preferredTime: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  if (!event) {
    return (
      <div className="container mx-auto py-8 max-w-2xl">
        <div className="card p-8 text-center">
          <p className="text-warm-500">理发日不存在</p>
          <Link to="/events" className="btn-primary mt-4 inline-block">
            返回列表
          </Link>
        </div>
      </div>
    );
  }

  const isFull = eventAppointments.filter(a => a.status !== 'waitlist').length >= event.totalCapacity;

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.elderName.trim()) {
      newErrors.elderName = '请输入老人姓名';
    }
    if (!formData.age || parseInt(formData.age) < 1 || parseInt(formData.age) > 120) {
      newErrors.age = '请输入有效的年龄';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = '请输入联系电话';
    } else if (!/^1[3-9]\d{9}$/.test(formData.phone)) {
      newErrors.phone = '请输入有效的手机号码';
    }
    if (!isFull && !formData.preferredTime) {
      newErrors.preferredTime = '请选择偏好时间';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    let slotId: string | null = null;
    if (!isFull && formData.preferredTime) {
      const slot = timeSlots.find(s => s.time === formData.preferredTime);
      slotId = slot?.id || null;
    }

    createAppointment({
      eventId: event.id,
      slotId,
      elderName: formData.elderName,
      age: parseInt(formData.age),
      phone: formData.phone,
      mobilityIssue: formData.mobilityIssue,
      preferredTime: formData.preferredTime || '待定',
    });

    setSubmitted(true);
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  if (submitted) {
    return (
      <div className="container mx-auto py-8 max-w-2xl">
        <div className="card p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-success-100 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-success-600" />
          </div>
          <h2 className="text-2xl font-bold text-warm-800 mb-2">
            {isFull ? '已加入候补队列' : '预约成功！'}
          </h2>
          <p className="text-warm-500 mb-6">
            {isFull 
              ? '当前场次已满，您已加入候补队列，有名额空出时会自动递补。'
              : `请于 ${event.date} ${formData.preferredTime || '活动时间'} 前到 ${event.location} 签到。`
            }
          </p>
          
          <div className="bg-warm-50 rounded-xl p-4 mb-6 text-left">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-warm-500">老人姓名</span>
                <p className="font-medium text-warm-800">{formData.elderName}</p>
              </div>
              <div>
                <span className="text-warm-500">年龄</span>
                <p className="font-medium text-warm-800">{formData.age}岁</p>
              </div>
              <div>
                <span className="text-warm-500">联系电话</span>
                <p className="font-medium text-warm-800">{formData.phone}</p>
              </div>
              <div>
                <span className="text-warm-500">偏好时间</span>
                <p className="font-medium text-warm-800">{formData.preferredTime || '候补'}</p>
              </div>
              {formData.mobilityIssue && (
                <div className="col-span-2">
                  <span className="text-warm-500">行动不便</span>
                  <p className="font-medium text-warning-600">是</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-center gap-3">
            <button onClick={() => navigate('/events')} className="btn-secondary">
              返回列表
            </button>
            <button onClick={() => navigate('/')} className="btn-primary">
              查看看板
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/events" className="btn-ghost p-2">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-warm-800">预约理发</h1>
          <p className="text-warm-500 mt-1">
            {event.date} {getWeekday(event.date)} · {event.location}
          </p>
        </div>
      </div>

      {isFull && (
        <div className="bg-warning-50 border border-warning-200 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <ClockIcon className="w-5 h-5 text-warning-600 mt-0.5" />
            <div>
              <p className="font-medium text-warning-800">当前场次已满</p>
              <p className="text-sm text-warning-700 mt-1">
                您可以提交预约加入候补队列，如有人取消预约，将按顺序自动递补。
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="card p-6 mb-6">
          <h2 className="text-lg font-semibold text-warm-800 mb-5 flex items-center gap-2">
            <User className="w-5 h-5 text-primary-500" />
            老人信息
          </h2>

          <div className="space-y-5">
            <div>
              <label className="label">
                姓名 <span className="text-danger-500">*</span>
              </label>
              <input
                type="text"
                value={formData.elderName}
                onChange={(e) => handleChange('elderName', e.target.value)}
                placeholder="请输入老人姓名"
                className={`input ${errors.elderName ? 'border-danger-500 focus:ring-danger-500/30' : ''}`}
              />
              {errors.elderName && (
                <p className="text-danger-500 text-sm mt-1">{errors.elderName}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">
                  年龄 <span className="text-danger-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={formData.age}
                  onChange={(e) => handleChange('age', e.target.value)}
                  placeholder="年龄"
                  className={`input ${errors.age ? 'border-danger-500 focus:ring-danger-500/30' : ''}`}
                />
                {errors.age && (
                  <p className="text-danger-500 text-sm mt-1">{errors.age}</p>
                )}
              </div>
              <div>
                <label className="label">
                  联系电话 <span className="text-danger-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="手机号码"
                  className={`input ${errors.phone ? 'border-danger-500 focus:ring-danger-500/30' : ''}`}
                />
                {errors.phone && (
                  <p className="text-danger-500 text-sm mt-1">{errors.phone}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="mobilityIssue"
                checked={formData.mobilityIssue}
                onChange={(e) => handleChange('mobilityIssue', e.target.checked)}
                className="w-5 h-5 rounded border-warm-300 text-primary-600 focus:ring-primary-500/30"
              />
              <label htmlFor="mobilityIssue" className="flex items-center gap-2 cursor-pointer">
                <AlertCircle className="w-4 h-4 text-warning-500" />
                <span className="text-warm-700">行动不便（优先安排）</span>
              </label>
            </div>
          </div>
        </div>

        {!isFull && timeSlots.length > 0 && (
          <div className="card p-6 mb-6">
            <h2 className="text-lg font-semibold text-warm-800 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary-500" />
              选择偏好时间
            </h2>
            
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {timeSlots.map((slot) => {
                const slotBooked = eventAppointments.filter(
                  a => a.slotId === slot.id && a.status !== 'waitlist'
                ).length;
                const isAvailable = slotBooked < slot.capacity;
                const isSelected = formData.preferredTime === slot.time;

                return (
                  <button
                    key={slot.id}
                    type="button"
                    disabled={!isAvailable}
                    onClick={() => handleChange('preferredTime', slot.time)}
                    className={`py-3 px-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isSelected
                        ? 'bg-primary-500 text-white shadow-md'
                        : isAvailable
                        ? 'bg-warm-50 text-warm-700 hover:bg-primary-50 hover:text-primary-600 border border-warm-200'
                        : 'bg-warm-100 text-warm-400 cursor-not-allowed'
                    }`}
                  >
                    {slot.time}
                    <div className={`text-xs mt-1 ${
                      isSelected ? 'text-primary-100' : isAvailable ? 'text-warm-500' : 'text-warm-400'
                    }`}>
                      {slotBooked}/{slot.capacity}
                    </div>
                  </button>
                );
              })}
            </div>
            {errors.preferredTime && (
              <p className="text-danger-500 text-sm mt-3">{errors.preferredTime}</p>
            )}
          </div>
        )}

        <div className="flex items-center justify-end gap-3">
          <Link to="/events" className="btn-secondary">
            取消
          </Link>
          <button type="submit" className="btn-primary">
            {isFull ? '加入候补' : '确认预约'}
          </button>
        </div>
      </form>
    </div>
  );
}
