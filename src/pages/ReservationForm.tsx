import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';
import { useStore } from '../store';
import { TIME_SLOTS, COSTUME_SIZES } from '../../shared/types';
import { api } from '../lib/api';

export default function ReservationForm() {
  const navigate = useNavigate();
  const { createReservation, costumes, loading } = useStore();

  const [form, setForm] = useState({
    className: '',
    classContact: '',
    contactPhone: '',
    shootDate: '',
    timeSlot: '08:00-10:00' as TimeSlot,
    headCount: 0,
    sizeBreakdown: {
      XS: 0, S: 0, M: 0, L: 0, XL: 0, XXL: 0, '均码': 0
    } as Record<CostumeSize, number>,
    teacherInCharge: '',
    pickupLocation: '',
    remark: ''
  });

  const [availability, setAvailability] = useState<Record<string, number> | null>(null);
  const [availabilityError, setAvailabilityError] = useState<string[]>([]);

  useEffect(() => {
    if (form.shootDate && form.timeSlot) {
      checkAvailability();
    }
  }, [form.shootDate, form.timeSlot]);

  useEffect(() => {
    const total = Object.values(form.sizeBreakdown).reduce((a, b) => a + b, 0);
    setForm(prev => ({ ...prev, headCount: total }));
  }, [form.sizeBreakdown]);

  const checkAvailability = async () => {
    try {
      const data = await api.costumes.getAvailability(form.shootDate, form.timeSlot);
      setAvailability(data.available);
    } catch (error) {
      console.error('获取库存失败', error);
    }
  };

  const validate = () => {
    const errors: string[] = [];
    if (!form.className) errors.push('请填写班级名称');
    if (!form.classContact) errors.push('请填写联系人');
    if (!form.contactPhone) errors.push('请填写联系电话');
    if (!form.shootDate) errors.push('请选择拍摄日期');
    if (!form.teacherInCharge) errors.push('请填写负责老师');
    if (!form.pickupLocation) errors.push('请填写领取地点');
    if (form.headCount === 0) errors.push('请至少选择一个尺码的服装');

    if (availability) {
      for (const size of COSTUME_SIZES) {
        const requested = form.sizeBreakdown[size];
        const available = availability[size] || 0;
        if (requested > available) {
          errors.push(`${size}码库存不足：需要${requested}套，可用${available}套`);
        }
      }
    }

    setAvailabilityError(errors);
    return errors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const result = await createReservation(form);
    if (result) {
      navigate('/reservations');
    }
  };

  const handleSizeChange = (size: CostumeSize, value: number) => {
    setForm(prev => ({
      ...prev,
      sizeBreakdown: {
        ...prev.sizeBreakdown,
        [size]: Math.max(0, value)
      }
    }));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/reservations')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="font-serif text-2xl font-bold text-gray-800">新建预约</h1>
          <p className="text-gray-500 mt-1">填写班级预约信息</p>
        </div>
      </div>

      {availabilityError.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-800">存在以下问题：</p>
              <ul className="list-disc list-inside text-sm text-red-600 mt-1 space-y-1">
                {availabilityError.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card space-y-4">
            <h3 className="font-serif text-lg font-semibold text-gray-800">基本信息</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="label">班级名称 *</label>
                <input
                  type="text"
                  value={form.className}
                  onChange={(e) => setForm(prev => ({ ...prev, className: e.target.value }))}
                  className="input"
                  placeholder="如：计算机科学2022级1班"
                />
              </div>
              <div>
                <label className="label">联系人 *</label>
                <input
                  type="text"
                  value={form.classContact}
                  onChange={(e) => setForm(prev => ({ ...prev, classContact: e.target.value }))}
                  className="input"
                  placeholder="班级代表姓名"
                />
              </div>
              <div>
                <label className="label">联系电话 *</label>
                <input
                  type="tel"
                  value={form.contactPhone}
                  onChange={(e) => setForm(prev => ({ ...prev, contactPhone: e.target.value }))}
                  className="input"
                  placeholder="联系电话"
                />
              </div>
              <div>
                <label className="label">拍摄日期 *</label>
                <input
                  type="date"
                  value={form.shootDate}
                  onChange={(e) => setForm(prev => ({ ...prev, shootDate: e.target.value }))}
                  className="input"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <label className="label">时段 *</label>
                <select
                  value={form.timeSlot}
                  onChange={(e) => setForm(prev => ({ ...prev, timeSlot: e.target.value as TimeSlot }))}
                  className="input"
                >
                  {TIME_SLOTS.map(slot => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">负责老师 *</label>
                <input
                  type="text"
                  value={form.teacherInCharge}
                  onChange={(e) => setForm(prev => ({ ...prev, teacherInCharge: e.target.value }))}
                  className="input"
                  placeholder="负责老师姓名"
                />
              </div>
              <div>
                <label className="label">领取地点 *</label>
                <input
                  type="text"
                  value={form.pickupLocation}
                  onChange={(e) => setForm(prev => ({ ...prev, pickupLocation: e.target.value }))}
                  className="input"
                  placeholder="如：行政楼101室"
                />
              </div>
            </div>
          </div>

          <div className="card space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg font-semibold text-gray-800">尺码需求</h3>
              <span className="text-sm text-gray-500">
                总计：<span className="font-semibold text-primary-600">{form.headCount}</span> 套
              </span>
            </div>
            
            {availability && form.shootDate && (
              <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-700">
                {form.shootDate} {form.timeSlot} 可用库存：
                {COSTUME_SIZES.map(size => (
                  availability[size] !== undefined && availability[size] > 0 && (
                    <span key={size} className="ml-2">
                      {size}: {availability[size]}套
                    </span>
                  )
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {COSTUME_SIZES.map(size => (
                <div key={size}>
                  <label className="label">{size} 码</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleSizeChange(size, form.sizeBreakdown[size] - 1)}
                      className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-xl font-bold transition-colors"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="0"
                      value={form.sizeBreakdown[size]}
                      onChange={(e) => handleSizeChange(size, parseInt(e.target.value) || 0)}
                      className="input text-center flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => handleSizeChange(size, form.sizeBreakdown[size] + 1)}
                      className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-xl font-bold transition-colors"
                    >
                      +
                    </button>
                  </div>
                  {availability && (
                    <p className={`text-xs mt-1 ${
                      form.sizeBreakdown[size] > (availability[size] || 0) 
                        ? 'text-red-500' 
                        : 'text-gray-500'
                    }`}>
                      可用：{availability[size] || 0} 套
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="card space-y-4">
            <h3 className="font-serif text-lg font-semibold text-gray-800">备注</h3>
            <textarea
              value={form.remark}
              onChange={(e) => setForm(prev => ({ ...prev, remark: e.target.value }))}
              className="input min-h-[100px]"
              placeholder="填写备注信息..."
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <h3 className="font-serif text-lg font-semibold text-gray-800 mb-4">预约信息</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">班级</span>
                <span className="font-medium">{form.className || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">日期</span>
                <span className="font-medium">{form.shootDate || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">时段</span>
                <span className="font-medium">{form.timeSlot}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">人数</span>
                <span className="font-medium">{form.headCount} 人</span>
              </div>
              <div className="border-t pt-3 mt-3">
                <p className="text-gray-500 mb-2">尺码分布</p>
                <div className="space-y-1">
                  {COSTUME_SIZES.map(size => (
                    form.sizeBreakdown[size] > 0 && (
                      <div key={size} className="flex justify-between">
                        <span>{size} 码</span>
                        <span className="font-medium">{form.sizeBreakdown[size]} 套</span>
                      </div>
                    )
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              {loading ? '提交中...' : '提交预约'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/reservations')}
              className="btn-secondary w-full"
            >
              取消
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
