import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { submitMessage } from '../controllers/contactController.js';
import { requireSameOrigin } from '../middleware/requireAdmin.js';

const router = Router();
const messageLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Too many messages were submitted. Please try again later.' }
});

router.post('/', requireSameOrigin, messageLimiter, submitMessage);
export default router;
