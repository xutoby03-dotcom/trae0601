import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Calendar, MapPin, Clock, Users, Clock3 } from 'lucide-react';
import { useEventStore } from '@/store/eventStore';
import { generateTimeSlots } from '@/utils/time';
import { formatDate } from '@/utils/time';

export default function EventForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  
  const { getEvent, createEvent, updateEvent } = useEventStore();
  const existingEvent = id ? getEvent(id) : undefined;

  const [formData, setFormData] = useState({
    location: '',
    date: formatDate(new Date()),
    startTime: '09:00',
    endTime: '11:30',
    barberCount: 3,
    durationPerPerson: 20,
    totalCapacity: 24,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (existingEvent) {
      setFormData({
        location: existingEvent.location,
        date: existingEvent.date,
        startTime: existingEvent.startTime,
        endTime: existingEvent.endTime,
        barberCount: existingEvent.barberCount,
        durationPerPerson: existingEvent.durationPerPerson,
        totalCapacity: existingEvent.totalCapacity,
      });
    }
  }, [existingEvent]);

  const previewSlots = generateTimeSlots(
    formData.startTime,
    formData.endTime,
    formData.durationPerPerson,
    formData.barberCount
  );

  const calculatedCapacity = previewSlots.length * formData.barberCount;

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.location.trim()) {
      newErrors.location = '请输入服务地点';
    }
    if (!formData.date) {
      newErrors.date = '请选择日期';
    }
    if (!formData.startTime) {
      newErrors.startTime = '请选择开始时间';
    }
    if (!formData.endTime) {
      newErrors.endTime = '请选择结束时间';
    }
    if (formData.startTime >= formData.endTime) {
      newErrors.endTime = '结束时间必须晚于开始时间';
    }
    if (formData.barberCount < 1) {
      newErrors.barberCount = '理发师人数至少为1';
    }
    if (formData.durationPerPerson < 5) {
      newErrors.durationPerPerson = '服务时长至少为5分钟';
    }
    if (formData.totalCapacity < 1) {
      newErrors.totalCapacity = '总名额至少为1';
    }
    if (previewSlots.length === 0) {
      newErrors.endTime = '服务时段太短，无法安排任何预约';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    if (isEdit && id) {
      updateEvent(id, formData);
    } else {
      createEvent(formData);
    }

    navigate('/events');
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <div className="container mx-auto py-6 max-w-3xl">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/events" className="btn-ghost p-2">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-warm-800">
            {isEdit ? '编辑理发日' : '新建理发日'}
          </h1>
          <p className="text-warm-500 mt-1">
            {isEdit ? '修改理发活动信息' : '创建新的公益理发活动'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card p-6 mb-6">
          <h2 className="text-lg font-semibold text-warm-800 mb-5 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary-500" />
            基本信息
          </h2>

          <div className="space-y-5">
            <div>
              <label className="label">
                <MapPin className="w-4 h-4 inline mr-1 text-warm-400" />
                服务地点 <span className="text-danger-500">*</span>
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                placeholder="例如：社区活动中心一楼大厅"
                className={`input ${errors.location ? 'border-danger-500 focus:ring-danger-500/30' : ''}`}
              />
              {errors.location && (
                <p className="text-danger-500 text-sm mt-1">{errors.location}</p>
              )}
            </div>

            <div>
              <label className="label">
                <Calendar className="w-4 h-4 inline mr-1 text-warm-400" />
                活动日期 <span className="text-danger-500">*</span>
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleChange('date', e.target.value)}
                className={`input ${errors.date ? 'border-danger-500 focus:ring-danger-500/30' : ''}`}
              />
              {errors.date && (
                <p className="text-danger-500 text-sm mt-1">{errors.date}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">
                  <Clock className="w-4 h-4 inline mr-1 text-warm-400" />
                  开始时间 <span className="text-danger-500">*</span>
                </label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => handleChange('startTime', e.target.value)}
                  className={`input ${errors.startTime ? 'border-danger-500 focus:ring-danger-500/30' : ''}`}
                />
                {errors.startTime && (
                  <p className="text-danger-500 text-sm mt-1">{errors.startTime}</p>
                )}
              </div>
              <div>
                <label className="label">
                  <Clock3 className="w-4 h-4 inline mr-1 text-warm-400" />
                  结束时间 <span className="text-danger-500">*</span>
                </label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => handleChange('endTime', e.target.value)}
                  className={`input ${errors.endTime ? 'border-danger-500 focus:ring-danger-500/30' : ''}`}
                />
                {errors.endTime && (
                  <p className="text-danger-500 text-sm mt-1">{errors.endTime}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="card p-6 mb-6">
          <h2 className="text-lg font-semibold text-warm-800 mb-5 flex items-center gap-2">
            <Users className="w-5 h-5 text-primary-500" />
            服务配置
          </h2>

          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">理发师人数</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={formData.barberCount}
                  onChange={(e) => handleChange('barberCount', parseInt(e.target.value) || 1)}
                  className="input"
                />
              </div>
              <div>
                <label className="label">每人预计时长（分钟）</label>
                <input
                  type="number"
                  min="5"
                  max="120"
                  step="5"
                  value={formData.durationPerPerson}
                  onChange={(e) => handleChange('durationPerPerson', parseInt(e.target.value) || 20)}
                  className="input"
                />
              </div>
            </div>

            <div>
              <label className="label">可服务总名额</label>
              <input
                type="number"
                min="1"
                value={formData.totalCapacity}
                onChange={(e) => handleChange('totalCapacity', parseInt(e.target.value) || 1)}
                className="input"
              />
              <p className="text-sm text-warm-500 mt-1">
                根据时段和理发师人数计算：可预约 <span className="font-medium text-primary-600">{calculatedCapacity}</span> 个时段
              </p>
            </div>
          </div>
        </div>

        {previewSlots.length > 0 && (
          <div className="card p-6 mb-6">
            <h2 className="text-lg font-semibold text-warm-800 mb-4">时段预览</h2>
            <div className="flex flex-wrap gap-2">
              {previewSlots.map((slot, index) => (
                <div
                  key={index}
                  className="px-3 py-1.5 bg-warm-50 rounded-lg text-sm text-warm-700 border border-warm-200"
                >
                  {slot.time}
                  <span className="text-warm-400 ml-1">×{slot.capacity}</span>
                </div>
              ))}
            </div>
            <p className="text-sm text-warm-500 mt-3">
              共 {previewSlots.length} 个时段，每时段 {formData.barberCount} 人，总计 {calculatedCapacity} 个名额
            </p>
          </div>
        )}

        <div className="flex items-center justify-end gap-3">
          <Link to="/events" className="btn-secondary">
            取消
          </Link>
          <button type="submit" className="btn-primary">
            <Save className="w-4 h-4 mr-2" />
            {isEdit ? '保存修改' : '创建理发日'}
          </button>
        </div>
      </form>
    </div>
  );
}
