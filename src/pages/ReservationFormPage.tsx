import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CalendarDays, Clock, UserRound, Building, ChevronRight, AlertCircle, CheckCircle2, AlertTriangle, Search, Info } from 'lucide-react';
import { useStore } from '../store';
import { useToast } from '../components/Toast';
import { StatusBadge, InterfaceChip } from '../components/Badges';
import { TIME_SLOT_LABEL, DEPARTMENTS } from '../types';
import type { TimeSlot } from '../types';
import { formatISO, addDays, format, parseISO } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { cn } from '../lib/utils';

export default function ReservationFormPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const displays = useStore((s) => s.displays);
  const checkConflict = useStore((s) => s.checkConflict);
  const canReserve = useStore((s) => s.canReserve);
  const addReservation = useStore((s) => s.addReservation);

  const today = formatISO(new Date(), { representation: 'date' });
  const weekDates = useMemo(() => Array.from({ length: 7 }, (_, i) => formatISO(addDays(new Date(), i), { representation: 'date' })), []);

  const [displayId, setDisplayId] = useState('');
  const [useDate, setUseDate] = useState(today);
  const [timeSlot, setTimeSlot] = useState<TimeSlot>('morning');
  const [userName, setUserName] = useState('');
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [workstation, setWorkstation] = useState('');
  const [purpose, setPurpose] = useState('远程会议');
  const [searchKW, setSearchKW] = useState('');

  const filteredDisplays = useMemo(() => {
    const kw = searchKW.toLowerCase();
    return displays
      .filter((d) => {
        if (kw && !d.code.toLowerCase().includes(kw) && !d.location.toLowerCase().includes(kw)) return false;
        return true;
      })
      .sort((a, b) => a.code.localeCompare(b.code));
  }, [displays, searchKW]);

  const selectedDisplay = displays.find((d) => d.id === displayId);
  const hasConflict = displayId ? checkConflict(displayId, useDate, timeSlot) : false;
  const isDeviceAvailable = displayId ? canReserve(displayId) : true;
  const submitDisabled = !displayId || !userName.trim() || !workstation.trim() || hasConflict || !isDeviceAvailable;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = addReservation({
      displayId,
      userName: userName.trim(),
      department,
      useDate,
      timeSlot,
      workstation: workstation.trim(),
      purpose: purpose.trim() || '未指定',
    });
    if (ok) {
      toast.show('预约创建成功！请按时领取设备', 'success');
      navigate('/reservations');
    } else {
      toast.show('预约失败，请检查时段冲突或设备状态', 'error');
    }
  };

  const getSlotStatus = (dId: string, date: string, slot: TimeSlot) => {
    if (!canReserve(dId)) return 'disabled';
    if (checkConflict(dId, date, slot)) return 'taken';
    return 'free';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button className="btn-ghost !p-2" onClick={() => navigate('/reservations')}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 mb-1">创建预约</h2>
          <p className="text-sm text-zinc-500">选择可用的显示器与时段，填写使用信息完成预约</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <div className="card p-5 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-zinc-900 flex items-center gap-2">
                <CalendarDays size={18} className="text-brand-600" />
                选择日期
              </h3>
              <span className="text-xs text-zinc-500">仅显示未来 7 天</span>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {weekDates.map((d) => {
                const parsed = parseISO(d);
                const dayNum = format(parsed, 'd');
                const weekName = format(parsed, 'EEE', { locale: zhCN });
                const isToday = d === today;
                const isSelected = d === useDate;
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setUseDate(d)}
                    className={cn(
                      'py-3 rounded-xl border-2 transition-all flex flex-col items-center gap-0.5',
                      isSelected
                        ? 'bg-brand-600 border-brand-600 text-white shadow-md shadow-brand-600/25'
                        : 'bg-white border-zinc-200 text-zinc-700 hover:border-brand-300 hover:bg-brand-50/40'
                    )}
                  >
                    <span className={cn('text-[11px]', isSelected ? 'text-brand-100' : 'text-zinc-500')}>
                      {weekName}
                    </span>
                    <span className="font-bold text-lg leading-tight">{dayNum}</span>
                    {isToday && (
                      <span className={cn('text-[10px] px-1.5 rounded-full', isSelected ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-700')}>
                        今天
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="card p-5 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-zinc-900 flex items-center gap-2">
                <Clock size={18} className="text-brand-600" />
                选择时段
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(['morning', 'afternoon', 'allday'] as TimeSlot[]).map((ts) => {
                const isConflict = displayId ? checkConflict(displayId, useDate, ts) : false;
                const disabled = displayId ? !canReserve(displayId) : false;
                const selected = ts === timeSlot;
                return (
                  <button
                    key={ts}
                    type="button"
                    disabled={disabled}
                    onClick={() => setTimeSlot(ts)}
                    className={cn(
                      'p-4 rounded-xl border-2 transition-all text-left group',
                      disabled && 'opacity-50 cursor-not-allowed',
                      selected
                        ? isConflict
                          ? 'bg-rose-50 border-rose-400 text-rose-800'
                          : 'bg-brand-600 border-brand-600 text-white shadow-md shadow-brand-600/25'
                        : isConflict
                          ? 'bg-rose-50/50 border-rose-200 text-rose-600 hover:bg-rose-50'
                          : 'bg-white border-zinc-200 text-zinc-700 hover:border-brand-300 hover:bg-brand-50/40'
                    )}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-sm">
                        {ts === 'morning' ? '上午场' : ts === 'afternoon' ? '下午场' : '全天场'}
                      </span>
                      {isConflict ? <AlertCircle size={16} /> : selected ? <CheckCircle2 size={16} /> : <ChevronRight size={16} className="opacity-40 group-hover:opacity-100" />}
                    </div>
                    <p className={cn('text-xs', selected ? 'text-brand-100' : isConflict ? 'text-rose-500' : 'text-zinc-500')}>
                      {TIME_SLOT_LABEL[ts]}
                    </p>
                    {isConflict && (
                      <p className="text-[11px] mt-1.5 font-medium">该时段已被预约</p>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-zinc-900">选择设备</h3>
              <div className="relative w-64">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  className="input !py-2 !pl-8 text-xs"
                  placeholder="搜索设备编号或位置..."
                  value={searchKW}
                  onChange={(e) => setSearchKW(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[480px] overflow-y-auto scrollbar-thin pr-1">
              {filteredDisplays.map((d) => {
                const disabled = !canReserve(d.id);
                const conflict = checkConflict(d.id, useDate, timeSlot);
                const selected = d.id === displayId;
                const status = disabled ? '不可借' : conflict ? '时段占用' : '可预约';
                return (
                  <button
                    key={d.id}
                    type="button"
                    disabled={disabled}
                    onClick={() => setDisplayId(d.id)}
                    className={cn(
                      'p-3 rounded-xl border-2 transition-all flex gap-3 text-left',
                      disabled && 'opacity-60 cursor-not-allowed',
                      selected
                        ? 'bg-brand-50 border-brand-500 ring-2 ring-brand-200'
                        : conflict
                          ? 'bg-amber-50/50 border-amber-200 hover:bg-amber-50'
                          : 'bg-white border-zinc-200 hover:border-brand-300 hover:bg-brand-50/30'
                    )}
                  >
                    <div className="w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-zinc-100">
                      <img src={d.photoUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-bold text-zinc-800">{d.code}</span>
                        <StatusBadge status={d.status} />
                      </div>
                      <div className="text-xs text-zinc-600 mb-1.5">{d.size}英寸 · {d.location}</div>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {d.interfaces.slice(0, 3).map((i) => <InterfaceChip key={i} type={i} />)}
                        {d.interfaces.length > 3 && (
                          <span className="chip bg-zinc-100 text-zinc-600">+{d.interfaces.length - 3}</span>
                        )}
                      </div>
                      <div className={cn(
                        'flex items-center gap-1 text-[11px] font-medium',
                        disabled ? 'text-rose-600' : conflict ? 'text-amber-700' : 'text-emerald-600'
                      )}>
                        {disabled ? <AlertTriangle size={12} /> : conflict ? <AlertCircle size={12} /> : <CheckCircle2 size={12} />}
                        {status}
                        {disabled && d.missingAccessories.length > 0 && ` (缺${d.missingAccessories[0]})`}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSubmit} className="card p-5 space-y-5 sticky top-20">
            <h3 className="font-bold text-zinc-900 flex items-center gap-2">
              <UserRound size={18} className="text-brand-600" />
              使用信息
            </h3>

            <div>
              <label className="label">使用人姓名 <span className="text-rose-500">*</span></label>
              <input className="input" value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="请输入您的姓名" />
            </div>

            <div>
              <label className="label">所在部门 <span className="text-rose-500">*</span></label>
              <select className="input" value={department} onChange={(e) => setDepartment(e.target.value)}>
                {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <div>
              <label className="label">使用工位 <span className="text-rose-500">*</span></label>
              <input className="input" value={workstation} onChange={(e) => setWorkstation(e.target.value)} placeholder="例：3F-A08 或 会议室301" />
            </div>

            <div>
              <label className="label">使用用途</label>
              <select className="input" value={purpose} onChange={(e) => setPurpose(e.target.value)}>
                <option>远程会议</option>
                <option>产品评审会</option>
                <option>设计方案评审</option>
                <option>客户演示</option>
                <option>培训会议</option>
                <option>代码评审</option>
                <option>项目周会</option>
                <option>数据分析</option>
                <option>其他</option>
              </select>
            </div>

            {selectedDisplay && (
              <div className="p-4 rounded-xl bg-gradient-to-br from-brand-50 to-sky-50 border border-brand-100 space-y-2">
                <p className="text-xs font-semibold text-brand-700">预约确认</p>
                <div className="flex items-center gap-3">
                  <img src={selectedDisplay.photoUrl} className="w-12 h-12 rounded-lg object-cover border border-white shadow-sm" alt="" />
                  <div className="flex-1">
                    <div className="font-bold text-zinc-800">{selectedDisplay.code} {selectedDisplay.size}英寸</div>
                    <div className="text-xs text-zinc-500">{selectedDisplay.location}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-brand-200/60">
                  <div>
                    <span className="text-zinc-500">日期：</span>
                    <span className="font-medium text-zinc-800">{format(parseISO(useDate), 'M月d日 EEE', { locale: zhCN })}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500">时段：</span>
                    <span className="font-medium text-zinc-800">{TIME_SLOT_LABEL[timeSlot].split(' ')[0]}</span>
                  </div>
                </div>
              </div>
            )}

            {hasConflict && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2">
                <AlertTriangle size={18} className="text-rose-500 shrink-0 mt-0.5" />
                <p className="text-sm text-rose-700">当前时段该设备已被预约，请选择其他时段或设备。</p>
              </div>
            )}
            {displayId && !isDeviceAvailable && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2">
                <AlertCircle size={18} className="text-rose-500 shrink-0 mt-0.5" />
                <p className="text-sm text-rose-700">该设备当前不可预约，可能正在维修或配件缺失。</p>
              </div>
            )}

            <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-100 flex items-start gap-2">
              <Info size={16} className="text-zinc-400 shrink-0 mt-0.5" />
              <p className="text-xs text-zinc-600 leading-relaxed">
                请提前 10 分钟到设备柜领取，使用完毕后按原位放回。配件缺失的设备将自动标记为不可借。
              </p>
            </div>

            <div className="flex gap-3 pt-1">
              <button type="button" className="btn-secondary flex-1" onClick={() => navigate('/reservations')}>
                取消
              </button>
              <button
                type="submit"
                className="btn-primary flex-1"
                disabled={submitDisabled}
              >
                确认预约
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
