# Arquitectura del CRM ARIA

## Visión General
Sistema modular de gestión de relaciones con clientes (CRM) que combina:
- Procesamiento de voz mediante Web Speech API y Groq API (Llama 3.3 70B)
- Gestión de pipeline visual con Recharts
- Integraciones bidireccionales con sistemas externos (Zoho CRM, Salesforce)
- Automatización de tareas basada en intents y reglas de negocio

## Módulos Principales

### 1. Autenticación y Gestión de Usuarios
- **Tecnología**: Supabase Auth
- **Roles**: admin, vendedor
- **Funcionalidades**: login/registro, recuperación de contraseña, gestión de sesiones

### 2. Gestión de Contactos y Oportunidades
- **Modelos de datos**: contacts, deals, activities
- **Operaciones**: CRUD completo, importación/exportación
- **Integraciones**: 
  - Zoho CRM ↔ Supabase (syncContacts, upsertContact)
  - Salesforce ↔ Supabase (syncLeads, upsertLead)

### 3. Procesamiento de Voz y NLP
- **Entrada**: Web Speech API (grabación y transcripción)
- **Procesamiento**: Groq API (interpretación de intents)
- **Salida**: Mapeo a acciones en el pipeline

### 4. Motor de Automatización
- **Reglas de negocio**: triggers basados en intents y estado del pipeline
- **Acciones**: actualización de estados, creación de tareas, notificaciones
- **Persistencia**: operaciones en Supabase con supabase-js

### 5. Reporting y Analítica
- **Visualizaciones**: Recharts (barras, pies, funnel)
- **Reportes automáticos**: generación programada, exportación PDF/CSV
- **Alertas**: notificaciones por email o Slack

### 6. Integración de Terceros
- **Zoho CRM**: sincronización de contactos, deals, actividades
- **Salesforce**: syncLeads, syncAccounts, syncOpportunities
- **Extensibilidad**: arquitectura basada en plugins para futuras integraciones

## Diagrama de Componentes (texto)

```
[Voice Input] --> [Speech-to-Text] --> [Groq NLP] --> [Intent Engine]
                                   |
                                   v
[Auth Service] --> [Contact Management] --> [Deal Management] --> [Pipeline DB]
                                   |
                                   v
                         [Reporting Engine] <-- [Analytics DB]
                                   |
                                   v
                         [Integration Layer] --> [Zoho/Salesforce APIs]
```

## Tecnologías
- **Frontend**: React 18 + Vite
- **Backend**: Supabase (DB + Auth + Functions)
- **IA**: Groq API (Llama 3.3 70B)
- **Visualización**: Recharts
- **Integraciones**: REST APIs, OAuth2
- **Despliegue**: Vercel (preview) / GitHub (CI/CD)

## Flujo de Procesamiento de Voz
1. Usuario habla en la interfaz
2. Web Speech API transcribe audio a texto
3. Texto enviado a Groq API para análisis de intent
4. Intent interpretado se mapea a acción (ej: "agregar contacto", "actualizar estado")
5. Acción ejecutada en el módulo correspondiente
6. Actualización en el pipeline reflejada en Recharts

## Roadmap de Desarrollo
- [x] Configuración base del proyecto
- [ ] Implementar módulo de autenticación
- [ ] Desarrollar motor de procesamiento de voz
- [ ] Crear integraciones con Zoho y Salesforce
- [ ] Diseñar panel de reporting avanzado
- [ ] Implementar sistema de alertas automatizadas
- [ ] Optimizar NLP para intents personalizados