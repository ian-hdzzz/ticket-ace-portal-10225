import { supabase } from '../supabase/client';
import { CreateTicketData, SupabaseTicket } from '../types/entities';

/**
 * API para gestionar tickets en Supabase
 */

/**
 * Crear un nuevo ticket
 */
export async function createTicket(ticketData: CreateTicketData): Promise<SupabaseTicket> {
  try {
    const { data, error } = await supabase
      .from('tickets')
      .insert([{
        titulo: ticketData.titulo,
        descripcion: ticketData.descripcion,
        customer_id: ticketData.customer_id,
        service_type: ticketData.service_type,
        ticket_type: ticketData.ticket_type,
        priority: ticketData.priority || 'media',
        channel: ticketData.channel,
        tags: ticketData.tags,
        metadata: ticketData.metadata || {}
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creando ticket:', error);
      throw new Error(`Error al crear ticket: ${error.message}`);
    }

    return data as SupabaseTicket;
  } catch (error) {
    console.error('Error en createTicket:', error);
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
