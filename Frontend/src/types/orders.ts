// Tipos para el manejo de órdenes de trabajo (CEA Orders)

export type OrderType = 'inspeccion' | 'reparacion' | 'mantenimiento' | 'instalacion' | 'revision';

export type OrderStatus = 
  | 'pendiente' 
  | 'programada' 
  | 'en_proceso' 
  | 'pausada' 
  | 'completada' 
  | 'cancelada' 
  | 'rechazada';

export type OrderPriority = 'baja' | 'media' | 'alta' | 'urgente' | 'critica';

export type OrderResult = 'exitoso' | 'parcial' | 'fallido' | 'reprogramado';

// Interfaz para materiales y herramientas
export interface OrderMaterial {
  id: string;
  nombre: string;
  cantidad: number;
  unidad: string;
  precio_unitario?: number;
  observaciones?: string;
}

export interface OrderTool {
  id: string;
  nombre: string;
  tipo: string;
  requerido: boolean;
  observaciones?: string;
}

// Interfaz principal para órdenes
export interface CeaOrder {
  id: string;
  ticket_id: string;
  numero_orden: string;
  tipo: OrderType;
  motivo: string;
  
  // Fechas
  fecha_creacion: string;
  fecha_programada?: string;
  fecha_inicio?: string;
  fecha_finalizacion?: string;
  
  // Estado
  estado: OrderStatus;
  
  // Información del trabajo
  observaciones?: string;
  codigo_reparacion?: string;
  descripcion_trabajo?: string;
  
  // Ubicación
  direccion?: string;
  colonia?: string;
  codigo_postal?: string;
  coordenadas_gps?: {
    lat: number;
    lng: number;
  };
  
  // Cliente y contrato
  numero_contrato?: string;
  nombre_cliente?: string;
  telefono_cliente?: string;
  email_cliente?: string;
  
  // Asignación
  asignado_a?: string;
  supervisor_id?: string;
  equipo_asignado?: string;
  
  // Información técnica
  prioridad: OrderPriority;
  tiempo_estimado_horas?: number;
  materiales_requeridos?: OrderMaterial[];
  herramientas_requeridas?: OrderTool[];
  
  // SLA
  sla_horas?: number;
  sla_deadline?: string;
  sla_cumplido?: boolean;
  
  // Resultados
  resultado?: OrderResult;
  notas_cierre?: string;
  materiales_utilizados?: OrderMaterial[];
  tiempo_real_horas?: number;
  
  // Escalamiento
  escalado: boolean;
  escalado_a?: string;
  fecha_escalado?: string;
  motivo_escalado?: string;
  
  // Calidad
  requiere_validacion: boolean;
  validado_por?: string;
  fecha_validacion?: string;
  calificacion_cliente?: number;
  comentarios_cliente?: string;
  
  // Facturación
  costo_estimado?: number;
  costo_real?: number;
  facturable: boolean;
  numero_factura?: string;
  
  // Metadatos
  metadata?: Record<string, any>;
  tags?: string[];
  archivos_adjuntos?: string[];
  
  // Auditoría
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
  
  // Datos relacionados (para joins)
  ticket?: {
    numero_ticket: string;
    descripcion_breve: string;
    nombre_cliente: string;
  };
  assigned_user?: {
    id: string;
    full_name: string;
    email: string;
  };
  supervisor?: {
    id: string;
    full_name: string;
    email: string;
  };
}

// Interfaz para crear una nueva orden
export interface CreateOrderRequest {
  ticket_id: string;
  tipo: OrderType;
  motivo: string;
  fecha_programada?: string;
  observaciones?: string;
  codigo_reparacion?: string;
  descripcion_trabajo?: string;
  direccion?: string;
  colonia?: string;
  numero_contrato?: string;
  nombre_cliente?: string;
  telefono_cliente?: string;
  asignado_a?: string;
  supervisor_id?: string;
  prioridad: OrderPriority;
  tiempo_estimado_horas?: number;
  materiales_requeridos?: OrderMaterial[];
  herramientas_requeridas?: OrderTool[];
  sla_horas?: number;
  costo_estimado?: number;
  requiere_validacion?: boolean;
  metadata?: Record<string, any>;
  tags?: string[];
}

// Interfaz para actualizar una orden
export interface UpdateOrderRequest extends Partial<CreateOrderRequest> {
  id: string;
  estado?: OrderStatus;
  fecha_inicio?: string;
  fecha_finalizacion?: string;
  resultado?: OrderResult;
  notas_cierre?: string;
  materiales_utilizados?: OrderMaterial[];
  tiempo_real_horas?: number;
  escalado?: boolean;
  escalado_a?: string;
  motivo_escalado?: string;
  calificacion_cliente?: number;
  comentarios_cliente?: string;
  costo_real?: number;
  numero_factura?: string;
}

// Interfaces para filtros y búsqueda
export interface OrderFilters {
  estado?: OrderStatus[];
  tipo?: OrderType[];
  prioridad?: OrderPriority[];
  asignado_a?: string[];
  fecha_desde?: string;
  fecha_hasta?: string;
  escalado?: boolean;
  sla_vencido?: boolean;
  ticket_id?: string;
  search?: string;
}

// Labels para mostrar en la UI
export const ORDER_TYPE_LABELS: Record<OrderType, string> = {
  inspeccion: 'Inspección',
  reparacion: 'Reparación',
  mantenimiento: 'Mantenimiento',
  instalacion: 'Instalación',
  revision: 'Revisión'
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pendiente: 'Pendiente',
  programada: 'Programada',
  en_proceso: 'En Proceso',
  pausada: 'Pausada',
  completada: 'Completada',
  cancelada: 'Cancelada',
  rechazada: 'Rechazada'
};

export const ORDER_PRIORITY_LABELS: Record<OrderPriority, string> = {
  baja: 'Baja',
  media: 'Media',
  alta: 'Alta',
  urgente: 'Urgente',
  critica: 'Crítica'
};

export const ORDER_RESULT_LABELS: Record<OrderResult, string> = {
  exitoso: 'Exitoso',
  parcial: 'Parcial',
  fallido: 'Fallido',
  reprogramado: 'Reprogramado'
};

// Funciones helper
export const getOrderStatusColor = (status: OrderStatus): string => {
  switch (status) {
    case 'pendiente': return 'bg-yellow-100 text-yellow-800';
    case 'programada': return 'bg-blue-100 text-blue-800';
    case 'en_proceso': return 'bg-orange-100 text-orange-800';
    case 'pausada': return 'bg-gray-100 text-gray-800';
    case 'completada': return 'bg-green-100 text-green-800';
    case 'cancelada': return 'bg-red-100 text-red-800';
    case 'rechazada': return 'bg-red-200 text-red-900';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const getOrderPriorityColor = (priority: OrderPriority): string => {
  switch (priority) {
    case 'baja': return 'bg-green-100 text-green-800';
    case 'media': return 'bg-yellow-100 text-yellow-800';
    case 'alta': return 'bg-orange-100 text-orange-800';
    case 'urgente': return 'bg-red-100 text-red-800';
    case 'critica': return 'bg-red-200 text-red-900';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const getOrderTypeColor = (type: OrderType): string => {
  switch (type) {
    case 'inspeccion': return 'bg-blue-100 text-blue-800';
    case 'reparacion': return 'bg-red-100 text-red-800';
    case 'mantenimiento': return 'bg-green-100 text-green-800';
    case 'instalacion': return 'bg-purple-100 text-purple-800';
    case 'revision': return 'bg-yellow-100 text-yellow-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

// Funciones de validación
export const isOrderOverdue = (order: CeaOrder): boolean => {
  if (!order.sla_deadline || order.estado === 'completada') return false;
  return new Date(order.sla_deadline) < new Date();
};

export const getOrderProgress = (order: CeaOrder): number => {
  switch (order.estado) {
    case 'pendiente': return 0;
    case 'programada': return 25;
    case 'en_proceso': return 50;
    case 'pausada': return 40;
    case 'completada': return 100;
    case 'cancelada': 
    case 'rechazada': return 0;
    default: return 0;
  }
};
