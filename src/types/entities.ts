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

// Ticket status and priority types
export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";
export type TicketPriority = "low" | "medium" | "high" | "urgent";
export type AssignmentGroup = "distribucion" | "atencion_cliente" | "call_center" | "comercial";
export type ContactChannel = "telefono" | "email" | "app" | "presencial" | "web";

export interface Ticket {
  id: string;
  // Core fields
  numero_ticket: string;
  numero_reporte_cea_app: string | null;
  descripcion_breve: string;
  titular: string; // Persona haciendo el reporte
  canal: ContactChannel;
  estado: TicketStatus;
  prioridad: TicketPriority;
  grupo_asignacion: AssignmentGroup;
  asignado_a: string | null; // ID del usuario asignado
  actualizado: string | null; // updated_at
  
  // Location fields
  numero_contrato: string | null;
  colonia: string | null;
  direccion: string | null;
  administracion: string | null; // County
  
  // Internal fields
  observaciones_internas: string | null;
  numero_orden_aquacis: string | null; // Internal system for dispatch orders
  
  // Metadata
  created_at: string;
  updated_at: string | null;
  agent_id: string | null; // Legacy field, keeping for compatibility
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




