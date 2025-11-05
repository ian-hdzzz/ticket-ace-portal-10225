import type { Ticket } from "@/types/entities";

// Mock data storage (in a real app, this would be replaced with your backend API)
const mockTickets: Ticket[] = [
  {
    id: "1",
    title: "Fuga de agua en Av. Constituyentes",
    description: "Reporte de fuga importante en la zona centro, requiere atención inmediata",
    status: "open",
    priority: "urgent",
    agent_id: null,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updated_at: null,
  },
  {
    id: "2",
    title: "Baja presión de agua",
    description: "Vecinos reportan baja presión en Col. Jardines",
    status: "in_progress",
    priority: "high",
    agent_id: "1",
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "3",
    title: "Solicitud de nuevo medidor",
    description: "Cliente solicita instalación de medidor en nueva construcción",
    status: "resolved",
    priority: "medium",
    agent_id: "2",
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "4",
    title: "Consulta sobre facturación",
    description: "Cliente tiene dudas sobre el monto de su factura",
    status: "open",
    priority: "low",
    agent_id: null,
    created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    updated_at: null,
  },
  {
    id: "5",
    title: "Reporte de medidor defectuoso",
    description: "El medidor no registra correctamente el consumo",
    status: "in_progress",
    priority: "high",
    agent_id: "1",
    created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
];

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function listTickets(): Promise<Ticket[]> {
  await delay(300); // Simulate network delay
  return [...mockTickets].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export async function getTicketById(id: string): Promise<Ticket | null> {
  await delay(200);
  return mockTickets.find((t) => t.id === id) || null;
}

export async function createTicket(partial: Omit<Ticket, "id" | "created_at" | "updated_at">): Promise<Ticket> {
  await delay(300);
  const ticket: Ticket = {
    id: String(Date.now()),
    created_at: new Date().toISOString(),
    updated_at: null,
    ...partial,
  };
  mockTickets.push(ticket);
  return ticket;
}

export async function updateTicket(id: string, changes: Partial<Ticket>): Promise<Ticket> {
  await delay(300);
  const index = mockTickets.findIndex((t) => t.id === id);
  if (index === -1) {
    throw new Error("Ticket not found");
  }
  const updated: Ticket = {
    ...mockTickets[index],
    ...changes,
    updated_at: new Date().toISOString(),
  };
  mockTickets[index] = updated;
  return updated;
}
