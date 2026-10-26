import { messageModel } from '../models/messageModel.js';

export function submitMessage(req, res) {
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
    return res.status(400).json({ error: 'Message details must be submitted as a JSON object.' });
  }
  const { name, email, subject, message } = req.body;
  const fields = { name, email, subject, message };
  const limits = { name: 100, email: 254, subject: 150, message: 5000 };

  for (const [field, value] of Object.entries(fields)) {
    if (typeof value !== 'string' || !value.trim() || value.length > limits[field]) {
      return res.status(400).json({ error: `${field} is required and must be no longer than ${limits[field]} characters.` });
    }
  }

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ error: 'Enter a valid email address.' });
  }

  messageModel.create({
    name: name.trim(),
    email: email.trim(),
    subject: subject.trim(),
    message: message.trim()
  });
  res.status(201).json({ message: 'Your message was sent successfully.' });
}
