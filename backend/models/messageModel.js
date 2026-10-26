import { database } from '../config/database.js';

export const messageModel = {
  create({ name, email, subject, message }) {
    return database.prepare(`
      INSERT INTO messages (name, email, subject, message) VALUES (?, ?, ?, ?)
    `).run(name, email, subject, message);
  },

  list() {
    return database.prepare(`
      SELECT id, name, email, subject, message, created_at AS createdAt
      FROM messages ORDER BY id DESC LIMIT 100
    `).all();
  }
};
