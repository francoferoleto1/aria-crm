import { useState } from "react";

const FEATURES = [
  { icon:"🎙", title:"Voz a CRM",           desc:"Dictá una actualización y ARIA la interpreta y registra automáticamente." },
  { icon:"🧠", title:"IA contextual",        desc:"Entiende lenguaje natural. Sin formularios, sin campos. Solo hablás." },
  { icon:"📊", title:"Dashboard en tiempo real", desc:"Pipeline y contactos actualizados al instante con cada cambio." },
  { icon:"🔒", title:"Roles y accesos",      desc:"Admins ven todo. Vendedores ven su pipeline. Cada uno en su lugar." },
  { icon:"📋", title:"Historial completo",   desc:"Cada cambio queda registrado con fecha, hora y detalle." },
  { icon:"📤", title:"Exportación de datos", desc:"Exportá contactos, actividad y gráficos en un click. CSV y PNG." },
];

const STEPS = [
  { n:"01", title:"El vendedor habla",  desc:'Después de una reunión dice: "Roberto cerró el deal por $90k, firma el viernes."' },
  { n:"02", title:"ARIA interpreta",    desc:"El agente identifica el contacto, extrae el valor, estado y próxima acción." },
  { n:"03", title:"Confirmación rápida",desc:"ARIA muestra lo que va a cambiar y el vendedor confirma con un click." },
  { n:"04", title:"CRM actualizado",    desc:"El dato queda guardado en la base de datos. Cero carga manual." },
];

export default function Landing({ onEnterDemo }) {
  const [vendedores, setVendedores] = useState(5);
  const [ticket,     setTicket]     = useState(150000);

  const horasMes  = 4 * 4 * vendedores;
  const dealsExtra = Math.round(horasMes / 3 * 0.08);
  const valorExtra = dealsExtra * ticket;

  return (
    <div style={{fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif",background:"#fff",color:"#0F172A",overflowX:"hidden"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}html{scroll-behavior:smooth}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}
        .ani{animation:fadeUp .65s ease forwards}
        input[type=range]{-webkit-appearance:none;width:100%;height:5px;border-radius:5px;background:#E2E8F0;outline:none}
        input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:20px;height:20px;border-radius:50%;background:linear-gradient(135deg,#2563EB,#7C3AED);cursor:pointer;box-shadow:0 2px 6px rgba(37,99,235,.35)}
        @media(max-width:768px){
          .hgrid{grid-template-columns:1fr!important}
          .fgrid{grid-template-columns:1fr 1fr!important}
          .sgrid{grid-template-columns:1fr 1fr!important}
          .rgrid{grid-template-columns:1fr!important}
          .htitle{font-size:32px!important;line-height:1.2!important}
          .navlinks{display:none!important}
          .ctarow{flex-direction:column!important;gap:10px!important}
          .ctarow a,.ctarow button{width:100%!important;text-align:center!important;justify-content:center!important}
        }
      `}</style>

      {/* NAV */}
      <nav style={{position:"sticky",top:0,zIndex:100,background:"rgba(255,255,255,.94)",backdropFilter:"blur(14px)",borderBottom:"1px solid #F1F5F9",padding:"0 5%",height:62,display:"flex",alignItems:"center",gap:14}}>
        <div style={{display:"flex",alignItems:"center",gap:9,flexShrink:0}}>
          <div style={{width:34,height:34,borderRadius:10,background:"linear-gradient(135deg,#2563EB,#7C3AED)",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
          </div>
          <span style={{fontWeight:800,fontSize:19,letterSpacing:"-.4px"}}>ARIA</span>
        </div>
        <div className="navlinks" style={{display:"flex",gap:26,marginLeft:20}}>
          {[["Producto","#producto"],["Cómo funciona","#como"],["ROI","#roi"]].map(([l,h])=>(
            <a key={l} href={h} style={{fontSize:13.5,color:"#64748B",textDecoration:"none",fontWeight:500,transition:"color .15s"}}
              onMouseEnter={e=>e.target.style.color="#0F172A"} onMouseLeave={e=>e.target.style.color="#64748B"}>{l}</a>
          ))}
        </div>
        <div style={{flex:1}}/>
        <button onClick={onEnterDemo}
          style={{padding:"8px 20px",background:"linear-gradient(135deg,#2563EB,#7C3AED)",color:"#fff",border:"none",borderRadius:9,fontFamily:"inherit",fontWeight:700,fontSize:13,cursor:"pointer",whiteSpace:"nowrap"}}
          onMouseEnter={e=>e.currentTarget.style.opacity=".88"} onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
          Ver demo →
        </button>
      </nav>

      {/* HERO */}
      <section style={{padding:"72px 5% 80px",maxWidth:1160,margin:"0 auto"}}>
        <div className="hgrid" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:60,alignItems:"center"}}>
          <div className="ani">
            <div style={{display:"inline-flex",alignItems:"center",gap:7,background:"#EFF6FF",border:"1px solid #BFDBFE",borderRadius:20,padding:"4px 14px",fontSize:11.5,color:"#2563EB",fontWeight:700,marginBottom:22,letterSpacing:".05em"}}>
              🚀 Demo disponible ahora · Sin registro
            </div>
            <h1 className="htitle" style={{fontSize:48,fontWeight:800,lineHeight:1.1,letterSpacing:"-1.2px",marginBottom:22}}>
              Tus vendedores venden.<br/>
              <span style={{background:"linear-gradient(135deg,#2563EB,#7C3AED)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>ARIA hace el resto.</span>
            </h1>
            <p style={{fontSize:16,color:"#64748B",lineHeight:1.75,marginBottom:32,fontWeight:500,maxWidth:480}}>
              El agente inteligente que escucha a tus vendedores y actualiza el CRM automáticamente. Sin formularios, sin carga manual, sin tiempo perdido.
            </p>
            <div className="ctarow" style={{display:"flex",gap:12,alignItems:"center",marginBottom:28}}>
              <button onClick={onEnterDemo}
                style={{padding:"13px 28px",background:"linear-gradient(135deg,#2563EB,#7C3AED)",color:"#fff",border:"none",borderRadius:11,fontFamily:"inherit",fontWeight:700,fontSize:15,cursor:"pointer",boxShadow:"0 4px 20px rgba(37,99,235,.28)",transition:"transform .15s"}}
                onMouseEnter={e=>e.currentTarget.style.transform="translateY(-2px)"} onMouseLeave={e=>e.currentTarget.style.transform="none"}>
                Probar demo →
              </button>
              <a href="#como"
                style={{padding:"13px 22px",color:"#64748B",textDecoration:"none",fontWeight:600,fontSize:14,borderRadius:11,border:"1px solid #E2E8F0",transition:"all .15s",display:"inline-block"}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor="#93C5FD";e.currentTarget.style.color="#2563EB"}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor="#E2E8F0";e.currentTarget.style.color="#64748B"}}>
                Cómo funciona
              </a>
            </div>
            <div style={{display:"flex",gap:18,flexWrap:"wrap"}}>
              {["Sin tarjeta de crédito","Setup en 5 minutos","IA real incluida"].map(t=>(
                <div key={t} style={{display:"flex",alignItems:"center",gap:5,fontSize:12,color:"#94A3B8",fontWeight:500}}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>{t}
                </div>
              ))}
            </div>
          </div>
          {/* Hero card */}
          <div style={{animation:"float 4s ease-in-out infinite"}}>
            <div style={{background:"#F8FAFC",borderRadius:20,border:"1px solid #E2E8F0",padding:22,boxShadow:"0 24px 64px rgba(0,0,0,.09)"}}>
              <div style={{background:"#fff",borderRadius:13,padding:16,marginBottom:14,border:"1px solid #F1F5F9"}}>
                <div style={{fontSize:10,color:"#94A3B8",marginBottom:10,fontWeight:700,textTransform:"uppercase",letterSpacing:".08em"}}>🤖 Agente ARIA</div>
                <div style={{display:"flex",flexDirection:"column",gap:9}}>
                  <div style={{alignSelf:"flex-end",background:"linear-gradient(135deg,#2563EB,#7C3AED)",color:"#fff",padding:"8px 13px",borderRadius:"11px 11px 3px 11px",fontSize:12.5,maxWidth:"82%",lineHeight:1.55,fontWeight:500}}>
                    Roberto de Constructora cerró por $90k, firma el viernes
                  </div>
                  <div style={{alignSelf:"flex-start",background:"#F8FAFC",border:"1px solid #E2E8F0",padding:"8px 13px",borderRadius:"11px 11px 11px 3px",fontSize:12.5,color:"#334155",maxWidth:"88%",lineHeight:1.55}}>
                    ✓ Roberto Paz → <strong>Cerrado ganado</strong> · $90.000 · Viernes 21
                  </div>
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                {[["Pipeline","$548.000","↑ 12%","#2563EB"],["Cerrado","$300.000","↑ 8%","#10B981"]].map(([l,v,d,c])=>(
                  <div key={l} style={{background:"#fff",borderRadius:10,padding:"12px 14px",border:"1px solid #F1F5F9"}}>
                    <div style={{fontSize:9.5,color:"#94A3B8",fontWeight:700,textTransform:"uppercase",letterSpacing:".07em",marginBottom:4}}>{l}</div>
                    <div style={{fontSize:19,fontWeight:800,color:c,letterSpacing:"-.3px"}}>{v}</div>
                    <div style={{fontSize:10.5,color:"#10B981",fontWeight:600,marginTop:2}}>{d} este mes</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEMA */}
      <section style={{background:"#F8FAFC",padding:"64px 5%",borderTop:"1px solid #F1F5F9",borderBottom:"1px solid #F1F5F9"}}>
        <div style={{maxWidth:900,margin:"0 auto",textAlign:"center"}}>
          <div style={{fontSize:11.5,color:"#EF4444",fontWeight:700,textTransform:"uppercase",letterSpacing:".1em",marginBottom:14}}>El problema</div>
          <h2 style={{fontSize:30,fontWeight:800,letterSpacing:"-.5px",marginBottom:14}}>Los vendedores odian cargar el CRM</h2>
          <p style={{fontSize:15,color:"#64748B",lineHeight:1.7,maxWidth:580,margin:"0 auto 36px"}}>
            Un vendedor promedio pierde <strong style={{color:"#EF4444"}}>4 horas semanales</strong> cargando datos. Son horas que deberían estar en reuniones y cierres.
          </p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,maxWidth:700,margin:"0 auto"}}>
            {[{n:"4hs",label:"Por semana en carga manual",c:"#EF4444"},{n:"68%",label:"De los datos cargados tarde o incompletos",c:"#F59E0B"},{n:"$0",label:"En ingresos genera esa carga",c:"#94A3B8"}].map(({n,label,c})=>(
              <div key={n} style={{background:"#fff",borderRadius:13,padding:"20px 14px",border:"1px solid #E2E8F0",textAlign:"center"}}>
                <div style={{fontSize:34,fontWeight:800,color:c,letterSpacing:"-.5px",marginBottom:7}}>{n}</div>
                <div style={{fontSize:12,color:"#64748B",lineHeight:1.55}}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="producto" style={{padding:"72px 5%",maxWidth:1100,margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:48}}>
          <div style={{fontSize:11.5,color:"#2563EB",fontWeight:700,textTransform:"uppercase",letterSpacing:".1em",marginBottom:14}}>Producto</div>
          <h2 style={{fontSize:30,fontWeight:800,letterSpacing:"-.5px",marginBottom:10}}>Todo lo que necesitás en un agente</h2>
          <p style={{fontSize:14.5,color:"#64748B",maxWidth:480,margin:"0 auto"}}>ARIA no reemplaza al CRM — lo alimenta sin esfuerzo.</p>
        </div>
        <div className="fgrid" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:13}}>
          {FEATURES.map(({icon,title,desc})=>(
            <div key={title} style={{background:"#fff",border:"1px solid #E2E8F0",borderRadius:14,padding:"22px 20px",cursor:"default",transition:"box-shadow .2s,transform .2s"}}
              onMouseEnter={e=>{e.currentTarget.style.boxShadow="0 8px 24px rgba(0,0,0,.07)";e.currentTarget.style.transform="translateY(-3px)"}}
              onMouseLeave={e=>{e.currentTarget.style.boxShadow="none";e.currentTarget.style.transform="none"}}>
              <div style={{fontSize:26,marginBottom:12}}>{icon}</div>
              <div style={{fontWeight:700,fontSize:14,marginBottom:6}}>{title}</div>
              <div style={{fontSize:12.5,color:"#64748B",lineHeight:1.65}}>{desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section id="como" style={{background:"linear-gradient(135deg,#EFF6FF 0%,#FAF5FF 100%)",padding:"72px 5%",borderTop:"1px solid #E2E8F0",borderBottom:"1px solid #E2E8F0"}}>
        <div style={{maxWidth:1000,margin:"0 auto"}}>
          <div style={{textAlign:"center",marginBottom:50}}>
            <div style={{fontSize:11.5,color:"#7C3AED",fontWeight:700,textTransform:"uppercase",letterSpacing:".1em",marginBottom:14}}>Cómo funciona</div>
            <h2 style={{fontSize:30,fontWeight:800,letterSpacing:"-.5px"}}>De la voz al CRM en 10 segundos</h2>
          </div>
          <div className="sgrid" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:13}}>
            {STEPS.map(({n,title,desc})=>(
              <div key={n} style={{background:"#fff",borderRadius:14,padding:"22px 17px",border:"1px solid #E2E8F0",textAlign:"center",boxShadow:"0 2px 8px rgba(0,0,0,.04)"}}>
                <div style={{width:42,height:42,borderRadius:12,background:"linear-gradient(135deg,#2563EB,#7C3AED)",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:14,margin:"0 auto 14px"}}>{n}</div>
                <div style={{fontWeight:700,fontSize:13.5,marginBottom:8}}>{title}</div>
                <div style={{fontSize:12,color:"#64748B",lineHeight:1.65}}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ROI */}
      <section id="roi" style={{padding:"72px 5%",maxWidth:1000,margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:46}}>
          <div style={{fontSize:11.5,color:"#10B981",fontWeight:700,textTransform:"uppercase",letterSpacing:".1em",marginBottom:14}}>Calculadora de ROI</div>
          <h2 style={{fontSize:30,fontWeight:800,letterSpacing:"-.5px",marginBottom:10}}>¿Cuánto vale el tiempo de tus vendedores?</h2>
          <p style={{fontSize:14.5,color:"#64748B"}}>Mové los sliders y calculá el impacto real en tu empresa.</p>
        </div>
        <div className="rgrid" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:22,alignItems:"start"}}>
          <div style={{background:"#F8FAFC",borderRadius:16,padding:"28px 24px",border:"1px solid #E2E8F0"}}>
            {[
              {label:"Cantidad de vendedores",val:vendedores,set:setVendedores,min:1,max:50,step:1,disp:String(vendedores)},
              {label:"Ticket promedio",val:ticket,set:setTicket,min:10000,max:1000000,step:10000,disp:`$${ticket.toLocaleString("es-AR")}`},
            ].map(({label,val,set,min,max,step,disp},i)=>(
              <div key={label} style={{marginBottom:i===0?28:0}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                  <label style={{fontSize:13,fontWeight:600,color:"#374151"}}>{label}</label>
                  <span style={{fontSize:19,fontWeight:800,color:"#2563EB"}}>{disp}</span>
                </div>
                <input type="range" min={min} max={max} step={step} value={val} onChange={e=>set(+e.target.value)}/>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"#CBD5E1",marginTop:4}}>
                  <span>{min.toLocaleString("es-AR")}</span><span>{max.toLocaleString("es-AR")}</span>
                </div>
              </div>
            ))}
            <div style={{marginTop:22,padding:"12px 14px",background:"#EFF6FF",borderRadius:9,border:"1px solid #BFDBFE",fontSize:11.5,color:"#1D4ED8",lineHeight:1.65}}>
              💡 4hs/semana de carga manual liberadas por vendedor · 8% de tasa de cierre adicional con ese tiempo
            </div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:11}}>
            {[
              {label:"Horas liberadas por mes",     val:`${horasMes}hs`,                              color:"#6366F1",bg:"#EEF2FF"},
              {label:"Deals adicionales estimados",  val:`${dealsExtra} deal${dealsExtra!==1?"s":""}`, color:"#F97316",bg:"#FFF7ED"},
              {label:"Valor adicional mensual",      val:`$${valorExtra.toLocaleString("es-AR")}`,     color:"#10B981",bg:"#ECFDF5"},
            ].map(({label,val,color,bg})=>(
              <div key={label} style={{background:bg,borderRadius:13,padding:"18px 20px",border:`1px solid ${color}25`}}>
                <div style={{fontSize:10.5,color:"#94A3B8",fontWeight:600,textTransform:"uppercase",letterSpacing:".07em",marginBottom:5}}>{label}</div>
                <div style={{fontSize:30,fontWeight:800,color,letterSpacing:"-.5px"}}>{val}</div>
              </div>
            ))}
            <div style={{background:"linear-gradient(135deg,#2563EB,#7C3AED)",borderRadius:13,padding:"18px 20px",textAlign:"center"}}>
              <div style={{fontSize:10.5,color:"rgba(255,255,255,.65)",fontWeight:600,textTransform:"uppercase",letterSpacing:".07em",marginBottom:4}}>ARIA se paga solo en</div>
              <div style={{fontSize:24,fontWeight:800,color:"#fff"}}>{valorExtra>0?`~${Math.max(1,Math.ceil(3000/valorExtra*30))} días`:"< 1 mes"}</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{background:"linear-gradient(135deg,#1E3A8A,#4C1D95)",padding:"72px 5%",textAlign:"center"}}>
        <div style={{maxWidth:560,margin:"0 auto"}}>
          <h2 style={{fontSize:34,fontWeight:800,color:"#fff",letterSpacing:"-.5px",marginBottom:16,lineHeight:1.2}}>Demo lista para mostrar ahora mismo</h2>
          <p style={{fontSize:15,color:"rgba(255,255,255,.7)",marginBottom:36,lineHeight:1.7}}>Sin setup, sin tarjeta. Entrá con las credenciales demo y probá el agente en vivo.</p>
          <button onClick={onEnterDemo}
            style={{padding:"15px 38px",background:"#C8FF00",color:"#0F172A",border:"none",borderRadius:12,fontFamily:"inherit",fontWeight:800,fontSize:16,cursor:"pointer",transition:"transform .15s"}}
            onMouseEnter={e=>e.currentTarget.style.transform="scale(1.04)"} onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>
            Entrar a la demo →
          </button>
          <div style={{marginTop:18,fontSize:12,color:"rgba(255,255,255,.4)"}}>admin@aria-demo.com · aria2024</div>
        </div>
      </section>
      <footer style={{background:"#0F172A",padding:"18px 5%",textAlign:"center",fontSize:12,color:"#475569"}}>ARIA — Agente de Revenue Intelligence · Demo v1.0</footer>
    </div>
  );
}
