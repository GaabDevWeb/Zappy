import express from 'express';
import { readJSON, writeJSON, storagePaths } from '../utils/storage.js';

const router = express.Router();
const { contactsPath } = storagePaths;

router.post('/save-contact', (req, res) => {
  const contacts = readJSON(contactsPath);
  const newContact = {
    id: Date.now(),
    name: req.body.name,
    phone: req.body.phone,
    createdAt: new Date().toISOString()
  };
  contacts.push(newContact);
  writeJSON(contactsPath, contacts);
  res.json({ success: true });
});