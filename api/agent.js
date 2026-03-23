// api/agent.js — Vercel Serverless Function
// La GROQ_API_KEY vive en variables de entorno de Vercel, nunca en el browser.

export default async function handler(req, res) {
  // Solo POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "GROQ_API_KEY no configurada en Vercel" });
  }

  try {
    const { messages, system, max_tokens = 800 } = req.body;

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens,
        temperature: 0.15,
        messages: system
          ? [{ role: "system", content: system }, ...messages]
          : messages,
      }),
    });

    if (!groqRes.ok) {
      const err = await groqRes.text();
      return res.status(groqRes.status).json({ error: err });
    }

    const data = await groqRes.json();
    const text = data.choices?.[0]?.message?.content?.trim() ?? "";

    // Intentar parsear JSON directamente
    try {
      const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
      return res.status(200).json({ ok: true, parsed });
    } catch {
      // Si no es JSON (respuesta conversacional), devolver como texto
      return res.status(200).json({ ok: true, text });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
