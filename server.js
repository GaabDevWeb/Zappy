import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import messageRoutes from './src/routes/messages.js';
import contactRoutes from './src/routes/contacts.js';
import whatsappRoutes from './src/routes/whatsapp.js';
import setupWhatsappSocket from './src/sockets/whatsapp.js';
import { activeSessions } from './src/config/session.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server);