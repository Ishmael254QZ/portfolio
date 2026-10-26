import { Router } from 'express';
import { createProject, deleteProject, getAdminStatus, getSettings, listMessages, listProjects, saveImage, updateProfileImage, updateProject } from '../controllers/adminController.js';
import { requireAdmin, requireSameOrigin } from '../middleware/requireAdmin.js';
import { uploadImage } from '../middleware/uploadImage.js';
import { validateProject } from '../middleware/validateProject.js';

const router = Router();
router.use(requireAdmin);
router.get('/me', getAdminStatus);
router.get('/projects', listProjects);
router.post('/projects', requireSameOrigin, validateProject, createProject);
router.put('/projects/:id', requireSameOrigin, validateProject, updateProject);
router.delete('/projects/:id', requireSameOrigin, deleteProject);
router.post('/images', requireSameOrigin, uploadImage, saveImage);
router.get('/settings', getSettings);
router.put('/settings/profile-image', requireSameOrigin, updateProfileImage);
router.get('/messages', listMessages);

export default router;
