const socket = io();
const statusMessage = document.getElementById('status-message');
const qrcodeImg = document.getElementById('qrcode');
const connectBtn = document.getElementById('connect-btn');
const qrcodeContainer = document.getElementById('qrcode-container');

const statusConfig = {
  disconnected: { class: 'disconnected', emoji: '🔴' },
  connecting: { class: 'waiting', emoji: '🟡' },
  waiting_qr: { class: 'waiting', emoji: '🟡' },
  processing: { class: 'waiting', emoji: '🟠' },
  connected: { class: 'connected', emoji: '🟢' },
  error: { class: 'error', emoji: '🔴' }
};

connectBtn.addEventListener('click', () => {
  connectBtn.disabled = true;
  connectBtn.textContent = 'Conectando...';
  socket.emit('start_connection');
});

socket.on('status_update', (data) => {
  const config = statusConfig[data.status] || statusConfig.error;
  
  statusMessage.innerHTML = `${config.emoji} ${data.message}`;
  statusMessage.className = `status-${config.class}`;
  
  qrcodeContainer.style.display = data.status === 'waiting_qr' ? 'block' : 'none';
  
  if (data.status === 'error') {
    connectBtn.disabled = false;
    connectBtn.textContent = 'Tentar novamente';
  }
  
  if (data.redirect) {
    setTimeout(() => window.location.href = "/dashboard", 1500);
  }
});

socket.on('qr_code', (base64Qrimg) => {
  qrcodeImg.src = base64Qrimg;
});

socket.on('connect_error', () => {
  statusMessage.innerHTML = '🔴 Erro de conexão com o servidor';
  connectBtn.disabled = false;
  connectBtn.textContent = 'Tentar novamente';
});