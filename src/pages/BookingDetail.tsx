import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Clock,
  Users,
  BookOpen,
  Volume2,
  Calendar,
  User,
  CheckCircle2,
  AlertTriangle,
  LogIn,
  LogOut,
  Wrench,
  Plus,
  Sparkles,
  Award,
} from 'lucide-react';
import { useStore, practiceTypeLabels, roomTypeLabels } from '../store';
import type { EquipmentIssue } from '../types';
import { format, parseISO, isToday } from 'date-fns';
import { zhCN } from 'date-fns/locale';

type IssueCategory = EquipmentIssue['category'];
type IssueSeverity = EquipmentIssue['severity'];

interface Props {
  onOpenFeedback: (bookingId: string) => void;
}

const categoryLabels: Record<IssueCategory, { label: string; icon: string }> = {
  keyboard: { label: '琴键/键盘', icon: '🎹' },
  drum: { label: '鼓具', icon: '🥁' },
  ac: { label: '空调', icon: '❄️' },
  speaker: { label: '音响/外放', icon: '🔊' },
  other: { label: '其他', icon: '🔧' },
};

const severityLabels: Record<IssueSeverity, { label: string; color: string }> = {
  low: { label: '轻微', color: 'bg-blue-100 text-blue-700' },
  medium: { label: '一般', color: 'bg-yellow-100 text-yellow-700' },
  high: { label: '严重', color: 'bg-red-100 text-red-700' },
};

const statusLabels: Record<string, { label: string; color: string; icon: string }> = {
  pending: { label: '待使用', color: 'bg-yellow-100 text-yellow-700', icon: '⏳' },
  in_use: { label: '使用中', color: 'bg-red-100 text-red-700', icon: '🔴' },
  completed: { label: '已完成', color: 'bg-green-100 text-green-700', icon: '✅' },
  cancelled: { label: '已取消', color: 'bg-gray-200 text-gray-500', icon: '❌' },
  needs_cleaning: { label: '待打扫', color: 'bg-orange-100 text-orange-700', icon: '🧹' },
};

export default function BookingDetail({ onOpenFeedback }: Props) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    bookings,
    rooms,
    equipmentIssues,
    feedbacks,
    isAdmin,
    isBookingOverdue,
    checkInBooking,
    checkOutBooking,
    cancelBooking,
    addEquipmentIssue,
    resolveEquipmentIssue,
    updateBookingStatus,
    checkOverdueBookings,
  } = useStore(s => ({
    bookings: s.bookings,
    rooms: s.rooms,
    equipmentIssues: s.equipmentIssues,
    feedbacks: s.feedbacks,
    isAdmin: s.isAdmin,
    isBookingOverdue: s.isBookingOverdue,
    checkInBooking: s.checkInBooking,
    checkOutBooking: s.checkOutBooking,
    cancelBooking: s.cancelBooking,
    addEquipmentIssue: s.addEquipmentIssue,
    resolveEquipmentIssue: s.resolveEquipmentIssue,
    updateBookingStatus: s.updateBookingStatus,
    checkOverdueBookings: s.checkOverdueBookings,
  }));

  const booking = bookings.find(b => b.id === id);
  const room = rooms.find(r => r.id === booking?.roomId);
  const feedback = feedbacks.find(f => f.bookingId === id);
  const roomIssues = useMemo(
    () => equipmentIssues.filter(e => e.roomId === booking?.roomId),
    [equipmentIssues, booking?.roomId]
  );

  const [, setTick] = useState(0);
  const [showIssueForm, setShowIssueForm] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [category, setCategory] = useState<IssueCategory>('other');
  const [severity, setSeverity] = useState<IssueSeverity>('medium');
  const [description, setDescription] = useState('');
  const [reportedBy, setReportedBy] = useState('管理员');
  const [resolveNote, setResolveNote] = useState('');
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const overdue = booking ? isBookingOverdue(booking.id) : { overdue: false, overdueMinutes: 0 };

  useEffect(() => {
    checkOverdueBookings();
    const interval = setInterval(() => {
      checkOverdueBookings();
      setTick(t => t + 1);
    }, 30000);
    return () => clearInterval(interval);
  }, [checkOverdueBookings]);

  if (!booking || !room) {
    return (
      <div className="space-y-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-gray-800">
          <ArrowLeft size={18} /> 返回
        </button>
        <div className="card p-12 text-center">
          <p className="text-gray-500">预约不存在</p>
        </div>
      </div>
    );
  }

  const statusInfo = statusLabels[booking.status] || statusLabels.pending;

  const handleCheckIn = () => {
    checkInBooking(booking.id);
    setToast('签到成功！');
    setTimeout(() => setToast(null), 2000);
  };

  const handleCheckOut = () => {
    checkOutBooking(booking.id);
    setToast('签退成功！');
    setTimeout(() => setToast(null), 2000);
  };

  const handleCheckOutWithFeedback = () => {
    checkOutBooking(booking.id);
    onOpenFeedback(booking.id);
  };

  const handleCancel = () => {
    cancelBooking(booking.id);
    setShowCancelConfirm(false);
    setToast('预约已取消');
    setTimeout(() => setToast(null), 2000);
  };

  const handleAddIssue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;
    addEquipmentIssue({
      roomId: room.id,
      reportedBy,
      category,
      description: description.trim(),
      severity,
    });
    setDescription('');
    setShowIssueForm(false);
    setToast('设备问题已记录');
    setTimeout(() => setToast(null), 2000);
  };

  const InfoRow = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) => (
    <div className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
      <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center text-gray-500 flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-base font-medium text-gray-800 mt-0.5">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-4 pb-6">
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-5 py-3 bg-indigo-600 text-white rounded-xl shadow-lg text-sm">
          {toast}
        </div>
      )}

      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-gray-800">
        <ArrowLeft size={18} /> 返回
      </button>

      <div className="card p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-800">{room.name}</h1>
            <p className="text-sm text-gray-500 mt-0.5">{roomTypeLabels[room.type]} · {room.floor}</p>
          </div>
          <span className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5 ${statusInfo.color}`}>
            <span>{statusInfo.icon}</span>
            {statusInfo.label}
          </span>
        </div>

        {overdue.overdue && booking.status === 'in_use' && (
          <div className="mb-4 p-4 bg-red-50 border-2 border-red-400 rounded-xl flex items-start gap-3 animate-pulse">
            <AlertTriangle size={22} className="text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-700 font-semibold">
                ⚠️ 已超时 {overdue.overdueMinutes} 分钟未签退！
              </p>
              <p className="text-red-600 text-sm mt-0.5">
                预约 {booking.startTime}-{booking.endTime} 已结束，请及时签退释放房间，避免影响后续预约
              </p>
            </div>
          </div>
        )}

        <div className="divide-y divide-gray-50">
          <InfoRow icon={<Calendar size={18} />} label="预约日期" value={
            isToday(parseISO(booking.date))
              ? `今天 · ${format(parseISO(booking.date), 'MM月dd日 (EEEE)', { locale: zhCN })}`
              : format(parseISO(booking.date), 'yyyy年MM月dd日 (EEEE)', { locale: zhCN })
          } />
          <InfoRow icon={<Clock size={18} />} label="使用时间" value={`${booking.startTime} - ${booking.endTime}`} />
          <InfoRow icon={<User size={18} />} label="预约人" value={booking.userName} />
          <InfoRow icon={<Award size={18} />} label="练习类型" value={practiceTypeLabels[booking.practiceType]} />
          <InfoRow icon={<Users size={18} />} label="练习人数" value={`${booking.peopleCount} 人（房间最多 ${room.capacity} 人）`} />
          <InfoRow icon={<BookOpen size={18} />} label="谱架" value={booking.needMusicStand ? '需要' : '不需要'} />
          <InfoRow icon={<Volume2 size={18} />} label="外放设备" value={booking.hasExternalSpeaker ? '携带外放设备' : '不需要'} />
        </div>
      </div>

      <div className="card p-5">
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Clock size={18} className="text-indigo-500" /> 签到签退记录
        </h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${booking.checkInTime ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
              <LogIn size={18} />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-800">签到</p>
              <p className="text-sm text-gray-500">
                {booking.checkInTime ? `${booking.date} ${booking.checkInTime}` : '尚未签到'}
              </p>
            </div>
            {booking.checkInTime && (
              <CheckCircle2 size={20} className="text-green-500" />
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${booking.checkOutTime ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
              <LogOut size={18} />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-800">签退</p>
              <p className="text-sm text-gray-500">
                {booking.checkOutTime ? `${booking.date} ${booking.checkOutTime}` : '尚未签退'}
              </p>
            </div>
            {booking.checkOutTime && (
              <CheckCircle2 size={20} className="text-green-500" />
            )}
          </div>
        </div>
      </div>

      {feedback && (
        <div className="card p-5">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Sparkles size={18} className="text-yellow-500" /> 使用评价
          </h3>
          <div className="grid grid-cols-4 gap-3 mb-4">
            <RatingItem label="隔音" value={feedback.noiseRating} />
            <RatingItem label="卫生" value={feedback.cleanlinessRating} />
            <RatingItem label="设备" value={feedback.equipmentRating} />
            <RatingItem label="总体" value={feedback.overallRating} />
          </div>
          {(feedback.noiseIssue || feedback.cleanlinessIssue || feedback.equipmentIssue || feedback.comments) && (
            <div className="p-3 bg-gray-50 rounded-xl space-y-2">
              {feedback.noiseIssue && (
                <p className="text-sm text-gray-600"><span className="font-medium">隔音问题：</span>{feedback.noiseIssue}</p>
              )}
              {feedback.cleanlinessIssue && (
                <p className="text-sm text-gray-600"><span className="font-medium">卫生问题：</span>{feedback.cleanlinessIssue}</p>
              )}
              {feedback.equipmentIssue && (
                <p className="text-sm text-gray-600"><span className="font-medium">设备问题：</span>{feedback.equipmentIssue}</p>
              )}
              {feedback.comments && (
                <p className="text-sm text-gray-600"><span className="font-medium">备注：</span>{feedback.comments}</p>
              )}
            </div>
          )}
        </div>
      )}

      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <Wrench size={18} className="text-orange-500" /> 设备问题记录
            <span className="text-xs font-normal text-gray-500">({roomIssues.length} 条)</span>
          </h3>
          {isAdmin && (
            <button
              onClick={() => setShowIssueForm(true)}
              className="text-sm flex items-center gap-1.5 text-indigo-600 hover:text-indigo-700"
            >
              <Plus size={16} /> 添加
            </button>
          )}
        </div>

        {roomIssues.length === 0 ? (
          <div className="py-8 text-center text-gray-400 text-sm">
            暂无设备问题记录 ✨
          </div>
        ) : (
          <div className="space-y-2">
            {roomIssues.slice().sort((a, b) => (a.resolved ? 1 : 0) - (b.resolved ? 1 : 0)).map(issue => (
              <div
                key={issue.id}
                className={`p-3 rounded-xl border transition-all ${
                  issue.resolved
                    ? 'bg-gray-50 border-gray-200 opacity-70'
                    : `bg-white border-gray-200 ${
                        issue.severity === 'high' ? 'border-l-4 border-l-red-500' :
                        issue.severity === 'medium' ? 'border-l-4 border-l-yellow-500' :
                        'border-l-4 border-l-blue-500'
                      }`
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span>{categoryLabels[issue.category].icon}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${severityLabels[issue.severity].color}`}>
                        {severityLabels[issue.severity].label}
                      </span>
                      <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                        {categoryLabels[issue.category].label}
                      </span>
                      {issue.resolved && (
                        <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full flex items-center gap-1">
                          <CheckCircle2 size={10} /> 已解决
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-700">{issue.description}</p>
                    <div className="text-xs text-gray-400 mt-1.5 flex items-center gap-2">
                      <span>上报人：{issue.reportedBy}</span>
                      <span>·</span>
                      <span>{format(new Date(issue.reportedAt), 'MM-dd HH:mm', { locale: zhCN })}</span>
                      {issue.resolved && issue.resolvedNote && (
                        <>
                          <span>·</span>
                          <span className="text-green-600">处理：{issue.resolvedNote}</span>
                        </>
                      )}
                    </div>
                  </div>
                  {isAdmin && !issue.resolved && (
                    <div>
                      {resolvingId !== issue.id ? (
                        <button
                          onClick={() => { setResolvingId(issue.id); setResolveNote(''); }}
                          className="text-sm text-green-600 hover:text-green-700 whitespace-nowrap"
                        >
                          标记解决
                        </button>
                      ) : (
                        <div className="flex flex-col gap-2 items-end">
                          <input
                            type="text"
                            placeholder="处理备注"
                            value={resolveNote}
                            onChange={e => setResolveNote(e.target.value)}
                            className="input !py-1 !text-sm !w-32"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                resolveEquipmentIssue(issue.id, resolveNote || '已修复');
                                setResolvingId(null);
                                setToast('问题已标记为已解决');
                                setTimeout(() => setToast(null), 2000);
                              }}
                              className="text-xs text-green-600 font-medium"
                            >
                              确认
                            </button>
                            <button
                              onClick={() => setResolvingId(null)}
                              className="text-xs text-gray-500"
                            >
                              取消
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="sticky bottom-20 bg-white/80 backdrop-blur-sm p-4 -mx-4 rounded-t-2xl border-t border-gray-100">
        <div className="flex gap-3">
          {booking.status === 'pending' && (
            <>
              <button
                onClick={handleCheckIn}
                className="btn-success flex-1 py-3 flex items-center justify-center gap-2"
              >
                <LogIn size={18} /> 签到使用
              </button>
              <button
                onClick={() => setShowCancelConfirm(true)}
                className="btn-danger flex-1 py-3 flex items-center justify-center gap-2"
              >
                取消预约
              </button>
            </>
          )}
          {booking.status === 'in_use' && (
            <>
              <button
                onClick={handleCheckOut}
                className="btn-primary flex-1 py-3 flex items-center justify-center gap-2"
              >
                <LogOut size={18} /> 签退
              </button>
              <button
                onClick={handleCheckOutWithFeedback}
                className="btn-secondary flex-1 py-3 flex items-center justify-center gap-2"
              >
                <Sparkles size={18} /> 签退并评价
              </button>
            </>
          )}
          {booking.status === 'needs_cleaning' && isAdmin && (
            <button
              onClick={() => { updateBookingStatus(booking.id, 'completed'); onOpenFeedback(booking.id); }}
              className="btn-primary flex-1 py-3 flex items-center justify-center gap-2"
            >
              <Sparkles size={18} /> 打扫并完成
            </button>
          )}
          {(booking.status === 'completed' || booking.status === 'needs_cleaning') && !feedback && (
            <button
              onClick={() => onOpenFeedback(booking.id)}
              className="btn-primary flex-1 py-3 flex items-center justify-center gap-2"
            >
              <Sparkles size={18} /> 写评价
            </button>
          )}
          {booking.status === 'cancelled' && (
            <button
              onClick={() => navigate('/booking')}
              className="btn-primary flex-1 py-3 flex items-center justify-center gap-2"
            >
              重新预约
            </button>
          )}
        </div>
      </div>

      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">确认取消预约？</h3>
            <p className="text-gray-500 text-sm mb-6">
              取消后该时段将释放给其他用户，确定要取消 {room.name} 的预约吗？
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowCancelConfirm(false)} className="btn-secondary flex-1">
                再想想
              </button>
              <button onClick={handleCancel} className="btn-danger flex-1">
                确认取消
              </button>
            </div>
          </div>
        </div>
      )}

      {showIssueForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white rounded-t-2xl">
              <h3 className="text-lg font-semibold text-gray-800">记录设备问题</h3>
              <button onClick={() => setShowIssueForm(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                ✕
              </button>
            </div>
            <form onSubmit={handleAddIssue} className="p-6 space-y-4">
              <div>
                <label className="label">问题类别</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {(Object.keys(categoryLabels) as IssueCategory[]).map(cat => (
                    <button
                      type="button"
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                        category === cat
                          ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                          : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <span className="mr-1">{categoryLabels[cat].icon}</span>
                      {categoryLabels[cat].label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label">严重程度</label>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.keys(severityLabels) as IssueSeverity[]).map(sev => (
                    <button
                      type="button"
                      key={sev}
                      onClick={() => setSeverity(sev)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        severity === sev
                          ? severityLabels[sev].color
                          : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {severityLabels[sev].label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label">问题描述</label>
                <textarea
                  className="input min-h-[90px] resize-none"
                  placeholder="例如：第3个八度的do琴键回弹不灵敏 / 地鼓鼓皮松动，需要重新调音 / 空调制冷效果差..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="label">上报人</label>
                <input
                  type="text"
                  className="input"
                  value={reportedBy}
                  onChange={e => setReportedBy(e.target.value)}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowIssueForm(false)} className="btn-secondary flex-1">
                  取消
                </button>
                <button type="submit" className="btn-primary flex-1">
                  提交记录
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showFeedback && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={e => { if (e.target === e.currentTarget) setShowFeedback(false); }}
        >
          <FeedbackInline bookingId={booking.id} roomId={room.id} onClose={() => setShowFeedback(false)} />
        </div>
      )}
    </div>
  );
}

function RatingItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center">
      <div className="text-xl font-bold text-gray-800">{value}.0</div>
      <div className="text-xs text-gray-500 mt-0.5">{label}</div>
    </div>
  );
}

function FeedbackInline({ bookingId, roomId, onClose }: { bookingId: string; roomId: string; onClose: () => void }) {
  const addFeedback = useStore(s => s.addFeedback);
  const updateBookingStatus = useStore(s => s.updateBookingStatus);

  const [noiseRating, setNoiseRating] = useState(5);
  const [cleanlinessRating, setCleanlinessRating] = useState(5);
  const [equipmentRating, setEquipmentRating] = useState(5);
  const [overallRating, setOverallRating] = useState(5);
  const [noiseIssue, setNoiseIssue] = useState('');
  const [cleanlinessIssue, setCleanlinessIssue] = useState('');
  const [equipmentIssue, setEquipmentIssue] = useState('');
  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    addFeedback({
      bookingId,
      roomId,
      noiseRating,
      cleanlinessRating,
      equipmentRating,
      overallRating,
      noiseIssue: noiseIssue || undefined,
      cleanlinessIssue: cleanlinessIssue || undefined,
      equipmentIssue: equipmentIssue || undefined,
      comments: comments || undefined,
    });
    updateBookingStatus(bookingId, 'completed');
    setTimeout(() => {
      setSubmitting(false);
      onClose();
    }, 500);
  };

  const StarRating = ({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) => (
    <div className="mb-4">
      <label className="label">{label}</label>
      <div className="flex gap-1 mt-1">
        {[1, 2, 3, 4, 5].map(n => (
          <button
            type="button"
            key={n}
            onClick={() => onChange(n)}
            className="p-1 transition-transform hover:scale-110"
          >
            <svg
              width={28}
              height={28}
              viewBox="0 0 24 24"
              fill={n <= value ? '#facc15' : 'none'}
              stroke={n <= value ? '#facc15' : '#d1d5db'}
              strokeWidth={2}
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
      <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
        <h3 className="text-lg font-semibold text-gray-800">使用反馈</h3>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
          ✕
        </button>
      </div>
      <form onSubmit={handleSubmit} className="p-6">
        <StarRating value={noiseRating} onChange={setNoiseRating} label="隔音效果" />
        <input
          type="text"
          className="input mb-3"
          placeholder="隔音问题描述（可选）"
          value={noiseIssue}
          onChange={e => setNoiseIssue(e.target.value)}
        />

        <StarRating value={cleanlinessRating} onChange={setCleanlinessRating} label="卫生状况" />
        <input
          type="text"
          className="input mb-3"
          placeholder="卫生问题描述（可选）"
          value={cleanlinessIssue}
          onChange={e => setCleanlinessIssue(e.target.value)}
        />

        <StarRating value={equipmentRating} onChange={setEquipmentRating} label="设备状态" />
        <input
          type="text"
          className="input mb-3"
          placeholder="设备问题描述（如琴键/鼓皮/空调等，可选）"
          value={equipmentIssue}
          onChange={e => setEquipmentIssue(e.target.value)}
        />

        <StarRating value={overallRating} onChange={setOverallRating} label="总体评价" />

        <div className="mb-4">
          <label className="label">其他备注</label>
          <textarea
            className="input min-h-[80px] resize-none"
            placeholder="其他建议或意见"
            value={comments}
            onChange={e => setComments(e.target.value)}
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">
            取消
          </button>
          <button type="submit" className="btn-primary flex-1" disabled={submitting}>
            {submitting ? '提交中...' : '提交反馈'}
          </button>
        </div>
      </form>
    </div>
  );
}
