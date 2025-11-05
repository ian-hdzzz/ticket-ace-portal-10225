import type { Agent } from "@/types/entities";

// Mock data storage (in a real app, this would be replaced with your backend API)
const mockAgents: Agent[] = [
  {
    id: "1",
    name: "Juan Pérez",
    type: "chat",
    status: "active",
    model: "gpt-4",
    voice: null,
    system_prompt: "Eres un asistente amable y profesional",
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
    system_prompt: "Eres especialista en facturación y atención al cliente",
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
    system_prompt: "Eres un asistente de voz profesional",
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
    system_prompt: "Eres un asistente técnico",
    assignment_rules: "Tickets técnicos y de infraestructura",
    last_updated: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function listAgents(): Promise<Agent[]> {
  await delay(300);
  return [...mockAgents].sort((a, b) => a.name.localeCompare(b.name));
}

export async function createAgent(partial: Omit<Agent, "id" | "last_updated">): Promise<Agent> {
  await delay(300);
  const agent: Agent = {
    id: String(Date.now()),
    last_updated: new Date().toISOString(),
    ...partial,
  };
  mockAgents.push(agent);
  return agent;
}

export async function updateAgent(id: string, changes: Partial<Agent>): Promise<Agent> {
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
