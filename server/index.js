import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'dns';

dns.setServers(['8.8.8.8', '8.8.4.4']);

import authRoutes from './routes/auth.js';
import searchRoutes from './routes/search.js';
import planRoutes from './routes/plans.js';
import keyRoutes from './routes/keys.js';
import pixRoutes from './routes/pix.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 3000;

app.use(helmet({
  contentSecurityPolicy: false,
}));
app.use(cors());
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

const webhookLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: 'Too many webhook requests'
});

app.use('/api/', limiter);
app.use('/api/pix/webhook', webhookLimiter);

app.use(express.static(path.join(__dirname, '../public')));

app.use('/api/auth', authRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/keys', keyRoutes);
app.use('/api/pix', pixRoutes);

app.use(express.static(path.join(__dirname, '../public')));

app.get(/^(?!\/api).+/, (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

console.log('Tentando conectar ao MongoDB...');
mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
  .then(() => console.log('✅ Conectado ao MongoDB com sucesso!'))
  .catch(err => {
    console.error('❌ Erro crítico de conexão com o MongoDB:');
    console.error(`Código: ${err.code}`);
    console.error(`Mensagem: ${err.message}`);
    if (err.reason) console.error(`Razão: ${err.reason}`);
  });

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
