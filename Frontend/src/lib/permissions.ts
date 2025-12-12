/**
 * Mapa de permisos por ruta
 * Útil para verificar acceso a rutas de manera centralizada
 */

export const ROUTE_PERMISSIONS = {
  // Dashboard
  '/dashboard': ['acceso_dashboard', 'view_dashboard'],
  
  // Tickets
  '/dashboard/tickets': ['ver_tickets', 'view_tickets'],
  '/dashboard/tickets/new': ['crear_ticket', 'create_ticket'],
  '/dashboard/tickets/:id': ['ver_tickets', 'view_tickets'],
  
  // Contratos
  '/dashboard/contratos': ['ver_numero_contratos', 'view_contracts'],
  '/dashboard/contratos/detail/:id': ['view_contract_details', 'ver_numero_contratos'],
  
  // Lecturas
  '/dashboard/lecturas/:contratoId/:explotacion': ['ver_lecturas', 'view_readings'],
  
  // Deuda
  '/dashboard/deuda/:contratoId/:explotacion': ['ver_deuda', 'view_debt'],
  
  // Agentes
  '/dashboard/agents': ['manage_agents', 'crear_agente', 'editar_agente'],
  
  // Configuración
  '/dashboard/settings': ['view_settings', 'acceso_dashboard'],
  
  // Admin
  '/dashboard/admin': ['access_admin_panel', 'asignar_roles', 'editar_info_usuario'],
} as const;

/**
 * Nombres de privilegios disponibles en el sistema
 */
export const PRIVILEGES = {
  // Dashboard
  DASHBOARD_ACCESS: 'acceso_dashboard',
  DASHBOARD_VIEW: 'view_dashboard',
  
  // Tickets
  TICKETS_VIEW: 'ver_tickets',
  TICKETS_VIEW_ALT: 'view_tickets',
  TICKETS_CREATE: 'crear_ticket',
  TICKETS_CREATE_ALT: 'create_ticket',
  TICKETS_EDIT: 'editar_ticket',
  TICKETS_TAKE: 'tomar_ticket',
  TICKETS_CLOSE: 'cerrar_ticket',
  TICKETS_REOPEN: 'reabrir_ticket',
  TICKETS_ASSIGN: 'asignar_ticket',
  TICKETS_REASSIGN: 'reasignar_ticket',
  TICKETS_PRIORITIZE: 'priorizar_ticket',
  TICKETS_HISTORY: 'ver_historial_conversacion',
  TICKETS_ATTACH: 'adjuntar_archivos',
  TICKETS_MANAGE: 'manage_tickets',
  
  // Reportes
  REPORTS_GENERATE: 'generar_reportes',
  REPORTS_DOWNLOAD: 'descargar_reportes',
  REPORTS_SHARE: 'compartir_reportes',
  
  // Usuarios
  USERS_APPROVE: 'aprobar_usuario',
  USERS_EDIT: 'editar_info_usuario',
  USERS_DELETE: 'eliminar_usuario',
  USERS_ASSIGN_ROLES: 'asignar_roles',
  
  // Agentes
  AGENTS_CREATE: 'crear_agente',
  AGENTS_EDIT: 'editar_agente',
  AGENTS_DELETE: 'eliminar_agente',
  AGENTS_MANAGE: 'manage_agents',
  
  // Contratos
  CONTRACTS_VIEW: 'ver_numero_contratos',
  CONTRACTS_VIEW_ALT: 'view_contracts',
  CONTRACTS_DETAILS: 'view_contract_details',
  CONTRACTS_MANAGE: 'manage_contracts',
  
  // Lecturas
  READINGS_VIEW: 'ver_lecturas',
  READINGS_VIEW_ALT: 'view_readings',
  
  // Deuda
  DEBT_VIEW: 'ver_deuda',
  DEBT_VIEW_ALT: 'view_debt',
  
  // Órdenes
  WORK_ORDER_CREATE: 'crear_orden_trabajo',
  
  // Admin
  ADMIN_PANEL_ACCESS: 'access_admin_panel',
  
  // Configuración
  SETTINGS_VIEW: 'view_settings',
} as const;

/**
 * Nombres de roles disponibles en el sistema
 */
export const ROLES = {
  CIUDADANO: 'Ciudadano',
  REPRESENTANTE: 'Representante de organización',
  AGENTE_CONTACTO: 'Agente de Contacto',
  AGENTE_RESOLUTORA: 'Agente de Área Resolutora',
  COORDINADOR: 'Coordinador de Área',
  DUENO_PROCESO: 'Dueño de Proceso / Servicio',
  ADMIN_FUNCIONAL: 'Administrador Funcional',
  ADMIN_TECNICO: 'Administrador Técnico',
  AUDITOR: 'Auditor / Transparencia',
  ADMINISTRADOR: 'Administrador',
} as const;

/**
 * Helper para verificar si una ruta requiere permisos específicos
 */
export function getRoutePermissions(path: string): readonly string[] | undefined {
  return ROUTE_PERMISSIONS[path as keyof typeof ROUTE_PERMISSIONS];
}

/**
 * Helper para obtener todos los permisos de tickets
 */
export function getTicketPermissions(): string[] {
  return [
    PRIVILEGES.TICKETS_VIEW,
    PRIVILEGES.TICKETS_VIEW_ALT,
    PRIVILEGES.TICKETS_CREATE,
    PRIVILEGES.TICKETS_CREATE_ALT,
    PRIVILEGES.TICKETS_EDIT,
    PRIVILEGES.TICKETS_TAKE,
    PRIVILEGES.TICKETS_CLOSE,
    PRIVILEGES.TICKETS_REOPEN,
    PRIVILEGES.TICKETS_ASSIGN,
    PRIVILEGES.TICKETS_REASSIGN,
    PRIVILEGES.TICKETS_PRIORITIZE,
    PRIVILEGES.TICKETS_HISTORY,
    PRIVILEGES.TICKETS_ATTACH,
    PRIVILEGES.TICKETS_MANAGE,
  ];
}

/**
 * Helper para obtener permisos de administración
 */
export function getAdminPermissions(): string[] {
  return [
    PRIVILEGES.ADMIN_PANEL_ACCESS,
    PRIVILEGES.USERS_ASSIGN_ROLES,
    PRIVILEGES.USERS_EDIT,
    PRIVILEGES.USERS_DELETE,
    PRIVILEGES.USERS_APPROVE,
  ];
}
