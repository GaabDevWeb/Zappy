const socket = io();
const statusMessage = document.getElementById('status-message');
const qrcodeImg = document.getElementById('qrcode');
const connectBtn = document.getElementById('connect-btn');
const qrcodeContainer = document.getElementById('qrcode-container');

// Mapeamento de status com textos
const statusConfig = {
  disconnected: { class: 'disconnected', text: 'Desconectado' },
  connecting: { class: 'waiting', text: 'Conectando...' },
  waiting_qr: { class: 'waiting', text: 'Gerando QR Code...' },
  processing: { class: 'waiting', text: 'Processando...' },
  connected: { class: 'connected', text: 'Conectado' },
  error: { class: 'error', text: 'Erro de conexão' }
};

connectBtn.addEventListener('click', () => {
  connectBtn.disabled = true;
  connectBtn.textContent = 'Conectando...';
  socket.emit('start_connection');
});

socket.on('status_update', (data) => {
  const config = statusConfig[data.status] || statusConfig.error;
  statusMessage.className = `status-${config.class}`;

  // Exibe o texto correto para cada status
  if (data.status === 'waiting_qr') {
    statusMessage.innerHTML = config.text;
  } else if (data.status === 'connected') {
    statusMessage.innerHTML = config.text;
  } else if (data.status === 'disconnected') {
    statusMessage.innerHTML = config.text;
  } else if (data.status === 'processing') {
    statusMessage.innerHTML = config.text;
  } else if (data.status === 'error') {
    statusMessage.innerHTML = config.text;
  } else {
    statusMessage.innerHTML = config.text;
  }

  // Removido: lógica do spinner do QR Code

  // Se o QR code está sendo exibido, mostra "Aguardando leitura"
  if (qrcodeImg.src && qrcodeImg.style.display === 'block' && data.status !== 'connected') {
    statusMessage.innerHTML = 'Aguardando leitura';
  }
  qrcodeImg.style.display = data.status === 'connected' ? 'none' : 'block';
  qrcodeContainer.style.display = data.status === 'waiting_qr' ? 'block' : 'none';

  if (data.status === 'error') {
    connectBtn.disabled = false;
    connectBtn.textContent = 'Tentar novamente';
  }

  if (data.redirect) {
    setTimeout(() => window.location.href = "/dashboard", 1500);
  }
});

socket.on('connect_error', () => {
  // Exibe apenas o emoji de erro
  statusMessage.innerHTML = '🔴';
  connectBtn.disabled = false;
  connectBtn.textContent = 'Tentar novamente';
});
socket.on('qr_code', (base64Qrimg) => {
  qrcodeImg.src = base64Qrimg;
});