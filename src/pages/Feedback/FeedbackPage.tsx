import { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Star, 
  ThumbsUp, 
  ThumbsDown, 
  Camera,
  Send,
  Filter,
  Check
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import Avatar from '../../components/Avatar';
import Modal from '../../components/Modal';
import { POSITIVE_TAGS, NEGATIVE_TAGS } from '../../../shared/constants';
import { formatDateTime } from '../../utils/format';
import type { Feedback } from '../../../shared/types';

export default function FeedbackPage() {
  const { 
    feedbackList, 
    sessions, 
    guests,
    loading, 
    fetchFeedback, 
    fetchSessions,
    fetchGuests,
    addFeedback,
    markFeedbackFollowedUp
  } = useAppStore();

  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGuestId, setSelectedGuestId] = useState('');
  
  const [formData, setFormData] = useState({
    tasteScore: 4,
    serviceScore: 4,
    flowScore: 4,
    priceAcceptance: 4,
    positiveTags: [] as string[],
    negativeTags: [] as string[],
    comment: '',
  });

  useEffect(() => {
    fetchSessions();
    fetchFeedback();
    fetchGuests();
  }, [fetchSessions, fetchFeedback, fetchGuests]);

  useEffect(() => {
    if (selectedSessionId) {
      fetchFeedback({ sessionId: selectedSessionId });
    } else {
      fetchFeedback();
    }
  }, [fetchFeedback, selectedSessionId]);

  const availableGuestsForFeedback = guests.filter(g => 
    g.status === 'checked_in' || g.status === 'left'
  );

  const handleOpenModal = () => {
    setFormData({
      tasteScore: 4,
      serviceScore: 4,
      flowScore: 4,
      priceAcceptance: 4,
      positiveTags: [],
      negativeTags: [],
      comment: '',
    });
    setSelectedGuestId(availableGuestsForFeedback[0]?.id || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGuestId) {
      alert('请选择客人');
      return;
    }

    const guest = guests.find(g => g.id === selectedGuestId);
    if (!guest) return;

    try {
      await addFeedback({
        guestId: selectedGuestId,
        sessionId: guest.sessionId,
        tasteScore: formData.tasteScore,
        serviceScore: formData.serviceScore,
        flowScore: formData.flowScore,
        priceAcceptance: formData.priceAcceptance,
        positiveTags: formData.positiveTags,
        negativeTags: formData.negativeTags,
        photos: [],
        comment: formData.comment,
        isFollowedUp: false,
      });
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    }
  };

  const toggleTag = (tag: string, type: 'positive' | 'negative') => {
    if (type === 'positive') {
      setFormData(prev => ({
        ...prev,
        positiveTags: prev.positiveTags.includes(tag)
          ? prev.positiveTags.filter(t => t !== tag)
          : [...prev.positiveTags, tag]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        negativeTags: prev.negativeTags.includes(tag)
          ? prev.negativeTags.filter(t => t !== tag)
          : [...prev.negativeTags, tag]
      }));
    }
  };

  const handleFollowUp = async (id: string) => {
    try {
      await markFeedbackFollowedUp(id);
    } catch (error) {
      console.error('Failed to mark follow up:', error);
    }
  };

  const getGuestName = (guestId: string) => {
    return guests.find(g => g.id === guestId)?.name || '未知';
  };

  const getSessionName = (sessionId: string) => {
    return sessions.find(s => s.id === sessionId)?.name || '未知场次';
  };

  const avgScore = feedbackList.length > 0
    ? (feedbackList.reduce((sum, f) => 
        sum + (f.tasteScore + f.serviceScore + f.flowScore + f.priceAcceptance) / 4, 0
      ) / feedbackList.length).toFixed(1)
    : '0.0';

  return (
    <div className="space-y-6">
      {/* 顶部筛选和操作 */}
      <div className="card">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-warm-500" />
            <select
              value={selectedSessionId}
              onChange={(e) => setSelectedSessionId(e.target.value)}
              className="input-field w-48"
            >
              <option value="">全部场次</option>
              {sessions.map(session => (
                <option key={session.id} value={session.id}>{session.name}</option>
              ))}
            </select>
          </div>
          
          <div className="ml-auto flex items-center gap-3">
            <div className="text-sm text-brown-600">
              共 <span className="font-semibold text-brown-800">{feedbackList.length}</span> 条反馈
            </div>
            <button 
              onClick={handleOpenModal}
              className="btn-primary flex items-center gap-2"
            >
              <MessageSquare size={18} />
              录入反馈
            </button>
          </div>
        </div>
      </div>

      {/* 评分概览 */}
      <div className="grid grid-cols-5 gap-4">
        <div className="stat-card col-span-1">
          <div className="text-center">
            <p className="text-sm text-brown-500">综合评分</p>
            <div className="flex items-baseline justify-center gap-1 mt-2">
              <span className="text-4xl font-semibold text-primary-600">{avgScore}</span>
              <span className="text-sm text-brown-400">/ 5.0</span>
            </div>
            <div className="flex items-center justify-center gap-1 mt-2">
              {[1, 2, 3, 4, 5].map(i => (
                <Star
                  key={i}
                  size={16}
                  className={i <= Math.round(Number(avgScore)) ? 'text-amber-400 fill-amber-400' : 'text-warm-200'}
                />
              ))}
            </div>
          </div>
        </div>
        
        <ScoreCard label="口味" score={calculateAvgScore(feedbackList, 'tasteScore')} />
        <ScoreCard label="服务" score={calculateAvgScore(feedbackList, 'serviceScore')} />
        <ScoreCard label="动线" score={calculateAvgScore(feedbackList, 'flowScore')} />
        <ScoreCard label="价格接受度" score={calculateAvgScore(feedbackList, 'priceAcceptance')} />
      </div>

      {/* 反馈列表 */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-12 text-center text-brown-500">加载中...</div>
        ) : feedbackList.length === 0 ? (
          <div className="card py-12 text-center">
            <MessageSquare size={48} className="mx-auto mb-3 text-warm-300" />
            <p className="text-brown-500">暂无反馈记录</p>
            <button 
              onClick={handleOpenModal}
              className="text-primary-500 hover:text-primary-600 mt-2"
            >
              录入第一条反馈
            </button>
          </div>
        ) : (
          feedbackList.map((feedback) => (
            <FeedbackCard
              key={feedback.id}
              feedback={feedback}
              guestName={getGuestName(feedback.guestId)}
              sessionName={getSessionName(feedback.sessionId)}
              onFollowUp={() => handleFollowUp(feedback.id)}
            />
          ))
        )}
      </div>

      {/* 反馈录入弹窗 */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="录入客户反馈"
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-brown-700 mb-2">
              选择客人 <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedGuestId}
              onChange={(e) => setSelectedGuestId(e.target.value)}
              className="input-field"
              required
            >
              <option value="">请选择已到店的客人</option>
              {availableGuestsForFeedback.map(guest => (
                <option key={guest.id} value={guest.id}>
                  {guest.name} - {getSessionName(guest.sessionId)}
                </option>
              ))}
            </select>
          </div>

          {/* 评分项 */}
          <div className="grid grid-cols-2 gap-6">
            <RatingInput
              label="口味评分"
              value={formData.tasteScore}
              onChange={(val) => setFormData({ ...formData, tasteScore: val })}
            />
            <RatingInput
              label="服务评分"
              value={formData.serviceScore}
              onChange={(val) => setFormData({ ...formData, serviceScore: val })}
            />
            <RatingInput
              label="动线评分"
              value={formData.flowScore}
              onChange={(val) => setFormData({ ...formData, flowScore: val })}
            />
            <RatingInput
              label="价格接受度"
              value={formData.priceAcceptance}
              onChange={(val) => setFormData({ ...formData, priceAcceptance: val })}
            />
          </div>

          {/* 满意点 */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-brown-700 mb-3">
              <ThumbsUp size={16} className="text-green-500" />
              满意点
            </label>
            <div className="flex flex-wrap gap-2">
              {POSITIVE_TAGS.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag, 'positive')}
                  className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                    formData.positiveTags.includes(tag)
                      ? 'bg-green-500 text-white'
                      : 'bg-green-50 text-green-700 hover:bg-green-100'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* 问题点 */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-brown-700 mb-3">
              <ThumbsDown size={16} className="text-red-500" />
              问题点
            </label>
            <div className="flex flex-wrap gap-2">
              {NEGATIVE_TAGS.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag, 'negative')}
                  className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                    formData.negativeTags.includes(tag)
                      ? 'bg-red-500 text-white'
                      : 'bg-red-50 text-red-700 hover:bg-red-100'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* 文字反馈 */}
          <div>
            <label className="block text-sm font-medium text-brown-700 mb-2">
              详细反馈
            </label>
            <textarea
              value={formData.comment}
              onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              className="input-field h-24 resize-none"
              placeholder="请输入客户的详细反馈..."
            />
          </div>

          {/* 照片上传 (占位) */}
          <div>
            <label className="block text-sm font-medium text-brown-700 mb-2">
              照片
            </label>
            <div className="border-2 border-dashed border-warm-200 rounded-xl p-6 text-center hover:border-primary-300 transition-colors cursor-pointer">
              <Camera size={32} className="mx-auto text-warm-400 mb-2" />
              <p className="text-sm text-brown-500">点击或拖拽上传照片</p>
              <p className="text-xs text-brown-400 mt-1">支持 JPG、PNG 格式（演示版本暂不支持）</p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-warm-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn-secondary"
            >
              取消
            </button>
            <button type="submit" className="btn-primary flex items-center gap-2">
              <Send size={16} />
              提交反馈
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function calculateAvgScore(feedbackList: Feedback[], field: keyof Feedback): number {
  if (feedbackList.length === 0) return 0;
  const sum = feedbackList.reduce((acc, f) => acc + (f[field] as number), 0);
  return Math.round((sum / feedbackList.length) * 10) / 10;
}

function ScoreCard({ label, score }: { label: string; score: number }) {
  return (
    <div className="stat-card">
      <p className="text-sm text-brown-500">{label}</p>
      <div className="flex items-baseline gap-1 mt-2">
        <span className="text-2xl font-semibold text-brown-800">{score}</span>
        <span className="text-xs text-brown-400">/ 5.0</span>
      </div>
      <div className="mt-2 h-1.5 bg-warm-100 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-primary-400 to-primary-500 rounded-full"
          style={{ width: `${(score / 5) * 100}%` }}
        />
      </div>
    </div>
  );
}

interface FeedbackCardProps {
  feedback: Feedback;
  guestName: string;
  sessionName: string;
  onFollowUp: () => void;
}

function FeedbackCard({ feedback, guestName, sessionName, onFollowUp }: FeedbackCardProps) {
  const avgScore = (feedback.tasteScore + feedback.serviceScore + feedback.flowScore + feedback.priceAcceptance) / 4;

  return (
    <div className="card hover:shadow-medium transition-all">
      <div className="flex items-start gap-4">
        <Avatar name={guestName} size="lg" />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h4 className="font-medium text-brown-800">{guestName}</h4>
              <span className="text-xs text-brown-500 bg-warm-100 px-2 py-0.5 rounded-full">
                {sessionName}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold text-primary-600">{avgScore.toFixed(1)}</span>
              <div className="flex">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star
                    key={i}
                    size={14}
                    className={i <= Math.round(avgScore) ? 'text-amber-400 fill-amber-400' : 'text-warm-200'}
                  />
                ))}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-4 gap-4 mt-3">
            <div>
              <p className="text-xs text-brown-500">口味</p>
              <p className="font-medium text-brown-700">{feedback.tasteScore} 分</p>
            </div>
            <div>
              <p className="text-xs text-brown-500">服务</p>
              <p className="font-medium text-brown-700">{feedback.serviceScore} 分</p>
            </div>
            <div>
              <p className="text-xs text-brown-500">动线</p>
              <p className="font-medium text-brown-700">{feedback.flowScore} 分</p>
            </div>
            <div>
              <p className="text-xs text-brown-500">价格接受度</p>
              <p className="font-medium text-brown-700">{feedback.priceAcceptance} 分</p>
            </div>
          </div>
          
          {feedback.positiveTags.length > 0 && (
            <div className="mt-3">
              <p className="text-xs text-brown-500 mb-1.5">满意点</p>
              <div className="flex flex-wrap gap-1.5">
                {feedback.positiveTags.map(tag => (
                  <span key={tag} className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {feedback.negativeTags.length > 0 && (
            <div className="mt-3">
              <p className="text-xs text-brown-500 mb-1.5">问题点</p>
              <div className="flex flex-wrap gap-1.5">
                {feedback.negativeTags.map(tag => (
                  <span key={tag} className="text-xs bg-red-50 text-red-700 px-2 py-0.5 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {feedback.comment && (
            <p className="mt-3 text-sm text-brown-600 bg-warm-50 p-3 rounded-xl">
              {feedback.comment}
            </p>
          )}
          
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-warm-100">
            <span className="text-xs text-brown-400">
              {formatDateTime(feedback.createdAt)}
            </span>
            
            {feedback.isFollowedUp ? (
              <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-3 py-1 rounded-full">
                <Check size={12} />
                已回访
              </span>
            ) : (
              <button
                onClick={onFollowUp}
                className="text-xs text-primary-600 bg-primary-50 px-3 py-1 rounded-full hover:bg-primary-100 transition-colors"
              >
                标记已回访
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface RatingInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
}

function RatingInput({ label, value, onChange }: RatingInputProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-brown-700 mb-2">{label}</label>
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="p-1 transition-transform hover:scale-110"
          >
            <Star
              size={28}
              className={`transition-colors ${
                star <= value ? 'text-amber-400 fill-amber-400' : 'text-warm-200'
              }`}
            />
          </button>
        ))}
        <span className="ml-2 text-lg font-medium text-brown-700">{value}.0</span>
      </div>
    </div>
  );
}
