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

router.get('/get-messages', (req, res) => {
  const messages = readJSON(messagesPath);
  const sortedMessages = messages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(sortedMessages);
});

router.post('/update-message', (req, res) => {
  const { id, text } = req.body;
  const messages = readJSON(messagesPath);
  const messageIndex = messages.findIndex(m => m.id === id);
  
  if (messageIndex !== -1) {
    messages[messageIndex].text = text;
    messages[messageIndex].updatedAt = new Date().toISOString();
    writeJSON(messagesPath, messages);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Message not found' });
  }
});

router.post('/delete-message', (req, res) => {
  const { id } = req.body;
  const messages = readJSON(messagesPath);
  const filteredMessages = messages.filter(m => m.id !== id);
  writeJSON(messagesPath, filteredMessages);
  res.json({ success: true });
});

export default router;