import express from 'express';
import { activeSessions } from '../config/session.js';

const router = express.Router();

router.post('/send-whatsapp', async (req, res) => {
  const { phone, message } = req.body;

  try {
    if (!activeSessions.client) {
      throw new Error('Conecte-se ao WhatsApp primeiro');
    }

    const formattedPhone = `${phone.replace(/\D/g, '')}@c.us`;
    await activeSessions.client.sendText(formattedPhone, message);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ 
      error: 'Falha no envio',
      details: err.message 
    });
  }
});

export default router;
