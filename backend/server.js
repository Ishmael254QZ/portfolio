import express from 'express';
import session from 'express-session';
import helmet from 'helmet';
import { config } from './config/env.js';
import './config/database.js';
import { SQLiteSessionStore } from './middleware/sessionStore.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import publicRoutes from './routes/publicRoutes.js';

const app = express();

app.disable('x-powered-by');
if (config.nodeEnv === 'production') app.set('trust proxy', 1);
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", 'data:'],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
      ...(config.nodeEnv === 'production' ? { upgradeInsecureRequests: [] } : {})
    }
  }
}));
app.use(express.json({ limit: '64kb' }));
app.use(session({
  name: 'portfolio.sid',
  secret: config.sessionSecret,
  store: new SQLiteSessionStore(),
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'strict',
    secure: config.nodeEnv === 'production',
    maxAge: 24 * 60 * 60 * 1000
  }
}));

app.use('/api/auth', authRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/contact', contactRoutes);
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/uploads', express.static(config.uploadsDirectory, {
  dotfiles: 'deny',
  fallthrough: false,
  immutable: true,
  maxAge: '1y'
}));

app.use((req, res, next) => {
  if (['/backend', '/node_modules', '/package.json', '/package-lock.json'].some((restricted) =>
    req.path === restricted || req.path.startsWith(`${restricted}/`))) {
    return res.status(404).end();
  }
  next();
});
app.use(express.static(config.projectRoot, { dotfiles: 'deny', index: 'index.html' }));

app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  if (error.status && error.status < 500) {
    return res.status(error.status).json({ error: error.message });
  }
  console.error('Request failed:', error);
  res.status(500).json({ error: 'An unexpected server error occurred.' });
});

app.listen(config.port, () => {
  console.log(`Portfolio server ready at http://localhost:${config.port}`);
});
