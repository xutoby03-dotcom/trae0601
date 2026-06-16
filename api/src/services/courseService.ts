import type { Course, Seat } from '../../../shared/types';
import { courseStore, applicationStore } from '../store/memoryStore';
import { findAvailableSeat } from '../utils/helpers';

export const courseService = {
  getAllCourses: (): Course[] => courseStore.getAll(),

  getCourseById: (id: string): Course | undefined => courseStore.getById(id),

  createCourse: (courseData: Omit<Course, 'id'>): Course =>
    courseStore.create(courseData),

  updateCourse: (
    id: string,
    updates: Partial<Course>
  ): Course | undefined => courseStore.update(id, updates),

  deleteCourse: (id: string): boolean => courseStore.delete(id),

  updateSeats: (
    id: string,
    seats: Course['seats']
  ): Course | undefined => courseStore.updateSeats(id, seats),

  getAvailableQuota: (courseId: string): { used: number; total: number } => {
    const course = courseStore.getById(courseId);
    if (!course) return { used: 0, total: 0 };
    const used = applicationStore.getApprovedCount(courseId);
    return { used, total: course.auditorQuota };
  },

  reserveSeat: (
    courseId: string,
    applicationId: string,
    studentName: string,
    needsOutlet: boolean
  ): Seat | null => {
    const course = courseStore.getById(courseId);
    if (!course) return null;

    const seat = findAvailableSeat(course, needsOutlet);
    if (!seat) return null;

    seat.status = 'reserved';
    seat.applicationId = applicationId;
    seat.studentName = studentName;

    courseStore.updateSeats(courseId, course.seats);
    return seat;
  },

  releaseSeat: (courseId: string, seatId: string): boolean => {
    const course = courseStore.getById(courseId);
    if (!course) return false;

    for (const row of course.seats) {
      for (const seat of row) {
        if (seat.id === seatId) {
          seat.status = 'available';
          seat.applicationId = undefined;
          seat.studentName = undefined;
          courseStore.updateSeats(courseId, course.seats);
          return true;
        }
      }
    }
    return false;
  },

  checkInSeat: (courseId: string, seatId: string): boolean => {
    const course = courseStore.getById(courseId);
    if (!course) return false;

    for (const row of course.seats) {
      for (const seat of row) {
        if (seat.id === seatId) {
          seat.status = 'checked_in';
          courseStore.updateSeats(courseId, course.seats);
          return true;
        }
      }
    }
    return false;
  },

  createDefaultSeats: (
    rows: number,
    cols: number,
    fixedStudents: number
  ): Seat[][] => {
    const seats: Seat[][] = [];
    let fixedCount = 0;

    for (let row = 0; row < rows; row++) {
      const seatRow: Seat[] = [];
      for (let col = 0; col < cols; col++) {
        let type: Seat['type'] = 'auditor';
        let status: Seat['status'] = 'available';

        if (col === Math.floor(cols / 3) || col === Math.floor((cols * 2) / 3)) {
          type = 'aisle';
          status = 'blocked';
        } else if (fixedCount < fixedStudents) {
          type = 'fixed';
          status = 'blocked';
          fixedCount++;
        }

        seatRow.push({
          id: `seat-${row}-${col}`,
          row,
          col,
          type,
          status,
          hasOutlet: col === 0 || col === cols - 1,
        });
      }
      seats.push(seatRow);
    }

    return seats;
  },
};
