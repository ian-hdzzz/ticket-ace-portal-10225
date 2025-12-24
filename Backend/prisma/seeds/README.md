# Database Seeding Guide

## Overview

This directory contains all database seed files for the CEA backend. Seeds are executed in a specific order to maintain referential integrity.

## Seed Files

1. **`privileges-seed.ts`** - Creates all system privileges (26 total)
2. **`roles-seed.ts`** - Creates organizational roles (28 total)
3. **`users-seed.ts`** - Creates initial users including admin accounts

## Running Seeds

### Run All Seeds (Recommended)

From the Backend directory, run:

```bash
npm run prisma:seed
```

This will execute all seed files in the correct order via `run-seeds.ts`.

### Run Individual Seeds

If you need to run a specific seed file:

```bash
# Privileges only
npx tsx prisma/seeds/privileges-seed.ts

# Roles only
npx tsx prisma/seeds/roles-seed.ts

# Users only
npx tsx prisma/seeds/users-seed.ts
```

## Default Users

The system creates the following test users:

| Email | Password | Nombre | Temp Password |
|-------|----------|--------|---------------|
| andrezala03@gmail.com | admin123 | André Zala | ✅ Yes |
| admin@cea.gob.mx | admin123 | Administrador CEA | ❌ No |
| gerente@cea.gob.mx | user123 | Gerente General | ❌ No |
| operador@cea.gob.mx | user123 | Operador de Sistema | ❌ No |
| callcenter@cea.gob.mx | user123 | Agente Call Center | ❌ No |

⚠️ **Important**: Change these passwords in production!

## Privileges (26 total)

1. acceso_dashboard - Acceso a dashboard
2. generar_reportes - Generar reportes/gráficos
3. descargar_reportes - Descargar reportes
4. compartir_reportes - Compartir reportes
5. ver_tickets - Ver Tickets
6. crear_ticket - Crear Ticket
7. tomar_ticket - Tomar ticket
8. editar_ticket - Editar Ticket
9. cerrar_ticket - Cerrar Ticket
10. reabrir_ticket - Reabrir Ticket
11. asignar_ticket - Asignar Ticket
12. reasignar_ticket - Reasignar Ticket
13. priorizar_ticket - Priorizar Ticket
14. ver_historial_conversacion - Ver historial de conversación
15. adjuntar_archivos - Adjuntar Archivos
16. crear_orden - Crear Orden
17. crear_agente - Crear Agente
18. editar_agente - Editar Agente
19. eliminar_agente - Eliminar Agente
20. aprobar_usuario - Aprobar Usuario
21. editar_info_usuario - Editar info usuario
22. eliminar_usuario - Eliminar Usuario
23. asignar_roles - Asignar Roles
24. ver_numero_contratos - Ver número de contratos
25. ver_lecturas - Ver lecturas
26. ver_deuda - Ver deuda

## Roles (28 total)

Organized by hierarchical level:

**Nivel 1 (Máxima Autoridad):**
- Administrador
- Coordinación General Ejecutiva

**Nivel 2 (Gerencias):**
- Gerencia
- Gerencia de Control y Seguimiento de Factibilidades
- Gerencia de Facturación
- Gerencia de Infraestructura Informática y Seg. de la Info.
- Gerencia de Ingeniería de Operación
- Gerencia de Medición de Consumos
- Gerencia de Operación y Mantenimiento PTAR
- Gerencia de Programas de Inversión
- Gerencia de Regularización de Asentamientos e Inspección
- Gerencia de Tesorería
- Gerencia Jurídica de Recuperación de Cartera
- Gerencia Comercial
- Gerencia de Administración de Proyectos
- Gerencia de Cartera Vencida Administrativa
- Gerencia de Contratación y Padrón de Usuarios
- Gerencia de Control Sanitario y Pluvial

**Nivel 3 (Subgerencias y Coordinaciones):**
- Subgerencia de Contratos
- Subgerencia de Factibilidades
- Subgerencia de Inspección y Vigilancia
- Subgerencia de Lecturas
- Subgerencia de Limitación y Reconexión de Servicio
- Subgerencia de Servicio al Cliente
- Subgerencia de Soporte Técnico
- Coordinación de Planeación y Proyectos Técnicos
- Coordinación de Vinculación Comercial y Servicio al Cliente

**Nivel 4 (Operacional):**
- Call Center Externo

## Adding New Seeds

1. Create a new seed file in this directory (e.g., `new-entity-seed.ts`)
2. Follow the pattern from existing seed files
3. Add the seed to `run-seeds.ts` in the correct order
4. Test by running `npm run prisma:seed`

## Seed File Template

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed de [ENTITY]...");

  // Your seeding logic here

  console.log("🎉 Seed de [ENTITY] completado exitosamente!");
}

main()
  .catch((e) => {
    console.error("❌ Error en seed de [ENTITY]:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

## Troubleshooting

### "Table does not exist"
Run: `npx prisma db push` to create tables from schema

### "Unique constraint violation"
The seeds use `upsert` to avoid duplicates. This error shouldn't occur.

### "Foreign key constraint"
Check that seeds are running in the correct order (privileges → roles → users)

