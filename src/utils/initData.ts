import { storage, STORAGE_KEYS } from './storage';
import { mockElders, mockCourses, mockRegistrations, mockAttendances, mockVolunteers } from './mockData';

export const initializeData = () => {
  const initialized = storage.get(STORAGE_KEYS.INITIALIZED, false);
  
  if (!initialized) {
    storage.set(STORAGE_KEYS.ELDERS, mockElders);
    storage.set(STORAGE_KEYS.COURSES, mockCourses);
    storage.set(STORAGE_KEYS.REGISTRATIONS, mockRegistrations);
    storage.set(STORAGE_KEYS.ATTENDANCES, mockAttendances);
    storage.set(STORAGE_KEYS.VOLUNTEERS, mockVolunteers);
    storage.set(STORAGE_KEYS.INITIALIZED, true);
  }
};
