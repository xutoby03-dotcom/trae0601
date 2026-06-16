import type { Application } from '../../../shared/types';
import { applicationStore, courseStore } from '../store/memoryStore';
import { courseService } from './courseService';

export const applicationService = {
  getAllApplications: (
    courseId?: string,
    studentName?: string
  ): Application[] => applicationStore.getAll(courseId, studentName),

  getApplicationById: (id: string): Application | undefined =>
    applicationStore.getById(id),

  submitApplication: (
    applicationData: Omit<Application, 'id' | 'createdAt' | 'status' | 'waitlistPosition' | 'seatId'>
  ): Application => {
    const course = courseStore.getById(applicationData.courseId);
    if (!course) {
      throw new Error('Course not found');
    }

    const { used, total } = courseService.getAvailableQuota(
      applicationData.courseId
    );
    const hasQuota = used < total;

    let status: Application['status'];
    let seatId: string | undefined;

    if (hasQuota) {
      if (course.isKeyCourse) {
        status = 'pending_approval';
      } else {
        status = 'approved';
        const seat = courseService.reserveSeat(
          applicationData.courseId,
          '',
          applicationData.studentName,
          applicationData.needsOutlet
        );
        seatId = seat?.id;
      }
    } else {
      status = 'waitlist';
    }

    const newApp = applicationStore.create({
      ...applicationData,
      status,
      seatId,
    });

    if (status === 'approved' && seatId) {
      applicationStore.update(newApp.id, { id: newApp.id, seatId });
      const updatedCourse = courseStore.getById(applicationData.courseId);
      if (updatedCourse) {
        for (const row of updatedCourse.seats) {
          for (const seat of row) {
            if (seat.id === seatId) {
              seat.applicationId = newApp.id;
            }
          }
        }
        courseStore.updateSeats(applicationData.courseId, updatedCourse.seats);
      }
    }

    if (status === 'waitlist') {
      applicationStore.updateWaitlistPositions(applicationData.courseId);
    }

    return applicationStore.getById(newApp.id)!;
  },

  approveApplication: (id: string): Application | undefined => {
    const app = applicationStore.getById(id);
    if (!app || app.status !== 'pending_approval') return undefined;

    const seat = courseService.reserveSeat(
      app.courseId,
      id,
      app.studentName,
      app.needsOutlet
    );

    if (!seat) {
      applicationStore.update(id, { status: 'waitlist' });
      applicationStore.updateWaitlistPositions(app.courseId);
      return applicationStore.getById(id);
    }

    applicationStore.update(id, { status: 'approved', seatId: seat.id });
    return applicationStore.getById(id);
  },

  rejectApplication: (id: string): Application | undefined => {
    const app = applicationStore.getById(id);
    if (!app) return undefined;

    applicationStore.update(id, { status: 'rejected' });
    return applicationStore.getById(id);
  },

  checkInApplication: (id: string): Application | undefined => {
    const app = applicationStore.getById(id);
    if (!app || app.status !== 'approved') return undefined;

    if (app.seatId) {
      courseService.checkInSeat(app.courseId, app.seatId);
    }

    applicationStore.update(id, {
      status: 'checked_in',
      checkedInAt: new Date().toISOString(),
    });
    return applicationStore.getById(id);
  },

  releaseSeatForNoShow: (id: string): { app?: Application; error?: string } => {
    const app = applicationStore.getById(id);
    if (!app) return { error: '申请不存在' };
    if (app.status === 'no_show') return { error: '该学生已标记为未到' };
    if (app.status === 'checked_in') return { error: '该学生已签到，无法标记未到' };
    if (app.status === 'waitlist') return { error: '该学生在候补中，无法标记未到' };
    if (app.status === 'pending_approval') return { error: '该申请待审批中，无法标记未到' };
    if (app.status === 'rejected') return { error: '该申请已被拒绝，无法标记未到' };
    if (app.status !== 'approved') return { error: '当前状态不允许标记未到' };
    if (!app.seatId) return { error: '该申请没有分配座位，无法标记未到' };

    courseService.releaseSeat(app.courseId, app.seatId);
    applicationStore.update(id, { status: 'no_show', seatId: undefined });

    const waitlist = applicationStore.getWaitlist(app.courseId);
    if (waitlist.length > 0) {
      const nextApp = waitlist[0];
      const seat = courseService.reserveSeat(
        app.courseId,
        nextApp.id,
        nextApp.studentName,
        nextApp.needsOutlet
      );
      if (seat) {
        applicationStore.update(nextApp.id, {
          status: 'approved',
          seatId: seat.id,
          waitlistPosition: undefined,
        });
        applicationStore.updateWaitlistPositions(app.courseId);
      }
    }

    return { app: applicationStore.getById(id) };
  },

  cancelApplication: (id: string): Application | undefined => {
    const app = applicationStore.getById(id);
    if (!app) return undefined;

    if (app.seatId && (app.status === 'approved' || app.status === 'pending_approval')) {
      courseService.releaseSeat(app.courseId, app.seatId);
    }

    applicationStore.update(id, { status: 'cancelled' });

    if (app.status === 'waitlist') {
      applicationStore.updateWaitlistPositions(app.courseId);
    } else if (app.seatId) {
      const waitlist = applicationStore.getWaitlist(app.courseId);
      if (waitlist.length > 0) {
        const nextApp = waitlist[0];
        const seat = courseService.reserveSeat(
          app.courseId,
          nextApp.id,
          nextApp.studentName,
          nextApp.needsOutlet
        );
        if (seat) {
          applicationStore.update(nextApp.id, {
            status: 'approved',
            seatId: seat.id,
          });
          applicationStore.updateWaitlistPositions(app.courseId);
        }
      }
    }

    return applicationStore.getById(id);
  },

  getWaitlist: (courseId: string): Application[] =>
    applicationStore.getWaitlist(courseId),
};
