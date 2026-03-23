-- ═══════════════════════════════════════════════════
-- ARIA CRM v6 — Migración de tablas nuevas
-- Ejecutar en Supabase SQL Editor
-- ═══════════════════════════════════════════════════

-- Oportunidades
create table if not exists opportunities (
  id          bigint primary key generated always as identity,
  contact_id  bigint references contacts(id) on delete set null,
  contact_name text not null,
  company     text not null,
  title       text not null,
  stage       text not null default 'Prospección',
  value       integer not null default 0,
  probability integer not null default 10,
  close_date  text,
  owner       text default 'Sin asignar',
  notes       text,
  status      text not null default 'Abierta',
  created_at  timestamptz default now()
);

-- Contratos
create table if not exists contracts (
  id           bigint primary key generated always as identity,
  contact_id   bigint references contacts(id) on delete set null,
  contact_name text not null,
  company      text not null,
  title        text not null,
  product      text not null,
  value        integer not null default 0,
  start_date   text not null,
  end_date     text not null,
  status       text not null default 'Activo',
  auto_renew   boolean default false,
  notes        text,
  created_at   timestamptz default now()
);

-- Tareas
create table if not exists tasks (
  id           bigint primary key generated always as identity,
  contact_id   bigint references contacts(id) on delete set null,
  contact_name text,
  company      text,
  title        text not null,
  description  text,
  priority     text not null default 'Media',
  due_date     text,
  assigned_to  text not null default 'Sin asignar',
  status       text not null default 'Pendiente',
  type         text default 'General',
  created_at   timestamptz default now()
);

-- Emails / borradores
create table if not exists email_drafts (
  id           bigint primary key generated always as identity,
  contact_id   bigint references contacts(id) on delete set null,
  contact_name text not null,
  company      text not null,
  subject      text not null,
  body         text not null,
  type         text default 'Seguimiento',
  sent         boolean default false,
  created_at   timestamptz default now()
);

-- Deshabilitar RLS (demo sin auth granular)
alter table opportunities  disable row level security;
alter table contracts      disable row level security;
alter table tasks          disable row level security;
alter table email_drafts   disable row level security;

-- ═══════════════════════════════════════════════════
-- Datos iniciales — Oportunidades
-- ═══════════════════════════════════════════════════
insert into opportunities (contact_name,company,title,stage,value,probability,close_date,owner,notes,status) values
('Carlos Mendoza',  'Acme Logistics',     'Implementación ERP logístico',        'Propuesta',      180000, 40, '30 Mar', 'Gonzalo Ríos',    'Esperando aprobación del directorio', 'Abierta'),
('Laura Fernández', 'TechSur SA',         'Renovación plataforma SaaS',          'Negociación',    140000, 75, '25 Mar', 'Valentina Cruz',  'Contrato en revisión legal',          'Abierta'),
('Roberto Paz',     'Constructora Norte', 'Sistema de gestión de obra',          'Prospección',     90000, 20, '15 Abr', 'Gonzalo Ríos',    'Primera reunión pactada',             'Abierta'),
('Sofía Reyes',     'Distribuidora Sur',  'Módulo de facturación electrónica',   'Cierre',          78000, 85, '22 Mar', 'Valentina Cruz',  'Demo aprobada, esperando PO',         'Abierta'),
('Diego Torres',    'MegaFarma SA',       'Integración SAP + BI',               'Demo',            220000, 55, '10 Abr', 'Martín Pérez',    'Segunda demo técnica agendada',       'Abierta'),
('Ana Quiroga',     'Grupo Pampa',        'Suite completa enterprise',           'Ganada',          210000,100, '01 Mar', 'Valentina Cruz',  'Contrato firmado. En onboarding.',    'Cerrada'),
('Pablo Rivas',     'Farmacorp',          'Módulo de compras y proveedores',     'Perdida',          65000,  0, '10 Feb', 'Gonzalo Ríos',    'Eligieron a un competidor local',     'Cerrada');

-- ═══════════════════════════════════════════════════
-- Datos iniciales — Contratos
-- ═══════════════════════════════════════════════════
insert into contracts (contact_name,company,title,product,value,start_date,end_date,status,auto_renew,notes) values
('Ana Quiroga',     'Grupo Pampa',        'Contrato Anual Enterprise',       'Suite ARIA Enterprise', 210000, '01 Mar 2025', '01 Mar 2026', 'Activo',   true,  'Incluye soporte 24/7 y 10 licencias'),
('Laura Fernández', 'TechSur SA',         'Licencia SaaS Pro',               'ARIA Pro',              120000, '01 Jun 2024', '01 Jun 2025', 'Activo',   false, 'Renovación pendiente de negociación'),
('Sofía Reyes',     'Distribuidora Sur',  'Módulo Facturación',              'ARIA Billing',           78000, '15 Ene 2025', '15 Ene 2026', 'Activo',   true,  'Integración con AFIP activa'),
('Diego Torres',    'MegaFarma SA',       'Piloto Técnico 3 meses',          'ARIA Trial',             15000, '01 Feb 2025', '01 May 2025', 'Activo',   false, 'Evaluación pre-contrato full'),
('Carlos Mendoza',  'Acme Logistics',     'Soporte extendido',               'ARIA Support',           24000, '01 Ene 2024', '01 Ene 2025', 'Vencido',  false, 'No renovó — en conversación'),
('Pablo Rivas',     'Farmacorp',          'Licencia básica',                 'ARIA Starter',           18000, '01 Mar 2024', '01 Mar 2025', 'Cancelado',false, 'Baja solicitada en Feb 2025');

-- ═══════════════════════════════════════════════════
-- Datos iniciales — Tareas
-- ═══════════════════════════════════════════════════
insert into tasks (contact_name,company,title,priority,due_date,assigned_to,status,type) values
('Carlos Mendoza',  'Acme Logistics',     'Enviar propuesta técnica revisada',  'Alta',   '20 Mar', 'Gonzalo Ríos',   'Pendiente',  'Comercial'),
('Laura Fernández', 'TechSur SA',         'Seguimiento contrato con legal',     'Alta',   '18 Mar', 'Valentina Cruz', 'Pendiente',  'Comercial'),
('Roberto Paz',     'Constructora Norte', 'Agendar demo de producto',           'Media',  '19 Mar', 'Gonzalo Ríos',   'Pendiente',  'Preventa'),
('Diego Torres',    'MegaFarma SA',       'Preparar demo integración SAP',      'Alta',   '21 Mar', 'Martín Pérez',   'En progreso','Preventa'),
('Sofía Reyes',     'Distribuidora Sur',  'Confirmar Purchase Order',           'Alta',   '22 Mar', 'Valentina Cruz', 'Pendiente',  'Comercial'),
('Ana Quiroga',     'Grupo Pampa',        'Kickoff de onboarding',              'Media',  '25 Mar', 'Martín Pérez',   'Pendiente',  'Postventa'),
(null,              null,                 'Actualizar deck de presentación Q2', 'Baja',   '28 Mar', 'Gonzalo Ríos',   'Pendiente',  'Interno'),
(null,              null,                 'Revisión de pipeline mensual',       'Media',  '31 Mar', 'Valentina Cruz', 'Pendiente',  'Interno');

-- ═══════════════════════════════════════════════════
-- Datos iniciales — Emails
-- ═══════════════════════════════════════════════════
insert into email_drafts (contact_name,company,subject,body,type,sent) values
('Carlos Mendoza','Acme Logistics',
'Seguimiento propuesta — Implementación ERP Logístico',
'Estimado Carlos,

Quería retomar nuestra conversación de la semana pasada respecto a la implementación del ERP logístico.

Adjunto la propuesta técnica actualizada con los ajustes que solicitaron. Los puntos más relevantes son:

• Módulo de trazabilidad en tiempo real integrado con el WMS actual
• Capacitación incluida para 15 usuarios en las primeras 4 semanas
• Soporte dedicado durante los primeros 3 meses de go-live

Quedamos a disposición para cualquier consulta. ¿Podríamos agendar una llamada esta semana para revisar los detalles?

Saludos,
Gonzalo Ríos
ARIA — Agente de Revenue Intelligence',
'Seguimiento', false),

('Diego Torres','MegaFarma SA',
'Confirmación demo técnica — Integración SAP + BI',
'Hola Diego,

Confirmo la demo técnica para el martes 21/03 a las 10:00hs.

En la sesión vamos a cubrir:

• Integración bidireccional con SAP S/4HANA
• Dashboard de BI en tiempo real con los KPIs que mencionaste
• Flujo de aprobaciones automatizado para compras

Por favor confirmame si el equipo técnico de su lado podrá estar presente — es importante para el Q&A de la integración.

Nos vemos el martes.

Martín Pérez
ARIA — Agente de Revenue Intelligence',
'Demo', false);
