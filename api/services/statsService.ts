import { db } from '../data/store';

export const statsService = {
  get() {
    return db.getStats();
  },
};
