import express from 'express';
import venom from 'venom-bot';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Configurações para ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Configurações do servidor
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    }
  }
}));

// Middleware CORS para desenvolvimento
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Armazenamento de sessão
const activeSessions = {
  client: null,
  qrCode: null
};

// Caminhos dos arquivos JSON
const messagesPath = path.join(__dirname, 'db', 'messages.json');
const contactsPath = path.join(__dirname, 'db', 'contacts.json');

// Funções auxiliares para manipular JSON
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

// Rotas básicas
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Rotas para mensagens
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

// Rotas para contatos
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

// Rota para envio no WhatsApp
app.post('/send-whatsapp', async (req, res) => {
  const { phone, message } = req.body;

  try {
    if (!activeSessions.client) {
      throw new Error('Conecte-se ao WhatsApp primeiro');
    }

    const formattedPhone = `${phone.replace(/\D/g, '')}@c.us`;
    await activeSessions.client.sendText(formattedPhone, message);

    // Removido o trecho que salva a mensagem novamente no JSON

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ 
      error: 'Falha no envio',
      details: err.message 
    });
  }
});

// Socket.IO para WhatsApp
io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id);

  socket.on('start_connection', async () => {
    try {
      if (activeSessions.client) {
        await activeSessions.client.close();
      }

      socket.emit('status_update', {
        status: 'waiting_qr',
        message: '🔄 Aguardando QR Code...'
      });

      const client = await venom.create({
        session: 'whatsapp-session',
        headless: true,
        multidevice: true,
        catchQR: (base64Qrimg) => {
          activeSessions.qrCode = base64Qrimg;
          socket.emit('qr_code', base64Qrimg);
        }
      });

      activeSessions.client = client;
      
      socket.emit('status_update', {
        status: 'connected',
        message: '✅ WhatsApp conectado!',
        redirect: true
      });

    } catch (err) {
      console.error('Erro na conexão:', err);
      socket.emit('status_update', {
        status: 'error',
        message: `❌ Erro: ${err.message}`
      });
    }
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
  
  // Cria arquivos JSON se não existirem
  if (!fs.existsSync(messagesPath)) writeJSON(messagesPath, []);
  if (!fs.existsSync(contactsPath)) writeJSON(contactsPath, []);
});