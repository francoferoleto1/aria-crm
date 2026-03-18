import { useState, useRef, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, PieChart, Pie, Legend
} from "recharts";

// ─── CONFIG ─────────────────────────────────────────────────────────────────
const GROQ_KEY   = "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";
const GROQ_MODEL = "llama-3.3-70b-versatile";

// ─── DATA ────────────────────────────────────────────────────────────────────
const INIT_CONTACTS = [
  { id:1, name:"Carlos Mendoza",  initials:"CM", company:"Acme Logistics",     status:"Prospecto",          value:45000,  nextAction:"Enviar propuesta",        nextDate:"20 Mar", notes:"Interesado en plan enterprise" },
  { id:2, name:"Laura Fernández", initials:"LF", company:"TechSur SA",         status:"En negociación",     value:120000, nextAction:"Llamada de seguimiento",  nextDate:"18 Mar", notes:"Revisando contrato con legal" },
  { id:3, name:"Roberto Paz",     initials:"RP", company:"Constructora Norte", status:"Nuevo contacto",     value:0,      nextAction:"Primera llamada",         nextDate:"19 Mar", notes:"Referido por Carlos Mendoza" },
  { id:4, name:"Sofía Reyes",     initials:"SR", company:"Distribuidora Sur",  status:"Propuesta enviada",  value:78000,  nextAction:"Esperar respuesta",       nextDate:"22 Mar", notes:"Presupuesto aprobado" },
  { id:5, name:"Diego Torres",    initials:"DT", company:"MegaFarma SA",       status:"En negociación",     value:95000,  nextAction:"Demo técnica",            nextDate:"21 Mar", notes:"Quiere ver integración con SAP" },
  { id:6, name:"Ana Quiroga",     initials:"AQ", company:"Grupo Pampa",        status:"Cerrado ganado",     value:210000, nextAction:"Onboarding",              nextDate:"25 Mar", notes:"Firmó el contrato anual" },
];

const STAGE_ORDER = ["Nuevo contacto","Prospecto","Propuesta enviada","En negociación","Cerrado ganado","Cerrado perdido"];

const STATUS_META = {
  "Nuevo contacto":    { color:"#6366F1", bg:"#EEF2FF", text:"#4F46E5" },
  "Prospecto":         { color:"#3B82F6", bg:"#EFF6FF", text:"#2563EB" },
  "Propuesta enviada": { color:"#F59E0B", bg:"#FFFBEB", text:"#D97706" },
  "En negociación":    { color:"#F97316", bg:"#FFF7ED", text:"#EA580C" },
  "Cerrado ganado":    { color:"#10B981", bg:"#ECFDF5", text:"#059669" },
  "Cerrado perdido":   { color:"#EF4444", bg:"#FEF2F2", text:"#DC2626" },
};

// ─── GROQ CALL ───────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = (contacts) => `Sos ARIA, asistente de CRM para equipos de ventas en Argentina. Analizá el mensaje del vendedor y extraé información para actualizar el CRM.

Contactos actuales:
${contacts.map(c => `ID ${c.id}: ${c.name} (${c.company}) — estado: "${c.status}", valor: $${c.value.toLocaleString("es-AR")}`).join("\n")}

Devolvé ÚNICAMENTE JSON válido sin markdown:
{
  "contactId": <número o null si no se identifica>,
  "contactName": "<nombre detectado>",
  "updates": {
    "status": "<nuevo estado o null>",
    "value": <número sin símbolos o null>,
    "nextAction": "<próxima acción o null>",
    "nextDate": "<DD Mmm o null>",
    "notes": "<nota breve o null>"
  },
  "summary": "<una línea explicando qué cambió>"
}

Estados válidos: "Nuevo contacto", "Prospecto", "Propuesta enviada", "En negociación", "Cerrado ganado", "Cerrado perdido".`;

async function callGroq(userMsg, contacts) {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type":"application/json", "Authorization":`Bearer ${GROQ_KEY}` },
    body: JSON.stringify({
      model: GROQ_MODEL, max_tokens: 400, temperature: 0.1,
      messages: [
        { role:"system", content: SYSTEM_PROMPT(contacts) },
        { role:"user",   content: userMsg }
      ]
    })
  });
  if (!res.ok) throw new Error(`Groq ${res.status}`);
  const data = await res.json();
  const raw = data.choices[0].message.content.trim().replace(/```json|```/g,"").trim();
  return JSON.parse(raw);
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const fmt = (n) => n ? `$${n.toLocaleString("es-AR")}` : "—";
const ts  = (d) => d.toLocaleTimeString("es-AR",{hour:"2-digit",minute:"2-digit"});

function buildChartData(contacts) {
  return STAGE_ORDER.map(stage => ({
    name: stage.replace("Propuesta enviada","Prop. enviada").replace("Nuevo contacto","Nuevo"),
    fullName: stage,
    cantidad: contacts.filter(c => c.status === stage).length,
    valor: contacts.filter(c => c.status === stage).reduce((s,c) => s+c.value, 0),
    color: STATUS_META[stage]?.color || "#94A3B8"
  })).filter(d => d.cantidad > 0 || STAGE_ORDER.indexOf(d.fullName) < 4);
}

// ─── STYLES ──────────────────────────────────────────────────────────────────
const S = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body, #root { height: 100%; }
body { font-family: 'Plus Jakarta Sans', sans-serif; background: #F0F4FF; }

.app { display:flex; flex-direction:column; height:100vh; overflow:hidden; }

/* NAV */
.nav {
  display:flex; align-items:center; gap:12px;
  padding:0 28px; height:58px; background:#fff;
  border-bottom:1px solid #E2E8F0;
  box-shadow: 0 1px 3px rgba(0,0,0,.05);
  flex-shrink:0; z-index:10;
}
.nav-logo {
  display:flex; align-items:center; gap:9px;
}
.nav-icon {
  width:32px; height:32px; border-radius:9px; background:linear-gradient(135deg,#2563EB,#7C3AED);
  display:flex; align-items:center; justify-content:center;
}
.nav-name { font-weight:800; font-size:18px; color:#0F172A; letter-spacing:-.4px; }
.nav-tag  { font-size:11px; color:#94A3B8; font-weight:500; }
.nav-sep  { flex:1; }
.nav-pill {
  display:flex; align-items:center; gap:6px;
  background:#F0FDF4; border:1px solid #BBF7D0;
  padding:4px 12px; border-radius:20px; font-size:11.5px; color:#059669; font-weight:600;
}
.live-dot { width:6px; height:6px; border-radius:50%; background:#10B981; animation:blink 2s infinite; }
@keyframes blink{0%,100%{opacity:1}50%{opacity:.3}}

/* BODY */
.body { display:flex; flex:1; overflow:hidden; gap:0; }

/* AGENT PANEL */
.agent {
  width:380px; flex-shrink:0; display:flex; flex-direction:column;
  background:#fff; border-right:1px solid #E2E8F0;
}
.panel-head {
  padding:16px 20px; border-bottom:1px solid #F1F5F9;
  display:flex; align-items:center; gap:8px;
}
.panel-title { font-weight:700; font-size:13px; color:#0F172A; }
.panel-sub   { font-size:11px; color:#94A3B8; font-weight:500; }

.msgs { flex:1; overflow-y:auto; padding:16px; display:flex; flex-direction:column; gap:12px;
  scrollbar-width:thin; scrollbar-color:#E2E8F0 transparent; }

.msg { display:flex; flex-direction:column; max-width:88%; animation:fadeUp .2s ease; }
.msg.user  { align-self:flex-end; align-items:flex-end; }
.msg.agent { align-self:flex-start; align-items:flex-start; }
@keyframes fadeUp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}

.bubble {
  padding:11px 14px; border-radius:14px;
  font-family:'JetBrains Mono',monospace; font-size:12px; line-height:1.7; white-space:pre-wrap;
}
.msg.user  .bubble { background:linear-gradient(135deg,#2563EB,#7C3AED); color:#fff; border-bottom-right-radius:4px; }
.msg.agent .bubble { background:#F8FAFC; border:1px solid #E2E8F0; color:#334155; border-bottom-left-radius:4px; }
.bts { font-size:10px; color:#CBD5E1; margin-top:3px; padding:0 2px; }
.msg.user .bts { text-align:right; }

.thinking {
  align-self:flex-start; display:flex; align-items:center; gap:8px;
  padding:10px 14px; background:#F8FAFC; border:1px solid #E2E8F0; border-radius:14px;
  border-bottom-left-radius:4px; font-size:11.5px; color:#94A3B8; font-family:'JetBrains Mono',monospace;
}
.dots span {
  display:inline-block; width:5px; height:5px; border-radius:50%;
  background:#2563EB; margin:0 1.5px; animation:bounce 1s infinite;
}
.dots span:nth-child(2){animation-delay:.15s}.dots span:nth-child(3){animation-delay:.3s}
@keyframes bounce{0%,80%,100%{transform:translateY(0);opacity:.3}40%{transform:translateY(-5px);opacity:1}}

/* CTA BUTTONS */
.cta-row  { display:flex; gap:8px; margin-top:10px; }
.btn-ok {
  padding:7px 16px; background:linear-gradient(135deg,#2563EB,#7C3AED); color:#fff;
  border:none; border-radius:8px; font-family:'Plus Jakarta Sans',sans-serif;
  font-weight:700; font-size:12px; cursor:pointer; transition:.15s; letter-spacing:.01em;
}
.btn-ok:hover { opacity:.9; transform:translateY(-1px); }
.btn-no {
  padding:7px 14px; background:#fff; color:#64748B; border:1px solid #E2E8F0;
  border-radius:8px; font-family:'Plus Jakarta Sans',sans-serif; font-size:12px;
  cursor:pointer; transition:.15s; font-weight:500;
}
.btn-no:hover { border-color:#CBD5E1; color:#334155; }

/* INPUT */
.input-area {
  padding:12px 16px; border-top:1px solid #F1F5F9;
  display:flex; gap:8px; align-items:flex-end; background:#fff;
}
.textarea {
  flex:1; background:#F8FAFC; border:1.5px solid #E2E8F0; border-radius:10px;
  padding:10px 13px; font-family:'Plus Jakarta Sans',sans-serif; font-size:13px;
  color:#0F172A; resize:none; outline:none; min-height:42px; max-height:88px;
  line-height:1.5; transition:border-color .2s;
}
.textarea:focus { border-color:#93C5FD; background:#fff; }
.textarea::placeholder { color:#CBD5E1; }
.icon-btn {
  width:42px; height:42px; border-radius:10px; border:1.5px solid #E2E8F0;
  background:#F8FAFC; cursor:pointer; display:flex; align-items:center;
  justify-content:center; flex-shrink:0; transition:.2s;
}
.icon-btn:hover { border-color:#93C5FD; background:#EFF6FF; }
.icon-btn.live {
  background:#EFF6FF; border-color:#2563EB;
  animation:pulse 1.2s infinite;
}
@keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(37,99,235,.3)}50%{box-shadow:0 0 0 8px rgba(37,99,235,0)}}
.send-btn {
  width:42px; height:42px; border-radius:10px; border:none;
  background:linear-gradient(135deg,#2563EB,#7C3AED); color:#fff;
  cursor:pointer; display:flex; align-items:center; justify-content:center;
  flex-shrink:0; transition:.2s;
}
.send-btn:hover:not(:disabled) { opacity:.9; transform:translateY(-1px); }
.send-btn:disabled { background:#E2E8F0; cursor:not-allowed; }

/* CRM PANEL */
.crm { flex:1; display:flex; flex-direction:column; overflow:hidden; }
.crm-scroll { flex:1; overflow-y:auto; padding:20px 24px; display:flex; flex-direction:column; gap:20px;
  scrollbar-width:thin; scrollbar-color:#E2E8F0 transparent; }

/* KPI ROW */
.kpi-row { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; }
.kpi {
  background:#fff; border:1px solid #E2E8F0; border-radius:14px; padding:16px 18px;
  transition:box-shadow .2s;
}
.kpi:hover { box-shadow:0 4px 16px rgba(0,0,0,.07); }
.kpi-label { font-size:11px; color:#94A3B8; font-weight:600; text-transform:uppercase; letter-spacing:.07em; margin-bottom:8px; }
.kpi-value { font-size:22px; font-weight:800; color:#0F172A; letter-spacing:-.5px; }
.kpi-sub   { font-size:11px; color:#94A3B8; margin-top:3px; }
.kpi-green .kpi-value { color:#059669; }
.kpi-blue  .kpi-value { color:#2563EB; }

/* CHARTS ROW */
.charts-row { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
.chart-card {
  background:#fff; border:1px solid #E2E8F0; border-radius:14px; padding:18px 20px;
}
.chart-head { font-weight:700; font-size:13px; color:#0F172A; margin-bottom:4px; }
.chart-sub  { font-size:11px; color:#94A3B8; margin-bottom:16px; }

/* CARDS GRID */
.cards-section {}
.section-title { font-weight:700; font-size:13px; color:#0F172A; margin-bottom:12px; display:flex; align-items:center; gap:8px; }
.cards-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(250px,1fr)); gap:12px; }

.card {
  background:#fff; border:1px solid #E2E8F0; border-radius:14px; padding:16px;
  transition:box-shadow .25s, border-color .3s, transform .25s; cursor:default;
  position:relative; overflow:hidden;
}
.card:hover { box-shadow:0 6px 20px rgba(0,0,0,.08); transform:translateY(-2px); }
.card.updated {
  border-color:#2563EB; box-shadow:0 0 0 3px rgba(37,99,235,.12);
  animation:cardPop .5s ease;
}
@keyframes cardPop{0%{transform:scale(1)}30%{transform:scale(1.025)}100%{transform:scale(1)}}

.card-accent { position:absolute; top:0; left:0; right:0; height:3px; }

.card-top { display:flex; align-items:center; gap:11px; margin-bottom:14px; }
.av {
  width:38px; height:38px; border-radius:10px; display:flex; align-items:center;
  justify-content:center; font-weight:800; font-size:12px; flex-shrink:0;
}
.card-info { flex:1; min-width:0; }
.card-name { font-weight:700; font-size:13.5px; color:#0F172A; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.card-co   { font-size:11px; color:#94A3B8; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-top:1px; }
.badge {
  padding:3px 9px; border-radius:6px; font-size:10px; font-weight:700;
  letter-spacing:.02em; white-space:nowrap; flex-shrink:0;
}

.card-fields { display:flex; flex-direction:column; gap:0; }
.cf { display:flex; justify-content:space-between; align-items:center; padding:5px 0; border-bottom:1px solid #F8FAFC; font-size:11.5px; }
.cf:last-child { border-bottom:none; }
.cf-l { color:#94A3B8; font-weight:500; }
.cf-v { color:#334155; font-weight:600; text-align:right; max-width:55%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.cf-v.money { color:#2563EB; }

.card-note {
  margin-top:10px; padding:7px 10px; background:#F8FAFC; border-radius:7px;
  font-size:11px; color:#64748B; line-height:1.5; font-style:italic;
}

/* TOOLTIP */
.custom-tip { background:#fff; border:1px solid #E2E8F0; border-radius:8px; padding:8px 12px; box-shadow:0 4px 12px rgba(0,0,0,.1); font-size:12px; }
.custom-tip .label { font-weight:700; color:#0F172A; margin-bottom:3px; }
.custom-tip .val   { color:#2563EB; font-weight:600; }
`;

// ─── CUSTOM TOOLTIP ───────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="custom-tip">
      <div className="label">{payload[0]?.payload?.fullName || label}</div>
      {payload.map((p, i) => (
        <div key={i} className="val">{p.name}: {p.name === "Valor" ? fmt(p.value) : p.value}</div>
      ))}
    </div>
  );
};

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [contacts, setContacts]         = useState(INIT_CONTACTS);
  const [input, setInput]               = useState("");
  const [isListening, setIsListening]   = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pendingUpdate, setPendingUpdate] = useState(null);
  const [updatedId, setUpdatedId]       = useState(null);
  const [messages, setMessages]         = useState([{
    id:0, role:"agent", ts: new Date(),
    text:"Hola 👋 Soy ARIA, tu asistente comercial inteligente.\n\nDictame o escribime una actualización de cualquier cliente y la registro en el CRM al instante."
  }]);

  const msgId    = useRef(1);
  const recogn   = useRef(null);
  const endRef   = useRef(null);
  const textaRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior:"smooth" }); }, [messages, isProcessing]);

  const addMsg = (role, text, extra = {}) => {
    const id = msgId.current++;
    setMessages(prev => [...prev, { id, role, text, ts: new Date(), ...extra }]);
    return id;
  };

  const startListen = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { addMsg("agent","Tu navegador no soporta voz. Usá Chrome o Edge."); return; }
    const r = new SR(); r.lang="es-AR"; r.continuous=false; r.interimResults=true;
    r.onresult = e => setInput(Array.from(e.results).map(x=>x[0].transcript).join(""));
    r.onend  = () => setIsListening(false);
    r.onerror = () => setIsListening(false);
    r.start(); recogn.current = r; setIsListening(true);
  };
  const stopListen = () => { recogn.current?.stop(); setIsListening(false); };

  const send = async () => {
    const text = input.trim();
    if (!text || isProcessing) return;
    setInput(""); addMsg("user", text); setIsProcessing(true);
    try {
      const parsed = await callGroq(text, contacts);
      const id = msgId.current++;
      setMessages(prev => [...prev, {
        id, role:"agent", ts: new Date(),
        text: `Encontré una actualización para **${parsed.contactName}**:\n${parsed.summary}\n\n¿Confirmo los cambios en el CRM?`,
        updateData: parsed
      }]);
      setPendingUpdate({ ...parsed, msgId: id });
    } catch(err) {
      addMsg("agent", `Error al procesar. Intentá de nuevo.\n(${err.message})`);
    } finally { setIsProcessing(false); }
  };

  const confirm = () => {
    if (!pendingUpdate) return;
    const { contactId, contactName, updates } = pendingUpdate;
    if (contactId) {
      setContacts(prev => prev.map(c => {
        if (c.id !== contactId) return c;
        return {
          ...c,
          ...(updates.status     != null && { status:     updates.status }),
          ...(updates.value      != null && { value:      updates.value }),
          ...(updates.nextAction != null && { nextAction: updates.nextAction }),
          ...(updates.nextDate   != null && { nextDate:   updates.nextDate }),
          ...(updates.notes      != null && { notes:      updates.notes }),
        };
      }));
      setUpdatedId(contactId);
      setTimeout(() => setUpdatedId(null), 3000);
    }
    addMsg("agent", `✓ CRM actualizado. Los datos de ${contactName} están sincronizados.`);
    setPendingUpdate(null);
  };

  const reject = () => {
    addMsg("agent","Cambios descartados. Podés corregir el mensaje y reenviar.");
    setPendingUpdate(null);
  };

  const handleKey = e => { if (e.key==="Enter" && !e.shiftKey) { e.preventDefault(); send(); } };

  // derived data
  const totalPipeline = contacts.reduce((s,c) => s + c.value, 0);
  const openDeals     = contacts.filter(c => !["Cerrado ganado","Cerrado perdido"].includes(c.status)).length;
  const wonDeals      = contacts.filter(c => c.status==="Cerrado ganado").length;
  const wonValue      = contacts.filter(c => c.status==="Cerrado ganado").reduce((s,c)=>s+c.value,0);
  const chartData     = buildChartData(contacts);
  const pieData       = chartData.map(d => ({ name: d.fullName, value: d.cantidad, color: d.color }));

  return (
    <>
      <style>{S}</style>
      <div className="app">

        {/* NAV */}
        <nav className="nav">
          <div className="nav-logo">
            <div className="nav-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
            </div>
            <div>
              <div className="nav-name">ARIA</div>
              <div className="nav-tag">Agente de Revenue Intelligence</div>
            </div>
          </div>
          <div className="nav-sep" />
          <div className="nav-pill"><div className="live-dot"/>Sistema activo</div>
        </nav>

        <div className="body">

          {/* ── AGENT ── */}
          <aside className="agent">
            <div className="panel-head">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2m-3.5-7.5-1.5 1.5m-10 10-1.5 1.5m0-13 1.5 1.5m10 10 1.5 1.5"/></svg>
              <div>
                <div className="panel-title">Agente Comercial</div>
                <div className="panel-sub">Groq · Llama 3.3 70B</div>
              </div>
            </div>

            <div className="msgs">
              {messages.map(m => (
                <div key={m.id} className={`msg ${m.role}`}>
                  <div className="bubble">
                    {m.text}
                    {m.updateData && pendingUpdate && (
                      <div className="cta-row">
                        <button className="btn-ok" onClick={confirm}>✓ Confirmar</button>
                        <button className="btn-no" onClick={reject}>Descartar</button>
                      </div>
                    )}
                  </div>
                  <div className="bts">{ts(m.ts)}</div>
                </div>
              ))}
              {isProcessing && (
                <div className="thinking">
                  <div className="dots"><span/><span/><span/></div>
                  Analizando...
                </div>
              )}
              <div ref={endRef}/>
            </div>

            <div className="input-area">
              <button
                className={`icon-btn ${isListening ? "live" : ""}`}
                onClick={isListening ? stopListen : startListen}
                title={isListening ? "Detener" : "Hablar"}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={isListening ? "#2563EB" : "#94A3B8"} strokeWidth="2">
                  <path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z"/>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                  <line x1="12" y1="19" x2="12" y2="23"/>
                  <line x1="8" y1="23" x2="16" y2="23"/>
                </svg>
              </button>
              <textarea
                ref={textaRef}
                className="textarea"
                placeholder='Ej: "Laura de TechSur cerró el deal por $140k, firma el jueves"'
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                rows={1}
              />
              <button className="send-btn" onClick={send} disabled={isProcessing || !input.trim()}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </button>
            </div>
          </aside>

          {/* ── CRM ── */}
          <main className="crm">
            <div className="crm-scroll">

              {/* KPIs */}
              <div className="kpi-row">
                <div className="kpi kpi-blue">
                  <div className="kpi-label">Pipeline total</div>
                  <div className="kpi-value">{fmt(totalPipeline)}</div>
                  <div className="kpi-sub">En todos los stages</div>
                </div>
                <div className="kpi kpi-green">
                  <div className="kpi-label">Cerrado ganado</div>
                  <div className="kpi-value">{fmt(wonValue)}</div>
                  <div className="kpi-sub">{wonDeals} deal{wonDeals!==1?"s":""} cerrado{wonDeals!==1?"s":""}</div>
                </div>
                <div className="kpi">
                  <div className="kpi-label">Deals activos</div>
                  <div className="kpi-value">{openDeals}</div>
                  <div className="kpi-sub">En progreso</div>
                </div>
                <div className="kpi">
                  <div className="kpi-label">Contactos</div>
                  <div className="kpi-value">{contacts.length}</div>
                  <div className="kpi-sub">En el pipeline</div>
                </div>
              </div>

              {/* CHARTS */}
              <div className="charts-row">
                <div className="chart-card">
                  <div className="chart-head">Pipeline por etapa</div>
                  <div className="chart-sub">Valor total ($) en cada etapa</div>
                  <ResponsiveContainer width="100%" height={170}>
                    <BarChart data={chartData} margin={{top:4,right:4,left:4,bottom:4}}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false}/>
                      <XAxis dataKey="name" tick={{fontSize:10,fill:"#94A3B8",fontFamily:"Plus Jakarta Sans"}} axisLine={false} tickLine={false}/>
                      <YAxis hide/>
                      <Tooltip content={<CustomTooltip/>}/>
                      <Bar dataKey="valor" name="Valor" radius={[6,6,0,0]} maxBarSize={48}>
                        {chartData.map((entry,i) => <Cell key={i} fill={entry.color}/>)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="chart-card">
                  <div className="chart-head">Distribución de contactos</div>
                  <div className="chart-sub">Cantidad por estado</div>
                  <ResponsiveContainer width="100%" height={170}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                        {pieData.map((entry,i) => <Cell key={i} fill={entry.color}/>)}
                      </Pie>
                      <Tooltip formatter={(v,n,p) => [v, p.payload.name]}/>
                      <Legend iconType="circle" iconSize={8} wrapperStyle={{fontSize:"10px",fontFamily:"Plus Jakarta Sans"}}/>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* CARDS */}
              <div className="cards-section">
                <div className="section-title">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  Contactos del pipeline
                </div>
                <div className="cards-grid">
                  {contacts.map(c => {
                    const meta = STATUS_META[c.status] || { color:"#94A3B8", bg:"#F8FAFC", text:"#64748B" };
                    return (
                      <div key={c.id} className={`card ${updatedId===c.id?"updated":""}`}>
                        <div className="card-accent" style={{background:meta.color}}/>
                        <div className="card-top">
                          <div className="av" style={{background:meta.bg, color:meta.text}}>{c.initials}</div>
                          <div className="card-info">
                            <div className="card-name">{c.name}</div>
                            <div className="card-co">{c.company}</div>
                          </div>
                          <div className="badge" style={{background:meta.bg, color:meta.text}}>{c.status}</div>
                        </div>
                        <div className="card-fields">
                          <div className="cf">
                            <span className="cf-l">Valor</span>
                            <span className={`cf-v ${c.value>0?"money":""}`}>{fmt(c.value)}</span>
                          </div>
                          <div className="cf">
                            <span className="cf-l">Próxima acción</span>
                            <span className="cf-v">{c.nextAction}</span>
                          </div>
                          <div className="cf">
                            <span className="cf-l">Fecha</span>
                            <span className="cf-v">{c.nextDate}</span>
                          </div>
                        </div>
                        {c.notes && <div className="card-note">{c.notes}</div>}
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </main>
        </div>
      </div>
    </>
  );
}
