import { database } from '../config/database.js';

export const settingsModel = {
  get(key) {
    return database.prepare('SELECT value FROM settings WHERE key = ?').get(key)?.value ?? null;
  },

  set(key, value) {
    database.prepare(`
      INSERT INTO settings (key, value) VALUES (?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value
    `).run(key, value);
  }
};
