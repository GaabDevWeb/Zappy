import express from 'express';
import { readJSON, writeJSON, storagePaths } from '../utils/storage.js';

const router = express.Router();
const { contactsPath } = storagePaths;