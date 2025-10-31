import { StatCard } from "@/components/features/StatCard";
import { TicketCard } from "@/components/features/TicketCard";
import { useNavigate } from "react-router-dom";
import {
  Ticket,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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

const ticketTrendData = [
  { day: "Lun", tickets: 45, resueltos: 38 },
  { day: "Mar", tickets: 52, resueltos: 42 },
  { day: "Mié", tickets: 48, resueltos: 45 },
  { day: "Jue", tickets: 61, resueltos: 48 },
  { day: "Vie", tickets: 55, resueltos: 51 },
  { day: "Sáb", tickets: 38, resueltos: 35 },
  { day: "Dom", tickets: 32, resueltos: 30 },
];

const categoryData = [
  { category: "Infraestructura", count: 89 },
  { category: "Facturación", count: 67 },
  { category: "Medidores", count: 45 },
  { category: "Atención", count: 34 },
  { category: "Emergencias", count: 13 },
];

const resolutionData = [
  { time: "00:00", tasa: 68 },
  { time: "04:00", tasa: 72 },
  { time: "08:00", tasa: 75 },
  { time: "12:00", tasa: 76 },
  { time: "16:00", tasa: 78 },
  { time: "20:00", tasa: 76 },
  { time: "23:59", tasa: 76 },
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

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tendencia de Tickets</CardTitle>
            <CardDescription>Tickets creados vs resueltos (última semana)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={ticketTrendData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="day" className="text-muted-foreground" />
                <YAxis className="text-muted-foreground" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="tickets"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  name="Tickets"
                />
                <Line
                  type="monotone"
                  dataKey="resueltos"
                  stroke="hsl(var(--success))"
                  strokeWidth={2}
                  name="Resueltos"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tickets por Categoría</CardTitle>
            <CardDescription>Distribución de tickets por tipo</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="category" className="text-muted-foreground" />
                <YAxis className="text-muted-foreground" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}
                />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} name="Tickets" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tasa de Resolución en Tiempo Real</CardTitle>
            <CardDescription>Evolución de la tasa de resolución hoy</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={resolutionData}>
                <defs>
                  <linearGradient id="colorTasa" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="time" className="text-muted-foreground" />
                <YAxis className="text-muted-foreground" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="tasa"
                  stroke="hsl(var(--success))"
                  fillOpacity={1}
                  fill="url(#colorTasa)"
                  name="Tasa %"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

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
      </div>
    </div>
  );
}
