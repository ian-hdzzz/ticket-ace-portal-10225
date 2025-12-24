// User Types based on departments
export type UserType =
  | "admin"
  | "gerencia"
  | "call_center_externo"
  | "coordinacion_planeacion_proyectos_tecnicos"
  | "coordinacion_vinculacion_comercial"
  | "coordinacion_general_ejecutiva"
  | "gerencia_comercial"
  | "gerencia_administracion_proyectos"
  | "gerencia_cartera_vencida"
  | "gerencia_contratacion_padron"
  | "gerencia_control_sanitario"
  | "gerencia_control_seguimiento_factibilidades"
  | "gerencia_facturacion"
  | "gerencia_infraestructura_informatica"
  | "gerencia_ingenieria_operacion"
  | "gerencia_medicion_consumos"
  | "gerencia_operacion_mantenimiento_ptar"
  | "gerencia_programas_inversion"
  | "gerencia_regularizacion_asentamientos"
  | "gerencia_tesoreria"
  | "gerencia_juridica_recuperacion_cartera"
  | "gerencia_tecnica"
  | "subgerencia_contratos"
  | "subgerencia_factibilidades"
  | "subgerencia_inspeccion_vigilancia"
  | "subgerencia_lecturas"
  | "subgerencia_limitacion_reconexion"
  | "subgerencia_servicio_cliente"
  | "subgerencia_soporte_tecnico";

export interface User {
  id: string;
  name: string;
  type: UserType;
  email?: string;
}

// Tipos para Supabase tickets (actualizados según la DB real)
export type ServiceType = 
  | "aclaraciones"
  | "actualizar_caso"
  | "asesor_humano"
  | "contratacion_cambio"
  | "pago_recibo"
  | "recibo_digital"
  | "reportar_lectura"
  | "reportes_fugas"
  | "revision_recibo";

export type TicketTypeCode = 
  | "ACL"  // Aclaraciones
  | "ACT"  // Actualizar
  | "CON"  // Contratación
  | "DIG"  // Digital
  | "FUG"  // Fugas
  | "LEC"  // Lectura
  | "PAG"  // Pago
  | "REV"  // Revisión
  | "URG"; // Urgente

export type TicketStatusSupabase = "abierto" | "cancelado" | "cerrado" | "en_proceso" | "escalado" | "esperando_cliente" | "esperando_interno" | "resuelto";

export type PriorityLevel = "baja" | "media" | "alta" | "critica";

export type ChannelType = "app_movil" | "email" | "presencial" | "telefono" | "web_chat" | "whatsapp";

// Interface para crear tickets nuevos
export interface CreateTicketData {
  titulo: string;
  descripcion?: string;
  customer_id?: string;
  service_type: ServiceType;
  ticket_type: TicketTypeCode;
  priority?: PriorityLevel;
  channel: ChannelType;
  tags?: string[];
  metadata?: Record<string, any>;
}

// Interface para tickets de Supabase
export interface SupabaseTicket {
  id: string;
  folio: string;
  customer_id?: string;
  service_type: ServiceType;
  ticket_type: TicketTypeCode;
  status: TicketStatusSupabase;
  priority: PriorityLevel;
  channel: ChannelType;
  titulo: string;
  descripcion?: string;
  assigned_to?: string;
  assigned_at?: string;
  escalated_to?: string;
  escalated_at?: string;
  resolution_notes?: string;
  resolved_at?: string;
  closed_at?: string;
  sla_deadline?: string;
  sla_breached?: boolean;
  tags?: string[];
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// Legacy fields for backward compatibility
export interface TicketLegacy {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  created_at: string;
  updated_at: string | null;
  agent_id: string | null;
}

export interface Agent {
  id: string;
  name: string;
  type: "voice" | "chat";
  status: "active" | "inactive";
  model: string | null;
  voice: string | null;
  system_prompt: string | null;
  assignment_rules: string | null;
  last_updated: string | null;
}




