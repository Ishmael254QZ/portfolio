import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { config } from '../config/env.js';
import { messageModel } from '../models/messageModel.js';
import { projectModel } from '../models/projectModel.js';
import { settingsModel } from '../models/settingsModel.js';

export function getAdminStatus(req, res) {
  res.json({ admin: req.session.admin });
}

export function listProjects(req, res) {
  res.json({ projects: projectModel.list() });
}

export function createProject(req, res) {
  res.status(201).json({ project: projectModel.create(req.project) });
}

export function updateProject(req, res) {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id < 1) return res.status(400).json({ error: 'Project ID must be a positive integer.' });
  const project = projectModel.update(id, req.project);
  if (!project) return res.status(404).json({ error: 'Project not found.' });
  res.json({ project });
}

export function deleteProject(req, res) {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id < 1) return res.status(400).json({ error: 'Project ID must be a positive integer.' });
  if (!projectModel.delete(id)) {
    return res.status(404).json({ error: 'Project not found.' });
  }
  res.status(204).end();
}

export async function saveImage(req, res, next) {
  try {
    await fs.mkdir(config.uploadsDirectory, { recursive: true });
    const filename = `${randomUUID()}.${req.imageExtension}`;
    await fs.writeFile(path.join(config.uploadsDirectory, filename), req.file.buffer, { flag: 'wx' });
    res.status(201).json({ image: `/uploads/${filename}` });
  } catch (error) {
    next(error);
  }
}

export function getSettings(req, res) {
  res.json({ profileImage: settingsModel.get('profileImage') });
}

export function updateProfileImage(req, res) {
  const image = req.body && typeof req.body === 'object' ? req.body.image : null;
  if (typeof image !== 'string' || !/^\/uploads\/[a-f0-9-]+\.(?:jpg|png|webp)$/i.test(image)) {
    return res.status(400).json({ error: 'Choose a valid uploaded profile image.' });
  }
  settingsModel.set('profileImage', image);
  res.json({ profileImage: image });
}

export function listMessages(req, res) {
  res.json({ messages: messageModel.list() });
}
