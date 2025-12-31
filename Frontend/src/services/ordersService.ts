// Servicio para manejar órdenes de trabajo (CEA Orders)
import { supabase } from "@/supabase/client";
import { 
  CeaOrder, 
  CreateOrderRequest, 
  UpdateOrderRequest, 
  OrderFilters 
} from "@/types/orders";

// Obtener todas las órdenes con filtros opcionales
export const getOrders = async (filters?: OrderFilters): Promise<CeaOrder[]> => {
  try {
    
    let query = supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    // Aplicar filtros si existen
    if (filters) {
      if (filters.estado?.length) {
        query = query.in('estado', filters.estado);
      }
      if (filters.tipo?.length) {
        query = query.in('tipo', filters.tipo);
      }
      if (filters.prioridad?.length) {
        query = query.in('prioridad', filters.prioridad);
      }
      if (filters.asignado_a?.length) {
        query = query.in('asignado_a', filters.asignado_a);
      }
      if (filters.fecha_desde) {
        query = query.gte('fecha_programada', filters.fecha_desde);
      }
      if (filters.fecha_hasta) {
        query = query.lte('fecha_programada', filters.fecha_hasta);
      }
      if (filters.escalado !== undefined) {
        query = query.eq('escalado', filters.escalado);
      }
      if (filters.ticket_id) {
        query = query.eq('ticket_id', filters.ticket_id);
      }
      if (filters.search) {
        query = query.or(`numero_orden.ilike.%${filters.search}%,motivo.ilike.%${filters.search}%,nombre_cliente.ilike.%${filters.search}%`);
      }
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getOrders:', error);
    throw error;
  }
};

// Obtener órdenes por ticket ID
export const getOrdersByTicketId = async (ticketId: string): Promise<CeaOrder[]> => {
  try {
    
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        assigned_user:users!orders_asignado_a_fkey (
          id,
          full_name,
          email
        ),
        supervisor:users!orders_supervisor_id_fkey (
          id,
          full_name,
          email
        )
      `)
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders by ticket:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getOrdersByTicketId:', error);
    throw error;
  }
};

// Crear una nueva orden
export const createOrder = async (orderData: CreateOrderRequest): Promise<CeaOrder> => {
  try {
    
    const { data, error } = await supabase
      .from('orders')
      .insert([orderData])
      .select('*')
      .single();

    if (error) {
      console.error('Error creating order:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in createOrder:', error);
    throw error;
  }
};
