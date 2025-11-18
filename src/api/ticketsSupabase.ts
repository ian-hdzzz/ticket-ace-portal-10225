import { supabase } from '../supabase/client';
import { CreateTicketData, SupabaseTicket } from '../types/entities';
import { isValidUUID } from '../lib/uuid';

/**
 * API para gestionar tickets en Supabase
 */

/**
 * Crear un nuevo ticket
 */
export async function createTicket(ticketData: CreateTicketData): Promise<SupabaseTicket> {
  try {
    // Validar que todos los campos requeridos estén presentes
    if (!ticketData.titulo?.trim()) {
      throw new Error('El título es obligatorio');
    }
    if (!ticketData.service_type) {
      throw new Error('El tipo de servicio es obligatorio');
    }
    if (!ticketData.ticket_type) {
      throw new Error('El tipo de ticket es obligatorio');
    }
    if (!ticketData.channel) {
      throw new Error('El canal es obligatorio');
    }

    // Validar customer_id si se proporciona
    let validCustomerId = null;
    if (ticketData.customer_id && ticketData.customer_id.trim()) {
      if (isValidUUID(ticketData.customer_id.trim())) {
        validCustomerId = ticketData.customer_id.trim();
      } else {
        // Si no es un UUID válido, lo dejamos como null (es opcional)
        console.warn('⚠️ customer_id no es un UUID válido, se dejará como null:', ticketData.customer_id);
        validCustomerId = null;
      }
    }

    // Generar folio único
    const timestamp = Date.now();
    const folio = `TKT-${new Date().getFullYear()}-${String(timestamp).slice(-6)}`;
    
    const ticketPayload = {
      folio: folio,
      titulo: ticketData.titulo.trim(),
      descripcion: ticketData.descripcion?.trim() || null,
      customer_id: validCustomerId,
      service_type: ticketData.service_type,
      ticket_type: ticketData.ticket_type,
      priority: ticketData.priority || 'media',
      channel: ticketData.channel,
      tags: ticketData.tags || null,
      metadata: ticketData.metadata || {}
    };

    console.log('📝 Creando ticket con payload:', ticketPayload);
    console.log('🔗 URL de Supabase:', import.meta.env.VITE_SUPABASE_URL);
    console.log('🔑 Anon Key configurada:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);

    // Test connection first
    console.log('🔍 Testing Supabase connection...');
    const { data: connectionTest } = await supabase
      .from('tickets')
      .select('count')
      .limit(1);
    
    console.log('📊 Connection test result:', connectionTest);

    const { data, error } = await supabase
      .from('tickets')
      .insert([ticketPayload])
      .select()
      .single();

    if (error) {
      console.error('❌ Error detallado de Supabase:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      
      // Mensajes de error más específicos
      if (error.code === '23502') {
        throw new Error(`Campo requerido faltante: ${error.message}`);
      } else if (error.code === '23514') {
        throw new Error(`Valor inválido para enum: ${error.message}`);
      } else if (error.code === '22P02') {
        // Error específico para valores de enum inválidos
        const match = error.message.match(/invalid input value for enum (\w+): "([^"]+)"/);
        if (match) {
          const [, enumType, invalidValue] = match;
          throw new Error(`❌ VALOR DE ENUM INVÁLIDO:
          
🔧 El valor "${invalidValue}" no es válido para el campo "${enumType}".

📋 Para ver los valores válidos, ejecuta en Supabase SQL Editor:
SELECT enumlabel FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = '${enumType}');

Error original: ${error.message}`);
        } else {
          throw new Error(`Valor de enum inválido: ${error.message}`);
        }
      } else if (error.code === '42P01') {
        throw new Error('Tabla no encontrada. Verifique la configuración del schema.');
      } else if (error.code === '42501' || error.message.includes('permission denied')) {
        throw new Error(`❌ PERMISOS INSUFICIENTES: No tienes permisos para crear tickets. 
        
🔧 SOLUCIÓN:
1. Ve a tu proyecto Supabase
2. Ejecuta estas consultas SQL en el editor:

-- Habilitar RLS si no está habilitado
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

-- Crear política para permitir inserciones anónimas  
CREATE POLICY "Allow anonymous ticket creation" 
ON tickets FOR INSERT TO anon WITH CHECK (true);

-- Crear política para permitir lectura anónima
CREATE POLICY "Allow anonymous ticket reading" 
ON tickets FOR SELECT TO anon USING (true);

-- Otorgar permisos necesarios
GRANT SELECT, INSERT, UPDATE ON tickets TO anon;

Error original: ${error.message}`);
      } else {
        throw new Error(`Error de base de datos: ${error.message}`);
      }
    }

    console.log('✅ Ticket creado exitosamente:', data);
    return data as SupabaseTicket;
  } catch (error) {
    console.error('❌ Error en createTicket:', error);
    throw error;
  }
}

/**
 * Obtener todos los tickets
 */
export async function getTickets(): Promise<SupabaseTicket[]> {
  try {
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error obteniendo tickets:', error);
      throw new Error(`Error al obtener tickets: ${error.message}`);
    }

    return data as SupabaseTicket[];
  } catch (error) {
    console.error('Error en getTickets:', error);
    throw error;
  }
}

/**
 * Obtener ticket por ID
 */
export async function getTicketById(id: string): Promise<SupabaseTicket | null> {
  try {
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error obteniendo ticket:', error);
      throw new Error(`Error al obtener ticket: ${error.message}`);
    }

    return data as SupabaseTicket;
  } catch (error) {
    console.error('Error en getTicketById:', error);
    return null;
  }
}

/**
 * Actualizar estado de ticket
 */
export async function updateTicketStatus(
  id: string, 
  status: SupabaseTicket['status']
): Promise<SupabaseTicket> {
  try {
    const updateData: any = { status };
    
    // Si el ticket se está resolviendo o cerrando, agregar timestamp correspondiente
    if (status === 'resuelto') {
      updateData.resolved_at = new Date().toISOString();
    } else if (status === 'cerrado') {
      updateData.closed_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('tickets')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error actualizando estado del ticket:', error);
      throw new Error(`Error al actualizar estado: ${error.message}`);
    }

    return data as SupabaseTicket;
  } catch (error) {
    console.error('Error en updateTicketStatus:', error);
    throw error;
  }
}

/**
 * Asignar ticket a un usuario
 */
export async function assignTicket(
  ticketId: string, 
  assignedTo: string
): Promise<SupabaseTicket> {
  try {
    const { data, error } = await supabase
      .from('tickets')
      .update({ 
        assigned_to: assignedTo,
        assigned_at: new Date().toISOString(),
        status: 'en_proceso'
      })
      .eq('id', ticketId)
      .select()
      .single();

    if (error) {
      console.error('Error asignando ticket:', error);
      throw new Error(`Error al asignar ticket: ${error.message}`);
    }

    return data as SupabaseTicket;
  } catch (error) {
    console.error('Error en assignTicket:', error);
    throw error;
  }
}

/**
 * Agregar notas de resolución
 */
export async function addResolutionNotes(
  ticketId: string, 
  notes: string
): Promise<SupabaseTicket> {
  try {
    const { data, error } = await supabase
      .from('tickets')
      .update({ resolution_notes: notes })
      .eq('id', ticketId)
      .select()
      .single();

    if (error) {
      console.error('Error agregando notas de resolución:', error);
      throw new Error(`Error al agregar notas: ${error.message}`);
    }

    return data as SupabaseTicket;
  } catch (error) {
    console.error('Error en addResolutionNotes:', error);
    throw error;
  }
}
