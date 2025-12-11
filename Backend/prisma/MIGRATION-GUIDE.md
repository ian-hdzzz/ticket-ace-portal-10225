# Database Migration Guide: Supabase to Backend

This guide walks you through migrating your CEA database from Supabase to your backend PostgreSQL instance.

## 📋 Pre-Migration Checklist

- [ ] Backup your Supabase database
- [ ] Ensure your `DATABASE_URL` in `.env` points to the new database
- [ ] Install dependencies: `npm install`
- [ ] Verify Prisma CLI is available: `npx prisma --version`

## 🔄 Migration Steps

### Step 1: Create Base Schema

Run the Prisma migration to create all tables, enums, and basic indexes:

```bash
npx prisma migrate dev --name initial_cea_schema
```

Or if you prefer to skip migration history:

```bash
npx prisma db push
```

This creates:
- ✅ All tables (customers, tickets, meter_readings, etc.)
- ✅ All enums (ticket_status, priority_level, etc.)
- ✅ Basic indexes
- ✅ Foreign key constraints
- ✅ Unique constraints

### Step 2: Add Specialized Indexes

Apply PostgreSQL-specific indexes that Prisma doesn't support:

```bash
psql $DATABASE_URL -f Backend/prisma/migrations/specialized-indexes.sql
```

Or using a database client, run the SQL from: `Backend/prisma/migrations/specialized-indexes.sql`

This creates:
- ✅ GIN indexes for JSONB metadata search
- ✅ Trigram index for fuzzy customer name search
- ✅ pg_trgm extension

### Step 3: Add Trigger Functions

Apply database triggers for auto-generation features:

```bash
psql $DATABASE_URL -f Backend/prisma/migrations/trigger-functions.sql
```

Or using a database client, run the SQL from: `Backend/prisma/migrations/trigger-functions.sql`

This creates:
- ✅ Auto-generate ticket folio (CEA-2025-00001)
- ✅ Auto-calculate SLA deadlines

### Step 4: Export Data from Supabase

In Supabase SQL Editor, run these SELECT queries and export to CSV:

#### Tables WITH Data (export these):

```sql
-- 1. Export customers
SELECT * FROM cea.customers;

-- 2. Export tickets
SELECT * FROM cea.tickets;

-- 3. Export n8n_chat_historial_bot
SELECT * FROM cea.n8n_chat_historial_bot;

-- 4. Export users (if migrating)
SELECT * FROM cea.users;

-- 5. Export users_roles (if migrating)
SELECT * FROM cea.users_roles;

-- 6. Export roles_privileges (if migrating)
SELECT * FROM cea.roles_privileges;

-- 7. Export privileges (if migrating)
SELECT * FROM cea.privileges;

-- 8. Export roles (if migrating)
SELECT * FROM cea.roles;
```

#### Tables WITHOUT Data (skip these):

According to `supa-tables-with-data.txt`, these tables are empty:
- ❌ customer_media
- ❌ meter_readings
- ❌ media_assets
- ❌ ticket_clarifications
- ❌ ticket_leaks
- ❌ payment_records
- ❌ contract_changes
- ❌ sla_config
- ❌ ticket_templates
- ❌ canned_responses
- ❌ ticket_conversations
- ❌ ticket_media

### Step 5: Import Data (Seed Script)

Create a seed script to import your CSV data. Import in this order to respect foreign keys:

```typescript
// Backend/prisma/seed.ts

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Import customers (no dependencies)
  await importCustomers();

  // 2. Import tickets (depends on customers)
  await importTickets();

  // 3. Import n8n chat history (no dependencies)
  await importN8nChatHistory();

  // Add more import functions as needed...

  console.log('✅ Database seeded successfully!');
}

async function importCustomers() {
  const csvPath = path.join(__dirname, 'data', 'customers.csv');
  if (!fs.existsSync(csvPath)) {
    console.log('⏭️  Skipping customers - file not found');
    return;
  }

  const records = parse(fs.readFileSync(csvPath), {
    columns: true,
    skip_empty_lines: true,
  });

  console.log(`📥 Importing ${records.length} customers...`);

  for (const record of records) {
    await prisma.customer.create({
      data: {
        id: record.id,
        numeroContrato: record.numero_contrato,
        nombreTitular: record.nombre_titular,
        email: record.email,
        telefono: record.telefono,
        whatsapp: record.whatsapp,
        direccionServicio: record.direccion_servicio,
        colonia: record.colonia,
        codigoPostal: record.codigo_postal,
        municipio: record.municipio,
        reciboDigital: record.recibo_digital === 'true',
        firstInteractionChannel: record.first_interaction_channel,
        createdAt: record.created_at ? new Date(record.created_at) : undefined,
        updatedAt: record.updated_at ? new Date(record.updated_at) : undefined,
      },
    });
  }

  console.log('✅ Customers imported');
}

async function importTickets() {
  const csvPath = path.join(__dirname, 'data', 'tickets.csv');
  if (!fs.existsSync(csvPath)) {
    console.log('⏭️  Skipping tickets - file not found');
    return;
  }

  const records = parse(fs.readFileSync(csvPath), {
    columns: true,
    skip_empty_lines: true,
  });

  console.log(`📥 Importing ${records.length} tickets...`);

  for (const record of records) {
    await prisma.ticket.create({
      data: {
        id: record.id,
        folio: record.folio,
        customerId: record.customer_id || null,
        serviceType: record.service_type,
        ticketType: record.ticket_type,
        status: record.status || 'abierto',
        priority: record.priority || 'media',
        channel: record.channel,
        titulo: record.titulo,
        descripcion: record.descripcion,
        assignedTo: record.assigned_to || null,
        assignedAt: record.assigned_at ? new Date(record.assigned_at) : null,
        escalatedTo: record.escalated_to || null,
        escalatedAt: record.escalated_at ? new Date(record.escalated_at) : null,
        resolutionNotes: record.resolution_notes,
        resolvedAt: record.resolved_at ? new Date(record.resolved_at) : null,
        closedAt: record.closed_at ? new Date(record.closed_at) : null,
        slaDeadline: record.sla_deadline ? new Date(record.sla_deadline) : null,
        slaBreached: record.sla_breached === 'true',
        tags: record.tags ? JSON.parse(record.tags) : null,
        metadata: record.metadata ? JSON.parse(record.metadata) : {},
        clientName: record.client_name,
        contractNumber: record.contract_number ? parseInt(record.contract_number) : null,
        createdAt: record.created_at ? new Date(record.created_at) : undefined,
        updatedAt: record.updated_at ? new Date(record.updated_at) : undefined,
      },
    });
  }

  console.log('✅ Tickets imported');
}

async function importN8nChatHistory() {
  const csvPath = path.join(__dirname, 'data', 'n8n_chat_historial_bot.csv');
  if (!fs.existsSync(csvPath)) {
    console.log('⏭️  Skipping n8n chat history - file not found');
    return;
  }

  const records = parse(fs.readFileSync(csvPath), {
    columns: true,
    skip_empty_lines: true,
  });

  console.log(`📥 Importing ${records.length} chat messages...`);

  for (const record of records) {
    await prisma.n8nChatHistorialBot.create({
      data: {
        id: parseInt(record.id),
        sessionId: record.session_id,
        message: JSON.parse(record.message),
      },
    });
  }

  console.log('✅ N8n chat history imported');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Run the seed script:

```bash
npx tsx Backend/prisma/seed.ts
```

### Step 6: Verify Migration

Generate Prisma Client and verify the migration:

```bash
# Generate Prisma Client
npx prisma generate

# Open Prisma Studio to browse data
npx prisma studio

# Run a test query
npx prisma db execute --stdin <<< "SELECT COUNT(*) FROM cea.customers;"
```

## ⚠️ Important Notes

### Computed Columns

The `meter_readings.consumo_m3` field is a GENERATED/COMPUTED column. **Do NOT include it in your CSV imports**. PostgreSQL will automatically calculate it as:

```sql
consumo_m3 = lectura_actual - COALESCE(lectura_anterior, 0)
```

### UUID Preservation

Make sure your seed script preserves the original UUIDs from Supabase. This is critical for maintaining data relationships.

### Timestamp Fields

- `createdAt` and `updatedAt` in Customer and Ticket now use Prisma's `@updatedAt` directive
- On import, preserve the original timestamps
- After import, Prisma will automatically manage `updatedAt` going forward

### Views

The views (`v_ticket_dashboard`, `v_ticket_statistics`) are marked as `@@ignore` in Prisma. They exist in the database but Prisma won't manage them. You may need to recreate them manually after migration if they don't persist.

## 🧪 Testing the Migration

After migration, test these critical features:

```typescript
// Test 1: Create a new ticket (should auto-generate folio)
const ticket = await prisma.ticket.create({
  data: {
    customerId: '<some-customer-id>',
    serviceType: 'reportes_fugas',
    ticketType: 'FUG',
    channel: 'whatsapp',
    titulo: 'Test ticket',
    priority: 'urgente',
  },
});
console.log('Generated folio:', ticket.folio); // Should be: CEA-2025-00001

// Test 2: Check SLA deadline was set
console.log('SLA deadline:', ticket.slaDeadline); // Should be auto-calculated

// Test 3: Update a customer (should auto-update updatedAt)
await prisma.customer.update({
  where: { id: '<some-customer-id>' },
  data: { telefono: '4421234567' },
});
// Check that updatedAt changed automatically
```

## 📚 Data Import Order Reference

Import tables in this exact order:

1. ✅ customers (no dependencies)
2. ✅ media_assets (no dependencies)
3. ✅ sla_config (no dependencies)
4. ✅ ticket_templates (no dependencies)
5. ✅ canned_responses (no dependencies)
6. ✅ tickets (depends on customers)
7. ✅ meter_readings (depends on customers, tickets, media_assets)
8. ✅ customer_media (depends on customers, media_assets)
9. ✅ ticket_media (depends on tickets, media_assets)
10. ✅ ticket_conversations (depends on tickets)
11. ✅ ticket_clarifications (depends on tickets)
12. ✅ ticket_leaks (depends on tickets)
13. ✅ payment_records (depends on tickets, customers)
14. ✅ contract_changes (depends on tickets)
15. ✅ n8n_chat_historial_bot (no dependencies)

## 🆘 Troubleshooting

### Issue: Foreign key constraint violations

**Solution:** Make sure you're importing in the correct order. Import parent tables before child tables.

### Issue: UUID format errors

**Solution:** Ensure UUIDs are properly formatted strings. PostgreSQL expects: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

### Issue: Triggers not firing

**Solution:** Verify triggers were created in the correct schema (cea). Run:

```sql
SELECT * FROM information_schema.triggers WHERE trigger_schema = 'cea';
```

### Issue: Decimal values not importing correctly

**Solution:** Make sure you have `decimal.js` installed and configured. Prisma uses Decimal objects for numeric types.

```bash
npm install @prisma/client
```

## 🎉 Post-Migration

After successful migration:

1. ✅ Update your application's database connection to point to the new database
2. ✅ Test all critical user flows
3. ✅ Monitor for any data inconsistencies
4. ✅ Keep the Supabase backup for at least 30 days
5. ✅ Document any customizations made during migration

---

**Need help?** Check the Prisma docs: https://www.prisma.io/docs

