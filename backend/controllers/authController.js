import bcrypt from 'bcryptjs';
import { adminModel } from '../models/adminModel.js';

export async function login(req, res, next) {
  try {
    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
      return res.status(400).json({ error: 'Submit a username and password as a JSON object.' });
    }
    const { username, password } = req.body;
    if (typeof username !== 'string' || typeof password !== 'string' ||
        username.length > 100 || password.length > 200) {
      return res.status(400).json({ error: 'Enter a valid username and password.' });
    }

    const admin = adminModel.findByUsername(username.trim());
    if (!admin || !(await bcrypt.compare(password, admin.password_hash))) {
      return res.status(401).json({ error: 'The username or password is incorrect.' });
    }

    req.session.regenerate((error) => {
      if (error) return next(error);
      req.session.admin = { id: admin.id, username: admin.username };
      req.session.save((saveError) => {
        if (saveError) return next(saveError);
        res.json({ admin: req.session.admin });
      });
    });
  } catch (error) {
    next(error);
  }
}

export function logout(req, res, next) {
  req.session.destroy((error) => {
    if (error) return next(error);
    res.clearCookie('portfolio.sid', { httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production' });
    res.status(204).end();
  });
}
