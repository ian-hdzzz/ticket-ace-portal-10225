import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
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
    await importCustomers();
    await importTickets();
    await importN8nChatHistory();

    // Reset sequences for auto-increment tables
    await resetSequences();

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
          numeroContrato: record.numero_contrato || null,
          nombreTitular: record.nombre_titular || null,
          email: record.email || null,
          telefono: record.telefono || null,
          whatsapp: record.whatsapp || null,
          
          // Address fields
          direccionServicio: record.direccion_servicio || null,
          colonia: record.colonia || null,
          codigoPostal: record.codigo_postal || null,
          municipio: record.municipio || 'Querétaro',
          
          // Boolean fields
          reciboDigital: record.recibo_digital === 'true' || record.recibo_digital === 't',
          
          // Metadata
          firstInteractionChannel: record.first_interaction_channel || null,
          
          // Timestamps - preserve original
          createdAt: record.created_at ? new Date(record.created_at) : new Date(),
          updatedAt: record.updated_at ? new Date(record.updated_at) : new Date(),
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
          customerId: record.customer_id || null,
          serviceType: record.service_type as any,
          ticketType: record.ticket_type as any,
          status: (record.status || 'abierto') as any,
          priority: (record.priority || 'media') as any,
          channel: record.channel as any,
          titulo: record.titulo,
          descripcion: record.descripcion || null,
          
          // Assignment fields
          assignedTo: record.assigned_to || null,
          assignedAt: record.assigned_at ? new Date(record.assigned_at) : null,
          escalatedTo: record.escalated_to || null,
          escalatedAt: record.escalated_at ? new Date(record.escalated_at) : null,
          
          // Resolution fields
          resolutionNotes: record.resolution_notes || null,
          resolvedAt: record.resolved_at ? new Date(record.resolved_at) : null,
          closedAt: record.closed_at ? new Date(record.closed_at) : null,
          
          // SLA fields
          slaDeadline: record.sla_deadline ? new Date(record.sla_deadline) : null,
          slaBreached: record.sla_breached === 'true' || record.sla_breached === 't',
          
          // Array and JSON fields
          tags: record.tags ? parseJsonSafe(record.tags, []) : null,
          metadata: record.metadata ? parseJsonSafe(record.metadata, {}) : {},
          
          // Additional fields
          clientName: record.client_name || null,
          contractNumber: record.contract_number ? parseInt(record.contract_number) : null,
          
          // Timestamps - preserve original
          createdAt: record.created_at ? new Date(record.created_at) : new Date(),
          updatedAt: record.updated_at ? new Date(record.updated_at) : new Date(),
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
        'cea.n8n_chat_historial_bot_id_seq',
        COALESCE((SELECT MAX(id) FROM cea.n8n_chat_historial_bot), 1),
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
  if (!jsonString || jsonString === '') {
    return defaultValue;
  }
  
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.warn(`   ⚠️  Invalid JSON encountered, using default:`, jsonString.substring(0, 50));
    return defaultValue;
  }
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

