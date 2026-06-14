import { create } from 'zustand';
import type {
  Classroom,
  Seat,
  Student,
  Reservation,
  CheckinRecord,
  ChangeRecord,
  DashboardStats,
  UserRole,
  SeatWithStatus,
} from '../types';
import { AUTO_RELEASE_MINUTES } from '../types';
import {
  generateInitialClassrooms,
  generateInitialSeats,
  generateInitialStudents,
  generateInitialReservations,
  generateSeatsForClassroom,
} from '../utils/mockData';
import {
  getStorageItem,
  setStorageItem,
  STORAGE_KEYS,
} from '../utils/storage';
import {
  generateId,
  getTodayDateString,
  checkAndReleaseNoShows,
  calculateDashboardStats,
} from '../utils/helpers';

interface AppState {
  classrooms: Classroom[];
  seats: Seat[];
  reservations: Reservation[];
  students: Student[];
  checkinRecords: CheckinRecord[];
  changeRecords: ChangeRecord[];
  currentRole: UserRole;
  selectedClassroomId: string | null;
  selectedDate: string;
  selectedTimeSlot: string;

  initializeData: () => void;
  setCurrentRole: (role: UserRole) => void;
  setSelectedClassroomId: (id: string | null) => void;
  setSelectedDate: (date: string) => void;
  setSelectedTimeSlot: (slot: string) => void;

  addClassroom: (classroom: Omit<Classroom, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateClassroom: (id: string, data: Partial<Classroom>) => void;
  deleteClassroom: (id: string) => void;

  createReservation: (data: Omit<Reservation, 'id' | 'status' | 'createdAt' | 'expiresAt'>) => void;
  cancelReservation: (id: string) => void;
  checkin: (reservationId: string) => void;
  handleNoShow: (reservationId: string) => void;
  releaseExpiredReservations: () => void;

  recordChange: (data: Omit<ChangeRecord, 'id' | 'createdAt'>) => void;
  changeSeat: (reservationId: string, newSeatId: string, reason: string) => void;
  earlyLeave: (reservationId: string, reason: string) => void;
  requestLeave: (reservationId: string, reason: string) => void;

  getDashboardStats: () => DashboardStats;
  getSeatsWithStatus: (classroomId: string, date: string, timeSlot: string) => SeatWithStatus[];
  getAvailableSeats: (classroomId: string, date: string, timeSlot: string) => Seat[];
  getTodayReservations: () => Reservation[];
  getPendingReservations: () => Reservation[];
  getCheckedInReservations: () => Reservation[];
}

function loadInitialData(): {
  classrooms: Classroom[];
  seats: Seat[];
  students: Student[];
  reservations: Reservation[];
} {
  const initialized = getStorageItem<boolean>(STORAGE_KEYS.INITIALIZED, false);

  if (initialized) {
    return {
      classrooms: getStorageItem<Classroom[]>(STORAGE_KEYS.CLASSROOMS, []),
      seats: getStorageItem<Seat[]>(STORAGE_KEYS.SEATS, []),
      students: getStorageItem<Student[]>(STORAGE_KEYS.STUDENTS, []),
      reservations: getStorageItem<Reservation[]>(STORAGE_KEYS.RESERVATIONS, []),
    };
  }

  const classrooms = generateInitialClassrooms();
  const seats = generateInitialSeats(classrooms);
  const students = generateInitialStudents();
  const reservations = generateInitialReservations(classrooms, students);

  setStorageItem(STORAGE_KEYS.CLASSROOMS, classrooms);
  setStorageItem(STORAGE_KEYS.SEATS, seats);
  setStorageItem(STORAGE_KEYS.STUDENTS, students);
  setStorageItem(STORAGE_KEYS.RESERVATIONS, reservations);
  setStorageItem(STORAGE_KEYS.INITIALIZED, true);

  return { classrooms, seats, students, reservations };
}

export const useStore = create<AppState>((set, get) => {
  const initialData = loadInitialData();
  const { updated: initialReservations, released } = checkAndReleaseNoShows(
    initialData.reservations,
    AUTO_RELEASE_MINUTES
  );

  if (released.length > 0) {
    const updatedStudents = initialData.students.map(s => {
      const noShowCount = released.filter(id => {
        const res = initialReservations.find(r => r.id === id);
        return res?.studentId === s.id;
      }).length;
      return noShowCount > 0 ? { ...s, noShowCount: s.noShowCount + noShowCount } : s;
    });
    initialData.students = updatedStudents;
    initialData.reservations = initialReservations;
    setStorageItem(STORAGE_KEYS.STUDENTS, updatedStudents);
    setStorageItem(STORAGE_KEYS.RESERVATIONS, initialReservations);
  }

  return {
    classrooms: initialData.classrooms,
    seats: initialData.seats,
    students: initialData.students,
    reservations: initialData.reservations,
    checkinRecords: getStorageItem<CheckinRecord[]>(STORAGE_KEYS.CHECKIN_RECORDS, []),
    changeRecords: getStorageItem<ChangeRecord[]>(STORAGE_KEYS.CHANGE_RECORDS, []),
    currentRole: getStorageItem<UserRole>(STORAGE_KEYS.CURRENT_ROLE, 'student'),
    selectedClassroomId: initialData.classrooms[0]?.id || null,
    selectedDate: getTodayDateString(),
    selectedTimeSlot: '18:00-19:30',

    initializeData: () => {
      const data = loadInitialData();
      set({
        classrooms: data.classrooms,
        seats: data.seats,
        students: data.students,
        reservations: data.reservations,
      });
    },

    setCurrentRole: (role) => {
      set({ currentRole: role });
      setStorageItem(STORAGE_KEYS.CURRENT_ROLE, role);
    },

    setSelectedClassroomId: (id) => set({ selectedClassroomId: id }),
    setSelectedDate: (date) => set({ selectedDate: date }),
    setSelectedTimeSlot: (slot) => set({ selectedTimeSlot: slot }),

    addClassroom: (classroom) => {
      const now = new Date().toISOString();
      const newClassroom: Classroom = {
        ...classroom,
        id: generateId('class-'),
        createdAt: now,
        updatedAt: now,
      };
      const newSeats = generateSeatsForClassroom(newClassroom.id, newClassroom.seatCount);

      const updatedClassrooms = [...get().classrooms, newClassroom];
      const updatedSeats = [...get().seats, ...newSeats];

      set({ classrooms: updatedClassrooms, seats: updatedSeats });
      setStorageItem(STORAGE_KEYS.CLASSROOMS, updatedClassrooms);
      setStorageItem(STORAGE_KEYS.SEATS, updatedSeats);
    },

    updateClassroom: (id, data) => {
      const updatedClassrooms = get().classrooms.map(c =>
        c.id === id ? { ...c, ...data, updatedAt: new Date().toISOString() } : c
      );
      set({ classrooms: updatedClassrooms });
      setStorageItem(STORAGE_KEYS.CLASSROOMS, updatedClassrooms);
    },

    deleteClassroom: (id) => {
      const updatedClassrooms = get().classrooms.filter(c => c.id !== id);
      const updatedSeats = get().seats.filter(s => s.classroomId !== id);
      const updatedReservations = get().reservations.filter(r => r.classroomId !== id);

      set({
        classrooms: updatedClassrooms,
        seats: updatedSeats,
        reservations: updatedReservations,
      });
      setStorageItem(STORAGE_KEYS.CLASSROOMS, updatedClassrooms);
      setStorageItem(STORAGE_KEYS.SEATS, updatedSeats);
      setStorageItem(STORAGE_KEYS.RESERVATIONS, updatedReservations);
    },

    createReservation: (data) => {
      const now = new Date().toISOString();
      const [startTime] = data.timeSlot.split('-');
      const [hours, minutes] = startTime.split(':').map(Number);
      const expiresAt = new Date(data.reservationDate);
      expiresAt.setHours(hours, minutes + AUTO_RELEASE_MINUTES, 0, 0);

      let student = get().students.find(
        s => s.className === data.className && s.name === data.studentName
      );

      let updatedStudents = get().students;
      if (!student) {
        student = {
          id: generateId('student-'),
          className: data.className,
          name: data.studentName,
          noShowCount: 0,
          createdAt: now,
        };
        updatedStudents = [...get().students, student];
      }

      const newReservation: Reservation = {
        ...data,
        id: generateId('res-'),
        studentId: student.id,
        status: 'pending',
        createdAt: now,
        expiresAt: expiresAt.toISOString(),
      };

      const updatedReservations = [...get().reservations, newReservation];

      set({
        reservations: updatedReservations,
        students: updatedStudents,
      });
      setStorageItem(STORAGE_KEYS.RESERVATIONS, updatedReservations);
      setStorageItem(STORAGE_KEYS.STUDENTS, updatedStudents);
    },

    cancelReservation: (id) => {
      const updatedReservations = get().reservations.map(r =>
        r.id === id ? { ...r, status: 'cancelled' as const } : r
      );
      set({ reservations: updatedReservations });
      setStorageItem(STORAGE_KEYS.RESERVATIONS, updatedReservations);
    },

    requestLeave: (reservationId, reason) => {
      const reservation = get().reservations.find(r => r.id === reservationId);
      if (!reservation) return;

      const updatedReservations = get().reservations.map(r =>
        r.id === reservationId ? { ...r, status: 'cancelled' as const } : r
      );

      const newRecord: ChangeRecord = {
        id: generateId('change-'),
        reservationId,
        changeType: 'leave',
        reason,
        createdAt: new Date().toISOString(),
      };

      const updatedRecords = [...get().changeRecords, newRecord];

      set({
        reservations: updatedReservations,
        changeRecords: updatedRecords,
      });
      setStorageItem(STORAGE_KEYS.RESERVATIONS, updatedReservations);
      setStorageItem(STORAGE_KEYS.CHANGE_RECORDS, updatedRecords);
    },

    checkin: (reservationId) => {
      const reservation = get().reservations.find(r => r.id === reservationId);
      if (!reservation) return;

      const now = new Date();
      const [startTime] = reservation.timeSlot.split('-');
      const [hours, minutes] = startTime.split(':').map(Number);
      const slotStart = new Date(reservation.reservationDate);
      slotStart.setHours(hours, minutes, 0, 0);

      const isLate = now > slotStart;

      const newCheckinRecord: CheckinRecord = {
        id: generateId('checkin-'),
        reservationId,
        checkinTime: now.toISOString(),
        status: isLate ? 'late' : 'success',
      };

      const updatedReservations = get().reservations.map(r =>
        r.id === reservationId ? { ...r, status: 'checked_in' as const } : r
      );
      const updatedCheckinRecords = [...get().checkinRecords, newCheckinRecord];

      set({
        reservations: updatedReservations,
        checkinRecords: updatedCheckinRecords,
      });
      setStorageItem(STORAGE_KEYS.RESERVATIONS, updatedReservations);
      setStorageItem(STORAGE_KEYS.CHECKIN_RECORDS, updatedCheckinRecords);
    },

    handleNoShow: (reservationId) => {
      const reservation = get().reservations.find(r => r.id === reservationId);
      if (!reservation) return;

      const updatedReservations = get().reservations.map(r =>
        r.id === reservationId ? { ...r, status: 'no_show' as const } : r
      );
      const updatedStudents = get().students.map(s =>
        s.id === reservation.studentId ? { ...s, noShowCount: s.noShowCount + 1 } : s
      );

      set({
        reservations: updatedReservations,
        students: updatedStudents,
      });
      setStorageItem(STORAGE_KEYS.RESERVATIONS, updatedReservations);
      setStorageItem(STORAGE_KEYS.STUDENTS, updatedStudents);
    },

    releaseExpiredReservations: () => {
      const { updated, released } = checkAndReleaseNoShows(get().reservations, AUTO_RELEASE_MINUTES);

      if (released.length > 0) {
        const updatedStudents = get().students.map(s => {
          const count = released.filter(id => {
            const res = updated.find(r => r.id === id);
            return res?.studentId === s.id;
          }).length;
          return count > 0 ? { ...s, noShowCount: s.noShowCount + count } : s;
        });

        set({
          reservations: updated,
          students: updatedStudents,
        });
        setStorageItem(STORAGE_KEYS.RESERVATIONS, updated);
        setStorageItem(STORAGE_KEYS.STUDENTS, updatedStudents);
      }
    },

    recordChange: (data) => {
      const newRecord: ChangeRecord = {
        ...data,
        id: generateId('change-'),
        createdAt: new Date().toISOString(),
      };
      const updatedRecords = [...get().changeRecords, newRecord];
      set({ changeRecords: updatedRecords });
      setStorageItem(STORAGE_KEYS.CHANGE_RECORDS, updatedRecords);
    },

    changeSeat: (reservationId, newSeatId, reason) => {
      const reservation = get().reservations.find(r => r.id === reservationId);
      if (!reservation) return;

      const updatedReservations = get().reservations.map(r =>
        r.id === reservationId ? { ...r, seatId: newSeatId } : r
      );

      const newRecord: ChangeRecord = {
        id: generateId('change-'),
        reservationId,
        changeType: 'seat_change',
        reason,
        fromSeatId: reservation.seatId,
        toSeatId: newSeatId,
        createdAt: new Date().toISOString(),
      };

      const updatedRecords = [...get().changeRecords, newRecord];

      set({
        reservations: updatedReservations,
        changeRecords: updatedRecords,
      });
      setStorageItem(STORAGE_KEYS.RESERVATIONS, updatedReservations);
      setStorageItem(STORAGE_KEYS.CHANGE_RECORDS, updatedRecords);
    },

    earlyLeave: (reservationId, reason) => {
      const updatedReservations = get().reservations.map(r =>
        r.id === reservationId ? { ...r, status: 'left_early' as const } : r
      );

      const newRecord: ChangeRecord = {
        id: generateId('change-'),
        reservationId,
        changeType: 'early_leave',
        reason,
        createdAt: new Date().toISOString(),
      };

      const updatedRecords = [...get().changeRecords, newRecord];

      set({
        reservations: updatedReservations,
        changeRecords: updatedRecords,
      });
      setStorageItem(STORAGE_KEYS.RESERVATIONS, updatedReservations);
      setStorageItem(STORAGE_KEYS.CHANGE_RECORDS, updatedRecords);
    },

    getDashboardStats: () => {
      return calculateDashboardStats(get().classrooms, get().reservations, get().students);
    },

    getSeatsWithStatus: (classroomId, date, timeSlot) => {
      const classroomSeats = get().seats.filter(s => s.classroomId === classroomId && s.isActive);
      const slotReservations = get().reservations.filter(
        r => r.classroomId === classroomId && r.reservationDate === date && r.timeSlot === timeSlot
      );

      return classroomSeats.map(seat => {
        const reservation = slotReservations.find(r => r.seatId === seat.id);
        const status = reservation
          ? reservation.status === 'cancelled' || reservation.status === 'left_early'
            ? 'available'
            : reservation.status === 'no_show'
            ? 'no_show'
            : reservation.status === 'checked_in'
            ? 'checked_in'
            : 'reserved'
          : 'available';

        return {
          ...seat,
          status,
          reservation,
        } as SeatWithStatus;
      });
    },

    getAvailableSeats: (classroomId, date, timeSlot): Seat[] => {
      const seatsWithStatus = get().getSeatsWithStatus(classroomId, date, timeSlot);
      return seatsWithStatus.filter(s => s.status === 'available').map(({ status, reservation, ...seat }) => seat as Seat);
    },

    getTodayReservations: () => {
      const today = getTodayDateString();
      return get().reservations.filter(r => r.reservationDate === today);
    },

    getPendingReservations: () => {
      return get().getTodayReservations().filter(r => r.status === 'pending');
    },

    getCheckedInReservations: () => {
      return get().getTodayReservations().filter(r => r.status === 'checked_in');
    },
  };
});
