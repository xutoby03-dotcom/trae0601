import {
  getActivities,
  getActivityById,
  addActivity,
  getRegistrationsByActivityId,
  addRegistration,
  updateRegistration,
  getActiveRegistrationsCount,
  getWaitlistCount,
  getNextWaitlist,
  updateWaitlistPositions,
  getRegistrationById,
} from '../store/index.js';
import type {
  Activity,
  CreateActivityDto,
  RegisterDto,
  Registration,
  ActivityStats,
  TypeStats,
} from '../../shared/types.js';

export const getAllActivities = (): Activity[] => {
  return getActivities();
};

export const getActivity = (id: string): Activity | undefined => {
  return getActivityById(id);
};

export const createActivity = (dto: CreateActivityDto): Activity => {
  return addActivity(dto);
};

export const registerForActivity = (
  activityId: string,
  dto: RegisterDto,
): { registration: Registration; isWaitlist: boolean } | null => {
  const activity = getActivityById(activityId);
  if (!activity) return null;

  const activeCount = getActiveRegistrationsCount(activityId);
  const isFull = activeCount >= activity.maxParticipants;
  const waitlistCount = getWaitlistCount(activityId);

  const registration = addRegistration({
    activityId,
    name: dto.name,
    college: dto.college,
    phone: dto.phone,
    isFirstTime: dto.isFirstTime,
    remark: dto.remark,
    status: isFull ? 'waitlist' : 'registered',
    waitlistPosition: isFull ? waitlistCount + 1 : 0,
  });

  return { registration, isWaitlist: isFull };
};

export const cancelRegistration = (
  registrationId: string,
): { cancelled: Registration | null; promoted: Registration | null } => {
  const registration = getRegistrationById(registrationId);
  if (!registration || registration.status === 'cancelled') {
    return { cancelled: null, promoted: null };
  }

  const cancelled = updateRegistration(registrationId, {
    status: 'cancelled',
    waitlistPosition: 0,
  });

  let promoted: Registration | null = null;
  if (registration.status === 'registered') {
    const nextWaitlist = getNextWaitlist(registration.activityId);
    if (nextWaitlist) {
      promoted = updateRegistration(nextWaitlist.id, {
        status: 'registered',
        waitlistPosition: 0,
        promotedFromWaitlist: true,
      }) || null;
      updateWaitlistPositions(registration.activityId);
    }
  } else {
    updateWaitlistPositions(registration.activityId);
  }

  return { cancelled, promoted };
};

export const getActivityRegistrations = (activityId: string): Registration[] => {
  return getRegistrationsByActivityId(activityId);
};

export const checkInRegistration = (registrationId: string): Registration | undefined => {
  return updateRegistration(registrationId, { checkInStatus: 'checked' });
};

export const markAbsent = (registrationId: string): Registration | undefined => {
  return updateRegistration(registrationId, { checkInStatus: 'absent' });
};

export const getStats = (): {
  activities: ActivityStats[];
  typeStats: TypeStats[];
  totalWaitlistPromoted: number;
} => {
  const activities = getActivities();
  const typeLabels: Record<string, string> = {
    lecture: '讲座',
    boardgame: '桌游夜',
    photoshoot: '外拍',
    volunteer: '志愿服务',
  };

  const activityStats: ActivityStats[] = activities.map((activity) => {
    const registrations = getRegistrationsByActivityId(activity.id);
    const registered = registrations.filter((r) => r.status === 'registered');
    const checkedIn = registered.filter((r) => r.checkInStatus === 'checked');
    const waitlistPromoted = registrations.filter((r) => r.promotedFromWaitlist).length;

    return {
      activityId: activity.id,
      activityTitle: activity.title,
      activityType: activity.type,
      totalRegistered: registered.length,
      checkedIn: checkedIn.length,
      attendanceRate: registered.length > 0
        ? Math.round((checkedIn.length / registered.length) * 100)
        : 0,
      waitlistPromoted,
    };
  });

  const typeMap = new Map<string, number>();
  let totalWaitlistPromoted = 0;

  activities.forEach((activity) => {
    const registrations = getRegistrationsByActivityId(activity.id);
    const count = registrations.filter((r) => r.status === 'registered').length;
    typeMap.set(activity.type, (typeMap.get(activity.type) || 0) + count);
    totalWaitlistPromoted += registrations.filter((r) => r.promotedFromWaitlist).length;
  });

  const typeStats: TypeStats[] = Array.from(typeMap.entries()).map(([type, count]) => ({
    type: type as Activity['type'],
    label: typeLabels[type] || type,
    count,
  })).sort((a, b) => b.count - a.count);

  return {
    activities: activityStats,
    typeStats,
    totalWaitlistPromoted,
  };
};
