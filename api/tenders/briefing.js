import { createClient } from '@supabase/supabase-js';

// Rate limit simple (in-memory, por instancia)
let briefingCount = 0;
let lastReset = Date.now();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { tender_id } = req.body;
  if (!tender_id) {
    return res.status(400).json({ error: 'tender_id required' });
  }

  // Rate limit: max 10 por minuto
  const now = Date.now();
  if (now - lastReset > 60000) {
    briefingCount = 0;
    lastReset = now;
  }
  if (briefingCount >= 10) {
    return res.status(429).json({ error: 'Rate limit exceeded. Try again later.' });
  }
  briefingCount++;

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    // Obtener licitación
    const { data: tender, error } = await supabase
      .from('public_tenders')
      .select('*')
      .eq('id', tender_id)
      .single();

    if (error || !tender) {
      return res.status(404).json({ error: 'Licitación no encontrada' });
    }

    // Cache: si tiene briefing reciente (<24h)
    if (tender.briefing_text && tender.briefing_generated_at) {
      const generatedAt = new Date(tender.briefing_generated_at);
      const hoursAgo = (now - generatedAt.getTime()) / (1000 * 60 * 60);
      if (hoursAgo < 24) {
        return res.status(200).json({ briefing: tender.briefing_text, generated: false });
      }
    }

    // Llamar a Groq
    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{
          role: 'system',
          content: 'Sos ARIA, asistente comercial especializado en consultoras IT argentinas. Generás briefings ejecutivos de licitaciones públicas. Sos directo, concreto, sin florituras. Hablás en español argentino.'
        }, {
          role: 'user',
          content: `Generá un briefing ejecutivo de esta licitación para un gerente comercial que tiene 30 segundos para decidir si le interesa.

LICITACIÓN:
- Título: ${tender.title}
- Organismo: ${tender.organism}
- Unidad: ${tender.organism_unit || 'No especificada'}
- Tipo: ${tender.tender_type}
- Monto estimado: $${tender.amount?.toLocaleString('es-AR')} ${tender.currency}
- Publicada: ${tender.publication_date}
- Cierre: ${tender.deadline}
- Descripción: ${tender.description || 'No disponible'}

Usá este formato EXACTO:

## Resumen
[máximo 3 líneas: qué se pide, para qué organismo, por qué monto]

## Relevancia para consultoras IT
[por qué le interesa a una consultora IT, qué servicios o productos aplican]

## Datos clave
- 💰 Monto: [monto formateado]
- 📅 Cierre: [fecha + cuántos días faltan]
- 🏛️ Organismo: [nombre completo]
- 📋 Tipo: [tipo de proceso]

## Próximos pasos recomendados
1. [acción concreta]
2. [acción concreta]
3. [acción concreta]

## ⚠️ Red flags
[riesgos, plazos cortos, requisitos difíciles. Si no hay, decí "Ninguno identificado."]`
        }],
        temperature: 0.3,
        max_tokens: 800
      })
    });

    if (!groqResponse.ok) {
      throw new Error('Groq API error');
    }

    const groqData = await groqResponse.json();
    const briefing = groqData.choices[0].message.content;

    // Guardar en DB
    await supabase
      .from('public_tenders')
      .update({
        briefing_text: briefing,
        briefing_generated_at: new Date().toISOString()
      })
      .eq('id', tender_id);

    res.status(200).json({ briefing, generated: true });

  } catch (error) {
    console.error('Error generating briefing:', error);
    res.status(502).json({ error: 'No se pudo generar el briefing. Intentá de nuevo.' });
  }
}