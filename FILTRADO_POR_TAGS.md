# 🏷️ Sistema de Filtrado por Tags: Solo Email si tiene "necesita_agente"

## ✅ CAMBIOS REALIZADOS

### 1. **Backend - Validación de Tags** ✅
**Archivo:** `/Backend/src/routes/email.ts`

El webhook ahora **verifica** que el ticket tenga el tag `"necesita_agente"` antes de enviar email:

```typescript
// 🏷️ FILTRO: Solo enviar email si el ticket tiene el tag "necesita_agente"
const tags = record.tags || [];
const needsAgent = Array.isArray(tags) 
  ? tags.includes('necesita_agente')
  : tags === 'necesita_agente';

if (!needsAgent) {
  console.log('⏭️  Ticket sin tag "necesita_agente" - NO se enviará email');
  return res.json({ 
    success: true, 
    message: 'Ticket recibido pero no requiere notificación',
    skipped: true
  });
}

console.log('✅ Ticket tiene tag "necesita_agente" - Procesando email...');
```

### 2. **Scripts SQL Creados** ✅

- ✅ `VERIFICAR_TAGS_TICKETS.sql` - Verifica si existe columna tags
- ✅ `AGREGAR_COLUMNA_TAGS.sql` - Agrega columna tags si no existe

---

## 🚀 PASOS PARA IMPLEMENTAR

### PASO 1: Verificar si existe columna 'tags'

Ejecuta en **Supabase SQL Editor**:

```sql
-- Ver si existe columna tags
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'cea'
  AND table_name = 'tickets'
  AND column_name = 'tags';
```

**Resultado esperado:**
- ✅ Si devuelve una fila → La columna YA existe (ir a PASO 3)
- ❌ Si no devuelve nada → Columna NO existe (ir a PASO 2)

---

### PASO 2: Agregar columna 'tags' (si no existe)

Ejecuta TODO el contenido de `/Backend/AGREGAR_COLUMNA_TAGS.sql` en Supabase:

```sql
-- Agregar columna tags
ALTER TABLE cea.tickets 
ADD COLUMN tags text[] DEFAULT '{}';
```

Verifica que se haya creado:
```sql
SELECT id, folio, tags FROM cea.tickets LIMIT 5;
```

---

### PASO 3: Crear ticket de prueba CON tag

```sql
-- 🧪 TEST 1: Ticket CON tag "necesita_agente" (DEBE enviar email)
INSERT INTO cea.tickets (
  folio,
  titulo,
  descripcion,
  assigned_to,
  priority,
  status,
  channel,
  service_type,
  ticket_type,
  tags  -- 🏷️ IMPORTANTE: Incluir tags
) VALUES (
  'TKT-CON-TAG-001',
  'Cliente necesita asesor especializado',
  'El cliente reporta problemas complejos que requieren atención personalizada',
  'uuid-del-asesor-aqui',  -- Reemplazar con UUID real de auth.users
  'high',
  'open',
  'telefono',
  'tecnico',
  'incidencia',
  ARRAY['necesita_agente']  -- 🎯 TAG QUE ACTIVA EL EMAIL
);
```

**Resultado esperado:**
- ✅ Email enviado al asesor
- ✅ Log en backend: `✅ Ticket tiene tag "necesita_agente" - Procesando email...`

---

### PASO 4: Crear ticket de prueba SIN tag

```sql
-- 🧪 TEST 2: Ticket SIN tag (NO debe enviar email)
INSERT INTO cea.tickets (
  folio,
  titulo,
  descripcion,
  assigned_to,
  priority,
  status,
  channel,
  service_type,
  ticket_type,
  tags  -- 🚫 Array vacío = SIN TAGS
) VALUES (
  'TKT-SIN-TAG-001',
  'Consulta general',
  'Cliente hace pregunta simple que no requiere email',
  'uuid-del-asesor-aqui',
  'low',
  'open',
  'app',
  'consulta',
  'informacion',
  ARRAY[]::text[]  -- Sin tags
);
```

**Resultado esperado:**
- ⏭️ Email NO enviado
- ✅ Log en backend: `⏭️ Ticket sin tag "necesita_agente" - NO se enviará email`

---

## 📊 COMPORTAMIENTO DEL SISTEMA

| Tags del Ticket | ¿Envía Email? | Razón |
|-----------------|---------------|-------|
| `['necesita_agente']` | ✅ SÍ | Tiene el tag requerido |
| `['necesita_agente', 'urgente']` | ✅ SÍ | Incluye el tag entre otros |
| `['urgente']` | ❌ NO | No tiene "necesita_agente" |
| `[]` (vacío) | ❌ NO | Sin tags |
| `null` | ❌ NO | Tags no definidos |

---

## 🔍 VERIFICAR LOGS

### Backend (Terminal donde corre `npm run dev`)

**Si el ticket TIENE el tag:**
```bash
🔔 Webhook recibido - Nuevo ticket creado
✅ Ticket tiene tag "necesita_agente" - Procesando email...
📧 [DESARROLLO] Email se enviará a: ianhdez2020@gmail.com
📬 Preparando email con datos del ticket:
   - Destinatario: ianhdez2020@gmail.com (Asesor)
   - Folio: TKT-CON-TAG-001
✅ Email enviado exitosamente
```

**Si el ticket NO tiene el tag:**
```bash
🔔 Webhook recibido - Nuevo ticket creado
⏭️  Ticket sin tag "necesita_agente" - NO se enviará email
   Tags recibidos: []
```

### Supabase Logs

```sql
-- Ver logs recientes del trigger
SELECT * FROM pg_stat_statements ORDER BY calls DESC LIMIT 10;
```

---

## 🛠️ FUNCIONES AUXILIARES

### Agregar tag a ticket existente

```sql
-- Actualizar ticket para agregar tag
UPDATE cea.tickets
SET tags = array_append(tags, 'necesita_agente')
WHERE folio = 'TKT-001'
  AND NOT ('necesita_agente' = ANY(tags));  -- Evitar duplicados
```

### Remover tag de ticket

```sql
UPDATE cea.tickets
SET tags = array_remove(tags, 'necesita_agente')
WHERE folio = 'TKT-001';
```

### Ver tickets con tag específico

```sql
SELECT id, folio, titulo, tags, assigned_to
FROM cea.tickets
WHERE 'necesita_agente' = ANY(tags)
ORDER BY created_at DESC;
```

### Ver tickets SIN tag

```sql
SELECT id, folio, titulo, tags
FROM cea.tickets
WHERE NOT ('necesita_agente' = ANY(tags))
   OR tags IS NULL
   OR tags = ARRAY[]::text[]
ORDER BY created_at DESC;
```

---

## 🎯 CASOS DE USO

### Caso 1: Ticket desde App/Web
```typescript
// Frontend - Crear ticket NORMAL (sin email)
await createTicket({
  titulo: 'Consulta de factura',
  descripcion: 'Quiero ver mi última factura',
  channel: 'app',
  tags: []  // Sin tags = No envía email
});
```

### Caso 2: Ticket que necesita asesor
```typescript
// Frontend - Ticket que REQUIERE atención de asesor
await createTicket({
  titulo: 'Problema técnico complejo',
  descripcion: 'Mi medidor no registra consumo',
  channel: 'telefono',
  tags: ['necesita_agente']  // 🎯 Con tag = Envía email al asesor
});
```

### Caso 3: Desde Chatwoot (automático)
```typescript
// Webhook de Chatwoot → Backend
// Si la conversación requiere escalamiento:
await createTicket({
  titulo: conversation.subject,
  descripcion: conversation.messages,
  channel: 'chat',
  tags: ['necesita_agente', 'desde_chatwoot']  // Tags múltiples
});
```

---

## 🔧 TROUBLESHOOTING

### Problema: Emails se siguen enviando aunque no haya tag

**Causa:** Backend no reiniciado después del cambio

**Solución:**
```bash
# Detener backend (Ctrl+C)
cd Backend
npm run dev  # Reiniciar
```

---

### Problema: Columna 'tags' no existe

**Error en backend:**
```
column "tags" does not exist
```

**Solución:**
```sql
-- Ejecutar en Supabase
ALTER TABLE cea.tickets ADD COLUMN tags text[] DEFAULT '{}';
```

---

### Problema: Tag existe pero no se detecta

**Causa:** Formato incorrecto de tags

**Verificar:**
```sql
-- Ver formato real de tags
SELECT folio, tags, pg_typeof(tags) as tipo
FROM cea.tickets
WHERE folio = 'TKT-001';
```

**Solución:**
```sql
-- Si tags es texto simple (mal formato)
UPDATE cea.tickets
SET tags = ARRAY[tags]  -- Convertir a array
WHERE pg_typeof(tags) = 'text'::regtype;
```

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

- [ ] Columna `tags` existe en tabla `cea.tickets`
- [ ] Columna es tipo `text[]` (array)
- [ ] Backend actualizado con validación de tags
- [ ] Backend reiniciado (`npm run dev`)
- [ ] Trigger de Supabase activo
- [ ] Ticket de prueba CON tag creado
- [ ] Email recibido para ticket CON tag
- [ ] Ticket de prueba SIN tag creado
- [ ] Email NO recibido para ticket SIN tag
- [ ] Logs de backend muestran mensajes correctos

---

## 📝 RESUMEN

**ANTES:**
- ❌ Todos los tickets enviaban email al crear

**AHORA:**
- ✅ Solo tickets con tag `"necesita_agente"` envían email
- ✅ Tickets normales no generan notificaciones
- ✅ Control granular sobre cuándo notificar

**BENEFICIOS:**
- 🎯 Menos spam de emails
- 🎯 Asesores solo reciben tickets importantes
- 🎯 Flexibilidad para agregar más tags en el futuro

---

## 🚀 PRÓXIMOS PASOS

1. ✅ Implementar columna tags (URGENTE)
2. ✅ Probar con tickets reales
3. ⏳ Integrar con Frontend para agregar tags desde UI
4. ⏳ Agregar más tags: `['urgente', 'vip', 'escalado']`
5. ⏳ Dashboard para ver tickets por tag

---

## 📞 SOPORTE

Si algo no funciona:
1. Verifica logs del backend
2. Verifica que columna tags exista
3. Verifica formato de tags (debe ser array)
4. Consulta `VERIFICAR_TAGS_TICKETS.sql`
