const maximumTextLength = 2000;
const urlPattern = /^https?:\/\/[^\s]+$/i;
const imagePattern = /^\/uploads\/[a-f0-9-]+\.(?:jpg|png|webp)$/i;

export function validateProject(req, res, next) {
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
    return res.status(400).json({ error: 'Project details must be submitted as a JSON object.' });
  }
  const { title, category, status, description, problem, features, technologies, repository, demo, image } = req.body;

  const requiredText = { title, category, status, description };
  for (const [field, value] of Object.entries(requiredText)) {
    if (typeof value !== 'string' || !value.trim() || value.length > maximumTextLength) {
      return res.status(400).json({ error: `${field} is required and must be under ${maximumTextLength} characters.` });
    }
  }

  if (problem !== undefined && (typeof problem !== 'string' || problem.length > maximumTextLength)) {
    return res.status(400).json({ error: 'problem must be text under 2000 characters.' });
  }

  for (const field of ['features', 'technologies']) {
    if (!Array.isArray(req.body[field]) || req.body[field].length > 30 ||
        req.body[field].some((item) => typeof item !== 'string' || item.length > 100)) {
      return res.status(400).json({ error: `${field} must be an array of up to 30 short text items.` });
    }
  }

  for (const [field, value] of Object.entries({ repository, demo })) {
    if (value !== undefined && value !== '' && (typeof value !== 'string' || !urlPattern.test(value))) {
      return res.status(400).json({ error: `${field} must be a valid HTTP or HTTPS URL.` });
    }
  }

  if (image !== undefined && image !== '' && (typeof image !== 'string' || !imagePattern.test(image))) {
    return res.status(400).json({ error: 'image must be an uploaded portfolio image path.' });
  }

  req.project = {
    title: title.trim(),
    category: category.trim(),
    status: status.trim(),
    description: description.trim(),
    problem: (problem || '').trim(),
    features: req.body.features.map((item) => item.trim()),
    technologies: req.body.technologies.map((item) => item.trim()),
    repository: repository || '',
    demo: demo || '',
    image: image || ''
  };
  next();
}
