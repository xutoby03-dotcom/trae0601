import type { SeatStatus, Feedback, Seat } from '@/types';

export function calculateSeatStatus(feedbackCount24h: number): SeatStatus {
  if (feedbackCount24h >= 3) return 'serious';
  if (feedbackCount24h >= 1) return 'warning';
  return 'quiet';
}

export function isHighFrequency(seatId: string, feedbacks: Feedback[]): boolean {
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
  const recentFeedbacks = feedbacks.filter(
    (f) => f.seatId === seatId && new Date(f.submitTime).getTime() > oneDayAgo
  );
  return recentFeedbacks.length >= 3;
}

export function countFeedbacksForSeat(seatId: string, feedbacks: Feedback[]): number {
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
  return feedbacks.filter(
    (f) => f.seatId === seatId && new Date(f.submitTime).getTime() > oneDayAgo
  ).length;
}

export function updateSeatsWithFeedbackCount(seats: Seat[], feedbacks: Feedback[]): Seat[] {
  return seats.map((seat) => {
    const count = countFeedbacksForSeat(seat.id, feedbacks);
    return {
      ...seat,
      feedbackCount24h: count,
      status: calculateSeatStatus(count),
    };
  });
}

export function getStatusColor(status: SeatStatus): string {
  const colors: Record<SeatStatus, string> = {
    quiet: 'bg-emerald-500',
    warning: 'bg-amber-500',
    serious: 'bg-red-500',
  };
  return colors[status];
}

export function getStatusBgColor(status: SeatStatus): string {
  const colors: Record<SeatStatus, string> = {
    quiet: 'bg-emerald-100 text-emerald-800',
    warning: 'bg-amber-100 text-amber-800',
    serious: 'bg-red-100 text-red-800',
  };
  return colors[status];
}

export function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}
