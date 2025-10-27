import { useState } from "react";
import { TicketCard } from "@/components/TicketCard";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Plus, Filter } from "lucide-react";

const allTickets = [
  {
    id: "TKT-1234",
    title: "Fuga de agua en Av. Constituyentes",
    description: "Reporte de fuga importante en la zona centro, requiere atención inmediata",
    status: "en_progreso" as const,
    priority: "urgente" as const,
    assignedTo: "Juan Pérez",
    createdAt: "Hace 2 horas",
  },
  {
    id: "TKT-1235",
    title: "Baja presión de agua",
    description: "Vecinos reportan baja presión en Col. Jardines",
    status: "abierto" as const,
    priority: "media" as const,
    assignedTo: "María González",
    createdAt: "Hace 5 horas",
  },
  {
    id: "TKT-1236",
    title: "Solicitud de nuevo medidor",
    description: "Cliente solicita instalación de medidor en nueva construcción",
    status: "resuelto" as const,
    priority: "baja" as const,
    assignedTo: "Carlos Ramírez",
    createdAt: "Ayer",
  },
  {
    id: "TKT-1237",
    title: "Facturación incorrecta",
    description: "Cliente reporta cobro excesivo en último recibo",
    status: "abierto" as const,
    priority: "alta" as const,
    assignedTo: "Ana López",
    createdAt: "Hace 1 día",
  },
  {
    id: "TKT-1238",
    title: "Corte de servicio programado",
    description: "Solicitud de información sobre corte programado",
    status: "cerrado" as const,
    priority: "baja" as const,
    assignedTo: "Luis Torres",
    createdAt: "Hace 2 días",
  },
  {
    id: "TKT-1239",
    title: "Cambio de titular",
    description: "Solicitud de cambio de titular en contrato",
    status: "en_progreso" as const,
    priority: "media" as const,
    assignedTo: "Pedro Sánchez",
    createdAt: "Hace 3 días",
  },
];

export default function Tickets() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [priorityFilter, setPriorityFilter] = useState<string>("todos");

  const filteredTickets = allTickets.filter((ticket) => {
    const matchesSearch =
      ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "todos" || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === "todos" || ticket.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tickets</h1>
          <p className="text-muted-foreground">
            Gestiona todos los tickets del sistema
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Ticket
        </Button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar tickets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los estados</SelectItem>
              <SelectItem value="abierto">Abierto</SelectItem>
              <SelectItem value="en_progreso">En Progreso</SelectItem>
              <SelectItem value="resuelto">Resuelto</SelectItem>
              <SelectItem value="cerrado">Cerrado</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[160px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Prioridad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas las prioridades</SelectItem>
              <SelectItem value="baja">Baja</SelectItem>
              <SelectItem value="media">Media</SelectItem>
              <SelectItem value="alta">Alta</SelectItem>
              <SelectItem value="urgente">Urgente</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        Mostrando {filteredTickets.length} de {allTickets.length} tickets
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredTickets.map((ticket) => (
          <TicketCard
            key={ticket.id}
            {...ticket}
            onClick={() => navigate(`/tickets/${ticket.id}`)}
          />
        ))}
      </div>

      {filteredTickets.length === 0 && (
        <div className="flex min-h-[400px] items-center justify-center rounded-lg border border-dashed">
          <div className="text-center">
            <p className="text-lg font-medium">No se encontraron tickets</p>
            <p className="text-sm text-muted-foreground">
              Intenta ajustar los filtros de búsqueda
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
