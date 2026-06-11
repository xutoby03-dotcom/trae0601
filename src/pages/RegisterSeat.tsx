import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Home, Hash, User, Phone, Clock, Coffee, ArrowLeft, CheckCircle2, AlertCircle, ChevronRight } from 'lucide-react';
import { BUILDINGS } from '../types';
import { apiClient } from '../api/client';
import { toLocalInputValue, addMinutes } from '../utils/time';
import { cn } from '../lib/utils';

export default function RegisterSeat() {
  const navigate = useNavigate();
  const [building, setBuilding] = useState('');
  const [room, setRoom] = useState('');
  const [seatNumber, setSeatNumber] = useState('');
  const [registeredBy, setRegisteredBy] = useState('');
  const [contact, setContact] = useState('');
  const [expectedLeaveAt, setExpectedLeaveAt] = useState(
    toLocalInputValue(addMinutes(new Date(), 120)),
  );
  const [tempLeave, setTempLeave] = useState(false);
  const [tempLeaveMinutes, setTempLeaveMinutes] = useState(15);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!building || !room || !seatNumber || !registeredBy || !contact || !expectedLeaveAt) {
      setError('请填写所有必填项');
      return;
    }
    const leaveTs = new Date(expectedLeaveAt).getTime();
    if (leaveTs <= Date.now()) {
      setError('预计离开时间需晚于当前时间');
      return;
    }
    setSubmitting(true);
    try {
      await apiClient.registerSeat({
        building,
        room,
        seatNumber,
        registeredBy,
        contact,
        expectedLeaveAt: leaveTs,
        tempLeave,
        tempLeaveMinutes: tempLeave ? tempLeaveMinutes : undefined,
      });
      navigate('/', { state: { toast: '座位登记成功！' } });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls = cn(
    'w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700',
    'placeholder-slate-400 focus:outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-500/10 transition-all',
  );
  const labelCls = 'block text-sm font-semibold text-slate-700 mb-2';
  const wrapIconCls = 'absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-cyan-50/40 py-6 md:py-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-slate-600 hover:text-teal-700 text-sm font-medium mb-6 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          返回
        </button>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
          <div className="bg-gradient-to-br from-teal-600 to-cyan-700 p-6 md:p-8 text-white relative overflow-hidden">
            <div className="absolute -right-16 -top-16 w-48 h-48 bg-amber-400/20 rounded-full blur-3xl" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 rounded-full text-xs font-medium mb-3 backdrop-blur">
                <CheckCircle2 className="w-3.5 h-3.5" />
                新登记
              </div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">登记你的座位</h1>
              <p className="text-teal-100 text-sm md:text-base max-w-md">
                填写座位信息，方便其他同学了解座位使用情况，共同维护良好秩序
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
            {error && (
              <div className="flex items-start gap-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl p-4 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div>{error}</div>
              </div>
            )}

            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="w-6 h-0.5 bg-slate-200" />
                位置信息
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={labelCls}>教学楼 <span className="text-rose-500">*</span></label>
                  <div className="relative">
                    <Building2 className={wrapIconCls} />
                    <select
                      value={building}
                      onChange={(e) => setBuilding(e.target.value)}
                      className={cn(inputCls, 'appearance-none pl-11 pr-9 cursor-pointer')}
                    >
                      <option value="">请选择</option>
                      {BUILDINGS.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className={labelCls}>教室号 <span className="text-rose-500">*</span></label>
                  <div className="relative">
                    <Home className={wrapIconCls} />
                    <input
                      value={room}
                      onChange={(e) => setRoom(e.target.value)}
                      placeholder="如：301"
                      className={cn(inputCls, 'pl-11')}
                    />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>座位号 <span className="text-rose-500">*</span></label>
                  <div className="relative">
                    <Hash className={wrapIconCls} />
                    <input
                      value={seatNumber}
                      onChange={(e) => setSeatNumber(e.target.value)}
                      placeholder="如：08"
                      className={cn(inputCls, 'pl-11')}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="w-6 h-0.5 bg-slate-200" />
                个人信息
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>昵称 <span className="text-rose-500">*</span></label>
                  <div className="relative">
                    <User className={wrapIconCls} />
                    <input
                      value={registeredBy}
                      onChange={(e) => setRegisteredBy(e.target.value)}
                      placeholder="方便他人联系你"
                      className={cn(inputCls, 'pl-11')}
                    />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>联系方式 <span className="text-rose-500">*</span></label>
                  <div className="relative">
                    <Phone className={wrapIconCls} />
                    <input
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      placeholder="手机号或微信号"
                      className={cn(inputCls, 'pl-11')}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="w-6 h-0.5 bg-slate-200" />
                时间安排
              </h3>
              <div className="space-y-4">
                <div>
                  <label className={labelCls}>预计离开时间 <span className="text-rose-500">*</span></label>
                  <div className="relative">
                    <Clock className={wrapIconCls} />
                    <input
                      type="datetime-local"
                      value={expectedLeaveAt}
                      onChange={(e) => setExpectedLeaveAt(e.target.value)}
                      className={cn(inputCls, 'pl-11')}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-2">超过此时间未返回，座位将被标记为疑似占座</p>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                  <div className="flex items-start gap-4">
                    <div
                      onClick={() => setTempLeave(!tempLeave)}
                      className={cn(
                        'relative shrink-0 w-12 h-7 rounded-full cursor-pointer transition-colors duration-300',
                        tempLeave ? 'bg-amber-500' : 'bg-slate-300',
                      )}
                    >
                      <div
                        className={cn(
                          'absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300',
                          tempLeave ? 'translate-x-5' : 'translate-x-0.5',
                        )}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Coffee className="w-5 h-5 text-amber-600" />
                        <p className="font-semibold text-amber-900">我现在要短暂离开一下</p>
                      </div>
                      <p className="text-sm text-amber-700 mt-1">
                        适用于去接水、上厕所、买饭等短时离开，离开期间座位为你保留
                      </p>
                      {tempLeave && (
                        <div className="mt-4">
                          <label className="text-xs font-semibold text-amber-800 mb-2 block">
                            预计离开时长（分钟）
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {[10, 15, 20, 30, 45, 60].map((m) => (
                              <button
                                type="button"
                                key={m}
                                onClick={() => setTempLeaveMinutes(m)}
                                className={cn(
                                  'px-4 py-1.5 rounded-xl text-sm font-medium transition-all',
                                  tempLeaveMinutes === m
                                    ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30'
                                    : 'bg-white text-amber-700 hover:bg-amber-100 border border-amber-200',
                                )}
                              >
                                {m}分钟
                              </button>
                            ))}
                          </div>
                          <p className="text-xs text-amber-600 mt-2">
                            超过此时长未返回将自动标记为疑似占座
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-3 sm:justify-end">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-3 rounded-xl text-slate-600 hover:bg-slate-100 font-medium transition"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-semibold shadow-lg shadow-teal-500/20 transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    登记中...
                  </>
                ) : (
                  <>
                    确认登记
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
