import express from 'express';
import venom from 'venom-bot';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    }
  }
}));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

const activeSessions = {
  client: null,
  qrCode: null
};

const messagesPath = path.join(__dirname, 'db', 'messages.json');
const contactsPath = path.join(__dirname, 'db', 'contacts.json');

function readJSON(filePath) {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

function writeJSON(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.post('/save-message', (req, res) => {
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

app.get('/get-messages', (req, res) => {
  const messages = readJSON(messagesPath);
  const sortedMessages = messages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(sortedMessages);
});

app.post('/update-message', (req, res) => {
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

app.post('/delete-message', (req, res) => {
  const { id } = req.body;
  const messages = readJSON(messagesPath);
  const filteredMessages = messages.filter(m => m.id !== id);
  writeJSON(messagesPath, filteredMessages);
  res.json({ success: true });
});

app.post('/save-contact', (req, res) => {
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

app.get('/get-contacts', (req, res) => {
  const contacts = readJSON(contactsPath);
  res.json(contacts);
});

app.post('/delete-contact', (req, res) => {
  const { id } = req.body;
  const contacts = readJSON(contactsPath);
  const filteredContacts = contacts.filter(c => c.id !== id);
  writeJSON(contactsPath, filteredContacts);
  res.json({ success: true });
});