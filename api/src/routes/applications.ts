import { Router, Request, Response } from 'express';
import { applicationService } from '../services/applicationService';
import type { Application } from '../../../shared/types';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  const { courseId, studentName } = req.query;
  const applications = applicationService.getAllApplications(
    courseId as string,
    studentName as string
  );
  res.json(applications);
});

router.get('/:id', (req: Request, res: Response) => {
  const application = applicationService.getApplicationById(req.params.id);
  if (!application) {
    res.status(404).json({ error: 'Application not found' });
    return;
  }
  res.json(application);
});

router.post('/', (req: Request, res: Response) => {
  try {
    const applicationData = req.body as Omit<
      Application,
      'id' | 'createdAt' | 'status' | 'waitlistPosition' | 'seatId'
    >;
    const newApplication = applicationService.submitApplication(applicationData);
    res.status(201).json(newApplication);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

router.put('/:id/approve', (req: Request, res: Response) => {
  const updated = applicationService.approveApplication(req.params.id);
  if (!updated) {
    res.status(404).json({ error: 'Application not found or cannot be approved' });
    return;
  }
  res.json(updated);
});

router.put('/:id/reject', (req: Request, res: Response) => {
  const updated = applicationService.rejectApplication(req.params.id);
  if (!updated) {
    res.status(404).json({ error: 'Application not found' });
    return;
  }
  res.json(updated);
});

router.put('/:id/checkin', (req: Request, res: Response) => {
  const updated = applicationService.checkInApplication(req.params.id);
  if (!updated) {
    res.status(404).json({ error: 'Application not found or cannot be checked in' });
    return;
  }
  res.json(updated);
});

router.put('/:id/release', (req: Request, res: Response) => {
  const updated = applicationService.releaseSeatForNoShow(req.params.id);
  if (!updated) {
    res.status(404).json({ error: 'Application not found or has no seat' });
    return;
  }
  res.json(updated);
});

router.put('/:id/cancel', (req: Request, res: Response) => {
  const updated = applicationService.cancelApplication(req.params.id);
  if (!updated) {
    res.status(404).json({ error: 'Application not found' });
    return;
  }
  res.json(updated);
});

router.get('/course/:courseId/waitlist', (req: Request, res: Response) => {
  const waitlist = applicationService.getWaitlist(req.params.courseId);
  res.json(waitlist);
});

export default router;
