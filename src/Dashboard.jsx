import { useState, useRef, useEffect, useCallback } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend, LineChart, Line } from "recharts";
import { supabase } from "./supabase.js";

const GROQ_KEY   = "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";
const GROQ_MODEL = "llama-3.3-70b-versatile";

const STATUS_META = {
  "Nuevo contacto":    {color:"#6366F1",bg:"#EEF2FF",text:"#4338CA"},
  "Prospecto":         {color:"#3B82F6",bg:"#EFF6FF",text:"#1D4ED8"},
  "Propuesta enviada": {color:"#F59E0B",bg:"#FFFBEB",text:"#B45309"},
  "En negociación":    {color:"#F97316",bg:"#FFF7ED",text:"#C2410C"},
  "Cerrado ganado":    {color:"#10B981",bg:"#ECFDF5",text:"#047857"},
  "Cerrado perdido":   {color:"#EF4444",bg:"#FEF2F2",text:"#B91C1C"},
};
const STAGE_ORDER = ["Nuevo contacto","Prospecto","Propuesta enviada","En negociación","Cerrado ganado","Cerrado perdido"];

const OPP_STAGES = ["Prospección","Calificación","Demo","Propuesta","Negociación","Cierre","Ganada","Perdida"];
const OPP_COLORS = {"Prospección":"#6366F1","Calificación":"#3B82F6","Demo":"#F59E0B","Propuesta":"#F97316","Negociación":"#8B5CF6","Cierre":"#EC4899","Ganada":"#10B981","Perdida":"#EF4444"};

const PRIORITY_META = {
  "Alta":  {color:"#EF4444",bg:"#FEF2F2",text:"#B91C1C"},
  "Media": {color:"#F59E0B",bg:"#FFFBEB",text:"#B45309"},
  "Baja":  {color:"#10B981",bg:"#ECFDF5",text:"#047857"},
};
const STATUS_TASK = {
  "Pendiente":   {color:"#F59E0B",bg:"#FFFBEB",text:"#B45309"},
  "En progreso": {color:"#3B82F6",bg:"#EFF6FF",text:"#1D4ED8"},
  "Completada":  {color:"#10B981",bg:"#ECFDF5",text:"#047857"},
};
const CONTRACT_STATUS = {
  "Activo":    {color:"#10B981",bg:"#ECFDF5",text:"#047857"},
  "Vencido":   {color:"#EF4444",bg:"#FEF2F2",text:"#B91C1C"},
  "Cancelado": {color:"#94A3B8",bg:"#F8FAFC",text:"#64748B"},
  "Por vencer":{color:"#F59E0B",bg:"#FFFBEB",text:"#B45309"},
};

const DEFAULT_CONTACTS = [
  {name:"Carlos Mendoza",  initials:"CM",company:"Acme Logistics",    status:"Prospecto",        value:45000, next_action:"Enviar propuesta",      next_date:"20 Mar",notes:"Interesado en plan enterprise"},
  {name:"Laura Fernández", initials:"LF",company:"TechSur SA",        status:"En negociación",   value:120000,next_action:"Llamada de seguimiento",next_date:"18 Mar",notes:"Revisando contrato con legal"},
  {name:"Roberto Paz",     initials:"RP",company:"Constructora Norte",status:"Nuevo contacto",   value:0,     next_action:"Primera llamada",       next_date:"19 Mar",notes:"Referido por Carlos Mendoza"},
  {name:"Sofía Reyes",     initials:"SR",company:"Distribuidora Sur", status:"Propuesta enviada",value:78000, next_action:"Esperar respuesta",     next_date:"22 Mar",notes:"Presupuesto aprobado"},
  {name:"Diego Torres",    initials:"DT",company:"MegaFarma SA",      status:"En negociación",   value:95000, next_action:"Demo técnica",          next_date:"21 Mar",notes:"Quiere ver integración SAP"},
  {name:"Ana Quiroga",     initials:"AQ",company:"Grupo Pampa",       status:"Cerrado ganado",   value:210000,next_action:"Onboarding",            next_date:"25 Mar",notes:"Firmó el contrato anual"},
];

// ── Groq helpers ────────────────────────────────────────────────────────────
const buildSystemPrompt = (data) => `Sos ARIA, asistente comercial inteligente de una empresa argentina de software. Tenés acceso a todos los módulos del CRM.

CONTACTOS: ${data.contacts.map(c=>`[${c.id}] ${c.name} (${c.company})`).join(", ")}
OPORTUNIDADES: ${data.opportunities.map(o=>`[${o.id}] ${o.title} — ${o.contact_name} — ${o.stage} — $${o.value?.toLocaleString("es-AR")}`).join(", ")}
CONTRATOS: ${data.contracts.map(c=>`[${c.id}] ${c.title} — ${c.company} — ${c.status} — vence ${c.end_date}`).join(", ")}
TAREAS: ${data.tasks.map(t=>`[${t.id}] ${t.title} — ${t.assigned_to} — ${t.status}`).join(", ")}

Analizá el mensaje del usuario y respondé con JSON (sin markdown):
{
  "action": "update_contact|update_opportunity|update_task|create_task|draft_email|briefing|general",
  "entityId": <número o null>,
  "entityType": "contact|opportunity|task|email",
  "contactName": "<nombre si aplica>",
  "updates": {
    "status": null, "value": null, "stage": null, "probability": null,
    "nextAction": null, "nextDate": null, "notes": null,
    "taskStatus": null, "assignedTo": null, "priority": null,
    "emailSubject": null, "emailBody": null
  },
  "summary": "<una línea de qué va a hacer ARIA>",
  "reply": "<mensaje conversacional para el vendedor, en español argentino>"
}

Para briefings o consultas generales, ponés action:"general" y escribís la respuesta en "reply".
Para generar un email, ponés action:"draft_email" y completás emailSubject y emailBody con el borrador completo.
Estados contacto válidos: "Nuevo contacto","Prospecto","Propuesta enviada","En negociación","Cerrado ganado","Cerrado perdido"
Etapas oportunidad válidas: "Prospección","Calificación","Demo","Propuesta","Negociación","Cierre","Ganada","Perdida"
Estados tarea válidos: "Pendiente","En progreso","Completada"`;

async function callGroq(msg, data) {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions",{
    method:"POST",
    headers:{"Content-Type":"application/json","Authorization":`Bearer ${GROQ_KEY}`},
    body:JSON.stringify({model:GROQ_MODEL,max_tokens:800,temperature:0.15,
      messages:[{role:"system",content:buildSystemPrompt(data)},{role:"user",content:msg}]})
  });
  if(!res.ok) throw new Error(`Groq ${res.status}`);
  const d = await res.json();
  return JSON.parse(d.choices[0].message.content.trim().replace(/```json|```/g,"").trim());
}

// ── Utils ────────────────────────────────────────────────────────────────────
const fmt = n => n ? `$${n.toLocaleString("es-AR")}` : "—";
const hms = d => d.toLocaleTimeString("es-AR",{hour:"2-digit",minute:"2-digit"});
const relTime = iso => { const m=Math.floor((Date.now()-new Date(iso).getTime())/60000); if(m<1)return"ahora";if(m<60)return`hace ${m}m`;const h=Math.floor(m/60);if(h<24)return`hace ${h}h`;return`hace ${Math.floor(h/24)}d`; };
const dbToContact = r => ({id:r.id,name:r.name,init:r.initials,company:r.company,status:r.status,value:r.value,nextAction:r.next_action,nextDate:r.next_date,notes:r.notes});

function downloadCSV(filename,rows,headers){const e=v=>`"${String(v??'').replace(/"/g,'""')}"`;const csv=[headers.join(','),...rows.map(r=>r.map(e).join(','))].join('\n');const b=new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8'});const u=URL.createObjectURL(b);const a=document.createElement('a');a.href=u;a.download=filename;a.click();URL.revokeObjectURL(u);}

const CustomTip = ({active,payload}) => {
  if(!active||!payload?.length)return null;
  return <div style={{background:"#fff",border:"1px solid #E2E8F0",borderRadius:8,padding:"8px 12px",fontSize:12,boxShadow:"0 4px 12px rgba(0,0,0,.1)"}}>
    <div style={{fontWeight:700,color:"#0F172A",marginBottom:2}}>{payload[0].payload.fullName||payload[0].payload.name}</div>
    <div style={{color:payload[0].payload.color||"#3B82F6",fontWeight:600}}>{fmt(payload[0].value)}</div>
  </div>;
};

function useVoice({onTranscript,onError}){
  const [state,setState]=useState("idle");const [interim,setInterim]=useState("");
  const rRef=useRef(null);const fRef=useRef("");const sRef=useRef("idle");
  const setS=s=>{sRef.current=s;setState(s);};
  const isSupported=!!(window.SpeechRecognition||window.webkitSpeechRecognition);
  const start=useCallback(async()=>{
    if(!isSupported){onError("Usá Chrome o Edge.");return;}setS("requesting");
    try{await navigator.mediaDevices.getUserMedia({audio:true});}
    catch{setS("error");onError("Permiso denegado.");setTimeout(()=>setS("idle"),4000);return;}
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition;const r=new SR();
    r.lang="es-AR";r.continuous=true;r.interimResults=true;fRef.current="";
    r.onstart=()=>setS("listening");
    r.onresult=e=>{let it="",ft=fRef.current;for(let i=e.resultIndex;i<e.results.length;i++){const t=e.results[i][0].transcript;e.results[i].isFinal?(ft+=t+" "):(it+=t);}fRef.current=ft;setInterim(it);onTranscript(ft+it);};
    r.onerror=e=>{setS("error");const m={"not-allowed":"Permiso denegado.","no-speech":"Sin voz.","network":"Error de red."};onError(m[e.error]||`Error: ${e.error}`);setTimeout(()=>setS("idle"),3500);};
    r.onend=()=>{if(sRef.current==="listening"){try{r.start();return;}catch(_){}}setInterim("");setS("idle");};
    rRef.current=r;try{r.start();}catch(e){setS("error");onError(`Error: ${e.message}`);setTimeout(()=>setS("idle"),3000);}
  },[isSupported,onTranscript,onError]);
  const stop=useCallback(()=>{setS("idle");rRef.current?.stop();rRef.current=null;setInterim("");},[]);
  return{state,interim,start,stop,isSupported};
}

// ── NAV ITEMS ────────────────────────────────────────────────────────────────
const NAV = [
  {id:"overview",   label:"Resumen",        icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>},
  {id:"pipeline",   label:"Pipeline",       icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>},
  {id:"opps",       label:"Oportunidades",  icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>},
  {id:"contracts",  label:"Contratos",      icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>},
  {id:"email",      label:"Email",          icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>},
  {id:"tasks",      label:"Tareas",         icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>},
  {id:"activity",   label:"Historial",      icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>},
];

// ════════════════════════════════════════════════════════════
export default function Dashboard({user,onLogout}) {
  const [contacts,     setContacts]     = useState([]);
  const [opportunities,setOpportunities]= useState([]);
  const [contracts,    setContracts]    = useState([]);
  const [tasks,        setTasks]        = useState([]);
  const [emails,       setEmails]       = useState([]);
  const [activity,     setActivity]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [dbError,      setDbError]      = useState(null);
  const [input,        setInput]        = useState("");
  const [processing,   setProcessing]   = useState(false);
  const [pending,      setPending]      = useState(null);
  const [flashId,      setFlashId]      = useState(null);
  const [activeModule, setActiveModule] = useState("overview");
  const [resetting,    setResetting]    = useState(false);
  const [showExport,   setShowExport]   = useState(false);
  const [draftModal,   setDraftModal]   = useState(null);
  const [messages,     setMessages]     = useState([{id:0,role:"agent",ts:new Date(),
    text:`Hola ${user.email.split("@")[0]} 👋 Soy ARIA.\n\nTengo acceso a todo el CRM: pipeline, oportunidades, contratos, tareas y emails.\n\nProbá decirme "¿Cómo está el pipeline?" o "Generá el email de seguimiento para Diego Torres".`}]);

  const mid=useRef(1); const bottom=useRef(null); const exportRef=useRef(null);
  const isAdmin = user.email.includes("admin");

  useEffect(()=>{loadAll();},[]);
  useEffect(()=>{bottom.current?.scrollIntoView({behavior:"smooth"});},[messages,processing]);
  useEffect(()=>{
    const h=e=>{if(exportRef.current&&!exportRef.current.contains(e.target))setShowExport(false);};
    document.addEventListener("mousedown",h); return()=>document.removeEventListener("mousedown",h);
  },[]);

  const loadAll = async()=>{
    setLoading(true);
    try{
      const [ct,op,co,tk,em,ac] = await Promise.all([
        supabase.from("contacts").select("*").order("id"),
        supabase.from("opportunities").select("*").order("id"),
        supabase.from("contracts").select("*").order("id"),
        supabase.from("tasks").select("*").order("id"),
        supabase.from("email_drafts").select("*").order("created_at",{ascending:false}),
        supabase.from("activity_log").select("*").order("created_at",{ascending:false}).limit(50),
      ]);
      if(ct.error)throw ct.error; if(op.error)throw op.error; if(co.error)throw co.error;
      if(tk.error)throw tk.error; if(em.error)throw em.error;
      setContacts((ct.data||[]).map(dbToContact));
      setOpportunities(op.data||[]);
      setContracts(co.data||[]);
      setTasks(tk.data||[]);
      setEmails(em.data||[]);
      setActivity(ac.data||[]);
    }catch(e){setDbError(e.message);}
    finally{setLoading(false);}
  };

  const addMsg=(role,text,extra={})=>{const id=mid.current++;setMessages(p=>[...p,{id,role,text,ts:new Date(),...extra}]);return id;};
  const handleTranscript=useCallback(t=>setInput(t),[]);
  const handleVoiceError=useCallback(msg=>addMsg("agent",`⚠️ ${msg}`),[]);
  const{state:micState,interim,start:startListen,stop:stopListen}=useVoice({onTranscript:handleTranscript,onError:handleVoiceError});

  const send=async()=>{
    const t=input.trim(); if(!t||processing)return;
    if(micState==="listening")stopListen();
    setInput(""); addMsg("user",t); setProcessing(true);
    try{
      const p=await callGroq(t,{contacts,opportunities,contracts,tasks});
      if(p.action==="general"||p.action==="briefing"){
        addMsg("agent",p.reply||"Procesado."); setProcessing(false); return;
      }
      if(p.action==="draft_email"&&p.updates?.emailSubject){
        const id=mid.current++;
        setMessages(prev=>[...prev,{id,role:"agent",ts:new Date(),
          text:`Borrador generado para **${p.contactName}**.\n\n📧 ${p.updates.emailSubject}\n\n¿Lo guardo en Email?`,
          updateData:p}]);
        setPending({...p,msgId:id}); setProcessing(false); return;
      }
      if(p.action==="create_task"){
        const id=mid.current++;
        setMessages(prev=>[...prev,{id,role:"agent",ts:new Date(),
          text:`Nueva tarea detectada:\n${p.summary}\n\n¿La creo en el sistema?`,
          updateData:p}]);
        setPending({...p,msgId:id}); setProcessing(false); return;
      }
      const id=mid.current++;
      setMessages(prev=>[...prev,{id,role:"agent",ts:new Date(),
        text:`${p.reply||p.summary}\n\n¿Confirmo los cambios?`,
        updateData:p}]);
      setPending({...p,msgId:id});
    }catch(e){addMsg("agent",`Error: ${e.message}`);}
    finally{setProcessing(false);}
  };

  const confirm=async()=>{
    if(!pending)return;
    const{action,entityId,entityType,contactName,updates,summary}=pending;
    try{
      if(action==="draft_email"&&updates?.emailSubject){
        const cid=contacts.find(c=>c.name.toLowerCase().includes((contactName||"").toLowerCase()))?.id||null;
        const co=contacts.find(c=>c.name.toLowerCase().includes((contactName||"").toLowerCase()))?.company||"";
        const{data:ed}=await supabase.from("email_drafts").insert({contact_id:cid,contact_name:contactName||"",company:co,subject:updates.emailSubject,body:updates.emailBody||""}).select().single();
        if(ed){setEmails(prev=>[ed,...prev]);setDraftModal(ed);setActiveModule("email");}
        addMsg("agent",`✓ Email guardado en borradores. Podés verlo en el módulo Email.`);
      } else if(action==="create_task"){
        const{data:td}=await supabase.from("tasks").insert({contact_name:contactName||null,title:summary,priority:updates.priority||"Media",due_date:updates.nextDate||null,assigned_to:updates.assignedTo||"Sin asignar",status:"Pendiente",type:"Comercial"}).select().single();
        if(td){setTasks(prev=>[...prev,td]);setActiveModule("tasks");}
        addMsg("agent",`✓ Tarea creada y asignada.`);
      } else if(entityType==="contact"&&entityId){
        const dbUp={};
        if(updates.status!=null)dbUp.status=updates.status;if(updates.value!=null)dbUp.value=updates.value;
        if(updates.nextAction!=null)dbUp.next_action=updates.nextAction;if(updates.nextDate!=null)dbUp.next_date=updates.nextDate;
        if(updates.notes!=null)dbUp.notes=updates.notes;
        await supabase.from("contacts").update(dbUp).eq("id",entityId);
        const{data:ld}=await supabase.from("activity_log").insert({contact_id:entityId,contact_name:contactName,summary,changes:dbUp}).select().single();
        setContacts(prev=>prev.map(c=>c.id!==entityId?c:{...c,...(updates.status!=null&&{status:updates.status}),...(updates.value!=null&&{value:updates.value}),...(updates.nextAction!=null&&{nextAction:updates.nextAction}),...(updates.nextDate!=null&&{nextDate:updates.nextDate}),...(updates.notes!=null&&{notes:updates.notes})}));
        if(ld)setActivity(prev=>[ld,...prev]);
        setFlashId(entityId); setTimeout(()=>setFlashId(null),3000);
        addMsg("agent",`✓ CRM actualizado. ${contactName} al día.`);
      } else if(entityType==="opportunity"&&entityId){
        const dbUp={};
        if(updates.stage!=null)dbUp.stage=updates.stage;if(updates.value!=null)dbUp.value=updates.value;
        if(updates.probability!=null)dbUp.probability=updates.probability;if(updates.notes!=null)dbUp.notes=updates.notes;
        await supabase.from("opportunities").update(dbUp).eq("id",entityId);
        setOpportunities(prev=>prev.map(o=>o.id!==entityId?o:{...o,...dbUp}));
        addMsg("agent",`✓ Oportunidad actualizada.`);
      } else if(entityType==="task"&&entityId){
        const dbUp={};
        if(updates.taskStatus!=null)dbUp.status=updates.taskStatus;
        if(updates.assignedTo!=null)dbUp.assigned_to=updates.assignedTo;
        await supabase.from("tasks").update(dbUp).eq("id",entityId);
        setTasks(prev=>prev.map(t=>t.id!==entityId?t:{...t,...dbUp}));
        addMsg("agent",`✓ Tarea actualizada.`);
      }
    }catch(e){addMsg("agent",`Error: ${e.message}`);}
    setPending(null);
  };

  const reject=()=>{addMsg("agent","Cambios descartados.");setPending(null);};
  const handleKey=e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}};

  const resetDemo=async()=>{
    if(!window.confirm("¿Restablecer todos los datos de la demo?"))return;
    setResetting(true);
    try{
      await Promise.all([
        supabase.from("activity_log").delete().neq("id",0),
        supabase.from("email_drafts").delete().neq("id",0),
        supabase.from("tasks").delete().neq("id",0),
        supabase.from("contracts").delete().neq("id",0),
        supabase.from("opportunities").delete().neq("id",0),
        supabase.from("contacts").delete().neq("id",0),
      ]);
      await supabase.from("contacts").insert(DEFAULT_CONTACTS);
      await loadAll();
      setMessages([{id:0,role:"agent",ts:new Date(),text:`Datos restablecidos ✓ Listo para una nueva demo.`}]);
      setPending(null);
    }catch(e){alert("Error: "+e.message);}
    finally{setResetting(false);}
  };

  // Derived
  const pipeline   = contacts.reduce((s,c)=>s+c.value,0);
  const openOpps   = opportunities.filter(o=>o.status==="Abierta");
  const oppValue   = openOpps.reduce((s,o)=>s+o.value,0);
  const pendTasks  = tasks.filter(t=>t.status!=="Completada").length;
  const expContracts = contracts.filter(c=>c.status==="Vencido"||c.status==="Por vencer").length;

  const chartData = STAGE_ORDER.map(s=>({
    name:s.replace("Propuesta enviada","Prop. enviada").replace("Nuevo contacto","Nuevo"),
    fullName:s,color:STATUS_META[s]?.color||"#94A3B8",
    Valor:contacts.filter(c=>c.status===s).reduce((a,c)=>a+c.value,0),
  })).filter(d=>d.Valor>0);

  const oppStageData = OPP_STAGES.map(s=>({
    name:s,color:OPP_COLORS[s]||"#94A3B8",
    Valor:opportunities.filter(o=>o.stage===s).reduce((a,o)=>a+o.value,0),
  })).filter(d=>d.Valor>0);

  const micC={idle:{border:"#E2E8F0",bg:"#F8FAFC",icon:"#94A3B8",anim:"none"},requesting:{border:"#FCD34D",bg:"#FFFBEB",icon:"#D97706",anim:"none"},listening:{border:"#2563EB",bg:"#EFF6FF",icon:"#2563EB",anim:"pulse 1.2s infinite"},error:{border:"#FECACA",bg:"#FEF2F2",icon:"#EF4444",anim:"none"}}[micState]||{border:"#E2E8F0",bg:"#F8FAFC",icon:"#94A3B8",anim:"none"};
  const card={background:"#fff",border:"1px solid #E2E8F0",borderRadius:13,padding:"16px 18px"};
  const badge=(label,meta)=><span style={{padding:"2px 8px",borderRadius:5,background:meta?.bg||"#F8FAFC",color:meta?.text||"#64748B",fontSize:9.5,fontWeight:700,whiteSpace:"nowrap"}}>{label}</span>;

  if(loading)return<div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",background:"#F0F4FF",fontFamily:"'Plus Jakarta Sans',sans-serif",flexDirection:"column",gap:12}}><div style={{width:36,height:36,borderRadius:9,background:"linear-gradient(135deg,#2563EB,#7C3AED)",display:"flex",alignItems:"center",justifyContent:"center"}}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg></div><div style={{fontSize:13,color:"#94A3B8",fontWeight:500}}>Cargando CRM...</div></div>;
  if(dbError)return<div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",background:"#F0F4FF",fontFamily:"'Plus Jakarta Sans',sans-serif",flexDirection:"column",gap:10,padding:20}}><div style={{fontSize:13,color:"#EF4444",fontWeight:600}}>Error de conexión</div><div style={{fontSize:11,color:"#94A3B8",maxWidth:360,textAlign:"center"}}>{dbError}</div><button onClick={loadAll} style={{padding:"7px 18px",background:"#2563EB",color:"#fff",border:"none",borderRadius:8,fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:600,fontSize:12,cursor:"pointer"}}>Reintentar</button></div>;

  return(
    <div style={{display:"flex",flexDirection:"column",height:"100vh",background:"#F0F4FF",fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif",overflow:"hidden"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:#E2E8F0;border-radius:4px}
        @keyframes fadeUp{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:none}}
        @keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(37,99,235,.35)}50%{box-shadow:0 0 0 9px rgba(37,99,235,0)}}
        @keyframes livePulse{0%,100%{box-shadow:0 0 0 0 rgba(16,185,129,.4)}50%{box-shadow:0 0 0 7px rgba(16,185,129,0)}}
        @keyframes bounce{0%,80%,100%{transform:translateY(0);opacity:.3}40%{transform:translateY(-4px);opacity:1}}
        @keyframes spin{to{transform:rotate(360deg)}}
        textarea:focus{outline:none!important;border-color:#93C5FD!important;background:#fff!important}
        textarea::placeholder{color:#CBD5E1}
        tr:hover td{background:#FAFBFF}
      `}</style>

      {/* NAV */}
      <nav style={{height:52,background:"#fff",borderBottom:"1px solid #E2E8F0",display:"flex",alignItems:"center",padding:"0 16px",gap:8,flexShrink:0,boxShadow:"0 1px 3px rgba(0,0,0,.04)",zIndex:10}}>
        <div style={{width:28,height:28,borderRadius:7,background:"linear-gradient(135deg,#2563EB,#7C3AED)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
        </div>
        <div style={{fontWeight:800,fontSize:15,color:"#0F172A",letterSpacing:"-.3px"}}>ARIA</div>
        <div style={{flex:1}}/>
        {isAdmin&&<>
          <div ref={exportRef} style={{position:"relative"}}>
            <button onClick={()=>setShowExport(p=>!p)} style={{padding:"4px 10px",background:"transparent",border:"1px solid #E2E8F0",borderRadius:7,fontFamily:"'Plus Jakarta Sans',sans-serif",fontSize:11,color:"#2563EB",cursor:"pointer",fontWeight:600,display:"flex",alignItems:"center",gap:4}}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Exportar
            </button>
            {showExport&&<div style={{position:"absolute",top:"calc(100% + 5px)",right:0,background:"#fff",border:"1px solid #E2E8F0",borderRadius:10,boxShadow:"0 8px 24px rgba(0,0,0,.1)",padding:5,minWidth:180,zIndex:50}}>
              {[{l:"Contactos CSV",f:()=>{downloadCSV(`contactos.csv`,contacts.map(c=>[c.name,c.company,c.status,c.value,c.nextAction,c.nextDate]),["Nombre","Empresa","Estado","Valor","Acción","Fecha"]);setShowExport(false);}},
                {l:"Oportunidades CSV",f:()=>{downloadCSV(`oportunidades.csv`,opportunities.map(o=>[o.contact_name,o.company,o.title,o.stage,o.value,o.probability+"%",o.close_date,o.owner]),["Contacto","Empresa","Título","Etapa","Valor","Probabilidad","Cierre","Owner"]);setShowExport(false);}},
                {l:"Contratos CSV",f:()=>{downloadCSV(`contratos.csv`,contracts.map(c=>[c.contact_name,c.company,c.product,c.value,c.start_date,c.end_date,c.status]),["Contacto","Empresa","Producto","Valor","Inicio","Vencimiento","Estado"]);setShowExport(false);}},
                {l:"Tareas CSV",f:()=>{downloadCSV(`tareas.csv`,tasks.map(t=>[t.title,t.assigned_to,t.priority,t.due_date,t.status]),["Tarea","Asignado a","Prioridad","Vencimiento","Estado"]);setShowExport(false);}},
              ].map(({l,f})=><button key={l} onClick={f} style={{width:"100%",padding:"7px 11px",background:"transparent",border:"none",borderRadius:6,fontFamily:"'Plus Jakarta Sans',sans-serif",fontSize:11.5,color:"#334155",cursor:"pointer",textAlign:"left",transition:"background .1s"}} onMouseEnter={e=>e.currentTarget.style.background="#F8FAFC"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>{l}</button>)}
            </div>}
          </div>
          <button onClick={resetDemo} disabled={resetting} style={{padding:"4px 10px",background:"transparent",border:"1px solid #FECACA",borderRadius:7,fontFamily:"'Plus Jakarta Sans',sans-serif",fontSize:11,color:"#EF4444",cursor:"pointer",fontWeight:600,display:"flex",alignItems:"center",gap:4}} onMouseEnter={e=>e.currentTarget.style.background="#FEF2F2"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
            {resetting?<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{animation:"spin 1s linear infinite"}}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>:<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>}
            Reset
          </button>
        </>}
        <div style={{display:"flex",alignItems:"center",gap:5,background:"#F0FDF4",border:"1px solid #BBF7D0",padding:"3px 9px",borderRadius:20,fontSize:10,color:"#059669",fontWeight:600}}>
          <div style={{width:5,height:5,borderRadius:"50%",background:"#10B981",animation:"livePulse 2s infinite"}}/>Activo
        </div>
        <button onClick={onLogout} style={{padding:"4px 10px",background:"transparent",border:"1px solid #E2E8F0",borderRadius:7,fontFamily:"'Plus Jakarta Sans',sans-serif",fontSize:11,color:"#94A3B8",cursor:"pointer"}} onMouseEnter={e=>{e.currentTarget.style.borderColor="#FECACA";e.currentTarget.style.color="#EF4444";}} onMouseLeave={e=>{e.currentTarget.style.borderColor="#E2E8F0";e.currentTarget.style.color="#94A3B8";}}>Salir</button>
      </nav>

      <div style={{display:"flex",flex:1,overflow:"hidden"}}>

        {/* SIDEBAR */}
        <div style={{width:188,flexShrink:0,background:"#fff",borderRight:"1px solid #E2E8F0",display:"flex",flexDirection:"column",padding:"12px 8px",gap:2,overflowY:"auto"}}>
          {NAV.map(n=>{
            const active=activeModule===n.id;
            const count = n.id==="tasks"?pendTasks:n.id==="contracts"?expContracts:n.id==="email"?emails.filter(e=>!e.sent).length:null;
            return<button key={n.id} onClick={()=>setActiveModule(n.id)} style={{display:"flex",alignItems:"center",gap:9,padding:"8px 10px",borderRadius:8,border:"none",background:active?"linear-gradient(135deg,#EFF6FF,#F5F3FF)":"transparent",cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif",fontSize:12.5,fontWeight:active?700:500,color:active?"#2563EB":"#64748B",transition:"all .15s",width:"100%",textAlign:"left"}}>
              <span style={{color:active?"#2563EB":"#94A3B8",flexShrink:0}}>{n.icon}</span>
              {n.label}
              {count>0&&<span style={{marginLeft:"auto",background:active?"#2563EB":"#E2E8F0",color:active?"#fff":"#64748B",padding:"0 6px",borderRadius:10,fontSize:10,fontWeight:700}}>{count}</span>}
            </button>;
          })}

          {/* Zoho connector */}
          <div style={{marginTop:"auto",padding:"10px 8px",background:"#FFFBEB",borderRadius:9,border:"1px solid #FDE68A"}}>
            <div style={{fontSize:10,fontWeight:700,color:"#B45309",marginBottom:5,textTransform:"uppercase",letterSpacing:".06em"}}>Integración CRM</div>
            <button onClick={()=>alert("Zoho OAuth: ver README.md para configurar tu Client ID y Client Secret.")} style={{width:"100%",padding:"6px",background:"#fff",border:"1px solid #FDE68A",borderRadius:6,fontFamily:"'Plus Jakarta Sans',sans-serif",fontSize:11,color:"#D97706",cursor:"pointer",fontWeight:600,display:"flex",alignItems:"center",gap:5}}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
              Conectar Zoho CRM
            </button>
          </div>
        </div>

        {/* AGENT */}
        <div style={{width:320,flexShrink:0,display:"flex",flexDirection:"column",background:"#fff",borderRight:"1px solid #E2E8F0"}}>
          <div style={{padding:"10px 14px",borderBottom:"1px solid #F1F5F9",display:"flex",alignItems:"center",gap:7}}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2m-3.5-7.5-1.5 1.5m-10 10-1.5 1.5m0-13 1.5 1.5m10 10 1.5 1.5"/></svg>
            <div><div style={{fontWeight:700,fontSize:12,color:"#0F172A"}}>Agente ARIA</div><div style={{fontSize:9,color:"#94A3B8"}}>Groq · Llama 3.3 70B · Todos los módulos</div></div>
          </div>
          <div style={{flex:1,overflowY:"auto",padding:10,display:"flex",flexDirection:"column",gap:9}}>
            {messages.map(m=>(
              <div key={m.id} style={{display:"flex",flexDirection:"column",alignSelf:m.role==="user"?"flex-end":"flex-start",maxWidth:"92%",animation:"fadeUp .2s ease"}}>
                <div style={{padding:"8px 11px",borderRadius:11,fontFamily:"'JetBrains Mono',monospace",fontSize:10.5,lineHeight:1.7,whiteSpace:"pre-wrap",
                  ...(m.role==="user"?{background:"linear-gradient(135deg,#2563EB,#7C3AED)",color:"#fff",borderBottomRightRadius:3}:{background:"#F8FAFC",border:"1px solid #E2E8F0",color:"#334155",borderBottomLeftRadius:3})}}>
                  {m.text}
                  {m.updateData&&pending&&<div style={{display:"flex",gap:6,marginTop:8}}>
                    <button onClick={confirm} style={{padding:"4px 12px",background:"linear-gradient(135deg,#2563EB,#7C3AED)",color:"#fff",border:"none",borderRadius:6,fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:700,fontSize:10.5,cursor:"pointer"}}>✓ Confirmar</button>
                    <button onClick={reject}  style={{padding:"4px 10px",background:"#fff",color:"#64748B",border:"1px solid #E2E8F0",borderRadius:6,fontFamily:"'Plus Jakarta Sans',sans-serif",fontSize:10.5,cursor:"pointer"}}>Descartar</button>
                  </div>}
                </div>
                <div style={{fontSize:8.5,color:"#CBD5E1",marginTop:2,padding:"0 2px",textAlign:m.role==="user"?"right":"left"}}>{hms(m.ts)}</div>
              </div>
            ))}
            {processing&&<div style={{display:"flex",alignItems:"center",gap:5,padding:"7px 11px",background:"#F8FAFC",border:"1px solid #E2E8F0",borderRadius:11,borderBottomLeftRadius:3,fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"#94A3B8",alignSelf:"flex-start"}}>
              {[0,.15,.3].map((d,i)=><span key={i} style={{display:"inline-block",width:4,height:4,borderRadius:"50%",background:"#3B82F6",animation:`bounce 1s ${d}s infinite`}}/>)}
              <span style={{marginLeft:3}}>Procesando...</span>
            </div>}
            <div ref={bottom}/>
          </div>
          <div style={{padding:"8px 10px",borderTop:"1px solid #F1F5F9",background:"#fff"}}>
            {micState!=="idle"&&<div style={{marginBottom:7,padding:"5px 9px",borderRadius:6,background:micState==="listening"?"#EFF6FF":"#FEF2F2",border:`1px solid ${micState==="listening"?"#BFDBFE":"#FECACA"}`,fontSize:10,color:micState==="listening"?"#1D4ED8":"#B91C1C",fontWeight:500,display:"flex",alignItems:"center",gap:5}}>
              {micState==="listening"&&<span style={{width:5,height:5,borderRadius:"50%",background:"#2563EB",display:"inline-block",animation:"pulse 1s infinite",flexShrink:0}}/>}
              <span>{micState==="listening"?`🎙${interim?` "${interim}"`:"..."}`:micState==="requesting"?"Solicitando...":"Error de micrófono"}</span>
            </div>}
            <div style={{display:"flex",gap:6,alignItems:"flex-end"}}>
              <button onClick={micState==="listening"?stopListen:startListen} disabled={micState==="requesting"}
                style={{width:36,height:36,borderRadius:8,flexShrink:0,border:`1.5px solid ${micC.border}`,background:micC.bg,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",animation:micC.anim,transition:"all .2s"}}>
                {micState==="listening"?<svg width="11" height="11" viewBox="0 0 24 24" fill={micC.icon} stroke="none"><rect x="4" y="4" width="16" height="16" rx="2"/></svg>:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={micC.icon} strokeWidth="2"><path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>}
              </button>
              <textarea style={{flex:1,background:"#F8FAFC",border:"1.5px solid #E2E8F0",borderRadius:8,padding:"8px 10px",fontFamily:"'Plus Jakarta Sans',sans-serif",fontSize:11.5,color:"#0F172A",resize:"none",minHeight:36,maxHeight:72,lineHeight:1.5}}
                placeholder='Probá: "¿Cómo está el pipeline?" o "Email para Diego Torres"'
                value={input} onChange={e=>setInput(e.target.value)} onKeyDown={handleKey} rows={1}/>
              <button onClick={send} disabled={processing||!input.trim()}
                style={{width:36,height:36,borderRadius:8,border:"none",flexShrink:0,background:processing||!input.trim()?"#E2E8F0":"linear-gradient(135deg,#2563EB,#7C3AED)",cursor:processing||!input.trim()?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              </button>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <main style={{flex:1,overflowY:"auto",padding:18,display:"flex",flexDirection:"column",gap:14}}>

          {/* ── OVERVIEW ── */}
          {activeModule==="overview"&&<>
            <div style={{fontWeight:700,fontSize:14,color:"#0F172A"}}>Resumen general</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:11}}>
              {[
                {label:"Pipeline activo",  value:fmt(pipeline),         sub:`${contacts.filter(c=>!["Cerrado ganado","Cerrado perdido"].includes(c.status)).length} contactos activos`, accent:"#2563EB"},
                {label:"Oportunidades",     value:fmt(oppValue),          sub:`${openOpps.length} abiertas · ${opportunities.filter(o=>o.status==="Cerrada"&&o.stage==="Ganada").length} ganadas`, accent:"#7C3AED"},
                {label:"Contratos activos", value:fmt(contracts.filter(c=>c.status==="Activo").reduce((s,c)=>s+c.value,0)), sub:`${expContracts} por vencer o vencido${expContracts!==1?"s":""}`, accent:"#10B981"},
                {label:"Tareas pendientes", value:String(pendTasks),      sub:`${tasks.filter(t=>t.priority==="Alta"&&t.status!=="Completada").length} de alta prioridad`, accent:pendTasks>4?"#EF4444":"#0F172A"},
              ].map((k,i)=><div key={i} style={{...card,padding:"14px 16px"}}><div style={{fontSize:10,color:"#94A3B8",fontWeight:700,textTransform:"uppercase",letterSpacing:".07em",marginBottom:6}}>{k.label}</div><div style={{fontSize:21,fontWeight:800,color:k.accent,letterSpacing:"-.5px"}}>{k.value}</div><div style={{fontSize:10.5,color:"#94A3B8",marginTop:2}}>{k.sub}</div></div>)}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:11}}>
              <div style={card}>
                <div style={{fontWeight:700,fontSize:12.5,color:"#0F172A",marginBottom:2}}>Pipeline por etapa</div>
                <div style={{fontSize:10.5,color:"#94A3B8",marginBottom:10}}>Contactos activos</div>
                <ResponsiveContainer width="100%" height={140}><BarChart data={chartData} margin={{top:4,right:4,left:-24,bottom:4}}><CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false}/><XAxis dataKey="name" tick={{fontSize:9,fill:"#94A3B8"}} axisLine={false} tickLine={false}/><YAxis tick={{fontSize:9,fill:"#CBD5E1"}} axisLine={false} tickLine={false}/><Tooltip content={<CustomTip/>}/><Bar dataKey="Valor" radius={[5,5,0,0]} maxBarSize={40}>{chartData.map((e,i)=><Cell key={i} fill={e.color}/>)}</Bar></BarChart></ResponsiveContainer>
              </div>
              <div style={card}>
                <div style={{fontWeight:700,fontSize:12.5,color:"#0F172A",marginBottom:2}}>Oportunidades por etapa</div>
                <div style={{fontSize:10.5,color:"#94A3B8",marginBottom:10}}>Valor en cada etapa</div>
                <ResponsiveContainer width="100%" height={140}><BarChart data={oppStageData} margin={{top:4,right:4,left:-24,bottom:4}}><CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false}/><XAxis dataKey="name" tick={{fontSize:9,fill:"#94A3B8"}} axisLine={false} tickLine={false}/><YAxis tick={{fontSize:9,fill:"#CBD5E1"}} axisLine={false} tickLine={false}/><Tooltip content={<CustomTip/>}/><Bar dataKey="Valor" radius={[5,5,0,0]} maxBarSize={40}>{oppStageData.map((e,i)=><Cell key={i} fill={e.color}/>)}</Bar></BarChart></ResponsiveContainer>
              </div>
            </div>
            {/* Alertas */}
            {(expContracts>0||tasks.filter(t=>t.priority==="Alta"&&t.status!=="Completada").length>0)&&<div style={card}>
              <div style={{fontWeight:700,fontSize:12.5,color:"#0F172A",marginBottom:12}}>⚠️ Alertas activas</div>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {contracts.filter(c=>c.status==="Vencido").map(c=><div key={c.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 10px",background:"#FEF2F2",borderRadius:8,border:"1px solid #FECACA"}}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  <div style={{flex:1,fontSize:11.5,color:"#B91C1C"}}><strong>{c.company}</strong> — Contrato vencido el {c.end_date}</div>
                  <button onClick={()=>setActiveModule("contracts")} style={{fontSize:10,color:"#EF4444",background:"none",border:"none",cursor:"pointer",fontFamily:"inherit",fontWeight:600}}>Ver →</button>
                </div>)}
                {tasks.filter(t=>t.priority==="Alta"&&t.status!=="Completada").map(t=><div key={t.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 10px",background:"#FFFBEB",borderRadius:8,border:"1px solid #FDE68A"}}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  <div style={{flex:1,fontSize:11.5,color:"#B45309"}}><strong>Tarea urgente</strong> — {t.title} · {t.assigned_to} · {t.due_date}</div>
                  <button onClick={()=>setActiveModule("tasks")} style={{fontSize:10,color:"#F59E0B",background:"none",border:"none",cursor:"pointer",fontFamily:"inherit",fontWeight:600}}>Ver →</button>
                </div>)}
              </div>
            </div>}
          </>}

          {/* ── PIPELINE ── */}
          {activeModule==="pipeline"&&<>
            <div style={{fontWeight:700,fontSize:14,color:"#0F172A"}}>Pipeline de contactos</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(230px,1fr))",gap:10}}>
              {contacts.map(c=>{
                const m=STATUS_META[c.status]||{color:"#94A3B8",bg:"#F8FAFC",text:"#64748B"};
                const fl=flashId===c.id;
                return<div key={c.id} style={{background:"#fff",borderRadius:12,padding:14,position:"relative",overflow:"hidden",border:`1px solid ${fl?"#3B82F6":"#E2E8F0"}`,boxShadow:fl?"0 0 0 3px rgba(59,130,246,.1)":"none",transition:"all .5s"}}>
                  <div style={{position:"absolute",top:0,left:0,right:0,height:2.5,background:m.color,opacity:.85}}/>
                  <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:11}}>
                    <div style={{width:34,height:34,borderRadius:8,background:m.bg,color:m.text,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:11,flexShrink:0}}>{c.init}</div>
                    <div style={{flex:1,minWidth:0}}><div style={{fontWeight:700,fontSize:12.5,color:"#0F172A",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.name}</div><div style={{fontSize:10,color:"#94A3B8",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.company}</div></div>
                    {badge(c.status,m)}
                  </div>
                  {[["Valor",fmt(c.value),c.value>0],["Próx. acción",c.nextAction,false],["Fecha",c.nextDate,false]].map(([l,v,acc])=><div key={l} style={{display:"flex",justifyContent:"space-between",padding:"4px 0",borderBottom:"1px solid #F8FAFC",fontSize:11}}><span style={{color:"#94A3B8",fontWeight:500}}>{l}</span><span style={{color:acc?"#2563EB":"#334155",fontWeight:600,maxWidth:"55%",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",textAlign:"right"}}>{v}</span></div>)}
                  {c.notes&&<div style={{marginTop:8,padding:"5px 8px",background:"#F8FAFC",borderRadius:6,fontSize:10,color:"#64748B",fontStyle:"italic",lineHeight:1.5}}>{c.notes}</div>}
                </div>;
              })}
            </div>
          </>}

          {/* ── OPORTUNIDADES ── */}
          {activeModule==="opps"&&<>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div style={{fontWeight:700,fontSize:14,color:"#0F172A"}}>Oportunidades</div>
              <div style={{display:"flex",gap:12,fontSize:11.5,color:"#94A3B8",fontWeight:500}}>
                <span>Abiertas: <strong style={{color:"#2563EB"}}>{openOpps.length}</strong></span>
                <span>Valor: <strong style={{color:"#7C3AED"}}>{fmt(oppValue)}</strong></span>
                <span>Ganadas: <strong style={{color:"#10B981"}}>{opportunities.filter(o=>o.stage==="Ganada").length}</strong></span>
              </div>
            </div>
            <div style={card}>
              <div style={{fontWeight:700,fontSize:12.5,color:"#0F172A",marginBottom:12}}>Funnel de ventas</div>
              <ResponsiveContainer width="100%" height={130}><BarChart data={oppStageData} margin={{top:4,right:4,left:-24,bottom:4}}><CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false}/><XAxis dataKey="name" tick={{fontSize:9,fill:"#94A3B8"}} axisLine={false} tickLine={false}/><YAxis tick={{fontSize:9,fill:"#CBD5E1"}} axisLine={false} tickLine={false}/><Tooltip content={<CustomTip/>}/><Bar dataKey="Valor" radius={[5,5,0,0]} maxBarSize={44}>{oppStageData.map((e,i)=><Cell key={i} fill={e.color}/>)}</Bar></BarChart></ResponsiveContainer>
            </div>
            <div style={{...card,padding:0,overflow:"hidden"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                <thead><tr style={{background:"#F8FAFC",borderBottom:"1px solid #E2E8F0"}}>
                  {["Oportunidad","Empresa","Etapa","Valor","Prob.","Cierre","Owner","Estado"].map(h=><th key={h} style={{padding:"10px 14px",textAlign:"left",fontSize:10.5,fontWeight:700,color:"#94A3B8",textTransform:"uppercase",letterSpacing:".06em",whiteSpace:"nowrap"}}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {opportunities.map(o=><tr key={o.id} style={{borderBottom:"1px solid #F8FAFC",cursor:"default"}}>
                    <td style={{padding:"10px 14px",fontWeight:600,color:"#0F172A",maxWidth:180,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{o.title}</td>
                    <td style={{padding:"10px 14px",color:"#64748B",fontSize:11.5}}>{o.company}</td>
                    <td style={{padding:"10px 14px"}}><span style={{padding:"2px 8px",borderRadius:5,background:OPP_COLORS[o.stage]+"20",color:OPP_COLORS[o.stage],fontSize:10,fontWeight:700}}>{o.stage}</span></td>
                    <td style={{padding:"10px 14px",fontWeight:700,color:"#2563EB"}}>{fmt(o.value)}</td>
                    <td style={{padding:"10px 14px"}}>
                      <div style={{display:"flex",alignItems:"center",gap:5}}>
                        <div style={{width:40,height:5,borderRadius:3,background:"#E2E8F0",overflow:"hidden"}}><div style={{width:`${o.probability}%`,height:"100%",background:o.probability>=70?"#10B981":o.probability>=40?"#F59E0B":"#EF4444"}}/></div>
                        <span style={{fontSize:10.5,color:"#94A3B8"}}>{o.probability}%</span>
                      </div>
                    </td>
                    <td style={{padding:"10px 14px",color:"#64748B",fontSize:11.5}}>{o.close_date}</td>
                    <td style={{padding:"10px 14px",color:"#64748B",fontSize:11.5}}>{o.owner}</td>
                    <td style={{padding:"10px 14px"}}><span style={{padding:"2px 8px",borderRadius:5,background:o.status==="Abierta"?"#EFF6FF":o.stage==="Ganada"?"#ECFDF5":"#FEF2F2",color:o.status==="Abierta"?"#2563EB":o.stage==="Ganada"?"#059669":"#DC2626",fontSize:10,fontWeight:700}}>{o.status==="Abierta"?"Abierta":o.stage}</span></td>
                  </tr>)}
                </tbody>
              </table>
            </div>
          </>}

          {/* ── CONTRATOS ── */}
          {activeModule==="contracts"&&<>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div style={{fontWeight:700,fontSize:14,color:"#0F172A"}}>Contratos</div>
              <div style={{display:"flex",gap:12,fontSize:11.5,color:"#94A3B8",fontWeight:500}}>
                <span>Activos: <strong style={{color:"#10B981"}}>{contracts.filter(c=>c.status==="Activo").length}</strong></span>
                <span>MRR: <strong style={{color:"#2563EB"}}>{fmt(Math.round(contracts.filter(c=>c.status==="Activo").reduce((s,c)=>s+c.value,0)/12))}</strong></span>
                <span style={{color:"#EF4444"}}>Vencidos/Por vencer: <strong>{expContracts}</strong></span>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(290px,1fr))",gap:11}}>
              {contracts.map(c=>{
                const m=CONTRACT_STATUS[c.status]||{color:"#94A3B8",bg:"#F8FAFC",text:"#64748B"};
                return<div key={c.id} style={{...card,position:"relative",overflow:"hidden",borderLeft:`3px solid ${m.color}`}}>
                  <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:10}}>
                    <div><div style={{fontWeight:700,fontSize:13,color:"#0F172A"}}>{c.company}</div><div style={{fontSize:10.5,color:"#94A3B8",marginTop:1}}>{c.product}</div></div>
                    {badge(c.status,m)}
                  </div>
                  <div style={{fontSize:20,fontWeight:800,color:"#2563EB",marginBottom:10}}>{fmt(c.value)}<span style={{fontSize:11,color:"#94A3B8",fontWeight:500}}>/año</span></div>
                  {[["Inicio",c.start_date],["Vencimiento",c.end_date],["Cliente",c.contact_name]].map(([l,v])=><div key={l} style={{display:"flex",justifyContent:"space-between",padding:"3px 0",fontSize:11}}><span style={{color:"#94A3B8"}}>{l}</span><span style={{color:"#334155",fontWeight:600}}>{v}</span></div>)}
                  {c.auto_renew&&<div style={{marginTop:8,fontSize:10,color:"#059669",fontWeight:600,display:"flex",alignItems:"center",gap:4}}><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>Renovación automática</div>}
                  {c.notes&&<div style={{marginTop:6,fontSize:10,color:"#64748B",fontStyle:"italic"}}>{c.notes}</div>}
                </div>;
              })}
            </div>
          </>}

          {/* ── EMAIL ── */}
          {activeModule==="email"&&<>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div style={{fontWeight:700,fontSize:14,color:"#0F172A"}}>Email / Borradores</div>
              <div style={{fontSize:11.5,color:"#94A3B8",fontWeight:500}}>Generados por ARIA · {emails.length} borradores</div>
            </div>
            <div style={{...card,padding:"12px 16px",background:"#EFF6FF",border:"1px solid #BFDBFE"}}>
              <div style={{fontSize:11.5,color:"#1D4ED8",fontWeight:500}}>
                💡 Podés pedirle a ARIA que genere un email de seguimiento, propuesta o confirmación de reunión. Ejemplo: <em>"Generá el email de seguimiento para Diego Torres de MegaFarma."</em>
              </div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {emails.map(e=><div key={e.id} style={{...card,cursor:"pointer",transition:"box-shadow .15s"}} onClick={()=>setDraftModal(e)} onMouseEnter={ev=>ev.currentTarget.style.boxShadow="0 4px 16px rgba(0,0,0,.07)"} onMouseLeave={ev=>ev.currentTarget.style.boxShadow="none"}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
                  <div style={{width:34,height:34,borderRadius:8,background:"#EFF6FF",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontWeight:700,fontSize:12.5,color:"#0F172A",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.subject}</div>
                    <div style={{fontSize:10.5,color:"#94A3B8"}}>{e.contact_name} · {e.company}</div>
                  </div>
                  <span style={{padding:"2px 8px",borderRadius:5,background:e.sent?"#ECFDF5":"#EFF6FF",color:e.sent?"#059669":"#2563EB",fontSize:10,fontWeight:700,flexShrink:0}}>{e.sent?"Enviado":"Borrador"}</span>
                  <div style={{fontSize:9.5,color:"#CBD5E1",flexShrink:0}}>{relTime(e.created_at)}</div>
                </div>
                <div style={{fontSize:11,color:"#94A3B8",lineHeight:1.5,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>{e.body.slice(0,120)}...</div>
              </div>)}
            </div>
          </>}

          {/* ── TAREAS ── */}
          {activeModule==="tasks"&&<>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div style={{fontWeight:700,fontSize:14,color:"#0F172A"}}>Tareas</div>
              <div style={{display:"flex",gap:12,fontSize:11.5,color:"#94A3B8",fontWeight:500}}>
                <span>Pendientes: <strong style={{color:"#F59E0B"}}>{tasks.filter(t=>t.status==="Pendiente").length}</strong></span>
                <span>En progreso: <strong style={{color:"#3B82F6"}}>{tasks.filter(t=>t.status==="En progreso").length}</strong></span>
                <span>Completadas: <strong style={{color:"#10B981"}}>{tasks.filter(t=>t.status==="Completada").length}</strong></span>
              </div>
            </div>
            {["Alta","Media","Baja"].map(prio=>{
              const ts=tasks.filter(t=>t.priority===prio);if(!ts.length)return null;
              const pm=PRIORITY_META[prio];
              return<div key={prio}>
                <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:8}}>
                  <span style={{width:8,height:8,borderRadius:"50%",background:pm.color,flexShrink:0,display:"inline-block"}}/>
                  <span style={{fontSize:11,fontWeight:700,color:pm.text,textTransform:"uppercase",letterSpacing:".07em"}}>Prioridad {prio}</span>
                  <span style={{fontSize:10,color:"#94A3B8"}}>({ts.length})</span>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:7,marginBottom:16}}>
                  {ts.map(t=>{
                    const sm=STATUS_TASK[t.status]||{};
                    return<div key={t.id} style={{...card,padding:"12px 14px",display:"flex",alignItems:"center",gap:12,borderLeft:`3px solid ${pm.color}`}}>
                      <button onClick={async()=>{const ns=t.status==="Pendiente"?"En progreso":t.status==="En progreso"?"Completada":"Pendiente";await supabase.from("tasks").update({status:ns}).eq("id",t.id);setTasks(prev=>prev.map(tk=>tk.id===t.id?{...tk,status:ns}:tk));}}
                        style={{width:18,height:18,borderRadius:"50%",border:`2px solid ${pm.color}`,background:t.status==="Completada"?pm.color:"transparent",cursor:"pointer",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                        {t.status==="Completada"&&<svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                      </button>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontWeight:600,fontSize:12.5,color:t.status==="Completada"?"#94A3B8":"#0F172A",textDecoration:t.status==="Completada"?"line-through":"none",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.title}</div>
                        <div style={{fontSize:10.5,color:"#94A3B8",marginTop:1}}>{t.contact_name?`${t.contact_name} · `:""}{t.type}</div>
                      </div>
                      <div style={{display:"flex",alignItems:"center",gap:7,flexShrink:0}}>
                        {t.due_date&&<span style={{fontSize:10,color:"#94A3B8"}}>{t.due_date}</span>}
                        <span style={{padding:"2px 7px",borderRadius:5,background:sm.bg,color:sm.text,fontSize:9.5,fontWeight:700}}>{t.status}</span>
                        <span style={{fontSize:11,color:"#64748B",fontWeight:500}}>{t.assigned_to}</span>
                      </div>
                    </div>;
                  })}
                </div>
              </div>;
            })}
          </>}

          {/* ── HISTORIAL ── */}
          {activeModule==="activity"&&<>
            <div style={{fontWeight:700,fontSize:14,color:"#0F172A"}}>Historial de cambios</div>
            {activity.length===0&&<div style={{...card,textAlign:"center",padding:"32px",color:"#94A3B8",fontSize:12}}>No hay cambios registrados todavía.</div>}
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {activity.map(a=>{
                const meta=STATUS_META[a.changes?.status]||null;
                return<div key={a.id} style={{...card,padding:"12px 16px",display:"flex",gap:11,alignItems:"flex-start"}}>
                  <div style={{width:30,height:30,borderRadius:7,background:"#EFF6FF",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:3,flexWrap:"wrap"}}>
                      <span style={{fontWeight:700,fontSize:12,color:"#0F172A"}}>{a.contact_name}</span>
                      {meta&&<span style={{padding:"1px 7px",borderRadius:4,background:meta.bg,color:meta.text,fontSize:9,fontWeight:700}}>{a.changes.status}</span>}
                      {a.changes?.value!=null&&<span style={{fontSize:10,color:"#2563EB",fontWeight:600}}>{fmt(a.changes.value)}</span>}
                    </div>
                    <div style={{fontSize:11,color:"#64748B"}}>{a.summary}</div>
                  </div>
                  <div style={{fontSize:9.5,color:"#CBD5E1",whiteSpace:"nowrap",flexShrink:0}}>{relTime(a.created_at)}</div>
                </div>;
              })}
            </div>
          </>}

        </main>
      </div>

      {/* Email modal */}
      {draftModal&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.45)",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={()=>setDraftModal(null)}>
        <div style={{background:"#fff",borderRadius:16,padding:28,maxWidth:600,width:"100%",maxHeight:"80vh",overflowY:"auto",boxShadow:"0 24px 64px rgba(0,0,0,.2)"}} onClick={e=>e.stopPropagation()}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
            <div>
              <div style={{fontWeight:700,fontSize:14,color:"#0F172A",marginBottom:2}}>{draftModal.subject}</div>
              <div style={{fontSize:11.5,color:"#94A3B8"}}>Para: {draftModal.contact_name} · {draftModal.company}</div>
            </div>
            <button onClick={()=>setDraftModal(null)} style={{background:"none",border:"none",cursor:"pointer",color:"#94A3B8",fontSize:18,lineHeight:1}}>×</button>
          </div>
          <div style={{background:"#F8FAFC",borderRadius:10,padding:"16px 18px",fontSize:12.5,color:"#334155",lineHeight:1.8,whiteSpace:"pre-wrap",fontFamily:"'JetBrains Mono',monospace",marginBottom:16}}>{draftModal.body}</div>
          <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
            <button onClick={async()=>{await supabase.from("email_drafts").update({sent:true}).eq("id",draftModal.id);setEmails(prev=>prev.map(e=>e.id===draftModal.id?{...e,sent:true}:e));setDraftModal(null);}} style={{padding:"8px 18px",background:"linear-gradient(135deg,#2563EB,#7C3AED)",color:"#fff",border:"none",borderRadius:8,fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:700,fontSize:12,cursor:"pointer"}}>✓ Marcar como enviado</button>
            <button onClick={()=>setDraftModal(null)} style={{padding:"8px 14px",background:"#fff",color:"#64748B",border:"1px solid #E2E8F0",borderRadius:8,fontFamily:"'Plus Jakarta Sans',sans-serif",fontSize:12,cursor:"pointer"}}>Cerrar</button>
          </div>
        </div>
      </div>}
    </div>
  );
}
