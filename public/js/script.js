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