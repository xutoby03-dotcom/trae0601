import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  ArrowLeft, MapPin, User, Wrench, Clock, AlertTriangle, Send, Star, ImagePlus, X,
  Calendar, MessageSquare, Image, TrendingUp, Camera, ChevronDown, ChevronUp,
} from 'lucide-react';
import { useTicketStore } from '@/store/useTicketStore';
import TicketTimeline from '@/components/TicketTimeline';
import { StatusBadge, UrgencyBadge } from '@/components/StatusBadge';
import { formatDateTime, formatFullDate } from '@/utils/format';
import type { TicketStatus } from '@/types';
import { WORKERS, STATUS_LABEL } from '@/types';

const nextStatusMap: Record<TicketStatus, { to: TicketStatus; label: string }[]> = {
  pending: [{ to: 'processing', label: '接单并开始处理' }],
  processing: [
    { to: 'waiting_parts', label: '需要配件，暂停处理' },
    { to: 'completed', label: '维修完成' },
  ],
  waiting_parts: [{ to: 'processing', label: '配件到位，继续处理' }],
  completed: [],
};

export default function TicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { tickets, role, currentUserName, updateTicketStatus, assignWorker, addMessage, addReview, addJumpReason, getTicketById } = useTicketStore();
  const ticket = getTicketById(id || '') || tickets[0];

  const [message, setMessage] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewPhotos, setReviewPhotos] = useState<string[]>([]);
  const [jumpReason, setJumpReason] = useState('');
  const [showJumpModal, setShowJumpModal] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [expandedPhotos, setExpandedPhotos] = useState(true);

  if (!ticket) {
    return (
      <div className="container py-16 text-center">
        <p className="text-ink-400">工单不存在</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-teal-600">返回</button>
      </div>
    );
  }

  const sendMsg = () => {
    if (!message.trim()) return;
    const sender = role === 'worker' ? 'worker' : role === 'admin' ? 'system' : 'student';
    const senderName = role === 'worker' ? (ticket.assignedWorker || currentUserName) : role === 'admin' ? '管理员' : currentUserName;
    addMessage(ticket.id, { sender, senderName, content: message });
    setMessage('');
  };

  const submitReview = () => {
    if (!reviewComment.trim() && reviewPhotos.length === 0) {
      alert('请填写评价或上传现场照片');
      return;
    }
    addReview(ticket.id, {
      rating: reviewRating,
      comment: reviewComment,
      photos: reviewPhotos.map((url, i) => ({
        id: 'rp-' + i,
        url,
        uploadedAt: new Date().toISOString(),
        uploader: 'student',
      })),
    });
    setShowReviewForm(false);
  };

  const submitJump = () => {
    if (!jumpReason.trim()) {
      alert('插队必须填写原因');
      return;
    }
    addJumpReason(ticket.id, { reason: jumpReason, operator: role === 'admin' ? '管理员' : currentUserName });
    setJumpReason('');
    setShowJumpModal(false);
  };

  const handleStatusChange = (next: TicketStatus) => {
    if (next === 'processing' && !ticket.assignedWorker) {
      const worker = currentUserName || WORKERS[0];
      assignWorker(ticket.id, worker);
      updateTicketStatus(ticket.id, next, worker);
    } else {
      updateTicketStatus(ticket.id, next, ticket.assignedWorker || currentUserName);
    }
  };

  const addReviewPhoto = () => {
    if (reviewPhotos.length >= 3) return;
    setReviewPhotos((prev) => [
      ...prev,
      `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=repaired%20dormitory%20room%20clean&image_size=square`,
    ]);
  };

  const nextOptions = nextStatusMap[ticket.status];
  const canReview = ticket.status === 'completed' && !ticket.review && role === 'student';
  const canJumpQueue = ticket.status === 'pending' && (role === 'admin' || role === 'worker') && ticket.urgency !== 'urgent';

  return (
    <div className="min-h-screen grain-bg">
      <div className="container py-6 relative z-10">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-ink-400 hover:text-teal-700 mb-6 text-sm font-medium transition-colors">
          <ArrowLeft className="w-4 h-4" />
          返回
        </button>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-card border border-teal-600/8 overflow-hidden">
              <div className="p-6 bg-gradient-to-br from-teal-50 to-cream-50 border-b border-teal-600/8">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h1 className="font-display text-2xl font-bold text-ink-500">{ticket.faultType}</h1>
                      <StatusBadge status={ticket.status} />
                      <UrgencyBadge urgency={ticket.urgency} />
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-300">
                      <span className="inline-flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{ticket.building} {ticket.room}</span>
                      <span className="inline-flex items-center gap-1"><User className="w-3.5 h-3.5" />报修人 {ticket.studentName}</span>
                      <span className="inline-flex items-center gap-1"><Clock className="w-3.5 h-3.5" />提交 {formatDateTime(ticket.createdAt)}</span>
                      {ticket.assignedWorker && (
                        <span className="inline-flex items-center gap-1"><Wrench className="w-3.5 h-3.5" />维修员 {ticket.assignedWorker}</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-ink-200">工单号</div>
                    <div className="font-mono font-bold text-ink-500">{ticket.id}</div>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-5">
                <div>
                  <div className="text-xs font-semibold text-ink-300 uppercase tracking-wider mb-2">故障描述</div>
                  <p className="text-ink-500 leading-relaxed">{ticket.description}</p>
                </div>

                {ticket.availableTimes.length > 0 && (
                  <div>
                    <div className="text-xs font-semibold text-ink-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />可上门时间
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {ticket.availableTimes.map((t) => (
                        <span key={t} className="text-xs px-3 py-1.5 rounded-lg bg-cream-100 text-ink-400 border border-teal-600/5">{t}</span>
                      ))}
                    </div>
                  </div>
                )}

                {ticket.photos.length > 0 && (
                  <div>
                    <button
                      onClick={() => setExpandedPhotos((v) => !v)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-ink-300 uppercase tracking-wider mb-2"
                    >
                      <Image className="w-3.5 h-3.5" />现场照片（{ticket.photos.length}张）
                      {expandedPhotos ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                    {expandedPhotos && (
                      <div className="flex flex-wrap gap-3">
                        {ticket.photos.map((p) => (
                          <a key={p.id} href={p.url} target="_blank" rel="noreferrer" className="group relative w-28 h-28 rounded-xl overflow-hidden border border-teal-600/10">
                            <img src={p.url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {ticket.jumpReasons.length > 0 && (
                  <div className="p-4 rounded-xl bg-orange-50 border border-orange-200">
                    <div className="flex items-start gap-2">
                      <TrendingUp className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-xs font-semibold text-orange-700 mb-1">紧急插队记录</div>
                        {ticket.jumpReasons.map((jr, idx) => (
                          <div key={idx} className="text-sm text-orange-800">
                            {jr.reason} <span className="text-xs text-orange-500">— {jr.operator} · {formatDateTime(jr.timestamp)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {(role === 'worker' || role === 'admin') && (
                  <div className="pt-4 border-t border-teal-600/5 flex flex-wrap gap-2">
                    {nextOptions.map((opt) => (
                      <button
                        key={opt.to}
                        onClick={() => handleStatusChange(opt.to)}
                        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                          opt.to === 'completed'
                            ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-card hover:shadow-cardHover'
                            : opt.to === 'waiting_parts'
                            ? 'bg-gradient-to-r from-violet-500 to-violet-600 text-white shadow-card hover:shadow-cardHover'
                            : 'bg-gradient-to-r from-teal-600 to-teal-700 text-white shadow-card hover:shadow-cardHover'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                    {canJumpQueue && (
                      <button
                        onClick={() => setShowJumpModal(true)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-orange-500 to-orange-400 text-white shadow-card hover:shadow-cardHover transition-all"
                      >
                        <AlertTriangle className="w-4 h-4" />
                        紧急插队
                      </button>
                    )}
                    {role === 'worker' && ticket.status === 'pending' && (
                      <div className="w-full mt-2">
                        <label className="text-xs font-semibold text-ink-300 mb-1.5 block">选择维修员</label>
                        <div className="flex flex-wrap gap-2">
                          {WORKERS.map((w) => (
                            <button
                              key={w}
                              onClick={() => assignWorker(ticket.id, w)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                                ticket.assignedWorker === w
                                  ? 'bg-teal-600 text-white border-teal-600'
                                  : 'bg-cream-50 text-ink-400 border-teal-600/10 hover:bg-teal-50'
                              }`}
                            >
                              {w}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-card border border-teal-600/8 p-6">
              <h2 className="font-display text-lg font-bold text-ink-500 mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-teal-600" />留言与沟通
              </h2>
              <div className="space-y-3 mb-4 max-h-72 overflow-y-auto pr-2">
                {ticket.messages.map((m) => (
                  <div key={m.id} className={`flex ${m.sender === (role === 'student' ? 'student' : role) ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm ${
                        m.sender === 'system'
                          ? 'bg-cream-100 text-ink-300 text-xs italic text-center w-full mx-auto'
                          : m.sender === 'worker'
                          ? 'bg-teal-50 text-ink-500 border border-teal-200'
                          : 'bg-teal-600 text-white'
                      }`}
                    >
                      {m.sender !== 'system' && (
                        <div className={`text-[10px] font-semibold mb-1 ${m.sender === 'student' ? 'text-teal-100' : 'text-teal-700'}`}>
                          {m.senderName}
                        </div>
                      )}
                      <div>{m.content}</div>
                      <div className={`text-[10px] mt-1 ${m.sender === 'system' ? '' : m.sender === 'student' ? 'text-teal-100' : 'text-ink-200'}`}>
                        {formatDateTime(m.timestamp)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMsg()}
                  placeholder="输入消息..."
                  className="flex-1 px-4 py-3 rounded-xl bg-cream-50 border border-teal-600/10 text-ink-500 placeholder:text-ink-200 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all text-sm"
                />
                <button
                  onClick={sendMsg}
                  className="px-5 py-3 rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 text-white font-medium shadow-card hover:shadow-cardHover transition-all flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                  发送
                </button>
              </div>
            </div>

            {ticket.review && (
              <div className="bg-white rounded-2xl shadow-card border border-teal-600/8 p-6">
                <h2 className="font-display text-lg font-bold text-ink-500 mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-orange-500" />维修评价
                </h2>
                <div className="flex items-center gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star key={n} className={`w-5 h-5 ${n <= ticket.review!.rating ? 'text-orange-500 fill-orange-500' : 'text-ink-100'}`} />
                  ))}
                  <span className="ml-2 text-sm text-ink-400">{ticket.review.rating}/5 分</span>
                </div>
                {ticket.review.comment && (
                  <p className="text-sm text-ink-500 mb-3 leading-relaxed">{ticket.review.comment}</p>
                )}
                {ticket.review.photos.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {ticket.review.photos.map((p) => (
                      <a key={p.id} href={p.url} target="_blank" rel="noreferrer" className="w-20 h-20 rounded-lg overflow-hidden border border-teal-600/10">
                        <img src={p.url} alt="" className="w-full h-full object-cover" />
                      </a>
                    ))}
                  </div>
                )}
                <div className="text-xs text-ink-200 mt-3">评价时间：{formatFullDate(ticket.review.createdAt)}</div>
              </div>
            )}

            {canReview && !showReviewForm && (
              <button
                onClick={() => setShowReviewForm(true)}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-teal-600 to-teal-700 text-white font-semibold shadow-card hover:shadow-cardHover hover:translate-y-[-1px] transition-all flex items-center justify-center gap-2"
              >
                <Star className="w-5 h-5" />
                填写评价并上传现场照片
              </button>
            )}

            {showReviewForm && (
              <div className="bg-white rounded-2xl shadow-card border border-teal-600/8 p-6 animate-slide-up">
                <h2 className="font-display text-lg font-bold text-ink-500 mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-orange-500" />完成评价
                </h2>
                <div className="mb-4">
                  <div className="text-sm font-semibold text-ink-500 mb-2">服务评分</div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        onClick={() => setReviewRating(n)}
                        className="p-1 transition-transform hover:scale-110"
                      >
                        <Star className={`w-8 h-8 ${n <= reviewRating ? 'text-orange-500 fill-orange-500' : 'text-ink-100'}`} />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mb-4">
                  <div className="text-sm font-semibold text-ink-500 mb-2">评价内容</div>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    rows={3}
                    placeholder="请描述维修体验..."
                    className="w-full px-4 py-3 rounded-xl bg-cream-50 border border-teal-600/10 text-ink-500 placeholder:text-ink-200 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all resize-none text-sm"
                  />
                </div>
                <div className="mb-5">
                  <div className="text-sm font-semibold text-ink-500 mb-2 flex items-center gap-2">
                    <Camera className="w-4 h-4" />现场照片（最多3张）
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {reviewPhotos.map((url, idx) => (
                      <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border border-teal-600/10">
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        <button
                          onClick={() => setReviewPhotos((p) => p.filter((_, i) => i !== idx))}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    {reviewPhotos.length < 3 && (
                      <button
                        onClick={addReviewPhoto}
                        className="w-20 h-20 rounded-lg border-2 border-dashed border-teal-600/20 flex flex-col items-center justify-center text-ink-200 hover:text-teal-600 hover:border-teal-500 transition-all"
                      >
                        <ImagePlus className="w-5 h-5" />
                        <span className="text-[10px] mt-0.5">添加</span>
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowReviewForm(false)}
                    className="flex-1 py-3 rounded-xl bg-cream-100 text-ink-400 font-semibold hover:bg-cream-200 transition-all"
                  >
                    取消
                  </button>
                  <button
                    onClick={submitReview}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 text-white font-semibold shadow-card hover:shadow-cardHover transition-all"
                  >
                    提交评价
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {ticket.status === 'pending' && ticket.queuePosition && (
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-card p-6 text-white animate-fade-in">
                <div className="text-xs font-semibold opacity-80 uppercase tracking-wider mb-1">当前排队</div>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="font-display text-5xl font-bold">#{ticket.queuePosition}</span>
                  <span className="text-sm opacity-80">位</span>
                </div>
                <div className="text-xs opacity-80">
                  {ticket.urgency === 'urgent' ? '已标记紧急，将优先处理' : '预计 ' + (ticket.queuePosition * 2) + ' 小时内接单'}
                </div>
              </div>
            )}
            {ticket.estimatedArrival && ticket.status !== 'completed' && (
              <div className="bg-gradient-to-br from-teal-500 to-teal-700 rounded-2xl shadow-card p-6 text-white animate-fade-in">
                <div className="text-xs font-semibold opacity-80 uppercase tracking-wider mb-1">预计上门</div>
                <div className="font-display text-2xl font-bold mb-1">{formatDateTime(ticket.estimatedArrival)}</div>
                <div className="text-xs opacity-80">由 {ticket.assignedWorker || '维修员'} 负责</div>
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-card border border-teal-600/8 p-6">
              <h2 className="font-display text-lg font-bold text-ink-500 mb-5">处理进度</h2>
              <TicketTimeline ticket={ticket} />
            </div>
          </div>
        </div>
      </div>

      {showJumpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-500/50 backdrop-blur-sm p-4" onClick={() => setShowJumpModal(false)}>
          <div className="bg-white rounded-2xl shadow-card p-6 max-w-md w-full animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h3 className="font-display text-xl font-bold text-ink-500">紧急插队</h3>
                <p className="text-xs text-ink-300">此工单将被标记为紧急并优先排队</p>
              </div>
            </div>
            <div className="mb-5">
              <label className="text-sm font-semibold text-ink-500 mb-2 block">插队原因 <span className="text-orange-500">*</span></label>
              <textarea
                value={jumpReason}
                onChange={(e) => setJumpReason(e.target.value)}
                rows={3}
                placeholder="请说明为何需要优先处理此工单..."
                className="w-full px-4 py-3 rounded-xl bg-cream-50 border border-teal-600/10 text-ink-500 placeholder:text-ink-200 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all resize-none text-sm"
              />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowJumpModal(false)} className="flex-1 py-3 rounded-xl bg-cream-100 text-ink-400 font-semibold hover:bg-cream-200 transition-all">
                取消
              </button>
              <button onClick={submitJump} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold shadow-card hover:shadow-cardHover transition-all">
                确认插队
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
