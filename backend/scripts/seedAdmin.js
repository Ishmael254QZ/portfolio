import bcrypt from 'bcryptjs';
import { config } from '../config/env.js';
import { adminModel } from '../models/adminModel.js';

if (!config.adminUsername || !config.adminPassword) {
  throw new Error('Set ADMIN_USERNAME and ADMIN_PASSWORD in .env before running npm run seed:admin.');
}

if (config.adminUsername.length > 100 || config.adminPassword.length < 12 || config.adminPassword.length > 200 ||
    config.adminPassword.startsWith('replace-')) {
  throw new Error('Use an admin username of at most 100 characters and a unique password between 12 and 200 characters.');
}

if (adminModel.findByUsername(config.adminUsername)) {
  throw new Error(`Administrator "${config.adminUsername}" already exists. No account was changed.`);
}

const passwordHash = await bcrypt.hash(config.adminPassword, 12);
adminModel.create(config.adminUsername, passwordHash);
console.log(`Administrator "${config.adminUsername}" created. Keep the password in .env private.`);
