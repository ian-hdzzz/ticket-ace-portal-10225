// Label personalizado para el eje X de la gráfica de categorías
function CategoryTick(props) {
  const { x, y, payload } = props;
  return (
    <text
      x={x}
      y={y + 20}
      textAnchor="middle"
      fontSize={13}
      fill="#64748b"
    >
      {payload.value}
    </text>
  );
}
import { StatCard } from "@/components/features/StatCard";
import { TicketCard } from "@/components/features/TicketCard";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "../supabase/client";
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

// ...existing code...

const daysOfWeek = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

function getLastWeekTrend(tickets) {
  // Obtener fechas de los últimos 7 días
  const now = new Date();
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    days.push(d);
  }
  // Inicializar datos
  const trend = days.map(date => {
    const dayName = daysOfWeek[date.getDay()];
    // Tickets creados ese día
    const ticketsCreated = tickets.filter(t => {
      const created = new Date(t.created_at);
      return created.getFullYear() === date.getFullYear() &&
        created.getMonth() === date.getMonth() &&
        created.getDate() === date.getDate();
    }).length;
    // Tickets resueltos ese día
    const ticketsResolved = tickets.filter(t => {
      if (!t.resolved_at) return false;
      const resolved = new Date(t.resolved_at);
      return resolved.getFullYear() === date.getFullYear() &&
        resolved.getMonth() === date.getMonth() &&
        resolved.getDate() === date.getDate();
    }).length;
    return {
      day: dayName,
      tickets: ticketsCreated,
      resueltos: ticketsResolved,
    };
  });
  return trend;
}

// Mapeo de ticket_type a nombre legible
const ticketTypeLabels = {
  FUG: "Fugas",
  ACL: "Aclaraciones",
  CON: "Contratación",
  PAG: "Pago",
  LEC: "Lectura",
  REV: "Revisión",
  DIG: "Digital",
  ACT: "Actualizar Caso",
  URG: "Urgente",
};

function getCategoryData(tickets) {
  // Inicializar todos los tipos posibles en 0
  const allTypes = Object.keys(ticketTypeLabels);
  const counts = {};
  allTypes.forEach(type => {
    counts[type] = 0;
  });
  // Contar tickets por tipo
  tickets.forEach(t => {
    const type = t.ticket_type;
    if (!type) return;
    if (counts[type] !== undefined) {
      counts[type] += 1;
    }
  });
  // Convertir a arreglo para la gráfica
  return allTypes.map(type => ({
    category: ticketTypeLabels[type] || type,
    count: counts[type],
  }));
}

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
  // Recuperar usuario y rol de la sesión
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const fullName = user?.full_name || "";
  const [role, setRole] = useState("");

  // Tickets y métricas
  const [tickets, setTickets] = useState([]);
  const [metrics, setMetrics] = useState({
    total: 0,
    enProgreso: 0,
    resueltos: 0,
    urgentes: 0,
    tendencia: { value: 0, isPositive: true },
    enProgresoTrend: { value: 0, isPositive: false },
    resueltosTrend: { value: 0, isPositive: true },
    urgentesTrend: { value: 0, isPositive: false },
  });
  const [ticketTrendData, setTicketTrendData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  // Rango de fechas
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    end: new Date(),
  });

  // Obtener el rol del usuario desde la base de datos (solo si hay usuario)
  useEffect(() => {
    async function fetchRole() {
      if (!user?.id) return;
      const { data } = await supabase
        .from('users_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();
      if (data?.role) setRole(data.role);
    }
    fetchRole();
  }, [user]);

  // Obtener tickets de Supabase y calcular métricas
  useEffect(() => {
    async function fetchTickets() {
      const { data, error } = await supabase
        .from('tickets')
        .select('*');
      if (error) return;
      setTickets(data || []);

      // Filtrar por rango de fechas
      const filtered = (data || []).filter(t => {
        const created = new Date(t.created_at);
        return created >= dateRange.start && created <= dateRange.end;
      });

      // Calcular métricas
      const total = filtered.length;
      const enProgreso = filtered.filter(t => [
        'en_proceso',
        'en_progreso',
        'esperando_cliente'
      ].includes(t.status)).length;
      const resueltos = filtered.filter(t => t.status === 'resuelto').length;
      const urgentes = filtered.filter(t => t.priority === 'urgente').length;

      // Calcular tickets creados en el rango y en el rango anterior (para tendencia)
      const rangeDays = Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24));
      const prevStart = new Date(dateRange.start);
      prevStart.setDate(prevStart.getDate() - rangeDays);
      const prevEnd = new Date(dateRange.start);
      prevEnd.setDate(prevEnd.getDate() - 1);
      const prevFiltered = (data || []).filter(t => {
        const created = new Date(t.created_at);
        return created >= prevStart && created <= prevEnd;
      });

      // Porcentaje de cambio
      const lastCount = prevFiltered.length;
      const currentCount = filtered.length;
      let percentChange = 0;
      let isPositive = true;
      if (lastCount > 0) {
        percentChange = Math.round(((currentCount - lastCount) / lastCount) * 100);
        isPositive = percentChange >= 0;
      } else if (currentCount > 0) {
        percentChange = 100;
        isPositive = true;
      }

      setMetrics({
        total,
        enProgreso,
        resueltos,
        urgentes,
        tendencia: { value: Math.abs(percentChange), isPositive },
        enProgresoTrend: { value: 8, isPositive: false },
        resueltosTrend: { value: 15, isPositive: true },
        urgentesTrend: { value: 3, isPositive: false },
      });

      // Calcular tendencia semanal
      setTicketTrendData(getLastWeekTrend(filtered));
      // Calcular datos por categoría
      setCategoryData(getCategoryData(filtered));
    }
    fetchTickets();
  }, [dateRange]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Resumen general del sistema de tickets
        </p>
        <div className="flex gap-4 items-center mt-4">
          <label className="text-sm font-medium">Desde:</label>
          <input
            type="date"
            value={dateRange.start.toISOString().slice(0, 10)}
            onChange={e => setDateRange(r => ({ ...r, start: new Date(e.target.value) }))}
            className="border rounded px-2 py-1"
          />
          <label className="text-sm font-medium">Hasta:</label>
          <input
            type="date"
            value={dateRange.end.toISOString().slice(0, 10)}
            onChange={e => setDateRange(r => ({ ...r, end: new Date(e.target.value + 'T23:59:59') }))}
            className="border rounded px-2 py-1"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total de Tickets"
          value={metrics.total.toString()}
          icon={Ticket}
          trend={metrics.tendencia}
        />
        <StatCard
          title="En Progreso"
          value={metrics.enProgreso.toString()}
          icon={Clock}
          trend={metrics.enProgresoTrend}
        />
        <StatCard
          title="Resueltos"
          value={metrics.resueltos.toString()}
          icon={CheckCircle2}
          trend={metrics.resueltosTrend}
        />
        <StatCard
          title="Urgentes"
          value={metrics.urgentes.toString()}
          icon={AlertCircle}
          trend={metrics.urgentesTrend}
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
        
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Tickets por Categoría</CardTitle>
            <CardDescription>Distribución de tickets por tipo</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData} margin={{ left: 10, right: 20, top: 20, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis
                  dataKey="category"
                  className="text-muted-foreground"
                  interval={0}
                  tick={<CategoryTick />}
                />
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
    </div>
  );
}
