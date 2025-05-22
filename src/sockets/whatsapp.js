import venom from 'venom-bot';
import { activeSessions } from '../config/session.js';

export default function setupWhatsappSocket(io, activeSessions) {
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
}