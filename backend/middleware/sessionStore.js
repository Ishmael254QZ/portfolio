import session from 'express-session';
import { database } from '../config/database.js';

export class SQLiteSessionStore extends session.Store {
  constructor() {
    super();
    this.getSession = database.prepare('SELECT data, expires_at FROM sessions WHERE sid = ?');
    this.saveSession = database.prepare(`
      INSERT INTO sessions (sid, data, expires_at) VALUES (?, ?, ?)
      ON CONFLICT(sid) DO UPDATE SET data = excluded.data, expires_at = excluded.expires_at
    `);
    this.deleteSession = database.prepare('DELETE FROM sessions WHERE sid = ?');
  }

  get(sid, callback) {
    try {
      const record = this.getSession.get(sid);
      if (!record) return callback(null, null);
      if (record.expires_at <= Date.now()) {
        this.deleteSession.run(sid);
        return callback(null, null);
      }
      callback(null, JSON.parse(record.data));
    } catch (error) {
      callback(error);
    }
  }

  set(sid, value, callback = () => {}) {
    try {
      const expiresAt = value.cookie?.expires
        ? new Date(value.cookie.expires).getTime()
        : Date.now() + 24 * 60 * 60 * 1000;
      this.saveSession.run(sid, JSON.stringify(value), expiresAt);
      callback(null);
    } catch (error) {
      callback(error);
    }
  }

  touch(sid, value, callback = () => {}) {
    this.set(sid, value, callback);
  }

  destroy(sid, callback = () => {}) {
    try {
      this.deleteSession.run(sid);
      callback(null);
    } catch (error) {
      callback(error);
    }
  }
}
