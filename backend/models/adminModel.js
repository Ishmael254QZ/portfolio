import { database } from '../config/database.js';

export const adminModel = {
  findByUsername(username) {
    return database.prepare('SELECT id, username, password_hash FROM admins WHERE username = ?').get(username);
  },

  create(username, passwordHash) {
    return database.prepare('INSERT INTO admins (username, password_hash) VALUES (?, ?)').run(username, passwordHash);
  }
};
