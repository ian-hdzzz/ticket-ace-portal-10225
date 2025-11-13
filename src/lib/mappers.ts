/**
 * Data mapping utilities for converting between API and UI formats
 */

/**
 * Map status from English (API) to Spanish (UI)
 */
export function mapStatus(status: string): "abierto" | "en_progreso" | "resuelto" | "cerrado" {
  if (status === "open") return "abierto";
  if (status === "in_progress") return "en_progreso";
  if (status === "resolved") return "resuelto";
  if (status === "closed") return "cerrado";
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
  if (priority === "low") return "baja";
  if (priority === "medium") return "media";
  if (priority === "high") return "alta";
  if (priority === "urgent") return "urgente";
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
    email: "Email",
    app: "App",
    presencial: "Presencial",
    web: "Web",
  };
  return map[channel] || channel;
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
  };
  return map[group] || group;
}

