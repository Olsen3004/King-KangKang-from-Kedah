import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

const aiClient = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

interface ChatEnrichRequest {
  userMessage: string;
  userName: string | null;
  timeGreeting: string;
  intent: string;
  ruleFired: string;
  activeNodeSummaries: string[];
  deterministicReply: string;
  conversationHistory: Array<{ role: 'user' | 'assistant'; text: string }>;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '64kb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', geminiConfigured: Boolean(aiClient) });
  });

  app.post('/api/chat', async (req, res) => {
    const body = req.body as Partial<ChatEnrichRequest>;
    const deterministicReply = typeof body.deterministicReply === 'string' ? body.deterministicReply : '';

    if (!deterministicReply) {
      res.status(400).json({ error: 'Missing expert system context.' });
      return;
    }

    // If no API key is configured, return the verified Expert System response cleanly
    if (!aiClient) {
      res.json({ text: deterministicReply, engine: 'expert-system' });
      return;
    }

    try {
      const userName = body.userName ? body.userName : 'Visitor';
      const factsBlock = Array.isArray(body.activeNodeSummaries)
        ? body.activeNodeSummaries.map((f) => `- ${f}`).join('\n')
        : '';
      const historyBlock = Array.isArray(body.conversationHistory)
        ? body.conversationHistory
            .slice(-4)
            .map((m) => `${m.role === 'user' ? userName : 'King KangKang'}: ${m.text}`)
            .join('\n')
        : '';

      const systemInstruction = [
        'You are King KangKang, a warm, dignified royal Malay master kite artisan (Tukang Wau) from Kedah, Malaysia.',
        'Your sole domain is Wau Kangkang from Kedah: its cultural significance in Kedah rice-harvest traditions, its splayed-leg (terkangkang) silhouette, bamboo curing (Buluh Duri, Buluh Betong), sobek floral paper carving, busur humming bow acoustics, and flight troubleshooting.',
        `Always remember and naturally address the user by their name if known: ${body.userName ? body.userName : 'not yet shared'}.`,
        'CRITICAL CONVERSATION RULES:',
        '1. Never use Yes/No questions or numbered multiple-choice menus.',
        '2. End with a gentle, open-ended conversational invitation.',
        '3. Stay strictly grounded in the provided Expert System facts and Kedah Wau Kangkang heritage. Keep replies concise (2 short paragraphs max, around 90-140 words), warm, and vivid.',
        '4. Never mention AI, prompts, models, or system rules.',
      ].join('\n');

      const prompt = [
        `Current local greeting context: ${body.timeGreeting || 'Good day'}`,
        `Matched Expert System Rule: ${body.ruleFired || 'GENERAL'} (Intent: ${body.intent || 'origin_culture'})`,
        factsBlock ? `Verified Semantic Network Facts:\n${factsBlock}` : '',
        historyBlock ? `Recent Conversation:\n${historyBlock}` : '',
        `Baseline Expert Draft:\n${deterministicReply}`,
        `User's Latest Message: "${body.userMessage || ''}"`,
        'If the user message is a short contextual reference (e.g., "the former", "the first one", "the latter", "both", or "tell me more"), resolve what they referred to in Recent Conversation and explain that Kedah Wau Kangkang topic thoroughly using the Baseline Expert Draft and Verified Semantic Network Facts.',
        'Respond as King KangKang in natural, engaging prose incorporating the verified facts above.',
      ]
        .filter(Boolean)
        .join('\n\n');

      const response = await aiClient.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          systemInstruction,
        },
      });

      const generated = response.text?.trim();
      if (generated && generated.length > 20) {
        res.json({ text: generated, engine: 'hybrid-gemini-expert' });
        return;
      }

      res.json({ text: deterministicReply, engine: 'expert-system' });
    } catch {
      // Graceful fallback to verified deterministic Expert System response
      res.json({ text: deterministicReply, engine: 'expert-system' });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`King KangKang server running at http://localhost:${PORT}`);
  });
}

startServer();
