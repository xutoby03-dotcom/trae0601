import { Router } from 'express';
import { store } from '../store';

const router = Router();

router.get('/', (req, res) => {
  const assistants = store.getAssistants();
  res.json(assistants);
});

router.get('/timeout-threshold', (req, res) => {
  const threshold = store.getTimeoutThreshold();
  res.json({ threshold });
});

router.put('/timeout-threshold', (req, res) => {
  const { seconds } = req.body as { seconds: number };
  if (seconds < 30 || seconds > 600) {
    return res.status(400).json({ error: '超时时间应在30-600秒之间' });
  }
  store.setTimeoutThreshold(seconds);
  res.json({ success: true, threshold: seconds });
});

export default router;
