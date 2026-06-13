import { useEffect, useState } from 'react';
import {
  ClipboardCheck, CalendarDays, CheckCircle2, XCircle, RefreshCw,
  User, ArrowLeftRight, X, AlertCircle, Image as ImageIcon, ChevronUp, ChevronDown, Sun, CheckCircle, Clock,
} from 'lucide-react';
import { checkInsApi, bedsApi } from '@/api/client';
import type { Bed, CheckInStatus } from '#shared/types';
import type { CheckInDetail } from '@/api/client';

const statusLabels: Record<CheckInStatus, { label: string; color: string }> = {
  pending: { label: '待签到', color: 'bg-sky-100 text-sky-700' },
  checked_in: { label: '已签到', color: 'bg-emerald-100 text-emerald-700' },
  absent: { label: '未到', color: 'bg-red-100 text-red-700' },
};
const disinfectionLabels: Record<string, { label: string; color: string }> = {
  completed: { label: '已消毒', color: 'bg-emerald-100 text-emerald-700' },
  pending: { label: '待消毒', color: 'bg-accent-100 text-accent-700' },
  expired: { label: '消毒过期', color: 'bg-red-100 text-red-700' },
};

function SwapModal({ checkIn, beds, onClose, onSwapped }: {
  checkIn: CheckInDetail;
  beds: Bed[];
  onClose: () => void;
  onSwapped: () => void;
}) {
  const [toBedId, setToBedId] = useState(0);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const availableBeds = beds.filter((b) =>
    b.disinfectionStatus === 'completed' && b.id !== checkIn.reservation.bedId
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!toBedId) { setError('请选择目标床位'); return; }
    try {
      await checkInsApi.swap(checkIn.reservationId, toBedId, reason);
      onSwapped();
      onClose();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4">
      <div className="glass-card rounded-3xl p-6 w-full max-w-md animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold font-display text-gray-800 flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5 text-primary-600" />临时换床
          </h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="bg-gray-50 rounded-2xl p-4 mb-5">
          <p className="text-xs text-gray-500 mb-2">当前床位</p>
          <div className="flex gap-3">
            <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-200 flex-shrink-0">
              {checkIn.reservation.bed?.photoUrl ? (
                <img
                  src={checkIn.reservation.bed.photoUrl}
                  alt={`${checkIn.reservation.bed.room}室 ${checkIn.reservation.bed.bedNumber}号床`}
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <ImageIcon className="w-6 h-6" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-800">
                {checkIn.reservation.bed?.room}室 #{checkIn.reservation.bed?.bedNumber}
                （{checkIn.reservation.bed?.bunkType === 'upper' ? '上铺' : '下铺'}）
                {checkIn.reservation.bed?.isWindowSide ? ' · 靠窗' : ''}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                学生：<span className="font-medium">{checkIn.reservation.studentName}</span>
                （{checkIn.reservation.className}）
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label-field">更换至床位</label>
            <div className="max-h-48 overflow-y-auto pr-1 space-y-2 mb-2">
              {availableBeds.map((b) => {
                const selected = toBedId === b.id;
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setToBedId(b.id)}
                    className={`w-full flex items-center gap-3 p-2 rounded-xl border-2 transition-all text-left ${
                      selected
                        ? 'border-accent-500 bg-accent-50 ring-2 ring-accent-200'
                        : 'border-gray-100 hover:border-accent-200 hover:bg-accent-50/50'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      {b.photoUrl ? (
                        <img
                          src={b.photoUrl}
                          alt={`${b.room}室 ${b.bedNumber}号床`}
                          className="w-full h-full object-cover"
                          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <ImageIcon className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-gray-800">{b.room}室 #{b.bedNumber}</span>
                        <span className="text-xs text-gray-500">
                          {b.bunkType === 'upper' ? '上铺' : '下铺'}
                          {b.isWindowSide ? ' · 靠窗' : ''}
                        </span>
                      </div>
                    </div>
                    {selected && (
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-accent-500 flex items-center justify-center">
                        <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {toBedId > 0 && (() => {
              const bed = availableBeds.find(b => b.id === toBedId);
              if (!bed) return null;
              const dInfo = disinfectionLabels[bed.disinfectionStatus];
              return (
                <div className="rounded-xl border border-accent-200 bg-accent-50/50 p-2.5 mb-2">
                  <div className="flex gap-2.5">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      {bed.photoUrl ? (
                        <img
                          src={bed.photoUrl}
                          alt={`${bed.room}室 ${bed.bedNumber}号床`}
                          className="w-full h-full object-cover"
                          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <ImageIcon className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold font-display text-gray-800">{bed.room}室</span>
                        <span className="text-accent-600 font-semibold">#{bed.bedNumber}</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        <span className="tag bg-sky-100 text-sky-700 text-[10px]">
                          {bed.bunkType === 'upper' ? <ChevronUp className="w-2.5 h-2.5 inline mr-0.5" /> : <ChevronDown className="w-2.5 h-2.5 inline mr-0.5" />}
                          {bed.bunkType === 'upper' ? '上铺' : '下铺'}
                        </span>
                        {bed.isWindowSide && (
                          <span className="tag bg-amber-100 text-amber-700 text-[10px]">
                            <Sun className="w-2.5 h-2.5 inline mr-0.5" />靠窗
                          </span>
                        )}
                        <span className={`tag ${dInfo.color} text-[10px]`}>
                          {dInfo.label}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
          <div>
            <label className="label-field">换床原因</label>
            <textarea
              className="input-field min-h-20 resize-none"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="如身体不适、学生要求调整等"
            />
          </div>
          {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-xl flex items-center gap-1"><AlertCircle className="w-4 h-4" />{error}</p>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 btn-secondary">取消</button>
            <button type="submit" className="flex-1 btn-accent">确认换床</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CheckIn() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [list, setList] = useState<CheckInDetail[]>([]);
  const [beds, setBeds] = useState<Bed[]>([]);
  const [loading, setLoading] = useState(false);
  const [swapTarget, setSwapTarget] = useState<CheckInDetail | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [data, bedData] = await Promise.all([checkInsApi.list(date), bedsApi.list()]);
      setList(data);
      setBeds(bedData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [date]);

  const handleCheckIn = async (reservationId: number) => {
    await checkInsApi.checkIn(reservationId);
    loadData();
  };

  const handleAbsent = async (reservationId: number) => {
    if (!confirm('确认标记为未到吗？')) return;
    await checkInsApi.markAbsent(reservationId);
    loadData();
  };

  const stats = {
    total: list.length,
    checked: list.filter((x) => x.status === 'checked_in').length,
    absent: list.filter((x) => x.status === 'absent').length,
    pending: list.filter((x) => x.status === 'pending').length,
  };

  const handleCheckAll = async () => {
    const pending = list.filter((x) => x.status === 'pending');
    for (const item of pending) {
      await checkInsApi.checkIn(item.reservationId);
    }
    loadData();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold font-display text-gray-800 mb-1">签到管理</h1>
          <p className="text-gray-500">管理学生午休签到情况</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white rounded-2xl border border-gray-200 px-3 py-2">
            <CalendarDays className="w-4 h-4 text-gray-500" />
            <input type="date" className="bg-transparent outline-none text-sm" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <button onClick={loadData} className="btn-secondary">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />刷新
          </button>
          {stats.pending > 0 && (
            <button onClick={handleCheckAll} className="btn-primary">
              <CheckCircle2 className="w-4 h-4" />全部签到 ({stats.pending})
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: '总预约', value: stats.total, color: 'bg-gray-100 text-gray-700', icon: ClipboardCheck },
          { label: '已签到', value: stats.checked, color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
          { label: '未到', value: stats.absent, color: 'bg-red-100 text-red-700', icon: XCircle },
          { label: '待签到', value: stats.pending, color: 'bg-sky-100 text-sky-700', icon: ClipboardCheck },
        ].map((s, i) => (
          <div key={i} className="glass-card rounded-2xl p-4 animate-slide-up" style={{ animationDelay: `${i * 60}ms` }}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center`}>
                <s.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500">{s.label}</p>
                <p className="text-2xl font-bold font-display text-gray-800">{s.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center text-gray-500">
          <ClipboardCheck className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>当天暂无预约记录</p>
        </div>
      ) : (
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase">学生信息</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase">床位</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase">备注</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase">签到状态</th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-gray-600 uppercase">操作</th>
                </tr>
              </thead>
              <tbody>
                {list.map((item, idx) => {
                  const info = statusLabels[item.status];
                  return (
                    <tr key={item.id} className="border-b border-gray-50 hover:bg-primary-50/30 transition-colors animate-slide-up" style={{ animationDelay: `${idx * 30}ms` }}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold">
                            {item.reservation.studentName.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-800">{item.reservation.studentName}</div>
                            <div className="text-xs text-gray-500 flex items-center gap-1">
                              <User className="w-3 h-3" />{item.reservation.className}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-800">{item.reservation.bed?.room}室 #{item.reservation.bed?.bedNumber}</div>
                        <div className="text-xs text-gray-500">
                          {item.reservation.bed?.bunkType === 'upper' ? '上铺' : '下铺'}
                          {item.reservation.bed?.isWindowSide ? ' · 靠窗' : ''}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {item.reservation.allergyNote ? (
                          <span className="tag bg-accent-100 text-accent-700">过敏: {item.reservation.allergyNote}</span>
                        ) : <span className="text-gray-400 text-sm">-</span>}
                        {item.reservation.parentConfirmed && <span className="ml-2 tag bg-emerald-50 text-emerald-600">家长确认</span>}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`tag ${info.color}`}>{info.label}</span>
                        {item.checkInTime && (
                          <div className="text-xs text-gray-500 mt-1">{item.checkInTime.slice(11, 19)}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          {item.status === 'pending' && (
                            <>
                              <button onClick={() => handleCheckIn(item.reservationId)} className="px-3 py-1.5 rounded-xl text-xs font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />签到
                              </button>
                              <button onClick={() => handleAbsent(item.reservationId)} className="px-3 py-1.5 rounded-xl text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors flex items-center gap-1">
                                <XCircle className="w-3.5 h-3.5" />未到
                              </button>
                              <button onClick={() => setSwapTarget(item)} className="px-3 py-1.5 rounded-xl text-xs font-medium bg-violet-50 text-violet-700 hover:bg-violet-100 transition-colors flex items-center gap-1">
                                <ArrowLeftRight className="w-3.5 h-3.5" />换床
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {swapTarget && (
        <SwapModal
          checkIn={swapTarget}
          beds={beds}
          onClose={() => setSwapTarget(null)}
          onSwapped={loadData}
        />
      )}
    </div>
  );
}
