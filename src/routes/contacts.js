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

router.get('/get-contacts', (req, res) => {
  const contacts = readJSON(contactsPath);
  res.json(contacts);
});

router.post('/delete-contact', (req, res) => {
  const { id } = req.body;
  const contacts = readJSON(contactsPath);
  const filteredContacts = contacts.filter(c => c.id !== id);
  writeJSON(contactsPath, filteredContacts);
  res.json({ success: true });
});