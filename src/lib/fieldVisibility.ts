import type { UserType } from "@/types/entities";

/**
 * All possible ticket fields that can be displayed
 */
export type TicketField =
  | "numero_ticket"
  | "numero_reporte_cea_app"
  | "descripcion_breve"
  | "titular"
  | "canal"
  | "estado"
  | "prioridad"
  | "grupo_asignacion"
  | "asignado_a"
  | "actualizado"
  | "numero_contrato"
  | "colonia"
  | "direccion"
  | "observaciones_internas"
  | "administracion"
  | "numero_orden_aquacis";

/**
 * Field labels in Spanish
 */
export const FIELD_LABELS: Record<TicketField, string> = {
  numero_ticket: "Número de Ticket",
  numero_reporte_cea_app: "Número de Reporte CEA APP",
  descripcion_breve: "Descripción Breve",
  titular: "Titular",
  canal: "Canal",
  estado: "Estado",
  prioridad: "Prioridad",
  grupo_asignacion: "Grupo de Asignación",
  asignado_a: "Asignado a",
  actualizado: "Actualizado",
  numero_contrato: "Número de Contrato",
  colonia: "Colonia",
  direccion: "Dirección",
  observaciones_internas: "Observaciones Internas",
  administracion: "Administración",
  numero_orden_aquacis: "Número de Orden Aquacis",
};

/**
 * Get visible fields for a user type
 * Admins see all fields
 * Each Gerencia and Coordinación sees only relevant fields based on their role
 */
export function getVisibleFields(userType: UserType): TicketField[] {
  // Admin sees everything
  if (userType === "admin") {
    return [
      "numero_ticket",
      "numero_reporte_cea_app",
      "descripcion_breve",
      "titular",
      "canal",
      "estado",
      "prioridad",
      "grupo_asignacion",
      "asignado_a",
      "actualizado",
      "numero_contrato",
      "colonia",
      "direccion",
      "observaciones_internas",
      "administracion",
      "numero_orden_aquacis",
    ];
  }

  // Coordinación General Ejecutiva - nivel ejecutivo, ve todo
  if (userType === "coordinacion_general_ejecutiva") {
    return [
      "numero_ticket",
      "numero_reporte_cea_app",
      "descripcion_breve",
      "titular",
      "canal",
      "estado",
      "prioridad",
      "grupo_asignacion",
      "asignado_a",
      "actualizado",
      "numero_contrato",
      "colonia",
      "direccion",
      "observaciones_internas",
      "administracion",
      "numero_orden_aquacis",
    ];
  }

  // Coordinación de Planeación y Proyectos Técnicos - proyectos y operaciones
  if (userType === "coordinacion_planeacion_proyectos_tecnicos") {
    return [
      "numero_ticket",
      "descripcion_breve",
      "titular",
      "estado",
      "prioridad",
      "grupo_asignacion",
      "asignado_a",
      "actualizado",
      "colonia",
      "direccion",
      "administracion",
      "numero_orden_aquacis",
      "observaciones_internas",
    ];
  }

  // Coordinación de Vinculación Comercial y Servicio al Cliente - comercial y clientes
  if (userType === "coordinacion_vinculacion_comercial") {
    return [
      "numero_ticket",
      "descripcion_breve",
      "titular",
      "canal",
      "estado",
      "prioridad",
      "grupo_asignacion",
      "asignado_a",
      "actualizado",
      "numero_contrato",
      "colonia",
      "direccion",
    ];
  }

  // Gerencia Comercial - información comercial y de clientes
  if (userType === "gerencia_comercial") {
    return [
      "numero_ticket",
      "descripcion_breve",
      "titular",
      "canal",
      "estado",
      "prioridad",
      "grupo_asignacion",
      "asignado_a",
      "actualizado",
      "numero_contrato",
      "colonia",
      "direccion",
    ];
  }

  // Gerencia de Administración de Proyectos - proyectos y órdenes de trabajo
  if (userType === "gerencia_administracion_proyectos") {
    return [
      "numero_ticket",
      "descripcion_breve",
      "titular",
      "estado",
      "prioridad",
      "asignado_a",
      "actualizado",
      "colonia",
      "direccion",
      "administracion",
      "numero_orden_aquacis",
      "observaciones_internas",
    ];
  }

  // Gerencia de Cartera Vencida Administrativa - contratos y facturación
  if (userType === "gerencia_cartera_vencida") {
    return [
      "numero_ticket",
      "descripcion_breve",
      "titular",
      "estado",
      "prioridad",
      "asignado_a",
      "actualizado",
      "numero_contrato",
      "colonia",
      "direccion",
      "administracion",
    ];
  }

  // Gerencia de Contratación y Padrón de Usuarios - contratos y usuarios
  if (userType === "gerencia_contratacion_padron") {
    return [
      "numero_ticket",
      "descripcion_breve",
      "titular",
      "canal",
      "estado",
      "prioridad",
      "asignado_a",
      "actualizado",
      "numero_contrato",
      "colonia",
      "direccion",
      "administracion",
    ];
  }

  // Gerencia de Control Sanitario y Pluvial - ubicaciones y operaciones
  if (userType === "gerencia_control_sanitario") {
    return [
      "numero_ticket",
      "descripcion_breve",
      "titular",
      "estado",
      "prioridad",
      "asignado_a",
      "actualizado",
      "colonia",
      "direccion",
      "administracion",
      "numero_orden_aquacis",
    ];
  }

  // Gerencia de Control y Seguimiento de Factibilidades - factibilidades y ubicaciones
  if (userType === "gerencia_control_seguimiento_factibilidades") {
    return [
      "numero_ticket",
      "descripcion_breve",
      "titular",
      "estado",
      "prioridad",
      "asignado_a",
      "actualizado",
      "numero_contrato",
      "colonia",
      "direccion",
      "administracion",
    ];
  }

  // Gerencia de Facturación - facturación y contratos
  if (userType === "gerencia_facturacion") {
    return [
      "numero_ticket",
      "descripcion_breve",
      "titular",
      "estado",
      "prioridad",
      "asignado_a",
      "actualizado",
      "numero_contrato",
      "colonia",
      "direccion",
      "administracion",
    ];
  }

  // Gerencia de Infraestructura Informática y Seg. de la Info. - información técnica
  if (userType === "gerencia_infraestructura_informatica") {
    return [
      "numero_ticket",
      "numero_reporte_cea_app",
      "descripcion_breve",
      "titular",
      "canal",
      "estado",
      "prioridad",
      "asignado_a",
      "actualizado",
      "observaciones_internas",
    ];
  }

  // Gerencia de Ingeniería de Operación - operaciones y órdenes
  if (userType === "gerencia_ingenieria_operacion") {
    return [
      "numero_ticket",
      "descripcion_breve",
      "titular",
      "estado",
      "prioridad",
      "asignado_a",
      "actualizado",
      "colonia",
      "direccion",
      "administracion",
      "numero_orden_aquacis",
      "observaciones_internas",
    ];
  }

  // Gerencia de Medición de Consumos - contratos y lecturas
  if (userType === "gerencia_medicion_consumos") {
    return [
      "numero_ticket",
      "descripcion_breve",
      "titular",
      "estado",
      "prioridad",
      "asignado_a",
      "actualizado",
      "numero_contrato",
      "colonia",
      "direccion",
      "administracion",
    ];
  }

  // Gerencia de Operación y Mantenimiento PTAR - operaciones y mantenimiento
  if (userType === "gerencia_operacion_mantenimiento_ptar") {
    return [
      "numero_ticket",
      "descripcion_breve",
      "titular",
      "estado",
      "prioridad",
      "asignado_a",
      "actualizado",
      "colonia",
      "direccion",
      "administracion",
      "numero_orden_aquacis",
      "observaciones_internas",
    ];
  }

  // Gerencia de Programas de Inversión - proyectos e inversiones
  if (userType === "gerencia_programas_inversion") {
    return [
      "numero_ticket",
      "descripcion_breve",
      "titular",
      "estado",
      "prioridad",
      "asignado_a",
      "actualizado",
      "colonia",
      "direccion",
      "administracion",
      "numero_orden_aquacis",
      "observaciones_internas",
    ];
  }

  // Gerencia de Regularización de Asentamientos e Inspección - inspecciones y ubicaciones
  if (userType === "gerencia_regularizacion_asentamientos") {
    return [
      "numero_ticket",
      "descripcion_breve",
      "titular",
      "estado",
      "prioridad",
      "asignado_a",
      "actualizado",
      "colonia",
      "direccion",
      "administracion",
      "numero_orden_aquacis",
    ];
  }

  // Gerencia de Tesorería - facturación y pagos
  if (userType === "gerencia_tesoreria") {
    return [
      "numero_ticket",
      "descripcion_breve",
      "titular",
      "estado",
      "prioridad",
      "asignado_a",
      "actualizado",
      "numero_contrato",
      "colonia",
      "direccion",
      "administracion",
    ];
  }

  // Gerencia Jurídica de Recuperación de Cartera - cartera y contratos
  if (userType === "gerencia_juridica_recuperacion_cartera") {
    return [
      "numero_ticket",
      "descripcion_breve",
      "titular",
      "estado",
      "prioridad",
      "asignado_a",
      "actualizado",
      "numero_contrato",
      "colonia",
      "direccion",
      "administracion",
    ];
  }

  // Gerencia Técnica - operaciones técnicas
  if (userType === "gerencia_tecnica") {
    return [
      "numero_ticket",
      "descripcion_breve",
      "titular",
      "estado",
      "prioridad",
      "asignado_a",
      "actualizado",
      "colonia",
      "direccion",
      "administracion",
      "numero_orden_aquacis",
      "observaciones_internas",
    ];
  }

  // Gerencia (genérica) - si hay una gerencia genérica, ve campos administrativos importantes
  if (userType === "gerencia") {
    return [
      "numero_ticket",
      "descripcion_breve",
      "titular",
      "estado",
      "prioridad",
      "grupo_asignacion",
      "asignado_a",
      "actualizado",
      "numero_contrato",
      "colonia",
      "direccion",
      "administracion",
    ];
  }

  // Call Center - needs basic info and contact details
  if (userType === "call_center_externo") {
    return [
      "numero_ticket",
      "descripcion_breve",
      "titular",
      "canal",
      "estado",
      "prioridad",
      "grupo_asignacion",
      "asignado_a",
      "actualizado",
    ];
  }

  // Subgerencia de Servicio al Cliente - customer service focused
  if (userType === "subgerencia_servicio_cliente") {
    return [
      "numero_ticket",
      "descripcion_breve",
      "titular",
      "canal",
      "estado",
      "prioridad",
      "grupo_asignacion",
      "asignado_a",
      "actualizado",
      "numero_contrato",
      "colonia",
      "direccion",
    ];
  }

  // Subgerencia de Factibilidades - needs location and contract info
  if (userType === "subgerencia_factibilidades") {
    return [
      "numero_ticket",
      "descripcion_breve",
      "titular",
      "estado",
      "prioridad",
      "asignado_a",
      "actualizado",
      "numero_contrato",
      "colonia",
      "direccion",
      "administracion",
    ];
  }

  // Subgerencia de Lecturas - needs contract and location info
  if (userType === "subgerencia_lecturas") {
    return [
      "numero_ticket",
      "descripcion_breve",
      "titular",
      "estado",
      "prioridad",
      "asignado_a",
      "actualizado",
      "numero_contrato",
      "colonia",
      "direccion",
      "administracion",
    ];
  }

  // Subgerencia de Inspección y Vigilancia - needs location and dispatch info
  if (userType === "subgerencia_inspeccion_vigilancia") {
    return [
      "numero_ticket",
      "descripcion_breve",
      "titular",
      "estado",
      "prioridad",
      "asignado_a",
      "actualizado",
      "colonia",
      "direccion",
      "administracion",
      "numero_orden_aquacis",
    ];
  }

  // Subgerencia de Limitación y Reconexión - needs location and dispatch info
  if (userType === "subgerencia_limitacion_reconexion") {
    return [
      "numero_ticket",
      "descripcion_breve",
      "titular",
      "estado",
      "prioridad",
      "asignado_a",
      "actualizado",
      "numero_contrato",
      "colonia",
      "direccion",
      "numero_orden_aquacis",
    ];
  }

  // Subgerencia de Contratos - needs contract and customer info
  if (userType === "subgerencia_contratos") {
    return [
      "numero_ticket",
      "descripcion_breve",
      "titular",
      "estado",
      "prioridad",
      "asignado_a",
      "actualizado",
      "numero_contrato",
      "colonia",
      "direccion",
    ];
  }

  // Subgerencia de Soporte Técnico - needs technical details
  if (userType === "subgerencia_soporte_tecnico") {
    return [
      "numero_ticket",
      "numero_reporte_cea_app",
      "descripcion_breve",
      "titular",
      "canal",
      "estado",
      "prioridad",
      "asignado_a",
      "actualizado",
      "observaciones_internas",
    ];
  }

  // Default: basic fields for any other user type
  return [
    "numero_ticket",
    "descripcion_breve",
    "titular",
    "estado",
    "prioridad",
    "asignado_a",
    "actualizado",
  ];
}

/**
 * Check if a field is visible for a user type
 */
export function isFieldVisible(userType: UserType, field: TicketField): boolean {
  return getVisibleFields(userType).includes(field);
}

/**
 * Get user type display name
 */
export function getUserTypeDisplayName(userType: UserType): string {
  const names: Record<UserType, string> = {
    admin: "Administrador",
    gerencia: "Gerencia",
    call_center_externo: "Call Center Externo",
    coordinacion_planeacion_proyectos_tecnicos: "Coordinación de Planeación y Proyectos Técnicos",
    coordinacion_vinculacion_comercial: "Coordinación de Vinculación Comercial y Servicio al Cliente",
    coordinacion_general_ejecutiva: "Coordinación General Ejecutiva",
    gerencia_comercial: "Gerencia Comercial",
    gerencia_administracion_proyectos: "Gerencia de Administración de Proyectos",
    gerencia_cartera_vencida: "Gerencia de Cartera Vencida Administrativa",
    gerencia_contratacion_padron: "Gerencia de Contratación y Padrón de Usuarios",
    gerencia_control_sanitario: "Gerencia de Control Sanitario y Pluvial",
    gerencia_control_seguimiento_factibilidades: "Gerencia de Control y Seguimiento de Factibilidades",
    gerencia_facturacion: "Gerencia de Facturación",
    gerencia_infraestructura_informatica: "Gerencia de Infraestructura Informática y Seg. de la Info.",
    gerencia_ingenieria_operacion: "Gerencia de Ingeniería de Operación",
    gerencia_medicion_consumos: "Gerencia de Medición de Consumos",
    gerencia_operacion_mantenimiento_ptar: "Gerencia de Operación y Mantenimiento PTAR",
    gerencia_programas_inversion: "Gerencia de Programas de Inversión",
    gerencia_regularizacion_asentamientos: "Gerencia de Regularización de Asentamientos e Inspección",
    gerencia_tesoreria: "Gerencia de Tesorería",
    gerencia_juridica_recuperacion_cartera: "Gerencia Jurídica de Recuperación de Cartera",
    gerencia_tecnica: "Gerencia Técnica",
    subgerencia_contratos: "Subgerencia de Contratos",
    subgerencia_factibilidades: "Subgerencia de Factibilidades",
    subgerencia_inspeccion_vigilancia: "Subgerencia de Inspección y Vigilancia",
    subgerencia_lecturas: "Subgerencia de Lecturas",
    subgerencia_limitacion_reconexion: "Subgerencia de Limitación y Reconexión de Servicio",
    subgerencia_servicio_cliente: "Subgerencia de Servicio al Cliente",
    subgerencia_soporte_tecnico: "Subgerencia de Soporte Técnico",
  };
  return names[userType] || userType;
}

