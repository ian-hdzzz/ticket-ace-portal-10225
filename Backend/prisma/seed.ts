import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
// import * as path from 'path';

import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { parse } from 'csv-parse/sync';

const prisma = new PrismaClient();

/**
 * Main seed function - imports data from CSV files exported from Supabase
 * 
 * IMPORTANT: This seed preserves original IDs (UUIDs and integers) to maintain
 * data relationships and integrity from the original database.
 */
async function main() {
  console.log('🌱 Starting database seed from Supabase exports...\n');

  try {
    // Import in dependency order
    // await importCustomers();
    await importTickets();
    // await importN8nChatHistory();

    // Reset sequences for auto-increment tables
    // await resetSequences();

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Customers: ${await prisma.customer.count()}`);
    console.log(`   Tickets: ${await prisma.ticket.count()}`);
    console.log(`   N8n Chat Messages: ${await prisma.n8nChatHistorialBot.count()}`);
  } catch (error) {
    console.error('\n❌ Seed failed:', error);
    throw error;
  }
}

/**
 * Import customers from CSV
 * Preserves original UUIDs
 */
async function importCustomers() {
  const csvPath = path.join(__dirname, 'csv', 'supabase_migration_customers.csv');
  
  if (!fs.existsSync(csvPath)) {
    console.log('⏭️  Skipping customers - file not found');
    return;
  }

  const fileContent = fs.readFileSync(csvPath, 'utf-8');
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    relax_quotes: true,
    relax_column_count: true,
  });

  console.log(`📥 Importing ${records.length} customers...`);

  let imported = 0;
  let skipped = 0;

  for (const record of records) {
    try {
      await prisma.customer.create({
        data: {
          // Preserve original UUID
          id: record.id,
          
          // Basic fields
          numeroContrato: parseNullableString(record.numero_contrato),
          nombreTitular: parseNullableString(record.nombre_titular),
          email: parseNullableString(record.email),
          telefono: parseNullableString(record.telefono),
          whatsapp: parseNullableString(record.whatsapp),
          
          // Address fields
          direccionServicio: parseNullableString(record.direccion_servicio),
          colonia: parseNullableString(record.colonia),
          codigoPostal: parseNullableString(record.codigo_postal),
          municipio: parseNullableString(record.municipio) || 'Querétaro',
          
          // Boolean fields
          reciboDigital: record.recibo_digital === 'true' || record.recibo_digital === 't',
          
          // Metadata
          firstInteractionChannel: parseNullableString(record.first_interaction_channel),
          
          // Timestamps - preserve original
          createdAt: parseNullableDate(record.created_at) || new Date(),
          updatedAt: parseNullableDate(record.updated_at) || new Date(),
        },
      });
      imported++;
    } catch (error: any) {
      console.error(`   ⚠️  Error importing customer ${record.id}:`, error.message);
      skipped++;
    }
  }

  console.log(`   ✅ Imported ${imported} customers${skipped > 0 ? ` (${skipped} skipped)` : ''}`);
}

/**
 * Import tickets from CSV
 * Preserves original UUIDs and relationships
 */
async function importTickets() {
  const csvPath = path.join(__dirname, 'csv', 'supabase_migration_tickets.csv');
  
  if (!fs.existsSync(csvPath)) {
    console.log('⏭️  Skipping tickets - file not found');
    return;
  }

  const fileContent = fs.readFileSync(csvPath, 'utf-8');
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    relax_quotes: true,
    relax_column_count: true,
  });

  console.log(`📥 Importing ${records.length} tickets...`);

  let imported = 0;
  let skipped = 0;

  for (const record of records) {
    try {
      await prisma.ticket.create({
        data: {
          // Preserve original UUID
          id: record.id,
          
          // Basic fields
          folio: record.folio,
          customerId: parseNullableString(record.customer_id),
          serviceType: record.service_type as any,
          ticketType: record.ticket_type as any,
          status: (record.status || 'abierto') as any,
          priority: (record.priority || 'media') as any,
          channel: record.channel as any,
          titulo: record.titulo,
          descripcion: parseNullableString(record.descripcion),
          
          // Assignment fields
          assignedTo: parseNullableString(record.assigned_to),
          assignedAt: parseNullableDate(record.assigned_at),
          escalatedTo: parseNullableString(record.escalated_to),
          escalatedAt: parseNullableDate(record.escalated_at),
          
          // Resolution fields
          resolutionNotes: parseNullableString(record.resolution_notes),
          resolvedAt: parseNullableDate(record.resolved_at),
          closedAt: parseNullableDate(record.closed_at),
          
          // SLA fields
          slaDeadline: parseNullableDate(record.sla_deadline),
          slaBreached: record.sla_breached === 'true' || record.sla_breached === 't',
          
          // Array and JSON fields
          tags: record.tags ? parseJsonSafe(record.tags, []) : [],
          metadata: record.metadata ? parseJsonSafe(record.metadata, {}) : {},
          
          // Additional fields
          clientName: parseNullableString(record.client_name),
          contractNumber: parseNullableInt(record.contract_number),
          
          // Timestamps - preserve original
          createdAt: parseNullableDate(record.created_at) || new Date(),
          updatedAt: parseNullableDate(record.updated_at) || new Date(),
        },
      });
      imported++;
    } catch (error: any) {
      console.error(`   ⚠️  Error importing ticket ${record.folio}:`, error.message);
      skipped++;
    }
  }

  console.log(`   ✅ Imported ${imported} tickets${skipped > 0 ? ` (${skipped} skipped)` : ''}`);
}

/**
 * Import N8n chat history from CSV
 * Preserves original integer IDs
 */
async function importN8nChatHistory() {
  const csvPath = path.join(__dirname, 'csv', 'supabase_migration_n8n_chat_history.csv');
  
  if (!fs.existsSync(csvPath)) {
    console.log('⏭️  Skipping N8n chat history - file not found');
    return;
  }

  const fileContent = fs.readFileSync(csvPath, 'utf-8');
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    relax_quotes: true,
    relax_column_count: true,
  });

  console.log(`📥 Importing ${records.length} N8n chat messages...`);

  let imported = 0;
  let skipped = 0;

  for (const record of records) {
    try {
      await prisma.n8nChatHistorialBot.create({
        data: {
          // Preserve original integer ID
          id: parseInt(record.id),
          sessionId: record.session_id,
          message: parseJsonSafe(record.message, {}),
        },
      });
      imported++;
    } catch (error: any) {
      console.error(`   ⚠️  Error importing chat message ${record.id}:`, error.message);
      skipped++;
    }
  }

  console.log(`   ✅ Imported ${imported} chat messages${skipped > 0 ? ` (${skipped} skipped)` : ''}`);
}

/**
 * Reset auto-increment sequences to prevent ID collisions
 * This is critical after importing data with explicit IDs
 */
async function resetSequences() {
  console.log('\n🔄 Resetting auto-increment sequences...');

  try {
    // Reset N8n chat history sequence
    await prisma.$executeRawUnsafe(`
      SELECT setval(
        'public.n8n_chat_historial_bot_id_seq',
        COALESCE((SELECT MAX(id) FROM public.n8n_chat_historial_bot), 1),
        true
      );
    `);
    console.log('   ✅ Reset n8n_chat_historial_bot sequence');
  } catch (error: any) {
    console.error('   ⚠️  Error resetting sequences:', error.message);
  }
}

/**
 * Safely parse JSON strings, returning default value on error
 */
function parseJsonSafe(jsonString: string, defaultValue: any): any {
  if (!jsonString || jsonString === '' || jsonString === 'null') {
    return defaultValue;
  }
  
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.warn(`   ⚠️  Invalid JSON encountered, using default:`, jsonString.substring(0, 50));
    return defaultValue;
  }
}

/**
 * Parse nullable string - handles "null" string, empty strings, and undefined
 */
function parseNullableString(value: string | undefined): string | null {
  if (!value || value === '' || value === 'null' || value === 'undefined') {
    return null;
  }
  return value;
}

/**
 * Parse nullable date - handles "null" string, empty strings, and invalid dates
 */
function parseNullableDate(value: string | undefined): Date | null {
  if (!value || value === '' || value === 'null' || value === 'undefined') {
    return null;
  }
  
  const date = new Date(value);
  if (isNaN(date.getTime())) {
    return null;
  }
  
  return date;
}

/**
 * Parse nullable integer - handles "null" string, empty strings, and NaN
 */
function parseNullableInt(value: string | undefined): number | null {
  if (!value || value === '' || value === 'null' || value === 'undefined') {
    return null;
  }
  
  const num = parseInt(value);
  if (isNaN(num)) {
    return null;
  }
  
  return num;
}

// Run the seed
main()
  .catch((e) => {
    console.error('❌ Fatal error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

