import { Router } from 'express';
import Summary from '../models/summary.js';
import { generateSummary } from '../services/ai.js';

const r = Router();

r.post('/summarize', async (req, res) => {
  try {
    const { transcriptText, instruction, title } = req.body || {};
    if (!transcriptText || !instruction) {
      return res.status(400).json({ error: 'transcriptText and instruction required' });
    }
    if (transcriptText.length > 200_000) {
      return res.status(413).json({ error: 'transcript too large' });
    }

    const { summary, usage } = await generateSummary({ transcript: transcriptText, instruction });

    const doc = await Summary.create({
      title: title || 'Untitled',
      transcriptText,
      instruction,
      summaryText: summary,
      provider: process.env.AI_PROVIDER || 'groq',
      tokenUsage: usage || {},
    });

    res.json({ summary: doc.summaryText, id: String(doc._id) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'failed to summarize' });
  }
});

r.patch('/summaries/:id', async (req, res) => {
  const { id } = req.params;
  const { summaryText } = req.body || {};
  if (!summaryText) return res.status(400).json({ error: 'summaryText required' });
  await Summary.findByIdAndUpdate(id, { summaryText });
  res.json({ ok: true });
});

r.get('/summaries/:id', async (req, res) => {
  const doc = await Summary.findById(req.params.id);
  if (!doc) return res.status(404).json({ error: 'not found' });
  res.json(doc);
});

export default r;
