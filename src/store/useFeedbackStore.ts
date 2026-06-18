import { create } from 'zustand';
import type { Feedback, Seat, HandleResult, NoiseType, Floor, Zone } from '@/types';
import { mockSeats, mockFeedbacks } from '@/data/mockData';
import { updateSeatsWithFeedbackCount } from '@/utils/seatStatus';

const STORAGE_KEY = 'library_noise_feedbacks';

function loadFeedbacks(): Feedback[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : mockFeedbacks;
  } catch {
    return mockFeedbacks;
  }
}

function saveFeedbacks(feedbacks: Feedback[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(feedbacks));
}

interface FeedbackStore {
  seats: Seat[];
  feedbacks: Feedback[];
  selectedFloor: Floor;
  selectedZone: Zone | 'all';
  selectedSeatId: string | null;

  setSelectedFloor: (floor: Floor) => void;
  setSelectedZone: (zone: Zone | 'all') => void;
  setSelectedSeatId: (id: string | null) => void;

  submitFeedback: (data: {
    seatId: string;
    noiseType: NoiseType;
    occurTime: string;
    photos: string[];
    reporterId: string;
    reporterName: string;
  }) => void;

  handleFeedback: (feedbackId: string, result: HandleResult) => void;

  getFilteredSeats: () => Seat[];
  getPendingFeedbacks: () => Feedback[];
  getSeatById: (id: string) => Seat | undefined;
}

export const useFeedbackStore = create<FeedbackStore>((set, get) => {
  const initialFeedbacks = loadFeedbacks();
  const initialSeats = updateSeatsWithFeedbackCount(mockSeats, initialFeedbacks);

  return {
    seats: initialSeats,
    feedbacks: initialFeedbacks,
    selectedFloor: 1,
    selectedZone: 'all',
    selectedSeatId: null,

    setSelectedFloor: (floor) => set({ selectedFloor: floor, selectedZone: 'all' }),
    setSelectedZone: (zone) => set({ selectedZone: zone }),
    setSelectedSeatId: (id) => set({ selectedSeatId: id }),

    submitFeedback: (data) => {
      const seat = get().getSeatById(data.seatId);
      if (!seat) return;

      const newFeedback: Feedback = {
        id: Math.random().toString(36).slice(2, 11),
        seatId: data.seatId,
        floor: seat.floor,
        zone: seat.zone,
        deskNumber: seat.deskNumber,
        seatNumber: seat.seatNumber,
        noiseType: data.noiseType,
        occurTime: data.occurTime,
        submitTime: new Date().toISOString(),
        photos: data.photos,
        reporterId: data.reporterId,
        reporterName: data.reporterName,
        status: 'pending',
      };

      const newFeedbacks = [newFeedback, ...get().feedbacks];
      saveFeedbacks(newFeedbacks);

      set({
        feedbacks: newFeedbacks,
        seats: updateSeatsWithFeedbackCount(get().seats, newFeedbacks),
      });
    },

    handleFeedback: (feedbackId, result) => {
      const newFeedbacks = get().feedbacks.map((f) =>
        f.id === feedbackId
          ? {
              ...f,
              status: result,
              handleTime: new Date().toISOString(),
              handlerId: 'A001',
              handlerName: '当前管理员',
            }
          : f
      );
      saveFeedbacks(newFeedbacks);

      set({
        feedbacks: newFeedbacks,
        seats: updateSeatsWithFeedbackCount(get().seats, newFeedbacks),
      });
    },

    getFilteredSeats: () => {
      const { seats, selectedFloor, selectedZone } = get();
      return seats.filter(
        (s) => s.floor === selectedFloor && (selectedZone === 'all' || s.zone === selectedZone)
      );
    },

    getPendingFeedbacks: () => {
      return get().feedbacks.filter((f) => f.status === 'pending');
    },

    getSeatById: (id) => {
      return get().seats.find((s) => s.id === id);
    },
  };
});
