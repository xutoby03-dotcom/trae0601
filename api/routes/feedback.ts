import express, { type Request, type Response } from 'express';
import { feedbackDB } from '../utils/data.js';

const router = express.Router();

router.get('/', (req: Request, res: Response) => {
  const { sessionId, guestId, isFollowedUp } = req.query;
  
  let feedbackList = feedbackDB.getAll();
  
  if (sessionId) {
    feedbackList = feedbackList.filter(f => f.sessionId === sessionId);
  }
  
  if (guestId) {
    feedbackList = feedbackList.filter(f => f.guestId === guestId);
  }
  
  if (isFollowedUp !== undefined) {
    const followed = isFollowedUp === 'true';
    feedbackList = feedbackList.filter(f => f.isFollowedUp === followed);
  }
  
  res.json({ success: true, data: feedbackList });
});

router.get('/:id', (req: Request, res: Response) => {
  const feedback = feedbackDB.getById(req.params.id);
  if (!feedback) {
    return res.status(404).json({ success: false, error: '反馈不存在' });
  }
  res.json({ success: true, data: feedback });
});

router.post('/', (req: Request, res: Response) => {
  const { 
    guestId, 
    sessionId, 
    tasteScore, 
    serviceScore, 
    flowScore, 
    priceAcceptance,
    positiveTags,
    negativeTags,
    photos,
    comment
  } = req.body;
  
  if (!guestId || !sessionId || !tasteScore || !serviceScore || !flowScore || !priceAcceptance) {
    return res.status(400).json({ success: false, error: '缺少必要字段' });
  }

  const newFeedback = feedbackDB.create({
    guestId,
    sessionId,
    tasteScore: Number(tasteScore),
    serviceScore: Number(serviceScore),
    flowScore: Number(flowScore),
    priceAcceptance: Number(priceAcceptance),
    positiveTags: positiveTags || [],
    negativeTags: negativeTags || [],
    photos: photos || [],
    comment: comment || '',
    isFollowedUp: false,
  });

  res.status(201).json({ success: true, data: newFeedback });
});

router.patch('/:id/follow-up', (req: Request, res: Response) => {
  const feedback = feedbackDB.update(req.params.id, {
    isFollowedUp: true,
    followedUpAt: new Date().toISOString(),
  });
  
  if (!feedback) {
    return res.status(404).json({ success: false, error: '反馈不存在' });
  }
  
  res.json({ success: true, data: feedback });
});

export default router;
