import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const messagesPath = path.join(__dirname, '../../db', 'messages.json');
const contactsPath = path.join(__dirname, '../../db', 'contacts.json');