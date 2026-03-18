import { useState, useEffect } from "react";
import { supabase } from "./supabase.js";
import Landing from "./Landing.jsx";
import Dashboard from "./Dashboard.jsx";

function LoginScreen({ onLogin }) {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [showPass, setShowPass] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email||!password){setError("Completá email y contraseña.");return;}
    setLoading(true); setError("");
    const {error:err} = await supabase.auth.signInWithPassword({email,password});
    if (err){setError("Email o contraseña incorrectos.");setLoading(false);}
  };

  const fillDemo = role => {
    setEmail(role==="admin"?"admin@aria-demo.com":"vendedor@aria-demo.com");
    setPassword("aria2024"); setError("");
  };

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#EFF6FF,#F0F4FF,#FAF5FF)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif",padding:20}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');*{box-sizing:border-box;margin:0;padding:0}`}</style>
      <div style={{width:"100%",maxWidth:420}}>
        <div style={{textAlign:"center",marginBottom:30}}>
          <div style={{width:52,height:52,borderRadius:14,background:"linear-gradient(135deg,#2563EB,#7C3AED)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px"}}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
          </div>
          <div style={{fontWeight:800,fontSize:26,color:"#0F172A",letterSpacing:"-.5px"}}>ARIA</div>
          <div style={{fontSize:13,color:"#64748B",marginTop:4,fontWeight:500}}>Agente de Revenue Intelligence</div>
        </div>
        <div style={{background:"#fff",borderRadius:18,border:"1px solid #E2E8F0",padding:"32px 32px 28px",boxShadow:"0 4px 24px rgba(0,0,0,.07)"}}>
          <div style={{fontWeight:700,fontSize:17,color:"#0F172A",marginBottom:4}}>Bienvenido</div>
          <div style={{fontSize:12.5,color:"#94A3B8",marginBottom:24,fontWeight:500}}>Ingresá con tu cuenta para acceder al CRM</div>
          <form onSubmit={handleLogin} style={{display:"flex",flexDirection:"column",gap:14}}>
            {[
              {label:"Email",type:showPass?"text":"email",val:email,set:v=>{setEmail(v);setError("");},ph:"tu@email.com"},
            ].map(({label,type,val,set,ph})=>(
              <div key={label}>
                <label style={{display:"block",fontSize:11.5,fontWeight:600,color:"#374151",marginBottom:5,textTransform:"uppercase",letterSpacing:".06em"}}>{label}</label>
                <input type="email" value={email} onChange={e=>{setEmail(e.target.value);setError("");}} placeholder="tu@email.com"
                  style={{width:"100%",padding:"10px 13px",border:"1.5px solid #E2E8F0",borderRadius:9,fontSize:13,color:"#0F172A",fontFamily:"inherit",outline:"none",background:"#F8FAFC",transition:"border-color .2s"}}
                  onFocus={e=>e.target.style.borderColor="#93C5FD"} onBlur={e=>e.target.style.borderColor="#E2E8F0"}/>
              </div>
            ))}
            <div>
              <label style={{display:"block",fontSize:11.5,fontWeight:600,color:"#374151",marginBottom:5,textTransform:"uppercase",letterSpacing:".06em"}}>Contraseña</label>
              <div style={{position:"relative"}}>
                <input type={showPass?"text":"password"} value={password} onChange={e=>{setPassword(e.target.value);setError("");}} placeholder="••••••••"
                  style={{width:"100%",padding:"10px 40px 10px 13px",border:"1.5px solid #E2E8F0",borderRadius:9,fontSize:13,color:"#0F172A",fontFamily:"inherit",outline:"none",background:"#F8FAFC",transition:"border-color .2s"}}
                  onFocus={e=>e.target.style.borderColor="#93C5FD"} onBlur={e=>e.target.style.borderColor="#E2E8F0"}/>
                <button type="button" onClick={()=>setShowPass(p=>!p)} style={{position:"absolute",right:11,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:"#94A3B8",padding:2}}>
                  {showPass
                    ?<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    :<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
                </button>
              </div>
            </div>
            {error&&<div style={{background:"#FEF2F2",border:"1px solid #FECACA",borderRadius:8,padding:"8px 12px",fontSize:11.5,color:"#B91C1C",fontWeight:500}}>{error}</div>}
            <button type="submit" disabled={loading}
              style={{padding:"11px",background:"linear-gradient(135deg,#2563EB,#7C3AED)",color:"#fff",border:"none",borderRadius:10,fontFamily:"inherit",fontWeight:700,fontSize:13.5,cursor:loading?"wait":"pointer",opacity:loading?.7:1,marginTop:2}}>
              {loading?"Ingresando...":"Ingresar →"}
            </button>
          </form>
          <div style={{marginTop:20,paddingTop:18,borderTop:"1px solid #F1F5F9"}}>
            <div style={{fontSize:10.5,color:"#94A3B8",fontWeight:600,textTransform:"uppercase",letterSpacing:".08em",marginBottom:10,textAlign:"center"}}>Acceso demo rápido</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              {[{role:"admin",label:"Admin",sub:"Vista completa",icon:"👑"},{role:"vendedor",label:"Vendedor",sub:"Vista comercial",icon:"💼"}].map(({role,label,sub,icon})=>(
                <button key={role} onClick={()=>fillDemo(role)}
                  style={{padding:"9px 10px",background:"#F8FAFC",border:"1px solid #E2E8F0",borderRadius:9,cursor:"pointer",fontFamily:"inherit",textAlign:"left",transition:"border-color .15s"}}
                  onMouseEnter={e=>e.currentTarget.style.borderColor="#93C5FD"}
                  onMouseLeave={e=>e.currentTarget.style.borderColor="#E2E8F0"}>
                  <div style={{fontSize:14,marginBottom:2}}>{icon}</div>
                  <div style={{fontSize:11.5,fontWeight:700,color:"#0F172A"}}>{label}</div>
                  <div style={{fontSize:10,color:"#94A3B8"}}>{sub}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
        <div style={{textAlign:"center",marginTop:14,fontSize:11,color:"#CBD5E1"}}>ARIA · Demo v1.0</div>
      </div>
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState(undefined);
  const [view,    setView]    = useState("landing"); // "landing" | "login" | "dashboard"

  useEffect(() => {
    supabase.auth.getSession().then(({data:{session}}) => {
      setSession(session);
      if (session) setView("dashboard");
    });
    const {data:{subscription}} = supabase.auth.onAuthStateChange((_e, session) => {
      setSession(session);
      if (session) setView("dashboard");
      else         setView("landing");
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => { await supabase.auth.signOut(); };

  if (session === undefined) return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",background:"#F0F4FF",fontFamily:"system-ui",fontSize:13,color:"#94A3B8"}}>
      Iniciando...
    </div>
  );

  if (session) return <Dashboard user={session.user} onLogout={handleLogout} />;
  if (view === "login") return <LoginScreen onLogin={()=>{}} />;
  return <Landing onEnterDemo={() => setView("login")} />;
}
