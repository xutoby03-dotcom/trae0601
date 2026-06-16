import express, { type Request, type Response } from 'express';
import { sessionsDB, guestsDB, feedbackDB } from '../utils/data.js';
import type { SessionStats, KeywordCount, OverviewStats } from '../../shared/types.js';

const router = express.Router();

function calculateSessionStats(sessionId: string, sessionName: string): SessionStats {
  const guests = guestsDB.getBySessionId(sessionId);
  const feedbackList = feedbackDB.getBySessionId(sessionId);
  
  const totalInvited = guests.length;
  const totalConfirmed = guests.filter(g => g.isConfirmed).length;
  const totalCheckedIn = guests.filter(g => g.status === 'checked_in' || g.status === 'left').length;
  const totalNoShow = guests.filter(g => g.status === 'no_show').length;
  
  const checkInRate = totalInvited > 0 ? Math.round((totalCheckedIn / totalInvited) * 100) : 0;
  
  const avgTasteScore = feedbackList.length > 0 
    ? Math.round((feedbackList.reduce((sum, f) => sum + f.tasteScore, 0) / feedbackList.length) * 10) / 10 
    : 0;
  
  const avgServiceScore = feedbackList.length > 0 
    ? Math.round((feedbackList.reduce((sum, f) => sum + f.serviceScore, 0) / feedbackList.length) * 10) / 10 
    : 0;
  
  const avgFlowScore = feedbackList.length > 0 
    ? Math.round((feedbackList.reduce((sum, f) => sum + f.flowScore, 0) / feedbackList.length) * 10) / 10 
    : 0;
  
  const avgPriceAcceptance = feedbackList.length > 0 
    ? Math.round((feedbackList.reduce((sum, f) => sum + f.priceAcceptance, 0) / feedbackList.length) * 10) / 10 
    : 0;
  
  return {
    sessionId,
    sessionName,
    totalInvited,
    totalConfirmed,
    totalCheckedIn,
    totalNoShow,
    checkInRate,
    avgTasteScore,
    avgServiceScore,
    avgFlowScore,
    avgPriceAcceptance,
  };
}

function countKeywords(feedbackList: { positiveTags: string[]; negativeTags: string[] }[], type: 'positive' | 'negative'): KeywordCount[] {
  const keywordMap = new Map<string, number>();
  
  feedbackList.forEach(feedback => {
    const tags = type === 'positive' ? feedback.positiveTags : feedback.negativeTags;
    tags.forEach(tag => {
      keywordMap.set(tag, (keywordMap.get(tag) || 0) + 1);
    });
  });
  
  return Array.from(keywordMap.entries())
    .map(([keyword, count]) => ({ keyword, count }))
    .sort((a, b) => b.count - a.count);
}

router.get('/overview', (req: Request, res: Response) => {
  const sessions = sessionsDB.getAll();
  const allGuests = guestsDB.getAll();
  const allFeedback = feedbackDB.getAll();
  
  const sessionStats: SessionStats[] = sessions.map(session => 
    calculateSessionStats(session.id, session.name)
  );
  
  const totalGuests = allGuests.length;
  const totalCheckedIn = allGuests.filter(g => g.status === 'checked_in' || g.status === 'left').length;
  const overallCheckInRate = totalGuests > 0 ? Math.round((totalCheckedIn / totalGuests) * 100) : 0;
  
  const allScores = allFeedback.map(f => (f.tasteScore + f.serviceScore + f.flowScore + f.priceAcceptance) / 4);
  const avgOverallScore = allScores.length > 0 
    ? Math.round((allScores.reduce((a, b) => a + b, 0) / allScores.length) * 10) / 10 
    : 0;
  
  const positiveKeywords = countKeywords(allFeedback, 'positive');
  const negativeKeywords = countKeywords(allFeedback, 'negative');
  
  const vipGuests = allGuests.filter(g => g.isVIP);
  
  const needFollowUp = allFeedback.filter(f => !f.isFollowedUp);
  
  const overviewStats: OverviewStats = {
    totalSessions: sessions.length,
    totalGuests,
    totalCheckedIn,
    overallCheckInRate,
    avgOverallScore,
    sessionStats,
    positiveKeywords,
    negativeKeywords,
    vipGuests,
    needFollowUp,
  };
  
  res.json({ success: true, data: overviewStats });
});

router.get('/session/:sessionId', (req: Request, res: Response) => {
  const session = sessionsDB.getById(req.params.sessionId);
  if (!session) {
    return res.status(404).json({ success: false, error: '场次不存在' });
  }
  
  const stats = calculateSessionStats(session.id, session.name);
  res.json({ success: true, data: stats });
});

router.get('/keywords', (req: Request, res: Response) => {
  const { sessionId } = req.query;
  
  let feedbackList = feedbackDB.getAll();
  
  if (sessionId) {
    feedbackList = feedbackList.filter(f => f.sessionId === sessionId);
  }
  
  const positiveKeywords = countKeywords(feedbackList, 'positive');
  const negativeKeywords = countKeywords(feedbackList, 'negative');
  
  res.json({ 
    success: true, 
    data: { positiveKeywords, negativeKeywords } 
  });
});

export default router;
