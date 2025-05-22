import express from 'express';
import { readJSON, writeJSON, storagePaths } from '../utils/storage.js';

const router = express.Router();
const { messagesPath } = storagePaths;

router.post('/save-message', (req, res) => {
  const messages = readJSON(messagesPath);
  const newMessage = {
    id: Date.now(),
    text: req.body.message,
    createdAt: new Date().toISOString()
  };
  messages.push(newMessage);
  writeJSON(messagesPath, messages);
  res.json({ success: true });
});
