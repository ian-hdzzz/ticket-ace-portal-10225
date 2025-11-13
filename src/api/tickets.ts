import type { Ticket } from "@/types/entities";
import { isDemoMode } from "@/lib/config";
import { getSupabaseClient } from "@/lib/supabaseClient";

// ============================================================================
// DEMO MODE: Mock data storage
// ============================================================================
const mockTickets: Ticket[] = [
  {
    id: "1",
    numero_ticket: "TKT-2024-001",
    numero_reporte_cea_app: "CEA-APP-12345",
    descripcion_breve: "Fuga de agua en Av. Constituyentes",
    titular: "Juan Pérez",
    canal: "telefono",
    estado: "open",
    prioridad: "urgent",
    grupo_asignacion: "distribucion",
    asignado_a: null,
    actualizado: null,
    numero_contrato: "CT-2024-5678",
    colonia: "Centro",
    direccion: "Av. Constituyentes #123",
    observaciones_internas: "Requiere atención inmediata, fuga importante",
    administracion: "Administración Central",
    numero_orden_aquacis: "AQU-2024-001",
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updated_at: null,
    agent_id: null,
  },
  {
    id: "2",
    numero_ticket: "TKT-2024-002",
    numero_reporte_cea_app: null,
    descripcion_breve: "Baja presión de agua",
    titular: "María González",
    canal: "app",
    estado: "in_progress",
    prioridad: "high",
    grupo_asignacion: "atencion_cliente",
    asignado_a: "user-1",
    actualizado: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    numero_contrato: "CT-2024-5679",
    colonia: "Jardines",
    direccion: "Calle Flores #45",
    observaciones_internas: "Múltiples vecinos reportan el mismo problema",
    administracion: "Administración Norte",
    numero_orden_aquacis: null,
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    agent_id: "1",
  },
  {
    id: "3",
    numero_ticket: "TKT-2024-003",
    numero_reporte_cea_app: "CEA-APP-12346",
    descripcion_breve: "Solicitud de nuevo medidor",
    titular: "Carlos Ramírez",
    canal: "presencial",
    estado: "resolved",
    prioridad: "medium",
    grupo_asignacion: "comercial",
    asignado_a: "user-2",
    actualizado: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    numero_contrato: "CT-2024-5680",
    colonia: "Nueva Esperanza",
    direccion: "Av. Reforma #789",
    observaciones_internas: "Cliente con nueva construcción",
    administracion: "Administración Sur",
    numero_orden_aquacis: "AQU-2024-002",
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    agent_id: "2",
  },
  {
    id: "4",
    numero_ticket: "TKT-2024-004",
    numero_reporte_cea_app: null,
    descripcion_breve: "Consulta sobre facturación",
    titular: "Ana Martínez",
    canal: "email",
    estado: "open",
    prioridad: "low",
    grupo_asignacion: "call_center",
    asignado_a: null,
    actualizado: null,
    numero_contrato: "CT-2024-5681",
    colonia: "San Miguel",
    direccion: "Calle Principal #321",
    observaciones_internas: null,
    administracion: "Administración Este",
    numero_orden_aquacis: null,
    created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    updated_at: null,
    agent_id: null,
  },
  {
    id: "5",
    numero_ticket: "TKT-2024-005",
    numero_reporte_cea_app: "CEA-APP-12347",
    descripcion_breve: "Reporte de medidor defectuoso",
    titular: "Roberto Sánchez",
    canal: "web",
    estado: "in_progress",
    prioridad: "high",
    grupo_asignacion: "distribucion",
    asignado_a: "user-1",
    actualizado: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    numero_contrato: "CT-2024-5682",
    colonia: "Villa Verde",
    direccion: "Boulevard Central #654",
    observaciones_internas: "Medidor no registra consumo correctamente",
    administracion: "Administración Oeste",
    numero_orden_aquacis: "AQU-2024-003",
    created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    agent_id: "1",
  },
];

// Simulate API delay for demo mode
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// ============================================================================
// DEMO MODE: Mock API functions
// ============================================================================
async function listTicketsDemo(): Promise<Ticket[]> {
  await delay(300);
  return [...mockTickets].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

async function getTicketByIdDemo(id: string): Promise<Ticket | null> {
  await delay(200);
  return mockTickets.find((t) => t.id === id) || null;
}

async function createTicketDemo(partial: Omit<Ticket, "id" | "created_at" | "updated_at" | "numero_ticket"> & { numero_ticket?: string }): Promise<Ticket> {
  await delay(300);
  const ticketId = String(Date.now());
  const ticketNumber = partial.numero_ticket || `TKT-2024-${String(mockTickets.length + 1).padStart(3, "0")}`;
  const ticket: Ticket = {
    id: ticketId,
    numero_ticket: ticketNumber,
    created_at: new Date().toISOString(),
    updated_at: null,
    actualizado: null,
    ...partial,
  };
  mockTickets.push(ticket);
  return ticket;
}

async function updateTicketDemo(id: string, changes: Partial<Ticket>): Promise<Ticket> {
  await delay(300);
  const index = mockTickets.findIndex((t) => t.id === id);
  if (index === -1) {
    throw new Error("Ticket not found");
  }
  const now = new Date().toISOString();
  const updated: Ticket = {
    ...mockTickets[index],
    ...changes,
    updated_at: now,
    actualizado: now,
  };
  mockTickets[index] = updated;
  return updated;
}

async function deleteTicketDemo(id: string): Promise<boolean> {
  await delay(300);
  const index = mockTickets.findIndex((t) => t.id === id);
  if (index === -1) {
    return false;
  }
  mockTickets.splice(index, 1);
  return true;
}

// ============================================================================
// PRODUCTION MODE: Supabase API functions
// ============================================================================
async function listTicketsProduction(): Promise<Ticket[]> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error("Supabase client not available. Check your configuration.");
  }

  const { data, error } = await supabase
    .from("tickets")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch tickets: ${error.message}`);
  }

  return (data || []) as Ticket[];
}

async function getTicketByIdProduction(id: string): Promise<Ticket | null> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error("Supabase client not available. Check your configuration.");
  }

  const { data, error } = await supabase
    .from("tickets")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // Not found
      return null;
    }
    throw new Error(`Failed to fetch ticket: ${error.message}`);
  }

  return data as Ticket;
}

async function createTicketProduction(partial: Omit<Ticket, "id" | "created_at" | "updated_at">): Promise<Ticket> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error("Supabase client not available. Check your configuration.");
  }

  const { data, error } = await supabase
    .from("tickets")
    .insert({
      ...partial,
      created_at: new Date().toISOString(),
      updated_at: null,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create ticket: ${error.message}`);
  }

  return data as Ticket;
}

async function updateTicketProduction(id: string, changes: Partial<Ticket>): Promise<Ticket> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error("Supabase client not available. Check your configuration.");
  }

  const { data, error } = await supabase
    .from("tickets")
    .update({
      ...changes,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update ticket: ${error.message}`);
  }

  return data as Ticket;
}

async function deleteTicketProduction(id: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error("Supabase client not available. Check your configuration.");
  }

  const { error } = await supabase
    .from("tickets")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(`Failed to delete ticket: ${error.message}`);
  }

  return true;
}

// ============================================================================
// PUBLIC API: Mode-aware functions
// ============================================================================
export async function listTickets(): Promise<Ticket[]> {
  return isDemoMode() ? listTicketsDemo() : listTicketsProduction();
}

export async function getTicketById(id: string): Promise<Ticket | null> {
  return isDemoMode() ? getTicketByIdDemo(id) : getTicketByIdProduction(id);
}

export async function createTicket(partial: Omit<Ticket, "id" | "created_at" | "updated_at" | "numero_ticket"> & { numero_ticket?: string }): Promise<Ticket> {
  return isDemoMode() ? createTicketDemo(partial) : createTicketProduction(partial);
}

export async function updateTicket(id: string, changes: Partial<Ticket>): Promise<Ticket> {
  return isDemoMode() ? updateTicketDemo(id, changes) : updateTicketProduction(id, changes);
}

export async function deleteTicket(id: string): Promise<boolean> {
  return isDemoMode() ? deleteTicketDemo(id) : deleteTicketProduction(id);
}
