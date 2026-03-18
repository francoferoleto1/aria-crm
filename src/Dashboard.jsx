import { useState, useRef, useEffect, useCallback } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie, Legend
} from "recharts";
import { supabase } from "./supabase.js";

const GROQ_KEY   = "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";
const GROQ_MODEL = "llama-3.3-70b-versatile";

const STATUS_META = {
  "Nuevo contacto":    { color:"#6366F1", bg:"#EEF2FF", text:"#4338CA" },
  "Prospecto":         { color:"#3B82F6", bg:"#EFF6FF", text:"#1D4ED8" },
  "Propuesta enviada": { color:"#F59E0B", bg:"#FFFBEB", text:"#B45309" },
  "En negociación":    { color:"#F97316", bg:"#FFF7ED", text:"#C2410C" },
  "Cerrado ganado":    { color:"#10B981", bg:"#ECFDF5", text:"#047857" },
  "Cerrado perdido":   { color:"#EF4444", bg:"#FEF2F2", text:"#B91C1C" },
};
const STAGE_ORDER = ["Nuevo contacto","Prospecto","Propuesta enviada","En negociación","Cerrado ganado","Cerrado perdido"];

const DEFAULT_CONTACTS = [
  {name:"Carlos Mendoza",  initials:"CM", company:"Acme Logistics",     status:"Prospecto",         value:45000,  next_action:"Enviar propuesta",       next_date:"20 Mar", notes:"Interesado en plan enterprise"},
  {name:"Laura Fernández", initials:"LF", company:"TechSur SA",         status:"En negociación",    value:120000, next_action:"Llamada de seguimiento", next_date:"18 Mar", notes:"Revisando contrato con legal"},
  {name:"Roberto Paz",     initials:"RP", company:"Constructora Norte", status:"Nuevo contacto",    value:0,      next_action:"Primera llamada",        next_date:"19 Mar", notes:"Referido por Carlos Mendoza"},
  {name:"Sofía Reyes",     initials:"SR", company:"Distribuidora Sur",  status:"Propuesta enviada", value:78000,  next_action:"Esperar respuesta",      next_date:"22 Mar", notes:"Presupuesto aprobado"},
  {name:"Diego Torres",    initials:"DT", company:"MegaFarma SA",       status:"En negociación",    value:95000,  next_action:"Demo técnica",           next_date:"21 Mar", notes:"Quiere ver integración SAP"},
  {name:"Ana Quiroga",     initials:"AQ", company:"Grupo Pampa",        status:"Cerrado ganado",    value:210000, next_action:"Onboarding",             next_date:"25 Mar", notes:"Firmó el contrato anual"},
];

const SYS = (cs) => `Sos ARIA, asistente de CRM para ventas en Argentina. Analizá el mensaje y extraé datos para actualizar el CRM.

Contactos actuales:
${cs.map(c=>`ID ${c.id}: ${c.name} (${c.company}) — estado: "${c.status}", valor: $${c.value.toLocaleString("es-AR")}`).join("\n")}

Respondé ÚNICAMENTE con JSON válido, sin markdown, sin texto extra:
{"contactId":<número o null>,"contactName":"<nombre detectado>","updates":{"status":"<nuevo estado o null>","value":<número sin símbolos o null>,"nextAction":"<próxima acción o null>","nextDate":"<DD Mmm o null>","notes":"<nota breve o null>"},"summary":"<una línea explicando qué cambió>"}

Estados válidos: "Nuevo contacto","Prospecto","Propuesta enviada","En negociación","Cerrado ganado","Cerrado perdido".`;

async function callGroq(msg, cs) {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method:"POST",
    headers:{"Content-Type":"application/json","Authorization":`Bearer ${GROQ_KEY}`},
    body:JSON.stringify({model:GROQ_MODEL,max_tokens:400,temperature:0.1,
      messages:[{role:"system",content:SYS(cs)},{role:"user",content:msg}]})
  });
  if (!res.ok) throw new Error(`Groq ${res.status}`);
  const data = await res.json();
  return JSON.parse(data.choices[0].message.content.trim().replace(/```json|```/g,"").trim());
}

const fmt     = n  => n ? `$${n.toLocaleString("es-AR")}` : "—";
const hms     = d  => d.toLocaleTimeString("es-AR",{hour:"2-digit",minute:"2-digit"});
const relTime = iso => {
  const m=Math.floor((Date.now()-new Date(iso).getTime())/60000);
  if(m<1)return"ahora";if(m<60)return`hace ${m} min`;
  const h=Math.floor(m/60);if(h<24)return`hace ${h}h`;
  return`hace ${Math.floor(h/24)}d`;
};
const dbToContact = r => ({
  id:r.id, name:r.name, init:r.initials, company:r.company,
  status:r.status, value:r.value, nextAction:r.next_action,
  nextDate:r.next_date, notes:r.notes,
});

// ── Export helpers ────────────────────────────────────────────────────────────
function downloadCSV(filename, rows, headers) {
  const escape = v => `"${String(v??'').replace(/"/g,'""')}"`;
  const csv = [headers.join(','), ...rows.map(r=>r.map(escape).join(','))].join('\n');
  const blob = new Blob(['\uFEFF'+csv], {type:'text/csv;charset=utf-8'});
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a'); a.href=url; a.download=filename; a.click();
  URL.revokeObjectURL(url);
}

async function exportDashboardPNG(ref) {
  try {
    const h2c = (await import('html2canvas')).default;
    const canvas = await h2c(ref, {scale:2, backgroundColor:'#F0F4FF', useCORS:true});
    const a = document.createElement('a');
    a.download = `aria-dashboard-${new Date().toISOString().slice(0,10)}.png`;
    a.href = canvas.toDataURL('image/png');
    a.click();
  } catch(e) { alert('Error al exportar imagen: '+e.message); }
}

const CustomTip = ({active,payload}) => {
  if(!active||!payload?.length) return null;
  const p=payload[0];
  return (
    <div style={{background:"#fff",border:"1px solid #E2E8F0",borderRadius:8,padding:"8px 12px",fontSize:12,boxShadow:"0 4px 12px rgba(0,0,0,.1)"}}>
      <div style={{fontWeight:700,color:"#0F172A",marginBottom:2}}>{p.payload.fullName}</div>
      <div style={{color:p.payload.color,fontWeight:600}}>{fmt(p.value)}</div>
    </div>
  );
};

function useVoice({onTranscript,onError}) {
  const [state,setState]     = useState("idle");
  const [interim,setInterim] = useState("");
  const recognRef            = useRef(null);
  const finalRef             = useRef("");
  const stateRef             = useRef("idle");
  const setS = s=>{stateRef.current=s;setState(s);};
  const isSupported=!!(window.SpeechRecognition||window.webkitSpeechRecognition);
  const start=useCallback(async()=>{
    if(!isSupported){onError("Usá Chrome o Edge para voz.");return;}
    setS("requesting");
    try{await navigator.mediaDevices.getUserMedia({audio:true});}
    catch{setS("error");onError("Permiso denegado. Habilitá el micrófono.");setTimeout(()=>setS("idle"),4000);return;}
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    const r=new SR(); r.lang="es-AR"; r.continuous=true; r.interimResults=true;
    finalRef.current="";
    r.onstart=()=>setS("listening");
    r.onresult=e=>{
      let iText="",fText=finalRef.current;
      for(let i=e.resultIndex;i<e.results.length;i++){
        const t=e.results[i][0].transcript;
        e.results[i].isFinal?(fText+=t+" "):(iText+=t);
      }
      finalRef.current=fText;setInterim(iText);onTranscript(fText+iText);
    };
    r.onerror=e=>{setS("error");const msgs={"not-allowed":"Permiso denegado.","no-speech":"No se detectó voz.","network":"Error de red.","audio-capture":"Sin micrófono."};onError(msgs[e.error]||`Error: ${e.error}`);setTimeout(()=>setS("idle"),3500);};
    r.onend=()=>{if(stateRef.current==="listening"){try{r.start();return;}catch(_){}}setInterim("");setS("idle");};
    recognRef.current=r;
    try{r.start();}catch(e){setS("error");onError(`Error: ${e.message}`);setTimeout(()=>setS("idle"),3000);}
  },[isSupported,onTranscript,onError]);
  const stop=useCallback(()=>{setS("idle");recognRef.current?.stop();recognRef.current=null;setInterim("");},[]);
  return{state,interim,start,stop,isSupported};
}

export default function Dashboard({user,onLogout}) {
  const [contacts,setContacts]     = useState([]);
  const [activity,setActivity]     = useState([]);
  const [loading,setLoading]       = useState(true);
  const [dbError,setDbError]       = useState(null);
  const [input,setInput]           = useState("");
  const [processing,setProcessing] = useState(false);
  const [pending,setPending]       = useState(null);
  const [flashId,setFlashId]       = useState(null);
  const [activeTab,setActiveTab]   = useState("crm");
  const [resetting,setResetting]   = useState(false);
  const [exporting,setExporting]   = useState(false);
  const [showExportMenu,setShowExportMenu] = useState(false);
  const [messages,setMessages]     = useState([{id:0,role:"agent",ts:new Date(),
    text:`Hola ${user.email.split("@")[0]} 👋 Soy ARIA.\n\nHablá o escribí una actualización de cualquier cliente y la registro en el CRM al instante.`}]);

  const mid        = useRef(1);
  const bottom     = useRef(null);
  const dashRef    = useRef(null);
  const exportRef  = useRef(null);

  useEffect(()=>{loadData();},[]);
  useEffect(()=>{bottom.current?.scrollIntoView({behavior:"smooth"});},[messages,processing]);

  // Close export menu on outside click
  useEffect(()=>{
    const handler = e => { if(exportRef.current&&!exportRef.current.contains(e.target)) setShowExportMenu(false); };
    document.addEventListener("mousedown",handler);
    return ()=>document.removeEventListener("mousedown",handler);
  },[]);

  const loadData = async()=>{
    setLoading(true);
    try {
      const [{data:ct,error:ce},{data:ac,error:ae}]=await Promise.all([
        supabase.from("contacts").select("*").order("id"),
        supabase.from("activity_log").select("*").order("created_at",{ascending:false}).limit(50),
      ]);
      if(ce)throw ce; if(ae)throw ae;
      setContacts((ct||[]).map(dbToContact)); setActivity(ac||[]);
    } catch(e){setDbError(e.message);}
    finally{setLoading(false);}
  };

  const addMsg=(role,text,extra={})=>{
    const id=mid.current++;
    setMessages(p=>[...p,{id,role,text,ts:new Date(),...extra}]); return id;
  };

  const handleTranscript=useCallback(t=>setInput(t),[]);
  const handleVoiceError =useCallback(msg=>addMsg("agent",`⚠️ ${msg}`),[]);
  const{state:micState,interim,start:startListen,stop:stopListen,isSupported}=useVoice({
    onTranscript:handleTranscript,onError:handleVoiceError,
  });

  const send=async()=>{
    const t=input.trim(); if(!t||processing)return;
    if(micState==="listening")stopListen();
    setInput(""); addMsg("user",t); setProcessing(true);
    try{
      const p=await callGroq(t,contacts);
      const id=mid.current++;
      setMessages(prev=>[...prev,{id,role:"agent",ts:new Date(),
        text:`Encontré una actualización para **${p.contactName}**:\n${p.summary}\n\n¿Confirmo los cambios en el CRM?`,
        updateData:p}]);
      setPending({...p,msgId:id});
    }catch(e){addMsg("agent",`Error: ${e.message}`);}
    finally{setProcessing(false);}
  };

  const confirm=async()=>{
    if(!pending)return;
    const{contactId,contactName,updates,summary}=pending;
    if(contactId){
      const dbUp={};
      if(updates.status!=null)     dbUp.status=updates.status;
      if(updates.value!=null)      dbUp.value=updates.value;
      if(updates.nextAction!=null) dbUp.next_action=updates.nextAction;
      if(updates.nextDate!=null)   dbUp.next_date=updates.nextDate;
      if(updates.notes!=null)      dbUp.notes=updates.notes;
      const{error:ue}=await supabase.from("contacts").update(dbUp).eq("id",contactId);
      if(ue){addMsg("agent",`Error al guardar: ${ue.message}`);setPending(null);return;}
      const{data:ld}=await supabase.from("activity_log").insert({
        contact_id:contactId,contact_name:contactName,summary,changes:dbUp,
      }).select().single();
      setContacts(prev=>prev.map(c=>{
        if(c.id!==contactId)return c;
        return{...c,...(updates.status!=null&&{status:updates.status}),...(updates.value!=null&&{value:updates.value}),...(updates.nextAction!=null&&{nextAction:updates.nextAction}),...(updates.nextDate!=null&&{nextDate:updates.nextDate}),...(updates.notes!=null&&{notes:updates.notes})};
      }));
      if(ld)setActivity(prev=>[ld,...prev]);
      setFlashId(contactId); setTimeout(()=>setFlashId(null),3000);
    }
    addMsg("agent",`✓ Guardado. Los datos de ${contactName} están sincronizados.`);
    setPending(null);
  };

  const reject=()=>{addMsg("agent","Cambios descartados.");setPending(null);};
  const handleKey=e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}};

  // ── RESET DEMO DATA ─────────────────────────────────────────────────────────
  const resetDemo=async()=>{
    if(!window.confirm("¿Restablecer todos los datos de la demo al estado inicial? Esto borrará los cambios actuales."))return;
    setResetting(true);
    try{
      await supabase.from("activity_log").delete().neq("id",0);
      await supabase.from("contacts").delete().neq("id",0);
      const{error}=await supabase.from("contacts").insert(DEFAULT_CONTACTS);
      if(error)throw error;
      await loadData();
      setMessages([{id:0,role:"agent",ts:new Date(),
        text:`Hola ${user.email.split("@")[0]} 👋 Soy ARIA.\n\nDatos restablecidos al estado inicial. Listo para una nueva demo.`}]);
      setPending(null);
    }catch(e){alert("Error al resetear: "+e.message);}
    finally{setResetting(false);}
  };

  // ── EXPORTS ─────────────────────────────────────────────────────────────────
  const exportContacts=()=>{
    downloadCSV(
      `aria-contactos-${new Date().toISOString().slice(0,10)}.csv`,
      contacts.map(c=>[c.name,c.company,c.status,c.value,c.nextAction,c.nextDate,c.notes||""]),
      ["Nombre","Empresa","Estado","Valor","Próxima acción","Fecha","Notas"]
    );
    setShowExportMenu(false);
  };

  const exportActivity=()=>{
    downloadCSV(
      `aria-historial-${new Date().toISOString().slice(0,10)}.csv`,
      activity.map(a=>[
        new Date(a.created_at).toLocaleString("es-AR"),
        a.contact_name,
        a.summary,
        a.changes?.status||"",
        a.changes?.value!=null?fmt(a.changes.value):"",
      ]),
      ["Fecha","Contacto","Resumen","Nuevo estado","Valor"]
    );
    setShowExportMenu(false);
  };

  const exportPNG=async()=>{
    setShowExportMenu(false);
    setExporting(true);
    await exportDashboardPNG(dashRef.current);
    setExporting(false);
  };

  // Derived
  const pipeline  = contacts.reduce((s,c)=>s+c.value,0);
  const won       = contacts.filter(c=>c.status==="Cerrado ganado");
  const active    = contacts.filter(c=>!["Cerrado ganado","Cerrado perdido"].includes(c.status));
  const chartData = STAGE_ORDER.map(s=>({
    name:s.replace("Propuesta enviada","Prop. enviada").replace("Nuevo contacto","Nuevo"),
    fullName:s,color:STATUS_META[s]?.color||"#94A3B8",
    Valor:contacts.filter(c=>c.status===s).reduce((a,c)=>a+c.value,0),
  })).filter(d=>d.Valor>0);
  const pieData=STAGE_ORDER.map(s=>({
    name:s,value:contacts.filter(c=>c.status===s).length,color:STATUS_META[s]?.color||"#94A3B8"
  })).filter(d=>d.value>0);

  const micC={
    idle:      {border:"#E2E8F0",bg:"#F8FAFC",icon:"#94A3B8",anim:"none"},
    requesting:{border:"#FCD34D",bg:"#FFFBEB",icon:"#D97706",anim:"none"},
    listening: {border:"#2563EB",bg:"#EFF6FF",icon:"#2563EB",anim:"pulse 1.2s infinite"},
    error:     {border:"#FECACA",bg:"#FEF2F2",icon:"#EF4444",anim:"none"},
  }[micState]||{border:"#E2E8F0",bg:"#F8FAFC",icon:"#94A3B8",anim:"none"};

  const cardS={background:"#fff",border:"1px solid #E2E8F0",borderRadius:13,padding:"16px 18px"};
  const tabBtn=id=>({padding:"5px 14px",borderRadius:7,border:"none",cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif",fontSize:12,fontWeight:600,transition:"all .15s",background:activeTab===id?"#2563EB":"transparent",color:activeTab===id?"#fff":"#94A3B8"});
  const isAdmin=user.email.includes("admin");

  if(loading)return(
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",background:"#F0F4FF",fontFamily:"'Plus Jakarta Sans',sans-serif",flexDirection:"column",gap:12}}>
      <div style={{width:36,height:36,borderRadius:9,background:"linear-gradient(135deg,#2563EB,#7C3AED)",display:"flex",alignItems:"center",justifyContent:"center"}}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
      </div>
      <div style={{fontSize:13,color:"#94A3B8",fontWeight:500}}>Cargando datos...</div>
    </div>
  );

  if(dbError)return(
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",background:"#F0F4FF",fontFamily:"'Plus Jakarta Sans',sans-serif",flexDirection:"column",gap:10,padding:20}}>
      <div style={{fontSize:13,color:"#EF4444",fontWeight:600}}>Error al conectar con Supabase</div>
      <div style={{fontSize:11,color:"#94A3B8",maxWidth:360,textAlign:"center"}}>{dbError}</div>
      <button onClick={loadData} style={{padding:"7px 18px",background:"#2563EB",color:"#fff",border:"none",borderRadius:8,fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:600,fontSize:12,cursor:"pointer"}}>Reintentar</button>
    </div>
  );

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
        @media(max-width:900px){
          .aside-panel{display:none!important}
          .kpi-row{grid-template-columns:1fr 1fr!important}
          .charts-row{grid-template-columns:1fr!important}
          .cards-grid{grid-template-columns:1fr 1fr!important}
        }
        @media(max-width:600px){
          .kpi-row{grid-template-columns:1fr 1fr!important}
          .cards-grid{grid-template-columns:1fr!important}
          .main-pad{padding:12px!important}
          .nav-right-full{gap:6px!important}
          .nav-role{display:none!important}
          .nav-db{display:none!important}
        }
      `}</style>

      {/* NAV */}
      <nav style={{height:54,background:"#fff",borderBottom:"1px solid #E2E8F0",display:"flex",alignItems:"center",padding:"0 16px",gap:8,flexShrink:0,boxShadow:"0 1px 3px rgba(0,0,0,.04)"}}>
        <div style={{width:30,height:30,borderRadius:8,background:"linear-gradient(135deg,#2563EB,#7C3AED)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
        </div>
        <div>
          <div style={{fontWeight:800,fontSize:15,color:"#0F172A",letterSpacing:"-.3px",lineHeight:1.1}}>ARIA</div>
          <div style={{fontSize:9.5,color:"#94A3B8",fontWeight:500}}>Revenue Intelligence</div>
        </div>
        <div style={{flex:1}}/>
        <div className="nav-right-full" style={{display:"flex",alignItems:"center",gap:8}}>
          <div className="nav-db" style={{display:"flex",alignItems:"center",gap:5,background:"#F0FDF4",border:"1px solid #BBF7D0",padding:"3px 9px",borderRadius:20,fontSize:10,color:"#059669",fontWeight:600}}>
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5"/><path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3"/></svg>
            Supabase
          </div>
          <div className="nav-role" style={{display:"flex",alignItems:"center",gap:6,background:"#F8FAFC",border:"1px solid #E2E8F0",borderRadius:20,padding:"3px 10px 3px 5px"}}>
            <div style={{width:22,height:22,borderRadius:"50%",background:isAdmin?"linear-gradient(135deg,#2563EB,#7C3AED)":"linear-gradient(135deg,#10B981,#059669)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:"#fff"}}>{user.email[0].toUpperCase()}</div>
            <span style={{fontSize:11,color:"#334155",fontWeight:600}}>{isAdmin?"Admin":"Vendedor"}</span>
            {isAdmin&&<span style={{fontSize:9,background:"#EEF2FF",color:"#4338CA",padding:"1px 5px",borderRadius:4,fontWeight:700}}>ADMIN</span>}
          </div>

          {/* Admin tools */}
          {isAdmin&&(
            <>
              {/* Export dropdown */}
              <div ref={exportRef} style={{position:"relative"}}>
                <button onClick={()=>setShowExportMenu(p=>!p)}
                  style={{padding:"5px 11px",background:showExportMenu?"#EFF6FF":"transparent",border:`1px solid ${showExportMenu?"#93C5FD":"#E2E8F0"}`,borderRadius:8,fontFamily:"'Plus Jakarta Sans',sans-serif",fontSize:11,color:"#2563EB",cursor:"pointer",fontWeight:600,display:"flex",alignItems:"center",gap:5,transition:"all .15s"}}>
                  {exporting
                    ?<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{animation:"spin 1s linear infinite"}}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                    :<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  }
                  Exportar
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
                </button>
                {showExportMenu&&(
                  <div style={{position:"absolute",top:"calc(100% + 6px)",right:0,background:"#fff",border:"1px solid #E2E8F0",borderRadius:10,boxShadow:"0 8px 24px rgba(0,0,0,.1)",padding:"6px",minWidth:190,zIndex:50}}>
                    {[
                      {label:"Contactos (CSV)",  icon:"📋", action:exportContacts},
                      {label:"Historial (CSV)",  icon:"📊", action:exportActivity},
                      {label:"Dashboard (PNG)",  icon:"🖼️", action:exportPNG},
                    ].map(({label,icon,action})=>(
                      <button key={label} onClick={action}
                        style={{width:"100%",padding:"8px 12px",background:"transparent",border:"none",borderRadius:7,fontFamily:"'Plus Jakarta Sans',sans-serif",fontSize:12,color:"#334155",cursor:"pointer",display:"flex",alignItems:"center",gap:9,fontWeight:500,textAlign:"left",transition:"background .15s"}}
                        onMouseEnter={e=>e.currentTarget.style.background="#F8FAFC"}
                        onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                        <span style={{fontSize:14}}>{icon}</span>{label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {/* Reset */}
              <button onClick={resetDemo} disabled={resetting}
                style={{padding:"5px 11px",background:"transparent",border:"1px solid #FECACA",borderRadius:8,fontFamily:"'Plus Jakarta Sans',sans-serif",fontSize:11,color:"#EF4444",cursor:resetting?"wait":"pointer",fontWeight:600,display:"flex",alignItems:"center",gap:5,transition:"all .15s"}}
                onMouseEnter={e=>e.currentTarget.style.background="#FEF2F2"}
                onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                {resetting
                  ?<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{animation:"spin 1s linear infinite"}}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                  :<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                }
                Reset demo
              </button>
            </>
          )}

          <div style={{display:"flex",alignItems:"center",gap:5,background:"#F0FDF4",border:"1px solid #BBF7D0",padding:"3px 9px",borderRadius:20,fontSize:10.5,color:"#059669",fontWeight:600}}>
            <div style={{width:5,height:5,borderRadius:"50%",background:"#10B981",animation:"livePulse 2s infinite"}}/>
            Activo
          </div>

          <button onClick={onLogout}
            style={{padding:"5px 11px",background:"transparent",border:"1px solid #E2E8F0",borderRadius:8,fontFamily:"'Plus Jakarta Sans',sans-serif",fontSize:11,color:"#94A3B8",cursor:"pointer",fontWeight:500,transition:"all .15s"}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor="#FECACA";e.currentTarget.style.color="#EF4444";}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor="#E2E8F0";e.currentTarget.style.color="#94A3B8";}}>
            Salir
          </button>
        </div>
      </nav>

      <div style={{display:"flex",flex:1,overflow:"hidden"}}>
        {/* AGENT */}
        <aside className="aside-panel" style={{width:360,flexShrink:0,display:"flex",flexDirection:"column",background:"#fff",borderRight:"1px solid #E2E8F0"}}>
          <div style={{padding:"12px 16px",borderBottom:"1px solid #F1F5F9",display:"flex",alignItems:"center",gap:8}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2m-3.5-7.5-1.5 1.5m-10 10-1.5 1.5m0-13 1.5 1.5m10 10 1.5 1.5"/></svg>
            <div>
              <div style={{fontWeight:700,fontSize:12.5,color:"#0F172A"}}>Agente Comercial</div>
              <div style={{fontSize:9.5,color:"#94A3B8"}}>Groq · Llama 3.3 70B</div>
            </div>
          </div>
          <div style={{flex:1,overflowY:"auto",padding:12,display:"flex",flexDirection:"column",gap:10}}>
            {messages.map(m=>(
              <div key={m.id} style={{display:"flex",flexDirection:"column",alignSelf:m.role==="user"?"flex-end":"flex-start",maxWidth:"90%",animation:"fadeUp .2s ease"}}>
                <div style={{padding:"9px 12px",borderRadius:12,fontFamily:"'JetBrains Mono',monospace",fontSize:11,lineHeight:1.7,whiteSpace:"pre-wrap",
                  ...(m.role==="user"?{background:"linear-gradient(135deg,#2563EB,#7C3AED)",color:"#fff",borderBottomRightRadius:3}:{background:"#F8FAFC",border:"1px solid #E2E8F0",color:"#334155",borderBottomLeftRadius:3})}}>
                  {m.text}
                  {m.updateData&&pending&&(
                    <div style={{display:"flex",gap:7,marginTop:9}}>
                      <button onClick={confirm} style={{padding:"5px 13px",background:"linear-gradient(135deg,#2563EB,#7C3AED)",color:"#fff",border:"none",borderRadius:7,fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:700,fontSize:11,cursor:"pointer"}}>✓ Confirmar</button>
                      <button onClick={reject}  style={{padding:"5px 11px",background:"#fff",color:"#64748B",border:"1px solid #E2E8F0",borderRadius:7,fontFamily:"'Plus Jakarta Sans',sans-serif",fontSize:11,cursor:"pointer"}}>Descartar</button>
                    </div>
                  )}
                </div>
                <div style={{fontSize:9,color:"#CBD5E1",marginTop:2,padding:"0 2px",textAlign:m.role==="user"?"right":"left"}}>{hms(m.ts)}</div>
              </div>
            ))}
            {processing&&(
              <div style={{display:"flex",alignItems:"center",gap:6,padding:"8px 12px",background:"#F8FAFC",border:"1px solid #E2E8F0",borderRadius:12,borderBottomLeftRadius:3,fontFamily:"'JetBrains Mono',monospace",fontSize:10.5,color:"#94A3B8",alignSelf:"flex-start"}}>
                {[0,.15,.3].map((d,i)=><span key={i} style={{display:"inline-block",width:4,height:4,borderRadius:"50%",background:"#3B82F6",animation:`bounce 1s ${d}s infinite`}}/>)}
                <span style={{marginLeft:4}}>Analizando...</span>
              </div>
            )}
            <div ref={bottom}/>
          </div>
          <div style={{padding:"10px 12px",borderTop:"1px solid #F1F5F9",background:"#fff"}}>
            {micState!=="idle"&&(
              <div style={{marginBottom:8,padding:"6px 10px",borderRadius:7,
                background:micState==="listening"?"#EFF6FF":micState==="error"?"#FEF2F2":"#FFFBEB",
                border:`1px solid ${micState==="listening"?"#BFDBFE":micState==="error"?"#FECACA":"#FDE68A"}`,
                fontSize:10.5,color:micState==="listening"?"#1D4ED8":micState==="error"?"#B91C1C":"#92400E",
                fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:500,display:"flex",alignItems:"center",gap:6}}>
                {micState==="listening"&&<span style={{width:6,height:6,borderRadius:"50%",background:"#2563EB",display:"inline-block",animation:"pulse 1s infinite",flexShrink:0}}/>}
                <span>{micState==="listening"?`🎙 Escuchando${interim?`: "${interim}"`:"..."}`:micState==="requesting"?"Solicitando permiso...":"Error — revisá los permisos"}</span>
              </div>
            )}
            <div style={{display:"flex",gap:7,alignItems:"flex-end"}}>
              <button onClick={micState==="listening"?stopListen:startListen} disabled={micState==="requesting"}
                style={{width:40,height:40,borderRadius:9,flexShrink:0,border:`1.5px solid ${micC.border}`,background:micC.bg,cursor:micState==="requesting"?"wait":"pointer",display:"flex",alignItems:"center",justifyContent:"center",animation:micC.anim,transition:"all .2s"}}>
                {micState==="listening"
                  ?<svg width="13" height="13" viewBox="0 0 24 24" fill={micC.icon} stroke="none"><rect x="4" y="4" width="16" height="16" rx="2"/></svg>
                  :<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={micC.icon} strokeWidth="2"><path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>}
              </button>
              <textarea style={{flex:1,background:"#F8FAFC",border:"1.5px solid #E2E8F0",borderRadius:9,padding:"9px 11px",fontFamily:"'Plus Jakarta Sans',sans-serif",fontSize:12,color:"#0F172A",resize:"none",minHeight:40,maxHeight:80,lineHeight:1.5}}
                placeholder='Ej: "Laura de TechSur cerró por $140k"'
                value={input} onChange={e=>setInput(e.target.value)} onKeyDown={handleKey} rows={1}/>
              <button onClick={send} disabled={processing||!input.trim()}
                style={{width:40,height:40,borderRadius:9,border:"none",flexShrink:0,background:processing||!input.trim()?"#E2E8F0":"linear-gradient(135deg,#2563EB,#7C3AED)",cursor:processing||!input.trim()?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              </button>
            </div>
          </div>
        </aside>

        {/* CRM MAIN */}
        <main ref={dashRef} style={{flex:1,overflowY:"auto"}}>
          <div className="main-pad" style={{padding:18,display:"flex",flexDirection:"column",gap:14}}>
            <div style={{display:"flex",alignItems:"center",gap:6,background:"#fff",border:"1px solid #E2E8F0",borderRadius:10,padding:4,width:"fit-content"}}>
              <button style={tabBtn("crm")} onClick={()=>setActiveTab("crm")}>Pipeline</button>
              <button style={tabBtn("activity")} onClick={()=>setActiveTab("activity")}>
                Historial
                {activity.length>0&&<span style={{marginLeft:6,background:activeTab==="activity"?"rgba(255,255,255,.25)":"#EFF6FF",color:activeTab==="activity"?"#fff":"#2563EB",padding:"0 6px",borderRadius:10,fontSize:10,fontWeight:700}}>{activity.length}</span>}
              </button>
            </div>

            {activeTab==="crm"&&<>
              <div className="kpi-row" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:11}}>
                {[
                  {label:"Pipeline total",value:fmt(pipeline),sub:"En todos los stages",accent:"#2563EB"},
                  {label:"Cerrado ganado",value:fmt(won.reduce((s,c)=>s+c.value,0)),sub:`${won.length} deal${won.length!==1?"s":""} cerrado${won.length!==1?"s":""}`,accent:"#059669"},
                  {label:"Deals activos",value:String(active.length),sub:"En progreso",accent:"#0F172A"},
                  {label:"Contactos",value:String(contacts.length),sub:"En el pipeline",accent:"#0F172A"},
                ].map((k,i)=>(
                  <div key={i} style={{...cardS,padding:"14px 16px"}}>
                    <div style={{fontSize:10,color:"#94A3B8",fontWeight:700,textTransform:"uppercase",letterSpacing:".07em",marginBottom:6}}>{k.label}</div>
                    <div style={{fontSize:21,fontWeight:800,color:k.accent,letterSpacing:"-.5px"}}>{k.value}</div>
                    <div style={{fontSize:10.5,color:"#94A3B8",marginTop:2}}>{k.sub}</div>
                  </div>
                ))}
              </div>

              <div className="charts-row" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:11}}>
                <div style={cardS}>
                  <div style={{fontWeight:700,fontSize:12.5,color:"#0F172A",marginBottom:2}}>Pipeline por etapa</div>
                  <div style={{fontSize:10.5,color:"#94A3B8",marginBottom:12}}>Valor total por etapa</div>
                  <ResponsiveContainer width="100%" height={150}>
                    <BarChart data={chartData} margin={{top:4,right:4,left:-24,bottom:4}}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false}/>
                      <XAxis dataKey="name" tick={{fontSize:9,fill:"#94A3B8"}} axisLine={false} tickLine={false}/>
                      <YAxis tick={{fontSize:9,fill:"#CBD5E1"}} axisLine={false} tickLine={false}/>
                      <Tooltip content={<CustomTip/>}/>
                      <Bar dataKey="Valor" radius={[5,5,0,0]} maxBarSize={42}>
                        {chartData.map((e,i)=><Cell key={i} fill={e.color}/>)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div style={cardS}>
                  <div style={{fontWeight:700,fontSize:12.5,color:"#0F172A",marginBottom:2}}>Contactos por estado</div>
                  <div style={{fontSize:10.5,color:"#94A3B8",marginBottom:12}}>Distribución actual</div>
                  <ResponsiveContainer width="100%" height={150}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={36} outerRadius={56} paddingAngle={3} dataKey="value">
                        {pieData.map((e,i)=><Cell key={i} fill={e.color}/>)}
                      </Pie>
                      <Tooltip formatter={(v,_,p)=>[v,p.payload.name]}/>
                      <Legend iconType="circle" iconSize={7} wrapperStyle={{fontSize:"10px"}}/>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div>
                <div style={{fontWeight:700,fontSize:12.5,color:"#0F172A",marginBottom:11,display:"flex",alignItems:"center",gap:6}}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  Contactos del pipeline
                </div>
                <div className="cards-grid" style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(230px,1fr))",gap:10}}>
                  {contacts.map(c=>{
                    const m=STATUS_META[c.status]||{color:"#94A3B8",bg:"#F8FAFC",text:"#64748B"};
                    const flash=flashId===c.id;
                    return(
                      <div key={c.id} style={{background:"#fff",borderRadius:12,padding:14,position:"relative",overflow:"hidden",border:`1px solid ${flash?"#3B82F6":"#E2E8F0"}`,boxShadow:flash?"0 0 0 3px rgba(59,130,246,.1)":"none",transition:"border-color .5s,box-shadow .5s"}}>
                        <div style={{position:"absolute",top:0,left:0,right:0,height:2.5,background:m.color,opacity:.85}}/>
                        <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:11}}>
                          <div style={{width:34,height:34,borderRadius:8,background:m.bg,color:m.text,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:11,flexShrink:0}}>{c.init}</div>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{fontWeight:700,fontSize:12.5,color:"#0F172A",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.name}</div>
                            <div style={{fontSize:10,color:"#94A3B8",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.company}</div>
                          </div>
                          <div style={{padding:"2px 7px",borderRadius:5,background:m.bg,color:m.text,fontSize:9,fontWeight:700,whiteSpace:"nowrap",flexShrink:0}}>{c.status}</div>
                        </div>
                        {[["Valor",fmt(c.value),c.value>0],["Próx. acción",c.nextAction,false],["Fecha",c.nextDate,false]].map(([l,v,acc])=>(
                          <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"4px 0",borderBottom:"1px solid #F8FAFC",fontSize:11}}>
                            <span style={{color:"#94A3B8",fontWeight:500}}>{l}</span>
                            <span style={{color:acc?"#2563EB":"#334155",fontWeight:600,maxWidth:"55%",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",textAlign:"right"}}>{v}</span>
                          </div>
                        ))}
                        {c.notes&&<div style={{marginTop:8,padding:"5px 8px",background:"#F8FAFC",borderRadius:6,fontSize:10,color:"#64748B",fontStyle:"italic",lineHeight:1.5}}>{c.notes}</div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            </>}

            {activeTab==="activity"&&(
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                <div style={{fontWeight:700,fontSize:12.5,color:"#0F172A",marginBottom:4,display:"flex",alignItems:"center",gap:6}}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  Historial de cambios
                  {isAdmin&&activity.length>0&&(
                    <button onClick={exportActivity} style={{marginLeft:"auto",padding:"3px 10px",background:"#EFF6FF",border:"1px solid #BFDBFE",borderRadius:6,fontFamily:"'Plus Jakarta Sans',sans-serif",fontSize:10.5,color:"#2563EB",cursor:"pointer",fontWeight:600}}>
                      Exportar CSV
                    </button>
                  )}
                </div>
                {activity.length===0&&<div style={{...cardS,textAlign:"center",padding:"32px 20px",color:"#94A3B8",fontSize:12}}>No hay cambios registrados todavía.</div>}
                {activity.map(a=>{
                  const meta=STATUS_META[a.changes?.status]||null;
                  return(
                    <div key={a.id} style={{...cardS,padding:"12px 16px",display:"flex",gap:12,alignItems:"flex-start"}}>
                      <div style={{width:32,height:32,borderRadius:8,background:"#EFF6FF",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                      </div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3,flexWrap:"wrap"}}>
                          <span style={{fontWeight:700,fontSize:12,color:"#0F172A"}}>{a.contact_name}</span>
                          {meta&&<span style={{padding:"1px 7px",borderRadius:4,background:meta.bg,color:meta.text,fontSize:9,fontWeight:700}}>{a.changes.status}</span>}
                          {a.changes?.value!=null&&<span style={{fontSize:10,color:"#2563EB",fontWeight:600}}>{fmt(a.changes.value)}</span>}
                        </div>
                        <div style={{fontSize:11,color:"#64748B",lineHeight:1.5}}>{a.summary}</div>
                        {a.changes&&(
                          <div style={{marginTop:5,display:"flex",gap:6,flexWrap:"wrap"}}>
                            {a.changes.next_action&&<span style={{fontSize:9.5,background:"#F8FAFC",border:"1px solid #E2E8F0",padding:"1px 7px",borderRadius:4,color:"#64748B"}}>→ {a.changes.next_action}</span>}
                            {a.changes.next_date&&<span style={{fontSize:9.5,background:"#F8FAFC",border:"1px solid #E2E8F0",padding:"1px 7px",borderRadius:4,color:"#64748B"}}>{a.changes.next_date}</span>}
                          </div>
                        )}
                      </div>
                      <div style={{fontSize:9.5,color:"#CBD5E1",whiteSpace:"nowrap",flexShrink:0}}>{relTime(a.created_at)}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
