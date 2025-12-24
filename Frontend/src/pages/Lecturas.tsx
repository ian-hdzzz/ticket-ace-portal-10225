import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Loader2,
  Droplet,
  TrendingUp,
  TrendingDown,
  Calendar,
  BarChart3,
  AlertCircle,
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toast } from "sonner";
import { xmlToJson } from "@/api/cea";

interface Lectura {
  año: string;
  estimado: boolean;
  metrosCubicos: number;
  periodicidad: string;
  periodo: string;
  fechaLectura: string;
  consumo?: number; // Diferencia entre lecturas
}

export default function Lecturas() {
  const { contratoId, explotacion } = useParams();
  const navigate = useNavigate();
  
  usePageTitle(`Lecturas - Contrato ${contratoId}`, "Historial de consumo de agua");

  const [lecturas, setLecturas] = useState<Lectura[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string>("todos");
  const [availableYears, setAvailableYears] = useState<string[]>([]);

  useEffect(() => {
    const fetchLecturas = async () => {
      if (!contratoId || !explotacion) {
        setError("Faltan parámetros requeridos");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const { getLecturas } = await import("@/api/cea");
        const xmlDoc = await getLecturas(explotacion, contratoId);
        const data = xmlToJson(xmlDoc);

        console.log("Datos de lecturas:", data);

        // Extraer lecturas del XML parseado
        const lecturasRaw = data?.Body?.getLecturasResponse?.getLecturasReturn?.Lectura;

        if (!lecturasRaw) {
          throw new Error(`No se encontraron lecturas para el contrato con ese número de explotación ${explotacion}`);
        }

        // Asegurar que sea un array
        const lecturasArray = Array.isArray(lecturasRaw) ? lecturasRaw : [lecturasRaw];

        // Transformar y ordenar lecturas (más reciente primero)
        const lecturasTransformadas: Lectura[] = lecturasArray
          .map((l: any, index: number, arr: any[]) => {
            const metrosCubicos = parseInt(l.metrosCubicos) || 0;
            const siguiente = arr[index + 1];
            const consumo = siguiente ? metrosCubicos - (parseInt(siguiente.metrosCubicos) || 0) : 0;

            return {
              año: l.año,
              estimado: l.estimado === "true",
              metrosCubicos,
              periodicidad: l.periodicidad,
              periodo: l.periodo?.replace(/<|>/g, '') || '',
              fechaLectura: l.fechaLectura,
              consumo,
            };
          })
          .sort((a, b) => new Date(b.fechaLectura).getTime() - new Date(a.fechaLectura).getTime());

        setLecturas(lecturasTransformadas);

        // Extraer años únicos
        const years = [...new Set(lecturasTransformadas.map(l => l.año))].sort((a, b) => parseInt(b) - parseInt(a));
        setAvailableYears(years);

      } catch (e: any) {
        console.error("Error al obtener lecturas:", e);
        setError(`Error al cargar lecturas: ${e.message || 'Error desconocido'}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLecturas();
  }, [contratoId, explotacion]);

  // Filtrar lecturas por año
  const lecturasFiltradas = selectedYear === "todos" 
    ? lecturas 
    : lecturas.filter(l => l.año === selectedYear);

  // Calcular estadísticas
  const stats = {
    promedio: lecturasFiltradas.length > 0 
      ? Math.round(lecturasFiltradas.reduce((sum, l) => sum + (l.consumo || 0), 0) / lecturasFiltradas.length)
      : 0,
    maximo: Math.max(...lecturasFiltradas.map(l => l.consumo || 0), 0),
    minimo: lecturasFiltradas.length > 0 
      ? Math.min(...lecturasFiltradas.filter(l => (l.consumo || 0) > 0).map(l => l.consumo || 0))
      : 0,
    totalEstimadas: lecturasFiltradas.filter(l => l.estimado).length,
  };

  // Datos para el gráfico (invertir para mostrar más antiguo → más reciente)
  const chartData = [...lecturasFiltradas]
    .reverse()
    .slice(-12) // Últimos 12 meses
    .map(l => ({
      periodo: l.periodo,
      consumo: l.consumo || 0,
      estimado: l.estimado,
    }));

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold">Cargando lecturas...</h2>
          <p className="text-muted-foreground mt-2">
            Obteniendo historial de consumo del contrato {contratoId}
          </p>
        </div>
      </div>
    );
  }

  if (error || lecturas.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center px-4">
        <div className="text-center max-w-xl">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold px-8">
            No se encontraron lecturas
          </h2>
          <p className="text-muted-foreground mt-3 px-12 leading-relaxed">
            {error 
              ? error
              : `No se encontraron lecturas para el contrato con ese número de explotación ${explotacion}`}
          </p>
          <div className="flex gap-2 justify-center mt-6">
            <Button onClick={() => navigate(-1)}>
              Volver
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Historial de Lecturas</h1>
          <p className="text-muted-foreground">Contrato: {contratoId} | Explotación: {explotacion}</p>
        </div>
        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger className="w-[180px]">
            <Calendar className="mr-2 h-4 w-4" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los años</SelectItem>
            {availableYears.map(year => (
              <SelectItem key={year} value={year}>{year}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Promedio Mensual</CardTitle>
            <Droplet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.promedio} m³</div>
            <p className="text-xs text-muted-foreground">
              Basado en {lecturasFiltradas.length} lecturas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consumo Máximo</CardTitle>
            <TrendingUp className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.maximo} m³</div>
            <p className="text-xs text-muted-foreground">
              Pico de consumo registrado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consumo Mínimo</CardTitle>
            <TrendingDown className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.minimo} m³</div>
            <p className="text-xs text-muted-foreground">
              Menor consumo registrado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lecturas Estimadas</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEstimadas}</div>
            <p className="text-xs text-muted-foreground">
              De {lecturasFiltradas.length} lecturas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Evolución del Consumo (Últimos 12 meses)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="periodo" 
                  angle={-45} 
                  textAnchor="end" 
                  height={80}
                />
                <YAxis 
                  label={{ value: 'm³', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-background border rounded-lg p-3 shadow-lg">
                          <p className="font-semibold">{data.periodo}</p>
                          <p className="text-sm text-primary">
                            Consumo: {data.consumo} m³
                          </p>
                          {data.estimado && (
                            <Badge variant="outline" className="text-xs mt-1">
                              Estimado
                            </Badge>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="consumo" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Consumo (m³)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Lecturas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Droplet className="h-5 w-5" />
            Detalle de Lecturas ({lecturasFiltradas.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Período</TableHead>
                  <TableHead>Fecha Lectura</TableHead>
                  <TableHead className="text-right">Lectura Acumulada</TableHead>
                  <TableHead className="text-right">Consumo del Mes</TableHead>
                  <TableHead>Tipo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lecturasFiltradas.map((lectura, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {lectura.periodo} {lectura.año}
                    </TableCell>
                    <TableCell>
                      {new Date(lectura.fechaLectura).toLocaleDateString('es-MX', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {lectura.metrosCubicos.toLocaleString()} m³
                    </TableCell>
                    <TableCell className="text-right font-mono font-semibold">
                      {lectura.consumo ? (
                        <span className={lectura.consumo > stats.promedio ? "text-destructive" : "text-success"}>
                          {lectura.consumo.toLocaleString()} m³
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={lectura.estimado ? "outline" : "default"}>
                        {lectura.estimado ? "Estimada" : "Real"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
