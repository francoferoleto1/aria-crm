# ARIA — Agente de Revenue Intelligence

Demo funcional de un agente CRM que interpreta audio/texto y actualiza el pipeline automáticamente.

## Stack
- React 18 + Vite
- Groq API (Llama 3.3 70B) para interpretación de lenguaje natural
- Web Speech API para reconocimiento de voz
- Recharts para visualización de pipeline

## Deploy en Vercel (5 minutos)

### Opción A — GitHub + Vercel (recomendado)
1. Crear repositorio en GitHub y subir esta carpeta
2. Ir a [vercel.com](https://vercel.com) → New Project → Import el repo
3. Vercel detecta Vite automáticamente → Deploy

### Opción B — Vercel CLI
```bash
npm install -g vercel
cd aria-crm
npm install
vercel
```

## Desarrollo local
```bash
npm install
npm run dev
```

## Frases para probar la demo
- "Hablé con Laura de TechSur, cerró el deal por $140k, firma el contrato el jueves 26"
- "Roberto Paz de Constructora Norte quiere una propuesta, tiene presupuesto de $90k"
- "Carlos de Acme rechazó la propuesta, perdimos el deal"
- "Sofía de Distribuidora Sur está en negociación, reunión el 28"

## Próximos pasos
- [ ] Conectar Zoho CRM vía OAuth2
- [ ] Auth de usuarios (Supabase)
- [ ] Roles: admin y vendedor
- [ ] Historial de cambios
