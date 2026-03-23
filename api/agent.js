// api/agent.js — Vercel Serverless Function
// GROQ_API_KEY vive en variables de entorno de Vercel

// Rate limiting simple en memoria (por IP)
const rateLimitMap = new Map();
const RATE_LIMIT   = 30;   // máx requests
const RATE_WINDOW  = 60000; // por minuto

function checkRateLimit(ip) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip) || { count: 0, start: now };
  if (now - entry.start > RATE_WINDOW) {
    rateLimitMap.set(ip, { count: 1, start: now });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  rateLimitMap.set(ip, entry);
  return true;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket?.remoteAddress || 'unknown';
  if (!checkRateLimit(ip)) {
    return res.status(429).json({ error: 'Demasiadas solicitudes. Esperá un minuto.' });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'GROQ_API_KEY no configurada en Vercel' });

  try {
    const { messages = [], system, max_tokens = 900 } = req.body || {};
    if (!messages.length) return res.status(400).json({ error: 'messages requerido' });

    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens,
        temperature: 0.15,
        messages: system ? [{ role: 'system', content: system }, ...messages] : messages,
      }),
    });

    if (!groqRes.ok) {
      const err = await groqRes.text();
      return res.status(groqRes.status).json({ error: `Groq error: ${err}` });
    }

    const data = await groqRes.json();
    const text = data.choices?.[0]?.message?.content?.trim() ?? '';

    try {
      const parsed = JSON.parse(text.replace(/```json|```/g, '').trim());
      return res.status(200).json({ ok: true, parsed });
    } catch {
      return res.status(200).json({ ok: true, text });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
