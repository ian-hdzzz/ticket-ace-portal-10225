import type { Agent } from "@/types/entities";
import { isDemoMode } from "@/lib/config";
import { getSupabaseClient } from "@/lib/supabaseClient";

// ============================================================================
// DEMO MODE: Mock data storage
// ============================================================================
const mockAgents: Agent[] = [
  {
    id: "1",
    name: "Juan Pérez",
    type: "chat",
    status: "active",
    model: "gpt-4",
    voice: null,
    system_prompt: "Eres un agente de tickets de la CEA Querétaro. Tu objetivo es crear tickets correctos y completos en el sistema de soporte. Mantén tono institucional, claro y cordial. Recopila sólo la información mínima necesaria para iniciar un ticket: nombre del solicitante, medio de contacto, área/ubicación, descripción del problema o solicitud, impacto (a cuántas personas/servicios afecta) y urgencia. Si falta un dato clave, realiza una pregunta breve y con opciones cuando sea posible. No inventes datos ni prometas tiempos que no estén establecidos. Cuando tengas lo mínimo, genera: 1) título breve del ticket, 2) descripción clara, 3) categoría sugerida, 4) prioridad sugerida basada en impacto/urgencia, 5) adjuntos o evidencias si aplica. Si la consulta no es para crear ticket, orienta al área correspondiente.",
    assignment_rules: "Tickets urgentes y de alta prioridad",
    last_updated: new Date().toISOString(),
  },
  {
    id: "2",
    name: "María González",
    type: "chat",
    status: "active",
    model: "gpt-3.5-turbo",
    voice: null,
    system_prompt: "Eres un agente de tickets de la CEA Querétaro enfocado en atención al usuario. Tu función es dar de alta tickets relacionados con solicitudes o incidencias (por ejemplo: facturación, contratos, reportes). Pide sólo datos imprescindibles: nombre del solicitante, contacto, número de cuenta/contrato si aplica, ubicación, descripción, impacto y urgencia. Confirma con el usuario la categoría y sugiere prioridad basada en impacto/urgencia. Mantén un lenguaje claro y respetuoso; no realices acciones fuera del registro del ticket. Si la situación requiere otra área, registra el ticket y especifica el área destino.",
    assignment_rules: "Tickets relacionados con facturación",
    last_updated: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Carlos Ramírez",
    type: "voice",
    status: "active",
    model: "whisper",
    voice: "es-ES",
    system_prompt: "Atiendes vía voz como agente de tickets de la CEA Querétaro. Habla en frases breves y claras, confirmando datos clave para abrir el ticket: nombre, teléfono de contacto, ubicación, breve descripción, impacto y urgencia. Repite para confirmar antes de registrar. No compartas información sensible ni prometas tiempos específicos. Si hay riesgo o emergencia, indícalo en el ticket y sugiere marcar prioridad alta.",
    assignment_rules: "Llamadas de emergencia",
    last_updated: new Date().toISOString(),
  },
  {
    id: "4",
    name: "Ana Martínez",
    type: "chat",
    status: "inactive",
    model: "gpt-4",
    voice: null,
    system_prompt: "Eres un agente de tickets de la CEA Querétaro orientado a soporte técnico general. Tu meta es registrar adecuadamente solicitudes e incidencias. Solicita sólo la información mínima: solicitante, contacto, ubicación/activo, error o síntoma exacto, impacto y urgencia, más evidencia si existe. No diagnostiques a profundidad; enfócate en capturar datos útiles para el equipo resolutor y proponer categoría y prioridad sugeridas. No pidas ni compartas credenciales.",
    assignment_rules: "Tickets técnicos y de infraestructura",
    last_updated: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Simulate API delay for demo mode
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// ============================================================================
// DEMO MODE: Mock API functions
// ============================================================================
async function listAgentsDemo(): Promise<Agent[]> {
  await delay(300);
  return [...mockAgents].sort((a, b) => a.name.localeCompare(b.name));
}

async function getAgentByIdDemo(id: string): Promise<Agent | null> {
  await delay(200);
  return mockAgents.find((a) => a.id === id) || null;
}

async function createAgentDemo(partial: Omit<Agent, "id" | "last_updated">): Promise<Agent> {
  await delay(300);
  const agent: Agent = {
    id: String(Date.now()),
    last_updated: new Date().toISOString(),
    ...partial,
  };
  mockAgents.push(agent);
  return agent;
}

async function updateAgentDemo(id: string, changes: Partial<Agent>): Promise<Agent> {
  await delay(300);
  const index = mockAgents.findIndex((a) => a.id === id);
  if (index === -1) {
    throw new Error("Agent not found");
  }
  const updated: Agent = {
    ...mockAgents[index],
    ...changes,
    last_updated: new Date().toISOString(),
  };
  mockAgents[index] = updated;
  return updated;
}

async function deleteAgentDemo(id: string): Promise<boolean> {
  await delay(300);
  const index = mockAgents.findIndex((a) => a.id === id);
  if (index === -1) {
    return false;
  }
  mockAgents.splice(index, 1);
  return true;
}

// ============================================================================
// PRODUCTION MODE: Supabase API functions
// ============================================================================
async function listAgentsProduction(): Promise<Agent[]> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error("Supabase client not available. Check your configuration.");
  }

  const { data, error } = await supabase
    .from("agents")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch agents: ${error.message}`);
  }

  return (data || []) as Agent[];
}

async function getAgentByIdProduction(id: string): Promise<Agent | null> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error("Supabase client not available. Check your configuration.");
  }

  const { data, error } = await supabase
    .from("agents")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw new Error(`Failed to fetch agent: ${error.message}`);
  }

  return data as Agent;
}

async function createAgentProduction(partial: Omit<Agent, "id" | "last_updated">): Promise<Agent> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error("Supabase client not available. Check your configuration.");
  }

  const { data, error } = await supabase
    .from("agents")
    .insert({
      ...partial,
      last_updated: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create agent: ${error.message}`);
  }

  return data as Agent;
}

async function updateAgentProduction(id: string, changes: Partial<Agent>): Promise<Agent> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error("Supabase client not available. Check your configuration.");
  }

  const { data, error } = await supabase
    .from("agents")
    .update({
      ...changes,
      last_updated: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update agent: ${error.message}`);
  }

  return data as Agent;
}

async function deleteAgentProduction(id: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error("Supabase client not available. Check your configuration.");
  }

  const { error } = await supabase
    .from("agents")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(`Failed to delete agent: ${error.message}`);
  }

  return true;
}

// ============================================================================
// PUBLIC API: Mode-aware functions
// ============================================================================
export async function listAgents(): Promise<Agent[]> {
  return isDemoMode() ? listAgentsDemo() : listAgentsProduction();
}

export async function getAgentById(id: string): Promise<Agent | null> {
  return isDemoMode() ? getAgentByIdDemo(id) : getAgentByIdProduction(id);
}

export async function createAgent(partial: Omit<Agent, "id" | "last_updated">): Promise<Agent> {
  return isDemoMode() ? createAgentDemo(partial) : createAgentProduction(partial);
}

export async function updateAgent(id: string, changes: Partial<Agent>): Promise<Agent> {
  return isDemoMode() ? updateAgentDemo(id, changes) : updateAgentProduction(id, changes);
}

export async function deleteAgent(id: string): Promise<boolean> {
  return isDemoMode() ? deleteAgentDemo(id) : deleteAgentProduction(id);
}
