import { db } from '../data/store';
import type { DisputeForm } from '../types';

export const disputeService = {
  list(status?: 'pending' | 'resolved' | 'rejected') {
    const disputes = db.getDisputes(status);
    return disputes.map((d) => ({
      ...d,
      seat: db.getSeatById(d.seatId),
    }));
  },

  create(form: DisputeForm) {
    return db.addDispute(form);
  },

  resolve(id: string, action: 'recover' | 'reject', note?: string) {
    const dispute = db.resolveDispute(id, action, note);
    if (!dispute) return undefined;
    return {
      ...dispute,
      seat: db.getSeatById(dispute.seatId),
    };
  },
};
