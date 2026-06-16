import { Router, Request, Response } from 'express';
import { courseService } from '../services/courseService';
import type { Course } from '../../../shared/types';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  const courses = courseService.getAllCourses();
  const coursesWithQuota = courses.map((course) => {
    const quota = courseService.getAvailableQuota(course.id);
    return { ...course, usedQuota: quota.used };
  });
  res.json(coursesWithQuota);
});

router.get('/:id', (req: Request, res: Response) => {
  const course = courseService.getCourseById(req.params.id);
  if (!course) {
    res.status(404).json({ error: 'Course not found' });
    return;
  }
  const quota = courseService.getAvailableQuota(course.id);
  res.json({ ...course, usedQuota: quota.used });
});

router.post('/', (req: Request, res: Response) => {
  try {
    const { seats, ...courseData } = req.body as Omit<Course, 'id'>;
    const newCourse = courseService.createCourse({
      ...courseData,
      seats: seats || courseService.createDefaultSeats(6, 8, courseData.fixedStudents),
    });
    res.status(201).json(newCourse);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

router.put('/:id', (req: Request, res: Response) => {
  const updatedCourse = courseService.updateCourse(req.params.id, req.body);
  if (!updatedCourse) {
    res.status(404).json({ error: 'Course not found' });
    return;
  }
  res.json(updatedCourse);
});

router.delete('/:id', (req: Request, res: Response) => {
  const success = courseService.deleteCourse(req.params.id);
  if (!success) {
    res.status(404).json({ error: 'Course not found' });
    return;
  }
  res.status(204).send();
});

router.put('/:id/seats', (req: Request, res: Response) => {
  const { seats } = req.body;
  const updatedCourse = courseService.updateSeats(req.params.id, seats);
  if (!updatedCourse) {
    res.status(404).json({ error: 'Course not found' });
    return;
  }
  res.json(updatedCourse);
});

router.get('/:id/quota', (req: Request, res: Response) => {
  const quota = courseService.getAvailableQuota(req.params.id);
  res.json(quota);
});

export default router;
