/**
 * Data mapping utilities for converting between API and UI formats
 */

/**
 * Map status from English (API) to Spanish (UI)
 */
export function mapStatus(status: string): "abierto" | "en_progreso" | "resuelto" | "cerrado" {
  if (status === "open" || status === "abierto") return "abierto";
  if (status === "in_progress" || status === "en_progreso") return "en_progreso";
  if (status === "resolved" || status === "resuelto") return "resuelto";
  if (status === "closed" || status === "cerrado") return "cerrado";
  return "abierto";
}

/**
 * Map status from Spanish (UI) to English (API)
 */
export function mapStatusToApi(status: string): "open" | "in_progress" | "resolved" | "closed" {
  if (status === "abierto") return "open";
  if (status === "en_progreso") return "in_progress";
  if (status === "resuelto") return "resolved";
  if (status === "cerrado") return "closed";
  return "open";
}

/**
 * Map priority from English (API) to Spanish (UI)
 */
export function mapPriority(priority: string): "baja" | "media" | "alta" | "urgente" {
  if (priority === "low" || priority === "baja") return "baja";
  if (priority === "medium" || priority === "media") return "media";
  if (priority === "high" || priority === "alta") return "alta";
  if (priority === "urgent" || priority === "urgente") return "urgente";
  return "media";
}

/**
 * Map priority from Spanish (UI) to English (API)
 */
export function mapPriorityToApi(priority: string): "low" | "medium" | "high" | "urgent" {
  if (priority === "baja") return "low";
  if (priority === "media") return "medium";
  if (priority === "alta") return "high";
  if (priority === "urgente") return "urgent";
  return "medium";
}

/**
 * Map channel from English (API) to Spanish (UI)
 */
export function mapChannel(channel: string): string {
  const map: Record<string, string> = {
    telefono: "Teléfono",
    phone: "Teléfono",
    email: "Email",
    app: "App",
    presencial: "Presencial",
    web: "Web",
    whatsapp: "WhatsApp",
    chat: "Chat",
  };
  return map[channel] || channel || "Web";
}

/**
 * Map assignment group from English (API) to Spanish (UI)
 */
export function mapAssignmentGroup(group: string): string {
  const map: Record<string, string> = {
    distribucion: "Distribución",
    atencion_cliente: "Atención al Cliente",
    call_center: "Call Center",
    comercial: "Comercial",
    reportes_fugas: "Reportes de Fugas",
    general: "General",
  };
  return map[group] || group || "General";
}

