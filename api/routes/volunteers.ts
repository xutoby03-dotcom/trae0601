import express from 'express';
import { getVolunteers, getVolunteerById, getCheckIns, getSchedules } from '../data/database.js';

const router = express.Router();

router.get('/', (req, res) => {
  const volunteers = getVolunteers().sort((a, b) => b.totalWaterings - a.totalWaterings);
  res.json({ success: true, data: volunteers });
});

router.get('/:id', (req, res) => {
  const volunteer = getVolunteerById(req.params.id);
  if (!volunteer) {
    return res.status(404).json({ success: false, error: '志愿者不存在' });
  }
  
  const checkIns = getCheckIns().filter(c => c.volunteerId === req.params.id);
  const schedules = getSchedules().filter(s => s.volunteerId === req.params.id);
  
  res.json({
    success: true,
    data: {
      ...volunteer,
      recentCheckIns: checkIns.slice(0, 10),
      upcomingSchedules: schedules.filter(s => s.status === 'claimed').slice(0, 5),
      totalCheckIns: checkIns.length,
    },
  });
});

router.get('/leaderboard', (req, res) => {
  const { limit } = req.query;
  const volunteers = getVolunteers()
    .sort((a, b) => b.totalWaterings - a.totalWaterings)
    .slice(0, limit ? Number(limit) : 10);
  
  res.json({ success: true, data: volunteers });
});

export default router;
