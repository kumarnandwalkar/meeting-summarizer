import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import rateLimit from 'express-rate-limit';
import summariesRouter from './routes/Summaries.js';
import shareRouter from './routes/share.js';
import shareRoutes from './routes/share.js';

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || '*' }));
app.use(express.json({ limit: '2mb' }));

// Protect your free tier
const summarizeLimiter = rateLimit({ windowMs: 60_000, max: 20 });
app.use('/api/summarize', summarizeLimiter);

app.get('/api/health', (_, res) => res.json({ ok: true }));
app.use('/api', summariesRouter);
app.use('/api', shareRouter);
app.use("/api/share", shareRoutes);

const PORT = process.env.PORT || 8080;

async function start() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) throw new Error('MONGODB_URI missing');
  await mongoose.connect(mongoUri);
  app.listen(PORT, () => console.log(`API on :${PORT}`));
}

start().catch((e) => {
  console.error('Failed to start', e);
  process.exit(1);
});
