import { projectModel } from '../models/projectModel.js';
import { settingsModel } from '../models/settingsModel.js';

export function getPortfolio(req, res) {
  res.set('Cache-Control', 'no-store');
  res.json({
    projects: projectModel.list(),
    profileImage: settingsModel.get('profileImage')
  });
}
