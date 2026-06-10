import { Router, type Request, type Response } from 'express';
import {
  getAllActivities,
  getActivity,
  createActivity,
  getActivityRegistrations,
  registerForActivity,
  cancelRegistration,
  checkInRegistration,
  markAbsent,
  getStats,
} from '../services/index.js';

const router = Router();

router.get('/activities', (req: Request, res: Response) => {
  const activities = getAllActivities();
  res.json({ success: true, data: activities });
});

router.get('/activities/:id', (req: Request, res: Response) => {
  const activity = getActivity(req.params.id);
  if (!activity) {
    res.status(404).json({ success: false, error: 'Activity not found' });
    return;
  }
  res.json({ success: true, data: activity });
});

router.post('/activities', (req: Request, res: Response) => {
  const activity = createActivity(req.body);
  res.status(201).json({ success: true, data: activity });
});

router.get('/activities/:id/registrations', (req: Request, res: Response) => {
  const activity = getActivity(req.params.id);
  if (!activity) {
    res.status(404).json({ success: false, error: 'Activity not found' });
    return;
  }
  const registrations = getActivityRegistrations(req.params.id);
  res.json({ success: true, data: registrations });
});

router.post('/activities/:id/register', (req: Request, res: Response) => {
  const result = registerForActivity(req.params.id, req.body);
  if (!result) {
    res.status(404).json({ success: false, error: 'Activity not found' });
    return;
  }
  res.status(201).json({ success: true, data: result });
});

router.put('/registrations/:id/cancel', (req: Request, res: Response) => {
  const result = cancelRegistration(req.params.id);
  if (!result.cancelled) {
    res.status(404).json({ success: false, error: 'Registration not found or already cancelled' });
    return;
  }
  res.json({ success: true, data: result });
});

router.put('/registrations/:id/checkin', (req: Request, res: Response) => {
  const registration = checkInRegistration(req.params.id);
  if (!registration) {
    res.status(404).json({ success: false, error: 'Registration not found' });
    return;
  }
  res.json({ success: true, data: registration });
});

router.put('/registrations/:id/absent', (req: Request, res: Response) => {
  const registration = markAbsent(req.params.id);
  if (!registration) {
    res.status(404).json({ success: false, error: 'Registration not found' });
    return;
  }
  res.json({ success: true, data: registration });
});

router.get('/stats', (req: Request, res: Response) => {
  const stats = getStats();
  res.json({ success: true, data: stats });
});

export default router;
