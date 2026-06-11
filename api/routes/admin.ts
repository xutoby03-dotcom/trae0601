import { Router } from 'express';

const ADMIN_PASSWORD = 'admin123';

const router = Router();

router.post('/login', (req, res) => {
  const { password } = req.body as { password?: string };
  if (password === ADMIN_PASSWORD) {
    res.json({ success: true, token: 'admin-token-demo' });
  } else {
    res.status(401).json({ success: false, error: '密码错误' });
  }
});

export default router;
