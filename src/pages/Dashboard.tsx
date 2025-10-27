import { StatCard } from "@/components/StatCard";
import { TicketCard } from "@/components/TicketCard";
import { useNavigate } from "react-router-dom";
import {
  Ticket,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
} from "lucide-react";

const recentTickets = [
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
];

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Resumen general del sistema de tickets
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total de Tickets"
          value="248"
          icon={Ticket}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="En Progreso"
          value="45"
          icon={Clock}
          trend={{ value: 8, isPositive: false }}
        />
        <StatCard
          title="Resueltos"
          value="189"
          icon={CheckCircle2}
          trend={{ value: 15, isPositive: true }}
        />
        <StatCard
          title="Urgentes"
          value="14"
          icon={AlertCircle}
          trend={{ value: 3, isPositive: false }}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Tickets Recientes</h2>
            <button
              onClick={() => navigate("/tickets")}
              className="text-sm text-primary hover:underline"
            >
              Ver todos
            </button>
          </div>
          <div className="space-y-3">
            {recentTickets.map((ticket) => (
              <TicketCard
                key={ticket.id}
                {...ticket}
                onClick={() => navigate(`/tickets/${ticket.id}`)}
              />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Estadísticas del Mes</h2>
          <div className="rounded-lg border bg-card p-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Tasa de Resolución</p>
                  <p className="text-2xl font-bold">76%</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-card">
                  <TrendingUp className="h-6 w-6 text-success" />
                </div>
              </div>

              <div className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Resueltos</span>
                    <span className="font-medium">189</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                    <div className="h-full w-[76%] bg-gradient-primary rounded-full" />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">En Progreso</span>
                    <span className="font-medium">45</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                    <div className="h-full w-[18%] bg-warning rounded-full" />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Pendientes</span>
                    <span className="font-medium">14</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                    <div className="h-full w-[6%] bg-destructive rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
