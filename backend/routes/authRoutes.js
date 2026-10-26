import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { login, logout } from '../controllers/authController.js';
import { requireAdmin, requireSameOrigin } from '../middleware/requireAdmin.js';

const router = Router();
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Too many sign-in attempts. Try again in 15 minutes.' }
});

router.get('/me', (req, res) => {
  res.json({ admin: req.session.admin || null });
});
router.post('/login', requireSameOrigin, loginLimiter, login);
router.post('/logout', requireSameOrigin, requireAdmin, logout);

export default router;
