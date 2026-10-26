import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';
import { config } from './env.js';

fs.mkdirSync(path.dirname(config.databasePath), { recursive: true });

export const database = new Database(config.databasePath);
database.pragma('journal_mode = WAL');
database.pragma('foreign_keys = ON');

database.exec(`
  CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    status TEXT NOT NULL,
    description TEXT NOT NULL,
    problem TEXT NOT NULL DEFAULT '',
    features TEXT NOT NULL DEFAULT '[]',
    technologies TEXT NOT NULL DEFAULT '[]',
    repository TEXT NOT NULL DEFAULT '',
    demo TEXT NOT NULL DEFAULT '',
    image TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS sessions (
    sid TEXT PRIMARY KEY,
    data TEXT NOT NULL,
    expires_at INTEGER NOT NULL
  );

  CREATE INDEX IF NOT EXISTS sessions_expires_at_idx ON sessions(expires_at);
  CREATE INDEX IF NOT EXISTS messages_created_at_idx ON messages(created_at);
`);

const initialProject = database.prepare('SELECT id FROM projects LIMIT 1').get();
if (!initialProject) {
  database.prepare(`
    INSERT INTO projects (title, category, status, description, problem, features, technologies)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    'Ishmael Munyalo Portfolio',
    'Web Development',
    'In Progress',
    'A multi-page portfolio introducing my background, studies, and development interests.',
    'Create a clear, responsive online presence using plain HTML, CSS, and JavaScript.',
    JSON.stringify(['Separate information pages', 'Responsive glassmorphism design', 'Light-green visual theme']),
    JSON.stringify(['HTML', 'CSS', 'JavaScript'])
  );
}

database.prepare(`
  INSERT OR IGNORE INTO settings (key, value) VALUES ('profileImage', ?)
`).run('/Home.jpeg');
