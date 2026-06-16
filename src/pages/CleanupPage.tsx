import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Sofa,
  Pill,
  Bed,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
} from 'lucide-react';
import { bookingApi } from '../lib/api';
import { useToast } from '../components/Toast';
import { useAuthStore } from '../store/auth';
import { Booking } from '../../shared/types';
import { formatDate, formatTimeRange } from '../utils/time';

interface CleanupItems {
  folded: boolean;
  cushionInPlace: boolean;
  blanketReturned: boolean;
  wipedClean: boolean;
}

const damagePartOptions = [
  '靠背支架', '扶手', '椅面布料', '调节按钮', '脚踏板',
  '头枕', '坐垫弹簧', '万向轮', '折叠铰链', '安全带', '其他',
];

export default function CleanupPage() {
  const { id } = useParams<{ id: string }>();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [cleanupItems, setCleanupItems] = useState<CleanupItems>({
    folded: false,
    cushionInPlace: false,
    blanketReturned: false,
    wipedClean: false,
  });
  const [damageReported, setDamageReported] = useState(false);
  const [damagePart, setDamagePart] = useState('');
  const [damageNote, setDamageNote] = useState('');
  const [showDamageDropdown, setShowDamageDropdown] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { refreshUser } = useAuthStore();

  useEffect(() => {
    if (!id || isNaN(parseInt(id))) {
      showToast('error', '预约信息无效');
      navigate('/my-bookings', { replace: true });
      return;
    }
    loadBooking();
    const timer = setTimeout(() => {
      setLoading((prev) => {
        if (prev) {
          showToast('error', '加载超时，请稍后重试');
          navigate('/my-bookings', { replace: true });
        }
        return prev;
      });
    }, 8000);
    return () => clearTimeout(timer);
  }, [id]);

  const loadBooking = async () => {
    setLoading(true);
    try {
      const result = await bookingApi.getById(parseInt(id!));
      if (result.success && result.data) {
        setBooking(result.data);
      } else {
        showToast('error', result.message || '加载失败');
        navigate('/my-bookings');
      }
    } catch {
      showToast('error', '加载失败，请稍后重试');
      navigate('/my-bookings');
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = (key: keyof CleanupItems) => {
    setCleanupItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const completedCount = Object.values(cleanupItems).filter(Boolean).length;
  const progress = (completedCount / 4) * 100;
  const canSubmit = completedCount === 4 && (!damageReported || (damagePart && damageNote));

  const handleSubmit = async () => {
    if (!canSubmit || !booking) return;

    setSubmitting(true);
    try {
      const result = await bookingApi.confirmCleanup(booking.id, {
        ...cleanupItems,
        damageReported,
        damagePart: damageReported ? damagePart : undefined,
        damageNote: damageReported ? damageNote : undefined,
      });

      if (result.success) {
        showToast('success', '清洁确认完成，感谢您的配合！');
        await refreshUser();
        navigate('/my-bookings');
      } else {
        showToast('error', result.message || '提交失败');
      }
    } catch {
      showToast('error', '提交失败，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };

  const cleanupChecklist = [
    { key: 'folded' as const, label: '折叠躺椅', icon: Sofa, description: '将躺椅恢复原状，折叠收齐' },
    { key: 'cushionInPlace' as const, label: '靠垫归位', icon: Pill, description: '整理靠垫，放置整齐' },
    { key: 'blanketReturned' as const, label: '毯子放回', icon: Bed, description: '折叠毯子，放回原位' },
    { key: 'wipedClean' as const, label: '擦拭干净', icon: Sparkles, description: '擦拭扶手、头枕等接触部位' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-gray-400">
          <div className="animate-spin w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full mx-auto mb-3" />
          <p>加载中...</p>
        </div>
      </div>
    );
  }

  if (!booking) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-gray-50">
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">清洁确认</h1>
          <p className="text-gray-500">请确认完成以下清洁事项</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-5 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              {booking.chairNumber} · {booking.location}
            </span>
            <span className="text-sm text-gray-500">
              {formatDate(booking.date)} {formatTimeRange(booking.startTime, booking.endTime)}
            </span>
          </div>
          <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-500 ease-out rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-right text-sm text-gray-500 mt-2">
            已完成 {completedCount}/4 项
          </p>
        </div>

        <div className="space-y-3 mb-6">
          {cleanupChecklist.map((item, index) => (
            <button
              key={item.key}
              onClick={() => toggleItem(item.key)}
              className={`w-full bg-white rounded-2xl p-4 flex items-center gap-4 transition-all duration-300 ${
                cleanupItems[item.key]
                  ? 'shadow-md ring-2 ring-teal-500'
                  : 'shadow-sm hover:shadow-md'
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                  cleanupItems[item.key]
                    ? 'bg-teal-100 text-teal-600 scale-110'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {cleanupItems[item.key] ? (
                  <CheckCircle2 className="w-6 h-6" />
                ) : (
                  <item.icon className="w-6 h-6" />
                )}
              </div>
              <div className="flex-1 text-left">
                <p className={`font-medium transition-colors ${
                  cleanupItems[item.key] ? 'text-teal-700' : 'text-gray-900'
                }`}>
                  {item.label}
                </p>
                <p className="text-sm text-gray-500">{item.description}</p>
              </div>
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                  cleanupItems[item.key]
                    ? 'bg-teal-500 border-teal-500'
                    : 'border-gray-300'
                }`}
              >
                {cleanupItems[item.key] && (
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-5 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <span className="font-medium text-gray-900">是否有损坏？</span>
            <button
              onClick={() => setDamageReported(!damageReported)}
              className={`ml-auto relative w-12 h-7 rounded-full transition-colors ${
                damageReported ? 'bg-amber-500' : 'bg-gray-300'
              }`}
            >
              <div
                className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  damageReported ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {damageReported && (
            <div className="space-y-4 mt-4 pt-4 border-t border-gray-100">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  损坏部位
                </label>
                <button
                  type="button"
                  onClick={() => setShowDamageDropdown(!showDamageDropdown)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-left flex items-center justify-between focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                >
                  <span className={damagePart ? 'text-gray-900' : 'text-gray-400'}>
                    {damagePart || '请选择损坏部位'}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showDamageDropdown ? 'rotate-180' : ''}`} />
                </button>
                {showDamageDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                    {damagePartOptions.map((part) => (
                      <button
                        key={part}
                        type="button"
                        onClick={() => {
                          setDamagePart(part);
                          setShowDamageDropdown(false);
                        }}
                        className="w-full px-4 py-2.5 text-left hover:bg-gray-50 transition-colors text-sm"
                      >
                        {part}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  损坏描述
                </label>
                <textarea
                  value={damageNote}
                  onChange={(e) => setDamageNote(e.target.value)}
                  placeholder="请详细描述损坏情况..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none resize-none text-sm"
                />
              </div>
            </div>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={!canSubmit || submitting}
          className={`w-full font-semibold py-4 px-6 rounded-2xl transition-all text-lg ${
            canSubmit
              ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-600/30 hover:shadow-xl hover:shadow-teal-600/40'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {submitting ? '提交中...' : '确认提交'}
        </button>

        {!canSubmit && (
          <p className="text-center text-sm text-gray-400 mt-3">
            {completedCount < 4 ? '请完成所有清洁项确认' : '请填写损坏部位和描述'}
          </p>
        )}
      </div>
    </div>
  );
}
