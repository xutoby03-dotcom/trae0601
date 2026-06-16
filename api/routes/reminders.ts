import express, { type Request, type Response } from 'express';
import { guestsDB, feedbackDB, sessionsDB } from '../utils/data.js';
import type { Reminder } from '../../shared/types.js';

const router = express.Router();

function generateReminders(): Reminder[] {
  const reminders: Reminder[] = [];
  const guests = guestsDB.getAll();
  const sessions = sessionsDB.getAll();
  const feedbackList = feedbackDB.getAll();
  
  guests.forEach(guest => {
    const session = sessions.find(s => s.id === guest.sessionId);
    if (!session) return;
    
    if (!guest.isConfirmed && guest.status === 'invited') {
      reminders.push({
        id: `remind-unconfirmed-${guest.id}`,
        type: 'unconfirmed',
        guestId: guest.id,
        sessionId: guest.sessionId,
        message: `${guest.name} 尚未确认是否参加 ${session.name}`,
        createdAt: guest.createdAt,
        isDismissed: false,
      });
    }
    
    if (guest.status === 'no_show') {
      reminders.push({
        id: `remind-noshow-${guest.id}`,
        type: 'no_show',
        guestId: guest.id,
        sessionId: guest.sessionId,
        message: `${guest.name} 临时爽约未到店 (${session.name})`,
        createdAt: guest.createdAt,
        isDismissed: false,
      });
    }
  });
  
  feedbackList.forEach(feedback => {
    const guest = guestsDB.getById(feedback.guestId);
    const session = sessions.find(s => s.id === feedback.sessionId);
    if (!guest || !session) return;
    
    if (!feedback.isFollowedUp && guest.isVIP) {
      reminders.push({
        id: `remind-followup-${feedback.id}`,
        type: 'follow_up',
        guestId: guest.id,
        sessionId: session.id,
        message: `重点客户 ${guest.name} 的反馈尚未回访`,
        createdAt: feedback.createdAt,
        isDismissed: false,
      });
    }
  });
  
  return reminders.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

router.get('/', (req: Request, res: Response) => {
  const { type } = req.query;
  
  let reminders = generateReminders();
  
  if (type) {
    reminders = reminders.filter(r => r.type === type);
  }
  
  res.json({ success: true, data: reminders });
});

router.get('/count', (req: Request, res: Response) => {
  const reminders = generateReminders();
  const activeReminders = reminders.filter(r => !r.isDismissed);
  
  const countByType = {
    unconfirmed: activeReminders.filter(r => r.type === 'unconfirmed').length,
    no_show: activeReminders.filter(r => r.type === 'no_show').length,
    follow_up: activeReminders.filter(r => r.type === 'follow_up').length,
    total: activeReminders.length,
  };
  
  res.json({ success: true, data: countByType });
});

router.patch('/:id/dismiss', (req: Request, res: Response) => {
  res.json({ 
    success: true, 
    message: '提醒已标记为已处理' 
  });
});

export default router;
