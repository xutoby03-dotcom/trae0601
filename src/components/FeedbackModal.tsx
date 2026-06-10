import { useState } from 'react';
import { Star, X } from 'lucide-react';
import { useStore } from '../store';

interface Props {
  bookingId: string;
  onClose: () => void;
}

export default function FeedbackModal({ bookingId, onClose }: Props) {
  const { bookings, rooms, addFeedback, updateBookingStatus } = useStore(s => ({
    bookings: s.bookings,
    rooms: s.rooms,
    addFeedback: s.addFeedback,
    updateBookingStatus: s.updateBookingStatus,
  }));

  const booking = bookings.find(b => b.id === bookingId);
  const room = rooms.find(r => r.id === booking?.roomId);

  const [noiseRating, setNoiseRating] = useState(5);
  const [cleanlinessRating, setCleanlinessRating] = useState(5);
  const [equipmentRating, setEquipmentRating] = useState(5);
  const [overallRating, setOverallRating] = useState(5);
  const [noiseIssue, setNoiseIssue] = useState('');
  const [cleanlinessIssue, setCleanlinessIssue] = useState('');
  const [equipmentIssue, setEquipmentIssue] = useState('');
  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!booking || !room) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    addFeedback({
      bookingId,
      roomId: room.id,
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
            onClick={() => onChange(n)}
            className={`p-1 transition-transform hover:scale-110`}
          >
            <Star
              size={28}
              className={n <= value ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
            />
          </button>
          ))}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">使用反馈</h3>
            <p className="text-sm text-gray-500">{room.name} · {booking.date} {booking.startTime}-{booking.endTime}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={20} />
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
    </div>
  );
}
