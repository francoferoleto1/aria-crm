-- Seed data for tenders module
-- Insert sample data for testing

-- Organization ID (hardcoded for demo)
-- In a real multi-tenant setup, this would be dynamic
INSERT INTO tender_alerts (id, organization_id, name, keywords, min_amount) VALUES
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', '550e8400-e29b-41d4-a716-446655440000', 'Licencias Microsoft', ARRAY['microsoft', 'office', '365', 'azure', 'licencia'], 100000),
('b2c3d4e5-f6a7-8901-bcde-f23456789012', '550e8400-e29b-41d4-a716-446655440000', 'Desarrollo de sistemas', ARRAY['desarrollo', 'sistema', 'web', 'aplicación', 'software'], NULL),
('c3d4e5f6-a7b8-9012-cdef-345678901234', '550e8400-e29b-41d4-a716-446655440000', 'Infraestructura IT', ARRAY['servidor', 'networking', 'cisco', 'cloud', 'hosting', 'data center'], 500000);

-- Public tenders
INSERT INTO public_tenders (external_id, title, description, organism, tender_type, amount, publication_date, deadline, url, relevance_score, briefing_text) VALUES
('OC-2026-0001', 'Adquisición de licencias Microsoft Office 365', 'Licencias anuales para 500 usuarios incluyendo Office 365 E3 y Azure AD Premium', 'Ministerio de Educación', 'licitacion_publica', 12500000, '2026-04-10 10:00:00+00', '2026-04-22 17:00:00+00', 'https://comprar.gob.ar/PLIEGO/licitacion/OC-2026-0001', 0.95,
'## Resumen
Licitación para adquisición de licencias Microsoft Office 365 para 500 usuarios del Ministerio de Educación, incluyendo Office 365 E3 y Azure AD Premium.

## Relevancia
Alta coincidencia con nuestro portfolio de licencias Microsoft. Oportunidad de venta de licencias enterprise con soporte incluido.

## Datos clave
- Monto: $12.500.000 ARS
- Plazo: 12 meses
- Usuarios: 500
- Requisitos: Certificación Microsoft Gold Partner

## Próximos pasos
1. Revisar pliego completo
2. Preparar propuesta técnica
3. Contactar al responsable de compras

## Red flags
- Competencia de otros partners Microsoft
- Requisitos específicos de certificación'),

('OC-2026-0002', 'Desarrollo de sistema de gestión documental', 'Sistema de gestión documental electrónico con OCR y workflow automatizado', 'AFIP', 'licitacion_publica', 8200000, '2026-04-08 09:00:00+00', '2026-04-29 16:00:00+00', 'https://comprar.gob.ar/PLIEGO/licitacion/OC-2026-0002', 0.88,
'## Resumen
Desarrollo de sistema de gestión documental para AFIP con capacidades de OCR y workflow automatizado.

## Relevancia
Proyecto de desarrollo de software que coincide con nuestras capacidades de desarrollo web y sistemas documentales.

## Datos clave
- Monto: $8.200.000 ARS
- Tecnologías: OCR, workflow, integración con sistemas existentes
- Plazo de entrega: 6 meses

## Próximos pasos
1. Analizar requerimientos técnicos
2. Evaluar capacidad de desarrollo
3. Preparar propuesta metodológica

## Red flags
- Integración con sistemas legacy de AFIP
- Requisitos de seguridad específicos'),

('OC-2026-0003', 'Soporte técnico de infraestructura de servidores', 'Servicio de soporte técnico y mantenimiento de servidores HP ProLiant', 'Ministerio de Salud', 'contratacion_directa', 2100000, '2026-04-12 11:00:00+00', '2026-05-07 15:00:00+00', 'https://comprar.gob.ar/PLIEGO/licitacion/OC-2026-0003', 0.72,
'## Resumen
Servicio de soporte técnico para infraestructura de servidores HP ProLiant del Ministerio de Salud.

## Relevancia
Oportunidad de servicios de soporte técnico que complementa nuestras ventas de hardware.

## Datos clave
- Monto: $2.100.000 ARS
- Equipos: 50 servidores HP ProLiant
- Servicio: 24/7 con SLA 4 horas

## Próximos pasos
1. Verificar compatibilidad con nuestros servicios
2. Evaluar capacidad de soporte
3. Contactar para más detalles

## Red flags
- Requisitos específicos de HP
- Competencia de otros proveedores certificados'),

('OC-2026-0004', 'Implementación de sistema ERP', 'Implementación completa de sistema ERP SAP S/4HANA para gestión administrativa', 'ANSES', 'licitacion_publica', 25000000, '2026-04-09 08:00:00+00', '2026-04-25 18:00:00+00', 'https://comprar.gob.ar/PLIEGO/licitacion/OC-2026-0004', 0.91,
'## Resumen
Implementación de sistema ERP SAP S/4HANA para ANSES, incluyendo módulos de RRHH, finanzas y compras.

## Relevancia
Proyecto de implementación ERP que requiere partners certificados SAP. Alta oportunidad de revenue.

## Datos clave
- Monto: $25.000.000 ARS
- Módulos: RRHH, Finanzas, Compras
- Usuarios: 2000+
- Plazo: 18 meses

## Próximos pasos
1. Confirmar certificación SAP
2. Armar equipo de implementación
3. Preparar propuesta técnica

## Red flags
- Complejidad del proyecto
- Requisitos de certificación SAP específicos'),

('OC-2026-0005', 'Provisión de equipamiento de networking Cisco', 'Equipamiento de red Cisco Catalyst y switches para renovación de infraestructura', 'Ministerio de Defensa', 'licitacion_publica', 15800000, '2026-04-11 12:00:00+00', '2026-05-02 14:00:00+00', 'https://comprar.gob.ar/PLIEGO/licitacion/OC-2026-0005', 0.65,
'## Resumen
Renovación de infraestructura de networking con equipamiento Cisco para Ministerio de Defensa.

## Relevancia
Venta de equipamiento Cisco que tenemos en portfolio. Oportunidad de hardware networking.

## Datos clave
- Monto: $15.800.000 ARS
- Equipos: Switches Catalyst, routers ISR
- Instalación incluida

## Próximos pasos
1. Verificar stock disponible
2. Preparar cotización
3. Coordinar visita técnica

## Red flags
- Requisitos de seguridad nacional
- Posibles restricciones de proveedores'),

('OC-2026-0006', 'Consultoría en seguridad informática y ethical hacking', 'Servicio de consultoría en ciberseguridad incluyendo ethical hacking y penetration testing', 'Banco Nación', 'contratacion_directa', 5500000, '2026-04-14 10:00:00+00', '2026-04-20 17:00:00+00', 'https://comprar.gob.ar/PLIEGO/licitacion/OC-2026-0006', 0.85, NULL),
('OC-2026-0007', 'Servicio de hosting y cloud computing', 'Servicio de hosting cloud para aplicaciones críticas con SLA 99.9%', 'Ministerio de Economía', 'licitacion_publica', 3200000, '2026-04-13 09:00:00+00', '2026-05-12 16:00:00+00', 'https://comprar.gob.ar/PLIEGO/licitacion/OC-2026-0007', 0.78, NULL),
('OC-2026-0008', 'Adquisición de hardware - PCs de escritorio', '500 PCs de escritorio con Windows 11 Pro y Office incluido', 'Ministerio de Justicia', 'licitacion_publica', 18000000, '2026-04-07 11:00:00+00', '2026-05-17 15:00:00+00', 'https://comprar.gob.ar/PLIEGO/licitacion/OC-2026-0008', 0.45, NULL),
('OC-2026-0009', 'Mantenimiento de aire acondicionado sala de servidores', 'Servicio de mantenimiento preventivo y correctivo de sistemas de climatización', 'SENASA', 'contratacion_directa', 800000, '2026-04-15 08:00:00+00', '2026-04-27 14:00:00+00', 'https://comprar.gob.ar/PLIEGO/licitacion/OC-2026-0009', 0.25, NULL),
('OC-2026-0010', 'Provisión de insumos de oficina y toner', 'Insumos de oficina varios y cartuchos de toner para impresoras', 'Ministerio de Interior', 'contratacion_directa', 500000, '2026-04-16 10:00:00+00', '2026-05-22 17:00:00+00', 'https://comprar.gob.ar/PLIEGO/licitacion/OC-2026-0010', 0.15, NULL);

-- Tender matches
-- Get the IDs of the inserted tenders and alerts
-- Assuming the tenders are inserted in order, we can reference them by external_id
INSERT INTO tender_matches (tender_id, alert_id, organization_id, status, match_score, matched_keywords) VALUES
((SELECT id FROM public_tenders WHERE external_id = 'OC-2026-0001'), (SELECT id FROM tender_alerts WHERE name = 'Licencias Microsoft'), '550e8400-e29b-41d4-a716-446655440000', 'new', 0.95, ARRAY['microsoft', 'office', '365']),
((SELECT id FROM public_tenders WHERE external_id = 'OC-2026-0002'), (SELECT id FROM tender_alerts WHERE name = 'Desarrollo de sistemas'), '550e8400-e29b-41d4-a716-446655440000', 'new', 0.88, ARRAY['desarrollo', 'sistema']),
((SELECT id FROM public_tenders WHERE external_id = 'OC-2026-0003'), (SELECT id FROM tender_alerts WHERE name = 'Infraestructura IT'), '550e8400-e29b-41d4-a716-446655440000', 'new', 0.72, ARRAY['servidor']),
((SELECT id FROM public_tenders WHERE external_id = 'OC-2026-0004'), (SELECT id FROM tender_alerts WHERE name = 'Desarrollo de sistemas'), '550e8400-e29b-41d4-a716-446655440000', 'interested', 0.91, ARRAY['sistema']),
((SELECT id FROM public_tenders WHERE external_id = 'OC-2026-0005'), (SELECT id FROM tender_alerts WHERE name = 'Infraestructura IT'), '550e8400-e29b-41d4-a716-446655440000', 'interested', 0.65, ARRAY['networking', 'cisco']),
((SELECT id FROM public_tenders WHERE external_id = 'OC-2026-0006'), (SELECT id FROM tender_alerts WHERE name = 'Infraestructura IT'), '550e8400-e29b-41d4-a716-446655440000', 'preparing', 0.85, ARRAY['seguridad']),
((SELECT id FROM public_tenders WHERE external_id = 'OC-2026-0007'), (SELECT id FROM tender_alerts WHERE name = 'Infraestructura IT'), '550e8400-e29b-41d4-a716-446655440000', 'submitted', 0.78, ARRAY['cloud', 'hosting']),
((SELECT id FROM public_tenders WHERE external_id = 'OC-2026-0008'), (SELECT id FROM tender_alerts WHERE name = 'Licencias Microsoft'), '550e8400-e29b-41d4-a716-446655440000', 'discarded', 0.45, ARRAY['office']);